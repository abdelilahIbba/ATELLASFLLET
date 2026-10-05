import React, { useState } from 'react';
import { 
  Shield, 
  Wrench, 
  FileText, 
  FileCheck, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  X,
  Calendar
} from 'lucide-react';
import { getExpiryStatus } from '../../../utils';

interface VehicleDocumentsTabProps {
  selectedItem: any | null;
  docFileNames: Record<string, string>;
  setDocFileNames: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const docCards = [
  { id: 'doc_insurance',        expiryName: 'expiry_insurance', label: 'Assurance',        key: 'insurance',       fileKey: 'insurance',       icon: Shield },
  { id: 'doc_visite_technique', expiryName: 'expiry_visite',    label: 'Visite Technique', key: 'visiteTechnique', fileKey: 'visiteTechnique', icon: Wrench },
  { id: 'doc_vignette',         expiryName: 'expiry_vignette',  label: 'Vignette',         key: 'vignette',        fileKey: 'vignette',        icon: FileText },
  { id: 'doc_carte_grise',      expiryName: 'expiry_carte',     label: 'Carte Grise',      key: 'carteGrise',      fileKey: 'carteGrise',      icon: FileCheck },
] as const;

export const VehicleDocumentsTab: React.FC<VehicleDocumentsTabProps> = ({
  selectedItem,
  docFileNames,
  setDocFileNames,
}) => {
  // Track drag states per card
  const [dragStates, setDragStates] = useState<Record<string, boolean>>({});
  // Track date values locally for instant interactive status badge computation
  const [dates, setDates] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    docCards.forEach(d => {
      init[d.key] = selectedItem?.documents?.[d.key] || '';
    });
    return init;
  });

  const handleDrop = (docId: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragStates(prev => ({ ...prev, [docId]: false }));
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setDocFileNames(prev => ({ ...prev, [docId]: file.name }));
      const input = document.getElementById(docId) as HTMLInputElement | null;
      if (input) {
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
      }
    }
  };

  const handleClearFile = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDocFileNames(prev => ({ ...prev, [docId]: '' }));
    const input = document.getElementById(docId) as HTMLInputElement | null;
    if (input) input.value = '';
  };

  return (
    <div className="space-y-6">
      {/* ── GRILLE 2x2 DES 4 DOCUMENTS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {docCards.map((doc) => {
          const currentDate = dates[doc.key] || '';
          const existingFileUrl = (selectedItem?.documentFiles as any)?.[doc.fileKey] || '';
          const selectedFileName = docFileNames[doc.id] || '';
          const Icon = doc.icon;
          const isDragging = !!dragStates[doc.id];

          // Compute dynamic status
          let statusBadge = {
            label: 'Non Renseigné',
            color: 'bg-slate-100 dark:bg-white/10 text-slate-500 border-slate-200 dark:border-white/10',
            icon: Calendar
          };

          if (currentDate) {
            try {
              const res = getExpiryStatus(currentDate);
              if (res) {
                if (res.status === 'Valid') {
                  statusBadge = {
                    label: '✓ Valid',
                    color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40',
                    icon: CheckCircle2
                  };
                } else if (res.status === 'Expired') {
                  statusBadge = {
                    label: '✕ Expiré',
                    color: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/40',
                    icon: AlertCircle
                  };
                } else {
                  statusBadge = {
                    label: `⚠ ${res.label}`,
                    color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
                    icon: AlertCircle
                  };
                }
              }
            } catch (e) {
              // fallback
            }
          }

          return (
            <div 
              key={doc.id} 
              className="bg-white dark:bg-white/5 border border-slate-200/90 dark:border-white/10 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xs hover:border-brand-blue/30 transition-all"
            >
              {/* Card Header: Icon + Document Title + Status Badge */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200/50 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                      {doc.label}
                    </h4>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Document légal</p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 shadow-xs ${statusBadge.color}`}>
                  {statusBadge.label}
                </span>
              </div>

              {/* Expiry Date (Compact Design) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Date d'Expiration
                </label>
                <div className="relative">
                  <input 
                    name={doc.expiryName} 
                    type="date" 
                    value={currentDate}
                    onChange={e => setDates(prev => ({ ...prev, [doc.key]: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-mono font-medium text-slate-800 dark:text-white focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 shadow-xs transition-all"
                  />
                </div>
              </div>

              {/* Current File status indicator */}
              <div className="min-h-[18px] text-[11px]">
                {selectedFileName ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{selectedFileName}</span>
                  </span>
                ) : existingFileUrl ? (
                  <a 
                    href={existingFileUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-1.5 text-brand-blue hover:text-blue-600 font-semibold hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Voir le document actuel</span>
                  </a>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500 font-medium">
                    Aucun fichier enregistré
                  </span>
                )}
              </div>

              {/* Mini Dropzone (Zone de glisser-déposer dédiée pour chaque document) */}
              <div
                onDragOver={e => { e.preventDefault(); setDragStates(prev => ({ ...prev, [doc.id]: true })); }}
                onDragLeave={() => setDragStates(prev => ({ ...prev, [doc.id]: false }))}
                onDrop={e => handleDrop(doc.id, e)}
                onClick={() => document.getElementById(doc.id)?.click()}
                className={`relative rounded-xl border border-dashed p-3 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 select-none ${
                  isDragging
                    ? 'border-brand-blue bg-blue-50/70 dark:bg-blue-950/30 scale-[1.01]'
                    : selectedFileName
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/15'
                      : 'border-slate-300 dark:border-white/15 bg-slate-50/60 dark:bg-white/[0.02] hover:border-brand-blue hover:bg-brand-blue/5'
                }`}
              >
                <input
                  id={doc.id}
                  type="file"
                  name={doc.id}
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    setDocFileNames(prev => ({ ...prev, [doc.id]: f ? f.name : '' }));
                  }}
                />

                <UploadCloud className={`w-4 h-4 shrink-0 transition-colors ${selectedFileName ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
                  {selectedFileName ? 'Changer le document' : 'Télécharger un document'}
                </span>

                {selectedFileName && (
                  <button 
                    type="button" 
                    onClick={e => handleClearFile(doc.id, e)}
                    className="ml-auto p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Retirer le document"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── BANNIÈRE D'INFORMATION: SYSTÈME D'ALERTES AUTO ── */}
      <div className="p-4 bg-blue-50/80 dark:bg-blue-900/10 border border-blue-200/80 dark:border-blue-900/30 rounded-2xl flex items-start gap-3.5 shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
            Système d'Alertes Auto
          </h4>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5 leading-relaxed font-medium">
            Le système notifie automatiquement le gestionnaire de flotte 30, 15 et 7 jours avant l'expiration d'un document pour garantir la conformité légale de votre parc.
          </p>
        </div>
      </div>
    </div>
  );
};
