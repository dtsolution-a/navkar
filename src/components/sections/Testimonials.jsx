
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUpVariants, staggerContainer, staggerItem } from '../../hooks/useScrollAnimation';

const testimonials = [
  {
    name: "Rajesh Patel",
    company: "Gujarat Chemicals Ltd.",
    text: "Navkar Engineering has been our trusted partner for 5 years. Their knowledge of Parker pneumatics is unmatched, and their after-sales support ensures our plant runs without downtime."
  },
  {
    name: "Amit Desai",
    company: "Desai Textiles",
    text: "We procured our entire Kaishan compressor setup from them. The team helped us calculate the exact CFM needed, saving us 20% in energy costs. Highly recommended!"
  },
  {
    name: "Vikram Singh",
    company: "Singh Pharma",
    text: "Genuine products, transparent pricing, and instant delivery. Whenever we need critical fluid power components, Navkar is our first call."
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUpVariants} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0a1a5c] mb-4">Client <span className="text-[#00b4d8]">Testimonials</span></h2>
          <p className="text-gray-600">Don't just take our word for it, hear from our clients.</p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div key={i} variants={staggerItem} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
              <div className="flex text-yellow-400 mb-4">
                {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-gray-600 mb-6 italic">"{t.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#0a1a5c] flex items-center justify-center text-white font-bold">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{t.name}</h4>
                  <p className="text-xs text-gray-500">{t.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
