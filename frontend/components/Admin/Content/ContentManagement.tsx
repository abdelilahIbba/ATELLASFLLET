import React from 'react';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2 
} from 'lucide-react';
import { BlogPost } from '../../../types';

interface ContentManagementProps {
  blogPosts: BlogPost[];
  openModal: (type: string, item: any) => void;
}

const ContentManagement: React.FC<ContentManagementProps> = ({ blogPosts, openModal }) => {
  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-2xl font-bold text-brand-navy dark:text-white font-space">Gestion de Contenu</h2>
                <p className="text-xs text-slate-500 mt-1">Gérez les articles, actualités et guides de voyage.</p>
            </div>
            <button 
                onClick={() => openModal('blog_form', null)}
                className="px-4 py-2 bg-brand-navy dark:bg-white text-white dark:text-brand-navy rounded-lg text-xs font-bold uppercase flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
                <Plus className="w-4 h-4" /> Nouvel Article
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
                <div key={post.id} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className="h-48 overflow-hidden relative">
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur text-brand-navy dark:text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                            {post.category}
                        </div>
                        <div className="absolute top-4 right-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                post.status === 'Published' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                            }`}>
                                {post.status === 'Published' ? 'Publié' : post.status === 'Draft' ? 'Brouillon' : post.status}
                            </span>
                        </div>
                    </div>
                    <div className="p-6">
                        <h3 className="font-bold text-brand-navy dark:text-white text-lg mb-2 line-clamp-2 leading-tight group-hover:text-brand-blue transition-colors">
                            {post.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                            {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-4 text-xs text-slate-400 font-bold uppercase tracking-wider">
                                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views}</span>
                                <span>{post.date}</span>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => openModal('blog_form', post)}
                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded text-slate-400 hover:text-brand-navy dark:hover:text-white transition-colors"
                                >
                                    <Edit className="w-3 h-3" />
                                </button>
                                <button className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-3 h-3" /></button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default ContentManagement;
