import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { Search, ArrowRight, Filter, Wind, Settings2, Gauge, Cable, Layers, Zap, Leaf, Star, Settings, Loader2 } from 'lucide-react';
import { useBrands, useCategories } from '../hooks/useSiteData';
import { useScrollAnimation, fadeUpVariants, staggerContainer, staggerItem } from '../hooks/useScrollAnimation';

const iconMap = { Wind, Settings2, Gauge, Cable, Layers, Zap, Leaf, Star, Settings, Filter };

export default function Products() {
  const { brandId } = useParams();
  const [activeBrand, setActiveBrand] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { ref, isInView } = useScrollAnimation();
  const { brands } = useBrands();
  const { categories } = useCategories();

  useEffect(() => {
    if (brandId) {
      setActiveBrand(brandId);
    } else {
      setActiveBrand('all');
    }
  }, [brandId]);

  useEffect(() => {
    if (activeBrand === 'parker') {
      const container = document.getElementById('parker-showcase-container');
      if (container) {
        container.innerHTML = '';
        const script = document.createElement('script');
        script.async = true;
        script.type = 'text/javascript';
        script.src = 'https://638841238506901120.publisher.impartner.io/Csp/?mfrname=parker';
        container.appendChild(script);
      }
    }
  }, [activeBrand]);

  const filteredCategories = categories.filter((cat) => {
    const matchesBrand = activeBrand === 'all' || cat.brandId === activeBrand;
    const matchesSearch =
      !searchQuery ||
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.products || []).some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesBrand && matchesSearch;
  });

  return (
    <div>
      {/* Header */}
      <section className="section-padding bg-white dark:bg-gray-950 relative overflow-hidden border-b border-[var(--color-border)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="container-wide relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <p className="badge-blue mb-5">Product Catalog</p>
            <h1 className="heading-display text-[clamp(2rem,4vw,3.5rem)] text-gray-900 dark:text-white mb-4">
              500+ Products, <span className="text-gradient">7+ Global Brands</span>
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
              Explore our complete range of pneumatic, hydraulic, instrumentation, 
              compressed air, and clean energy products.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sticky filter bar */}
      <div className="sticky top-[72px] z-30 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-[var(--color-border)]">
        <div className="container-wide py-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 py-2.5 text-sm"
            />
          </div>

          {/* Brand filters */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveBrand('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeBrand === 'all'
                  ? 'bg-primary-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-accent/40'
              }`}
            >
              All Brands
            </button>
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => setActiveBrand(brand.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeBrand === brand.id
                    ? 'bg-accent text-white shadow-glow'
                    : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-accent/40'
                }`}
              >
                {brand.shortName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <section className="section-padding">
        <div className="container-wide">
          {activeBrand === 'parker' && (
            <div className="mb-12 p-6 bg-gray-50 dark:bg-gray-900/50 border border-gray-150 dark:border-gray-800 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Parker Content Syndication Interactive Showcase
                </h2>
              </div>
              <div id="parker-showcase-container" className="w-full min-h-[600px] overflow-hidden rounded-xl bg-white p-2 shadow-sm border border-gray-100" />
            </div>
          )}

          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredCategories.length}</span> product categories
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeBrand}-${searchQuery}`}
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredCategories.length === 0 ? (
                <div className="col-span-3 text-center py-20">
                  <p className="text-gray-400 text-lg">No products found for "{searchQuery}"</p>
                  <button
                    onClick={() => { setSearchQuery(''); setActiveBrand('all'); }}
                    className="mt-4 text-accent text-sm hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                filteredCategories.map((cat) => {
                  const Icon = iconMap[cat.icon] || Settings2;
                  const brand = brands.find(b => b.id === cat.brandId);
                  return (
                    <motion.div key={cat.id} variants={staggerItem} layout>
                      <Link
                        to={`/products/${cat.brandId}/${cat.slug}`}
                        className="group flex flex-col h-full card p-6 hover:border-accent/30"
                      >
                        {/* Top */}
                        <div className="flex items-start justify-between mb-5">
                          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                            <Icon className="w-6 h-6 text-accent" />
                          </div>
                          <span className="badge-gray text-[10px]">{brand?.shortName}</span>
                        </div>

                        {/* Content */}
                        <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2 leading-tight group-hover:text-accent transition-colors">
                          {cat.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1 mb-5">
                          {cat.description}
                        </p>

                        {/* Products count */}
                        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                          <span className="text-xs text-gray-400">{cat.products.length} products</span>
                          <span className="flex items-center gap-1 text-xs font-semibold text-gray-400 group-hover:text-accent transition-colors">
                            View All
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
