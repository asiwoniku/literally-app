'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setMessage(error.message);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      // This will refresh the page and the user will be logged in
      window.location.href = '/'; 
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfcfb] px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-stone-100"
      >
        <div className="text-center mb-8">
          <h1 className="text-5xl font-serif font-bold text-stone-900 mb-2 italic text-center">Literally</h1>
          <p className="text-stone-500">Welcome back to your library.</p>
        </div>

        {/* Social Logins */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSocialLogin('google')}
            className="flex items-center justify-center py-3 px-4 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 mr-2" alt="Google" />
            <span className="text-sm font-medium">Google</span>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSocialLogin('apple')}
            className="flex items-center justify-center py-3 px-4 bg-black text-white rounded-xl hover:bg-stone-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
            <span className="text-sm font-medium">Apple</span>
          </motion.button>
        </div>

        <div className="relative mb-8 text-center">
          <hr className="border-stone-100" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs text-stone-400 uppercase tracking-widest">or email</span>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <input 
            type="email" required placeholder="Email Address" 
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 rounded-xl bg-stone-50 border-none focus:ring-2 focus:ring-stone-200 outline-none transition-all"
          />
          <input 
            type="password" required placeholder="Password" 
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 rounded-xl bg-stone-50 border-none focus:ring-2 focus:ring-stone-200 outline-none transition-all"
          />

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={loading}
            className="w-full bg-stone-900 text-white p-4 rounded-xl font-bold shadow-lg shadow-stone-200 hover:bg-stone-800 transition-all"
          >
            {loading ? 'Entering...' : 'Sign In'}
          </motion.button>
        </form>

        {message && <p className="mt-4 text-center text-sm font-medium text-red-600">{message}</p>}

        <p className="mt-8 text-center text-sm text-stone-400">
          Not a member yet? <Link href="/signup" className="text-stone-900 font-bold hover:underline">Join Literally</Link>
        </p>
      </motion.div>
    </div>
  );
}