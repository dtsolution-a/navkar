
import { Factory, Droplets, Zap, Shield, Beaker, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUpVariants, staggerContainer, staggerItem } from '../../hooks/useScrollAnimation';

const industries = [
  { name: 'Oil & Gas', icon: Droplets },
  { name: 'Pharmaceuticals', icon: Beaker },
  { name: 'Textiles', icon: Factory },
  { name: 'Power Generation', icon: Zap },
  { name: 'Defense', icon: Shield },
  { name: 'Automotive', icon: Truck },
];

export default function IndustriesWeServe() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUpVariants} className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0a1a5c] mb-4">Industries We Serve</h2>
          <p className="text-gray-600">Delivering critical industrial components across specialized sectors.</p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {industries.map((ind, i) => {
            const Icon = ind.icon;
            return (
              <motion.div key={i} variants={staggerItem} className="flex flex-col items-center justify-center p-6 border border-gray-100 rounded-2xl hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all bg-gray-50/50 cursor-default">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm text-[#0a1a5c]">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm text-center">{ind.name}</h3>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
