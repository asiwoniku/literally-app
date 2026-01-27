'use client';

import { Suspense, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fdfcfb] flex items-center justify-center font-serif italic text-stone-400">
        Preparing your stationery...
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // 1. Sign up the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // This ensures the redirect points back to your site's callback handler
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          display_name: displayName,
        }
      },
    });

    if (authError) {
      setErrorMsg(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // 2. Create the profile in your custom 'profiles' table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: authData.user.id, 
            display_name: displayName,
            wallet_balance: 0,
            followers_count: 0
          }
        ]);

      if (profileError) {
        console.error("Profile error:", profileError);
        // We don't stop here because the account IS created. 
        // We send them to login to try and trigger the profile creation again.
        setErrorMsg("Account created, but profile sync failed. Please try logging in.");
      } else {
        // Success! Redirect to the feed
        router.push('/feed');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-xl border border-stone-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif font-bold italic text-stone-900">literally.</h1>
          <p className="text-stone-400 text-sm mt-2">Start your manuscript journey.</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-orange-50 text-orange-700 text-xs rounded-2xl border border-orange-100 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Pen Name</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Orwellian" 
              className="w-full bg-stone-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-100 transition-all"
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Email</label>
            <input 
              required
              type="email" 
              placeholder="poet@example.com" 
              className="w-full bg-stone-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-100 transition-all"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Password</label>
            <input 
              required
              type="password" 
              placeholder="••••••••" 
              className="w-full bg-stone-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-100 transition-all"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold shadow-lg hover:bg-black hover:-translate-y-1 transition-all active:scale-95 disabled:bg-stone-400"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-stone-500">
          Already a poet? <Link href="/login" className="text-orange-600 font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
