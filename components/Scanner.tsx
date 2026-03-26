
import React, { useRef, useState, useEffect } from 'react';
import { ScanStep } from '../types';

interface ScannerProps {
  onComplete: (images: { front: string; upper: string; lower: string }) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentStep, setCurrentStep] = useState<ScanStep>(ScanStep.Front);
  const [captured, setCaptured] = useState<{ front: string; upper: string; lower: string }>({
    front: '',
    upper: '',
    lower: ''
  });
  const [streamActive, setStreamActive] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreamActive(true);
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    };
    startCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
        
        setCaptured(prev => {
          const newCaptured = { ...prev };
          if (currentStep === ScanStep.Front) {
            newCaptured.front = dataUrl;
            setCurrentStep(ScanStep.Upper);
          } else if (currentStep === ScanStep.Upper) {
            newCaptured.upper = dataUrl;
            setCurrentStep(ScanStep.Lower);
          } else {
            newCaptured.lower = dataUrl;
            // Use the updated object directly for onComplete
            onComplete(newCaptured);
          }
          return newCaptured;
        });
      }
    }
  };

  const getStepText = () => {
    switch (currentStep) {
      case ScanStep.Front: return "Front Smile";
      case ScanStep.Upper: return "Upper Close-up";
      case ScanStep.Lower: return "Lower Close-up";
    }
  };

  const getStepGuide = () => {
    switch (currentStep) {
      case ScanStep.Front: return "Keep mouth open wide. Align teeth in the oval.";
      case ScanStep.Upper: return "Tilt head back slightly. Focus on top row.";
      case ScanStep.Lower: return "Tilt head down slightly. Focus on bottom row.";
    }
  };

  return (
    <div className="flex-1 flex flex-col relative bg-black rounded-3xl overflow-hidden animate-in fade-in duration-700">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
      />
      
      {/* Scanner Overlay UI */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="scanner-overlay w-full h-full"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="guide-box w-[70%] h-[40%]"></div>
        </div>
      </div>

      <div className="absolute top-6 left-0 right-0 text-center px-6">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 inline-block shadow-lg">
          <p className="text-cyan-600 font-bold uppercase tracking-widest text-[10px] mb-1">Step {currentStep + 1} of 3</p>
          <h3 className="text-xl font-bold text-slate-900">{getStepText()}</h3>
          <p className="text-slate-600 text-sm mt-1">{getStepGuide()}</p>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center px-6 gap-6">
        <div className="flex gap-2">
          {[ScanStep.Front, ScanStep.Upper, ScanStep.Lower].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 w-12 rounded-full transition-all ${s === currentStep ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : s < currentStep ? 'bg-green-500' : 'bg-slate-700'}`} 
            />
          ))}
        </div>

        <div className="flex items-center justify-between w-full">
           <div className="w-12 h-12 rounded-full bg-black/40 border border-white/20 flex items-center justify-center">
              {captured.front && (
                <img src={captured.front} className="w-8 h-8 rounded-full object-cover border border-white/40" />
              )}
           </div>

          <button 
            onClick={takePhoto}
            className="w-20 h-20 rounded-full bg-white flex items-center justify-center p-1 active:scale-90 transition-transform shadow-2xl"
          >
            <div className="w-full h-full rounded-full border-4 border-slate-900 flex items-center justify-center">
               <div className="w-4 h-4 bg-slate-900 rounded-sm"></div>
            </div>
          </button>

          <div className="w-12 h-12"></div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default Scanner;
