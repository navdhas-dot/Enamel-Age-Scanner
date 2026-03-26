
import React, { useState, useEffect } from 'react';

const Loader: React.FC = () => {
  const [message, setMessage] = useState("Analyzing surface texture...");
  const messages = [
    "Analyzing surface texture...",
    "Measuring edge translucency...",
    "Calibrating gloss reflectivity...",
    "Estimating dentin exposure...",
    "Checking for micro-wear patterns...",
    "Comparing against age-benchmarks...",
    "Finalizing enamel age report..."
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setMessage(messages[i]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 animate-in fade-in duration-500">
      <div className="relative">
        <div className="w-32 h-32 border-4 border-cyan-100 rounded-full animate-spin border-t-cyan-600"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-12 h-12 text-cyan-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.618.309a6 6 0 00-3.414 5.414v.353a2 2 0 002 2h6a2 2 0 002-2v-.353a2 2 0 01.586-1.414z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c3.5 0 6.5-1.5 6.5-1.5s-1.5-3.5-6.5-3.5-6.5 3.5-6.5 3.5 3 1.5 6.5 1.5z" />
          </svg>
        </div>
      </div>
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">AI Vision Processing</h3>
        <p className="text-slate-500 mt-2 font-medium h-6">{message}</p>
      </div>
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <div className="bg-cyan-600 h-full animate-[loading_14s_ease-in-out_infinite]"></div>
      </div>
      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Loader;
