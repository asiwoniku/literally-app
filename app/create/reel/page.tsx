'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const TEMPLATES = [
  { id: 'parchment', bg: '#f4e4bc', text: 'text-stone-900', font: 'font-serif' },
  { id: 'midnight', bg: '#1a1a1a', text: 'text-stone-100', font: 'font-serif' },
  { id: 'forest', bg: '#1b2621', text: 'text-stone-100', font: 'font-serif' },
];

export default function LiteralyStudio() {
  const [poem, setPoem] = useState('');
  const [selectedTemplate, setTemplate] = useState(TEMPLATES[0]);
  const [customImage, setCustomImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Audio States
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const [loading, setLoading] = useState(false);

  // --- AUDIO LOGIC ---
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];
    
    mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.current.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
      setAudioBlob(blob);
    };

    mediaRecorder.current.start();
    setIsRecording(true);
    setTimeout(() => stopRecording(), 120000); // Auto-stop at 2 mins
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  // --- DATABASE SAVER ---
  const handlePublish = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Log in to publish");

      let finalImageUrl = '';
      let finalAudioUrl = '';

      // 1. Upload Background Image
      if (customImage) {
        const path = `bg-${user.id}-${Date.now()}`;
        await supabase.storage.from('reels_backgrounds').upload(path, customImage);
        finalImageUrl = supabase.storage.from('reels_backgrounds').getPublicUrl(path).data.publicUrl;
      }

      // 2. Upload Audio Recitation
      if (audioBlob) {
        const path = `audio-${user.id}-${Date.now()}.ogg`;
        await supabase.storage.from('reels_audio').upload(path, audioBlob);
        finalAudioUrl = supabase.storage.from('reels_audio').getPublicUrl(path).data.publicUrl;
      }

      // 3. Save to Database
      const { error } = await supabase.from('reels').insert({
        creator_id: user.id,
        content_type: audioBlob ? 'recitation' : 'visual',
        poem_text: poem,
        audio_url: finalAudioUrl,
        background_value: finalImageUrl || selectedTemplate.bg,
        template_id: selectedTemplate.id
      });

      if (error) throw error;
      alert("Your masterpiece is live!");
      window.location.href = '/';
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] p-6 lg:p-12 flex flex-col items-center">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* EDITOR SIDE */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-serif font-bold italic">The Studio</h1>
            <p className="text-stone-500">Visuals, Voice, and Verses.</p>
          </div>

          <textarea 
            placeholder="Let the words fall..."
            className="w-full h-48 p-6 rounded-3xl bg-white border-2 border-stone-100 shadow-sm outline-none font-serif text-lg"
            onChange={(e) => setPoem(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-100">
              <label className="text-[10px] uppercase font-black text-stone-400 block mb-2">Voice Recitation</label>
              {!isRecording ? (
                <button onClick={startRecording} className="flex items-center gap-2 text-red-500 font-bold text-sm">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" /> Record (Max 2m)
                </button>
              ) : (
                <button onClick={stopRecording} className="text-stone-900 font-bold text-sm animate-bounce">
                  Stop Recording...
                </button>
              )}
              {audioBlob && <p className="text-[10px] text-green-600 mt-1 italic">Audio captured!</p>}
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-100 text-center">
              <label className="text-[10px] uppercase font-black text-stone-400 block mb-2">Background Image</label>
              <input type="file" className="hidden" id="bg-up" accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if(file) { setCustomImage(file); setPreviewUrl(URL.createObjectURL(file)); }
                }} 
              />
              <label htmlFor="bg-up" className="text-xs font-bold underline cursor-pointer">Choose Photo</label>
            </div>
          </div>

          <button 
            onClick={handlePublish}
            disabled={loading}
            className="w-full bg-stone-900 text-white p-5 rounded-2xl font-bold text-xl shadow-xl transition-all hover:scale-[1.02]"
          >
            {loading ? "Publishing Masterpiece..." : "Publish to Literally"}
          </button>
        </div>

        {/* PREVIEW SIDE */}
        <div className="flex justify-center">
          <div className="relative w-[320px] h-[600px] bg-black rounded-[45px] border-[10px] border-stone-800 overflow-hidden shadow-2xl">
            <div 
              className="w-full h-full flex items-center justify-center p-8 relative"
              style={{ backgroundColor: previewUrl ? 'black' : selectedTemplate.bg }}
            >
              {previewUrl && <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover opacity-60" />}
              
              <motion.p 
                key={poem}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }} // Smooth fade-in
                className={`relative z-10 text-center text-xl italic font-serif leading-relaxed ${previewUrl ? 'text-white' : selectedTemplate.text}`}
              >
                {poem || "A silent page waits..."}
              </motion.p>

              <div className="absolute bottom-8 w-full text-center z-10 opacity-30">
                <p className={`text-[9px] uppercase tracking-[0.5em] font-bold ${previewUrl ? 'text-white' : 'text-stone-900'}`}>Literally</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}