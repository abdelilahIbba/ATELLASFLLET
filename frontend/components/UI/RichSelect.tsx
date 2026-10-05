import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

export interface RichSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
  secondaryBadge?: string;
  icon?: React.ReactNode;
}

interface RichSelectProps {
  options: RichSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
}

export const RichSelect: React.FC<RichSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Sélectionner...',
  searchPlaceholder = 'Rechercher...',
  name,
  required,
  disabled,
  className = '',
  triggerClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(() => {
    return options.find(o => String(o.value) === String(value));
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter(o => 
      o.label.toLowerCase().includes(term) ||
      (o.sublabel && o.sublabel.toLowerCase().includes(term)) ||
      (o.badge && o.badge.toLowerCase().includes(term))
    );
  }, [options, searchTerm]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Hidden input for HTML form submissions */}
      {name && (
        <input 
          type="hidden" 
          name={name} 
          value={value} 
          required={required && !value} 
        />
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        className={`w-full flex items-center justify-between text-left transition-all duration-200 border rounded-xl px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/[0.08] ${
          isOpen 
            ? 'border-brand-blue ring-2 ring-brand-blue/20 dark:border-brand-blue shadow-sm' 
            : 'border-slate-200 dark:border-white/10'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${triggerClassName}`}
      >
        <div className="flex-1 min-w-0 mr-2">
          {selectedOption ? (
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-brand-navy dark:text-white truncate">
                    {selectedOption.label}
                  </span>
                  {selectedOption.secondaryBadge && (
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-200 shrink-0">
                      {selectedOption.secondaryBadge}
                    </span>
                  )}
                </div>
                {selectedOption.sublabel && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-normal">
                    {selectedOption.sublabel}
                  </p>
                )}
              </div>
              {selectedOption.badge && (
                <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/20 dark:text-blue-400 border border-brand-blue/20">
                  {selectedOption.badge}
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm text-slate-400 dark:text-slate-500">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {value && !disabled && (
            <div
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-1 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/10 rounded-md transition-colors"
              title="Effacer"
            >
              <X className="w-3.5 h-3.5" />
            </div>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-blue' : ''}`} />
        </div>
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Search Bar */}
          <div className="p-2.5 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-[#132238] border border-slate-200 dark:border-white/10 rounded-xl text-brand-navy dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 custom-scrollbar divide-y divide-slate-100/50 dark:divide-white/[0.03]">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                Aucun résultat trouvé
              </div>
            ) : (
              filteredOptions.map(option => {
                const isSelected = String(option.value) === String(value);
                return (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue'
                        : 'hover:bg-slate-100/80 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold truncate ${isSelected ? 'text-brand-blue font-bold' : 'text-brand-navy dark:text-white'}`}>
                          {option.label}
                        </span>
                        {option.secondaryBadge && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300 shrink-0">
                            {option.secondaryBadge}
                          </span>
                        )}
                      </div>
                      {option.sublabel && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {option.sublabel}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {option.badge && (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                          isSelected
                            ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                        }`}>
                          {option.badge}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-4 h-4 text-brand-blue shrink-0 ml-1" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RichSelect;
