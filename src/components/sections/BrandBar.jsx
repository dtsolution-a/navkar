
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
    <section className="py-16 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.3em]">Our Trusted Network</h3>
        <div className="w-16 h-1 bg-[#00b4d8] mx-auto mt-4 rounded-full" />
      </div>
      
      <div className="relative w-full flex items-center">
        {/* Gradient Edges for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white dark:from-gray-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white dark:from-gray-950 to-transparent z-10 pointer-events-none" />
        
        <motion.div 
          className="flex gap-10 whitespace-nowrap px-6 items-center"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 35, repeat: Infinity }}
        >
          {marqueeItems.map((brand, idx) => (
            <div key={`${brand.id}-${idx}`} className="flex flex-col items-center justify-center min-w-[260px] group">
              <div className="h-28 w-full flex items-center justify-center mb-4 bg-white px-6 py-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 dark:bg-gray-900 group-hover:shadow-[0_8px_30px_rgba(0,180,216,0.15)] group-hover:border-[#00b4d8]/30 transition-all duration-300 transform group-hover:-translate-y-1">
                <img 
                  src={brand.logo} 
                  alt={brand.name} 
                  className="max-h-16 max-w-full object-contain filter drop-shadow-sm transition-all duration-300 group-hover:scale-105" 
                />
              </div>
              <span className={`text-[11px] font-black tracking-widest uppercase px-3 py-1 rounded-full ${brand.badge === 'Authorized Dealer' ? 'bg-[#00b4d8]/10 text-[#00b4d8]' : 'bg-gray-100 text-gray-500'}`}>
                {brand.badge}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
