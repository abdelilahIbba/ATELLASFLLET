import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map as MapIcon, 
  Navigation, 
  Car, 
  Battery, 
  Signal, 
  Clock, 
  AlertTriangle, 
  Search, 
  Maximize, 
  Minimize, 
  Locate, 
  Filter, 
  MoreVertical, 
  ChevronRight, 
  CalendarRange, 
  BarChart3, 
  Activity, 
  Zap, 
  User 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet/React-Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- TYPES ---
interface TrackedVehicle {
  id: string;
  name: string;
  driver: string;
  status: 'En déplacement' | 'Au ralenti' | 'Stationné' | 'Hors ligne';
  speed: number;
  battery: number;
  fuel: number;
  location: [number, number]; // [Lat, Lng]
  destination?: string;
  eta?: string;
  lastUpdate: string;
  type: 'Berline' | 'SUV' | 'Luxe';
  plate?: string;
}

// --- MOCK DATA GENERATION ---
const INITIAL_VEHICLES: TrackedVehicle[] = [
  { 
    id: 'V-001', 
    name: 'Dacia Logan', 
    driver: 'Karim B.', 
    status: 'Stationné', 
    speed: 0, 
    battery: 12.4, 
    fuel: 85, 
    location: [33.5731, -7.5898], // Casablanca Center
    lastUpdate: 'Il y a 2 min',
    type: 'Berline',
    plate: '12345-A-6'
  },
  { 
    id: 'V-002', 
    name: 'Peugeot 208', 
    driver: 'Sarah Benali', 
    status: 'En déplacement', 
    speed: 42, 
    battery: 13.1, 
    fuel: 60, 
    location: [33.5890, -7.6150], // Moving in Casa
    destination: 'Anfa Place',
    eta: '12 min',
    lastUpdate: 'À l\'instant',
    type: 'Berline',
    plate: '98765-B-1'
  },
  { 
    id: 'V-003', 
    name: 'Renault Clio 4', 
    driver: 'Yassine O.', 
    status: 'En déplacement', 
    speed: 110, 
    battery: 12.8, 
    fuel: 40, 
    location: [34.0209, -6.8416], // Rabat
    destination: 'Centre de Meknès',
    eta: '55 min',
    lastUpdate: 'À l\'instant',
    type: 'Berline',
    plate: '45678-D-12'
  },
  { 
    id: 'V-004', 
    name: 'Dacia Duster', 
    driver: 'Mehdi C.', 
    status: 'Au ralenti', 
    speed: 0, 
    battery: 12.5, 
    fuel: 92, 
    location: [33.5950, -7.6250], 
    lastUpdate: 'Il y a 5 min',
    type: 'SUV',
    plate: '11223-E-6'
  },
];

const STATS_DATA = [
  { label: 'Flotte Totale', value: '24', icon: Car, color: 'text-blue-500' },
  { label: 'Locations Actives', value: '18', icon: Activity, color: 'text-green-500' },
  { label: 'Vitesse Moy.', value: '42 km/h', icon: Zap, color: 'text-yellow-500' },
  { label: 'Alertes', value: '2', icon: AlertTriangle, color: 'text-red-500' },
];

const SPEED_HISTORY = [
    { time: '10:00', speed: 65 },
    { time: '10:05', speed: 72 },
    { time: '10:10', speed: 40 },
    { time: '10:15', speed: 0 },
    { time: '10:20', speed: 25 },
    { time: '10:25', speed: 55 },
    { time: '10:30', speed: 82 },
];

// Custom Map Component to handle flying to location
const MapController = ({ 
    selectedVehicle 
}: { 
    selectedVehicle: TrackedVehicle | null 
}) => {
    const map = useMap();
    
    useEffect(() => {
        if (selectedVehicle) {
            map.flyTo(selectedVehicle.location, 14, {
                duration: 1.5
            });
        }
    }, [selectedVehicle, map]);

    return null;
};

