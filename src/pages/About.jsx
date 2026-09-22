import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, ArrowRight, Users, Target, Heart, Award, 
  Lightbulb, TrendingUp, Shield
} from 'lucide-react';
import { useScrollAnimation, fadeUpVariants, staggerContainer, staggerItem, slideInLeft, slideInRight } from '../hooks/useScrollAnimation';
import CTASection from '../components/sections/CTASection';
import { useTimeline } from '../hooks/useSiteData';


const values = [
  { icon: Heart, title: 'Ethics Over Profit', description: 'Finances are important, but not at the expense of ethics. Success comes from faith and effort.' },
  { icon: Target, title: 'Customer First', description: 'We improve the efficiency of our customers through quality products and solutions that build lifetime relationships.' },
  { icon: Users, title: 'Collective Growth', description: 'We believe in collective motivational growth and development for both our valued customers and dedicated employees.' },
  { icon: Lightbulb, title: 'Innovation', description: 'Committed to bringing the latest industrial technologies to Indian manufacturers and process plants.' },
  { icon: TrendingUp, title: 'Sustainable Growth', description: 'Contributing to sustainable growth through innovative technologies and energy-efficient solutions.' },
  { icon: Shield, title: 'Trust & Reliability', description: 'Three decades of consistent delivery, genuine products, and technical support build our reputation.' },
];

