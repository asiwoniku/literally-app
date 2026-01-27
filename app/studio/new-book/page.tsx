'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function CreateBook() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('Fantasy');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in");

      let coverUrl = '';
      if (coverFile) {
        const fileExt = coverFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        await supabase.storage.from('book_covers').upload(fileName, coverFile);
        coverUrl = supabase.storage.from('book_covers').getPublicUrl(fileName).data.publicUrl;
      }

      const { data, error } = await supabase.from('books').insert({
        title,
        description,
        genre,
        cover_url: coverUrl,
        creator_id: user.id,
        status: 'ongoing'
      }).select().single();

      if (error) throw error;
      
      // Redirect to the chapter editor for this new book
      window.location.href = `/studio/edit/${data.id}`;
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] p-8 flex justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full">
        <h1 className="text-4xl font-serif font-bold italic mb-8">Start a New Journey</h1>
        
        <form onSubmit={handleCreate} className="space-y-8 bg-white p-10 rounded-[2.5rem] shadow-sm border border-stone-100">
          <div className="flex flex-col items-center mb-8">
             <div className="w-32 h-48 bg-stone-100 rounded-2xl border-2 border-dashed border-stone-200 flex items-center justify-center relative overflow-hidden">
                {coverFile ? <img src={URL.createObjectURL(coverFile)} className="w-full h-full object-cover" /> : <span className="text-[10px] text-stone-400 uppercase font-bold text-center p-4">Upload Cover (3:4)</span>}
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
             </div>
          </div>

          <div className="space-y-4">
            <input 
              required placeholder="Book Title" 
              className="w-full p-4 text-2xl font-serif border-b border-stone-100 outline-none focus:border-stone-900 transition-all"
              onChange={(e) => setTitle(e.target.value)}
            />
            
            <select 
              className="w-full p-4 bg-stone-50 rounded-xl outline-none font-bold text-stone-500 text-sm appearance-none"
              onChange={(e) => setGenre(e.target.value)}
            >
              <option>Fantasy</option>
              <option>Romance</option>
              <option>Literary Fiction</option>
              <option>Mystery</option>
              <option>Poetry Collection</option>
            </select>

            <textarea 
              placeholder="Synopsis: What is this story about?"
              className="w-full p-4 h-40 bg-stone-50 rounded-2xl outline-none focus:ring-2 focus:ring-stone-100 transition-all"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-stone-900 text-white p-5 rounded-2xl font-bold text-lg shadow-xl hover:bg-stone-800 transition-all"
          >
            {loading ? "Creating..." : "Initialize Manuscript"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}