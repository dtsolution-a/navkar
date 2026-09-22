import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, GraduationCap, Heart, ArrowRight, Clock, Loader2, Upload, CheckCircle, Timer, ListChecks } from 'lucide-react';
import { useScrollAnimation, fadeUpVariants } from '../hooks/useScrollAnimation';
import { useJobs } from '../hooks/useSiteData';
import Testimonials from '../components/sections/Testimonials';
import CTASection from '../components/sections/CTASection';

const perks = [
  { icon: Heart, text: 'Ethical work culture' },
  { icon: GraduationCap, text: 'Technical training & growth' },
  { icon: Briefcase, text: 'Premium brand portfolio' },
  { icon: Clock, text: 'Stable, long-term employment' },
];

export function formatExternalLink(url) {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
    return trimmed;
  }
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export default function Career() {
  const { ref, isInView } = useScrollAnimation();
  const { jobs, loading } = useJobs();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [resume, setResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Only PDF format is supported.');
      setResume(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 1024 * 1024) {
      setError('File size exceeds the 1MB limit.');
      setResume(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setError(null);
    setResume(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setError('Name and Email are required.');
      return;
    }
    if (!resume) {
      setError('Please upload your PDF resume.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || '';
      const formDataUpload = new FormData();
      formDataUpload.append('resume', resume);

      const uploadRes = await fetch(`${API_BASE}/api/public/upload-resume`, {
        method: 'POST',
        body: formDataUpload
      });

      if (!uploadRes.ok) {
        const errData = await uploadRes.json();
        throw new Error(errData.error || 'Failed to upload resume.');
      }

      const { url } = await uploadRes.json();

      const applyRes = await fetch(`${API_BASE}/api/public/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          resume_url: url
        })
      });

      if (!applyRes.ok) {
        const errData = await applyRes.json();
        throw new Error(errData.error || 'Failed to submit application.');
      }

      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setResume(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="section-padding bg-white dark:bg-gray-950 relative overflow-hidden border-b border-[var(--color-border)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="container-wide relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <p className="badge-blue mb-5">Careers</p>
            <h1 className="heading-display text-[clamp(2rem,4vw,3.5rem)] text-gray-900 dark:text-white mb-5">
              Build Your Career at{' '}
              <span className="text-gradient">Navkar Engineering</span>
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
              Join a team that's been delivering technical excellence and ethical service to India's 
              industrial sector for 30+ years. We invest in our people.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why join */}
      <section className="section-padding-sm bg-gray-50 dark:bg-gray-900/30">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {perks.map(({ icon: Icon, text }) => (
              <div key={text} className="card p-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-accent" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Openings */}
      <section className="section-padding">
        <div className="container-wide">
          <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={fadeUpVariants}
            className="mb-10"
          >
            <h2 className="heading-display text-[clamp(1.6rem,3vw,2.5rem)] text-gray-900 dark:text-white mb-2">
              Current Openings
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {loading ? 'Loading...' : `${jobs.length} positions available`}
            </p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-gray-500 dark:text-gray-400">No openings at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job, idx) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.4, delay: idx * 0.07 }}
                  className="card p-6 group hover:border-accent/30 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-3 group-hover:text-accent transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.type && (
                          <span className="badge-gray flex items-center gap-1.5">
                            <Briefcase className="w-3 h-3 text-accent" />
                            <span className="text-gray-400 text-[10px] font-semibold uppercase">Type:</span>
                            {job.type}
                          </span>
                        )}
                        {job.location && (
                          <span className="badge-gray flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-accent" />
                            <span className="text-gray-400 text-[10px] font-semibold uppercase">Location:</span>
                            {job.location}
                          </span>
                        )}
                        {job.experience && (
                          <span className="badge-gray flex items-center gap-1.5">
                            <Timer className="w-3 h-3 text-accent" />
                            <span className="text-gray-400 text-[10px] font-semibold uppercase">Experience:</span>
                            {job.experience}
                          </span>
                        )}
                        {job.department && <span className="badge-blue">{job.department}</span>}
                      </div>
                      {job.description && (
                        <div className="mb-3">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Description</p>
                          <ul className="space-y-1">
                            {job.description.split('*').map(s => s.trim()).filter(Boolean).map((point, i) => (
                              <li key={i} className="text-sm text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {job.requirements && (
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <ListChecks className="w-3.5 h-3.5" /> Requirements
                          </p>
                          <ul className="space-y-1">
                            {job.requirements.split('*').map(s => s.trim()).filter(Boolean).map((point, i) => (
                              <li key={i} className="text-sm text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {job.apply_url ? (
                        <a
                          href={formatExternalLink(job.apply_url)}
                          target={job.apply_url.startsWith('mailto') ? '_self' : '_blank'}
                          rel="noopener noreferrer"
                          className="btn-primary py-2.5 px-5 text-sm"
                        >
                          Apply Now
                          <ArrowRight className="w-4 h-4" />
                        </a>
                      ) : (
                        <a
                          href={`mailto:info@navkarengineering.com?subject=Application: ${job.title}`}
                          className="btn-primary py-2.5 px-5 text-sm"
                        >
                          Apply Now
                          <ArrowRight className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Open application */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 card p-8 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Description */}
              <div className="lg:col-span-5 text-left">
                <span className="badge-blue mb-4">Join Our Talent Pool</span>
                <h3 className="font-bold text-gray-900 dark:text-white text-2xl mb-4 leading-tight">
                  Don't see your role?
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                  We're always looking for talented engineers, sales professionals, and managers. 
                  Submit your resume to our general pool and we'll reach out as soon as a role aligns with your experience.
                </p>
                <div className="flex flex-col gap-3 text-xs text-gray-400 dark:text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span>General applications are reviewed weekly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span>Please upload CV in PDF format only</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span>Maximum resume file size is 1MB</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Form */}
              <div className="lg:col-span-7 bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-sm text-left">
                {success ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce" />
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Application Submitted!</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Thank you for applying. Our recruiting team will review your profile and contact you shortly if it matches our needs.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSuccess(false)}
                      className="btn-secondary text-sm py-2 px-4"
                    >
                      Submit Another Application
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold border border-red-100 dark:border-red-900/50">
                        {error}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:border-accent focus:ring-1 focus:ring-accent text-gray-900 dark:text-white"
                          placeholder="e.g. John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:border-accent focus:ring-1 focus:ring-accent text-gray-900 dark:text-white"
                          placeholder="e.g. john@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:border-accent focus:ring-1 focus:ring-accent text-gray-900 dark:text-white"
                          placeholder="e.g. +91 9876543210"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          Resume (PDF only, max 1MB) *
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept=".pdf"
                            required
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            id="resume-file-input"
                          />
                          <label
                            htmlFor="resume-file-input"
                            className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl cursor-pointer hover:border-accent/40 text-gray-600 dark:text-gray-400 hover:text-accent transition-all"
                          >
                            <Upload className="w-4 h-4" />
                            <span className="truncate max-w-[180px]">
                              {resume ? resume.name : 'Select PDF File'}
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Brief Cover Letter / Details
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 text-sm bg-gray-55 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl focus:border-accent focus:ring-1 focus:ring-accent text-gray-900 dark:text-white resize-none"
                        placeholder="Tell us about yourself and what role you're looking for..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={uploading}
                      className="w-full btn-primary justify-center text-sm py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed group transition-all"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading & Submitting...
                        </>
                      ) : (
                        <>
                          Submit Application
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Employee Testimonials — Career page only */}
      <Testimonials
        page="career"
        badge="Employee Reviews"
        heading="What Our Team Says"
        description="Meet the talented engineers and professionals who drive Navkar Engineering's mission every day."
        ratingDescription="Join a team of 50+ dedicated professionals across India"
      />

      <CTASection />
    </div>
  );
}
