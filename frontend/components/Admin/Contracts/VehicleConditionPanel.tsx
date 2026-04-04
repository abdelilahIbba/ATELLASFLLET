import React, { useRef, useState } from 'react';
import { X, Upload } from 'lucide-react';

export interface DamagePoint {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface VehicleConditionData {
  notes: string;
  damagePoints: DamagePoint[];
  images: string[];
}

export const emptyCondition = (): VehicleConditionData => ({
  notes: '',
  damagePoints: [],
  images: [],
});

/**
 * Returns the inline SVG string for the car top-view diagram
 * including any damage points. Used both in the React component and
 * when generating the printable contract HTML.
 */
export const buildConditionSvgString = (condition: VehicleConditionData): string => {
  const points = condition.damagePoints
    .map(
      (pt, i) =>
        `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="7" fill="#ef4444" opacity="0.9" stroke="white" stroke-width="1.5"/>` +
        `<text x="${pt.x.toFixed(1)}" y="${(pt.y + 4).toFixed(1)}" text-anchor="middle" font-size="9" fill="white" font-weight="bold">${i + 1}</text>`,
    )
    .join('');

  return `<svg viewBox="0 0 200 400" width="160" height="320" xmlns="http://www.w3.org/2000/svg" style="border:1px solid #e2e8f0;border-radius:8px;background:#fff">
  <!-- Body -->
  <rect x="42" y="60" width="116" height="280" rx="28" ry="28" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/>
  <!-- Hood -->
  <rect x="62" y="62" width="76" height="40" rx="8" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>
  <!-- Front windshield -->
  <rect x="57" y="102" width="86" height="55" rx="6" fill="#bfdbfe" stroke="#60a5fa" stroke-width="1.5"/>
  <!-- Rear windshield -->
  <rect x="57" y="243" width="86" height="50" rx="6" fill="#bfdbfe" stroke="#60a5fa" stroke-width="1.5"/>
  <!-- Trunk -->
  <rect x="62" y="293" width="76" height="38" rx="8" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>
  <!-- Door line -->
  <line x1="42" y1="200" x2="158" y2="200" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,2"/>
  <!-- Wheels FL -->
  <rect x="18" y="98" width="26" height="52" rx="7" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
  <!-- Wheels FR -->
  <rect x="156" y="98" width="26" height="52" rx="7" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
  <!-- Wheels RL -->
  <rect x="18" y="250" width="26" height="52" rx="7" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
  <!-- Wheels RR -->
  <rect x="156" y="250" width="26" height="52" rx="7" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
  <!-- Direction -->
  <polygon points="100,28 92,48 108,48" fill="#475569"/>
  <text x="100" y="20" text-anchor="middle" font-size="9" fill="#64748b" font-weight="700" font-family="sans-serif">AVANT</text>
  <text x="100" y="396" text-anchor="middle" font-size="9" fill="#64748b" font-weight="700" font-family="sans-serif">ARRIÈRE</text>
  ${points}
</svg>`;
};

// ── React SVG component (reuses the same geometry) ───────────────────────────
const CarOutlineSVG: React.FC = () => (
  <>
    <rect x="42" y="60" width="116" height="280" rx="28" ry="28" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
    <rect x="62" y="62" width="76" height="40" rx="8" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
    <rect x="57" y="102" width="86" height="55" rx="6" fill="#bfdbfe" stroke="#60a5fa" strokeWidth="1.5" />
    <rect x="57" y="243" width="86" height="50" rx="6" fill="#bfdbfe" stroke="#60a5fa" strokeWidth="1.5" />
    <rect x="62" y="293" width="76" height="38" rx="8" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="42" y1="200" x2="158" y2="200" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,2" />
    <rect x="18" y="98" width="26" height="52" rx="7" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
    <rect x="156" y="98" width="26" height="52" rx="7" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
    <rect x="18" y="250" width="26" height="52" rx="7" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
    <rect x="156" y="250" width="26" height="52" rx="7" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
    <polygon points="100,28 92,48 108,48" fill="#475569" />
    <text x="100" y="20" textAnchor="middle" fontSize="9" fill="#64748b" fontWeight="700" fontFamily="sans-serif">AVANT</text>
    <text x="100" y="396" textAnchor="middle" fontSize="9" fill="#64748b" fontWeight="700" fontFamily="sans-serif">ARRIÈRE</text>
  </>
);

// ── Main component ────────────────────────────────────────────────────────────

interface VehicleConditionPanelProps {
  title: string;
  value: VehicleConditionData;
  onChange: (data: VehicleConditionData) => void;
}

const VehicleConditionPanel: React.FC<VehicleConditionPanelProps> = ({
  title,
  value,
  onChange,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingPos, setPendingPos] = useState<{ x: number; y: number } | null>(null);
  const [labelInput, setLabelInput] = useState('');

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (pendingPos) return; // wait for current point to be confirmed first
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 200;
    const y = ((e.clientY - rect.top) / rect.height) * 400;
    setPendingPos({ x, y });
    setLabelInput('');
  };

