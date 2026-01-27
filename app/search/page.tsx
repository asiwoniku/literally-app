'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// 1. This is the "Safety Wrapper" that prevents the Vercel Build Error
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fdfcfb] p-12 text-center font-serif italic text-stone-400">
        Loading the Library...
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

// 2. This is your actual Search Logic
function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function performSearch() {
      setLoading(true);
      
      // Search in titles or descriptions
      const { data, error } = await supabase
        .from('books')
        .select('*, profiles(display_name)')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(20);

      if (!error) setResults(data || []);
      setLoading(false);
    }

    performSearch();
  }, [query]);

  return (
    <div className="min-h-screen bg-[#fdfcfb] p-6 md:p-12">
      <header className="max-w-4xl mx-auto mb-12">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mb-2">Search Results for</p>
        <h1 className="text-4xl font-serif font-bold italic text-stone-900">"{query}"</h1>
      </header>

      <div className="max-w-4xl mx-auto grid gap-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-stone-100 rounded-[2rem]" />)}
          </div>
        ) : results.length > 0 ? (
          results.map((book) => (
            <Link href={`/book/${book.id}`} key={book.id}>
              <div className="group bg-white p-8 rounded-[2rem] border border-stone-100 hover:border-orange-200 transition-all shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-serif font-bold group-hover:text-orange-600 transition-colors">{book.title}</h2>
                    <p className="text-sm text-stone-500 mt-1">by <span className="font-bold text-stone-700">@{book.profiles?.display_name}</span></p>
                  </div>
                  <span className="bg-stone-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                    {book.genre || 'Poetry'}
                  </span>
                </div>
                <p className="text-stone-600 mt-4 line-clamp-2 text-sm leading-relaxed italic">
                  {book.description}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-stone-200 rounded-[3rem]">
            <p className="font-serif italic text-stone-400">No manuscripts found matching your query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
