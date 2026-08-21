import { useState } from 'react';
import logo from './assets/logo.png';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Monsur Ali Travels Logo" className="h-16 w-auto object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-sky-400 mb-2">Monsur Ali Travels</h1>
        <p className="text-sm text-slate-400 mb-6">Admin Dashboard — Standalone Portal</p>

        <div className="bg-slate-800/60 rounded-xl p-4 mb-6 border border-slate-700/50">
          <p className="text-xs text-slate-300 font-mono">Status: Ready for Phase 2 Implementation</p>
        </div>

        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold rounded-lg shadow-md transition-all active:scale-95"
        >
          Clicked: {count}
        </button>
      </div>
    </div>
  );
}

export default App;
