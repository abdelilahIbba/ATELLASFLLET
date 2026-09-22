import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart, Line, ReferenceLine, PieChart, Pie, Cell
} from 'recharts';
import { Download, FileText, RefreshCw, TrendingUp, DollarSign, Users, Award, Calendar, Target, Lightbulb, UserCheck, Car, Star } from 'lucide-react';
import { adminAnalyticsApi, AnalyticsResponse, AnalyticsTrendPoint, AnalyticsTopCar } from '../../../services/api';

const EMPTY_MONTHS = ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

const emptyTrend = (): AnalyticsTrendPoint[] =>
  EMPTY_MONTHS.map(m => ({ name: m, Actual: 0, Target: 0, Bookings: 0, Utilization: 0, TargetUtilization: 0 }));

const emptyAnalytics = (): AnalyticsResponse => ({
  trend: emptyTrend(),
  monthlySummary: emptyTrend(),
  kpis: { totalRevenue: 0, revenueTrend: 0, utilization: 0, utilizationTrend: 0, activeBookings: 0, bookingsTrend: 0, satisfaction: 0 },
  topRequestedCars: [],
  clientSegments: [],
  vehiclePerformance: [],
  insights: [],
});

const AnalyticsManagement: React.FC<{ isDemoUser?: boolean }> = ({ isDemoUser = false }) => {
  const [analytics, setAnalytics] = useState<AnalyticsResponse>(emptyAnalytics());
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [timeRange] = useState('Année en Cours');

  const data = analytics.trend;

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminAnalyticsApi.get();
      setAnalytics(response);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLastUpdated(new Date());
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isDemoUser) {
      setAnalytics(emptyAnalytics());
      setLoading(false);
      return;
    }
    fetchAnalytics();
  }, [fetchAnalytics, isDemoUser]);

  const handleRefresh = () => fetchAnalytics();

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

  const exportPDF = () => window.print();

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
                {entry.name.includes('Revenu') ? `${Number(entry.value).toLocaleString()} MAD` : entry.value}
                {entry.name.includes('Utilisation') || entry.name.includes('Rétention') ? '%' : ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const kpiCards = isDemoUser
    ? [
        { label: 'Revenu Total', value: '0 MAD', target: '—', trend: '0%', icon: DollarSign, color: 'text-slate-400', progress: 0 },
        { label: 'Utilisation Flotte', value: '0%', target: '—', trend: '0%', icon: TrendingUp, color: 'text-slate-400', progress: 0 },
        { label: 'Locations Actives', value: '0', target: '—', trend: '0%', icon: Users, color: 'text-slate-400', progress: 0 },
        { label: 'Satisfaction Client', value: '—/5', target: '—', trend: '', icon: Award, color: 'text-slate-400', progress: 0 },
      ]
    : [
        { label: 'Revenu Total', value: `${analytics.kpis.totalRevenue.toLocaleString()} MAD`, target: '—', trend: `${analytics.kpis.revenueTrend >= 0 ? '+' : ''}${analytics.kpis.revenueTrend}%`, icon: DollarSign, color: analytics.kpis.revenueTrend >= 0 ? 'text-green-500' : 'text-red-500', progress: Math.min(100, Math.abs(analytics.kpis.revenueTrend) * 5) },
        { label: 'Utilisation Flotte', value: `${analytics.kpis.utilization}%`, target: '85%', trend: `${analytics.kpis.utilizationTrend >= 0 ? '+' : ''}${analytics.kpis.utilizationTrend}%`, icon: TrendingUp, color: analytics.kpis.utilizationTrend >= 0 ? 'text-green-500' : 'text-red-500', progress: analytics.kpis.utilization },
        { label: 'Locations Actives', value: `${analytics.kpis.activeBookings}`, target: '—', trend: `${analytics.kpis.bookingsTrend >= 0 ? '+' : ''}${analytics.kpis.bookingsTrend}%`, icon: Users, color: analytics.kpis.bookingsTrend >= 0 ? 'text-blue-500' : 'text-red-500', progress: Math.min(100, Math.abs(analytics.kpis.bookingsTrend) * 5) },
        { label: 'Satisfaction Client', value: `${analytics.kpis.satisfaction || '—'}/5`, target: '—', trend: '', icon: Award, color: 'text-yellow-500', progress: (analytics.kpis.satisfaction / 5) * 100 },
      ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 print:p-0 print:m-0 print:space-y-4">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:mb-8">
        <div>
          <h2 className="text-2xl font-bold text-brand-navy dark:text-white font-space">Analyses & Rapports</h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 print:hidden">
            <span className="flex items-center gap-1">
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Données système en direct
            </span>
            <span>•</span>
            <span>Dernière mise à jour : {lastUpdated.toLocaleTimeString()}</span>
          </div>
          <p className="hidden print:block text-slate-500 text-sm mt-1">Généré le {new Date().toLocaleDateString()} à {new Date().toLocaleTimeString()}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-bold text-brand-navy dark:text-white shadow-sm min-w-[160px]">
            <Calendar className="w-4 h-4 text-slate-400" />
            {timeRange}
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-2"></div>

          <button onClick={handleRefresh} className="p-2 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-500" title="Actualiser Données">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-bold text-brand-navy dark:text-white hover:bg-slate-50 transition-colors shadow-sm">
            <FileText className="w-4 h-4" /> CSV
          </button>
          <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-bold hover:bg-brand-navy/90 transition-colors shadow-lg shadow-brand-navy/20">
            <Download className="w-4 h-4" /> Rapport PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
        {kpiCards.map((kpi: any, idx) => (
          <div key={idx} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm print:border-slate-300 print:shadow-none">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-50 dark:bg-white/10 rounded-lg">
                <kpi.icon className="w-5 h-5 text-brand-navy dark:text-white" />
              </div>
              {kpi.trend && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-black/20 ${kpi.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.trend}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-brand-navy dark:text-white font-space mb-1">{kpi.value}</h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Cible : <span className="font-bold text-brand-navy dark:text-white">{kpi.target}</span></span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full ${!kpi.trend || kpi.trend.startsWith('+') ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.max(0, Math.min(100, kpi.progress))}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:block print:space-y-6">

        {/* Revenue vs Target */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm col-span-1 lg:col-span-2 print:break-inside-avoid">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-brand-navy dark:text-white">Performance Revenus vs Cible</h3>
              <p className="text-xs text-slate-500">Comparaison mensuelle des revenus réels aux objectifs calculés sur les 6 mois précédents.</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height={300} minWidth={0}>
              <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="Actual" name="Revenu Réel" fill="#0F172A" radius={[4, 4, 0, 0]} barSize={30} />
                <Line type="monotone" dataKey="Target" name="Objectif Revenu" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Area type="monotone" dataKey="Actual" name="Zone de Performance" fill="#3B82F6" fillOpacity={0.1} stroke="none" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue distribution by category */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm print:break-inside-avoid">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-brand-navy dark:text-white">Répartition des Revenus par Catégorie</h3>
              <p className="text-xs text-slate-500">Part du chiffre d'affaires générée par chaque catégorie de véhicule.</p>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-white/10 rounded-full">
              <UserCheck className="w-4 h-4 text-brand-blue" />
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between h-[300px]">
            <div className="w-full md:w-1/2 h-full">
              <ResponsiveContainer width="100%" height={300} minWidth={0}>
                <PieChart>
                  <Pie data={isDemoUser ? [] : analytics.clientSegments} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {(isDemoUser ? [] : analytics.clientSegments).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-4 pl-0 md:pl-4">
              {(isDemoUser ? [] : analytics.clientSegments).map((segment) => (
                <div key={segment.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }}></div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{segment.name}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-500">{segment.value}%</span>
                </div>
              ))}
              {!isDemoUser && analytics.clientSegments.length === 0 && (
                <p className="text-xs text-slate-500 italic">Aucune réservation confirmée pour générer cette répartition.</p>
              )}
            </div>
          </div>
        </div>

        {/* Vehicle performance matrix */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm print:break-inside-avoid">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-brand-navy dark:text-white">Matrice de Rentabilité Véhicule</h3>
              <p className="text-xs text-slate-500">Revenus vs coûts de maintenance par modèle (données réelles).</p>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-white/10 rounded-full">
              <Car className="w-4 h-4 text-brand-red" />
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height={300} minWidth={0}>
              <BarChart layout="vertical" data={isDemoUser ? [] : analytics.vehiclePerformance} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} interval={0} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="revenue" name="Revenu Total" fill="#0F172A" stackId="a" radius={[0, 4, 4, 0]} barSize={20} />
                <Bar dataKey="maintenance" name="Coût Maint." fill="#EF4444" stackId="a" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet utilization */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm print:break-inside-avoid">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-brand-navy dark:text-white">Taux d'Utilisation de la Flotte</h3>
              <p className="text-xs text-slate-500">Pourcentage de la flotte effectivement louée, calculé sur les jours réservés réels.</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height={300} minWidth={0}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} unit="%" domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <ReferenceLine y={85} label="Cible (85%)" stroke="red" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="Utilization" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorUtil)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking volume */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm print:break-inside-avoid">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-brand-navy dark:text-white">Volume de Réservations</h3>
              <p className="text-xs text-slate-500">Nombre de réservations confirmées par mois.</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height={300} minWidth={0}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Bookings" fill="#10B981" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Top requested cars */}
      {!isDemoUser && (
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm print:break-inside-avoid">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-50 dark:bg-white/10 rounded-full">
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-navy dark:text-white">Véhicules les Plus Demandés</h3>
              <p className="text-xs text-slate-500">Classement réel basé sur le nombre de réservations confirmées.</p>
            </div>
          </div>
          {analytics.topRequestedCars.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune réservation confirmée pour établir ce classement.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-100 dark:border-white/10">
                    <th className="pb-3 font-semibold">Rang</th>
                    <th className="pb-3 font-semibold">Véhicule</th>
                    <th className="pb-3 font-semibold">Catégorie</th>
                    <th className="pb-3 font-semibold text-right">Réservations confirmées</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topRequestedCars.map((car: AnalyticsTopCar, idx: number) => (
                    <tr key={car.id} className="border-b border-slate-50 dark:border-white/5 last:border-0">
                      <td className="py-3 font-bold text-brand-navy dark:text-white">#{idx + 1}</td>
                      <td className="py-3 font-medium text-slate-700 dark:text-slate-300">{car.name}</td>
                      <td className="py-3 text-slate-500">{car.category}</td>
                      <td className="py-3 text-right font-bold text-brand-navy dark:text-white">{car.rentals_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Insights Marketing IA */}
      {!isDemoUser && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-8 shadow-xl print:break-inside-avoid print:bg-none print:text-black print:border print:border-slate-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm print:bg-slate-100">
              <Lightbulb className="w-6 h-6 text-yellow-400 print:text-yellow-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-space">Insights Marketing IA</h3>
              <p className="text-slate-400 text-sm print:text-slate-600">Recommandations générées automatiquement à partir des tendances réelles.</p>
            </div>
          </div>

          {analytics.insights.length === 0 ? (
            <p className="text-slate-400 text-sm print:text-slate-600">
              Pas encore assez de données pour générer des recommandations. Les insights apparaîtront dès que des réservations seront confirmées.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {analytics.insights.map((insight, idx) => {
                const iconMap: Record<string, { icon: typeof Target; color: string }> = {
                  retention: { icon: Target, color: 'text-brand-blue' },
                  acquisition: { icon: UserCheck, color: 'text-green-400 print:text-green-600' },
                  utilization: { icon: TrendingUp, color: 'text-red-400 print:text-red-600' },
                  revenue: { icon: DollarSign, color: 'text-yellow-400 print:text-yellow-600' },
                };
                const { icon: Icon, color } = iconMap[insight.type] ?? { icon: Lightbulb, color: 'text-brand-blue' };
                return (
                  <div key={idx} className="bg-white/5 print:bg-slate-50 border border-white/10 print:border-slate-200 p-5 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-bold ${color}`}>{insight.title}</h4>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300 print:text-slate-700">{insight.text}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AnalyticsManagement;
