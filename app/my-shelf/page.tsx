'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function MyShelf() {
  const [shelf, setShelf] = useState<any[]>([]);

  useEffect(() => {
    async function loadShelf() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('reading_progress')
        .select('*, books(*, profiles(display_name))')
        .eq('user_id', user.id);
      
      setShelf(data || []);
    }
    loadShelf();
  }, []);

  return (
    <div className="min-h-screen bg-[#fdfcfb] p-8 md:p-16">
      <h1 className="text-4xl font-serif font-bold italic mb-12">My Private Shelf</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
        {shelf.map(item => (
          <Link href={`/read/${item.last_chapter_id}`} key={item.book_id} className="group">
            <div className="aspect-[3/4] bg-stone-200 rounded-xl overflow-hidden shadow-sm group-hover:shadow-xl transition-all relative">
              <img src={item.books.cover_url} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-xs font-bold uppercase tracking-widest">Continue</span>
              </div>
            </div>
            <h3 className="mt-4 font-bold text-sm leading-tight line-clamp-1">{item.books.title}</h3>
            <p className="text-[10px] text-stone-400">By {item.books.profiles.display_name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}