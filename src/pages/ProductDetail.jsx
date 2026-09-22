import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Wind, Settings2, Gauge, Cable, Filter, Zap, Leaf, Star, Settings, Layers, Droplets, Minus, X, ZoomIn, FileText, Loader2 } from 'lucide-react';
import { useCategory, useBrand, useCategories } from '../hooks/useSiteData';
import { useScrollAnimation, staggerContainer, staggerItem, fadeUpVariants } from '../hooks/useScrollAnimation';
import CTASection from '../components/sections/CTASection';

const iconMap = { Wind, Settings2, Gauge, Cable, Filter, Zap, Leaf, Star, Settings, Layers, Droplets, Minus };

// The site's one fixed product catalogue PDF — admin sets a per-product page
// number, and clicking that product opens the catalogue straight to that page
// instead of a plain image lightbox.
const CATALOGUE_PDF_URL = '/Navkar Catalogue 2026 (Actual Size).pdf';

export default function ProductDetail() {
  const { brandId, categorySlug } = useParams();
  const { ref, isInView } = useScrollAnimation();
  const [lightboxImage, setLightboxImage] = useState(null);
  const { category, loading: catLoading } = useCategory(brandId, categorySlug);
  const { brand, loading: brandLoading } = useBrand(brandId);
  const { categories } = useCategories(brandId);

  // Show spinner while loading
  if (catLoading || brandLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!brand || !category) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product not found</h1>
          <Link to="/products" className="btn-primary">← Back to Products</Link>
        </div>
      </div>
    );
  }

  const Icon = iconMap[category.icon] || Settings2;
  const relatedCategories = categories.filter((c) => c.brandId === brandId && c.id !== category.id).slice(0, 3);

  return (
    <div>
      {/* Breadcrumb + Header */}
      <section className="section-padding-sm bg-white dark:bg-gray-950 border-b border-[var(--color-border)]">
        <div className="container-wide">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
            <Link to="/" className="hover:text-accent transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-accent transition-colors">Products</Link>
            <span>/</span>
            <Link to={`/products/${brandId}`} className="hover:text-accent transition-colors capitalize">{brand.name}</Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white">{category.name}</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <span className="badge-gray text-xs">{brand.shortName}</span>
                </div>
              </div>
              <h1 className="heading-display text-[clamp(1.8rem,3.5vw,3rem)] text-gray-900 dark:text-white mb-4">
                {category.name}
              </h1>
              <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
                {category.description}
              </p>
              <div className="mt-6 flex gap-3">
                <Link to="/contact" className="btn-primary">
                  Request Quote
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to={`/products/${brandId}`} className="btn-secondary">
                  <ArrowLeft className="w-4 h-4" />
                  All {brand.shortName}
                </Link>
              </div>
            </motion.div>

            {/* Brand info card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:w-72 card p-6 flex-shrink-0"
            >
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Brand</p>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{brand.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{brand.description}</p>
              <div className="flex items-center gap-2 text-xs text-accent">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Authorized Distributor
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Products list */}
      <section className="section-padding">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <h2 className="heading-display text-2xl text-gray-900 dark:text-white mb-2">
              Products in this Category
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {(category.products || []).length} products available
            </p>
          </motion.div>

          <div className="space-y-4">
            {(category.products || []).map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.4, delay: idx * 0.07 }}
                className="card p-6 hover:border-accent/30 group transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Product image — opens the catalogue PDF at the admin-set page when
                      one is configured, otherwise falls back to the plain image lightbox. */}
                  <div
                    className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group/img relative"
                    onClick={() => {
                      if (product.catalogue_page) {
                        window.open(`${encodeURI(CATALOGUE_PDF_URL)}#page=${product.catalogue_page}`, '_blank', 'noopener,noreferrer');
                      } else if (product.image) {
                        setLightboxImage({ src: product.image, name: product.name });
                      }
                    }}
                  >
                    {product.image ? (
                      <>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                          {product.catalogue_page ? (
                            <FileText className="w-6 h-6 text-white opacity-0 group-hover/img:opacity-100 transition-opacity duration-300" />
                          ) : (
                            <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover/img:opacity-100 transition-opacity duration-300" />
                          )}
                        </div>
                      </>
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center text-2xl font-bold text-gray-300 dark:text-gray-600 ${product.image ? 'hidden' : ''}`}>
                      {idx + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 group-hover:text-accent transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                      {product.description}
                    </p>
                    
                    {/* Specs */}
                    {product.specs && Array.isArray(product.specs) && product.specs.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {product.specs.map((spec) => (
                          <span key={spec} className="tag text-[11px] normal-case tracking-normal">
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0 flex items-start">
                    <Link
                      to="/contact"
                      className="btn-primary py-2 px-4 text-sm"
                    >
                      Enquire
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Related categories */}
      {relatedCategories.length > 0 && (
        <section className="section-padding-sm bg-gray-50 dark:bg-gray-900/30 border-t border-[var(--color-border)]">
          <div className="container-wide">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              More from {brand.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedCategories.map((cat) => {
                const RelIcon = iconMap[cat.icon] || Settings2;
                return (
                  <Link
                    key={cat.id}
                    to={`/products/${cat.brandId}/${cat.slug}`}
                    className="card p-5 group hover:border-accent/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors flex-shrink-0">
                        <RelIcon className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-accent transition-colors">{cat.name}</p>
                        <p className="text-xs text-gray-400">{cat.products.length} products</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <CTASection />

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setLightboxImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative max-w-3xl w-full max-h-[90vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors z-10"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Image */}
              <img
                src={lightboxImage.src}
                alt={lightboxImage.name}
                className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-2xl shadow-2xl"
              />

              {/* Product name caption */}
              <div className="absolute -bottom-10 left-0 right-0 text-center">
                <p className="text-white/70 text-sm font-medium">{lightboxImage.name}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
