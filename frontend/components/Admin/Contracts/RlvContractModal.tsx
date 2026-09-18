import React, { useState } from 'react';
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

<<<<<<< HEAD
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
=======
  // Date parsing
  const startDate = contract.start_date ? new Date(contract.start_date) : new Date();
  const endDate = contract.end_date ? new Date(contract.end_date) : new Date();
  const days = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

  const pad = (n: number) => String(n).padStart(2, '0');
  const depJ = pad(startDate.getDate());
  const depM = pad(startDate.getMonth() + 1);
  const depA = String(startDate.getFullYear());
  const depH = `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`;

  const retJ = pad(endDate.getDate());
  const retM = pad(endDate.getMonth() + 1);
  const retA = String(endDate.getFullYear());
  const retH = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;

  // Totals
  const totalTTC = contract.total_amount || 0;
  const totalHT = totalTTC / 1.2;
  const tvaAmount = totalTTC - totalHT;

  // Formatted contract number
  const cleanNumber = (contract.contract_number || '').replace(/\D/g, '');
  const formattedContractNum = cleanNumber ? cleanNumber.padStart(5, '0') : contract.contract_number || '00001';

  // KM digits boxes
  const formatKmDigits = (km?: number) => {
    const s = km ? String(km) : '';
    const padded = s.padStart(6, ' ');
    return padded.split('');
  };

  const kmDep = formatKmDigits(contract.mileage_start);
  const kmRet = formatKmDigits(contract.mileage_end);
  const kmParcouru =
    contract.mileage_start && contract.mileage_end
      ? contract.mileage_end - contract.mileage_start
      : undefined;
  const kmPar = formatKmDigits(kmParcouru);

  // Inspection condition lists
  const startCond: any[] = Array.isArray(contract.condition_start) ? contract.condition_start : [];
  const endCond: any[] = Array.isArray(contract.condition_end) ? contract.condition_end : [];

  // Print function — fetches the server-rendered Blade HTML and prints it
  const handlePrint = async () => {
    const token = localStorage.getItem('auth_token');
    const base = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';
    const previewUrl = `${base}/admin/contracts/${contract.id}/arabic-preview`;

    // Open a blank popup immediately (must be in the same synchronous call as the click)
    const printWindow = window.open('', '_blank', 'width=950,height=900');
    if (!printWindow) {
      alert('Veuillez autoriser les fenêtres popup pour imprimer.');
      return;
    }

    // Show a loading state so the window isn't blank
    printWindow.document.write('<html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;color:#555">Chargement du contrat…</body></html>');

    try {
      const res = await fetch(previewUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const html = await res.text();

      // Replace the loading screen with the real Blade-rendered HTML
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();

      // Wait for fonts and images to load, then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 600);
      };

      // Fallback in case onload already fired before assignment
      setTimeout(() => {
        if (printWindow.document.readyState === 'complete') {
          printWindow.focus();
          printWindow.print();
        }
      }, 1800);

    } catch (err) {
      console.error('Impossible de charger le contrat pour impression:', err);
      printWindow.close();
    }
>>>>>>> 24c7ca9 (maintanace contrat)
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

      if (!res.ok) {
        let errMsg = `Erreur serveur ${res.status}`;
        try {
          const errBody = await res.text();
          console.error('PDF download failed:', res.status, errBody.substring(0, 500));
        } catch {}
        alert(errMsg + ' — veuillez réessayer.');
        return;
      }

      const blob = await res.blob();

      // Force download using a Blob with explicit type + revoke after click
      const downloadBlob = new Blob([blob], { type: 'application/octet-stream' });
      const objUrl = URL.createObjectURL(downloadBlob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = `contrat-rlv-${contract.contract_number}.pdf`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(objUrl);
      }, 1000);
    } catch (err: any) {
      console.error('PDF download network error:', err);
      alert('Erreur réseau lors du téléchargement PDF : ' + (err?.message ?? 'Erreur inconnue'));
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
<<<<<<< HEAD
            <RlvContractDocument contract={contract} documentRef={printContentRef} />
=======
            <div
              className="bg-white text-black p-6 rounded-sm shadow-xl border border-slate-300 w-full max-w-[210mm] text-[8.5px] leading-tight select-text"
              style={{ minHeight: '290mm' }}
            >
              {/* ══ HEADER ══ */}
              <div className="grid grid-cols-12 gap-3 mb-2 pb-2 border-b border-slate-300">
                {/* Left: Logo & Company Address */}
                <div className="col-span-5 text-center pr-2">
                  <div className="mb-1 flex justify-center">
                    <img
                      src="/rlv-logo.jpg"
                      alt="Logo RLV"
                      className="h-10 object-contain mx-auto"
                      onError={e => {
                        // Fallback if public file missing
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <h1 className="font-extrabold text-[11px] tracking-wider uppercase text-slate-900 leading-tight">
                    RAHIMI LOCATION DE VOITURE
                  </h1>
                  <p className="text-[7.5px] font-semibold text-slate-800 mt-0.5">
                    📍 LOT EL NAHDA RUE 37 N°12 BLOC 38 , Tanger
                  </p>
                  <p className="text-[8px] font-bold text-slate-900 mt-0.5">
                    📞 Tel: 06 77 81 37 18 / 07 77 57 33 79
                  </p>
                </div>

                {/* Right: Brand Title + Warning texts */}
                <div className="col-span-7 pl-2 border-l border-slate-300">
                  <div className="text-center mb-1">
                    <span className="font-black text-[17px] text-rose-600 tracking-wide font-sans">
                      RLV
                    </span>
                    <span className="font-bold text-[13px] text-slate-900 ml-1">
                      Location de voiture
                    </span>
                  </div>
                  <p className="text-[7px] text-slate-900 text-justify font-bold leading-tight mb-1" dir="rtl">
                    المكتري للسيارة يتابع قضائيا 24 ساعة بعد انتهاء العقد وفي حالة تمديد المدة يجب اخبار شركة R.L.V وأداء مبلغ المدة الاضافية ويبقى المكتري هو المسؤول الوحيد عن اي حادثة بعد تمديد دون اشعار الشركة للمكتري الصلاحية في قيادة السيارة لا غير ولا يسمح له بتسليمها لشخص اخر
                  </p>
                  <p className="text-[6.2px] text-slate-700 text-justify leading-tight">
                    Le Locataire s'expose à des poursuites juridiques 24 heures après la date convenu au départ si le véhicule n'est toujours pas retourné et cela sans que RLV ait été informé d'un prolongation de location et ait reçue la somme supplémentaire due. - En cas de Forfait, le locataire est responsable de tous dégâts matériels d'après la deuxième signature. - Le véhicule ne doit être conduit que par le locataire.
                  </p>
                </div>
              </div>

              {/* ══ TITLE BANNER ══ */}
              <div className="border-[1.5px] border-black px-3 py-1 mb-2 flex items-center justify-between bg-slate-50/50">
                <span className="font-extrabold text-[13px] text-black uppercase">
                  Contrat de Location
                </span>
                <span className="font-extrabold text-[15px] text-black" dir="rtl">
                  عقـــــد الكـــــراء
                </span>
                <div className="flex items-center">
                  <span className="text-rose-700 font-extrabold text-[12px] mr-1">
                    Nº
                  </span>
                  <span className="border-[1.5px] border-black px-2 py-0.5 font-mono font-black text-[12px] bg-white">
                    {formattedContractNum}
                  </span>
                </div>
              </div>

              {/* ══ MAIN TWO-COLUMN GRID ══ */}
              <div className="grid grid-cols-2 border-[1.5px] border-black mb-2">
                {/* ── LEFT COLUMN : VEHICULE & CLIENT ── */}
                <div className="border-r-[1.5px] border-black">
                  {/* Vehicle fields */}
                  <FieldRow labelFr="Marque :" value={contract.vehicle_name} labelAr="نوع" />
                  <FieldRow labelFr="N° Immatriculation :" value={contract.vehicle_plate} labelAr="رقم التسجيل" />
                  <FieldRow labelFr="Lieu de Livraison :" value={contract.signature_city || 'Tanger'} labelAr="مكان التسليم" />
                  <FieldRow labelFr="Lieu de Reprise :" value={contract.signature_city || 'Tanger'} labelAr="مكان الاسترجاع" thickDivider />

                  {/* Client fields */}
                  <FieldRow labelFr="NOM :" value={contract.client_name} labelAr="الاسم" isBold />
                  <FieldRow labelFr="CIN N° :" value={contract.client_id_number} labelAr="البطاقة الوطنية" />
                  <FieldRow labelFr="Date de Naissance :" value="" labelAr="تاريخ الازدياد" />
                  <FieldRow labelFr="Profession :" value="" labelAr="المهنة" />
                  <FieldRow labelFr="Adresse au Maroc :" value={contract.client_address} labelAr="العنوان بالمغرب" />
                  <FieldRow labelFr="Adresse à l 'Etranger :" value="" labelAr="العنوان بالخارج" />
                  <FieldRow labelFr="Permis de Conduire N° :" value={contract.client_license_number} labelAr="رخصة السياقة رقم" />
                  <FieldRow labelFr="Délivré à :" value="" labelAr="اصدارها في" />
                  <FieldRow
                    labelFr="Le :"
                    value={contract.client_license_expiry ? new Date(contract.client_license_expiry).toLocaleDateString('fr-FR') : ''}
                    labelAr="بتاريخ"
                  />
                  <FieldRow labelFr="Passport N° :" value="" labelAr="رقم جواز السفر" />
                  <FieldRow labelFr="Délivré à :" value="" labelAr="اصدارها في" />
                  <FieldRow labelFr="Le :" value="" labelAr="بتاريخ" />
                  <FieldRow labelFr="Téléphone de Contrat :" value={contract.client_phone} labelAr="هاتف الاتصال" />
                </div>

                {/* ── RIGHT COLUMN : DATES, KM, CONDUCTEUR SUPPLÉMENTAIRE ── */}
                <div>
                  {/* Date Grid */}
                  <table className="w-full border-collapse border-b-[1.5px] border-black text-[7.8px]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-black">
                        <th className="border-r border-black p-1 text-left w-1/2">Désignation / البيان</th>
                        <th className="border-r border-black p-1 text-center w-[12%]">J</th>
                        <th className="border-r border-black p-1 text-center w-[12%]">M</th>
                        <th className="border-r border-black p-1 text-center w-[13%]">A</th>
                        <th className="p-1 text-center w-[13%]">H</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-400">
                        <td className="border-r border-black p-1 flex justify-between">
                          <span className="font-bold">Départ</span>
                          <span className="font-bold" dir="rtl">الانطلاق</span>
                        </td>
                        <td className="border-r border-black p-1 text-center font-mono font-bold">{depJ}</td>
                        <td className="border-r border-black p-1 text-center font-mono font-bold">{depM}</td>
                        <td className="border-r border-black p-1 text-center font-mono font-bold">{depA}</td>
                        <td className="p-1 text-center font-mono font-bold">{depH}</td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <td className="border-r border-black p-1 flex justify-between">
                          <span className="font-bold">Retour Prevu</span>
                          <span className="font-bold" dir="rtl">الرجوع الموقع</span>
                        </td>
                        <td className="border-r border-black p-1 text-center font-mono font-bold">{retJ}</td>
                        <td className="border-r border-black p-1 text-center font-mono font-bold">{retM}</td>
                        <td className="border-r border-black p-1 text-center font-mono font-bold">{retA}</td>
                        <td className="p-1 text-center font-mono font-bold">{retH}</td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <td className="border-r border-black p-1 flex justify-between">
                          <span className="font-bold">Retour Définitif</span>
                          <span className="font-bold" dir="rtl">الرجوع النهائي</span>
                        </td>
                        <td className="border-r border-black p-1 text-center font-mono font-bold"></td>
                        <td className="border-r border-black p-1 text-center font-mono font-bold"></td>
                        <td className="border-r border-black p-1 text-center font-mono font-bold"></td>
                        <td className="p-1 text-center font-mono font-bold"></td>
                      </tr>
                      <tr>
                        <td className="border-r border-black p-1 flex justify-between">
                          <span className="font-bold">Durée</span>
                          <span className="font-bold" dir="rtl">المدة</span>
                        </td>
                        <td colSpan={4} className="p-1 text-center font-bold bg-slate-50">
                          {days} Jour{days > 1 ? 's' : ''} / {days} أيام
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Kilométrage Segmented Section */}
                  <div className="p-1.5 border-b-[1.5px] border-black space-y-1 bg-white">
                    <KmRow labelAr="عدد الكيلومترات عند الرجوع" labelFr="KILOMETRAGE RETOUR:" digits={kmRet} />
                    <KmRow labelAr="عدد الكيلومترات عند الذهاب" labelFr="KILOMETRAGE DEPART:" digits={kmDep} />
                    <KmRow labelAr="عدد الكيلومترات المقطوعة" labelFr="KILOMETRAGE PARCOURU:" digits={kmPar} />
                  </div>

                  {/* Le Conducteur Supplémentaire */}
                  <div className="bg-slate-100 border-b border-black px-2 py-0.5 flex justify-between font-bold text-[8px]">
                    <span className="uppercase tracking-wider">Le Conducteur Supplémentaire</span>
                    <span dir="rtl">السائق المرخـص</span>
                  </div>
                  <FieldRow labelFr="Nom &amp; Prénom :" value="" labelAr="الاسم الشخصي والعائلي" />
                  <FieldRow labelFr="Permis de conduire N° :" value="" labelAr="رخصة السياقة رقم" />
                  <FieldRow labelFr="Délivré à :" value="" labelAr="اصدارها في" />
                  <FieldRow labelFr="Passeport N° :" value="" labelAr="رقم جواز السفر" />
                  <FieldRow labelFr="C.I.N n° :" value="" labelAr="البطاقة الوطنية" />
                </div>
              </div>

              {/* ══ PAIEMENT & CONDITIONS & TOTALS ══ */}
              <div className="grid grid-cols-2 border-[1.5px] border-black mb-2">
                {/* Left: Paiement + Terms + Signature client */}
                <div className="border-r-[1.5px] border-black">
                  <div className="bg-slate-100 border-b border-slate-400 px-2 py-0.5 flex justify-between font-bold text-[8px]">
                    <span>Paiement</span>
                    <span dir="rtl">الأداء</span>
                  </div>

                  <div className="p-1 space-y-0.5 text-[7.5px]">
                    <div className="flex items-center justify-between border-b border-slate-200 py-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 border border-black inline-flex items-center justify-center font-bold text-[8px]">
                          {contract.booking_payment_status === 'paid' ? '✓' : ''}
                        </span>
                        <span>* Espèce :</span>
                      </div>
                      <span className="font-bold" dir="rtl">نقدا</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-200 py-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 border border-black inline-flex items-center justify-center"></span>
                        <span>* Chèque :</span>
                      </div>
                      <span className="font-bold" dir="rtl">شيكا</span>
                    </div>

                    <div className="flex items-center justify-between py-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 border border-black inline-flex items-center justify-center font-bold text-[8px]">
                          {contract.deposit_amount > 0 ? '✓' : ''}
                        </span>
                        <span>* Caution :</span>
                        {contract.deposit_amount > 0 && (
                          <strong className="ml-1">{contract.deposit_amount.toFixed(2)} Dh</strong>
                        )}
                      </div>
                      <span className="font-bold" dir="rtl">ضمانة</span>
                    </div>
                  </div>

                  {/* Conditions acknowledgement */}
                  <div className="border-t border-slate-400 p-1.5 text-[6.5px] leading-snug">
                    <p>
                      Je reconnais avoir pris Connaissance des présentes conditions générales (recto verso) que je m'engage à les respecter
                    </p>
                    <p className="font-bold mt-0.5 text-right text-[7px]" dir="rtl">
                      اعترف بعلمي الكامل للقانون العام لكراء السيارات في ظهر هذا العقد والتزم باحترامه
                    </p>
                  </div>

                  {/* Client Signature */}
                  <div className="border-t border-slate-400 p-1 flex justify-between font-bold text-[7.8px]">
                    <span>Signature de Client</span>
                    <span dir="rtl">إمضاء الزبون</span>
                  </div>
                  <div className="h-10 flex items-center justify-center">
                    {contract.signature_client_start ? (
                      <img
                        src={contract.signature_client_start}
                        alt="Signature Client"
                        className="max-h-9 max-w-[120px]"
                      />
                    ) : (
                      <span className="text-slate-300 text-[9px] italic">Signature</span>
                    )}
                  </div>
                </div>

                {/* Right: Totals + Fait à Tanger + Le Responsable */}
                <div>
                  <div className="border-b border-slate-400 p-1 flex justify-between text-[8px]">
                    <span>Total Hors Taxe</span>
                    <span className="font-bold">{totalHT.toFixed(2)} Dh</span>
                  </div>
                  <div className="border-b border-slate-400 p-1 flex justify-between text-[8px]">
                    <span>Taxe TVA 20%</span>
                    <span className="font-bold">{tvaAmount.toFixed(2)} Dh</span>
                  </div>
                  <div className="border-b-[1.5px] border-black p-1 flex justify-between text-[8.5px] font-black bg-slate-50">
                    <span>TOTAL DE LOCATION</span>
                    <span>{totalTTC.toFixed(2)} Dh</span>
                  </div>

                  <div className="border-b border-slate-400 p-1 text-[7.8px] font-bold">
                    Fait à Tanger le : <span className="font-extrabold">{startDate.toLocaleDateString('fr-FR')}</span>
                  </div>

                  <div className="p-1 text-center">
                    <p className="font-bold text-[7.8px] mb-1">Le responsable</p>
                    <div className="h-10 flex items-center justify-center">
                      {contract.signature_agent_start ? (
                        <img
                          src={contract.signature_agent_start}
                          alt="Signature Responsable"
                          className="max-h-9 max-w-[100px]"
                        />
                      ) : (
                        <div className="w-20 border-b border-slate-400 mt-6"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ══ VEHICLE INSPECTION (BOTTOM) ══ */}
              <div className="grid grid-cols-12 border-[1.5px] border-black">
                {/* ── DÉPART (Col 5/12) ── */}
                <div className="col-span-5 p-1.5 border-r border-black">
                  <div className="font-black text-[9px] mb-0.5">← DEPART</div>
                  <div className="text-[7.2px] font-bold mb-0.5 flex items-center justify-between">
                    <span>Véhicule En parfait état</span>
                    <span className="space-x-1">
                      <span>[ {startCond.length === 0 ? '✓' : ' '} ] Oui</span>
                      <span>[ {startCond.length > 0 ? '✓' : ' '} ] Non</span>
                    </span>
                  </div>
                  <p className="text-[6px] text-slate-500 italic mb-1">(Rayer la mention inutile)</p>
                  <p className="text-[6.5px] font-semibold leading-tight mb-1">
                    <strong>Commentaires</strong> (Positionner les numéros à l'endroit précis du dommage, sur la matrice à gauche)
                  </p>
                  <div className="space-y-0.5 text-[6.5px] mb-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="truncate">
                        {i} {startCond[i - 1]?.zone ? `· ${startCond[i - 1].zone}` : '.........................................................'}
                      </div>
                    ))}
                  </div>
                  {/* Car Diagram */}
                  <CarInspectionImage />
                </div>

                {/* ── DOMMAGES IDENTIFIÉS ET ACCEPTÉS (Col 2/12) ── */}
                <div className="col-span-2 p-1 border-r border-black flex flex-col justify-between">
                  <div>
                    <div className="font-black text-[7px] text-center border-b border-slate-400 pb-0.5 mb-1 leading-tight">
                      DOMMAGES IDENTIFIES<br />ET ACCEPTES
                    </div>
                    <div className="text-[7px] space-y-0.5 mb-2 font-semibold">
                      <div>// Eraflure</div>
                      <div>✕ Bosse</div>
                      <div>□ Manque</div>
                    </div>
                  </div>
                  <table className="w-full border-collapse border border-black text-[6.5px] mb-1">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-black p-0.5">Nombre</th>
                        <th className="border border-black p-0.5">Paraphe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4].map(r => (
                        <tr key={r} className="h-3.5">
                          <td className="border border-black"></td>
                          <td className="border border-black"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ── RETOUR (Col 5/12) ── */}
                <div className="col-span-5 p-1.5">
                  <div className="font-black text-[9px] mb-0.5">RETOUR →</div>
                  <div className="text-[7.2px] font-bold mb-0.5 flex items-center justify-between">
                    <span>Véhicule En parfait état</span>
                    <span className="space-x-1">
                      <span>[ {endCond.length === 0 ? '✓' : ' '} ] Oui</span>
                      <span>[ {endCond.length > 0 ? '✓' : ' '} ] Non</span>
                    </span>
                  </div>
                  <p className="text-[6px] text-slate-500 italic mb-1">(Rayer la mention inutile)</p>
                  <p className="text-[6.5px] font-semibold leading-tight mb-1">
                    <strong>Commentaires</strong> (Positionner les numéros à l'endroit précis du dommage, sur la matrice à gauche)
                  </p>
                  <div className="space-y-0.5 text-[6.5px] mb-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="truncate">
                        {i} {endCond[i - 1]?.zone ? `· ${endCond[i - 1].zone}` : '.........................................................'}
                      </div>
                    ))}
                  </div>
                  {/* Car Diagram */}
                  <CarInspectionImage />
                </div>
              </div>
            </div>
