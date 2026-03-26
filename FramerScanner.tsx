
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type } from "@google/genai";

/**
 * ENAMEL AGE SCANNER - Framer Code Component
 * 
 * Instructions:
 * 1. Create a new Code Component in Framer.
 * 2. Paste this code.
 * 3. In the Framer Canvas, enter your Gemini API Key in the property controls.
 */

// --- Types ---
enum AppStep { Splash, Onboarding, Scanning, Analyzing, Results }
enum ScanStep { Front, Upper, Lower }

interface UserData {
  age: number;
  smoking: boolean;
  drinksCoffeeTea: string;
  acidicDiet: string;
  whiteningHistory: boolean;
  sensitivity: string;
}

interface AnalysisResult {
  estimatedAge: number;
  ageDifference: number;
  confidence: number;
  enamelScore: number;
  narrative: string;
  insights: string[];
  recommendations: string[];
  vulnerableZones: { x: number; y: number; severity: 'low' | 'medium' | 'high' }[];
}

// --- Framer Component ---
export default function EnamelAgeFramer(props) {
  const { apiKey, primaryColor, accentColor } = props;
  const [step, setStep] = useState(AppStep.Splash);
  const [userData, setUserData] = useState<UserData>({
    age: 25,
    smoking: false,
    drinksCoffeeTea: 'Weekly',
    acidicDiet: 'Moderate',
    whiteningHistory: false,
    sensitivity: 'None'
  });
  const [images, setImages] = useState({ front: '', upper: '', lower: '' });
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Splash Timer
  useEffect(() => {
    if (step === AppStep.Splash) {
      const timer = setTimeout(() => setStep(AppStep.Onboarding), 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleAnalyze = async (capturedImages: typeof images) => {
    if (!apiKey) {
      setError("Please provide a Gemini API Key in the component settings.");
      setStep(AppStep.Onboarding);
      return;
    }

    setStep(AppStep.Analyzing);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
        Act as a professional dental imaging AI. Analyze these three photos of a person's teeth.
        User Age: ${userData.age}. Habits: Smoking: ${userData.smoking}, Coffee/Tea: ${userData.drinksCoffeeTea}.
        Provide a biological enamel age estimate and first-person insights.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: capturedImages.front.split(",")[1] } },
            { inlineData: { mimeType: "image/jpeg", data: capturedImages.upper.split(",")[1] } },
            { inlineData: { mimeType: "image/jpeg", data: capturedImages.lower.split(",")[1] } },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              estimatedAge: { type: Type.NUMBER },
              ageDifference: { type: Type.NUMBER },
              confidence: { type: Type.NUMBER },
              enamelScore: { type: Type.NUMBER },
              narrative: { type: Type.STRING },
              insights: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              vulnerableZones: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER },
                    severity: { type: Type.STRING }
                  }
                }
              }
            },
            required: ["estimatedAge", "ageDifference", "confidence", "enamelScore", "narrative", "insights", "recommendations", "vulnerableZones"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      setAnalysis(result);
      setStep(AppStep.Results);
    } catch (err) {
      setError("Analysis failed. Check your API key and lighting.");
      setStep(AppStep.Onboarding);
    }
  };

  return (
    <div style={{ ...containerStyle, backgroundColor: '#f8fafc' }}>
      <AnimatePresence mode="wait">
        {step === AppStep.Splash && (
          <motion.div 
            key="splash"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={centerStyle}
          >
            <div style={{ ...iconBox, backgroundColor: primaryColor }}>🦷</div>
            <h1 style={titleStyle}>Enamel Age</h1>
            <p style={subTitleStyle}>AI Precision Scanner</p>
          </motion.div>
        )}

        {step === AppStep.Onboarding && (
          <motion.div 
            key="onboarding"
            initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            style={contentStyle}
          >
            <h2 style={h2Style}>Your Profile</h2>
            <div style={formStyle}>
              <label style={labelStyle}>Current Age: {userData.age}</label>
              <input 
                type="range" min="10" max="90" 
                value={userData.age} 
                onChange={(e) => setUserData({...userData, age: parseInt(e.target.value)})}
                style={inputStyle}
              />
              
              <button 
                onClick={() => setStep(AppStep.Scanning)}
                style={{ ...buttonStyle, backgroundColor: primaryColor }}
              >
                Start Scan
              </button>
            </div>
          </motion.div>
        )}

        {step === AppStep.Scanning && (
          <ScannerView 
            onComplete={(imgs) => {
              setImages(imgs);
              handleAnalyze(imgs);
            }} 
            accentColor={accentColor}
          />
        )}

        {step === AppStep.Analyzing && (
          <motion.div key="loader" style={centerStyle}>
            <div className="loader-ring"></div>
            <p style={loadingText}>AI is analyzing enamel density...</p>
          </motion.div>
        )}

        {step === AppStep.Results && analysis && (
          <motion.div key="results" style={contentStyle}>
             <div style={resultHeader}>
                <div style={scoreCircle}>
                  <span style={scoreVal}>{analysis.estimatedAge}</span>
                  <span style={scoreLabel}>Years Old</span>
                </div>
             </div>
             <p style={narrativeStyle}>{analysis.narrative}</p>
             <button onClick={() => setStep(AppStep.Onboarding)} style={textBtn}>New Scan</button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <div style={errorToast}>{error}</div>}
    </div>
  );
}

