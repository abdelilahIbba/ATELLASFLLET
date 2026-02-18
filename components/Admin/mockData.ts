import { Vehicle, Client, Booking, Review, BlogPost, Message } from './types';

export const VEHICLE_DATA: Vehicle[] = [
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
  
export const CLIENTS_DATA: Client[] = [
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
  
export const INITIAL_BOOKINGS: Booking[] = [
    { id: 'B-101', clientName: 'Amine Harit', vehicleName: 'Atellas GT Stradale', startDate: '2024-10-20', endDate: '2024-10-25', status: 'Active', amount: 15000, paymentStatus: 'Paid' },
    { id: 'B-102', clientName: 'Sarah Benali', vehicleName: 'Range Rover Autobiography', startDate: '2024-11-01', endDate: '2024-11-03', status: 'Confirmed', amount: 4500, paymentStatus: 'Deposit Only' },
    { id: 'B-103', clientName: 'New User', vehicleName: 'Dacia Logan', startDate: '2024-10-26', endDate: '2024-10-28', status: 'Pending', amount: 900, paymentStatus: 'Unpaid' },
  ];
  
export const REVIEWS_DATA: Review[] = [
    { id: 'R-1', clientName: 'Fatima Z.', rating: 5, comment: 'La voiture était impeccable et la livraison à l\'aéroport s\'est déroulée sans accroc. Le service de conciergerie m\'a fait sentir comme une reine.', date: 'il y a 2 jours', status: 'Published', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100' },
    { id: 'R-2', clientName: 'Mark S.', rating: 4, comment: 'Superbe voiture mais le GPS était en français seulement au début. Facile à régler mais bon à savoir.', date: 'il y a 1 semaine', status: 'Published', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100' },
    { id: 'R-3', clientName: 'Omar K.', rating: 5, comment: 'La GT Stradale est une bête. Le meilleur week-end de ma vie.', date: 'il y a 2 semaines', status: 'Published', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100' },
  ];
  
export const BLOG_DATA: BlogPost[] = [
    { 
        id: 'P-1', 
        title: 'Top 5 des Road Trips depuis Marrakech', 
        category: 'Travel Guide', 
        views: 1250, 
        status: 'Published', 
        date: '15 Oct 2024',
        image: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&q=80&w=800',
        excerpt: 'Découvrez les montagnes de l\'Atlas et au-delà avec nos itinéraires organisés pour le conducteur aventureux.'
    },
    { 
        id: 'P-2', 
        title: 'Nouvelles Lois sur les Limitations de Vitesse au Maroc 2025', 
        category: 'Legal', 
        views: 890, 
        status: 'Published', 
        date: '10 Oct 2024',
        image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800',
        excerpt: 'Restez informé des dernières mises à jour de la réglementation routière entrant en vigueur l\'année prochaine.'
    },
    { 
        id: 'P-3', 
        title: 'L\'Essor du Luxe Électrique', 
        category: 'Industry', 
        views: 450, 
        status: 'Draft', 
        date: '28 Oct 2024',
        image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800',
        excerpt: 'Comment les VE redéfinissent la norme du transport de luxe en Afrique du Nord.'
    },
  ];
  
export const MESSAGES_DATA: Message[] = [
    { id: 'M-1', sender: 'Karim B. (Locataire Actuel)', preview: 'J\'ai un pneu crevé près de Settat. J\'ai besoin d\'assistance.', time: 'il y a 10 min', unread: true, type: 'Emergency', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100' },
    { id: 'M-2', sender: 'Leila T.', preview: 'Acceptez-vous les paiements en crypto pour la Ferrari ?', time: 'il y a 2 heures', unread: false, type: 'Inquiry', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100' },
    { id: 'M-3', sender: 'Yassine O.', preview: 'Confirmation de réservation #B-9921 reçue. Merci !', time: 'il y a 1 jour', unread: false, type: 'Support', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100' },
  ];