>>>>>>> 24c7ca9 (maintanace contrat)
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

<<<<<<< HEAD
=======
// ── Helper Row Components ──

interface FieldRowProps {
  labelFr: string;
  value?: string;
  labelAr: string;
  thickDivider?: boolean;
  isBold?: boolean;
}

const FieldRow: React.FC<FieldRowProps> = ({ labelFr, value, labelAr, thickDivider, isBold }) => (
  <div
    className={`flex items-center justify-between px-1.5 py-0.5 text-[7.4px] ${
      thickDivider ? 'border-b-[1.5px] border-black' : 'border-b border-slate-300'
    }`}
  >
    <span className="w-[40%] font-bold text-slate-900 truncate">{labelFr}</span>
    <span className={`w-[36%] truncate text-black ${isBold ? 'font-black text-[8px]' : 'font-bold'}`}>
      {value || ''}
    </span>
    <span className="w-[24%] text-right font-bold text-slate-900 truncate" dir="rtl">
      {labelAr}
    </span>
  </div>
);

interface KmRowProps {
  labelAr: string;
  labelFr: string;
  digits: string[];
}

const KmRow: React.FC<KmRowProps> = ({ labelAr, labelFr, digits }) => (
  <div className="flex items-center justify-between text-[7px]">
    <div className="leading-tight">
      <span className="block font-bold text-slate-900" dir="rtl">{labelAr}</span>
      <span className="font-bold text-slate-800">{labelFr}</span>
    </div>
    <div className="flex gap-0.5">
      {digits.map((d, i) => (
        <span
          key={i}
          className="w-3.5 h-3.5 border border-black inline-flex items-center justify-center font-mono font-bold text-[8px] bg-white"
        >
          {d}
        </span>
      ))}
    </div>
  </div>
);

