import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate as useRouterNavigate } from 'react-router-dom';
import { adminCarsApi, adminClientsApi, adminBookingsApi, adminContactsApi, adminFinesApi, adminPickupPointsApi, carsApi, api } from '../../services/api';
import type { PickupPoint } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import FleetManagement from '../Admin/Fleet/FleetManagement';
import BookingManagement from '../Admin/Bookings/BookingManagement';
import ClientManagement from '../Admin/Clients/ClientManagement';
import InfractionsManagement from '../Admin/Infractions/InfractionsManagement';
import SettingsManagement from '../Admin/Settings/SettingsManagement';
import ContractModal, { loadCompanySettings, ContractCompanySettings } from '../Admin/Contracts/ContractModal';
import MessageManagement from '../Admin/Messages/MessageManagement';
import ContentManagement from '../Admin/Content/ContentManagement';
import ReviewManagement from '../Admin/Reviews/ReviewManagement';
import DashboardOverview from '../Admin/Overview/DashboardOverview';
import AnalyticsManagement from '../Admin/Analytics/AnalyticsManagement';
import GPSManagement from '../Admin/Tracking/GPSManagement';
import AvailabilityCalendar from '../UI/AvailabilityCalendar';
import { UserInfo, Message } from '../../types';
import type { Infraction, InfractionType } from '../Admin/types';
import { 
  Bell,
  LayoutDashboard, 
  Map as MapIcon, 
  Car, 
  CalendarRange, 
  BarChart3, 
  Settings, 
  Plus, 
  AlertCircle,
  Wrench,
  Search,
  MoreVertical,
  ArrowUpRight,
  ArrowRight,
  TrendingUp,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Filter,
  LogOut,
  Sun,
  Moon,
  FileText,
  Siren,
  Building2,
  CheckCircle2,
  XCircle,
  Users,
  Star,
  MessageSquare,
  PenTool,
  Globe,
  ShieldAlert,
  X,
  Send,
  Navigation,
  Lock,
  Unlock,
  Trash2,
  Edit,
  Save,
  CheckSquare,
  Square,
  Printer,
  Download,
  FileSignature,
  Fuel,
  Gauge,
  Image as ImageIcon,
  UploadCloud,
  AlertTriangle,
  FileCheck,
  CreditCard,
  ScanLine,
  UserCheck,
  Crown,
  Locate,
  Zap,
  Radio,
  Maximize,
  Minimize,
  Phone,
  Power,
  Eye,
  ThumbsUp,
  Share2
} from 'lucide-react';

interface AdminDashboardProps {
  isDark: boolean;
  toggleTheme: () => void;
  onNavigate: (path: string) => void;
  onLogout?: () => void;
  currentUser?: UserInfo | null;
}

// --- TYPES & INTERFACES ---

interface Vehicle {
  id: string;
  name: string;
  /** Backend fields for round-tripping to /api/admin/cars */
  make?: string;
  model?: string;
  year?: number;
  fuel_type?: string;
  category: 'Hyper' | 'SUV' | 'Sedan' | 'Convertible';
  image: string;
  plate: string;
  unitPlates?: string[];  // per-unit license plates, index = unitNumber - 1
  branch: string;
  status: 'Available' | 'Rented' | 'Maintenance' | 'Impounded';
  driver: string;
  fuel: number;
  odometer: number;
  pricePerDay: number;
  documents: {
    insurance: string;       // Expiry Date
    visiteTechnique: string; // Expiry Date
    vignette: string;        // Expiry Date
    carteGrise: string;      // Renewal/Expiry Date
  };
  documentFiles?: {
    insurance?: string;
    visiteTechnique?: string;
    vignette?: string;
    carteGrise?: string;
  };
  condition: 'Excellent' | 'Good' | 'Service Due';
  location: { lat: number, lng: number };
  quantity: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cin: string;
  driverLicense?: string;
  driverLicenseExpiry?: string;
  status: 'Active' | 'Blacklisted' | 'VIP';
  kycStatus: 'Verified' | 'Pending' | 'Missing';
  totalSpent: number;
  lastRental: string;
  avatar?: string;
  documents?: {
      idCardFront?: string;
      idCardBack?: string;
      license?: string;
  };
}

interface Booking {
  id: string;
  clientName: string;
  vehicleName: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Confirmed' | 'Active' | 'Completed' | 'Cancelled';
  amount: number;
  paymentStatus: 'Paid' | 'Deposit Only' | 'Unpaid';
  notes?: string;
  clientId?: string;
  carId?: string;
  /** 1-based unit slot assigned by the backend */
  unitNumber?: number;
  pickupPointId?: number;
  dropoffPointId?: number;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'booking' | 'alert' | 'system';
  timestamp: string;
  read: boolean;
}

interface Review {
  id: string;
  clientName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  status: 'Published' | 'Hidden';
  avatar?: string;
}

interface BlogPost {
  id: string;
  title: string;
  category: string;
  views: number;
  status: 'Published' | 'Draft';
  date: string;
  image: string;
  excerpt: string;
  readTime: string;
  author: {
    name: string;
    avatar: string;
  };
}

interface Fine {
  id: string;
  date: string;
  type: 'Radar' | 'Parking' | 'Speeding' | 'Police Check';
  amount: number;
  vehicleId: string;
  driverName: string;
  status: 'Paid' | 'Unpaid' | 'Disputed';
  location: string;
}

interface MaintenanceLog {
  id: string;
  vehicleId: string;
  type: 'Oil Change' | 'Tires' | 'Brakes' | 'General Service';
  date: string;
  cost: number;
  provider: string;
  status: 'Completed' | 'Scheduled';
}

// --- MOCK DATA ---

const VEHICLE_DATA: Vehicle[] = [
  { 
    id: 'V-001', name: 'Atellas GT Stradale', category: 'Hyper', image: 'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&q=80&w=800', 
    plate: '72819-A-1', branch: 'Casablanca Anfa', status: 'Rented', driver: 'Karim B.', fuel: 82, odometer: 12500, pricePerDay: 1200,
    documents: { insurance: '2025-06-01', visiteTechnique: '2025-01-15', vignette: '2025-01-31', carteGrise: '2028-05-20' },
    condition: 'Excellent', location: { lat: 33.5731, lng: -7.5898 }, quantity: 1
  },
  { 
    id: 'V-002', name: 'Range Rover Autobiography', category: 'SUV', image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=800', 
    plate: '11029-B-6', branch: 'Marrakech Guebiz', status: 'Available', driver: '-', fuel: 100, odometer: 45200, pricePerDay: 850,
    documents: { insurance: '2024-12-01', visiteTechnique: '2024-11-20', vignette: '2025-01-31', carteGrise: '2026-03-10' },
    condition: 'Good', location: { lat: 31.6295, lng: -7.9811 }, quantity: 1
  },
  { 
    id: 'V-003', name: 'Porsche 911 Cabriolet', category: 'Convertible', image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800', 
    plate: '88210-A-1', branch: 'Rabat Agdal', status: 'Maintenance', driver: '-', fuel: 20, odometer: 68000, pricePerDay: 750,
    documents: { insurance: '2025-03-15', visiteTechnique: '2024-10-30', vignette: '2025-01-31', carteGrise: '2027-08-15' },
    condition: 'Service Due', location: { lat: 34.0209, lng: -6.8416 }, quantity: 1
  },
];

const CLIENTS_DATA: Client[] = [
  { 
      id: 'C-001', name: 'Amine Harit', email: 'amine@atlas.ma', phone: '+212 600-123456', cin: 'BK123456', 
      status: 'VIP', kycStatus: 'Verified', totalSpent: 45000, lastRental: '2024-10-15',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100'
  },
  { 
      id: 'C-002', name: 'Sarah Benali', email: 'sarah.b@gmail.com', phone: '+212 611-987654', cin: 'EE992211', 
      status: 'Active', kycStatus: 'Verified', totalSpent: 8200, lastRental: '2024-09-20',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100'
  },
  { 
      id: 'C-003', name: 'John Doe', email: 'j.doe@fraud.com', phone: '+1 555-0199', cin: 'Unknown', 
      status: 'Blacklisted', kycStatus: 'Missing', totalSpent: 0, lastRental: 'Never' 
  },
  { 
      id: 'C-004', name: 'Yassine B.', email: 'yassine@company.com', phone: '+212 661-112233', cin: 'GB19283', 
      status: 'Active', kycStatus: 'Pending', totalSpent: 1200, lastRental: '2024-10-25' 
  },
];

const INITIAL_BOOKINGS: Booking[] = [];

