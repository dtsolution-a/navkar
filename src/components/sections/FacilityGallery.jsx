import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, X, ZoomIn } from 'lucide-react';
import { useScrollAnimation, staggerContainer, staggerItem, fadeUpVariants } from '../../hooks/useScrollAnimation';

// Gallery items using real photo paths
const galleryItems = [
  { id: 1, src: '/images/gallery/office-1.jpg', alt: 'Navkar Engineering office', category: 'office', span: 'col-span-2 row-span-2' },
  { id: 2, src: '/images/gallery/machinery-1.jpg', alt: 'Industrial machinery', category: 'machinery', span: '' },
  { id: 3, src: '/images/gallery/store-1.jpg', alt: 'Product store', category: 'store', span: '' },
  { id: 4, src: '/images/gallery/machinery-2.jpg', alt: 'Equipment showcase', category: 'machinery', span: '' },
  { id: 5, src: '/images/gallery/office-2.jpg', alt: 'Team workspace', category: 'office', span: '' },
  { id: 6, src: '/images/gallery/workshop-1.jpg', alt: 'Workshop facility', category: 'workshop', span: 'col-span-2' },
];

const tabs = ['All', 'Office', 'Machinery', 'Store', 'Workshop'];

export default function FacilityGallery() {
  const { ref, isInView } = useScrollAnimation();
  const [activeTab, setActiveTab] = useState('All');
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const filtered = activeTab === 'All'
    ? galleryItems
    : galleryItems.filter(item => item.category === activeTab.toLowerCase());

  return (
    <section className="section-padding bg-gray-50 dark:bg-gray-900/30">
      <div className="container-wide">
        {/* Heading */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeUpVariants}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
        >
          <div>
            <p className="badge-blue mb-4">Our Facility</p>
            <h2 className="heading-display text-[clamp(1.8rem,3.5vw,2.8rem)] text-gray-900 dark:text-white">
              State-of-the-Art Infrastructure
            </h2>
          </div>
          <Link to="/gallery" className="btn-secondary flex-shrink-0">
            View Full Gallery
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex gap-2 mb-8 flex-wrap"
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-accent text-white shadow-glow'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-accent/40'
              }`}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {/* Gallery grid */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <AnimatePresence>
            {filtered.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`${item.span} relative group overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-800 cursor-pointer`}
                style={{ minHeight: '180px' }}
                onClick={() => setLightboxSrc(item.src)}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover min-h-[180px] group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.classList.add('image-shimmer');
                  }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-xs font-medium capitalize">{item.category}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightboxSrc(null)}
          >
            <button
              onClick={() => setLightboxSrc(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <motion.img
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              src={lightboxSrc}
              alt="Facility photo"
              className="max-w-full max-h-[90vh] rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
