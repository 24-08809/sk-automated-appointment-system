
'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState('resident')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    if (!email.trim() || !password.trim()) {
      setMessage('Please enter your email and password.')
      return
    }

    const session = {
      email: email.trim(),
      role,
    }

    localStorage.setItem('skUserSession', JSON.stringify(session))

    if (role === 'resident') {
      router.push('/resident')
    } else {
      router.push('/official')
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F7F4] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">

        {/* LEFT BRANDING */}
        <section className="bg-[#145C3A] text-white p-10 md:p-12 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#E6B94D] flex items-center justify-center text-[#145C3A] font-bold text-xl">
                SK
              </div>

              <div>
                <h2 className="font-bold text-lg">Sangguniang Kabataan</h2>
                <p className="text-xs text-green-100">Official Service Portal</p>
              </div>
            </div>

            <div className="mt-20">
              <p className="text-[#E6B94D] uppercase tracking-widest text-xs font-bold">
                Welcome to your SK Portal
              </p>

              <h1 className="text-4xl md:text-5xl font-bold leading-tight mt-5">
                Serving the youth, building the future.
              </h1>

              <p className="text-green-100 text-sm leading-7 mt-6">
                Access Sangguniang Kabataan services, schedule appointments,
                and stay connected with your community.
              </p>
            </div>
          </div>

          <div className="mt-16 border-t border-white/20 pt-6">
            <p className="text-xs text-green-100">
              © 2026 Sangguniang Kabataan Appointment System
            </p>
          </div>
        </section>

        {/* RIGHT LOGIN FORM */}
        <section className="p-8 md:p-14 flex flex-col justify-center">
          <div className="mb-8">
            <div className="w-12 h-12 bg-[#EAF3EC] rounded-xl flex items-center justify-center text-[#145C3A] text-xl">
              🔐
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mt-6">
              Welcome back!
            </h2>

            <p className="text-gray-500 text-sm mt-2">
              Sign in to access your SK appointment account.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            {/* ROLE SELECTION */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Login As
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'resident', label: 'Resident' },
                  { value: 'official', label: 'SK Official' },
                  { value: 'staff', label: 'Staff' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setRole(item.value)}
                    className={`rounded-xl border px-2 py-3 text-xs sm:text-sm font-semibold transition ${
                      role === item.value
                        ? 'border-[#145C3A] bg-green-50 text-[#145C3A]'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email address"
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-[#145C3A] focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3.5 pr-16 text-sm outline-none focus:border-[#145C3A] focus:ring-2 focus:ring-green-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#145C3A]"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* SIGN IN */}
            <button
              type="submit"
              className="w-full bg-[#145C3A] text-white font-bold py-3.5 rounded-xl hover:bg-[#10492E] transition"
            >
              Sign In
            </button>

            {message && (
              <p className="text-sm text-red-700 bg-red-50 rounded-xl p-3">
                {message}
              </p>
            )}
          </form>

          <div className="flex items-center gap-3 my-8">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-400">RESIDENT ACCESS</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          <p className="text-center text-sm text-gray-500">
            New to the SK Appointment System?
          </p>

          <p className="text-center text-sm font-semibold text-[#145C3A] mt-2">
            Resident registration will be available soon.
          </p>

          <p className="text-center text-xs text-gray-400 mt-10">
            Sangguniang Kabataan • Public Service Portal
          </p>
        </section>
      </div>
    </main>
  )
}
