import React from 'react';
import { BLOG_POSTS } from '../../constants';
import { ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const BlogSection: React.FC = () => {
  return (
    <section className="py-24 bg-white dark:bg-[#050A14] transition-colors duration-700">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <span className="text-brand-teal font-bold tracking-widest text-xs uppercase mb-2 block">Le Journal</span>
            <h2 className="text-3xl md:text-5xl font-bold text-brand-navy dark:text-white font-space">
              Histoires & <span className="text-brand-blue">Actualités</span>
            </h2>
          </div>
          <button className="text-sm font-bold text-brand-navy dark:text-white hover:text-brand-blue flex items-center gap-2 group transition-colors">
             Voir tous les articles 
             <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post, idx) => (
            <motion.article 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="group cursor-pointer flex flex-col h-full"
            >
              <div className="relative overflow-hidden rounded-2xl aspect-[4/3] mb-6">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                <div className="absolute top-4 left-4">
                   <span className="bg-white/90 dark:bg-black/80 backdrop-blur text-brand-navy dark:text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-lg">
                      {post.category}
                   </span>
                </div>
              </div>

              <div className="flex-grow flex flex-col">
                 <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-3">
                    <span>{post.date}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {post.readTime}
                    </span>
                 </div>

                 <h3 className="text-xl font-bold text-brand-navy dark:text-white font-space mb-3 leading-tight group-hover:text-brand-blue transition-colors">
                    {post.title}
                 </h3>
                 
                 <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                    {post.excerpt}
                 </p>

                 <div className="mt-auto flex items-center gap-3 pt-6 border-t border-slate-100 dark:border-white/10">
                    <img src={post.author.avatar} alt={post.author.name} className="w-8 h-8 rounded-full object-cover" />
                    <span className="text-xs font-bold text-brand-navy dark:text-white">{post.author.name}</span>
                 </div>
              </div>
            </motion.article>
          ))}
        </div>

      </div>
    </section>
  );
};

export default BlogSection;