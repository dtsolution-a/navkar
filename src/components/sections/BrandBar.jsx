import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useScrollAnimation, staggerContainer, staggerItem } from '../../hooks/useScrollAnimation';
import { useBrands } from '../../hooks/useSiteData';

// Static fallback brand data for Navkar
const brandData = [
  {
    id: 'kaishan',
    name: 'Kaishan',
    logo: '/images/brands/kaishan.png',
    description: 'World-Class Air Compressors',
    href: '/products/kaishan',
    bg: 'bg-white',
    border: 'border-gray-200 hover:border-red-300',
    isImg: true,
    badgeType: 'dealer',
    badgeLabel: 'Authorized Dealership',
  },
  {
    id: 'airmarshall',
    name: 'Airmarshall',
    logo: '/images/brands/airmarshall.png',
    description: 'Compressed Air Solutions',
    href: '/products/airmarshall',
    bg: 'bg-white',
    border: 'border-gray-200 hover:border-blue-300',
    isImg: true,
    badgeType: 'dealer',
    badgeLabel: 'Authorized Dealership',
  },
  {
    id: 'parker',
    name: 'Parker Hannifin',
    logo: '/images/brands/parker.jpg',
    description: 'Fortune 250 · Motion & Control',
    href: '/products/parker',
    bg: 'bg-white',
    border: 'border-gray-200 hover:border-yellow-300',
    isImg: true,
    badgeType: 'deals',
    badgeLabel: 'We Deal With',
  },
  {
    id: 'airnet',
    name: 'Airnet',
    logo: '/images/brands/airnet.png',
    description: 'Aluminium Piping Systems',
    href: '/products/airnet',
    bg: 'bg-white',
    border: 'border-gray-200 hover:border-cyan-300',
    isImg: true,
    badgeType: 'deals',
    badgeLabel: 'We Deal With',
  },
  {
    id: 'tubacex',
    name: 'Tubacex',
    logo: '/images/brands/tubacex.png',
    description: 'Premium SS Tubes & Pipes',
    href: '/products/tubacex',
    bg: 'bg-white',
    border: 'border-gray-200 hover:border-green-300',
    isImg: true,
    badgeType: 'deals',
    badgeLabel: 'We Deal With',
  },
  {
    id: 'trident',
    name: 'Trident',
    logo: '/images/brands/trident.png',
    description: 'Air Purification Systems',
    href: '/products/trident',
    bg: 'bg-white',
    border: 'border-gray-200 hover:border-indigo-300',
    isImg: true,
    badgeType: 'deals',
    badgeLabel: 'We Deal With',
  },
];

export default function BrandBar() {
  const { ref, isInView } = useScrollAnimation();
  const { brands: dbBrands } = useBrands();

  const activeBrands = dbBrands && dbBrands.length > 0
    ? dbBrands.filter(b => b.is_active !== 0).map(b => ({
        id: b.id,
        name: b.name,
        logo: b.logo,
        description: b.tagline || b.description || '',
        href: `/products/${b.id}`,
        bg: 'bg-white',
        border: 'border-gray-200 hover:border-accent',
        isImg: true,
        badgeType: b.badge_type || 'deals',
        badgeLabel: b.badge_label || 'We Deal With',
      }))
    : brandData;

  return (
    <section className="section-padding-sm border-b border-[var(--color-border)] bg-gray-50 dark:bg-gray-900/40">
      <div className="container-wide">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
        >
          {/* Label */}
          <motion.p
            variants={staggerItem}
            className="text-center text-[11px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-[0.18em] mb-8"
          >
            Authorized Dealership &amp; Our Brands
          </motion.p>

          {/* Brand cards */}
          <motion.div
            variants={staggerContainer}
            className="flex flex-wrap justify-center gap-3"
          >
            {activeBrands.map((brand) => (
              <motion.div
                key={brand.id}
                variants={staggerItem}
                className="w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] lg:w-[calc(16.666%-10px)] flex-shrink-0"
              >
                <Link
                  to={brand.href}
                  className={`group flex flex-col items-center justify-center gap-2 px-4 py-5 rounded-2xl border h-full
                    ${brand.bg} ${brand.border}
                    transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5`}
                >
                  {/* Badge */}
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      brand.badgeType === 'dealer'
                        ? 'bg-accent/10 text-accent'
                        : 'bg-primary-600/10 text-primary-600 dark:text-accent/80'
                    }`}
                  >
                    {brand.badgeLabel}
                  </span>

                  {/* Logo image */}
                  <div className="h-14 flex items-center justify-center w-full px-3 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
                    <img
                      src={brand.logo}
                      alt={`${brand.name} logo`}
                      className="max-w-full max-h-10 object-contain transition-all duration-300 opacity-100"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'block';
                      }}
                    />
                    <span className="hidden text-base font-black text-gray-700 tracking-tight">
                      {brand.name}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-[10px] text-gray-500 font-medium text-center leading-tight group-hover:text-gray-700 transition-colors">
                    {brand.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

