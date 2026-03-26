
import React from 'react';

interface HeatmapProps {
  image: string;
  zones: { x: number; y: number; severity: 'low' | 'medium' | 'high' }[];
  show: boolean;
}

const Heatmap: React.FC<HeatmapProps> = ({ image, zones, show }) => {
  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'high': return 'rgba(239, 68, 68, 0.4)'; // Red
      case 'medium': return 'rgba(245, 158, 11, 0.4)'; // Orange
      case 'low': return 'rgba(16, 185, 129, 0.4)'; // Green
      default: return 'rgba(16, 185, 129, 0.4)';
    }
  };

  const getPulsingClass = (sev: string) => {
    switch (sev) {
      case 'high': return 'animate-ping';
      default: return '';
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-900">
      <img src={image} className="absolute inset-0 w-full h-full object-cover" />
      
      {show && zones.map((zone, i) => (
        <div 
          key={i}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl"
          style={{
            left: `${zone.x}%`,
            top: `${zone.y}%`,
            width: '60px',
            height: '60px',
            backgroundColor: getSeverityColor(zone.severity),
          }}
        >
          <div className={`w-full h-full rounded-full border-2 border-white/20 ${getPulsingClass(zone.severity)}`}></div>
        </div>
      ))}

      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center space-x-3">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <span className="text-[10px] text-white font-medium">Safe</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-amber-400"></div>
          <span className="text-[10px] text-white font-medium">Wearing</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-red-400"></div>
          <span className="text-[10px] text-white font-medium">At Risk</span>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
