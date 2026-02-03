const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Prisma setup...\n');

// Check schema file
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
console.log('Schema file exists:', fs.existsSync(schemaPath) ? '✅' : '❌');

// Check .env file
const envPath = path.join(__dirname, '..', '.env');
console.log('.env file exists:', fs.existsSync(envPath) ? '✅' : '❌');

// Load environment
require('dotenv').config({ path: envPath });
console.log('DATABASE_URL set:', process.env.DATABASE_URL ? '✅' : '❌');

// Check generated client
const generatedPath = path.join(__dirname, '..', 'node_modules', '.prisma', 'client');
console.log('Generated client exists:', fs.existsSync(generatedPath) ? '✅' : '❌');

console.log('\n🔄 Running prisma generate...\n');

try {
    const output = execSync('npx prisma generate', {
        cwd: path.join(__dirname, '..'),
        env: process.env,
        encoding: 'utf8'
    });
    console.log(output);
    console.log('\n✅ Prisma generate completed successfully!');

    // Check again
    console.log('\nGenerated client now exists:', fs.existsSync(generatedPath) ? '✅' : '❌');
} catch (error) {
    console.error('\n❌ Prisma generate failed!');
    console.error('Error:', error.message);
    if (error.stdout) console.log('\nStdout:', error.stdout);
    if (error.stderr) console.error('\nStderr:', error.stderr);
    process.exit(1);
}
