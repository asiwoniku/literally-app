'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function WithdrawEarnings() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState('');
  const [network, setNetwork] = useState('Polygon');

  useEffect(() => {
    async function getBalance() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('wallet_balance').eq('id', user.id).single();
        setBalance(data?.wallet_balance || 0);
      }
    }
    getBalance();
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(amount) > balance) return alert("Insufficient balance!");

    const { error } = await supabase.from('withdrawal_requests').insert({
      amount: parseFloat(amount),
      wallet_address: wallet,
      network: network,
      user_id: (await supabase.auth.getUser()).data.user?.id
    });

    if (!error) alert("Withdrawal request submitted! It will be processed within 24 hours.");
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] p-8 flex justify-center items-center">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-sm border border-stone-100">
        <h1 className="text-2xl font-serif font-bold mb-2">Withdraw USDT</h1>
        <p className="text-stone-400 text-sm mb-8">Available: <span className="text-stone-900 font-bold">${balance}</span></p>

        <form onSubmit={handleWithdraw} className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Amount (USDT)</label>
            <input type="number" required className="w-full border-b py-2 outline-none focus:border-stone-900" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Wallet Network</label>
            <select className="w-full bg-stone-50 p-3 rounded-xl mt-1 outline-none" onChange={(e) => setNetwork(e.target.value)}>
              <option>Polygon (Recommended)</option>
              <option>TRC20 (Tron)</option>
              <option>ERC20 (Ethereum)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">USDT Destination Address</label>
            <input type="text" required placeholder="0x..." className="w-full border-b py-2 outline-none focus:border-stone-900" value={wallet} onChange={(e) => setWallet(e.target.value)} />
          </div>

          <button className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-stone-800 transition-all">
            Confirm Withdrawal
          </button>
        </form>
      </div>
    </div>
  );
}