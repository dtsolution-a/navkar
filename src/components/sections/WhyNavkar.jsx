
import { CheckCircle2, Award, Wrench, Package, Clock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUpVariants, staggerContainer, staggerItem } from '../../hooks/useScrollAnimation';

const features = [
  { icon: Award, title: 'Authorized Dealership', desc: 'Officially authorized for Kaishan and Airmarshall, bringing global quality.' },
  { icon: CheckCircle2, title: 'Technical Expertise', desc: 'Deep domain knowledge in compressed air, pneumatics, and instrumentation.' },
  { icon: Wrench, title: 'After-Sales Support', desc: 'End-to-end support, AMC, and emergency breakdown services ensuring uptime.' },
  { icon: Package, title: 'Ready Stock Inventory', desc: 'Extensive inventory of critical components ensuring minimal lead times.' },
  { icon: Clock, title: 'Fast & Safe Delivery', desc: 'Strategic logistics network across Gujarat and pan-India distribution.' },
  { icon: Shield, title: '100% Genuine Products', desc: 'Authentic, OEM-certified products with complete traceability and warranty.' },
];

export default function WhyNavkar() {
  return (
    <section className="py-24 bg-white border-b border-gray-100 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          {/* Left Column - Sticky Heading */}
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUpVariants}
            className="lg:w-5/12 lg:sticky lg:top-32 h-fit"
          >
            <p className="text-sm font-bold text-[#00b4d8] uppercase tracking-widest mb-4">The Navkar Advantage</p>
            <h2 className="text-4xl md:text-5xl font-black text-[#0a1a5c] leading-[1.1] mb-6">
              Why Partner With Us?
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              We don't just supply products; we build long-term engineering partnerships. Our commitment to quality, technical expertise, and post-sales support separates us from the rest.
            </p>
            <div className="hidden lg:block relative rounded-3xl overflow-hidden aspect-[4/3] shadow-lg">
               <img src="/images/categories/pneumatics.jpg" alt="Engineering Quality" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-[#0a1a5c]/20 mix-blend-multiply" />
            </div>
          </motion.div>

          {/* Right Column - Clean Editorial List */}
          <div className="lg:w-7/12">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="flex flex-col">
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <motion.div 
                    key={idx} 
                    variants={staggerItem}
                    className="group flex gap-6 py-8 border-b border-gray-200 hover:border-[#00b4d8] transition-colors duration-300"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-[#00b4d8] group-hover:border-[#00b4d8] transition-colors duration-300">
                        <Icon className="w-6 h-6 text-[#0a1a5c] group-hover:text-white transition-colors duration-300" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-black text-gray-300 uppercase tracking-widest group-hover:text-[#00b4d8]/50 transition-colors">
                          0{idx + 1}
                        </span>
                        <h3 className="text-2xl font-bold text-[#0a1a5c] group-hover:text-[#00b4d8] transition-colors duration-300">
                          {feat.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 leading-relaxed max-w-lg">{feat.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
