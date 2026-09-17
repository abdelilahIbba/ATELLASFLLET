import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, Download, X, RefreshCw, FileText } from 'lucide-react';
import type { Contract } from './ContractManagement';
import RlvContractDocument, { getRlvPrintStyles } from './RlvContractDocument';

interface RlvContractModalProps {
  contract: Contract;
  onClose: () => void;
}

const RlvContractModal: React.FC<RlvContractModalProps> = ({ contract, onClose }) => {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const printContentRef = useRef<HTMLDivElement>(null);

  // Print function — generates self-contained print window with all styles inlined
  const handlePrint = () => {
    if (!printContentRef.current) return;

    const printWindow = window.open('', '_blank', 'width=1000,height=900,scrollbars=yes');
    if (!printWindow) {
      alert("Veuillez autoriser les popups pour imprimer.");
      return;
    }

    // Capture the HTML content BEFORE writing to the new window
    const contentHtml = printContentRef.current.innerHTML;
    const printStyles = getRlvPrintStyles();

    printWindow.document.write(`<!DOCTYPE html>
<html lang="fr" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contrat de Location — ${contract.contract_number ?? ''}</title>
  <style>
    /* Cairo font — base64 subset embedded for offline printing */
    @import url('data:text/css,');
    /* Fallback: system Arabic fonts */
    body { font-family: 'Cairo', 'Segoe UI', 'Tahoma', Arial, sans-serif; }
  </style>
  <style id="print-styles">
    ${printStyles}
  </style>
  <style media="print">
    @page { size: A4 portrait; margin: 5mm 6mm; }
    body { margin: 0; padding: 0; }
    .rlv-sheet { page-break-inside: avoid; }
  </style>
</head>
<body>
  ${contentHtml}
  <script>
    // Trigger print after a short delay to ensure layout is complete
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 350);
    });
    // Fallback if load event already fired
    if (document.readyState === 'complete') {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 600);
    }
  <\/script>
</body>
</html>`);

    printWindow.document.close();
  };

  // Download PDF via backend endpoint
  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    const token = localStorage.getItem('auth_token');
    const base = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';
    const url = `${base}/admin/contracts/${contract.id}/pdf-arabic`;

    try {
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = `contrat-rlv-${contract.contract_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(objUrl), 5000);
    } catch (err) {
      console.warn('Backend PDF failed, falling back to print window', err);
      handlePrint();
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
          {/* ── Toolbar Header ── */}
          <div className="px-5 py-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-white/[0.03] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                    عقد كراء السيارات — Contrat RLV Tanger
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
                title="Télécharger le document PDF"
              >
                {downloadingPdf ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Télécharger PDF</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── Document Paper Container ── */}
          <div className="overflow-y-auto p-4 sm:p-8 bg-slate-200/80 dark:bg-slate-950 flex justify-center custom-scrollbar">
            <RlvContractDocument contract={contract} documentRef={printContentRef} />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RlvContractModal;
