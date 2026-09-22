
import { Globe, Package, Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../hooks/useScrollAnimation';

export default function StatsSection() {
  const stats = [
    { num: '4+', label: 'Global Brands', icon: Globe },
    { num: '500+', label: 'Products', icon: Package },
    { num: '500+', label: 'Clients', icon: Users },
    { num: '24h', label: 'Response', icon: Clock },
  ];

  return (
    <section className="py-16 bg-[#0a1a5c] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(0,180,216,1)_0%,transparent_100%)]" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i} variants={staggerItem} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#00b4d8]" />
                </div>
                <div className="text-4xl font-bold text-white mb-2">{s.num}</div>
                <div className="text-sm font-medium text-gray-300 uppercase tracking-wider">{s.label}</div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
