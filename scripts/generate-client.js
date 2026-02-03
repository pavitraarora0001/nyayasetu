require('dotenv').config();
const { execSync } = require('child_process');

console.log('🔄 Running Prisma Generate with loaded environment...');

try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma Client generated successfully.');
} catch (error) {
    console.error('❌ Prisma Generate Failed:', error);
    process.exit(1);
}
