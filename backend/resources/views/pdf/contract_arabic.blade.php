<!DOCTYPE html>
<html lang="ar" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>عقد الكراء — Contrat de Location {{ $contract->contract_number }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Montserrat:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        @page {
            size: A4 portrait;
            margin: 4mm 6mm;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        body {
            font-family: 'Cairo', 'Montserrat', 'DejaVu Sans', Arial, Tahoma, sans-serif;
            font-size: 8px;
            color: #000;
            background: #fff;
            line-height: 1.25;
        }
        .page {
            width: 100%;
            max-width: 202mm;
            margin: 0 auto;
            padding: 2mm 0;
        }

        /* ═══ TOP HEADER ═══ */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 2mm;
        }
        .header-table td {
            vertical-align: top;
        }
        .header-left {
            width: 44%;
            padding-right: 8px;
        }
        .header-logo-wrap {
            text-align: center;
            margin-bottom: 2px;
        }
        .header-logo-img {
            max-width: 100%;
            max-height: 38px;
            object-fit: contain;
        }
        .company-title {
            font-family: 'Montserrat', sans-serif;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 1px;
            color: #111;
            text-align: center;
            text-transform: uppercase;
        }
        .company-addr {
            font-size: 7.5px;
            font-weight: 600;
            color: #222;
            text-align: center;
            margin-top: 1px;
        }
        .company-tel {
            font-size: 8px;
            font-weight: 700;
            color: #111;
            text-align: center;
            margin-top: 1px;
        }

        .header-right {
            width: 56%;
            padding-left: 6px;
            border-left: 1px solid #ccc;
        }
        .rlv-brand {
            font-family: 'Montserrat', sans-serif;
            font-size: 16px;
            font-weight: 900;
            color: #e11d48;
            letter-spacing: 0.5px;
            display: inline-block;
        }
        .rlv-sub {
            font-family: 'Montserrat', sans-serif;
            font-size: 13px;
            font-weight: 700;
            color: #111;
            margin-left: 4px;
        }
        .legal-ar {
            font-size: 6.5px;
            color: #222;
            direction: rtl;
            text-align: justify;
            line-height: 1.25;
            font-weight: 600;
            margin-top: 2px;
            font-family: 'Cairo', Tahoma, sans-serif;
        }
        .legal-fr {
            font-size: 5.8px;
            color: #333;
            text-align: justify;
            line-height: 1.15;
            margin-top: 2px;
        }

        /* ═══ TITLE BAR ═══ */
        .title-bar {
            width: 100%;
            border: 1.5px solid #000;
            background: #fff;
            padding: 3px 10px;
            margin-bottom: 2mm;
            display: table;
        }
        .title-cell-fr {
            display: table-cell;
            width: 35%;
            font-family: 'Montserrat', sans-serif;
            font-size: 13px;
            font-weight: 800;
            vertical-align: middle;
        }
        .title-cell-ar {
            display: table-cell;
            width: 35%;
            font-family: 'Cairo', sans-serif;
            font-size: 14px;
            font-weight: 900;
            text-align: center;
            direction: rtl;
            vertical-align: middle;
        }
        .title-cell-num {
            display: table-cell;
            width: 30%;
            text-align: right;
            vertical-align: middle;
        }
        .num-red {
            color: #b91c1c;
            font-size: 11px;
            font-weight: 900;
            margin-right: 4px;
        }
        .num-box {
            display: inline-block;
            border: 1.5px solid #000;
            padding: 1px 8px;
            font-size: 11px;
            font-weight: 800;
            font-family: monospace;
            background: #fafafa;
        }

        /* ═══ MAIN TWO-COLUMN FORM ═══ */
        .main-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #000;
            margin-bottom: 2mm;
        }
        .col-cell {
            vertical-align: top;
            padding: 0;
        }
        .col-left {
            width: 50%;
            border-right: 1.5px solid #000;
        }
        .col-right {
            width: 50%;
        }

        /* ═══ FIELD ROWS ═══ */
        .row-item {
            width: 100%;
            border-bottom: 1px solid #777;
            display: table;
            table-layout: fixed;
            min-height: 14px;
        }
        .row-item:last-child {
            border-bottom: none;
        }
        .row-lbl-fr {
            display: table-cell;
            width: 38%;
            padding: 1.5px 3px;
            font-size: 7.2px;
            font-weight: 700;
            vertical-align: middle;
            color: #000;
        }
        .row-val {
            display: table-cell;
            width: 34%;
            padding: 1.5px 2px;
            font-size: 7.8px;
            font-weight: 800;
            color: #000;
            vertical-align: middle;
        }
        .row-lbl-ar {
            display: table-cell;
            width: 28%;
            padding: 1.5px 3px;
            font-size: 7.4px;
            font-weight: 700;
            direction: rtl;
            text-align: right;
            vertical-align: middle;
            font-family: 'Cairo', Tahoma, sans-serif;
            color: #000;
        }
        .sep-thick {
            border-bottom: 1.5px solid #000 !important;
        }

        /* ═══ DATES TABLE (TOP RIGHT) ═══ */
        .date-grid {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 1.5px solid #000;
        }
        .date-grid th, .date-grid td {
            border: 1px solid #777;
            padding: 1.5px 2px;
            text-align: center;
            font-size: 7.5px;
        }
        .date-grid th {
            background: #f1f5f9;
            font-weight: 800;
            font-size: 8px;
        }
        .date-grid td.date-lbl {
            text-align: left;
            padding-left: 4px;
            padding-right: 4px;
            width: 52%;
        }
        .date-grid td.date-cell {
            width: 12%;
            font-weight: 800;
            font-family: monospace;
        }
        .lbl-dual {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .lbl-dual .fr { font-weight: 700; font-size: 7.2px; }
        .lbl-dual .ar { font-weight: 700; font-size: 7.4px; direction: rtl; font-family: 'Cairo', sans-serif; }

        /* ═══ KILOMETRAGE SECTION ═══ */
        .km-section {
            width: 100%;
            border-bottom: 1.5px solid #000;
            padding: 2px 3px;
        }
        .km-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 2px;
        }
        .km-row:last-child {
            margin-bottom: 0;
        }
        .km-label-box {
            font-size: 6.8px;
            font-weight: 700;
            line-height: 1.15;
            flex: 1;
        }
        .km-label-box .ar {
            display: block;
            direction: rtl;
            font-size: 7px;
            font-weight: 700;
            font-family: 'Cairo', sans-serif;
        }
        .km-digits {
            display: flex;
            gap: 1px;
        }
        .km-digit-cell {
            width: 13px;
            height: 13px;
            border: 1px solid #000;
            text-align: center;
            line-height: 12px;
            font-size: 8px;
            font-weight: 800;
            font-family: monospace;
            background: #fff;
        }

        /* ═══ CONDUCTEUR SUPPLEMENTAIRE ═══ */
        .supp-header {
            background: #f1f5f9;
            border-bottom: 1px solid #000;
            padding: 2px 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .supp-title-fr {
            font-size: 7.8px;
            font-weight: 800;
            text-transform: uppercase;
        }
        .supp-title-ar {
            font-size: 8px;
            font-weight: 800;
            direction: rtl;
            font-family: 'Cairo', sans-serif;
        }

        /* ═══ PAYMENT & TOTALS SECTION ═══ */
        .bottom-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #000;
            margin-bottom: 2mm;
        }
        .pay-header {
            background: #f1f5f9;
            border-bottom: 1px solid #777;
            padding: 2px 5px;
            display: flex;
            justify-content: space-between;
            font-weight: 800;
            font-size: 8px;
        }
        .pay-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5px 4px;
            border-bottom: 1px dotted #ccc;
            font-size: 7.5px;
        }
        .chk-box {
            display: inline-block;
            width: 10px;
            height: 10px;
            border: 1px solid #000;
            vertical-align: middle;
            text-align: center;
            line-height: 9px;
            font-size: 8px;
            font-weight: bold;
            margin-right: 3px;
        }
        .terms-box {
            padding: 3px 4px;
            font-size: 6.2px;
            line-height: 1.25;
            border-top: 1px solid #777;
        }
        .terms-ar {
            direction: rtl;
            text-align: right;
            font-family: 'Cairo', sans-serif;
            font-weight: 700;
            margin-top: 1px;
            font-size: 6.8px;
        }
        .sig-client-row {
            padding: 2px 4px;
            border-top: 1px solid #777;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 7.5px;
            font-weight: 800;
        }
        .sig-client-area {
            min-height: 28px;
            text-align: center;
            padding: 2px;
        }

        /* TOTALS (RIGHT SIDE) */
        .tot-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2.5px 6px;
            border-bottom: 1px solid #777;
            font-size: 7.8px;
        }
        .tot-row.grand {
            font-weight: 900;
            font-size: 8.5px;
            border-bottom: 1.5px solid #000;
            background: #fafafa;
        }
        .fait-tanger {
            padding: 3px 6px;
            font-size: 7.5px;
            font-weight: 700;
            border-bottom: 1px solid #777;
        }
        .resp-area {
            padding: 2px 6px;
            text-align: center;
        }
        .resp-title {
            font-size: 7.5px;
            font-weight: 800;
            margin-bottom: 1px;
        }
        .resp-sig-box {
            min-height: 26px;
        }

        /* ═══ INSPECTION VEHICULE (BOTTOM) ═══ */
        .insp-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #000;
        }
        .insp-cell {
            vertical-align: top;
            padding: 3px;
        }
        .insp-depart {
            width: 37%;
            border-right: 1px solid #000;
        }
        .insp-damages {
            width: 26%;
            border-right: 1px solid #000;
            padding: 2px;
        }
        .insp-retour {
            width: 37%;
        }
        .insp-arrow-head {
            font-size: 8.5px;
            font-weight: 900;
            letter-spacing: 0.5px;
            margin-bottom: 1px;
        }
        .insp-etat {
            font-size: 7px;
            font-weight: 700;
        }
        .insp-oui-non {
            display: inline-flex;
            gap: 4px;
            margin-left: 3px;
        }
        .insp-notice {
            font-size: 6px;
            color: #555;
            font-style: italic;
            margin-bottom: 2px;
        }
        .insp-comm-title {
            font-size: 6.2px;
            font-weight: 600;
            line-height: 1.15;
            margin-bottom: 2px;
        }
        .line-dots {
            font-size: 6.5px;
            color: #333;
            line-height: 1.35;
        }

        .car-svg-wrap {
            text-align: center;
            margin: 2px 0;
        }
        .dmg-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 6.5px;
            margin-top: 3px;
        }
        .dmg-table th, .dmg-table td {
            border: 1px solid #777;
            padding: 1.5px;
            text-align: center;
            height: 12px;
        }
        .dmg-table th {
            background: #f1f5f9;
            font-weight: 800;
            font-size: 6.8px;
        }

        @media print {
            body {
                margin: 0;
                padding: 0;
            }
            .page {
                padding: 0;
            }
        }
    </style>
