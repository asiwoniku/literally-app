'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LibraryPage() {
  const [trending, setTrending] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadLibrary() {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. Fetch Trending Books
      const { data: trend } = await supabase.from('books')
        .select('*, profiles:creator_id(display_name)')
        .order('view_count', { ascending: false })
        .limit(6);
      setTrending(trend || []);

      // 2. Fetch User History
      if (user) {
        const { data: hist } = await supabase.from('reading_progress')
          .select('*, books(*, profiles(display_name))')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(10);
        setHistory(hist || []);
      }
    }
    loadLibrary();
  }, []);

  return (
    <div className="min-h-screen bg-[#fdfcfb] text-stone-900 pb-20 selection:bg-orange-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#fdfcfb]/90 backdrop-blur-xl border-b border-stone-100 p-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/" className="text-3xl font-serif font-bold italic tracking-tighter">Literally</Link>
          
          <div className="relative w-full md:w-[400px]">
            <input 
              type="text" 
              placeholder="Search library..." 
              className="w-full pl-12 pr-4 py-3 bg-stone-100 rounded-full border-none focus:ring-2 focus:ring-stone-900 outline-none"
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (window.location.href = `/search?q=${searchQuery}`)}
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-12 space-y-20">
        
        {/* Continue Reading Shelf */}
        {history.length > 0 && (
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-stone-300 mb-6">Continue Reading</h2>
            <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6">
              {history.map((item) => (
                <Link href={`/read/${item.last_chapter_id}`} key={item.id} className="min-w-[140px] group flex-shrink-0">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-md group-hover:shadow-xl transition-all relative">
                    <img src={item.books.cover_url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-[10px] font-bold uppercase">Resume</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-xs truncate">{item.books.title}</h4>
                  <p className="text-[10px] text-stone-400">Ch. {item.books.last_chapter_id ? '?' : 'Ongoing'}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Trending Grid */}
        <section>
          <div className="flex justify-between items-baseline mb-10">
            <h2 className="text-4xl font-serif font-bold italic">Trending</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trending.map((book) => (
              <Link href={`/book/${book.id}`} key={book.id}>
                <motion.div whileHover={{ y: -5 }} className="flex gap-5 bg-white p-5 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-xl transition-all">
                  <div className="w-24 h-36 bg-stone-200 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                    <img src={book.cover_url} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-1">{book.genre}</span>
                    <h3 className="font-serif font-bold text-lg leading-tight mb-2 line-clamp-2">{book.title}</h3>
                    <p className="text-xs text-stone-500 italic mb-3">by {book.profiles?.display_name}</p>
                    <div className="text-[10px] px-2 py-1 bg-stone-100 w-fit rounded font-bold uppercase">{book.status}</div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}