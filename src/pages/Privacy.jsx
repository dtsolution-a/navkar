import { motion } from 'framer-motion';
import { useScrollAnimation, fadeUpVariants } from '../hooks/useScrollAnimation';

export default function Privacy() {
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
          <p className="badge-blue mb-4">Privacy Standards</p>
          <h1 className="heading-display text-4xl text-gray-900 dark:text-white mb-6">Privacy Policy</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Last Updated: June 22, 2026</p>

          <div className="space-y-8 text-gray-600 dark:text-gray-400 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Information Collection</h2>
              <p>
                We collect personal information directly when you interact with us via our website. This includes:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Enquiry details</strong>: Name, company name, phone number, email, and description of your request.</li>
                <li><strong>Job Applications</strong>: Name, contact details, message, and PDF Resume (CV) files uploaded for active openings.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. How We Use Your Data</h2>
              <p>
                We use the collected details to fulfill your requests and maintain administrative records:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>To respond to industrial enquiries and prepare pricing quotes for distribution lines.</li>
                <li>To evaluate candidates applying for jobs at Navkar Engineering.</li>
                <li>To manage and authenticate administrator sessions in the `/ad-admin` panel.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Data Retention & Safety</h2>
              <p>
                We prioritize the security of your data. Enquiries and job application records are stored within our secure 
                database. CV uploads are restricted strictly to PDF formats (with file size caps) to avoid security risks, and 
                are managed internally.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Cookies and Logs</h2>
              <p>
                We use localized storage elements (such as JSON Web Tokens in localStorage) to authenticate admin panel 
                users. No tracking cookies or advertising scripts are deployed to capture visitor browsing profiles.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Third-Party Sharing</h2>
              <p>
                Navkar Engineering does not sell, trade, or distribute your email addresses, phone 
                numbers, or resumes to any external brokers or marketing firms.
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