const GPSManagement: React.FC = () => {
  const [vehicles, setVehicles] = useState<TrackedVehicle[]>(INITIAL_VEHICLES);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<'Standard' | 'Satellite'>('Standard');
  const [timeRange, setTimeRange] = useState('Aujourd\'hui');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || null;

  // --- REAL-TIME SIMULATION ENGINE ---
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prevVehicles => {
        return prevVehicles.map(vehicle => {
          // SCENARIO 1: Parked Car (Stationary)
          if (vehicle.status === 'Stationné') {
             return vehicle; 
          }

          // SCENARIO 2: Casablanca Moving (Restricted to City Center)
          if (vehicle.id === 'V-002') {
             // Urban limits: Max 60 km/h, typically 20-55
             const newSpeed = Math.floor(Math.random() * (58 - 20) + 20); 
             
             // Move randomly but stay within bounds
             // Casa Bounds: Lat 33.52-33.60, Lng -7.68 to -7.55
             
             let latChange = (Math.random() - 0.5) * 0.0005; 
             let lngChange = (Math.random() - 0.5) * 0.0005;
             
             let newLat = vehicle.location[0] + latChange;
             let newLng = vehicle.location[1] + lngChange;
             
             // Simple clamp to keep inside bounds
             newLat = Math.max(33.52, Math.min(33.60, newLat));
             newLng = Math.max(-7.68, Math.min(-7.55, newLng));

             return {
                 ...vehicle,
                 speed: newSpeed,
                 status: newSpeed === 0 ? 'Au ralenti' : 'En déplacement',
                 location: [newLat, newLng]
             };
          }

          // SCENARIO 3: Rabat <-> Meknes Highway Run
          // Route: Rabat (34.0209, -6.8416) to Meknes (33.8935, -5.5473)
          // Distance is approx 120km, roughly East-South-East
          if (vehicle.id === 'V-003') {
             const newSpeed = Math.floor(Math.random() * (120 - 90) + 90); // 90-120 km/h highway speed
             
             // Define route endpoints
             const startPt = [34.0209, -6.8416]; // Rabat
             const endPt = [33.8935, -5.5473];   // Meknes
             
             // Calculate direction vector
             // diffLat = -0.1274
             // diffLng = 1.2943
             // normalize roughly for movement speed
             
             const stepLat = -0.00013; 
             const stepLng = 0.0013; 
             
             let newLat = vehicle.location[0] + stepLat;
             let newLng = vehicle.location[1] + stepLng;
             
             // Reset if reached Meknes (Longitude > -5.55 or Lat < 33.9 and Lng > -5.6)
             if (newLng >= endPt[1]) {
                 newLat = startPt[0];
                 newLng = startPt[1];
             }

             return {
                 ...vehicle,
                 speed: newSpeed,
                 status: 'En déplacement',
                 location: [newLat, newLng]
             };
          }

          return vehicle;
        });
      });
    }, 1000); // 1-second update tick

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-4 animate-in fade-in duration-500">
      
      {/* TOP CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
         <div className="flex items-center gap-4">
             <div className="p-3 bg-brand-blue/10 rounded-lg">
                <MapIcon className="w-6 h-6 text-brand-blue" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-space">Suivi de Flotte en Direct</h2>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                   <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                   Système en Ligne • 24 Flux Actifs
                </div>
             </div>
         </div>

         {/* STATS STRIP */}
         <div className="hidden lg:flex items-center gap-6">
             {STATS_DATA.map((stat, i) => (
                 <div key={i} className="flex items-center gap-3">
                     <div className={`p-2 rounded-full bg-slate-100 dark:bg-slate-800 ${stat.color}`}>
                         <stat.icon className="w-4 h-4" />
                     </div>
                     <div>
                         <p className="text-xs text-slate-500 font-bold uppercase">{stat.label}</p>
                         <p className="text-sm font-bold text-slate-900 dark:text-white">{stat.value}</p>
                     </div>
                 </div>
             ))}
         </div>

         <div className="flex items-center gap-3">
            <div className="relative">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                    <CalendarRange className="w-4 h-4" />
                    {timeRange}
                </button>
                {isFilterOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                        {['Aujourd\'hui', 'Dernières 24h', 'Cette Semaine', 'Ce Mois'].map(t => (
                            <button 
                                key={t}
                                onClick={() => { setTimeRange(t); setIsFilterOpen(false); }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            
            <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                <Maximize className="w-4 h-4" />
            </button>
         </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden relative">
          
          {/* LEFT SIDEBAR: VEHICLE LIST */}
          <div className="w-80 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg z-10 shrink-0">
             <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                 <h3 className="font-bold text-slate-700 dark:text-white uppercase text-xs tracking-wider mb-3">Répertoire des Véhicules</h3>
                 <div className="relative">
                     <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                     <input 
                       type="text" 
                       placeholder="Rechercher..." 
                       className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-brand-blue"
                     />
                 </div>
             </div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                 {vehicles.map(v => (
                     <div 
                        key={v.id}
                        onClick={() => setSelectedVehicleId(v.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                            selectedVehicleId === v.id 
                            ? 'bg-brand-blue/5 border-brand-blue dark:bg-brand-blue/20' 
                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300'
                        }`}
                     >
                         <div className="flex justify-between items-start mb-2">
                             <div>
                                 <h4 className={`text-sm font-bold ${selectedVehicleId === v.id ? 'text-brand-blue dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>{v.name}</h4>
                                 <p className="text-[10px] text-slate-500">{v.plate}</p>
                             </div>
                             <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                 v.status === 'En déplacement' ? 'bg-green-100 text-green-700 border-green-200' :
                                 v.status === 'Stationné' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                                 'bg-amber-100 text-amber-700 border-amber-200'
                             }`}>
                                 {v.status}
                             </div>
                         </div>
                         <div className="flex items-center justify-between text-xs text-slate-500">
                             <div className="flex items-center gap-1">
                                 <User className="w-3 h-3" />
                                 {v.driver}
                             </div>
                             <div className="flex items-center gap-3">
                                 <span>{v.speed} km/h</span>
                                 <span>{v.battery}V</span>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
          </div>

          {/* MAIN MAP AREA (LEAFLET) */}
          <div className="flex-1 bg-slate-100 rounded-xl relative overflow-hidden border border-slate-200 z-0">
             
             {/* We need to ensure the container has height */}
             <MapContainer 
                center={[33.5731, -7.5898]} // Default to Casablanca
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
             >
                 <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                 />
                 
                 {/* Map Controller to handle programmatic moves */}
                 <MapController selectedVehicle={selectedVehicle} />

                 {vehicles.map(v => (
                     <Marker 
                        key={v.id} 
                        position={v.location}
                        eventHandlers={{
                            click: () => {
                                setSelectedVehicleId(v.id);
                            },
                        }}
                     >
                         <Popup>
                            <div className="p-1">
                                <h4 className="font-bold text-sm mb-1">{v.name}</h4>
                                <p className="text-xs text-slate-500 mb-1">{v.driver}</p>
                                <div className="flex gap-2 text-xs font-bold">
                                    <span className={v.status === 'En déplacement' ? 'text-green-600' : 'text-slate-500'}>
                                        {v.speed} km/h
                                    </span>
                                </div>
                            </div>
                         </Popup>
                     </Marker>
                 ))}
             </MapContainer>

             {/* FLOATING INFO PANEL (IF SELECTED) */}
             <AnimatePresence>
                 {selectedVehicle && (
                     <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="absolute top-4 right-4 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-2xl rounded-xl overflow-hidden z-[1000]"
                     >
                         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                             <div>
                                 <h3 className="font-bold text-slate-900 dark:text-white">{selectedVehicle.name}</h3>
                                 <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                                     <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                     Connexion en direct
                                 </p>
                             </div>
                             <button onClick={() => setSelectedVehicleId(null)} className="text-slate-400 hover:text-slate-600">
                                 <Minimize className="w-4 h-4" />
                             </button>
                         </div>
                         
                         <div className="p-4 space-y-4">
                             <div className="grid grid-cols-2 gap-3">
                                 <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-center">
                                     <p className="text-[10px] uppercase text-slate-500 font-bold">Vitesse</p>
                                     <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedVehicle.speed} <span className="text-[10px] text-slate-400">km/h</span></p>
                                 </div>
                                 <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-center">
                                     <p className="text-[10px] uppercase text-slate-500 font-bold">Carburant</p>
                                     <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedVehicle.fuel}%</p>
                                 </div>
                             </div>

                             <div className="space-y-2">
                                 <div className="flex justify-between text-xs">
                                     <span className="text-slate-500">Conducteur</span>
                                     <span className="font-bold text-slate-900 dark:text-white">{selectedVehicle.driver}</span>
                                 </div>
                                 <div className="flex justify-between text-xs">
                                     <span className="text-slate-500">Destination</span>
                                     <span className="font-bold text-slate-900 dark:text-white">{selectedVehicle.destination || 'N/A'}</span>
                                 </div>
                                 <div className="flex justify-between text-xs">
                                     <span className="text-slate-500">ETA</span>
                                     <span className="font-bold text-brand-blue">{selectedVehicle.eta || '-'}</span>
                                 </div>
                             </div>

                             <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                 <button className="w-full flex items-center justify-center gap-2 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity">
                                     Rapport de Télémétrie Complet
                                 </button>
                             </div>
                         </div>
                     </motion.div>
                 )}
             </AnimatePresence>

          </div>

      </div>
    </div>
  );
};

export default GPSManagement;
