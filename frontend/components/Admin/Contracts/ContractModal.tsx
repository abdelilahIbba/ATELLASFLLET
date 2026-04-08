import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ClipboardCheck,
  PenLine,
  FileText,
  ChevronRight,
  ChevronLeft,
  Printer,
  Download,
  Car,
  RefreshCw,
} from 'lucide-react';
import { Booking } from '../types';
import VehicleConditionPanel, {
  VehicleConditionData,
  emptyCondition,
  buildConditionSvgString,
} from './VehicleConditionPanel';
import SignaturePad from './SignaturePad';
import { adminContractsApi } from '../../../services/api';

// ─── Company settings ────────────────────────────────────────────────────────

export interface ContractCompanySettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  ice: string;
  logo: string | null;
  conditionsText: string;
}

export const DEFAULT_COMPANY_SETTINGS: ContractCompanySettings = {
  name: 'Atellas Fleet S.A.R.L',
  address: 'Casablanca, Maroc',
  phone: '',
  email: '',
  ice: '',
  logo: null,
  conditionsText:
    'Le Locataire reconnaît avoir reçu le véhicule en bon état tel que décrit ci-dessus.\n' +
    'Le Locataire est responsable du véhicule pendant toute la durée de la location, y compris les amendes et contraventions.\n' +
    'Le carburant doit être restitué au niveau indiqué lors de la prise en charge.\n' +
    "La couverture d'assurance est soumise à une franchise pour les dommages causés par négligence du Locataire.\n" +
    'Toute annulation après confirmation peut entraîner des frais équivalents à une journée de location.\n' +
    "Le véhicule doit être restitué dans l'état décrit à la signature du présent contrat.",
};

export const COMPANY_SETTINGS_KEY = 'atellasfleet_contract_settings';

export const loadCompanySettings = (): ContractCompanySettings => {
  try {
    const raw = localStorage.getItem(COMPANY_SETTINGS_KEY);
    return raw ? { ...DEFAULT_COMPANY_SETTINGS, ...JSON.parse(raw) } : DEFAULT_COMPANY_SETTINGS;
  } catch {
    return DEFAULT_COMPANY_SETTINGS;
  }
};

export const saveCompanySettings = (s: ContractCompanySettings): void => {
  localStorage.setItem(COMPANY_SETTINGS_KEY, JSON.stringify(s));
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const esc = (str: string) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const fmtDate = (d: string) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return d;
  }
};

const damageListHtml = (damagePoints: VehicleConditionData['damagePoints']) => {
  if (!damagePoints.length) return '<p style="color:#6b7280;font-size:13px;">Aucun dommage signalé.</p>';
  return (
    '<ol style="margin:0;padding-left:1.2em;font-size:13px;">' +
    damagePoints.map(pt => `<li>${esc(pt.label)}</li>`).join('') +
    '</ol>'
  );
};

const photosHtml = (images: string[]) => {
  if (!images.length) return '';
  return (
    '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">' +
    images
      .map(
        img =>
          `<img src="${img}" alt="" style="width:100px;height:80px;object-fit:cover;border-radius:6px;border:1px solid #e5e7eb;" />`,
      )
      .join('') +
    '</div>'
  );
};

const sigHtml = (dataUrl: string | null, label: string) =>
  dataUrl
    ? `<div style="text-align:center">
        <img src="${dataUrl}" alt="signature" style="height:60px;max-width:200px;border-bottom:1px solid #9ca3af;"/>
        <p style="margin-top:4px;font-size:12px;color:#6b7280;">${esc(label)}</p>
      </div>`
    : `<div style="text-align:center">
        <div style="height:60px;border-bottom:1px solid #9ca3af;"></div>
        <p style="margin-top:4px;font-size:12px;color:#6b7280;">${esc(label)}</p>
      </div>`;

// ─── Backend-enriched extras ──────────────────────────────────────────────────

