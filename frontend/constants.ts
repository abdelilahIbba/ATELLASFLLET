import { Service, BlogPost } from './types';

export const SERVICES: Service[] = [
  {
    id: 's1',
    title: 'Location Courte & Longue Durée',
    description: 'Formules flexibles adaptées aux particuliers, professionnels et missions longues.',
    icon: 'Shield',
  },
  {
    id: 's2',
    title: 'Transfert Aéroport Tanger Ibn Battouta',
    description: 'Prise en charge et restitution rapides à l’aéroport de Tanger pour vos déplacements sans attente.',
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
    title: 'Livraison à Domicile à Tanger',
    description: 'Nous livrons votre véhicule à Malabata, Centre-ville, Tanger Med et zones d\'affaires.',
    icon: 'Zap',
  },
];

export const OFFERS = [
  {
    id: 'o1',
    title: 'Week-end Tanger & Littoral Nord',
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
    role: 'Client Particulier, Tanger',
    text: 'Service très professionnel chez RLV Rahimi Car. Véhicule propre, ponctualité et restitution sans souci.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
  },
  {
    id: 't2',
    name: 'Salma R.',
    role: 'Entreprise Partenaire, Tanger Med',
    text: 'Nous faisons appel à RLV Rahimi Car pour nos délégations. Disponibilité 7j/7 et véhicules impeccables.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
  },
  {
    id: 't3',
    name: 'Nabil A.',
    role: 'Voyageur d\'affaires, Tanger',
    text: 'Transfert aéroport Tanger Ibn Battouta à l\'heure exacte. Équipe accueillante et démarche rapide.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
  },
];

export const LOCATIONS = [
  { city: 'Tanger Agence (Lot El Nahda)', address: 'LOT EL NAHDA RUE 37 N°12 BLOC 38' },
  { city: 'Tanger Aéroport Ibn Battouta', address: 'Terminal Arrivées – Service Transfert' },
  { city: 'Tanger Ville Gare TGV', address: 'Accueil Voyageurs TGV' },
  { city: 'Tanger Port Med', address: 'Service Passagers & Ferry' },
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
