
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, ArrowRight, CheckCircle2, UploadCloud, FileText, Send, AlertCircle } from 'lucide-react';
import CTASection from '../components/sections/CTASection';

export default function Career() {
  const [formState, setFormState] = useState({ name: '', email: '', phone: '', role: '' });
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFileError('');
    
    if (selected) {
      if (selected.type !== 'application/pdf') {
        setFileError('Only PDF files are allowed.');
        setFile(null);
        e.target.value = '';
        return;
      }
      
      if (selected.size > 1048576) { // 1 MB
        setFileError('File size must be under 1 MB.');
        setFile(null);
        e.target.value = '';
        return;
      }
      
      setFile(selected);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setFileError('Please attach your resume (PDF).');
      return;
    }
    
    // Simulate API submission
    setTimeout(() => {
      setSubmitted(true);
      setFormState({ name: '', email: '', phone: '', role: '' });
      setFile(null);
    }, 1000);
  };

  return (
    <div className="bg-white overflow-hidden">
      
      {/* HEADER */}
      <section className="relative w-full h-[50vh] min-h-[400px] flex flex-col justify-center items-center bg-[#050505]">
        <div className="absolute inset-0 z-0">
          <img src="/images/hero/slide-3.jpg" alt="Careers" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020512] via-black/50 to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-6 mt-16 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
              Join Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00b4d8] to-blue-500">Team</span>
            </h1>
            <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
              Build your career with a growing industrial engineering company focused on excellence and ethical practices.
            </p>
          </motion.div>
        </div>
      </section>

      {/* JOBS SECTION */}
      <section className="py-24 relative bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Current Openings</h2>
            <p className="text-gray-500">We are always looking for talented individuals to join our technical and sales teams.</p>
          </motion.div>

          <div className="space-y-6">
            {/* Job Card 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}
              className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl border border-gray-100 flex flex-col md:flex-row gap-8 items-center justify-between group hover:-translate-y-1 transition-transform"
            >
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-blue-50 text-[#00b4d8] rounded-2xl flex items-center justify-center shrink-0">
                  <Briefcase className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Sales Engineer</h3>
                  <p className="text-gray-500 mb-4">Location: Vashi, Navi Mumbai | Experience: 2-4 Years</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase">B2B Sales</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase">Pneumatics</span>
                  </div>
                </div>
              </div>
              <a href="mailto:info@navkarengg.in" className="w-full md:w-auto px-8 py-4 bg-gray-900 text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#00b4d8] transition-colors shrink-0">
                Apply Now <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>

            {/* Job Card 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} viewport={{ once: true }}
              className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl border border-gray-100 flex flex-col md:flex-row gap-8 items-center justify-between group hover:-translate-y-1 transition-transform"
            >
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-blue-50 text-[#00b4d8] rounded-2xl flex items-center justify-center shrink-0">
                  <Briefcase className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Service Technician</h3>
                  <p className="text-gray-500 mb-4">Location: Field Work (Mumbai) | Experience: 1-3 Years</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase">Compressors</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase">Maintenance</span>
                  </div>
                </div>
              </div>
              <a href="mailto:info@navkarengg.in" className="w-full md:w-auto px-8 py-4 bg-gray-900 text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#00b4d8] transition-colors shrink-0">
                Apply Now <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>

          {/* OPEN APPLICATION FORM */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}
            className="mt-20 bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-8 md:p-12"
          >
            <div className="text-center mb-10">
              <h3 className="text-3xl font-black text-gray-900 mb-4">Don't see a fit?</h3>
              <p className="text-gray-500">Submit an open application. We are always looking for exceptional talent to join our growing team.</p>
            </div>

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h4>
                <p className="text-gray-500">Thank you for your interest. Our HR team will review your profile and reach out if there's a match.</p>
                <button onClick={() => setSubmitted(false)} className="mt-8 text-[#00b4d8] font-bold uppercase tracking-widest text-sm hover:underline">
                  Submit Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name *</label>
                    <input 
                      required 
                      value={formState.name}
                      onChange={(e) => setFormState({...formState, name: e.target.value})}
                      placeholder="John Doe" 
                      className="w-full bg-gray-50 border-none rounded-xl py-4 px-5 outline-none focus:ring-2 focus:ring-[#00b4d8] text-gray-900" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address *</label>
                    <input 
                      type="email" 
                      required 
                      value={formState.email}
                      onChange={(e) => setFormState({...formState, email: e.target.value})}
                      placeholder="john@example.com" 
                      className="w-full bg-gray-50 border-none rounded-xl py-4 px-5 outline-none focus:ring-2 focus:ring-[#00b4d8] text-gray-900" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Phone Number *</label>
                    <input 
                      type="tel" 
                      required 
                      value={formState.phone}
                      onChange={(e) => setFormState({...formState, phone: e.target.value})}
                      placeholder="+91 00000 00000" 
                      className="w-full bg-gray-50 border-none rounded-xl py-4 px-5 outline-none focus:ring-2 focus:ring-[#00b4d8] text-gray-900" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Role / Area of Interest *</label>
                    <input 
                      required 
                      value={formState.role}
                      onChange={(e) => setFormState({...formState, role: e.target.value})}
                      placeholder="e.g. Mechanical Engineer, Marketing..." 
                      className="w-full bg-gray-50 border-none rounded-xl py-4 px-5 outline-none focus:ring-2 focus:ring-[#00b4d8] text-gray-900" 
                    />
                  </div>
                </div>

                {/* File Upload Area */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Resume (PDF, Max 1MB) *</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={"w-full border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors " + (fileError ? "border-red-300 bg-red-50" : file ? "border-[#00b4d8] bg-blue-50" : "border-gray-200 bg-gray-50 hover:bg-gray-100")}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="application/pdf" 
                      className="hidden" 
                    />
                    
                    {file ? (
                      <div className="flex flex-col items-center">
                        <FileText className="w-10 h-10 text-[#00b4d8] mb-2" />
                        <span className="font-bold text-[#0a1a5c]">{file.name}</span>
                        <span className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setFileError(''); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="mt-3 text-xs text-red-500 font-bold hover:underline">Remove</button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <UploadCloud className={"w-10 h-10 mb-3 " + (fileError ? "text-red-400" : "text-gray-400")} />
                        <span className="text-gray-600 font-medium">Click to upload your resume</span>
                        <span className="text-xs text-gray-400 mt-2">Only .pdf format accepted (Max 1 MB)</span>
                      </div>
                    )}
                  </div>
                  {fileError && (
                    <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {fileError}
                    </p>
                  )}
                </div>

                <button type="submit" className="w-full bg-[#0a1a5c] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#00b4d8] transition-colors flex items-center justify-center gap-2 shadow-lg">
                  Submit Application <Send className="w-5 h-5" />
                </button>
              </form>
            )}
          </motion.div>

        </div>
      </section>

      <CTASection />
    </div>
  );
}
