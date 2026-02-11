export interface Car {
  id: string;
  name: string;
  category: 'Hyper' | 'SUV' | 'Sedan' | 'Convertible';
  pricePerDay: number;
  speed: string; // e.g., "0-60 in 1.9s"
  range: string; // e.g., "600 mi"
  image: string; // Placeholder URL
  features: string[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: 'Shield' | 'Map' | 'Cpu' | 'Zap';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
