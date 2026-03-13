<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Confirmation de Réservation</title>
    <style>
        body { margin: 0; padding: 0; background: #f1f5f9; font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; }
        .wrapper { max-width: 600px; margin: 32px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.07); }
        .header { background: #0f172a; padding: 32px 40px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
        .header p  { color: #94a3b8; margin: 6px 0 0; font-size: 13px; }
        .badge { display: inline-block; background: #22c55e; color: #fff; border-radius: 20px; padding: 4px 16px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 12px; }
        .body { padding: 36px 40px; }
        .greeting { font-size: 16px; margin-bottom: 20px; }
        .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin: 28px 0 12px; }
        .vehicle-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px 20px; margin-bottom: 4px; }
        .vehicle-name { font-size: 20px; font-weight: 800; color: #0f172a; }
        .vehicle-meta { font-size: 13px; color: #64748b; margin-top: 4px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .info-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; }
        .info-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 4px; }
        .info-value { font-size: 15px; font-weight: 700; color: #1e293b; }
        .cost-table { width: 100%; border-collapse: collapse; margin-top: 4px; }
        .cost-table td { padding: 8px 0; font-size: 14px; }
        .cost-table .label { color: #64748b; }
        .cost-table .amount { text-align: right; font-weight: 600; color: #1e293b; }
        .cost-table .divider td { border-top: 1px solid #e2e8f0; padding-top: 12px; }
        .cost-table .total .label { font-size: 16px; font-weight: 800; color: #0f172a; }
        .cost-table .total .amount { font-size: 20px; font-weight: 800; color: #2563eb; }
        .gps-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px 16px; font-size: 13px; color: #1e40af; margin-top: 4px; }
        .notice { background: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 14px 16px; font-size: 13px; color: #713f12; margin-top: 24px; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 40px; text-align: center; }
        .footer p { font-size: 12px; color: #94a3b8; margin: 4px 0; }
        .footer a { color: #2563eb; text-decoration: none; }
    </style>
</head>
<body>
<div class="wrapper">

    <div class="header">
        <h1>{{ config('app.name') }}</h1>
        <p>Réservation de véhicule confirmée</p>
        <span class="badge">✓ Confirmé</span>
    </div>

    <div class="body">

        <p class="greeting">
            Bonjour <strong>{{ $booking->user?->name ?? 'Client' }}</strong>,<br>
            Votre réservation a été <strong>confirmée avec succès</strong>. Voici le récapitulatif complet.
        </p>

        {{-- Booking ID --}}
        <div class="section-title">Référence de réservation</div>
        <div class="vehicle-card">
            <div style="font-size:28px; font-weight:900; color:#2563eb; font-family:monospace; letter-spacing:2px;">#{{ str_pad($booking->id, 4, '0', STR_PAD_LEFT) }}</div>
            <div style="font-size:12px; color:#64748b; margin-top:4px;">Créée le {{ $booking->created_at?->format('d/m/Y à H:i') ?? now()->format('d/m/Y') }}</div>
        </div>

        {{-- Vehicle --}}
        <div class="section-title">Véhicule réservé</div>
        <div class="vehicle-card">
            <div class="vehicle-name">{{ $booking->car?->make }} {{ $booking->car?->model }}</div>
            <div class="vehicle-meta">{{ $booking->car?->year }} &bull; {{ $booking->car?->fuel_type }}</div>
            @if($booking->unit_number)
            <div style="margin-top:8px; font-size:12px; color:#64748b;">Unité nº{{ $booking->unit_number }}
                @if($booking->car?->unit_plates && isset($booking->car->unit_plates[$booking->unit_number - 1]))
                &mdash; Immat. {{ $booking->car->unit_plates[$booking->unit_number - 1] }}
                @endif
            </div>
            @endif
        </div>

        {{-- Dates --}}
        <div class="section-title">Période de location</div>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Prise en charge</div>
                <div class="info-value">{{ \Carbon\Carbon::parse($booking->start_date)->format('d/m/Y') }}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Retour</div>
                <div class="info-value">{{ \Carbon\Carbon::parse($booking->end_date)->format('d/m/Y') }}</div>
            </div>
        </div>

        {{-- Cost breakdown --}}
        @php
            $days      = \Carbon\Carbon::parse($booking->start_date)->diffInDays(\Carbon\Carbon::parse($booking->end_date)) + 1;
            $daily     = (float) ($booking->car?->daily_price ?? 0);
            $subtotal  = $days * $daily;
            $taxRate   = \App\Models\Setting::get('tax_rate', 20);
            $depRate   = \App\Models\Setting::get('security_deposit_rate', 20);
            $taxAmt    = round($subtotal * $taxRate / 100, 2);
            $depAmt    = round($subtotal * $depRate / 100, 2);
            $total     = $subtotal + $taxAmt + $depAmt;
        @endphp

        <div class="section-title">Détail des coûts</div>
        <div class="vehicle-card">
            <table class="cost-table">
                <tr>
                    <td class="label">{{ $daily }} × {{ $days }} jour{{ $days > 1 ? 's' : '' }}</td>
                    <td class="amount">{{ number_format($subtotal, 2) }} MAD</td>
                </tr>
                <tr>
                    <td class="label">Taxes ({{ $taxRate }}%)</td>
                    <td class="amount">{{ number_format($taxAmt, 2) }} MAD</td>
                </tr>
                <tr>
                    <td class="label">Dépôt de garantie ({{ $depRate }}%)</td>
                    <td class="amount">{{ number_format($depAmt, 2) }} MAD</td>
                </tr>
                <tr class="divider"><td colspan="2"></td></tr>
                <tr class="total">
                    <td class="label">Total</td>
                    <td class="amount">{{ number_format($total, 2) }} MAD</td>
                </tr>
            </table>
        </div>

        {{-- GPS pickup --}}
        @if($booking->pickup_latitude && $booking->pickup_longitude)
        <div class="section-title">Point de prise en charge</div>
        <div class="gps-box">
            📍 {{ $booking->pickup_address ?: 'Position GPS confirmée' }}<br>
            <span style="font-family:monospace; font-size:12px;">
                Lat : {{ $booking->pickup_latitude }} &bull; Long : {{ $booking->pickup_longitude }}
            </span>
        </div>
        @endif

        {{-- Notice --}}
        <div class="notice">
            ⚠️ <strong>Aucun paiement n'est prélevé avant la prise en charge.</strong> Le dépôt de garantie sera collecté au moment de la remise des clés.
        </div>

    </div>

    <div class="footer">
        <p>Vous recevez cet email car vous avez effectué une réservation sur <strong>{{ config('app.name') }}</strong>.</p>
        <p>Pour toute question : <a href="mailto:{{ config('mail.from.address') }}">{{ config('mail.from.address') }}</a></p>
        <p style="margin-top:12px; font-size:11px; color:#cbd5e1;">© {{ date('Y') }} {{ config('app.name') }}. Tous droits réservés.</p>
    </div>

</div>
</body>
</html>