</head>
<body>

@php
    // Logo resolution (Base64 for full portability)
    $logoFile = public_path('images/rlv-emblem.png');
    if (!file_exists($logoFile)) {
        $logoFile = public_path('rlv-emblem.png');
    }
    $logoSrc = file_exists($logoFile) ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoFile)) : '';

    $wordmarkFile = public_path('images/rlv-wordmark.png');
    if (!file_exists($wordmarkFile)) {
        $wordmarkFile = public_path('rlv-wordmark.png');
    }
    $wordmarkSrc = file_exists($wordmarkFile) ? 'data:image/png;base64,' . base64_encode(file_get_contents($wordmarkFile)) : '';

    // Car inspection outline resolution (Base64 for DomPDF & print portability)
    $carImgFile = public_path('images/car-inspection.png');
    if (!file_exists($carImgFile)) {
        $carImgFile = public_path('car-inspection.png');
    }
    $carImgSrc = file_exists($carImgFile) ? 'data:image/png;base64,' . base64_encode(file_get_contents($carImgFile)) : asset('images/car-inspection.png');

    // Durations
    $start = \Carbon\Carbon::parse($contract->start_date);
    $end   = \Carbon\Carbon::parse($contract->end_date);
    $days  = max(1, $start->diffInDays($end));

    // Totals
    $totalTTC  = (float) $contract->total_amount;
    $totalHT   = $totalTTC / 1.20;
    $tvaAmount = $totalTTC - $totalHT;

    // Helper for km digits
    $formatDigits = function($km) {
        $str = $km ? strval($km) : '';
        $padded = str_pad($str, 6, ' ', STR_PAD_LEFT);
        return str_split($padded);
    };

    $kmDepDigits = $formatDigits($contract->mileage_start);
    $kmRetDigits = $formatDigits($contract->mileage_end);
    $kmParcouru  = ($contract->mileage_start && $contract->mileage_end) ? ($contract->mileage_end - $contract->mileage_start) : null;
    $kmParDigits = $formatDigits($kmParcouru);

    // Number extraction for contract
    $cleanNumber = preg_replace('/[^0-9]/', '', $contract->contract_number);
    $formattedContractNum = $cleanNumber ? str_pad($cleanNumber, 5, '0', STR_PAD_LEFT) : $contract->contract_number;
