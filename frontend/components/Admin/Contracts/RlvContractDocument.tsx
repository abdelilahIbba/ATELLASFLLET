import React from 'react';

export interface RlvContractData {
  id?: string | number;
  contract_number?: string;
  booking_id?: string | number;
  client_name?: string;
  client_phone?: string;
  client_email?: string;
  client_id_number?: string;
  client_license_number?: string;
  client_license_expiry?: string;
  client_address?: string;
  client_nationality?: string;
  vehicle_name?: string;
  vehicle_plate?: string;
  unit_number?: number;
  start_date?: string;
  end_date?: string;
  daily_rate?: number;
  total_amount?: number;
  deposit_amount?: number;
  currency?: string;
  insurance_type?: string;
  mileage_start?: number;
  mileage_end?: number;
  condition_start?: any[];
  condition_end?: any[];
  booking_payment_status?: string;
  signature_client_start?: string;
  signature_agent_start?: string;
  signature_client_end?: string;
  signature_agent_end?: string;
  signature_city?: string;
  created_at?: string;
}

interface RlvContractDocumentProps {
  contract: RlvContractData;
  documentRef?: React.RefObject<HTMLDivElement>;
}

export const RlvContractDocument: React.FC<RlvContractDocumentProps> = ({ contract, documentRef }) => {
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
  const formattedContractNum = cleanNumber ? cleanNumber.padStart(5, '0') : contract.contract_number || '00039';

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

  return (
    <div
      ref={documentRef}
      className="rlv-sheet bg-white text-black p-3 sm:p-5 mx-auto text-[7.4px] leading-tight select-text"
      style={{
        width: '100%',
        maxWidth: '200mm',
        minHeight: '280mm',
        maxHeight: '285mm',
        boxSizing: 'border-box',
        fontFamily: "'Cairo', 'Montserrat', Arial, sans-serif",
      }}
    >
      {/* ══ HEADER ══ */}
      <div className="grid grid-cols-12 gap-2 mb-1.5 pb-1 border-b border-black">
        {/* Left: Logo & Company Address */}
        <div className="col-span-5 text-center pr-2 flex flex-col justify-between">
          <div className="flex flex-col items-center">
            <img
              src="/rlv-emblem.png"
              alt="Logo RLV"
              className="h-11 object-contain mx-auto mb-0.5"
              onError={e => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <h1 className="font-black text-[9.5px] tracking-wider uppercase text-black leading-tight">
              RAHIMI LOCATION DE VOITURE
            </h1>
            <p className="text-[6.8px] font-semibold text-black mt-0.5">
              LOT EL NAHDA RUE 37 N°12 BLOC38, Tanger
            </p>
            <p className="text-[7.2px] font-bold text-black mt-0.5">
              Tel: 06 77 81 37 18 / 07 77 57 33 79
            </p>
          </div>
        </div>

        {/* Right: Brand Title + Legal Notices */}
        <div className="col-span-7 pl-2 border-l border-black flex flex-col justify-between">
          <div className="text-center mb-0.5 flex items-center justify-center gap-1.5">
            <span className="font-black text-[17px] text-rose-600 tracking-wider">RLV</span>
            <span className="font-bold text-[13px] text-black">Location de voiture</span>
          </div>
          <p className="text-[6.6px] text-black text-justify font-bold leading-tight mb-1" dir="rtl">
            المكتري للسيارة يتابع قضائيا 24 ساعة بعد انتهاء العقد وفي حالة تمديد المدة يجب اخبار شركة R.L.V وأداء مبلغ المدة الاضافية ويبقى المكتري هو المسؤول الوحيد عن أي حادثة بعد تمديد دون اشعار الشركة للمكتري الصلاحية في قيادة السيارة لا غير ولا يسمح له بتسليمها لشخص اخر
          </p>
          <p className="text-[5.9px] text-black text-justify leading-tight">
            Le Locataire s'expose à des poursuites juridiques 24 heures après la date convenu au départ si le véhicule n'est toujours pas retourné et cela sans que RANDA CAR ait été informé d'un prolongation de location et ait reçue la somme supplémentaire due.<br/>
            - En cas de Forfait, le locataire est responsable de tous dégâts matériels d'après la deuxième signature .<br/>
            - Le véhicule ne doit être conduit que par le locataire.
          </p>
        </div>
      </div>

      {/* ══ TITLE BANNER ══ */}
      <div className="border-[1.5px] border-black px-3 py-0.5 mb-1 flex items-center justify-between bg-slate-50/60">
        <span className="font-black text-[12px] text-black uppercase tracking-wide">
          Contrat de Location
        </span>
        <span className="font-black text-[13.5px] text-black" dir="rtl">
          عقـــــد الكـــــراء
        </span>
        <div className="flex items-center">
          <span className="text-rose-700 font-black text-[12px] mr-1">
            Nº
          </span>
          <span className="border-[1.5px] border-black px-2 py-0.2 font-mono font-black text-[11.5px] bg-white">
            {formattedContractNum}
          </span>
        </div>
      </div>

      {/* ══ MAIN TWO-COLUMN GRID ══ */}
      <div className="grid grid-cols-2 border-[1.5px] border-black mb-1">
        {/* ── LEFT COLUMN : VEHICULE & CLIENT ── */}
        <div className="border-r-[1.5px] border-black">
          {/* Vehicle fields */}
          <FieldRow labelFr="Marque :" value={contract.vehicle_name} labelAr="نوع" />
          <FieldRow labelFr="N° Immatriculation :" value={contract.vehicle_plate} labelAr="رقم التسجيل" />
          <FieldRow labelFr="Lieu de Ivraison :" value={contract.signature_city || 'Tanger'} labelAr="مكان التسجيل" />
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
          <table className="w-full border-collapse border-b-[1.5px] border-black text-[7.2px]">
            <thead>
              <tr className="bg-slate-100 border-b border-black">
                <th className="border-r border-black p-0.5 text-left w-1/2"></th>
                <th className="border-r border-black p-0.5 text-center w-[12%] font-black">J</th>
                <th className="border-r border-black p-0.5 text-center w-[12%] font-black">M</th>
                <th className="border-r border-black p-0.5 text-center w-[13%] font-black">A</th>
                <th className="p-0.5 text-center w-[13%] font-black">H</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-300">
                <td className="border-r border-black px-1 py-0.5 flex justify-between">
                  <span className="font-bold">Départ</span>
                  <span className="font-bold" dir="rtl">الانطلاق</span>
                </td>
                <td className="border-r border-black p-0.5 text-center font-mono font-bold">{depJ}</td>
                <td className="border-r border-black p-0.5 text-center font-mono font-bold">{depM}</td>
                <td className="border-r border-black p-0.5 text-center font-mono font-bold">{depA}</td>
                <td className="p-0.5 text-center font-mono font-bold">{depH}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="border-r border-black px-1 py-0.5 flex justify-between">
                  <span className="font-bold">Retour Prevu</span>
                  <span className="font-bold" dir="rtl">الرجوع الموقع</span>
                </td>
                <td className="border-r border-black p-0.5 text-center font-mono font-bold">{retJ}</td>
                <td className="border-r border-black p-0.5 text-center font-mono font-bold">{retM}</td>
                <td className="border-r border-black p-0.5 text-center font-mono font-bold">{retA}</td>
                <td className="p-0.5 text-center font-mono font-bold">{retH}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="border-r border-black px-1 py-0.5 flex justify-between">
                  <span className="font-bold">Retour Définitif</span>
                  <span className="font-bold" dir="rtl">الرجوع النهائي</span>
                </td>
                <td className="border-r border-black p-0.5 text-center font-mono font-bold"></td>
                <td className="border-r border-black p-0.5 text-center font-mono font-bold"></td>
                <td className="border-r border-black p-0.5 text-center font-mono font-bold"></td>
                <td className="p-0.5 text-center font-mono font-bold"></td>
              </tr>
              <tr>
                <td className="border-r border-black px-1 py-0.5 flex justify-between">
                  <span className="font-bold">Durée</span>
                  <span className="font-bold" dir="rtl">المدة</span>
                </td>
                <td colSpan={4} className="p-0.5 text-center font-bold bg-slate-50">
                  {days} Jour{days > 1 ? 's' : ''} / {days} أيام
                </td>
              </tr>
            </tbody>
          </table>

          {/* Kilométrage Segmented Section */}
          <div className="p-1 border-b-[1.5px] border-black space-y-0.5 bg-white">
            <KmRow labelAr="عدد الكيلومترات عند الرجوع" labelFr="KILOMETRAGE RETOUR:" digits={kmRet} />
            <KmRow labelAr="عدد الكيلومترات عند الذهاب" labelFr="KILOMETRAGE DEPART:" digits={kmDep} />
            <KmRow labelAr="عدد الكيلومترات المقطوعة" labelFr="KILOMETRAGE PARCOURU:" digits={kmPar} />
          </div>

          {/* Le Conducteur Supplémentaire */}
          <div className="bg-slate-100 border-b border-black px-1.5 py-0.5 flex justify-between font-bold text-[7.2px]">
            <span className="uppercase tracking-wider">Le Conducteur Supplémentaire</span>
            <span dir="rtl">السائق المرخـص</span>
          </div>
          <FieldRow labelFr="Nom &amp; Prénom :" value="" labelAr="الاسم الشخصي و العائلي" />
          <FieldRow labelFr="Permis de conduire N° :" value="" labelAr="رخصة السياقة رقم" />
          <FieldRow labelFr="Délivré à :" value="" labelAr="إصدارها في" />
          <FieldRow labelFr="Passeport N° :" value="" labelAr="رقم جواز السفر" />
          <FieldRow labelFr="C.I.N n° :" value="" labelAr="البطاقة الوطنية" />
        </div>
      </div>

      {/* ══ PAIEMENT & CONDITIONS & TOTALS ══ */}
      <div className="grid grid-cols-2 border-[1.5px] border-black mb-1">
        {/* Left: Paiement + Terms + Signature client */}
        <div className="border-r-[1.5px] border-black flex flex-col justify-between">
          <div>
            <div className="bg-slate-100 border-b border-black px-1.5 py-0.5 flex justify-between font-bold text-[7.2px]">
              <span>Paiement</span>
              <span dir="rtl">الأداء</span>
            </div>

            <div className="p-1 space-y-0.5 text-[6.8px]">
              <div className="flex items-center justify-between border-b border-slate-200 py-0.5">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 border border-black inline-flex items-center justify-center font-bold text-[7px]">
                    {contract.booking_payment_status === 'paid' ? '✓' : ''}
                  </span>
                  <span>* Espèce :</span>
                </div>
                <span className="font-bold" dir="rtl">نقدا</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 py-0.5">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 border border-black inline-flex items-center justify-center"></span>
                  <span>* Chèque :</span>
                </div>
                <span className="font-bold" dir="rtl">شيكا</span>
              </div>

              <div className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 border border-black inline-flex items-center justify-center font-bold text-[7px]">
                    {(contract.deposit_amount || 0) > 0 ? '✓' : ''}
                  </span>
                  <span>* Caution :</span>
                  {(contract.deposit_amount || 0) > 0 && (
                    <strong className="ml-1">{contract.deposit_amount?.toFixed(2)} Dh</strong>
                  )}
                </div>
                <span className="font-bold" dir="rtl">ضمانة</span>
              </div>
            </div>

            {/* Conditions acknowledgement */}
            <div className="border-t border-black p-1 text-[6.2px] leading-snug">
              <p>
                Je reconnais avoir pris Connaissance des présentes conditions générales ( recto verso ) que je m 'engage à les respecter
              </p>
              <p className="font-bold mt-0.5 text-right text-[6.6px]" dir="rtl">
                اعترف بعلمي الكامل للقانون العام لكراء السيارات في ظهر هذا العقد والتزم باحترامه
              </p>
            </div>
          </div>

          <div>
            {/* Client Signature */}
            <div className="border-t border-black px-1.5 py-0.5 flex justify-between font-bold text-[7.2px] bg-slate-50">
              <span>Signature de Client</span>
              <span dir="rtl">إمضاء الزبون</span>
            </div>
            <div className="h-9 flex items-center justify-center p-0.5">
              {contract.signature_client_start ? (
                <img
                  src={contract.signature_client_start}
                  alt="Signature Client"
                  className="max-h-8 max-w-[120px] object-contain"
                />
              ) : (
                <span className="text-slate-300 text-[8px] italic">Signature</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Totals + Fait à Tanger + Le Responsable */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-300 px-1.5 py-0.5 flex justify-between text-[7.2px]">
              <span>Total Hors Taxe</span>
              <span className="font-bold">{totalHT.toFixed(2)} Dh</span>
            </div>
            <div className="border-b border-slate-300 px-1.5 py-0.5 flex justify-between text-[7.2px]">
              <span>Taxe TVA 20%</span>
              <span className="font-bold">{tvaAmount.toFixed(2)} Dh</span>
            </div>
            <div className="border-b-[1.5px] border-black px-1.5 py-0.5 flex justify-between text-[8px] font-black bg-slate-50">
              <span>TOTAL DE LOCATION</span>
              <span>{totalTTC.toFixed(2)} Dh</span>
            </div>

            <div className="border-b border-black px-1.5 py-0.5 text-[7.2px] font-bold">
              Fait à Tanger le : <span className="font-extrabold">{startDate.toLocaleDateString('fr-FR')}</span>
            </div>
          </div>

          <div className="p-0.5 text-center">
            <p className="font-bold text-[7.2px] mb-0.5">Le responsable</p>
            <div className="h-9 flex items-center justify-center">
              {contract.signature_agent_start ? (
                <img
                  src={contract.signature_agent_start}
                  alt="Signature Responsable"
                  className="max-h-8 max-w-[100px] object-contain"
                />
              ) : (
                <div className="w-20 border-b border-slate-400 mt-5"></div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══ VEHICLE INSPECTION (BOTTOM) ══ */}
      <div className="grid grid-cols-12 border-[1.5px] border-black">
        {/* ── DÉPART (Col 5/12) ── */}
        <div className="col-span-5 p-1 border-r border-black flex flex-col justify-between">
          <div>
            <div className="font-black text-[8.5px] mb-0.5 flex items-center gap-1">
              <span>←</span>
              <span>DEPART</span>
            </div>
            <div className="text-[6.8px] font-bold mb-0.5 flex items-center justify-between">
              <span>Véhicule En parfait état</span>
              <span className="space-x-1">
                <span>[ {startCond.length === 0 ? '✓' : ' '} ] Oui</span>
                <span>[ {startCond.length > 0 ? '✓' : ' '} ] Non</span>
              </span>
            </div>
            <p className="text-[5.5px] text-slate-600 italic mb-0.5">(Rayer la mention inutile)</p>
            <p className="text-[6px] font-semibold leading-tight mb-0.5">
              <strong>Commentaires</strong> (Positionner les numeros a l'endroit précis du dommage, sur la matrice a gauche)
            </p>
            <div className="space-y-0.5 text-[6px] mb-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="truncate">
                  {i} {startCond[i - 1]?.label ? `· ${startCond[i - 1].label}` : '.........................................................'}
                </div>
              ))}
            </div>
          </div>
          {/* Car Diagram */}
          <CarInspectionImage />
        </div>

        {/* ── DOMMAGES IDENTIFIÉS ET ACCEPTÉS (Col 2/12) ── */}
        <div className="col-span-2 p-1 border-r border-black flex flex-col justify-between">
          <div>
            <div className="font-black text-[6.8px] text-center border-b border-black pb-0.5 mb-1 leading-tight uppercase">
              DOMMAGE IDENTIFIES<br />ET ACCEPTE
            </div>
            <div className="text-[6.5px] space-y-0.5 mb-1.5 font-bold">
              <div>// Eraflure</div>
              <div>✕ Bosse</div>
              <div>□ Manque</div>
            </div>
          </div>
          <table className="w-full border-collapse border border-black text-[6.2px] mb-0.5">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-black p-0.5 font-black">Nombre</th>
                <th className="border border-black p-0.5 font-black">Paraphe</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map(r => (
                <tr key={r} className="h-3">
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── RETOUR (Col 5/12) ── */}
        <div className="col-span-5 p-1 flex flex-col justify-between">
          <div>
            <div className="font-black text-[8.5px] mb-0.5 flex items-center justify-end gap-1">
              <span>RETOUR</span>
              <span>→</span>
            </div>
            <div className="text-[6.8px] font-bold mb-0.5 flex items-center justify-between">
              <span>Véhicule En parfait état</span>
              <span className="space-x-1">
                <span>[ {endCond.length === 0 ? '✓' : ' '} ] Oui</span>
                <span>[ {endCond.length > 0 ? '✓' : ' '} ] Non</span>
              </span>
            </div>
            <p className="text-[5.5px] text-slate-600 italic mb-0.5">(Rayer la mention inutile)</p>
            <p className="text-[6px] font-semibold leading-tight mb-0.5">
              <strong>Commentaires</strong> (Positionner les numeros a l'endroit précis du dommage, sur la matrice a gauche)
            </p>
            <div className="space-y-0.5 text-[6px] mb-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="truncate">
                  {i} {endCond[i - 1]?.label ? `· ${endCond[i - 1].label}` : '.........................................................'}
                </div>
              ))}
            </div>
          </div>
          {/* Car Diagram */}
          <CarInspectionImage />
        </div>
      </div>
    </div>
  );
};

// ── Sub-components ──

interface FieldRowProps {
  labelFr: string;
  value?: string;
  labelAr: string;
  thickDivider?: boolean;
  isBold?: boolean;
}

const FieldRow: React.FC<FieldRowProps> = ({ labelFr, value, labelAr, thickDivider, isBold }) => (
  <div
    className={`flex items-center justify-between px-1.5 py-0.5 text-[7px] ${
      thickDivider ? 'border-b-[1.5px] border-black' : 'border-b border-slate-300'
    }`}
  >
    <span className="w-[40%] font-bold text-black truncate">{labelFr}</span>
    <span className={`w-[36%] truncate text-black ${isBold ? 'font-black text-[7.5px]' : 'font-bold'}`}>
      {value || ''}
    </span>
    <span className="w-[24%] text-right font-bold text-black truncate" dir="rtl">
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
  <div className="flex items-center justify-between text-[6.8px]">
    <div className="leading-tight">
      <span className="block font-bold text-black" dir="rtl">{labelAr}</span>
      <span className="font-bold text-black">{labelFr}</span>
    </div>
    <div className="flex gap-0.5">
      {digits.map((d, i) => (
        <span
          key={i}
          className="w-3 h-3 border border-black inline-flex items-center justify-center font-mono font-bold text-[7.5px] bg-white text-black"
        >
          {d}
        </span>
      ))}
    </div>
  </div>
);

const CarInspectionImage: React.FC = () => (
  <div className="flex justify-center my-0.5">
    <img
      src="/car-inspection.png"
      alt="Inspection Véhicule"
      className="h-24 object-contain mx-auto"
      style={{ maxHeight: '95px' }}
    />
  </div>
);

export function getRlvPrintStyles(): string {
  return `
    @page {
      size: A4 portrait;
      margin: 5mm 6mm;
    }
    *, *::before, *::after {
      box-sizing: border-box !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif !important;
      font-size: 7.4px !important;
      color: #000 !important;
      background: #fff !important;
      line-height: 1.18 !important;
    }
    .rlv-sheet {
      width: 196mm !important;
      max-width: 196mm !important;
      min-height: auto !important;
      max-height: none !important;
      padding: 2mm 3mm !important;
      margin: 0 auto !important;
      overflow: visible !important;
      page-break-inside: avoid !important;
      background: #fff !important;
      color: #000 !important;
    }
    /* ── CSS Grid replicas ── */
    .grid { display: grid !important; }
    .grid-cols-2 { grid-template-columns: 1fr 1fr !important; }
    .grid-cols-12 { grid-template-columns: repeat(12, 1fr) !important; }
    .col-span-2 { grid-column: span 2 / span 2 !important; }
    .col-span-5 { grid-column: span 5 / span 5 !important; }
    .col-span-7 { grid-column: span 7 / span 7 !important; }
    /* ── Flex utilities ── */
    .flex { display: flex !important; }
    .inline-flex { display: inline-flex !important; }
    .flex-col { flex-direction: column !important; }
    .flex-wrap { flex-wrap: wrap !important; }
    .flex-1 { flex: 1 1 0% !important; }
    .flex-shrink-0 { flex-shrink: 0 !important; }
    .items-center { align-items: center !important; }
    .items-start { align-items: flex-start !important; }
    .justify-between { justify-content: space-between !important; }
    .justify-center { justify-content: center !important; }
    .justify-end { justify-content: flex-end !important; }
    /* ── Gaps & Spacing ── */
    .gap-0\.5 { gap: 1px !important; }
    .gap-1 { gap: 2px !important; }
    .gap-1\.5 { gap: 3px !important; }
    .gap-2 { gap: 4px !important; }
    .space-x-1 > * + * { margin-left: 2px !important; }
    .space-y-0\.5 > * + * { margin-top: 1px !important; }
    .mx-auto { margin-left: auto !important; margin-right: auto !important; }
    .mb-0\.5 { margin-bottom: 1px !important; }
    .mb-1 { margin-bottom: 2px !important; }
    .mb-1\.5 { margin-bottom: 3px !important; }
    .mt-0\.5 { margin-top: 1px !important; }
    .mt-5 { margin-top: 12px !important; }
    .ml-1 { margin-left: 2px !important; }
    .mr-1 { margin-right: 2px !important; }
    .my-0\.5 { margin-top: 1px !important; margin-bottom: 1px !important; }
    .p-0\.5 { padding: 1px !important; }
    .p-1 { padding: 2px !important; }
    .p-1\.5 { padding: 3px !important; }
    .px-1 { padding-left: 2px !important; padding-right: 2px !important; }
    .px-1\.5 { padding-left: 3px !important; padding-right: 3px !important; }
    .px-2 { padding-left: 4px !important; padding-right: 4px !important; }
    .px-3 { padding-left: 6px !important; padding-right: 6px !important; }
    .py-0\.5 { padding-top: 1px !important; padding-bottom: 1px !important; }
    .py-0\.2 { padding-top: 0.5px !important; padding-bottom: 0.5px !important; }
    .pb-1 { padding-bottom: 2px !important; }
    /* ── Sizing ── */
    .w-full { width: 100% !important; }
    .w-1\/2 { width: 50% !important; }
    .w-\[40\%\] { width: 40% !important; }
    .w-\[36\%\] { width: 36% !important; }
    .w-\[24\%\] { width: 24% !important; }
    .w-\[12\%\] { width: 12% !important; }
    .w-\[13\%\] { width: 13% !important; }
    .w-2\.5 { width: 6px !important; }
    .w-3 { width: 7px !important; }
    .w-20 { width: 48px !important; }
    .h-2\.5 { height: 6px !important; }
    .h-3 { height: 7px !important; }
    .h-9 { height: 22px !important; }
    .h-11 { height: 26px !important; }
    .h-24 { height: 58px !important; }
    .max-h-8 { max-height: 20px !important; }
    .max-w-\[120px\] { max-width: 120px !important; }
    .max-w-\[100px\] { max-width: 100px !important; }
    .min-w-0 { min-width: 0 !important; }
    /* ── Typography ── */
    .font-black { font-weight: 900 !important; }
    .font-extrabold { font-weight: 800 !important; }
    .font-bold { font-weight: 700 !important; }
    .font-semibold { font-weight: 600 !important; }
    .font-mono { font-family: 'Courier New', Courier, monospace !important; }
    .text-left { text-align: left !important; }
    .text-center { text-align: center !important; }
    .text-right { text-align: right !important; }
    .text-justify { text-align: justify !important; }
    .tracking-wider { letter-spacing: 0.05em !important; }
    .tracking-wide { letter-spacing: 0.025em !important; }
    .uppercase { text-transform: uppercase !important; }
    .leading-tight { line-height: 1.25 !important; }
    .leading-snug { line-height: 1.375 !important; }
    .truncate { overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; }
    .italic { font-style: italic !important; }
    .select-text { user-select: text !important; }
    /* ── Font sizes ── */
    .text-\[5\.5px\] { font-size: 5.5px !important; }
    .text-\[5\.9px\] { font-size: 5.9px !important; }
    .text-\[6px\] { font-size: 6px !important; }
    .text-\[6\.2px\] { font-size: 6.2px !important; }
    .text-\[6\.5px\] { font-size: 6.5px !important; }
    .text-\[6\.6px\] { font-size: 6.6px !important; }
    .text-\[6\.8px\] { font-size: 6.8px !important; }
    .text-\[7px\] { font-size: 7px !important; }
    .text-\[7\.2px\] { font-size: 7.2px !important; }
    .text-\[7\.5px\] { font-size: 7.5px !important; }
    .text-\[8px\] { font-size: 8px !important; }
    .text-\[8\.5px\] { font-size: 8.5px !important; }
    .text-\[9\.5px\] { font-size: 9.5px !important; }
    .text-\[11\.5px\] { font-size: 11.5px !important; }
    .text-\[12px\] { font-size: 12px !important; }
    .text-\[13px\] { font-size: 13px !important; }
    .text-\[13\.5px\] { font-size: 13.5px !important; }
    .text-\[17px\] { font-size: 17px !important; }
    /* ── Colors ── */
    .text-black { color: #000 !important; }
    .text-white { color: #fff !important; }
    .text-rose-600 { color: #e11d48 !important; }
    .text-rose-700 { color: #be123c !important; }
    .text-slate-300 { color: #cbd5e1 !important; }
    .text-slate-400 { color: #94a3b8 !important; }
    .text-slate-600 { color: #475569 !important; }
    /* ── Backgrounds ── */
    .bg-white { background-color: #fff !important; }
    .bg-slate-50 { background-color: #f8fafc !important; }
    .bg-slate-50\/60 { background-color: rgba(248,250,252,0.6) !important; }
    .bg-slate-100 { background-color: #f1f5f9 !important; }
    /* ── Borders ── */
    .border { border-width: 1px !important; border-style: solid !important; }
    .border-b { border-bottom-width: 1px !important; border-bottom-style: solid !important; }
    .border-t { border-top-width: 1px !important; border-top-style: solid !important; }
    .border-r { border-right-width: 1px !important; border-right-style: solid !important; }
    .border-l { border-left-width: 1px !important; border-left-style: solid !important; }
    .border-black { border-color: #000 !important; }
    .border-slate-200 { border-color: #e2e8f0 !important; }
    .border-slate-300 { border-color: #cbd5e1 !important; }
    .border-slate-400 { border-color: #94a3b8 !important; }
    .border-\[1\.5px\] { border-width: 1.5px !important; border-style: solid !important; }
    .border-b-\[1\.5px\] { border-bottom: 1.5px solid !important; }
    .border-r-\[1\.5px\] { border-right: 1.5px solid !important; }
    .border-collapse { border-collapse: collapse !important; }
    /* ── Object & Images ── */
    .object-contain { object-fit: contain !important; }
    img { max-width: 100% !important; }
    /* ── Overflow ── */
    .overflow-hidden { overflow: hidden !important; }
    /* ── Border radius ── */
    .rounded-full { border-radius: 9999px !important; }
    /* ── RTL support ── */
    [dir="rtl"] { direction: rtl !important; unicode-bidi: embed !important; }
    /* ── Table defaults ── */
    table { width: 100% !important; border-collapse: collapse !important; }
    th, td { vertical-align: middle !important; }
  `;
}

export default RlvContractDocument;
