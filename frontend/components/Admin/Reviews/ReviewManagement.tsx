import React from 'react';
import { 
  Star, 
  ThumbsUp, 
  MessageSquare,
  Eye,
  EyeOff
} from 'lucide-react';
import { Review } from '../../../types';

interface ReviewManagementProps {
  reviews: Review[];
  openModal: (type: string, item: any) => void;
  toggleReviewVisibility: (id: string) => void;
}

const ReviewManagement: React.FC<ReviewManagementProps> = ({ 
  reviews, 
  openModal,
  toggleReviewVisibility
}) => {
  const totalReviews = reviews.length;
  // Calculate average rating
  const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / (totalReviews || 1);
  const formattedRating = avgRating.toFixed(1);

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <h3 className="text-4xl font-bold text-brand-navy dark:text-white font-space mb-2">{formattedRating}</h3>
                <div className="flex items-center gap-1 text-yellow-500 mb-2">
                    {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= Math.round(avgRating) ? 'fill-current' : 'text-slate-300'}`} />)}
                </div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Note Globale</p>
            </div>
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <h3 className="text-4xl font-bold text-green-500 font-space mb-2">98%</h3>
                <ThumbsUp className="w-6 h-6 text-green-500 mb-2" />
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Taux de Recommandation</p>
            </div>
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <h3 className="text-4xl font-bold text-brand-blue font-space mb-2">1.2k</h3>
                <MessageSquare className="w-6 h-6 text-brand-blue mb-2" />
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Total Avis</p>
            </div>
        </div>

        <div className="space-y-4">
            {reviews.map((review) => (
                <div key={review.id} className={`bg-white dark:bg-white/5 border ${review.status === 'Hidden' ? 'border-red-200 dark:border-red-900/30 opacity-75' : 'border-slate-200 dark:border-white/10'} rounded-2xl p-6 hover:border-brand-blue/30 transition-colors`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                                {review.avatar ? <img src={review.avatar} className="w-full h-full object-cover" alt={review.clientName} /> : null}
                            </div>
                            <div>
                                <h4 className="font-bold text-brand-navy dark:text-white flex items-center gap-2">
                                    {review.clientName}
                                    {review.status === 'Hidden' && <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full uppercase">Masqué</span>}
                                </h4>
                                <p className="text-xs text-slate-500">{review.date}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded text-xs font-bold">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" /> {review.rating}.0
                        </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">"{review.comment}"</p>
                    <div className="flex justify-end gap-2">
                        <button 
                            onClick={() => toggleReviewVisibility(review.id)}
                            className={`text-xs font-bold uppercase transition-colors px-3 py-1.5 rounded flex items-center gap-2 ${review.status === 'Hidden' ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'text-slate-500 hover:text-brand-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'}`}
                        >
                            {review.status === 'Hidden' ? <><Eye className="w-3 h-3" /> Afficher</> : <><EyeOff className="w-3 h-3" /> Masquer</>}
                        </button>
                        <button 
                            onClick={() => openModal('review_reply', review)}
                            className="text-xs font-bold text-brand-blue hover:text-blue-600 uppercase transition-colors px-3 py-1.5 bg-blue-50 dark:bg-blue-900/10 rounded flex items-center gap-2"
                        >
                            <MessageSquare className="w-3 h-3" /> Répondre
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default ReviewManagement;
