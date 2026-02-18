import { Car, Service, BlogPost } from './types';

export const CARS: Car[] = [
  {
    id: 'c1',
    name: 'Dacia Logan',
    category: 'Berline',
    pricePerDay: 320,
    speed: 'Boîte Manuelle',
    range: 'Diesel',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200',
    features: ['5 places', 'Climatisation', 'Consommation économique'],
  },
  {
    id: 'c2',
    name: 'Dacia Sandero',
    category: 'Citadine',
    pricePerDay: 290,
    speed: 'Boîte Manuelle',
    range: 'Essence',
    image: 'https://www.dacia.ie/CountriesData/Ireland/images/cars/2025/SanderoBI1Ph2/ProductPlan/Beautyshot/dacia-sandero-bi1-ph2-overview-beautyshot-001_ig_w960_h331.jpg',
    features: ['5 places', 'Climatisation', 'Consommation économique'],
  },
  {
    id: 'c3',
    name: 'Dacia Duster',
    category: 'SUV',
    pricePerDay: 520,
    speed: 'Boîte Manuelle',
    range: 'Diesel',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/2023_Dacia_Duster_IMG_7841.jpg',
    features: ['5 places', 'Climatisation', 'Grand coffre'],
  },
  {
    id: 'c4',
    name: 'Peugeot 208',
    category: 'Citadine',
    pricePerDay: 360,
    speed: 'Boîte Manuelle',
    range: 'Essence',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/2017_Peugeot_208_Active_1.2_facelift_Front.jpg',
    features: ['5 places', 'Climatisation', 'Bluetooth'],
  },
  {
    id: 'c5',
    name: 'Peugeot 301',
    category: 'Berline',
    pricePerDay: 430,
    speed: 'Boîte Manuelle',
    range: 'Diesel',
    image: 'https://images.unsplash.com/photo-1469285994282-454ceb49e63b?auto=format&fit=crop&q=80&w=1200',
    features: ['5 places', 'Climatisation', 'Confort route'],
  },
  {
    id: 'c6',
    name: 'Citroën C3',
    category: 'Citadine',
    pricePerDay: 340,
    speed: 'Boîte Manuelle',
    range: 'Essence',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200',
    features: ['5 places', 'Climatisation', 'Consommation économique'],
  },
  {
    id: 'c7',
    name: 'Renault Clio',
    category: 'Citadine',
    pricePerDay: 330,
    speed: 'Boîte Manuelle',
    range: 'Diesel',
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    features: ['5 places', 'Climatisation', 'Consommation économique'],
  },
  {
    id: 'c8',
    name: 'Hyundai Accent',
    category: 'Berline',
    pricePerDay: 390,
    speed: 'Boîte Automatique',
    range: 'Essence',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/2019_Hyundai_Accent_1.6L,_rear_10.8.19.jpg',
    features: ['5 places', 'Climatisation', 'Confort Pro'],
  },
  {
    id: 'c9',
    name: 'Renault Express',
    category: 'Utilitaire',
    pricePerDay: 480,
    speed: 'Boîte Manuelle',
    range: 'Diesel',
    image: 'https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&q=80&w=1200',
    features: ['2 places', 'Grand volume', 'Idéal livraison'],
  },
  {
    id: 'c10',
    name: 'Kia Picanto',
    category: 'Citadine',
    pricePerDay: 260,
    speed: 'Boîte Manuelle',
    range: 'Essence',
    image: 'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&q=80&w=1200',
    features: ['4 places', 'Climatisation', 'Consommation économique'],
  },
];

export const SERVICES: Service[] = [
  {
    id: 's1',
    title: 'Location Courte & Longue Durée',
    description: 'Formules flexibles adaptées aux particuliers, professionnels et missions longues.',
    icon: 'Shield',
  },
  {
    id: 's2',
    title: 'Transfert Aéroport Rabat-Salé',
    description: 'Prise en charge et restitution rapides à l’aéroport pour vos déplacements sans attente.',
    icon: 'Map',
  },
  {
    id: 's3',
    title: 'Service Entreprise',
    description: 'Comptes corporate avec gestion multi-conducteurs, reporting et facturation centralisée.',
    icon: 'Cpu', 
  },
  {
    id: 's4',
    title: 'Livraison à Domicile à Rabat',
    description: 'Nous livrons votre véhicule à Agdal, Hay Riad, Souissi et quartiers professionnels.',
    icon: 'Zap',
  },
];

export const OFFERS = [
  {
    id: 'o1',
    title: 'Week-end Rabat & Littoral',
    discount: '-15%',
    description: 'Réduction sur les réservations de 3 jours minimum avec kilométrage optimisé.',
    image: 'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'o2',
    title: 'Pack Entreprise Mensuel',
    discount: 'Priorité',
    description: 'Tarification dédiée pour entreprises avec disponibilité prioritaire et support dédié.',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800',
  },
];

export const TESTIMONIALS = [
  {
    id: 't1',
    name: 'Yassine M.',
    role: 'Directeur Commercial, Rabat',
    text: 'Service très professionnel à Rabat. Réservation simple, véhicule propre, restitution rapide.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
  },
  {
    id: 't2',
    name: 'Salma R.',
    role: 'Responsable RH, Hay Riad',
    text: 'Nous utilisons atellaFleet pour nos équipes terrain. Gestion claire et facturation centralisée.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
  },
  {
    id: 't3',
    name: 'Nabil A.',
    role: 'Consultant, Agdal',
    text: 'Transfert aéroport Rabat-Salé impeccable. L’équipe est ponctuelle et le suivi est excellent.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
  },
];

export const LOCATIONS = [
  { city: 'Rabat', address: 'Avenue Fal Ould Oumeir, Agdal' },
  { city: 'Rabat-Salé Aéroport', address: 'Terminal Arrivées – Service Transfert' },
  { city: 'Hay Riad', address: 'Zone d’Affaires – Livraison Entreprise' },
  { city: 'Souissi', address: 'Service Livraison Domicile' },
];

export const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800',
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'b1',
    title: 'Le Grand Road Trip de l\'Atlas : Un Itinéraire en Supercar',
    excerpt: 'Découvrez les routes sinueuses des montagnes du Haut Atlas dans le confort d\'une McLaren 720S. Notre itinéraire organisé vous emmène de Marrakech à Ouarzazate.',
    category: 'Guide de Voyage',
    date: '15 Oct 2024',
    readTime: '6 min de lecture',
    image: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&q=80&w=800',
    author: {
      name: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100'
    }
  },
  {
    id: 'b2',
    title: 'L\'Avenir du Luxe Électrique : Conduire la Lucid Air',
    excerpt: 'Le silence n\'a jamais été aussi puissant. Nous passons en revue le dernier ajout à notre flotte électrique et pourquoi il change la donne pour le transport exécutif.',
    category: 'Revue de Véhicule',
    date: '10 Oct 2024',
    readTime: '4 min de lecture',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800',
    author: {
      name: 'Marc Alistair',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100'
    }
  },
  {
    id: 'b3',
    title: 'Nouvelles Réglementations de la Circulation au Maroc pour 2025',
    excerpt: 'Restez informé des changements à venir concernant les limitations de vitesse et les amendes dans le royaume. Lecture essentielle pour tous les conducteurs.',
    category: 'Juridique',
    date: '05 Oct 2024',
    readTime: '3 min de lecture',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800',
    author: {
      name: 'Équipe Juridique',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100'
    }
  }
];