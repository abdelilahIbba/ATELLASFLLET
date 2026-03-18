
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { X, Calendar, MapPin, ChevronRight, CreditCard, CheckCircle, ArrowLeft, Clock, Loader2, AlertCircle, Crosshair, ScanLine, Camera, Upload, UserCheck, FileCheck, RefreshCw, Image as ImageIcon, Smartphone, Key } from 'lucide-react';
import { Car, Booking, UserInfo } from '../../types';
import { CARS } from '../../constants';
import { bookingsApi, carsApi, CostBreakdown, ApiError, getToken, pickupPointsApi, PickupPoint } from '../../services/api';
import { extractDocumentData } from '../../services/ocrUtils';
import DocumentScanner, { DocumentScanResult } from './DocumentScanner';
import AvailabilityCalendar from '../UI/AvailabilityCalendar';
import 'leaflet/dist/leaflet.css';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    car?: Car;
    location?: string;
    pickupDate?: string;
    returnDate?: string;
  };
  onBookingSuccess?: (booking: Booking) => void;
  /** Pass the currently-authenticated user so the modal can pre-fill email */
  currentUser?: UserInfo | null;
  /** Called when a booking action requires authentication — triggers the auth modal */
  onNeedAuth?: () => void;
}

const RecenterMap: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
};

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, initialData, onBookingSuccess, currentUser, onNeedAuth }) => {
  const [step, setStep] = useState(1);
  const [selectedCar, setSelectedCar] = useState<Car | null>(initialData?.car || null);
  /** Cars loaded from the API — gives us real DB integer IDs for bookedPeriods */
  const [apiCars, setApiCars] = useState<Car[]>([]);
  const [apiCarsLoading, setApiCarsLoading] = useState(false);
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<PickupPoint | null>(null);
  const [selectedDropoffPoint, setSelectedDropoffPoint] = useState<PickupPoint | null>(null);
  // Step-1: null selectedCar = grid, non-null = detail
  const [carBookedPeriods, setCarBookedPeriods] = useState<{ total_units: number; booked_periods: { start: string; end: string }[] } | null>(null);
  const [carAvailability, setCarAvailability] = useState<{ available: boolean; remaining: number; suggestedSlot?: { start: string; end: string } } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [apiError, setApiError] = useState('');
  const [pickupCoords, setPickupCoords] = useState<[number, number]>([34.0209, -6.8416]); // Rabat centre by default
  const [autoLocateAttempted, setAutoLocateAttempted] = useState(false);
  const [generatedBookingId, setGeneratedBookingId] = useState<string | number>('');
  const [generatedAccessKey, setGeneratedAccessKey] = useState('');
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);
  
  // OCR / Scanning State
  const [activeScannerType, setActiveScannerType] = useState<'id' | 'license' | 'face' | null>(null);
  const [ocrProgress, setOcrProgress] = useState<{ type: 'id' | 'license' | 'face'; pct: number } | null>(null);
  const [docImages, setDocImages] = useState({
    id: '',
    license: '',
    face: ''
  });
  // Actual File objects for API upload (populated from real file uploads)
  const [docFiles, setDocFiles] = useState<{ id: File | null; license: File | null; face: File | null }>({
    id: null, license: null, face: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  // Tracks which document type the next file-input selection applies to
  const currentUploadTargetRef = useRef<'id' | 'license' | 'face'>('face');

  const [formData, setFormData] = useState({
    location: initialData?.location || 'Position en attente de géolocalisation',
    pickupDate: initialData?.pickupDate || '',
    returnDate: initialData?.returnDate || '',
    firstName: '',
    lastName: '',
    email: currentUser?.email || '',
    phone: '',
    idNumber: '',
    licenseNumber: ''
  });

  // Fetch pickup points once
  useEffect(() => {
    pickupPointsApi.list()
      .then(pts => setPickupPoints(pts))
      .catch(() => {/* non-blocking — GPS fallback remains available */});
  }, []);

  // Load cars from the backend so we use real DB IDs for booked-periods lookups.
  // Falls back to the CARS constant gracefully if the API fails.
  useEffect(() => {
    if (!isOpen) return;
    setApiCarsLoading(true);
    carsApi.list({ per_page: 100 })
      .then(resp => {
        const mapped: Car[] = (resp.data ?? []).map((c: any) => ({
          id: String(c.id),                                       // real DB id
          name: (c.full_name as string) ?? `${c.make ?? ''} ${c.model ?? ''}`.trim(),
          category: (c.category as Car['category']) ?? 'Berline',
          pricePerDay: Number(c.daily_price ?? 0),
          speed: c.transmission ?? 'Boîte Manuelle',
          range: c.fuel_type ?? 'Diesel',
          image: (c.image as string) ?? 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200',
          features: Array.isArray(c.features) ? c.features : [],
        }));
        if (mapped.length > 0) setApiCars(mapped);
      })
      .catch(() => { /* keep apiCars empty → grid falls back to CARS constant */ })
      .finally(() => setApiCarsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // After API cars load, reconcile selectedCar — if it came from the CARS constant
  // (IDs like 'c1', 'c2') swap it for the real API car that has the DB integer ID.
  // Without this, finalizeReservation sends car_id='c1' → backend Car::findOrFail fails.
  useEffect(() => {
    if (apiCars.length === 0 || !selectedCar) return;
    const alreadyFromApi = apiCars.some(c => c.id === selectedCar.id);
    if (alreadyFromApi) return;
    const matched = apiCars.find(c =>
      c.name.toLowerCase() === selectedCar.name.toLowerCase() ||
      c.name.toLowerCase().includes(selectedCar.name.toLowerCase()) ||
      selectedCar.name.toLowerCase().includes(c.name.toLowerCase())
    );
    if (matched) setSelectedCar(matched);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiCars]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(selectedCar ? 2 : 1);
      setFormData(prev => ({
        ...prev,
        location: initialData?.location || prev.location,
        pickupDate: initialData?.pickupDate || prev.pickupDate,
        returnDate: initialData?.returnDate || prev.returnDate,
        email: currentUser?.email || prev.email,
      }));
      setSelectedCar(initialData?.car || null);
      setSelectedPickupPoint(null);
      setSelectedDropoffPoint(null);
      setCarBookedPeriods(null);
      setCarAvailability(null);
      setIsValidating(false);
      setIsVerifying(false);
      setApiError('');
      setLocationError('');
      setPickupCoords([34.0209, -6.8416]);
      setAutoLocateAttempted(false);
      setDocImages({ id: '', license: '', face: '' });
      setDocFiles({ id: null, license: null, face: null });
      setOcrProgress(null);
      setActiveScannerType(null);
      setGeneratedBookingId('');
      setGeneratedAccessKey('');
      setCostBreakdown(null);
    }
  }, [isOpen, initialData]);

  const handleNext = () => { setApiError(''); setStep(prev => prev + 1); };
  const handleBack = () => { setApiError(''); setStep(prev => prev - 1); };

  /** Format YYYY-MM-DD → "14 mar 2026" */
  const fmtDateFr = (dateStr: string): string => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const mths = ['jan','fév','mar','avr','mai','juin','juil','aoû','sep','oct','nov','déc'];
    return `${parseInt(d)} ${mths[parseInt(m) - 1]} ${y}`;
  };

  /** Selecting a car in the grid: just update selectedCar; booked periods are fetched by useEffect below */
  const handleCarSelect = (car: Car) => setSelectedCar(car);

  /** Fetch booked periods whenever a car is selected (drives detail view) */
  useEffect(() => {
    if (!selectedCar) { setCarBookedPeriods(null); setCarAvailability(null); return; }
    setCarBookedPeriods(null); setCarAvailability(null);
    carsApi.bookedPeriods(selectedCar.id)
      .then(data => setCarBookedPeriods(data))
      .catch(() => setCarBookedPeriods({ total_units: 1, booked_periods: [] }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCar?.id]);

  /** Recompute availability whenever dates or booked periods change */
  useEffect(() => {
    if (!selectedCar || !carBookedPeriods) { setCarAvailability(null); return; }
    if (!formData.pickupDate || !formData.returnDate) { setCarAvailability(null); return; }

    const pad = (n: number) => String(n).padStart(2, '0');
    const dayStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

    const start = new Date(formData.pickupDate); start.setHours(0,0,0,0);
    const end   = new Date(formData.returnDate);  end.setHours(0,0,0,0);

    let maxOverlap = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const ds = dayStr(cur);
      const overlap = carBookedPeriods.booked_periods.filter(p => p.start <= ds && p.end >= ds).length;
      if (overlap > maxOverlap) maxOverlap = overlap;
      cur.setDate(cur.getDate() + 1);
    }

    const available = maxOverlap < carBookedPeriods.total_units;
    const remaining = Math.max(0, carBookedPeriods.total_units - maxOverlap);

    if (available) { setCarAvailability({ available: true, remaining }); return; }

    // Find next available slot
    const rentalDays = Math.round((end.getTime() - start.getTime()) / 86400000);
    let suggestedSlot: { start: string; end: string } | undefined;
    const tryDate = new Date(end); tryDate.setDate(tryDate.getDate() + 1);
    for (let i = 0; i < 180; i++) {
      const tryEnd = new Date(tryDate); tryEnd.setDate(tryEnd.getDate() + rentalDays);
      let mo = 0;
      const c2 = new Date(tryDate);
      while (c2 <= tryEnd) {
        const ds = dayStr(c2);
        const o = carBookedPeriods.booked_periods.filter(p => p.start <= ds && p.end >= ds).length;
        if (o > mo) mo = o;
        c2.setDate(c2.getDate() + 1);
      }
      if (mo < carBookedPeriods.total_units) { suggestedSlot = { start: dayStr(tryDate), end: dayStr(tryEnd) }; break; }
      tryDate.setDate(tryDate.getDate() + 1);
    }
    setCarAvailability({ available: false, remaining: 0, suggestedSlot });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCar?.id, formData.pickupDate, formData.returnDate, carBookedPeriods]);

  /**
   * Step 2 handler — call verifyIdentity API.
   * On success: move to Step 3 and pre-fetch cost breakdown.
   */
  const handleVerifyIdentity = async () => {
    setApiError('');
    setIsVerifying(true);

    if (!getToken()) {
      if (onNeedAuth) {
        onNeedAuth();
      } else {
        setApiError('Vous devez être connecté pour continuer. Veuillez vous connecter et réessayer.');
      }
      setIsVerifying(false);
      return;
    }

    try {
      const fd = new FormData();
      // Text extracted by Tesseract.js (free, in-browser OCR)
      fd.append('first_name_from_id',      formData.firstName);
      fd.append('last_name_from_id',       formData.lastName);
      fd.append('first_name_from_license', formData.firstName);
      fd.append('last_name_from_license',  formData.lastName);
      fd.append('national_id_number',      formData.idNumber);
      fd.append('driver_license_number',   formData.licenseNumber);
      fd.append('phone',                   formData.phone);
      // Also send the files so backend can store them as proof
      if (docFiles.id)      fd.append('doc_id_front', docFiles.id);
      if (docFiles.license) fd.append('doc_license',  docFiles.license);
      if (docFiles.face)    fd.append('client_photo', docFiles.face);

      const result = await bookingsApi.verifyIdentity(fd);

      // Update form with server-confirmed names
      setFormData(prev => ({
        ...prev,
        firstName: result.first_name,
        lastName:  result.last_name,
        idNumber:  result.national_id_number     ?? '',
        licenseNumber: result.driver_license_number ?? '',
      }));

      // Pre-fetch cost breakdown for Step 3
      if (selectedCar && formData.pickupDate && formData.returnDate) {
        try {
          const cost = await bookingsApi.calculateCost({
            car_id:     selectedCar.id,
            start_date: formData.pickupDate,
            end_date:   formData.returnDate,
          });
          setCostBreakdown(cost);
        } catch {
          // non-blocking — Step 3 will fetch again
        }
      }

      handleNext();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setApiError(apiErr?.message ?? 'Erreur lors de la vérification. Veuillez réessayer.');
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Step 4 - load cost if not already loaded
   */
  useEffect(() => {
    if (step === 4 && !costBreakdown && selectedCar && formData.pickupDate && formData.returnDate) {
      bookingsApi.calculateCost({
        car_id:     selectedCar.id,
        start_date: formData.pickupDate,
        end_date:   formData.returnDate,
      }).then(setCostBreakdown).catch(() => {});
    }
  }, [step]);

  const handleFinalizeLocation = async () => {
    setApiError('');
    setIsValidating(true);

    if (!getToken()) {
      if (onNeedAuth) {
        onNeedAuth();
      } else {
        setApiError('Vous devez être connecté pour finaliser la réservation.');
      }
      setIsValidating(false);
      return;
    }

    try {
      const result = await bookingsApi.finalizeReservation({
        car_id:           selectedCar!.id,
        start_date:       formData.pickupDate,
        end_date:         formData.returnDate,
        pickup_latitude:  pickupCoords[0],
        pickup_longitude: pickupCoords[1],
        pickup_address:   formData.location,
      });

      const bk = result.booking as any;
      setGeneratedBookingId(bk?.id ?? '');
      // Access key = booking ID padded, shown as reference
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let accessKey = '';
      for (let i = 0; i < 8; i++) accessKey += chars.charAt(Math.floor(Math.random() * chars.length));
      setGeneratedAccessKey(accessKey);

      if (selectedCar && onBookingSuccess) {
        const booking: Booking = {
          id:          String(bk?.id ?? ''),
          car:         selectedCar,
          location:    formData.location,
          pickupDate:  formData.pickupDate,
          returnDate:  formData.returnDate,
          user: {
            firstName:     formData.firstName,
            lastName:      formData.lastName,
            email:         formData.email,
            photo:         docImages.face || undefined,
            idNumber:      formData.idNumber,
            licenseNumber: formData.licenseNumber,
            accessKey:     accessKey,
            role:          'client',
          },
          status: 'Confirmed',
        };
        onBookingSuccess(booking);
      }

      setStep(6);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setApiError(apiErr?.message ?? 'Erreur lors de la finalisation. Veuillez réessayer.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleUseCurrentLocation = (silent = false) => {
    setLocationError('');

    const isLocalHost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (!window.isSecureContext && !isLocalHost) {
      if (!silent) {
        setLocationError('La géolocalisation nécessite HTTPS (ou localhost). Ouvrez le site en sécurisé pour utiliser votre position réelle.');
      }
      return;
    }

    if (!navigator.geolocation) {
      if (!silent) {
        setLocationError('La géolocalisation n’est pas disponible sur ce navigateur.');
      }
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));

        setPickupCoords([lat, lng]);
        setFormData(prev => ({
          ...prev,
          location: `Position GPS Actuelle (Lat: ${lat}, Long: ${lng})`
        }));
        setIsLocating(false);
      },
      () => {
        if (!silent) {
          setLocationError('Impossible d’obtenir votre position. Autorisez la localisation puis réessayez.');
        }
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    if (isOpen && step === 5 && !autoLocateAttempted) {
      setAutoLocateAttempted(true);
      handleUseCurrentLocation(true);
    }
  }, [isOpen, step, autoLocateAttempted]);

  if (!isOpen) return null;

  // --- Document Scanning Logic ---

  /**
   * Opens the DocumentScanner full-screen overlay (live webcam + OCR).
   * Replaces the fake CameraOverlay and the <input capture> workaround.
   */
  const handleStartCamera = (type: 'id' | 'license' | 'face') => {
    setActiveScannerType(type);
  };

  /** Called by DocumentScanner when capture + OCR succeed */
  const handleScanSuccess = (type: 'id' | 'license' | 'face', result: DocumentScanResult) => {
    setActiveScannerType(null);

    // Store image preview and file
    setDocImages(prev => ({ ...prev, [type]: result.imageDataUrl }));
    setDocFiles(prev => ({ ...prev, [type]: result.imageFile }));

    // Populate form fields from OCR result
    if (type === 'id') {
      setFormData(prev => ({
        ...prev,
        idNumber:  result.documentNumber ?? prev.idNumber,
        firstName: result.firstName       ?? prev.firstName,
        lastName:  result.lastName        ?? prev.lastName,
      }));
    }
    if (type === 'license') {
      setFormData(prev => ({
        ...prev,
        licenseNumber: result.documentNumber ?? prev.licenseNumber,
        firstName:     result.firstName       ?? prev.firstName,
        lastName:      result.lastName        ?? prev.lastName,
      }));
    }
  };

  /** Kept for retake — does NOT route to file input any more */
  const handleCapture = (type: 'id' | 'license' | 'face') => {
    handleStartCamera(type);
  };

  /**
   * Run Tesseract.js OCR on a document file (free, in-browser, no API key).
   * Populates idNumber / licenseNumber / firstName / lastName from extracted text.
   */
  const runOcr = async (file: File, type: 'id' | 'license') => {
    setOcrProgress({ type, pct: 0 });
    try {
      const result = await extractDocumentData(file, (pct) => {
        setOcrProgress({ type, pct });
      });

      if (type === 'id') {
        setFormData(prev => ({
          ...prev,
          idNumber:  result.documentNumber ?? prev.idNumber,
          firstName: result.firstName       ?? prev.firstName,
          lastName:  result.lastName        ?? prev.lastName,
        }));
      }

      if (type === 'license') {
        setFormData(prev => ({
          ...prev,
          licenseNumber: result.documentNumber ?? prev.licenseNumber,
          firstName:     result.firstName       ?? prev.firstName,
          lastName:      result.lastName        ?? prev.lastName,
        }));
      }
    } catch {
      // OCR failed silently — user can type the fields manually
    } finally {
      setOcrProgress(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const type = currentUploadTargetRef.current;
          const reader = new FileReader();
          reader.onload = (ev) => {
              if (ev.target?.result) {
                  setDocImages(prev => ({ ...prev, [type]: ev.target!.result as string }));
              }
          };
          reader.readAsDataURL(file);
          setDocFiles(prev => ({ ...prev, [type]: file }));
          // Run OCR for ID and license docs automatically
          if (type === 'id' || type === 'license') {
            runOcr(file, type);
          }
          // Reset so the same file can be re-selected if needed
          e.target.value = '';
      }
  };

  const triggerFileUpload = (type: 'id' | 'license' | 'face' = 'face') => {
      currentUploadTargetRef.current = type;
      if (fileInputRef.current) {
          // Remove capture so gallery/file picker opens instead of camera
          fileInputRef.current.removeAttribute('capture');
          fileInputRef.current.accept = type === 'face' ? 'image/*' : 'image/*,application/pdf';
          fileInputRef.current.click();
      }
  };

  const handleRetake = (type: 'id' | 'license' | 'face') => {
      setDocImages(prev => ({ ...prev, [type]: '' }));
      setDocFiles(prev => ({ ...prev, [type]: null }));
  };


  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-1 mb-6 pr-8 md:pr-0">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center">
          <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[11px] md:text-xs font-bold transition-colors duration-300 flex-shrink-0 ${
            step >= i ? 'bg-brand-blue text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-500'
          }`}>
            {step > i ? <CheckCircle className="w-3.5 h-3.5" /> : i}
          </div>
          {i < 5 && <div className={`w-4 md:w-8 h-0.5 ${
            step > i ? 'bg-brand-blue' : 'bg-slate-200 dark:bg-white/10'
          }`}></div>}
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:px-4">
      {/* Live-camera scanner overlay — rendered above the modal (z-[200]) */}
      {activeScannerType && (
        <DocumentScanner
          documentType={activeScannerType}
          onSuccess={(result) => handleScanSuccess(activeScannerType, result)}
          onError={() => setActiveScannerType(null)}
          onCancel={() => setActiveScannerType(null)}
        />
      )}
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      {/* Modal Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl bg-white dark:bg-[#0B1120] rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92dvh] md:max-h-[90vh]"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors text-brand-navy dark:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Panel - Summary */}
        <div className="hidden md:flex w-full md:w-1/3 bg-slate-50 dark:bg-brand-navy border-r border-slate-200 dark:border-white/5 p-8 flex-col justify-between relative overflow-hidden">
           <div className="relative z-10">
              <h3 className="text-sm font-bold text-brand-teal uppercase tracking-widest mb-2">Résumé de la Réservation</h3>
              <div className="space-y-6 mt-6">
                <div>
                   <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Véhicule</label>
                   {selectedCar ? (
                     <div>
                       <p className="text-xl font-bold text-brand-navy dark:text-white font-space">{selectedCar.name}</p>
                       <p className="text-sm text-slate-500">Série {selectedCar.category}</p>
                     </div>
                   ) : (
                     <p className="text-sm text-slate-400 italic">Aucun véhicule sélectionné</p>
                   )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Prise en charge</label>
                      <div className="flex items-center gap-2 text-sm font-medium text-brand-navy dark:text-slate-300">
                         <Calendar className="w-4 h-4 text-brand-blue" />
                         {formData.pickupDate || '24 Oct 2024'}
                      </div>
                   </div>
                   <div>
                      <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Retour</label>
                      <div className="flex items-center gap-2 text-sm font-medium text-brand-navy dark:text-slate-300">
                         <Calendar className="w-4 h-4 text-brand-blue" />
                         {formData.returnDate || '27 Oct 2024'}
                      </div>
                   </div>
                </div>

                <div>
                   <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Emplacement</label>
                   {selectedPickupPoint ? (
                     <div className="space-y-2">
                       <div className="flex items-start gap-2 text-sm font-medium text-brand-navy dark:text-slate-300">
                         <MapPin className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
                         <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Prise en charge</p>
                           <p>{selectedPickupPoint.name}</p>
                         </div>
                       </div>
                       {selectedDropoffPoint && (
                         <div className="flex items-start gap-2 text-sm font-medium text-brand-navy dark:text-slate-300">
                           <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                           <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Retour</p>
                             <p>{selectedDropoffPoint.name}</p>
                           </div>
                         </div>
                       )}
                     </div>
                   ) : (
                     <div className="flex items-center gap-2 text-sm font-medium text-brand-navy dark:text-slate-300">
                       <MapPin className="w-4 h-4 text-brand-blue" />
                       {formData.location}
                     </div>
                   )}
                </div>
              </div>
           </div>

           {selectedCar && (
             <div className="relative z-10 mt-8 rounded-xl overflow-hidden shadow-lg border border-white/10">
                <img src={selectedCar.image} alt={selectedCar.name} className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                   <p className="text-white font-bold text-lg">${selectedCar.pricePerDay}<span className="text-xs font-normal opacity-80">/day</span></p>
                </div>
             </div>
           )}
           <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
        </div>

        {/* Right Panel - Form Steps */}
        <div className="w-full md:w-2/3 p-4 md:p-8 overflow-y-auto relative flex-1 min-h-0">
          <StepIndicator />
          
          <AnimatePresence mode="wait">
            
            {/* STEP 1: SELECT CAR */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col"
              >
                <h2 className="text-xl md:text-2xl font-bold text-brand-navy dark:text-white font-space mb-3">Sélectionnez Votre Véhicule</h2>

                {/* Date pickers */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prise en charge</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-blue pointer-events-none z-10" />
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-9 pr-2 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors"
                        value={formData.pickupDate}
                        onChange={e => setFormData(prev => ({ ...prev, pickupDate: e.target.value }))}
                      />
                      
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Retour</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-blue pointer-events-none z-10" />
                      <input
                        type="date"
                        min={formData.pickupDate || new Date().toISOString().split('T')[0]}
                        className="w-full pl-9 pr-2 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors"
                        value={formData.returnDate}
                        onChange={e => setFormData(prev => ({ ...prev, returnDate: e.target.value }))}
                      />
                      
                    </div>
                  </div>
                </div>

                {/* Pickup / Drop-off point selectors */}
                {pickupPoints.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                    {/* Pickup point */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-blue" /> Lieu de Prise en Charge
                      </label>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                        {pickupPoints
                          .filter(p => p.type === 'pickup' || p.type === 'both')
                          .map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedPickupPoint(p);
                                setFormData(prev => ({ ...prev, location: p.address }));
                                if (p.latitude !== null && p.longitude !== null) {
                                  setPickupCoords([Number(p.latitude), Number(p.longitude)]);
                                }
                              }}
                              className={`w-full flex items-start gap-2 p-2.5 rounded-lg border text-left transition-all text-xs ${
                                selectedPickupPoint?.id === p.id
                                  ? 'border-brand-blue bg-brand-blue/5 ring-1 ring-brand-blue'
                                  : 'border-slate-200 dark:border-white/10 hover:border-brand-blue/50'
                              }`}
                            >
                              <MapPin className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${selectedPickupPoint?.id === p.id ? 'text-brand-blue' : 'text-slate-400'}`} />
                              <div className="min-w-0">
                                <p className="font-bold text-brand-navy dark:text-white leading-tight truncate">{p.name}</p>
                                <p className="text-slate-400 leading-tight truncate">{p.address}</p>
                              </div>
                              {selectedPickupPoint?.id === p.id && (
                                <CheckCircle className="w-3.5 h-3.5 text-brand-blue flex-shrink-0 ml-auto mt-0.5" />
                              )}
                            </button>
                          ))}
                      </div>
                    </div>

                    {/* Dropoff point */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-500" /> Lieu de Retour
                      </label>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                        {pickupPoints
                          .filter(p => p.type === 'dropoff' || p.type === 'both')
                          .map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setSelectedDropoffPoint(p)}
                              className={`w-full flex items-start gap-2 p-2.5 rounded-lg border text-left transition-all text-xs ${
                                selectedDropoffPoint?.id === p.id
                                  ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500'
                                  : 'border-slate-200 dark:border-white/10 hover:border-amber-500/50'
                              }`}
                            >
                              <MapPin className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${selectedDropoffPoint?.id === p.id ? 'text-amber-500' : 'text-slate-400'}`} />
                              <div className="min-w-0">
                                <p className="font-bold text-brand-navy dark:text-white leading-tight truncate">{p.name}</p>
                                <p className="text-slate-400 leading-tight truncate">{p.address}</p>
                              </div>
                              {selectedDropoffPoint?.id === p.id && (
                                <CheckCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 ml-auto mt-0.5" />
                              )}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
                {/* ── selectedCar = null → grid; selected → detail ── */}
                {!selectedCar ? (
                  <div>
                    {apiCarsLoading && apiCars.length === 0 ? (
                      <div className="flex items-center justify-center h-40 gap-2 text-sm text-slate-400">
                        <Loader2 className="w-5 h-5 animate-spin text-brand-blue" /> Chargement des véhicules…
                      </div>
                    ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {(apiCars.length > 0 ? apiCars : CARS).map(car => (
                        <div
                          key={car.id}
                          onClick={() => handleCarSelect(car)}
                          className="p-3 rounded-xl border cursor-pointer transition-all active:scale-95 hover:shadow-md border-slate-200 dark:border-white/10 hover:border-brand-blue/40 hover:shadow-brand-blue/5"
                        >
                          <img src={car.image} alt={car.name} className="w-full h-20 md:h-24 object-cover rounded-lg mb-2" />
                          <h4 className="font-bold text-brand-navy dark:text-white text-xs md:text-sm leading-tight">{car.name}</h4>
                          <div className="flex justify-between items-center mt-1.5">
                            <span className="text-[10px] text-slate-500">{car.category}</span>
                            <span className="text-xs font-bold text-brand-red">{car.pricePerDay} MAD/j</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    )}
                  </div>
                ) : (
                  /* ── DETAIL VIEW ── */
                  <div className="flex flex-col gap-3">

                    {/* Back to grid */}
                    <button
                      type="button"
                      onClick={() => setSelectedCar(null)}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-blue transition-colors w-fit"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Tous les véhicules
                    </button>

                    {/* Car detail card */}
                    <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
                      <div className="relative">
                        <img src={selectedCar.image} alt={selectedCar.name} className="w-full h-44 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                          <div>
                            <p className="text-white font-bold text-lg leading-tight font-space">{selectedCar.name}</p>
                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full mt-0.5">{selectedCar.category}</span>
                          </div>
                          <div className="bg-brand-blue rounded-xl px-3 py-2 text-right">
                            <p className="text-white font-bold text-lg leading-none">${selectedCar.pricePerDay}</p>
                            <p className="text-white/70 text-[10px] leading-none mt-0.5">/jour</p>
                          </div>
                        </div>
                      </div>
                      {/* Stats row */}
                      <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-white/5 bg-slate-50 dark:bg-white/[0.03]">
                        <div className="px-4 py-2.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Vitesse</p>
                          <p className="text-sm font-bold text-brand-navy dark:text-white">{selectedCar.speed}</p>
                        </div>
                        <div className="px-4 py-2.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Autonomie</p>
                          <p className="text-sm font-bold text-brand-navy dark:text-white">{selectedCar.range}</p>
                        </div>
                      </div>
                      {/* Features */}
                      <div className="px-4 pb-3 pt-2.5 flex flex-wrap gap-1.5 bg-white dark:bg-transparent">
                        {selectedCar.features.map((f, i) => (
                          <span key={i} className="text-[10px] font-semibold bg-brand-blue/8 text-brand-blue border border-brand-blue/20 px-2 py-0.5 rounded-full">{f}</span>
                        ))}
                      </div>
                    </div>

                    {/* Availability status banner */}
                    {formData.pickupDate && formData.returnDate ? (
                      carBookedPeriods === null ? (
                        <div className="flex items-center gap-2 text-xs text-slate-400 py-1">
                          <Loader2 className="w-4 h-4 animate-spin text-brand-blue" /> Vérification de la disponibilité…
                        </div>
                      ) : carAvailability === null ? null : carAvailability.available ? (
                        <div className="flex items-center gap-2.5 px-3 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            Disponible pour votre période
                            {carAvailability.remaining > 1 && (
                              <span className="ml-1 font-normal opacity-80">· {carAvailability.remaining} unités disponibles</span>
                            )}
                          </p>
                        </div>
                      ) : (
                        <div className="px-3 py-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl space-y-1.5">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <p className="text-xs font-bold text-red-700 dark:text-red-300">
                              Non disponible du {fmtDateFr(formData.pickupDate)} au {fmtDateFr(formData.returnDate)}
                            </p>
                          </div>
                          {carAvailability.suggestedSlot && (
                            <p className="text-[11px] text-red-600 dark:text-red-400 pl-6">
                              Prochain créneau : <strong>{fmtDateFr(carAvailability.suggestedSlot.start)} – {fmtDateFr(carAvailability.suggestedSlot.end)}</strong>
                            </p>
                          )}
                          <button type="button" onClick={() => setSelectedCar(null)} className="pl-6 text-[11px] font-bold text-red-600 dark:text-red-400 underline underline-offset-2 hover:text-red-700 block">
                            Voir d'autres véhicules →
                          </button>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <AlertCircle className="w-3.5 h-3.5" /> Sélectionnez vos dates pour voir la disponibilité
                      </div>
                    )}

                    {/* Availability calendar */}
                    {carBookedPeriods !== null && (
                      <AvailabilityCalendar
                        totalUnits={carBookedPeriods.total_units}
                        bookedPeriods={carBookedPeriods.booked_periods}
                        pickupDate={formData.pickupDate}
                        returnDate={formData.returnDate}
                      />
                    )}
                  </div>
                )}

                <div className="mt-4 pb-2 flex items-center justify-between gap-2">
                  {selectedCar && carAvailability && !carAvailability.available && (
                    <button type="button" onClick={() => setSelectedCar(null)} className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1">
                      <ArrowLeft className="w-3 h-3" /> Autres véhicules
                    </button>
                  )}
                  <button
                    disabled={!selectedCar || !formData.pickupDate || !formData.returnDate || (carAvailability !== null && !carAvailability.available)}
                    onClick={handleNext}
                    className="ml-auto px-6 py-3 bg-brand-navy dark:bg-white text-white dark:text-brand-navy rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Étape Suivante <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: IDENTITY VERIFICATION (SAME AS BEFORE) */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex flex-wrap justify-between items-start gap-2 mb-5">
                    <h2 className="text-xl md:text-2xl font-bold text-brand-navy dark:text-white font-space">Vérification d'Identité</h2>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-bold uppercase text-slate-500">Système Prêt</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                    
                    {/* 1. National ID */}
                    <div className="relative h-36 md:h-48 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 overflow-hidden flex flex-col items-center justify-center p-2 md:p-4">
                        {ocrProgress?.type === 'id' ? (
                            <div className="flex flex-col items-center gap-3 w-full px-2">
                                <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
                                <p className="text-xs font-bold text-brand-navy dark:text-white">Lecture OCR…</p>
                                <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-1.5">
                                    <div className="bg-brand-blue h-1.5 rounded-full transition-all duration-300" style={{ width: `${ocrProgress.pct}%` }} />
                                </div>
                                <p className="text-[10px] text-slate-500">{ocrProgress.pct}%</p>
                            </div>
                        ) : docImages.id ? (
                            <div className="relative w-full h-full">
                                <img src={docImages.id} alt="National ID" className="w-full h-full object-cover rounded-lg opacity-60" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="bg-green-500 rounded-full p-2 mb-2 shadow-lg">
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">ID Capturé</span>
                                    <button 
                                        onClick={() => handleRetake('id')}
                                        className="mt-2 text-[10px] text-white underline hover:text-brand-teal"
                                    >
                                        Scanner à Nouveau
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-brand-blue/10 flex items-center justify-center mb-2 text-brand-blue">
                                    <CreditCard className="w-4 h-4 md:w-6 md:h-6" />
                                </div>
                                <h4 className="text-[11px] md:text-sm font-bold text-brand-navy dark:text-white mb-0.5 text-center">Carte Nationale</h4>
                                <p className="hidden md:block text-[10px] text-slate-500 text-center mb-3">Recto de la carte</p>
                                <div className="grid grid-cols-2 gap-1.5 md:gap-2 w-full mt-2">
                                    <button 
                                        onClick={() => handleStartCamera('id')}
                                        className="flex flex-col items-center justify-center p-1.5 md:p-2 rounded bg-white dark:bg-white/10 border border-slate-200 dark:border-white/5 hover:border-brand-blue transition-colors"
                                    >
                                        <Camera className="w-3.5 h-3.5 md:w-4 md:h-4 mb-0.5 text-slate-500" />
                                        <span className="text-[8px] md:text-[9px] font-bold uppercase">Caméra</span>
                                    </button>
                                    <button 
                                        onClick={() => triggerFileUpload('id')}
                                        className="flex flex-col items-center justify-center p-1.5 md:p-2 rounded bg-white dark:bg-white/10 border border-slate-200 dark:border-white/5 hover:border-brand-blue transition-colors"
                                    >
                                        <ImageIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mb-0.5 text-slate-500" />
                                        <span className="text-[8px] md:text-[9px] font-bold uppercase">Upload</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* 2. Driving License */}
                    <div className="relative h-36 md:h-48 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 overflow-hidden flex flex-col items-center justify-center p-2 md:p-4">
                        {ocrProgress?.type === 'license' ? (
                            <div className="flex flex-col items-center gap-3 w-full px-2">
                                <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
                                <p className="text-xs font-bold text-brand-navy dark:text-white">Lecture OCR…</p>
                                <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-1.5">
                                    <div className="bg-brand-blue h-1.5 rounded-full transition-all duration-300" style={{ width: `${ocrProgress.pct}%` }} />
                                </div>
                                <p className="text-[10px] text-slate-500">{ocrProgress.pct}%</p>
                            </div>
                        ) : docImages.license ? (
                            <div className="relative w-full h-full">
                                <img src={docImages.license} alt="License" className="w-full h-full object-cover rounded-lg opacity-60" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="bg-green-500 rounded-full p-2 mb-2 shadow-lg">
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">Données Extraites</span>
                                    <button 
                                        onClick={() => handleRetake('license')}
                                        className="mt-2 text-[10px] text-white underline hover:text-brand-teal"
                                    >
                                        Scanner à Nouveau
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-brand-blue/10 flex items-center justify-center mb-2 text-brand-blue">
                                    <Smartphone className="w-4 h-4 md:w-6 md:h-6" />
                                </div>
                                <h4 className="text-[11px] md:text-sm font-bold text-brand-navy dark:text-white mb-0.5 text-center">Permis</h4>
                                <p className="hidden md:block text-[10px] text-slate-500 text-center mb-3">Remplissage auto</p>
                                <div className="grid grid-cols-2 gap-1.5 md:gap-2 w-full mt-2">
                                    <button 
                                        onClick={() => handleStartCamera('license')}
                                        className="flex flex-col items-center justify-center p-1.5 md:p-2 rounded bg-white dark:bg-white/10 border border-slate-200 dark:border-white/5 hover:border-brand-blue transition-colors"
                                    >
                                        <Camera className="w-3.5 h-3.5 md:w-4 md:h-4 mb-0.5 text-slate-500" />
                                        <span className="text-[8px] md:text-[9px] font-bold uppercase">Caméra</span>
                                    </button>
                                    <button 
                                        onClick={() => triggerFileUpload('license')}
                                        className="flex flex-col items-center justify-center p-1.5 md:p-2 rounded bg-white dark:bg-white/10 border border-slate-200 dark:border-white/5 hover:border-brand-blue transition-colors"
                                    >
                                        <ImageIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mb-0.5 text-slate-500" />
                                        <span className="text-[8px] md:text-[9px] font-bold uppercase">Upload</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* 3. Profile Photo */}
                    <div className="relative h-36 md:h-48 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 overflow-hidden flex flex-col items-center justify-center p-2 md:p-4">
                        {docImages.face ? (
                            <div className="relative w-full h-full">
                                <img src={docImages.face} alt="Face" className="w-full h-full object-cover rounded-lg opacity-60" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="bg-green-500 rounded-full p-2 mb-2 shadow-lg">
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">Correspondance</span>
                                    <button 
                                        onClick={() => handleRetake('face')}
                                        className="mt-2 text-[10px] text-white underline hover:text-brand-teal"
                                    >
                                        Changer Photo
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-brand-blue/10 flex items-center justify-center mb-2 text-brand-blue">
                                    <UserCheck className="w-4 h-4 md:w-6 md:h-6" />
                                </div>
                                <h4 className="text-[11px] md:text-sm font-bold text-brand-navy dark:text-white mb-0.5 text-center">Photo</h4>
                                <div className="grid grid-cols-2 gap-1.5 md:gap-2 w-full mt-2">
                                    <button 
                                        onClick={() => handleStartCamera('face')}
                                        className="flex flex-col items-center justify-center p-1.5 md:p-2 rounded bg-white dark:bg-white/10 border border-slate-200 dark:border-white/5 hover:border-brand-blue transition-colors"
                                    >
                                        <Camera className="w-3.5 h-3.5 md:w-4 md:h-4 mb-0.5 text-slate-500" />
                                        <span className="text-[8px] md:text-[9px] font-bold uppercase">Caméra</span>
                                    </button>
                                    <button 
                                        onClick={() => triggerFileUpload('face')}
                                        className="flex flex-col items-center justify-center p-1.5 md:p-2 rounded bg-white dark:bg-white/10 border border-slate-200 dark:border-white/5 hover:border-brand-blue transition-colors"
                                    >
                                        <ImageIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mb-0.5 text-slate-500" />
                                        <span className="text-[8px] md:text-[9px] font-bold uppercase">Upload</span>
                                    </button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={handleFileUpload}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="group relative">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Prénom</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors"
                        value={formData.firstName}
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                      />
                      {(docImages.id || docImages.license) && formData.firstName && <span className="absolute right-3 top-9 text-[10px] text-green-500 font-bold flex items-center gap-1"><ScanLine className="w-3 h-3" /> OCR</span>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nom</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors"
                        value={formData.lastName}
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     <div className="group relative">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Carte Nationale</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors font-mono"
                        placeholder="Extrait par OCR"
                        readOnly
                        value={formData.idNumber}
                      />
                      {formData.idNumber && <span className="absolute right-3 top-9 text-green-500"><CheckCircle className="w-4 h-4" /></span>}
                    </div>
                    <div className="group relative">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">N° de Permis</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors font-mono"
                        placeholder="Extrait par OCR"
                        readOnly
                        value={formData.licenseNumber}
                      />
                      {formData.licenseNumber && <span className="absolute right-3 top-9 text-green-500"><CheckCircle className="w-4 h-4" /></span>}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic">Vous pourrez corriger toutes les informations à l'étape suivante.</p>
                </div>

                {apiError && (
                  <div className="mt-4 flex items-start gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{apiError}</span>
                  </div>
                )}

                <div className="mt-6 flex flex-col-reverse sm:flex-row justify-between gap-3">
                   <button onClick={handleBack} className="text-slate-500 hover:text-brand-navy dark:hover:text-white font-medium text-sm flex items-center justify-center gap-2 py-2">
                     <ArrowLeft className="w-4 h-4" /> Retour
                   </button>
                   <button 
                     onClick={handleNext}
                     disabled={!docFiles.id || !docFiles.license}
                     className="flex-1 sm:flex-none px-6 py-3 bg-brand-navy dark:bg-white text-white dark:text-brand-navy rounded-lg font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                   >
                     Vérifier Informations <ChevronRight className="w-4 h-4" />
                   </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: REVIEW & CORRECT CLIENT INFO */}
            {step === 3 && (
              <motion.div
                key="step3-review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-brand-navy dark:text-white font-space">Vérifier vos Informations</h2>
                    <p className="text-slate-500 text-sm mt-1">Corrigez si nécessaire avant de confirmer.</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-brand-teal bg-brand-teal/10 px-2 py-1 rounded">Étape de Révision</span>
                </div>

                {/* Photo preview + scanned docs row */}
                <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                  {docImages.face ? (
                    <img src={docImages.face} alt="Client" className="w-16 h-16 rounded-full object-cover border-2 border-brand-blue shadow" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                      <UserCheck className="w-7 h-7 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Documents scannés</p>
                    <div className="flex gap-2">
                      {docImages.id && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">
                          <CheckCircle className="w-3 h-3" /> CIN
                        </span>
                      )}
                      {docImages.license && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">
                          <CheckCircle className="w-3 h-3" /> Permis
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Names */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prénom</label>
                      <input
                        type="text"
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors"
                        value={formData.firstName}
                        onChange={e => setFormData(prev => ({...prev, firstName: e.target.value}))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nom</label>
                      <input
                        type="text"
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors"
                        value={formData.lastName}
                        onChange={e => setFormData(prev => ({...prev, lastName: e.target.value}))}
                      />
                    </div>
                  </div>

                  {/* IDs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Carte Nationale</label>
                      <input
                        type="text"
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors font-mono"
                        placeholder="Ex: VA154375"
                        value={formData.idNumber}
                        onChange={e => setFormData(prev => ({...prev, idNumber: e.target.value}))}
                      />
                      {formData.idNumber && <span className="absolute right-3 top-8 text-green-500"><CheckCircle className="w-4 h-4" /></span>}
                    </div>
                    <div className="relative">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">N° de Permis</label>
                      <input
                        type="text"
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors font-mono"
                        placeholder="Numéro de permis"
                        value={formData.licenseNumber}
                        onChange={e => setFormData(prev => ({...prev, licenseNumber: e.target.value}))}
                      />
                      {formData.licenseNumber && <span className="absolute right-3 top-8 text-green-500"><CheckCircle className="w-4 h-4" /></span>}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                      <input
                        type="email"
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors"
                        value={formData.email}
                        onChange={e => setFormData(prev => ({...prev, email: e.target.value}))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Téléphone</label>
                      <input
                        type="tel"
                        placeholder="+212 6 XX XX XX XX"
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors"
                        value={formData.phone}
                        onChange={e => setFormData(prev => ({...prev, phone: e.target.value}))}
                      />
                    </div>
                  </div>
                </div>

                {apiError && (
                  <div className="mt-4 flex items-start gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{apiError}</span>
                  </div>
                )}

                <div className="mt-8 flex justify-between">
                  <button onClick={handleBack} className="text-slate-500 hover:text-brand-navy dark:hover:text-white font-medium text-sm flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Retour
                  </button>
                  <button
                    onClick={handleVerifyIdentity}
                    disabled={isVerifying || !formData.firstName || !formData.lastName || !formData.phone}
                    className="px-6 py-3 bg-brand-navy dark:bg-white text-white dark:text-brand-navy rounded-lg font-bold text-sm uppercase tracking-wider flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    {isVerifying ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Vérification...</>
                    ) : (
                      <>Confirmer & Continuer <ChevronRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4 & 5 (previously 3 & 4) */}
            {step === 4 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-brand-teal/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-teal">
                    <CreditCard className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-brand-navy dark:text-white font-space">Revoir la Réservation</h2>
                  <p className="text-slate-500 text-sm mt-2">Aucun frais ne sera prélevé avant la prise en charge.</p>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-6 border border-slate-200 dark:border-white/10 mb-6">
                   <div className="flex justify-between mb-2">
                      <span className="text-slate-500 text-sm">Tarif Véhicule (3 Jours)</span>
                      <span className="font-bold text-brand-navy dark:text-white">${selectedCar ? selectedCar.pricePerDay * 3 : 0}</span>
                   </div>
                   <div className="flex justify-between mb-2">
                      <span className="text-slate-500 text-sm">Taxes & Frais</span>
                      <span className="font-bold text-brand-navy dark:text-white">$145</span>
                   </div>
                   <div className="flex justify-between mb-2">
                      <span className="text-slate-500 text-sm">Dépôt de Garantie</span>
                      <span className="font-bold text-brand-navy dark:text-white">$500</span>
                   </div>
                   
                   <div className="h-px bg-slate-200 dark:bg-white/10 my-4"></div>
                   
                   <div className="flex items-center gap-3 mb-2">
                        <UserCheck className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-slate-500">Identité Vérifiée: <span className="text-brand-navy dark:text-white font-bold">{formData.firstName} {formData.lastName}</span></span>
                   </div>
                   <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-slate-500">Permis Validé: <span className="font-mono">{formData.licenseNumber}</span></span>
                   </div>

                   <div className="border-t border-slate-200 dark:border-white/10 my-4 pt-4 flex justify-between items-center">
                      <span className="text-brand-navy dark:text-white font-bold text-lg">Total</span>
                      <span className="text-2xl font-bold text-brand-blue">${(selectedCar ? selectedCar.pricePerDay * 3 : 0) + 645}</span>
                   </div>
                </div>

                <button 
                  onClick={() => setStep(5)}
                  className="w-full py-4 bg-brand-navy dark:bg-white text-white dark:text-brand-navy rounded-xl font-bold text-sm uppercase tracking-wider shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 group"
                >
                  Envoyer Demande de Réservation <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button onClick={handleBack} className="w-full mt-4 text-center text-slate-500 text-sm hover:text-brand-navy dark:hover:text-white transition-colors">
                  Retour
                </button>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600 dark:text-yellow-500 animate-pulse">
                    <Clock className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-brand-navy dark:text-white font-space">Réservation en Attente</h2>
                  <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
                    Veuillez confirmer votre lieu exact de prise en charge sur la carte.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-1 border border-slate-200 dark:border-white/10 mb-8 overflow-hidden">
                    <div className="relative h-64 w-full rounded-lg overflow-hidden">
                        <MapContainer
                          center={pickupCoords}
                          zoom={15}
                          scrollWheelZoom={true}
                          className="h-full w-full"
                          zoomControl={false}
                        >
                          <RecenterMap center={pickupCoords} />
                          <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                          />

                          <CircleMarker
                            center={pickupCoords}
                            radius={10}
                            pathOptions={{ color: '#dc2626', fillColor: '#dc2626', fillOpacity: 0.95 }}
                          >
                            <Popup>
                              <div className="text-xs font-semibold">Point de prise en charge confirmé</div>
                              <div className="text-[11px]">Lat: {pickupCoords[0]} • Long: {pickupCoords[1]}</div>
                            </Popup>
                          </CircleMarker>
                        </MapContainer>

                        <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/10 to-transparent pointer-events-none"></div>

                        <div className="absolute top-3 left-3 bg-white/95 dark:bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 shadow-xl max-w-[300px] text-left z-20">
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-0.5">Point de Prise en Charge</p>
                          <p className="text-xs font-bold text-brand-navy dark:text-white truncate">{formData.location}</p>
                        </div>

                        <button 
                           onClick={() => handleUseCurrentLocation()}
                           disabled={isLocating}
                          className="absolute top-3 right-3 bg-white dark:bg-brand-navy text-brand-navy dark:text-white px-3 py-2 rounded-lg text-xs font-bold shadow-lg flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/10 z-[500]"
                        >
                           {isLocating ? (
                               <Loader2 className="w-3 h-3 animate-spin" />
                           ) : (
                               <Crosshair className="w-3 h-3 text-brand-blue" />
                           )}
                             Utiliser ma position GPS
                        </button>
                    </div>
                </div>

                {locationError && (
                  <div className="mb-5 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{locationError}</span>
                  </div>
                )}

                {apiError && (
                  <div className="mb-5 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{apiError}</span>
                  </div>
                )}

                <button 
                  onClick={handleFinalizeLocation}
                  disabled={isValidating}
                  className="w-full py-4 bg-brand-red text-white rounded-xl font-bold text-sm uppercase tracking-wider shadow-xl shadow-brand-red/25 hover:bg-red-600 hover:shadow-brand-red/40 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Finalisation des Coordonnées...
                    </>
                  ) : (
                    <>
                      Vérifier & Finaliser Réservation <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </>
                  )}
                </button>

                <button
                  onClick={handleBack}
                  disabled={isValidating}
                  className="w-full mt-3 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-brand-navy dark:text-white rounded-xl font-semibold text-sm uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-white/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Retour à l'étape précédente
                </button>
                
                <p className="text-center text-[10px] text-slate-400 mt-4">
                  En confirmant cet emplacement, le GPS du véhicule sera verrouillé sur vos coordonnées.
                </p>
              </motion.div>
            )}

            {/* STEP 6: SUCCESS */}
            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-24 h-24 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-brand-navy dark:text-white font-space mb-4">Véhicule Sécurisé !</h2>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                  Votre <span className="text-brand-navy dark:text-white font-bold">{selectedCar?.name}</span> est en préparation pour la livraison.
                </p>
                
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
                    <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-lg">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">ID Réservation</span>
                        <span className="text-lg font-mono font-bold text-brand-navy dark:text-white tracking-wider">
                            {generatedBookingId || '#AERO-8821'}
                        </span>
                    </div>
                     <div className="bg-brand-blue/10 dark:bg-brand-blue/20 p-4 rounded-lg border border-brand-blue/30">
                        <span className="text-[10px] uppercase font-bold text-brand-blue block mb-1 flex items-center gap-1"><Key className="w-3 h-3" /> Clé d'Accès</span>
                        <span className="text-lg font-mono font-bold text-brand-navy dark:text-white tracking-widest">
                            {generatedAccessKey || 'CX-9921'}
                        </span>
                    </div>
                </div>

                <div>
                   <button 
                     onClick={onClose}
                     className="px-8 py-3 bg-brand-navy dark:bg-white text-white dark:text-brand-navy rounded-lg font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-all shadow-lg"
                   >
                     Aller au Tableau de Bord
                   </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-4">Un email de confirmation vous a été envoyé sur {formData.email}.</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingModal;


