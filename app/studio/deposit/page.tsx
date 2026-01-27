'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DepositUSDT() {
  const [amount, setAmount] = useState('');
  const [hash, setHash] = useState('');
  const MASTER_WALLET = "0xBC3dEF0731A889CbF1e0f86FCc279A8d657C4830"; // Update with yours!

  const submitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    
    // FIX: Ensure user is logged in before inserting
    if (!user) return alert("Please log in to deposit.");

    const { error } = await supabase.from('deposit_requests').insert({
      user_id: user.id,
      amount: parseFloat(amount),
      tx_hash: hash,
      status: 'pending'
    });

    if (!error) alert("Proof of payment submitted for verification.");
    else alert("Error: Check if this Transaction Hash was already used.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-stone-50">
      <form onSubmit={submitDeposit} className="bg-white p-10 rounded-[2.5rem] shadow-sm max-w-md w-full border border-stone-100">
        <h2 className="text-2xl font-serif font-bold mb-6">Fund Your Wallet</h2>
        <div className="bg-stone-100 p-4 rounded-xl mb-6 select-all font-mono text-[10px] break-all">
          {MASTER_WALLET}
        </div>
        <input placeholder="Amount" className="w-full mb-4 border-b p-2" onChange={e => setAmount(e.target.value)} />
        <input placeholder="TX Hash" className="w-full mb-8 border-b p-2" onChange={e => setHash(e.target.value)} />
        <button className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold">Submit for Review</button>
      </form>
    </div>
  );
}