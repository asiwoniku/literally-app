'use client';

import { useState, useEffect } from 'react'; // Added useEffect
import { useSearchParams } from 'next/navigation'; // Added this to "read" the URL
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') || 'reader'; // Default to reader if nothing is found

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState(initialRole); // New state for the user role
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // If the user changes their mind and clicks a different button later, 
  // this updates the form automatically
  useEffect(() => {
    const urlRole = searchParams.get('role');
    if (urlRole) setRole(urlRole);
  }, [searchParams]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { 
          full_name: fullName,
          user_role: role // Saving the role to the database!
        } 
      },
    });

    if (error) setMessage(error.message);
    else setMessage('Welcome to the family! Check your email to confirm.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfcfb] px-4 py-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-stone-100"
      >
        <div className="text-center mb-8">
          <h1 className="text-5xl font-serif font-bold text-stone-900 mb-2 italic">Literally</h1>
          <p className="text-stone-500">
            Joining as a <span className="text-stone-900 font-bold uppercase text-xs tracking-widest">{role}</span>
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <input 
            type="text" required placeholder="Full Name" 
            value={fullName} onChange={(e) => setFullName(e.target.value)}
            className="w-full p-4 rounded-xl bg-stone-50 border-none outline-none focus:ring-2 focus:ring-stone-200"
          />
          <input 
            type="email" required placeholder="Email Address" 
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 rounded-xl bg-stone-50 border-none outline-none focus:ring-2 focus:ring-stone-200"
          />
          
          {/* Hidden or visible Role Selector */}
          <div className="bg-stone-50 p-4 rounded-xl">
            <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1">Confirm your path</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-transparent font-medium text-stone-900 outline-none cursor-pointer"
            >
              <option value="reader">I want to read & discover</option>
              <option value="writer">I want to write & publish</option>
            </select>
          </div>

          <input 
            type="password" required placeholder="Create Password" 
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 rounded-xl bg-stone-50 border-none outline-none focus:ring-2 focus:ring-stone-200"
          />

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full bg-stone-900 text-white p-4 rounded-xl font-bold shadow-lg"
          >
            {loading ? 'Setting up your library...' : 'Get Started'}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-sm text-stone-400">
          Already a member? <Link href="/login" className="text-stone-900 font-bold">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}