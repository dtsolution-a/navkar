
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Settings, Activity, Wind, Search, CheckCircle2 } from 'lucide-react';
import CTASection from '../components/sections/CTASection';

const categories = [
  { id: 'compressors', name: 'Air Compressors', icon: Wind, desc: 'High-efficiency screw and piston compressors for industrial applications.', img: '/images/categories/air-compressor.jpg' },
  { id: 'pneumatics', name: 'Pneumatics', icon: Activity, desc: 'Valves, cylinders, and air preparation units for precision automation.', img: '/images/categories/pneumatic.jpg' },
  { id: 'hydraulics', name: 'Hydraulics', icon: Settings, desc: 'Heavy-duty hydraulic pumps, motors, and fluid power systems.', img: '/images/categories/hydraulic.jpg' },
  { id: 'instrumentation', name: 'Instrumentation', icon: CheckCircle2, desc: 'Fittings, tubes, and measurement tools for exact pressure control.', img: '/images/categories/instrumentation.jpg' },
  { id: 'gas', name: 'Gas Generation', icon: Wind, desc: 'On-site nitrogen and oxygen generators for continuous supply.', img: '/images/categories/gas.jpg' }
];

export default function Products() {
  const [activeFilter, setActiveFilter] = useState('All');

  return (
    <div className="bg-gray-50 dark:bg-gray-950 overflow-hidden">
      
      {/* HEADER */}
      <section className="relative w-full h-[50vh] min-h-[400px] flex flex-col justify-center items-center bg-[#050505]">
        <div className="absolute inset-0 z-0">
          <img src="/images/hero/slide-4.jpg" alt="Products" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020512] via-black/50 to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-6 mt-16 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00b4d8] to-blue-500">Catalog</span>
            </h1>
            <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
              Explore our comprehensive range of 500+ premium industrial products from 7+ global brands.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FILTER & GRID */}
      <section className="py-20 relative bg-white">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Search/Filter Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col md:flex-row justify-between items-center gap-6 mb-16 bg-white border border-gray-100 p-4 rounded-full shadow-lg"
          >
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
              {['All', 'Compressors', 'Pneumatics', 'Hydraulics'].map(filter => (
                <button 
                  key={filter} 
                  onClick={() => setActiveFilter(filter)}
                  className={"px-6 py-2 rounded-full font-bold text-sm transition-colors whitespace-nowrap " + (activeFilter === filter ? "bg-[#0a1a5c] text-white" : "text-gray-500 hover:bg-gray-100")}
                >
                  {filter}
                </button>
              ))}
            </div>
            
            <div className="relative w-full md:w-72 hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search products..." className="w-full bg-gray-50 border-none rounded-full py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-[#00b4d8] text-sm" />
            </div>
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, i) => (
              <motion.div 
                key={cat.id}
                initial={{ opacity: 0, y: 50 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, delay: (i % 3) * 0.15 }} 
                viewport={{ once: true, margin: "-50px" }}
                className="bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100 group hover:-translate-y-2 transition-all duration-300"
              >
                <div className="h-56 overflow-hidden relative">
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent opacity-80" />
                  <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                    <cat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{cat.name}</h3>
                  <p className="text-gray-500 font-light mb-6 line-clamp-2">{cat.desc}</p>
                  <button className="flex items-center gap-2 text-[#00b4d8] font-bold uppercase tracking-widest text-sm group-hover:text-[#0a1a5c] transition-colors">
                    View Details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <p className="text-gray-500 mb-6">Need a specific component not listed here?</p>
            <a href="/contact" className="inline-flex px-8 py-4 bg-[#0a1a5c] text-white rounded-full font-bold shadow-xl hover:bg-[#00b4d8] transition-colors">
              Request Full Catalog
            </a>
          </motion.div>

        </div>
      </section>

      <CTASection />
    </div>
  );
}
