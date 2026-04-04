export interface Vehicle {
    id: string;
    name: string;
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

export interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    cin: string; // Carte Nationale d'Identité (national_id)
    driverLicense?: string;        // driver_license_number
    driverLicenseExpiry?: string;  // driver_license_expiry_date
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

export interface Booking {
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
    /** 1-based unit slot assigned by the backend (e.g. Logan #2) */
    unitNumber?: number;
    /** Plate of the specific unit assigned */
    unitPlate?: string;
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

export interface BlogPost {
    id: string;
    title: string;
    category: string;
    views: number;
    status: 'Published' | 'Draft';
    date: string;
    image: string;
    excerpt: string;
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

export interface Fine {
    id: string;
    date: string;
    type: 'Radar' | 'Parking' | 'Speeding' | 'Police Check';
    amount: number;
    vehicleId: string;
    driverName: string;
    status: 'Paid' | 'Unpaid' | 'Disputed';
    location: string;
}

// ─── Infractions (car-linked fines, richer than Fine) ────────────────────────

export type InfractionType =
    | 'Radar'
    | 'Parking'
    | 'Speeding'
    | 'Police Check'
    | 'insurance_expired'
    | 'visite_expired'
    | 'seatbelt'
    | 'phone'
    | 'overtaking'
    | 'missing_docs'
    | 'unpaid_toll';

export interface Infraction {
    id: string;
    car_id: string | number;
    driver_name?: string;
    /** ISO date string YYYY-MM-DD */
    date: string;
    type: InfractionType;
    amount: number;
    location?: string;
    status: 'Paid' | 'Unpaid' | 'Disputed';
    /** Payment due date YYYY-MM-DD */
    due_date?: string;
    /** Official notification / PV reference number */
    notification_ref?: string;
    notes?: string;
    /** ID of the admin/agent who recorded this infraction */
    user_id?: string | number;
    /** Name of the admin/agent who recorded this infraction */
    user_name?: string;
    /** Resolved car name (make + model) */
    car_name?: string;
    /** Resolved car plate */
    car_plate?: string;
}

export interface MaintenanceLog {
    id: string;
    vehicleId: string;
    type: 'Oil Change' | 'Tires' | 'Brakes' | 'General Service';
    date: string;
    cost: number;
    provider: string;
    status: 'Completed' | 'Scheduled';
}

export interface AdminDashboardProps {
    isDark: boolean;
    toggleTheme: () => void;
    onNavigate: (path: string) => void;
}
