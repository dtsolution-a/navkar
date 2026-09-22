import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Compass, Shield, Tag, FileText, Briefcase } from 'lucide-react';
import { useScrollAnimation, fadeUpVariants, staggerContainer, staggerItem } from '../hooks/useScrollAnimation';
import { useBrands } from '../hooks/useSiteData';

export default function Sitemap() {
  const { ref, isInView } = useScrollAnimation();
  const { brands } = useBrands();

  const mainPages = [
    { label: 'Home Page', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Products Catalog', href: '/products' },
    { label: 'Industrial Services', href: '/services' },
    { label: 'Photo Gallery', href: '/gallery' },
    { label: 'Insights & Blog', href: '/blog' },
    { label: 'Career Openings', href: '/career' },
    { label: 'Contact Us & Enquiries', href: '/contact' },
  ];

  return (
    <div className="section-padding bg-white dark:bg-gray-950">
      <div className="container-wide">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeUpVariants}
          className="max-w-2xl mb-12"
        >
          <p className="badge-blue mb-4">Website Directory</p>
          <h1 className="heading-display text-4xl text-gray-900 dark:text-white mb-4">Sitemap</h1>
          <p className="text-gray-500 dark:text-gray-400">
            A comprehensive list of all sections, brand lines, and resources hosted on our platform.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {/* Main Pages */}
          <motion.div variants={staggerItem} className="card p-6">
            <div className="flex items-center gap-2 mb-4 text-accent">
              <Compass className="w-5 h-5" />
              <h2 className="font-bold text-gray-900 dark:text-white text-base">Main Sections</h2>
            </div>
            <ul className="space-y-2.5">
              {mainPages.map(p => (
                <li key={p.label}>
                  <Link to={p.href} className="text-sm text-gray-500 hover:text-accent flex items-center gap-1.5 transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" /> {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Brands */}
          <motion.div variants={staggerItem} className="card p-6">
            <div className="flex items-center gap-2 mb-4 text-accent">
              <Tag className="w-5 h-5" />
              <h2 className="font-bold text-gray-900 dark:text-white text-base">Brands Catalogs</h2>
            </div>
            <ul className="space-y-2.5">
              {brands.map(b => (
                <li key={b.id}>
                  <Link to={`/products/${b.id}`} className="text-sm text-gray-500 hover:text-accent flex items-center gap-1.5 transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" /> {b.name} Products
                  </Link>
                </li>
              ))}
              {brands.length === 0 && (
                <>
                  <li><Link to="/products/parker" className="text-sm text-gray-500 hover:text-accent flex items-center gap-1.5 transition-colors"><ArrowRight className="w-3.5 h-3.5" /> Parker Hannifin</Link></li>
                  <li><Link to="/products/kaishan" className="text-sm text-gray-500 hover:text-accent flex items-center gap-1.5 transition-colors"><ArrowRight className="w-3.5 h-3.5" /> Kaishan Compressors</Link></li>
                  <li><Link to="/products/chicago-pneumatic" className="text-sm text-gray-500 hover:text-accent flex items-center gap-1.5 transition-colors"><ArrowRight className="w-3.5 h-3.5" /> Chicago Pneumatic</Link></li>
                  <li><Link to="/products/tubacex" className="text-sm text-gray-500 hover:text-accent flex items-center gap-1.5 transition-colors"><ArrowRight className="w-3.5 h-3.5" /> Tubacex</Link></li>
                  <li><Link to="/products/trident" className="text-sm text-gray-500 hover:text-accent flex items-center gap-1.5 transition-colors"><ArrowRight className="w-3.5 h-3.5" /> Trident</Link></li>
                </>
              )}
            </ul>
          </motion.div>

          {/* Legal Documents */}
          <motion.div variants={staggerItem} className="card p-6">
            <div className="flex items-center gap-2 mb-4 text-accent">
              <Shield className="w-5 h-5" />
              <h2 className="font-bold text-gray-900 dark:text-white text-base">Legal Policies</h2>
            </div>
            <ul className="space-y-2.5">
              <li>
                <Link to="/terms" className="text-sm text-gray-500 hover:text-accent flex items-center gap-1.5 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" /> Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-gray-500 hover:text-accent flex items-center gap-1.5 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/sitemap" className="text-sm text-gray-500 hover:text-accent flex items-center gap-1.5 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" /> Sitemap
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div variants={staggerItem} className="card p-6">
            <div className="flex items-center gap-2 mb-4 text-accent">
              <FileText className="w-5 h-5" />
              <h2 className="font-bold text-gray-900 dark:text-white text-base">Resources</h2>
            </div>
            <ul className="space-y-2.5">
              <li>
                <a href="/Navkar Catalogue 2026 (Actual Size).pdf" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-accent flex items-center gap-1.5 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" /> Download Product Catalog PDF
                </a>
              </li>
              <li>
                <a href="https://wa.me/919825607366" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-accent flex items-center gap-1.5 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" /> Contact on WhatsApp
                </a>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
