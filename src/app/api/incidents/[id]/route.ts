import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        // Check if params.id looks like a Mongo ObjectID or UUID (length > 20)
        // Actually, just search both columns to be safe.
        const incident = await prisma.incident.findFirst({
            where: {
                OR: [
                    { id: params.id },
                    { caseId: params.id }
                ]
            }
        });

        if (!incident) {
            return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
        }

        return NextResponse.json(incident);
    } catch (error) {
        console.error('Failed to fetch incident:', error);
        return NextResponse.json({ error: 'Failed to fetch incident' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const body = await request.json();
        const { status, firDraft, officerId, officerName, policeStation } = body;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = { updatedAt: new Date() };
        if (status) updateData.status = status;
        if (firDraft !== undefined) updateData.firDraft = firDraft;
        if (officerId) updateData.officerId = officerId;
        if (officerName) updateData.officerName = officerName;
        if (policeStation) updateData.policeStation = policeStation;

        const incident = await prisma.incident.update({
            where: { id: params.id },
            data: updateData
        });

        return NextResponse.json(incident);
    } catch (error) {
        console.error('Failed to update incident:', error);
        return NextResponse.json({ error: 'Failed to update incident' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        // Soft delete by updating status
        const incident = await prisma.incident.update({
            where: { id: params.id },
            data: { status: 'DELETED', updatedAt: new Date() }
        });

        return NextResponse.json({ success: true, incident });
    } catch (error) {
        console.error('Failed to delete incident:', error);
        return NextResponse.json({ error: 'Failed to delete incident' }, { status: 500 });
    }
}
