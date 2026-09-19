<!DOCTYPE html>
<html lang="ar" dir="ltr">
<head>
    <meta charset="UTF-8">
    <title>عقد الكراء - Contrat de Location {{ $contract->contract_number }}</title>
    <style>
        @unless($forMpdf ?? false)
            @page { size: A4 portrait; margin: 0; }
        @endunless

        * { box-sizing: border-box; }
        html, body {
            margin: 0;
            padding: 0;
            color: #000;
            background: #fff;
            font-family: DejaVu Sans, Arial, Tahoma, sans-serif;
            font-size: 10.2pt;
            line-height: 1.28;
        }
        .page {
            width: 198mm;
            margin: 4mm 6mm;
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
        .outer-box {
            border: 0.35mm solid #111;
            margin-bottom: 1.8mm;
        }
        .thin-border { border: 0.2mm solid #222; }
        .right-border { border-right: 0.35mm solid #111; }
        .bottom-border { border-bottom: 0.2mm solid #555; }
        .thick-bottom { border-bottom: 0.35mm solid #111; }
        .center { text-align: center; }
        .right { text-align: right; }
        .rtl { direction: rtl; font-family: DejaVu Sans, Tahoma, sans-serif; }
        .muted { color: #333; }
        .brand-red { color: #d91445; }
        .bold { font-weight: 700; }
        .black { font-weight: 900; }
        .small { font-size: 9pt; }
        .xsmall { font-size: 8.4pt; }
        .header-table td { height: 26mm; }
        .logo { max-height: 14mm; max-width: 35mm; }
        .wordmark { max-height: 8mm; max-width: 24mm; vertical-align: middle; }
        .company-title { font-size: 10.8pt; letter-spacing: 0.3mm; }
        .company-line { font-size: 9.2pt; }
        .legal-ar { font-size: 8.4pt; line-height: 1.28; text-align: justify; }
        .legal-fr { font-size: 8.1pt; line-height: 1.2; text-align: justify; }
        .title-table td { height: 10.5mm; padding: 1.1mm 2.2mm; }
        .title-fr { font-size: 13pt; text-transform: uppercase; }
        .title-ar { font-size: 13.5pt; }
        .num-label { font-size: 11.7pt; color: #d91445; }
        .num-box {
            display: inline-block;
            min-width: 22mm;
            border: 0.3mm solid #111;
            padding: 0.7mm 1.5mm;
            font-size: 11.4pt;
            text-align: center;
            font-family: DejaVu Sans Mono, monospace;
        }
        .field-row td {
            height: 5.35mm;
            padding: 0.45mm 1.25mm;
            border-bottom: 0.18mm solid #777;
        }
        .field-fr { width: 38%; font-size: 9.35pt; font-weight: 700; }
        .field-value { width: 34%; font-size: 9.5pt; font-weight: 700; }
        .field-ar { width: 28%; font-size: 9.35pt; font-weight: 700; text-align: right; direction: rtl; }
        .section-title td {
            height: 5.4mm;
            background: #f4f6f8;
            padding: 0.55mm 1.25mm;
            border-bottom: 0.25mm solid #222;
            font-size: 9.5pt;
            font-weight: 800;
        }
        .date-grid th, .date-grid td {
            height: 5.35mm;
            border: 0.18mm solid #555;
            padding: 0.4mm 0.8mm;
            text-align: center;
            font-size: 9.05pt;
        }
        .date-grid th { background: #f4f6f8; font-weight: 800; }
        .date-label { text-align: left !important; }
        .km-table td {
            height: 6.05mm;
            padding: 0.35mm 1mm;
            border-bottom: 0.18mm solid #777;
        }
        .km-label { font-size: 8.85pt; line-height: 1.14; }
        .digit {
            display: inline-block;
            width: 5.1mm;
            height: 5.1mm;
            line-height: 4.8mm;
            margin-left: 0.5mm;
            border: 0.2mm solid #222;
            text-align: center;
            font-size: 9.15pt;
            font-family: DejaVu Sans Mono, monospace;
        }
        .pay-table td { height: 5.75mm; padding: 0.45mm 1.25mm; border-bottom: 0.18mm solid #777; }
        .check {
            display: inline-block;
            width: 4mm;
            height: 4mm;
            line-height: 3.6mm;
            border: 0.2mm solid #111;
            text-align: center;
            margin-right: 1mm;
            font-size: 8.8pt;
        }
        .terms { height: 11mm; padding: 0.85mm 1.45mm; line-height: 1.2; }
        .signature-box { height: 19mm; padding: 1mm; text-align: center; }
        .signature-img { max-height: 13mm; max-width: 48mm; }
        .total-row td { height: 5.95mm; padding: 0.55mm 1.5mm; border-bottom: 0.18mm solid #777; }
        .total-main td { font-size: 10.2pt; font-weight: 900; background: #f7f7f7; }
        .inspection td { vertical-align: top; }
        .inspection-cell { height: 62mm; padding: 1.1mm; }
        .inspection-car-cell { height: 62mm; padding: 1mm 0.6mm; text-align: center; }
        .inspection-copy-cell { height: 62mm; padding: 1.1mm 1.1mm; }
        .inspection-title { font-size: 9.8pt; font-weight: 900; margin-bottom: 0.8mm; }
        .inspection-arrow { font-size: 22.5pt; line-height: 1; font-weight: 900; margin: 0.2mm 0 1mm; }
        .inspection-line { font-size: 8.3pt; line-height: 1.12; margin-bottom: 0.45mm; }
        .inspection-notice { font-size: 7.7pt; line-height: 1.05; margin: 0.45mm 0 0.65mm; }
        .inspection-lines { margin-top: 0.55mm; }
        .inspection-lines .inspection-line { margin-bottom: 0.65mm; }
        .condition-options { display: block; margin-top: 0.4mm; white-space: normal; }
        .damage-table th, .damage-table td {
            border: 0.18mm solid #333;
            height: 5.4mm;
            padding: 0.25mm;
            text-align: center;
            font-size: 7.7pt;
        }
        .damage-list { font-size: 7.9pt; line-height: 1.12; margin: 0.8mm 0 1.2mm; }
        .car-img { max-height: 38mm; max-width: 32mm; margin-top: 1mm; }
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

    $logoSrc = $imageData([public_path('images/rlv-emblem.png'), public_path('rlv-emblem.png')]);
    $wordmarkSrc = $imageData([public_path('images/rlv-wordmark.png'), public_path('rlv-wordmark.png')]);
    $carImgSrc = $imageData([public_path('images/car-inspection.png'), public_path('car-inspection.png')]);

    $start = $contract->start_date ? \Carbon\Carbon::parse($contract->start_date) : now();
    $end = $contract->end_date ? \Carbon\Carbon::parse($contract->end_date) : now();
    $days = max(1, $start->diffInDays($end));
    $totalTTC = (float) ($contract->total_amount ?? 0);
    $totalHT = $totalTTC / 1.2;
    $tvaAmount = $totalTTC - $totalHT;
    $money = fn ($amount) => number_format((float) $amount, 2, '.', ' ') . ' Dh';
    $dateValue = fn ($value) => $value ? \Carbon\Carbon::parse($value)->format('d/m/Y') : '';
    $cleanNumber = preg_replace('/[^0-9]/', '', (string) $contract->contract_number);
    $formattedContractNum = $cleanNumber ? str_pad($cleanNumber, 5, '0', STR_PAD_LEFT) : ($contract->contract_number ?: '00001');
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

    $leftRows = [
        ['Marque :', $contract->vehicle_name, 'نوع'],
        ['N° Immatriculation :', $contract->vehicle_plate, 'رقم التسجيل'],
        ['Lieu de Livraison :', $contract->signature_city ?: 'Tanger', 'مكان التسليم'],
        ['Lieu de Reprise :', $contract->signature_city ?: 'Tanger', 'مكان الاسترجاع', true],
        ['NOM :', $contract->client_name, 'الاسم'],
        ['CIN N° :', $contract->client_id_number, 'البطاقة الوطنية'],
        ['Date de Naissance :', $dateValue($contract->client_date_of_birth), 'تاريخ الازدياد'],
        ['Profession :', $contract->client_profession, 'المهنة'],
        ['Adresse au Maroc :', $contract->client_address, 'العنوان بالمغرب'],
        ["Adresse à l'Etranger :", $contract->client_address_abroad, 'العنوان بالخارج'],
        ['Permis de Conduire N° :', $contract->client_license_number, 'رخصة السياقة رقم'],
        ['Délivré à :', $contract->client_license_issued_at, 'اصدارها في'],
        ['Le :', $dateValue($contract->client_license_expiry), 'بتاريخ'],
        ['Passport N° :', $contract->client_passport_number, 'رقم جواز السفر'],
        ['Délivré à :', $contract->client_passport_issued_at, 'اصدارها في'],
        ['Le :', $dateValue($contract->client_passport_issued_date), 'بتاريخ'],
        ['Téléphone de Contrat :', $contract->client_phone, 'هاتف الاتصال'],
    ];

    $driverRows = [
        ['Nom & Prénom :', '', 'الاسم الشخصي والعائلي'],
        ['Permis de conduire N° :', '', 'رخصة السياقة رقم'],
        ['Délivré à :', '', 'اصدارها في'],
        ['Passeport N° :', '', 'رقم جواز السفر'],
        ['C.I.N n° :', '', 'البطاقة الوطنية'],
    ];
@endphp

<div class="page">
    <table class="header-table outer-box">
        <tr>
            <td style="width: 39%; padding: 1.5mm 2mm;" class="right-border center">
                @if($logoSrc)<img src="{{ $logoSrc }}" class="logo" alt="RLV">@endif
                <div class="company-title black">RAHIMI LOCATION DE VOITURE</div>
                <div class="company-line bold">LOT EL NAHDA RUE 37 N°12 BLOC 38, Tanger</div>
                <div class="company-line bold">Tel: 06 77 81 37 18 / 07 77 57 33 79</div>
            </td>
            <td style="width: 61%; padding: 1.5mm 2mm;">
                <div class="center" style="margin-bottom: 1mm;">
                    @if($wordmarkSrc)<img src="{{ $wordmarkSrc }}" class="wordmark" alt="RLV">@else<span class="brand-red black" style="font-size: 10pt;">RLV</span>@endif
                    <span class="bold">Location de voiture</span>
                </div>
                <div class="legal-ar rtl bold">المكتري للسيارة يتابع قضائيا 24 ساعة بعد انتهاء العقد وفي حالة تمديد المدة يجب اخبار شركة R.L.V وأداء مبلغ المدة الاضافية ويبقى المكتري هو المسؤول الوحيد عن اي حادثة بعد تمديد دون اشعار الشركة للمكتري الصلاحية في قيادة السيارة لا غير ولا يسمح له بتسليمها لشخص اخر</div>
                <div class="legal-fr muted">Le Locataire s'expose à des poursuites juridiques 24 heures après la date convenue au départ si le véhicule n'est toujours pas retourné et cela sans que RLV ait été informé d'une prolongation de location et ait reçu la somme supplémentaire due. Le véhicule ne doit être conduit que par le locataire.</div>
            </td>
        </tr>
    </table>

    <table class="title-table outer-box">
        <tr>
            <td style="width: 35%;" class="title-fr black">Contrat de Location</td>
            <td style="width: 35%;" class="title-ar black center rtl">عقد الكـــــراء</td>
            <td style="width: 30%;" class="right"><span class="num-label black">Nº</span> <span class="num-box">{{ $formattedContractNum }}</span></td>
        </tr>
    </table>

    <table class="outer-box" style="margin-bottom: 1.4mm;">
        <tr>
            <td style="width: 50%;" class="right-border">
                <table>
                    @foreach($leftRows as $row)
                        <tr class="field-row">
                            <td class="field-fr {{ $row[3] ?? false ? 'thick-bottom' : '' }}">{{ $row[0] }}</td>
                            <td class="field-value {{ $row[3] ?? false ? 'thick-bottom' : '' }}">{{ $row[1] ?? '' }}</td>
                            <td class="field-ar {{ $row[3] ?? false ? 'thick-bottom' : '' }}">{{ $row[2] }}</td>
                        </tr>
                    @endforeach
                </table>
            </td>
            <td style="width: 50%; vertical-align: top;">
                <table class="date-grid">
                    <tr>
                        <th style="width: 48%;">Désignation / البيان</th>
                        <th style="width: 12%;">J</th>
                        <th style="width: 12%;">M</th>
                        <th style="width: 15%;">A</th>
                        <th style="width: 13%;">H</th>
                    </tr>
                    <tr><td class="date-label"><span>Départ</span><span class="rtl" style="float: right;">الانطلاق</span></td><td>{{ $start->format('d') }}</td><td>{{ $start->format('m') }}</td><td>{{ $start->format('Y') }}</td><td>{{ $start->format('H:i') }}</td></tr>
                    <tr><td class="date-label"><span>Retour Prévu</span><span class="rtl" style="float: right;">الرجوع المتوقع</span></td><td>{{ $end->format('d') }}</td><td>{{ $end->format('m') }}</td><td>{{ $end->format('Y') }}</td><td>{{ $end->format('H:i') }}</td></tr>
                    <tr><td class="date-label"><span>Retour Définitif</span><span class="rtl" style="float: right;">الرجوع النهائي</span></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td class="date-label"><span>Durée</span><span class="rtl" style="float: right;">المدة</span></td><td colspan="4" class="bold">{{ $days }} Jour{{ $days > 1 ? 's' : '' }} / {{ $days }} أيام</td></tr>
                </table>

                <table class="km-table">
                    @foreach([
                        ['عدد الكيلومترات عند الرجوع', 'KILOMETRAGE RETOUR:', $kmRetDigits],
                        ['عدد الكيلومترات عند الذهاب', 'KILOMETRAGE DEPART:', $kmDepDigits],
                        ['عدد الكيلومترات المقطوعة', 'KILOMETRAGE PARCOURU:', $kmParDigits],
                    ] as $kmRow)
                        <tr>
                            <td class="km-label" style="width: 58%;"><div class="rtl bold">{{ $kmRow[0] }}</div><div class="bold">{{ $kmRow[1] }}</div></td>
                            <td class="right" style="width: 42%; white-space: nowrap;">@foreach($kmRow[2] as $digit)<span class="digit">{{ $digit }}</span>@endforeach</td>
                        </tr>
                    @endforeach
                </table>

                <table>
                    <tr class="section-title"><td>Le Conducteur Supplémentaire</td><td class="rtl right">السائق المرخـص</td></tr>
                </table>
                <table>
                    @foreach($driverRows as $row)
                        <tr class="field-row"><td class="field-fr">{{ $row[0] }}</td><td class="field-value">{{ $row[1] }}</td><td class="field-ar">{{ $row[2] }}</td></tr>
                    @endforeach
                </table>
            </td>
        </tr>
    </table>

    <table class="outer-box">
        <tr>
            <td style="width: 50%; vertical-align: top;" class="right-border">
                <table><tr class="section-title"><td>Paiement</td><td class="rtl right">الأداء</td></tr></table>
                <table class="pay-table">
                    <tr><td><span class="check">{{ $contract->booking_payment_status === 'paid' ? '✓' : '' }}</span>* Espèce :</td><td class="rtl right bold">نقدا</td></tr>
                    <tr><td><span class="check"></span>* Chèque :</td><td class="rtl right bold">شيكا</td></tr>
                    <tr><td><span class="check">{{ $contract->deposit_amount > 0 ? '✓' : '' }}</span>* Caution : <span class="bold">{{ $contract->deposit_amount > 0 ? $money($contract->deposit_amount) : '' }}</span></td><td class="rtl right bold">ضمانة</td></tr>
                </table>
                <div class="terms bottom-border">
                    <div>Je reconnais avoir pris connaissance des présentes conditions générales (recto verso) et m'engage à les respecter.</div>
                    <div class="rtl right bold">اعترف بعلمي الكامل للقانون العام لكراء السيارات في ظهر هذا العقد والتزم باحترامه</div>
                </div>
                <table><tr class="section-title"><td>Signature de Client</td><td class="rtl right">إمضاء الزبون</td></tr></table>
                <div class="signature-box">@if($contract->signature_client_start)<img src="{{ $contract->signature_client_start }}" class="signature-img" alt="Signature Client">@endif</div>
            </td>
            <td style="width: 50%; vertical-align: top;">
                <table class="total-row">
                    <tr><td>Total Hors Taxe</td><td class="right bold">{{ $money($totalHT) }}</td></tr>
                    <tr><td>Taxe TVA 20%</td><td class="right bold">{{ $money($tvaAmount) }}</td></tr>
                    <tr class="total-main"><td>TOTAL DE LOCATION</td><td class="right">{{ $money($totalTTC) }}</td></tr>
                    <tr><td colspan="2" class="bold">Fait à Tanger le : {{ $start->format('d/m/Y') }}</td></tr>
                </table>
                <div class="center" style="padding-top: 3mm;">
                    <div class="bold" style="margin-bottom: 3mm;">Le responsable</div>
                    @if($contract->signature_agent_start)<img src="{{ $contract->signature_agent_start }}" class="signature-img" alt="Signature Responsable">@else<div style="width: 32mm; height: 9mm; border-bottom: 0.2mm solid #555; margin: 0 auto;"></div>@endif
                </div>
            </td>
        </tr>
    </table>

    <table class="inspection outer-box">
        <tr>
            <td class="inspection-car-cell right-border" style="width: 17%;">
                <div class="inspection-arrow">←</div>
                @if($carImgSrc)<img src="{{ $carImgSrc }}" class="car-img" alt="Inspection départ">@endif
            </td>
            <td class="inspection-copy-cell right-border" style="width: 26%;">
                <div class="inspection-title center">DEPART</div>
                <div class="inspection-line bold">
                    Véhicule en parfait état
                    <span class="condition-options">[ {{ count($startCond) === 0 ? '✓' : ' ' }} ] Oui&nbsp;&nbsp;[ {{ count($startCond) > 0 ? '✓' : ' ' }} ] Non</span>
                </div>
                <div class="inspection-notice muted">(Rayer la mention inutile)</div>
                <div class="inspection-line bold">Commentaires</div>
                <div class="inspection-notice muted">Positionner les numéros à l'endroit précis du dommage.</div>
                <div class="inspection-lines">
                    @for($i = 1; $i <= 5; $i++)
                        @php $dmgText = isset($startCond[$i - 1]) ? ($startCond[$i - 1]['zone'] ?? ($startCond[$i - 1]['label'] ?? '')) : ''; @endphp
                        <div class="inspection-line">{{ $i }} {{ $dmgText ? '- ' . $dmgText : '.................................' }}</div>
                    @endfor
                </div>
            </td>
            <td class="inspection-cell right-border" style="width: 14%;">
                <div class="inspection-title center">DOMMAGES IDENTIFIES<br>ET ACCEPTES</div>
                <div class="damage-list bold">
                    <div>// Eraflure</div>
                    <div>✕ Bosse</div>
                    <div>□ Manque</div>
                </div>
                <table class="damage-table">
                    <tr><th>Nombre</th><th>Paraphe</th></tr>
                    <tr><td></td><td></td></tr>
                    <tr><td></td><td></td></tr>
                    <tr><td></td><td></td></tr>
                    <tr><td></td><td></td></tr>
                </table>
            </td>
            <td class="inspection-copy-cell right-border" style="width: 26%;">
                <div class="inspection-title center">RETOUR</div>
                <div class="inspection-line bold">
                    Véhicule en parfait état
                    <span class="condition-options">[ {{ count($endCond) === 0 ? '✓' : ' ' }} ] Oui&nbsp;&nbsp;[ {{ count($endCond) > 0 ? '✓' : ' ' }} ] Non</span>
                </div>
                <div class="inspection-notice muted">(Rayer la mention inutile)</div>
                <div class="inspection-line bold">Commentaires</div>
                <div class="inspection-notice muted">Positionner les numéros à l'endroit précis du dommage.</div>
                <div class="inspection-lines">
                    @for($i = 1; $i <= 5; $i++)
                        @php $dmgTextEnd = isset($endCond[$i - 1]) ? ($endCond[$i - 1]['zone'] ?? ($endCond[$i - 1]['label'] ?? '')) : ''; @endphp
                        <div class="inspection-line">{{ $i }} {{ $dmgTextEnd ? '- ' . $dmgTextEnd : '.................................' }}</div>
                    @endfor
                </div>
            </td>
            <td class="inspection-car-cell" style="width: 17%;">
                <div class="inspection-arrow">→</div>
                @if($carImgSrc)<img src="{{ $carImgSrc }}" class="car-img" alt="Inspection retour">@endif
            </td>
        </tr>
    </table>
</div>
</body>
</html>
