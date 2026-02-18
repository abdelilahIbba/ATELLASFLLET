import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FleetManagement from '../Admin/Fleet/FleetManagement';
import BookingManagement from '../Admin/Bookings/BookingManagement';
import ClientManagement from '../Admin/Clients/ClientManagement';
import SettingsManagement from '../Admin/Settings/SettingsManagement';
import MessageManagement from '../Admin/Messages/MessageManagement';
import ContentManagement from '../Admin/Content/ContentManagement';
import ReviewManagement from '../Admin/Reviews/ReviewManagement';
import DashboardOverview from '../Admin/Overview/DashboardOverview';
import AnalyticsManagement from '../Admin/Analytics/AnalyticsManagement';
import GPSManagement from '../Admin/Tracking/GPSManagement';
import { UserInfo } from '../../types';
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
  category: 'Hyper' | 'SUV' | 'Sedan' | 'Convertible';
  image: string;
  plate: string;
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
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cin: string; // Carte Nationale d'Identité
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
}

interface Message {
  id: string;
  sender: string;
  preview: string;
  time: string;
  unread: boolean;
  type: 'Support' | 'Inquiry' | 'Emergency';
  avatar?: string;
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
    condition: 'Excellent', location: { lat: 33.5731, lng: -7.5898 }
  },
  { 
    id: 'V-002', name: 'Range Rover Autobiography', category: 'SUV', image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=800', 
    plate: '11029-B-6', branch: 'Marrakech Guebiz', status: 'Available', driver: '-', fuel: 100, odometer: 45200, pricePerDay: 850,
    documents: { insurance: '2024-12-01', visiteTechnique: '2024-11-20', vignette: '2025-01-31', carteGrise: '2026-03-10' },
    condition: 'Good', location: { lat: 31.6295, lng: -7.9811 }
  },
  { 
    id: 'V-003', name: 'Porsche 911 Cabriolet', category: 'Convertible', image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800', 
    plate: '88210-A-1', branch: 'Rabat Agdal', status: 'Maintenance', driver: '-', fuel: 20, odometer: 68000, pricePerDay: 750,
    documents: { insurance: '2025-03-15', visiteTechnique: '2024-10-30', vignette: '2025-01-31', carteGrise: '2027-08-15' },
    condition: 'Service Due', location: { lat: 34.0209, lng: -6.8416 }
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

const INITIAL_BOOKINGS: Booking[] = [
  { id: 'B-101', clientName: 'Amine Harit', vehicleName: 'Atellas GT Stradale', startDate: '2024-10-20', endDate: '2024-10-25', status: 'Active', amount: 15000, paymentStatus: 'Paid' },
  { id: 'B-102', clientName: 'Sarah Benali', vehicleName: 'Range Rover Autobiography', startDate: '2024-11-01', endDate: '2024-11-03', status: 'Confirmed', amount: 4500, paymentStatus: 'Deposit Only' },
  { id: 'B-103', clientName: 'New User', vehicleName: 'Dacia Logan', startDate: '2024-10-26', endDate: '2024-10-28', status: 'Pending', amount: 900, paymentStatus: 'Unpaid' },
];

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
      excerpt: 'Discover the Atlas Mountains and beyond with our curated routes for the adventurous driver.'
  },
  { 
      id: 'P-2', 
      title: 'New Speed Limit Laws in Morocco 2025', 
      category: 'Legal', 
      views: 890, 
      status: 'Published', 
      date: 'Oct 10, 2024',
      image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800',
      excerpt: 'Stay informed about the latest traffic regulations updates coming into effect next year.'
  },
  { 
      id: 'P-3', 
      title: 'The Rise of Electric Luxury', 
      category: 'Industry', 
      views: 450, 
      status: 'Draft', 
      date: 'Oct 28, 2024',
      image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800',
      excerpt: 'How EVs are redefining the standard of luxury transport in Northern Africa.'
  },
];

