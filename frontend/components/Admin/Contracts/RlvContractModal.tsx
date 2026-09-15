import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, Download, X, RefreshCw, CheckCircle2, ShieldCheck, FileText } from 'lucide-react';
import type { Contract } from './ContractManagement';

interface RlvContractModalProps {
  contract: Contract;
  onClose: () => void;
}

const RlvContractModal: React.FC<RlvContractModalProps> = ({ contract, onClose }) => {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const printContentRef = useRef<HTMLDivElement>(null);

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

  // Print function (opens formatted printable window)
  const handlePrint = () => {
    if (!printContentRef.current) return;
    const printWindow = window.open('', '', 'width=950,height=900');
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html lang="ar" dir="ltr">
<head>
  <meta charset="UTF-8">
  <title>Contrat RLV — ${contract.contract_number}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Montserrat:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    @page { size: A4 portrait; margin: 4mm 6mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: 'Cairo', 'Montserrat', Arial, sans-serif; font-size: 8px; color: #000; background: #fff; line-height: 1.25; }
    .page-container { width: 100%; max-width: 200mm; margin: 0 auto; }
    ${getPrintStyles()}
  </style>
</head>
<body>
  <div class="page-container">
    ${printContentRef.current.innerHTML}
  </div>
</body>
</html>`);

    printWindow.document.close();
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 400);
    };
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 800);
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
            <div
              ref={printContentRef}
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
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

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
    .border-\\[1\\.5px\\] { border-width: 1.5px !important; }
    .border-black { border-color: #000 !important; }
    .grid { display: flex !important; flex-wrap: wrap !important; }
    .grid-cols-2 > div { width: 50% !important; }
    .grid-cols-12 > .col-span-5 { width: 41.66% !important; }
    .grid-cols-12 > .col-span-7 { width: 58.33% !important; }
    .grid-cols-12 > .col-span-2 { width: 16.66% !important; }
    table { width: 100% !important; border-collapse: collapse !important; }
  `;
}

export default RlvContractModal;
