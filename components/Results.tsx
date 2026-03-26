
import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import Heatmap from './Heatmap';

interface ResultsProps {
  result: AnalysisResult;
  originalImage: string;
  onReScan: () => void;
}

const Results: React.FC<ResultsProps> = ({ result, originalImage, onReScan }) => {
  const [showHeatmap, setShowHeatmap] = useState(true);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-cyan-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Stable';
    if (score >= 40) return 'Vulnerable';
    return 'At Risk';
  };

  const ageDiffText = result.ageDifference === 0 
    ? "matches your age" 
    : `${Math.abs(result.ageDifference)} years ${result.ageDifference > 0 ? 'older' : 'younger'} than you`;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom duration-700">
      {/* Hero Score Section */}
      <div className="text-center space-y-2 pt-4">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Your Enamel Report</h2>
        <p className="text-slate-500 font-medium">I've completed my analysis based on your scans.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center space-y-6">
        <div className="relative flex items-center justify-center">
          <svg className="w-40 h-40 transform -rotate-90">
            <circle cx="80" cy="80" r="70" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
            <circle 
              cx="80" cy="80" r="70" 
              fill="transparent" 
              stroke="currentColor" 
              strokeWidth="12" 
              strokeDasharray={440} 
              strokeDashoffset={440 - (440 * result.enamelScore) / 100}
              className={`${getScoreColor(result.enamelScore)} transition-all duration-1000 ease-out`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-slate-900">{result.enamelScore}</span>
            <span className={`text-xs font-bold uppercase tracking-widest ${getScoreColor(result.enamelScore)}`}>
              {getScoreLabel(result.enamelScore)}
            </span>
          </div>
        </div>

        <div className="w-full grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enamel Age</p>
            <p className="text-2xl font-bold text-slate-900">{result.estimatedAge} <span className="text-sm font-normal text-slate-500">yrs</span></p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confidence</p>
            <p className="text-2xl font-bold text-slate-900">{result.confidence}<span className="text-sm font-normal text-slate-500">%</span></p>
          </div>
        </div>
      </div>

      {/* Narrative Section */}
      <div className="bg-cyan-50 border border-cyan-100 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg className="w-16 h-16 text-cyan-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017V14H17.017C15.9124 14 15.017 13.1046 15.017 12V10C15.017 8.89543 15.9124 8 17.017 8H19.017V6C19.017 4.89543 18.1216 4 17.017 4H14.017V2H17.017C19.2261 2 21.017 3.79086 21.017 6V12C21.017 14.2091 19.2261 16 17.017 16H16.017C15.9124 16 16.017 15.8954 16.017 16V21H14.017ZM3.01697 21L3.01697 18C3.01697 16.8954 3.9124 16 5.01697 16H8.01697V14H6.01697C4.9124 14 4.01697 13.1046 4.01697 12V10C4.01697 8.89543 4.9124 8 6.01697 8H8.01697V6C8.01697 4.89543 7.12154 4 6.01697 4H3.01697V2H6.01697C8.22611 2 10.017 3.79086 10.017 6V12C10.017 14.2091 8.22611 16 6.01697 16H5.01697C4.9124 16 5.01697 15.8954 5.01697 16V21H3.01697Z" />
          </svg>
        </div>
        <p className="text-cyan-900 font-semibold text-lg leading-snug">
          "Your enamel appears {ageDiffText}."
        </p>
        <p className="text-cyan-800 text-sm mt-3 leading-relaxed">
          {result.narrative}
        </p>
      </div>

      {/* Heatmap Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Enamel Vulnerability Map</h4>
          <button 
            onClick={() => setShowHeatmap(!showHeatmap)}
            className="text-xs font-bold text-cyan-600 px-3 py-1 rounded-full bg-cyan-50"
          >
            {showHeatmap ? 'Hide Map' : 'Show Map'}
          </button>
        </div>
        <Heatmap image={originalImage} zones={result.vulnerableZones} show={showHeatmap} />
      </div>

      {/* Educational Insights */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest px-1">Micro-Insights</h4>
        <div className="grid gap-3">
          {result.insights.map((insight, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start space-x-4">
              <div className="mt-1 w-2 h-2 rounded-full bg-cyan-500 flex-shrink-0"></div>
              <p className="text-sm text-slate-700 italic">"{insight}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-slate-900 rounded-3xl p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h4 className="text-sm font-bold text-white uppercase tracking-widest">Care Routine Suggestions</h4>
        </div>
        <ul className="space-y-3">
          {result.recommendations.map((rec, i) => (
            <li key={i} className="flex items-center text-slate-300 text-sm">
              <span className="mr-3 text-cyan-400">→</span>
              {rec}
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="p-6 text-center text-[11px] text-slate-400 leading-relaxed border-t border-slate-100 mt-4">
        <p className="font-bold mb-1 uppercase tracking-widest">Medical Disclaimer</p>
        <p>This is not a medical diagnosis. My AI estimates biological markers but cannot replace a professional dental examination. Consult your dentist for evaluation.</p>
      </div>

      <div className="flex flex-col space-y-3 mt-4">
        <button 
          onClick={() => window.print()} 
          className="w-full py-4 border-2 border-slate-200 text-slate-600 rounded-2xl font-bold flex items-center justify-center space-x-2 active:bg-slate-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Save Report PDF</span>
        </button>
        <button 
          onClick={onReScan}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl active:scale-95 transition-all"
        >
          New Analysis
        </button>
      </div>
    </div>
  );
};

export default Results;
