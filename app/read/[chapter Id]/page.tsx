'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdSupportedReader({ params }: { params: { chapterId: string } }) {
  const [currentChapter, setCurrentChapter] = useState<any>(null);
  const [showAd, setShowAd] = useState(true);
  const [adTimer, setAdTimer] = useState(5);
  const [theme, setTheme] = useState<'parchment' | 'midnight'>('parchment');

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('chapters').select('*, books(*)').eq('id', params.chapterId).single();
      if (data) {
        setCurrentChapter(data);
        // Track the view in our analytics
        await supabase.rpc('increment_book_view', { target_book_id: data.book_id });
      }
    }
    load();
  }, [params.chapterId]);

  // Handle Ad Countdown
  useEffect(() => {
    if (showAd && adTimer > 0) {
      const timer = setTimeout(() => setAdTimer(adTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [showAd, adTimer]);

  const themes = { parchment: "bg-[#f4f1ea] text-stone-800", midnight: "bg-[#121212] text-stone-400" };

  return (
    <div className={`min-h-screen ${themes[theme]}`}>
      <AnimatePresence>
        {showAd ? (
          <motion.div 
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[200] bg-stone-900 flex flex-col items-center justify-center p-8 text-center"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 mb-8">Sponsored Content</span>
            <div className="w-full max-w-sm aspect-[4/5] bg-stone-800 rounded-3xl border border-stone-700 flex flex-col items-center justify-center p-10 mb-10">
              <h2 className="text-2xl font-serif italic text-white mb-4">Literally Competitions</h2>
              <p className="text-stone-400 text-sm">Win up to 500 USDT in our Summer Poetry Slam.</p>
              <div className="mt-8 px-4 py-2 border border-stone-600 rounded-full text-[10px] text-stone-500 font-bold uppercase">Ad Placeholder</div>
            </div>
            <button 
              disabled={adTimer > 0}
              onClick={() => setShowAd(false)}
              className={`w-full max-w-sm py-4 rounded-2xl font-bold transition-all ${adTimer > 0 ? 'bg-stone-800 text-stone-600' : 'bg-white text-black'}`}
            >
              {adTimer > 0 ? `Skip in ${adTimer}s` : 'Continue to Reading'}
            </button>
          </motion.div>
        ) : (
          <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto pt-24 px-6 pb-20">
            <header className="mb-12 text-center">
              <h1 className="text-4xl font-serif font-bold italic mb-2">{currentChapter?.title}</h1>
              <p className="text-stone-400 text-xs uppercase tracking-widest">{currentChapter?.books?.title}</p>
            </header>
            <div className="font-serif text-xl leading-relaxed whitespace-pre-wrap">
              {currentChapter?.content}
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}