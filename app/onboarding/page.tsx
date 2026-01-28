'use client';

import { useState, useEffect } from 'react';
// Changed to the Next.js specific client for cookie/session support
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';

export default function Onboarding() {
  const [displayName, setDisplayName] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Initialize the specific Next.js Supabase client
  const supabase = createClientComponentClient();

  // Real-time Name Checker
  useEffect(() => {
    const checkName = async () => {
      if (displayName.length < 3) {
        setIsAvailable(null);
        return;
      }

      setChecking(true);
      // We check the profiles table to see if the pen name exists
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('display_name', displayName)
        .maybeSingle(); // Better than .single() as it doesn't throw an error if missing

      if (!data) {
        setIsAvailable(true); // Name is free!
      } else {
        setIsAvailable(false); // Name is taken!
      }
      setChecking(false);
    };

    const timeoutId = setTimeout(checkName, 500);
    return () => clearTimeout(timeoutId);
  }, [displayName, supabase]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAvailable) return alert("Please choose an available name");
    setLoading(true);

    try {
      // Get the authenticated user session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found. Please log in again.');

      let avatarUrl = '';
      if (imageFile) {
        // Folder-based storage: avatars/user-id/filename
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `${user.id}/${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        avatarUrl = data.publicUrl;
      }

      // Update the profile created by the Database Trigger
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          bio: bio,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Use window.location.href to force a full refresh into the dashboard
      window.location.href = '/dashboard';
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] flex items-center justify-center p-6 py-12 text-stone-900">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md w-full">
        <h1 className="text-3xl font-serif font-bold mb-2 italic">Set your identity.</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-stone-100 mt-6">
          
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-stone-100 rounded-full overflow-hidden border-2 border-dashed border-stone-300 flex items-center justify-center relative">
              {previewUrl ? (
                <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <span className="text-stone-400 text-[10px]">No Photo</span>
              )}
            </div>
            <label htmlFor="avatar-upload" className="mt-2 cursor-pointer text-xs font-bold text-stone-900 underline">
              Upload Photo
            </label>
            <input 
              id="avatar-upload"
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="hidden" 
            />
          </div>

          {/* Pen Name Input */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2 font-bold">Pen Name / Stage Name</label>
            <div className="relative">
              <input 
                required
                placeholder="penname"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value.toLowerCase().replace(/\s/g, ''))}
                className={`w-full p-4 rounded-xl bg-stone-50 border-none outline-none focus:ring-2 transition-all ${
                  isAvailable === true ? 'focus:ring-green-500' : isAvailable === false ? 'focus:ring-red-500' : 'focus:ring-stone-900'
                }`}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold">
                {checking && <span className="text-stone-400">Checking...</span>}
                {isAvailable === true && <span className="text-green-600 italic">Available</span>}
                {isAvailable === false && <span className="text-red-600 italic">Taken</span>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2 font-bold">Short Bio</label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-4 rounded-xl bg-stone-50 border-none outline-none focus:ring-2 focus:ring-stone-900 h-28 text-black"
            />
          </div>

          <button 
            type="submit"
            disabled={loading || isAvailable === false || displayName.length < 3}
            className={`w-full p-4 rounded-xl font-bold shadow-lg transition-all ${
              isAvailable === false || displayName.length < 3 
                ? 'bg-stone-200 cursor-not-allowed text-stone-400' 
                : 'bg-stone-900 text-white shadow-stone-200 hover:bg-stone-800'
            }`}
          >
            {loading ? 'Entering...' : 'Finish Setup'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-4 rounded-xl bg-stone-50 border-none outline-none focus:ring-2 focus:ring-stone-900 h-28"
            />
          </div>

          <button 
            disabled={loading || isAvailable === false}
            className={`w-full p-4 rounded-xl font-bold shadow-lg transition-all ${
              isAvailable === false ? 'bg-stone-200 cursor-not-allowed text-stone-400' : 'bg-stone-900 text-white shadow-stone-200 hover:bg-stone-800'
            }`}
          >
            {loading ? 'Entering...' : 'Finish Setup'}
          </button>
        </form>
      </motion.div>
    </div>
  );

}
