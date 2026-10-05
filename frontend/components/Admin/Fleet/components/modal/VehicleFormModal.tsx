import React from 'react';
import { motion } from 'framer-motion';
import { X, Save, Car, Shield, AlertTriangle } from 'lucide-react';
import { VehicleDetailsTab } from './VehicleDetailsTab';
import { VehicleDocumentsTab } from './VehicleDocumentsTab';
import { VehicleInfractionsTab } from './VehicleInfractionsTab';
import type { Infraction } from '../../../types';

interface VehicleFormModalProps {
  selectedItem: any | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  vehicleModalTab: 'details' | 'documents' | 'infractions';
  setVehicleModalTab: (tab: 'details' | 'documents' | 'infractions') => void;
  modalQty: number;
  setModalQty: (n: number) => void;
  modalUnitPlates: string[];
  setModalUnitPlates: React.Dispatch<React.SetStateAction<string[]>>;
  imageInputType: 'url' | 'upload';
  setImageInputType: (t: 'url' | 'upload') => void;
  imageUrlPreview: string;
  setImageUrlPreview: (s: string) => void;
  docFileNames: Record<string, string>;
  setDocFileNames: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  modalInfractions: Infraction[];
  modalInfLoading: boolean;
  infFormVisible: boolean;
  setInfFormVisible: (v: boolean) => void;
  infFormSaving: boolean;
  infForm: any;
  setInfForm: React.Dispatch<React.SetStateAction<any>>;
  handleMarkInfPaid: (id: string) => void;
  handleDeleteInfraction: (id: string) => void;
  handleAddInfraction: () => void;
  blankInfForm: any;
}

export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
  selectedItem,
  onClose,
  onSubmit,
  vehicleModalTab,
  setVehicleModalTab,
  modalQty,
  setModalQty,
  modalUnitPlates,
  setModalUnitPlates,
  imageInputType,
  setImageInputType,
  imageUrlPreview,
  setImageUrlPreview,
  docFileNames,
  setDocFileNames,
  modalInfractions,
  modalInfLoading,
  infFormVisible,
  setInfFormVisible,
  infFormSaving,
  infForm,
  setInfForm,
  handleMarkInfPaid,
  handleDeleteInfraction,
  handleAddInfraction,
  blankInfForm
}) => {
  const unpaidCount = modalInfractions.filter(i => i.status !== 'Paid').length;
  const modalTitle = selectedItem ? `Modifier ${selectedItem.name}` : 'Ajouter un Véhicule';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-[#0B1120] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200/90 dark:border-white/10 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/80 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shadow-xs">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight font-space">
                {modalTitle}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {selectedItem ? 'Mettez à jour les informations et documents du véhicule' : 'Complétez les détails pour ajouter un véhicule à la flotte'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 hover:bg-slate-200/70 dark:hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-white"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
          
          {/* Tabs Navigation */}
          <div className="flex border-b border-slate-200/80 dark:border-white/10 px-6 bg-slate-50/40 dark:bg-white/[0.01]">
            <button 
              type="button" 
              onClick={() => setVehicleModalTab('details')} 
              className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-150 flex items-center gap-2 ${
                vehicleModalTab === 'details' 
                  ? 'border-brand-blue text-brand-blue' 
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Détails Véhicule</span>
            </button>

            <button 
              type="button" 
              onClick={() => setVehicleModalTab('documents')} 
              className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-150 flex items-center gap-2 ${
                vehicleModalTab === 'documents' 
                  ? 'border-brand-blue text-brand-blue' 
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Documents</span>
              <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs">
                Sécurisé
              </span>
            </button>

            <button 
              type="button" 
              onClick={() => setVehicleModalTab('infractions')} 
              className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-150 flex items-center gap-2 ${
                vehicleModalTab === 'infractions' 
                  ? 'border-brand-blue text-brand-blue' 
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Infractions</span>
              {unpaidCount > 0 && (
                <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                  {unpaidCount}
                </span>
              )}
            </button>
          </div>

          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {vehicleModalTab === 'details' && (
              <VehicleDetailsTab
                selectedItem={selectedItem}
                modalQty={modalQty}
                setModalQty={setModalQty}
                modalUnitPlates={modalUnitPlates}
                setModalUnitPlates={setModalUnitPlates}
                imageInputType={imageInputType}
                setImageInputType={setImageInputType}
                imageUrlPreview={imageUrlPreview}
                setImageUrlPreview={setImageUrlPreview}
              />
            )}

            {vehicleModalTab === 'documents' && (
              <VehicleDocumentsTab
                selectedItem={selectedItem}
                docFileNames={docFileNames}
                setDocFileNames={setDocFileNames}
              />
            )}

            {vehicleModalTab === 'infractions' && (
              <VehicleInfractionsTab
                selectedItem={selectedItem}
                modalInfractions={modalInfractions}
                modalInfLoading={modalInfLoading}
                infFormVisible={infFormVisible}
                setInfFormVisible={setInfFormVisible}
                infFormSaving={infFormSaving}
                infForm={infForm}
                setInfForm={setInfForm}
                handleMarkInfPaid={handleMarkInfPaid}
                handleDeleteInfraction={handleDeleteInfraction}
                handleAddInfraction={handleAddInfraction}
                blankInfForm={blankInfForm}
              />
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 px-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/80 dark:bg-white/[0.02]">
            <p className="text-xs text-slate-400 hidden sm:block">
              {vehicleModalTab === 'details' && 'Tous les champs marqués par un astérisque (*) sont obligatoires'}
              {vehicleModalTab === 'documents' && 'Formats acceptés: PDF, JPG, PNG (Max. 4 Mo)'}
              {vehicleModalTab === 'infractions' && 'Assurez-vous de vérifier le paiement avant validation'}
            </p>
            <div className="flex items-center gap-3 ml-auto">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="px-6 py-2.5 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-brand-blue/20 flex items-center gap-2 active:scale-[0.98]"
              >
                <Save className="w-4 h-4 stroke-[2.5]" /> 
                <span>Enregistrer</span>
              </button>
            </div>
          </div>

        </form>
      </motion.div>
    </div>
  );
};
