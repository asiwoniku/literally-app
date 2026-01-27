'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function getRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        setRole(data?.role);
      }
    }
    getRole();
  }, []);

  return (
    <nav className="p-6 flex justify-between items-center bg-[#fdfcfb] border-b border-stone-100 sticky top-0 z-[100]">
      <Link href="/" className="text-2xl font-serif font-bold italic">Literally</Link>
      
      <div className="flex gap-8 items-center text-xs font-black uppercase tracking-widest">
        <Link href="/feed">Reels</Link>
        <Link href="/library">Library</Link>
        
        {/* Only show this to writers */}
        {role === 'writer' && (
          <Link href="/studio/dashboard" className="bg-stone-900 text-white px-4 py-2 rounded-full">
            Writer Studio
          </Link>
        )}
      </div>
    </nav>
  );
}