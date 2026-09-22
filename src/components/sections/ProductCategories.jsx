import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useScrollAnimation, staggerContainer, staggerItem, fadeUpVariants } from '../../hooks/useScrollAnimation';
import { useSolutions } from '../../hooks/useSiteData';

const solutionGroups = [
  {
    id: 'compressed-air',
    icon: 'Wind',
    name: 'Compressed Air Systems',
    description: 'Complete air generation, treatment & distribution from leading brands',
    brands: ['Parker', 'Kaishan', 'Chicago Pneumatic', 'Trident'],
    href: '/products',
    image: '/images/categories/compressed-air.jpg',
    accent: '#2563EB',
    number: '01',
  },
  {
    id: 'pneumatics',
    icon: 'Settings2',
    name: 'Pneumatics & Automation',
    description: 'Cylinders, solenoid valves, fittings, tubing & FRL units for automation',
    brands: ['Parker'],
    href: '/products/parker/pneumatics',
    image: '/images/categories/pneumatics.jpg',
    accent: '#6366f1',
    number: '02',
  },
  {
    id: 'instrumentation',
    icon: 'Gauge',
    name: 'Instrumentation',
    description: 'High-pressure fittings, needle valves, manifolds & process components',
    brands: ['Parker'],
    href: '/products/parker/instrumentation',
    image: '/images/categories/instrumentation.jpg',
    accent: '#8b5cf6',
    number: '03',
  },
  {
    id: 'hydraulics',
    icon: 'Cable',
    name: 'Hydraulics',
    description: 'Hoses, fittings, adapters, filters & condition monitoring equipment',
    brands: ['Parker'],
    href: '/products/parker/hydraulic-connectors',
    image: '/images/categories/hydraulics.jpg',
    accent: '#0891b2',
    number: '04',
  },
  {
    id: 'gas-gen',
    icon: 'Zap',
    name: 'Gas Generation',
    description: 'On-site nitrogen, hydrogen & zero-air generators for labs & industry',
    brands: ['Parker'],
    href: '/products/parker/gas-generator',
    image: '/images/categories/gas-generation.jpg',
    accent: '#d97706',
    number: '05',
  },
  {
    id: 'clean-energy',
    icon: 'Leaf',
    name: 'Clean Energy — CNG & H₂',
    description: 'Fueling infrastructure for CNG and hydrogen stations across India',
    brands: ['Parker'],
    href: '/products/parker/clean-energy',
    image: '/images/categories/clean-energy.jpg',
    accent: '#16a34a',
    number: '06',
  },
];

export default function ProductCategories() {
  const { ref, isInView } = useScrollAnimation();
  const { data: dbSolutions } = useSolutions();

  const activeSolutions = dbSolutions && dbSolutions.length > 0
    ? dbSolutions.map(s => ({
        id: s.id,
        icon: s.icon || 'Package',
        name: s.name,
        description: s.description,
        brands: s.brands ? s.brands.split(',').map(b => b.trim()) : [],
        href: s.href || '/products',
        image: s.image,
        accent: s.accent || '#2563EB',
        number: s.number || ''
      }))
    : solutionGroups;

  return (
    <section className="section-padding bg-white dark:bg-gray-950">
      <div className="container-wide">

        {/* ── Heading ── */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeUpVariants}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12"
        >
          <div className="max-w-xl">
            <p className="badge-blue mb-4">Product Portfolio</p>
            <h2 className="heading-display text-[clamp(1.8rem,3.5vw,2.8rem)] text-gray-900 dark:text-white mb-0 leading-tight">
              Solutions for Every<br />Industrial Challenge
            </h2>
          </div>
          <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed lg:max-w-xs lg:text-right">
            From precision instrumentation to large-scale compressed air systems — your complete industrial partner.
          </p>
        </motion.div>

        {/* ── Perfectly balanced 3×2 grid ── */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {activeSolutions.map((group) => {
            const Icon = Icons[group.icon] || Icons.Package;
            return (
              <motion.div key={group.id} variants={staggerItem} className="h-full">
                <Link
                  to={group.href}
                  className="group relative flex flex-col h-full overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 hover:border-transparent hover:shadow-xl transition-all duration-300"
                  style={{ '--accent': group.accent }}
                >
                  {/* ── Image area ── */}
                  <div className="relative h-44 overflow-hidden flex-shrink-0">
                    <img
                      src={group.image}
                      alt={group.name}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.target.parentElement.style.background = `linear-gradient(135deg, ${group.accent}22, ${group.accent}08)`;
                        e.target.style.display = 'none';
                      }}
                    />
                    {/* Subtle bottom fade into card bg */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white/60 dark:from-gray-900/60 via-transparent to-transparent" />

                    {/* Number tag — top right */}
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
                      <span className="text-[9px] font-bold text-gray-400">{group.number}</span>
                    </div>
                  </div>

                  {/* ── Content area ── */}
                  <div className="flex flex-col flex-1 p-5">

                    {/* Icon + name */}
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300"
                        style={{ background: `${group.accent}18` }}
                      >
                        <Icon className="w-4.5 h-4.5" style={{ color: group.accent }} />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-[15px] leading-snug pt-1">
                        {group.name}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1 pl-12">
                      {group.description}
                    </p>

                    {/* Footer */}
                    <div
                      className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800"
                    >
                      {/* Brand pills */}
                      <div className="flex flex-wrap gap-1.5">
                        {group.brands.slice(0, 2).map((b) => (
                          <span
                            key={b}
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{ background: `${group.accent}15`, color: group.accent }}
                          >
                            {b}
                          </span>
                        ))}
                        {group.brands.length > 2 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-400">
                            +{group.brands.length - 2}
                          </span>
                        )}
                      </div>

                      {/* Arrow */}
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-2 group-hover:translate-x-0"
                        style={{ background: `${group.accent}20` }}
                      >
                        <ArrowRight className="w-3.5 h-3.5" style={{ color: group.accent }} />
                      </div>
                    </div>
                  </div>

                  {/* Bottom accent line on hover */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-2xl"
                    style={{ background: group.accent }}
                  />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10 flex items-center justify-center"
        >
          <Link to="/products" className="btn-primary group">
            View Complete Product Catalog
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