const MESSAGES_DATA: Message[] = [
  { id: 'M-1', sender: 'Karim B. (Current Renter)', preview: 'I have a flat tire near Settat. Need assistance.', time: '10 min ago', unread: true, type: 'Emergency', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100' },
  { id: 'M-2', sender: 'Leila T.', preview: 'Do you accept crypto payments for the Ferrari?', time: '2 hours ago', unread: false, type: 'Inquiry', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100' },
  { id: 'M-3', sender: 'Yassine O.', preview: 'Booking confirmation #B-9921 received. Thanks!', time: '1 day ago', unread: false, type: 'Support', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100' },
];

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

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isDark, toggleTheme, onNavigate, onLogout, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'fleet' | 'clients' | 'bookings' | 'gps' | 'reviews' | 'blog' | 'messages' | 'settings' | 'analytics'>('overview');
  const [selectedItem, setSelectedItem] = useState<any | null>(null); 
  const [modalType, setModalType] = useState<string | null>(null);
  
  // Modal Tab State for Vehicles & Clients
  const [vehicleModalTab, setVehicleModalTab] = useState<'details' | 'documents'>('details');
  const [clientModalTab, setClientModalTab] = useState<'profile' | 'kyc'>('profile');
  const [imageInputType, setImageInputType] = useState<'url' | 'upload'>('url');

  // --- BOOKING STATE ---
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState('All');
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);
  
  // --- VEHICLE STATE ---
  const [vehicles, setVehicles] = useState<Vehicle[]>(VEHICLE_DATA);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('All');

  // --- CLIENT STATE ---
  const [clients, setClients] = useState<Client[]>(CLIENTS_DATA);
  const [clientSearch, setClientSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('All');

  // --- MESSAGES STATE ---
  const [messages, setMessages] = useState<Message[]>(MESSAGES_DATA);

  // --- REVIEWS STATE ---
  const [reviews, setReviews] = useState<Review[]>(REVIEWS_DATA);

  // --- BLOG STATE ---
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(BLOG_DATA);

  // --- CONTRACT STATE ---
  const [contractContent, setContractContent] = useState('');
  const [isEditingContract, setIsEditingContract] = useState(false);

  // --- NOTIFICATION STATE ---
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'New Booking Request', description: 'Karim B. requested Ferrari SF90', type: 'booking', timestamp: '2 mins ago', read: false },
    { id: '2', title: 'Maintenance Alert', description: 'Mercedes G63 due for service', type: 'alert', timestamp: '1 hour ago', read: false },
    { id: '3', title: 'System Update', description: 'Patch v2.4.1 installed successfully', type: 'system', timestamp: 'Yesterday', read: true },
  ]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

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
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedItem(null);
    setIsEditingContract(false);
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
  const generateContractTemplate = (booking: Booking) => {
    const today = new Date().toLocaleDateString();
    return `
      <div style="font-family: serif; color: black; line-height: 1.6;">
        <div style="text-align: center; margin-bottom: 2rem;">
          <h1 style="font-size: 24px; font-weight: bold; text-transform: uppercase; margin-bottom: 0.5rem;">Contrat de Location de Véhicule</h1>
          <p style="font-size: 14px; color: #666;">Contrat N°: ${booking.id} | Date: ${today}</p>
        </div>
        <div style="margin-bottom: 2rem;">
          <h3 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 0.5rem; margin-bottom: 1rem;">1. LES PARTIES</h3>
          <p><strong>Loueur:</strong> Atellas Fleet S.A.R.L, Casablanca, Maroc.</p>
          <p><strong>Locataire:</strong> ${booking.clientName}</p>
        </div>
        <div style="margin-bottom: 2rem;">
          <h3 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 0.5rem; margin-bottom: 1rem;">2. LE VÉHICULE</h3>
          <p><strong>Marque/Modèle:</strong> ${booking.vehicleName}</p>
          <p>Le Loueur loue par la présente le véhicule décrit ci-dessus au Locataire pour la période indiquée ci-dessous.</p>
        </div>
        <div style="margin-bottom: 2rem;">
          <h3 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 0.5rem; margin-bottom: 1rem;">3. PÉRIODE DE LOCATION ET FRAIS</h3>
          <p><strong>Date de Début:</strong> ${booking.startDate}</p>
          <p><strong>Date de Fin:</strong> ${booking.endDate}</p>
          <p><strong>Montant Total:</strong> ${booking.amount.toLocaleString()} MAD</p>
          <p><strong>Statut de Paiement:</strong> ${booking.paymentStatus}</p>
        </div>
        <div style="margin-bottom: 2rem;">
          <h3 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 0.5rem; margin-bottom: 1rem;">4. CONDITIONS GÉNÉRALES</h3>
          <p>Le Locataire reconnaît avoir reçu le véhicule en bon état. Le Locataire s'engage à payer toutes les amendes, contraventions et péages encourus pendant la période de location. Le véhicule doit être restitué avec le même niveau de carburant qu'au moment de la location.</p>
          <p>La couverture d'assurance est soumise à une franchise de 5 000 MAD pour les dommages causés par la négligence du Locataire.</p>
        </div>
        <div style="margin-top: 4rem; display: flex; justify-content: space-between;">
          <div style="width: 45%;">
            <div style="border-bottom: 1px solid black; height: 40px;"></div>
            <p style="margin-top: 0.5rem;">Signature du Loueur</p>
          </div>
          <div style="width: 45%;">
            <div style="border-bottom: 1px solid black; height: 40px;"></div>
            <p style="margin-top: 0.5rem;">Signature du Locataire</p>
          </div>
        </div>
      </div>
    `;
  };

  const handleOpenContract = (booking: Booking) => {
    setContractContent(generateContractTemplate(booking));
    openModal('contract', booking);
  };

  const handlePrintContract = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Rental Contract</title>');
      printWindow.document.write('</head><body style="padding: 40px;">');
      printWindow.document.write(contractContent);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  // --- CRUD HANDLERS FOR BOOKINGS ---
  
  const handleBookingDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      setBookings(prev => prev.filter(b => b.id !== id));
      setSelectedBookingIds(prev => prev.filter(pid => pid !== id));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selectedBookingIds.length} bookings?`)) {
      setBookings(prev => prev.filter(b => !selectedBookingIds.includes(b.id)));
      setSelectedBookingIds([]);
    }
  };

  const toggleBookingSelection = (id: string) => {
    setSelectedBookingIds(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleSaveBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const amountVal = formData.get('amount');
    const amount = amountVal ? Number(amountVal.toString()) : 0;

    const newBooking: Booking = {
      id: selectedItem?.id || `B-${Math.floor(Math.random() * 9000) + 1000}`,
      clientName: formData.get('clientName')?.toString() || '',
      vehicleName: formData.get('vehicleName')?.toString() || '',
      startDate: formData.get('startDate')?.toString() || '',
      endDate: formData.get('endDate')?.toString() || '',
      amount: amount,
      status: (formData.get('status')?.toString() as any) || 'Pending',
      paymentStatus: (formData.get('paymentStatus')?.toString() as any) || 'Unpaid',
    };

    if (selectedItem) {
      // Edit
      setBookings(prev => prev.map(b => b.id === selectedItem.id ? newBooking : b));
    } else {
      // Add
      setBookings(prev => [newBooking, ...prev]);
    }
    closeModal();
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
  
  const handleVehicleDelete = (id: string) => {
      if (window.confirm('Are you sure you want to remove this vehicle from the fleet?')) {
          setVehicles(prev => prev.filter(v => v.id !== id));
      }
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      const fuelVal = formData.get('fuel');
      const odoVal = formData.get('odometer');
      const priceVal = formData.get('pricePerDay');

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

      const newVehicle: Vehicle = {
          id: selectedItem?.id || `V-${Math.floor(Math.random() * 900) + 100}`,
          name: formData.get('name')?.toString() || '',
          category: (formData.get('category')?.toString() as any) || 'Sedan',
          image: imageUrl || 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800',
          plate: formData.get('plate')?.toString() || '',
          branch: formData.get('branch')?.toString() || '',
          status: (formData.get('status')?.toString() as any) || 'Available',
          driver: formData.get('driver')?.toString() || '-',
          fuel: fuelVal ? Number(fuelVal.toString()) : 0,
          odometer: odoVal ? Number(odoVal.toString()) : 0,
          pricePerDay: priceVal ? Number(priceVal.toString()) : 0,
          documents: {
              insurance: formData.get('doc_insurance')?.toString() || '2025-01-01',
              visiteTechnique: formData.get('doc_visite')?.toString() || '2025-01-01',
              vignette: formData.get('doc_vignette')?.toString() || '2025-01-01',
              carteGrise: formData.get('doc_carte')?.toString() || '2025-01-01'
          },
          condition: selectedItem?.condition || 'Excellent',
          location: selectedItem?.location || { lat: 33.5731, lng: -7.5898 }
      };

      if (selectedItem) {
          setVehicles(prev => prev.map(v => v.id === selectedItem.id ? newVehicle : v));
      } else {
          setVehicles(prev => [newVehicle, ...prev]);
      }
      closeModal();
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

  const handleClientDelete = (id: string) => {
      if (window.confirm('Are you sure you want to remove this client? This action cannot be undone.')) {
          setClients(prev => prev.filter(c => c.id !== id));
      }
  };

  const handleSaveClient = (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      const newClient: Client = {
          id: selectedItem?.id || `C-${Math.floor(Math.random() * 900) + 100}`,
          name: formData.get('name')?.toString() || '',
          email: formData.get('email')?.toString() || '',
          phone: formData.get('phone')?.toString() || '',
          cin: formData.get('cin')?.toString() || '',
          status: (formData.get('status')?.toString() as any) || 'Active',
          kycStatus: (formData.get('kycStatus')?.toString() as any) || 'Pending',
          totalSpent: selectedItem?.totalSpent || 0,
          lastRental: selectedItem?.lastRental || 'Never',
          avatar: selectedItem?.avatar || undefined,
          documents: selectedItem?.documents
      };

      if (selectedItem) {
          setClients(prev => prev.map(c => c.id === selectedItem.id ? newClient : c));
      } else {
          setClients(prev => [newClient, ...prev]);
      }
      closeModal();
  };

  const filteredClients = clients.filter(c => {
      const matchesSearch = 
          c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
          c.cin.toLowerCase().includes(clientSearch.toLowerCase()) ||
          c.email.toLowerCase().includes(clientSearch.toLowerCase());
      
      const matchesFilter = clientFilter === 'All' || c.status === clientFilter;
      return matchesSearch && matchesFilter;
  });


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
                <TabButton id="bookings" icon={CalendarRange} label="Réservations" alertCount={pendingRequests} />
                <TabButton id="clients" icon={Users} label="Clients (KYC)" />
                <TabButton id="gps" icon={MapIcon} label="Suivi GPS en Direct" />
                <TabButton id="messages" icon={MessageSquare} label="Messages" alertCount={MESSAGES_DATA.filter(m => m.unread).length} />
                <TabButton id="reviews" icon={Star} label="Avis & Réputation" />
                <TabButton id="blog" icon={PenTool} label="Blog & Contenu" />
             </nav>

             <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
                <button 
                    onClick={() => setActiveTab('settings')}
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
                  <BookingManagement 
                      bookings={bookings}
                      bookingSearch={bookingSearch}
                      setBookingSearch={setBookingSearch}
                      bookingFilter={bookingFilter}
                      setBookingFilter={setBookingFilter}
                      selectedBookingIds={selectedBookingIds}
                      setSelectedBookingIds={setSelectedBookingIds}
                      handleBulkDelete={handleBulkDelete}
                      openModal={openModal}
                      handleDelete={handleBookingDelete}
                      handleOpenContract={handleOpenContract}
                  />
               )}

               {/* --- FLEET TAB (FULL CRUD) --- */}
               {activeTab === 'fleet' && (
                  <FleetManagement 
                      vehicles={vehicles}
                      vehicleSearch={vehicleSearch}
                      setVehicleSearch={setVehicleSearch}
                      vehicleFilter={vehicleFilter}
                      setVehicleFilter={setVehicleFilter}
                      openModal={openModal}
                      handleDelete={handleVehicleDelete}
                  />
               )}

               {/* --- CLIENTS & KYC TAB --- */}
               {activeTab === 'clients' && (
                  <ClientManagement 
                      clients={clients}
                      clientSearch={clientSearch}
                      setClientSearch={setClientSearch}
                      clientFilter={clientFilter}
                      setClientFilter={setClientFilter}
                      openModal={openModal}
                      handleDelete={handleClientDelete}
                  />
               )}

               {/* --- GPS TRACKING TAB (LIVE SIMULATION) --- */}
               {activeTab === 'gps' && (
                  <GPSManagement />
               )}

               {/* --- MESSAGES TAB --- */}
               {activeTab === 'messages' && (
                  <MessageManagement 
                      messages={messages} 
                      openModal={openModal} 
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


               {/* --- SETTINGS TAB --- */}
               {activeTab === 'settings' && (
                  <SettingsManagement />
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
                         </div>
                         <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                             <div className={vehicleModalTab === 'details' ? 'block' : 'hidden'}>
                                 <div className="space-y-4">
                                     <div className="grid grid-cols-2 gap-4">
                                         <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Modèle</label><input name="name" defaultValue={selectedItem?.name || ''} required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue" placeholder="ex: BMW M4 Competition"/></div>
                                         <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Catégorie</label><select name="category" defaultValue={selectedItem?.category || 'Sedan'} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"><option value="Hyper">Hyper / Supercar</option><option value="SUV">SUV de Luxe</option><option value="Sedan">Berline</option><option value="Convertible">Cabriolet</option></select></div>
                                     </div>
                                     <div className="grid grid-cols-2 gap-4">
                                         <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Immatriculation</label><input name="plate" defaultValue={selectedItem?.plate || ''} required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue font-mono" placeholder="ex: 72819-A-1"/></div>
                                         <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Statut</label><select name="status" defaultValue={selectedItem?.status || 'Available'} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"><option value="Available">Disponible</option><option value="Rented">Loué</option><option value="Maintenance">Maintenance</option><option value="Impounded">Fourrière</option></select></div>
                                     </div>
                                     <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Agence / Lieu</label><input name="branch" defaultValue={selectedItem?.branch || 'Casablanca Anfa'} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"/></div>
                                     <div className="grid grid-cols-3 gap-4">
                                         <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kilométrage (km)</label><input name="odometer" type="number" defaultValue={selectedItem?.odometer || 0} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"/></div>
                                         <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Carburant (%)</label><input name="fuel" type="number" min="0" max="100" defaultValue={selectedItem?.fuel || 100} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"/></div>
                                         <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prix/Jour (MAD)</label><input name="pricePerDay" type="number" defaultValue={selectedItem?.pricePerDay || 1000} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"/></div>
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
                                    {[{ id: 'doc_insurance', label: 'Assurance', key: 'insurance', icon: ShieldAlert },{ id: 'doc_visite', label: 'Visite Technique', key: 'visiteTechnique', icon: Wrench },{ id: 'doc_vignette', label: 'Vignette', key: 'vignette', icon: FileText },{ id: 'doc_carte', label: 'Carte Grise', key: 'carteGrise', icon: FileCheck }].map((doc, idx) => {
                                        const expiryDate = selectedItem?.documents?.[doc.key] || '';
                                        const status = getExpiryStatus(expiryDate);
                                        const Icon = doc.icon;
                                        return (<div key={idx} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col justify-between h-40 relative overflow-hidden group hover:border-brand-blue/30 transition-colors"><div className="flex justify-between items-start z-10"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center text-slate-500"><Icon className="w-4 h-4" /></div><span className="font-bold text-sm text-brand-navy dark:text-white">{doc.label}</span></div><div className={`px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 ${status.color}`}><status.icon className="w-3 h-3" />{status.label}</div></div><div className="space-y-2 z-10"><div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Date d'Expiration</label><input name={doc.id} type="date" defaultValue={expiryDate} className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-xs font-mono text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"/></div></div><div className="absolute inset-0 bg-brand-navy/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"><UploadCloud className="w-8 h-8 text-brand-blue mb-2" /><span className="text-white text-xs font-bold">Mettre à jour</span></div></div>);
                                    })}
                                </div>
                                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl flex items-start gap-3"><div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400"><AlertCircle className="w-5 h-5" /></div><div><h4 className="text-sm font-bold text-blue-800 dark:text-blue-300">Système d'Alertes Auto</h4><p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Le système notifie automatiquement le gestionnaire de flotte 30, 15 et 7 jours avant l'expiration d'un document.</p></div></div>
                             </div>
                         </div>
                         <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-white/10 mt-auto"><button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-brand-navy transition-colors">Annuler</button><button type="submit" className="px-6 py-2 bg-brand-blue text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg flex items-center gap-2"><Save className="w-4 h-4" /> Enregistrer</button></div>
                     </form>
                 </ModalContainer>
             )}

             {/* CLIENT / KYC MODAL */}
             {modalType === 'client_form' && (
                 <ModalContainer title={selectedItem ? `Gérer Client: ${selectedItem.name}` : 'Nouvelle Inscription Client'} onClose={closeModal} width="max-w-4xl">
                     <form onSubmit={handleSaveClient} className="flex flex-col h-[70vh]">
                         <div className="flex border-b border-slate-200 dark:border-white/10 mb-6"><button type="button" onClick={() => setClientModalTab('profile')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${clientModalTab === 'profile' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-500 hover:text-brand-navy dark:hover:text-white'}`}>Profil Personnel</button><button type="button" onClick={() => setClientModalTab('kyc')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${clientModalTab === 'kyc' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-500 hover:text-brand-navy dark:hover:text-white'}`}>Documents KYC {selectedItem?.kycStatus === 'Verified' && <CheckCircle2 className="w-3 h-3 text-green-500" />} {selectedItem?.kycStatus === 'Pending' && <ScanLine className="w-3 h-3 text-orange-500" />}</button></div>
                         <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                             <div className={clientModalTab === 'profile' ? 'block' : 'hidden'}>
                                 <div className="flex items-center gap-6 mb-8"><div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center border-4 border-white dark:border-[#0B1120] shadow-lg relative group cursor-pointer overflow-hidden">{selectedItem?.avatar ? (<img src={selectedItem.avatar} alt="Avatar" className="w-full h-full object-cover" />) : (<Users className="w-10 h-10 text-slate-400" />)}<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><UploadCloud className="w-6 h-6 text-white" /></div></div><div><h4 className="text-xl font-bold text-brand-navy dark:text-white">{selectedItem?.name || 'Nouveau Client'}</h4><div className="flex items-center gap-2 mt-2"><span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Statut Compte :</span><select name="status" defaultValue={selectedItem?.status || 'Active'} className="bg-transparent text-xs font-bold uppercase border border-slate-200 dark:border-white/10 rounded px-2 py-1 outline-none focus:border-brand-blue"><option value="Active">Actif</option><option value="VIP">VIP</option><option value="Blacklisted">Liste Noire</option></select></div></div></div>
                                 <div className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nom Complet</label><input name="name" defaultValue={selectedItem?.name || ''} required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"/></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">CIN (Carte Nationale)</label><input name="cin" defaultValue={selectedItem?.cin || ''} required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue font-mono"/></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label><input name="email" type="email" defaultValue={selectedItem?.email || ''} required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"/></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Téléphone</label><input name="phone" defaultValue={selectedItem?.phone || ''} required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"/></div></div></div>
                             </div>
                             <div className={clientModalTab === 'kyc' ? 'block' : 'hidden'}>
                                 <div className="flex justify-between items-center mb-6 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10"><div><h4 className="text-sm font-bold text-brand-navy dark:text-white">Statut Vérification KYC</h4><p className="text-xs text-slate-500">Validation des documents d'identité</p></div><select name="kycStatus" defaultValue={selectedItem?.kycStatus || 'Pending'} className={`text-xs font-bold uppercase border-none rounded px-3 py-1.5 outline-none cursor-pointer ${selectedItem?.kycStatus === 'Verified' ? 'bg-green-100 text-green-600' : selectedItem?.kycStatus === 'Pending' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}><option value="Pending">En attente</option><option value="Verified">Vérifié</option><option value="Missing">Documents Manquants</option></select></div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-brand-blue transition-colors group cursor-pointer h-48 bg-slate-50/50 dark:bg-white/[0.02]">{selectedItem?.documents?.idCardFront ? (<img src={selectedItem.documents.idCardFront} className="h-full w-full object-contain" alt="ID Front" />) : (<><CreditCard className="w-8 h-8 text-slate-400 mb-2 group-hover:text-brand-blue" /><span className="text-xs font-bold text-brand-navy dark:text-white">CIN (Recto)</span><span className="text-[10px] text-slate-400 mt-1">Glisser-déposer ou cliquer pour télécharger</span></>)}</div><div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-brand-blue transition-colors group cursor-pointer h-48 bg-slate-50/50 dark:bg-white/[0.02]">{selectedItem?.documents?.idCardBack ? (<img src={selectedItem.documents.idCardBack} className="h-full w-full object-contain" alt="ID Back" />) : (<><CreditCard className="w-8 h-8 text-slate-400 mb-2 group-hover:text-brand-blue" /><span className="text-xs font-bold text-brand-navy dark:text-white">CIN (Verso)</span><span className="text-[10px] text-slate-400 mt-1">Glisser-déposer ou cliquer pour télécharger</span></>)}</div><div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-brand-blue transition-colors group cursor-pointer h-48 bg-slate-50/50 dark:bg-white/[0.02] md:col-span-2">{selectedItem?.documents?.license ? (<img src={selectedItem.documents.license} className="h-full w-full object-contain" alt="License" />) : (<><FileText className="w-8 h-8 text-slate-400 mb-2 group-hover:text-brand-blue" /><span className="text-xs font-bold text-brand-navy dark:text-white">Permis de Conduire</span><span className="text-[10px] text-slate-400 mt-1">Glisser-déposer ou cliquer pour télécharger</span></>)}</div></div>
                             </div>
                         </div>
                         <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-white/10 mt-auto"><button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-brand-navy transition-colors">Annuler</button><button type="submit" className="px-6 py-2 bg-brand-blue text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg flex items-center gap-2"><Save className="w-4 h-4" /> Enregistrer Profil Client</button></div>
                     </form>
                 </ModalContainer>
             )}
             
             {/* EDIT/ADD BOOKING MODAL */}
             {modalType === 'booking_form' && (
                 <ModalContainer title={selectedItem ? `Modifier Réservation ${selectedItem.id}` : 'Nouvelle Réservation'} onClose={closeModal}>
                     <form onSubmit={handleSaveBooking} className="space-y-4">
                         <div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nom du Client</label><input name="clientName" defaultValue={selectedItem?.clientName || ''} required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue" placeholder="ex: Amine Harit"/></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Véhicule</label><input name="vehicleName" defaultValue={selectedItem?.vehicleName || ''} required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue" placeholder="ex: Range Rover Auto"/></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date de Début</label><input name="startDate" type="date" defaultValue={selectedItem?.startDate || ''} required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"/></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date de Fin</label><input name="endDate" type="date" defaultValue={selectedItem?.endDate || ''} required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"/></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Montant Total (MAD)</label><input name="amount" type="number" defaultValue={selectedItem?.amount || ''} required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue" placeholder="0.00"/></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Statut Paiement</label><select name="paymentStatus" defaultValue={selectedItem?.paymentStatus || 'Unpaid'} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"><option value="Paid">Payé</option><option value="Deposit Only">Acompte Seulement</option><option value="Unpaid">Impayé</option></select></div></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Statut Réservation</label><select name="status" defaultValue={selectedItem?.status || 'Pending'} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"><option value="Pending">En Attente</option><option value="Confirmed">Confirmé</option><option value="Active">Actif (En Voyage)</option><option value="Completed">Terminé</option><option value="Cancelled">Annulé</option></select></div><div className="pt-4 flex justify-end gap-3"><button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-brand-navy transition-colors">Annuler</button><button type="submit" className="px-6 py-2 bg-brand-blue text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg flex items-center gap-2"><Save className="w-4 h-4" /> Enregistrer Réservation</button></div>
                     </form>
                 </ModalContainer>
             )}
             
             {/* CONTRACT PREVIEW MODAL */}
             {modalType === 'contract' && selectedItem && (
                 <ModalContainer title={`Contrat de Location #${selectedItem.id}`} onClose={closeModal} width="max-w-4xl">
                     <div className="flex flex-col h-[70vh]">
                         <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-white/10"><div className="flex items-center gap-2"><button onClick={() => setIsEditingContract(!isEditingContract)} className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase flex items-center gap-2 transition-colors ${isEditingContract ? 'bg-brand-blue text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'}`}><Edit className="w-3 h-3" /> {isEditingContract ? 'Terminer Édition' : 'Modifier Contenu'}</button></div><div className="flex items-center gap-2"><button onClick={handlePrintContract} className="px-3 py-1.5 bg-brand-navy dark:bg-white text-white dark:text-brand-navy rounded-lg text-xs font-bold uppercase flex items-center gap-2 hover:opacity-90 transition-colors"><Printer className="w-3 h-3" /> Imprimer</button><button onClick={handlePrintContract} className="px-3 py-1.5 bg-brand-teal text-white rounded-lg text-xs font-bold uppercase flex items-center gap-2 hover:bg-teal-600 transition-colors"><Download className="w-3 h-3" /> PDF</button></div></div>
                         <div className="flex-grow bg-white text-black p-8 rounded shadow-inner overflow-y-auto">{isEditingContract ? (<textarea className="w-full h-full p-4 font-serif text-sm border-none outline-none resize-none bg-slate-50" value={contractContent} onChange={(e) => setContractContent(e.target.value)} />) : (<div className="prose max-w-none text-sm font-serif" dangerouslySetInnerHTML={{ __html: contractContent }} />)}</div>
                     </div>
                 </ModalContainer>
             )}

             {/* MESSAGE DETAIL MODAL */}
             {modalType === 'message' && selectedItem && (
                 <ModalContainer title="Détail du Message" onClose={closeModal}>
                     <div className="mb-4"><div className="flex justify-between mb-2"><span className="font-bold text-brand-navy dark:text-white">{selectedItem.sender}</span><span className="text-xs text-slate-500">{selectedItem.time}</span></div><div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5"><p className="text-sm text-slate-600 dark:text-slate-300">{selectedItem.preview}</p></div></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Répondre</label><textarea className="w-full h-24 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm outline-none focus:border-brand-blue" placeholder="Tapez votre réponse..."></textarea><div className="mt-2 flex justify-end"><button className="px-4 py-2 bg-brand-blue text-white rounded-lg text-xs font-bold uppercase flex items-center gap-2"><Send className="w-3 h-3" /> Envoyer</button></div></div>
                 </ModalContainer>
             )}

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
    </div>
  );
};

export default AdminDashboard;