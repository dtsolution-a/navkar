
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUpVariants, staggerContainer, staggerItem } from '../../hooks/useScrollAnimation';

const testimonials = [
  {
    name: "Mr. Vikesh Verma",
    company: "AGM Operations",
    text: "Navkar Engineering has been a dependable partner for our pneumatic and hydraulic requirements. Their team provides suitable products, technical assistance and timely support for our maintenance needs."
  },
  {
    name: "Mr. Amit Agarwal",
    company: "Plant Head",
    text: "Good experience with Navkar Engineering. Their service team is responsive, knowledgeable and ensures proper follow-up for compressor maintenance and requirements."
  },
  {
    name: "Mr. Ramesh Krishnan",
    company: "Sr. Maintenance Manager",
    text: "We appreciate the prompt response and technical support from Navkar Engineering. Their team understands compressed-air systems well and provides practical solutions."
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
