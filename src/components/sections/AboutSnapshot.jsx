
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { slideInLeft, slideInRight, fadeUpVariants } from '../../hooks/useScrollAnimation';

export default function AboutSnapshot() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gray-50 pointer-events-none skew-x-[-10deg] translate-x-20" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={slideInLeft} className="lg:w-1/2">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[500px]">
              <img src="/images/hero/slide-2.jpg" alt="Navkar Engineering" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-[#0a1a5c]/20" />
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#00b4d8] rounded-full flex items-center justify-center text-white font-bold text-xl">
                    2+
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0a1a5c]">Years of Trust</h4>
                    <p className="text-sm text-gray-500">Delivering excellence since inception</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={slideInRight} className="lg:w-1/2">
            <p className="text-sm font-bold text-[#00b4d8] uppercase tracking-widest mb-3">About Navkar</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0a1a5c] mb-6 leading-tight">
              Built on Integrity. <br/> Driven by Innovation.
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed text-lg">
              Navkar Engineering was founded with a clear vision - to deliver world-class industrial fluid power and compressed air solutions. As an authorized dealership for premium global brands, we bring unmatched technical excellence across India.
            </p>
            
            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                <div className="bg-[#00b4d8]/10 p-3 rounded-lg text-[#00b4d8]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[#0a1a5c] text-lg">Ethics Over Profit</h4>
                  <p className="text-sm text-gray-600 mt-1">Doing business the right way, ensuring transparency and genuine partnerships.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                <div className="bg-[#00b4d8]/10 p-3 rounded-lg text-[#00b4d8]">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[#0a1a5c] text-lg">Our Mission</h4>
                  <p className="text-sm text-gray-600 mt-1">Improving customer efficiency through high-quality products and services.</p>
                </div>
              </div>
            </div>

            <Link to="/about" className="inline-flex items-center gap-2 px-8 py-4 bg-[#0a1a5c] text-white font-bold rounded-lg hover:bg-[#00b4d8] transition-colors">
              Read Our Full Story <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
