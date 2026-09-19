import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, Download, X, RefreshCw, FileText } from 'lucide-react';
import type { Contract } from './ContractManagement';

interface RlvContractModalProps {
  contract: Contract;
  onClose: () => void;
}

const RlvContractModal: React.FC<RlvContractModalProps> = ({ contract, onClose }) => {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
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
    let cancelled = false;
    let objectUrl = '';

    const loadPreview = async () => {
      setPdfBlob(null);
      setPdfPreviewUrl('');
      setPreviewError('');

      try {
        const blob = await fetchContractPdf();
        if (!cancelled) {
          objectUrl = URL.createObjectURL(blob);
          setPdfBlob(blob);
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

  const handlePrint = () => {
    if (!pdfPreviewUrl) {
      alert('Apercu PDF du contrat en cours de chargement.');
      return;
    }

    const printWindow = window.open(pdfPreviewUrl, '_blank', 'width=1000,height=900,scrollbars=yes');
    if (!printWindow) {
      alert('Veuillez autoriser les popups pour imprimer.');
      return;
    }

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 600);
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);

    try {
      const downloadBlob = pdfBlob ?? await fetchContractPdf();
      const objUrl = URL.createObjectURL(downloadBlob);
      const link = document.createElement('a');
      link.href = objUrl;
      link.download = `contrat-rlv-${contract.contract_number}.pdf`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(objUrl);
      }, 1000);
    } catch (err: any) {
      console.error('PDF download network error:', err);
      alert('Erreur lors du telechargement PDF : ' + (err?.message ?? 'Erreur inconnue'));
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-5xl flex flex-col max-h-[96vh] overflow-hidden"
        >
          <div className="px-5 py-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-white/[0.03] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                    عقد كراء السيارات - Contrat RLV Tanger
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                    Format Officiel
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  N° {contract.contract_number} · {contract.client_name} · {contract.vehicle_name} ({contract.vehicle_plate})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                title="Imprimer au format A4"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer (عقد RLV)</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
                title="Telecharger le document PDF"
              >
                {downloadingPdf ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Telecharger PDF</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto p-4 sm:p-8 bg-slate-200/80 dark:bg-slate-950 flex justify-center custom-scrollbar">
            {previewError ? (
              <div className="w-full max-w-[210mm] min-h-[280mm] bg-white text-rose-700 flex items-center justify-center text-sm font-bold border border-rose-200">
                {previewError}
              </div>
            ) : pdfPreviewUrl ? (
              <iframe
                title={`Contrat RLV ${contract.contract_number}`}
                src={pdfPreviewUrl}
                className="w-full max-w-[210mm] h-[78vh] bg-white border-0 shadow-xl"
              />
            ) : (
              <div className="w-full max-w-[210mm] min-h-[280mm] bg-white text-slate-500 flex items-center justify-center text-sm font-bold">
                Chargement du contrat...
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RlvContractModal;
