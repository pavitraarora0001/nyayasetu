require('dotenv').config();
const { execSync } = require('child_process');

console.log('🔄 Checking environment variables...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');

console.log('\n🔄 Running Prisma Generate...');

try {
    execSync('npx prisma generate', {
        stdio: 'inherit',
        env: { ...process.env }
    });
    console.log('\n✅ Prisma Client generated successfully.');
} catch (error) {
    console.error('\n❌ Prisma Generate Failed:', error.message);
    process.exit(1);
}
