
import { motion } from 'framer-motion';
import { ArrowRight, Wrench, ShieldCheck, Zap, Activity } from 'lucide-react';
import CTASection from '../components/sections/CTASection';
import { Link } from 'react-router-dom';

const services = [
  { id: 1, title: 'Compressor Maintenance', icon: Wrench, desc: 'Scheduled servicing, oil changes, and overhauls for all rotary screw and piston compressors to ensure zero downtime.', img: '/images/hero/slide-1.jpg' },
  { id: 2, title: 'Pneumatic System Audits', icon: Activity, desc: 'Comprehensive air leak detection and pressure optimization to reduce energy bills and improve efficiency.', img: '/images/hero/slide-3.jpg' },
  { id: 3, title: 'Pipeline Installation', icon: Zap, desc: 'End-to-end design and installation of aluminum and SS piping networks for compressed air and gases.', img: '/images/hero/slide-2.jpg' },
  { id: 4, title: '24/7 Breakdown Support', icon: ShieldCheck, desc: 'Emergency repair services by OEM-certified technicians to get your plant back up and running immediately.', img: '/images/hero/slide-4.jpg' }
];

export default function Services() {
  return (
    <div className="bg-white overflow-hidden">
      
      {/* HEADER */}
      <section className="relative w-full h-[50vh] min-h-[400px] flex flex-col justify-center items-center bg-[#050505]">
        <div className="absolute inset-0 z-0">
          <img src="/images/hero/slide-3.jpg" alt="Services" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020512] via-black/50 to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-6 mt-16 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
              Expert <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00b4d8] to-blue-500">Services</span>
            </h1>
            <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
              Beyond just parts. We provide end-to-end engineering support, maintenance, and installations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="py-24 relative bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {services.map((srv, i) => (
              <motion.div 
                key={srv.id}
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, delay: (i % 2) * 0.2 }} 
                viewport={{ once: true }}
                className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100 group flex flex-col sm:flex-row hover:-translate-y-2 transition-transform duration-500"
              >
                <div className="w-full sm:w-2/5 h-64 sm:h-auto relative overflow-hidden">
                  <img src={srv.img} alt={srv.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-[#0a1a5c]/20 group-hover:bg-transparent transition-colors duration-500" />
                </div>
                
                <div className="w-full sm:w-3/5 p-8 flex flex-col justify-center">
                  <div className="w-12 h-12 bg-blue-50 text-[#00b4d8] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#00b4d8] group-hover:text-white transition-colors duration-500">
                    <srv.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{srv.title}</h3>
                  <p className="text-gray-500 font-light mb-8 leading-relaxed">{srv.desc}</p>
                  <Link to="/contact" className="inline-flex items-center gap-2 text-[#0a1a5c] font-bold uppercase tracking-widest text-sm hover:text-[#00b4d8] transition-colors">
                    Request Service <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
