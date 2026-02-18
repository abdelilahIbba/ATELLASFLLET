import { 
    AlertCircle, 
    AlertTriangle, 
    CheckCircle2 
} from 'lucide-react';

export const getDaysRemaining = (dateStr: string) => {
    const today = new Date();
    const expiry = new Date(dateStr);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  export const getExpiryStatus = (dateStr: string) => {
      const days = getDaysRemaining(dateStr);
      if (days < 0) return { status: 'Expired', color: 'text-red-600 bg-red-100', icon: AlertCircle, label: 'Expired' };
      if (days <= 7) return { status: 'Critical', color: 'text-red-600 bg-red-100', icon: AlertCircle, label: `${days} Days` };
      if (days <= 15) return { status: 'Warning', color: 'text-orange-600 bg-orange-100', icon: AlertTriangle, label: `${days} Days` };
      if (days <= 30) return { status: 'Notice', color: 'text-yellow-600 bg-yellow-100', icon: AlertCircle, label: `${days} Days` };
      return { status: 'Valid', color: 'text-green-600 bg-green-100', icon: CheckCircle2, label: 'Valid' };
  };
