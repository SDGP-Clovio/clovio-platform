import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignUp: React.FC = () => {
  const navigate = useNavigate();

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f4f9] p-4 font-sans">
      {/* Parent Container with overflow-hidden */}
      <div className="relative flex w-full max-w-5xl overflow-hidden rounded-[40px] bg-white shadow-2xl min-h-[650px] flex-col md:flex-row-reverse">

        {/* THE PURPLE BACKGROUND LAYER (Flipped to the Left) */}
        <div className="absolute left-0 top-0 h-full w-1/2 bg-[#7c3aed]">
          {/* The White Curve bite - mirrored to the right side of the purple block */}
          <div className="absolute inset-y-0 -right-20 w-40 rounded-l-[100px] bg-white" />
        </div>

        {/* RIGHT SIDE: SIGN UP FORM */}
        <div className="z-10 flex w-full flex-col justify-center p-12 md:w-1/2 lg:p-20">
          <div className="mb-8 flex items-center gap-2 text-[#7c3aed]">
            <div className="h-10 w-10 rounded-xl bg-current flex items-center justify-center shadow-lg shadow-purple-200">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">System logo</span>
          </div>

          <h1 className="text-4xl font-bold text-slate-800 leading-tight">Create an account</h1>
          <p className="mb-8 text-slate-400 text-sm">Join Clovio to start fair collaborations [cite: 5, 31]</p>

          <form className="space-y-4" onSubmit={handleSignUp}>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full rounded-2xl bg-slate-50 p-4 border border-slate-100 outline-none focus:ring-2 focus:ring-[#7c3aed]/20 transition-all"
            />
            {/* Student ID field for academic tracking [cite: 6] */}
            <input
              type="text"
              placeholder="Student ID (e.g., w2120309)"
              className="w-full rounded-2xl bg-slate-50 p-4 border border-slate-100 outline-none focus:ring-2 focus:ring-[#7c3aed]/20 transition-all"
            />
            <input
              type="email"
              placeholder="University Email"
              className="w-full rounded-2xl bg-slate-50 p-4 border border-slate-100 outline-none focus:ring-2 focus:ring-[#7c3aed]/20 transition-all"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-2xl bg-slate-50 p-4 border border-slate-100 outline-none focus:ring-2 focus:ring-[#7c3aed]/20 transition-all"
            />

            <div className="flex items-center gap-8 pt-4">
              <button
                type="submit"
                className="rounded-full bg-[#7c3aed] px-14 py-3 font-bold text-white shadow-xl shadow-purple-400/30 hover:brightness-110 transition-all"
              >
                Sign up
              </button>
              <Link to="/login" className="font-bold text-slate-400 hover:text-slate-600 transition-colors">
                Login
              </Link>
            </div>
          </form>
        </div>

        {/* LEFT SIDE: ILLUSTRATION (Flipped Graphic) */}
        <div className="relative z-10 hidden w-1/2 md:flex items-center justify-center p-12">
          <div className="w-full h-72 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 transform -rotate-3 shadow-2xl flex items-center justify-center p-6 text-center">
            <div className="space-y-2">
              <p className="text-white font-bold text-lg">AI Task Distribution [cite: 22]</p>
              <p className="text-white/60 text-xs italic">
                Fairly assigning tasks based on your skills and learning goals[cite: 30, 31].
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;