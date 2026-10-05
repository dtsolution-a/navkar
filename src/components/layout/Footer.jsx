import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useBrands } from '../../hooks/useSiteData';

const footerLinks = {
  company: [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Blog', href: '/blog' },
    { label: 'Career', href: '/career' },
    { label: 'Contact Us', href: '/contact' },
  ],
  products: [
    { label: 'Compressed Air Systems', href: '/products/kaishan' },
    { label: 'Pneumatics & Automation', href: '/products/parker/pneumatics' },
    { label: 'Instrumentation', href: '/products/parker/instrumentation' },
    { label: 'Air Piping Systems', href: '/products/airnet' },
    { label: 'SS Tubes & Pipes', href: '/products/tubacex' },
    { label: 'Air Purification', href: '/products/trident' },
  ],
  brands: [
    { label: 'Kaishan Compressors', href: '/products/kaishan' },
    { label: 'Airmarshall', href: '/products/airmarshall' },
    { label: 'Parker Hannifin', href: '/products/parker' },
    { label: 'Airnet', href: '/products/airnet' },
    { label: 'Tubacex', href: '/products/tubacex' },
    { label: 'Trident', href: '/products/trident' },
  ],
};

const socialLinks = [
  {
    label: 'LinkedIn',
    href: '#', // Client will add link later from admin panel
    color: '#0077B5',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.024-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.352V9.5h3.414v1.489h.049c.476-.9 1.637-1.852 3.371-1.852 3.604 0 4.271 2.372 4.271 5.455v6.86zM5.337 8.001c-1.145 0-2.07-.928-2.07-2.073 0-1.145.925-2.073 2.07-2.073 1.144 0 2.07.928 2.07 2.073 0 1.145-.926 2.073-2.07 2.073zm1.777 12.451H3.56V9.5h3.553v10.952zM22.225 0H1.771C.792 0 0 .771 0 1.723v20.554C0 23.229.792 24 1.771 24h20.451C23.2 24 24 23.229 24 22.277V1.723C24 .771 23.2 0 22.225 0z" />
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/91XXXXXXXXXX',
    color: '#25D366',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const { brands } = useBrands();

  const activeBrands = brands && brands.length > 0
    ? brands.filter(b => b.is_active !== 0).map(b => ({
        label: b.name,
        href: `/products/${b.id}`
      }))
    : footerLinks.brands;

  return (
    <footer className="bg-[#060f38] text-gray-400">
      {/* Main footer */}
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <img
                src="/images/navkar-logo.png"
                alt="Navkar Engineering"
                className="h-12 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-xs">
              Authorized dealership for Kaishan &amp; Airmarshall. Trusted partner for Parker, Airnet, Tubacex, and Trident. Where Reliability Meets Innovation.
            </p>
            {/* Contact */}
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-600" />
                <span className="text-gray-500">
                  Surat, Gujarat, India<br />
                  <span className="text-gray-700 text-xs">(Address to be updated)</span>
                </span>
              </div>

              <div className="space-y-4 mt-2">
                <h3 className="text-white font-bold mb-2">Contact Us</h3>

                <div className="space-y-2">
                  <p className="text-white text-xs font-semibold uppercase tracking-wider">General Inquiry:</p>
                  <a href="mailto:info@navkarengg.in" className="flex items-center gap-3 hover:text-white transition-colors">
                    <Mail className="w-4 h-4 flex-shrink-0 text-gray-600" />
                    info@navkarengg.in
                  </a>
                  <a href="tel:+91XXXXXXXXXX" className="flex items-center gap-3 hover:text-white transition-colors">
                    <Phone className="w-4 h-4 flex-shrink-0 text-gray-600" />
                    +91 90227 25714
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-5 tracking-tight">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-gray-500 hover:text-white transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-5 tracking-tight">Products</h4>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-gray-500 hover:text-white transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands + Social */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-5 tracking-tight">Our Brands</h4>
            <ul className="space-y-3">
              {activeBrands.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-gray-500 hover:text-white transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social */}
            <div className="mt-8">
              <h4 className="text-white text-sm font-semibold mb-4 tracking-tight">Connect</h4>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target={s.href !== '#' ? '_blank' : undefined}
                    rel={s.href !== '#' ? 'noopener noreferrer' : undefined}
                    aria-label={s.label}
                    title={s.label === 'LinkedIn' ? 'LinkedIn — link to be added' : s.label}
                    className="w-9 h-9 rounded-xl border border-gray-800 flex items-center justify-center text-gray-500 transition-all duration-200"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = s.color;
                      e.currentTarget.style.borderColor = s.color + '66';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '';
                      e.currentTarget.style.borderColor = '';
                    }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-900">
        <div className="container-wide py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-xs text-gray-600 text-center md:text-left">
              © 2026 Navkar Engineering. All rights reserved.
            </p>
            <p className="text-xs text-gray-700 text-center md:text-left">
              Designed &amp; Developed by <a href="https://medialooptech.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-semibold">Medialoop Tech Solutions</a>
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-600 font-medium">
            <Link to="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link>
            <span className="text-gray-800">|</span>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span className="text-gray-800">|</span>
            <Link to="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
          <p className="text-xs text-gray-700 text-center md:text-right">
            Surat, Gujarat, India
          </p>
        </div>
      </div>
    </footer>
  );
}

