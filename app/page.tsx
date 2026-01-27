'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      {/* Simple Navigation */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <h2 className="text-2xl font-serif font-bold italic text-stone-900">Literally</h2>
        <Link href="/login" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
          Sign In
        </Link>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-serif font-bold text-stone-900 mb-6 tracking-tight">
            For the love of <br />
            <span className="text-stone-400 italic font-normal">the written word.</span>
          </h1>
          <p className="text-lg md:text-xl text-stone-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            The world's first platform dedicated to writers, poets, and the people who can't live without them.
          </p>

          {/* The Two Paths */}
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/signup?role=writer" 
                className="px-8 py-4 bg-stone-900 text-white rounded-full font-bold text-lg shadow-xl shadow-stone-200 block"
              >
                Start Writing
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/signup?role=reader" 
                className="px-8 py-4 bg-white border-2 border-stone-900 text-stone-900 rounded-full font-bold text-lg block"
              >
                Start Reading
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Social Proof / Stats */}
      <section className="bg-stone-100 py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <h3 className="text-4xl font-serif font-bold text-stone-900">Reels</h3>
            <p className="text-stone-500 mt-2">Poetry that moves with you.</p>
          </div>
          <div>
            <h3 className="text-4xl font-serif font-bold text-stone-900">Books</h3>
            <p className="text-stone-500 mt-2">Publish and earn from your first page.</p>
          </div>
          <div>
            <h3 className="text-4xl font-serif font-bold text-stone-900">Community</h3>
            <p className="text-stone-500 mt-2">Direct connection between author and fan.</p>
          </div>
        </div>
      </section>
    </div>
  );
}