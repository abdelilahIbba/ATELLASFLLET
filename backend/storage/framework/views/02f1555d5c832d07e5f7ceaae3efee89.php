<<<<<<< HEAD
<!DOCTYPE html>
<html lang="ar" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>عقد الكراء — Contrat de Location <?php echo e($contract->contract_number); ?></title>
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

<?php
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
?>

<div class="page">

    
    <table class="header-table">
        <tr>
            <td class="header-left">
                <div class="header-logo-wrap">
                    <?php if($logoSrc): ?>
                        <img src="<?php echo e($logoSrc); ?>" alt="RLV Emblem" class="header-logo-img">
                    <?php endif; ?>
                </div>
                <div class="company-title">RAHIMI LOCATION DE VOITURE</div>
                <div class="company-addr">LOT EL NAHDA RUE 37 N°12 BLOC38, Tanger</div>
                <div class="company-tel">Tel: 06 77 81 37 18 / 07 77 57 33 79</div>
            </td>
            <td class="header-right">
                <div style="text-align:center; margin-bottom:2px;">
                    <?php if($wordmarkSrc): ?>
                        <img src="<?php echo e($wordmarkSrc); ?>" alt="RLV" style="height:18px; vertical-align:middle; margin-right:4px;">
                    <?php else: ?>
                        <span class="rlv-brand">RLV</span>
                    <?php endif; ?>
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

    
    <div class="title-bar">
        <div class="title-cell-fr">Contrat de Location</div>
        <div class="title-cell-ar">عقد الكـــــراء</div>
        <div class="title-cell-num">
            <span class="num-red">Nº</span>
            <div class="num-box"><?php echo e($formattedContractNum); ?></div>
=======
﻿<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Contrat <?php echo e($contract->contract_number); ?></title>
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
                <span class="badge badge-<?php echo e($contract->status); ?>"><?php echo e(ucfirst($contract->status)); ?></span>
            </span>
        </div>
    </div>
    <div class="header-center">
        <div class="doc-title-fr">Contrat de Location</div>
        <div class="doc-title-ar">عقد الكراء</div>
    </div>
    <div class="header-num-area">
        <span class="num-label">Nº</span>
        <div class="num-value"><?php echo e($contract->contract_number); ?></div>
        <div style="font-size:7px; margin-top:3px; color:#555;">Émis le : <?php echo e($contract->created_at->format('d/m/Y')); ?></div>
    </div>
</div>


