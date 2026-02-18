import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, ComposedChart, Scatter, ReferenceLine, PieChart, Pie, Cell
} from 'recharts';
import { Download, FileText, RefreshCw, Smartphone, TrendingUp, DollarSign, Users, Award, Calendar, ChevronDown, Target, Lightbulb, UserCheck, Car } from 'lucide-react';
import { motion } from 'framer-motion';

// --- MOCK DATA GENERATION ---
const generateData = () => {
    const data = [];
    const months = ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
    
    for (let i = 0; i < months.length; i++) {
        const actualRevenue = Math.floor(Math.random() * (50000 - 20000) + 20000);
        const targetRevenue = Math.floor(actualRevenue * (1 + (Math.random() * 0.4 - 0.2))); // +/- 20%
        const bookings = Math.floor(Math.random() * (150 - 50) + 50);
        
        data.push({
            name: months[i],
            Actual: actualRevenue,
            Target: targetRevenue,
            Bookings: bookings,
            Utilization: Math.floor(Math.random() * (95 - 60) + 60), // %
            TargetUtilization: 85
        });
    }
    return data;
};

const CLIENT_SEGMENTS = [
  { name: 'VIP Entreprise', value: 35, color: '#0F172A' },
  { name: 'Touristes', value: 40, color: '#3B82F6' },
  { name: 'Événements & Mariages', value: 15, color: '#10B981' },
  { name: 'Élites Locales', value: 10, color: '#F59E0B' },
];

const VEHICLE_PERFORMANCE = [
  { name: 'Ferrari SF90', revenue: 125000, bookings: 42, retention: 85, maintenance: 12000 },
  { name: 'Range Rover', revenue: 98000, bookings: 65, retention: 70, maintenance: 8500 },
  { name: 'Porsche 911', revenue: 85000, bookings: 55, retention: 60, maintenance: 9200 },
  { name: 'Bentley Cont.', revenue: 72000, bookings: 28, retention: 90, maintenance: 15000 },
  { name: 'Lamborghini Urus', revenue: 110000, bookings: 48, retention: 78, maintenance: 13500 },
];

