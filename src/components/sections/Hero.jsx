
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  '/images/hero/slide-1.jpg',
  '/images/hero/slide-3.jpg',
  '/images/hero/slide-2.jpg'
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-screen min-h-[800px] bg-[#050505] overflow-hidden flex flex-col items-center justify-center">
      
      {/* Background Image Slider with Crossfade */}
      <AnimatePresence mode="popLayout">
        <motion.img
          key={current}
          src={slides[current]}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      </AnimatePresence>

      {/* Atmospheric Overlays */}
      <div className="absolute inset-0 bg-black/50 z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#020512]/90 via-transparent to-[#020512] z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,180,216,0.1)_0%,transparent_60%)] z-10 pointer-events-none" />

      {/* Main Centered Content */}
      <div className="relative z-20 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center -mt-10">
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
          className="text-[#00b4d8] tracking-[0.3em] uppercase text-xs md:text-sm font-bold mb-6 flex items-center gap-4"
        >
          <span className="w-8 h-[1px] bg-[#00b4d8]/50" />
          Navkar Engineering • Est. 2024
          <span className="w-8 h-[1px] bg-[#00b4d8]/50" />
        </motion.p>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold text-white mb-6 tracking-tight leading-[1.1]"
        >
          Architecting industrial <br />
          landscapes that are <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00b4d8] to-blue-500">
            powerful & precise.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
          className="text-gray-300 max-w-2xl text-lg font-light mb-12"
        >
          Trusted by Global MNCs. Delivering uncompromising performance in pneumatics, hydraulics, and compressed air systems.
        </motion.p>

        {/* Glassmorphic Search / Action Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-2 flex items-center shadow-2xl w-full max-w-2xl relative group hover:bg-white/10 transition-colors"
        >
          <div className="pl-6 pr-2 text-gray-400">
            <span className="text-xs font-bold tracking-widest uppercase text-[#00b4d8]">Explore</span>
          </div>
          <div className="w-[1px] h-6 bg-white/20 mx-4" />
          <input 
            type="text" 
            placeholder="Pneumatics, Compressors, Fittings..." 
            className="bg-transparent border-none outline-none text-white w-full placeholder-gray-500 text-sm md:text-base font-light" 
          />
          <Link to="/products" className="bg-[#00b4d8] text-[#020512] w-12 h-12 md:w-auto md:px-8 md:py-3 md:h-auto rounded-full font-bold hover:bg-white transition-colors flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(0,180,216,0.3)] group-hover:shadow-[0_0_30px_rgba(0,180,216,0.5)]">
            <Search className="w-5 h-5 md:hidden" />
            <span className="hidden md:block">Search Catalog</span>
          </Link>
        </motion.div>
      </div>

      {/* Bottom Stats Row */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-0 w-full z-20 px-8 pb-10"
      >
        <div className="max-w-6xl mx-auto border-t border-white/10 pt-10 grid grid-cols-2 md:grid-cols-4 gap-8 items-center text-white relative">
          
          <div className="absolute left-0 -translate-x-12 top-1/2 -translate-y-1/2 opacity-20 hidden lg:block">
            <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white to-transparent" />
          </div>
          
          <div className="text-center">
            <h4 className="text-3xl md:text-4xl font-bold mb-2">100+</h4>
            <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest font-semibold">Clients Served</p>
          </div>
          <div className="text-center relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-white/10 hidden md:block" />
            <h4 className="text-3xl md:text-4xl font-bold mb-2">100%</h4>
            <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest font-semibold">OEM Certified</p>
          </div>
          <div className="text-center relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-white/10 hidden md:block" />
            <h4 className="text-3xl md:text-4xl font-bold mb-2">2+</h4>
            <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest font-semibold">Years Experience</p>
          </div>
          <div className="text-center relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-white/10 hidden md:block" />
            <h4 className="text-3xl md:text-4xl font-bold mb-2">7+</h4>
            <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest font-semibold">Global Brands</p>
          </div>

          <div className="absolute right-0 translate-x-12 top-1/2 -translate-y-1/2 opacity-20 hidden lg:block">
            <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white to-transparent" />
          </div>
        </div>
      </motion.div>

    </section>
  );
}
