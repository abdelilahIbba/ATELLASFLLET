
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { X, Calendar, MapPin, ChevronRight, CreditCard, CheckCircle, ArrowLeft, Clock, Loader2, AlertCircle, Crosshair, ScanLine, Camera, Upload, UserCheck, FileCheck, RefreshCw, Image as ImageIcon, Smartphone, Key } from 'lucide-react';
import { Car, Booking } from '../../types';
import { CARS } from '../../constants';
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
}

const RecenterMap: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
};

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, initialData, onBookingSuccess }) => {
  const [step, setStep] = useState(1);
  const [selectedCar, setSelectedCar] = useState<Car | null>(initialData?.car || null);
  const [isValidating, setIsValidating] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [pickupCoords, setPickupCoords] = useState<[number, number]>([34.0209, -6.8416]); // Rabat centre by default
  const [autoLocateAttempted, setAutoLocateAttempted] = useState(false);
  const [generatedBookingId, setGeneratedBookingId] = useState('');
  const [generatedAccessKey, setGeneratedAccessKey] = useState('');
  
  // OCR / Scanning State
  const [activeCamera, setActiveCamera] = useState<'id' | 'license' | 'face' | null>(null);
  const [processingDoc, setProcessingDoc] = useState<'id' | 'license' | 'face' | null>(null);
  const [docImages, setDocImages] = useState({
    id: '',
    license: '',
    face: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    location: initialData?.location || 'Position en attente de géolocalisation',
    pickupDate: initialData?.pickupDate || '',
    returnDate: initialData?.returnDate || '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idNumber: '',
    licenseNumber: ''
  });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(selectedCar ? 2 : 1);
      setFormData(prev => ({
        ...prev,
        location: initialData?.location || prev.location,
        pickupDate: initialData?.pickupDate || prev.pickupDate,
        returnDate: initialData?.returnDate || prev.returnDate,
      }));
      setSelectedCar(initialData?.car || null);
      setIsValidating(false);
      setLocationError('');
      setPickupCoords([34.0209, -6.8416]);
      setAutoLocateAttempted(false);
      setDocImages({ id: '', license: '', face: '' });
      setActiveCamera(null);
      setGeneratedBookingId('');
      setGeneratedAccessKey('');
    }
  }, [isOpen, initialData]);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleFinalizeLocation = () => {
    setIsValidating(true);
    // Simulate validation API call
    setTimeout(() => {
      setIsValidating(false);
      
      const bookingId = '#AERO-' + Math.floor(1000 + Math.random() * 9000);
      setGeneratedBookingId(bookingId);

      // Generate Random Password/Key
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let accessKey = "";
      for (let i = 0; i < 8; i++) {
          accessKey += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setGeneratedAccessKey(accessKey);

      // Create Booking Object
      if (selectedCar && onBookingSuccess) {
          const booking: Booking = {
              id: bookingId,
              car: selectedCar,
              location: formData.location,
              pickupDate: formData.pickupDate,
              returnDate: formData.returnDate,
              user: {
                  firstName: formData.firstName,
                  lastName: formData.lastName,
                  email: formData.email,
                  photo: docImages.face,
                  idNumber: formData.idNumber,
                  licenseNumber: formData.licenseNumber,
                  accessKey: accessKey, // Pass the generated key
                  role: 'client' // FIX: Added missing required property 'role'
              },
              status: 'In Delivery'
          };
          onBookingSuccess(booking);
      }

      setStep(5);
    }, 2000);
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
    if (isOpen && step === 4 && !autoLocateAttempted) {
      setAutoLocateAttempted(true);
      handleUseCurrentLocation(true);
    }
  }, [isOpen, step, autoLocateAttempted]);

  if (!isOpen) return null;

  // --- Document Scanning Logic ---

  const handleStartCamera = (type: 'id' | 'license' | 'face') => {
    setActiveCamera(type);
  };

  const handleCapture = (type: 'id' | 'license' | 'face') => {
    setProcessingDoc(type);
    
    // Simulate Processing Delay & OCR
    setTimeout(() => {
        setProcessingDoc(null);
        setActiveCamera(null);
        
        // Set Mock Images
        const mockImages = {
            id: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&q=80&w=300',
            license: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&q=80&w=300',
            face: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300'
        };
        
        // If we have a real camera stream in production we would capture that frame.
        // For now, we use the mock unless user uploaded.
        setDocImages(prev => ({ ...prev, [type]: mockImages[type] }));

        // Simulate Data Extraction (OCR)
        if (type === 'id') {
            setFormData(prev => ({
                ...prev,
                idNumber: '8821-492-11', // Extracted ID
            }));
        }
        if (type === 'license') {
             setFormData(prev => ({
                ...prev,
                licenseNumber: 'DL-CA-992812', // Extracted License
                firstName: 'Alexander',
                lastName: 'Pierce'
            }));
        }

    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (ev) => {
              if (ev.target?.result) {
                  setDocImages(prev => ({ ...prev, face: ev.target!.result as string }));
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const triggerFileUpload = () => {
      fileInputRef.current?.click();
  };

  const handleRetake = (type: 'id' | 'license' | 'face') => {
      setDocImages(prev => ({ ...prev, [type]: '' }));
      if (type === 'id') setFormData(prev => ({...prev, idNumber: ''}));
      if (type === 'license') setFormData(prev => ({...prev, licenseNumber: ''}));
  };


  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 ${
            step >= i ? 'bg-brand-blue text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-500'
          }`}>
            {step > i ? <CheckCircle className="w-4 h-4" /> : i}
          </div>
          {i < 4 && <div className={`w-8 h-0.5 mx-2 ${step > i ? 'bg-brand-blue' : 'bg-slate-200 dark:bg-white/10'}`}></div>}
        </div>
      ))}
    </div>
  );

  // Reusable Camera Overlay Component
  const CameraOverlay = ({ type, onCapture }: { type: string, onCapture: () => void }) => (
     <div className="absolute inset-0 bg-black z-20 flex flex-col items-center justify-center overflow-hidden rounded-xl">
         {/* Grid Overlay */}
         <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#0D9488 1px, transparent 1px), linear-gradient(90deg, #0D9488 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
         
         {/* Scanning Laser */}
         <motion.div 
            initial={{ top: '0%' }}
            animate={{ top: '100%' }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute left-0 right-0 h-1 bg-brand-red shadow-[0_0_15px_rgba(220,38,38,0.8)] z-10"
         />

         {/* Viewfinder Corners */}
         <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-white/50 rounded-tl-lg"></div>
         <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-white/50 rounded-tr-lg"></div>
         <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-white/50 rounded-bl-lg"></div>
         <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-white/50 rounded-br-lg"></div>

         <div className="relative z-30 flex flex-col items-center gap-4">
            <span className="text-white/80 font-mono text-xs animate-pulse bg-black/50 px-2 rounded">
                {processingDoc === type ? 'ANALYSE EN COURS...' : 'ALIGNER DOCUMENT'}
            </span>
            
            <button 
                onClick={onCapture}
                disabled={processingDoc === type}
                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-transform"
            >
                <div className={`w-12 h-12 rounded-full ${processingDoc === type ? 'bg-brand-red animate-ping' : 'bg-white'}`}></div>
            </button>
         </div>
     </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
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
        className="relative w-full max-w-5xl bg-white dark:bg-[#0B1120] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-full md:h-auto md:max-h-[90vh]"
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
                   <div className="flex items-center gap-2 text-sm font-medium text-brand-navy dark:text-slate-300">
                      <MapPin className="w-4 h-4 text-brand-blue" />
                      {formData.location}
                   </div>
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
        <div className="w-full md:w-2/3 p-4 md:p-8 overflow-y-auto relative flex-1">
          <StepIndicator />
          
          <AnimatePresence mode="wait">
            
            {/* STEP 1: SELECT CAR */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col"
              >
                <h2 className="text-2xl font-bold text-brand-navy dark:text-white font-space mb-6">Sélectionnez Votre Véhicule</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                  {CARS.map(car => (
                    <div 
                      key={car.id} 
                      onClick={() => setSelectedCar(car)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                        selectedCar?.id === car.id 
                          ? 'border-brand-blue bg-brand-blue/5 shadow-md ring-1 ring-brand-blue' 
                          : 'border-slate-200 dark:border-white/10 hover:border-brand-blue/50'
                      }`}
                    >
                       <img src={car.image} alt={car.name} className="w-full h-24 object-cover rounded-lg mb-3" />
                       <h4 className="font-bold text-brand-navy dark:text-white text-sm">{car.name}</h4>
                       <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-slate-500">{car.category}</span>
                          <span className="text-sm font-bold text-brand-red">${car.pricePerDay}</span>
                       </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                   <button 
                     disabled={!selectedCar}
                     onClick={handleNext}
                     className="px-6 py-3 bg-brand-navy dark:bg-white text-white dark:text-brand-navy rounded-lg font-bold text-sm uppercase tracking-wider flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-bold text-brand-navy dark:text-white font-space">Vérification d'Identité</h2>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-bold uppercase text-slate-500">Système Prêt</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    
                    {/* 1. National ID */}
                    <div className="relative h-48 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 overflow-hidden flex flex-col items-center justify-center p-4">
                        {activeCamera === 'id' ? (
                            <CameraOverlay type="id" onCapture={() => handleCapture('id')} />
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
                                <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center mb-3 text-brand-blue">
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <h4 className="text-sm font-bold text-brand-navy dark:text-white mb-1">Carte Nationale</h4>
                                <p className="text-[10px] text-slate-500 text-center mb-4">Recto de la carte</p>
                                <button 
                                    onClick={() => handleStartCamera('id')}
                                    className="w-full py-2 bg-brand-navy dark:bg-white text-white dark:text-brand-navy rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                                >
                                    <Camera className="w-3 h-3" /> Scanner ID
                                </button>
                            </>
                        )}
                    </div>

                    {/* 2. Driving License */}
                    <div className="relative h-48 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 overflow-hidden flex flex-col items-center justify-center p-4">
                        {activeCamera === 'license' ? (
                            <CameraOverlay type="license" onCapture={() => handleCapture('license')} />
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
                                <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center mb-3 text-brand-blue">
                                    <Smartphone className="w-6 h-6" />
                                </div>
                                <h4 className="text-sm font-bold text-brand-navy dark:text-white mb-1">Permis de Conduire</h4>
                                <p className="text-[10px] text-slate-500 text-center mb-4">Remplissage auto</p>
                                <button 
                                    onClick={() => handleStartCamera('license')}
                                    className="w-full py-2 bg-brand-navy dark:bg-white text-white dark:text-brand-navy rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                                >
                                    <Camera className="w-3 h-3" /> Scanner Carte
                                </button>
                            </>
                        )}
                    </div>

                    {/* 3. Profile Photo */}
                    <div className="relative h-48 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 overflow-hidden flex flex-col items-center justify-center p-4">
                        {activeCamera === 'face' ? (
                            <CameraOverlay type="face" onCapture={() => handleCapture('face')} />
                        ) : docImages.face ? (
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
                                <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center mb-3 text-brand-blue">
                                    <UserCheck className="w-6 h-6" />
                                </div>
                                <h4 className="text-sm font-bold text-brand-navy dark:text-white mb-3">Photo Client</h4>
                                <div className="grid grid-cols-2 gap-2 w-full">
                                    <button 
                                        onClick={() => handleStartCamera('face')}
                                        className="flex flex-col items-center justify-center p-2 rounded bg-white dark:bg-white/10 border border-slate-200 dark:border-white/5 hover:border-brand-blue transition-colors"
                                    >
                                        <Camera className="w-4 h-4 mb-1 text-slate-500" />
                                        <span className="text-[9px] font-bold uppercase">Caméra</span>
                                    </button>
                                    <button 
                                        onClick={triggerFileUpload}
                                        className="flex flex-col items-center justify-center p-2 rounded bg-white dark:bg-white/10 border border-slate-200 dark:border-white/5 hover:border-brand-blue transition-colors"
                                    >
                                        <ImageIcon className="w-4 h-4 mb-1 text-slate-500" />
                                        <span className="text-[9px] font-bold uppercase">Upload</span>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group relative">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prénom</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors"
                        value={formData.firstName}
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                      />
                      {docImages.license && <span className="absolute right-3 top-8 text-[10px] text-green-500 font-bold flex items-center gap-1"><ScanLine className="w-3 h-3" /> OCR</span>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nom</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors"
                        value={formData.lastName}
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="group relative">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Carte Nationale</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors font-mono"
                        placeholder="En attente scan..."
                        readOnly
                        value={formData.idNumber}
                      />
                      {docImages.id && <span className="absolute right-3 top-8 text-green-500"><CheckCircle className="w-4 h-4" /></span>}
                    </div>
                    <div className="group relative">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">N° de Permis</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors font-mono"
                        placeholder="En attente scan..."
                        readOnly
                        value={formData.licenseNumber}
                      />
                      {docImages.license && <span className="absolute right-3 top-8 text-green-500"><CheckCircle className="w-4 h-4" /></span>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Adresse Email</label>
                    <input 
                      type="email" 
                      className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                   <button onClick={handleBack} className="text-slate-500 hover:text-brand-navy dark:hover:text-white font-medium text-sm flex items-center gap-2">
                     <ArrowLeft className="w-4 h-4" /> Retour
                   </button>
                   <button 
                     onClick={handleNext}
                     disabled={!docImages.id || !docImages.license || !docImages.face}
                     className="px-6 py-3 bg-brand-navy dark:bg-white text-white dark:text-brand-navy rounded-lg font-bold text-sm uppercase tracking-wider flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                   >
                     Confirmer Détails <ChevronRight className="w-4 h-4" />
                   </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3 & 4 (SAME AS BEFORE) */}
            {step === 3 && (
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
                  onClick={() => setStep(4)}
                  className="w-full py-4 bg-brand-navy dark:bg-white text-white dark:text-brand-navy rounded-xl font-bold text-sm uppercase tracking-wider shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 group"
                >
                  Envoyer Demande de Réservation <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button onClick={handleBack} className="w-full mt-4 text-center text-slate-500 text-sm hover:text-brand-navy dark:hover:text-white transition-colors">
                  Retour
                </button>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
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
                           onClick={handleUseCurrentLocation}
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

            {/* STEP 5: SUCCESS (UPDATED WITH KEY) */}
            {step === 5 && (
              <motion.div
                key="step5"
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
                <p className="text-[10px] text-slate-400 mt-4">Redirection vers le suivi en direct dans 2 secondes...</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingModal;
