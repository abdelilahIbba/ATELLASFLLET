import { Car, Service, BlogPost } from './types';

export const CARS: Car[] = [
  {
    id: 'c1',
    name: 'Atellas GT Stradale',
    category: 'Hyper',
    pricePerDay: 1200,
    speed: '0-60 in 2.9s',
    range: 'Unlimited',
    image: 'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&q=80&w=800',
    features: ['Hand-stitched Leather', 'V12 Engine', 'Concierge Service'],
  },
  {
    id: 'c2',
    name: 'Range Rover Autobiography',
    category: 'SUV',
    pricePerDay: 850,
    speed: '0-60 in 4.5s',
    range: '500 mi',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=800',
    features: ['Executive Rear Seating', 'All-Terrain', 'Panoramic Roof'],
  },
  {
    id: 'c3',
    name: 'Mercedes S-Class Maybach',
    category: 'Sedan',
    pricePerDay: 950,
    speed: '0-60 in 4.1s',
    range: 'Hybrid',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800',
    features: ['Massage Seats', 'Champagne Cooler', 'Privacy Glass'],
  },
  {
    id: 'c4',
    name: 'Porsche 911 Cabriolet',
    category: 'Convertible',
    pricePerDay: 750,
    speed: '0-60 in 3.2s',
    range: 'Petrol',
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800',
    features: ['Sport Chrono', 'Bose Sound', 'Adaptive Aero'],
  },
];

export const SERVICES: Service[] = [
  {
    id: 's1',
    title: 'Assurance Complète',
    description: 'Conduisez en toute tranquillité grâce à nos plans de couverture premium sans franchise.',
    icon: 'Shield',
  },
  {
    id: 's2',
    title: 'Navigation GPS Mondiale',
    description: 'Systèmes de navigation par satellite de dernière génération inclus dans chaque véhicule.',
    icon: 'Map',
  },
  {
    id: 's3',
    title: 'Chauffeur Professionnel',
    description: 'Service de chauffeur en uniforme optionnel pour les événements professionnels et les transferts aéroport.',
    icon: 'Cpu', 
  },
  {
    id: 's4',
    title: 'Livraison Sans Couture',
    description: 'Nous livrons le véhicule à votre porte, bureau ou terminal privé.',
    icon: 'Zap',
  },
];

export const OFFERS = [
  {
    id: 'o1',
    title: 'Évasions Estivales',
    discount: '20% OFF',
    description: 'Réservez n\'importe quelle décapotable pour 3 jours ou plus et profitez d\'économies exclusives.',
    image: 'https://images.unsplash.com/photo-1566373739773-452f3640246c?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'o2',
    title: 'Élite Corporative',
    discount: 'Upgrade',
    description: 'Surclassement gratuit vers un SUV Exécutif pour tous les titulaires de compte professionnel.',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800',
  },
];

export const TESTIMONIALS = [
  {
    id: 't1',
    name: 'Alexander V.',
    role: 'PDG, TechVentures',
    text: 'Atellas n\'est pas seulement une location de voiture ; c\'est une extension de mon style de vie. Le service de conciergerie est impeccable.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
  },
  {
    id: 't2',
    name: 'Sarah J.',
    role: 'Directrice Mode',
    text: 'L\'état de la flotte est digne d\'une salle d\'exposition. Je compte sur eux pour tous mes besoins de transport durant la fashion week.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
  },
  {
    id: 't3',
    name: 'Marcus L.',
    role: 'Architecte',
    text: 'Réservation fluide, machines incroyables. La catégorie Hyper offre vraiment l\'adrénaline promise.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
  },
];

export const LOCATIONS = [
  { city: 'New York', address: '15 Hudson Yards' },
  { city: 'Los Angeles', address: '90210 Beverly Hills' },
  { city: 'London', address: '1 Canada Square, Canary Wharf' },
  { city: 'Dubai', address: 'Downtown Dubai, Boulevard Plaza' },
  { city: 'Tokyo', address: 'Roppongi Hills Mori Tower' },
  { city: 'Monaco', address: 'Place du Casino' },
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