// --- Sub-Components ---
function ScannerView({ onComplete, accentColor }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanStep, setScanStep] = useState(ScanStep.Front);
  const [captured, setCaptured] = useState({ front: '', upper: '', lower: '' });

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; });
  }, []);

  const capture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current?.videoWidth || 640;
    canvas.height = videoRef.current?.videoHeight || 480;
    canvas.getContext('2d')?.drawImage(videoRef.current!, 0, 0);
    const data = canvas.toDataURL('image/jpeg');

    if (scanStep === ScanStep.Front) {
      setCaptured(prev => ({ ...prev, front: data }));
      setScanStep(ScanStep.Upper);
    } else if (scanStep === ScanStep.Upper) {
      setCaptured(prev => ({ ...prev, upper: data }));
      setScanStep(ScanStep.Lower);
    } else {
      onComplete({ ...captured, lower: data });
    }
  };

  return (
    <div style={scannerContainer}>
      <video ref={videoRef} autoPlay playsInline style={videoStyle} />
      <div style={overlayStyle}>
        <div style={{ ...guideBox, borderColor: accentColor }}></div>
      </div>
      <div style={scanInfo}>
        <h3>{scanStep === ScanStep.Front ? "Front Smile" : scanStep === ScanStep.Upper ? "Upper Row" : "Lower Row"}</h3>
      </div>
      <button onClick={capture} style={captureBtn}></button>
    </div>
  );
}

// --- Styles ---
const containerStyle: React.CSSProperties = { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'sans-serif' };
const centerStyle: React.CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' };
const contentStyle: React.CSSProperties = { flex: 1, padding: 24, display: 'flex', flexDirection: 'column' };
const iconBox: React.CSSProperties = { width: 80, height: 80, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 20 };
const titleStyle: React.CSSProperties = { fontSize: 32, fontWeight: 800, margin: 0, color: '#0f172a' };
const subTitleStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#64748b', marginTop: 8 };
const h2Style: React.CSSProperties = { fontSize: 24, fontWeight: 700, marginBottom: 20 };
const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 20 };
const labelStyle: React.CSSProperties = { fontSize: 14, fontWeight: 600, color: '#475569' };
const inputStyle: React.CSSProperties = { width: '100%' };
const buttonStyle: React.CSSProperties = { padding: '16px', borderRadius: 16, color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 16 };
const scannerContainer: React.CSSProperties = { flex: 1, position: 'relative', backgroundColor: 'black' };
const videoStyle: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' };
const overlayStyle: React.CSSProperties = { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' };
const guideBox: React.CSSProperties = { width: '70%', height: '40%', border: '2px solid white', borderRadius: '40%' };
const scanInfo: React.CSSProperties = { position: 'absolute', top: 40, width: '100%', textAlign: 'center', color: 'white' };
const captureBtn: React.CSSProperties = { position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', width: 70, height: 70, borderRadius: '50%', backgroundColor: 'white', border: '5px solid rgba(0,0,0,0.2)' };
const loadingText: React.CSSProperties = { marginTop: 20, color: '#64748b', fontSize: 14 };
const resultHeader: React.CSSProperties = { display: 'flex', justifyContent: 'center', marginBottom: 30 };
const scoreCircle: React.CSSProperties = { width: 150, height: 150, borderRadius: '50%', border: '8px solid #06b6d4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' };
const scoreVal: React.CSSProperties = { fontSize: 48, fontWeight: 800, color: '#0f172a' };
const scoreLabel: React.CSSProperties = { fontSize: 12, color: '#64748b', textTransform: 'uppercase' };
const narrativeStyle: React.CSSProperties = { fontSize: 16, lineHeight: 1.6, color: '#334155', textAlign: 'center' };
const textBtn: React.CSSProperties = { background: 'none', border: 'none', color: '#06b6d4', fontWeight: 600, marginTop: 20, cursor: 'pointer' };
const errorToast: React.CSSProperties = { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#fee2e2', color: '#b91c1c', padding: 12, borderRadius: 12, fontSize: 12, border: '1px solid #fecaca' };

// --- Framer Property Controls ---
export const addPropertyControls = (Component) => {
  addPropertyControls(Component, {
    apiKey: { type: ControlType.String, title: "Gemini API Key" },
    primaryColor: { type: ControlType.Color, title: "Primary Color", defaultValue: "#06b6d4" },
    accentColor: { type: ControlType.Color, title: "Scanner Guide Color", defaultValue: "#06b6d4" },
  });
};
