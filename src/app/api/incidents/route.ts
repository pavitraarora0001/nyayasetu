import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        // Build where clause
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if (status) where.status = status;
        if (category) where.category = category;
        if (search) {
            where.OR = [
                { id: { contains: search } },
                { caseId: { contains: search, mode: 'insensitive' } },
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

import { analyzeIncident } from '@/lib/gemini';

// ... (existing helper methods)

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { description, type, imageUrl, analysis: providedAnalysis } = body;

        // Generate readable Case ID
        const timestamp = Date.now();
        const caseId = `CASE-${new Date().getFullYear()}-${timestamp.toString().slice(-4)}`;

        // Use provided analysis or Analyze with Gemini
        let analysisData = providedAnalysis || {};
        let priority = 'Medium';
        let category = type || 'Unclassified';

        if (!providedAnalysis) {
            try {
                const analysis = await analyzeIncident(description);
                analysisData = analysis;
                if (analysis.classification) {
                    if (analysis.classification.priority) priority = analysis.classification.priority;
                    if (analysis.classification.type) category = analysis.classification.type;
                }
            } catch (error) {
                console.error('Analysis failed:', error);
                // Continue without analysis, it can be retried later
            }
        } else {
            // Extract metadata from provided analysis
            if (providedAnalysis.classification) {
                if (providedAnalysis.classification.priority) priority = providedAnalysis.classification.priority;
                if (providedAnalysis.classification.type) category = providedAnalysis.classification.type;
            }
        }

        const incident = await prisma.incident.create({
            data: {
                caseId,
                description,
                status: 'PROCESSED', // Mark as processed providing analysis succeeded/attempted
                category,
                priority,
                imageUrl,
                analysis: JSON.stringify(analysisData),
            }
        });

        return NextResponse.json(incident);
    } catch (error) {
        console.error('Failed to create incident:', error);
        return NextResponse.json({ error: 'Failed to create incident' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, analysis, status, firDraft } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

