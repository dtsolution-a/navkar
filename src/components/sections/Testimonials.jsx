import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import { useScrollAnimation, fadeUpVariants, staggerContainer, staggerItem } from '../../hooks/useScrollAnimation';
import { useTestimonials } from '../../hooks/useSiteData';

const testimonials = [
  {
    id: 1,
    name: 'Rajesh Patel',
    title: 'Plant Manager',
    company: 'Reliance Industries Ltd.',
    industry: 'Petrochemicals',
    rating: 5,
    review: 'Navkar Engineering has been our go-to partner for Parker instrumentation components for over 8 years. Their technical expertise, genuine products, and prompt support have never let us down. The AMC team is highly responsive — critical for our plant operations.',
    avatar: 'RP',
    color: '#2563EB',
  },
  {
    id: 2,
    name: 'Nikhil Mehta',
    title: 'Procurement Head',
    company: 'Sun Pharmaceutical',
    industry: 'Pharmaceuticals',
    rating: 5,
    review: 'We sourced our complete compressed air system through Navkar Engineering — Kaishan screw compressors with Parker filtration. The system design was done expertly, installation was seamless, and post-sale support has been exceptional. Highly recommended.',
    avatar: 'NM',
    color: '#6366f1',
  },
  {
    id: 3,
    name: 'Suresh Agarwal',
    title: 'Engineering Director',
    company: 'Arvind Mills',
    industry: 'Textiles',
    rating: 5,
    review: 'As a large textile manufacturer, we need reliable pneumatic and hydraulic components at scale. Navkar Engineering consistently delivers genuine Parker products with short lead times and excellent technical support. Ethics Over Profit is not just their tagline — it shows in every interaction.',
    avatar: 'SA',
    color: '#0891b2',
  },
  {
    id: 4,
    name: 'Prakash Sharma',
    title: 'Maintenance Manager',
    company: 'GSFC Ltd.',
    industry: 'Chemicals',
    rating: 5,
    review: 'Our chemical plant depends on high-quality instrumentation and hydraulic components. Navkar Engineering\'s knowledge of Parker products is unmatched in Gujarat. They helped us redesign our instrumentation system, reducing downtime by 40%. Outstanding service team.',
    avatar: 'PS',
    color: '#d97706',
  },
  {
    id: 5,
    name: 'Amit Desai',
    title: 'Operations Head',
    company: 'ONGC Hazira',
    industry: 'Oil & Gas',
    rating: 5,
    review: 'For oil & gas, we cannot compromise on product quality. Navkar Engineering\'s supply of Tubacex SS pipes and Parker high-pressure instrumentation has been flawless — traceable, certified, and genuine. Their 30+ years of experience shows in how they handle critical applications.',
    avatar: 'AD',
    color: '#16a34a',
  },
  {
    id: 6,
    name: 'Vivek Joshi',
    title: 'Projects Manager',
    company: 'TORRENT Power',
    industry: 'Power Generation',
    rating: 5,
    review: 'Navkar Engineering supplied hydraulic connectors and filter systems for our power plant expansion project. Delivery was on time, documentation was complete, and the commissioning support was top-class. A vendor you can trust for critical projects.',
    avatar: 'VJ',
    color: '#8b5cf6',
  },
];

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-gray-700'}`}
        />
      ))}
    </div>
  );
}

export default function Testimonials({
  page = 'home',
  badge = 'Client Reviews',
  heading = "Trusted by India's Leading Industries",
  description = "Consistent delivery, genuine products, expert support. Here's what our clients say.",
  ratingDescription = '500+ satisfied clients across India',
}) {
  const { ref, isInView } = useScrollAnimation();
  const { testimonials: dbTestimonials } = useTestimonials(page);
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const timerRef = useRef(null);

  const colors = ['#2563EB', '#6366f1', '#0891b2', '#d97706', '#16a34a', '#8b5cf6'];
  const activeData = dbTestimonials && dbTestimonials.length > 0
    ? dbTestimonials.map((item, index) => ({
      id: item.id || index,
      name: item.name,
      title: item.designation || '',
      company: item.company || '',
      industry: item.company || 'Client',
      rating: item.rating || 5,
      review: item.message || '',
      avatar: item.name ? item.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'C',
      color: colors[index % colors.length]
    }))
    : testimonials;

  // Reset active index if activeData length changes to prevent out of bounds
  useEffect(() => {
    if (active >= activeData.length) {
      setActive(0);
    }
  }, [activeData.length, active]);

  // Auto-advance
  useEffect(() => {
    if (!autoplay || activeData.length === 0) return;
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % activeData.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [autoplay, active, activeData.length]);

  const go = (dir) => {
    setAutoplay(false);
    if (activeData.length === 0) return;
    setActive((prev) => (prev + dir + activeData.length) % activeData.length);
  };

  const t = activeData[active] || {
    id: 0,
    name: '',
    title: '',
    company: '',
    industry: '',
    rating: 5,
    review: '',
    avatar: '',
    color: '#2563EB'
  };

  return (
    <section className="section-padding bg-gray-50 dark:bg-gray-900/30 overflow-hidden">
      <div className="container-wide">

        {/* ── Heading ── */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeUpVariants}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <p className="badge-blue mb-4">{badge}</p>
          <h2 className="heading-display text-[clamp(1.8rem,3.5vw,2.8rem)] text-gray-900 dark:text-white mb-4">
            {heading}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
            {description}
          </p>

          {/* Aggregate rating */}
          <div className="mt-5 inline-flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-5 py-3 rounded-2xl shadow-soft">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">5.0</span>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{ratingDescription}</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ── Left — Featured review (large) ── */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 md:p-10 shadow-soft overflow-hidden flex flex-col justify-between"
              >
                {/* Background accent */}
                <div
                  className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] opacity-10 pointer-events-none"
                  style={{ background: t.color }}
                />

                {/* Quote icon */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: `${t.color}18` }}
                >
                  <Quote className="w-6 h-6" style={{ color: t.color }} />
                </div>

                <StarRating rating={t.rating} />

                <blockquote className="mt-5 text-gray-700 dark:text-gray-300 text-lg leading-relaxed font-medium">
                  "{t.review}"
                </blockquote>

                {/* Author */}
                <div className="mt-8">
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: t.color }}
                    >
                      {t.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-900 dark:text-white">{t.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t.title}</p>
                    </div>
                    <div>
                      <span
                        className="inline-flex px-3 py-1 rounded-full text-[11px] font-semibold"
                        style={{ background: `${t.color}15`, color: t.color }}
                      >
                        {t.industry}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="mt-10 flex items-center justify-between">
                  {/* Progress dots */}
                  <div className="flex gap-1.5">
                    {activeData.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => { setAutoplay(false); setActive(i); }}
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: i === active ? '24px' : '6px',
                          background: i === active ? t.color : '#D1D5DB',
                        }}
                      />
                    ))}
                  </div>

                  {/* Nav arrows */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => go(-1)}
                      className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => go(1)}
                      className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Right — Compact review stack ── */}
          <motion.div
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className="lg:col-span-5 space-y-3"
          >
            {activeData.filter((_, i) => i !== active).slice(0, 3).map((review) => (
              <motion.button
                key={review.id}
                variants={staggerItem}
                onClick={() => { setAutoplay(false); setActive(activeData.findIndex((r) => r.id === review.id)); }}
                className="w-full text-left group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                    style={{ background: review.color }}
                  >
                    {review.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{review.name}</p>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">{review.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                      "{review.review}"
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}


          </motion.div>
        </div>

      </div>
    </section>
  );
}

