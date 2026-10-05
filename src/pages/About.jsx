
import { Target, Eye, Shield, Users, Wrench, Award, Compass, Heart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useScrollAnimation, fadeUpVariants, staggerContainer, staggerItem, slideInRight, slideInLeft } from '../hooks/useScrollAnimation';
import CTASection from '../components/sections/CTASection';

export default function About() {
  const { ref: headerRef, isInView: headerInView } = useScrollAnimation();
  const { ref: missionRef, isInView: missionInView } = useScrollAnimation();

  return (
    <div className="pt-24 pb-0 bg-gray-50 dark:bg-gray-950">
      
      {/* Header Section */}
      <section className="py-20 lg:py-28 relative overflow-hidden bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div ref={headerRef} initial="hidden" animate={headerInView ? "visible" : "hidden"} variants={fadeUpVariants}>
            <p className="text-sm font-bold text-accent tracking-[0.2em] uppercase mb-6 flex items-center justify-center gap-4">
              <span className="w-8 h-[1px] bg-accent/50" />
              Navkar Engineering
              <span className="w-8 h-[1px] bg-accent/50" />
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-bold text-gray-900 dark:text-white mb-8 tracking-tight leading-[1.1]">
              Premium Compressed Air <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-500">Solutions</span>
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-light mb-10">
              Navkar Engineering is a growing industrial engineering company serving diverse industrial applications with comprehensive compressed air, pneumatic, hydraulic and fluid-handling solutions. Our approach combines trusted technology, technical knowledge and dedicated after-sales support.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div ref={missionRef} initial="hidden" animate={missionInView ? "visible" : "hidden"} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
            
            <motion.div variants={staggerItem} className="bg-white dark:bg-gray-900 rounded-[2rem] p-10 lg:p-14 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none relative overflow-hidden group hover:border-accent/30 transition-colors">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Target className="w-40 h-40" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-8">
                <Target className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed relative z-10 font-light">
                “To deliver the right products and engineering solutions through technical expertise, genuine quality, transparent practices and dependable service—while building relationships that create long-term value.”
              </p>
            </motion.div>

            <motion.div variants={staggerItem} className="bg-[#0a1a5c] rounded-[2rem] p-10 lg:p-14 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Eye className="w-40 h-40 text-white" />
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,180,216,0.15)_0%,transparent_60%)]" />
              
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-8 border border-white/20">
                <Eye className="w-8 h-8 text-[#00b4d8]" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-6">Our Vision</h2>
              <p className="text-lg text-gray-300 leading-relaxed relative z-10 font-light">
                “To build a business where engineering excellence and ethical practices go hand in hand, creating lasting value for customers, partners and society.”
              </p>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-16 h-16 mx-auto bg-accent/10 rounded-full flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">Core Values</h2>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 md:p-12 border border-gray-100 dark:border-gray-800">
            <h3 className="text-2xl font-bold text-accent mb-4">Trust Through Transparency</h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-light leading-relaxed">
              Clear communication, honest recommendations and transparent dealings form the foundation of every relationship.
            </p>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
