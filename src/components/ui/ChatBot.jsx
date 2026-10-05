import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, ChevronRight, Phone, Mail } from 'lucide-react';

// ── FAQ Knowledge Base ──────────────────────────────────────────
const FAQS = [
  {
    id: 'products',
    label: '📦 Products & Brands',
    questions: [
      {
        q: 'Which air compressors do you supply?',
        a: 'We offer a wide range of air compressors:\n• **Kaishan KRSD Series** Rotary Screw (18–250 kW)\n• **Kaishan PMV** Permanent Magnet Variable Frequency Screw\n• **Kaishan KRSP2** Two-Stage Screw\n• **Kaishan KRSA** Low Pressure Screw (1.5–5 bar)\n• **Kaishan KROF** Oil-Free Rotary Screw\n• **Chicago Pneumatic** Screw and Reciprocating\n• **Anest Iwata** Lubricated and Oil-Free\n• **Gajjar** Air Cooled Reciprocating Compressors'
      },
      {
        q: 'Do you offer oil-free air compressors?',
        a: 'Yes! We offer **Class 0 oil-free compressors** from:\n• **Kaishan** (KROF Series)\n• **Chicago Pneumatic** (100% oil-free reciprocating)\n• **Anest Iwata** (Scroll Air Compressor)\n\nThese are ideal for pharmaceuticals, food processing, laboratories, diamond processing, hospitals, and semiconductor manufacturing.'
      },
      {
        q: 'Which air dryers do you provide?',
        a: 'We supply a full range of air dryers:\n• **Trident Refrigeration Air Dryers** (dew point +3 to +7°C)\n• **Trident Heatless Adsorption Dryers** (dew point up to -40°C)\n• **Parker Refrigerated Air Dryers** (Industry 4.0 ready)\n• **Parker PNEUDRI** Heatless Adsorption Dryers\n• **Parker Membrane Air Dryers** (no electricity needed, -40°C dew point)\n• **Trident Breathing Air Dryer Systems (TBAS)** (OSHA/NFPA 99 compliant)'
      },
      {
        q: 'Which filtration products do you offer?',
        a: 'Our filtration range includes:\n• **Parker Dominick Hunter Micro Filters** (1 micron and 0.01 micron)\n• **Liquid & Gas Filters** (up to 350 Bar)\n• **Water and Moisture Separators**\n• **Auto Drain Valves**\n• **Air Receiver Tanks** (500 to 20,000 litres)\n• **Biogas Filters**\n• **Hydraulic & Fuel Filters** (up to 500 Bar)'
      },
      {
        q: 'Which pneumatic products do you supply?',
        a: 'Under the **Parker** brand, we supply:\n• Fittings, air blow guns, flow control and ball valves\n• Non-metallic tubes (PU/Nylon/FEP/PFA)\n• Air Filter-Regulator-Lubricator (FRL) units\n• Dial-air regulators & solenoid-operated control valves\n• Quick release couplings & O-ring kits\n• Pneumatic cylinders (ISO 32–125 mm)\n• Solenoid switches & modular interface valve islands'
      },
      {
        q: 'Which hydraulic products are available?',
        a: 'We supply **Parker hydraulic products** including:\n• Quick release couplings (up to 700 Bar)\n• Hydraulic pipe fittings (Ermeto)\n• High-pressure hoses (up to 700 Bar) & rubber/steam hoses\n• Direction & pressure control valves\n• Gear pumps, axial piston pumps and motors\n• Hydraulic/fuel filters (up to 500 Bar) & air/oil coolers\n• Hydraulic cylinders (up to 210 Bar) & accumulator bladders'
      },
      {
        q: 'Do you supply hydrogen generators or ecosystem products?',
        a: 'Yes. We offer **Parker Lab Gas Generators** (research-grade hydrogen purity) and a complete **Hydrogen Ecosystem Solution**:\n• Hydrogen hoses & excess flow shutoff valves\n• Phastite tube fittings, needle valves & ball valves\n• Proportional relief valves & PFA tube and fittings\n• Filter-coalescers for hydrogen electrolyzers'
      },
      {
        q: 'Do you provide CNG dispensers or fueling equipment?',
        a: 'Yes. We are authorised partners for **Parker CNG Dispensers** (3 Banks, Dual Arm Car/Bus/Combo) and **OPW Clean Energy Fueling Products** (CNG nozzles, breakaways, receptacles, LCV fill posts, and prover kits) with zero gas loss and Pan-India service support.'
      },
      {
        q: 'Do you offer air piping solutions?',
        a: 'Yes! We supply **AIRnet**, a complete aluminium air piping system:\n• **30% energy savings** over conventional piping\n• Zero corrosion, zero maintenance, and 7 times lighter than steel\n• Installs 70% faster, 100% reusable & modular\n• **10-year guarantee** for air, vacuum, and nitrogen distribution'
      },
      {
        q: 'Which brands do you represent?',
        a: 'We represent leading global brands:\n• **Parker Hannifin** (Pneumatics, Hydraulics, Instrumentation, CNG)\n• **Kaishan** (Screw Air Compressors)\n• **Trident Pneumatics** (Air Dryers, Filters, Drain Valves)\n• **Chicago Pneumatic** (Screw and Oil-Free Compressors)\n• **Anest Iwata Motherson** (Scroll and Oil-Free Compressors)\n• **Tubacex** (SS Tubes and Pipes)\n• **OPW / Dover** (CNG & Hydrogen Fueling)\n• **Gajjar Compressor** (Reciprocating Compressors)'
      },
      {
        q: 'What is the difference between lubricated and oil-free compressors?',
        a: '• **Lubricated compressors** use oil to lubricate rotors, cool the air, and seal clearances (trace oil remains in output air).\n• **Oil-free compressors** (Class 0) use PTFE-coated or water-injected chambers to deliver 100% oil-free air. Critical for pharma, food, electronics, and breathing air.'
      }
    ]
  },
  {
    id: 'services',
    label: '⚙️ Services & Support',
    questions: [
      {
        q: 'Which services do you provide beyond products?',
        a: 'We provide end-to-end support:\n• **Annual Maintenance Contracts (AMC & CMC)**\n• **Air Audits & Energy Audits**\n• Remote Data Monitoring for air systems\n• Breathing Air Purification System installation\n• Complete system design, engineering, and piping consultancy'
      },
      {
        q: 'Do you provide after-sales service and support?',
        a: 'Yes, absolutely. We offer comprehensive after-sales support including **AMC/CMC contracts**, genuine spare parts supply, on-site breakdown service, preventive maintenance, remote diagnostics, and energy audits.'
      },
      {
        q: 'What is your service response time?',
        a: 'We aim to respond within **24–48 hours** for breakdown calls. For remote locations, it may take 48–72 hours. For urgent support, please contact us directly at **(0261) 4890982**.'
      },
      {
        q: 'Do you provide installation and commissioning?',
        a: 'Yes. Our factory-trained engineers handle complete installation, commissioning, piping layout recommendations, electrical connection guidance, operator training, and performance verification.'
      },
      {
        q: 'Do you offer operator training?',
        a: 'Yes. We provide on-site and office-based operator training on safe operation, daily maintenance routines, safety checks, and basic troubleshooting. Contact **info@navkarengg.in** to schedule.'
      },
      {
        q: 'Do you provide remote monitoring for compressors?',
        a: 'Yes. We offer **Remote Data Monitoring** systems for compressed air systems, enabling real-time tracking of pressure, temperature, flow, power, and alarms through an online dashboard to prevent breakdowns.'
      }
    ]
  },
  {
    id: 'about',
    label: '🏢 About & Info',
    questions: [
      {
        q: 'What does Navkar Engineers & Consultants do?',
        a: 'Navkar Engineering is a trusted partner for clean, dry, and energy-efficient **Compressed Air and Gas Generation systems**. We supply, install, and service compressors, dryers, filters, pneumatics, hydraulics, instrumentation, and clean energy fueling systems. Serving 5,800+ customers since 1995.'
      },
      {
        q: 'When was the company established?',
        a: 'We were co-founded in **1995** by Mr. Kaushik Navkar (Founder and Managing Director) in Surat, Gujarat. Over 30 years, we have grown to **5 offices**, operating across 22+ states and 144 cities in India with a team of **300+ employees**.'
      },
      {
        q: 'Where are your offices located?',
        a: '• **Head Office**: 4, \'RUSHABH\', Near Sita Hospital, Old Subjail Gali, Khatodara, Ring Road, Surat – 395002, Gujarat.\n• **Branches**: Ankleshwar, Vapi, Ahmedabad, Delhi, Pune, Kolkata, and Chennai, covering 22+ states and 144 cities across India.'
      },
      {
        q: 'What makes Navkar Engineers different from others?',
        a: '• **2+ Years** of industry experience\n• **5,800+ Happy Customers** (Reliance, L&T, Adani)\n• **World-Class Brands** under one roof\n• **Pan-India Presence** (144 cities, 5 offices)\n• **ISO 9001:2015** certified and **SMERA SME 1** rating\n• **300+ Trained Engineers** for sales, service, and AMC'
      },
      {
        q: 'What certifications does your company hold?',
        a: 'We are **ISO 9001:2015 certified** and hold the **SMERA SME 1 rating**. Our D&B D-U-N-S Number is 87-127-4268.\n• GST No: 24ABECS4427RIZU\n• CIN No: U52100GJ2020PTC116485'
      },
      {
        q: 'How many years of experience do you have?',
        a: 'We have **2+ years** of technical experience in compressed air and gas generation systems. Established in 1995, we\'ve grown to serve thousands of clients across India.'
      },
      {
        q: 'Which industries do you serve?',
        a: 'We serve Oil & Gas, CNG/Bio-CNG, Power Generation, Renewable Energy (Solar, Wind, Hydrogen), Critical/High Pressure, Industrial Manufacturing, Chemicals, Heavy Engineering, Diamond, Food, Steel, Textiles, and Pharmaceuticals.'
      },
      {
        q: 'Why should I choose Navkar Engineers?',
        a: 'We provide complete lifecycle support — from engineering consultation, supply of world-class brands, installation, prompt maintenance, and energy audits, backed by 30 years of trust and 5,800+ clients.'
      }
    ]
  },
  {
    id: 'sales',
    label: '📞 Sales & Pricing',
    questions: [
      {
        q: 'Who are some of your well-known clients?',
        a: 'Our clients include **Reliance Industries**, **L&T**, **Adani**, **Tata**, **ONGC**, **NTPC**, **Indian Oil**, **GSECL**, **Cadila**, **Zydus**, **Sun Pharma**, **Jubilant**, **Clariant**, **Waaree**, **Raymond**, and **Arvind**.'
      },
      {
        q: 'Can I get a quotation?',
        a: 'Yes! Please share: (1) Product/Application, (2) Flow (CFM/LPM), (3) Pressure (Bar/PSI), (4) Power supply (Voltage/Phase), (5) Industry type. Email: **info@navkarengg.in** or call **(0261) 4890982**.'
      },
      {
        q: 'Do you provide AMC or CMC quotations?',
        a: 'Yes. We offer customized AMC and CMC quotes for all brands we represent as well as third-party equipment. Please email your equipment details to **info@navkarengg.in**.'
      },
      {
        q: 'How can I contact your sales team?',
        a: '• **Phone**: (0261) 4890982, 983, 984\n• **Email**: info@navkarengg.in\n• **Head Office**: 4, RUSHABH, Khatodara, Ring Road, Surat – 395 002, Gujarat.\n• Branches in Ankleshwar, Vapi, Ahmedabad, Delhi, Pune, Kolkata, Chennai.'
      },
      {
        q: 'Can I schedule a meeting or product demo?',
        a: 'Yes, absolutely! Contact us at **(0261) 4890982** or email **info@navkarengg.in** with your preferred date, time, and location, and our engineers will arrange a visit or demo.'
      },
      {
        q: 'Do you provide technical support before purchase?',
        a: 'Yes. Our engineers offer free pre-sales consultation including air audits, system sizing, energy-saving calculations, and system engineering recommendations to help you find the most efficient solution.'
      },
      {
        q: 'Can you help me choose the right compressor?',
        a: 'Yes! Our engineering team will assess your flow, pressure, air quality class, and duty cycle requirements to recommend the most energy-efficient compressor model and brand from our portfolio.'
      },
      {
        q: 'Do you offer any warranty?',
        a: 'Yes, all products come with the standard manufacturer warranty. Post-warranty, we offer comprehensive AMC and CMC packages to keep your systems running smoothly.'
      },
      {
        q: 'Can I visit your office or showroom?',
        a: 'Yes, you\'re welcome to visit our Surat Head Office. Open Monday to Saturday, **9:30 AM to 6:30 PM**. Please call ahead to schedule your visit at **(0261) 4890982**.'
      }
    ]
  }
];

