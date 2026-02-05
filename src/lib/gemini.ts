import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
import { GoogleAIFileManager } from "@google/generative-ai/server";

export async function uploadLegalReference(filePath: string, mimeType: string) {
  if (!process.env.GEMINI_API_KEY) return null;
  const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

  try {
    const uploadResponse = await fileManager.uploadFile(filePath, { mimeType, displayName: "Reference PDF" });
    console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);
    return uploadResponse.file.uri;
  } catch (error) {
    console.error("File upload failed:", error);
    return null;
  }
}

export async function analyzeIncident(description: string, imageBase64?: string, knowledgeBaseUri?: string) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️ No GEMINI_API_KEY found.");
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Construct the prompt parts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parts: any[] = [];

    // 1. Add Knowledge Base (Constitution PDF) if available
    // We expect knowledgeBaseUri to be passed if a file was uploaded
    if (knowledgeBaseUri) {
      parts.push({
        fileData: {
          mimeType: "application/pdf",
          fileUri: knowledgeBaseUri
        }
      });
      console.log("📚 Analyzing with Knowledge Base Reference:", knowledgeBaseUri);
    }

    const prompt = `
      You are a Senior Legal Expert and Station House Officer (SHO) in the Indian Police Force.
      ${knowledgeBaseUri ? "REFERENCE THE ATTACHED LEGAL DOCUMENT (Constitution/BNS) FOR ACCURACY." : ""}
      Your task is to analyze the incident description and provide a strictly legal classification under:
      1. Bharatiya Nyaya Sanhita (BNS) 2023
      2. Indian Penal Code (IPC) (Legacy Reference)
      3. ALL Special & Local Laws (SLL) applicable (e.g., IT Act, POCSO, NDPS, Arms Act, Motor Vehicles Act, etc.)
      
      CRITICAL INSTRUCTIONS:
      1. **Exhaustive & Specific Mapping**: Identify ALL potential sections applicable. Do not be conservative. Cite specific sub-sections (e.g., "Section 66E IT Act" or "Section 303(2) BNS").
      2. **Dual Classification**: For every BNS offense, provide the corresponding IPC section if it exists.
      3. **Strict Punishment Verification**: Extract PRECISE punishment from the Act/Sanhita. Mention Cognizability (Cognizable/Non-Cognizable) and Bailable status.
      4. **No "Unknowns"**: If details are vague, assume the most common scenario for such a complaint and provide sections for that.
      5. **Never Return Empty**: You must provide at least one relevant section if the text describes any form of grievance.
      
      Incident Report: "${description}"
      
      Output Format (Strict JSON):
      {
        "summary": "Professional police summary of leading facts.",
        "classification": {
          "type": "Specific Offense (e.g., Cyber Stalking / Snatching / POCSO)",
          "cognizable": true,
          "fir_required": true,
          "arrest_without_warrant": true,
          "priority": "High"
        },
        "sections": [
          {
            "section": "e.g., 66E IT Act",
            "law": "IT Act",
            "title": "Violation of Privacy",
            "punishment": "Imprisonment up to 3 years or fine"
          },
          {
            "section": "e.g., 303(2) BNS",
            "law": "BNS",
            "title": "Theft (Snatching)",
            "punishment": "Imprisonment up to 3 years"
          }
        ],
        "guidance": {
          "immediate_action": "Police action required (e.g., Seize device, Medical Exam)",
          "evidence_handling": "e.g., Hash value of digital evidence, Chain of Custody",
          "legal_steps": "e.g., Register FIR immediately under 173 BNSS"
        },
        "missing_facts": ["Time of incident", "Device IP Address"],
        "confidence_score": "High",
        "visual_analysis": "null"
      }
    `;

    parts.push({ text: prompt });

    if (imageBase64) {
      // Real Multimodal Input
      parts.push({
        inlineData: {
          data: imageBase64.split(',')[1] || imageBase64,
          mimeType: "image/jpeg",
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