<div class="main-grid">

    
    <div class="col-left">
        <div class="field-row"><div class="fl"><span class="fr">Marque :</span><span class="ar">النوع</span></div><div class="fv"><?php echo e($contract->vehicle_name ?? ''); ?></div></div>
        <div class="field-row"><div class="fl"><span class="fr">N° Immatriculation</span><span class="ar">رقم التسجيل</span></div><div class="fv"><?php echo e($contract->vehicle_plate ?? ''); ?></div></div>
        <div class="field-row"><div class="fl"><span class="fr">Lieu de livraison</span><span class="ar">مكان التسليم</span></div><div class="fv"><?php echo e($contract->signature_city ?? ''); ?></div></div>
        <div class="field-row"><div class="fl"><span class="fr">Lieu de Reprise :</span><span class="ar">مكان الاسترجاع</span></div><div class="fv"><?php echo e($contract->signature_city ?? ''); ?></div></div>
        <div class="sep"></div>
        <div class="field-row"><div class="fl"><span class="fr">NOM :</span><span class="ar">الاسم</span></div><div class="fv"><?php echo e($contract->client_name ?? ''); ?></div></div>
        <div class="field-row"><div class="fl"><span class="fr">CIN N° :</span><span class="ar">البطاقة الوطنية</span></div><div class="fv"><?php echo e($contract->client_id_number ?? ''); ?></div></div>
        <div class="field-row"><div class="fl"><span class="fr">Date de Naissance :</span><span class="ar">تاريخ الازدياد</span></div><div class="fv"></div></div>
        <div class="field-row"><div class="fl"><span class="fr">Profession :</span><span class="ar">المهنة</span></div><div class="fv"></div></div>
        <div class="field-row"><div class="fl"><span class="fr">Adresse au Maroc :</span><span class="ar">العنوان بالمغرب</span></div><div class="fv" style="font-size:7.5px;"><?php echo e($contract->client_address ?? ''); ?></div></div>
        <div class="field-row"><div class="fl"><span class="fr">Adresse à l'Étranger :</span><span class="ar">العنوان بالخارج</span></div><div class="fv"></div></div>
        <div class="field-row"><div class="fl"><span class="fr">Permis de Conduire N° :</span></div><div class="fv"><?php echo e($contract->client_license_number ?? ''); ?></div></div>
        <div class="field-row"><div class="fl"><span class="fr">Délivré à :</span><span class="ar">أصدارها في</span></div><div class="fv"></div></div>
        <div class="field-row"><div class="fl"><span class="fr">Le :</span><span class="ar">بتاريخ</span></div><div class="fv"><?php if($contract->client_license_expiry): ?><?php echo e($contract->client_license_expiry->format('d/m/Y')); ?><?php endif; ?></div></div>
        <div class="field-row"><div class="fl"><span class="fr">Passport N° :</span><span class="ar">رقم جواز السفر</span></div><div class="fv"></div></div>
        <div class="field-row"><div class="fl"><span class="fr">Délivré à :</span><span class="ar">أصدارها في</span></div><div class="fv"></div></div>
        <div class="field-row"><div class="fl"><span class="fr">Le :</span><span class="ar">بتاريخ</span></div><div class="fv"></div></div>
        <div class="field-row"><div class="fl"><span class="fr">Nationalité :</span><span class="ar">الجنسية</span></div><div class="fv"><?php echo e($contract->client_nationality ?? ''); ?></div></div>
        <div class="field-row"><div class="fl"><span class="fr">Téléphone de Contrat :</span><span class="ar">هاتف الاتصال</span></div><div class="fv"><?php echo e($contract->client_phone ?? ''); ?></div></div>
    </div>

    
    <div class="col-right">
        <?php $days = max(1, $contract->start_date->diffInDays($contract->end_date)); ?>
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
                    <td class="vc"><?php echo e($contract->start_date->format('d')); ?></td>
                    <td class="vc"><?php echo e($contract->start_date->format('m')); ?></td>
                    <td class="vc"><?php echo e($contract->start_date->format('Y')); ?></td>
                    <td class="vc"><?php echo e($contract->start_date->format('H:i')); ?></td>
                </tr>
                <tr>
                    <td class="rl"><span class="fr">Retour Prévu</span><span class="ar">الرجوع الموقع</span></td>
                    <td class="vc"><?php echo e($contract->end_date->format('d')); ?></td>
                    <td class="vc"><?php echo e($contract->end_date->format('m')); ?></td>
                    <td class="vc"><?php echo e($contract->end_date->format('Y')); ?></td>
                    <td class="vc"></td>
                </tr>
                <tr>
                    <td class="rl"><span class="fr">Retour Définitif</span><span class="ar">الرجوع النهائي</span></td>
                    <td class="vc"></td><td class="vc"></td><td class="vc"></td><td class="vc"></td>
                </tr>
                <tr>
                    <td class="rl"><span class="fr">Durée</span><span class="ar">المدة</span></td>
                    <td class="vc" colspan="4" style="text-align:center; font-weight:bold;"><?php echo e($days); ?> jour<?php echo e($days > 1 ? 's' : ''); ?></td>
                </tr>
            </tbody>
        </table>

        
        <table class="km-table">
            <tr>
                <td class="kl"><span class="ar">عدد الكيلومترات عند الرجوع</span><span class="fr">KILOMÉTRAGE RETOUR:</span></td>
                <td class="kv"><?php echo e($contract->mileage_end ? number_format($contract->mileage_end) . ' km' : ''); ?></td>
            </tr>
            <tr>
                <td class="kl"><span class="ar">عدد الكيلومترات عند الذهاب</span><span class="fr">KILOMÉTRAGE DÉPART:</span></td>
                <td class="kv"><?php echo e($contract->mileage_start ? number_format($contract->mileage_start) . ' km' : ''); ?></td>
            </tr>
            <tr>
                <td class="kl"><span class="ar">عدد الكيلومترات المقطوعة</span><span class="fr">KILOMÉTRAGE PARCOURU:</span></td>
                <td class="kv"><?php if($contract->mileage_start && $contract->mileage_end): ?><?php echo e(number_format($contract->mileage_end - $contract->mileage_start)); ?> km@endif</td>
            </tr>
            <tr>
                <td class="kl"><span class="fr">Niveau Carburant / مستوى الوقود</span></td>
                <td class="kv"><?php echo e($contract->fuel_level_start ?? ''); ?></td>
            </tr>
            <tr>
                <td class="kl"><span class="fr">Assurance / التأمين</span></td>
                <td class="kv"><?php echo e($contract->insurance_type ?? ''); ?></td>
            </tr>
            <tr>
                <td class="kl"><span class="fr">Tarif Journalier / الأجرة اليومية</span></td>
                <td class="kv"><?php echo e(number_format($contract->daily_rate, 2)); ?> <?php echo e($contract->currency); ?></td>
            </tr>
        </table>
    </div>
