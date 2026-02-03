require('dotenv').config();

console.log('Testing .env loading...');
if (process.env.DATABASE_URL) {
    console.log('✅ DATABASE_URL found:', process.env.DATABASE_URL.substring(0, 20) + '...');
} else {
    console.error('❌ DATABASE_URL NOT found');
}