const WELCOME = {
  text: "Hello! 👋 I'm Navkar's assistant. I can help you with questions about our products, services, brands, and more. What would you like to know?",
};

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 block"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

function parseMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'bot', text: WELCOME.text, id: 0 }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [msgId, setMsgId] = useState(1);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  // Prevent page scroll when wheel is used inside the chatbot window
  useEffect(() => {
    const el = chatWindowRef.current;
    if (!el) return;
    const handler = (e) => e.stopPropagation();
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [open]);

  const sendBotMessage = (text, delay = 900) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { role: 'bot', text, id: msgId + Math.random() }]);
    }, delay);
  };

  const handleQuickQuestion = (q, a) => {
    const id = msgId + Math.random();
    setMsgId(id);
    setMessages((prev) => [...prev, { role: 'user', text: q, id }]);
    setActiveCategory(null);
    sendBotMessage(a, 800);
  };

  const handleUserInput = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const id = msgId + Math.random();
    setMsgId(id);
    setMessages((prev) => [...prev, { role: 'user', text, id }]);
    setInput('');

    // Simple keyword matching
    const lower = text.toLowerCase();
    const allQs = FAQS.flatMap((cat) => cat.questions);
    const match = allQs.find((item) =>
      item.q.toLowerCase().split(' ').some((word) => word.length > 3 && lower.includes(word))
    );

    if (match) {
      sendBotMessage(match.a);
    } else if (lower.includes('price') || lower.includes('cost') || lower.includes('rate') || lower.includes('quote')) {
      sendBotMessage("For accurate pricing, please fill our enquiry form or contact us directly — our team responds within 24 hours.\n\n📧 **info@navkarengg.in**\n📍 Surat, Gujarat");
    } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      sendBotMessage("Hello! 😊 Great to hear from you. How can I help you today? You can ask about our products, services, or use the quick buttons below.", 500);
    } else if (lower.includes('thank')) {
      sendBotMessage("You're most welcome! 😊 Is there anything else I can help you with?", 600);
    } else {
      sendBotMessage("I'm not sure about that specific query. For detailed assistance, please:\n\n📞 **Call us directly**\n📧 **Email:** info@navkarengg.in\n\nOr use the quick topics below to find what you need!");
    }
  };

  return (
    <>
      {/* ── Floating toggle button ── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ delay: 3, type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => setOpen(true)}
            aria-label="Open FAQ chat"
            className="fixed bottom-24 right-6 z-50 group"
          >
            <div className="relative w-[52px] h-[52px] rounded-full bg-gray-900 dark:bg-white shadow-xl flex items-center justify-center hover:scale-110 transition-all duration-200 border border-gray-700 dark:border-gray-200">
              <Bot className="w-5 h-5 text-white dark:text-gray-900" />
              {/* Unread dot */}
              <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-accent border-2 border-white dark:border-gray-900" />
            </div>
            <div className="absolute right-14 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg pointer-events-none">
              FAQ Assistant
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat window ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={chatWindowRef}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
            style={{ height: '540px' }}
            onWheel={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-gray-900 dark:bg-gray-950 border-b border-gray-800 flex-shrink-0">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-accent" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-900" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm leading-none mb-0.5">Navkar Assistant</p>
                <p className="text-green-400 text-[11px]">● Online — responds instantly</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    msg.role === 'bot' ? 'bg-accent/15 border border-accent/20' : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    {msg.role === 'bot'
                      ? <Bot className="w-3.5 h-3.5 text-accent" />
                      : <User className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    }
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                      msg.role === 'bot'
                        ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-sm'
                        : 'bg-accent text-white rounded-tr-sm'
                    }`}
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }}
                  />
                </motion.div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {typing && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-2.5"
                  >
                    <div className="w-7 h-7 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm">
                      <TypingDots />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            {/* Quick Topics */}
            <div className="px-4 py-3 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 font-semibold">Quick Topics</p>
              <div className="flex flex-wrap gap-1.5">
                {FAQS.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all duration-150 ${
                      activeCategory === cat.id
                        ? 'bg-accent text-white border-accent'
                        : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-accent/40'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Sub-questions */}
              <AnimatePresence>
                {activeCategory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 space-y-1 max-h-[160px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-800 [&::-webkit-scrollbar-thumb]:rounded-full"
                  >
                    {FAQS.find((c) => c.id === activeCategory)?.questions.map(({ q, a }) => (
                      <button
                        key={q}
                        onClick={() => handleQuickQuestion(q, a)}
                        className="w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 hover:bg-accent/10 hover:text-accent border border-gray-100 dark:border-gray-800 transition-colors duration-150"
                      >
                        <ChevronRight className="w-3 h-3 flex-shrink-0" />
                        {q}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input */}
            <form
              onSubmit={handleUserInput}
              className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 flex-shrink-0"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about our products…"
                className="flex-1 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="w-9 h-9 rounded-xl bg-accent hover:bg-accent-dark disabled:opacity-40 flex items-center justify-center transition-all flex-shrink-0"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
