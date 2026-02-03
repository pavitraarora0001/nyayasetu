const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function debug() {
    console.log('--- Prisma Diagnostic ---');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded (starts with ' + process.env.DATABASE_URL.substring(0, 10) + ')' : 'MISSING');

    const prisma = new PrismaClient();

    try {
        console.log('Attempting connection...');
        await prisma.$connect();
        console.log('✅ Connection successful!');

        const models = Object.keys(prisma).filter(k => !k.startsWith('$'));
        console.log('Available models:', models);

    } catch (err) {
        console.error('❌ Connection failed:');
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

debug();