</div>


<div class="dp-grid">

    
    <div class="dp-col">
        <div class="sec-head"><span class="sf">Le Conducteur Supplémentaire</span><span class="sa">السائق المرخـص</span></div>
        <div class="field-row"><div class="fl"><span class="fr">Nom &amp; Prénom :</span><span class="ar">الاسم الشخصي والعائلي</span></div><div class="fv"></div></div>
        <div class="field-row"><div class="fl"><span class="fr">Permis de conduire N° :</span><span class="ar">رخصة السياقة رقم</span></div><div class="fv"></div></div>
        <div class="field-row"><div class="fl"><span class="fr">Délivré à :</span><span class="ar">إصدارها في</span></div><div class="fv"></div></div>
        <div class="field-row"><div class="fl"><span class="fr">Passeport N° :</span><span class="ar">رقم جواز السفر</span></div><div class="fv"></div></div>
        <div class="field-row"><div class="fl"><span class="fr">C.I.N n° :</span><span class="ar">البطاقة الوطنية</span></div><div class="fv"></div></div>
    </div>

    
    <div class="dp-col">
        <div class="sec-head"><span class="sf">Paiment</span><span class="sa">الأداء</span></div>
        <div class="pay-row">
            <div class="pl"><span class="fr">* Espèce :</span><span class="ar">نقدا</span></div>
            <div class="pv"><?php if($contract->booking_payment_status === 'paid'): ?> ✓ <?php endif; ?></div>
        </div>
        <div class="pay-row">
            <div class="pl"><span class="fr">* Chèque :</span><span class="ar">شيكا</span></div>
            <div class="pv"></div>
        </div>
        <div class="pay-row">
            <div class="pl"><span class="fr">* Caution :</span><span class="ar">ضمانة</span></div>
            <div class="pv"><?php echo e($contract->deposit_amount ? number_format($contract->deposit_amount, 2) . ' ' . $contract->currency : ''); ?></div>
        </div>
        <?php
            $totalTTC  = (float)$contract->total_amount;
            $totalHT   = $totalTTC / 1.20;
            $taxAmount = $totalTTC - $totalHT;
        ?>
        <div class="totals-inner">
            <div class="tot-row"><span>Total Hors Taxe</span><span style="font-weight:bold;"><?php echo e(number_format($totalHT, 2)); ?> Dh</span></div>
            <div class="tot-row"><span>Taxe TVA 20%</span><span style="font-weight:bold;"><?php echo e(number_format($taxAmount, 2)); ?> Dh</span></div>
            <div class="tot-row tot-grand"><span>TOTAL DE LOCATION ............</span><span><?php echo e(number_format($totalTTC, 2)); ?> Dh</span></div>
        </div>
        <div class="fait-a">
            <div style="flex:1;">Fait à <?php echo e($contract->signature_city ?: 'Casablanca'); ?> le <?php echo e($contract->start_date->format('d/m/Y')); ?></div>
            <div style="flex:1; text-align:center; border-left:1px solid #ddd; padding-left:5px;">
                <div style="font-weight:bold; font-size:7.5px;">Le responsable</div>
                <?php if($contract->signature_agent_start): ?>
                    <img src="<?php echo e($contract->signature_agent_start); ?>" style="max-height:26px; max-width:75px; margin-top:2px;">
                <?php else: ?>
                    <div style="margin-top:18px;"></div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>


