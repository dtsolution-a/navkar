
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  {
    mainImg: '/images/hero/slide-1.jpg',
    subImg: '/images/hero/slide-2.jpg',
    tag: 'Industrial Excellence',
    headline: 'Powering Industry with Precision.',
  },
  {
    mainImg: '/images/hero/slide-3.jpg',
    subImg: '/images/hero/slide-4.jpg',
    tag: 'Premium Solutions',
    headline: 'Fluid Power & Compressed Air.',
  },
  {
    mainImg: '/images/hero/slide-2.jpg',
    subImg: '/images/hero/slide-1.jpg',
    tag: 'Expert Engineering',
    headline: 'Unmatched Technical Support.',
  }
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <section className="relative w-full min-h-[90vh] bg-[#f8fafc] overflow-hidden flex items-center pt-20 pb-12 lg:py-0">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(#e2e8f0_1px,transparent_1px),linear-gradient(90deg,#e2e8f0_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] rounded-full bg-[#00b4d8]/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left Text Content */}
          <div className="w-full lg:w-1/2">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 mb-8">
                  <span className="w-2 h-2 rounded-full bg-[#00b4d8] animate-ping" />
                  <span className="text-xs font-bold text-[#0a1a5c] uppercase tracking-wider">{slide.tag}</span>
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-[72px] font-black text-[#0a1a5c] leading-[1.05] mb-6 tracking-tight">
                  {slide.headline.split(' ').map((word, i, arr) => (
                    <span key={i} className={i === arr.length - 1 ? "text-[#00b4d8]" : ""}>
                      {word}{' '}
                    </span>
                  ))}
                </h1>
                
                <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-lg leading-relaxed">
                  As an authorized dealership for premium global brands, we deliver end-to-end pneumatic and hydraulic solutions across India.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/products" className="px-8 py-4 bg-[#0a1a5c] text-white font-bold rounded-xl hover:bg-[#00b4d8] transition-colors flex items-center justify-center gap-2 group shadow-lg shadow-[#0a1a5c]/20">
                    Explore Catalog <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/contact" className="px-8 py-4 bg-white text-[#0a1a5c] font-bold rounded-xl hover:bg-gray-50 transition-colors border border-gray-200 text-center flex items-center justify-center gap-2">
                    Contact Sales <ArrowUpRight className="w-5 h-5 text-gray-400" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Trust Badges */}
            <div className="mt-12 flex items-center gap-8 border-t border-gray-200 pt-8">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <CheckCircle className="w-5 h-5 text-[#00b4d8]" /> OEM Certified
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <CheckCircle className="w-5 h-5 text-[#00b4d8]" /> Pan-India Delivery
              </div>
            </div>
          </div>

          {/* Right Image Composition - Unique Floating Design */}
          <div className="w-full lg:w-1/2 relative h-[500px] lg:h-[700px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.7 }}
                className="absolute inset-0 w-full h-full"
              >
                {/* Main Large Image (Arched / Pill Shape) */}
                <div className="absolute top-0 right-0 w-[80%] h-[85%] bg-gray-200 rounded-t-[200px] rounded-b-[40px] overflow-hidden shadow-2xl border-4 border-white">
                  <img src={slide.mainImg} alt="Industrial Equipment" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a5c]/40 to-transparent" />
                </div>
                
                {/* Secondary Offset Image (Circle) */}
                <div className="absolute bottom-[5%] left-0 w-[45%] aspect-square bg-gray-200 rounded-full overflow-hidden shadow-2xl border-4 border-white z-10">
                  <img src={slide.subImg} alt="Engineering Detail" className="w-full h-full object-cover" />
                </div>

                {/* Floating Stat Badge */}
                <div className="absolute top-[20%] left-[5%] bg-white p-4 rounded-2xl shadow-xl z-20 border border-gray-100 flex items-center gap-4 animate-[bounce_4s_infinite]">
                  <div className="w-12 h-12 bg-[#00b4d8]/10 rounded-full flex items-center justify-center font-black text-[#00b4d8] text-xl">
                    30+
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Years of</p>
                    <p className="font-bold text-[#0a1a5c]">Excellence</p>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>

            {/* Slider Dots */}
            <div className="absolute bottom-0 right-[10%] flex gap-2 z-30">
              {slides.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrent(i)}
                  className={"w-3 h-3 rounded-full transition-all " + (i === current ? "bg-[#00b4d8] scale-125" : "bg-gray-300")}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
