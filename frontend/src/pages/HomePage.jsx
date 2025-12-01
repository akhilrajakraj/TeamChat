import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useMotionTemplate } from 'framer-motion';
import { Users, Briefcase, Heart, MessageSquare, Zap, Shield, ArrowRight, Sparkles, Menu, X } from 'lucide-react';

// --- Utility Components ---

// A glowing spotlight card effect
const SpotlightCard = ({ children, className = "" }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`group relative border border-white/10 bg-gray-900/50 overflow-hidden rounded-xl ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(129, 140, 248, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};

// --- Main Components ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/10 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              Teachat
            </span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {['Features', 'Use Cases', 'Pricing'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  {item}
                </a>
              ))}
              <Link to="/auth">
                <button className="bg-white text-black px-4 py-2 rounded-full font-bold hover:bg-indigo-50 transition-all transform hover:scale-105">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400 hover:text-white p-2">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-gray-900 border-b border-white/10"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {['Features', 'Use Cases', 'Pricing'].map((item) => (
                <a key={item} href="#" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                  {item}
                </a>
              ))}
              <Link to="/auth" className="block w-full text-center bg-white text-black px-4 py-2 rounded-md font-bold mt-4">
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const HeroAnimation = () => {
  // Animation Sequence State
  const [step, setStep] = useState(0); 
  // 0: Typing "Team Chat"
  // 1: Pause
  // 2: Deleting "m "
  // 3: Merged "Teachat"

  useEffect(() => {
    const cycle = async () => {
      // Start loop
      while(true) {
        setStep(0); // Show "Team Chat"
        await new Promise(r => setTimeout(r, 2000));
        setStep(1); // Trigger merge animation
        await new Promise(r => setTimeout(r, 3000));
      }
    };
    cycle();
  }, []);

  return (
    <div className="flex items-center justify-center text-5xl md:text-8xl font-black tracking-tighter text-white h-32">
      {/* The word "Tea" */}
      <motion.span layout className="relative z-10">Tea</motion.span>
      
      {/* The letter 'm' which fades out and shrinks */}
      <motion.span 
        initial={{ opacity: 1, width: 'auto' }}
        animate={{ 
          opacity: step === 0 ? 1 : 0, 
          width: step === 0 ? 'auto' : 0,
          scale: step === 0 ? 1 : 0
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="text-gray-400 overflow-hidden inline-block origin-bottom"
      >
        m
      </motion.span>

      {/* The gap/space */}
      <motion.span 
        animate={{ width: step === 0 ? '20px' : '0px' }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="inline-block"
      ></motion.span>

      {/* The word "chat" */}
      <motion.span 
        layout 
        className={`relative z-10 transition-colors duration-1000 ${step !== 0 ? 'text-indigo-400' : 'text-white'}`}
      >
        chat
      </motion.span>

      {/* The Cursor */}
      <motion.div
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="w-2 h-16 md:h-24 bg-indigo-500 ml-2 rounded-full"
      />
    </div>
  );
};

const Hero = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black selection:bg-indigo-500/30">
      {/* Animated Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3], 
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-1/2 -left-1/4 w-[1000px] h-[1000px] bg-purple-900/30 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, 100, 0] 
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-[120px]" 
        />
      </div>

      <div className="z-10 text-center px-4 max-w-5xl mx-auto mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <span className="px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-semibold uppercase tracking-wider backdrop-blur-md">
            The Future of Connection
          </span>
        </motion.div>

        <HeroAnimation />

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-6 text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto"
        >
          Where <span className="text-white font-semibold">Teams</span> merge effortlessly into <span className="text-indigo-400 font-semibold">Chats</span>. 
          The unified platform for Business, Family, and Friends.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/auth">
            <button className="group relative px-8 py-4 bg-white text-black text-lg font-bold rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]">
              <span className="relative z-10 flex items-center gap-2">
                Create Your Team <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </Link>
          <button className="px-8 py-4 bg-transparent border border-white/20 text-white text-lg font-bold rounded-xl hover:bg-white/5 transition-all">
            Watch Demo
          </button>
        </motion.div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500"
      >
        <div className="w-6 h-10 border-2 border-gray-500 rounded-full flex justify-center p-1">
          <div className="w-1 h-3 bg-gray-500 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
};

const UseCaseCard = ({ icon: Icon, title, description, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="h-full"
  >
    <SpotlightCard className="h-full p-8 flex flex-col items-start hover:border-white/30 transition-colors">
      <div className={`p-4 rounded-2xl ${color} bg-opacity-10 mb-6`}>
        <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
      <div className="mt-auto pt-6 flex items-center text-sm font-semibold text-white/60 hover:text-white cursor-pointer transition-colors">
        Learn more <ArrowRight className="w-4 h-4 ml-2" />
      </div>
    </SpotlightCard>
  </motion.div>
);

const Features = () => {
  return (
    <section id="features" className="py-24 bg-black relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Built for every <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Dynamic</span></h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Whether you are closing a deal, planning a trip, or sharing a meme, Teachat adapts to your vibe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <UseCaseCard 
            icon={Briefcase}
            title="Business Teams"
            description="Encrypted workspaces, thread organization, and file sharing designed for high-velocity teams."
            color="bg-blue-500"
            delay={0}
          />
          <UseCaseCard 
            icon={Heart}
            title="Family & Friends"
            description="Fun, ephemeral messaging, photo albums, and event planning for the people who matter most."
            color="bg-pink-500"
            delay={0.2}
          />
          <UseCaseCard 
            icon={Users}
            title="Communities"
            description="Manage large groups with roles, moderation tools, and voice channels seamlessly."
            color="bg-green-500"
            delay={0.4}
          />
        </div>
      </div>
    </section>
  );
};

const FeatureHighlight = () => {
  const { scrollYProgress } = useScroll();
  const x = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <section className="py-24 bg-gray-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h2 className="text-4xl font-bold text-white mb-6">Powerful Features</h2>
            <ul className="space-y-6">
              {[
                { icon: Zap, text: "Real-time sync engine", sub: "Latency so low it feels like telepathy." },
                { icon: Shield, text: "End-to-End Encryption", sub: "Your data is yours. Always." },
                { icon: Sparkles, text: "AI Summaries", sub: "Catch up on 500 messages in 5 seconds." }
              ].map((item, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="flex items-start"
                >
                  <div className="bg-indigo-500/10 p-2 rounded-lg mr-4">
                    <item.icon className="text-indigo-400 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">{item.text}</h4>
                    <p className="text-gray-500">{item.sub}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
          <div className="md:w-1/2 relative">
             {/* Abstract UI representation */}
             <div className="relative w-full aspect-square max-w-md mx-auto">
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full opacity-20 blur-3xl"
               />
               <SpotlightCard className="h-full w-full flex items-center justify-center border-gray-700 bg-black/80 backdrop-blur-xl">
                 <div className="text-center p-8">
                   <MessageSquare className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                   <h3 className="text-2xl font-bold text-white">Interactive Demo</h3>
                   <p className="text-gray-500 mt-2">Hover over this card to see the spotlight effect in action.</p>
                 </div>
               </SpotlightCard>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-black border-t border-white/10 py-12">
    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
      <div className="text-2xl font-bold text-white mb-4 md:mb-0">Teachat.</div>
      <div className="text-gray-500 text-sm">
        © 2024 Teachat Inc. All rights reserved.
      </div>
      <div className="flex space-x-6 mt-4 md:mt-0">
        <a href="#" className="text-gray-500 hover:text-white transition-colors">Twitter</a>
        <a href="#" className="text-gray-500 hover:text-white transition-colors">LinkedIn</a>
        <a href="#" className="text-gray-500 hover:text-white transition-colors">Github</a>
      </div>
    </div>
  </footer>
);

export default function HomePage() {
  return (
    <div className="bg-black min-h-screen text-slate-200 selection:bg-indigo-500 selection:text-white font-sans">
      <Navbar />
      <Hero />
      <Features />
      <FeatureHighlight />
      <Footer />
    </div>
  );
}