console.log('🔧 Testing server connectivity and creating user...\n');

const http = require('http');

// Test 1: Check if server is responding
console.log('📡 Testing server connectivity...');

const testReq = http.get('http://127.0.0.1:5000', (res) => {
    console.log(`✅ Server responding with status: ${res.statusCode}`);
    
    // Test 2: Create user
    createUser();
}).on('error', (err) => {
    console.log('❌ Server connection failed:', err.message);
});

function createUser() {
    console.log('\n🔧 Creating user yohani@gmail.com...');
    
    const userData = JSON.stringify({
        name: "Yohani",
        email: "yohani@gmail.com", 
        password: "yohani123",
        nic: "123456789V",
        country: "Belgium",
        gender: "Female",
        language: "English"
    });
    
    const options = {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/users',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(userData)
        }
    };
    
    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`📊 CREATE USER - Status: ${res.statusCode}`);
            console.log(`📄 Response: ${data}`);
            
            // Test login after creation
            setTimeout(() => testLogin(), 1000);
        });
    });
    
    req.on('error', (err) => {
        console.log('❌ Create user error:', err.message);
    });
    
    req.write(userData);
    req.end();
}

function testLogin() {
    console.log('\n🔐 Testing login...');
    
    const loginData = JSON.stringify({
        email: "yohani@gmail.com",
        password: "yohani123"
    });
    
    const options = {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/users/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(loginData)
        }
    };
    
    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`📊 LOGIN TEST - Status: ${res.statusCode}`);
            console.log(`📄 Response: ${data}`);
            
            if (res.statusCode === 200) {
                console.log('\n✅ SUCCESS! User created and login works!');
                console.log('🎯 Your JMeter test should now work with 0% error rate.');
            } else {
                console.log('\n❌ Login failed. Check the response above.');
            }
        });
    });
    
    req.on('error', (err) => {
        console.log('❌ Login error:', err.message);
    });
    
    req.write(loginData);
    req.end();
}
