import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, CheckCircle2, X, AlertCircle } from 'lucide-react';

interface VehicleDetailsTabProps {
  selectedItem: any | null;
  modalQty: number;
  setModalQty: (n: number) => void;
  modalUnitPlates: string[];
  setModalUnitPlates: React.Dispatch<React.SetStateAction<string[]>>;
  imageInputType: 'url' | 'upload';
  setImageInputType: (t: 'url' | 'upload') => void;
  imageUrlPreview: string;
  setImageUrlPreview: (s: string) => void;
}

export const VehicleDetailsTab: React.FC<VehicleDetailsTabProps> = ({
  selectedItem,
  modalQty,
  setModalQty,
  modalUnitPlates,
  setModalUnitPlates,
  imageInputType,
  setImageInputType,
  imageUrlPreview,
  setImageUrlPreview,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (PNG, JPG, WEBP).');
      return;
    }
    setUploadedFile(file);
    const url = URL.createObjectURL(file);
    setFilePreview(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
      if (fileInputRef.current) {
        fileInputRef.current.files = e.dataTransfer.files;
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const clearUploadedFile = () => {
    setUploadedFile(null);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      
      {/* ── 1. INFORMATIONS GÉNÉRALES ── */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Marque <span className="text-rose-500">*</span>
            </label>
            <input 
              name="make" 
              defaultValue={selectedItem?.make || ''} 
              required 
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 shadow-xs transition-all" 
              placeholder="ex: Dacia, BMW, Renault..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Modèle <span className="text-rose-500">*</span>
            </label>
            <input 
              name="model" 
              defaultValue={selectedItem?.model || ''} 
              required 
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 shadow-xs transition-all" 
              placeholder="ex: Logan, Clio 5, Série 3..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Catégorie
            </label>
            <select 
              name="category" 
              defaultValue={selectedItem?.category || 'Sedan'} 
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 shadow-xs transition-all"
            >
              <option value="Sedan">Berline</option>
              <option value="SUV">SUV de Luxe</option>
              <option value="Hyper">Hyper / Supercar</option>
              <option value="Convertible">Cabriolet</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Année
            </label>
            <input 
              name="year" 
              type="number" 
              min="2000" 
              max="2035" 
              defaultValue={selectedItem?.year || new Date().getFullYear()} 
              required 
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-medium font-mono focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 shadow-xs transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Carburant
            </label>
            <select 
              name="fuel_type" 
              defaultValue={selectedItem?.fuel_type || 'Essence'} 
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 shadow-xs transition-all"
            >
              <option value="Essence">Essence</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybride">Hybride</option>
              <option value="Électrique">Électrique</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Couleur
            </label>
            <input 
              name="color" 
              defaultValue={selectedItem?.color || ''} 
              maxLength={100} 
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 shadow-xs transition-all" 
              placeholder="ex: Gris clair, Noir métallisé"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Numéro VIN
            </label>
            <input 
              name="vin" 
              defaultValue={selectedItem?.vin || ''} 
              maxLength={100} 
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-mono focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 shadow-xs transition-all uppercase" 
              placeholder="Numéro d'identification du véhicule"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200/80 dark:border-white/10 pt-5 space-y-4">
        
        {/* ── 2. SECTION PRINCIPALE: IMMATRICULATION & STATUT (EN 1 LIGNE) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modalQty <= 1 ? (
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Immatriculation <span className="text-rose-500">*</span>
              </label>
              <input
                value={modalUnitPlates[0] ?? ''}
                onChange={e => setModalUnitPlates([e.target.value])}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-mono font-semibold focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 shadow-xs transition-all uppercase"
                placeholder="ex: 72819-A-1"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Immatriculations ({modalQty} unités)
              </label>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                {modalUnitPlates.map((p, i) => (
                  <input
                    key={i}
                    value={p}
                    onChange={e => {
                      const next = [...modalUnitPlates];
                      next[i] = e.target.value;
                      setModalUnitPlates(next);
                    }}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-blue shadow-xs"
                    placeholder={`Unité #${i + 1} — ex: 7281${i}-A-1`}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Statut
            </label>
            <select 
              name="status" 
              defaultValue={selectedItem?.status || 'Available'} 
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 shadow-xs transition-all"
            >
              <option value="Available">Disponible</option>
              <option value="Rented">Loué</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Impounded">Fourrière</option>
            </select>
          </div>
        </div>

        {/* ── 3. LOCALISATION: AGENCE / LIEU (PLEINE LARGEUR) ── */}
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Agence / Lieu
          </label>
          <input 
            name="branch" 
            defaultValue={selectedItem?.branch || 'Casablanca Anfa'} 
            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 shadow-xs transition-all"
            placeholder="ex: Casablanca Anfa, Marrakech Aéroport, Tanger..."
          />
        </div>

        {/* ── 4. COMPTEURS & MÉTRIQUES (KILOMÉTRAGE DÉCIMAL + CARBURANT) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Kilométrage (km) <span className="text-[10px] text-slate-400 normal-case font-normal">(décimales acceptées)</span>
            </label>
            <input 
              name="odometer" 
              type="number" 
              step="0.01" 
              min="0"
              defaultValue={selectedItem?.odometer ?? 0} 
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-mono font-medium focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 shadow-xs transition-all"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Carburant (%)
            </label>
            <input 
              name="fuel" 
              type="number" 
              min="0" 
              max="100" 
              defaultValue={selectedItem?.fuel ?? 100} 
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-mono font-medium focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 shadow-xs transition-all"
              placeholder="100"
            />
          </div>
        </div>

        {/* ── 5. DONNÉES FINANCIÈRES & STOCK (PRIX/JOUR + QUANTITÉ EN 1 LIGNE) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Prix / Jour (MAD)
            </label>
            <input 
              name="pricePerDay" 
              type="number" 
              step="0.01"
              min="0"
              defaultValue={selectedItem?.pricePerDay ?? 1000} 
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-mono font-medium focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 shadow-xs transition-all"
              placeholder="1000"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Quantité (unités)
            </label>
            <input 
              name="quantity" 
              type="number" 
              min="1" 
              value={modalQty} 
              onChange={e => {
                const n = Math.max(1, parseInt(e.target.value) || 1);
                setModalQty(n);
                setModalUnitPlates(prev => Array.from({ length: n }, (_, i) => prev[i] ?? ''));
              }} 
              required 
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-mono font-medium focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 shadow-xs transition-all"
            />
          </div>
        </div>

        {/* ── 6. ZONE DE TÉLÉCHARGEMENT D'IMAGE (DRAG & DROP MODERNE) ── */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Image du Véhicule
            </label>
            <div className="flex bg-slate-100 dark:bg-white/5 p-0.5 rounded-lg border border-slate-200/50 dark:border-white/10">
              <button 
                type="button"
                onClick={() => setImageInputType('upload')}
                className={`px-3 py-1 text-[11px] font-bold uppercase rounded-md transition-all ${
                  imageInputType === 'upload' 
                    ? 'bg-white dark:bg-brand-navy shadow-xs text-brand-blue' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Upload Fichier
              </button>
              <button 
                type="button"
                onClick={() => setImageInputType('url')}
                className={`px-3 py-1 text-[11px] font-bold uppercase rounded-md transition-all ${
                  imageInputType === 'url' 
                    ? 'bg-white dark:bg-brand-navy shadow-xs text-brand-blue' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Lien URL
              </button>
            </div>
          </div>

          {imageInputType === 'upload' ? (
            <div>
              {/* Drag & Drop Zone */}
              <div 
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-brand-blue bg-blue-50/60 dark:bg-blue-900/20 scale-[1.01]'
                    : 'border-slate-200 dark:border-white/15 bg-slate-50/70 dark:bg-white/[0.02] hover:border-brand-blue/60 hover:bg-slate-100/60'
                }`}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  name="image_file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />

                {uploadedFile && filePreview ? (
                  <div className="flex items-center justify-between gap-4 p-2 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={filePreview} alt="Aperçu" className="w-16 h-12 rounded-lg object-cover border border-slate-200 dark:border-white/10 shrink-0" />
                      <div className="text-left min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{uploadedFile.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{(uploadedFile.size / 1024).toFixed(1)} KB • Image prête</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Prêt
                      </span>
                      <button 
                        type="button" 
                        onClick={clearUploadedFile}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Supprimer le fichier"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center mb-3">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white mb-1">
                      Glissez et déposez l'image du véhicule ici
                    </p>
                    <p className="text-xs text-slate-400">
                      ou <span className="text-brand-blue font-semibold underline">parcourez vos fichiers</span> (PNG, JPG, WEBP jusqu'à 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  name="image"
                  defaultValue={selectedItem?.image || ''}
                  onChange={e => setImageUrlPreview(e.target.value.trim())}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 shadow-xs transition-all font-mono"
                  placeholder="https://example.com/image.jpg"
                />
                <div className="w-14 h-12 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                  {imageUrlPreview ? (
                    <img
                      src={imageUrlPreview}
                      alt="Aperçu"
                      className="w-full h-full object-cover"
                      onError={e => { 
                        (e.currentTarget as HTMLImageElement).style.display = 'none'; 
                        (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex'; 
                      }}
                    />
                  ) : null}
                  <span style={{ display: imageUrlPreview ? 'none' : 'flex' }} className="w-full h-full items-center justify-center text-slate-400">
                    <ImageIcon className="w-5 h-5" />
                  </span>
                </div>
              </div>

              {imageUrlPreview && (
                <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 relative shadow-xs">
                  <img
                    src={imageUrlPreview}
                    alt="Aperçu véhicule"
                    className="w-full h-full object-cover"
                    onError={e => {
                      const el = e.currentTarget.parentElement!;
                      el.innerHTML = '<p class="w-full h-full flex items-center justify-center text-xs text-rose-500 font-bold p-2 text-center">URL invalide — L\'image n\'a pas pu être chargée.</p>';
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
