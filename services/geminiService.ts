
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, AnalysisResult } from "../types";

const API_KEY = process.env.API_KEY;

export const analyzeEnamel = async (
  images: { front: string; upper: string; lower: string },
  userData: UserData
): Promise<AnalysisResult> => {
  if (!API_KEY) throw new Error("API Key not found");

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `
    Act as a professional dental imaging AI. Analyze these three photos of a person's teeth (Front, Upper, Lower).
    The user is ${userData.age} years old. 
    Habits: Smoking: ${userData.smoking}, Coffee/Tea: ${userData.drinksCoffeeTea}, Acidic Diet: ${userData.acidicDiet}, Whitening History: ${userData.whiteningHistory}, Sensitivity: ${userData.sensitivity}.

    Analyze the following parameters:
    1. Enamel translucency at edges.
    2. Surface wear patterns (flattening, micro-chipping).
    3. Staining depth and distribution.
    4. Gloss and reflectivity (specular reflection).
    5. Gum recession visibility.
    6. Enamel thickness estimation (opacity).
    7. Surface texture uniformity.
    8. Color shift toward yellow (dentin exposure).
    9. Cracks or craze lines.

    The response MUST be in the first person voice, speaking directly to the user (e.g., "I've analyzed your enamel...").
    Compare results to biological age benchmarks.

    Required JSON Output:
    - estimatedAge: number (calculated biological age of enamel)
    - ageDifference: number (estimatedAge - userData.age)
    - confidence: number (0-100)
    - enamelScore: number (0-100 where 100 is perfect)
    - narrative: string (First-person summary of findings)
    - insights: string[] (3-4 specific observations in first person)
    - recommendations: string[] (Actionable advice based on findings)
    - vulnerableZones: array of {x, y, severity} representing relative coordinates (0-100) on the front image for heatmap overlay.
  `;

  const getBase64 = (dataUrl: string) => {
    if (!dataUrl) return "";
    const parts = dataUrl.split(",");
    return parts.length > 1 ? parts[1] : parts[0];
  };

  const frontBase64 = getBase64(images.front);
  const upperBase64 = getBase64(images.upper);
  const lowerBase64 = getBase64(images.lower);

  if (!frontBase64 || !upperBase64 || !lowerBase64) {
    throw new Error("One or more images are missing or invalid.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: frontBase64 } },
          { inlineData: { mimeType: "image/jpeg", data: upperBase64 } },
          { inlineData: { mimeType: "image/jpeg", data: lowerBase64 } },
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
    return result as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
