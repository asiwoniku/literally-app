'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function AuthorPortfolio({ params }: { params: { id: string } }) {
  const [author, setAuthor] = useState<any>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [reels, setReels] = useState<any[]>([]);
  const [tab, setTab] = useState<'books' | 'poems'>('books');

  useEffect(() => {
    async function loadAuthorData() {
      // 1. Fetch Profile
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', params.id).single();
      setAuthor(profile);

      // 2. Fetch Books
      const { data: authorBooks } = await supabase.from('books').select('*').eq('creator_id', params.id);
      setBooks(authorBooks || []);

      // 3. Fetch Reels
      const { data: authorReels } = await supabase.from('reels').select('*').eq('creator_id', params.id);
      setReels(authorReels || []);
    }
    loadAuthorData();
  }, [params.id]);

  if (!author) return <div className="p-20 text-center font-serif italic">Gathering the author's works...</div>;

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      {/* Profile Header */}
      <header className="pt-20 pb-12 px-6 flex flex-col items-center text-center border-b border-stone-100">
        <motion.img 
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          src={author.avatar_url || '/default.png'} 
          className="w-32 h-32 rounded-full border-4 border-white shadow-xl mb-6 object-cover"
        />
        <h1 className="text-4xl font-serif font-bold italic">@{author.display_name}</h1>
        <p className="text-stone-500 mt-2 max-w-md italic">"{author.bio || 'A silent observer of words.'}"</p>
      </header>

      {/* Toggle Tabs */}
      <div className="flex justify-center gap-12 py-8 text-xs font-black uppercase tracking-widest border-b border-stone-50/50">
        <button onClick={() => setTab('books')} className={tab === 'books' ? 'text-stone-900 border-b-2 border-stone-900 pb-2' : 'text-stone-400'}>Manuscripts</button>
        <button onClick={() => setTab('poems')} className={tab === 'poems' ? 'text-stone-900 border-b-2 border-stone-900 pb-2' : 'text-stone-400'}>Poetry Reels</button>
      </div>

      {/* Grid Content */}
      <main className="max-w-6xl mx-auto p-12">
        {tab === 'books' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {books.map(book => (
              <a href={`/book/${book.id}`} key={book.id} className="group">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-sm group-hover:shadow-xl transition-all">
                  <img src={book.cover_url} className="w-full h-full object-cover" />
                </div>
                <h3 className="mt-4 font-bold text-sm">{book.title}</h3>
              </a>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reels.map(reel => (
              <div key={reel.id} className="aspect-[9/16] bg-stone-900 rounded-3xl p-8 flex items-center justify-center text-center overflow-hidden relative">
                <p className="text-white font-serif italic text-sm relative z-10 line-clamp-6">{reel.poem_text}</p>
                {reel.background_value?.startsWith('http') && <img src={reel.background_value} className="absolute inset-0 opacity-30 object-cover w-full h-full" />}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}