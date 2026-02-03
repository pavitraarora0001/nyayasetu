require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('🔄 Attempting to connect to MongoDB...');
        await prisma.$connect();
        console.log('✅ Connection Successful!');

        // List databases or just confirm connection
        const count = await prisma.incident.count();
        console.log(`📊 Current Incident Count: ${count}`);

        console.log('🚀 Database is ready for production.');
    } catch (error) {
        console.error('❌ Connection Failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
