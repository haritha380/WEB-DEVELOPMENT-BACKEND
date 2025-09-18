const http = require('http');

console.log('🔧 Creating user yohani@gmail.com in database...\n');

// User data
const userData = {
    name: "Yohani",
    email: "yohani@gmail.com",
    password: "yohani123",
    nic: "123456789V",
    country: "Belgium",
    gender: "Female",
    language: "English"
};

const postData = JSON.stringify(userData);

const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/users',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('📡 Creating user...');

const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log(`✅ User creation response: ${res.statusCode}`);
        console.log(`📄 Response data: ${data}\n`);
        
        if (res.statusCode === 201 || res.statusCode === 200) {
            console.log('✅ User created successfully!');
            
            // Now test login
            console.log('🔐 Testing login...');
            
            const loginData = {
                email: "yohani@gmail.com",
                password: "yohani123"
            };
            
            const loginPostData = JSON.stringify(loginData);
            
            const loginOptions = {
                hostname: '127.0.0.1',
                port: 5000,
                path: '/users/login',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(loginPostData)
                }
            };
            
            const loginReq = http.request(loginOptions, (loginRes) => {
                let loginData = '';
                
                loginRes.on('data', (chunk) => {
                    loginData += chunk;
                });
                
                loginRes.on('end', () => {
                    console.log(`🔐 Login response: ${loginRes.statusCode}`);
                    console.log(`📄 Login data: ${loginData}`);
                    
                    if (loginRes.statusCode === 200) {
                        console.log('✅ Login successful! JMeter test should now work.');
                    } else {
                        console.log('❌ Login failed. Check the response above.');
                    }
                });
            });
            
            loginReq.on('error', (err) => {
                console.error('❌ Login request error:', err.message);
            });
            
            loginReq.write(loginPostData);
            loginReq.end();
            
        } else {
            console.log('❌ User creation failed. Check the response above.');
        }
    });
});

req.on('error', (err) => {
    console.error('❌ User creation error:', err.message);
});

req.write(postData);
req.end();
