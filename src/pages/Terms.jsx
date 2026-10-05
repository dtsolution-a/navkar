import { motion } from 'framer-motion';
import { useScrollAnimation, fadeUpVariants } from '../hooks/useScrollAnimation';

export default function Terms() {
  const { ref, isInView } = useScrollAnimation();

  return (
    <div className="section-padding bg-white dark:bg-gray-950">
      <div className="container-narrow">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeUpVariants}
          className="prose prose-blue dark:prose-invert max-w-none"
        >
          <p className="badge-blue mb-4">Legal Policy</p>
          <h1 className="heading-display text-4xl text-gray-900 dark:text-white mb-6">Terms & Conditions</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Last Updated: June 22, 2026</p>

          <div className="space-y-8 text-gray-600 dark:text-gray-400 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Agreement to Terms</h2>
              <p>
                Welcome to the website of Navkar Engineering (Navkar Engineering). By accessing or using our website, 
                you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please 
                do not use our website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Use of Website</h2>
              <p>
                You may use this website only for lawful purposes, such as researching our products, viewing company milestones, 
                submitting job applications, or sending business enquiries. You agree not to:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Attempt to gain unauthorized access to our web servers, database, or admin panels.</li>
                <li>Submit misleading, false, or malicious information via our contact and recruitment forms.</li>
                <li>Scrape, index, or crawl our product catalogs or imagery without written permission.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Intellectual Property Rights</h2>
              <p>
                All content, logos, diagrams, stylesheets, and Excel database records featured on this website are the property 
                of Navkar Engineering or their respective partner brands (such as Parker Hannifin, Kaishan, 
                Chicago Pneumatic, Tubacex, and Trident). Unauthorized distribution, copying, or copying for commercial use is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Partner Content Disclaimer</h2>
              <p>
                This site features interactive syndication and catalogs provided by our brand partners (e.g., Parker Content Syndication). 
                We make every effort to display accurate specifications, but we do not guarantee the completeness or suitability 
                of partner-syndicated materials.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Limitation of Liability</h2>
              <p>
                Under no circumstances shall Navkar Engineering or Medialoop Tech Solutions be liable for any direct, indirect, 
                accidental, or consequential damages resulting from the use or inability to use this website, even if notified 
                of the possibility of such damages.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Governing Law</h2>
              <p>
                These Terms & Conditions shall be governed by and construed in accordance with the laws of India. Any disputes 
                arising out of or relating to these terms shall be subject to the exclusive jurisdiction of the courts located 
                in Surat, Gujarat, India.
              </p>
            </section>

            <section className="pt-6 border-t border-gray-150 dark:border-gray-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Contact Us</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Navkar Engineering<br />
                Ring Road, Surat – 395002, Gujarat<br />
                Email: <a href="mailto:info@navkarengg.in" className="text-accent hover:underline">info@navkarengg.in</a>
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