const CarInspectionImage: React.FC = () => (
  <div className="flex justify-center my-1">
    <img
      src="/car-inspection.png"
      alt="Inspection Véhicule"
      className="h-28 object-contain mx-auto"
      style={{ maxHeight: '115px' }}
    />
  </div>
);

function getPrintStyles(): string {
  return `
    @page { size: A4 portrait; margin: 4mm 6mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: 'Cairo', 'Montserrat', 'DejaVu Sans', Arial, Tahoma, sans-serif; font-size: 8px; color: #000; background: #fff; line-height: 1.25; }
    .page { width: 100%; max-width: 202mm; margin: 0 auto; padding: 2mm 0; }

    /* HEADER */
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 2mm; }
    .header-table td { vertical-align: top; }
    .header-left { width: 44%; padding-right: 8px; }
    .header-logo-wrap { text-align: center; margin-bottom: 2px; }
    .header-logo-img { max-width: 100%; max-height: 38px; object-fit: contain; }
    .company-title { font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #111; text-align: center; text-transform: uppercase; }
    .company-addr { font-size: 7.5px; font-weight: 600; color: #222; text-align: center; margin-top: 1px; }
    .company-tel { font-size: 8px; font-weight: 700; color: #111; text-align: center; margin-top: 1px; }
    .header-right { width: 56%; padding-left: 6px; border-left: 1px solid #ccc; }
    .rlv-brand { font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 900; color: #e11d48; letter-spacing: 0.5px; display: inline-block; }
    .rlv-sub { font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 700; color: #111; margin-left: 4px; }
    .legal-ar { font-size: 6.5px; color: #222; direction: rtl; text-align: justify; line-height: 1.25; font-weight: 600; margin-top: 2px; font-family: 'Cairo', Tahoma, sans-serif; }
    .legal-fr { font-size: 5.8px; color: #333; text-align: justify; line-height: 1.15; margin-top: 2px; }

    /* TITLE BAR */
    .title-bar { width: 100%; border: 1.5px solid #000; background: #fff; padding: 3px 10px; margin-bottom: 2mm; display: table; }
    .title-cell-fr { display: table-cell; width: 35%; font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 800; vertical-align: middle; }
    .title-cell-ar { display: table-cell; width: 35%; font-family: 'Cairo', sans-serif; font-size: 14px; font-weight: 900; text-align: center; direction: rtl; vertical-align: middle; }
    .title-cell-num { display: table-cell; width: 30%; text-align: right; vertical-align: middle; }
    .num-red { color: #b91c1c; font-size: 11px; font-weight: 900; margin-right: 4px; }
    .num-box { display: inline-block; border: 1.5px solid #000; padding: 1px 8px; font-size: 11px; font-weight: 800; font-family: monospace; background: #fafafa; }

    /* MAIN 2-COLUMN TABLE */
    .main-table { width: 100%; border-collapse: collapse; border: 1.5px solid #000; margin-bottom: 2mm; }
    .col-cell { vertical-align: top; padding: 0; }
    .col-left { width: 50%; border-right: 1.5px solid #000; }
    .col-right { width: 50%; }

    /* FIELD ROWS */
    .row-item { width: 100%; border-bottom: 1px solid #777; display: table; table-layout: fixed; min-height: 14px; }
    .row-item:last-child { border-bottom: none; }
    .row-lbl-fr { display: table-cell; width: 38%; padding: 1.5px 3px; font-size: 7.2px; font-weight: 700; vertical-align: middle; color: #000; }
    .row-val { display: table-cell; width: 34%; padding: 1.5px 2px; font-size: 7.8px; font-weight: 800; color: #000; vertical-align: middle; }
    .row-lbl-ar { display: table-cell; width: 28%; padding: 1.5px 3px; font-size: 7.4px; font-weight: 700; direction: rtl; text-align: right; vertical-align: middle; font-family: 'Cairo', Tahoma, sans-serif; color: #000; }
    .sep-thick { border-bottom: 1.5px solid #000 !important; }

    /* DATES TABLE */
    .date-grid { width: 100%; border-collapse: collapse; border-bottom: 1.5px solid #000; }
    .date-grid th, .date-grid td { border: 1px solid #777; padding: 1.5px 2px; text-align: center; font-size: 7.5px; }
    .date-grid th { background: #f1f5f9; font-weight: 800; font-size: 8px; }
    .date-grid td.date-lbl { text-align: left; padding-left: 4px; padding-right: 4px; width: 52%; }
    .date-grid td.date-cell { width: 12%; font-weight: 800; font-family: monospace; }
    .lbl-dual { display: flex; justify-content: space-between; align-items: center; }
    .lbl-dual .fr { font-weight: 700; font-size: 7.2px; }
    .lbl-dual .ar { font-weight: 700; font-size: 7.4px; direction: rtl; font-family: 'Cairo', sans-serif; }

    /* KILOMETRAGE */
    .km-section { width: 100%; border-bottom: 1.5px solid #000; padding: 2px 3px; }
    .km-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px; }
    .km-row:last-child { margin-bottom: 0; }
    .km-label-box { font-size: 6.8px; font-weight: 700; line-height: 1.15; flex: 1; }
    .km-label-box .ar { display: block; direction: rtl; font-size: 7px; font-weight: 700; font-family: 'Cairo', sans-serif; }
    .km-digits { display: flex; gap: 1px; }
    .km-digit-cell { width: 13px; height: 13px; border: 1px solid #000; text-align: center; line-height: 12px; font-size: 8px; font-weight: 800; font-family: monospace; background: #fff; }

    /* CONDUCTEUR SUPPLEMENTAIRE */
    .supp-header { background: #f1f5f9; border-bottom: 1px solid #000; padding: 2px 4px; display: flex; justify-content: space-between; align-items: center; }
    .supp-title-fr { font-size: 7.8px; font-weight: 800; text-transform: uppercase; }
    .supp-title-ar { font-size: 8px; font-weight: 800; direction: rtl; font-family: 'Cairo', sans-serif; }

    /* PAYMENT & TOTALS */
    .bottom-table { width: 100%; border-collapse: collapse; border: 1.5px solid #000; margin-bottom: 2mm; }
    .pay-header { background: #f1f5f9; border-bottom: 1px solid #777; padding: 2px 5px; display: flex; justify-content: space-between; font-weight: 800; font-size: 8px; }
    .pay-item { display: flex; justify-content: space-between; align-items: center; padding: 1.5px 4px; border-bottom: 1px dotted #ccc; font-size: 7.5px; }
    .chk-box { display: inline-block; width: 10px; height: 10px; border: 1px solid #000; vertical-align: middle; text-align: center; line-height: 9px; font-size: 8px; font-weight: bold; margin-right: 3px; }
    .terms-box { padding: 3px 4px; font-size: 6.2px; line-height: 1.25; border-top: 1px solid #777; }
    .terms-ar { direction: rtl; text-align: right; font-family: 'Cairo', sans-serif; font-weight: 700; margin-top: 1px; font-size: 6.8px; }
    .sig-client-row { padding: 2px 4px; border-top: 1px solid #777; display: flex; justify-content: space-between; align-items: center; font-size: 7.5px; font-weight: 800; }
    .sig-client-area { min-height: 28px; text-align: center; padding: 2px; }
    .tot-row { display: flex; justify-content: space-between; align-items: center; padding: 2.5px 6px; border-bottom: 1px solid #777; font-size: 7.8px; }
    .tot-row.grand { font-weight: 900; font-size: 8.5px; border-bottom: 1.5px solid #000; background: #fafafa; }
    .fait-tanger { padding: 3px 6px; font-size: 7.5px; font-weight: 700; border-bottom: 1px solid #777; }
    .resp-area { padding: 2px 6px; text-align: center; }
    .resp-title { font-size: 7.5px; font-weight: 800; margin-bottom: 1px; }
    .resp-sig-box { min-height: 26px; }

    /* INSPECTION VEHICLE */
    .insp-table { width: 100%; border-collapse: collapse; border: 1.5px solid #000; }
    .insp-cell { vertical-align: top; padding: 3px; }
    .insp-depart { width: 37%; border-right: 1px solid #000; }
    .insp-damages { width: 26%; border-right: 1px solid #000; padding: 2px; }
    .insp-retour { width: 37%; }
    .insp-arrow-head { font-size: 8.5px; font-weight: 900; letter-spacing: 0.5px; margin-bottom: 1px; }
    .insp-etat { font-size: 7px; font-weight: 700; }
    .insp-oui-non { display: inline-flex; gap: 4px; margin-left: 3px; }
    .insp-notice { font-size: 6px; color: #555; font-style: italic; margin-bottom: 2px; }
    .insp-comm-title { font-size: 6.2px; font-weight: 600; line-height: 1.15; margin-bottom: 2px; }
    .line-dots { font-size: 6.5px; color: #333; line-height: 1.35; }
    .car-svg-wrap { text-align: center; margin: 2px 0; }
    .dmg-table { width: 100%; border-collapse: collapse; font-size: 6.5px; margin-top: 3px; }
    .dmg-table th, .dmg-table td { border: 1px solid #777; padding: 1.5px; text-align: center; height: 12px; }
    .dmg-table th { background: #f1f5f9; font-weight: 800; font-size: 6.8px; }

    @media print {
      body { margin: 0; padding: 0; }
      .page { padding: 0; }
    }
}

export default RlvContractModal;
