
export enum AppStep {
  Splash,
  Onboarding,
  ScanGuide,
  Scanning,
  Analyzing,
  Results
}

export enum ScanStep {
  Front,
  Upper,
  Lower
}

export interface UserData {
  age: number;
  smoking: boolean;
  drinksCoffeeTea: string; // "Daily", "Weekly", "Rarely", "Never"
  acidicDiet: string; // "High", "Moderate", "Low"
  whiteningHistory: boolean;
  sensitivity: string; // "High", "Moderate", "None"
}

export interface AnalysisResult {
  estimatedAge: number;
  ageDifference: number;
  confidence: number;
  enamelScore: number;
  narrative: string;
  insights: string[];
  recommendations: string[];
  vulnerableZones: { x: number; y: number; severity: 'low' | 'medium' | 'high' }[];
}
