'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function FullStudioEditor({ params }: { params: { bookId: string } }) {
  const [activeTab, setActiveTab] = useState<'editor' | 'stats'>('editor');
  const [chapters, setChapters] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [params.bookId]);

  async function loadData() {
    const { data } = await supabase
      .from('chapters')
      .select('*')
      .eq('book_id', params.bookId)
      .order('chapter_number', { ascending: true });
    setChapters(data || []);
  }

  const handlePublish = async () => {
    if (!title || !content) return alert("Fill in the title and content!");
    setIsSaving(true);
    
    const { error } = await supabase.from('chapters').insert({
      book_id: params.bookId,
      title,
      content,
      chapter_number: chapters.length + 1
    });

    if (!error) {
      setTitle('');
      setContent('');
      await loadData();
      alert("Chapter published to your library!");
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-white flex text-stone-900">
      {/* SIDEBAR */}
      <aside className="w-72 border-r border-stone-100 flex flex-col p-8 bg-[#fdfcfb]">
        <div className="mb-12">
          <h2 className="text-xl font-serif font-bold italic">Studio</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Manuscript Manager</p>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <button 
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'editor' ? 'bg-stone-900 text-white shadow-xl shadow-stone-200' : 'hover:bg-stone-100'}`}
          >
            <span>✍️</span> Write Chapter
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'stats' ? 'bg-stone-900 text-white shadow-xl shadow-stone-200' : 'hover:bg-stone-100'}`}
          >
            <span>📊</span> Reader Analytics
          </button>
        </nav>

        <div className="pt-8 border-t border-stone-100">
           <p className="text-[10px] font-black uppercase text-stone-400 mb-4">Drafts ({chapters.length})</p>
           <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
              {chapters.map(ch => (
                <div key={ch.id} className="text-xs font-serif italic text-stone-600 truncate">
                  {ch.chapter_number}. {ch.title}
                </div>
              ))}
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'editor' ? (
            <motion.div 
              key="editor"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto py-20 px-12"
            >
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Chapter Title..." 
                className="w-full text-5xl font-serif font-bold italic outline-none mb-12 placeholder:text-stone-100"
              />
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="The ink begins to flow here..." 
                className="w-full h-[60vh] text-xl font-serif leading-relaxed outline-none resize-none placeholder:text-stone-100"
              />
              <div className="fixed bottom-12 right-12">
                <button 
                  onClick={handlePublish}
                  disabled={isSaving}
                  className="bg-stone-900 text-white px-10 py-4 rounded-full font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >
                  {isSaving ? "Publishing..." : "Publish Chapter"}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto py-20 px-12"
            >
              <h2 className="text-4xl font-serif font-bold italic mb-4">Insights</h2>
              <p className="text-stone-400 mb-12 uppercase text-[10px] font-black tracking-widest">Where your readers stay or stray</p>

              <div className="grid grid-cols-3 gap-8 mb-16">
                <div className="bg-stone-50 p-8 rounded-[2rem] border border-stone-100">
                   <p className="text-[10px] font-black text-stone-400 uppercase">Total Views</p>
                   <p className="text-3xl font-mono font-bold">14,208</p>
                </div>
                <div className="bg-stone-50 p-8 rounded-[2rem] border border-stone-100">
                   <p className="text-[10px] font-black text-stone-400 uppercase">Avg. Read Time</p>
                   <p className="text-3xl font-mono font-bold">4m 12s</p>
                </div>
                <div className="bg-stone-50 p-8 rounded-[2rem] border border-stone-100">
                   <p className="text-[10px] font-black text-stone-400 uppercase">Loyalty Rate</p>
                   <p className="text-3xl font-mono font-bold text-orange-600">88%</p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-bold text-sm uppercase tracking-widest text-stone-400">Retention by Chapter</h3>
                {chapters.map((ch, i) => (
                  <div key={ch.id} className="group">
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span>{ch.title}</span>
                      <span className="text-stone-400">92%</span>
                    </div>
                    <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${100 - (i * 4)}%` }}
                        className="h-full bg-stone-900"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}