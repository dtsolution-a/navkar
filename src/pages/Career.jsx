
import { motion } from 'framer-motion';
import { Briefcase, ArrowRight, CheckCircle2 } from 'lucide-react';
import CTASection from '../components/sections/CTASection';

export default function Career() {
  return (
    <div className="bg-white overflow-hidden">
      
      {/* HEADER */}
      <section className="relative w-full h-[50vh] min-h-[400px] flex flex-col justify-center items-center bg-[#050505]">
        <div className="absolute inset-0 z-0">
          <img src="/images/hero/slide-3.jpg" alt="Careers" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020512] via-black/50 to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-6 mt-16 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
              Join Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00b4d8] to-blue-500">Team</span>
            </h1>
            <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
              Build your career with a growing industrial engineering company focused on excellence and ethical practices.
            </p>
          </motion.div>
        </div>
      </section>

      {/* JOBS SECTION */}
      <section className="py-24 relative bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Current Openings</h2>
            <p className="text-gray-500">We are always looking for talented individuals to join our technical and sales teams.</p>
          </motion.div>

          <div className="space-y-6">
            {/* Job Card 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}
              className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl border border-gray-100 flex flex-col md:flex-row gap-8 items-center justify-between group hover:-translate-y-1 transition-transform"
            >
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-blue-50 text-[#00b4d8] rounded-2xl flex items-center justify-center shrink-0">
                  <Briefcase className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Sales Engineer</h3>
                  <p className="text-gray-500 mb-4">Location: Vashi, Navi Mumbai | Experience: 2-4 Years</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase">B2B Sales</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase">Pneumatics</span>
                  </div>
                </div>
              </div>
              <a href="mailto:info@navkarengg.in" className="w-full md:w-auto px-8 py-4 bg-gray-900 text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#00b4d8] transition-colors shrink-0">
                Apply Now <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>

            {/* Job Card 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} viewport={{ once: true }}
              className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl border border-gray-100 flex flex-col md:flex-row gap-8 items-center justify-between group hover:-translate-y-1 transition-transform"
            >
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-blue-50 text-[#00b4d8] rounded-2xl flex items-center justify-center shrink-0">
                  <Briefcase className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Service Technician</h3>
                  <p className="text-gray-500 mb-4">Location: Field Work (Mumbai) | Experience: 1-3 Years</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase">Compressors</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase">Maintenance</span>
                  </div>
                </div>
              </div>
              <a href="mailto:info@navkarengg.in" className="w-full md:w-auto px-8 py-4 bg-gray-900 text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#00b4d8] transition-colors shrink-0">
                Apply Now <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>

          </div>

          <motion.div 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}
            className="mt-16 bg-blue-50 border border-[#00b4d8]/20 rounded-3xl p-8 text-center"
          >
            <CheckCircle2 className="w-10 h-10 text-[#00b4d8] mx-auto mb-4" />
            <h4 className="text-xl font-bold text-gray-900 mb-2">Don't see a fit?</h4>
            <p className="text-gray-600 mb-6">Send us your resume anyway. We are always looking for exceptional talent.</p>
            <a href="mailto:info@navkarengg.in" className="text-[#00b4d8] font-bold hover:underline">info@navkarengg.in</a>
          </motion.div>

        </div>
      </section>

      <CTASection />
    </div>
  );
}
