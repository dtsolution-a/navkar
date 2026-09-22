import { useState } from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation, staggerContainer, staggerItem, fadeUpVariants } from '../../hooks/useScrollAnimation';
import { CheckCircle2, Award, Wrench, Package, Clock, Shield } from 'lucide-react';

const features = [
  {
    icon: Award,
    title: 'Authorized Dealership',
    description: 'Officially authorized to distribute and support Kaishan and Airmarshall products. We also deal with Parker, Airnet, Tubacex, and Trident.',
  },
  {
    icon: CheckCircle2,
    title: 'Technical Expertise',
    description: 'Deep domain knowledge in compressed air, pneumatics, hydraulics, and instrumentation systems across diverse industries.',
  },
  {
    icon: Wrench,
    title: 'After-Sales Support',
    description: 'End-to-end support including installation, commissioning, annual maintenance contracts, and emergency breakdown services.',
  },
  {
    icon: Package,
    title: 'Ready Stock',
    description: 'Extensive warehouse inventory ensuring minimal lead times for critical spares and replacement parts across all product categories.',
  },
  {
    icon: Clock,
    title: 'Fast Delivery',
    description: 'Strategic location in Surat with efficient logistics network enabling rapid delivery across Gujarat and beyond.',
  },
  {
    icon: Shield,
    title: 'Genuine Products',
    description: '100% genuine, OEM-certified products with original manufacturer warranty. Zero-compromise on product authenticity.',
  },
];

export default function WhyNavkar() {
  const { ref, isInView } = useScrollAnimation();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const activeIndex = hoveredIndex;

  return (
    <section className="section-padding bg-white dark:bg-gray-950">
      <div className="container-wide">
        {/* Heading */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeUpVariants}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <p className="badge-blue mb-4">Why Navkar Engineering</p>
          <h2 className="heading-display text-[clamp(1.8rem,3.5vw,2.8rem)] text-gray-900 dark:text-white mb-4">
            Engineering Trust, Delivering Excellence
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
            We don&apos;t just supply products. We build partnerships. Every client relationship
            is backed by technical expertise and unwavering commitment.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          onMouseLeave={() => setHoveredIndex(null)}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {features.map(({ icon: Icon, title, description }, index) => {
            const isActive = index === activeIndex;
            return (
              <motion.div
                key={title}
                variants={staggerItem}
                onMouseEnter={() => setHoveredIndex(index)}
                className={`relative rounded-2xl p-7 border transition-all duration-300 group hover:shadow-card-hover cursor-pointer select-none
                  ${isActive
                    ? 'bg-[#0a1a5c] text-white border-[#0a1a5c] shadow-glow'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-accent/30'
                  }`}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/10 to-transparent" />
                )}
                <div className="relative">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5
                    ${isActive ? 'bg-white/20' : 'bg-accent/10 group-hover:bg-accent/20 transition-colors'}`}
                  >
                    <Icon className={`w-6 h-6 ${isActive ? 'text-accent' : 'text-accent'}`} />
                  </div>
                  <h3 className={`font-bold text-lg mb-2 ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                    {description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

