import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useGalleryPhotos } from '../hooks/useSiteData';
import './Gallery.css';

export default function Gallery() {
  const { photos: dbPhotos, loading } = useGalleryPhotos();
  const [lightbox, setLightbox] = useState(null);

  const items = (dbPhotos || []).map(p => ({
    id: p.id,
    src: p.url,
    alt: p.title || 'Navkar Engineering'
  }));

  // Distribute items into two rows for the double marquee
  const getRowItems = (arr) => {
    let result = [...arr];
    if (result.length === 0) return [];
    // Ensure we have at least 8 items per row to fill screen and scroll nicely
    while (result.length < 8) {
      result = [...result, ...arr.map(item => ({ ...item, id: `${item.id}-${Math.random()}` }))];
    }
    return result;
  };

  const row1Photos = getRowItems(items.filter((_, idx) => idx % 2 === 0));
  const row2Photos = getRowItems(items.filter((_, idx) => idx % 2 !== 0));

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      {/* Hero */}
      <section className="section-padding-sm bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="badge-blue mb-4">Our Facility</p>
            <h1 className="heading-display text-[clamp(2rem,4vw,3.5rem)] text-gray-900 dark:text-white mb-4">
              Inside Navkar Engineering
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl">
              A view of our state-of-the-art office, workshop, product store, machinery, and team.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery Infinite Slider */}
      <section className="py-12 overflow-hidden">
        {loading && items.length === 0 ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 text-gray-500">No photos available.</div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Row 1: Left Scrolling */}
            {row1Photos.length > 0 && (
              <div className="gallery-marquee-container">
                <div className="gallery-marquee">
                  <div className="gallery-marquee-content">
                    {row1Photos.map((photo, index) => (
                      <div
                        key={`r1-${photo.id}-${index}`}
                        className="gallery-marquee-item"
                        onClick={() => setLightbox(photo)}
                      >
                        <img src={photo.src} alt={photo.alt} loading="lazy" />
                        <div className="gallery-photo-overlay">
                          <span className="gallery-photo-title">{photo.alt}</span>
                        </div>
                      </div>
                    ))}
                    {/* Duplicate set for seamless looping */}
                    {row1Photos.map((photo, index) => (
                      <div
                        key={`r1-dup-${photo.id}-${index}`}
                        className="gallery-marquee-item"
                        onClick={() => setLightbox(photo)}
                      >
                        <img src={photo.src} alt={photo.alt} loading="lazy" />
                        <div className="gallery-photo-overlay">
                          <span className="gallery-photo-title">{photo.alt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Row 2: Right Scrolling */}
            {row2Photos.length > 0 && (
              <div className="gallery-marquee-container gallery-marquee-reverse">
                <div className="gallery-marquee">
                  <div className="gallery-marquee-content">
                    {row2Photos.map((photo, index) => (
                      <div
                        key={`r2-${photo.id}-${index}`}
                        className="gallery-marquee-item"
                        onClick={() => setLightbox(photo)}
                      >
                        <img src={photo.src} alt={photo.alt} loading="lazy" />
                        <div className="gallery-photo-overlay">
                          <span className="gallery-photo-title">{photo.alt}</span>
                        </div>
                      </div>
                    ))}
                    {/* Duplicate set for seamless looping */}
                    {row2Photos.map((photo, index) => (
                      <div
                        key={`r2-dup-${photo.id}-${index}`}
                        className="gallery-marquee-item"
                        onClick={() => setLightbox(photo)}
                      >
                        <img src={photo.src} alt={photo.alt} loading="lazy" />
                        <div className="gallery-photo-overlay">
                          <span className="gallery-photo-title">{photo.alt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightbox.src}
                alt={lightbox.alt}
                className="max-w-full max-h-[88vh] rounded-xl object-contain"
              />
              <p className="text-center text-white/70 text-sm mt-3">{lightbox.alt}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
