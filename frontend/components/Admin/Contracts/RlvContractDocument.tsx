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
  client_date_of_birth?: string;
  client_profession?: string;
  client_address?: string;
  client_address_abroad?: string;
  client_nationality?: string;
  client_passport_number?: string;
  client_passport_issued_at?: string;
  client_passport_issued_date?: string;
  driver_name?: string;
  driver_phone?: string;
  driver_id_number?: string;
  driver_permit_number?: string;
  driver_passport_number?: string;
  vehicle_name?: string;
  vehicle_plate?: string;
  vehicle_color?: string;
  vehicle_vin?: string;
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
  fuel_level_start?: string;
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
  const formattedContractNum = cleanNumber ? cleanNumber.padStart(5, '0') : contract.contract_number || '00151';

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

  const licenseExpFormatted = contract.client_license_expiry
    ? new Date(contract.client_license_expiry).toLocaleDateString('fr-FR')
    : '';

  const dobFormatted = contract.client_date_of_birth
    ? new Date(contract.client_date_of_birth).toLocaleDateString('fr-FR')
    : '';

  const passportIssuedDateFormatted = contract.client_passport_issued_date
    ? new Date(contract.client_passport_issued_date).toLocaleDateString('fr-FR')
    : '';

  return (
    <div
      ref={documentRef}
      className="rlv-contract-root bg-white text-black p-4 mx-auto select-text"
      style={{
        width: '100%',
        maxWidth: '200mm',
        minHeight: '280mm',
        boxSizing: 'border-box',
        fontFamily: "'Cairo', 'Montserrat', Arial, sans-serif",
        fontSize: '7.8px',
        lineHeight: 1.22,
        color: '#000',
        backgroundColor: '#fff',
      }}
    >
      {/* ══════════════════════════════════════════════════
          1. HEADER (Logo, Company, RLV & Legal Notices)
      ══════════════════════════════════════════════════ */}
      <div
        className="grid grid-cols-12 gap-3 mb-1.5"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '12px',
          marginBottom: '5px',
          alignItems: 'start',
        }}
      >
        {/* Left: Logo & Company Address */}
        <div
          className="col-span-5 flex flex-col items-center text-center"
          style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
        >
          <img
            src="/rlv-emblem.png"
            alt="Logo RLV"
            className="h-12 object-contain mx-auto mb-0.5"
            style={{ maxHeight: '44px', objectFit: 'contain' }}
            onError={e => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <h1
            className="font-bold text-[8.5px] tracking-wider uppercase text-black leading-tight mt-0.5"
            style={{
              fontWeight: 800,
              fontSize: '8.5px',
              letterSpacing: '0.4px',
              textTransform: 'uppercase',
              margin: '2px 0 3px 0',
              fontFamily: "'Montserrat', Arial, sans-serif",
            }}
          >
            RAHIMI LOCATION DE VOITURE
          </h1>
          <table
            style={{
              margin: '0 auto',
              borderCollapse: 'collapse',
              textAlign: 'left',
              display: 'inline-table',
            }}
          >
            <tbody>
              <tr>
                <td style={{ paddingRight: '5px', verticalAlign: 'middle', width: '13px', textAlign: 'center', lineHeight: 1 }}>
                  <svg width="10" height="12" viewBox="0 0 24 24" fill="#000" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </td>
                <td
                  style={{
                    borderLeft: '1.2px solid #000',
                    paddingLeft: '5px',
                    verticalAlign: 'middle',
                    fontSize: '7.2px',
                    fontWeight: 700,
                    color: '#000',
                    lineHeight: 1.3,
                    whiteSpace: 'nowrap',
                    textAlign: 'left',
                    fontFamily: "'Montserrat', Arial, sans-serif",
                  }}
                >
                  LOT EL NAHDA RUE 37 N°12 BLOC38 , Tanger
                </td>
              </tr>
              <tr>
                <td style={{ paddingRight: '5px', verticalAlign: 'middle', width: '13px', textAlign: 'center', lineHeight: 1, paddingTop: '1.5px' }}>
                  <svg width="10" height="12" viewBox="0 0 24 24" fill="#000" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                </td>
                <td
                  style={{
                    borderLeft: '1.2px solid #000',
                    paddingLeft: '5px',
                    verticalAlign: 'middle',
                    fontSize: '7.5px',
                    fontWeight: 700,
                    color: '#000',
                    lineHeight: 1.3,
                    whiteSpace: 'nowrap',
                    textAlign: 'left',
                    paddingTop: '1.5px',
                    fontFamily: "'Montserrat', Arial, sans-serif",
                  }}
                >
                  Tel: 06 77 81 37 18 / 07 77 57 33 79
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right: Brand Title (Centered in section) & Legal Warnings below it */}
        <div
          className="col-span-7 flex flex-col justify-between pl-1"
          style={{ gridColumn: 'span 7', display: 'flex', flexDirection: 'column', paddingLeft: '4px' }}
        >
          {/* RLV Brand Title centered inside right section */}
          <div className="w-full flex justify-center mb-1 text-center" style={{ width: '100%', display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
            <div className="inline-flex flex-col items-center text-center" style={{ width: 'max-content', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                className="font-black text-[27px] tracking-tighter text-black uppercase leading-none"
                style={{
                  fontWeight: 900,
                  fontSize: '27px',
                  letterSpacing: '-0.8px',
                  lineHeight: 1,
                  color: '#000',
                  fontFamily: "'Montserrat', Arial, sans-serif",
                }}
              >
                RLV
              </div>
              <div
                className="w-full border-t-[2.2px] border-black my-1"
                style={{
                  width: '100%',
                  borderTop: '2.2px solid #000',
                  margin: '2.5px 0 2px 0',
                }}
              />
              <div
                className="text-[15.5px] font-bold tracking-wide leading-none whitespace-nowrap"
                style={{
                  fontSize: '15.5px',
                  fontWeight: 800,
                  color: 'transparent',
                  WebkitTextStroke: '1.1px #000',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.4px',
                  lineHeight: 1,
                  fontFamily: "'Montserrat', Arial, sans-serif",
                }}
              >
                Location de voiture
              </div>
            </div>
          </div>

          {/* Legal Warnings directly underneath */}
          <p
            dir="rtl"
            className="text-right text-[7.2px] font-bold text-black mb-1 leading-relaxed"
            style={{
              direction: 'rtl',
              textAlign: 'right',
              fontSize: '7.2px',
              lineHeight: 1.35,
              fontWeight: 700,
              color: '#000',
              marginBottom: '3px',
              fontFamily: "'Cairo', Tahoma, sans-serif",
            }}
          >
            المكتري للسيارة يتابع قضائيا 24 ساعة بعد انتهاء العقد وفي حالة تمديد المدة يجب إخبار شركة R.L.V وأداء مبلغ المدة الاضافية.<br />
            ويبقى المكتري هو المسؤول الوحيد عن أي حادثة بعد تمديد دون اشعار الشركة. للمكتري الصلاحية في قيادة السيارة لا غير ولا يسمح له بتسليمها لشخص آخر.
          </p>
          <div
            dir="ltr"
            className="text-left text-[5.8px] text-gray-800 leading-tight"
            style={{
              direction: 'ltr',
              textAlign: 'left',
              fontSize: '5.8px',
              lineHeight: 1.25,
              color: '#1f2937',
              fontFamily: "'Montserrat', Arial, sans-serif",
            }}
          >
            <p className="mb-0.5" style={{ marginBottom: '1.5px' }}>
              Le Locataire s'expose à des poursuites juridiques 24 heures après la date convenu au départ si le véhicule n'est toujours pas retourné et cela sans que R.L.V ait été informé d'une prolongation de location et ait reçu la somme supplémentaire due.
            </p>
            <p style={{ margin: '1px 0' }}>- En cas de Forfait, le locataire est responsable de tous dégâts matériels d'après la deuxième signature.</p>
            <p style={{ margin: '1px 0' }}>- Le véhicule ne doit être conduit que par le locataire.</p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          2. TITLE BANNER: Contrat de Location / عقد الكراء / №
      ══════════════════════════════════════════════════ */}
      <div
        className="flex items-center justify-between mb-1 px-1"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '4px',
          padding: '2px 4px',
        }}
      >
        <span className="font-black text-[14px] text-black tracking-wide" style={{ fontWeight: 900, fontSize: '14px' }}>
          Contrat de Location
        </span>
        <span className="font-black text-[15px] text-black" dir="rtl" style={{ fontWeight: 900, fontSize: '15px' }}>
          عقـــــد الكـــــراء
        </span>
        <div className="flex items-center" style={{ display: 'flex', alignItems: 'center' }}>
          <span className="text-[#d91445] font-black text-[13px] mr-1" style={{ color: '#d91445', fontWeight: 900, fontSize: '13px' }}>
            №
          </span>
          <span
            className="font-mono font-black text-[13px] tracking-widest text-[#d91445]"
            style={{ color: '#d91445', fontWeight: 900, fontSize: '13px', fontFamily: 'monospace' }}
          >
            {formattedContractNum}
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          3. MAIN DATA BOX (Single unified outer border with
             distinct central vertical divider line & 4 synchronized rows)
      ══════════════════════════════════════════════════ */}
      <div
        className="main-contract-box mb-2"
        style={{
          border: '2px solid #000',
          marginBottom: '8px',
          backgroundColor: '#fff',
        }}
      >
        {/* ── ROW 1: VEHICLE (Left) | DATES GRID (Right) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '2px solid #000' }}>
          {/* Left: Vehicle Section */}
          <div style={{ borderRight: '2px solid #000' }}>
            <FieldRow labelFr="Marque :" value={contract.vehicle_name} labelAr="نوع" />
            <FieldRow labelFr="N° Immatriculation :" value={contract.vehicle_plate} labelAr="رقم التسجيل" />
            {contract.vehicle_color && <FieldRow labelFr="Couleur :" value={contract.vehicle_color} labelAr="اللون" />}
            {contract.vehicle_vin && <FieldRow labelFr="VIN :" value={contract.vehicle_vin} labelAr="رقم الهيكل" />}
            {contract.fuel_level_start && <FieldRow labelFr="Carburant départ :" value={contract.fuel_level_start} labelAr="الوقود" />}
            <FieldRow labelFr="Lieu de livraison :" value={contract.signature_city || 'TANGER'} labelAr="مكان التسجيل" />
            <FieldRow labelFr="Lieu de Reprise :" value={contract.signature_city || 'TANGER'} labelAr="مكان الاسترجاع" isLastInSection />
          </div>

          {/* Right: Dates Table (4 rows) */}
          <div>
            <table
              className="w-full border-collapse text-[7.2px]"
              style={{ width: '100%', height: '100%', borderCollapse: 'collapse', fontSize: '7.2px' }}
            >
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #000' }}>
                  <th style={{ borderRight: '1px solid #000', padding: '2px 4px', textAlign: 'left', width: '50%' }}></th>
                  <th style={{ borderRight: '1px solid #000', padding: '2px', textAlign: 'center', width: '12%', fontWeight: 900 }}>J</th>
                  <th style={{ borderRight: '1px solid #000', padding: '2px', textAlign: 'center', width: '12%', fontWeight: 900 }}>M</th>
                  <th style={{ borderRight: '1px solid #000', padding: '2px', textAlign: 'center', width: '13%', fontWeight: 900 }}>A</th>
                  <th style={{ padding: '2px', textAlign: 'center', width: '13%', fontWeight: 900 }}>H</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '0.6px solid #ccc' }}>
                  <td style={{ borderRight: '1px solid #000', padding: '2px 6px', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span>Départ</span>
                    <span dir="rtl">الانطلاق</span>
                  </td>
                  <td style={{ borderRight: '1px solid #000', textAlign: 'center', fontWeight: 800, fontFamily: 'monospace' }}>{depJ}</td>
                  <td style={{ borderRight: '1px solid #000', textAlign: 'center', fontWeight: 800, fontFamily: 'monospace' }}>{depM}</td>
                  <td style={{ borderRight: '1px solid #000', textAlign: 'center', fontWeight: 800, fontFamily: 'monospace' }}>{depA}</td>
                  <td style={{ textAlign: 'center', fontWeight: 800, fontFamily: 'monospace' }}>{depH}</td>
                </tr>
                <tr style={{ borderBottom: '0.6px solid #ccc' }}>
                  <td style={{ borderRight: '1px solid #000', padding: '2px 6px', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span>Retour Prevu</span>
                    <span dir="rtl">الرجوع الموقع</span>
                  </td>
                  <td style={{ borderRight: '1px solid #000', textAlign: 'center', fontWeight: 800, fontFamily: 'monospace' }}>{retJ}</td>
                  <td style={{ borderRight: '1px solid #000', textAlign: 'center', fontWeight: 800, fontFamily: 'monospace' }}>{retM}</td>
                  <td style={{ borderRight: '1px solid #000', textAlign: 'center', fontWeight: 800, fontFamily: 'monospace' }}>{retA}</td>
                  <td style={{ textAlign: 'center', fontWeight: 800, fontFamily: 'monospace' }}>{retH}</td>
                </tr>
                <tr style={{ borderBottom: '0.6px solid #ccc' }}>
                  <td style={{ borderRight: '1px solid #000', padding: '2px 6px', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span>Retour Définitif</span>
                    <span dir="rtl">الرجوع النهائي</span>
                  </td>
                  <td style={{ borderRight: '1px solid #000', textAlign: 'center', fontFamily: 'monospace' }}>/</td>
                  <td style={{ borderRight: '1px solid #000', textAlign: 'center', fontFamily: 'monospace' }}>/</td>
                  <td style={{ borderRight: '1px solid #000', textAlign: 'center', fontFamily: 'monospace' }}>/</td>
                  <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>/</td>
                </tr>
                <tr>
                  <td style={{ borderRight: '1px solid #000', padding: '2px 6px', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span>Durée</span>
                    <span dir="rtl">المدة</span>
                  </td>
                  <td colSpan={4} style={{ textAlign: 'center', fontWeight: 800, background: '#f8fafc', padding: '2px' }}>
                    {days} Jour{days > 1 ? 's' : ''} / {days} أيام
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── ROW 2: CLIENT INFO (Left) | KILOMETRAGE & CONDUCTEUR (Right) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '2px solid #000' }}>
          {/* Left: Client Section (13 rows) */}
          <div style={{ borderRight: '2px solid #000' }}>
            <FieldRow labelFr="NOM :" value={contract.client_name} labelAr="الاسم" isBold />
            <FieldRow labelFr="CIN N° :" value={contract.client_id_number} labelAr="البطاقة الوطنية" />
            <FieldRow labelFr="Date de Naissance :" value={dobFormatted} labelAr="تاريخ الازدياد" />
            <FieldRow labelFr="Profession :" value={contract.client_profession} labelAr="المهنة" />
            <FieldRow labelFr="Adresse au Maroc :" value={contract.client_address} labelAr="العنوان بالمغرب" />
            <FieldRow labelFr="Adresse à l 'Etranger :" value={contract.client_address_abroad} labelAr="العنوان بالخارج" />
            <FieldRow labelFr="Permis de Conduire N° :" value={contract.client_license_number} labelAr="رخصة السياقة رقم" />
            <FieldRow labelFr="Délivré à :" value={contract.signature_city || 'Tanger'} labelAr="اصدارها في" />
            <FieldRow labelFr="Le :" value={licenseExpFormatted} labelAr="بتاريخ" />
            <FieldRow labelFr="Passport N° :" value={contract.client_passport_number} labelAr="رقم جواز السفر" />
            <FieldRow labelFr="Délivré à :" value={contract.client_passport_issued_at || ''} labelAr="اصدارها في" />
            <FieldRow labelFr="Le :" value={passportIssuedDateFormatted} labelAr="بتاريخ" />
            <FieldRow labelFr="Téléphone de Contrat :" value={contract.client_phone} labelAr="هاتف الاتصال" isLastInSection />
          </div>

          {/* Right: Kilométrage Grid + Conducteur Supplémentaire */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2px' }}>
            {/* Structured Kilométrage Grid with Boxed Rectangular Inputs */}
            <div style={{ border: '1px solid #000', marginBottom: '3px', background: '#fff' }}>
              <KmGridRow labelAr="عدد الكيلومترات عند الرجوع" labelFr="KILOMETRAGE RETOUR :" digits={kmRet} />
              <KmGridRow labelAr="عدد الكيلومترات عند الذهاب" labelFr="KILOMETRAGE DEPART :" digits={kmDep} />
              <KmGridRow labelAr="عدد الكيلومترات المقطوعة" labelFr="KILOMETRAGE PARCOURU :" digits={kmPar} isLast />
            </div>

            {/* Framed Solid Box: Le Conducteur Supplémentaire */}
            <div
              className="border border-black"
              style={{
                border: '1px solid #000',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                flex: 1,
                background: '#fff',
              }}
            >
              {/* Box Title with solid bottom border */}
              <div
                className="flex justify-between items-center font-black px-2 py-0.5 border-b border-black"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '2.5px 8px',
                  borderBottom: '1px solid #000',
                  background: '#f8fafc',
                  fontSize: '8px',
                  fontWeight: 900,
                }}
              >
                <span className="uppercase">Le Conducteur Supplémentaire</span>
                <span dir="rtl">السائق المرخـص</span>
              </div>
              <FieldRow labelFr="Nom & Prénom :" value={contract.driver_name} labelAr="الاسم الشخصي و العائلي" />
              <FieldRow labelFr="Permis de conduire N° :" value={contract.driver_permit_number} labelAr="رخصة السياقة رقم" />
              <FieldRow labelFr="Délivré à :" value={contract.signature_city || 'Tanger'} labelAr="إصدارها في" />
              <FieldRow labelFr="Passeport N° :" value={contract.driver_passport_number} labelAr="رقم جواز السفر" />
              <FieldRow labelFr="C.I.N n° :" value={contract.driver_id_number} labelAr="البطاقة الوطنية" isLastInSection />
            </div>
          </div>
        </div>

        {/* ── ROW 3: PAIEMENT (Left) | TOTALS (Right) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '2px solid #000' }}>
          {/* Left: Paiement Section */}
          <div style={{ borderRight: '2px solid #000', display: 'flex', flexDirection: 'column' }}>
            <div
              className="flex justify-between items-center font-black px-2 py-0.5"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '3px 8px',
                borderBottom: '1px solid #000',
                background: '#f8fafc',
                fontSize: '8.2px',
                fontWeight: 900,
              }}
            >
              <span className="uppercase">Paiement</span>
              <span dir="rtl">الأداء</span>
            </div>

            <div style={{ padding: '3px 6px', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1 }}>
              {/* Espèce */}
              <div
                className="flex items-center justify-between py-1 border-b border-dotted border-gray-600"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '2.5px 0',
                  borderBottom: '0.8px dotted #555',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '11px',
                      height: '11px',
                      border: '1px solid #000',
                      fontSize: '8px',
                      fontWeight: 'bold',
                    }}
                  >
                    {contract.booking_payment_status === 'paid' ? '✓' : ''}
                  </span>
                  <span style={{ fontWeight: 700 }}>* Espèce :</span>
                </div>
                <span style={{ flex: 1, borderBottom: '0.8px dotted #555', margin: '0 6px' }}></span>
                <span style={{ fontWeight: 700 }} dir="rtl">نقدا</span>
              </div>

              {/* Chèque */}
              <div
                className="flex items-center justify-between py-1 border-b border-dotted border-gray-600"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '2.5px 0',
                  borderBottom: '0.8px dotted #555',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '11px',
                      height: '11px',
                      border: '1px solid #000',
                      fontSize: '8px',
                    }}
                  ></span>
                  <span style={{ fontWeight: 700 }}>* Chèque :</span>
                </div>
                <span style={{ flex: 1, borderBottom: '0.8px dotted #555', margin: '0 6px' }}></span>
                <span style={{ fontWeight: 700 }} dir="rtl">شيكا</span>
              </div>

              {/* Caution */}
              <div
                className="flex items-center justify-between py-1"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '2.5px 0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '11px',
                      height: '11px',
                      border: '1px solid #000',
                      fontSize: '8px',
                      fontWeight: 'bold',
                    }}
                  >
                    {(contract.deposit_amount || 0) > 0 ? '✓' : ''}
                  </span>
                  <span style={{ fontWeight: 700 }}>* Caution :</span>
                  {(contract.deposit_amount || 0) > 0 && (
                    <strong style={{ marginLeft: '4px', fontWeight: 900 }}>
                      {contract.deposit_amount?.toFixed(2)} Dh
                    </strong>
                  )}
                </div>
                <span style={{ flex: 1, borderBottom: '0.8px dotted #555', margin: '0 6px' }}></span>
                <span style={{ fontWeight: 700 }} dir="rtl">ضمانة</span>
              </div>
            </div>
          </div>

          {/* Right: Framed Solid Box for Financial Totals */}
          <div style={{ padding: '3px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div
              className="border border-black"
              style={{
                border: '1px solid #000',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: '#fff',
              }}
            >
              {/* Total Hors Taxe */}
              <div
                className="flex justify-between items-center border-b border-dotted border-gray-600 px-2 py-1"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '3px 8px',
                  borderBottom: '0.8px dotted #555',
                  fontSize: '7.5px',
                }}
              >
                <span style={{ fontWeight: 700 }}>Total Hors Taxe</span>
                <span style={{ flex: 1, borderBottom: '0.8px dotted #555', margin: '0 6px' }}></span>
                <span style={{ fontWeight: 800, fontFamily: 'monospace' }}>{totalHT.toFixed(2)} Dh</span>
              </div>

              {/* Taxe TVA 20% */}
              <div
                className="flex justify-between items-center border-b border-dotted border-gray-600 px-2 py-1"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '3px 8px',
                  borderBottom: '0.8px dotted #555',
                  fontSize: '7.5px',
                }}
              >
                <span style={{ fontWeight: 700 }}>Taxe TVA 20%</span>
                <span style={{ flex: 1, borderBottom: '0.8px dotted #555', margin: '0 6px' }}></span>
                <span style={{ fontWeight: 800, fontFamily: 'monospace' }}>{tvaAmount.toFixed(2)} Dh</span>
              </div>

              {/* TOTAL DE LOCATION */}
              <div
                className="flex justify-between items-center px-2 py-1 bg-slate-50 font-black"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '3.5px 8px',
                  background: '#f8fafc',
                  fontSize: '8.2px',
                  fontWeight: 900,
                }}
              >
                <span className="uppercase">TOTAL DE LOCATION</span>
                <span style={{ flex: 1, borderBottom: '0.8px dotted #555', margin: '0 6px' }}></span>
                <span style={{ fontWeight: 900, fontFamily: 'monospace' }}>{totalTTC.toFixed(2)} Dh</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 4: SIGNATURES (Directly below solid border-b-2) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          {/* Left: Terms & Client Signature */}
          <div style={{ borderRight: '2px solid #000', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ padding: '6px 8px 4px 8px', borderBottom: '0.8px solid #ccc', backgroundColor: '#fff' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', alignItems: 'start' }}>
                <p style={{ fontSize: '6.4px', lineHeight: 1.35, color: '#000', margin: 0 }}>
                  Je reconnais avoir pris connaissance des présentes conditions générales (recto verso) et m'engage à les respecter.
                </p>
                <p
                  dir="rtl"
                  style={{
                    fontSize: '6.8px',
                    lineHeight: 1.35,
                    fontWeight: 700,
                    color: '#000',
                    textAlign: 'right',
                    margin: 0,
                    fontFamily: "'Cairo', Tahoma, sans-serif",
                  }}
                >
                  اعترف بعلمي الكامل للقانون العام لكراء السيارات في ظهر هذا العقد والتزم باحترامه
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'center', padding: '6px 8px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div
                className="flex justify-between font-bold text-[8px]"
                style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '8px', marginBottom: '4px' }}
              >
                <span>Signature de Client</span>
                <span dir="rtl">إمضاء الزبون</span>
              </div>
              <div
                className="flex items-center justify-center"
                style={{ minHeight: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {contract.signature_client_start ? (
                  <img
                    src={contract.signature_client_start}
                    alt="Signature Client"
                    className="max-h-20 max-w-[160px] object-contain"
                    style={{ maxHeight: '80px', maxWidth: '160px' }}
                  />
                ) : (
                  <div style={{ width: '150px', borderBottom: '1.2px solid #888', margin: 'auto' }}></div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Fait à Tanger le & Signature Responsable */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '6px 8px' }}>
            <div style={{ fontWeight: 700, fontSize: '7.8px' }}>
              Fait à Tanger le : <span style={{ fontWeight: 900 }}>{startDate.toLocaleDateString('fr-FR')}</span>
            </div>

            <div style={{ textAlign: 'center', margin: '2px 0' }}>
              <p style={{ fontWeight: 800, fontSize: '7.8px', marginBottom: '2px' }}>Le responsable</p>
              <div
                className="flex items-center justify-center"
                style={{ minHeight: '75px', height: '75px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {contract.signature_agent_start ? (
                  <img
                    src={contract.signature_agent_start}
                    alt="Signature Responsable"
                    className="max-h-16 max-w-[140px] object-contain"
                    style={{ maxHeight: '68px', maxWidth: '140px' }}
                  />
                ) : (
                  <div style={{ width: '140px', borderBottom: '1.2px solid #888', margin: 'auto' }}></div>
                )}
              </div>
            </div>

            <div style={{ fontSize: '7px', borderTop: '0.6px solid #ccc', paddingTop: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700 }}>Examiné par / فحص من قبل</span>
              <span style={{ color: '#444', fontWeight: 600 }}>M. ........................................</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          4. VEHICLE INSPECTION (BOTTOM 5-COLUMN SECTION)
             Symmetrical: [Car Départ] | [DEPART] | [DOMMAGES] | [RETOUR] | [Car Retour]
      ══════════════════════════════════════════════════ */}
      <div
        className="inspection-box"
        style={{
          display: 'grid',
          gridTemplateColumns: '14% 25% 22% 25% 14%',
          border: '1.5px solid #000',
          backgroundColor: '#fff',
          marginTop: '28px',
        }}
      >
        {/* ── 1. Far Left: Car Diagram (Départ) ── */}
        <div
          style={{
            borderRight: '1.5px solid #000',
            padding: '6px 3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CarInspectionSvg />
        </div>

        {/* ── 2. DEPART Text & Checklist ── */}
        <div
          style={{
            borderRight: '1.5px solid #000',
            padding: '6px 8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            fontSize: '7.2px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="11" viewBox="0 0 20 14" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', display: 'inline-block' }}>
                  <path fill="none" stroke="#000000" strokeWidth="2.5" d="M18 7 H3 M9 2 L3 7 L9 12" />
                </svg>
                <span style={{ fontWeight: 900, fontSize: '10px', letterSpacing: '0.5px' }}>DEPART</span>
              </div>
              <div style={{ width: '2px', height: '16px', backgroundColor: '#000' }}></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ fontWeight: 700, fontSize: '7.5px', color: '#000' }}>Véhicule En parfait état</span>
              <div style={{ display: 'inline-flex', border: '1px solid #000', fontSize: '7px', fontWeight: 800 }}>
                <span style={{ padding: '1px 5px', borderRight: '1px solid #000', backgroundColor: startCond.length === 0 ? '#000' : '#fff', color: startCond.length === 0 ? '#fff' : '#000' }}>
                  Oui
                </span>
                <span style={{ padding: '1px 5px', backgroundColor: startCond.length > 0 ? '#000' : '#fff', color: startCond.length > 0 ? '#fff' : '#000' }}>
                  Non
                </span>
              </div>
            </div>
            <p style={{ fontSize: '5.8px', color: '#444', fontStyle: 'italic', marginBottom: '4px' }}>
              ( Rayer le mention inutile )
            </p>
            <p style={{ fontWeight: 800, fontSize: '7.5px', marginBottom: '1px', color: '#000' }}>Commentaires</p>
            <p style={{ fontSize: '5.6px', color: '#333', marginBottom: '5px', lineHeight: 1.2 }}>
              Positionner les numeros a l 'endroit précis du dommage, sur la matrice a gauche )
            </p>
            <div style={{ fontSize: '7.2px' }}>
              {[1, 2, 3, 4, 5].map(i => {
                const dmgText = startCond[i - 1]?.label || startCond[i - 1]?.zone || '';
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-end', margin: '3.5px 0' }}>
                    <span style={{ fontWeight: 800, width: '12px' }}>{i} -</span>
                    <span style={{ flex: 1, borderBottom: '0.8px dotted #666', minHeight: '12px', color: '#000', fontWeight: 700, paddingLeft: '4px' }}>
                      {dmgText ? `· ${dmgText}` : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 3. Center: DOMMAGES IDENTIFIES ET ACCEPTE ── */}
        <div
          style={{
            borderRight: '1.5px solid #000',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 0,
            backgroundColor: '#fff',
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 900,
                fontSize: '7.8px',
                textAlign: 'center',
                lineHeight: 1.35,
                borderBottom: '1.2px solid #000',
                padding: '6px 4px',
                textTransform: 'uppercase',
                fontFamily: "'Montserrat', Arial, sans-serif",
                letterSpacing: '0.4px',
              }}
            >
              DOMMAGE IDENTIFIES<br />ET ACCEPTE
            </div>
            <div style={{ padding: '10px 14px', fontSize: '7.8px', fontWeight: 700, lineHeight: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', whiteSpace: 'nowrap' }}>
                <span style={{ fontWeight: 900, fontSize: '9.5px', fontFamily: 'monospace', width: '16px' }}>//</span>
                <span>Eraflure</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', whiteSpace: 'nowrap' }}>
                <span style={{ fontWeight: 900, fontSize: '9.5px', fontFamily: 'monospace', width: '16px' }}>✕</span>
                <span>Bosse</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                <span style={{ display: 'inline-block', width: '11px', height: '11px', border: '1.2px solid #000', marginRight: '6px' }}></span>
                <span>Manque</span>
              </div>
            </div>
          </div>

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              borderTop: '1.2px solid #000',
              fontSize: '7.2px',
              textAlign: 'center',
            }}
          >
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #000' }}>
                <th style={{ borderRight: '1px solid #000', padding: '3px 1px', fontWeight: 800, width: '38%' }}>Nombre</th>
                <th style={{ padding: '3px 1px', fontWeight: 800, width: '62%', whiteSpace: 'nowrap' }}>Paraphe Client</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ height: '85px' }}>
                <td style={{ borderRight: '1px solid #000', verticalAlign: 'middle', fontWeight: 800, fontSize: '9.5px' }}>
                  {startCond.length || ''}
                </td>
                <td style={{ verticalAlign: 'middle', textAlign: 'center' }}></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── 4. RETOUR Text & Checklist ── */}
        <div
          style={{
            borderRight: '1.5px solid #000',
            padding: '6px 8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            fontSize: '7.2px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '4px' }}>
              <div style={{ width: '2px', height: '16px', backgroundColor: '#000' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 900, fontSize: '10px', letterSpacing: '0.5px' }}>RETOUR</span>
                <svg width="14" height="11" viewBox="0 0 20 14" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', display: 'inline-block' }}>
                  <path fill="none" stroke="#000000" strokeWidth="2.5" d="M2 7 H17 M11 2 L17 7 L11 12" />
                </svg>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ fontWeight: 700, fontSize: '7.5px', color: '#000' }}>Véhicule En parfait état</span>
              <div style={{ display: 'inline-flex', border: '1px solid #000', fontSize: '7px', fontWeight: 800 }}>
                <span style={{ padding: '1px 5px', borderRight: '1px solid #000', backgroundColor: endCond.length === 0 ? '#000' : '#fff', color: endCond.length === 0 ? '#fff' : '#000' }}>
                  Oui
                </span>
                <span style={{ padding: '1px 5px', backgroundColor: endCond.length > 0 ? '#000' : '#fff', color: endCond.length > 0 ? '#fff' : '#000' }}>
                  Non
                </span>
              </div>
            </div>
            <p style={{ fontSize: '5.8px', color: '#444', fontStyle: 'italic', marginBottom: '4px' }}>
              ( Rayer le mention inutile )
            </p>
            <p style={{ fontWeight: 800, fontSize: '7.5px', marginBottom: '1px', color: '#000' }}>Commentaires</p>
            <p style={{ fontSize: '5.6px', color: '#333', marginBottom: '5px', lineHeight: 1.2 }}>
              Positionner les numeros a l 'endroit précis du dommage, sur la matrice a gauche )
            </p>
            <div style={{ fontSize: '7.2px' }}>
              {[1, 2, 3, 4, 5].map(i => {
                const dmgText = endCond[i - 1]?.label || endCond[i - 1]?.zone || '';
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-end', margin: '3.5px 0' }}>
                    <span style={{ fontWeight: 800, width: '12px' }}>{i} -</span>
                    <span style={{ flex: 1, borderBottom: '0.8px dotted #666', minHeight: '12px', color: '#000', fontWeight: 700, paddingLeft: '4px' }}>
                      {dmgText ? `· ${dmgText}` : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 5. Far Right: Car Diagram (Retour) ── */}
        <div
          style={{
            padding: '6px 3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CarInspectionSvg />
        </div>
      </div>
    </div>
  );
};

// ── SUB-COMPONENTS ──

interface FieldRowProps {
  labelFr: string;
  value?: string;
  labelAr: string;
  isLastInSection?: boolean;
  isBold?: boolean;
}

const FieldRow: React.FC<FieldRowProps> = ({ labelFr, value, labelAr, isLastInSection, isBold }) => (
  <div
    className={`flex items-center justify-between px-2 py-0.5 ${isLastInSection ? '' : 'border-b border-dotted border-gray-600'}`}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '2.2px 6px',
      minHeight: '17px',
      borderBottom: isLastInSection ? 'none' : '0.8px dotted #4b5563',
      fontSize: '7.3px',
    }}
  >
    <span
      style={{
        width: '38%',
        fontWeight: 700,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: '#000',
      }}
    >
      {labelFr}
    </span>
    <span
      className="flex-1 mx-1 border-b border-dotted border-gray-600"
      style={{
        flex: 1,
        margin: '0 4px',
        borderBottom: '0.8px dotted #4b5563',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        fontWeight: isBold ? 900 : 800,
        fontSize: isBold ? '7.8px' : '7.2px',
        minWidth: '40px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: '#000',
      }}
    >
      {value || ''}
    </span>
    <span
      dir="rtl"
      style={{
        width: '24%',
        textAlign: 'right',
        fontWeight: 700,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: '#000',
      }}
    >
      {labelAr}
    </span>
  </div>
);

interface KmRowProps {
  labelAr: string;
  labelFr: string;
  digits: string[];
  isLast?: boolean;
}

const KmRow: React.FC<KmRowProps> = ({ labelAr, labelFr, digits, isLast }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.5px 0',
      borderBottom: isLast ? 'none' : '0.6px dotted #bbb',
      fontSize: '6.8px',
    }}
  >
    <div style={{ lineHeight: 1.15 }}>
      <span className="block font-bold text-black" dir="rtl" style={{ display: 'block', fontWeight: 700 }}>
        {labelAr}
      </span>
      <span className="font-bold text-black" style={{ fontWeight: 700 }}>
        {labelFr}
      </span>
    </div>
    <div style={{ display: 'flex', gap: '1.5px' }}>
      {digits.map((d, i) => (
        <span
          key={i}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '12px',
            height: '14px',
            border: '1px solid #000',
            fontFamily: 'monospace',
            fontWeight: 800,
            fontSize: '7.5px',
            background: '#fff',
            color: '#000',
          }}
        >
          {d}
        </span>
      ))}
    </div>
  </div>
);

