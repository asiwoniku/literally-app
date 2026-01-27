'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

function AdReel() {
  return (
    <section className="h-screen w-full snap-start snap-always bg-stone-950 flex flex-col items-center justify-center p-12 text-center relative">
      <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
        Sponsored
      </div>
      <div className="max-w-xs space-y-6">
        <div className="w-20 h-20 bg-stone-800 rounded-2xl mx-auto flex items-center justify-center text-3xl">🎁</div>
        <h2 className="text-3xl font-serif italic text-white leading-tight">Win 500 USDT in the Winter Slam</h2>
        <p className="text-stone-400 text-sm leading-relaxed">The Arena is open. Submit your best poem and let the community decide your fate.</p>
        <button className="w-full bg-white text-black py-4 rounded-2xl font-bold hover:scale-105 transition-transform">Enter The Arena</button>
      </div>
    </section>
  );
}

export default function FullPoetryFeed() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      const { data: reels } = await supabase
        .from('reels')
        .select('*, profiles:creator_id(display_name, avatar_url)')
        .order('created_at', { ascending: false });

      if (reels) {
        const mixed: any[] = [];
        reels.forEach((reel, index) => {
          mixed.push({ type: 'content', ...reel });
          // Inject an Ad every 4th item
          if ((index + 1) % 4 === 0) {
            mixed.push({ type: 'ad', id: `ad-${index}` });
          }
        });
        setItems(mixed);
      }
      setLoading(false);
    }
    fetchAll();
  }, []);

  if (loading) return <div className="h-screen w-full bg-black flex items-center justify-center text-white font-serif italic">Opening the scrolls...</div>;

  return (
    <main className="h-screen w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black">
      {items.map((item) => (
        item.type === 'ad' ? (
          <AdReel key={item.id} />
        ) : (
          <section key={item.id} className="h-screen w-full snap-start snap-always relative flex items-center justify-center p-8 overflow-hidden">
            {/* Background Aesthetic Blur */}
            <div className="absolute inset-0 bg-gradient-to-b from-stone-900 to-black" />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative z-10 text-center max-w-lg"
            >
              <p className="text-2xl md:text-4xl font-serif italic text-white leading-relaxed mb-12 px-4">
                "{item.poem_text}"
              </p>
              
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-white/20 overflow-hidden bg-stone-800">
                  <img src={item.profiles?.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${item.profiles?.display_name}`} alt="avatar" />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.3em] text-stone-500">
                  @{item.profiles?.display_name}
                </span>
              </div>
            </motion.div>

            {/* Interaction Sidebar */}
            <div className="absolute right-6 bottom-32 flex flex-col gap-8 z-20">
              <button className="flex flex-col items-center gap-1 group">
                <div className="p-3 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all text-white">❤️</div>
                <span className="text-[10px] text-white font-bold">2.4k</span>
              </button>
              <button className="flex flex-col items-center gap-1 group">
                <div className="p-3 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all text-white">💬</div>
                <span className="text-[10px] text-white font-bold">128</span>
              </button>
            </div>
          </section>
        )
      ))}
    </main>
  );
}