<div class="cs-grid">
    <div class="cond-box">
        <div style="font-size:7.5px; font-weight:bold; margin-bottom:2px; border-bottom:1px solid #ccc; padding-bottom:2px;">
            Conditions Générales de Location / الشروط العامة للكراء
        </div>
        <?php if($contract->conditions_text): ?>
            <div class="cond-text"><?php echo nl2br(e($contract->conditions_text)); ?></div>
        <?php else: ?>
            <div class="cond-text">
                Je reconnais avoir pris Connaissance des présentes conditions générales (recto verso) que je m'engage à les respecter.<br><br>
                <strong>1.</strong> Le Locataire reconnaît avoir reçu le véhicule en bon état de marche, propre et tel que décrit.<br>
                <strong>2.</strong> Le Locataire est responsable de tout dommage survenu pendant la location, y compris les amendes.<br>
                <strong>3.</strong> Le véhicule doit être restitué à la date et au lieu convenus. Tout retard entraîne une facturation supplémentaire.<br>
                <strong>4.</strong> Le carburant doit être restitué au même niveau. Tout manque sera facturé.<br>
                <strong>5.</strong> Franchise sinistre : <strong><?php echo e($contract->insurance_deductible ? number_format($contract->insurance_deductible, 2) . ' ' . $contract->currency : '2 000,00 MAD'); ?></strong>.<br>
                <strong>6.</strong> Interdiction de sous-louer ou confier le véhicule à un tiers non autorisé.<br>
                <strong>7.</strong> Caution de <strong><?php echo e(number_format($contract->deposit_amount, 2)); ?> <?php echo e($contract->currency); ?></strong> restituée après vérification.<br>
                <strong>8.</strong> En cas de panne ou accident, contacter l'agence immédiatement.<br>
                <br>
                <span style="direction:rtl; display:block; text-align:right; font-size:6.5px; color:#555;">
                أعترف بإطلاعي الكامل للقانون العام لكراء السيارات في ظهر هذا العقد والتزامي باحترامه
                </span>
            </div>
        <?php endif; ?>
    </div>
    <div class="sig-area">
        <div class="sig-lbl">Signature de Client — إمضاء الزبون</div>
        <div class="sig-img">
            <?php if($contract->signature_client_start): ?>
                <img src="<?php echo e($contract->signature_client_start); ?>" alt="Signature Client">
            <?php endif; ?>
        </div>
        <div class="sig-inf">
            Nom : <?php echo e($contract->client_name); ?><br>
            Date : <?php echo e($contract->start_date->format('d/m/Y')); ?>

        </div>
        <?php if($contract->status === 'completed'): ?>
            <div style="margin-top:5px; border-top:1px solid #ddd; padding-top:3px;">
                <div class="sig-lbl">Signature Retour — توقيع عند الإرجاع</div>
                <div class="sig-img">
                    <?php if($contract->signature_client_end): ?>
                        <img src="<?php echo e($contract->signature_client_end); ?>" alt="Signature Retour">
                    <?php endif; ?>
                </div>
                <div class="sig-inf">Date retour : <?php echo e($contract->end_date->format('d/m/Y')); ?></div>
            </div>
        <?php endif; ?>
    </div>
</div>


<?php
    $startCond = is_array($contract->condition_start) ? $contract->condition_start : [];
    $endCond   = is_array($contract->condition_end)   ? $contract->condition_end   : [];
