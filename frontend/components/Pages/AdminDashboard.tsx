import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate as useRouterNavigate } from 'react-router-dom';
import { adminCarsApi, adminClientsApi, adminBookingsApi, adminContactsApi, adminFinesApi, adminPickupPointsApi, carsApi, api } from '../../services/api';
import type { PickupPoint } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import FleetManagement from '../Admin/Fleet/FleetManagement';
import { VehicleFormModal } from '../Admin/Fleet/components/modal/VehicleFormModal';
import BookingManagement from '../Admin/Bookings/BookingManagement';
import BookingFormModal from '../Admin/Bookings/components/BookingFormModal';
import ClientManagement from '../Admin/Clients/ClientManagement';
import InfractionsManagement from '../Admin/Infractions/InfractionsManagement';
import ExpenseManagement from '../Admin/Expenses/ExpenseManagement';
import SettingsManagement from '../Admin/Settings/SettingsManagement';
import ContractModal, { loadCompanySettings, ContractCompanySettings } from '../Admin/Contracts/ContractModal';
import MessageManagement from '../Admin/Messages/MessageManagement';
import ContentManagement from '../Admin/Content/ContentManagement';
import ReviewManagement from '../Admin/Reviews/ReviewManagement';
import DashboardOverview from '../Admin/Overview/DashboardOverview';
import AnalyticsManagement from '../Admin/Analytics/AnalyticsManagement';
import ContractsAndInvoices from '../Admin/ContractsAndInvoices';
import GPSManagement from '../Admin/Tracking/GPSManagementLive';
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
  ChevronDown,
  ChevronUp,
  Filter,
  LogOut,
  Mail,
  Sparkles,
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
  Share2,
  TrendingDown,
  Clock,
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
  color?: string;
  vin?: string;
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
  dateOfBirth?: string;
  profession?: string;
  addressMorocco?: string;
  addressAbroad?: string;
  driverName?: string;
  driverPhone?: string;
  driverIdNumber?: string;
  driverLicenseNumber?: string;
  driverPassportNumber?: string;
  driverLicense?: string;
  driverLicenseExpiry?: string;
  passportNumber?: string;
  passportIssuedAt?: string;
  passportIssuedDate?: string;
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
  dateOfBirth: u.date_of_birth?.slice(0, 10) ?? '',
  profession: u.profession ?? '',
  addressMorocco: u.address_morocco ?? '',
  addressAbroad: u.address_abroad ?? '',
  driverName: u.driver_name ?? '',
  driverPhone: u.driver_phone ?? '',
  driverIdNumber: u.driver_id_number ?? '',
  driverLicenseNumber: u.driver_permit_number ?? '',
  driverPassportNumber: u.driver_passport_number ?? '',
  driverLicense: u.driver_license_number ?? '',
  driverLicenseExpiry: u.driver_license_expiry_date?.slice(0, 10) ?? '',
  passportNumber: u.passport_number ?? '',
  passportIssuedAt: u.passport_issued_at ?? '',
  passportIssuedDate: u.passport_issued_date?.slice(0, 10) ?? '',
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
  image: (c.image as string) || '',
  plate: c.plate ?? '',
  color: c.color ?? '',
  vin: c.vin ?? '',
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

