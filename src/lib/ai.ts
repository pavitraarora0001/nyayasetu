import { GoogleGenerativeAI } from "@google/generative-ai";
import { IncidentAnalysis } from "./types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const analyzeWithGemini = async (description: string, imageBase64?: string): Promise<IncidentAnalysis | null> => {
    if (!process.env.GEMINI_API_KEY) {
        console.warn("⚠️ No GEMINI_API_KEY found. Falling back to Mock Engine.");
        return null;
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        You are an expert Indian Legal Aid AI. Analyze the following incident description and provide a structured legal analysis in JSON format.
        
        Incident: "${description}"
        
        Output Schema (Strict JSON):
        {
            "summary": "Brief professional summary of the incident",
            "classification": {
                "type": "Specific legal classification (e.g. Theft, Assault, Cyber Fraud)",
                "cognizable": boolean,
                "fir_required": boolean,
                "arrest_without_warrant": boolean
            },
            "sections": [
                {
                    "section": "Section Number (e.g. 379)",
                    "law": "IPC or BNS",
                    "title": "Title of the section",
                    "punishment": "Max punishment"
                }
            ],
            "guidance": {
                "immediate_action": "What the user should do right now",
                "evidence_handling": "How to preserve evidence",
                "legal_steps": "Next legal steps"
            },
            "missing_facts": ["List of vital details missing from the description"],
            "confidence_score": "High/Medium/Low",
            "visual_analysis": "If an image is provided, describe relevant forensic details, else null"
        }
        
        Ensure the response is valid JSON only. Do not wrap in markdown code blocks.
        `;

        const parts: any[] = [{ text: prompt }];

        if (imageBase64) {
            // Basic handling if we were to pass the image. 
            // Note: In a real app we'd convert the base64 properly.
            // For now, let's keep it text-primary as the 'image' param in route is often a placeholder/URL.
            // If we really want image analysis, we'd add inlineData here.
            parts.push({ text: `\n[Image Context Provided]: ${imageBase64.substring(0, 50)}... (Image analysis is secondary)` });
        }

        const result = await model.generateContent(parts);
        const response = await result.response;
        const text = response.text();

        // Clean markdown if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonStr) as IncidentAnalysis;

    } catch (error) {
        console.error("Gemini API Error:", error);
        return null; // Trigger fallback
    }
};