?>
<div class="insp-wrap">

    
    <div class="insp-col depart">
        <div class="insp-title">← DÉPART</div>
        <div class="insp-sub">Véhicule En parfait état</div>
        <div class="on-box">
            Oui <span class="chk"><?php echo e(count($startCond) === 0 ? '✓' : ''); ?></span>
            Non <span class="chk"><?php echo e(count($startCond) > 0 ? '✓' : ''); ?></span>
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
                <?php $__currentLoopData = $startCond; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i => $dmg): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <circle cx="<?php echo e(25 + ($i % 4) * 12); ?>" cy="<?php echo e(60 + floor($i / 4) * 20); ?>" r="4" fill="rgba(220,50,50,0.65)" stroke="#c00" stroke-width="0.8"/>
                    <text x="<?php echo e(25 + ($i % 4) * 12); ?>" y="<?php echo e(63 + floor($i / 4) * 20); ?>" text-anchor="middle" font-size="5" fill="#fff"><?php echo e($i + 1); ?></text>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            </svg>
        </div>
        <div style="font-size:6.5px; color:#555; margin-bottom:2px;">Commentaires — numérotez les dommages :</div>
        <div class="num-list">
            <?php $__currentLoopData = $startCond; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i => $dmg): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                <div><?php echo e($i+1); ?>. <?php echo e($dmg['zone'] ?? ($dmg['label'] ?? '')); ?><?php echo e(!empty($dmg['description']) ? ' — '.$dmg['description'] : ''); ?></div>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            <?php for($i = count($startCond)+1; $i <= 5; $i++): ?>
                <div><?php echo e($i); ?>. ................................................</div>
            <?php endfor; ?>
>>>>>>> 24c7ca9 (maintanace contrat)
        </div>
    </div>

    
