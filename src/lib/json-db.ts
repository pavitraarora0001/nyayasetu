import fs from 'fs';
import path from 'path';
import { IncidentAnalysis } from './types';

const DATA_FILE = path.join(process.cwd(), 'data', 'incidents.json');

// Ensure directory exists
if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// Initial seed data
const SEED_DATA = [
    {
        id: "CASE-2024-001",
        description: "Phone snatching at CP Outer Circle",
        status: "PENDING",
        analysis: JSON.stringify({
            classification: { type: "Theft", priority: "High" } // simplified for list view
        }),
        createdAt: new Date("2024-02-03").toISOString()
    },
    {
        id: "CASE-2024-002",
        description: "Online payment fraud reporting",
        status: "DRAFTING",
        analysis: JSON.stringify({
            classification: { type: "Cyber", priority: "Medium" }
        }),
        createdAt: new Date("2024-02-02").toISOString()
    }
];

export interface Incident {
    id: string;
    description: string;
    status: string;
    analysis: string; // JSON string
    createdAt: string;
    updatedAt: string;
}

export const getIncidents = (): Incident[] => {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(SEED_DATA, null, 2));
        return SEED_DATA as Incident[];
    }
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};

export const saveIncident = (incident: Incident) => {
    const current = getIncidents();
    const index = current.findIndex(i => i.id === incident.id);
    if (index >= 0) {
        current[index] = incident;
    } else {
        current.unshift(incident);
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(current, null, 2));
    return incident;
};
