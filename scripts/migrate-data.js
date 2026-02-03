require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    const dataPath = path.join(__dirname, '../data/incidents.json');
    console.log(`Reading legacy data from ${dataPath}...`);

    if (!fs.existsSync(dataPath)) {
        console.error('Data file not found!');
        return;
    }

    const rawData = fs.readFileSync(dataPath, 'utf8');
    const incidents = JSON.parse(rawData);
    console.log(`Found ${incidents.length} legacy incidents.`);

    for (const incident of incidents) {
        console.log(`Processing incident: ${incident.id}`);

        // Parse analysis to extract metadata if available
        let category = null;
        let priority = null;
        try {
            if (incident.analysis) {
                const analysis = JSON.parse(incident.analysis);
                if (analysis.classification) {
                    category = analysis.classification.type;
                    priority = analysis.classification.priority;
                }
            }
        } catch (e) {
            console.warn(`Failed to parse analysis for ${incident.id}:`, e.message);
        }

        try {
            const result = await prisma.incident.upsert({
                where: { caseId: incident.id },
                update: {
                    description: incident.description,
                    status: incident.status,
                    analysis: incident.analysis,
                    category: category,
                    priority: priority,
                    // Keep existing additional fields if they were manually updated in DB? 
                    // For migration, we usually want to overwrite or fill missing. 
                    // Upsert will overwrite.
                },
                create: {
                    caseId: incident.id,
                    description: incident.description,
                    status: incident.status,
                    analysis: incident.analysis,
                    category: category,
                    priority: priority,
                    createdAt: incident.createdAt ? new Date(incident.createdAt) : new Date(),
                    updatedAt: incident.updatedAt ? new Date(incident.updatedAt) : new Date(),
                },
            });
            console.log(`✓ Migrated ${incident.id} -> MongoDB ID: ${result.id}`);
        } catch (e) {
            console.error(`✗ Failed to migrate ${incident.id}:`, e.message);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
