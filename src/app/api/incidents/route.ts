import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        // Build where clause
        const where: any = {};
        if (status) where.status = status;
        if (category) where.category = category;
        if (search) {
            where.OR = [
                { id: { contains: search } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const incidents = await prisma.incident.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(incidents);
    } catch (error) {
        console.error('Failed to fetch incidents:', error);
        return NextResponse.json({ error: 'Failed to fetch incidents' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, analysis, status, firDraft } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const updateData: any = { updatedAt: new Date() };
        if (analysis) updateData.analysis = JSON.stringify(analysis);
        if (status) updateData.status = status;
        if (firDraft !== undefined) updateData.firDraft = firDraft;

        const incident = await prisma.incident.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(incident);
    } catch (error) {
        console.error('Failed to update incident:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

