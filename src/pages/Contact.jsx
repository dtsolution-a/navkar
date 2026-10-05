
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, PhoneCall, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const contactCards = [
    { icon: MapPin, title: "Our Headquarters", details: ["F-48, APMC Market, Sector-19", "Vashi, Navi Mumbai- 400703"] },
    { icon: PhoneCall, title: "Call Us", details: ["+91 90227 25714", "Support & Sales"] },
    { icon: Mail, title: "Email Us", details: ["info@navkarengg.in", "24/7 Online Support"] },
    { icon: Clock, title: "Working Hours", details: ["Mon-Sat, 9:30 AM - 6:30 PM", "Sunday Closed"] }
  ];

  return (
    <div className="bg-white overflow-hidden">
      
      {/* HEADER */}
      <section className="relative w-full h-[50vh] min-h-[400px] flex flex-col justify-center items-center bg-[#050505]">
        <div className="absolute inset-0 z-0">
          <img src="/images/hero/slide-1.jpg" alt="Contact" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020512] via-black/50 to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-6 mt-16 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
              Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00b4d8] to-blue-500">Touch</span>
            </h1>
            <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
              Our team of engineering experts is ready to assist you with your fluid power requirements.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 relative z-20 -mt-16 bg-transparent">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Left: Info Cards & Map */}
            <div className="w-full lg:w-5/12 flex flex-col gap-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {contactCards.map((card, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} viewport={{ once: true }}
                    className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 hover:border-[#00b4d8]/30 transition-colors"
                  >
                    <div className="w-12 h-12 bg-blue-50 text-[#00b4d8] rounded-xl flex items-center justify-center mb-4">
                      <card.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{card.title}</h3>
                    {card.details.map((line, j) => (
                      <p key={j} className="text-sm text-gray-500 font-light">{line}</p>
                    ))}
                  </motion.div>
                ))}
              </div>

              {/* Map */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} viewport={{ once: true }}
                className="w-full h-64 rounded-3xl overflow-hidden shadow-xl border border-gray-100 relative"
              >
                <a href="https://maps.app.goo.gl/ALBGHsNeMGcUNXqq9" target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10" />
                <iframe
                  title="Navkar Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.8256555147573!2d73.0016027!3d19.0713917!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c13e54b60ccf%3A0x7d674b78082987fb!2sF-48%2C%20APMC%20Market%2C%20Sector%2019%2C%20Vashi%2C%20Navi%20Mumbai%2C%20Maharashtra%20400703!5e1!3m2!1sen!2sin!4v1782208019217!5m2!1sen!2sin"
                  width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                />
              </motion.div>
            </div>

            {/* Right: Form */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }}
              className="w-full lg:w-7/12"
            >
              <div className="bg-white rounded-[2.5rem] p-10 lg:p-14 shadow-2xl border border-gray-100 h-full">
                <h2 className="text-3xl font-black text-gray-900 mb-8">Send an Enquiry</h2>
                
                {submitted ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent Successfully!</h3>
                    <p className="text-gray-500">We will review your requirements and get back to you within 24 hours.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                        <input required placeholder="John Doe" className="w-full bg-gray-50 border-none rounded-xl py-4 px-5 outline-none focus:ring-2 focus:ring-[#00b4d8] text-gray-900" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Company</label>
                        <input placeholder="Organization Name" className="w-full bg-gray-50 border-none rounded-xl py-4 px-5 outline-none focus:ring-2 focus:ring-[#00b4d8] text-gray-900" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                        <input type="email" required placeholder="john@company.com" className="w-full bg-gray-50 border-none rounded-xl py-4 px-5 outline-none focus:ring-2 focus:ring-[#00b4d8] text-gray-900" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Phone</label>
                        <input type="tel" placeholder="+91 00000 00000" className="w-full bg-gray-50 border-none rounded-xl py-4 px-5 outline-none focus:ring-2 focus:ring-[#00b4d8] text-gray-900" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Product Interest</label>
                      <select required className="w-full bg-gray-50 border-none rounded-xl py-4 px-5 outline-none focus:ring-2 focus:ring-[#00b4d8] text-gray-900">
                        <option value="" disabled selected>Select an option</option>
                        <option value="Pneumatics">Pneumatics</option>
                        <option value="Compressors">Air Compressors</option>
                        <option value="Hydraulics">Hydraulics</option>
                        <option value="Other">Other Query</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Message</label>
                      <textarea required rows={4} placeholder="Tell us about your requirements..." className="w-full bg-gray-50 border-none rounded-xl py-4 px-5 outline-none focus:ring-2 focus:ring-[#00b4d8] text-gray-900 resize-none" />
                    </div>
                    <button type="submit" className="w-full bg-[#0a1a5c] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#00b4d8] transition-colors flex items-center justify-center gap-2 shadow-lg">
                      Send Message <Send className="w-5 h-5" />
                    </button>
                  </form>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
}
