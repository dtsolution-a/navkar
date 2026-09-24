
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone, Settings, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  {
    id: 0,
    img: '/images/hero/slide-1.jpg',
    title: 'Fluid Power',
    tag: 'Premium Solutions'
  },
  {
    id: 1,
    img: '/images/hero/slide-3.jpg',
    title: 'Compressed Air',
    tag: 'Energy Efficient'
  },
  {
    id: 2,
    img: '/images/hero/slide-2.jpg',
    title: 'Instrumentation',
    tag: 'High Precision'
  }
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full min-h-[90vh] bg-[#020617] overflow-hidden flex items-center py-20 lg:py-0">
      
      {/* 1. Giant Scrolling Background Text (Marquee) */}
      <div className="absolute top-1/4 left-0 w-[200vw] -translate-y-1/2 flex whitespace-nowrap opacity-[0.03] pointer-events-none overflow-hidden z-0">
        <motion.h1 
          animate={{ x: [0, -1000] }} 
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="text-[12vw] font-black text-white tracking-tighter uppercase"
        >
          NAVKAR ENGINEERING • INDUSTRIAL EXCELLENCE • NAVKAR ENGINEERING • INDUSTRIAL EXCELLENCE •
        </motion.h1>
      </div>

      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00b4d8]/20 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#0a1a5c]/50 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Floating Abstract Elements */}
      <motion.div animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 6 }} className="absolute top-[20%] left-[5%] text-[#00b4d8]/30 z-0">
        <Settings className="w-16 h-16" />
      </motion.div>
      <motion.div animate={{ y: [0, 30, 0], rotate: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 8 }} className="absolute bottom-[20%] left-[45%] text-[#00b4d8]/20 z-0">
        <Activity className="w-24 h-24" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
          
          {/* Left: Dramatic Typography */}
          <div className="w-full lg:w-5/12">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#00b4d8] animate-pulse shadow-[0_0_10px_#00b4d8]" />
                <span className="text-sm font-bold text-[#00b4d8] tracking-widest uppercase">The Future of Industry</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] font-bold text-white leading-[1.05] mb-6 tracking-tight">
                Engineered <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00b4d8] to-blue-500">
                  For Power.
                </span>
              </h1>
              
              <p className="text-lg text-gray-400 mb-10 max-w-md leading-relaxed border-l-2 border-[#00b4d8] pl-4">
                Authorized dealership delivering uncompromising performance in pneumatics, hydraulics, and compressed air systems.
              </p>

              <div className="flex flex-col sm:flex-row gap-5">
                <Link to="/products" className="group relative px-8 py-4 bg-white text-[#020617] font-black rounded-xl overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(0,180,216,0.4)] transition-all flex items-center justify-center gap-3">
                  <div className="absolute inset-0 w-0 bg-[#00b4d8] transition-all duration-[250ms] ease-out group-hover:w-full" />
                  <span className="relative z-10 group-hover:text-white transition-colors">Our Catalog</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>
                <Link to="/contact" className="px-8 py-4 bg-transparent text-white font-bold rounded-xl border border-white/20 hover:bg-white/10 backdrop-blur-md transition-all text-center flex items-center justify-center gap-2">
                  <Phone className="w-5 h-5" /> Contact Us
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Right: 3D Stacked Image Deck */}
          <div className="w-full lg:w-7/12 relative h-[400px] lg:h-[600px] perspective-[1000px]">
            <div className="absolute inset-0 flex items-center justify-center lg:justify-end">
              {slides.map((slide, index) => {
                const offset = (index - current + slides.length) % slides.length;
                // Calculate 3D stacking styles
                const isFront = offset === 0;
                const scale = 1 - offset * 0.08;
                const translateY = offset * 20;
                const translateX = offset * 40;
                const rotateZ = offset * 4;
                const zIndex = 30 - offset;
                const opacity = offset < 3 ? 1 : 0;

                return (
                  <motion.div
                    key={slide.id}
                    animate={{
                      scale,
                      y: translateY,
                      x: translateX,
                      rotateZ,
                      zIndex,
                      opacity
                    }}
                    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                    className="absolute w-[85%] lg:w-[75%] h-[90%] rounded-3xl overflow-hidden shadow-2xl border border-white/10 transform-origin-bottom"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <img src={slide.img} alt={slide.title} className="w-full h-full object-cover" />
                    
                    {/* Dark gradient overlay for front card */}
                    <motion.div animate={{ opacity: isFront ? 0.6 : 0.8 }} className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    
                    {/* Content on front card only */}
                    <motion.div 
                      animate={{ opacity: isFront ? 1 : 0, y: isFront ? 0 : 20 }}
                      className="absolute bottom-8 left-8 right-8"
                    >
                      <div className="inline-block px-3 py-1 bg-[#00b4d8] text-[#020617] font-bold text-xs uppercase tracking-wider rounded-md mb-3 shadow-lg">
                        {slide.tag}
                      </div>
                      <h3 className="text-4xl lg:text-5xl font-black text-white shadow-black drop-shadow-md">
                        {slide.title}
                      </h3>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Custom Interactive Slider Controls (Bottom Left of the Deck) */}
            <div className="absolute bottom-0 left-0 lg:left-20 z-40 flex items-center gap-4">
              <div className="flex gap-2">
                {slides.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setCurrent(i)}
                    className={"h-1.5 transition-all duration-300 rounded-full " + (i === current ? "w-8 bg-[#00b4d8]" : "w-2 bg-white/30 hover:bg-white/50")}
                  />
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
