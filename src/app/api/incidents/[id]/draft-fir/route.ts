import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { draftFIR } from '@/lib/gemini';

export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        // Await params correctly for Next.js 15+ 
        const params = await props.params;
        const { id } = params;

        // Simply search both fields to support UUIDs and CaseIDs
        const incident = await prisma.incident.findFirst({
            where: {
                OR: [
                    { id: id },
                    { caseId: id }
                ]
            }
        });

        if (!incident) {
            return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
        }

        const firDraft = await draftFIR(
            incident.description,
            JSON.parse(incident.analysis || '{}')
        );

        const updatedIncident = await prisma.incident.update({
            where: { id: incident.id },
            data: {
                firDraft,
                status: 'DRAFTING'
            }
        });

        return NextResponse.json(updatedIncident);
    } catch (error) {
        console.error('Failed to draft FIR:', error);
        return NextResponse.json({ error: 'Failed to draft FIR' }, { status: 500 });
    }
}
