'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function WriterDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [myBooks, setMyBooks] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(prof);

      const { data: books } = await supabase.from('books').select('*').eq('creator_id', user.id);
      setMyBooks(books || []);
    };
    loadDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-[#fdfcfb] p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header with Balance */}
        <header className="flex flex-col md:row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-serif font-bold italic">Writer's Studio</h1>
            <p className="text-stone-500">Welcome back, {profile?.display_name}</p>
          </div>
          
          <div className="bg-stone-900 text-white p-6 rounded-[2rem] shadow-xl flex items-center gap-8">
            <div>
              <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Available Balance</p>
              <p className="text-3xl font-mono font-bold">${profile?.wallet_balance || '0.00'} <span className="text-sm opacity-50">USDT</span></p>
            </div>
            <button className="bg-white text-stone-900 px-6 py-2 rounded-full font-bold text-sm hover:bg-orange-50 transition-colors">
              Withdraw
            </button>
          </div>
        </header>

        {/* Action Bar */}
        <div className="flex gap-4 mb-12">
          <Link href="/studio/new-book" className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-orange-100 hover:scale-105 transition-all">
            + Write a New Book
          </Link>
          <Link href="/create/reel" className="bg-white border border-stone-200 text-stone-900 px-8 py-4 rounded-2xl font-bold hover:bg-stone-50 transition-all">
            + Create Poetry Reel
          </Link>
        </div>

        {/* My Manuscripts */}
        <section>
          <h2 className="text-xl font-serif font-bold mb-6">Your Manuscripts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myBooks.map(book => (
              <div key={book.id} className="bg-white border border-stone-100 p-6 rounded-[2rem] flex gap-6 items-center">
                <img src={book.cover_url} className="w-20 h-28 object-cover rounded-xl bg-stone-100 shadow-sm" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{book.title}</h3>
                  <p className="text-xs text-stone-400 uppercase tracking-widest mt-1">{book.status}</p>
                  <div className="flex gap-4 mt-4">
                    <Link href={`/studio/edit/${book.id}`} className="text-xs font-bold underline">Add Chapter</Link>
                    <Link href={`/book/${book.id}`} className="text-xs font-bold text-stone-400">View Publicly</Link>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{book.view_count || 0}</p>
                  <p className="text-[10px] text-stone-400 uppercase">Reads</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}