export default function About() {
  const { ref, isInView } = useScrollAnimation();
  const { ref: timelineRef, isInView: timelineInView } = useScrollAnimation();
  const { ref: valuesRef, isInView: valuesInView } = useScrollAnimation();
  const { timeline } = useTimeline();

  return (
    <div>
      {/* Hero */}
      <section className="section-padding bg-white dark:bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
        <div className="container-wide relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <p className="badge-blue mb-5">About Navkar Engineering</p>
            <h1 className="heading-display text-[clamp(2rem,4vw,3.5rem)] text-gray-900 dark:text-white mb-6">
              Three Decades of Industrial Excellence in{' '}
              <span className="text-gradient">Surat, Gujarat</span>
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              Founded in 1995 with unwavering values of honesty, integrity, and quality service — 
              Navkar Engineering has grown into India's trusted partner for precision industrial fluid power solutions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Company story */}
      <section className="section-padding bg-gray-50 dark:bg-gray-900/30 overflow-hidden">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-stretch">

            {/* ── Left — Story text ── */}
            <motion.div
              ref={ref}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              variants={slideInLeft}
              className="flex flex-col justify-center"
            >
              <p className="badge-blue mb-5">Our Story</p>
              <h2 className="heading-display text-[clamp(1.6rem,3vw,2.5rem)] text-gray-900 dark:text-white mb-6 leading-tight">
                Built on Values,<br />Grown through Trust
              </h2>
              <div className="space-y-5 text-gray-500 dark:text-gray-400 leading-relaxed text-base">
                <p>
                  The story of Navkar Engineering begins with a vision — to contribute meaningfully to the growing 
                  industrial landscape of Surat. Founded in 1995, the company started as Navkar Enterprise, 
                  built on the strong values of its founder, <strong className="text-gray-800 dark:text-gray-200">Kaushik Navkar</strong>.
                </p>
                <p>
                  With over 30 years of experience, Navkar Engineering has become a trusted name in delivering 
                  energy-efficient Compressed Air and Gas Generation solutions, along with Air Treatment 
                  Equipment and a wide range of Hydraulic, Pneumatic, and Instrumentation components.
                </p>
                <p>
                  Today, the group serves diverse industries across India, known for reliability, innovation, 
                  and long-term client relationships built on a foundation of technical excellence and 
                  ethical business practices.
                </p>
              </div>

              {/* Guiding principle callout */}
              <div className="mt-8 p-5 rounded-2xl border-l-4 border-accent bg-accent/5 dark:bg-accent/10">
                <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-1">Guiding Principle</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white italic">"Ethics Over Profit"</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">The heartbeat of Navkar Engineering since 1995</p>
              </div>

              {/* Quick stats */}
              <div className="mt-8 grid grid-cols-4 gap-3">
                {[
                  { value: '1995', label: 'Founded' },
                  { value: '30+', label: 'Years' },
                  { value: '7+', label: 'Global Brands' },
                  { value: '5800+', label: 'Clients' },
                ].map(({ value, label }) => (
                  <div key={label} className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 text-center">
                    <div className="text-xl font-bold text-gray-900 dark:text-white font-mono">{value}</div>
                    <div className="text-[10px] text-gray-500 font-medium mt-0.5 leading-tight">{label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── Right — Big Kaushik Navkar portrait ── */}
            <motion.div
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              variants={slideInRight}
              className="relative"
            >
              {/* Decorative background blob */}
              <div className="absolute -top-8 -right-8 w-72 h-72 bg-accent/10 rounded-full blur-[60px] pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-blue-400/10 rounded-full blur-[40px] pointer-events-none" />

              {/* Portrait frame */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ aspectRatio: '4/5', maxHeight: '600px' }}>
                <img
                  src="/images/kaushik-shah.png"
                  alt="Kaushik Navkar — Founder and Managing Director, Navkar Engineering"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.style.background = 'linear-gradient(135deg, #1e3a8a 0%, #2563EB 100%)';
                    e.target.parentElement.innerHTML += '<div class="absolute inset-0 flex items-center justify-center"><span class="text-[8rem] font-black text-white/20">KS</span></div>';
                  }}
                />

                {/* Bottom overlay with name */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-transparent p-8 pt-20">
                  <p className="text-accent text-xs font-bold tracking-[0.15em] uppercase mb-1">Founder and Managing Director</p>
                  <h3 className="text-2xl font-bold text-white mb-0.5">Kaushik Navkar</h3>
                  <p className="text-gray-400 text-sm">Navkar Engineering</p>
                </div>

                {/* Since 1995 badge */}
                <div className="absolute top-5 left-5 bg-accent text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-glow">
                  Since 1995
                </div>
              </div>

              {/* Quote card floating outside the image */}
              <div className="mt-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-soft">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">
                  "The true measure of a business's success is not just its profit margins, but the enduring 
                  trust and lifelong relationships built with every customer."
                </p>
                <p className="text-xs font-bold text-gray-900 dark:text-white mt-3">— Kaushik Navkar, Founder and Managing Director</p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>


      {/* Timeline */}
      <section className="section-padding bg-white dark:bg-gray-950">
        <div className="container-narrow">
          <motion.div
            ref={timelineRef}
            initial="hidden"
            animate={timelineInView ? 'visible' : 'hidden'}
            variants={fadeUpVariants}
            className="text-center mb-14"
          >
            <p className="badge-blue mb-4">Our Journey</p>
            <h2 className="heading-display text-[clamp(1.6rem,3vw,2.5rem)] text-gray-900 dark:text-white">
              Milestones That Define Us
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={timelineInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className="relative"
          >
            {/* Line */}
            <div className="absolute left-[60px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-accent/30 to-transparent" />

            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                variants={staggerItem}
                className={`flex items-start gap-8 mb-10 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                {/* Content */}
                <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <div className="ml-20 md:ml-0 card p-5 inline-block max-w-sm">
                    <span className="text-accent text-xs font-bold tracking-wider">{item.year}</span>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mt-1 leading-relaxed">{item.event}</p>
                  </div>
                </div>

                {/* Dot */}
                <div className="absolute left-[52px] md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-accent border-4 border-white dark:border-gray-950 shadow-glow mt-5" />

                {/* Spacer for right side */}
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-gray-50 dark:bg-gray-900/30">
        <div className="container-wide">
          <motion.div
            ref={valuesRef}
            initial="hidden"
            animate={valuesInView ? 'visible' : 'hidden'}
            variants={fadeUpVariants}
            className="text-center mb-14"
          >
            <p className="badge-blue mb-4">Our Values</p>
            <h2 className="heading-display text-[clamp(1.6rem,3vw,2.5rem)] text-gray-900 dark:text-white">
              The Principles We Live By
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={valuesInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {values.map(({ icon: Icon, title, description }) => (
              <motion.div
                key={title}
                variants={staggerItem}
                className="card p-7 group hover:border-accent/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