type AdminTab = 'overview' | 'fleet' | 'clients' | 'bookings' | 'gps' | 'reviews' | 'blog' | 'messages' | 'settings' | 'analytics' | 'infractions' | 'contracts' | 'expenses';
const VALID_ADMIN_TABS: AdminTab[] = ['overview','fleet','clients','bookings','gps','reviews','blog','messages','settings','analytics','infractions','contracts','expenses'];

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
  const [showClientOptional, setShowClientOptional] = useState(false);
  const [imageInputType, setImageInputType] = useState<'url' | 'upload'>('url');
  /** Live preview URL for the image URL input in the vehicle form */
  const [imageUrlPreview, setImageUrlPreview] = useState<string>('');
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
  /** Prix/Jour éditable — pré-rempli depuis le véhicule, modifiable pour tarifs personnalisés */
  const [bfDailyRate, setBfDailyRate] = useState('');
  const [bfPickupId,  setBfPickupId]  = useState<number | ''>('');
  const [bfDropoffId, setBfDropoffId] = useState<number | ''>('');
  /** Selected client in the booking form (pre-filled by the automated flow) */
  const [bfClientId, setBfClientId] = useState('');
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

  // --- QUICK FLOW STATE (Client → Réservation → Contrat) ---
  /** Set right after a client is created — drives the automated booking + contract chain */
  const [quickFlow, setQuickFlow] = useState<{ clientId: string; clientName: string } | null>(null);
  /** When true, the ContractModal auto-opens the RLV PDF preview once the contract is generated */
  const [contractAutoPreview, setContractAutoPreview] = useState(false);

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
    api.get<{ data: unknown[] }>('/admin/cars')
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
    // Pre-select the newly created client when the automated flow is active
    setBfClientId(selectedItem?.clientId ?? quickFlow?.clientId ?? '');
    setBfCarId(selectedItem?.carId ?? '');
    setBfStart(selectedItem?.startDate ?? '');
    setBfEnd(selectedItem?.endDate ?? '');
    setBfAmount(selectedItem?.amount ? String(selectedItem.amount) : '');
    // Prix/Jour : dérivé de la réservation existante (montant ÷ jours) pour conserver
    // les tarifs personnalisés ; sinon tarif catalogue du véhicule.
    if (selectedItem?.amount && selectedItem?.startDate && selectedItem?.endDate) {
      const ms  = new Date(selectedItem.endDate).getTime() - new Date(selectedItem.startDate).getTime();
      const d   = Math.max(1, Math.floor(ms / 86400000) + 1);
      setBfDailyRate(String(Math.round((selectedItem.amount / d) * 100) / 100));
    } else {
      const veh = vehicles.find(v => String(v.id) === String(selectedItem?.carId ?? ''));
      setBfDailyRate(veh?.pricePerDay ? String(veh.pricePerDay) : '');
    }
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
    const rate = parseFloat(bfDailyRate);
    if (bfDailyRate === '' || isNaN(rate) || rate < 0) return;
    const ms = new Date(bfEnd).getTime() - new Date(bfStart).getTime();
    if (ms < 0) return;
    const days = Math.floor(ms / 86400000) + 1;
    setBfAmount(String(Math.round(rate * days * 100) / 100));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bfDailyRate, bfStart, bfEnd]);

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
    setShowClientOptional(Boolean(item?.dateOfBirth || item?.profession));
    setImageInputType('url');
    setImageUrlPreview((item as any)?.image || '');
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
    setImageUrlPreview('');
    setDocFileNames({});
    setModalInfractions([]);
    setInfFormVisible(false);
    // Interrupt the automated flow when a modal is closed manually —
    // remaining steps stay doable via the normal manual path.
    setQuickFlow(null);
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
      // ── Flux automatisé : réservation créée → génération automatique du contrat ──
      // (closeModal clears quickFlow, so capture it first)
      const flow = quickFlow;
      closeModal();
      if (!selectedItem && flow && String(saved.clientId) === String(flow.clientId)) {
        setContractAutoPreview(true);
        handleOpenContract(saved);
      }
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
    fd.set('color',       raw.get('color')?.toString()        ?? '');
    fd.set('vin',         raw.get('vin')?.toString()          ?? '');
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

    // Image: send file or URL to backend
    if (imageInputType === 'upload') {
      const file = raw.get('image_file') as File;
      if (file && file.size > 0) fd.set('image', file);
    } else {
      const imageUrl = raw.get('image')?.toString() ?? '';
      if (imageUrl) fd.set('image_url', imageUrl);
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
      'driver_license_expiry_date', 'date_of_birth', 'profession',
      'address_morocco', 'address_abroad',
      'driver_name', 'driver_phone', 'driver_id_number', 'driver_permit_number',
      'driver_passport_number',
      'passport_number', 'passport_issued_at', 'passport_issued_date',
      'kyc_status',
    ];
    optionalFields.forEach(key => {
      if (formData.get(key) === '') formData.delete(key);
    });
    // Email & password are optional on creation — backend generates placeholders
    if (!selectedItem) {
      if (formData.get('email') === '') formData.delete('email');
      if (formData.get('password') === '') formData.delete('password');
    }
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
        // ── Flux automatisé : Client → Réservation → Contrat ──
        // Redirect to the bookings page and auto-open the reservation modal
        // with the newly created client pre-selected.
        setQuickFlow({ clientId: String(saved.id), clientName: saved.name });
        adminNav('/admin/bookings');
        openModal('booking_form', null);
        return;
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
         <div className={`w-64 flex-shrink-0 ${activeTab === 'gps' ? 'hidden md:flex' : 'flex'} flex-col bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 p-4 shadow-xl z-20 print:hidden`}>
             <div className="px-4 py-4 mb-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
                 <img src="/rlv-emblem.png" alt="RLV Logo" className="w-8 h-8 object-contain drop-shadow-sm" />
                 <div>
                   <h2 className="text-base font-bold font-space text-brand-navy dark:text-white tracking-tight">RLV <span className="text-brand-red">RAHIMI CAR</span></h2>
                   <p className="text-[10px] text-slate-400 uppercase tracking-widest">Admin Tanger</p>
                 </div>
             </div>

             {/* Demo badge in sidebar */}
             {currentUser?.role === 'demo_admin' && (() => {
               const daysLeft = currentUser.demoExpiresAt
                 ? Math.max(0, Math.ceil((new Date(currentUser.demoExpiresAt).getTime() - Date.now()) / 86400000))
                 : null;
               return (
                 <div className={`mb-3 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${daysLeft !== null && daysLeft <= 3 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                   <Clock className="w-4 h-4 flex-shrink-0" />
                   <span>{daysLeft !== null ? `Démo · ${daysLeft} jour${daysLeft !== 1 ? 's' : ''} restant${daysLeft !== 1 ? 's' : ''}` : 'Mode Démo'}</span>
                 </div>
               );
             })()}

             <nav className="space-y-1 flex-grow overflow-y-auto custom-scrollbar">
                {/* Filter tabs for demo_admin — only show allowed ones */}
                {(() => {
                  const allowed = currentUser?.role === 'demo_admin' ? (currentUser.demoPermissions ?? []) : null;
                  const can = (id: string) => allowed === null || allowed.includes(id);
                  return (
                    <>
                      {can('overview')     && <TabButton id="overview"     icon={LayoutDashboard} label="Tableau de Bord" />}
                      {can('analytics')    && <TabButton id="analytics"    icon={BarChart3}       label="Analytique & Rapports" />}
                      {can('fleet')        && <TabButton id="fleet"        icon={Car}             label="Flotte & Inventaire" />}
                      {can('infractions')  && <TabButton id="infractions"  icon={ShieldAlert}     label="Infractions" />}
                      {can('bookings')     && <TabButton id="bookings"     icon={CalendarRange}   label="Réservations" alertCount={pendingRequests} />}
                      {can('contracts')    && <TabButton id="contracts"    icon={FileSignature}   label="Contrats & Factures" />}
                      {can('expenses')     && <TabButton id="expenses"     icon={TrendingDown}    label="Dépenses Agence" />}
                      {can('clients')      && <TabButton id="clients"      icon={Users}           label="Clients (KYC)" />}
                      {can('gps')          && <TabButton id="gps"          icon={MapIcon}         label="Suivi GPS en Direct" />}
                      {can('messages')     && <TabButton id="messages"     icon={MessageSquare}   label="Messages" alertCount={messages.filter(m => m.unread).length} />}
                      {can('reviews')      && <TabButton id="reviews"      icon={Star}            label="Avis & Réputation" />}
                      {can('blog')         && <TabButton id="blog"         icon={PenTool}         label="Blog & Contenu" />}
                    </>
                  );
                })()}
             </nav>

             <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
                {/* Only real admins can access system settings */}
                {currentUser?.role !== 'demo_admin' && (
                  <button 
                      onClick={() => adminNav('/admin/settings')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-brand-blue/10 text-brand-blue font-bold shadow-sm' : 'text-slate-500 hover:text-brand-navy dark:hover:text-white'}`}
                  >
                      <Settings className="w-5 h-5" />
                      <span className="font-medium text-sm">Paramètres Système</span>
                  </button>
                )}
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
         <div className="min-w-0 flex-grow bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden relative flex flex-col z-10 print:w-full print:border-none print:shadow-none print:bg-white print:dark:bg-white print:text-black">
            {activeTab === 'gps' && (
              <nav className="border-b border-slate-200 p-2 md:hidden" aria-label="Navigation administration">
                <select value="/admin/gps" onChange={event => adminNav(event.target.value)}
                  aria-label="Vue administration" className="w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-sm dark:bg-slate-900 dark:text-white">
                  <option value="/admin">Tableau de Bord</option>
                  <option value="/admin/fleet">Flotte &amp; Inventaire</option>
                  <option value="/admin/bookings">Réservations</option>
                  <option value="/admin/contracts">Contrats &amp; Factures</option>
                  <option value="/admin/gps">Suivi GPS des voitures</option>
                  <option value="/admin/settings">Paramètres Système</option>
                </select>
              </nav>
            )}
            
            {/* Demo mode top banner */}
            {currentUser?.role === 'demo_admin' && (() => {
              const daysLeft = currentUser.demoExpiresAt
                ? Math.max(0, Math.ceil((new Date(currentUser.demoExpiresAt).getTime() - Date.now()) / 86400000))
                : null;
              const isUrgent = daysLeft !== null && daysLeft <= 3;
              return (
                <div className={`flex items-center justify-between px-6 py-2 text-xs font-semibold print:hidden ${isUrgent ? 'bg-red-500 text-white' : 'bg-amber-400 text-amber-900'}`}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      Mode Démo — accès limité aux modules autorisés.
                      {daysLeft !== null && ` Votre période d'essai expire dans ${daysLeft} jour${daysLeft !== 1 ? 's' : ''} (${currentUser.demoExpiresAt}).`}
                    </span>
                  </div>
                  {isUrgent && <span className="font-bold uppercase text-[10px] tracking-widest animate-pulse">Expiration imminente !</span>}
                </div>
              );
            })()}

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
                            expenses: "Dépenses Agence",
                            bookings: "Réservations",
                            contracts: "Contrats & Factures",
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
                  <AnalyticsManagement isDemoUser={currentUser?.role === 'demo_admin'} />
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
                  <GPSManagement canManageMappings={currentUser?.role === 'admin'} />
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


               {/* --- CONTRACTS & INVOICES TAB --- */}
               {activeTab === 'contracts' && <ContractsAndInvoices />}

               {/* --- EXPENSES TAB --- */}
               {activeTab === 'expenses' && <ExpenseManagement />}

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
                  <VehicleFormModal
                      selectedItem={selectedItem}
                      onClose={closeModal}
                      onSubmit={handleSaveVehicle}
                      vehicleModalTab={vehicleModalTab}
                      setVehicleModalTab={setVehicleModalTab}
                      modalQty={modalQty}
                      setModalQty={setModalQty}
                      modalUnitPlates={modalUnitPlates}
                      setModalUnitPlates={setModalUnitPlates}
                      imageInputType={imageInputType}
                      setImageInputType={setImageInputType}
                      imageUrlPreview={imageUrlPreview}
                      setImageUrlPreview={setImageUrlPreview}
                      docFileNames={docFileNames}
                      setDocFileNames={setDocFileNames}
                      modalInfractions={modalInfractions}
                      modalInfLoading={modalInfLoading}
                      infFormVisible={infFormVisible}
                      setInfFormVisible={setInfFormVisible}
                      infFormSaving={infFormSaving}
                      infForm={infForm}
                      setInfForm={setInfForm}
                      handleMarkInfPaid={handleMarkInfPaid}
                      handleDeleteInfraction={handleDeleteInfraction}
                      handleAddInfraction={handleAddInfraction}
                      blankInfForm={blankInfForm}
                  />
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
                     <form key={selectedItem?.id ?? 'new'} onSubmit={handleSaveClient} className="flex flex-col h-[80vh]" autoComplete="off">
                         {/* Hidden inputs to prevent Chrome/Edge from injecting saved credentials into phone & password */}
                         <input type="text" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
                         <input type="password" style={{ display: 'none' }} tabIndex={-1} autoComplete="new-password" />

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

                              {/* -- PROFILE TAB -- */}
                              <div className={clientModalTab === 'profile' ? 'block space-y-4' : 'hidden'}>
                                  {/* Avatar + status header */}
                                  <div className="flex items-center gap-5 p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl">
                                      <label className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center border-4 border-white dark:border-[#0B1120] shadow-md relative group cursor-pointer overflow-hidden shrink-0">
                                          <input type="file" name="avatar" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                              onChange={e => setDocFileNames(prev => ({ ...prev, avatar: e.target.files?.[0]?.name ?? '' }))} />
                                          {selectedItem?.avatar
                                              ? <img src={selectedItem.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                              : <Users className="w-8 h-8 text-slate-400 z-10" />}
                                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                                              <UploadCloud className="w-5 h-5 text-white" />
                                          </div>
                                      </label>
                                      <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 flex-wrap">
                                              <h4 className="text-lg font-bold text-brand-navy dark:text-white truncate">{selectedItem?.name || 'Nouveau Client'}</h4>
                                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                                                  {selectedItem ? 'Édition Profil' : 'Nouvelle Inscription'}
                                              </span>
                                          </div>
                                          {docFileNames.avatar && <p className="text-[10px] text-green-600 font-bold mt-0.5">✓ {docFileNames.avatar}</p>}
                                          <div className="flex items-center gap-2 mt-2">
                                              <span className="text-xs text-slate-500 uppercase font-bold">Statut :</span>
                                              <select name="status" defaultValue={selectedItem?.status || 'Active'} className="bg-white dark:bg-slate-900 text-xs font-bold uppercase border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1 outline-none focus:border-brand-blue text-brand-navy dark:text-white shadow-sm">
                                                  <option value="Active">Actif</option>
                                                  <option value="VIP">VIP</option>
                                                  <option value="Blacklisted">Liste Noire</option>
                                              </select>
                                          </div>
                                      </div>
                                  </div>

                                  {/* Two main columns: Moroccan Identity/Permis vs Passport/International */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {/* COLONNE 1 : IDENTITÉ NATIONALE & PERMIS (MAROC) */}
                                      <div className="bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/10 rounded-2xl p-4 space-y-3.5">
                                          <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-white/10 text-brand-navy dark:text-white font-bold text-sm">
                                              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                                  <CreditCard className="w-4 h-4" />
                                              </div>
                                              <span>Identité & Permis (Maroc)</span>
                                          </div>

                                          {/* Nom Complet */}
                                          <div>
                                              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                                  Nom Complet <span className="text-red-500">*</span>
                                              </label>
                                              <input name="name" defaultValue={selectedItem?.name || ''} required autoComplete="off" className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue shadow-sm" placeholder="Prénom Nom"/>
                                          </div>

                                          {/* CIN */}
                                          <div>
                                              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                                  CIN (Carte Nationale)
                                              </label>
                                              <input name="national_id" defaultValue={selectedItem?.cin || ''} autoComplete="off" className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue font-mono uppercase shadow-sm" placeholder="AB123456"/>
                                          </div>

                                          {/* Permis de Conduire & Expiration */}
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                              <div>
                                                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                                      N° Permis de Conduire
                                                  </label>
                                                  <input name="driver_license_number" defaultValue={selectedItem?.driverLicense || ''} autoComplete="off" className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue font-mono shadow-sm" placeholder="B-123456"/>
                                              </div>
                                              <div>
                                                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                                      Expiration Permis
                                                  </label>
                                                  <input name="driver_license_expiry_date" type="date" defaultValue={selectedItem?.driverLicenseExpiry || ''} className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue shadow-sm"/>
                                              </div>
                                          </div>

                                          {/* Permis délivré à */}
                                          <div>
                                              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                                  Permis Délivré à <span className="font-semibold normal-case text-slate-400">(optionnel)</span>
                                              </label>
                                              <input name="driver_license_issued_at" defaultValue={selectedItem?.driverLicenseIssuedAt || ''} autoComplete="off" className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue shadow-sm" placeholder="Ville de délivrance (ex: Casablanca)"/>
                                          </div>

                                          {/* Adresse au Maroc */}
                                          <div>
                                              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                                  Adresse au Maroc <span className="font-semibold normal-case text-slate-400">(optionnel)</span>
                                              </label>
                                              <input name="address_morocco" defaultValue={selectedItem?.addressMorocco || ''} autoComplete="off" className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue shadow-sm" placeholder="Adresse de résidence au Maroc"/>
                                          </div>
                                      </div>

                                      {/* COLONNE 2 : PASSEPORT & INTERNATIONAL */}
                                      <div className="bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/10 rounded-2xl p-4 space-y-3.5 flex flex-col">
                                          <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-white/10 text-brand-navy dark:text-white font-bold text-sm">
                                              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                                  <Globe className="w-4 h-4" />
                                              </div>
                                              <span>Passeport & International</span>
                                          </div>

                                          {/* Passport N° */}
                                          <div>
                                              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                                  Passeport N° <span className="font-semibold normal-case text-slate-400">(optionnel)</span>
                                              </label>
                                              <input name="passport_number" defaultValue={selectedItem?.passportNumber || ''} autoComplete="off" className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue font-mono uppercase shadow-sm" placeholder="N° de passeport"/>
                                          </div>

                                          {/* Passeport Délivré à & Le */}
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                              <div>
                                                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                                      Délivré à <span className="font-semibold normal-case text-slate-400">(passeport)</span>
                                                  </label>
                                                  <input name="passport_issued_at" defaultValue={selectedItem?.passportIssuedAt || ''} autoComplete="off" className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue shadow-sm" placeholder="Ville / Autorité"/>
                                              </div>
                                              <div>
                                                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                                      Délivré le <span className="font-semibold normal-case text-slate-400">(date)</span>
                                                  </label>
                                                  <input name="passport_issued_date" type="date" defaultValue={selectedItem?.passportIssuedDate || ''} className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue shadow-sm"/>
                                              </div>
                                          </div>

                                          {/* Adresse à l'Étranger */}
                                          <div>
                                              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                                  Adresse à l'Étranger <span className="font-semibold normal-case text-slate-400">(optionnel)</span>
                                              </label>
                                              <input name="address_abroad" defaultValue={selectedItem?.addressAbroad || ''} autoComplete="off" className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue shadow-sm" placeholder="Adresse à l'étranger (si applicable)"/>
                                          </div>

                                          <div className="p-3 bg-brand-blue/5 border border-brand-blue/10 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-auto">
                                              <span className="font-bold text-brand-blue">Note :</span> Ces champs sont destinés aux clients non-résidents ou MRE lors de l'établissement du contrat.
                                          </div>
                                      </div>
                                  </div>

                                  {/* Conducteur Supplémentaire (optionnel) */}
                                  <div className="bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/10 rounded-2xl p-4 space-y-3.5">
                                      <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-white/10 text-brand-navy dark:text-white font-bold text-sm">
                                          <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                                              <Car className="w-4 h-4" />
                                          </div>
                                          <span>Conducteur Supplémentaire</span>
                                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                                              Optionnel
                                          </span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                          Si le client loue avec un conducteur dédié, ses informations seront reportées sur le contrat.
                                      </p>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          <div>
                                              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Nom & Prénom</label>
                                              <input name="driver_name" defaultValue={selectedItem?.driverName || ''} autoComplete="off" className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue shadow-sm" placeholder="Nom du conducteur"/>
                                          </div>
                                          <div>
                                              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Téléphone</label>
                                              <input name="driver_phone" defaultValue={selectedItem?.driverPhone || ''} autoComplete="off" className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue shadow-sm" placeholder="+212 6xx-xxxxxx"/>
                                          </div>
                                          <div>
                                              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">CIN</label>
                                              <input name="driver_id_number" defaultValue={selectedItem?.driverIdNumber || ''} autoComplete="off" className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue font-mono uppercase shadow-sm" placeholder="AB123456"/>
                                          </div>
                                          <div>
                                              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">N° Permis</label>
                                              <input name="driver_permit_number" defaultValue={selectedItem?.driverLicenseNumber || ''} autoComplete="off" className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue font-mono shadow-sm" placeholder="B-123456"/>
                                          </div>
                                          <div>
                                              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Passeport N°</label>
                                              <input name="driver_passport_number" defaultValue={selectedItem?.driverPassportNumber || ''} autoComplete="off" className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue font-mono uppercase shadow-sm" placeholder="N° de passeport"/>
                                          </div>
                                      </div>
                                  </div>

                                  {/* Coordonnées & Accès (Email, Téléphone, Mot de passe) */}
                                  <div className="bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/10 rounded-2xl p-4 space-y-3.5">
                                      <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-white/10 text-brand-navy dark:text-white font-bold text-sm">
                                          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                              <Mail className="w-4 h-4" />
                                          </div>
                                          <span>Coordonnées & Accès</span>
                                      </div>

                                      <div className={`grid grid-cols-1 ${!selectedItem ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
                                          <div>
                                              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                                  Email <span className="font-semibold normal-case text-slate-400">(optionnel)</span>
                                              </label>
                                              <input name="email" type="email" defaultValue={selectedItem?.email || ''} autoComplete="off" className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue shadow-sm" placeholder="client@exemple.com"/>
                                          </div>
                                          <div>
                                              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                                  Téléphone <span className="font-semibold normal-case text-slate-400">(Téléphone Contrat)</span>
                                              </label>
                                              <input name="phone" defaultValue={selectedItem?.phone || ''} autoComplete="off" className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue shadow-sm" placeholder="+212 6xx-xxxxxx"/>
                                          </div>
                                          {!selectedItem && (
                                              <div>
                                                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                                      Mot de passe <span className="font-semibold normal-case text-slate-400">(optionnel — généré si vide)</span>
                                                  </label>
                                                  <input name="password" type="password" autoComplete="new-password" className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue shadow-sm" placeholder="••••••••"/>
                                              </div>
                                          )}
                                      </div>
                                  </div>

                                  {/* Informations Complémentaires (Date de naissance, Profession) - Optionnel / Suggestif */}
                                  <div className="bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/10 rounded-2xl p-4">
                                      <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setShowClientOptional(prev => !prev)}>
                                          <div className="flex items-center gap-2 text-brand-navy dark:text-white font-bold text-sm">
                                              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                                  <Sparkles className="w-4 h-4" />
                                              </div>
                                              <span>Informations Complémentaires</span>
                                              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                                                  Optionnel / Suggestif
                                              </span>
                                          </div>
                                          <button type="button" className="text-slate-400 hover:text-brand-navy dark:hover:text-white transition-colors p-1">
                                              {showClientOptional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                          </button>
                                      </div>

                                      {showClientOptional && (
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3.5 mt-3 border-t border-slate-200 dark:border-white/10 animate-fadeIn">
                                              <div>
                                                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                                      Date de Naissance <span className="font-semibold normal-case text-slate-400">(optionnel)</span>
                                                  </label>
                                                  <input name="date_of_birth" type="date" defaultValue={selectedItem?.dateOfBirth || ''} className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue shadow-sm" />
                                              </div>
                                              <div>
                                                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                                                      Profession <span className="font-semibold normal-case text-slate-400">(optionnel)</span>
                                                  </label>
                                                  <input name="profession" defaultValue={selectedItem?.profession || ''} autoComplete="off" className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue shadow-sm" placeholder="Profession du client" />
                                              </div>
                                          </div>
                                      )}
                                  </div>
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
                 <BookingFormModal
                     selectedItem={selectedItem}
                     onClose={closeModal}
                     onSubmit={handleSaveBooking}
                     isSaving={isSaving}
                     quickFlow={quickFlow}
                     clients={clients}
                     vehicles={vehicles}
                     pickupPoints={pickupPoints}
                     bfClientId={bfClientId}
                     setBfClientId={setBfClientId}
                     bfCarId={bfCarId}
                     setBfCarId={setBfCarId}
                     bfStart={bfStart}
                     setBfStart={setBfStart}
                     bfEnd={bfEnd}
                     setBfEnd={setBfEnd}
                     bfDailyRate={bfDailyRate}
                     setBfDailyRate={setBfDailyRate}
                     bfAmount={bfAmount}
                     setBfAmount={setBfAmount}
                     bfPickupId={bfPickupId}
                     setBfPickupId={setBfPickupId}
                     bfDropoffId={bfDropoffId}
                     setBfDropoffId={setBfDropoffId}
                     bfConflict={bfConflict}
                     setBfConflict={setBfConflict}
                     bfBookedPeriods={bfBookedPeriods}
                 />
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
             onClose={() => { setContractBooking(null); setContractAutoPreview(false); }}
             company={companyContractSettings}
             autoOpenPreview={contractAutoPreview}
           />
         )}
    </div>
  );
};

export default AdminDashboard;