<<<<<<< HEAD
    <table class="main-table">
        <tr>
            
            <td class="col-cell col-left">
                
                <div class="row-item">
                    <span class="row-lbl-fr">Marque :</span>
                    <span class="row-val"><?php echo e($contract->vehicle_name ?? ''); ?></span>
                    <span class="row-lbl-ar">نوع</span>
                </div>
                <div class="row-item">
                    <span class="row-lbl-fr">N° Immatriculation :</span>
                    <span class="row-val"><?php echo e($contract->vehicle_plate ?? ''); ?></span>
                    <span class="row-lbl-ar">رقم التسجيل</span>
                </div>
                <div class="row-item">
                    <span class="row-lbl-fr">Lieu de Livraison :</span>
                    <span class="row-val"><?php echo e($contract->signature_city ?: 'Tanger'); ?></span>
                    <span class="row-lbl-ar">مكان التسليم</span>
                </div>
                <div class="row-item sep-thick">
                    <span class="row-lbl-fr">Lieu de Reprise :</span>
                    <span class="row-val"><?php echo e($contract->signature_city ?: 'Tanger'); ?></span>
                    <span class="row-lbl-ar">مكان الاسترجاع</span>
                </div>

                
                <div class="row-item">
                    <span class="row-lbl-fr">NOM :</span>
                    <span class="row-val" style="font-weight:900;"><?php echo e($contract->client_name ?? ''); ?></span>
                    <span class="row-lbl-ar">الاسم</span>
                </div>
                <div class="row-item">
                    <span class="row-lbl-fr">CIN N° :</span>
                    <span class="row-val"><?php echo e($contract->client_id_number ?? ''); ?></span>
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
                    <span class="row-val" style="font-size:7px;"><?php echo e($contract->client_address ?? ''); ?></span>
                    <span class="row-lbl-ar">العنوان بالمغرب</span>
                </div>
                <div class="row-item">
                    <span class="row-lbl-fr">Adresse à l 'Etranger :</span>
                    <span class="row-val"></span>
                    <span class="row-lbl-ar">العنوان بالخارج</span>
                </div>
                <div class="row-item">
                    <span class="row-lbl-fr">Permis de Conduire N° :</span>
                    <span class="row-val"><?php echo e($contract->client_license_number ?? ''); ?></span>
                    <span class="row-lbl-ar">رخصة السياقة رقم</span>
                </div>
                <div class="row-item">
                    <span class="row-lbl-fr">Délivré à :</span>
                    <span class="row-val"></span>
                    <span class="row-lbl-ar">اصدارها في</span>
                </div>
                <div class="row-item">
                    <span class="row-lbl-fr">Le :</span>
                    <span class="row-val"><?php if($contract->client_license_expiry): ?><?php echo e($contract->client_license_expiry->format('d/m/Y')); ?><?php endif; ?></span>
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
                    <span class="row-val"><?php echo e($contract->client_phone ?? ''); ?></span>
                    <span class="row-lbl-ar">هاتف الاتصال</span>
                </div>
            </td>

            
            <td class="col-cell col-right">
                
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
                            <td class="date-cell"><?php echo e($start->format('d')); ?></td>
                            <td class="date-cell"><?php echo e($start->format('m')); ?></td>
                            <td class="date-cell"><?php echo e($start->format('Y')); ?></td>
                            <td class="date-cell"><?php echo e($start->format('H:i')); ?></td>
                        </tr>
                        <tr>
                            <td class="date-lbl">
                                <div class="lbl-dual">
                                    <span class="fr">Retour Prevu</span>
                                    <span class="ar">الرجوع الموقع</span>
                                </div>
                            </td>
                            <td class="date-cell"><?php echo e($end->format('d')); ?></td>
                            <td class="date-cell"><?php echo e($end->format('m')); ?></td>
                            <td class="date-cell"><?php echo e($end->format('Y')); ?></td>
                            <td class="date-cell"><?php echo e($end->format('H:i')); ?></td>
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
                                <?php echo e($days); ?> Jour<?php echo e($days > 1 ? 's' : ''); ?> / <?php echo e($days); ?> أيام
                            </td>
                        </tr>
                    </tbody>
                </table>

                
                <div class="km-section">
                    <div class="km-row">
                        <div class="km-label-box">
                            <span class="ar">عدد الكيلومترات عند الرجوع</span>
                            <span>KILOMETRAGE RETOUR:</span>
                        </div>
                        <div class="km-digits">
                            <?php $__currentLoopData = $kmRetDigits; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $d): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                <div class="km-digit-cell"><?php echo e($d); ?></div>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                        </div>
                    </div>
                    <div class="km-row">
                        <div class="km-label-box">
                            <span class="ar">عدد الكيلومترات عند الذهاب</span>
                            <span>KILOMETRAGE DEPART:</span>
                        </div>
                        <div class="km-digits">
                            <?php $__currentLoopData = $kmDepDigits; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $d): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                <div class="km-digit-cell"><?php echo e($d); ?></div>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                        </div>
                    </div>
                    <div class="km-row">
                        <div class="km-label-box">
                            <span class="ar">عدد الكيلومترات المقطوعة</span>
                            <span>KILOMETRAGE PARCOURU:</span>
                        </div>
                        <div class="km-digits">
                            <?php $__currentLoopData = $kmParDigits; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $d): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                <div class="km-digit-cell"><?php echo e($d); ?></div>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                        </div>
                    </div>
                </div>

                
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

    
    <table class="bottom-table">
        <tr>
            
            <td style="width: 50%; vertical-align: top; border-right: 1.5px solid #000;">
                <div class="pay-header">
                    <span>Paiement</span>
                    <span style="font-family:'Cairo', sans-serif;">الأداء</span>
                </div>
                <div class="pay-item">
                    <span><span class="chk-box"><?php echo e(($contract->booking_payment_status === 'paid') ? '✓' : ''); ?></span> * Espèce :</span>
                    <span style="font-family:'Cairo', sans-serif; font-weight:700;">نقدا</span>
                </div>
                <div class="pay-item">
                    <span><span class="chk-box"></span> * Chèque :</span>
                    <span style="font-family:'Cairo', sans-serif; font-weight:700;">شيكا</span>
                </div>
                <div class="pay-item">
                    <span>
                        <span class="chk-box"><?php echo e($contract->deposit_amount > 0 ? '✓' : ''); ?></span> * Caution :
                        <strong style="margin-left:4px;"><?php echo e($contract->deposit_amount > 0 ? number_format($contract->deposit_amount, 2) . ' Dh' : ''); ?></strong>
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
                    <?php if($contract->signature_client_start): ?>
                        <img src="<?php echo e($contract->signature_client_start); ?>" style="max-height:26px; max-width:120px;" alt="Signature Client">
                    <?php endif; ?>
                </div>
            </td>

            
            <td style="width: 50%; vertical-align: top;">
                <div class="tot-row">
                    <span>Total Hors Taxe</span>
                    <span style="font-weight:700;"><?php echo e(number_format($totalHT, 2)); ?> Dh</span>
                </div>
                <div class="tot-row">
                    <span>Taxe TVA 20%</span>
                    <span style="font-weight:700;"><?php echo e(number_format($tvaAmount, 2)); ?> Dh</span>
                </div>
                <div class="tot-row grand">
                    <span>TOTAL DE LOCATION</span>
                    <span><?php echo e(number_format($totalTTC, 2)); ?> Dh</span>
                </div>

                <div class="fait-tanger">
                    Fait à Tanger le : <span style="font-weight:800;"><?php echo e($start->format('d/m/Y')); ?></span>
                </div>

                <div class="resp-area">
                    <div class="resp-title">Le responsable</div>
                    <div class="resp-sig-box">
                        <?php if($contract->signature_agent_start): ?>
                            <img src="<?php echo e($contract->signature_agent_start); ?>" style="max-height:24px; max-width:100px;" alt="Signature Responsable">
                        <?php endif; ?>
                    </div>
                </div>
            </td>
        </tr>
    </table>

    
    <?php
        $startCond = is_array($contract->condition_start) ? $contract->condition_start : [];
        $endCond   = is_array($contract->condition_end)   ? $contract->condition_end   : [];
    ?>
    <table class="insp-table">
        <tr>
            
            <td class="insp-cell insp-depart">
                <div class="insp-arrow-head">← DEPART</div>
                <div class="insp-etat">
                    Véhicule En parfait état
                    <span class="insp-oui-non">
                        <span>[ <?php echo e(count($startCond) === 0 ? '✓' : ' '); ?> ] Oui</span>
                        <span>[ <?php echo e(count($startCond) > 0 ? '✓' : ' '); ?> ] Non</span>
                    </span>
                </div>
                <div class="insp-notice">(Rayer la mention inutile)</div>
                <div class="insp-comm-title">
                    <strong>Commentaires</strong><br>
                    Positionner les numéros à l 'endroit précis du dommage, sur la matrice à gauche )
                </div>
                <div class="line-dots">
                    <?php for($i = 1; $i <= 5; $i++): ?>
                        <?php $dmgText = isset($startCond[$i-1]) ? ($startCond[$i-1]['zone'] ?? ($startCond[$i-1]['label'] ?? '')) : ''; ?>
                        <div><?php echo e($i); ?> <?php echo e($dmgText ? '· ' . $dmgText : '..........................................................'); ?></div>
                    <?php endfor; ?>
                </div>

                
                <div class="car-svg-wrap">
                    <img src="<?php echo e($carImgSrc); ?>" alt="Véhicule Inspection Départ" style="max-height: 112px; width: auto; object-fit: contain; margin: 0 auto; display: block;">
                </div>
            </td>

            
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

            
            <td class="insp-cell insp-retour">
                <div class="insp-arrow-head">RETOUR →</div>
                <div class="insp-etat">
                    Véhicule En parfait état
                    <span class="insp-oui-non">
                        <span>[ <?php echo e(count($endCond) === 0 ? '✓' : ' '); ?> ] Oui</span>
                        <span>[ <?php echo e(count($endCond) > 0 ? '✓' : ' '); ?> ] Non</span>
                    </span>
                </div>
                <div class="insp-notice">(Rayer la mention inutile)</div>
                <div class="insp-comm-title">
                    <strong>Commentaires</strong><br>
                    Positionner les numéros à l 'endroit précis du dommage, sur la matrice à gauche )
                </div>
                <div class="line-dots">
                    <?php for($i = 1; $i <= 5; $i++): ?>
                        <?php $dmgTextEnd = isset($endCond[$i-1]) ? ($endCond[$i-1]['zone'] ?? ($endCond[$i-1]['label'] ?? '')) : ''; ?>
                        <div><?php echo e($i); ?> <?php echo e($dmgTextEnd ? '· ' . $dmgTextEnd : '..........................................................'); ?></div>
                    <?php endfor; ?>
                </div>

                
                <div class="car-svg-wrap">
                    <img src="<?php echo e($carImgSrc); ?>" alt="Véhicule Inspection Retour" style="max-height: 112px; width: auto; object-fit: contain; margin: 0 auto; display: block;">
                </div>
            </td>
        </tr>
    </table>

