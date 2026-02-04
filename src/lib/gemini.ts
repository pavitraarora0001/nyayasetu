import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function analyzeIncident(description: string, imageBase64?: string) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️ No GEMINI_API_KEY found.");
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      You are a Senior Legal Expert and Station House Officer(SHO) in the Indian Police Force.
      Your task is to analyze the incident description and provide a strictly legal classification under the Bharatiya Nyaya Sanhita(BNS) 2023 and Indian Penal Code(IPC).
      
      CRITICAL INSTRUCTIONS:
    1. ** Exhaustive Mapping **: Identify ALL potential sections applicable.Do not be conservative.If it looks like theft, include Theft.If force was used, include Robbery / Snatching.
      2. ** BNS & IPC **: For every offense, provide the BNS 2023 Section AND the corresponding legacy IPC Section.
      3. ** Constitutionality **: Ensure all punishments mentioned are legally accurate as per the latest Sanhita.
      4. ** No "Unknowns" **: If details are vague, assume the most common scenario for such a complaint and provide sections for that(e.g., for "phone lost", assume "Theft" or "Lost Property" sections).
    5. ** Never Return Empty **: You must provide at least one relevant section if the text describes any form of grievance.
      
      Incident Report: "${description}"
      
      Output Format(Strict JSON):
    {
      "summary": "Professional police summary of facts. (e.g., 'The complainant alleges theft of mobile phone...')",
        "classification": {
        "type": "Specific Offense (e.g., Snatching / Theft / Assault)",
          "cognizable": true,
            "fir_required": true,
              "arrest_without_warrant": true,
                "priority": "High"
      },
      "sections": [
        {
          "section": "e.g., 304 BNS (Snatching)",
          "law": "BNS",
          "title": "Snatching",
          "punishment": "Imprisonment up to 3 years and fine"
        },
        {
          "section": "e.g., 379 IPC (Theft)",
          "law": "IPC",
          "title": "Punishment for theft",
          "punishment": "Imprisonment up to 3 years or fine"
        }
      ],
        "guidance": {
        "immediate_action": "Police action required (e.g., Deploy team to spot, track IMEI)",
          "evidence_handling": "e.g., Collect CCTV footage, preserving crime scene",
            "legal_steps": "e.g., Register FIR immediately under 173 BNSS"
      },
      "missing_facts": ["Time of incident", "Description of accused"],
        "confidence_score": "High",
          "visual_analysis": "null"
    }

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
