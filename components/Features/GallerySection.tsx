import React from 'react';
import { GALLERY_IMAGES } from '../../constants';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';

const GallerySection: React.FC = () => {
  return (
    <section className="py-24 bg-brand-light dark:bg-brand-navy transition-colors duration-700 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
         <span className="text-brand-teal font-bold tracking-widest text-xs uppercase mb-2 block">The Showroom</span>
         <h2 className="text-4xl font-bold text-brand-navy dark:text-white font-space">
            Visual <span className="text-brand-blue">Excellence</span>
         </h2>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-4 px-4 md:px-8 space-y-4">
        {GALLERY_IMAGES.map((src, index) => (
            <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group rounded-xl overflow-hidden break-inside-avoid"
            >
                <img 
                    src={src} 
                    alt="Gallery" 
                    className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0 grayscale md:grayscale"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="bg-white/10 backdrop-blur-md p-3 rounded-full text-white hover:bg-white hover:text-brand-navy transition-all transform translate-y-4 group-hover:translate-y-0">
                        <Camera className="w-6 h-6" />
                    </button>
                </div>
            </motion.div>
        ))}
      </div>
    </section>
  );
};

export default GallerySection;