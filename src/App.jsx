import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { ArrowUp } from 'lucide-react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ChatBot from './components/ui/ChatBot';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Services from './pages/Services';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Career from './pages/Career';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Sitemap from './pages/Sitemap';
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBrands from './pages/admin/AdminBrands';
import AdminCategories from './pages/admin/AdminCategories';
import AdminProducts from './pages/admin/AdminProducts';
import AdminBlog from './pages/admin/AdminBlog';
import AdminContacts from './pages/admin/AdminContacts';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminJobs from './pages/admin/AdminJobs';
import AdminHeroSlides from './pages/admin/AdminHeroSlides';
import AdminSolutions from './pages/admin/AdminSolutions';
import AdminApplications from './pages/admin/AdminApplications';
import AdminTimeline from './pages/admin/AdminTimeline';
import AdminSettings from './pages/admin/AdminSettings';
import useThemeStore from './store/themeStore';

// Page transition wrapper
function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

// 404 page
function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center">
        <p className="text-8xl font-black text-gray-100 dark:text-gray-900 mb-6">404</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Page not found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a href="/" className="btn-primary">Go Back Home</a>
      </div>
    </div>
  );
}

// WhatsApp floating button
function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/91XXXXXXXXXX?text=Hello%2C%20I%20am%20interested%20in%20your%20products%20and%20services."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 group"
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: 'spring', stiffness: 260, damping: 20 }}
        className="relative"
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30" />
        {/* Button */}
        <div className="relative w-[52px] h-[52px] rounded-full bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/40 flex items-center justify-center transition-all duration-200 hover:scale-110">
          {/* WhatsApp SVG icon */}
          <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.003 2.667C8.639 2.667 2.667 8.639 2.667 16c0 2.347.636 4.548 1.742 6.448L2.667 29.333l7.107-1.718A13.283 13.283 0 0016.003 29.333C23.367 29.333 29.333 23.361 29.333 16S23.367 2.667 16.003 2.667zm0 2.4c5.93 0 10.93 4.997 10.93 10.933s-5 10.933-10.93 10.933c-1.99 0-3.854-.546-5.455-1.497l-.39-.23-4.218 1.02 1.054-4.085-.252-.408A10.898 10.898 0 015.07 16c0-5.936 4.997-10.933 10.933-10.933zm-3.12 5.2c-.22 0-.578.082-.88.41-.302.327-1.154 1.127-1.154 2.75s1.182 3.189 1.346 3.41c.165.22 2.32 3.548 5.634 4.836 2.796 1.094 3.314.876 3.91.82.595-.054 1.922-.786 2.195-1.545.273-.76.273-1.41.191-1.545-.082-.135-.3-.218-.627-.382s-1.923-.95-2.223-1.059c-.3-.11-.518-.164-.736.165-.218.327-.844 1.06-.953 1.278-.11.218-.22.246-.546.082-.328-.164-1.38-.509-2.632-1.622-.972-.866-1.629-1.935-1.82-2.262-.19-.327-.02-.505.145-.668.148-.147.327-.382.49-.573.165-.191.22-.327.33-.546.11-.218.055-.41-.027-.573-.082-.164-.736-1.775-1.009-2.43-.273-.655-.546-.56-.737-.57l-.627-.01z"/>
          </svg>
        </div>
        {/* Tooltip */}
        <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
          Chat on WhatsApp
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
        </div>
      </motion.div>
    </a>
  );
}

// Scroll to top button
function ScrollToTopBtn() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          className="fixed bottom-[10.5rem] right-6 z-50 w-[52px] h-[52px] rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-accent hover:text-[#060f38] hover:border-accent transition-all duration-200"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const { initTheme } = useThemeStore();
  const location = useLocation();

  useEffect(() => {
    initTheme();
  }, []);

  const isAdminRoute = location.pathname.startsWith('/ad-admin');
  return (
    <HelmetProvider>
      <ScrollToTop />
      {isAdminRoute ? (
        // Admin Panel (no Navbar/Footer)
        <Routes>
          <Route path="/ad-admin/login" element={<AdminLogin />} />
          <Route path="/ad-admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="hero-slides" element={<AdminHeroSlides />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="solutions" element={<AdminSolutions />} />
                        <Route path="blog" element={<AdminBlog />} />
            <Route path="contacts" element={<AdminContacts />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="jobs" element={<AdminJobs />} />
            <Route path="applications" element={<AdminApplications />} />
            <Route path="timeline" element={<AdminTimeline />} />
            <Route path="selection-catalog" element={<AdminSelectionCatalog />} />
            <Route path="selection-salesmen" element={<AdminSelectionSalesmen />} />
            <Route path="selection-pricing" element={<AdminSelectionPricing />} />
            <Route path="selection-settings" element={<AdminSelectionSettings />} />
            <Route path="selection-reference" element={<AdminSelectionReference />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      ) : (
        // Main Website
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageTransition><Home /></PageTransition>} />
                <Route path="/about" element={<PageTransition><About /></PageTransition>} />
                <Route path="/products" element={<PageTransition><Products /></PageTransition>} />
                <Route path="/products/:brandId" element={<PageTransition><Products /></PageTransition>} />
                <Route path="/products/:brandId/:categorySlug" element={<PageTransition><ProductDetail /></PageTransition>} />
                <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
                                <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
                <Route path="/blog/:slug" element={<PageTransition><BlogPost /></PageTransition>} />
                <Route path="/career" element={<PageTransition><Career /></PageTransition>} />
                <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
                <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
                <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
                <Route path="/sitemap" element={<PageTransition><Sitemap /></PageTransition>} />
                <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
              </Routes>
            </AnimatePresence>
          </div>
          <Footer />

          {/* Global floating elements */}
          <WhatsAppButton />
          <ScrollToTopBtn />
          <ChatBot />
        </div>
      )}
    </HelmetProvider>
  );
}



