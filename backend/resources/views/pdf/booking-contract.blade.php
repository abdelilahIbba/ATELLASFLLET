<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Booking Contract</title>
    <style>
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            color: #111827;
            margin: 0;
            padding: 32px;
            line-height: 1.6;
        }

        .header {
            text-align: center;
            margin-bottom: 24px;
        }

        .header h1 {
            margin-bottom: 4px;
            letter-spacing: 2px;
        }

        .meta {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            margin-bottom: 24px;
        }

        .section {
            margin-bottom: 20px;
        }

        .section-title {
            font-weight: 700;
            text-transform: uppercase;
            font-size: 14px;
            margin-bottom: 8px;
            color: #2563eb;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
            font-size: 14px;
        }

        th,
        td {
            padding: 8px 10px;
            border: 1px solid #e5e7eb;
            text-align: left;
        }

        .terms {
            font-size: 13px;
            color: #4b5563;
        }

        .signature-row {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
        }

        .signature-box {
            width: 45%;
            border-top: 1px solid #9ca3af;
            text-align: center;
            padding-top: 8px;
            font-size: 13px;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>STE BEL ESPACE CAR</h1>
        <p>Premium Rental Agreement</p>
    </div>

    <div class="meta">
        <div>
            <strong>Contract #:</strong> {{ $contractNumber }}<br>
            <strong>Issued:</strong> {{ $issuedAt->format('F d, Y') }}
        </div>
        <div>
            <strong>Booking ID:</strong> #{{ $booking->id }}<br>
            <strong>Status:</strong> {{ ucfirst($booking->status) }}
        </div>
    </div>

    <div class="section">
        <p class="section-title">Client information</p>
        <table>
            <tr>
                <th>Name</th>
                <td>{{ $booking->client->name }}</td>
            </tr>
            <tr>
                <th>Email</th>
                <td>{{ $booking->client->email }}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <p class="section-title">Vehicle details</p>
        <table>
            <tr>
                <th>Car</th>
                <td>{{ $booking->car->make }} {{ $booking->car->model }}</td>
            </tr>
            <tr>
                <th>Daily Price</th>
                <td>{{ number_format($booking->car->daily_price, 2) }} Dhs</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <p class="section-title">Rental window</p>
        <table>
            <tr>
                <th>Start</th>
                 <td>{{ \Illuminate\Support\Carbon::parse($booking->start_date)->format('F d, Y') }}</td>
            </tr>
            <tr>
                <th>End</th>
                 <td>{{ \Illuminate\Support\Carbon::parse($booking->end_date)->format('F d, Y') }}</td>
            </tr>
        </table>
    </div>

    <div class="section terms">
        <p class="section-title">Key terms</p>
        <ul>
            <li>The client is responsible for the vehicle during the rental period, including traffic fines and damages not covered by insurance.</li>
            <li>Fuel, tolls, and optional concierge services are billed separately.</li>
            <li>Cancellation after confirmation may incur fees equivalent to one rental day.</li>
            <li>Vehicle must be returned in the condition received, barring reasonable usage.</li>
        </ul>
    </div>

    <div class="signature-row">
        <div class="signature-box">
            Client Signature & Date
        </div>
        <div class="signature-box">
            STE BEL ESPACE CAR Representative
        </div>
    </div>
</body>

</html>