interface ContractExtras {
  contractId:          string | null;
  contractNumber:      string | null;
  clientIdNumber:      string | null;
  clientLicenseNumber: string | null;
  clientLicenseExpiry: string | null;
  clientNationality:   string | null;
  clientAddress:       string | null;
  vehiclePlate:        string | null;
  dailyRate:           number | null;
  depositAmount:       number | null;
  insuranceType:       string | null;
}

const EMPTY_EXTRAS: ContractExtras = {
  contractId: null, contractNumber: null,
  clientIdNumber: null, clientLicenseNumber: null, clientLicenseExpiry: null,
  clientNationality: null, clientAddress: null, vehiclePlate: null,
  dailyRate: null, depositAmount: null, insuranceType: null,
};

// ─── Contract HTML generator ─────────────────────────────────────────────────

const generateContractHtml = (
  booking: Booking,
  company: ContractCompanySettings,
  condStart: VehicleConditionData,
  condEnd: VehicleConditionData,
  sigClientStart: string | null,
  sigAgentStart: string | null,
  sigClientEnd: string | null,
  sigAgentEnd: string | null,
  sigCity: string,
  extras: ContractExtras = EMPTY_EXTRAS,
): string => {
  const today = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const logoHtml = company.logo
    ? `<img src="${company.logo}" alt="logo" style="max-height:70px;max-width:180px;margin:0 auto 8px;display:block;" />`
    : '';

  const companyInfoLine = [company.address, company.phone, company.email, company.ice ? `ICE: ${company.ice}` : '']
    .filter(Boolean)
    .join(' | ');

  const svgStart = buildConditionSvgString(condStart);
  const svgEnd = buildConditionSvgString(condEnd);

  return `
<style>
  body { font-family: 'Georgia', serif; color: #111827; margin: 0; padding: 32px; line-height: 1.6; font-size: 14px; }
  h1 { font-size: 22px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 4px; }
  h2 { font-size: 16px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 2px; }
  h3 { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin: 0 0 12px; }
  .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #0f172a; padding-bottom: 16px; }
  .meta { display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; margin-bottom: 24px; }
  .section { margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { padding: 7px 10px; border: 1px solid #e5e7eb; text-align: left; }
  th { background: #f9fafb; font-weight: bold; color: #374151; }
  .condition-block { display: flex; gap: 20px; align-items: flex-start; }
  .condition-info { flex: 1; min-width: 0; }
  .sig-row { display: flex; justify-content: space-between; gap: 24px; margin-top: 12px; }
  .sig-row > div { flex: 1; }
  @media print {
    body { padding: 20px; }
    .no-print { display: none !important; }
    .section { page-break-inside: avoid; }
  }
</style>

<div class="header">
  ${logoHtml}
  <h1>${esc(company.name)}</h1>
  <h2>Contrat de Location de Véhicule</h2>
  ${companyInfoLine ? `<p style="font-size:12px;color:#6b7280;margin:4px 0 0">${esc(companyInfoLine)}</p>` : ''}
</div>

<div class="meta">
  <div><strong>N° Contrat:</strong> ${esc(extras.contractNumber ?? String(booking.id))}</div>
  <div><strong>Date d'émission:</strong> ${today}</div>
  <div><strong>Statut:</strong> ${esc(booking.status)}</div>
</div>

<div class="section">
  <h3>1. Les Parties</h3>
  <table>
    <tr><th style="width:32%">Loueur</th><td>${esc(company.name)}${company.address ? ', ' + esc(company.address) : ''}</td></tr>
    ${company.phone  ? `<tr><th>Tél. Loueur</th><td>${esc(company.phone)}</td></tr>` : ''}
    ${company.ice    ? `<tr><th>ICE</th><td>${esc(company.ice)}</td></tr>` : ''}
    <tr><th>Locataire</th><td><strong>${esc(booking.clientName)}</strong></td></tr>
    <tr><th>Nationalité</th><td>${esc(extras.clientNationality ?? '—')}</td></tr>
    <tr><th>Adresse</th><td>${esc(extras.clientAddress ?? '—')}</td></tr>
    <tr><th>CIN / Passeport</th><td><strong>${esc(extras.clientIdNumber ?? '—')}</strong></td></tr>
    <tr><th>Permis de Conduire</th><td><strong>${esc(extras.clientLicenseNumber ?? '—')}</strong>${extras.clientLicenseExpiry ? ` &nbsp;<span style="color:#6b7280;font-size:12px;">(exp. ${esc(extras.clientLicenseExpiry)})</span>` : ''}</td></tr>
  </table>
</div>

<div class="section">
  <h3>2. Le Véhicule</h3>
  <table>
    <tr><th style="width:32%">Marque / Modèle</th><td>${esc(booking.vehicleName || '—')}</td></tr>
    <tr><th>Immatriculation</th><td>${esc(extras.vehiclePlate ?? booking.unitPlate ?? '—')}</td></tr>
    ${booking.unitNumber ? `<tr><th>Unité</th><td>#${booking.unitNumber}</td></tr>` : ''}
    ${extras.insuranceType ? `<tr><th>Assurance</th><td>${esc(extras.insuranceType)}</td></tr>` : ''}
  </table>
</div>

<div class="section">
  <h3>3. Période de Location &amp; Frais</h3>
  <table>
    <tr><th style="width:32%">Date de Début</th><td>${esc(fmtDate(booking.startDate))}</td></tr>
    <tr><th>Date de Fin</th><td>${esc(fmtDate(booking.endDate))}</td></tr>
    ${extras.dailyRate != null ? `<tr><th>Tarif Journalier</th><td>${extras.dailyRate.toLocaleString('fr-MA')} MAD / jour</td></tr>` : ''}
    <tr><th>Montant Total</th><td><strong>${esc(booking.amount.toLocaleString())} MAD</strong></td></tr>
    ${extras.depositAmount ? `<tr><th>Caution / Dépôt</th><td>${extras.depositAmount.toLocaleString('fr-MA')} MAD</td></tr>` : ''}
    <tr><th>Statut de Paiement</th><td>${esc(booking.paymentStatus)}</td></tr>
  </table>
</div>

<div class="section">
  <h3>4. État du Véhicule au Départ</h3>
  <div class="condition-block">
    ${svgStart}
    <div class="condition-info">
      ${condStart.notes ? `<p><strong>Observations:</strong><br>${esc(condStart.notes)}</p>` : ''}
      <p><strong>Dommages signalés (${condStart.damagePoints.length}):</strong></p>
      ${damageListHtml(condStart.damagePoints)}
      ${photosHtml(condStart.images)}
    </div>
  </div>
</div>

<div class="section">
  <h3>5. État du Véhicule au Retour</h3>
  <div class="condition-block">
    ${svgEnd}
    <div class="condition-info">
      ${condEnd.notes ? `<p><strong>Observations:</strong><br>${esc(condEnd.notes)}</p>` : ''}
      <p><strong>Dommages signalés (${condEnd.damagePoints.length}):</strong></p>
      ${damageListHtml(condEnd.damagePoints)}
      ${photosHtml(condEnd.images)}
    </div>
  </div>
</div>

<div class="section">
  <h3>6. Conditions Générales</h3>
  <ul style="font-size:13px;color:#4b5563;padding-left:1.4em;margin:0;">
    ${(company.conditionsText || '').split('\n').filter((l: string) => l.trim()).map((l: string) => `<li>${esc(l)}</li>`).join('')}
  </ul>
</div>

<div class="section">
  <h3>7. Signatures</h3>
  <div style="display:flex;gap:16px;">
    <div style="flex:1;border:1px solid #000;padding:12px;">
      <div style="font-size:12px;font-weight:bold;text-transform:uppercase;border-bottom:1px solid #000;padding-bottom:6px;margin-bottom:8px;letter-spacing:0.5px;">SIGNATURE — DÉBUT DE LOCATION</div>
      <p style="font-size:12px;margin:3px 0">Fait à : ${sigCity ? esc(sigCity) : '____________________'}</p>
      <p style="font-size:12px;margin:3px 0">Date : ${esc(fmtDate(booking.startDate))}</p>
      <div style="display:flex;gap:12px;margin-top:10px;">
        <div style="flex:1;">
          <div style="font-size:11px;margin-bottom:4px;">Le Client :</div>
          ${sigClientStart ? `<img src="${sigClientStart}" alt="sig" style="height:55px;max-width:100%;border-bottom:1px solid #9ca3af;" />` : `<div style="height:55px;border:1px solid #d1d5db;"></div>`}
        </div>
        <div style="flex:1;">
          <div style="font-size:11px;margin-bottom:4px;">Le Réparateur :</div>
          ${sigAgentStart ? `<img src="${sigAgentStart}" alt="sig" style="height:55px;max-width:100%;border-bottom:1px solid #9ca3af;" />` : `<div style="height:55px;border:1px solid #d1d5db;"></div>`}
        </div>
      </div>
    </div>
    <div style="flex:1;border:1px solid #000;padding:12px;">
      <div style="font-size:12px;font-weight:bold;text-transform:uppercase;border-bottom:1px solid #000;padding-bottom:6px;margin-bottom:8px;letter-spacing:0.5px;">SIGNATURE — FIN DE LOCATION</div>
      <p style="font-size:12px;margin:3px 0">Fait à : ${sigCity ? esc(sigCity) : '____________________'}</p>
      <p style="font-size:12px;margin:3px 0">Date : ${esc(fmtDate(booking.endDate))}</p>
      <div style="display:flex;gap:12px;margin-top:10px;">
        <div style="flex:1;">
          <div style="font-size:11px;margin-bottom:4px;">Le Client :</div>
          ${sigClientEnd ? `<img src="${sigClientEnd}" alt="sig" style="height:55px;max-width:100%;border-bottom:1px solid #9ca3af;" />` : `<div style="height:55px;border:1px solid #d1d5db;"></div>`}
        </div>
        <div style="flex:1;">
          <div style="font-size:11px;margin-bottom:4px;">Le Réparateur :</div>
          ${sigAgentEnd ? `<img src="${sigAgentEnd}" alt="sig" style="height:55px;max-width:100%;border-bottom:1px solid #9ca3af;" />` : `<div style="height:55px;border:1px solid #d1d5db;"></div>`}
        </div>
      </div>
    </div>
  </div>
</div>`;
};

// ─── Modal component ──────────────────────────────────────────────────────────

interface ContractModalProps {
  booking: Booking;
  onClose: () => void;
  company?: ContractCompanySettings;
  onSaved?: () => void;
}

type Step = 0 | 1 | 2 | 3;

const STEPS: { label: string; shortLabel: string; icon: React.ReactNode }[] = [
  { label: 'État au Départ', shortLabel: 'Départ', icon: <Car className="w-4 h-4" /> },
  { label: 'État au Retour', shortLabel: 'Retour', icon: <Car className="w-4 h-4" /> },
  { label: 'Signatures', shortLabel: 'Signatures', icon: <PenLine className="w-4 h-4" /> },
  { label: 'Contrat Final', shortLabel: 'Contrat', icon: <FileText className="w-4 h-4" /> },
];

const ContractModal: React.FC<ContractModalProps> = ({ booking, onClose, company, onSaved }) => {
  const companySettings = company ?? loadCompanySettings();

  const [step, setStep] = useState<Step>(0);
  const [condStart, setCondStart] = useState<VehicleConditionData>(emptyCondition);
  const [condEnd, setCondEnd] = useState<VehicleConditionData>(emptyCondition);
  const [sigClientStart, setSigClientStart] = useState<string | null>(null);
  const [sigAgentStart, setSigAgentStart] = useState<string | null>(null);
  const [sigClientEnd, setSigClientEnd] = useState<string | null>(null);
  const [sigAgentEnd, setSigAgentEnd] = useState<string | null>(null);
  const [sigCity, setSigCity] = useState('');
  const [extras, setExtras] = useState<ContractExtras>(EMPTY_EXTRAS);
  const [loadingContract, setLoadingContract] = useState(true);
  const [saving, setSaving] = useState(false);
  // Editable client identity fields (pre-filled from backend, editable in step 2)
  const [editCin,        setEditCin]        = useState('');
  const [editLicense,    setEditLicense]    = useState('');
  const [editExpiry,     setEditExpiry]     = useState('');
  const [editNationality,setEditNationality]= useState('');
  const [editAddress,    setEditAddress]    = useState('');

  // Fetch or auto-create the backend contract for this booking
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingContract(true);
      try {
        const res = await adminContractsApi.list();
        const all: any[] = (res as any)?.data ?? [];
        let raw = all.find((c: any) => String(c.booking_id) === String(booking.id));
        if (!raw) {
          const created = await adminContractsApi.createFromBooking(booking.id);
          raw = (created as any)?.contract ?? created;
        }
        if (!cancelled && raw) {
          const ex: ContractExtras = {
            contractId:          String(raw.id),
            contractNumber:      raw.contract_number ?? null,
            clientIdNumber:      raw.client_id_number ?? null,
            clientLicenseNumber: raw.client_license_number ?? null,
            clientLicenseExpiry: raw.client_license_expiry?.slice(0, 10) ?? null,
            clientNationality:   raw.client_nationality ?? null,
            clientAddress:       raw.client_address ?? null,
            vehiclePlate:        raw.vehicle_plate ?? null,
            dailyRate:           raw.daily_rate != null ? parseFloat(raw.daily_rate) : null,
            depositAmount:       raw.deposit_amount != null ? parseFloat(raw.deposit_amount) : null,
            insuranceType:       raw.insurance_type ?? null,
          };
          setExtras(ex);
          // Seed editable fields from backend (user can override)
          setEditCin(raw.client_id_number ?? '');
          setEditLicense(raw.client_license_number ?? '');
          setEditExpiry(raw.client_license_expiry?.slice(0, 10) ?? '');
          setEditNationality(raw.client_nationality ?? '');
          setEditAddress(raw.client_address ?? '');
          if (raw.signature_city) setSigCity(raw.signature_city);
          if (raw.condition_start) setCondStart(raw.condition_start);
          if (raw.condition_end)   setCondEnd(raw.condition_end);
        }
      } catch {
        // Silently fail — the modal still works without backend data
      } finally {
        if (!cancelled) setLoadingContract(false);
      }
    })();
    return () => { cancelled = true; };
  }, [booking.id]);

  const contractHtml = generateContractHtml(
    booking, companySettings,
    condStart, condEnd,
    sigClientStart, sigAgentStart,
    sigClientEnd, sigAgentEnd,
    sigCity,
    // Merge editable fields on top of fetched extras so live edits show in preview
    {
      ...extras,
      clientIdNumber:      editCin        || extras.clientIdNumber,
      clientLicenseNumber: editLicense    || extras.clientLicenseNumber,
      clientLicenseExpiry: editExpiry     || extras.clientLicenseExpiry,
      clientNationality:   editNationality|| extras.clientNationality,
      clientAddress:       editAddress    || extras.clientAddress,
    },
  );

  const handlePrint = useCallback(() => {
    const pw = window.open('', '', 'height=900,width=850');
    if (!pw) return;
    pw.document.write(`<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Contrat #${extras.contractNumber ?? booking.id}</title></head><body>${contractHtml}</body></html>`);
    pw.document.close();
    pw.onload = () => setTimeout(() => pw.print(), 400);
    setTimeout(() => pw.print(), 700);
  }, [booking.id, contractHtml, extras.contractNumber]);

  // Save conditions + signatures to backend, then print
  const handleSaveAndPrint = useCallback(async () => {
    if (extras.contractId) {
      setSaving(true);
      try {
        await adminContractsApi.update(extras.contractId, {
          condition_start:        condStart,
          condition_end:          condEnd,
          signature_client_start: sigClientStart ?? undefined,
          signature_agent_start:  sigAgentStart ?? undefined,
          signature_client_end:   sigClientEnd ?? undefined,
          signature_agent_end:    sigAgentEnd ?? undefined,
          signature_city:         sigCity || undefined,
          client_id_number:       editCin        || undefined,
          client_license_number:  editLicense    || undefined,
          client_license_expiry:  editExpiry     || undefined,
          client_nationality:     editNationality|| undefined,
          client_address:         editAddress    || undefined,
          status:                 'active',
        });
        onSaved?.();
      } catch {
        // Non-fatal — still print even if save failed
      } finally {
        setSaving(false);
      }
    }
    handlePrint();
  }, [extras.contractId, condStart, condEnd, sigClientStart, sigAgentStart, sigClientEnd, sigAgentEnd, sigCity, editCin, editLicense, editExpiry, editNationality, editAddress, handlePrint, onSaved]);

  // Download backend PDF (auth-aware fetch → blob)
  const handleDownloadPdf = useCallback(async () => {
    if (!extras.contractId) { handlePrint(); return; }
    const token = localStorage.getItem('auth_token');
    const base  = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';
    try {
      const res = await fetch(`${base}/admin/contracts/${extras.contractId}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `contrat-${extras.contractNumber ?? booking.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch {
      // Fallback: print to PDF via browser
      handlePrint();
    }
  }, [extras.contractId, extras.contractNumber, booking.id, handlePrint]);

  const goNext = () => setStep(s => Math.min(s + 1, 3) as Step);
  const goPrev = () => setStep(s => Math.max(s - 1, 0) as Step);

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
        onClick={e => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-[#0B1120] w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col"
          style={{ maxHeight: '92vh' }}
        >
          {/* ── Header ── */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex items-center justify-between flex-shrink-0 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="w-5 h-5 text-brand-blue" />
              <h3 className="text-lg font-bold text-brand-navy dark:text-white font-space">
                Contrat de Location — Réservation #{booking.id}
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue">
                {booking.clientName}
              </span>
              {loadingContract && (
                <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin" />
              )}
              {extras.contractNumber && (
                <span className="text-xs font-mono text-slate-400">{extras.contractNumber}</span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* ── Step tabs ── */}
          <div className="flex items-center gap-0 px-6 pt-4 flex-shrink-0">
            {STEPS.map((s, i) => (
              <React.Fragment key={i}>
                <button
                  onClick={() => setStep(i as Step)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                    step === i
                      ? 'bg-brand-blue text-white shadow-md'
                      : i < step
                      ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  {i < step ? (
                    <span className="w-4 h-4 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center">
                      ✓
                    </span>
                  ) : (
                    <span
                      className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                        step === i ? 'bg-white/30 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-500'
                      }`}
                    >
                      {i + 1}
                    </span>
                  )}
                  <span className="hidden sm:inline">{s.shortLabel}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* ── Content ── */}
          <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
            {step === 0 && (
              <VehicleConditionPanel
                title="État du Véhicule au Départ de Location"
                value={condStart}
                onChange={setCondStart}
              />
            )}

            {step === 1 && (
              <VehicleConditionPanel
                title="État du Véhicule au Retour"
                value={condEnd}
                onChange={setCondEnd}
              />
            )}

            {step === 2 && (
              <div className="space-y-5">

                {/* ── Client Identity ── */}
                <div className="border border-slate-200 dark:border-white/10 rounded-xl p-5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-brand-navy dark:text-white mb-4">
                    Informations du Locataire
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">CIN / Passeport</label>
                      <input value={editCin} onChange={e => setEditCin(e.target.value)}
                        placeholder="ex : AB123456"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-brand-blue dark:text-white font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">N° Permis de Conduire</label>
                      <input value={editLicense} onChange={e => setEditLicense(e.target.value)}
                        placeholder="ex : P123456"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-brand-blue dark:text-white font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Date d’Expiration Permis</label>
                      <input type="date" value={editExpiry} onChange={e => setEditExpiry(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-brand-blue dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nationalité</label>
                      <input value={editNationality} onChange={e => setEditNationality(e.target.value)}
                        placeholder="ex : Marocaine"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-brand-blue dark:text-white" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Adresse</label>
                      <input value={editAddress} onChange={e => setEditAddress(e.target.value)}
                        placeholder="ex : 12 rue des Fleurs, Casablanca"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-brand-blue dark:text-white" />
                    </div>
                  </div>
                </div>

                {/* ── Ville + Signatures ── */}
                <div className="max-w-xs">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">
                    Fait à (ville)
                  </label>
                  <input
                    type="text"
                    value={sigCity}
                    onChange={e => setSigCity(e.target.value)}
                    placeholder="Ex : Casablanca"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-brand-blue dark:text-white"
                  />
                </div>

                {/* DÉBUT DE LOCATION */}
                <div className="border border-slate-200 dark:border-white/10 rounded-xl p-5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-brand-blue mb-1">SIGNATURE — DÉBUT DE LOCATION</h4>
                  <p className="text-xs text-slate-500 mb-4">Date : <span className="font-semibold text-slate-700 dark:text-slate-200">{new Date(booking.startDate).toLocaleDateString('fr-FR', {year:'numeric',month:'long',day:'numeric'})}</span></p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SignaturePad
                      label="Le Client"
                      onChange={setSigClientStart}
                    />
                    <SignaturePad
                      label="Le Réparateur"
                      onChange={setSigAgentStart}
                    />
                  </div>
                </div>

                {/* FIN DE LOCATION */}
                <div className="border border-slate-200 dark:border-white/10 rounded-xl p-5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-brand-teal mb-1">SIGNATURE — FIN DE LOCATION</h4>
                  <p className="text-xs text-slate-500 mb-4">Date : <span className="font-semibold text-slate-700 dark:text-slate-200">{new Date(booking.endDate).toLocaleDateString('fr-FR', {year:'numeric',month:'long',day:'numeric'})}</span></p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SignaturePad
                      label="Le Client"
                      onChange={setSigClientEnd}
                    />
                    <SignaturePad
                      label="Le Réparateur"
                      onChange={setSigAgentEnd}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-brand-navy dark:text-white">
                    Aperçu du contrat final — vérifiez avant impression
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-1.5 px-4 py-2 bg-brand-navy dark:bg-white text-white dark:text-brand-navy rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                      <Printer className="w-3.5 h-3.5" /> Imprimer
                    </button>
                    <button
                      onClick={handleDownloadPdf}
                      className="flex items-center gap-1.5 px-4 py-2 bg-brand-teal text-white rounded-lg text-xs font-bold hover:bg-teal-600 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  </div>
                </div>
                <div
                  className="bg-white text-black p-8 rounded-xl border border-slate-200 shadow-inner overflow-y-auto"
                  style={{ minHeight: 400 }}
                  dangerouslySetInnerHTML={{ __html: contractHtml }}
                />
              </div>
            )}
          </div>

          {/* ── Footer navigation ── */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center flex-shrink-0">
            <button
              onClick={step === 0 ? onClose : goPrev}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-slate-500 hover:text-brand-navy dark:hover:text-white transition-colors"
            >
              {step === 0 ? (
                <>
                  <X className="w-4 h-4" /> Fermer
                </>
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" /> Précédent
                </>
              )}
            </button>

            {step < 3 ? (
              <button
                onClick={goNext}
                className="flex items-center gap-1.5 px-6 py-2 bg-brand-blue text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors shadow-md"
              >
                Suivant <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSaveAndPrint}
                disabled={saving}
                className="flex items-center gap-1.5 px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-md disabled:opacity-60"
              >
                {saving
                  ? <RefreshCw className="w-4 h-4 animate-spin" />
                  : <Printer className="w-4 h-4" />
                }
                Générer &amp; Imprimer
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ContractModal;
