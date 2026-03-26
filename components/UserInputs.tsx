
import React, { useState } from 'react';
import { UserData } from '../types';

interface UserInputsProps {
  onSubmit: (data: UserData) => void;
  initialData: UserData | null;
}

const UserInputs: React.FC<UserInputsProps> = ({ onSubmit, initialData }) => {
  const [data, setData] = useState<UserData>(initialData || {
    age: 30,
    smoking: false,
    drinksCoffeeTea: 'Weekly',
    acidicDiet: 'Moderate',
    whiteningHistory: false,
    sensitivity: 'None'
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">Personal Context</h2>
        <p className="text-slate-500 text-sm">I'll use this to calibrate my enamel aging models.</p>
      </div>

      <div className="space-y-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Chronological Age</label>
          <input 
            type="range" 
            min="18" max="85" 
            value={data.age} 
            onChange={(e) => setData({...data, age: parseInt(e.target.value)})}
            className="w-full accent-cyan-600"
          />
          <div className="flex justify-between mt-2 text-slate-900 font-bold">
            <span>18</span>
            <span className="text-cyan-600 text-xl">{data.age}</span>
            <span>85</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setData({...data, smoking: !data.smoking})}
            className={`p-4 rounded-2xl border-2 transition-all text-left ${data.smoking ? 'border-cyan-600 bg-cyan-50' : 'border-slate-100 bg-white'}`}
          >
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Smoking</p>
            <p className="font-semibold">{data.smoking ? 'Smoker' : 'Non-smoker'}</p>
          </button>
          <button 
            onClick={() => setData({...data, whiteningHistory: !data.whiteningHistory})}
            className={`p-4 rounded-2xl border-2 transition-all text-left ${data.whiteningHistory ? 'border-cyan-600 bg-cyan-50' : 'border-slate-100 bg-white'}`}
          >
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Whitening</p>
            <p className="font-semibold">{data.whiteningHistory ? 'Used before' : 'Never'}</p>
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Coffee & Tea Frequency</label>
          <div className="flex flex-wrap gap-2">
            {['Daily', 'Weekly', 'Rarely', 'Never'].map(level => (
              <button
                key={level}
                onClick={() => setData({...data, drinksCoffeeTea: level})}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${data.drinksCoffeeTea === level ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-100'}`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Acidic Diet (Citrus, Soda)</label>
          <div className="flex flex-wrap gap-2">
            {['High', 'Moderate', 'Low'].map(level => (
              <button
                key={level}
                onClick={() => setData({...data, acidicDiet: level})}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${data.acidicDiet === level ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-100'}`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tooth Sensitivity</label>
          <div className="flex flex-wrap gap-2">
            {['High', 'Moderate', 'None'].map(level => (
              <button
                key={level}
                onClick={() => setData({...data, sensitivity: level})}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${data.sensitivity === level ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-100'}`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button 
        onClick={() => onSubmit(data)}
        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl active:scale-95 transition-all mt-4"
      >
        Proceed to Scan
      </button>
    </div>
  );
};

export default UserInputs;
