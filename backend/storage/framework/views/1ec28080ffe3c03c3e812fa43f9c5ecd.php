<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Facture <?php echo e($invoice->invoice_number); ?></title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 11px; color: #1e293b; line-height: 1.5; }
        .page { padding: 30px; }
        h1 { font-size: 18px; color: #0f172a; margin-bottom: 4px; }
        h2 { font-size: 13px; color: #334155; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
        .badge-draft { background: #f1f5f9; color: #475569; }
        .badge-sent { background: #dbeafe; color: #1e40af; }
        .badge-paid { background: #d1fae5; color: #065f46; }
        .badge-overdue { background: #fecaca; color: #991b1b; }
        .badge-cancelled { background: #f1f5f9; color: #94a3b8; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        table th { background: #f1f5f9; text-align: left; padding: 6px 8px; font-size: 10px; text-transform: uppercase; color: #64748b; border: 1px solid #e2e8f0; }
        table td { padding: 6px 8px; border: 1px solid #e2e8f0; }
        .company-header { border: 1px solid #cbd5e1; margin-bottom: 18px; }
        .company-header td { border: none; vertical-align: middle; }
        .company-logo-cell { width: 38%; text-align: center; border-right: 1px solid #cbd5e1; padding: 12px 16px; }
        .company-info-cell { width: 62%; padding: 12px 18px; }
        .company-logo { max-height: 54px; max-width: 120px; margin-bottom: 4px; }
        .company-wordmark { max-height: 28px; max-width: 100px; vertical-align: middle; margin-right: 6px; }
        .company-name { font-size: 13px; font-weight: 800; color: #0f172a; letter-spacing: 0.4px; }
        .company-line { font-size: 10px; color: #334155; line-height: 1.35; }
        .company-legal { font-size: 8.5px; color: #475569; line-height: 1.35; margin-top: 5px; text-align: justify; }
        .invoice-heading { border: none; margin-bottom: 16px; }
        .invoice-heading td { border: none; vertical-align: top; }
        .section { margin-bottom: 16px; }
        .text-right { text-align: right; }
        .totals-table td { border: none; padding: 3px 8px; }
        .totals-table .total-row td { border-top: 2px solid #1e293b; font-weight: bold; font-size: 13px; }
        .footer { margin-top: 20px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
    </style>
</head>
<body>
<?php
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
?>

<div class="page">
    
    <table class="company-header">
        <tr>
            <td class="company-logo-cell">
                <?php if($logoSrc): ?>
                    <img src="<?php echo e($logoSrc); ?>" class="company-logo" alt="RLV">
                <?php endif; ?>
                <div class="company-name">RAHIMI LOCATION DE VOITURE</div>
                <div class="company-line">LOT EL NAHDA RUE 37 N°12 BLOC 38, Tanger</div>
                <div class="company-line">Tel: 06 77 81 37 18 / 07 77 57 33 79</div>
            </td>
            <td class="company-info-cell">
                <div style="margin-bottom: 4px;">
                    <?php if($wordmarkSrc): ?>
                        <img src="<?php echo e($wordmarkSrc); ?>" class="company-wordmark" alt="RLV">
                    <?php else: ?>
                        <strong style="font-size: 24px; color: #e11d48;">RLV</strong>
                    <?php endif; ?>
                    <strong style="font-size: 15px; color: #0f172a;">Location de voiture</strong>
                </div>
                <div class="company-legal">
                    Le Locataire s'expose à des poursuites juridiques 24 heures après la date convenue au départ si le véhicule n'est toujours pas retourné et cela sans que RLV ait été informé d'une prolongation de location et ait reçu la somme supplémentaire due. Le véhicule ne doit être conduit que par le locataire.
                </div>
            </td>
        </tr>
    </table>

    
    <table class="invoice-heading">
        <tr>
            <td style="border: none; width: 50%; vertical-align: top;">
                <h1>FACTURE</h1>
                <p style="color: #64748b;">N° <?php echo e($invoice->invoice_number); ?></p>
            </td>
            <td style="border: none; text-align: right; vertical-align: top;">
                <span class="badge badge-<?php echo e($invoice->status); ?>"><?php echo e(ucfirst($invoice->status)); ?></span>
            </td>
        </tr>
    </table>

    
    <div class="section">
        <table style="border: none;">
            <tr>
                <td style="border: none; width: 50%; vertical-align: top;">
                    <strong style="font-size: 10px; color: #64748b; text-transform: uppercase;">Facturer à</strong><br>
                    <strong><?php echo e($invoice->client_name); ?></strong><br>
                    <?php if($invoice->client_email): ?> <?php echo e($invoice->client_email); ?><br> <?php endif; ?>
                    <?php if($invoice->client_phone): ?> <?php echo e($invoice->client_phone); ?><br> <?php endif; ?>
                    <?php if($invoice->client_address): ?> <?php echo e($invoice->client_address); ?> <?php endif; ?>
                </td>
                <td style="border: none; text-align: right; vertical-align: top;">
                    <strong style="font-size: 10px; color: #64748b; text-transform: uppercase;">Dates</strong><br>
                    Émission : <?php echo e($invoice->issue_date ? $invoice->issue_date->format('d/m/Y') : $invoice->created_at->format('d/m/Y')); ?><br>
                    <?php if($invoice->due_date): ?> Échéance : <?php echo e($invoice->due_date->format('d/m/Y')); ?><br> <?php endif; ?>
                    <?php if($invoice->paid_at): ?> Payée le : <?php echo e($invoice->paid_at->format('d/m/Y')); ?><br> <?php endif; ?>
                    <?php if($invoice->contract): ?>
                        <br>Contrat : <?php echo e($invoice->contract->contract_number); ?>

                    <?php endif; ?>
                </td>
            </tr>
        </table>
    </div>

    
    <div class="section">
        <h2>Détails</h2>
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="text-right">Qté</th>
                    <th class="text-right">Prix unit.</th>
                    <th class="text-right">TVA</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                <?php $__currentLoopData = ($invoice->items ?? []); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                <tr>
                    <td><?php echo e($item['label'] ?? ''); ?></td>
                    <td class="text-right"><?php echo e($item['quantity'] ?? 0); ?></td>
                    <td class="text-right"><?php echo e(number_format($item['unit_price'] ?? 0, 2)); ?></td>
                    <td class="text-right"><?php echo e($item['tax_rate'] ?? 0); ?>%</td>
                    <td class="text-right"><?php echo e(number_format($item['line_total'] ?? 0, 2)); ?></td>
                </tr>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            </tbody>
        </table>
    </div>

    
    <table class="totals-table" style="width: 50%; margin-left: auto;">
        <tr>
            <td style="color: #64748b;">Sous-total HT</td>
            <td class="text-right"><?php echo e(number_format($invoice->subtotal, 2)); ?> <?php echo e($invoice->currency); ?></td>
        </tr>
        <?php if($invoice->discount_amount > 0): ?>
        <tr>
            <td style="color: #64748b;">Remise</td>
            <td class="text-right">- <?php echo e(number_format($invoice->discount_amount, 2)); ?> <?php echo e($invoice->currency); ?></td>
        </tr>
        <?php endif; ?>
        <tr>
            <td style="color: #64748b;">TVA (<?php echo e($invoice->tax_rate); ?>%)</td>
            <td class="text-right"><?php echo e(number_format($invoice->tax_amount, 2)); ?> <?php echo e($invoice->currency); ?></td>
        </tr>
        <tr class="total-row">
            <td>Total TTC</td>
            <td class="text-right"><?php echo e(number_format($invoice->total, 2)); ?> <?php echo e($invoice->currency); ?></td>
        </tr>
    </table>

    
    <?php if($invoice->status === 'paid' && $invoice->payment_method): ?>
    <div class="section" style="margin-top: 16px;">
        <table style="border: none; background: #f0fdf4; border-radius: 4px;">
            <tr>
                <td style="border: none; padding: 10px;">
                    <strong style="color: #065f46;">✓ Paiement reçu</strong> —
                    <?php echo e(ucfirst($invoice->payment_method)); ?>

                    <?php if($invoice->paid_at): ?> · <?php echo e($invoice->paid_at->format('d/m/Y')); ?> <?php endif; ?>
                </td>
            </tr>
        </table>
    </div>
    <?php endif; ?>

    
    <?php if($invoice->notes): ?>
    <div class="section" style="margin-top: 12px;">
        <h2>Notes</h2>
        <p style="font-size: 10px; color: #475569;"><?php echo nl2br(e($invoice->notes)); ?></p>
    </div>
    <?php endif; ?>

    <div class="footer">
        RAHIMI LOCATION DE VOITURE — LOT EL NAHDA RUE 37 N°12 BLOC 38, Tanger — Tel: 06 77 81 37 18 / 07 77 57 33 79
    </div>
</div>
</body>
</html>
<?php /**PATH /var/www/html/resources/views/pdf/invoice.blade.php ENDPATH**/ ?>