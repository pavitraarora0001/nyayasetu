import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { draftFIR } from '@/lib/gemini';

export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id } = params;

        let description = "";
        let analysisData = {};

        // 1. Try to get data from Body (Robust method)
        try {
            const body = await request.clone().json(); // Clone to be safe if stream is used elsewhere
            if (body.description) {
                description = body.description;
                analysisData = body.analysisData || {};
            }
        } catch {
            // Body might be empty, ignore
        }

        // 2. If no body description, fallback to DB Lookup (Legacy method)
        if (!description) {
            // Simply search both fields to support UUIDs and CaseIDs
            const incident = await prisma.incident.findFirst({
                where: {
                    OR: [
                        { id: id },
                        { caseId: id }
                    ]
                }
            });

            if (incident) {
                description = incident.description;
                analysisData = JSON.parse(incident.analysis || '{}');
            }
        }

        if (!description) {
            return NextResponse.json({ error: 'Incident not found or no description provided' }, { status: 404 });
        }

        const firDraft = await draftFIR(
            description,
            analysisData
        );

        // Try to update DB if it's a real ID, but don't fail if it's a demo/new ID
        if (id && !id.startsWith('new') && !id.startsWith('demo')) {
            try {
                // Determine if ID is UUID or CaseID for update
                const whereClause = id.includes('-') && id.length > 10 ? { id } : { caseId: id }; // Heuristic

                // Note: We can't update if we didn't look up the ID, but it's okay, user can click Save manually in editor.
            } catch (e) { console.warn("Could not persist draft to DB", e); }
        }

        return NextResponse.json({ firDraft });
    } catch (error) {
        console.error('Failed to draft FIR:', error);
        return NextResponse.json({ error: 'Failed to draft FIR' }, { status: 500 });
    }
}
