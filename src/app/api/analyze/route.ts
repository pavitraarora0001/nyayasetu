import { NextResponse } from 'next/server';
import { IncidentAnalysis } from '@/lib/types';
// import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { description, userType, image } = body; // Accept image

        if (!description) {
            return NextResponse.json(
                { error: 'Description is required' },
                { status: 400 }
            );
        }

        // SIMULATION DELAY (To mimic AI processing)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // TODO: INTEGRATE REAL LLM HERE
        // Example:
        // const response = await fetch('https://api.openai.com/v1/chat/completions', { ... });
        // const data = await response.json();

        // MOCK RESPONSE (Based on "Phone Theft" scenario)
        // Dynamic mock based on input keywords for better demo experience
        let mockAnalysis: IncidentAnalysis;

        const lowerDesc = description.toLowerCase();

        // Mock Visual Analysis Result
        let visualFindings = "";
        if (image) {
            visualFindings = "Visual analysis of the uploaded evidence suggests: 1. Presence of physical bruises consistent with blunt force. 2. A torn bag strap indicating snatching attempt.";
        }

        if (lowerDesc.includes('theft') || lowerDesc.includes('stole') || lowerDesc.includes('snatch') || lowerDesc.includes('rob')) {
            mockAnalysis = {
                summary: "The user reports an incident of phone snatching in a public area. The perpetrator used force to take the property and fled the scene. This aligns with theft/snatching.",
                classification: {
                    type: "Theft / Snatching",
                    cognizable: true,
                    fir_required: true,
                    arrest_without_warrant: true
                },
                sections: [
                    {
                        section: "303(2)",
                        law: "BNS",
                        title: "Theft (Snatching)",
                        punishment: "Up to 3 years / Fine"
                    },
                    {
                        section: "379",
                        law: "IPC",
                        title: "Theft",
                        punishment: "Up to 3 years"
                    }
                ],
                guidance: {
                    immediate_action: "Visit the nearest police station immediately or file an e-FIR if available.",
                    evidence_handling: "Do not wipe the phone remotely yet if tracking is possible. Keep IMEI number ready.",
                    legal_steps: "Police is bound to register an FIR for cognizable offences like theft."
                },
                missing_facts: ["Exact time of incident", "Description of the accused"],
                confidence_score: "High",
                visual_analysis: visualFindings || undefined
            };
        } else if (lowerDesc.includes('hit') || lowerDesc.includes('beat') || lowerDesc.includes('attack') || lowerDesc.includes('hurt')) {
            mockAnalysis = {
                summary: "The victim was physically assaulted. The extent of injury needs to be determined (simple vs grievous).",
                classification: {
                    type: "Voluntarily Causing Hurt",
                    cognizable: false, // Simple hurt 323 is non-cognizable usually, but let's be safe
                    fir_required: false, // NCR might be filed
                    arrest_without_warrant: false
                },
                sections: [
                    {
                        section: "115(2)",
                        law: "BNS",
                        title: "Voluntarily causing hurt",
                        punishment: "Up to 1 year / Fine"
                    },
                    {
                        section: "323",
                        law: "IPC",
                        title: "Voluntarily causing hurt",
                        punishment: "Up to 1 year / Fine"
                    }
                ],
                guidance: {
                    immediate_action: "Seek medical attention immediately. Obtain a medical report (MLC).",
                    evidence_handling: "Take photos of injuries. Preserve torn clothes if any.",
                    legal_steps: "For non-cognizable offences, police may file NCR. Magistrate permission needed for investigation."
                },
                missing_facts: ["Medical report", "Weapon used"],
                confidence_score: "Medium"
            };
        } else {
            // Default Fallback
            mockAnalysis = {
                summary: "The incident reported involves a general complaint. Specific legal classification requires more details.",
                classification: {
                    type: "General / Unclassified",
                    cognizable: false,
                    fir_required: false,
                    arrest_without_warrant: false
                },
                sections: [],
                guidance: {
                    immediate_action: "Provide more details about the incident.",
                    evidence_handling: "N/A",
                    legal_steps: "Consult a legal expert or visit police station for enquiry."
                },
                missing_facts: ["Nature of offence", "Time and Date", "Location"],
                confidence_score: "Low"
            };
        }

        // [NEW] Persist to Database (Fail-safe for Demo)
        let savedId = "demo-id-" + Date.now();
        // try {
        //     const savedIncident = await prisma.incident.create({
        //         data: {
        //             description,
        //             status: userType === 'police' ? 'DRAFTING' : 'PENDING',
        //             analysis: JSON.stringify(mockAnalysis)
        //         }
        //     });
        //     savedId = savedIncident.id;
        // } catch (dbError) {
        //     console.warn("⚠️ Demo Mode: Database write failed, but returning analysis anyway.", dbError);
        //     // We swallow the error so the user still sees the result in the UI
        // }

        // Return the analysis + the DB ID (or fake ID)
        return NextResponse.json({ ...mockAnalysis, id: savedId });

    } catch (error) {
        console.error('Analysis failed:', error);
        return NextResponse.json(
            { error: 'Failed to process incident' },
            { status: 500 }
        );
    }
}
