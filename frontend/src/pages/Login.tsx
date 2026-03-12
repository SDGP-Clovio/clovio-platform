import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f4f9] p-4">
      {/* 1. Parent Container: Must have overflow-hidden and relative position */}
      <div className="relative flex w-full max-w-5xl overflow-hidden rounded-[40px] bg-white shadow-2xl min-h-[600px]">

        {/* 2. THE PURPLE BACKGROUND LAYER */}
        {/* We use an absolute div that spans the right half but extends behind the curve */}
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[#7c3aed]">
          {/* 3. THE CURVE: This white div creates the "cut-out" look */}
          <div className="absolute inset-y-0 -left-20 w-40 rounded-r-[100px] bg-white" />
        </div>

        {/* 4. CONTENT LAYERS (Must be z-10 to sit above the background) */}
        <div className="z-10 flex w-full flex-col justify-center p-12 md:w-1/2 lg:p-20">
          <div className="mb-12 flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-[#7c3aed] flex items-center justify-center shadow-lg shadow-purple-200">
              <span className="text-white font-bold">C</span>
            </div>
            <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">System logo</span>
          </div>

          <h1 className="text-4xl font-bold text-slate-800 leading-tight">Log in</h1>
          <p className="mb-10 text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-[#7c3aed] transition-colors hover:text-[#6d28d9]"
            >
              Create an account
            </Link>
          </p>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 outline-none transition-all focus:ring-2 focus:ring-[#7c3aed]/20"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 pr-12 outline-none transition-all focus:ring-2 focus:ring-[#7c3aed]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm font-medium text-[#7c3aed] transition-colors hover:text-[#6d28d9]"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-[#7c3aed] py-4 text-base font-bold text-white shadow-xl shadow-purple-400/30 transition-all hover:brightness-110"
            >
              Log in
            </button>
          </form>
        </div>

        {/* Right Side Illustration Layer */}
        <div className="relative z-10 hidden w-1/2 md:flex items-center justify-center p-12">
          <div className="w-full h-64 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 transform -rotate-6 shadow-2xl flex items-center justify-center">
            <span className="text-white/40 italic text-sm text-center px-4">
              [Place your layered laptop image here]
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;