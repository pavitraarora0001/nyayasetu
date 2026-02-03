import { NextResponse } from 'next/server';
import { getIncidents, saveIncident } from '@/lib/json-db';

export async function GET() {
    try {
        const incidents = getIncidents();
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

        const incidents = getIncidents();
        const incident = incidents.find(i => i.id === id);

        if (incident) {
            incident.analysis = JSON.stringify(analysis);
            if (status) incident.status = status;
            incident.updatedAt = new Date().toISOString();
            saveIncident(incident);
            return NextResponse.json(incident);
        }

        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
