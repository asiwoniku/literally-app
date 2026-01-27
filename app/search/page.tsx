'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  
  const [books, setBooks] = useState<any[]>([]);
  const [poets, setPoets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function performSearch() {
      if (!query) return;
      setLoading(true);

      // 1. Search Books (Title or Description)
      const { data: bookResults } = await supabase
        .from('books')
        .select('*, profiles(display_name)')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(20);

      // 2. Search Poets (Display Name or Bio)
      const { data: poetResults } = await supabase
        .from('profiles')
        .select('*')
        .or(`display_name.ilike.%${query}%,bio.ilike.%${query}%`)
        .limit(20);

      setBooks(bookResults || []);
      setPoets(poetResults || []);
      setLoading(false);
    }

    performSearch();
  }, [query]);

  return (
    <div className="min-h-screen bg-[#fdfcfb] p-8 md:p-12">
      <header className="mb-12">
        <Link href="/library" className="text-xs font-black uppercase tracking-widest text-stone-400 mb-4 block">← Back to Library</Link>
        <h1 className="text-4xl font-serif font-bold italic">
          Results for <span className="text-stone-500">"{query}"</span>
        </h1>
      </header>

      {loading ? (
        <div className="text-stone-400 italic">Scanning the archives...</div>
      ) : (
        <div className="space-y-16">
          {/* BOOKS SECTION */}
          {books.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                Manuscripts <span className="bg-stone-100 text-stone-600 px-2 py-1 rounded-full text-xs">{books.length}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map(book => (
                  <Link href={`/book/${book.id}`} key={book.id} className="flex gap-4 bg-white p-4 rounded-2xl border border-stone-100 hover:shadow-lg transition-all">
                    <img src={book.cover_url} className="w-20 h-28 object-cover rounded-lg bg-stone-200" />
                    <div>
                      <h3 className="font-serif font-bold text-lg">{book.title}</h3>
                      <p className="text-xs text-stone-500 mt-1">by {book.profiles?.display_name}</p>
                      <span className="inline-block mt-2 text-[10px] font-black uppercase tracking-widest bg-stone-100 px-2 py-1 rounded">{book.genre}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* POETS SECTION */}
          {poets.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                Poets & Authors <span className="bg-stone-100 text-stone-600 px-2 py-1 rounded-full text-xs">{poets.length}</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {poets.map(poet => (
                  <Link href={`/author/${poet.id}`} key={poet.id} className="text-center group">
                    <img src={poet.avatar_url || '/default.png'} className="w-24 h-24 mx-auto rounded-full object-cover border-2 border-transparent group-hover:border-stone-900 transition-all" />
                    <h3 className="font-bold mt-3 group-hover:underline">@{poet.display_name}</h3>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {books.length === 0 && poets.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl font-serif italic text-stone-400">The ink has run dry. No results found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

}

