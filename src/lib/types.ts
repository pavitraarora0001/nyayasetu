export interface IncidentReport {
    description: string;
    mediaUrl?: string; // Optional
    location?: string;
    date?: string;
    userType: 'public' | 'police';
}

export interface LegalSection {
    section: string;
    law: 'BNS' | 'IPC' | 'Other';
    title: string;
    punishment: string;
}

export interface IncidentAnalysis {
    id?: string;
    summary: string;
    classification: {
        type: string;
        cognizable: boolean;
        fir_required: boolean;
        arrest_without_warrant: boolean;
        priority?: string; // High, Medium, Low
    };
    sections: LegalSection[];
    guidance: {
        immediate_action: string;
        evidence_handling: string;
        legal_steps: string;
    };
    missing_facts: string[];
    visual_analysis?: string; // Optional field for image insights
    confidence_score: 'High' | 'Medium' | 'Low';
}

export interface Officer {
    id: string;
    name: string;
    badgeNumber: string;
    policeStation: string;
}

export interface CaseFilter {
    status?: string;
    category?: string;
    priority?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
}

export interface FIRDraft {
    incidentId: string;
    content: string;
    lastSaved: string;
}

