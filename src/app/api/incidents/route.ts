import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const incidents = await prisma.incident.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(incidents);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch incidents' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, analysis, status } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const updated = await prisma.incident.update({
            where: { id },
            data: {
                analysis: JSON.stringify(analysis),
                status: status || undefined
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