const REVIEWS_DATA: Review[] = [
  { id: 'R-1', clientName: 'Fatima Z.', rating: 5, comment: 'Car was pristine and delivery to airport was seamless. The concierge service made me feel like royalty.', date: '2 days ago', status: 'Published', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100' },
  { id: 'R-2', clientName: 'Mark S.', rating: 4, comment: 'Great car but GPS was in French only at start. Easily fixed but worth noting.', date: '1 week ago', status: 'Published', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100' },
  { id: 'R-3', clientName: 'Omar K.', rating: 5, comment: 'The GT Stradale is a beast. Best weekend of my life.', date: '2 weeks ago', status: 'Published', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100' },
];

const BLOG_DATA: BlogPost[] = [
  { 
      id: 'P-1', 
      title: 'Top 5 Road Trips from Marrakech', 
      category: 'Travel Guide', 
      views: 1250, 
      status: 'Published', 
      date: 'Oct 15, 2024',
      image: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&q=80&w=800',
      excerpt: 'Discover the Atlas Mountains and beyond with our curated routes for the adventurous driver.',
      readTime: '5 min read',
      author: { name: 'Admin', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100' },
  },
  { 
      id: 'P-2', 
      title: 'New Speed Limit Laws in Morocco 2025', 
      category: 'Legal', 
      views: 890, 
      status: 'Published', 
      date: 'Oct 10, 2024',
      image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800',
      excerpt: 'Stay informed about the latest traffic regulations updates coming into effect next year.',
      readTime: '4 min read',
      author: { name: 'Admin', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100' },
  },
  { 
      id: 'P-3', 
      title: 'The Rise of Electric Luxury', 
      category: 'Industry', 
      views: 450, 
      status: 'Draft', 
      date: 'Oct 28, 2024',
      image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800',
      excerpt: 'How EVs are redefining the standard of luxury transport in Northern Africa.',
      readTime: '6 min read',
      author: { name: 'Admin', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100' },
  },
];

// ── Contacts (messages) API mapper ──────────────────────────────────────────
const contactFromApi = (c: Record<string, any>): Message => ({
  id:          String(c.id),
  sender:      c.name  ?? 'Inconnu',
  email:       c.email ?? '',
  subject:     c.subject ?? '(sans sujet)',
  preview:     (c.message ?? '').slice(0, 120),
  fullMessage: c.message ?? '',
  time:        c.created_at ? new Date(c.created_at).toLocaleString('fr-MA') : '',
  createdAt:   c.created_at ?? '',
  unread:      !c.is_read,
  type:        (c.type === 'Emergency' || c.type === 'Support') ? c.type : 'Inquiry',
  avatar:      undefined,
  replyText:   c.reply_text ?? undefined,
  repliedAt:   c.replied_at ?? undefined,
  bookingId:   c.booking_id ? String(c.booking_id) : undefined,
});

// --- API MAPPER ---

// Maps a BookingResource JSON (from Laravel) to the local Booking shape.
const bookingFromApi = (b: Record<string, any>): Booking => {
  const capFirst = (s: string) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : 'Pending';
  const statusMap: Record<string, Booking['status']> = {
    pending: 'Pending', confirmed: 'Confirmed', active: 'Active',
    completed: 'Completed', cancelled: 'Cancelled',
  };
  return {
    id:            String(b.id),
    clientName:    b.user?.name   ?? 'Inconnu',
    // Use full_name (year make model) so it matches v.name built by carFromApi
    vehicleName:   b.car?.full_name
                   ?? (b.car ? `${b.car.year ?? ''} ${b.car.make ?? ''} ${b.car.model ?? ''}`.trim() : 'Inconnu'),
    startDate:     b.start_date?.slice(0, 10) ?? '',
    endDate:       b.end_date?.slice(0, 10)   ?? '',
    status:        statusMap[b.status?.toLowerCase()] ?? capFirst(b.status ?? 'pending') as Booking['status'],
    amount:        parseFloat(b.amount)  || 0,
    paymentStatus: (b.payment_status as Booking['paymentStatus']) ?? 'Unpaid',
    notes:         b.notes ?? '',
    clientId:      String(b.user_id),
    carId:         String(b.car_id),
    unitNumber:    b.unit_number ?? 1,
    pickupPointId:  b.pickup_point_id  ? Number(b.pickup_point_id)  : undefined,
    dropoffPointId: b.dropoff_point_id ? Number(b.dropoff_point_id) : undefined,
  };
};

// Maps a UserResource JSON (from Laravel) to the local Client shape.
const clientFromApi = (u: Record<string, any>): Client => ({
  id: String(u.id),
  name: u.name ?? '',
  email: u.email ?? '',
  phone: u.phone ?? '',
  cin: u.national_id ?? '',
  driverLicense: u.driver_license_number ?? '',
  driverLicenseExpiry: u.driver_license_expiry_date?.slice(0, 10) ?? '',
  status: (u.status as Client['status']) ?? 'Active',
  kycStatus: (u.kyc_status as Client['kycStatus']) ?? 'Missing',
  totalSpent: Number(u.total_spent ?? 0),
  lastRental: u.updated_at?.slice(0, 10) ?? 'Never',
  avatar: u.avatar ?? undefined,
  documents: {
    idCardFront: u.doc_id_front ?? undefined,
    idCardBack:  u.doc_id_back  ?? undefined,
    license:     u.doc_license  ?? undefined,
  },
});

// Maps a CarResource JSON object (from Laravel) to the local Vehicle shape.
const carFromApi = (c: Record<string, any>): Vehicle => ({
  id: String(c.id),
  name: (c.full_name as string) ?? `${c.make ?? ''} ${c.model ?? ''}`.trim(),
  make: c.make ?? '',
  model: c.model ?? '',
  year: c.year ?? new Date().getFullYear(),
  fuel_type: c.fuel_type ?? 'Essence',
  category: (c.category as Vehicle['category']) ?? 'Sedan',
  image: (c.image as string) ?? 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800',
  plate: c.plate ?? '',
  unitPlates: Array.isArray(c.unit_plates) ? c.unit_plates : [],
  branch: c.branch ?? '',
  status: (c.status as Vehicle['status']) ?? 'Available',
  driver: '-',
  fuel: c.fuel_level ?? 100,
  odometer: c.odometer ?? 0,
  pricePerDay: Number(c.daily_price ?? 0),
  documents: {
    insurance:       c.insurance_expiry        ?? '',
    visiteTechnique: c.visite_technique_expiry ?? '',
    vignette:        c.vignette_expiry         ?? '',
    carteGrise:      c.carte_grise_expiry      ?? '',
  },
  documentFiles: {
    insurance:       c.doc_insurance        ?? undefined,
    visiteTechnique: c.doc_visite_technique ?? undefined,
    vignette:        c.doc_vignette         ?? undefined,
    carteGrise:      c.doc_carte_grise      ?? undefined,
  },
  condition: (c.condition as Vehicle['condition']) ?? 'Excellent',
  location: { lat: c.latitude ?? 33.5731, lng: c.longitude ?? -7.5898 },
  quantity: Number(c.quantity ?? 1),
});

// --- HELPERS ---

const getDaysRemaining = (dateStr: string) => {
  const today = new Date();
  const expiry = new Date(dateStr);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getExpiryStatus = (dateStr: string) => {
    const days = getDaysRemaining(dateStr);
    if (days < 0) return { status: 'Expired', color: 'text-red-600 bg-red-100', icon: AlertCircle, label: 'Expired' };
    if (days <= 7) return { status: 'Critical', color: 'text-red-600 bg-red-100', icon: AlertCircle, label: `${days} Days` };
    if (days <= 15) return { status: 'Warning', color: 'text-orange-600 bg-orange-100', icon: AlertTriangle, label: `${days} Days` };
    if (days <= 30) return { status: 'Notice', color: 'text-yellow-600 bg-yellow-100', icon: AlertCircle, label: `${days} Days` };
    return { status: 'Valid', color: 'text-green-600 bg-green-100', icon: CheckCircle2, label: 'Valid' };
};

// --- MODAL COMPONENTS ---

interface ModalContainerProps {
  title: string;
  children?: React.ReactNode;
  onClose: () => void;
  width?: string;
}

const ModalContainer: React.FC<ModalContainerProps> = ({ title, children, onClose, width = "max-w-2xl" }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`bg-white dark:bg-[#0B1120] w-full ${width} rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10`}
        >
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/5">
                <h3 className="text-lg font-bold text-brand-navy dark:text-white font-space">{title}</h3>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {children}
            </div>
        </motion.div>
    </div>
);

type SettingsSubTab = 'general' | 'notifications' | 'security' | 'team' | 'demo' | 'roles' | 'pickup-points' | 'contracts';
const VALID_SETTINGS_TABS: SettingsSubTab[] = ['general','notifications','security','team','demo','roles','pickup-points','contracts'];

type AdminTab = 'overview' | 'fleet' | 'clients' | 'bookings' | 'gps' | 'reviews' | 'blog' | 'messages' | 'settings' | 'analytics' | 'infractions';
const VALID_ADMIN_TABS: AdminTab[] = ['overview','fleet','clients','bookings','gps','reviews','blog','messages','settings','analytics','infractions'];

// ─── Infraction type catalogue ───────────────────────────────────────────────
const INF_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'Radar',             label: 'Radar / Excès de vitesse' },
  { value: 'Speeding',          label: 'Vitesse excessive' },
  { value: 'Parking',           label: 'Stationnement interdit' },
  { value: 'Police Check',      label: 'Contrôle routier' },
  { value: 'insurance_expired', label: 'Assurance expirée' },
  { value: 'visite_expired',    label: 'Visite technique expirée' },
  { value: 'seatbelt',          label: 'Non-port de ceinture' },
  { value: 'phone',             label: 'Usage téléphone au volant' },
  { value: 'overtaking',        label: 'Dépassement dangereux' },
  { value: 'missing_docs',      label: 'Documents manquants' },
  { value: 'unpaid_toll',       label: 'Péage impayé' },
];

const INF_TYPE_META: Record<string, { label: string; color: string }> = {
  'Radar':             { label: 'Radar',         color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  'Speeding':          { label: 'Vitesse',        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  'Parking':           { label: 'Parking',        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  'Police Check':      { label: 'Contrôle',       color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  'insurance_expired': { label: 'Assurance',      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  'visite_expired':    { label: 'Visite Tech.',   color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  'seatbelt':          { label: 'Ceinture',       color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  'phone':             { label: 'Téléphone',      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  'overtaking':        { label: 'Dépassement',    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  'missing_docs':      { label: 'Documents',      color: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300' },
  'unpaid_toll':       { label: 'Péage',          color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

const blankInfForm = { type: 'Radar', date: '', location: '', amount: '', due_date: '', notification_ref: '', status: 'Unpaid', notes: '' };

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isDark, toggleTheme, onNavigate, onLogout, currentUser }) => {
  const { tab, subtab } = useParams<{ tab?: string; subtab?: string }>();
  const adminNav = useRouterNavigate();
  const activeTab: AdminTab = (tab && VALID_ADMIN_TABS.includes(tab as AdminTab)) ? (tab as AdminTab) : 'overview';
  const setActiveTab = (t: AdminTab) => adminNav(`/admin/${t}`);
  const settingsTab: SettingsSubTab = (subtab && VALID_SETTINGS_TABS.includes(subtab as SettingsSubTab)) ? (subtab as SettingsSubTab) : 'general';
  const setSettingsTab = (t: SettingsSubTab) => adminNav(`/admin/settings/${t}`);
  const [selectedItem, setSelectedItem] = useState<any | null>(null); 
  const [modalType, setModalType] = useState<string | null>(null);
  
  // Modal Tab State for Vehicles & Clients
  const [vehicleModalTab, setVehicleModalTab] = useState<'details' | 'documents' | 'infractions'>('details');
  const [clientModalTab, setClientModalTab] = useState<'profile' | 'kyc'>('profile');
  const [imageInputType, setImageInputType] = useState<'url' | 'upload'>('url');
  /** Per-unit plates for vehicle form (index 0 = unit #1) */
  const [modalUnitPlates, setModalUnitPlates] = useState<string[]>(['']);
  /** Current quantity value in vehicle form (controls how many plate inputs are shown) */
  const [modalQty, setModalQty] = useState<number>(1);
  /** Per-document selected file names, keyed by backend field name (doc_insurance etc.) */
  const [docFileNames, setDocFileNames] = useState<Record<string, string>>({});
  /** Infractions loaded for current vehicle in modal */
  const [modalInfractions, setModalInfractions] = useState<Infraction[]>([]);
  const [modalInfLoading, setModalInfLoading] = useState(false);
  const [infFormVisible, setInfFormVisible] = useState(false);
  const [infFormSaving, setInfFormSaving] = useState(false);
  const [infForm, setInfForm] = useState<typeof blankInfForm>({ ...blankInfForm });

  // --- BOOKING STATE ---
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState('All');
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);
  // Booking form reactive fields — car + dates drive auto-amount
  const [bfCarId,    setBfCarId]    = useState('');
  const [bfStart,    setBfStart]    = useState('');
  const [bfEnd,      setBfEnd]      = useState('');
  const [bfAmount,   setBfAmount]   = useState('');
  const [bfPickupId,  setBfPickupId]  = useState<number | ''>('');
  const [bfDropoffId, setBfDropoffId] = useState<number | ''>('');
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  /** Booked periods for the selected vehicle — drives the availability calendar */
  const [bfBookedPeriods, setBfBookedPeriods] = useState<{ total_units: number; booked_periods: { start: string; end: string }[] } | null>(null);
  /** Conflict suggestion from the backend (422 with suggested_slot) */
  const [bfConflict, setBfConflict] = useState<{ message: string; suggestedStart: string; suggestedEnd: string } | null>(null);
  /** True while the booking save API call is in-flight */
  const [isSaving,   setIsSaving]   = useState(false);

  // --- VEHICLE STATE ---
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('All');

  // --- CLIENT STATE ---
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientSearch, setClientSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('All');

  // --- MESSAGES STATE ---
  const [messages, setMessages]           = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  /** Email used to jump to a client's thread from the client profile */
  const [contactThreadEmail, setContactThreadEmail] = useState<string | null>(null);

  const loadMessages = () => {
    setMessagesLoading(true);
    adminContactsApi.list({ per_page: 200 })
      .then((res: any) => setMessages((res.data ?? []).map((c: any) => contactFromApi(c))))
      .catch(err => console.error('[Messages] Failed to load:', err))
      .finally(() => setMessagesLoading(false));
  };

  // --- REVIEWS STATE ---
  const [reviews, setReviews] = useState<Review[]>(REVIEWS_DATA);

  // --- BLOG STATE ---
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(BLOG_DATA);

  // --- CONTRACT STATE ---
  const [contractBooking, setContractBooking] = useState<Booking | null>(null);
  const [companyContractSettings, setCompanyContractSettings] = useState<ContractCompanySettings>(() => loadCompanySettings());

  // --- NOTIFICATION STATE ---
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'New Booking Request', description: 'Karim B. requested Ferrari SF90', type: 'booking', timestamp: '2 mins ago', read: false },
    { id: '2', title: 'Maintenance Alert', description: 'Mercedes G63 due for service', type: 'alert', timestamp: '1 hour ago', read: false },
    { id: '3', title: 'System Update', description: 'Patch v2.4.1 installed successfully', type: 'system', timestamp: 'Yesterday', read: true },
  ]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Load vehicles from backend on mount
  useEffect(() => {
    setVehiclesLoading(true);
    api.get<{ data: unknown[] }>('/cars')
      .then(resp => {
        setVehicles((resp.data ?? []).map(c => carFromApi(c as Record<string, any>)));
      })
      .catch(err => console.error('[Fleet] Failed to load vehicles:', err))
      .finally(() => setVehiclesLoading(false));
  }, []);

  // Load clients from backend on mount
  useEffect(() => {
    setClientsLoading(true);
    adminClientsApi.list({ per_page: 100 })
      .then((res: any) => setClients((res.data ?? []).map((u: any) => clientFromApi(u))))
      .catch(err => console.error('[Clients] Failed to load:', err))
      .finally(() => setClientsLoading(false));
  }, []);

  // Load messages from backend when messages tab is active
  useEffect(() => {
    if (activeTab === 'messages') loadMessages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Load bookings from backend on mount
  useEffect(() => {
    setBookingsLoading(true);
    adminBookingsApi.list({ per_page: 200 })
      .then((res: any) => setBookings((res.data ?? []).map((b: any) => bookingFromApi(b))))
      .catch(err => console.error('[Bookings] Failed to load:', err))
      .finally(() => setBookingsLoading(false));
  }, []);

  // Load pickup points once (for booking form dropdowns)
  useEffect(() => {
    adminPickupPointsApi.list()
      .then((res: any) => setPickupPoints(Array.isArray(res) ? res : (res.data ?? [])))
      .catch(err => console.error('[PickupPoints] Failed to load:', err));
  }, []);

  // Sync booking form fields whenever the modal opens or the edited item changes
  useEffect(() => {
    if (modalType !== 'booking_form') return;
    setBfCarId(selectedItem?.carId ?? '');
    setBfStart(selectedItem?.startDate ?? '');
    setBfEnd(selectedItem?.endDate ?? '');
    setBfAmount(selectedItem?.amount ? String(selectedItem.amount) : '');
    setBfPickupId(selectedItem?.pickupPointId ?? '');
    setBfDropoffId(selectedItem?.dropoffPointId ?? '');
    setBfConflict(null); // clear any previous conflict on modal re-open
    setBfBookedPeriods(null); // reset calendar until vehicle fetch completes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalType, selectedItem?.id]);

  // Fetch booked periods for the selected vehicle so the availability calendar reflects real data
  useEffect(() => {
    if (modalType !== 'booking_form') return;
    const carId = bfCarId || (selectedItem?.carId ?? '');
    if (!carId) { setBfBookedPeriods(null); return; }
    setBfBookedPeriods(null);
    carsApi.bookedPeriods(carId)
      .then(data => setBfBookedPeriods(data))
      .catch(() => setBfBookedPeriods({ total_units: 1, booked_periods: [] }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalType, bfCarId, selectedItem?.carId]);

  // Auto-calculate amount: Prix/Jour × nombre de jours
  useEffect(() => {
    if (modalType !== 'booking_form' || !bfStart || !bfEnd) return;
    setBfConflict(null); // clear conflict whenever inputs change
    const vehicle = vehicles.find(v => String(v.id) === String(bfCarId));
    if (!vehicle?.pricePerDay) return;
    const ms = new Date(bfEnd).getTime() - new Date(bfStart).getTime();
    if (ms < 0) return;
    const days = Math.floor(ms / 86400000) + 1;
    setBfAmount(String(vehicle.pricePerDay * days));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bfCarId, bfStart, bfEnd]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Simulate real-time notification
  useEffect(() => {
    const timer = setTimeout(() => {
      if (notifications.length < 4) { // Only add if we haven't already
        setNotifications(prev => [
            { 
                id: Date.now().toString(), 
                title: 'Payment Received', 
                description: 'Deposit received for Booking #B-292', 
                type: 'system', 
                timestamp: 'Just now', 
                read: false 
            },
            ...prev
        ]);
      }
    }, 10000); // 10 seconds
    return () => clearTimeout(timer);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;

  // Stats
  const totalRevenue = bookings.reduce((acc, curr) => acc + curr.amount, 0);
  const activeRentals = bookings.filter(b => b.status === 'Active').length;
  const pendingRequests = bookings.filter(b => b.status === 'Pending').length;
  
  // Doc Expiring Stats
  const expiringDocsCount = vehicles.reduce((acc, v) => {
      const dates = Object.values(v.documents) as string[];
      const hasExpiring = dates.some(d => getDaysRemaining(d) <= 30);
      return hasExpiring ? acc + 1 : acc;
  }, 0);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      onNavigate('home');
    }
  };

  const openModal = (type: string, item: any) => {
    setModalType(type);
    setSelectedItem(item);
    setVehicleModalTab('details'); // Reset tab
    setClientModalTab('profile'); // Reset tab
    setImageInputType('url');
    setDocFileNames({});
    setModalInfractions([]);
    setInfFormVisible(false);
    setInfForm({ ...blankInfForm });
    // Initialise per-unit plate state when opening the vehicle form
    if (type === 'vehicle_form') {
      const qty = Math.max(1, Number(item?.quantity ?? 1));
      setModalQty(qty);
      const existing: string[] = Array.isArray(item?.unitPlates) && item.unitPlates.length > 0
        ? item.unitPlates
        : item?.plate ? [item.plate] : [''];
      // Pad / trim to match qty
      const plates = Array.from({ length: qty }, (_, i) => existing[i] ?? '');
      setModalUnitPlates(plates);
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedItem(null);
    setDocFileNames({});
    setModalInfractions([]);
    setInfFormVisible(false);
  };

  // --- INFRACTION HANDLERS -----------------------------------------------

  // Load infractions whenever the vehicle form modal opens for an existing car
  useEffect(() => {
    if (modalType !== 'vehicle_form' || !selectedItem?.id) {
      setModalInfractions([]);
      return;
    }
    setModalInfLoading(true);
    adminFinesApi.listByCar(selectedItem.id)
      .then((res: any) => {
        const arr: Infraction[] = (res.data ?? []).map((f: any) => ({
          id: String(f.id),
          car_id: f.vehicle_id ?? f.car_id,
          driver_name: f.driver_name ?? '',
          date: f.date ?? '',
          type: f.type as InfractionType,
          amount: Number(f.amount ?? 0),
          location: f.location ?? '',
          status: (f.status ?? 'Unpaid') as Infraction['status'],
          due_date: f.due_date ?? '',
          notification_ref: f.notification_ref ?? '',
          notes: f.notes ?? '',
        }));
        setModalInfractions(arr);
      })
      .catch(() => setModalInfractions([]))
      .finally(() => setModalInfLoading(false));
  }, [modalType, selectedItem?.id]);

  const handleAddInfraction = async () => {
    if (!selectedItem?.id) return;
    if (!infForm.date || !infForm.amount) return;
    setInfFormSaving(true);
    try {
      const res: any = await adminFinesApi.create({
        car_id:           selectedItem.id,
        driver_name:      'Conducteur',
        date:             infForm.date,
        due_date:         infForm.due_date || null,
        type:             infForm.type,
        amount:           parseFloat(infForm.amount) || 0,
        location:         infForm.location || null,
        status:           infForm.status,
        notification_ref: infForm.notification_ref || null,
        notes:            infForm.notes || null,
      });
      const f = res.fine ?? res;
      const created: Infraction = {
        id:               String(f.id ?? Date.now()),
        car_id:           selectedItem.id,
        driver_name:      'Conducteur',
        date:             infForm.date,
        type:             infForm.type as InfractionType,
        amount:           parseFloat(infForm.amount) || 0,
        location:         infForm.location,
        status:           infForm.status as Infraction['status'],
        due_date:         infForm.due_date,
        notification_ref: infForm.notification_ref,
        notes:            infForm.notes,
      };
      setModalInfractions(prev => [created, ...prev]);
      setInfForm({ ...blankInfForm });
      setInfFormVisible(false);
    } catch (err: any) {
      alert(err?.message ?? "Erreur lors de l'enregistrement de l'infraction.");
    } finally {
      setInfFormSaving(false);
    }
  };

  const handleMarkInfPaid = async (id: string) => {
    try {
      await adminFinesApi.update(id, { status: 'Paid' });
      setModalInfractions(prev => prev.map(i => i.id === id ? { ...i, status: 'Paid' } : i));
    } catch { /* silent */ }
  };

  const handleDeleteInfraction = async (id: string) => {
    if (!window.confirm('Supprimer cette infraction ?')) return;
    try {
      await adminFinesApi.delete(id);
      setModalInfractions(prev => prev.filter(i => i.id !== id));
    } catch { /* silent */ }
  };

  // --- REVIEW HANDLERS ---
  const handleHideReview = (id: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'Hidden' ? 'Published' : 'Hidden' } : r));
  };

  // --- BLOG HANDLERS ---
  const handleSaveBlogPost = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    let imageUrl = formData.get('image')?.toString() || '';
    // If upload mode is selected and a file is present, use it (mock with object URL)
    if (imageInputType === 'upload') {
        const file = formData.get('image_file') as File;
        if (file && file.size > 0) {
            imageUrl = URL.createObjectURL(file);
        } else if (selectedItem?.image) {
            // Keep existing image if no new file uploaded
            imageUrl = selectedItem.image;
        }
    }

    const newPost: BlogPost = {
      id: selectedItem?.id || `P-${Math.floor(Math.random() * 9000) + 1000}`,
      title: formData.get('title')?.toString() || '',
      category: formData.get('category')?.toString() || 'News',
      views: selectedItem?.views || 0,
      status: (formData.get('status')?.toString() as any) || 'Draft',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      image: imageUrl || 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800',
      excerpt: formData.get('excerpt')?.toString() || '',
      readTime: '5 min read',
      author: {
        name: 'Admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100'
      }
    };

    if (selectedItem) {
      setBlogPosts(prev => prev.map(p => p.id === selectedItem.id ? newPost : p));
    } else {
      setBlogPosts(prev => [newPost, ...prev]);
    }
    closeModal();
  };

  // --- CONTRACT HANDLERS ---
  const handleOpenContract = (booking: Booking) => {
    // Reload settings in case user updated them in Settings tab
    setCompanyContractSettings(loadCompanySettings());
    setContractBooking(booking);
  };

  // --- CRUD HANDLERS FOR BOOKINGS ---

  const handleBookingDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette réservation ?')) return;
    try {
      await adminBookingsApi.delete(id);
      setBookings(prev => prev.filter(b => b.id !== id));
      setSelectedBookingIds(prev => prev.filter(pid => pid !== id));
    } catch (err: any) {
      console.error('[Bookings] delete failed:', err);
      alert(err?.message ?? 'Erreur lors de la suppression.');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Supprimer ${selectedBookingIds.length} réservation(s) ?`)) return;
    try {
      await Promise.all(selectedBookingIds.map(id => adminBookingsApi.delete(id)));
      setBookings(prev => prev.filter(b => !selectedBookingIds.includes(b.id)));
      setSelectedBookingIds([]);
    } catch (err: any) {
      console.error('[Bookings] bulk delete failed:', err);
      alert(err?.message ?? 'Erreur lors de la suppression.');
    }
  };

  const toggleBookingSelection = (id: string) => {
    setSelectedBookingIds(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return; // guard against double-submit
    const form   = e.target as HTMLFormElement;
    const fd     = new FormData(form);
    const g      = (k: string) => fd.get(k)?.toString() ?? '';
    const amount = g('amount') ? Number(g('amount')) : undefined;
    setIsSaving(true);
    try {
      let saved: Booking;
      if (selectedItem) {
        const res = await adminBookingsApi.update(selectedItem.id, {
          start_date:       g('startDate')     || undefined,
          end_date:         g('endDate')       || undefined,
          status:           g('status').toLowerCase() || undefined,
          payment_status:   g('paymentStatus') || undefined,
          amount,
          notes:            g('notes')         || undefined,
          pickup_point_id:  bfPickupId  !== '' ? bfPickupId  : null,
          dropoff_point_id: bfDropoffId !== '' ? bfDropoffId : null,
        }) as any;
        saved = bookingFromApi(res.booking);
        setBookings(prev => prev.map(b => b.id === selectedItem.id ? saved : b));
      } else {
        const res = await adminBookingsApi.create({
          user_id:          g('clientId'),
          car_id:           g('carId'),
          start_date:       g('startDate'),
          end_date:         g('endDate'),
          status:           g('status').toLowerCase() || 'confirmed',
          payment_status:   g('paymentStatus') || 'Unpaid',
          amount,
          notes:            g('notes') || undefined,
          pickup_point_id:  bfPickupId  !== '' ? bfPickupId  : undefined,
          dropoff_point_id: bfDropoffId !== '' ? bfDropoffId : undefined,
        }) as any;
        saved = bookingFromApi(res.booking);
        setBookings(prev => [saved, ...prev]);
      }
      closeModal();
    } catch (err: any) {
      console.error('[Bookings] save failed:', err);
      if (err?.suggested_slot?.start) {
        setBfConflict({
          message:        err.message ?? 'Toutes les unités sont réservées.',
          suggestedStart: err.suggested_slot.start,
          suggestedEnd:   err.suggested_slot.end,
        });
        return; // keep the modal open
      }
      const msgs = err?.errors
        ? Object.values(err.errors as Record<string, string[]>).flat().join('\n')
        : err?.message;
      alert(msgs ?? 'Erreur inattendue.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.clientName.toLowerCase().includes(bookingSearch.toLowerCase()) || 
      b.id.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.vehicleName.toLowerCase().includes(bookingSearch.toLowerCase());
    
    const matchesFilter = bookingFilter === 'All' || b.status.toUpperCase() === bookingFilter.toUpperCase();
    
    return matchesSearch && matchesFilter;
  });

  // --- CRUD HANDLERS FOR VEHICLES ---

  const handleVehicleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce véhicule de la flotte ?')) return;
    try {
      await adminCarsApi.delete(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
    } catch (err: any) {
      console.error('[Fleet] delete failed:', err);
      alert(err?.message ?? 'Erreur lors de la suppression.');
    }
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const raw = new FormData(form);
    const statusVal = raw.get('status')?.toString() ?? 'Available';

    // Build FormData with backend field names
    const fd = new FormData();
    fd.set('make',        raw.get('make')?.toString()      ?? '');
    fd.set('model',       raw.get('model')?.toString()     ?? '');
    fd.set('year',        raw.get('year')?.toString()      ?? String(new Date().getFullYear()));
    fd.set('fuel_type',   raw.get('fuel_type')?.toString() ?? 'Essence');
    fd.set('category',    raw.get('category')?.toString()  ?? 'Sedan');
    fd.set('plate',       modalUnitPlates[0] ?? '');
    fd.set('branch',      raw.get('branch')?.toString()    ?? 'Casablanca');
    // Per-unit plates — send as unit_plates[] array
    modalUnitPlates.forEach(p => fd.append('unit_plates[]', p));
    fd.set('status',      statusVal);
    fd.set('availability', statusVal === 'Available' ? 'available' : 'unavailable');
    fd.set('odometer',    raw.get('odometer')?.toString()    ?? '0');
    fd.set('fuel_level',  raw.get('fuel')?.toString()        ?? '100');
    fd.set('daily_price', raw.get('pricePerDay')?.toString() ?? '0');
    fd.set('quantity',    String(modalQty));
    fd.set('condition',   selectedItem?.condition           ?? 'Excellent');
    fd.set('latitude',    String(selectedItem?.location?.lat ?? 33.5731));
    fd.set('longitude',   String(selectedItem?.location?.lng ?? -7.5898));

    // Image: only file uploads reach the backend; URL mode is display-only
    if (imageInputType === 'upload') {
      const file = raw.get('image_file') as File;
      if (file && file.size > 0) fd.set('image', file);
    }

    // Document expiry dates (inputs are named expiry_* to avoid clash with file fields)
    fd.set('insurance_expiry',        raw.get('expiry_insurance')?.toString() ?? '');
    fd.set('visite_technique_expiry', raw.get('expiry_visite')?.toString()    ?? '');
    fd.set('vignette_expiry',         raw.get('expiry_vignette')?.toString()  ?? '');
    fd.set('carte_grise_expiry',      raw.get('expiry_carte')?.toString()     ?? '');

    // Document file uploads (mimes: pdf, jpg, jpeg, png — max 4 MB)
    for (const field of ['doc_insurance', 'doc_visite_technique', 'doc_vignette', 'doc_carte_grise'] as const) {
      const file = raw.get(field) as File | null;
      if (file && file.size > 0) fd.set(field, file);
    }

    try {
      const respData: any = selectedItem
        ? await adminCarsApi.update(selectedItem.id, fd)
        : await adminCarsApi.create(fd);

      // Backend returns { message, car } — not { data }
      const saved = carFromApi(respData.car ?? respData);
      if (selectedItem) {
        setVehicles(prev => prev.map(v => v.id === selectedItem.id ? saved : v));
      } else {
        setVehicles(prev => [saved, ...prev]);
      }
      closeModal();
    } catch (err: any) {
      console.error('[Fleet] save failed:', err);
      alert(err?.message ?? 'Erreur lors de la sauvegarde du véhicule.');
    }
  };

  const filteredVehicles = vehicles.filter(v => {
      const matchesSearch = 
          v.name.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
          v.plate.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
          v.id.toLowerCase().includes(vehicleSearch.toLowerCase());
      
      const matchesFilter = vehicleFilter === 'All' || v.status === vehicleFilter;
      return matchesSearch && matchesFilter;
  });

  // --- CRUD HANDLERS FOR CLIENTS ---

  const handleClientDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce client ? Cette action est irréversible.')) return;
    try {
      await adminClientsApi.delete(id);
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('[Clients] Delete failed:', err);
      alert('Erreur lors de la suppression du client.');
    }
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    // Strip empty strings from optional fields so Laravel's nullable+date+unique
    // rules don't reject them (API routes don't apply ConvertEmptyStringsToNull).
    const optionalFields = [
      'phone', 'national_id', 'driver_license_number',
      'driver_license_expiry_date', 'kyc_status',
    ];
    optionalFields.forEach(key => {
      if (formData.get(key) === '') formData.delete(key);
    });
    // Remove empty file inputs (no file selected)
    ['avatar', 'doc_id_front', 'doc_id_back', 'doc_license'].forEach(key => {
      const file = formData.get(key);
      if (file instanceof File && file.size === 0) formData.delete(key);
    });

    try {
      let saved: any;
      if (selectedItem) {
        // Update: POST with _method=PUT (to allow file uploads)
        const res = await adminClientsApi.update(selectedItem.id, formData) as any;
        saved = clientFromApi(res.client);
        setClients(prev => prev.map(c => c.id === selectedItem.id ? saved : c));
      } else {
        // Create: requires password field
        const res = await adminClientsApi.create(formData) as any;
        saved = clientFromApi(res.client);
        setClients(prev => [saved, ...prev]);
      }
      closeModal();
    } catch (err: any) {
      console.error('[Clients] Save failed:', err);
      const msg = err?.errors
        ? Object.values(err.errors as Record<string, string[]>).flat().join('\n')
        : err?.message ?? 'Erreur lors de la sauvegarde.';
      alert(msg);
    }
  };



  const TabButton = ({ id, icon: Icon, label, alertCount }: { id: typeof activeTab, icon: any, label: string, alertCount?: number }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
        activeTab === id 
          ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' 
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${activeTab !== id && 'group-hover:text-brand-blue transition-colors'}`} />
        <span className="font-bold text-sm">{label}</span>
      </div>
      {alertCount && alertCount > 0 && (
        <span className="bg-brand-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
            {alertCount}
        </span>
      )}
    </button>
  );

  return (
    <div className={`h-screen w-full flex overflow-hidden ${isDark ? 'bg-brand-navy' : 'bg-slate-100'} p-4 gap-4 transition-colors duration-500`}>
         
         {/* Sidebar */}
         <div className="w-64 flex-shrink-0 flex flex-col bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 p-4 shadow-xl z-20 print:hidden">
             <div className="px-4 py-4 mb-4 border-b border-slate-100 dark:border-white/5">
                 <h2 className="text-xl font-bold font-space text-brand-navy dark:text-white tracking-tight">ATLAS <span className="text-brand-teal">FLEET</span></h2>
                 <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Admin Maroc v3.0</p>
             </div>

             <nav className="space-y-1 flex-grow overflow-y-auto custom-scrollbar">
                <TabButton id="overview" icon={LayoutDashboard} label="Tableau de Bord" />
                <TabButton id="analytics" icon={BarChart3} label="Analytique & Rapports" />
                <TabButton id="fleet" icon={Car} label="Flotte & Inventaire" />
                <TabButton id="infractions" icon={ShieldAlert} label="Infractions" />
                <TabButton id="bookings" icon={CalendarRange} label="Réservations" alertCount={pendingRequests} />
                <TabButton id="clients" icon={Users} label="Clients (KYC)" />
                <TabButton id="gps" icon={MapIcon} label="Suivi GPS en Direct" />
                <TabButton id="messages" icon={MessageSquare} label="Messages" alertCount={messages.filter(m => m.unread).length} />
                <TabButton id="reviews" icon={Star} label="Avis & Réputation" />
                <TabButton id="blog" icon={PenTool} label="Blog & Contenu" />
             </nav>

             <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
                <button 
                    onClick={() => adminNav('/admin/settings')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-brand-blue/10 text-brand-blue font-bold shadow-sm' : 'text-slate-500 hover:text-brand-navy dark:hover:text-white'}`}
                >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium text-sm">Paramètres Système</span>
                </button>
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-brand-red hover:bg-brand-red/10 rounded-xl transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-bold text-sm">Déconnexion</span>
                </button>
             </div>
         </div>

         {/* Main Content Area */}
         <div className="flex-grow bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden relative flex flex-col z-10 print:w-full print:border-none print:shadow-none print:bg-white print:dark:bg-white print:text-black">
            
            {/* Header / Topbar */}
            {activeTab !== 'gps' && (
                <div className="h-16 border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-6 bg-slate-50/50 dark:bg-white/[0.02] print:hidden">
                   <div className="flex items-center gap-4">
                      <h3 className="text-lg font-bold text-brand-navy dark:text-white uppercase tracking-wider">
                         {{
                            overview: "Vue d'ensemble",
                            analytics: "Analytique",
                            fleet: "Gestion de Flotte",
                            infractions: "Infractions",
                            bookings: "Réservations",
                            clients: "Gestion Clients",
                            gps: "Suivi GPS",
                            messages: "Messagerie",
                            reviews: "Avis Clients",
                            blog: "Gestion de Contenu",
                            settings: "Paramètres"
                          }[activeTab]}
                      </h3>
                   </div>
                   <div className="flex items-center gap-4">
                      {/* Notifications */}
                      <div className="relative" ref={notificationRef}>
                          <button 
                             onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                             className="p-2 relative rounded-full text-brand-navy dark:text-slate-400 hover:bg-brand-blue/10 dark:hover:bg-white/10 hover:text-brand-blue dark:hover:text-white transition-all"
                           >
                             <Bell className="w-5 h-5" />
                             {unreadCount > 0 && (
                               <span className="absolute -top-1 -right-1 bg-brand-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white dark:border-[#0B1120]">
                                 {unreadCount}
                               </span>
                             )}
                           </button>

                           {/* Notification Dropdown */}
                           <AnimatePresence>
                             {isNotificationOpen && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                                >
                                   <div className="p-3 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                                      <h4 className="font-bold text-sm text-brand-navy dark:text-white">Notifications</h4>
                                      {unreadCount > 0 && (
                                        <button 
                                          onClick={markAllAsRead}
                                          className="text-[10px] font-bold text-brand-blue hover:text-brand-blue/80"
                                        >
                                          Tout marquer comme lu
                                        </button>
                                      )}
                                   </div>
                                   <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                      {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-slate-400">
                                           <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                           <p className="text-xs">Aucune notification</p>
                                        </div>
                                      ) : (
                                        notifications.map(notification => (
                                          <div 
                                            key={notification.id}
                                            onClick={() => markAsRead(notification.id)}
                                            className={`p-3 border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer relative ${!notification.read ? 'bg-blue-50/30 dark:bg-blue-500/5' : ''}`}
                                          >
                                             <div className="flex items-start gap-3">
                                                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notification.read ? 'bg-brand-red' : 'bg-transparent'}`}></div>
                                                <div>
                                                   <h5 className={`text-sm font-bold ${!notification.read ? 'text-brand-navy dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                                     {notification.title}
                                                   </h5>
                                                   <p className="text-xs text-slate-500 dark:text-slate-500 line-clamp-2 mt-0.5">
                                                     {notification.description}
                                                   </p>
                                                   <span className="text-[10px] text-slate-400 mt-1 block">
                                                     {notification.timestamp}
                                                   </span>
                                                </div>
                                             </div>
                                          </div>
                                        ))
                                      )}
                                   </div>
                                   <div className="p-2 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 text-center">
                                      <button onClick={() => setActiveTab('messages')} className="text-xs font-bold text-brand-blue hover:text-brand-navy dark:hover:text-white transition-colors">
                                        Voir toutes les notifications
                                      </button>
                                   </div>
                                </motion.div>
                             )}
                           </AnimatePresence>
                      </div>

                      <button 
                         onClick={toggleTheme}
                         className="p-2 rounded-full text-brand-navy dark:text-slate-400 hover:bg-brand-blue/10 dark:hover:bg-white/10 hover:text-brand-blue dark:hover:text-white transition-all"
                       >
                         {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                       </button>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-teal/10 rounded-full">
                         <div className="w-2 h-2 bg-brand-teal rounded-full animate-pulse"></div>
                         <span className="text-xs font-bold text-brand-teal uppercase">Casablanca HQ</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-brand-navy dark:bg-white flex items-center justify-center text-white dark:text-brand-navy font-bold text-xs">
                         AD
                      </div>
                   </div>
                </div>
            )}

            {/* Content Body */}
            <div className={`flex-grow ${activeTab === 'gps' ? 'p-0' : 'p-6 overflow-y-auto custom-scrollbar'} relative`}>
               
               {/* --- OVERVIEW TAB --- */}
               {activeTab === 'overview' && (
                  <DashboardOverview 
                    totalRevenue={totalRevenue}
                    activeRentals={activeRentals}
                    pendingRequests={pendingRequests}
                    setActiveTab={setActiveTab}
                  />
               )}

               {/* --- ANALYTICS TAB --- */}
               {activeTab === 'analytics' && (
                  <AnalyticsManagement />
               )}

               {/* --- BOOKINGS TAB (FULL CRUD) --- */}
               {activeTab === 'bookings' && (
                  bookingsLoading ? (
                    <div className="flex items-center justify-center h-64 gap-3 text-slate-400">
                      <div className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-medium">Chargement des réservations…</span>
                    </div>
                  ) : (
                  <BookingManagement 
                      bookings={bookings}
                      vehicles={vehicles}
                      bookingSearch={bookingSearch}
                      setBookingSearch={setBookingSearch}
                      bookingFilter={bookingFilter}
                      setBookingFilter={setBookingFilter}
                      selectedBookingIds={selectedBookingIds}
                      setSelectedBookingIds={setSelectedBookingIds}
                      handleBulkDelete={handleBulkDelete}
                      openModal={openModal}
                      handleBookingDelete={handleBookingDelete}
                      handleOpenContract={handleOpenContract}
                  />
                  )
               )}

               {/* --- FLEET TAB (FULL CRUD) --- */}
               {activeTab === 'fleet' && (
                  vehiclesLoading ? (
                    <div className="flex items-center justify-center h-64 gap-3 text-slate-400">
                      <div className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-medium">Chargement de la flotte…</span>
                    </div>
                  ) : (
                  <FleetManagement 
                      vehicles={vehicles}
                      vehicleSearch={vehicleSearch}
                      setVehicleSearch={setVehicleSearch}
                      vehicleFilter={vehicleFilter}
                      setVehicleFilter={setVehicleFilter}
                      openModal={openModal}
                      handleDelete={handleVehicleDelete}
                  />
                  )
               )}

               {/* --- CLIENTS & KYC TAB --- */}
               {activeTab === 'clients' && (
                  clientsLoading ? (
                    <div className="flex items-center justify-center h-64 gap-3 text-slate-400">
                      <div className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-medium">Chargement des clients…</span>
                    </div>
                  ) : (
                  <ClientManagement 
                      clients={clients}
                      clientSearch={clientSearch}
                      setClientSearch={setClientSearch}
                      clientFilter={clientFilter}
                      setClientFilter={setClientFilter}
                      openModal={openModal}
                      handleDelete={handleClientDelete}
                      onContact={(client) => {
                        setContactThreadEmail(client.email);
                        setActiveTab('messages');
                      }}
                  />
                  )
               )}

               {/* --- GPS TRACKING TAB (LIVE SIMULATION) --- */}
               {activeTab === 'gps' && (
                  <GPSManagement />
               )}

               {/* --- MESSAGES TAB --- */}
               {activeTab === 'messages' && (
                  <MessageManagement
                    messages={messages}
                    isLoading={messagesLoading}
                    onRefresh={loadMessages}
                    initialEmail={contactThreadEmail ?? undefined}
                    onReply={async (id, text) => {
                      await adminContactsApi.reply(id, text);
                      setMessages(prev => prev.map(m =>
                        m.id === id ? { ...m, replyText: text, repliedAt: new Date().toISOString() } : m
                      ));
                    }}
                    onDelete={async (id) => {
                      await adminContactsApi.delete(id);
                      setMessages(prev => prev.filter(m => m.id !== id));
                    }}
                    onToggleRead={async (id) => {
                      await adminContactsApi.toggleRead(id);
                      setMessages(prev => prev.map(m =>
                        m.id === id ? { ...m, unread: !m.unread } : m
                      ));
                    }}
                  />
               )}


               {/* --- REVIEWS TAB --- */}
               {activeTab === 'reviews' && (
                  <ReviewManagement 
                      reviews={reviews} 
                      openModal={openModal} 
                      toggleReviewVisibility={handleHideReview} 
                  />
               )}

               {/* --- BLOG TAB --- */}
               {activeTab === 'blog' && (
                  <ContentManagement 
                      blogPosts={blogPosts} 
                      openModal={openModal} 
                  />
               )}

               {/* --- INFRACTIONS TAB --- */}
               {activeTab === 'infractions' && (
                  <InfractionsManagement
                    vehicles={vehicles.map(v => ({ id: v.id, name: v.name, plate: v.plate }))}
                  />
               )}


               {/* --- SETTINGS TAB --- */}
               {activeTab === 'settings' && (
                  <SettingsManagement activeTab={settingsTab} onTabChange={setSettingsTab} />
               )}

            </div>
         </div>

         {/* --- DETAIL MODALS (Action Overlay) --- */}
         <AnimatePresence>
             {/* ... (Previous Modals retained) ... */}
             {/* Re-rendering Modals to ensure file integrity */}
             
             {/* EDIT/ADD VEHICLE MODAL */}
             {modalType === 'vehicle_form' && (
                 <ModalContainer title={selectedItem ? `Modifier ${selectedItem.name}` : 'Ajouter un Véhicule'} onClose={closeModal} width="max-w-4xl">
                     <form onSubmit={handleSaveVehicle} className="flex flex-col h-[70vh]">
                         <div className="flex border-b border-slate-200 dark:border-white/10 mb-6">
                             <button type="button" onClick={() => setVehicleModalTab('details')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${vehicleModalTab === 'details' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-500 hover:text-brand-navy dark:hover:text-white'}`}>Détails Véhicule</button>
                             <button type="button" onClick={() => setVehicleModalTab('documents')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${vehicleModalTab === 'documents' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-500 hover:text-brand-navy dark:hover:text-white'}`}>Documents <span className="bg-brand-red text-white text-[9px] px-1.5 py-0.5 rounded-full">Sécurisé</span></button>
                             <button type="button" onClick={() => setVehicleModalTab('infractions')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${vehicleModalTab === 'infractions' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-500 hover:text-brand-navy dark:hover:text-white'}`}>
                               Infractions
                               {modalInfractions.filter(i => i.status !== 'Paid').length > 0 && (
                                 <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                                   {modalInfractions.filter(i => i.status !== 'Paid').length}
                                 </span>
                               )}
                             </button>
                         </div>
                         <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                             <div className={vehicleModalTab === 'details' ? 'block' : 'hidden'}>
                                 <div className="space-y-4">
                                     <div className="grid grid-cols-2 gap-4">
                                         <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Marque</label><input name="make" defaultValue={selectedItem?.make || ''} required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue" placeholder="ex: BMW"/></div>
                                         <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Modèle</label><input name="model" defaultValue={selectedItem?.model || ''} required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue" placeholder="ex: M4 Competition"/></div>
                                     </div>
                                     <div className="grid grid-cols-3 gap-4">
                                         <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Catégorie</label><select name="category" defaultValue={selectedItem?.category || 'Sedan'} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"><option value="Hyper">Hyper / Supercar</option><option value="SUV">SUV de Luxe</option><option value="Sedan">Berline</option><option value="Convertible">Cabriolet</option></select></div>
                                         <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Année</label><input name="year" type="number" min="2000" max="2030" defaultValue={selectedItem?.year || new Date().getFullYear()} required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"/></div>
                                         <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Carburant</label><select name="fuel_type" defaultValue={selectedItem?.fuel_type || 'Essence'} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"><option value="Essence">Essence</option><option value="Diesel">Diesel</option><option value="Hybride">Hybride</option><option value="Électrique">Électrique</option></select></div>
                                     </div>
                                     <div className="grid grid-cols-2 gap-4">
                                         {/* Plate: single input for qty=1, summary badge for qty>1 */}
                                         {modalQty <= 1 ? (
                                           <div>
                                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Immatriculation</label>
                                             <input
                                               value={modalUnitPlates[0] ?? ''}
                                               onChange={e => setModalUnitPlates([e.target.value])}
                                               className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue font-mono"
                                               placeholder="ex: 72819-A-1"
                                             />
                                           </div>
                                         ) : (
                                           <div>
                                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Immatriculations ({modalQty} unités)</label>
                                             <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                                               {modalUnitPlates.map((p, i) => (
                                                 <input
                                                   key={i}
                                                   value={p}
                                                   onChange={e => {
                                                     const next = [...modalUnitPlates];
                                                     next[i] = e.target.value;
                                                     setModalUnitPlates(next);
                                                   }}
                                                   className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue font-mono"
                                                   placeholder={`Unité #${i + 1} — ex: 7281${i}-A-1`}
                                                 />
                                               ))}
                                             </div>
                                           </div>
                                         )}
                                         <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Statut</label><select name="status" defaultValue={selectedItem?.status || 'Available'} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"><option value="Available">Disponible</option><option value="Rented">Loué</option><option value="Maintenance">Maintenance</option><option value="Impounded">Fourrière</option></select></div>
                                     </div>
                                     <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Agence / Lieu</label><input name="branch" defaultValue={selectedItem?.branch || 'Casablanca Anfa'} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"/></div>
                                     <div className="grid grid-cols-4 gap-4">
                                         <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kilométrage (km)</label><input name="odometer" type="number" defaultValue={selectedItem?.odometer || 0} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"/></div>
                                         <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Carburant (%)</label><input name="fuel" type="number" min="0" max="100" defaultValue={selectedItem?.fuel || 100} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"/></div>
                                         <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prix/Jour (MAD)</label><input name="pricePerDay" type="number" defaultValue={selectedItem?.pricePerDay || 1000} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"/></div>
                                         <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantité (unités)</label><input name="quantity" type="number" min="0" value={modalQty} onChange={e => {
                                             const n = Math.max(1, parseInt(e.target.value) || 1);
                                             setModalQty(n);
                                             setModalUnitPlates(prev => Array.from({ length: n }, (_, i) => prev[i] ?? ''));
                                           }} required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"/></div>
                                     </div>
                                     <div>
                                         <div className="flex justify-between items-center mb-1">
                                             <label className="block text-xs font-bold text-slate-500 uppercase">Image du Véhicule</label>
                                             <div className="flex bg-slate-100 dark:bg-white/5 p-0.5 rounded-lg">
                                                 <button 
                                                     type="button"
                                                     onClick={() => setImageInputType('url')}
                                                     className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${imageInputType === 'url' ? 'bg-white dark:bg-brand-navy shadow text-brand-blue' : 'text-slate-500 hover:text-brand-navy dark:hover:text-white'}`}
                                                 >
                                                     Lien URL
                                                 </button>
                                                 <button 
                                                     type="button"
                                                     onClick={() => setImageInputType('upload')}
                                                     className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${imageInputType === 'upload' ? 'bg-white dark:bg-brand-navy shadow text-brand-blue' : 'text-slate-500 hover:text-brand-navy dark:hover:text-white'}`}
                                                 >
                                                     Upload
                                                 </button>
                                             </div>
                                         </div>
                                         
                                         {imageInputType === 'url' ? (
                                             <div className="flex gap-2">
                                                 <input name="image" defaultValue={selectedItem?.image || ''} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue" placeholder="https://..."/>
                                                 <div className="w-12 h-11 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0">
                                                     <ImageIcon className="w-5 h-5 text-slate-400" />
                                                 </div>
                                             </div>
                                         ) : (
                                             <div className="w-full h-32 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/5 flex flex-col items-center justify-center cursor-pointer hover:border-brand-blue transition-colors group relative overflow-hidden">
                                                 <input type="file" name="image_file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                                                 <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-brand-blue transition-colors mb-2 z-10" />
                                                 <p className="text-xs font-bold text-brand-navy dark:text-white z-10">Cliquez pour télécharger</p>
                                                 <p className="text-[10px] text-slate-400 z-10">SVG, PNG, JPG ou GIF (max. 2MB)</p>
                                             </div>
                                         )}
                                     </div>
                                 </div>
                             </div>
                             <div className={vehicleModalTab === 'documents' ? 'block' : 'hidden'}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {([
                                      { id: 'doc_insurance',        expiryName: 'expiry_insurance', label: 'Assurance',        key: 'insurance',       fileKey: 'insurance',       icon: ShieldAlert },
                                      { id: 'doc_visite_technique', expiryName: 'expiry_visite',    label: 'Visite Technique', key: 'visiteTechnique', fileKey: 'visiteTechnique', icon: Wrench },
                                      { id: 'doc_vignette',         expiryName: 'expiry_vignette',  label: 'Vignette',         key: 'vignette',        fileKey: 'vignette',        icon: FileText },
                                      { id: 'doc_carte_grise',      expiryName: 'expiry_carte',     label: 'Carte Grise',      key: 'carteGrise',      fileKey: 'carteGrise',      icon: FileCheck },
                                    ] as const).map((doc) => {
                                      const expiryDate = selectedItem?.documents?.[doc.key] || '';
                                      const existingFileUrl = (selectedItem?.documentFiles as any)?.[doc.fileKey] || '';
                                      const status = getExpiryStatus(expiryDate);
                                      const Icon = doc.icon;
                                      const selectedFileName = docFileNames[doc.id] || '';
                                      return (
                                        <div key={doc.id} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col gap-3 hover:border-brand-blue/40 transition-colors">
                                          {/* Header */}
                                          <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                              <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center text-slate-500"><Icon className="w-4 h-4" /></div>
                                              <span className="font-bold text-sm text-brand-navy dark:text-white">{doc.label}</span>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 ${status.color}`}><status.icon className="w-3 h-3" />{status.label}</div>
                                          </div>
                                          {/* Expiry date — always interactive */}
                                          <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Date d'Expiration</label>
                                            <input name={doc.expiryName} type="date" defaultValue={expiryDate}
                                              className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-xs font-mono text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"/>
                                          </div>
                                          {/* Current file or selected file name */}
                                          <div className="min-h-[18px]">
                                            {selectedFileName
                                              ? <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold"><CheckCircle2 className="w-3 h-3"/>{selectedFileName}</span>
                                              : existingFileUrl
                                                ? <a href={existingFileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-brand-blue hover:underline"><Eye className="w-3 h-3"/>Voir le document actuel</a>
                                                : <span className="text-[10px] text-slate-400">Aucun fichier enregistré</span>
                                            }
                                          </div>
                                          {/* Upload button — always visible, never blocks card */}
                                          <label className="relative flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-300 dark:border-white/20 bg-white dark:bg-white/5 hover:border-brand-blue hover:bg-brand-blue/5 transition-colors cursor-pointer">
                                            <input
                                              type="file"
                                              name={doc.id}
                                              accept="image/*,application/pdf"
                                              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                              onChange={e => {
                                                const f = e.target.files?.[0];
                                                setDocFileNames(prev => ({ ...prev, [doc.id]: f ? f.name : '' }));
                                              }}
                                            />
                                            <UploadCloud className="w-4 h-4 text-slate-400 pointer-events-none" />
                                            <span className="text-[11px] font-bold text-slate-500 pointer-events-none">
                                              {selectedFileName ? 'Changer le fichier' : 'Télécharger un document'}
                                            </span>
                                          </label>
                                        </div>
                                      );
                                    })}
                                </div>
                                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl flex items-start gap-3"><div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400"><AlertCircle className="w-5 h-5" /></div><div><h4 className="text-sm font-bold text-blue-800 dark:text-blue-300">Système d'Alertes Auto</h4><p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Le système notifie automatiquement le gestionnaire de flotte 30, 15 et 7 jours avant l'expiration d'un document.</p></div></div>
                             </div>

                             {/* ── INFRACTIONS TAB ── */}
                             <div className={vehicleModalTab === 'infractions' ? 'block' : 'hidden'}>
                               {!selectedItem?.id ? (
                                 <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                                   <AlertTriangle className="w-10 h-10 opacity-40" />
                                   <p className="text-sm font-medium">Enregistrez le véhicule pour gérer ses infractions</p>
                                   <p className="text-xs text-slate-400">Les infractions sont liées à un véhicule existant.</p>
                                 </div>
                               ) : (
                                 <div className="space-y-4">

                                   {/* ── Unpaid alert banner ── */}
                                   {modalInfractions.some(i => i.status !== 'Paid') && (
                                     <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-xl">
                                       <Siren className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                                       <div className="flex-1">
                                         <p className="text-sm font-bold text-red-700 dark:text-red-400">
                                           {modalInfractions.filter(i => i.status !== 'Paid').length} infraction(s) non-réglée(s) — Action requise
                                         </p>
                                         <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                                           Total impayé : {modalInfractions.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0).toLocaleString('fr-MA')} MAD
                                         </p>
                                       </div>
                                     </div>
                                   )}

                                   {/* ── List ── */}
                                   {modalInfLoading ? (
                                     <div className="text-center py-8 text-slate-400 text-sm">Chargement des infractions…</div>
                                   ) : modalInfractions.length > 0 ? (
                                     <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                       {modalInfractions.map(inf => {
                                         const meta = INF_TYPE_META[inf.type] ?? { label: inf.type, color: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300' };
                                         const isPaid = inf.status === 'Paid';
                                         const today = new Date().toISOString().slice(0, 10);
                                         const isOverdue = !isPaid && !!inf.due_date && inf.due_date < today;
                                         return (
                                           <div key={inf.id} className={`flex items-start gap-2.5 p-3 rounded-xl border transition-colors ${isPaid ? 'bg-green-50/60 dark:bg-green-900/5 border-green-100 dark:border-green-900/20' : isOverdue ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10'}`}>
                                             <span className={`shrink-0 px-2 py-1 rounded-md text-[10px] font-bold leading-none whitespace-nowrap ${meta.color}`}>{meta.label}</span>
                                             <div className="flex-1 min-w-0 space-y-0.5">
                                               <div className="flex items-center gap-2 flex-wrap">
                                                 <span className="text-xs font-bold text-brand-navy dark:text-white">{inf.amount.toLocaleString('fr-MA')} MAD</span>
                                                 <span className="text-[10px] text-slate-400 font-mono">{inf.date}</span>
                                                 {inf.location && <span className="text-[10px] text-slate-500 truncate max-w-[120px]" title={inf.location}>{inf.location}</span>}
                                               </div>
                                               <div className="flex items-center gap-3 flex-wrap">
                                                 {inf.due_date && (
                                                   <span className={`text-[10px] font-mono ${isOverdue ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
                                                     Échéance: {inf.due_date}{isOverdue ? ' ⚠' : ''}
                                                   </span>
                                                 )}
                                                 {inf.notification_ref && (
                                                   <span className="text-[10px] text-slate-400 font-mono">Réf: {inf.notification_ref}</span>
                                                 )}
                                               </div>
                                             </div>
                                             <div className="flex items-center gap-1 shrink-0">
                                               <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPaid ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : inf.status === 'Disputed' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                 {isPaid ? 'Payée' : inf.status === 'Disputed' ? 'Contestée' : 'Impayée'}
                                               </span>
                                               {!isPaid && (
                                                 <button type="button" onClick={() => handleMarkInfPaid(inf.id)} title="Marquer comme payée" className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 transition-colors">
                                                   <CheckCircle2 className="w-3.5 h-3.5" />
                                                 </button>
                                               )}
                                               <button type="button" onClick={() => handleDeleteInfraction(inf.id)} title="Supprimer" className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                                                 <Trash2 className="w-3.5 h-3.5" />
                                               </button>
                                             </div>
                                           </div>
                                         );
                                       })}
                                     </div>
                                   ) : !infFormVisible ? (
                                     <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                                       <CheckCircle2 className="w-10 h-10 opacity-40 text-green-500" />
                                       <p className="text-sm font-medium">Aucune infraction enregistrée</p>
                                       <p className="text-xs">Ce véhicule est en règle</p>
                                     </div>
                                   ) : null}

                                   {/* ── Add infraction form ── */}
                                   {infFormVisible ? (
                                     <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 space-y-3">
                                       <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                                         <Siren className="w-3.5 h-3.5 text-red-500" /> Nouvelle infraction
                                       </h4>
                                       <div className="grid grid-cols-2 gap-3">
                                         <div>
                                           <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Type d'infraction</label>
                                           <select value={infForm.type} onChange={e => setInfForm(p => ({ ...p, type: e.target.value }))} className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-xs text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue">
                                             {INF_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                           </select>
                                         </div>
                                         <div>
                                           <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Date de l'infraction</label>
                                           <input type="date" value={infForm.date} onChange={e => setInfForm(p => ({ ...p, date: e.target.value }))} className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-xs font-mono text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue" />
                                         </div>
                                         <div>
                                           <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Montant de l'amende (MAD)</label>
                                           <input type="number" min="0" value={infForm.amount} onChange={e => setInfForm(p => ({ ...p, amount: e.target.value }))} placeholder="ex: 700" className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-xs text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue" />
                                         </div>
                                         <div>
                                           <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Date d'échéance paiement</label>
                                           <input type="date" value={infForm.due_date} onChange={e => setInfForm(p => ({ ...p, due_date: e.target.value }))} className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-xs font-mono text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue" />
                                         </div>
                                         <div>
                                           <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Lieu de l'infraction</label>
                                           <input type="text" value={infForm.location} onChange={e => setInfForm(p => ({ ...p, location: e.target.value }))} placeholder="ex: Autoroute A3, Km 45" className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-xs text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue" />
                                         </div>
                                         <div>
                                           <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Réf. notification / PV</label>
                                           <input type="text" value={infForm.notification_ref} onChange={e => setInfForm(p => ({ ...p, notification_ref: e.target.value }))} placeholder="ex: PV/2026/00123" className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-xs font-mono text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue" />
                                         </div>
                                         <div>
                                           <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Statut</label>
                                           <select value={infForm.status} onChange={e => setInfForm(p => ({ ...p, status: e.target.value }))} className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-xs text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue">
                                             <option value="Unpaid">Impayée</option>
                                             <option value="Paid">Payée</option>
                                             <option value="Disputed">Contestée</option>
                                           </select>
                                         </div>
                                         <div>
                                           <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Notes / Observations</label>
                                           <input type="text" value={infForm.notes} onChange={e => setInfForm(p => ({ ...p, notes: e.target.value }))} placeholder="Informations complémentaires..." className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-xs text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue" />
                                         </div>
                                       </div>
                                       <div className="flex justify-end gap-2 pt-1">
                                         <button type="button" onClick={() => { setInfFormVisible(false); setInfForm({ ...blankInfForm }); }} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-brand-navy dark:hover:text-white transition-colors">Annuler</button>
                                         <button type="button" onClick={handleAddInfraction} disabled={infFormSaving || !infForm.date || !infForm.amount} className="px-4 py-1.5 bg-brand-blue text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-1.5">
                                           {infFormSaving ? 'Enregistrement…' : <><Plus className="w-3.5 h-3.5" /> Enregistrer l'infraction</>}
                                         </button>
                                       </div>
                                     </div>
                                   ) : (
                                     <button type="button" onClick={() => setInfFormVisible(true)} className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-400 hover:border-brand-blue hover:text-brand-blue transition-colors flex items-center justify-center gap-2">
                                       <Plus className="w-4 h-4" /> Ajouter une infraction
                                     </button>
                                   )}

                                   {/* Legend */}
                                   <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl flex items-start gap-2.5">
                                     <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                     <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                                       Les infractions correspondent aux lettres officielles reçues (radar, stationnement, contrôle routier, documents expirés, etc.). Marquez-les comme payées une fois les amendes réglées pour maintenir la conformité de la flotte.
                                     </p>
                                   </div>
                                 </div>
                               )}
                             </div>

                         </div>
                         <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-white/10 mt-auto"><button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-brand-navy transition-colors">Annuler</button><button type="submit" className="px-6 py-2 bg-brand-blue text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg flex items-center gap-2"><Save className="w-4 h-4" /> Enregistrer</button></div>
                     </form>
                 </ModalContainer>
             )}

             {/* CLIENT DETAIL / VERIFICATION MODAL */}
             {modalType === 'client_detail' && selectedItem && (() => {
               const c = selectedItem as Client;
               const kycColor = c.kycStatus === 'Verified' ? 'bg-green-100 text-green-700' : c.kycStatus === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700';
               const statusColor = c.status === 'VIP' ? 'bg-purple-100 text-purple-700 border border-purple-200' : c.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600';
               return (
                 <ModalContainer title={`Fiche Client — ${c.name}`} onClose={closeModal} width="max-w-4xl">
                   <div className="flex flex-col h-[80vh]">
                     <div className="flex-grow overflow-y-auto pr-1 custom-scrollbar space-y-6">

                       {/* Header row: avatar + key info */}
                       <div className="flex items-center gap-6 p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                         <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden flex items-center justify-center text-slate-500 shrink-0 border-4 border-white dark:border-[#0B1120] shadow-lg">
                           {c.avatar
                             ? <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                             : <Users className="w-8 h-8" />}
                         </div>
                         <div className="flex-grow">
                           <h3 className="text-xl font-bold text-brand-navy dark:text-white">{c.name}</h3>
                           <p className="text-sm text-slate-500">{c.email}</p>
                           <div className="flex flex-wrap gap-2 mt-2">
                             <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${statusColor}`}>
                               {{ 'VIP': 'VIP', 'Active': 'Actif', 'Blacklisted': 'Liste Noire' }[c.status] || c.status}
                             </span>
                             <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${kycColor}`}>
                               {{ 'Verified': '✓ Vérifié', 'Pending': '⧗ En Attente', 'Missing': '⚠ Manquant' }[c.kycStatus] || c.kycStatus}
                             </span>
                           </div>
                         </div>
                         <div className="text-right shrink-0">
                           <p className="text-xs text-slate-400 uppercase font-bold">Dépense Totale</p>
                           <p className="text-2xl font-bold text-brand-navy dark:text-white font-mono">{c.totalSpent.toLocaleString()}</p>
                           <p className="text-xs text-slate-400">MAD</p>
                         </div>
                       </div>

                       {/* Info grid */}
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                         {[
                           { label: 'Téléphone',           value: c.phone || '—' },
                           { label: 'CIN',                value: c.cin   || '—', mono: true },
                           { label: 'N° Permis',          value: c.driverLicense || '—', mono: true },
                           { label: 'Expiration Permis', value: c.driverLicenseExpiry || '—' },
                           { label: 'Dernier Contact',   value: c.lastRental },
                         ].map(({ label, value, mono }) => (
                           <div key={label} className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-100 dark:border-white/5">
                             <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</p>
                             <p className={`text-sm font-bold text-brand-navy dark:text-white ${mono ? 'font-mono' : ''}`}>{value}</p>
                           </div>
                         ))}
                       </div>

                       {/* KYC Documents */}
                       <div>
                         <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Documents KYC</h4>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           {([
                             { label: 'CIN (Recto)',        src: c.documents?.idCardFront, icon: CreditCard },
                             { label: 'CIN (Verso)',        src: c.documents?.idCardBack,  icon: CreditCard },
                             { label: 'Permis de Conduire', src: c.documents?.license,     icon: FileText   },
                           ] as const).map(({ label, src, icon: Icon }) => (
                             <div key={label} className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-slate-50 dark:bg-white/[0.02]">
                               <div className="h-44 flex items-center justify-center bg-slate-100 dark:bg-white/5 relative group">
                                 {src ? (
                                   <>
                                     <img src={src} alt={label} className="w-full h-full object-contain p-2" />
                                     <a
                                       href={src} target="_blank" rel="noreferrer"
                                       className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity"
                                       onClick={e => e.stopPropagation()}
                                     >
                                       <Eye className="w-6 h-6 text-white" />
                                       <span className="text-white text-xs font-bold">Ouvrir</span>
                                     </a>
                                   </>
                                 ) : (
                                   <div className="flex flex-col items-center text-slate-300 dark:text-slate-600">
                                     <Icon className="w-10 h-10 mb-2" />
                                     <span className="text-xs">Aucun fichier</span>
                                   </div>
                                 )}
                               </div>
                               <div className="px-3 py-2 border-t border-slate-200 dark:border-white/10">
                                 <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{label}</p>
                                 {src
                                   ? <p className="text-[10px] text-green-600 font-medium">✓ Document enregistré</p>
                                   : <p className="text-[10px] text-red-400 font-medium">⚠ Manquant</p>
                                 }
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>

                     </div>{/* end scroll */}

                     <div className="pt-4 flex justify-between items-center border-t border-slate-200 dark:border-white/10 mt-auto shrink-0">
                       <p className="text-xs text-slate-400 italic">Double-clic sur une ligne pour afficher ce panneau</p>
                       <div className="flex gap-2">
                         <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-brand-navy transition-colors">Fermer</button>
                         <button
                           type="button"
                           onClick={() => {
                             closeModal();
                             setContactThreadEmail(c.email);
                             setActiveTab('messages');
                           }}
                           className="px-5 py-2 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-bold hover:bg-brand-blue/10 hover:text-brand-blue transition-colors flex items-center gap-2"
                           title={`Voir la messagerie de ${c.name}`}
                         >
                           <MessageSquare className="w-4 h-4" /> Messagerie
                         </button>
                         <button type="button" onClick={() => { closeModal(); setTimeout(() => openModal('client_form', c), 50); }}
                           className="px-5 py-2 bg-brand-blue text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg flex items-center gap-2">
                           <Edit className="w-4 h-4" /> Modifier le profil
                         </button>
                       </div>
                     </div>
                   </div>
                 </ModalContainer>
               );
             })()}

             {/* CLIENT / KYC MODAL */}
             {modalType === 'client_form' && (
                 <ModalContainer title={selectedItem ? `Gérer Client: ${selectedItem.name}` : 'Nouvelle Inscription Client'} onClose={closeModal} width="max-w-4xl">
                     <form key={selectedItem?.id ?? 'new'} onSubmit={handleSaveClient} className="flex flex-col h-[80vh]">
                         {/* Tabs */}
                         <div className="flex border-b border-slate-200 dark:border-white/10 mb-6">
                             <button type="button" onClick={() => setClientModalTab('profile')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${clientModalTab === 'profile' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-500 hover:text-brand-navy dark:hover:text-white'}`}>Profil Personnel</button>
                             <button type="button" onClick={() => setClientModalTab('kyc')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${clientModalTab === 'kyc' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-500 hover:text-brand-navy dark:hover:text-white'}`}>
                                 Documents KYC
                                 {selectedItem?.kycStatus === 'Verified' && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                                 {selectedItem?.kycStatus === 'Pending' && <ScanLine className="w-3 h-3 text-orange-500" />}
                             </button>
                         </div>

                         <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-4">

                             {/* ── PROFILE TAB ── */}
                             <div className={clientModalTab === 'profile' ? 'block space-y-5' : 'hidden'}>
                                 {/* Avatar + status row */}
                                 <div className="flex items-center gap-6">
                                     <label className="w-24 h-24 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center border-4 border-white dark:border-[#0B1120] shadow-lg relative group cursor-pointer overflow-hidden shrink-0">
                                         <input type="file" name="avatar" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                             onChange={e => setDocFileNames(prev => ({ ...prev, avatar: e.target.files?.[0]?.name ?? '' }))} />
                                         {selectedItem?.avatar
                                             ? <img src={selectedItem.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                             : <Users className="w-10 h-10 text-slate-400 z-10" />}
                                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                                             <UploadCloud className="w-6 h-6 text-white" />
                                         </div>
                                     </label>
                                     <div>
                                         <h4 className="text-xl font-bold text-brand-navy dark:text-white">{selectedItem?.name || 'Nouveau Client'}</h4>
                                         {docFileNames.avatar && <p className="text-[10px] text-green-600 font-bold mt-1">✓ {docFileNames.avatar}</p>}
                                         <div className="flex items-center gap-2 mt-3">
                                             <span className="text-xs text-slate-500 uppercase font-bold">Statut :</span>
                                             <select name="status" defaultValue={selectedItem?.status || 'Active'} className="bg-transparent text-xs font-bold uppercase border border-slate-200 dark:border-white/10 rounded px-2 py-1 outline-none focus:border-brand-blue text-brand-navy dark:text-white">
                                                 <option value="Active">Actif</option>
                                                 <option value="VIP">VIP</option>
                                                 <option value="Blacklisted">Liste Noire</option>
                                             </select>
                                         </div>
                                     </div>
                                 </div>

                                 {/* Identity fields */}
                                 <div className="grid grid-cols-2 gap-4">
                                     <div>
                                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nom Complet</label>
                                         <input name="name" defaultValue={selectedItem?.name || ''} required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue" placeholder="Prénom Nom"/>
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CIN (Carte Nationale)</label>
                                         <input name="national_id" defaultValue={selectedItem?.cin || ''} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue font-mono" placeholder="AB123456"/>
                                     </div>
                                 </div>

                                 <div className="grid grid-cols-2 gap-4">
                                     <div>
                                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                                         <input name="email" type="email" defaultValue={selectedItem?.email || ''} required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"/>
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Téléphone</label>
                                         <input name="phone" defaultValue={selectedItem?.phone || ''} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue" placeholder="+212 6xx-xxxxxx"/>
                                     </div>
                                 </div>

                                 {/* Driver license */}
                                 <div className="grid grid-cols-2 gap-4">
                                     <div>
                                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">N° Permis de Conduire</label>
                                         <input name="driver_license_number" defaultValue={selectedItem?.driverLicense || ''} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue font-mono" placeholder="B-123456"/>
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expiration Permis</label>
                                         <input name="driver_license_expiry_date" type="date" defaultValue={selectedItem?.driverLicenseExpiry || ''} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"/>
                                     </div>
                                 </div>

                                 {/* Password — only for new client */}
                                 {!selectedItem && (
                                     <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-white/10">
                                         <div>
                                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mot de passe</label>
                                             <input name="password" type="password" required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue" placeholder="••••••••"/>
                                         </div>
                                         <div>
                                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirmer le mot de passe</label>
                                             <input name="password_confirmation" type="password" required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue" placeholder="••••••••"/>
                                         </div>
                                     </div>
                                 )}
                             </div>

                             {/* ── KYC TAB ── */}
                             <div className={clientModalTab === 'kyc' ? 'block space-y-5' : 'hidden'}>
                                 {/* KYC status selector */}
                                 <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                                     <div>
                                         <h4 className="text-sm font-bold text-brand-navy dark:text-white">Statut Vérification KYC</h4>
                                         <p className="text-xs text-slate-500">Validation des documents d'identité</p>
                                     </div>
                                     <select name="kyc_status" defaultValue={selectedItem?.kycStatus || 'Pending'} className={`text-xs font-bold uppercase rounded px-3 py-1.5 outline-none cursor-pointer border-none ${selectedItem?.kycStatus === 'Verified' ? 'bg-green-100 text-green-700' : selectedItem?.kycStatus === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                         <option value="Pending">En attente</option>
                                         <option value="Verified">Vérifié</option>
                                         <option value="Missing">Documents Manquants</option>
                                     </select>
                                 </div>

                                 {/* Document upload cards */}
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     {/* CIN Recto */}
                                     <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] hover:border-brand-blue transition-colors overflow-hidden">
                                         <div className="h-36 flex items-center justify-center p-4">
                                             {selectedItem?.documents?.idCardFront
                                                 ? <img src={selectedItem.documents.idCardFront} className="h-full object-contain rounded" alt="CIN Recto" />
                                                 : <div className="flex flex-col items-center text-slate-400"><CreditCard className="w-8 h-8 mb-2" /><span className="text-xs font-bold text-brand-navy dark:text-white">CIN (Recto)</span><span className="text-[10px] mt-1">Aucun fichier enregistré</span></div>
                                             }
                                         </div>
                                         <label className="flex items-center justify-center gap-2 px-3 py-2 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-brand-blue/5 cursor-pointer relative">
                                             <input type="file" name="doc_id_front" accept="image/*,application/pdf" className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                                 onChange={e => setDocFileNames(prev => ({ ...prev, doc_id_front: e.target.files?.[0]?.name ?? '' }))} />
                                             <UploadCloud className="w-4 h-4 text-slate-400 pointer-events-none" />
                                             <span className="text-[11px] font-bold text-slate-500 pointer-events-none">
                                                 {docFileNames.doc_id_front ? <span className="text-green-600">✓ {docFileNames.doc_id_front}</span> : 'Télécharger CIN Recto'}
                                             </span>
                                         </label>
                                     </div>

                                     {/* CIN Verso */}
                                     <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] hover:border-brand-blue transition-colors overflow-hidden">
                                         <div className="h-36 flex items-center justify-center p-4">
                                             {selectedItem?.documents?.idCardBack
                                                 ? <img src={selectedItem.documents.idCardBack} className="h-full object-contain rounded" alt="CIN Verso" />
                                                 : <div className="flex flex-col items-center text-slate-400"><CreditCard className="w-8 h-8 mb-2" /><span className="text-xs font-bold text-brand-navy dark:text-white">CIN (Verso)</span><span className="text-[10px] mt-1">Aucun fichier enregistré</span></div>
                                             }
                                         </div>
                                         <label className="flex items-center justify-center gap-2 px-3 py-2 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-brand-blue/5 cursor-pointer relative">
                                             <input type="file" name="doc_id_back" accept="image/*,application/pdf" className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                                 onChange={e => setDocFileNames(prev => ({ ...prev, doc_id_back: e.target.files?.[0]?.name ?? '' }))} />
                                             <UploadCloud className="w-4 h-4 text-slate-400 pointer-events-none" />
                                             <span className="text-[11px] font-bold text-slate-500 pointer-events-none">
                                                 {docFileNames.doc_id_back ? <span className="text-green-600">✓ {docFileNames.doc_id_back}</span> : 'Télécharger CIN Verso'}
                                             </span>
                                         </label>
                                     </div>

                                     {/* Permis de conduire — full width */}
                                     <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] hover:border-brand-blue transition-colors overflow-hidden md:col-span-2">
                                         <div className="h-36 flex items-center justify-center p-4">
                                             {selectedItem?.documents?.license
                                                 ? <img src={selectedItem.documents.license} className="h-full object-contain rounded" alt="Permis" />
                                                 : <div className="flex flex-col items-center text-slate-400"><FileText className="w-8 h-8 mb-2" /><span className="text-xs font-bold text-brand-navy dark:text-white">Permis de Conduire</span><span className="text-[10px] mt-1">Aucun fichier enregistré</span></div>
                                             }
                                         </div>
                                         <label className="flex items-center justify-center gap-2 px-3 py-2 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-brand-blue/5 cursor-pointer relative">
                                             <input type="file" name="doc_license" accept="image/*,application/pdf" className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                                 onChange={e => setDocFileNames(prev => ({ ...prev, doc_license: e.target.files?.[0]?.name ?? '' }))} />
                                             <UploadCloud className="w-4 h-4 text-slate-400 pointer-events-none" />
                                             <span className="text-[11px] font-bold text-slate-500 pointer-events-none">
                                                 {docFileNames.doc_license ? <span className="text-green-600">✓ {docFileNames.doc_license}</span> : 'Télécharger Permis de Conduire'}
                                             </span>
                                         </label>
                                     </div>
                                 </div>
                             </div>
                         </div>

                         <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-white/10 mt-auto shrink-0">
                             <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-brand-navy transition-colors">Annuler</button>
                             <button type="submit" className="px-6 py-2 bg-brand-blue text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg flex items-center gap-2">
                                 <Save className="w-4 h-4" /> {selectedItem ? 'Enregistrer Profil' : 'Créer Client'}
                             </button>
                         </div>
                     </form>
                 </ModalContainer>
             )}
             
             {/* EDIT/ADD BOOKING MODAL */}
             {modalType === 'booking_form' && (
                 <ModalContainer title={selectedItem ? `Modifier Réservation #${selectedItem.id}` : 'Nouvelle Réservation'} onClose={closeModal} width="max-w-2xl">
                     <form key={selectedItem?.id ?? 'new'} onSubmit={handleSaveBooking} className="space-y-5">

                         {/* Client + Car */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Client</label>
                                 {selectedItem ? (
                                     <div className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm font-bold text-brand-navy dark:text-white">{selectedItem.clientName}</div>
                                 ) : (
                                     <select name="clientId" required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue">
                                         <option value="">— Sélectionner un client —</option>
                                         {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                                     </select>
                                 )}
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Véhicule</label>
                                 {selectedItem ? (
                                     <div className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm font-bold text-brand-navy dark:text-white">{selectedItem.vehicleName}</div>
                                 ) : (
                                     <select name="carId" required value={bfCarId} onChange={e => setBfCarId(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue">
                                         <option value="">— Sélectionner un véhicule —</option>
                                         {vehicles.map(v => <option key={v.id} value={String(v.id)}>{v.name}{v.plate ? ` (${v.plate})` : ''}{v.pricePerDay ? ` · ${v.pricePerDay.toLocaleString('fr-MA')} MAD/j` : ''}</option>)}
                                     </select>
                                 )}
                             </div>
                         </div>

                         {/* Dates */}
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date de Début</label>
                                 <input name="startDate" type="date" value={bfStart} required onChange={e => setBfStart(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"/>
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date de Fin</label>
                                 <input name="endDate" type="date" value={bfEnd} required onChange={e => setBfEnd(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"/>
                             </div>
                         </div>

                         {/* Pickup / Dropoff Points */}
                         {pickupPoints.length > 0 && (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lieu de Prise en Charge</label>
                               <select
                                 value={bfPickupId}
                                 onChange={e => setBfPickupId(e.target.value === '' ? '' : Number(e.target.value))}
                                 className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"
                               >
                                 <option value="">— Aucun point sélectionné —</option>
                                 {pickupPoints
                                   .filter(p => p.is_active && (p.type === 'pickup' || p.type === 'both'))
                                   .map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                                 }
                               </select>
                             </div>
                             <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lieu de Retour</label>
                               <select
                                 value={bfDropoffId}
                                 onChange={e => setBfDropoffId(e.target.value === '' ? '' : Number(e.target.value))}
                                 className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"
                               >
                                 <option value="">— Aucun point sélectionné —</option>
                                 {pickupPoints
                                   .filter(p => p.is_active && (p.type === 'dropoff' || p.type === 'both'))
                                   .map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                                 }
                               </select>
                             </div>
                           </div>
                         )}

                         {/* Availability Calendar */}
                         {bfBookedPeriods !== null && (() => {
                           const activeCarId = bfCarId || (selectedItem?.carId ?? '');
                           const veh = vehicles.find(v => String(v.id) === String(activeCarId));
                           return (
                             <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] p-4">
                               {/* Vehicle name header */}
                               {veh && (
                                 <p className="text-xs font-bold text-brand-navy dark:text-white mb-3 flex items-center gap-1.5">
                                   <span className="w-1.5 h-1.5 rounded-full bg-brand-blue inline-block"/>
                                   Planning — {veh.name}{veh.plate ? ` · ${veh.plate}` : ''}
                                 </p>
                               )}
                               <AvailabilityCalendar
                                 totalUnits={bfBookedPeriods.total_units}
                                 bookedPeriods={bfBookedPeriods.booked_periods}
                                 pickupDate={bfStart}
                                 returnDate={bfEnd}
                                 months={3}
                               />
                             </div>
                           );
                         })()}

                         {/* Amount + Payment Status */}
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Montant (MAD)</label>
                                 <input name="amount" type="number" step="0.01" min="0" value={bfAmount} onChange={e => setBfAmount(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue" placeholder="Auto-calculé"/>
                                 {(() => {
                                   const vid = bfCarId || (selectedItem?.carId ?? '');
                                   const veh = vehicles.find(v => String(v.id) === String(vid));
                                   if (!veh?.pricePerDay || !bfStart || !bfEnd) return null;
                                   const ms = new Date(bfEnd).getTime() - new Date(bfStart).getTime();
                                   if (ms < 0) return null;
                                   const days = Math.floor(ms / 86400000) + 1;
                                   return (
                                     <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500 flex flex-wrap items-center gap-1">
                                       <span className="font-semibold text-brand-blue">{days} jour{days > 1 ? 's' : ''}</span>
                                       <span>×</span>
                                       <span className="font-semibold text-brand-blue">{veh.pricePerDay.toLocaleString('fr-MA')} MAD/j</span>
                                       <span>=</span>
                                       <span className="font-bold text-emerald-500">{(veh.pricePerDay * days).toLocaleString('fr-MA')} MAD</span>
                                     </p>
                                   );
                                 })()}
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Statut Paiement</label>
                                 <select name="paymentStatus" defaultValue={selectedItem?.paymentStatus || 'Unpaid'} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue">
                                     <option value="Paid">Payé</option>
                                     <option value="Deposit Only">Acompte seulement</option>
                                     <option value="Unpaid">Impayé</option>
                                 </select>
                             </div>
                         </div>

                         {/* Booking Status */}
                         <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Statut Réservation</label>
                             <select name="status" defaultValue={selectedItem?.status || 'Pending'} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue">
                                 <option value="Pending">En Attente</option>
                                 <option value="Confirmed">Confirmé</option>
                                 <option value="Active">Actif (En Voyage)</option>
                                 <option value="Completed">Terminé</option>
                                 <option value="Cancelled">Annulé</option>
                             </select>
                         </div>

                         {/* Notes */}
                         <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notes internes</label>
                             <textarea name="notes" defaultValue={selectedItem?.notes || ''} rows={2} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue resize-none" placeholder="Remarques internes…"/>
                         </div>

                         {/* Conflict suggestion banner */}
                         {bfConflict && (() => {
                           const fmtD = (d: string) => {
                             const [y, m, day] = d.split('-');
                             const months = ['jan','fév','mar','avr','mai','juin','juil','aoû','sep','oct','nov','déc'];
                             return `${parseInt(day)} ${months[parseInt(m) - 1]} ${y}`;
                           };
                           const isSameYear = bfConflict.suggestedStart.slice(0, 4) === bfConflict.suggestedEnd.slice(0, 4);
                           const startLabel = isSameYear
                             ? `${parseInt(bfConflict.suggestedStart.split('-')[2])} ${['jan','fév','mar','avr','mai','juin','juil','aoû','sep','oct','nov','déc'][parseInt(bfConflict.suggestedStart.split('-')[1]) - 1]}`
                             : fmtD(bfConflict.suggestedStart);
                           const endLabel = fmtD(bfConflict.suggestedEnd);
                           return (
                             <div className="rounded-xl border border-amber-300 dark:border-amber-500/50 bg-amber-50 dark:bg-amber-900/20 p-4">
                               <div className="flex items-start gap-3">
                                 <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                 </svg>
                                 <div className="flex-1 min-w-0">
                                   <p className="text-sm font-bold text-amber-800 dark:text-amber-200">
                                     Toutes les unités sont réservées pour cette période.
                                   </p>
                                   <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                                     Prochain créneau disponible : <strong>{startLabel}–{endLabel}</strong>. Voulez-vous ajuster les dates ?
                                   </p>
                                 </div>
                               </div>
                               <div className="mt-3 flex gap-2">
                                 <button
                                   type="button"
                                   onClick={() => {
                                     setBfStart(bfConflict.suggestedStart);
                                     setBfEnd(bfConflict.suggestedEnd);
                                     // bfConflict will auto-clear via the useEffect on bfStart/bfEnd change
                                   }}
                                   className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors"
                                 >
                                   Ajuster vers {startLabel}–{endLabel}
                                 </button>
                                 <button
                                   type="button"
                                   onClick={() => setBfConflict(null)}
                                   className="px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline"
                                 >
                                   Ignorer
                                 </button>
                               </div>
                             </div>
                           );
                         })()}

                         <div className="pt-2 flex justify-end gap-3 border-t border-slate-200 dark:border-white/10">
                             <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-brand-navy transition-colors">Annuler</button>
                             <button type="submit" disabled={isSaving} className="px-6 py-2 bg-brand-blue text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                                 {isSaving ? (
                                   <>
                                     <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                     </svg>
                                     Enregistrement…
                                   </>
                                 ) : (
                                   <><Save className="w-4 h-4" /> {selectedItem ? 'Enregistrer' : 'Créer Réservation'}</>
                                 )}
                             </button>
                         </div>
                     </form>
                 </ModalContainer>
             )}

             {/* CONTRACT MODAL — replaced by dedicated ContractModal component */}

             {/* REVIEW REPLY MODAL */}
             {modalType === 'review_reply' && selectedItem && (
                 <ModalContainer title={`Répondre à ${selectedItem.clientName}`} onClose={closeModal}>
                     <div className="mb-6">
                         <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1 text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < selectedItem.rating ? 'fill-current' : 'text-slate-300'}`} />
                                ))}
                            </div>
                            <span className="text-xs text-slate-500">{selectedItem.date}</span>
                         </div>
                         <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                            <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{selectedItem.comment}"</p>
                         </div>
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Votre Réponse</label>
                         <textarea className="w-full h-32 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm outline-none focus:border-brand-blue resize-none" placeholder="Remerciez le client pour son avis..."></textarea>
                         <div className="mt-4 flex justify-end gap-3">
                             <button onClick={closeModal} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-brand-navy transition-colors">Annuler</button>
                             <button onClick={closeModal} className="px-4 py-2 bg-brand-blue text-white rounded-lg text-xs font-bold uppercase flex items-center gap-2"><Send className="w-3 h-3" /> Publier Réponse</button>
                         </div>
                     </div>
                 </ModalContainer>
             )}

             {/* BLOG POST FORM MODAL */}
             {modalType === 'blog_form' && (
                 <ModalContainer title={selectedItem ? 'Modifier Article' : 'Nouvel Article de Blog'} onClose={closeModal} width="max-w-2xl">
                     <form onSubmit={handleSaveBlogPost} className="space-y-4">
                         <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Titre</label>
                             <input name="title" defaultValue={selectedItem?.title || ''} required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue" placeholder="Entrez le titre de l'article..."/>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Catégorie</label>
                                 <select name="category" defaultValue={selectedItem?.category || 'News'} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue">
                                     <option value="News">Actualités & Mises à jour</option>
                                     <option value="Travel Guide">Guide de Voyage</option>
                                     <option value="Lifestyle">Mode de Vie</option>
                                     <option value="Events">Événements</option>
                                 </select>
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Statut</label>
                                 <select name="status" defaultValue={selectedItem?.status || 'Draft'} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue">
                                     <option value="Draft">Brouillon</option>
                                     <option value="Published">Publié</option>
                                 </select>
                             </div>
                         </div>
                         <div>
                             <div className="flex justify-between items-center mb-1">
                                 <label className="block text-xs font-bold text-slate-500 uppercase">Image à la Une</label>
                                 <div className="flex bg-slate-100 dark:bg-white/5 p-0.5 rounded-lg">
                                     <button 
                                         type="button"
                                         onClick={() => setImageInputType('url')}
                                         className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${imageInputType === 'url' ? 'bg-white dark:bg-brand-navy shadow text-brand-blue' : 'text-slate-500 hover:text-brand-navy dark:hover:text-white'}`}
                                     >
                                         Lien URL
                                     </button>
                                     <button 
                                         type="button"
                                         onClick={() => setImageInputType('upload')}
                                         className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${imageInputType === 'upload' ? 'bg-white dark:bg-brand-navy shadow text-brand-blue' : 'text-slate-500 hover:text-brand-navy dark:hover:text-white'}`}
                                     >
                                         Télécharger
                                     </button>
                                 </div>
                             </div>
                             
                             {imageInputType === 'url' ? (
                                 <div className="flex gap-2">
                                     <input name="image" defaultValue={selectedItem?.image || ''} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue" placeholder="https://..."/>
                                     <div className="w-12 h-11 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0">
                                         <ImageIcon className="w-5 h-5 text-slate-400" />
                                     </div>
                                 </div>
                             ) : (
                                 <div className="w-full h-32 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/5 flex flex-col items-center justify-center cursor-pointer hover:border-brand-blue transition-colors group relative overflow-hidden">
                                     <input type="file" name="image_file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                                     <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-brand-blue transition-colors mb-2 z-10" />
                                     <p className="text-xs font-bold text-brand-navy dark:text-white z-10">Cliquez pour télécharger</p>
                                     <p className="text-[10px] text-slate-400 z-10">SVG, PNG, JPG ou GIF (max. 2MB)</p>
                                 </div>
                             )}
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Extrait / Résumé</label>
                             <textarea name="excerpt" defaultValue={selectedItem?.excerpt || ''} rows={3} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue resize-none"></textarea>
                         </div>
                         <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-white/5 mt-4">
                             <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-brand-navy transition-colors">Annuler</button>
                             <button type="submit" className="px-6 py-2 bg-brand-blue text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg flex items-center gap-2"><Save className="w-4 h-4" /> {selectedItem ? 'Mettre à jour' : 'Publier'}</button>
                         </div>
                     </form>
                 </ModalContainer>
             )}
         </AnimatePresence>

         {/* ── Contract Modal (standalone — outside AnimatePresence) ── */}
         {contractBooking && (
           <ContractModal
             booking={contractBooking}
             onClose={() => setContractBooking(null)}
             company={companyContractSettings}
           />
         )}
    </div>
  );
};

export default AdminDashboard;