'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ManageCompetition({ params }: { params: { id: string } }) {
  const [entries, setEntries] = useState<any[]>([]);
  const [comp, setComp] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const { data: c } = await supabase.from('competitions').select('*').eq('id', params.id).single();
      setComp(c);
      
      const { data: e } = await supabase.from('competition_entries')
        .select('*, profiles(*)')
        .eq('competition_id', params.id);
      setEntries(e || []);
    }
    load();
  }, [params.id]);

  const selectWinner = async (winnerId: string, winnerName: string) => {
    const confirm = window.confirm(`Are you sure you want to crown @${winnerName}? This action is irreversible and funds will be transferred.`);
    if (!confirm) return;

    // Parse numeric value from "500 USDT" string
    const amount = parseFloat(comp.prize_pool); 

    // 1. Pay the Winner
    // We use an RPC call (database function) to be safe, but direct update works for MVP
    const { data: winnerProfile } = await supabase.from('profiles').select('wallet_balance').eq('id', winnerId).single();
    const newBalance = (winnerProfile?.wallet_balance || 0) + amount;

    await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', winnerId);

    // 2. Close Competition
    await supabase.from('competitions').update({ 
      status: 'closed', 
      winner_id: winnerId 
    }).eq('id', comp.id);

    alert("Winner Crowned! Funds transferred.");
    window.location.reload();
  };

  if (!comp) return <div>Loading...</div>;

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-serif font-bold mb-8">Manage: {comp.title}</h1>
      
      <div className="grid gap-4">
        {entries.map(entry => (
          <div key={entry.id} className="flex justify-between items-center bg-white p-6 rounded-2xl border">
            <div className="flex gap-4 items-center">
              <img src={entry.profiles.avatar_url} className="w-12 h-12 rounded-full bg-gray-200" />
              <div>
                <p className="font-bold">{entry.profiles.display_name}</p>
                <a href={entry.submission_link} target="_blank" className="text-xs text-blue-600 underline">View Submission</a>
              </div>
            </div>
            
            {comp.status === 'active' ? (
              <button 
                onClick={() => selectWinner(entry.user_id, entry.profiles.display_name)}
                className="bg-stone-900 text-white px-6 py-2 rounded-full text-xs font-bold"
              >
                Crown Winner
              </button>
            ) : (
               comp.winner_id === entry.user_id && <span className="text-orange-500 font-black uppercase text-xs tracking-widest">🏆 Winner</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}