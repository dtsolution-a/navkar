import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Sun, Moon, ChevronDown, 
  Wind, Settings2, Gauge, Cable, Filter, Zap, Leaf, Layers, Star,
  Phone, Mail, Loader2
} from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import { useBrands, useCategories, usePublicSettings } from '../../hooks/useSiteData';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Products', href: '/products', hasDropdown: true },
  { label: 'Services', href: '/services' },
    { label: 'Blog', href: '/blog' },
  { label: 'Career', href: '/career' },
];

const iconMap = { Wind, Settings2, Gauge, Cable, Filter, Zap, Leaf, Layers, Star };

const logoMap = {
  parker: '/images/brands/parker.jpg',
  kaishan: '/images/brands/kaishan.png',
  'chicago-pneumatic': '/images/brands/chicago-pneumatic.svg',
  tubacex: '/images/brands/tubacex.png',
  trident: '/images/brands/trident.png',
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [activeBrand, setActiveBrand] = useState('parker');
  const dropdownRef = useRef(null);
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();
  const isDark = theme === 'dark';
  const { brands } = useBrands();
  const { categories } = useCategories();
  const { settings } = usePublicSettings();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setProductsOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProductsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (brands && brands.length > 0) {
      setActiveBrand(brands[0].id);
    }
  }, [brands]);

  const activeBrandData = brands.find(b => b.id === activeBrand);
  const activeBrandCategories = categories.filter(c => c.brandId === activeBrand);

  return (
    <>
      {/* ── Top bar ── */}
      <div className="hidden lg:flex items-center justify-end bg-[#060f38] text-white/60 text-xs py-2 px-8 gap-6">
        <a href="tel:+91XXXXXXXXXX" className="flex items-center gap-1.5 hover:text-white transition-colors">
          <Phone className="w-3 h-3" /> +91 XXXXXXXXXX
        </a>
        <a href="mailto:info@navkarengineering.com" className="flex items-center gap-1.5 hover:text-white transition-colors">
          <Mail className="w-3 h-3" /> info@navkarengineering.com
        </a>
      </div>

      {/* ── Main nav ── */}
      <header className={`sticky top-0 z-50 transition-all duration-300
        ${isScrolled
          ? 'bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm'
          : 'bg-white dark:bg-gray-950 border-b border-gray-200/50 dark:border-gray-800/50'
        }`}
      >
        <div className="container-wide relative">
          <div className="flex items-center justify-between h-[76px] gap-6">

            {/* ── Logo ── */}
            <Link to="/" className="flex-shrink-0 flex items-center group">
              {/* Light: show real PNG logo as-is. Dark: invert to white via CSS filter */}
              <img
                src="/images/navkar-logo.png"
                alt="Navkar Engineering"
                className="h-14 w-auto object-contain transition-all duration-300 dark:brightness-0 dark:invert"
              />
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
              {navItems.map((item) =>
                item.hasDropdown ? (
                  <div key={item.label} ref={dropdownRef}>
                    <button
                      onClick={() => setProductsOpen(!productsOpen)}
                      className={`nav-link flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60 ${
                        productsOpen ? 'text-accent bg-accent/5' : ''
                      }`}
                    >
                      {item.label}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${productsOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* ── Mega dropdown ── */}
                    <AnimatePresence>
                      {productsOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.97 }}
                          transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
                          className="absolute top-full left-0 right-0 mx-auto mt-0 w-[95vw] max-w-[1100px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden"
                        >
                          <div className="flex min-h-[440px]">
                            {/* Brand sidebar */}
                            <div className="w-[260px] bg-gray-50/80 dark:bg-gray-900/80 border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-1.5">
                              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-3">Brands</p>
                              {brands.map((brand) => (
                                <Link
                                  key={brand.id}
                                  to={`/products/${brand.id}`}
                                  onClick={() => setProductsOpen(false)}
                                  onMouseEnter={() => setActiveBrand(brand.id)}
                                  className={`flex items-center gap-2.5 text-left px-3 py-2.5 rounded-xl transition-all duration-150 ${
                                    activeBrand === brand.id
                                      ? 'bg-white dark:bg-gray-800 shadow-sm border border-gray-200/60 dark:border-gray-700/60'
                                      : 'hover:bg-white/70 dark:hover:bg-gray-800/60'
                                  }`}
                                >
                                  <span className={`text-sm font-semibold truncate ${
                                    activeBrand === brand.id ? 'text-accent' : 'text-gray-600 dark:text-gray-400'
                                  }`}>
                                    {brand.shortName}
                                  </span>
                                </Link>
                              ))}
                              <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-800">
                                <Link to="/products" className="block px-3 py-1.5 text-xs font-semibold text-accent hover:underline">
                                  All products →
                                </Link>
                              </div>
                            </div>

                            {/* Categories panel */}
                            <div className="flex-1 p-8">
                              <div className="flex items-start justify-between mb-6">
                                <div>
                                  <p className="font-bold text-gray-900 dark:text-white text-base">{activeBrandData?.name}</p>
                                  <p className="text-sm text-gray-400 mt-1">{activeBrandData?.tagline}</p>
                                </div>
                                <Link
                                  to={`/products/${activeBrand}`}
                                  className="text-xs font-semibold text-accent hover:underline flex-shrink-0"
                                >
                                  View all →
                                </Link>
                              </div>
                              <div className="grid grid-cols-2 gap-1.5">
                                {activeBrandCategories.map((cat) => {
                                  const Icon = iconMap[cat.icon] || Settings2;
                                  return (
                                    <Link
                                      key={cat.id}
                                      to={`/products/${activeBrand}/${cat.slug}`}
                                      className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors group"
                                    >
                                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                                        <Icon className="w-5 h-5 text-accent" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-accent transition-colors leading-tight">
                                          {cat.name}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{cat.products.length} products</p>
                                      </div>
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <NavLink
                    key={item.label}
                    to={item.href}
                    className={({ isActive }) =>
                      `nav-link px-3.5 py-2 rounded-lg text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60 ${
                        isActive ? 'text-accent font-semibold' : ''
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                )
              )}
            </nav>

            {/* ── Actions ── */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
              </button>
                <a
                  href="/Navkar Catalogue 2026 (Actual Size).pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden lg:inline-flex text-sm px-4 py-2.5 bg-accent hover:bg-accent-hover text-white font-medium rounded-xl shadow-lg shadow-accent/25 transition-all"
                >
                  Catalogue
                </a>
              {settings?.indiamart_link && (
                <a
                  href={settings.indiamart_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden lg:inline-flex items-center gap-1 bg-[#f26522] hover:bg-[#d8541a] text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  IndiaMart
                </a>
              )}
              <Link to="/contact" className="hidden lg:inline-flex btn-primary text-sm px-5 py-2.5">
                Contact Us
              </Link>
              <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
                className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden"
            >
              <div className="container-wide py-4 flex flex-col gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.href}
                    className={({ isActive }) =>
                      `px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive ? 'text-accent bg-accent/5' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <div className="pt-3 mt-2 border-t border-gray-200 dark:border-gray-800 space-y-2">
                    <a
                      href="/Navkar Catalogue 2026 (Actual Size).pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full justify-center text-sm py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-xl shadow-lg shadow-accent/25 transition-all"
                    >
                      Catalogue
                    </a>
                  {settings?.indiamart_link && (
                    <a
                      href={settings.indiamart_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex bg-[#f26522] hover:bg-[#d8541a] text-white font-semibold w-full justify-center text-sm py-3 rounded-xl transition-colors"
                    >
                      IndiaMart
                    </a>
                  )}
                  <Link to="/contact" className="btn-primary w-full justify-center">Contact Us</Link>
                  <div className="flex flex-col gap-2 text-xs text-gray-500 pt-1">
                    <a href="tel:+91XXXXXXXXXX" className="flex items-center gap-2 px-1"><Phone className="w-3.5 h-3.5" /> +91 XXXXXXXXXX</a>
                    <a href="mailto:info@navkarengineering.com" className="flex items-center gap-2 px-1"><Mail className="w-3.5 h-3.5" /> info@navkarengineering.com</a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
