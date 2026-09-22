import { useScrollAnimation, fadeUpVariants } from '../../hooks/useScrollAnimation';
import { motion } from 'framer-motion';
import './BrandSlider.css';

// Actual brand logo files from /public/images/slider/
const logoFiles = [
  '4-2-scaled.jpg', '5-3-scaled.jpg', '6-2-scaled.jpg', '7-2-scaled.jpg',
  '8-2-scaled.jpg', '9-2-scaled.jpg', '10-2-scaled.jpg', '11-2-scaled.jpg',
  '12-2-scaled.jpg', '13-3-scaled.jpg', '14-2-scaled.jpg', '15-3-scaled.jpg',
  '16-3-scaled.jpg', '17-2-scaled.jpg', '18-2-scaled.jpg', '19-2-scaled.jpg',
  '20-2-scaled.jpg', '21-2-scaled.jpg', '22-2-scaled.jpg', '23-3-scaled.jpg',
  '24-3-scaled.jpg', '25-2-scaled.jpg', '26-2-scaled.jpg', '27-2-scaled.jpg',
  '28-3-scaled.jpg', '29-2-scaled.jpg', '30-2-scaled.jpg', '31-2-scaled.jpg',
  '32-2-scaled.jpg', '33-2-scaled.jpg', '34-2-scaled.jpg', '35-3-scaled.jpg',
  '36-2-scaled.jpg', '37-3-scaled.jpg', '38-2-scaled.jpg', '39-3-scaled.jpg',
  '40-2-scaled.jpg', '41-2-scaled.jpg', '42-3-scaled.jpg', '43-2-scaled.jpg',
  '44-2-scaled.jpg', '45-3-scaled.jpg', '46-3-scaled.jpg', '47-2-scaled.jpg',
  '48-2-scaled.jpg', '49-2-scaled.jpg', '50-2-scaled.jpg', '51-2-scaled.jpg',
];

const brandLogos = logoFiles.map((file, i) => ({
  id: i + 1,
  image: `/images/slider/${file}`,
}));

// Split logos into two rows for better visual balance
const row1 = brandLogos.slice(0, 24);
const row2 = brandLogos.slice(24, 48);


export default function BrandSlider() {
  const { ref, isInView } = useScrollAnimation();

  return (
    <section className="section-padding bg-gray-950 border-t border-gray-800">
      <div className="container-wide">
        {/* Heading */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeUpVariants}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="badge-blue mb-4">Trusted Clients</p>
          <h2 className="heading-display text-[clamp(1.8rem,3.5vw,2.8rem)] text-white">
            Brands We've Served
          </h2>
          <p className="text-gray-400 mt-4">
            Delivering innovative solutions to some of the industry's most respected organizations.
          </p>
        </motion.div>

        {/* Marquee Container */}
        <div className="space-y-8">
          {/* Row 1 - Left to Right */}
          <div className="overflow-hidden bg-gray-900 rounded-lg border border-gray-800">
            <div className="marquee">
              <div className="marquee-content">
                {[...row1, ...row1].map((logo, idx) => (
                  <div key={idx} className="marquee-item">
                    <div className="logo-card">
                      <img
                        src={logo.image}
                        alt={`Brand ${logo.id}`}
                        className="logo-image"
                        onError={(e) => (e.target.style.display = 'none')}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2 - Right to Left (Reverse Direction) */}
          <div className="overflow-hidden bg-gray-900 rounded-lg border border-gray-800">
            <div className="marquee marquee-reverse">
              <div className="marquee-content">
                {[...row2, ...row2].map((logo, idx) => (
                  <div key={idx} className="marquee-item">
                    <div className="logo-card">
                      <img
                        src={logo.image}
                        alt={`Brand ${logo.id}`}
                        className="logo-image"
                        onError={(e) => (e.target.style.display = 'none')}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
