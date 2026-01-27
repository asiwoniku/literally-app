'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const router = useRouter();
  
  // 1. CHANGE THIS TO YOUR REAL EMAIL
  const ADMIN_EMAIL = "your-admin-email@gmail.com"; 

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/'); 
      } else {
        setIsAdmin(true);
        loadData();
      }
    }
    checkAdmin();
  }, []);

  async function loadData() {
    const { data: w } = await supabase.from('withdrawal_requests').select('*, profiles(*)').eq('status', 'pending');
    const { data: d } = await supabase.from('deposit_requests').select('*, profiles(*)').eq('status', 'pending');
    setWithdrawals(w || []);
    setDeposits(d || []);
  }

  const approveDeposit = async (id: string, userId: string, amount: number) => {
    // Fetch current balance
    const { data: profile } = await supabase.from('profiles').select('wallet_balance').eq('id', userId).single();
    
    // FIX: Added the '?' and a fallback check to prevent the 'null' error
    const currentBalance = profile?.wallet_balance || 0;

    const { error } = await supabase
      .from('profiles')
      .update({ wallet_balance: currentBalance + amount })
      .eq('id', userId);

    if (!error) {
      await supabase.from('deposit_requests').update({ status: 'completed' }).eq('id', id);
      alert("Deposit Approved! Funds added to user.");
      loadData();
    } else {
      alert("Error updating balance.");
    }
  };

  if (!isAdmin) return <div className="p-20 text-center font-serif italic text-stone-400">Verifying authority...</div>;

  return (
    <div className="min-h-screen bg-stone-100 p-6 md:p-12">
      <header className="mb-12">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-stone-900">Master Control</h1>
        <p className="text-stone-500 font-bold text-xs uppercase tracking-[0.3em]">Platform Oversight & Treasury</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* DEPOSIT VERIFICATION */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-200">
          <h2 className="font-serif font-bold text-2xl mb-6 flex items-center gap-3">
            📥 Verify Deposits <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{deposits.length}</span>
          </h2>
          <div className="space-y-4">
            {deposits.map(d => (
              <div key={d.id} className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="font-bold text-stone-900">@{d.profiles?.display_name || 'Unknown User'}</span>
                    <p className="text-[10px] text-stone-400 uppercase font-black mt-1">TX: {d.tx_hash.substring(0, 15)}...</p>
                  </div>
                  <span className="text-green-600 font-mono font-bold text-lg">${d.amount}</span>
                </div>
                <button 
                  onClick={() => approveDeposit(d.id, d.user_id, d.amount)} 
                  className="w-full bg-stone-900 text-white py-3 rounded-xl text-xs font-bold hover:bg-black transition-all"
                >
                  Confirm Receipt & Credit User
                </button>
              </div>
            ))}
            {deposits.length === 0 && <p className="text-stone-400 italic text-sm">No pending deposits.</p>}
          </div>
        </div>

        {/* WITHDRAWAL APPROVAL */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-200">
          <h2 className="font-serif font-bold text-2xl mb-6 flex items-center gap-3">
            💸 Payout Requests <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">{withdrawals.length}</span>
          </h2>
          <div className="space-y-4">
            {withdrawals.map(w => (
              <div key={w.id} className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="font-bold text-stone-900">@{w.profiles?.display_name || 'Unknown User'}</span>
                    <p className="text-[10px] text-stone-400 uppercase font-black mt-1">Wallet: {w.wallet_address.substring(0, 10)}...</p>
                  </div>
                  <span className="text-red-600 font-mono font-bold text-lg">-${w.amount}</span>
                </div>
                <button className="w-full bg-orange-600 text-white py-3 rounded-xl text-xs font-bold">Process Payout</button>
              </div>
            ))}
            {withdrawals.length === 0 && <p className="text-stone-400 italic text-sm">No pending payouts.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}