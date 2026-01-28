'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const supabase = createClientComponentClient()

  // --- 1. SIGN UP WITH GOOGLE ---
  const handleGoogleSignUp = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // This sends the user to our callback route after Google is done
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  // --- 2. SIGN UP WITH EMAIL ---
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // This metadata is picked up by your SQL Trigger to set the display_name
        data: { display_name: username }
      },
    })

    if (error) alert(error.message)
    else alert('Check your email to confirm your account!')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Create your Literally Account</h1>
      
      {/* Email Sign Up Form */}
      <form onSubmit={handleEmailSignUp} className="flex flex-col gap-4 w-80">
        <input 
          type="text" placeholder="Pen Name (Username)" 
          onChange={(e) => setUsername(e.target.value)} 
          className="border p-2 rounded text-black" 
        />
        <input 
          type="email" placeholder="Email" 
          onChange={(e) => setEmail(e.target.value)} 
          className="border p-2 rounded text-black" 
        />
        <input 
          type="password" placeholder="Password" 
          onChange={(e) => setPassword(e.target.value)} 
          className="border p-2 rounded text-black" 
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Sign Up with Email
        </button>
      </form>

      <div className="my-4">OR</div>

      {/* Google Sign Up Button */}
      <button 
        onClick={handleGoogleSignUp}
        className="flex items-center justify-center gap-2 border p-2 rounded w-80 hover:bg-gray-100 transition-colors"
      >
        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
        Sign Up with Google
      </button>
    </div>
  )
}

      if (profileError) {
        console.error("Profile error:", profileError);
        // We don't stop here because the account IS created. 
        // We send them to login to try and trigger the profile creation again.
        setErrorMsg("Account created, but profile sync failed. Please try logging in.");
      } else {
        // Success! Redirect to the feed
        router.push('/feed');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-xl border border-stone-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif font-bold italic text-stone-900">literally.</h1>
          <p className="text-stone-400 text-sm mt-2">Start your manuscript journey.</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-orange-50 text-orange-700 text-xs rounded-2xl border border-orange-100 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Pen Name</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Orwellian" 
              className="w-full bg-stone-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-100 transition-all"
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Email</label>
            <input 
              required
              type="email" 
              placeholder="poet@example.com" 
              className="w-full bg-stone-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-100 transition-all"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Password</label>
            <input 
              required
              type="password" 
              placeholder="••••••••" 
              className="w-full bg-stone-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-100 transition-all"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold shadow-lg hover:bg-black hover:-translate-y-1 transition-all active:scale-95 disabled:bg-stone-400"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-stone-500">
          Already a poet? <Link href="/login" className="text-orange-600 font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}

