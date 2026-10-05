
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PhoneCall, Settings, Activity, Search, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  { id: 0, img: '/images/hero/slide-1.jpg', title: 'Fluid Power', tag: 'Premium Solutions' },
  { id: 1, img: '/images/hero/slide-3.jpg', title: 'Compressed Air', tag: 'Energy Efficient' },
  { id: 2, img: '/images/hero/slide-2.jpg', title: 'Instrumentation', tag: 'High Precision' },
  { id: 3, img: '/images/hero/slide-4.jpg', title: 'Pneumatics', tag: 'Critical Tech' }
];

export default function Hero() {
  return (
    <div className="w-full flex flex-col">
      <div className="bg-red-500 text-white text-center py-4 font-bold tracking-widest uppercase text-sm z-50">Option 1: Dynamic 3D Card Slider (Original Dark)</div>
      <HeroOption1 />

      <div className="bg-red-500 text-white text-center py-4 font-bold tracking-widest uppercase text-sm z-50">Option 2: Full-Screen Atmospheric (Patel / MediaLoop Style)</div>
      <HeroOption2 />

      <div className="bg-red-500 text-white text-center py-4 font-bold tracking-widest uppercase text-sm z-50">Option 3: Tilted Infinite Parallax Gallery (Light Theme)</div>
      <HeroOption3 />

      <div className="bg-red-500 text-white text-center py-4 font-bold tracking-widest uppercase text-sm z-50">Option 4: Massive Typographic Image Mask</div>
      <HeroOption4 />
    </div>
  );
}

