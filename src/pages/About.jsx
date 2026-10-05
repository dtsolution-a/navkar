
import { Target, Eye, ShieldCheck, ChevronRight, Activity, Users, Globe, Settings, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CTASection from '../components/sections/CTASection';

export default function About() {
  return (
    <div className="bg-white overflow-hidden">
      
      {/* 1. CINEMATIC PAGE HEADER */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex flex-col justify-center items-center bg-[#050505]">
        <div className="absolute inset-0 z-0">
          <img src="/images/hero/slide-2.jpg" alt="Industrial" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020512] via-black/50 to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-6 mt-16 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#00b4d8] animate-pulse" />
              <span className="text-xs font-bold text-[#00b4d8] tracking-[0.2em] uppercase">Est. 2024</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
              Premium Compressed <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00b4d8] to-blue-500">
                Air Solutions
              </span>
            </h1>
            <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
              Engineering excellence and ethical practices creating lasting value.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. THE STORY & LONG DESCRIPTION (Split Screen) */}
      <section className="py-24 relative bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            
            {/* Left: Dynamic Image Collage */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}
              className="w-full lg:w-5/12 relative"
            >
              <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl relative z-10">
                <img src="/images/hero/slide-1.jpg" className="w-full h-full object-cover" />
              </div>
              
              {/* Floating Stat Card */}
              <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 z-20 w-64">
                <div className="w-12 h-12 bg-blue-50 text-[#00b4d8] rounded-full flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6" />
                </div>
                <h4 className="text-4xl font-black text-[#0a1a5c] mb-1">2+</h4>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Years of Trust</p>
              </div>

              {/* Background abstract element */}
              <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,rgba(0,180,216,0.05)_0%,transparent_60%)] -z-10" />
            </motion.div>

            {/* Right: Content from Email */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}
              className="w-full lg:w-7/12"
            >
              <h2 className="text-4xl font-black text-gray-900 mb-6">Who We Are</h2>
              
              <div className="pl-6 border-l-4 border-[#00b4d8] mb-10">
                <p className="text-xl text-gray-600 font-medium leading-relaxed">
                  Navkar Engineering is a growing industrial engineering company serving diverse industrial applications with comprehensive compressed air, pneumatic, hydraulic and fluid-handling solutions. Our approach combines trusted technology, technical knowledge and dedicated after-sales support.
                </p>
              </div>

              <div className="space-y-6 text-gray-500 font-light leading-relaxed">
                <p>
                  [INSERT PDF LONG DESCRIPTION HERE] As we continue to expand our operations, we remain deeply committed to supplying the industry with the highest caliber of fluid power components. We work alongside global giants to bring you unparalleled reliability.
                </p>
                <p>
                  Our goal is not just to be a supplier, but a dedicated technical partner that ensures zero downtime and maximum efficiency for your manufacturing plant. 
                </p>
              </div>

            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. CORE STATS ROW */}
      <section className="py-16 bg-[#020512] border-y border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero/slide-3.jpg')] opacity-5 mix-blend-screen bg-cover bg-center" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10 text-center">
            {[
              { icon: Globe, value: '7+', label: 'Global Brands' },
              { icon: Settings, value: '500+', label: 'Products Available' },
              { icon: Users, value: '100+', label: 'Clients Served' },
              { icon: Award, value: '100%', label: 'OEM Certified' }
            ].map((stat, i) => (
              <motion.div 
                key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center"
              >
                <stat.icon className="w-8 h-8 text-[#00b4d8] mb-4 opacity-80" />
                <h4 className="text-4xl lg:text-5xl font-black text-white mb-2">{stat.value}</h4>
                <p className="text-xs lg:text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. MISSION & VISION (Premium Cards) */}
      <section className="py-24 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Driving Industry Forward</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">The principles and goals that dictate every decision we make at Navkar Engineering.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Mission */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
              className="bg-white rounded-[2.5rem] p-10 lg:p-14 shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-gray-100 hover:-translate-y-2 transition-transform duration-500 group"
            >
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-[#00b4d8] transition-colors duration-500">
                <Target className="w-10 h-10 text-[#00b4d8] group-hover:text-white transition-colors duration-500" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-6">Our Mission</h3>
              <p className="text-lg text-gray-600 leading-relaxed font-light italic">
                “To deliver the right products and engineering solutions through technical expertise, genuine quality, transparent practices and dependable service—while building relationships that create long-term value.”
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }}
              className="bg-[#0a1a5c] rounded-[2.5rem] p-10 lg:p-14 shadow-[0_20px_60px_rgba(10,26,92,0.2)] relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Eye className="w-64 h-64 text-white -rotate-12" />
              </div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 border border-white/20 group-hover:bg-[#00b4d8] transition-colors duration-500">
                  <Eye className="w-10 h-10 text-[#00b4d8] group-hover:text-white transition-colors duration-500" />
                </div>
                <h3 className="text-3xl font-black text-white mb-6">Our Vision</h3>
                <p className="text-lg text-gray-300 leading-relaxed font-light italic">
                  “To build a business where engineering excellence and ethical practices go hand in hand, creating lasting value for customers, partners and society.”
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 5. CORE VALUES (Massive Banner) */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-50 rounded-full mb-8">
              <ShieldCheck className="w-12 h-12 text-[#00b4d8]" />
            </div>
            <h2 className="text-sm font-bold text-gray-400 tracking-[0.3em] uppercase mb-4">Core Value</h2>
            <h3 className="text-5xl md:text-7xl font-black text-[#0a1a5c] mb-10 tracking-tight">
              Trust Through <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00b4d8] to-blue-500">Transparency.</span>
            </h3>
            <p className="text-2xl text-gray-500 font-light max-w-3xl mx-auto leading-relaxed">
              Clear communication, honest recommendations and transparent dealings form the foundation of every relationship.
            </p>
          </motion.div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
