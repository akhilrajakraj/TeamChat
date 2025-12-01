import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../api';

// --- 1. The Logo Animation Component ---
const AuthLogoAnimation = () => {
  const [step, setStep] = useState(0); 

  useEffect(() => {
    const cycle = async () => {
      while(true) {
        setStep(0); // "Team Chat"
        await new Promise(r => setTimeout(r, 3000));
        setStep(1); // Morph to "Teachat"
        await new Promise(r => setTimeout(r, 4000));
      }
    };
    cycle();
  }, []);

  return (
    <div className="flex items-center justify-center text-4xl font-black tracking-tighter text-white h-16 mb-2">
      <motion.span layout className="relative z-10">Tea</motion.span>
      
      {/* The letter 'm' - fades and shrinks */}
      <motion.span 
        initial={{ opacity: 1, width: 'auto' }}
        animate={{ 
          opacity: step === 0 ? 1 : 0, 
          width: step === 0 ? 'auto' : 0,
          scale: step === 0 ? 1 : 0
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="text-gray-500 overflow-hidden inline-block origin-bottom"
      >
        m
      </motion.span>

      {/* The space - shrinks */}
      <motion.span 
        animate={{ width: step === 0 ? '12px' : '0px' }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="inline-block"
      ></motion.span>

      {/* "chat" - changes color */}
      <motion.span 
        layout 
        className={`relative z-10 transition-colors duration-1000 ${step !== 0 ? 'text-indigo-400' : 'text-white'}`}
      >
        chat
      </motion.span>

      {/* Blinking Cursor */}
      <motion.div
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 1 }}
        className="w-1.5 h-10 bg-indigo-500 ml-1 rounded-full"
      />
    </div>
  );
};

// --- 2. Main Auth Component ---

export default function AuthPage({ onLogin }) {
  // --- Existing Logic (Unchanged) ---
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        const res = await api.post('/auth/login', { 
          email: formData.email, 
          password: formData.password 
        });
        
        const { access_token, user } = res.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        onLogin(user); 
      } else {
        // --- REGISTER LOGIC ---
        await api.post('/auth/register', { 
          username: formData.username,
          email: formData.email, 
          password: formData.password 
        });
        
        setIsLogin(true);
        setError('✅ Account created! You can now log in.');
        setFormData({ username: '', email: '', password: '' });
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Connection failed. Is Backend running?');
    } finally {
      setLoading(false);
    }
  };

  // --- Enhanced UI ---
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden selection:bg-indigo-500/30">
      
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ rotate: -360, scale: [1, 1.3, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] -right-[10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]"
        />
      </div>

      {/* Main Glass Card */}
      <motion.div 
        layout
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="w-full max-w-md bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <AuthLogoAnimation />
          <motion.p 
            key={isLogin ? 'login-text' : 'reg-text'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-400 text-sm mt-2"
          >
            {isLogin ? 'Enter your credentials to access your workspace.' : 'Join the future of team communication.'}
          </motion.p>
        </div>

        {/* Error / Success Message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm font-medium border
                ${error.startsWith('✅') 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}
            >
              {error.startsWith('✅') ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <span>{error.replace('✅ ', '')}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="overflow-hidden"
              >
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Username"
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    required 
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="email" 
              placeholder="Email Address"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required 
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="password" 
              placeholder="Password"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              required 
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            disabled={loading}
            className={`w-full relative overflow-hidden py-3.5 rounded-xl font-bold text-white shadow-lg transition-all
              ${loading 
                ? 'bg-gray-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/25'
              }`}
          >
            <div className="flex items-center justify-center gap-2 relative z-10">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Log In' : 'Create Account'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </div>
            {/* Button Shine Effect */}
            {!loading && (
              <motion.div 
                className="absolute inset-0 bg-white/20"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5 }}
              />
            )}
          </motion.button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            {isLogin ? "Don't have an account yet?" : "Already have an account?"}
          </p>
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }} 
            className="mt-2 text-indigo-400 hover:text-indigo-300 font-semibold text-sm transition-colors hover:underline decoration-2 underline-offset-4"
          >
            {isLogin ? 'Start your journey' : 'Sign in to existing account'}
          </button>
        </div>

      </motion.div>
    </div>
  );
}