// ==========================================
// OPTION 1: DARK CINEMATIC 3D
// ==========================================
function HeroOption1() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % 3), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full min-h-[90vh] bg-[#020617] overflow-hidden flex items-center py-20 lg:py-0">
      <div className="absolute top-1/4 left-0 w-[200vw] -translate-y-1/2 flex whitespace-nowrap opacity-[0.03] pointer-events-none overflow-hidden z-0">
        <motion.h1 animate={{ x: [0, -1000] }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} className="text-[12vw] font-black text-white tracking-tighter uppercase">
          NAVKAR ENGINEERING • INDUSTRIAL EXCELLENCE • NAVKAR ENGINEERING • INDUSTRIAL EXCELLENCE •
        </motion.h1>
      </div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00b4d8]/20 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#0a1a5c]/50 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
          <div className="w-full lg:w-5/12">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#00b4d8] animate-pulse shadow-[0_0_10px_#00b4d8]" />
                <span className="text-sm font-bold text-[#00b4d8] tracking-widest uppercase">The Future of Industry</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] font-bold text-white leading-[1.05] mb-6 tracking-tight">
                Engineered <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00b4d8] to-blue-500">For Power.</span>
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
                  <PhoneCall className="w-5 h-5" /> Contact Us
                </Link>
              </div>
            </motion.div>
          </div>
          <div className="w-full lg:w-7/12 relative h-[400px] lg:h-[600px] perspective-[1000px]">
            <div className="absolute inset-0 flex items-center justify-center lg:justify-end">
              {slides.slice(0,3).map((slide, index) => {
                const offset = (index - current + 3) % 3;
                const isFront = offset === 0;
                return (
                  <motion.div
                    key={slide.id}
                    animate={{ scale: 1 - offset * 0.08, y: offset * 20, x: offset * 40, rotateZ: offset * 4, zIndex: 30 - offset, opacity: offset < 3 ? 1 : 0 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                    className="absolute w-[85%] lg:w-[75%] h-[90%] rounded-3xl overflow-hidden shadow-2xl border border-white/10 transform-origin-bottom"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <img src={slide.img} alt={slide.title} className="w-full h-full object-cover" />
                    <motion.div animate={{ opacity: isFront ? 0.6 : 0.8 }} className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <motion.div animate={{ opacity: isFront ? 1 : 0, y: isFront ? 0 : 20 }} className="absolute bottom-8 left-8 right-8">
                      <div className="inline-block px-3 py-1 bg-[#00b4d8] text-[#020617] font-bold text-xs uppercase tracking-wider rounded-md mb-3 shadow-lg">{slide.tag}</div>
                      <h3 className="text-4xl lg:text-5xl font-black text-white shadow-black drop-shadow-md">{slide.title}</h3>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// OPTION 2: ATMOSPHERIC FULL-SCREEN (PATEL/MEDIALOOP)
// ==========================================
function HeroOption2() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % 3), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-screen min-h-[800px] bg-[#050505] overflow-hidden flex flex-col items-center justify-center">
      <AnimatePresence mode="popLayout">
        <motion.img
          key={current} src={slides[current].img}
          initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-black/50 z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#020512]/90 via-transparent to-[#020512] z-10" />
      <div className="relative z-20 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center -mt-10">
        <p className="text-[#00b4d8] tracking-[0.3em] uppercase text-xs md:text-sm font-bold mb-6 flex items-center gap-4">
          <span className="w-8 h-[1px] bg-[#00b4d8]/50" /> Navkar Engineering • Est. 2024 <span className="w-8 h-[1px] bg-[#00b4d8]/50" />
        </p>
        <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold text-white mb-6 tracking-tight leading-[1.1]">
          Architecting industrial <br /> landscapes that are <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00b4d8] to-blue-500">
            powerful & precise.
          </span>
        </h1>
        <p className="text-gray-300 max-w-2xl text-lg font-light mb-12">
          Trusted by Global MNCs. Delivering uncompromising performance in pneumatics, hydraulics, and compressed air systems.
        </p>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-2 flex items-center shadow-2xl w-full max-w-2xl relative group hover:bg-white/10 transition-colors">
          <div className="pl-6 pr-2 text-gray-400">
            <span className="text-xs font-bold tracking-widest uppercase text-[#00b4d8]">Explore</span>
          </div>
          <div className="w-[1px] h-6 bg-white/20 mx-4" />
          <input type="text" placeholder="Pneumatics, Compressors, Fittings..." className="bg-transparent border-none outline-none text-white w-full placeholder-gray-500 text-sm md:text-base font-light" />
          <Link to="/products" className="bg-[#00b4d8] text-[#020512] px-8 py-3 rounded-full font-bold hover:bg-white transition-colors flex items-center justify-center shrink-0">
            Search Catalog
          </Link>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// OPTION 3: TILTED INFINITE PARALLAX GALLERY
// ==========================================
function HeroOption3() {
  return (
    <section className="relative w-full min-h-[90vh] bg-[#f8fafc] overflow-hidden flex flex-col lg:flex-row items-center pt-24 lg:pt-0">
      {/* Left Typography */}
      <div className="w-full lg:w-1/2 z-20 px-6 lg:pl-20 py-10 lg:py-0">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <div className="w-16 h-1 bg-[#00b4d8] mb-8" />
          <h1 className="text-5xl lg:text-7xl font-black text-[#0a1a5c] leading-[1.05] tracking-tighter mb-6">
            Motion <br/> Controlled <br/> Perfectly.
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-md leading-relaxed">
            A totally new perspective on industrial fluid power. We deal in globally renowned brands ensuring zero friction in your operations.
          </p>
          <div className="flex gap-4">
            <Link className="px-10 py-4 bg-[#0a1a5c] text-white rounded-full font-bold hover:bg-[#00b4d8] transition-colors flex items-center justify-center gap-2 shadow-2xl">
              Explore Products <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right Infinite Scrolling Gallery */}
      <div className="w-full lg:w-1/2 relative h-[600px] lg:h-[100vh] z-10 flex items-center justify-center overflow-hidden">
        {/* Tilted Container */}
        <div className="absolute right-[-20%] lg:right-[-10%] top-[-20%] w-[120%] lg:w-[100%] h-[150vh] rotate-[-12deg] flex gap-4 lg:gap-8 opacity-90 blur-[1px] hover:blur-none transition-all duration-500">
          
          {/* Column 1 - Scrolling UP */}
          <motion.div 
            animate={{ y: [0, -1000] }} 
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="flex flex-col gap-4 lg:gap-8 w-1/2"
          >
            {[1,2,3,4,5,6].map((i) => (
              <img key={i} src={slides[i%3].img} className="h-[300px] lg:h-[400px] object-cover rounded-3xl shadow-xl border border-white/50" />
            ))}
          </motion.div>

          {/* Column 2 - Scrolling DOWN */}
          <motion.div 
            animate={{ y: [-1000, 0] }} 
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            className="flex flex-col gap-4 lg:gap-8 w-1/2 mt-32"
          >
            {[4,5,6,1,2,3].map((i) => (
              <img key={i} src={slides[i%3].img} className="h-[300px] lg:h-[400px] object-cover rounded-3xl shadow-xl border border-white/50" />
            ))}
          </motion.div>

        </div>

        {/* Gradient overlays to smooth edges */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#f8fafc] to-transparent z-20" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#f8fafc] to-transparent z-20" />
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#f8fafc] to-transparent z-20" />
      </div>
    </section>
  );
}

// ==========================================
// OPTION 4: MASSIVE TYPOGRAPHIC IMAGE MASK
// ==========================================
function HeroOption4() {
  return (
    <section className="relative w-full min-h-[90vh] bg-[#020512] flex items-center justify-center overflow-hidden">
      
      {/* Background Graphic Element */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-80 pointer-events-none select-none">
        <h1 
          className="text-[25vw] font-black leading-none tracking-tighter text-transparent bg-clip-text"
          style={{
            backgroundImage: "url('/images/hero/slide-1.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed"
          }}
        >
          POWER
        </h1>
      </div>

      <div className="absolute inset-0 bg-[#020512]/60 z-0 pointer-events-none" />

      {/* Central Glassmorphic Interface */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        whileInView={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.8 }}
        className="relative z-10 bg-white/5 backdrop-blur-2xl border border-white/10 p-10 lg:p-16 rounded-[2.5rem] w-[90%] max-w-3xl text-center shadow-[0_0_50px_rgba(0,180,216,0.15)] hover:shadow-[0_0_80px_rgba(0,180,216,0.3)] transition-shadow duration-500"
      >
        <div className="w-16 h-16 mx-auto bg-[#00b4d8]/20 rounded-full flex items-center justify-center mb-8 border border-[#00b4d8]/30">
          <Zap className="w-8 h-8 text-[#00b4d8]" />
        </div>
        
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
          Unleash <span className="text-[#00b4d8]">Potential.</span>
        </h2>
        
        <p className="text-gray-300 text-lg lg:text-xl mb-10 max-w-xl mx-auto font-light leading-relaxed">
          The ultimate fluid power dealership. We supply the most robust and authentic industrial components to keep your plant running 24/7.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link className="px-10 py-4 bg-[#00b4d8] text-[#020512] font-black rounded-full hover:bg-white transition-colors tracking-widest uppercase text-sm shadow-[0_0_20px_rgba(0,180,216,0.3)]">
            Our Catalog
          </Link>
          <Link className="px-10 py-4 bg-transparent text-white border border-white/20 font-bold rounded-full hover:bg-white/10 transition-colors tracking-widest uppercase text-sm">
            Contact Sales
          </Link>
        </div>
      </motion.div>

      {/* Floating abstract particles */}
      <div className="absolute top-[10%] left-[10%] w-2 h-2 bg-[#00b4d8] rounded-full animate-ping z-10" />
      <div className="absolute bottom-[20%] right-[15%] w-3 h-3 bg-white rounded-full animate-ping z-10" />
    </section>
  );
}
