import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function analyzeIncident(description: string, imageBase64?: string) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️ No GEMINI_API_KEY found.");
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an expert legal AI assistant for Indian Law (BNS/IPC). 
      Analyze the following incident description and provide a structured JSON output.
      
      Incident: "${description}"
      
      Output Format (JSON only):
      {
        "summary": "Brief professional summary of the user's report.",
        "classification": {
          "type": "Category (e.g., Theft, Assault, Cyber, Missing Person)",
          "cognizable": boolean,
          "fir_required": boolean,
          "arrest_without_warrant": boolean,
          "priority": "High/Medium/Low"
        },
        "sections": [
          {
            "section": "Number (e.g., 303(2))",
            "law": "BNS or IPC",
            "title": "Title of the section",
            "punishment": "Description of punishment"
          }
        ],
        "guidance": {
          "immediate_action": "What the user should do right now",
          "evidence_handling": "How to preserve evidence",
          "legal_steps": "Next legal steps"
        },
        "missing_facts": ["List of critical information missing from the report"],
        "confidence_score": "High/Medium/Low",
        "visual_analysis": "If an image is provided, describe relevant forensic details, else return null"
      }
    `;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parts: any[] = [{ text: prompt }];

    if (imageBase64) {
      // Real Multimodal Input
      parts.push({
        inlineData: {
          data: imageBase64.split(',')[1] || imageBase64, // Remove header if present
          mimeType: "image/jpeg", // Defaulting to jpeg, ideally detect from base64 header
        },
      });
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Gemini Analysis Failed:', error);
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function draftFIR(description: string, analysis: any) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an expert police officer drafting a First Information Report (FIR) under Indian Law (BNS/IPC).
      Using the following incident details, draft a formal FIR.
      
      Incident Description: "${description}"
      Analysis Data: ${JSON.stringify(analysis)}
      
      The FIR should include:
      1. Legal wording and appropriate sections.
      2. Clear chronology of events.
      3. Formal tone suitable for police records.
      4. Placeholders for unknown details like [Time], [Location] if not provided.
      
      Output ONLY the body of the FIR text. Do not include markdown formatting like ** or ##.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('FIR Drafting Failed:', error);
    // Return a fallback or rethrow
    throw new Error('Failed to draft FIR');
  }
}
