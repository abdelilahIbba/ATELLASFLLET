<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Contrat {{ $contract->contract_number }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 10.5px; color: #1e293b; line-height: 1.55; }
        .page { padding: 28px 32px; }

        /* ── Header ── */
        .doc-header { border-bottom: 3px solid #1d4ed8; padding-bottom: 12px; margin-bottom: 16px; }
        .company-name { font-size: 17px; font-weight: bold; color: #0f172a; letter-spacing: 0.5px; }
        .doc-title { font-size: 13px; font-weight: bold; color: #1d4ed8; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
        .doc-sub { font-size: 9px; color: #64748b; margin-top: 2px; }

        /* ── Meta bar ── */
        .meta-bar { display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 7px 12px; margin-bottom: 16px; }
        .meta-item { text-align: center; }
        .meta-label { font-size: 8px; color: #94a3b8; text-transform: uppercase; font-weight: bold; }
        .meta-value { font-size: 11px; font-weight: bold; color: #0f172a; margin-top: 1px; }

        /* ── Section ── */
        .section { margin-bottom: 14px; }
        .section-title { font-size: 10px; font-weight: bold; color: #1d4ed8; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #bfdbfe; padding-bottom: 3px; margin-bottom: 7px; }

        /* ── Tables ── */
        table { width: 100%; border-collapse: collapse; margin-bottom: 0; font-size: 10px; }
        table th { background: #f1f5f9; text-align: left; padding: 5px 7px; font-size: 9px; text-transform: uppercase; color: #64748b; border: 1px solid #e2e8f0; font-weight: bold; }
        table td { padding: 5px 7px; border: 1px solid #e2e8f0; vertical-align: top; }
        .label-col { color: #64748b; font-size: 9.5px; width: 38%; }
        .value-col { font-weight: bold; color: #0f172a; }

        /* ── Two columns ── */
        .two-col { display: flex; gap: 10px; margin-bottom: 14px; }
        .two-col > .col { flex: 1; }
        .party-box { border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px 10px; }
        .party-title { font-size: 9px; text-transform: uppercase; color: #94a3b8; font-weight: bold; margin-bottom: 5px; }
        .party-name { font-size: 12px; font-weight: bold; color: #0f172a; }
        .party-line { font-size: 9.5px; color: #475569; margin-top: 2px; }

        /* ── Car diagram box ── */
        .diagram-wrap { display: flex; gap: 16px; margin-top: 6px; }
        .car-svg { width: 130px; flex-shrink: 0; }
        .damage-list { flex: 1; }

        /* ── Totals ── */
        .totals-table { width: 280px; margin-left: auto; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; }
        .totals-table td { font-size: 10px; padding: 4px 8px; border: none; border-bottom: 1px solid #f1f5f9; }
        .totals-table .grand { background: #1d4ed8; color: #fff; font-weight: bold; font-size: 11px; }

        /* ── Conditions ── */
        .conditions-list { font-size: 9px; color: #475569; line-height: 1.55; padding-left: 14px; }
        .conditions-list li { margin-bottom: 3px; }

        /* ── Signatures ── */
        .sig-grid { display: flex; gap: 12px; }
        .sig-block { flex: 1; border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px; }
        .sig-label { font-size: 8px; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; font-weight: bold; }
        .sig-line { border-top: 1px solid #cbd5e1; margin-top: 40px; padding-top: 4px; font-size: 8px; color: #94a3b8; }
        .sig-box { min-height: 50px; text-align: center; }
        .sig-box img { max-width: 160px; max-height: 50px; margin-top: 4px; }

        /* ── Badges ── */
        .badge { display: inline-block; padding: 2px 7px; border-radius: 3px; font-size: 9px; font-weight: bold; text-transform: uppercase; }
        .badge-draft     { background: #fef9c3; color: #854d0e; }
        .badge-active    { background: #dbeafe; color: #1e40af; }
        .badge-completed { background: #dcfce7; color: #166534; }
        .badge-cancelled { background: #fee2e2; color: #991b1b; }
        .badge-paid      { background: #dcfce7; color: #166534; }
        .badge-unpaid    { background: #fee2e2; color: #991b1b; }
        .badge-deposit   { background: #fef9c3; color: #854d0e; }

        /* ── Footer ── */
        .doc-footer { margin-top: 18px; text-align: center; font-size: 8.5px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 6px; }
    </style>
</head>
<body>
<div class="page">

    {{-- ═══════════════════════════════════════ HEADER ══════════════════════════════════════ --}}
    <div class="doc-header">
        <table style="border: none; margin-bottom: 0;">
            <tr>
                <td style="border: none; vertical-align: middle; width: 70%;">
                    <div class="company-name">ATELLAS FLEET S.A.R.L</div>
                    <div class="doc-title">Contrat de Location de Véhicule</div>
                    <div class="doc-sub">Casablanca, Maroc · contact@atellas-fleet.ma · +212 5XX-XXXXXX</div>
                </td>
                <td style="border: none; text-align: right; vertical-align: middle;">
                    <span class="badge badge-{{ $contract->status }}">{{ ucfirst($contract->status) }}</span>
                </td>
            </tr>
        </table>
    </div>

    {{-- ═══════════════════════════════════════ META BAR ══════════════════════════════════════ --}}
    <div class="meta-bar">
        <div class="meta-item">
            <div class="meta-label">N° Contrat</div>
            <div class="meta-value">{{ $contract->contract_number }}</div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Date d'émission</div>
            <div class="meta-value">{{ $contract->created_at->translatedFormat('d F Y') }}</div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Début</div>
            <div class="meta-value">{{ $contract->start_date->format('d/m/Y') }}</div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Fin</div>
            <div class="meta-value">{{ $contract->end_date->format('d/m/Y') }}</div>
        </div>
        @php $days = max(1, $contract->start_date->diffInDays($contract->end_date)); @endphp
        <div class="meta-item">
            <div class="meta-label">Durée</div>
            <div class="meta-value">{{ $days }} jour{{ $days > 1 ? 's' : '' }}</div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Montant Total</div>
            <div class="meta-value">{{ number_format($contract->total_amount, 2) }} {{ $contract->currency }}</div>
        </div>
    </div>

    {{-- ═══════════════════════════════════════ 1. PARTIES ══════════════════════════════════════ --}}
    <div class="section">
        <div class="section-title">1. Les Parties</div>
        <div class="two-col">
            <div class="col party-box">
                <div class="party-title">Loueur (Agence)</div>
                <div class="party-name">Atellas Fleet S.A.R.L</div>
                <div class="party-line">RC : XXXXXXX · ICE : XXXXXXXXXXXXXXXXX</div>
                <div class="party-line">Casablanca, Maroc</div>
                <div class="party-line">contact@atellas-fleet.ma</div>
            </div>
            <div class="col party-box">
                <div class="party-title">Locataire (Client)</div>
                <div class="party-name">{{ $contract->client_name }}</div>
                @if($contract->client_nationality)
                    <div class="party-line">Nationalité : {{ $contract->client_nationality }}</div>
                @endif
                @if($contract->client_phone)
                    <div class="party-line">Tél : {{ $contract->client_phone }}</div>
                @endif
                @if($contract->client_email)
                    <div class="party-line">Email : {{ $contract->client_email }}</div>
                @endif
                @if($contract->client_address)
                    <div class="party-line">Adresse : {{ $contract->client_address }}</div>
                @endif
                @if($contract->client_id_number)
                    <div class="party-line">CIN / Passeport : <strong>{{ $contract->client_id_number }}</strong></div>
                @endif
                @if($contract->client_license_number)
                    <div class="party-line">
                        Permis de Conduire : <strong>{{ $contract->client_license_number }}</strong>
                        @if($contract->client_license_expiry)
                            · Exp. {{ $contract->client_license_expiry->format('d/m/Y') }}
                        @endif
                    </div>
                @endif
            </div>
        </div>
    </div>

    {{-- ═══════════════════════════════════════ 2. VÉHICULE ══════════════════════════════════════ --}}
    <div class="section">
        <div class="section-title">2. Le Véhicule</div>
        <table>
            <tr>
                <th>Désignation</th>
                <th>Immatriculation</th>
                @if($contract->vehicle_color) <th>Couleur</th> @endif
                @if($contract->vehicle_vin) <th>VIN / Châssis</th> @endif
                <th>Unité</th>
                @if($contract->insurance_type)
                <th>Assurance</th>
                @endif
            </tr>
            <tr>
                <td><strong>{{ $contract->vehicle_name }}</strong></td>
                <td>{{ $contract->vehicle_plate ?: '—' }}</td>
                @if($contract->vehicle_color) <td>{{ $contract->vehicle_color }}</td> @endif
                @if($contract->vehicle_vin)   <td>{{ $contract->vehicle_vin }}</td>   @endif
                <td>{{ $contract->unit_number ? '#' . $contract->unit_number : '—' }}</td>
                @if($contract->insurance_type)
                <td>{{ $contract->insurance_type }}
                    @if($contract->insurance_deductible)
                        (Franchise : {{ number_format($contract->insurance_deductible, 2) }} {{ $contract->currency }})
                    @endif
                </td>
                @endif
            </tr>
        </table>
    </div>

    {{-- ═══════════════════════════════════════ 3. PÉRIODE & TARIFICATION ══════════════════════════════════════ --}}
    <div class="section">
        <div class="section-title">3. Période de Location &amp; Tarification</div>
        <div class="two-col" style="align-items: flex-start;">
            <div class="col">
                <table>
                    <tr>
                        <td class="label-col">Date de Début</td>
                        <td class="value-col">{{ $contract->start_date->translatedFormat('d F Y') }}</td>
                    </tr>
                    <tr>
                        <td class="label-col">Date de Fin</td>
                        <td class="value-col">{{ $contract->end_date->translatedFormat('d F Y') }}</td>
                    </tr>
                    <tr>
                        <td class="label-col">Nombre de Jours</td>
                        <td class="value-col">{{ $days }} jour{{ $days > 1 ? 's' : '' }}</td>
                    </tr>
                    <tr>
                        <td class="label-col">Tarif Journalier</td>
                        <td class="value-col">{{ number_format($contract->daily_rate, 2) }} {{ $contract->currency }}</td>
                    </tr>
                    <tr>
                        <td class="label-col">Lieu de Remise</td>
                        <td class="value-col">{{ $contract->signature_city ?: 'Casablanca' }}</td>
                    </tr>
                    @if($contract->booking && $contract->booking->pickupPoint)
                    <tr>
                        <td class="label-col">Point de Prise en Charge</td>
                        <td class="value-col">{{ $contract->booking->pickupPoint->name ?? '—' }}</td>
                    </tr>
                    @endif
                </table>
            </div>
            <div class="col">
                <table class="totals-table" style="width: 100%; border: 1px solid #e2e8f0;">
                    <tr>
                        <td class="label-col">{{ $days }} j × {{ number_format($contract->daily_rate, 2) }} MAD</td>
                        <td style="text-align: right; font-weight: bold;">{{ number_format($days * $contract->daily_rate, 2) }} {{ $contract->currency }}</td>
                    </tr>
                    @foreach(($contract->extra_charges ?? []) as $charge)
                    <tr>
                        <td class="label-col">{{ $charge['label'] ?? 'Frais' }}</td>
                        <td style="text-align: right; font-weight: bold;">{{ number_format($charge['amount'] ?? 0, 2) }} {{ $contract->currency }}</td>
                    </tr>
                    @endforeach
                    <tr>
                        <td class="label-col">Caution</td>
                        <td style="text-align: right; font-weight: bold;">{{ number_format($contract->deposit_amount, 2) }} {{ $contract->currency }}</td>
                    </tr>
                    <tr class="grand" style="background: #1d4ed8; color: #fff;">
                        <td style="font-weight: bold; border: none; padding: 5px 7px;">TOTAL TTC</td>
                        <td style="text-align: right; font-weight: bold; border: none; padding: 5px 7px;">{{ number_format($contract->total_amount, 2) }} {{ $contract->currency }}</td>
                    </tr>
                    @if($contract->booking_payment_status)
                    <tr>
                        <td class="label-col">Statut de Paiement</td>
                        <td style="text-align: right;">
                            <span class="badge badge-{{ strtolower(str_replace(' ', '', $contract->booking_payment_status)) }}">
                                {{ $contract->booking_payment_status }}
                            </span>
                        </td>
                    </tr>
                    @endif
                </table>
            </div>
        </div>
    </div>

    {{-- ═══════════════════════════════════════ 4. ÉTAT VÉHICULE AU DÉPART ══════════════════════════════════════ --}}
    <div class="section">
        <div class="section-title">4. État du Véhicule au Départ</div>
        <div class="diagram-wrap">
            {{-- Car top-view SVG --}}
            <div class="car-svg">
                <svg viewBox="0 0 120 220" xmlns="http://www.w3.org/2000/svg" style="width:110px; height:auto;">
                    <text x="60" y="12" text-anchor="middle" font-size="8" fill="#94a3b8" font-family="sans-serif">AVANT</text>
                    <polygon points="60,18 100,50 105,180 15,180 20,50" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
                    <rect x="30" y="45" width="60" height="40" rx="4" fill="#bfdbfe" stroke="#93c5fd" stroke-width="1"/>
                    <rect x="20" y="62" width="12" height="18" rx="2" fill="#475569"/>
                    <rect x="88" y="62" width="12" height="18" rx="2" fill="#475569"/>
                    <rect x="25" y="95" width="70" height="6" rx="2" fill="#94a3b8"/>
                    <rect x="30" y="110" width="60" height="50" rx="4" fill="#bfdbfe" stroke="#93c5fd" stroke-width="1"/>
                    <rect x="18" y="130" width="12" height="20" rx="2" fill="#475569"/>
                    <rect x="90" y="130" width="12" height="20" rx="2" fill="#475569"/>
                    <rect x="25" y="165" width="70" height="6" rx="2" fill="#94a3b8"/>
                    <text x="60" y="210" text-anchor="middle" font-size="8" fill="#94a3b8" font-family="sans-serif">ARRIÈRE</text>
                </svg>
            </div>
            <div class="damage-list">
                <table>
                    <tr>
                        <th>Kilométrage départ</th>
                        <td class="value-col">{{ $contract->mileage_start ? number_format($contract->mileage_start) . ' km' : '—' }}</td>
                        <th>Niveau carburant</th>
                        <td class="value-col">{{ $contract->fuel_level_start ?: '—' }}</td>
                    </tr>
                </table>
                @php $startConditions = is_array($contract->condition_start) ? $contract->condition_start : []; @endphp
                <div style="margin-top: 8px;">
                    <div style="font-size: 9px; font-weight: bold; color: #64748b; margin-bottom: 4px;">
                        Dommages signalés ({{ count($startConditions) }}) :
                    </div>
                    @forelse($startConditions as $dmg)
                        <div style="font-size: 9px; color: #475569; margin-bottom: 2px;">
                            · {{ $dmg['zone'] ?? $dmg['label'] ?? 'Zone inconnue' }}
                            @if(!empty($dmg['description'])) — {{ $dmg['description'] }} @endif
                        </div>
                    @empty
                        <div style="font-size: 9px; color: #94a3b8; font-style: italic;">Aucun dommage signalé.</div>
                    @endforelse
                </div>
            </div>
        </div>
    </div>

    {{-- ═══════════════════════════════════════ 5. ÉTAT VÉHICULE AU RETOUR ══════════════════════════════════════ --}}
    <div class="section">
        <div class="section-title">5. État du Véhicule au Retour</div>
        <div class="diagram-wrap">
            <div class="car-svg">
                <svg viewBox="0 0 120 220" xmlns="http://www.w3.org/2000/svg" style="width:110px; height:auto;">
                    <text x="60" y="12" text-anchor="middle" font-size="8" fill="#94a3b8" font-family="sans-serif">AVANT</text>
                    <polygon points="60,18 100,50 105,180 15,180 20,50" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
                    <rect x="30" y="45" width="60" height="40" rx="4" fill="#bfdbfe" stroke="#93c5fd" stroke-width="1"/>
                    <rect x="20" y="62" width="12" height="18" rx="2" fill="#475569"/>
                    <rect x="88" y="62" width="12" height="18" rx="2" fill="#475569"/>
                    <rect x="25" y="95" width="70" height="6" rx="2" fill="#94a3b8"/>
                    <rect x="30" y="110" width="60" height="50" rx="4" fill="#bfdbfe" stroke="#93c5fd" stroke-width="1"/>
                    <rect x="18" y="130" width="12" height="20" rx="2" fill="#475569"/>
                    <rect x="90" y="130" width="12" height="20" rx="2" fill="#475569"/>
                    <rect x="25" y="165" width="70" height="6" rx="2" fill="#94a3b8"/>
                    <text x="60" y="210" text-anchor="middle" font-size="8" fill="#94a3b8" font-family="sans-serif">ARRIÈRE</text>
                </svg>
            </div>
            <div class="damage-list">
                <table>
                    <tr>
                        <th>Kilométrage retour</th>
                        <td class="value-col">{{ $contract->mileage_end ? number_format($contract->mileage_end) . ' km' : '—' }}</td>
                        <th>Niveau carburant</th>
                        <td class="value-col">{{ $contract->fuel_level_end ?: '—' }}</td>
                    </tr>
                </table>
                @php $endConditions = is_array($contract->condition_end) ? $contract->condition_end : []; @endphp
                <div style="margin-top: 8px;">
                    <div style="font-size: 9px; font-weight: bold; color: #64748b; margin-bottom: 4px;">
                        Dommages signalés ({{ count($endConditions) }}) :
                    </div>
                    @forelse($endConditions as $dmg)
                        <div style="font-size: 9px; color: #475569; margin-bottom: 2px;">
                            · {{ $dmg['zone'] ?? $dmg['label'] ?? 'Zone inconnue' }}
                            @if(!empty($dmg['description'])) — {{ $dmg['description'] }} @endif
                        </div>
                    @empty
                        <div style="font-size: 9px; color: #94a3b8; font-style: italic;">À compléter à la restitution.</div>
                    @endforelse
                </div>
            </div>
        </div>
    </div>

    {{-- ═══════════════════════════════════════ 6. CONDITIONS GÉNÉRALES ══════════════════════════════════════ --}}
    <div class="section">
        <div class="section-title">6. Conditions Générales</div>
        @if($contract->conditions_text)
            <div style="font-size: 9px; color: #475569; line-height: 1.5;">
                {!! nl2br(e($contract->conditions_text)) !!}
            </div>
        @else
            <ol class="conditions-list">
                <li>Le Locataire reconnaît avoir reçu le véhicule en bon état de marche, propre et tel que décrit ci-dessus.</li>
                <li>Le Locataire est responsable du véhicule et de tout dommage survenu pendant la durée de location, y compris les amendes de circulation et contraventions.</li>
                <li>Le véhicule doit être restitué à la date et au lieu convenus, dans l'état de départ. Tout retard non notifié entraîne une facturation supplémentaire au tarif quotidien.</li>
                <li>Le carburant doit être restitué au même niveau que lors de la prise en charge. Tout manque sera facturé au tarif en vigueur plus frais de service.</li>
                <li>La franchise en cas de sinistre est de <strong>{{ $contract->insurance_deductible ? number_format($contract->insurance_deductible, 2) . ' ' . $contract->currency : '2 000,00 ' . $contract->currency }}</strong>. Toute utilisation du véhicule à des fins illicites annule la couverture d'assurance.</li>
                <li>Le Locataire s'engage à ne pas sous-louer, prêter ou confier le véhicule à un tiers non autorisé explicitement par le Loueur.</li>
                <li>La caution de <strong>{{ number_format($contract->deposit_amount, 2) }} {{ $contract->currency }}</strong> sera restituée après vérification de l'état du véhicule, sous réserve de dommages ou manquements.</li>
                <li>En cas de panne ou accident, le Locataire doit immédiatement contacter l'agence et, le cas échéant, les autorités compétentes.</li>
                <li>Toute annulation après confirmation peut entraîner des frais équivalents à une journée de location.</li>
                <li>Tout litige relatif au présent contrat sera soumis à la juridiction compétente de Casablanca, Maroc.</li>
            </ol>
        @endif
    </div>

    {{-- ═══════════════════════════════════════ 7. SIGNATURES ══════════════════════════════════════ --}}
    <div class="section">
        <div class="section-title">7. Signatures — Départ de Location</div>
        <div class="sig-grid">
            <div class="sig-block">
                <div class="sig-label">Le Client (Locataire)</div>
                <div class="sig-box">
                    @if($contract->signature_client_start)
                        <img src="{{ $contract->signature_client_start }}" alt="Signature Client">
                    @endif
                </div>
                <div class="sig-line">
                    Fait à : {{ $contract->signature_city ?: '____________________' }}<br>
                    Date : {{ $contract->start_date->translatedFormat('d F Y') }}<br>
                    Nom : {{ $contract->client_name }}
                </div>
            </div>
            <div class="sig-block">
                <div class="sig-label">L'Agent (Loueur)</div>
                <div class="sig-box">
                    @if($contract->signature_agent_start)
                        <img src="{{ $contract->signature_agent_start }}" alt="Signature Agent">
                    @endif
                </div>
                <div class="sig-line">
                    Fait à : {{ $contract->signature_city ?: '____________________' }}<br>
                    Date : {{ $contract->start_date->translatedFormat('d F Y') }}<br>
                    Atellas Fleet S.A.R.L
                </div>
            </div>
        </div>
    </div>

    @if($contract->status === 'completed')
    <div class="section">
        <div class="section-title">8. Signatures — Fin de Location (Retour)</div>
        <div class="sig-grid">
            <div class="sig-block">
                <div class="sig-label">Le Client (Locataire)</div>
                <div class="sig-box">
                    @if($contract->signature_client_end)
                        <img src="{{ $contract->signature_client_end }}" alt="Signature Client Retour">
                    @endif
                </div>
                <div class="sig-line">
                    Date : {{ $contract->end_date->translatedFormat('d F Y') }}<br>
                    Nom : {{ $contract->client_name }}
                </div>
            </div>
            <div class="sig-block">
                <div class="sig-label">L'Agent (Loueur)</div>
                <div class="sig-box">
                    @if($contract->signature_agent_end)
                        <img src="{{ $contract->signature_agent_end }}" alt="Signature Agent Retour">
                    @endif
                </div>
                <div class="sig-line">
                    Date : {{ $contract->end_date->translatedFormat('d F Y') }}<br>
                    Atellas Fleet S.A.R.L
                </div>
            </div>
        </div>
    </div>
    @endif

    {{-- ═══════════════════════════════════════ FOOTER ══════════════════════════════════════ --}}
    <div class="doc-footer">
        Document généré le {{ now()->translatedFormat('d F Y à H:i') }} —
        Contrat N° {{ $contract->contract_number }} —
        Atellas Fleet S.A.R.L · Casablanca, Maroc · contact@atellas-fleet.ma
    </div>

</div>
</body>
</html>
