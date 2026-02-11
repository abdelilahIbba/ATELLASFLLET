import { Car, Service } from './types';

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
    title: 'Comprehensive Insurance',
    description: 'Drive with absolute peace of mind with our premium zero-deductible coverage plans.',
    icon: 'Shield',
  },
  {
    id: 's2',
    title: 'Global GPS Navigation',
    description: 'Latest generation satellite navigation systems included in every vehicle.',
    icon: 'Map',
  },
  {
    id: 's3',
    title: 'Professional Chauffeur',
    description: 'Optional uniformed chauffeur service for business events and airport transfers.',
    icon: 'Cpu', 
  },
  {
    id: 's4',
    title: 'Seamless Delivery',
    description: 'We deliver the vehicle to your doorstep, office, or private terminal.',
    icon: 'Zap',
  },
];

export const OFFERS = [
  {
    id: 'o1',
    title: 'Summer Escapes',
    discount: '20% OFF',
    description: 'Book any convertible for 3+ days and enjoy exclusive savings.',
    image: 'https://images.unsplash.com/photo-1566373739773-452f3640246c?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'o2',
    title: 'Corporate Elite',
    discount: 'Upgrade',
    description: 'Free upgrade to Executive SUV for all business account holders.',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800',
  },
];

export const TESTIMONIALS = [
  {
    id: 't1',
    name: 'Alexander V.',
    role: 'CEO, TechVentures',
    text: 'Atellas isn\'t just car rental; it\'s an extension of my lifestyle. The concierge service is impeccable.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
  },
  {
    id: 't2',
    name: 'Sarah J.',
    role: 'Fashion Director',
    text: 'The fleet condition is showroom perfect. I rely on them for all my fashion week transport needs.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
  },
  {
    id: 't3',
    name: 'Marcus L.',
    role: 'Architect',
    text: 'Seamless booking, incredible machines. The Hyper category truly delivers the adrenaline promised.',
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