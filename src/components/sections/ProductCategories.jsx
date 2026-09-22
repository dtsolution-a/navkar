
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUpVariants, staggerContainer, staggerItem } from '../../hooks/useScrollAnimation';

const categories = [
  { id: 'compressors', name: 'Air Compressors', image: '/images/categories/compressed-air.jpg', brand: 'Kaishan', desc: 'Screw & Rotary Air Compressors' },
  { id: 'pneumatics', name: 'Pneumatics', image: '/images/categories/pneumatics.jpg', brand: 'Parker', desc: 'Cylinders, Valves & FRLs' },
  { id: 'instrumentation', name: 'Instrumentation', image: '/images/categories/instrumentation.jpg', brand: 'Parker', desc: 'Tube Fittings & Valves' },
  { id: 'hydraulics', name: 'Hydraulics', image: '/images/categories/hydraulics.jpg', brand: 'Parker', desc: 'Hoses, Fittings & Pumps' },
  { id: 'gas-gen', name: 'Gas Generation', image: '/images/categories/gas-generation.jpg', brand: 'Parker', desc: 'Nitrogen & Zero Air Generators' },
  { id: 'clean-energy', name: 'Clean Energy', image: '/images/categories/clean-energy.jpg', brand: 'Parker', desc: 'CNG & Hydrogen Solutions' },
];

export default function ProductCategories() {
  return (
    <section className="py-24 bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUpVariants} className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-bold text-[#00b4d8] uppercase tracking-widest mb-3">Industrial Solutions</p>
          <h2 className="text-3xl md:text-5xl font-bold text-[#0a1a5c] mb-6">Our Product Portfolio</h2>
          <p className="text-gray-600 text-lg">Premium components for critical industrial applications.</p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat, i) => (
            <motion.div key={i} variants={staggerItem}>
              <Link to={`/products/category/${cat.id}`} className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-200 flex flex-col hover:-translate-y-1 h-full">
                <div className="relative h-60 overflow-hidden">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a5c]/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute top-4 right-4 bg-[#0a1a5c]/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold text-[#00b4d8] uppercase border border-white/10">
                    {cat.brand}
                  </div>
                  <h3 className="absolute bottom-4 left-6 text-2xl font-bold text-white mb-0">{cat.name}</h3>
                </div>
                <div className="p-6 flex-1 flex flex-col bg-white">
                  <p className="text-gray-600 text-sm mb-6 flex-1">{cat.desc}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-sm font-bold text-[#0a1a5c] group-hover:text-[#00b4d8] transition-colors">
                      Explore Range
                    </span>
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#00b4d8] group-hover:text-white transition-colors text-[#0a1a5c]">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
