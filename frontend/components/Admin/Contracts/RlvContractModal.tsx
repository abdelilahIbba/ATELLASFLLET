import React, { useState, useRef } from 'react';
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
      alert('Veuillez autoriser les popups pour imprimer.');
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
    /* Cairo font — fallback: system Arabic fonts */
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

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `Contrat_${contract.contract_number || contract.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Erreur téléchargement PDF:', err);
      alert('Impossible de télécharger le PDF.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl max-h-[96vh] flex flex-col bg-slate-100 dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          {/* ── Modal Top Action Bar ── */}
          <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Contrat RLV — {contract.contract_number || 'N/A'}
                </h3>
                <p className="text-xs text-slate-500">
                  {contract.booking?.customer_name || 'Client'} · {contract.booking?.vehicle_name || 'Véhicule'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
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
