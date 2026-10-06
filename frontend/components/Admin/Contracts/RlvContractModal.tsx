import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText } from 'lucide-react';
import type { Contract } from './ContractManagement';

interface RlvContractModalProps {
  contract: Contract;
  onClose: () => void;
}

const RlvContractModal: React.FC<RlvContractModalProps> = ({ contract, onClose }) => {
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');
  const [previewError, setPreviewError] = useState('');
  const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';

  const fetchContractPdf = async (): Promise<Blob> => {
    const token = localStorage.getItem('auth_token');
    const url = `${apiBase}/admin/contracts/${contract.id}/pdf-arabic`;

    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) {
      let errMsg = `Erreur serveur ${res.status}`;
      try {
        const errBody = await res.text();
        console.error('PDF download failed:', res.status, errBody.substring(0, 500));
      } catch {}
      throw new Error(errMsg);
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.toLowerCase().includes('application/pdf')) {
      const responseText = await res.text();
      console.error('PDF endpoint returned a non-PDF response:', contentType, responseText.substring(0, 500));
      throw new Error('Le serveur n\'a pas retourne un PDF valide.');
    }

    const blob = await res.blob();
    return new Blob([blob], { type: 'application/pdf' });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = '';

    const loadPreview = async () => {
      setPdfPreviewUrl('');
      setPreviewError('');

      try {
        const blob = await fetchContractPdf();
        if (!cancelled) {
          objectUrl = URL.createObjectURL(blob);
          setPdfPreviewUrl(objectUrl);
        }
      } catch (err) {
        console.error('Contract preview failed:', err);
        if (!cancelled) {
          setPreviewError(err instanceof Error ? err.message : 'Apercu du contrat indisponible. Veuillez reessayer.');
        }
      }
    };

    loadPreview();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [apiBase, contract.id]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 sm:p-6 md:p-8 overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-5xl flex flex-col max-h-[94vh] overflow-hidden my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-white/[0.03] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-800 dark:text-white">
                    عقد كراء السيارات - Contrat RLV Tanger
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                    Format Officiel
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  N° {contract.contract_number} · {contract.client_name} · {contract.vehicle_name} ({contract.vehicle_plate})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto p-4 sm:p-6 bg-slate-200/80 dark:bg-slate-950 flex justify-center custom-scrollbar">
            {previewError ? (
              <div className="w-full max-w-[210mm] min-h-[280mm] bg-white text-rose-700 flex items-center justify-center text-sm font-bold border border-rose-200 rounded-lg p-6 text-center">
                {previewError}
              </div>
            ) : pdfPreviewUrl ? (
              <iframe
                title={`Contrat RLV ${contract.contract_number}`}
                src={pdfPreviewUrl}
                className="w-full max-w-[210mm] h-[78vh] bg-white border-0 shadow-xl rounded-md"
              />
            ) : (
              <div className="w-full max-w-[210mm] min-h-[280mm] bg-white text-slate-500 flex items-center justify-center text-sm font-bold rounded-lg shadow-sm">
                Chargement du contrat...
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default RlvContractModal;
