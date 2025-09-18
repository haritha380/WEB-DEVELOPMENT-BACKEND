console.log('🚀 Starting quick API test...');

const http = require('http');

const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/users',
    method: 'GET'
};

console.log('📡 Testing connection to backend server...');

const req = http.request(options, (res) => {
    console.log(`✅ Connected! Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('📄 Response:', data);
        console.log('🏁 Test completed successfully!');
    });
});

req.on('error', (err) => {
    console.error('❌ Connection failed:', err.message);
});

req.setTimeout(5000, () => {
    console.log('⏰ Request timed out');
    req.destroy();
});

req.end();
