<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Facture {{ $invoice->invoice_number }}</title>
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
        .section { margin-bottom: 16px; }
        .text-right { text-align: right; }
        .totals-table td { border: none; padding: 3px 8px; }
        .totals-table .total-row td { border-top: 2px solid #1e293b; font-weight: bold; font-size: 13px; }
        .footer { margin-top: 20px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
    </style>
</head>
<body>
<div class="page">
    {{-- Header --}}
    <table style="border: none; margin-bottom: 20px;">
        <tr>
            <td style="border: none; width: 50%; vertical-align: top;">
                <strong style="font-size: 14px;">Atellas Fleet S.A.R.L</strong><br>
                <span style="font-size: 10px; color: #64748b;">Casablanca, Maroc</span>
            </td>
            <td style="border: none; text-align: right; vertical-align: top;">
                <h1>FACTURE</h1>
                <p style="color: #64748b;">N° {{ $invoice->invoice_number }}</p>
                <span class="badge badge-{{ $invoice->status }}">{{ ucfirst($invoice->status) }}</span>
            </td>
        </tr>
    </table>

    {{-- Info --}}
    <div class="section">
        <table style="border: none;">
            <tr>
                <td style="border: none; width: 50%; vertical-align: top;">
                    <strong style="font-size: 10px; color: #64748b; text-transform: uppercase;">Facturer à</strong><br>
                    <strong>{{ $invoice->client_name }}</strong><br>
                    @if($invoice->client_email) {{ $invoice->client_email }}<br> @endif
                    @if($invoice->client_phone) {{ $invoice->client_phone }}<br> @endif
                    @if($invoice->client_address) {{ $invoice->client_address }} @endif
                </td>
                <td style="border: none; text-align: right; vertical-align: top;">
                    <strong style="font-size: 10px; color: #64748b; text-transform: uppercase;">Dates</strong><br>
                    Émission : {{ $invoice->issue_date ? $invoice->issue_date->format('d/m/Y') : $invoice->created_at->format('d/m/Y') }}<br>
                    @if($invoice->due_date) Échéance : {{ $invoice->due_date->format('d/m/Y') }}<br> @endif
                    @if($invoice->paid_at) Payée le : {{ $invoice->paid_at->format('d/m/Y') }}<br> @endif
                    @if($invoice->contract)
                        <br>Contrat : {{ $invoice->contract->contract_number }}
                    @endif
                </td>
            </tr>
        </table>
    </div>

    {{-- Line items --}}
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
                @foreach(($invoice->items ?? []) as $item)
                <tr>
                    <td>{{ $item['label'] ?? '' }}</td>
                    <td class="text-right">{{ $item['quantity'] ?? 0 }}</td>
                    <td class="text-right">{{ number_format($item['unit_price'] ?? 0, 2) }}</td>
                    <td class="text-right">{{ $item['tax_rate'] ?? 0 }}%</td>
                    <td class="text-right">{{ number_format($item['line_total'] ?? 0, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    {{-- Totals --}}
    <table class="totals-table" style="width: 50%; margin-left: auto;">
        <tr>
            <td style="color: #64748b;">Sous-total HT</td>
            <td class="text-right">{{ number_format($invoice->subtotal, 2) }} {{ $invoice->currency }}</td>
        </tr>
        @if($invoice->discount_amount > 0)
        <tr>
            <td style="color: #64748b;">Remise</td>
            <td class="text-right">- {{ number_format($invoice->discount_amount, 2) }} {{ $invoice->currency }}</td>
        </tr>
        @endif
        <tr>
            <td style="color: #64748b;">TVA ({{ $invoice->tax_rate }}%)</td>
            <td class="text-right">{{ number_format($invoice->tax_amount, 2) }} {{ $invoice->currency }}</td>
        </tr>
        <tr class="total-row">
            <td>Total TTC</td>
            <td class="text-right">{{ number_format($invoice->total, 2) }} {{ $invoice->currency }}</td>
        </tr>
    </table>

    {{-- Payment --}}
    @if($invoice->status === 'paid' && $invoice->payment_method)
    <div class="section" style="margin-top: 16px;">
        <table style="border: none; background: #f0fdf4; border-radius: 4px;">
            <tr>
                <td style="border: none; padding: 10px;">
                    <strong style="color: #065f46;">✓ Paiement reçu</strong> —
                    {{ ucfirst($invoice->payment_method) }}
                    @if($invoice->paid_at) · {{ $invoice->paid_at->format('d/m/Y') }} @endif
                </td>
            </tr>
        </table>
    </div>
    @endif

    {{-- Notes --}}
    @if($invoice->notes)
    <div class="section" style="margin-top: 12px;">
        <h2>Notes</h2>
        <p style="font-size: 10px; color: #475569;">{!! nl2br(e($invoice->notes)) !!}</p>
    </div>
    @endif

    <div class="footer">
        Atellas Fleet S.A.R.L — Casablanca, Maroc
    </div>
</div>
</body>
</html>
