<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Contrat {{ $contract->contract_number }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 9px; color: #111; line-height: 1.35; background: #fff; }
        .page { width: 210mm; margin: 0 auto; padding: 7mm 7mm 5mm 7mm; }

        /* ══ HEADER ══ */
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 3mm; padding-bottom: 2mm; border-bottom: 2px solid #000; }
        .header-logo-area { display: flex; align-items: center; gap: 5px; width: 36%; }
        .header-logo svg { width: 50px; height: 50px; }
        .company-name { font-size: 12px; font-weight: bold; letter-spacing: 1px; }
        .company-sub { font-size: 7px; color: #444; display: block; }
        .header-center { text-align: center; flex: 1; padding-top: 4px; }
        .doc-title-fr { font-size: 15px; font-weight: bold; letter-spacing: 1px; }
        .doc-title-ar { font-size: 12px; font-weight: bold; direction: rtl; }
        .header-num-area { text-align: right; width: 22%; }
        .num-label { font-size: 7.5px; color: #555; display: block; }
        .num-value { font-size: 17px; font-weight: bold; border: 2px solid #000; padding: 2px 8px; display: inline-block; min-width: 78px; text-align: center; }

        /* ══ BADGES ══ */
        .badge { display: inline-block; padding: 1px 6px; border-radius: 3px; font-size: 7px; font-weight: bold; text-transform: uppercase; }
        .badge-active    { background: #dbeafe; color: #1e40af; }
        .badge-completed { background: #dcfce7; color: #166534; }
        .badge-cancelled { background: #fee2e2; color: #991b1b; }
        .badge-draft     { background: #fef9c3; color: #854d0e; }

        /* ══ MAIN GRID ══ */
        .main-grid { display: flex; gap: 3px; margin-bottom: 3px; }
        .col-left  { width: 47%; border: 1px solid #555; }
        .col-right { width: 53%; border: 1px solid #555; }

        /* ══ FIELD ROWS ══ */
        .field-row { display: flex; align-items: stretch; border-bottom: 1px solid #ccc; min-height: 13px; }
        .field-row:last-child { border-bottom: none; }
        .fl { font-size: 7.5px; padding: 2px 4px; flex: 1; border-right: 1px solid #ccc; display: flex; flex-direction: column; justify-content: center; }
        .fl .fr { font-weight: 600; }
        .fl .ar { font-size: 7px; color: #555; direction: rtl; text-align: right; }
        .fv { padding: 2px 4px; flex: 1; font-size: 8px; font-weight: bold; display: flex; align-items: center; }
        .sep { border-top: 1.5px solid #555; }

        /* ══ DATE TABLE ══ */
        .date-table { width: 100%; border-collapse: collapse; font-size: 7.5px; border-bottom: 1px solid #555; }
        .date-table th { background: #f0f0f0; border: 1px solid #ccc; padding: 2px 3px; text-align: center; font-weight: bold; font-size: 8.5px; }
        .date-table td { border: 1px solid #ccc; padding: 2px 3px; font-size: 7.5px; }
        .date-table td.rl { background: #fafafa; font-size: 7px; }
        .date-table td.rl .fr { display: block; font-weight: 600; }
        .date-table td.rl .ar { display: block; font-size: 6.5px; color: #666; direction: rtl; text-align: right; }
        .date-table td.vc { text-align: center; font-weight: bold; min-width: 20px; }

        /* ══ KM TABLE ══ */
        .km-table { width: 100%; border-collapse: collapse; font-size: 7.5px; }
        .km-table td { border: 1px solid #ccc; padding: 2px 4px; }
        .km-table td.kl { background: #fafafa; width: 58%; }
        .km-table td.kl .fr { display: block; font-weight: 600; font-size: 7px; }
        .km-table td.kl .ar { display: block; font-size: 6.5px; direction: rtl; text-align: right; color: #555; }
        .km-table td.kv { font-weight: bold; }

        /* ══ SECTION HEADER ══ */
        .sec-head { background: #f0f0f0; border-bottom: 1px solid #555; padding: 2px 5px; display: flex; justify-content: space-between; align-items: center; }
        .sec-head .sf { font-weight: bold; font-size: 8px; }
        .sec-head .sa { font-size: 7.5px; direction: rtl; color: #333; }

        /* ══ DRIVER + PAYMENT GRID ══ */
        .dp-grid { display: flex; gap: 3px; margin-bottom: 3px; }
        .dp-col { flex: 1; border: 1px solid #555; }

        /* ══ PAYMENT ══ */
        .pay-row { display: flex; border-bottom: 1px solid #ddd; min-height: 14px; align-items: center; }
        .pay-row:last-child { border-bottom: none; }
        .pl { font-size: 7.5px; padding: 2px 4px; width: 50%; border-right: 1px solid #ddd; }
        .pl .fr { font-weight: 600; display: block; }
        .pl .ar { font-size: 6.5px; direction: rtl; display: block; color: #555; }
        .pv { flex: 1; padding: 2px 4px; font-weight: bold; font-size: 8px; }
        .totals-inner { padding: 3px 5px; border-top: 1px solid #aaa; }
        .tot-row { display: flex; justify-content: space-between; font-size: 7.5px; padding: 1.5px 0; border-bottom: 1px solid #eee; }
        .tot-row:last-child { border-bottom: none; }
        .tot-grand { font-size: 9px; font-weight: bold; border-top: 1.5px solid #000 !important; padding-top: 3px !important; margin-top: 1px; }
        .fait-a { border-top: 1px solid #aaa; display: flex; gap: 4px; padding: 3px 5px; font-size: 7.5px; }

        /* ══ CONDITIONS + SIG ══ */
        .cs-grid { display: flex; gap: 3px; margin-bottom: 3px; }
        .cond-box { flex: 1.5; border: 1px solid #555; padding: 3px 5px; }
        .cond-text { font-size: 6.5px; color: #333; line-height: 1.45; }
        .sig-area { flex: 1; border: 1px solid #555; padding: 3px 5px; }
        .sig-lbl { font-size: 7px; font-weight: bold; color: #555; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 2px; margin-bottom: 3px; }
        .sig-img { min-height: 44px; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #aaa; margin-bottom: 2px; }
        .sig-img img { max-width: 120px; max-height: 38px; }
        .sig-inf { font-size: 7px; color: #333; }

        /* ══ INSPECTION SECTION ══ */
        .insp-wrap { display: flex; gap: 0; border: 1.5px solid #000; margin-top: 3mm; }
        .insp-col { padding: 4px 5px; }
        .insp-col.depart  { width: 32%; border-right: 1px solid #666; }
        .insp-col.damages { width: 21%; border-right: 1px solid #666; }
        .insp-col.retour  { flex: 1; }
        .insp-title { font-size: 8.5px; font-weight: bold; text-align: center; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 3px; letter-spacing: 1px; }
        .insp-sub { font-size: 7.5px; font-weight: bold; margin-bottom: 2px; }
        .on-box { font-size: 7.5px; margin-bottom: 2px; display: flex; align-items: center; gap: 5px; }
        .chk { display: inline-block; width: 9px; height: 9px; border: 1px solid #000; vertical-align: middle; margin-right: 1px; position: relative; font-size: 8px; line-height: 9px; text-align: center; }
        .insp-note { font-size: 6.5px; color: #666; font-style: italic; margin-bottom: 3px; }
        .car-wrap { text-align: center; margin: 2px 0; }
        .num-list { font-size: 6.5px; color: #555; }
        .num-list div { border-bottom: 1px dotted #ccc; padding: 1px 0; }
        .dmg-item { display: flex; align-items: center; gap: 5px; font-size: 7.5px; margin-bottom: 4px; }
        .dmg-tbl { width: 100%; border-collapse: collapse; font-size: 7px; margin-top: 4px; }
        .dmg-tbl th { border: 1px solid #aaa; padding: 2px; background: #f0f0f0; text-align: center; }
        .dmg-tbl td { border: 1px solid #ccc; padding: 2px; height: 13px; text-align: center; }

        /* ══ FOOTER ══ */
        .doc-footer { text-align: center; font-size: 7px; color: #999; border-top: 1px solid #ddd; margin-top: 3mm; padding-top: 2mm; }
    </style>
</head>
<body>
<div class="page">

{{-- ═══ HEADER ═══════════════════════════════════════════════════════ --}}
<div class="page-header">
    <div class="header-logo-area">
        <div class="header-logo">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <polygon points="50,5 44,18 38,11 42,22 50,18 58,22 62,11 56,18" fill="#1a1a1a"/>
                <path d="M32,30 Q17,21 7,27 Q15,31 19,37 Q25,33 32,34" fill="#1a1a1a"/>
                <path d="M32,34 Q19,31 11,37 Q18,40 23,46 Q27,42 34,41" fill="#2a2a2a"/>
                <path d="M34,41 Q21,39 15,47 Q22,47 29,51 Q32,47 36,47" fill="#3a3a3a"/>
                <path d="M68,30 Q83,21 93,27 Q85,31 81,37 Q75,33 68,34" fill="#1a1a1a"/>
                <path d="M68,34 Q81,31 89,37 Q82,40 77,46 Q73,42 66,41" fill="#2a2a2a"/>
                <path d="M66,41 Q79,39 85,47 Q78,47 71,51 Q68,47 64,47" fill="#3a3a3a"/>
                <ellipse cx="50" cy="60" rx="24" ry="16" fill="#1a1a1a"/>
                <ellipse cx="50" cy="54" rx="13" ry="7" fill="#555"/>
                <circle cx="35" cy="70" r="5.5" fill="#222" stroke="#fff" stroke-width="1.5"/>
                <circle cx="65" cy="70" r="5.5" fill="#222" stroke="#fff" stroke-width="1.5"/>
                <path d="M26,65 Q50,88 74,65" stroke="#1a1a1a" stroke-width="3" fill="none"/>
            </svg>
        </div>
        <div>
            <div class="company-name">ATELLAS FLEET</div>
            <span class="company-sub">Location de Véhicule — Casablanca, Maroc</span>
            <span class="company-sub" style="margin-top:2px;">
                <span class="badge badge-{{ $contract->status }}">{{ ucfirst($contract->status) }}</span>
            </span>
        </div>
    </div>
    <div class="header-center">
        <div class="doc-title-fr">Contrat de Location</div>
        <div class="doc-title-ar">عقد الكراء</div>
    </div>
    <div class="header-num-area">
        <span class="num-label">Nº</span>
        <div class="num-value">{{ $contract->contract_number }}</div>
        <div style="font-size:7px; margin-top:3px; color:#555;">Émis le : {{ $contract->created_at->format('d/m/Y') }}</div>
    </div>
</div>

{{-- ═══ MAIN TWO-COLUMN ════════════════════════════════════════════════ --}}
<div class="main-grid">

    {{-- ── COL LEFT: Véhicule + Client ── --}}
    <div class="col-left">
        <div class="field-row"><div class="fl"><span class="fr">Marque :</span><span class="ar">النوع</span></div><div class="fv">{{ $contract->vehicle_name ?? '' }}</div></div>
        <div class="field-row"><div class="fl"><span class="fr">N° Immatriculation</span><span class="ar">رقم التسجيل</span></div><div class="fv">{{ $contract->vehicle_plate ?? '' }}</div></div>
        <div class="field-row"><div class="fl"><span class="fr">Lieu de livraison</span><span class="ar">مكان التسليم</span></div><div class="fv">{{ $contract->signature_city ?? '' }}</div></div>
        <div class="field-row"><div class="fl"><span class="fr">Lieu de Reprise :</span><span class="ar">مكان الاسترجاع</span></div><div class="fv">{{ $contract->signature_city ?? '' }}</div></div>
        <div class="sep"></div>
        <div class="field-row"><div class="fl"><span class="fr">NOM :</span><span class="ar">الاسم</span></div><div class="fv">{{ $contract->client_name ?? '' }}</div></div>
        <div class="field-row"><div class="fl"><span class="fr">CIN N° :</span><span class="ar">البطاقة الوطنية</span></div><div class="fv">{{ $contract->client_id_number ?? '' }}</div></div>
        <div class="field-row"><div class="fl"><span class="fr">Date de Naissance :</span><span class="ar">تاريخ الازدياد</span></div><div class="fv"></div></div>
        <div class="field-row"><div class="fl"><span class="fr">Profession :</span><span class="ar">المهنة</span></div><div class="fv"></div></div>
        <div class="field-row"><div class="fl"><span class="fr">Adresse au Maroc :</span><span class="ar">العنوان بالمغرب</span></div><div class="fv" style="font-size:7.5px;">{{ $contract->client_address ?? '' }}</div></div>
        <div class="field-row"><div class="fl"><span class="fr">Adresse à l'Étranger :</span><span class="ar">العنوان بالخارج</span></div><div class="fv"></div></div>
        <div class="field-row"><div class="fl"><span class="fr">Permis de Conduire N° :</span></div><div class="fv">{{ $contract->client_license_number ?? '' }}</div></div>
        <div class="field-row"><div class="fl"><span class="fr">Délivré à :</span><span class="ar">أصدارها في</span></div><div class="fv"></div></div>
        <div class="field-row"><div class="fl"><span class="fr">Le :</span><span class="ar">بتاريخ</span></div><div class="fv">@if($contract->client_license_expiry){{ $contract->client_license_expiry->format('d/m/Y') }}@endif</div></div>
        <div class="field-row"><div class="fl"><span class="fr">Passport N° :</span><span class="ar">رقم جواز السفر</span></div><div class="fv"></div></div>
        <div class="field-row"><div class="fl"><span class="fr">Délivré à :</span><span class="ar">أصدارها في</span></div><div class="fv"></div></div>
        <div class="field-row"><div class="fl"><span class="fr">Le :</span><span class="ar">بتاريخ</span></div><div class="fv"></div></div>
        <div class="field-row"><div class="fl"><span class="fr">Nationalité :</span><span class="ar">الجنسية</span></div><div class="fv">{{ $contract->client_nationality ?? '' }}</div></div>
        <div class="field-row"><div class="fl"><span class="fr">Téléphone de Contrat :</span><span class="ar">هاتف الاتصال</span></div><div class="fv">{{ $contract->client_phone ?? '' }}</div></div>
    </div>

    {{-- ── COL RIGHT: Dates + KM ── --}}
    <div class="col-right">
        @php $days = max(1, $contract->start_date->diffInDays($contract->end_date)); @endphp
        <table class="date-table">
            <thead>
                <tr>
                    <th style="text-align:left; width:44%;">Désignation / البيان</th>
                    <th>J</th><th>M</th><th>A</th><th>H</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="rl"><span class="fr">Départ</span><span class="ar">الانطلاق</span></td>
                    <td class="vc">{{ $contract->start_date->format('d') }}</td>
                    <td class="vc">{{ $contract->start_date->format('m') }}</td>
                    <td class="vc">{{ $contract->start_date->format('Y') }}</td>
                    <td class="vc">{{ $contract->start_date->format('H:i') }}</td>
                </tr>
                <tr>
                    <td class="rl"><span class="fr">Retour Prévu</span><span class="ar">الرجوع الموقع</span></td>
                    <td class="vc">{{ $contract->end_date->format('d') }}</td>
                    <td class="vc">{{ $contract->end_date->format('m') }}</td>
                    <td class="vc">{{ $contract->end_date->format('Y') }}</td>
                    <td class="vc"></td>
                </tr>
                <tr>
                    <td class="rl"><span class="fr">Retour Définitif</span><span class="ar">الرجوع النهائي</span></td>
                    <td class="vc"></td><td class="vc"></td><td class="vc"></td><td class="vc"></td>
                </tr>
                <tr>
                    <td class="rl"><span class="fr">Durée</span><span class="ar">المدة</span></td>
                    <td class="vc" colspan="4" style="text-align:center; font-weight:bold;">{{ $days }} jour{{ $days > 1 ? 's' : '' }}</td>
                </tr>
            </tbody>
        </table>

        {{-- KM --}}
        <table class="km-table">
            <tr>
                <td class="kl"><span class="ar">عدد الكيلومترات عند الرجوع</span><span class="fr">KILOMÉTRAGE RETOUR:</span></td>
                <td class="kv">{{ $contract->mileage_end ? number_format($contract->mileage_end) . ' km' : '' }}</td>
            </tr>
            <tr>
                <td class="kl"><span class="ar">عدد الكيلومترات عند الذهاب</span><span class="fr">KILOMÉTRAGE DÉPART:</span></td>
                <td class="kv">{{ $contract->mileage_start ? number_format($contract->mileage_start) . ' km' : '' }}</td>
            </tr>
            <tr>
                <td class="kl"><span class="ar">عدد الكيلومترات المقطوعة</span><span class="fr">KILOMÉTRAGE PARCOURU:</span></td>
                <td class="kv">@if($contract->mileage_start && $contract->mileage_end){{ number_format($contract->mileage_end - $contract->mileage_start) }} km@endif</td>
            </tr>
            <tr>
                <td class="kl"><span class="fr">Niveau Carburant / مستوى الوقود</span></td>
                <td class="kv">{{ $contract->fuel_level_start ?? '' }}</td>
            </tr>
            <tr>
                <td class="kl"><span class="fr">Assurance / التأمين</span></td>
                <td class="kv">{{ $contract->insurance_type ?? '' }}</td>
            </tr>
            <tr>
                <td class="kl"><span class="fr">Tarif Journalier / الأجرة اليومية</span></td>
                <td class="kv">{{ number_format($contract->daily_rate, 2) }} {{ $contract->currency }}</td>
            </tr>
        </table>
    </div>
</div>

{{-- ═══ DRIVER SUPPLÉMENTAIRE + PAIEMENT ═══════════════════════════════ --}}
<div class="dp-grid">

    {{-- Conducteur supplémentaire --}}
    <div class="dp-col">
        <div class="sec-head"><span class="sf">Le Conducteur Supplémentaire</span><span class="sa">السائق المرخـص</span></div>
        <div class="field-row"><div class="fl"><span class="fr">Nom &amp; Prénom :</span><span class="ar">الاسم الشخصي والعائلي</span></div><div class="fv"></div></div>
        <div class="field-row"><div class="fl"><span class="fr">Permis de conduire N° :</span><span class="ar">رخصة السياقة رقم</span></div><div class="fv"></div></div>
        <div class="field-row"><div class="fl"><span class="fr">Délivré à :</span><span class="ar">إصدارها في</span></div><div class="fv"></div></div>
        <div class="field-row"><div class="fl"><span class="fr">Passeport N° :</span><span class="ar">رقم جواز السفر</span></div><div class="fv"></div></div>
        <div class="field-row"><div class="fl"><span class="fr">C.I.N n° :</span><span class="ar">البطاقة الوطنية</span></div><div class="fv"></div></div>
    </div>

    {{-- Paiement --}}
    <div class="dp-col">
        <div class="sec-head"><span class="sf">Paiment</span><span class="sa">الأداء</span></div>
        <div class="pay-row">
            <div class="pl"><span class="fr">* Espèce :</span><span class="ar">نقدا</span></div>
            <div class="pv">@if($contract->booking_payment_status === 'paid') ✓ @endif</div>
        </div>
        <div class="pay-row">
            <div class="pl"><span class="fr">* Chèque :</span><span class="ar">شيكا</span></div>
            <div class="pv"></div>
        </div>
        <div class="pay-row">
            <div class="pl"><span class="fr">* Caution :</span><span class="ar">ضمانة</span></div>
            <div class="pv">{{ $contract->deposit_amount ? number_format($contract->deposit_amount, 2) . ' ' . $contract->currency : '' }}</div>
        </div>
        @php
            $totalTTC  = (float)$contract->total_amount;
            $totalHT   = $totalTTC / 1.20;
            $taxAmount = $totalTTC - $totalHT;
        @endphp
        <div class="totals-inner">
            <div class="tot-row"><span>Total Hors Taxe</span><span style="font-weight:bold;">{{ number_format($totalHT, 2) }} Dh</span></div>
            <div class="tot-row"><span>Taxe TVA 20%</span><span style="font-weight:bold;">{{ number_format($taxAmount, 2) }} Dh</span></div>
            <div class="tot-row tot-grand"><span>TOTAL DE LOCATION ............</span><span>{{ number_format($totalTTC, 2) }} Dh</span></div>
        </div>
        <div class="fait-a">
            <div style="flex:1;">Fait à {{ $contract->signature_city ?: 'Casablanca' }} le {{ $contract->start_date->format('d/m/Y') }}</div>
            <div style="flex:1; text-align:center; border-left:1px solid #ddd; padding-left:5px;">
                <div style="font-weight:bold; font-size:7.5px;">Le responsable</div>
                @if($contract->signature_agent_start)
                    <img src="{{ $contract->signature_agent_start }}" style="max-height:26px; max-width:75px; margin-top:2px;">
                @else
                    <div style="margin-top:18px;"></div>
                @endif
            </div>
        </div>
    </div>
</div>

{{-- ═══ CONDITIONS + SIGNATURE CLIENT ════════════════════════════════ --}}
<div class="cs-grid">
    <div class="cond-box">
        <div style="font-size:7.5px; font-weight:bold; margin-bottom:2px; border-bottom:1px solid #ccc; padding-bottom:2px;">
            Conditions Générales de Location / الشروط العامة للكراء
        </div>
        @if($contract->conditions_text)
            <div class="cond-text">{!! nl2br(e($contract->conditions_text)) !!}</div>
        @else
            <div class="cond-text">
                Je reconnais avoir pris Connaissance des présentes conditions générales (recto verso) que je m'engage à les respecter.<br><br>
                <strong>1.</strong> Le Locataire reconnaît avoir reçu le véhicule en bon état de marche, propre et tel que décrit.<br>
                <strong>2.</strong> Le Locataire est responsable de tout dommage survenu pendant la location, y compris les amendes.<br>
                <strong>3.</strong> Le véhicule doit être restitué à la date et au lieu convenus. Tout retard entraîne une facturation supplémentaire.<br>
                <strong>4.</strong> Le carburant doit être restitué au même niveau. Tout manque sera facturé.<br>
                <strong>5.</strong> Franchise sinistre : <strong>{{ $contract->insurance_deductible ? number_format($contract->insurance_deductible, 2) . ' ' . $contract->currency : '2 000,00 MAD' }}</strong>.<br>
                <strong>6.</strong> Interdiction de sous-louer ou confier le véhicule à un tiers non autorisé.<br>
                <strong>7.</strong> Caution de <strong>{{ number_format($contract->deposit_amount, 2) }} {{ $contract->currency }}</strong> restituée après vérification.<br>
                <strong>8.</strong> En cas de panne ou accident, contacter l'agence immédiatement.<br>
                <br>
                <span style="direction:rtl; display:block; text-align:right; font-size:6.5px; color:#555;">
                أعترف بإطلاعي الكامل للقانون العام لكراء السيارات في ظهر هذا العقد والتزامي باحترامه
                </span>
            </div>
        @endif
    </div>
    <div class="sig-area">
        <div class="sig-lbl">Signature de Client — إمضاء الزبون</div>
        <div class="sig-img">
            @if($contract->signature_client_start)
                <img src="{{ $contract->signature_client_start }}" alt="Signature Client">
            @endif
        </div>
        <div class="sig-inf">
            Nom : {{ $contract->client_name }}<br>
            Date : {{ $contract->start_date->format('d/m/Y') }}
        </div>
        @if($contract->status === 'completed')
            <div style="margin-top:5px; border-top:1px solid #ddd; padding-top:3px;">
                <div class="sig-lbl">Signature Retour — توقيع عند الإرجاع</div>
                <div class="sig-img">
                    @if($contract->signature_client_end)
                        <img src="{{ $contract->signature_client_end }}" alt="Signature Retour">
                    @endif
                </div>
                <div class="sig-inf">Date retour : {{ $contract->end_date->format('d/m/Y') }}</div>
            </div>
        @endif
    </div>
</div>

{{-- ═══ INSPECTION VÉHICULE (DÉPART / DOMMAGES / RETOUR) ═══════════════ --}}
@php
    $startCond = is_array($contract->condition_start) ? $contract->condition_start : [];
    $endCond   = is_array($contract->condition_end)   ? $contract->condition_end   : [];
@endphp
<div class="insp-wrap">

    {{-- DÉPART --}}
    <div class="insp-col depart">
        <div class="insp-title">← DÉPART</div>
        <div class="insp-sub">Véhicule En parfait état</div>
        <div class="on-box">
            Oui <span class="chk">{{ count($startCond) === 0 ? '✓' : '' }}</span>
            Non <span class="chk">{{ count($startCond) > 0 ? '✓' : '' }}</span>
        </div>
        <div class="insp-note">(Rayer la mention inutile)</div>
        <div class="car-wrap">
            <svg viewBox="0 0 90 160" xmlns="http://www.w3.org/2000/svg" style="width:70px; height:auto;">
                <text x="45" y="9" text-anchor="middle" font-size="6" fill="#666" font-family="sans-serif">AVANT</text>
                <polygon points="45,13 78,38 80,140 10,140 12,38" fill="#e8e8e8" stroke="#555" stroke-width="1.2"/>
                <rect x="22" y="34" width="46" height="32" rx="3" fill="#c8ddf0" stroke="#7ab" stroke-width="0.8"/>
                <rect x="10" y="47" width="9" height="14" rx="2" fill="#444"/>
                <rect x="71" y="47" width="9" height="14" rx="2" fill="#444"/>
                <rect x="17" y="71" width="56" height="5" rx="1.5" fill="#aaa"/>
                <rect x="22" y="83" width="46" height="40" rx="3" fill="#c8ddf0" stroke="#7ab" stroke-width="0.8"/>
                <rect x="9" y="98" width="9" height="16" rx="2" fill="#444"/>
                <rect x="72" y="98" width="9" height="16" rx="2" fill="#444"/>
                <rect x="17" y="127" width="56" height="5" rx="1.5" fill="#aaa"/>
                <text x="45" y="156" text-anchor="middle" font-size="6" fill="#666" font-family="sans-serif">ARRIÈRE</text>
                @foreach($startCond as $i => $dmg)
                    <circle cx="{{ 25 + ($i % 4) * 12 }}" cy="{{ 60 + floor($i / 4) * 20 }}" r="4" fill="rgba(220,50,50,0.65)" stroke="#c00" stroke-width="0.8"/>
                    <text x="{{ 25 + ($i % 4) * 12 }}" y="{{ 63 + floor($i / 4) * 20 }}" text-anchor="middle" font-size="5" fill="#fff">{{ $i + 1 }}</text>
                @endforeach
            </svg>
        </div>
        <div style="font-size:6.5px; color:#555; margin-bottom:2px;">Commentaires — numérotez les dommages :</div>
        <div class="num-list">
            @foreach($startCond as $i => $dmg)
                <div>{{ $i+1 }}. {{ $dmg['zone'] ?? ($dmg['label'] ?? '') }}{{ !empty($dmg['description']) ? ' — '.$dmg['description'] : '' }}</div>
            @endforeach
            @for($i = count($startCond)+1; $i <= 5; $i++)
                <div>{{ $i }}. ................................................</div>
            @endfor
        </div>
    </div>

    {{-- DOMMAGES IDENTIFIÉS ET ACCEPTÉS --}}
    <div class="insp-col damages">
        <div class="insp-title" style="font-size:7.5px;">DOMMAGES IDENTIFIÉS ET ACCEPTÉS</div>
        <div class="dmg-item"><span class="chk"></span><span style="text-decoration:line-through; color:#999;">// Éraflure</span></div>
        <div class="dmg-item"><span class="chk"></span><span>✕ Bosse</span></div>
        <div class="dmg-item"><span class="chk"></span><span>□ Manque</span></div>
        <table class="dmg-tbl">
            <tr><th>Nombre</th><th>Paraphe Client</th></tr>
            @for($r = 0; $r < 6; $r++)
            <tr><td></td><td></td></tr>
            @endfor
        </table>
    </div>

    {{-- RETOUR --}}
    <div class="insp-col retour">
        <div class="insp-title">RETOUR →</div>
        <div class="insp-sub">Véhicule En parfait état</div>
        <div class="on-box">
            Oui <span class="chk">{{ count($endCond) === 0 ? '✓' : '' }}</span>
            Non <span class="chk">{{ count($endCond) > 0 ? '✓' : '' }}</span>
        </div>
        <div class="insp-note">( Rayer la mention inutile )</div>
        <div class="car-wrap">
            <svg viewBox="0 0 90 160" xmlns="http://www.w3.org/2000/svg" style="width:70px; height:auto;">
                <text x="45" y="9" text-anchor="middle" font-size="6" fill="#666" font-family="sans-serif">AVANT</text>
                <polygon points="45,13 78,38 80,140 10,140 12,38" fill="#e8e8e8" stroke="#555" stroke-width="1.2"/>
                <rect x="22" y="34" width="46" height="32" rx="3" fill="#c8ddf0" stroke="#7ab" stroke-width="0.8"/>
                <rect x="10" y="47" width="9" height="14" rx="2" fill="#444"/>
                <rect x="71" y="47" width="9" height="14" rx="2" fill="#444"/>
                <rect x="17" y="71" width="56" height="5" rx="1.5" fill="#aaa"/>
                <rect x="22" y="83" width="46" height="40" rx="3" fill="#c8ddf0" stroke="#7ab" stroke-width="0.8"/>
                <rect x="9" y="98" width="9" height="16" rx="2" fill="#444"/>
                <rect x="72" y="98" width="9" height="16" rx="2" fill="#444"/>
                <rect x="17" y="127" width="56" height="5" rx="1.5" fill="#aaa"/>
                <text x="45" y="156" text-anchor="middle" font-size="6" fill="#666" font-family="sans-serif">ARRIÈRE</text>
                @foreach($endCond as $i => $dmg)
                    <circle cx="{{ 25 + ($i % 4) * 12 }}" cy="{{ 60 + floor($i / 4) * 20 }}" r="4" fill="rgba(220,50,50,0.65)" stroke="#c00" stroke-width="0.8"/>
                    <text x="{{ 25 + ($i % 4) * 12 }}" y="{{ 63 + floor($i / 4) * 20 }}" text-anchor="middle" font-size="5" fill="#fff">{{ $i + 1 }}</text>
                @endforeach
            </svg>
        </div>
        <div style="font-size:6.5px; color:#555; margin-bottom:2px;">Commentaires — numérotez les dommages :</div>
        <div class="num-list">
            @foreach($endCond as $i => $dmg)
                <div>{{ $i+1 }}. {{ $dmg['zone'] ?? ($dmg['label'] ?? '') }}{{ !empty($dmg['description']) ? ' — '.$dmg['description'] : '' }}</div>
            @endforeach
            @for($i = count($endCond)+1; $i <= 5; $i++)
                <div>{{ $i }}. ................................................</div>
            @endfor
        </div>
    </div>

</div>{{-- /insp-wrap --}}

{{-- ═══ FOOTER ═════════════════════════════════════════════════════════ --}}
<div class="doc-footer">
    Document généré le {{ now()->format('d/m/Y à H:i') }} —
    Contrat N° {{ $contract->contract_number }} —
    Atellas Fleet S.A.R.L · Casablanca, Maroc
</div>

</div>{{-- /page --}}
</body>
</html>
