
import React, { useState, useEffect } from 'react';
import { AppStep, UserData, AnalysisResult, ScanStep } from './types';
import Header from './components/Header';
import UserInputs from './components/UserInputs';
import Scanner from './components/Scanner';
import Loader from './components/Loader';
import Results from './components/Results';
import { analyzeEnamel } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.Splash);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [images, setImages] = useState<{ front: string; upper: string; lower: string }>({
    front: '',
    upper: '',
    lower: ''
  });
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (step === AppStep.Splash) {
      const timer = setTimeout(() => setStep(AppStep.Onboarding), 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleStartScan = (data: UserData) => {
    setUserData(data);
    setStep(AppStep.ScanGuide);
  };

  const handleFinishScan = async (capturedImages: { front: string; upper: string; lower: string }) => {
    setImages(capturedImages);
    setStep(AppStep.Analyzing);
    
    if (userData) {
      try {
        const result = await analyzeEnamel(capturedImages, userData);
        setAnalysis(result);
        setStep(AppStep.Results);
      } catch (err) {
        setError("I encountered an issue analyzing your images. Please try again with better lighting.");
        setStep(AppStep.Onboarding);
      }
    }
  };

  const resetApp = () => {
    setStep(AppStep.Onboarding);
    setAnalysis(null);
    setImages({ front: '', upper: '', lower: '' });
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-xl relative overflow-hidden">
      {step !== AppStep.Splash && <Header onReset={resetApp} />}

      <main className="flex-1 flex flex-col p-4">
        {step === AppStep.Splash && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6 animate-in fade-in duration-1000">
            <div className="w-32 h-32 bg-cyan-600 rounded-3xl flex items-center justify-center shadow-lg transform rotate-12">
              <svg className="w-20 h-20 text-white transform -rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Enamel Age</h1>
              <p className="text-cyan-600 font-semibold tracking-widest uppercase text-xs mt-2">Precision Scanner</p>
            </div>
            <div className="absolute bottom-12 text-slate-400 text-sm animate-pulse">
              Initializing AI Vision System...
            </div>
          </div>
        )}

        {step === AppStep.Onboarding && (
          <UserInputs onSubmit={handleStartScan} initialData={userData} />
        )}

        {step === AppStep.ScanGuide && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in slide-in-from-bottom duration-500">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900">Scan Preparation</h2>
              <p className="text-slate-600 mt-2">I'll guide you through 3 quick angles to analyze your enamel texture and wear.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 w-full">
              {[
                { title: 'Front Smile', desc: 'Teeth together, lips wide open' },
                { title: 'Upper Close-up', desc: 'Tilt head back, focus on top row' },
                { title: 'Lower Close-up', desc: 'Tilt head down, focus on bottom row' }
              ].map((item, i) => (
                <div key={i} className="flex items-center p-4 bg-white rounded-2xl border border-slate-100">
                  <span className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold mr-4">{i+1}</span>
                  <div className="text-left">
                    <p className="font-semibold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setStep(AppStep.Scanning)}
              className="w-full py-4 bg-cyan-600 text-white rounded-2xl font-bold shadow-lg shadow-cyan-200 active:scale-95 transition-all"
            >
              Start Scanning
            </button>
          </div>
        )}

        {step === AppStep.Scanning && (
          <Scanner onComplete={handleFinishScan} />
        )}

        {step === AppStep.Analyzing && (
          <Loader />
        )}

        {step === AppStep.Results && analysis && (
          <Results 
            result={analysis} 
            originalImage={images.front} 
            onReScan={resetApp} 
          />
        )}
      </main>

      {error && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm shadow-lg flex items-center">
          <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

export default App;