</div>

=======
    <div class="insp-col damages">
        <div class="insp-title" style="font-size:7.5px;">DOMMAGES IDENTIFIÉS ET ACCEPTÉS</div>
        <div class="dmg-item"><span class="chk"></span><span style="text-decoration:line-through; color:#999;">// Éraflure</span></div>
        <div class="dmg-item"><span class="chk"></span><span>✕ Bosse</span></div>
        <div class="dmg-item"><span class="chk"></span><span>□ Manque</span></div>
        <table class="dmg-tbl">
            <tr><th>Nombre</th><th>Paraphe Client</th></tr>
            <?php for($r = 0; $r < 6; $r++): ?>
            <tr><td></td><td></td></tr>
            <?php endfor; ?>
        </table>
    </div>

    
    <div class="insp-col retour">
        <div class="insp-title">RETOUR →</div>
        <div class="insp-sub">Véhicule En parfait état</div>
        <div class="on-box">
            Oui <span class="chk"><?php echo e(count($endCond) === 0 ? '✓' : ''); ?></span>
            Non <span class="chk"><?php echo e(count($endCond) > 0 ? '✓' : ''); ?></span>
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
                <?php $__currentLoopData = $endCond; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i => $dmg): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <circle cx="<?php echo e(25 + ($i % 4) * 12); ?>" cy="<?php echo e(60 + floor($i / 4) * 20); ?>" r="4" fill="rgba(220,50,50,0.65)" stroke="#c00" stroke-width="0.8"/>
                    <text x="<?php echo e(25 + ($i % 4) * 12); ?>" y="<?php echo e(63 + floor($i / 4) * 20); ?>" text-anchor="middle" font-size="5" fill="#fff"><?php echo e($i + 1); ?></text>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            </svg>
        </div>
        <div style="font-size:6.5px; color:#555; margin-bottom:2px;">Commentaires — numérotez les dommages :</div>
        <div class="num-list">
            <?php $__currentLoopData = $endCond; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i => $dmg): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                <div><?php echo e($i+1); ?>. <?php echo e($dmg['zone'] ?? ($dmg['label'] ?? '')); ?><?php echo e(!empty($dmg['description']) ? ' — '.$dmg['description'] : ''); ?></div>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            <?php for($i = count($endCond)+1; $i <= 5; $i++): ?>
                <div><?php echo e($i); ?>. ................................................</div>
            <?php endfor; ?>
        </div>
    </div>

</div>


<div class="doc-footer">
    Document généré le <?php echo e(now()->format('d/m/Y à H:i')); ?> —
    Contrat N° <?php echo e($contract->contract_number); ?> —
    Atellas Fleet S.A.R.L · Casablanca, Maroc
</div>

</div>
>>>>>>> 24c7ca9 (maintanace contrat)
</body>
</html>
<?php /**PATH /var/www/html/resources/views/pdf/contract.blade.php ENDPATH**/ ?>