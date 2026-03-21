import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-clovio-purple rounded-lg flex items-center justify-center text-white font-bold">C</div>
          <span className="text-xl font-bold tracking-tight">Clovio</span>
        </div>
        <div className="space-x-6">
          <Link to="/login" className="font-medium hover:text-clovio-purple transition">Login</Link>
          <Link to="/signup" className="bg-clovio-purple text-white px-5 py-2 rounded-full font-medium hover:opacity-90 transition shadow-lg shadow-purple-100">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 pt-20 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 space-y-6 text-left">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Fix <span className="text-clovio-purple">Free-Riding</span> in Group Projects.
          </h1>
          <p className="text-lg text-slate-600 max-w-md">
            Transform group projects into fair, structured collaborations using AI task distribution and fairness scores[cite: 5, 31].
          </p>
          <div className="flex gap-4">
            <Link to="/signup" className="bg-clovio-purple text-white px-8 py-4 rounded-xl font-bold text-lg hover:brightness-110 transition-all">
              Start Your Project
            </Link>
          </div>
        </div>
        <div className="md:w-1/2 mt-16 md:mt-0 flex justify-center">
          <div className="w-full h-80 bg-slate-100 rounded-[3rem] border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 italic">
            [Interactive Dashboard Preview Placeholder]
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;