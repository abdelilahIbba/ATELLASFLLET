import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, ChevronRight, CreditCard, CheckCircle, ArrowLeft, Clock, Loader2, AlertCircle } from 'lucide-react';
import { Car } from '../../types';
import { CARS, LOCATIONS } from '../../constants';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    car?: Car;
    location?: string;
    pickupDate?: string;
    returnDate?: string;
  };
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, initialData }) => {
  const [step, setStep] = useState(1);
  const [selectedCar, setSelectedCar] = useState<Car | null>(initialData?.car || null);
  const [isValidating, setIsValidating] = useState(false);
  const [formData, setFormData] = useState({
    location: initialData?.location || 'Los Angeles (LAX)',
    pickupDate: initialData?.pickupDate || '',
    returnDate: initialData?.returnDate || '',
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
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
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleFinalizeLocation = () => {
    setIsValidating(true);
    // Simulate validation API call
    setTimeout(() => {
      setIsValidating(false);
      setStep(5);
    }, 2000);
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
        className="relative w-full max-w-4xl bg-white dark:bg-[#0B1120] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors text-brand-navy dark:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Panel - Summary / Visual */}
        <div className="w-full md:w-2/5 bg-slate-50 dark:bg-brand-navy border-r border-slate-200 dark:border-white/5 p-8 flex flex-col justify-between relative overflow-hidden">
           <div className="relative z-10">
              <h3 className="text-sm font-bold text-brand-teal uppercase tracking-widest mb-2">Reservation Summary</h3>
              <div className="space-y-6 mt-6">
                <div>
                   <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Vehicle</label>
                   {selectedCar ? (
                     <div>
                       <p className="text-xl font-bold text-brand-navy dark:text-white font-space">{selectedCar.name}</p>
                       <p className="text-sm text-slate-500">{selectedCar.category} Series</p>
                     </div>
                   ) : (
                     <p className="text-sm text-slate-400 italic">No vehicle selected</p>
                   )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Pick-up</label>
                      <div className="flex items-center gap-2 text-sm font-medium text-brand-navy dark:text-slate-300">
                         <Calendar className="w-4 h-4 text-brand-blue" />
                         {formData.pickupDate || 'Oct 24, 2024'}
                      </div>
                   </div>
                   <div>
                      <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Return</label>
                      <div className="flex items-center gap-2 text-sm font-medium text-brand-navy dark:text-slate-300">
                         <Calendar className="w-4 h-4 text-brand-blue" />
                         {formData.returnDate || 'Oct 27, 2024'}
                      </div>
                   </div>
                </div>

                <div>
                   <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Location</label>
                   <div className="flex items-center gap-2 text-sm font-medium text-brand-navy dark:text-slate-300">
                      <MapPin className="w-4 h-4 text-brand-blue" />
                      {formData.location}
                   </div>
                </div>
                
                {step === 4 && (
                  <div className="mt-4 p-3 bg-brand-red/10 border border-brand-red/20 rounded-lg">
                    <p className="text-brand-red text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-3 h-3" /> Status: Pending Validation
                    </p>
                  </div>
                )}
              </div>
           </div>

           {/* Car Image Preview */}
           {selectedCar && (
             <div className="relative z-10 mt-8 rounded-xl overflow-hidden shadow-lg border border-white/10">
                <img src={selectedCar.image} alt={selectedCar.name} className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                   <p className="text-white font-bold text-lg">${selectedCar.pricePerDay}<span className="text-xs font-normal opacity-80">/day</span></p>
                </div>
             </div>
           )}

           {/* Decor */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
        </div>

        {/* Right Panel - Form Steps */}
        <div className="w-full md:w-3/5 p-8 overflow-y-auto">
          <StepIndicator />
          
          <AnimatePresence mode="wait">
            
            {/* STEP 1: SELECT CAR (If not selected) */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col"
              >
                <h2 className="text-2xl font-bold text-brand-navy dark:text-white font-space mb-6">Select Your Vehicle</h2>
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
                     Next Step <ChevronRight className="w-4 h-4" />
                   </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: DETAILS */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-brand-navy dark:text-white font-space mb-6">Guest Details</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                    <input 
                      type="email" 
                      className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  
                  <div className="pt-4 flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 text-brand-blue rounded border-slate-300 focus:ring-brand-blue" />
                    <span className="text-xs text-slate-500">I agree to the Terms of Service and Privacy Policy</span>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                   <button onClick={handleBack} className="text-slate-500 hover:text-brand-navy dark:hover:text-white font-medium text-sm flex items-center gap-2">
                     <ArrowLeft className="w-4 h-4" /> Back
                   </button>
                   <button 
                     onClick={handleNext}
                     className="px-6 py-3 bg-brand-navy dark:bg-white text-white dark:text-brand-navy rounded-lg font-bold text-sm uppercase tracking-wider flex items-center gap-2 hover:opacity-90 transition-all shadow-lg"
                   >
                     Confirm Details <ChevronRight className="w-4 h-4" />
                   </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: REVIEW */}
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
                  <h2 className="text-2xl font-bold text-brand-navy dark:text-white font-space">Review Booking</h2>
                  <p className="text-slate-500 text-sm mt-2">No charge will be made until pickup.</p>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-6 border border-slate-200 dark:border-white/10 mb-6">
                   <div className="flex justify-between mb-2">
                      <span className="text-slate-500 text-sm">Vehicle Rate (3 Days)</span>
                      <span className="font-bold text-brand-navy dark:text-white">${selectedCar ? selectedCar.pricePerDay * 3 : 0}</span>
                   </div>
                   <div className="flex justify-between mb-2">
                      <span className="text-slate-500 text-sm">Taxes & Fees</span>
                      <span className="font-bold text-brand-navy dark:text-white">$145</span>
                   </div>
                   <div className="flex justify-between mb-2">
                      <span className="text-slate-500 text-sm">Security Deposit</span>
                      <span className="font-bold text-brand-navy dark:text-white">$500</span>
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
                  Submit Reservation Request <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button onClick={handleBack} className="w-full mt-4 text-center text-slate-500 text-sm hover:text-brand-navy dark:hover:text-white transition-colors">
                  Go Back
                </button>
              </motion.div>
            )}

            {/* STEP 4: PENDING VALIDATION */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600 dark:text-yellow-500 animate-pulse">
                    <Clock className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-brand-navy dark:text-white font-space">Reservation Pending</h2>
                  <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
                    We've received your request. To finalize, please verify your pickup location availability.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-6 border border-slate-200 dark:border-white/10 mb-8">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Confirm Pickup Point</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-blue" />
                      <select 
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-brand-navy dark:text-white font-bold outline-none focus:border-brand-blue transition-all appearance-none cursor-pointer"
                      >
                         {LOCATIONS.map((loc, idx) => (
                           <option key={idx} value={loc.city}>{loc.city} - {loc.address}</option>
                         ))}
                         {/* Fallback option if current location isn't in main list */}
                         {!LOCATIONS.find(l => l.city === formData.location) && (
                            <option value={formData.location}>{formData.location}</option>
                         )}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90" />
                    </div>
                </div>

                <button 
                  onClick={handleFinalizeLocation}
                  disabled={isValidating}
                  className="w-full py-4 bg-brand-red text-white rounded-xl font-bold text-sm uppercase tracking-wider shadow-xl shadow-brand-red/25 hover:bg-red-600 hover:shadow-brand-red/40 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying Availability...
                    </>
                  ) : (
                    <>
                      Verify & Finalize Booking <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </>
                  )}
                </button>
                
                <p className="text-center text-[10px] text-slate-400 mt-4">
                  By clicking verify, you confirm the pickup location is correct.
                </p>
              </motion.div>
            )}

            {/* STEP 5: SUCCESS */}
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
                <h2 className="text-3xl font-bold text-brand-navy dark:text-white font-space mb-4">Vehicle Secured!</h2>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                  Your <span className="text-brand-navy dark:text-white font-bold">{selectedCar?.name}</span> is being prepared for delivery at <span className="text-brand-blue font-bold">{formData.location}</span>.
                </p>
                
                <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-lg inline-block mb-8">
                   <span className="text-xs uppercase font-bold text-slate-500 block mb-1">Confirmation Code</span>
                   <span className="text-xl font-mono font-bold text-brand-navy dark:text-white tracking-widest">#AERO-8821</span>
                </div>

                <div>
                   <button 
                     onClick={onClose}
                     className="px-8 py-3 bg-brand-navy dark:bg-white text-white dark:text-brand-navy rounded-lg font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-all shadow-lg"
                   >
                     Return to Home
                   </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingModal;