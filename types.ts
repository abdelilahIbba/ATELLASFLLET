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

export interface UserInfo {
  firstName: string;
  lastName: string;
  role: 'client' | 'admin';
  photo?: string;
  email?: string;
  licenseNumber?: string;
  idNumber?: string;
  accessKey?: string; // Unique password/key generated after booking
}

export interface Booking {
  id: string;
  car: Car;
  location: string;
  pickupDate: string;
  returnDate: string;
  user: UserInfo;
  status: 'Confirmed' | 'In Delivery';
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  author: {
    name: string;
    avatar: string;
  };
}

export interface Review {
  id: string;
  clientName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  status: 'Published' | 'Hidden';
  avatar?: string;
}

export interface Message {
  id: string;
  sender: string;
  preview: string;
  time: string;
  unread: boolean;
  type: 'Support' | 'Inquiry' | 'Emergency';
  avatar?: string;
}
