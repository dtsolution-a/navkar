import { motion } from 'framer-motion';
import { useScrollAnimation, staggerContainer, fadeUpVariants } from '../../hooks/useScrollAnimation';
import { useCountUp } from '../../hooks/useCountUp';

const stats = [
  { target: 30, suffix: '+', label: 'Years of Experience', description: 'Founded in 1995' },
  { target: 7, suffix: '+', label: 'Global Brands', description: 'Authorized distributor' },
  { target: 500, suffix: '+', label: 'Products', description: 'Across all categories' },
  { target: 5800, suffix: '+', label: 'Satisfied Clients', description: 'Pan-India presence' },
];

function StatItem({ target, suffix, label, description, delay }) {
  const { count, ref } = useCountUp(target, 1800, delay);
  return (
    <div ref={ref} className="text-center">
      <div className="stat-number text-white">
        {count}{suffix}
      </div>
      <div className="text-base font-semibold text-white/90 mt-1">{label}</div>
      <div className="text-sm text-white/50 mt-0.5">{description}</div>
    </div>
  );
}

export default function StatsSection() {
  const { ref, isInView } = useScrollAnimation();

  return (
    <section className="section-padding bg-[#060f38] dark:bg-gray-950 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent/10 rounded-full blur-[100px]" />

      <div className="container-wide relative">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeUpVariants}
          className="text-center mb-14"
        >
          <p className="text-xs font-semibold text-accent tracking-[0.15em] uppercase mb-3">Numbers That Matter</p>
          <h2 className="heading-display text-[clamp(1.8rem,3.5vw,2.8rem)] text-white mb-4">
            Proven Track Record of Excellence
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Our numbers tell the story of trust, reliability and commitment across India's industrial landscape.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12"
        >
          {stats.map(({ target, suffix, label, description }, i) => (
            <StatItem
              key={label}
              target={target}
              suffix={suffix}
              label={label}
              description={description}
              delay={i * 100}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
