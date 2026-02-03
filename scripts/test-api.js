const fetch = require('node-fetch');

async function testAnalyzeAPI() {
    try {
        console.log('🧪 Testing /api/analyze endpoint...\n');

        const response = await fetch('http://localhost:3000/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                description: 'Someone snatched my phone near the bus stop',
                userType: 'public',
                location: 'Bus Stop, Main Street'
            })
        });

        console.log('Response Status:', response.status);
        console.log('Response Headers:', response.headers.raw());

        const text = await response.text();
        console.log('\nRaw Response (first 500 chars):');
        console.log(text.substring(0, 500));

        try {
            const data = JSON.parse(text);
            console.log('\n✅ Parsed JSON Response:');
            console.log(JSON.stringify(data, null, 2));

            if (data.id) {
                console.log('\n✅ Incident saved with ID:', data.id);
            }
        } catch (e) {
            console.error('\n❌ Failed to parse JSON:', e.message);
            console.log('\nFull response:');
            console.log(text);
        }
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testAnalyzeAPI();
