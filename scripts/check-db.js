console.log('Starting script...');

try {
    console.log('Requiring dotenv...');
    const dotenv = require('dotenv');
    console.log('dotenv loaded. Configuring...');
    const result = dotenv.config();
    if (result.error) {
        console.error('dotenv config error:', result.error);
    } else {
        console.log('dotenv config success. DATABASE_URL:', process.env.DATABASE_URL ? 'Defined' : 'Undefined');
    }
} catch (e) {
    console.error('Failed to load dotenv:', e.message);
    process.exit(1);
}

try {
    console.log('Requiring @prisma/client...');
    const { PrismaClient } = require('@prisma/client');
    console.log('PrismaClient required.');

    const prisma = new PrismaClient();
    console.log('PrismaClient instantiated.');

    (async () => {
        console.log('Connecting to database...');
        try {
            await prisma.$connect();
            console.log('Successfully connected to database!');
        } catch (e) {
            console.error('Connection failed:', e.message);
        } finally {
            await prisma.$disconnect();
        }
    })();

} catch (e) {
    console.error('Failed to load/init Prisma:', e.message);
    process.exit(1);
}
