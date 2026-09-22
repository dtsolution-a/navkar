
import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUpVariants } from '../../hooks/useScrollAnimation';

export default function CTASection() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUpVariants}
          className="bg-gradient-to-br from-[#0a1a5c] to-[#040924] rounded-3xl p-12 md:p-20 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00b4d8]/20 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to Optimize Your <br/> <span className="text-[#00b4d8]">Industrial Setup?</span>
            </h2>
            <p className="text-gray-300 mb-10 max-w-2xl mx-auto text-lg">
              Connect with our engineering experts today for tailored fluid power, compressed air, and instrumentation solutions.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <Link to="/contact" className="px-10 py-5 bg-[#00b4d8] text-[#0a1a5c] font-bold text-lg rounded-full hover:bg-white transition-colors flex items-center gap-3 shadow-[0_0_20px_rgba(0,180,216,0.3)] hover:scale-105 transform duration-200">
                Request a Quote <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="tel:+91XXXXXXXXXX" className="px-10 py-5 border-2 border-white/20 text-white font-bold text-lg rounded-full hover:border-white hover:bg-white/5 transition-colors flex items-center gap-3">
                <Phone className="w-5 h-5" /> +91 XXXXXXXXXX
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