interface KmGridRowProps {
  labelAr: string;
  labelFr: string;
  digits: string[];
  isLast?: boolean;
}

const KmGridRow: React.FC<KmGridRowProps> = ({ labelAr, labelFr, digits, isLast }) => {
  const d1 = (digits?.[0] || '') + (digits?.[1] || '');
  const d2 = (digits?.[2] || '') + (digits?.[3] || '');
  const d3 = (digits?.[4] || '') + (digits?.[5] || '');

  return (
    <div
      className={`flex justify-between items-center py-1.5 ${isLast ? '' : 'border-b border-black'}`}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '3px 4px',
        borderBottom: isLast ? 'none' : '1px solid #000',
      }}
    >
      {/* Left: Text Block (Arabic on top, French on bottom) */}
      <div className="flex flex-col text-left" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.15 }}>
        <span dir="rtl" className="text-right font-bold text-black text-[7.2px]" style={{ direction: 'rtl', textAlign: 'right', fontWeight: 700, fontSize: '7.2px' }}>
          {labelAr}
        </span>
        <span className="font-bold text-black text-[7.5px] tracking-wide" style={{ fontWeight: 800, fontSize: '7.5px' }}>
          {labelFr}
        </span>
      </div>

      {/* Right: 3-Cell Input Grid with Solid Black Border */}
      <div
        className="grid grid-cols-3 border border-black bg-white"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          border: '1px solid #000',
          width: '105px',
          height: '19px',
          backgroundColor: '#fff',
        }}
      >
        <div
          className="border-r border-black flex items-center justify-center font-mono font-bold text-[8px] text-black"
          style={{ borderRight: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontWeight: 700, fontSize: '8px', color: '#000' }}
        >
          {d1.trim()}
        </div>
        <div
          className="border-r border-black flex items-center justify-center font-mono font-bold text-[8px] text-black"
          style={{ borderRight: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontWeight: 700, fontSize: '8px', color: '#000' }}
        >
          {d2.trim()}
        </div>
        <div
          className="flex items-center justify-center font-mono font-bold text-[8px] text-black"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontWeight: 700, fontSize: '8px', color: '#000' }}
        >
          {d3.trim()}
        </div>
      </div>
    </div>
  );
};