@endphp

<div class="page">

    {{-- ═══ TOP HEADER (RLV & TANGER) ═══ --}}
    <table class="header-table">
        <tr>
            <td class="header-left">
                <div class="header-logo-wrap">
                    @if($logoSrc)
                        <img src="{{ $logoSrc }}" alt="RLV Emblem" class="header-logo-img">
                    @endif
                </div>
                <div class="company-title">RAHIMI LOCATION DE VOITURE</div>
                <div class="company-addr">LOT EL NAHDA RUE 37 N°12 BLOC38, Tanger</div>
                <div class="company-tel">Tel: 06 77 81 37 18 / 07 77 57 33 79</div>
            </td>
            <td class="header-right">
                <div style="text-align:center; margin-bottom:2px;">
                    @if($wordmarkSrc)
                        <img src="{{ $wordmarkSrc }}" alt="RLV" style="height:18px; vertical-align:middle; margin-right:4px;">
                    @else
                        <span class="rlv-brand">RLV</span>
                    @endif
                    <span class="rlv-sub">Location de voiture</span>
                </div>
                <div class="legal-ar">
                    المكتري للسيارة يتابع قضائيا 24 ساعة بعد انتهاء العقد وفي حالة تمديد المدة يجب اخبار شركة R.L.V وأداء مبلغ المدة الاضافية ويبقى المكتري هو المسؤول الوحيد عن اي حادثة بعد تمديد دون اشعار الشركة للمكتري الصلاحية في قيادة السيارة لا غير ولا يسمح له بتسليمها لشخص اخر
                </div>
                <div class="legal-fr">
                    Le Locataire s'expose à des poursuites juridiques 24 heures après la date convenu au départ si le véhicule n'est toujours pas retourné et cela sans que RLV ait été informé d'un prolongation de location et ait reçue la somme supplémentaire due. - En cas de Forfait, le locataire est responsable de tous dégâts matériels d'après la deuxième signature. - Le véhicule ne doit être conduit que par le locataire.
                </div>
            </td>
        </tr>
    </table>

    {{-- ═══ TITLE BAR ═══ --}}
    <div class="title-bar">
        <div class="title-cell-fr">Contrat de Location</div>
        <div class="title-cell-ar">عقد الكـــــراء</div>
        <div class="title-cell-num">
            <span class="num-red">Nº</span>
            <div class="num-box">{{ $formattedContractNum }}</div>
        </div>
    </div>

    {{-- ═══ MAIN 2-COLUMN FORM ═══ --}}
    <table class="main-table">
        <tr>
            {{-- ── COL GAUCHE : VÉHICULE & CLIENT ── --}}
            <td class="col-cell col-left">
                {{-- Véhicule --}}
                <div class="row-item">
                    <span class="row-lbl-fr">Marque :</span>
                    <span class="row-val">{{ $contract->vehicle_name ?? '' }}</span>
                    <span class="row-lbl-ar">نوع</span>
                </div>
                <div class="row-item">
                    <span class="row-lbl-fr">N° Immatriculation :</span>
                    <span class="row-val">{{ $contract->vehicle_plate ?? '' }}</span>
                    <span class="row-lbl-ar">رقم التسجيل</span>
                </div>
                <div class="row-item">
                    <span class="row-lbl-fr">Lieu de Livraison :</span>
                    <span class="row-val">{{ $contract->signature_city ?: 'Tanger' }}</span>
                    <span class="row-lbl-ar">مكان التسليم</span>
                </div>
                <div class="row-item sep-thick">
                    <span class="row-lbl-fr">Lieu de Reprise :</span>
                    <span class="row-val">{{ $contract->signature_city ?: 'Tanger' }}</span>
                    <span class="row-lbl-ar">مكان الاسترجاع</span>
                </div>

                {{-- Client --}}
                <div class="row-item">
                    <span class="row-lbl-fr">NOM :</span>
                    <span class="row-val" style="font-weight:900;">{{ $contract->client_name ?? '' }}</span>
                    <span class="row-lbl-ar">الاسم</span>
                </div>
                <div class="row-item">
                    <span class="row-lbl-fr">CIN N° :</span>
                    <span class="row-val">{{ $contract->client_id_number ?? '' }}</span>
                    <span class="row-lbl-ar">البطاقة الوطنية</span>
                </div>
                <div class="row-item">
                    <span class="row-lbl-fr">Date de Naissance :</span>
                    <span class="row-val"></span>
                    <span class="row-lbl-ar">تاريخ الازدياد</span>
                </div>
                <div class="row-item">
                    <span class="row-lbl-fr">Profession :</span>
                    <span class="row-val"></span>
                    <span class="row-lbl-ar">المهنة</span>
                </div>
                <div class="row-item">
                    <span class="row-lbl-fr">Adresse au Maroc :</span>
                    <span class="row-val" style="font-size:7px;">{{ $contract->client_address ?? '' }}</span>
                    <span class="row-lbl-ar">العنوان بالمغرب</span>
                </div>
                <div class="row-item">
                    <span class="row-lbl-fr">Adresse à l 'Etranger :</span>
                    <span class="row-val"></span>
                    <span class="row-lbl-ar">العنوان بالخارج</span>
                </div>
                <div class="row-item">
                    <span class="row-lbl-fr">Permis de Conduire N° :</span>
                    <span class="row-val">{{ $contract->client_license_number ?? '' }}</span>
                    <span class="row-lbl-ar">رخصة السياقة رقم</span>
                </div>
                <div class="row-item">
                    <span class="row-lbl-fr">Délivré à :</span>
                    <span class="row-val"></span>
                    <span class="row-lbl-ar">اصدارها في</span>
                </div>
                <div class="row-item">
                    <span class="row-lbl-fr">Le :</span>
                    <span class="row-val">@if($contract->client_license_expiry){{ $contract->client_license_expiry->format('d/m/Y') }}@endif</span>
                    <span class="row-lbl-ar">بتاريخ</span>
                </div>
                <div class="row-item">
                    <span class="row-lbl-fr">Passport N° :</span>
                    <span class="row-val"></span>
                    <span class="row-lbl-ar">رقم جواز السفر</span>
                </div>
                <div class="row-item">
                    <span class="row-lbl-fr">Délivré à :</span>
                    <span class="row-val"></span>
                    <span class="row-lbl-ar">اصدارها في</span>
                </div>
                <div class="row-item">
                    <span class="row-lbl-fr">Le :</span>
                    <span class="row-val"></span>
                    <span class="row-lbl-ar">بتاريخ</span>
                </div>
                <div class="row-item">
                    <span class="row-lbl-fr">Téléphone de Contrat :</span>
                    <span class="row-val">{{ $contract->client_phone ?? '' }}</span>
                    <span class="row-lbl-ar">هاتف الاتصال</span>
                </div>
            </td>

            {{-- ── COL DROITE : DATES, KM, CONDUCTEUR SUPPLÉMENTAIRE ── --}}
            <td class="col-cell col-right">
                {{-- Date Table --}}
                <table class="date-grid">
                    <thead>
                        <tr>
                            <th style="width:48%; text-align:left; padding-left:4px;">Désignation / البيان</th>
                            <th>J</th>
                            <th>M</th>
                            <th>A</th>
                            <th>H</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="date-lbl">
                                <div class="lbl-dual">
                                    <span class="fr">Départ</span>
                                    <span class="ar">الانطلاق</span>
                                </div>
                            </td>
                            <td class="date-cell">{{ $start->format('d') }}</td>
                            <td class="date-cell">{{ $start->format('m') }}</td>
                            <td class="date-cell">{{ $start->format('Y') }}</td>
                            <td class="date-cell">{{ $start->format('H:i') }}</td>
                        </tr>
                        <tr>
                            <td class="date-lbl">
                                <div class="lbl-dual">
                                    <span class="fr">Retour Prevu</span>
                                    <span class="ar">الرجوع الموقع</span>
                                </div>
                            </td>
                            <td class="date-cell">{{ $end->format('d') }}</td>
                            <td class="date-cell">{{ $end->format('m') }}</td>
                            <td class="date-cell">{{ $end->format('Y') }}</td>
                            <td class="date-cell">{{ $end->format('H:i') }}</td>
                        </tr>
                        <tr>
                            <td class="date-lbl">
                                <div class="lbl-dual">
                                    <span class="fr">Retour Définitif</span>
                                    <span class="ar">الرجوع النهائي</span>
                                </div>
                            </td>
                            <td class="date-cell"></td>
                            <td class="date-cell"></td>
                            <td class="date-cell"></td>
                            <td class="date-cell"></td>
                        </tr>
                        <tr>
                            <td class="date-lbl">
                                <div class="lbl-dual">
                                    <span class="fr">Durée</span>
                                    <span class="ar">المدة</span>
                                </div>
                            </td>
                            <td colspan="4" style="text-align:center; font-weight:800; font-size:8px;">
                                {{ $days }} Jour{{ $days > 1 ? 's' : '' }} / {{ $days }} أيام
                            </td>
                        </tr>
                    </tbody>
                </table>

                {{-- Kilométrage segmenté --}}
                <div class="km-section">
                    <div class="km-row">
                        <div class="km-label-box">
                            <span class="ar">عدد الكيلومترات عند الرجوع</span>
                            <span>KILOMETRAGE RETOUR:</span>
                        </div>
                        <div class="km-digits">
                            @foreach($kmRetDigits as $d)
                                <div class="km-digit-cell">{{ $d }}</div>
                            @endforeach
                        </div>
                    </div>
                    <div class="km-row">
                        <div class="km-label-box">
                            <span class="ar">عدد الكيلومترات عند الذهاب</span>
                            <span>KILOMETRAGE DEPART:</span>
                        </div>
                        <div class="km-digits">
                            @foreach($kmDepDigits as $d)
                                <div class="km-digit-cell">{{ $d }}</div>
                            @endforeach
                        </div>
                    </div>
                    <div class="km-row">
                        <div class="km-label-box">
                            <span class="ar">عدد الكيلومترات المقطوعة</span>
                            <span>KILOMETRAGE PARCOURU:</span>
                        </div>
                        <div class="km-digits">
                            @foreach($kmParDigits as $d)
                                <div class="km-digit-cell">{{ $d }}</div>
                            @endforeach
                        </div>
                    </div>
                </div>

                {{-- Le Conducteur Supplémentaire --}}
                <div class="supp-header">
                    <span class="supp-title-fr">Le Conducteur Supplémentaire</span>
                    <span class="supp-title-ar">السائق المرخـص</span>
                </div>
                <div class="row-item">
                    <span class="row-lbl-fr">Nom &amp; Prénom :</span>
                    <span class="row-val"></span>
                    <span class="row-lbl-ar">الاسم الشخصي والعائلي</span>
                </div>
                <div class="row-item">
                    <span class="row-lbl-fr">Permis de conduire N° :</span>
                    <span class="row-val"></span>
                    <span class="row-lbl-ar">رخصة السياقة رقم</span>
                </div>
                <div class="row-item">
                    <span class="row-lbl-fr">Délivré à :</span>
                    <span class="row-val"></span>
                    <span class="row-lbl-ar">اصدارها في</span>
                </div>
                <div class="row-item">
                    <span class="row-lbl-fr">Passeport N° :</span>
                    <span class="row-val"></span>
                    <span class="row-lbl-ar">رقم جواز السفر</span>
                </div>
                <div class="row-item">
                    <span class="row-lbl-fr">C.I.N n° :</span>
                    <span class="row-val"></span>
                    <span class="row-lbl-ar">البطاقة الوطنية</span>
                </div>
            </td>
        </tr>
    </table>

    {{-- ═══ PAIEMENT & CONDITIONS & SIG (MID-BOTTOM) ═══ --}}
    <table class="bottom-table">
        <tr>
            {{-- PAIEMENT + ENGAGEMENT + SIG CLIENT (GAUCHE) --}}
            <td style="width: 50%; vertical-align: top; border-right: 1.5px solid #000;">
                <div class="pay-header">
                    <span>Paiement</span>
                    <span style="font-family:'Cairo', sans-serif;">الأداء</span>
                </div>
                <div class="pay-item">
                    <span><span class="chk-box">{{ ($contract->booking_payment_status === 'paid') ? '✓' : '' }}</span> * Espèce :</span>
                    <span style="font-family:'Cairo', sans-serif; font-weight:700;">نقدا</span>
                </div>
                <div class="pay-item">
                    <span><span class="chk-box"></span> * Chèque :</span>
                    <span style="font-family:'Cairo', sans-serif; font-weight:700;">شيكا</span>
                </div>
                <div class="pay-item">
                    <span>
                        <span class="chk-box">{{ $contract->deposit_amount > 0 ? '✓' : '' }}</span> * Caution :
                        <strong style="margin-left:4px;">{{ $contract->deposit_amount > 0 ? number_format($contract->deposit_amount, 2) . ' Dh' : '' }}</strong>
                    </span>
                    <span style="font-family:'Cairo', sans-serif; font-weight:700;">ضمانة</span>
                </div>

                <div class="terms-box">
                    <div>Je reconnais avoir pris Connaissance des présentes conditions générales (recto verso) que je m'engage à les respecter</div>
                    <div class="terms-ar">اعترف بعلمي الكامل للقانون العام لكراء السيارات في ظهر هذا العقد والتزم باحترامه</div>
                </div>

                <div class="sig-client-row">
                    <span>Signature de Client</span>
                    <span style="font-family:'Cairo', sans-serif;">إمضاء الزبون</span>
                </div>
                <div class="sig-client-area">
                    @if($contract->signature_client_start)
                        <img src="{{ $contract->signature_client_start }}" style="max-height:26px; max-width:120px;" alt="Signature Client">
                    @endif
                </div>
            </td>

            {{-- TOTAUX + FAIT A TANGER + LE RESPONSABLE (DROITE) --}}
            <td style="width: 50%; vertical-align: top;">
                <div class="tot-row">
                    <span>Total Hors Taxe</span>
                    <span style="font-weight:700;">{{ number_format($totalHT, 2) }} Dh</span>
                </div>
                <div class="tot-row">
                    <span>Taxe TVA 20%</span>
                    <span style="font-weight:700;">{{ number_format($tvaAmount, 2) }} Dh</span>
                </div>
                <div class="tot-row grand">
                    <span>TOTAL DE LOCATION</span>
                    <span>{{ number_format($totalTTC, 2) }} Dh</span>
                </div>

                <div class="fait-tanger">
                    Fait à Tanger le : <span style="font-weight:800;">{{ $start->format('d/m/Y') }}</span>
                </div>

                <div class="resp-area">
                    <div class="resp-title">Le responsable</div>
                    <div class="resp-sig-box">
                        @if($contract->signature_agent_start)
                            <img src="{{ $contract->signature_agent_start }}" style="max-height:24px; max-width:100px;" alt="Signature Responsable">
                        @endif
                    </div>
                </div>
            </td>
        </tr>
    </table>

    {{-- ═══ INSPECTION VÉHICULE (BOTTOM) ═══ --}}
    @php
        $startCond = is_array($contract->condition_start) ? $contract->condition_start : [];
        $endCond   = is_array($contract->condition_end)   ? $contract->condition_end   : [];
    @endphp
    <table class="insp-table">
        <tr>
            {{-- DÉPART --}}
            <td class="insp-cell insp-depart">
                <div class="insp-arrow-head">← DEPART</div>
                <div class="insp-etat">
                    Véhicule En parfait état
                    <span class="insp-oui-non">
                        <span>[ {{ count($startCond) === 0 ? '✓' : ' ' }} ] Oui</span>
                        <span>[ {{ count($startCond) > 0 ? '✓' : ' ' }} ] Non</span>
                    </span>
                </div>
                <div class="insp-notice">(Rayer la mention inutile)</div>
                <div class="insp-comm-title">
                    <strong>Commentaires</strong><br>
                    Positionner les numéros à l 'endroit précis du dommage, sur la matrice à gauche )
                </div>
                <div class="line-dots">
                    @for($i = 1; $i <= 5; $i++)
                        @php $dmgText = isset($startCond[$i-1]) ? ($startCond[$i-1]['zone'] ?? ($startCond[$i-1]['label'] ?? '')) : ''; @endphp
                        <div>{{ $i }} {{ $dmgText ? '· ' . $dmgText : '..........................................................' }}</div>
                    @endfor
                </div>

                {{-- Car diagram --}}
                <div class="car-svg-wrap">
                    <img src="{{ $carImgSrc }}" alt="Véhicule Inspection Départ" style="max-height: 112px; width: auto; object-fit: contain; margin: 0 auto; display: block;">
                </div>
            </td>

            {{-- DOMMAGES IDENTIFIÉS ET ACCEPTÉS --}}
            <td class="insp-cell insp-damages">
                <div style="font-size:7px; font-weight:900; text-align:center; border-bottom:1px solid #777; padding-bottom:1px; margin-bottom:2px;">
                    DOMMAGES IDENTIFIES<br>ET ACCEPTES
                </div>
                <div style="font-size:7px; margin-bottom:2px; font-weight:600;">
                    <div>// Eraflure</div>
                    <div>✕ Bosse</div>
                    <div>□ Manque</div>
                </div>
                <table class="dmg-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Paraphe Client</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td></td><td></td></tr>
                        <tr><td></td><td></td></tr>
                        <tr><td></td><td></td></tr>
                        <tr><td></td><td></td></tr>
                    </tbody>
                </table>
            </td>

            {{-- RETOUR --}}
            <td class="insp-cell insp-retour">
                <div class="insp-arrow-head">RETOUR →</div>
                <div class="insp-etat">
                    Véhicule En parfait état
                    <span class="insp-oui-non">
                        <span>[ {{ count($endCond) === 0 ? '✓' : ' ' }} ] Oui</span>
                        <span>[ {{ count($endCond) > 0 ? '✓' : ' ' }} ] Non</span>
                    </span>
                </div>
                <div class="insp-notice">(Rayer la mention inutile)</div>
                <div class="insp-comm-title">
                    <strong>Commentaires</strong><br>
                    Positionner les numéros à l 'endroit précis du dommage, sur la matrice à gauche )
                </div>
                <div class="line-dots">
                    @for($i = 1; $i <= 5; $i++)
                        @php $dmgTextEnd = isset($endCond[$i-1]) ? ($endCond[$i-1]['zone'] ?? ($endCond[$i-1]['label'] ?? '')) : ''; @endphp
                        <div>{{ $i }} {{ $dmgTextEnd ? '· ' . $dmgTextEnd : '..........................................................' }}</div>
                    @endfor
                </div>

                {{-- Car diagram --}}
                <div class="car-svg-wrap">
                    <img src="{{ $carImgSrc }}" alt="Véhicule Inspection Retour" style="max-height: 112px; width: auto; object-fit: contain; margin: 0 auto; display: block;">
                </div>
            </td>
        </tr>
    </table>

</div>

</body>
</html>
