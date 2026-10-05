
import { useBrands } from '../../hooks/useSiteData';
import { motion } from 'framer-motion';

const fallbackBrands = [
  { id: 'kaishan', name: 'Kaishan Machinery (I) Pvt. Ltd.', logo: '/images/brands/kaishan.png', badge: 'Authorized Dealer' },
  { id: 'airmarshal', name: 'Air Marshal- Gajjar Compressors Pvt. Ltd.', logo: '/images/navkar-logo.png', badge: 'Authorized Dealer' },
  { id: 'airgrid', name: 'AirGrid Compressed Air Aluminum Piping', logo: '/images/navkar-logo.png', badge: 'Authorized Dealer' },
  { id: 'parker', name: 'Parker Hannifin India Pvt. Ltd.', logo: '/images/brands/parker.jpg', badge: 'Traded Brand' },
  { id: 'legris', name: 'Legris India Pvt. Ltd.', logo: '/images/brands/legris.png', badge: 'Traded Brand' },
  { id: 'trident', name: 'Trident Pneumatics Pvt. Ltd.', logo: '/images/brands/trident.png', badge: 'Traded Brand' },
  { id: 'tubacex', name: 'Tubacex Service Solutions India Pvt. Ltd.', logo: '/images/brands/tubacex.png', badge: 'Traded Brand' },
  { id: 'airnet', name: 'AirNet (Chicago Pneumatic Sales)', logo: '/images/brands/chicago-pneumatic.svg', badge: 'Traded Brand' },
];

export default function BrandBar() {
  const { brands } = useBrands();
  // Bypass API for UI preview to guarantee logos show up
  const activeBrands = fallbackBrands;
  
  // Duplicate for seamless marquee
  const marqueeItems = [...activeBrands, ...activeBrands, ...activeBrands];

  return (
    <section className="py-12 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Our Trusted Network</h3>
      </div>
      
      <div className="relative w-full flex items-center">
        {/* Gradient Edges for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white dark:from-gray-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white dark:from-gray-950 to-transparent z-10 pointer-events-none" />
        
        <motion.div 
          className="flex gap-12 whitespace-nowrap px-6"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 30, repeat: Infinity }}
        >
          {marqueeItems.map((brand, idx) => (
            <div key={`${brand.id}-${idx}`} className="flex flex-col items-center justify-center min-w-[180px] group opacity-60 hover:opacity-100 transition-opacity duration-300">
              <div className="h-16 flex items-center justify-center mb-3 bg-white p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
                <img src={brand.logo} alt={brand.name} className="max-h-10 max-w-full object-contain transition-all duration-300" />
              </div>
              <span className="text-[10px] font-bold tracking-widest text-gray-400 group-hover:text-accent uppercase">
                {brand.badge}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
