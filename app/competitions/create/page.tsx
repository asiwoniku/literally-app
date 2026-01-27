'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function CreateCompetition() {
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({ title: '', description: '', prize: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const MIN_FOLLOWERS = 1000; 

  useEffect(() => {
    async function checkEligibility() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
    }
    checkEligibility();
  }, [router]);

  const handleCreate = async () => {
    // FIX: Check if profile exists before reading properties
    if (!profile) return alert("Profile not loaded.");
    
    const prizeAmount = parseFloat(form.prize);
    const userFollowers = profile.followers_count || 0;
    const userBalance = profile.wallet_balance || 0;

    if (userFollowers < MIN_FOLLOWERS) {
      return alert(`Requirement: ${MIN_FOLLOWERS} followers. You have ${userFollowers}.`);
    }

    if (userBalance < prizeAmount) {
      return alert("Insufficient funds in your studio wallet.");
    }

    setLoading(true);

    const { error: payError } = await supabase
      .from('profiles')
      .update({ wallet_balance: userBalance - prizeAmount })
      .eq('id', profile.id);

    if (payError) {
      setLoading(false);
      return alert("Payment transaction failed.");
    }

    const { error: createError } = await supabase.from('competitions').insert({
      title: form.title,
      description: form.description,
      prize_pool: `${prizeAmount} USDT`,
      host_id: profile.id,
      is_funded: true,
      status: 'active'
    });

    if (createError) {
      alert("Submission error. Please contact support."); 
    } else {
      router.push('/competitions');
    }
    setLoading(false);
  };

  if (!profile) return <div className="p-20 text-center italic">Verifying credentials...</div>;

  return (
    <div className="min-h-screen bg-[#fdfcfb] p-8 flex justify-center items-center">
      <div className="max-w-xl w-full bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-100">
        <h1 className="text-3xl font-serif font-bold italic mb-8">Launch a Battle</h1>
        <div className="space-y-6">
          <input placeholder="Contest Title" className="w-full border-b p-3 outline-none" onChange={(e) => setForm({...form, title: e.target.value})} />
          <textarea placeholder="Rules..." className="w-full bg-stone-50 p-4 rounded-xl h-32" onChange={(e) => setForm({...form, description: e.target.value})} />
          <input type="number" placeholder="Prize (USDT)" className="w-full border-b p-3 outline-none" onChange={(e) => setForm({...form, prize: e.target.value})} />
          <button onClick={handleCreate} disabled={loading} className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold">
            {loading ? "Processing..." : "Deposit & Post"}
          </button>
        </div>
      </div>
    </div>
  );
}