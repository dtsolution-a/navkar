import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Phone, Mail, CheckCircle2, Send } from 'lucide-react';
import { useScrollAnimation, slideInLeft, slideInRight } from '../../hooks/useScrollAnimation';

export default function CTASection() {
  const { ref, isInView } = useScrollAnimation();
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', message: '', inquiryType: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          subject: form.inquiryType ? `Enquiry: ${form.inquiryType}` : 'Upgrade Facility Enquiry',
          message: form.message
        })
      });
      if (!res.ok) throw new Error('Failed to submit');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
      setForm({ name: '', company: '', email: '', phone: '', message: '', inquiryType: '' });
    } catch (err) {
      alert('Failed to send enquiry. Please try again later.');
    }
  };

  return (
    <section className="section-padding bg-white dark:bg-gray-950">
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left */}
          <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={slideInLeft}
          >
            <p className="badge-blue mb-5">Get In Touch</p>
            <h2 className="heading-display text-[clamp(1.8rem,3.5vw,2.8rem)] text-gray-900 dark:text-white mb-5">
              Ready to Upgrade Your{' '}
              <span className="text-gradient">Facility?</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
              Whether you need a simple spare part or a complete compressed air system, 
              our team of experts is ready to help. Get a quote within 24 hours.
            </p>

            {/* Contact details */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">Address</p>
                  <a 
                    href="https://#" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-accent hover:underline block"
                  >
                    Surat, Gujarat, India
                  </a>
                </div>
              </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Sales & Support</p>
                    <p className="text-xs text-gray-500 mb-0.5 font-medium uppercase">General Inquiry:</p>
                    <a href="tel:+919825607366" className="text-sm text-accent hover:underline block mb-2">+91 XXXXXXXXXX</a>

                    <p className="text-xs text-gray-500 mb-0.5 font-medium uppercase">Parker-Instrumentation:</p>
                    <a href="tel:+919316189992" className="text-sm text-accent hover:underline block mb-2">+91 XXXXXXXXXX</a>
                    
                    <p className="text-xs text-gray-500 mb-0.5 font-medium uppercase">Compressor:</p>
                    <a href="tel:+919825607568" className="text-sm text-accent hover:underline block">+91 XXXXXXXXXX</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Email Us</p>
                    <p className="text-xs text-gray-500 mb-0.5 font-medium uppercase">General Inquiry:</p>
                    <a href="mailto:info@navkarengineering.com" className="text-sm text-accent hover:underline block mb-2">info@navkarengineering.com</a>

                    <p className="text-xs text-gray-500 mb-0.5 font-medium uppercase">Parker-Instrumentation:</p>
                    <a href="mailto:support.inst@navkarengineering.com" className="text-sm text-accent hover:underline block mb-2">support.inst@navkarengineering.com</a>
                    
                    <p className="text-xs text-gray-500 mb-0.5 font-medium uppercase">Compressor:</p>
                    <a href="mailto:support.compressor@navkarengineering.com" className="text-sm text-accent hover:underline block">support.compressor@navkarengineering.com</a>
                  </div>
                </div>
            </div>

            <div className="mt-8 p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Quick Response Promise</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                All quote requests are responded to within 24 business hours. For urgent requirements, call us directly.
              </p>
            </div>
          </motion.div>

          {/* Right — Form */}
          <motion.div
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={slideInRight}
          >
            <div className="card p-8">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Message Received!</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Thank you for reaching out. We'll get back to you within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Your Name *
                      </label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Rahul Sharma"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Company
                      </label>
                      <input
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        placeholder="Your Company"
                        className="input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Inquiry Type *
                    </label>
                    <select
                      name="inquiryType"
                      value={form.inquiryType || ''}
                      onChange={handleChange}
                      required
                      className="input bg-white dark:bg-gray-900"
                    >
                      <option value="" disabled>Select Inquiry Type</option>
                      <option value="Parker-Instrumentation">Parker-Instrumentation</option>
                      <option value="Compressor">Compressor</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="rahul@company.com"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 98000 00000"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Your Requirements *
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      placeholder="Describe the products or systems you need..."
                      className="input resize-none"
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full justify-center py-3.5">
                    <Send className="w-4 h-4" />
                    Send Enquiry
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
