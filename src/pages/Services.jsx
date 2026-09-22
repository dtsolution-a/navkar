import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Wrench, Settings2, Clock, BookOpen, ArrowRight, 
  CheckCircle2, Zap, Shield, Users
} from 'lucide-react';
import { useScrollAnimation, fadeUpVariants, staggerContainer, staggerItem } from '../hooks/useScrollAnimation';
import CTASection from '../components/sections/CTASection';

const services = [
  {
    id: 'installation',
    icon: Wrench,
    title: 'Installation & Commissioning',
    description: 'Professional installation and commissioning of all equipment we supply, ensuring optimal performance from day one with proper startup procedures.',
    features: [
      'On-site installation by trained technicians',
      'Factory acceptance testing (FAT)',
      'Site acceptance testing (SAT)',
      'Performance verification & handover',
    ],
  },
  {
    id: 'support',
    icon: Shield,
    title: 'After-Sales Support',
    description: 'Dedicated technical support team available for troubleshooting, spare parts identification, and technical consultations.',
    features: [
      'Remote troubleshooting assistance',
      'Spare parts identification & supply',
      'Technical helpdesk support',
      'Site visits for complex issues',
    ],
  },
  {
    id: 'amc',
    icon: Clock,
    title: 'Annual Maintenance Contracts',
    description: 'Comprehensive AMC programs that ensure your equipment runs at peak efficiency year-round, minimizing downtime and unexpected repair costs.',
    features: [
      'Scheduled preventive maintenance',
      'Priority breakdown response',
      'Genuine spare parts at preferential rates',
      'Performance monitoring & reporting',
    ],
  },
  {
    id: 'supply',
    icon: Settings2,
    title: 'Product Supply & Sourcing',
    description: 'We procure and supply genuine products from Parker, Kaishan, Chicago Pneumatic, Tubacex, and Trident with full OEM warranty and documentation.',
    features: [
      'Authorized distributor — zero counterfeit risk',
      'Extensive ready stock for common items',
      'Fast procurement for specialized parts',
      'Technical datasheet and certification support',
    ],
  },
  {
    id: 'system-design',
    icon: Zap,
    title: 'System Design & Engineering',
    description: 'Our experienced engineers help design complete pneumatic, hydraulic, instrumentation and compressed air systems tailored to your specific process requirements.',
    features: [
      'Compressed air system sizing & design',
      'Pneumatic circuit design',
      'Instrumentation loop design',
      'Energy audit & efficiency recommendations',
    ],
  },
  {
    id: 'training',
    icon: BookOpen,
    title: 'Technical Training',
    description: 'Hands-on training programs for your maintenance teams covering operation, troubleshooting, and basic maintenance of installed equipment.',
    features: [
      'Operator training programs',
      'Maintenance technician training',
      'Safety awareness sessions',
      'Manufacturer-certified training content',
    ],
  },
];

export default function Services() {
  const { ref, isInView } = useScrollAnimation();

  return (
    <div>
      {/* Hero */}
      <section className="section-padding bg-white dark:bg-gray-950 relative overflow-hidden border-b border-[var(--color-border)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
        <div className="container-wide relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <p className="badge-blue mb-5">Our Services</p>
            <h1 className="heading-display text-[clamp(2rem,4vw,3.5rem)] text-gray-900 dark:text-white mb-5">
              Complete{' '}
              <span className="text-gradient">Industrial Solutions</span>,<br/>
              End to End
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
              From product sourcing and system design to installation, training, and long-term maintenance 
              — we're your single-point partner for all industrial fluid power needs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services grid */}
      <section className="section-padding">
        <div className="container-wide">
          <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.id}
                  variants={staggerItem}
                  className="card p-7 group hover:border-accent/30 transition-all duration-300"
                >
                  <div className="w-13 h-13 w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-3 leading-tight">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CNG Dispenser Services */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="badge-blue mb-4">Specialized Services</p>
              <h2 className="heading-display text-[clamp(1.8rem,3.5vw,2.8rem)] text-gray-900 dark:text-white mb-5">
                CNG Dispenser Services
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                As pioneers in clean energy infrastructure, SECPL delivers specialized services for CNG dispensers that guarantee accuracy, compliance, and operational excellence. Our offerings include calibration, troubleshooting, upgrades, and routine maintenance, all designed to keep fueling stations running smoothly and efficiently. Complementing this, we provide precision high-pressure tubing services, ensuring safe and reliable gas flow management across dispenser systems. With a focus on engineering excellence and customer satisfaction, SECPL empowers businesses to meet the rising demand for eco-friendly fuel solutions with confidence, efficiency, and long-term dependability.
              </p>
              <div className="space-y-3">
                {['Calibration & accuracy verification', 'Troubleshooting & system upgrades', 'Routine maintenance programs', 'High-pressure tubing services', 'Compliance & safety audits'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl overflow-hidden shadow-lg max-h-[380px] max-w-[480px] mx-auto w-full"
            >
              <img
                src="/images/service/cng.jpeg"
                alt="CNG Dispenser Services"
                className="w-full h-[380px] object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Compressor Services */}
      <section className="section-padding bg-gray-50 dark:bg-gray-900/30">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl overflow-hidden shadow-lg order-2 lg:order-1 max-h-[380px] max-w-[480px] mx-auto w-full"
            >
              <img
                src="/images/service/compressor.jpeg"
                alt="Compressor Services"
                className="w-full h-[380px] object-cover"
              />
            </motion.div>
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <p className="badge-blue mb-4">Specialized Services</p>
              <h2 className="heading-display text-[clamp(1.8rem,3.5vw,2.8rem)] text-gray-900 dark:text-white mb-5">
                Compressor Services
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                SECPL has built a reputation as a trusted partner in compressor solutions, offering comprehensive services that go beyond routine maintenance. Our expertise covers installation, commissioning, preventive care, and emergency support, ensuring that every compressor system delivers maximum efficiency and reliability. In addition, we specialize in industrial air piping services, providing seamless integration of compressor units into complex plant layouts. By combining technical precision with best-practice optimization strategies, SECPL helps clients reduce downtime, extend equipment life, and achieve measurable cost savings while maintaining the highest standards of safety and performance.
              </p>
              <div className="space-y-3">
                {['Installation & commissioning', 'Preventive maintenance programs', 'Emergency breakdown support', 'Industrial air piping services', 'Performance optimization consulting'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <section className="section-padding bg-gray-50 dark:bg-gray-900/30">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <p className="badge-blue mb-4">Industries We Serve</p>
            <h2 className="heading-display text-[clamp(1.6rem,3vw,2.5rem)] text-gray-900 dark:text-white">
              Trusted Across Every Industry
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              'Oil & Gas', 'Pharmaceuticals', 'Textiles', 'Automotive',
              'Food & Beverage', 'Chemicals', 'Power Generation', 'Defence',
              'Petrochemicals', 'Paper & Pulp', 'Water Treatment', 'Semiconductor',
            ].map((industry, i) => (
              <motion.div
                key={industry}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="card p-4 text-center hover:border-accent/30 cursor-default transition-colors"
              >
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{industry}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