const AnalyticsManagement: React.FC = () => {
  const [data, setData] = useState(generateData());
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [timeRange, setTimeRange] = useState('Année en Cours');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

  // Real-time Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        // Subtle update simulation to show "live" data movement
        setData(prevData => {
            return prevData.map(item => ({
                ...item,
                Actual: item.Actual + Math.floor(Math.random() * 200 - 100),
                Utilization: Math.min(100, Math.max(0, item.Utilization + Math.floor(Math.random() * 6 - 3)))
            }));
        });
        setLastUpdated(new Date());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
        setData(generateData()); // Full regenerate
        setLastUpdated(new Date());
        setLoading(false);
    }, 1000);
  };

  const exportCSV = () => {
    const headers = ['Mois', 'Revenu Réel', 'Revenu Cible', 'Réservations', 'Utilisation (%)', 'Utilisation Cible (%)'];
    const csvContent = [
        headers.join(','),
        ...data.map(row => `${row.name},${row.Actual},${row.Target},${row.Bookings},${row.Utilization},${row.TargetUtilization}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'rapport_analyses.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    // In a real app, use jsPDF or similar. Here we toggle print mode.
    window.print(); 
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-4 rounded-xl shadow-xl z-50">
          <p className="font-bold text-slate-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm mb-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-slate-500 dark:text-slate-400 capitalize">{entry.name}:</span>
                <span className="font-bold text-brand-navy dark:text-white">
                    {entry.name.includes('Revenu') ? `${entry.value.toLocaleString()} MAD` : entry.value}
                    {entry.name.includes('Utilisation') || entry.name.includes('Rétention') ? '%' : ''}
                </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 print:p-0 print:m-0 print:space-y-4">
      
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:mb-8">
        <div>
          <h2 className="text-2xl font-bold text-brand-navy dark:text-white font-space">Analyses & Rapports</h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 print:hidden">
            <span className="flex items-center gap-1">
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                Mise à jour en direct (5s)
            </span>
            <span>•</span>
            <span>Dernière mise à jour : {lastUpdated.toLocaleTimeString()}</span>
          </div>
          <p className="hidden print:block text-slate-500 text-sm mt-1">Généré le {new Date().toLocaleDateString()} à {new Date().toLocaleTimeString()}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 print:hidden">
            
            {/* Time Period Filter */}
            <div className="relative">
                <button 
                  onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-bold text-brand-navy dark:text-white hover:bg-slate-50 transition-colors shadow-sm min-w-[160px] justify-between"
                >
                    <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {timeRange}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isTimeDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                        {['30 Derniers Jours', 'Ce Trimestre', 'Année en Cours', 'Année Dernière'].map(range => (
                            <button 
                                key={range}
                                onClick={() => {
                                    setTimeRange(range);
                                    setIsTimeDropdownOpen(false);
                                    handleRefresh();
                                }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-2"></div>

            <button 
                onClick={handleRefresh}
                className="p-2 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-500"
                title="Actualiser Données"
            >
                <RefreshCw className="w-4 h-4" />
            </button>
            <button 
                onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-bold text-brand-navy dark:text-white hover:bg-slate-50 transition-colors shadow-sm"
            >
                <FileText className="w-4 h-4" /> CSV
            </button>
            <button 
                onClick={exportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-bold hover:bg-brand-navy/90 transition-colors shadow-lg shadow-brand-navy/20"
            >
                <Download className="w-4 h-4" /> Rapport PDF
            </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
        {[
            { label: 'Revenu Total', value: '4,829,000 MAD', target: '4,500,000 MAD', trend: '+7.3%', icon: DollarSign, color: 'text-green-500' },
            { label: 'Utilisation Flotte', value: '78%', target: '85%', trend: '-8.2%', icon: TrendingUp, color: 'text-red-500' },
            { label: 'Locations Actives', value: '142', target: '120', trend: '+18.3%', icon: Users, color: 'text-blue-500' },
            { label: 'Satisfaction Client', value: '4.9/5', target: '4.8/5', trend: '+2.1%', icon: Award, color: 'text-yellow-500' },
        ].map((kpi, idx) => (
            <div key={idx} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm print:border-slate-300 print:shadow-none">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-slate-50 dark:bg-white/10 rounded-lg">
                        <kpi.icon className="w-5 h-5 text-brand-navy dark:text-white" />
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-black/20 ${kpi.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {kpi.trend}
                    </span>
                </div>
                <div>
                   <h3 className="text-xl font-bold text-brand-navy dark:text-white font-space mb-1">{kpi.value}</h3>
                   <div className="flex items-center gap-2 text-xs">
                       <span className="text-slate-500">Cible : <span className="font-bold text-brand-navy dark:text-white">{kpi.target}</span></span>
                   </div>
                   <div className="w-full bg-slate-100 dark:bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                       <div 
                         className={`h-full rounded-full ${kpi.trend.startsWith('+') ? 'bg-green-500' : 'bg-red-500'}`} 
                         style={{ width: '70%' }}
                        ></div>
                   </div>
                </div>
            </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:block print:space-y-6">
          
          {/* Main Financial Performance Chart */}
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm col-span-1 lg:col-span-2 print:break-inside-avoid">
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-brand-navy dark:text-white">Performance Revenus vs Cible</h3>
                    <p className="text-xs text-slate-500">Comparaison des revenus mensuels réels par rapport aux objectifs fixés.</p>
                </div>
             </div>
             
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fileName='month' tick={{fontSize: 12}} />
                        <YAxis stroke="#64748b" tick={{fontSize: 12}} tickFormatter={(val) => `${val/1000}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{paddingTop: '20px'}} />
                        
                        <Bar 
                            dataKey="Actual" 
                            name="Revenu Réel" 
                            fill="#0F172A" 
                            radius={[4, 4, 0, 0]} 
                            barSize={30}
                        />
                         <Line 
                            type="monotone" 
                            dataKey="Target" 
                            name="Objectif Revenu" 
                            stroke="#EF4444" 
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2 }} 
                            activeDot={{ r: 6 }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="Actual" 
                            name="Zone de Performance" 
                            fill="#3B82F6" 
                            fillOpacity={0.1} 
                            stroke="none" 
                        />
                    </ComposedChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* New: Customer Segmentation Analysis */}
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm print:break-inside-avoid">
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-brand-navy dark:text-white">Segmentation Clients</h3>
                    <p className="text-xs text-slate-500">Répartition des revenus par catégorie de client.</p>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-white/10 rounded-full">
                   <UserCheck className="w-4 h-4 text-brand-blue" />
                </div>
             </div>
             
             <div className="flex flex-col md:flex-row items-center justify-between h-[300px]">
                <div className="w-full md:w-1/2 h-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie
                           data={CLIENT_SEGMENTS}
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={5}
                           dataKey="value"
                         >
                           {CLIENT_SEGMENTS.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                         </Pie>
                         <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                   </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 space-y-4 pl-0 md:pl-4">
                    {CLIENT_SEGMENTS.map((segment) => (
                       <div key={segment.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }}></div>
                             <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{segment.name}</span>
                          </div>
                          <span className="text-sm font-medium text-slate-500">{segment.value}%</span>
                       </div>
                    ))}
                    <div className="pt-4 border-t border-slate-100 dark:border-white/5 mt-4">
                       <p className="text-xs text-slate-500 italic">
                         Le segment "Touristes" affiche la plus forte croissance saisonnière (+15% vs mois dernier).
                       </p>
                    </div>
                </div>
             </div>
          </div>

          {/* New: Vehicle Matrix */}
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm print:break-inside-avoid">
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-brand-navy dark:text-white">Matrice de Rentabilité Véhicule</h3>
                    <p className="text-xs text-slate-500">Revenus vs Coûts de Maintenance par Modèle.</p>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-white/10 rounded-full">
                   <Car className="w-4 h-4 text-brand-red" />
                </div>
             </div>
             
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={VEHICLE_PERFORMANCE}
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} interval={0} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenu Total" fill="#0F172A" stackId="a" radius={[0, 4, 4, 0]} barSize={20} />
                      <Bar dataKey="maintenance" name="Coût Maint." fill="#EF4444" stackId="a" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Utilization & Fleet Efficiency */}
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm print:break-inside-avoid">
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-brand-navy dark:text-white">Taux d'Utilisation de la Flotte</h3>
                    <p className="text-xs text-slate-500">Pourcentage de la flotte louée vs temps d'inactivité.</p>
                </div>
             </div>
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} />
                        <YAxis stroke="#64748b" tick={{fontSize: 12}} unit="%" domain={[0, 100]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{paddingTop: '20px'}} />
                        
                        <ReferenceLine y={85} label="Cible (85%)" stroke="red" strokeDasharray="3 3" />
                        
                        <Area 
                            type="monotone" 
                            dataKey="Utilization" 
                            stroke="#3B82F6" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorUtil)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Booking Volume Trend */}
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm print:break-inside-avoid">
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-brand-navy dark:text-white">Volume de Réservations</h3>
                    <p className="text-xs text-slate-500">Nombre total de réservations par mois.</p>
                </div>
             </div>
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} />
                        <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                        <Tooltip content={<CustomTooltip />} />
                        
                        <Bar 
                            dataKey="Bookings" 
                            fill="#10B981" 
                            radius={[4, 4, 0, 0]}
                            barSize={30} 
                        />
                    </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

      </div>

      {/* STRATEGIC INSIGHTS SECTION (New) */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-8 shadow-xl print:break-inside-avoid print:bg-none print:text-black print:border print:border-slate-300">
         <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm print:bg-slate-100">
               <Lightbulb className="w-6 h-6 text-yellow-400 print:text-yellow-600" />
            </div>
            <div>
               <h3 className="text-xl font-bold font-space">Insights Marketing IA</h3>
               <p className="text-slate-400 text-sm print:text-slate-600">Recommandations exploitables basées sur les données de performance actuelles.</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 print:bg-slate-50 border border-white/10 print:border-slate-200 p-5 rounded-xl backdrop-blur-sm">
               <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-brand-blue">Stratégie de Rétention</h4>
                  <Target className="w-4 h-4 text-brand-blue" />
               </div>
               <p className="text-sm leading-relaxed text-slate-300 print:text-slate-700">
                  <strong className="text-white print:text-black">Bentley Continental</strong> a le taux de rétention le plus élevé (90%). 
                  Recommandation de créer un niveau de fidélité "Luxe Britannique" pour les clients louant ce modèle.
               </p>
            </div>

            <div className="bg-white/5 print:bg-slate-50 border border-white/10 print:border-slate-200 p-5 rounded-xl backdrop-blur-sm">
               <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-green-400 print:text-green-600">Acquisition Client</h4>
                  <UserCheck className="w-4 h-4 text-green-400 print:text-green-600" />
               </div>
               <p className="text-sm leading-relaxed text-slate-300 print:text-slate-700">
                  Le segment <strong className="text-white print:text-black">Touristes</strong> croît rapidement (+15%). 
                  Lancer des publicités ciblées pour "Service Navette Aéroport" et "Pack Découverte 7 Jours".
               </p>
            </div>

            <div className="bg-white/5 print:bg-slate-50 border border-white/10 print:border-slate-200 p-5 rounded-xl backdrop-blur-sm">
               <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-red-400 print:text-red-600">Alerte Utilisation</h4>
                  <TrendingUp className="w-4 h-4 text-red-400 print:text-red-600" />
               </div>
               <p className="text-sm leading-relaxed text-slate-300 print:text-slate-700">
                  L'utilisation de la flotte chute à 65% en milieu de semaine. Envisagez une 
                  <strong className="text-white print:text-black"> "Offre Affaires Semaine"</strong> (Mar-Jeu) avec -20% pour les clients corpo.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
};

export default AnalyticsManagement;