  const confirmDamage = () => {
    if (!pendingPos) return;
    onChange({
      ...value,
      damagePoints: [
        ...value.damagePoints,
        {
          id: Math.random().toString(36).substr(2, 9),
          x: pendingPos.x,
          y: pendingPos.y,
          label: labelInput.trim() || 'Dommage',
        },
      ],
    });
    setPendingPos(null);
    setLabelInput('');
  };

  const removeDamage = (id: string) => {
    onChange({ ...value, damagePoints: value.damagePoints.filter(p => p.id !== id) });
  };

  const handleImageFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        if (ev.target?.result) {
          onChange({ ...value, images: [...value.images, ev.target.result as string] });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-brand-navy dark:text-white border-b border-slate-100 dark:border-white/10 pb-2">
        {title}
      </h4>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── SVG Diagram ── */}
        <div className="flex flex-col items-center gap-3 flex-shrink-0">
          <p className="text-xs text-slate-400 italic text-center">
            Cliquer sur le schéma pour marquer un dommage
          </p>

          <svg
            ref={svgRef}
            viewBox="0 0 200 400"
            width="160"
            height="320"
            onClick={handleSvgClick}
            className="cursor-crosshair rounded-xl border border-slate-200 dark:border-white/20 bg-white dark:bg-slate-900 flex-shrink-0"
          >
            <CarOutlineSVG />
            {value.damagePoints.map((pt, i) => (
              <g key={pt.id}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={7}
                  fill="#ef4444"
                  opacity={0.9}
                  stroke="white"
                  strokeWidth="1.5"
                />
                <text
                  x={pt.x}
                  y={pt.y + 4}
                  textAnchor="middle"
                  fontSize="9"
                  fill="white"
                  fontWeight="bold"
                >
                  {i + 1}
                </text>
              </g>
            ))}
            {pendingPos && (
              <circle
                cx={pendingPos.x}
                cy={pendingPos.y}
                r={7}
                fill="#f97316"
                opacity={0.8}
                stroke="white"
                strokeWidth="1.5"
              />
            )}
          </svg>

          {/* Pending point label input */}
          {pendingPos && (
            <div className="w-44 flex flex-col gap-2">
              <input
                autoFocus
                value={labelInput}
                onChange={e => setLabelInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') confirmDamage();
                  if (e.key === 'Escape') setPendingPos(null);
                }}
                placeholder="Décrire le dommage..."
                className="w-full text-xs px-2 py-1.5 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg outline-none focus:border-brand-blue dark:text-white"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={confirmDamage}
                  className="flex-1 py-1.5 bg-brand-blue text-white rounded-lg text-xs font-bold"
                >
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => setPendingPos(null)}
                  className="flex-1 py-1.5 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Damage legend */}
          {value.damagePoints.length > 0 && (
            <div className="w-44 space-y-1 max-h-40 overflow-y-auto">
              {value.damagePoints.map((pt, i) => (
                <div
                  key={pt.id}
                  className="flex items-center gap-1.5 text-xs px-2 py-1 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-500/20 rounded-lg"
                >
                  <span className="w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-slate-600 dark:text-slate-300 flex-1 truncate text-[11px]">
                    {pt.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDamage(pt.id)}
                    className="text-slate-400 hover:text-red-500 flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Notes + Photos ── */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
              Observations
            </label>
            <textarea
              value={value.notes}
              onChange={e => onChange({ ...value, notes: e.target.value })}
              rows={5}
              placeholder="Ex: Rayure porte gauche, pneu avant gauche usé, niveau carburant 3/4..."
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-brand-blue resize-none dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
              Photos de l'État du Véhicule
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {value.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-white/10"
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      onChange({ ...value, images: value.images.filter((_, i) => i !== idx) })
                    }
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {value.images.length < 8 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-white/20 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-brand-blue hover:text-brand-blue transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span className="text-[10px] font-bold">Photo</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageFiles}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleConditionPanel;
