'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<any[]>([]);

  useEffect(() => {
    async function loadComps() {
      const { data } = await supabase.from('competitions').select('*').eq('status', 'active');
      setCompetitions(data || []);
    }
    loadComps();
  }, []);

  const handleJoin = async (compId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please log in to compete.");
    
    // For now, simple join. Later, open a modal to select a book to submit.
    const { error } = await supabase.from('competition_entries').insert({
      competition_id: compId,
      user_id: user.id
    });

    if (!error) alert("You have officially entered the arena! Good luck.");
    else alert("You might have already joined this one.");
  };

  return (
    <div className="min-h-screen bg-stone-900 text-white p-8 md:p-16">
      <header className="max-w-4xl mx-auto text-center mb-20">
        <h1 className="text-5xl font-serif font-bold italic mb-6">The Arena</h1>
        <p className="text-stone-400 text-lg">Compete with fellow writers. Win prizes. Earn glory.</p>
      </header>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {competitions.map((comp) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            key={comp.id} 
            className="bg-stone-800 p-8 rounded-[2rem] border border-stone-700 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-yellow-500 text-black font-black text-xs px-4 py-2 rounded-bl-xl uppercase tracking-widest">
              Active
            </div>
            
            <h2 className="text-3xl font-serif font-bold mb-2">{comp.title}</h2>
            <p className="text-stone-400 mb-8">{comp.description || "Write your best work to win."}</p>
            
            <div className="flex items-center justify-between bg-stone-900/50 p-6 rounded-2xl mb-8">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-stone-500">Prize Pool</p>
                <p className="text-2xl font-mono font-bold text-yellow-400">{comp.prize_pool}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-stone-500">Status</p>
                <p className="text-white font-bold">Open for Submissions</p>
              </div>
            </div>

            <button 
              onClick={() => handleJoin(comp.id)}
              className="w-full bg-white text-stone-900 py-4 rounded-xl font-bold hover:bg-stone-200 transition-colors"
            >
              Join Competition
            </button>
          </motion.div>
        ))}

        {competitions.length === 0 && (
          <div className="col-span-full text-center py-20 border border-dashed border-stone-700 rounded-3xl">
            <p className="text-stone-500 italic">No active battles right now. Sharpen your quill for later.</p>
          </div>
        )}
      </div>
    </div>
  );
}