// ── Symmetrical Vector Car Inspection Graphic (Matching Image 0) ──
const CarInspectionSvg: React.FC = () => (
  <svg
    viewBox="0 0 150 240"
    style={{
      width: '100%',
      maxHeight: '180px',
      objectFit: 'contain',
      display: 'block',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      fontSize: '7.5px',
      fontWeight: 'bold',
      textAnchor: 'middle',
    }}
    fill="none"
    stroke="#000000"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Front Bumper */}
    <path fill="none" stroke="#000000" strokeWidth="1.2" d="M 52 14 C 52 9, 62 7, 75 7 C 88 7, 98 9, 98 14 L 102 21 C 102 24, 98 25, 96 25 L 54 25 C 52 25, 48 24, 48 21 Z" />
    <text x="75" y="19" stroke="none" fill="#000000" fontSize="8">10</text>

    {/* Front Left Fender */}
    <path fill="none" stroke="#000000" strokeWidth="1.2" d="M 46 25 C 46 25, 34 26, 28 34 C 23 41, 23 52, 28 62 C 31 67, 36 71, 46 72" />
    <text x="31" y="44" stroke="none" fill="#000000">6</text>
    {/* Front Left Wheel Guide */}
    <path fill="none" stroke="#000000" strokeWidth="1.3" d="M 18 36 C 14 42, 14 56, 18 62" />

    {/* Front Right Fender */}
    <path fill="none" stroke="#000000" strokeWidth="1.2" d="M 104 25 C 104 25, 116 26, 122 34 C 127 41, 127 52, 122 62 C 119 67, 114 71, 104 72" />
    <text x="119" y="44" stroke="none" fill="#000000">12</text>
    {/* Front Right Wheel Guide */}
    <path fill="none" stroke="#000000" strokeWidth="1.3" d="M 132 36 C 136 42, 136 56, 132 62" />

    {/* Hood */}
    <path fill="none" stroke="#000000" strokeWidth="1.2" d="M 48 27 L 102 27 L 101 54 C 88 56, 62 56, 49 54 Z" />
    <text x="75" y="44" stroke="none" fill="#000000">11</text>

    {/* Windshield */}
    <path fill="none" stroke="#000000" strokeWidth="1.2" d="M 49 57 C 60 59, 90 59, 101 57 L 97 76 C 85 78, 65 78, 53 76 Z" />

    {/* Center Roof */}
    <path fill="none" stroke="#000000" strokeWidth="1.2" d="M 53 79 C 65 80, 85 80, 97 79 L 97 138 C 85 137, 65 137, 53 138 Z" />
    <text x="75" y="112" stroke="none" fill="#000000" fontSize="9">1</text>

    {/* Left Front Door */}
    <path fill="none" stroke="#000000" strokeWidth="1.2" d="M 46 74 L 28 74 C 22 75, 20 80, 20 90 L 20 106 L 46 106" />
    <path fill="none" stroke="#000000" strokeWidth="0.8" d="M 46 76 L 31 76 C 26 77, 24 81, 24 88 L 24 104 L 46 104" />
    <text x="25" y="93" stroke="none" fill="#000000">7</text>

    {/* Left Center Pillar & B-notch */}
    <line x1="16" y1="106" x2="20" y2="106" fill="none" stroke="#000000" strokeWidth="1.5" />
    <text x="12" y="109" stroke="none" fill="#000000" fontSize="7">8</text>

    {/* Left Rear Door */}
    <path fill="none" stroke="#000000" strokeWidth="1.2" d="M 46 107 L 20 107 L 20 125 C 20 135, 24 139, 30 140 L 46 140" />
    <path fill="none" stroke="#000000" strokeWidth="0.8" d="M 46 109 L 24 109 L 24 124 C 24 132, 27 137, 32 138 L 46 138" />
    <text x="25" y="125" stroke="none" fill="#000000">9</text>

    {/* Right Front Door */}
    <path fill="none" stroke="#000000" strokeWidth="1.2" d="M 104 74 L 122 74 C 128 75, 130 80, 130 90 L 130 106 L 104 106" />
    <path fill="none" stroke="#000000" strokeWidth="0.8" d="M 104 76 L 119 76 C 124 77, 126 81, 126 88 L 126 104 L 104 104" />
    <text x="125" y="93" stroke="none" fill="#000000">13</text>

    {/* Right Center Pillar & B-notch */}
    <line x1="130" y1="106" x2="134" y2="106" fill="none" stroke="#000000" strokeWidth="1.5" />
    <text x="138" y="109" stroke="none" fill="#000000" fontSize="7">15</text>

    {/* Right Rear Door */}
    <path fill="none" stroke="#000000" strokeWidth="1.2" d="M 104 107 L 130 107 L 130 125 C 130 135, 126 139, 120 140 L 104 140" />
    <path fill="none" stroke="#000000" strokeWidth="0.8" d="M 104 109 L 126 109 L 126 124 C 126 132, 123 137, 118 138 L 104 138" />
    <text x="125" y="125" stroke="none" fill="#000000">14</text>

    {/* Rear Windshield */}
    <path fill="none" stroke="#000000" strokeWidth="1.2" d="M 53 141 C 65 140, 85 140, 97 141 L 101 161 C 88 160, 62 160, 49 161 Z" />
    <text x="75" y="153" stroke="none" fill="#000000" fontSize="7.5">2</text>

    {/* Rear Left Fender */}
    <path fill="none" stroke="#000000" strokeWidth="1.2" d="M 46 142 C 36 143, 31 147, 28 152 C 23 162, 23 173, 28 180 C 34 188, 46 189, 46 189" />
    <text x="29" y="170" stroke="none" fill="#000000">5</text>
    {/* Rear Left Wheel Guide */}
    <path fill="none" stroke="#000000" strokeWidth="1.3" d="M 18 152 C 14 158, 14 172, 18 178" />

    {/* Rear Right Fender */}
    <path fill="none" stroke="#000000" strokeWidth="1.2" d="M 104 142 C 114 143, 119 147, 122 152 C 127 162, 127 173, 122 180 C 116 188, 104 189, 104 189" />
    <text x="121" y="170" stroke="none" fill="#000000">16</text>
    {/* Rear Right Wheel Guide */}
    <path fill="none" stroke="#000000" strokeWidth="1.3" d="M 132 152 C 136 158, 136 172, 132 178" />

    {/* Trunk */}
    <path fill="none" stroke="#000000" strokeWidth="1.2" d="M 49 164 L 101 164 L 101 204 C 88 206, 62 206, 49 204 Z" />
    <text x="75" y="186" stroke="none" fill="#000000" fontSize="7.5">3</text>

    {/* Rear Bumper */}
    <path fill="none" stroke="#000000" strokeWidth="1.2" d="M 47 206 C 52 208, 98 208, 103 206 L 99 216 C 96 222, 54 222, 51 216 Z" />
    <text x="75" y="217" stroke="none" fill="#000000" fontSize="7.5">4</text>
  </svg>
);

export function getRlvPrintStyles(): string {
  return `
    @page {
      size: A4 portrait;
      margin: 4mm 6mm;
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
      font-size: 7.8px !important;
      color: #000 !important;
      background: #fff !important;
      line-height: 1.22 !important;
    }
    .rlv-contract-root {
      width: 196mm !important;
      max-width: 196mm !important;
      min-height: auto !important;
      padding: 2mm 3mm !important;
      margin: 0 auto !important;
      overflow: visible !important;
      page-break-inside: avoid !important;
      background: #fff !important;
      color: #000 !important;
    }
    .main-contract-box {
      border: 2px solid #000 !important;
      box-sizing: border-box !important;
      page-break-inside: avoid !important;
    }
    .inspection-box {
      border: 2px solid #000 !important;
      box-sizing: border-box !important;
      page-break-inside: avoid !important;
    }
    img {
      max-width: 100% !important;
    }
    [dir="rtl"] {
      direction: rtl !important;
      unicode-bidi: embed !important;
    }
  `;
}

export default RlvContractDocument;
