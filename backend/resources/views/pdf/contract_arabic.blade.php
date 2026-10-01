<!DOCTYPE html>
<html lang="ar" dir="ltr">
<head>
    <meta charset="UTF-8">
    <title>عقد الكراء - Contrat de Location {{ $contract->contract_number }}</title>
    <style>
        @unless($forMpdf ?? false)
            @page { size: A4 portrait; margin: 4mm 6mm; }
        @endunless

        * { box-sizing: border-box; }
        html, body {
            margin: 0;
            padding: 0;
            color: #000;
            background: #fff;
            font-family: DejaVu Sans, Arial, Tahoma, sans-serif;
            font-size: 8.5pt;
            line-height: 1.22;
        }
        .page {
            width: 194mm;
            margin: 0 auto;
            padding: 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }
        td, th {
            vertical-align: middle;
            overflow-wrap: anywhere;
        }
        .main-contract-frame {
            width: 100%;
            border: 0.65mm solid #000;
            margin-bottom: 3.5mm;
            background: #fff;
            box-sizing: border-box;
        }
        .outer-box {
            width: 100%;
            border-collapse: collapse;
            border: none;
            margin: 0;
        }
        .outer-row > td {
            vertical-align: top;
            border-bottom: 0.55mm solid #000;
        }
        .outer-row-last > td {
            vertical-align: top;
            border-bottom: none;
        }
        .km-box-container {
            display: inline-block;
            border: 0.35mm solid #000;
            vertical-align: middle;
            background: #fff;
        }
        .digit-box {
            display: inline-block;
            width: 4.8mm;
            height: 5.2mm;
            line-height: 5.0mm;
            text-align: center;
            font-size: 8pt;
            font-weight: 700;
            font-family: DejaVu Sans Mono, monospace;
            border-right: 0.25mm solid #000;
        }
        .digit-box.last {
            border-right: none;
        }
        .thin-border { border: 0.3mm solid #222; }
        .right-border { border-right: 0.55mm solid #000; }
        .left-border { border-left: 0.55mm solid #000; }
        .bottom-border { border-bottom: 0.35mm solid #444; }
        .thick-bottom { border-bottom: 0.55mm solid #000; }
        .center { text-align: center; }
        .right { text-align: right; }
        .rtl { direction: rtl; font-family: DejaVu Sans, Tahoma, sans-serif; }
        .muted { color: #444; }
        .brand-red { color: #d91445; }
        .bold { font-weight: 700; }
        .black { font-weight: 900; }
        .small { font-size: 7.8pt; }
        .xsmall { font-size: 6.8pt; }
        .header-table td { vertical-align: top; }
        .logo { max-height: 14mm; max-width: 36mm; }
        .company-title { font-size: 8.2pt; font-weight: 900; letter-spacing: 0.3mm; text-align: center; margin-top: 1mm; margin-bottom: 1mm; }
        .company-info-table { width: auto !important; margin: 0 auto !important; border-collapse: collapse; table-layout: auto !important; }
        .company-info-table td { vertical-align: middle; }
        .company-info-icon { width: 3.5mm; text-align: center !important; padding-right: 1.5mm; vertical-align: middle; }
        .company-info-text { border-left: 0.35mm solid #000; padding-left: 1.8mm; font-size: 7.2pt; font-weight: 700; white-space: nowrap; line-height: 1.35; text-align: left !important; vertical-align: middle; }
        .rlv-brand-box { display: inline-block; text-align: center; }
        .rlv-brand { font-size: 26pt; font-weight: 900; letter-spacing: -0.3mm; line-height: 0.95; text-align: center; text-transform: uppercase; color: #000; }
        .rlv-divider { border-bottom: 0.7mm solid #000; margin: 1mm 0 1.2mm 0; width: 100%; }
        .rlv-sub { text-align: center; }
        .legal-ar { font-size: 6.6pt; line-height: 1.28; text-align: justify; }
        .legal-fr { font-size: 6.0pt; line-height: 1.2; text-align: justify; }
        .title-table td { padding: 1mm 1.5mm; }
        .title-fr { font-size: 13.5pt; font-weight: 900; text-transform: uppercase; }
        .title-ar { font-size: 14pt; font-weight: 900; }
        .num-label { font-size: 12.5pt; color: #d91445; font-weight: 900; }
        .num-val { font-size: 12.5pt; color: #d91445; font-weight: 900; font-family: DejaVu Sans Mono, monospace; }
        .field-row td {
            height: 5.8mm;
            padding: 0.8mm 1.4mm;
            border-bottom: 0.25mm dotted #555;
        }
        .field-fr { width: 38%; font-size: 7.6pt; font-weight: 700; }
        .field-value { width: 38%; font-size: 7.8pt; font-weight: 700; text-align: center; }
        .field-ar { width: 24%; font-size: 7.6pt; font-weight: 700; text-align: right; direction: rtl; }
        .section-title td {
            height: 5.8mm;
            background: #f8fafc;
            padding: 0.8mm 1.5mm;
            border-bottom: 0.35mm solid #000;
            font-size: 8pt;
            font-weight: 900;
        }
        .date-grid th, .date-grid td {
            height: 5.8mm;
            border: 0.3mm solid #444;
            padding: 0.6mm;
            text-align: center;
            font-size: 7.5pt;
        }
        .date-grid th { background: #f8fafc; font-weight: 900; }
        .date-label { text-align: left !important; }
        .km-table td {
            height: 6.8mm;
            padding: 0.8mm 1.2mm;
            border-bottom: 0.35mm solid #000;
        }
        .km-table tr.last td {
            border-bottom: none;
        }
        .km-label { font-size: 7.2pt; line-height: 1.15; }
        .digit {
            display: inline-block;
            width: 4.5mm;
            height: 4.8mm;
            line-height: 4.5mm;
            margin-left: 0.4mm;
            border: 0.2mm solid #111;
            text-align: center;
            font-size: 7.5pt;
            font-family: DejaVu Sans Mono, monospace;
            font-weight: 700;
        }
        .pay-table td { height: 5.8mm; padding: 0.8mm 1.4mm; border-bottom: 0.25mm dotted #555; font-size: 7.2pt; }
        .pay-line { border-bottom: 0.25mm dotted #555; width: 45%; }
        .check {
            display: inline-block;
            width: 3.5mm;
            height: 3.5mm;
            line-height: 3.2mm;
            border: 0.2mm solid #111;
            text-align: center;
            margin-right: 1mm;
            font-size: 7pt;
        }
        .terms { padding: 1.8mm 2mm; font-size: 6.2pt; line-height: 1.35; }
        .terms-table { width: 100%; border-collapse: collapse; }
        .terms-table td { vertical-align: top; }
        .signature-box { height: 26mm; min-height: 26mm; padding: 1.5mm 1mm; text-align: center; }
        .signature-img { max-height: 22mm; max-width: 50mm; }
        .responsable-box { padding: 1.5mm 2mm; }
        .responsable-sign-box { height: 22mm; min-height: 22mm; text-align: center; }
        .total-box { border: 0.35mm solid #000; }
        .total-row td { height: 5.6mm; padding: 0.8mm 1.6mm; border-bottom: 0.25mm dotted #555; font-size: 7.4pt; }
        .total-main td { font-size: 8.2pt; font-weight: 900; background: #f8fafc; border-bottom: none !important; }
        .inspection { border: 0.65mm solid #000; border-collapse: collapse; }
        .inspection td { vertical-align: top; }
        .inspection-car-td { height: 60mm; padding: 1mm; text-align: center; vertical-align: middle !important; }
        .inspection-text-td { height: 60mm; padding: 2mm 2.5mm; }
        .damage-center-td { height: 60mm; padding: 0; background: #fff; }
        .damage-table { width: 100%; border-collapse: collapse; }
        .damage-table th, .damage-table td {
            border: 0.2mm solid #222;
            height: 5.2mm;
            padding: 0.3mm;
            text-align: center;
            font-size: 7pt;
        }
    </style>
</head>
<body>
@php
    $imageData = function (array $paths): string {
        foreach ($paths as $path) {
            if (file_exists($path)) {
                $type = strtolower(pathinfo($path, PATHINFO_EXTENSION)) === 'jpg' ? 'jpeg' : strtolower(pathinfo($path, PATHINFO_EXTENSION));
                return 'data:image/' . $type . ';base64,' . base64_encode(file_get_contents($path));
            }
        }
        return '';
    };

    $logoSrc = $imageData([public_path('rlv-emblem.png'), public_path('images/rlv-emblem.png')]);
    $carImgSrc = $imageData([public_path('car-inspection.png'), public_path('images/car-inspection.png')]);

    $start = $contract->start_date ? \Carbon\Carbon::parse($contract->start_date) : now();
    $end = $contract->end_date ? \Carbon\Carbon::parse($contract->end_date) : now();
    $days = max(1, $start->diffInDays($end));
    $totalTTC = (float) ($contract->total_amount ?? 0);
    $totalHT = $totalTTC / 1.2;
    $tvaAmount = $totalTTC - $totalHT;
    $money = fn ($amount) => number_format((float) $amount, 2, '.', ' ') . ' Dh';
    $dateValue = fn ($value) => $value ? \Carbon\Carbon::parse($value)->format('d/m/Y') : '';
    $cleanNumber = preg_replace('/[^0-9]/', '', (string) $contract->contract_number);
    $formattedContractNum = $cleanNumber ? str_pad($cleanNumber, 5, '0', STR_PAD_LEFT) : ($contract->contract_number ?: '00151');
    $digits = function ($value): array {
        $text = $value ? (string) $value : '';
        return str_split(str_pad($text, 6, ' ', STR_PAD_LEFT));
    };
    $kmDepDigits = $digits($contract->mileage_start);
    $kmRetDigits = $digits($contract->mileage_end);
    $kmParcouru = ($contract->mileage_start && $contract->mileage_end) ? ((int) $contract->mileage_end - (int) $contract->mileage_start) : null;
    $kmParDigits = $digits($kmParcouru);
    $startCond = is_array($contract->condition_start) ? $contract->condition_start : [];
    $endCond = is_array($contract->condition_end) ? $contract->condition_end : [];

    $vehicleRows = [
        ['Marque :', $contract->vehicle_name, 'نوع'],
        ['N° Immatriculation :', $contract->vehicle_plate, 'رقم التسجيل'],
        ['Lieu de livraison :', $contract->signature_city ?: 'TANGER', 'مكان التسجيل'],
        ['Lieu de Reprise :', $contract->signature_city ?: 'TANGER', 'مكان الاسترجاع', true],
    ];

    $clientRows = [
        ['NOM :', $contract->client_name, 'الاسم'],
        ['CIN N° :', $contract->client_id_number, 'البطاقة الوطنية'],
        ['Date de Naissance :', $dateValue($contract->client_date_of_birth), 'تاريخ الازدياد'],
        ['Profession :', $contract->client_profession, 'المهنة'],
        ['Adresse au Maroc :', $contract->client_address, 'العنوان بالمغرب'],
        ["Adresse à l 'Etranger :", $contract->client_address_abroad, 'العنوان بالخارج'],
        ['Permis de Conduire N° :', $contract->client_license_number, 'رخصة السياقة رقم'],
        ['Délivré à :', $contract->client_license_issued_at, 'اصدارها في'],
        ['Le :', $dateValue($contract->client_license_expiry), 'بتاريخ'],
        ['Passport N° :', $contract->client_passport_number, 'رقم جواز السفر'],
        ['Délivré à :', $contract->client_passport_issued_at, 'اصدارها في'],
        ['Le :', $dateValue($contract->client_passport_issued_date), 'بتاريخ'],
        ['Téléphone de Contrat :', $contract->client_phone, 'هاتف الاتصال', true],
    ];

    $driverRows = [
        ['Nom & Prénom :', $contract->driver_name, 'الاسم الشخصي و العائلي'],
        ['Permis de conduire N° :', $contract->driver_permit_number, 'رخصة السياقة رقم'],
        ['Délivré à :', $contract->driver_permit_issued_at ?? '', 'إصدارها في'],
        ['Passeport N° :', $contract->driver_passport_number, 'رقم جواز السفر'],
        ['C.I.N n° :', $contract->driver_id_number, 'البطاقة الوطنية', true],
    ];
@endphp

<div class="page">
    {{-- ════ 1. HEADER ════ --}}
    <table class="header-table" style="margin-bottom: 2mm;">
        <tr>
            {{-- Left: Logo & Company Address --}}
            <td style="width: 44%; text-align: center; vertical-align: top; padding-right: 2.5mm;">
                @if($logoSrc)<img src="{{ $logoSrc }}" class="logo" alt="Logo RLV">@endif
                <div class="company-title">RAHIMI LOCATION DE VOITURE</div>
                <table class="company-info-table" align="center" style="width: auto !important; margin: 0 auto; table-layout: auto !important; border-collapse: collapse;">
                    <tr>
                        <td class="company-info-icon" style="width: 3.5mm; text-align: center; padding-right: 1.5mm; vertical-align: middle;">
                            <svg width="9" height="12" viewBox="0 0 24 24" fill="#000000" style="display: block; margin: 0 auto;">
                                <path fill="#000000" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                        </td>
                        <td class="company-info-text" style="border-left: 0.35mm solid #000; padding-left: 1.8mm; font-size: 7.2pt; font-weight: 700; white-space: nowrap; line-height: 1.35; text-align: left !important; vertical-align: middle;">LOT EL NAHDA RUE 37 N°12 BLOC38 , Tanger</td>
                    </tr>
                    <tr>
                        <td class="company-info-icon" style="width: 3.5mm; text-align: center; padding-right: 1.5mm; padding-top: 0.5mm; vertical-align: middle;">
                            <svg width="9" height="12" viewBox="0 0 24 24" fill="#000000" style="display: block; margin: 0 auto;">
                                <path fill="#000000" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                            </svg>
                        </td>
                        <td class="company-info-text" style="border-left: 0.35mm solid #000; padding-left: 1.8mm; padding-top: 0.5mm; font-size: 7.2pt; font-weight: 700; white-space: nowrap; line-height: 1.35; text-align: left !important; vertical-align: middle;">Tel: 06 77 81 37 18 / 07 77 57 33 79</td>
                    </tr>
                </table>
            </td>

            {{-- Right: Brand & Legal notices --}}
            <td style="width: 56%; vertical-align: top; padding-left: 2.5mm; text-align: center;" align="center">
                {{-- Centered Brand Title in the Right Section --}}
                <div style="width: 100%; text-align: center; margin-bottom: 1.5mm;" align="center">
                    <table align="center" style="margin: 0 auto; width: auto !important; border-collapse: collapse; text-align: center;">
                        <tr>
                            <td align="center" style="text-align: center; padding: 0;">
                                <div class="rlv-brand">RLV</div>
                                <div class="rlv-divider"></div>
                                <div class="rlv-sub">
                                    <svg width="205" height="18" viewBox="0 0 205 18" style="display: block; margin: 0 auto;">
                                        <text x="102.5" y="14" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-size="14" font-weight="bold" fill="none" stroke="#000000" stroke-width="1.0" letter-spacing="0.4">Location de voiture</text>
                                    </svg>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>

                {{-- Directly Below: Legal notices --}}
                <div class="legal-ar rtl bold" dir="rtl" style="margin-bottom: 1.2mm; text-align: right; direction: rtl; font-size: 6.8pt; line-height: 1.32;">
                    المكتري للسيارة يتابع قضائيا 24 ساعة بعد انتهاء العقد وفي حالة تمديد المدة يجب إخبار شركة R.L.V وأداء مبلغ المدة الاضافية.<br>
                    ويبقى المكتري هو المسؤول الوحيد عن أي حادثة بعد تمديد دون اشعار الشركة. للمكتري الصلاحية في قيادة السيارة لا غير ولا يسمح له بتسليمها لشخص آخر.
                </div>
                <div class="legal-fr muted" dir="ltr" style="text-align: left; direction: ltr; font-size: 5.6pt; line-height: 1.2; color: #1f2937;">
                    <div style="margin-bottom: 0.6mm;">Le Locataire s'expose à des poursuites juridiques 24 heures après la date convenu au départ si le véhicule n'est toujours pas retourné et cela sans que R.L.V ait été informé d'une prolongation de location et ait reçu la somme supplémentaire due.</div>
                    <div style="margin-bottom: 0.4mm;">- En cas de Forfait, le locataire est responsable de tous dégâts matériels d'après la deuxième signature.</div>
                    <div>- Le véhicule ne doit être conduit que par le locataire.</div>
                </div>
            </td>
        </tr>
    </table>

    {{-- ════ 2. TITLE LINE ════ --}}
    <table class="title-table" style="margin-bottom: 1.5mm;">
        <tr>
            <td style="width: 38%;" class="title-fr">Contrat de Location</td>
            <td style="width: 38%;" class="title-ar rtl">عقـــــد الكـــــراء</td>
            <td style="width: 24%; text-align: right;">
                <span class="num-label">№</span> <span class="num-val">{{ $formattedContractNum }}</span>
            </td>
        </tr>
    </table>

    {{-- ════ 3. MAIN UNIFIED DATA BOX (Enclosed in a Thick Elegant Black Frame) ════ --}}
    <div class="main-contract-frame">
    <table class="outer-box">
        {{-- ── ROW 1: VEHICLE (Left) | DATES (Right) ── --}}
        <tr class="outer-row">
            {{-- Left: Vehicle Section --}}
            <td style="width: 50%; vertical-align: top;" class="right-border">
                <table style="width: 100%;">
                    @foreach($vehicleRows as $row)
                        <tr class="field-row">
                            <td class="field-fr">{{ $row[0] }}</td>
                            <td class="field-value">{{ $row[1] ?? '' }}</td>
                            <td class="field-ar">{{ $row[2] }}</td>
                        </tr>
                    @endforeach
                </table>
            </td>

            {{-- Right: Dates Grid --}}
            <td style="width: 50%; vertical-align: top;">
                <table class="date-grid" style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <th style="width: 48%;"></th>
                        <th style="width: 12%;">J</th>
                        <th style="width: 12%;">M</th>
                        <th style="width: 15%;">A</th>
                        <th style="width: 13%;">H</th>
                    </tr>
                    <tr><td class="date-label"><span>Départ</span><span class="rtl" style="float: right;">الانطلاق</span></td><td>{{ $start->format('d') }}</td><td>{{ $start->format('m') }}</td><td>{{ $start->format('Y') }}</td><td>{{ $start->format('H:i') }}</td></tr>
                    <tr><td class="date-label"><span>Retour Prévu</span><span class="rtl" style="float: right;">الرجوع الموقع</span></td><td>{{ $end->format('d') }}</td><td>{{ $end->format('m') }}</td><td>{{ $end->format('Y') }}</td><td>{{ $end->format('H:i') }}</td></tr>
                    <tr><td class="date-label"><span>Retour Définitif</span><span class="rtl" style="float: right;">الرجوع النهائي</span></td><td>/</td><td>/</td><td>/</td><td>/</td></tr>
                    <tr><td class="date-label"><span>Durée</span><span class="rtl" style="float: right;">المدة</span></td><td colspan="4" class="bold" style="background: #f8fafc;">{{ $days }} Jour{{ $days > 1 ? 's' : '' }} / {{ $days }} أيام</td></tr>
                </table>
            </td>
        </tr>

        {{-- ── ROW 2: CLIENT INFO (Left) | KILOMETRAGE & CONDUCTEUR (Right) ── --}}
        <tr class="outer-row">
            {{-- Left: Client Details --}}
            <td style="width: 50%; vertical-align: top;" class="right-border">
                <table style="width: 100%;">
                    @foreach($clientRows as $row)
                        <tr class="field-row">
                            <td class="field-fr">{{ $row[0] }}</td>
                            <td class="field-value">{{ $row[1] ?? '' }}</td>
                            <td class="field-ar">{{ $row[2] }}</td>
                        </tr>
                    @endforeach
                </table>
            </td>

            {{-- Right: Structured Kilométrage Grid & Conducteur Supplémentaire --}}
            <td style="width: 50%; vertical-align: top;">
                {{-- Kilométrage Structured Table with 3-Cell Boxed Inputs --}}
                <table class="km-table" style="width: 100%; border-collapse: collapse; border-bottom: 0.45mm solid #000;">
                    @foreach([
                        ['عدد الكيلومترات عند الرجوع', 'KILOMETRAGE RETOUR :', $kmRetDigits],
                        ['عدد الكيلومترات عند الذهاب', 'KILOMETRAGE DEPART :', $kmDepDigits],
                        ['عدد الكيلومترات المقطوعة', 'KILOMETRAGE PARCOURU :', $kmParDigits],
                    ] as $i => $kmRow)
                        <tr class="{{ $i === 2 ? 'last' : '' }}" style="{{ $i < 2 ? 'border-bottom: 0.35mm solid #000;' : '' }}">
                            <td class="km-label" style="width: 52%; vertical-align: middle; padding: 1mm 1.5mm; border-bottom: {{ $i < 2 ? '0.35mm solid #000' : 'none' }};">
                                <div class="rtl bold" dir="rtl" style="font-size: 7.2pt; line-height: 1.15;">{{ $kmRow[0] }}</div>
                                <div class="bold" style="font-size: 7.2pt; line-height: 1.15;">{{ $kmRow[1] }}</div>
                            </td>
                            <td style="width: 48%; vertical-align: middle; text-align: right; padding: 1mm 1.5mm; border-bottom: {{ $i < 2 ? '0.35mm solid #000' : 'none' }};">
                                <table class="km-3box" style="display: inline-table; width: 44mm; height: 5.6mm; border: 0.35mm solid #000; border-collapse: collapse; text-align: center; vertical-align: middle; background: #fff;">
                                    <tr>
                                        @php
                                            $d1 = trim(($kmRow[2][0] ?? '') . ($kmRow[2][1] ?? ''));
                                            $d2 = trim(($kmRow[2][2] ?? '') . ($kmRow[2][3] ?? ''));
                                            $d3 = trim(($kmRow[2][4] ?? '') . ($kmRow[2][5] ?? ''));
                                        @endphp
                                        <td style="width: 33.33%; border-right: 0.35mm solid #000; padding: 0; font-family: DejaVu Sans Mono, monospace; font-size: 8pt; font-weight: bold; text-align: center; height: 5.6mm;">{{ $d1 }}</td>
                                        <td style="width: 33.33%; border-right: 0.35mm solid #000; padding: 0; font-family: DejaVu Sans Mono, monospace; font-size: 8pt; font-weight: bold; text-align: center; height: 5.6mm;">{{ $d2 }}</td>
                                        <td style="width: 33.33%; padding: 0; font-family: DejaVu Sans Mono, monospace; font-size: 8pt; font-weight: bold; text-align: center; height: 5.6mm;">{{ $d3 }}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    @endforeach
                </table>

                {{-- Le Conducteur Supplémentaire Framed Solid Box --}}
                <div style="border: 0.35mm solid #000; margin-top: 1.2mm;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr class="section-title">
                            <td>Le Conducteur Supplémentaire</td>
                            <td class="rtl right">السائق المرخـص</td>
                        </tr>
                    </table>
                    <table style="width: 100%; border-collapse: collapse;">
                        @foreach($driverRows as $i => $row)
                            <tr class="field-row">
                                <td class="field-fr" style="{{ $i === count($driverRows) - 1 ? 'border-bottom: none;' : '' }}">{{ $row[0] }}</td>
                                <td class="field-value" style="{{ $i === count($driverRows) - 1 ? 'border-bottom: none;' : '' }}">{{ $row[1] ?? '' }}</td>
                                <td class="field-ar" style="{{ $i === count($driverRows) - 1 ? 'border-bottom: none;' : '' }}">{{ $row[2] }}</td>
                            </tr>
                        @endforeach
                    </table>
                </div>
            </td>
        </tr>

        {{-- ── ROW 3: PAIEMENT (Left) | TOTALS (Right) ── --}}
        <tr class="outer-row">
            {{-- Left: Paiement --}}
            <td style="width: 50%; vertical-align: top;" class="right-border">
                <table style="width: 100%;">
                    <tr class="section-title">
                        <td>Paiement</td>
                        <td class="rtl right">الأداء</td>
                    </tr>
                </table>
                <table class="pay-table" style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="width: 28%;"><span class="check">{{ $contract->booking_payment_status === 'paid' ? '✓' : '' }}</span>* Espèce :</td>
                        <td style="width: 54%; border-bottom: 0.25mm dotted #555;"></td>
                        <td class="rtl right bold" style="width: 18%;">نقدا</td>
                    </tr>
                    <tr>
                        <td><span class="check"></span>* Chèque :</td>
                        <td style="border-bottom: 0.25mm dotted #555;"></td>
                        <td class="rtl right bold">شيكا</td>
                    </tr>
                    <tr>
                        <td style="border-bottom: none;">
                            <span class="check">{{ $contract->deposit_amount > 0 ? '✓' : '' }}</span>* Caution :
                            <span class="bold">{{ $contract->deposit_amount > 0 ? $money($contract->deposit_amount) : '' }}</span>
                        </td>
                        <td style="border-bottom: 0.25mm dotted #555;"></td>
                        <td class="rtl right bold" style="border-bottom: none;">ضمانة</td>
                    </tr>
                </table>
            </td>

            {{-- Right: Financial Totals Framed Solid Box --}}
            <td style="width: 50%; vertical-align: middle; padding: 1mm 1.5mm;">
                <div style="border: 0.35mm solid #000;">
                    <table class="total-row" style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 42%;">Total Hors Taxe</td>
                            <td style="width: 32%; border-bottom: 0.25mm dotted #555;"></td>
                            <td class="right bold" style="width: 26%;">{{ $money($totalHT) }}</td>
                        </tr>
                        <tr>
                            <td>Taxe TVA 20%</td>
                            <td style="border-bottom: 0.25mm dotted #555;"></td>
                            <td class="right bold">{{ $money($tvaAmount) }}</td>
                        </tr>
                        <tr class="total-main" style="border-bottom: none;">
                            <td style="border-bottom: none;">TOTAL DE LOCATION</td>
                            <td style="border-bottom: none;"></td>
                            <td class="right bold" style="border-bottom: none;">{{ $money($totalTTC) }}</td>
                        </tr>
                    </table>
                </div>
            </td>
        </tr>

        {{-- ── ROW 4: SIGNATURES (Directly Below Solid Divider Line) ── --}}
        <tr class="outer-row-last">
            {{-- Left: Legal Notice & Client Signature --}}
            <td style="width: 50%; vertical-align: top;" class="right-border">
                <div class="terms" style="border-bottom: 0.25mm solid #ccc;">
                    <table class="terms-table">
                        <tr>
                            <td style="width: 50%; font-size: 6.2pt; line-height: 1.35; padding-right: 1.5mm;">
                                Je reconnais avoir pris connaissance des présentes conditions générales (recto verso) et m'engage à les respecter.
                            </td>
                            <td style="width: 50%; font-size: 6.4pt; line-height: 1.35; padding-left: 1.5mm;" class="rtl right bold">
                                اعترف بعلمي الكامل للقانون العام لكراء السيارات في ظهر هذا العقد والتزم باحترامه
                            </td>
                        </tr>
                    </table>
                </div>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr class="section-title">
                        <td style="padding: 1.2mm 2mm;">Signature de Client</td>
                        <td class="rtl right" style="padding: 1.2mm 2mm;">إمضاء الزبون</td>
                    </tr>
                    <tr>
                        <td colspan="2" class="signature-box" style="height: 26mm; vertical-align: middle; text-align: center; padding: 2mm 1mm;">
                            @if($contract->signature_client_start)
                                <img src="{{ $contract->signature_client_start }}" class="signature-img" style="max-height: 22mm; max-width: 52mm; object-fit: contain;" alt="Signature Client">
                            @else
                                <div style="width: 44mm; border-bottom: 0.25mm solid #888; margin: 18mm auto 2mm auto;"></div>
                            @endif
                        </td>
                    </tr>
                </table>
            </td>

            {{-- Right: Fait à Tanger le & Signature Responsable --}}
            <td style="width: 50%; vertical-align: top;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 1.8mm 2mm 0.8mm 2mm;">
                            <div class="bold" style="font-size: 7.8pt;">Fait à {{ $contract->signature_city ?: 'Tanger' }} le : {{ $start->format('d/m/Y') }}</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align: center; padding-top: 1mm;">
                            <div class="bold" style="font-size: 7.8pt; margin-bottom: 1mm;">Le responsable</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="height: 22mm; vertical-align: middle; text-align: center;">
                            @if($contract->signature_agent_start)
                                <img src="{{ $contract->signature_agent_start }}" style="max-height: 19mm; max-width: 44mm; object-fit: contain;" alt="Signature Responsable">
                            @else
                                <div style="width: 38mm; border-bottom: 0.25mm solid #555; margin: 16mm auto 2mm auto;"></div>
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size: 7pt; border-top: 0.25mm solid #bbb; padding: 1.5mm 2mm 2mm 2mm;">
                            <span>Examiné par / فحص من قبل</span>
                            <span style="float: right; color: #444;">M. ........................................</span>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    </div>

    {{-- ════ 4. VEHICLE INSPECTION BOX (5 Columns Symmetrical) ════ --}}
    <table class="inspection outer-box" style="margin-top: 6.5mm;">
        <tr>
            {{-- 1. Far Left: Car Diagram (Départ) --}}
            <td class="inspection-car-td right-border" style="width: 14%; padding: 1mm;">
                <svg viewBox="0 0 150 240" style="width: 100%; height: 58mm; max-height: 60mm;" fill="none" stroke="#000000" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 52 14 C 52 9, 62 7, 75 7 C 88 7, 98 9, 98 14 L 102 21 C 102 24, 98 25, 96 25 L 54 25 C 52 25, 48 24, 48 21 Z" />
                    <text x="75" y="19" fill="#000000" stroke="none" font-size="8" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">10</text>

                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 46 25 C 46 25, 34 26, 28 34 C 23 41, 23 52, 28 62 C 31 67, 36 71, 46 72" />
                    <text x="31" y="44" fill="#000000" stroke="none" font-size="7.5" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">6</text>
                    <path fill="none" stroke="#000000" stroke-width="1.3" d="M 18 36 C 14 42, 14 56, 18 62" />

                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 104 25 C 104 25, 116 26, 122 34 C 127 41, 127 52, 122 62 C 119 67, 114 71, 104 72" />
                    <text x="119" y="44" fill="#000000" stroke="none" font-size="7.5" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">12</text>
                    <path fill="none" stroke="#000000" stroke-width="1.3" d="M 132 36 C 136 42, 136 56, 132 62" />

                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 48 27 L 102 27 L 101 54 C 88 56, 62 56, 49 54 Z" />
                    <text x="75" y="44" fill="#000000" stroke="none" font-size="7.5" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">11</text>

                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 49 57 C 60 59, 90 59, 101 57 L 97 76 C 85 78, 65 78, 53 76 Z" />

                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 53 79 C 65 80, 85 80, 97 79 L 97 138 C 85 137, 65 137, 53 138 Z" />
                    <text x="75" y="112" fill="#000000" stroke="none" font-size="9" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">1</text>

                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 46 74 L 28 74 C 22 75, 20 80, 20 90 L 20 106 L 46 106" />
                    <path fill="none" stroke="#000000" stroke-width="0.8" d="M 46 76 L 31 76 C 26 77, 24 81, 24 88 L 24 104 L 46 104" />
                    <text x="25" y="93" fill="#000000" stroke="none" font-size="7.5" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">7</text>

                    <line x1="16" y1="106" x2="20" y2="106" fill="none" stroke="#000000" stroke-width="1.5" />
                    <text x="11" y="109" fill="#000000" stroke="none" font-size="7.5" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">8</text>

                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 46 107 L 20 107 L 20 125 C 20 135, 24 139, 30 140 L 46 140" />
                    <path fill="none" stroke="#000000" stroke-width="0.8" d="M 46 109 L 24 109 L 24 124 C 24 132, 27 137, 32 138 L 46 138" />
                    <text x="25" y="125" fill="#000000" stroke="none" font-size="7.5" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">9</text>

                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 104 74 L 122 74 C 128 75, 130 80, 130 90 L 130 106 L 104 106" />
                    <path fill="none" stroke="#000000" stroke-width="0.8" d="M 104 76 L 119 76 C 124 77, 126 81, 126 88 L 126 104 L 104 104" />
                    <text x="125" y="93" fill="#000000" stroke="none" font-size="7.5" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">13</text>

                    <line x1="130" y1="106" x2="134" y2="106" fill="none" stroke="#000000" stroke-width="1.5" />
                    <text x="139" y="109" fill="#000000" stroke="none" font-size="7.5" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">15</text>

                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 104 107 L 130 107 L 130 125 C 130 135, 126 139, 120 140 L 104 140" />
                    <path fill="none" stroke="#000000" stroke-width="0.8" d="M 104 109 L 126 109 L 126 124 C 126 132, 123 137, 118 138 L 104 138" />
                    <text x="125" y="125" fill="#000000" stroke="none" font-size="7.5" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">14</text>

                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 53 141 C 65 140, 85 140, 97 141 L 101 161 C 88 160, 62 160, 49 161 Z" />
                    <text x="75" y="153" fill="#000000" stroke="none" font-size="7.5" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">2</text>

                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 46 142 C 36 143, 31 147, 28 152 C 23 162, 23 173, 28 180 C 34 188, 46 189, 46 189" />
                    <text x="29" y="170" fill="#000000" stroke="none" font-size="7.5" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">5</text>
                    <path fill="none" stroke="#000000" stroke-width="1.3" d="M 18 152 C 14 158, 14 172, 18 178" />

                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 104 142 C 114 143, 119 147, 122 152 C 127 162, 127 173, 122 180 C 116 188, 104 189, 104 189" />
                    <text x="121" y="170" fill="#000000" stroke="none" font-size="7.5" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">16</text>
                    <path fill="none" stroke="#000000" stroke-width="1.3" d="M 132 152 C 136 158, 136 172, 132 178" />

                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 49 164 L 101 164 L 101 204 C 88 206, 62 206, 49 204 Z" />
                    <text x="75" y="186" fill="#000000" stroke="none" font-size="7.5" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">3</text>

                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 47 206 C 52 208, 98 208, 103 206 L 99 216 C 96 222, 54 222, 51 216 Z" />
                    <text x="75" y="217" fill="#000000" stroke="none" font-size="7.5" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">4</text>
                </svg>
            </td>

            {{-- 2. DEPART Text & Checklist --}}
            <td class="inspection-text-td right-border" style="width: 25%; padding: 2mm 2.5mm;">
                <table style="width: 100%; border-collapse: collapse; border-bottom: 0.35mm solid #000; margin-bottom: 1.5mm;">
                    <tr>
                        <td style="text-align: left; vertical-align: middle; padding-bottom: 1mm;">
                            <svg width="14" height="11" viewBox="0 0 20 14" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;">
                                <path fill="none" stroke="#000000" stroke-width="2.5" d="M18 7 H3 M9 2 L3 7 L9 12"/>
                            </svg>
                            <span class="bold" style="font-size: 9.5pt; letter-spacing: 0.4mm; margin-left: 1mm;">DEPART</span>
                        </td>
                        <td style="width: 1.5mm; background: #000; height: 5mm;"></td>
                    </tr>
                </table>
                <div style="margin-bottom: 1mm;">
                    <span class="bold" style="font-size: 7.6pt;">Véhicule En parfait état</span>
                    <table style="display: inline-table; width: 22mm; border-collapse: collapse; border: 0.3mm solid #000; text-align: center; vertical-align: middle; float: right;">
                        <tr>
                            <td style="width: 50%; border-right: 0.3mm solid #000; padding: 0.4mm 1mm; font-size: 6.8pt; font-weight: bold; background: {{ count($startCond) === 0 ? '#000000' : '#ffffff' }}; color: {{ count($startCond) === 0 ? '#ffffff' : '#000000' }};">Oui</td>
                            <td style="width: 50%; padding: 0.4mm 1mm; font-size: 6.8pt; font-weight: bold; background: {{ count($startCond) > 0 ? '#000000' : '#ffffff' }}; color: {{ count($startCond) > 0 ? '#ffffff' : '#000000' }};">Non</td>
                        </tr>
                    </table>
                </div>
                <div class="muted" style="font-size: 6pt; font-style: italic; margin-bottom: 1.5mm;">( Rayer le mention inutile )</div>
                <div class="bold" style="font-size: 7.6pt; margin-bottom: 0.5mm;">Commentaires</div>
                <div class="muted" style="font-size: 5.6pt; margin-bottom: 1.5mm; line-height: 1.2;">Positionner les numeros a l 'endroit précis du dommage, sur la matrice a gauche )</div>
                <div style="font-size: 7.2pt; line-height: 1.7;">
                    @for($i = 1; $i <= 5; $i++)
                        @php $dmgText = isset($startCond[$i - 1]) ? ($startCond[$i - 1]['zone'] ?? ($startCond[$i - 1]['label'] ?? '')) : ''; @endphp
                        <div style="margin-bottom: 0.9mm;"><span class="bold">{{ $i }} -</span> {{ $dmgText ? '· ' . $dmgText : '..........................................................' }}</div>
                    @endfor
                </div>
            </td>

            {{-- 3. Center: DOMMAGES IDENTIFIES ET ACCEPTE --}}
            <td class="damage-center-td right-border" style="width: 22%; padding: 0; vertical-align: top;">
                <table style="width: 100%; height: 60mm; border-collapse: collapse; table-layout: fixed;">
                    <tr>
                        <td style="height: 9.5mm; padding: 2mm 1mm; text-align: center; border-bottom: 0.35mm solid #000; vertical-align: middle;">
                            <div class="bold center" style="font-size: 7.8pt; line-height: 1.3; text-transform: uppercase; font-family: DejaVu Sans, Arial, sans-serif; letter-spacing: 0.3mm;">
                                DOMMAGE IDENTIFIES<br>ET ACCEPTE
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="height: 18.5mm; padding: 2.5mm 4mm; border-bottom: 0.35mm solid #000; vertical-align: middle;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="font-weight: 900; font-size: 8.5pt; font-family: monospace; width: 7mm; text-align: left; padding: 0.9mm 0; line-height: 1;">//</td>
                                    <td style="font-weight: bold; font-size: 7.6pt; text-align: left; padding: 0.9mm 0; line-height: 1; white-space: nowrap;">Eraflure</td>
                                </tr>
                                <tr>
                                    <td style="font-weight: 900; font-size: 8.5pt; font-family: monospace; width: 7mm; text-align: left; padding: 0.9mm 0; line-height: 1;">✕</td>
                                    <td style="font-weight: bold; font-size: 7.6pt; text-align: left; padding: 0.9mm 0; line-height: 1; white-space: nowrap;">Bosse</td>
                                </tr>
                                <tr>
                                    <td style="width: 7mm; text-align: left; padding: 0.9mm 0; line-height: 1;">
                                        <span style="display: inline-block; width: 3.5mm; height: 3.5mm; border: 0.35mm solid #000; vertical-align: middle;"></span>
                                    </td>
                                    <td style="font-weight: bold; font-size: 7.6pt; text-align: left; padding: 0.9mm 0; line-height: 1; white-space: nowrap;">Manque</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0; vertical-align: top; height: 32mm;">
                            <table style="width: 100%; height: 32mm; border-collapse: collapse; table-layout: fixed;">
                                <tr style="background: #f8fafc; height: 6mm;">
                                    <th style="width: 38%; border-right: 0.25mm solid #000; border-bottom: 0.3mm solid #000; padding: 1.2mm 0.5mm; font-size: 7.2pt; font-weight: bold; text-align: center;">Nombre</th>
                                    <th style="width: 62%; border-bottom: 0.3mm solid #000; padding: 1.2mm 0.5mm; font-size: 7.2pt; font-weight: bold; white-space: nowrap; text-align: center;">Paraphe Client</th>
                                </tr>
                                <tr style="height: 26mm;">
                                    <td class="bold" style="border-right: 0.25mm solid #000; font-size: 9.5pt; text-align: center; vertical-align: middle;">{{ count($startCond) ?: '' }}</td>
                                    <td style="vertical-align: middle; text-align: center;"></td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>

            {{-- 4. RETOUR Text & Checklist --}}
            <td class="inspection-text-td right-border" style="width: 25%; padding: 2mm 2.5mm;">
                <table style="width: 100%; border-collapse: collapse; border-bottom: 0.35mm solid #000; margin-bottom: 1.5mm;">
                    <tr>
                        <td style="width: 1.5mm; background: #000; height: 5mm;"></td>
                        <td style="text-align: right; vertical-align: middle; padding-bottom: 1mm;">
                            <span class="bold" style="font-size: 9.5pt; letter-spacing: 0.4mm; margin-right: 1mm;">RETOUR</span>
                            <svg width="14" height="11" viewBox="0 0 20 14" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;">
                                <path fill="none" stroke="#000000" stroke-width="2.5" d="M2 7 H17 M11 2 L17 7 L11 12"/>
                            </svg>
                        </td>
                    </tr>
                </table>
                <div style="margin-bottom: 1mm;">
                    <span class="bold" style="font-size: 7.6pt;">Véhicule En parfait état</span>
                    <table style="display: inline-table; width: 22mm; border-collapse: collapse; border: 0.3mm solid #000; text-align: center; vertical-align: middle; float: right;">
                        <tr>
                            <td style="width: 50%; border-right: 0.3mm solid #000; padding: 0.4mm 1mm; font-size: 6.8pt; font-weight: bold; background: {{ count($endCond) === 0 ? '#000000' : '#ffffff' }}; color: {{ count($endCond) === 0 ? '#ffffff' : '#000000' }};">Oui</td>
                            <td style="width: 50%; padding: 0.4mm 1mm; font-size: 6.8pt; font-weight: bold; background: {{ count($endCond) > 0 ? '#000000' : '#ffffff' }}; color: {{ count($endCond) > 0 ? '#ffffff' : '#000000' }};">Non</td>
                        </tr>
                    </table>
                </div>
                <div class="muted" style="font-size: 6pt; font-style: italic; margin-bottom: 1.5mm;">( Rayer le mention inutile )</div>
                <div class="bold" style="font-size: 7.6pt; margin-bottom: 0.5mm;">Commentaires</div>
                <div class="muted" style="font-size: 5.6pt; margin-bottom: 1.5mm; line-height: 1.2;">Positionner les numeros a l 'endroit précis du dommage, sur la matrice a gauche )</div>
                <div style="font-size: 7.2pt; line-height: 1.7;">
                    @for($i = 1; $i <= 5; $i++)
                        @php $dmgTextEnd = isset($endCond[$i - 1]) ? ($endCond[$i - 1]['zone'] ?? ($endCond[$i - 1]['label'] ?? '')) : ''; @endphp
                        <div style="margin-bottom: 0.9mm;"><span class="bold">{{ $i }} -</span> {{ $dmgTextEnd ? '· ' . $dmgTextEnd : '..........................................................' }}</div>
                    @endfor
                </div>
            </td>

            {{-- 5. Far Right: Car Diagram (Retour) --}}
            <td class="inspection-car-td" style="width: 14%; padding: 1mm;">
                <svg viewBox="0 0 150 240" style="width: 100%; height: 58mm; max-height: 60mm;" fill="none" stroke="#000000" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 52 14 C 52 9, 62 7, 75 7 C 88 7, 98 9, 98 14 L 102 21 C 102 24, 98 25, 96 25 L 54 25 C 52 25, 48 24, 48 21 Z" />
                    <text x="75" y="19" fill="#000000" stroke="none" font-size="8" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">10</text>

                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 46 25 C 46 25, 34 26, 28 34 C 23 41, 23 52, 28 62 C 31 67, 36 71, 46 72" />
                    <text x="31" y="44" fill="#000000" stroke="none" font-size="7.5" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">6</text>
                    <path fill="none" stroke="#000000" stroke-width="1.3" d="M 18 36 C 14 42, 14 56, 18 62" />

                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 104 25 C 104 25, 116 26, 122 34 C 127 41, 127 52, 122 62 C 119 67, 114 71, 104 72" />
                    <text x="119" y="44" fill="#000000" stroke="none" font-size="7.5" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">12</text>
                    <path fill="none" stroke="#000000" stroke-width="1.3" d="M 132 36 C 136 42, 136 56, 132 62" />

                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 48 27 L 102 27 L 101 54 C 88 56, 62 56, 49 54 Z" />
                    <text x="75" y="44" fill="#000000" stroke="none" font-size="7.5" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">11</text>

                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 49 57 C 60 59, 90 59, 101 57 L 97 76 C 85 78, 65 78, 53 76 Z" />

                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 53 79 C 65 80, 85 80, 97 79 L 97 138 C 85 137, 65 137, 53 138 Z" />
                    <text x="75" y="112" fill="#000000" stroke="none" font-size="9" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">1</text>

                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 46 74 L 28 74 C 22 75, 20 80, 20 90 L 20 106 L 46 106" />
                    <path fill="none" stroke="#000000" stroke-width="0.8" d="M 46 76 L 31 76 C 26 77, 24 81, 24 88 L 24 104 L 46 104" />
                    <text x="25" y="93" fill="#000000" stroke="none" font-size="7.5" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">7</text>

                    <line x1="16" y1="106" x2="20" y2="106" fill="none" stroke="#000000" stroke-width="1.5" />
                    <text x="11" y="109" fill="#000000" stroke="none" font-size="7" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">8</text>

                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 46 107 L 20 107 L 20 125 C 20 135, 24 139, 30 140 L 46 140" />
                    <path fill="none" stroke="#000000" stroke-width="0.8" d="M 46 109 L 24 109 L 24 124 C 24 132, 27 137, 32 138 L 46 138" />
                    <text x="25" y="125" fill="#000000" stroke="none" font-size="7.5" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">9</text>

                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 104 74 L 122 74 C 128 75, 130 80, 130 90 L 130 106 L 104 106" />
                    <path fill="none" stroke="#000000" stroke-width="0.8" d="M 104 76 L 119 76 C 124 77, 126 81, 126 88 L 126 104 L 104 104" />
                    <text x="125" y="93" fill="#000000" stroke="none" font-size="7.5" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">13</text>

                    <line x1="130" y1="106" x2="134" y2="106" fill="none" stroke="#000000" stroke-width="1.5" />
                    <text x="139" y="109" fill="#000000" stroke="none" font-size="7.5" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">15</text>

                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 104 107 L 130 107 L 130 125 C 130 135, 126 139, 120 140 L 104 140" />
                    <path fill="none" stroke="#000000" stroke-width="0.8" d="M 104 109 L 126 109 L 126 124 C 126 132, 123 137, 118 138 L 104 138" />
                    <text x="125" y="125" fill="#000000" stroke="none" font-size="7.5" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">14</text>

                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 53 141 C 65 140, 85 140, 97 141 L 101 161 C 88 160, 62 160, 49 161 Z" />
                    <text x="75" y="153" fill="#000000" stroke="none" font-size="7.5" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">2</text>

                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 46 142 C 36 143, 31 147, 28 152 C 23 162, 23 173, 28 180 C 34 188, 46 189, 46 189" />
                    <text x="29" y="170" fill="#000000" stroke="none" font-size="7.5" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">5</text>
                    <path fill="none" stroke="#000000" stroke-width="1.3" d="M 18 152 C 14 158, 14 172, 18 178" />

                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 104 142 C 114 143, 119 147, 122 152 C 127 162, 127 173, 122 180 C 116 188, 104 189, 104 189" />
                    <text x="121" y="170" fill="#000000" stroke="none" font-size="7.5" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">16</text>
                    <path fill="none" stroke="#000000" stroke-width="1.3" d="M 132 152 C 136 158, 136 172, 132 178" />

                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 49 164 L 101 164 L 101 204 C 88 206, 62 206, 49 204 Z" />
                    <text x="75" y="186" fill="#000000" stroke="none" font-size="7.5" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">3</text>

                    <path fill="none" stroke="#000000" stroke-width="1.2" d="M 47 206 C 52 208, 98 208, 103 206 L 99 216 C 96 222, 54 222, 51 216 Z" />
                    <text x="75" y="217" fill="#000000" stroke="none" font-size="7.5" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">4</text>
                </svg>
            </td>
        </tr>
    </table>
</div>
</body>
</html>
