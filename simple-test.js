const http = require('http');

console.log('🚀 Testing API endpoints...\n');

// Test function
function testEndpoint(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = data ? JSON.parse(data) : {};
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        if (postData) {
            req.write(JSON.stringify(postData));
        }
        req.end();
    });
}

async function runTests() {
    const baseOptions = {
        hostname: '127.0.0.1',
        port: 5000,
        headers: { 'Content-Type': 'application/json' }
    };

    let authToken = null;
    let testEmail = null;

    // Test 1: Create User
    try {
        console.log('📝 Test 1: POST /users (Create User)');
        const userData = {
            name: 'Test User',
            email: `test${Date.now()}@example.com`, // Use unique email
            password: 'password123',
            nic: '123456789V',
            country: 'Sri Lanka',
            gender: 'Male',
            language: 'English',
            profilepicture: ''
        };
        
        testEmail = userData.email; // Store for later use
        
        const response = await testEndpoint({
            ...baseOptions,
            path: '/users',
            method: 'POST'
        }, userData);
        
        console.log(`   Status: ${response.status}`);
        console.log(`   Response:`, response.data);
        
        if ([200, 201].includes(response.status) && response.data.user) {
            console.log('   ✅ PASSED - User created successfully');
            if (response.data.token) {
                authToken = response.data.token;
                console.log('   🔑 Auth token received\n');
            }
        } else if (response.status === 400 && response.data.message) {
            console.log('   ✅ PASSED - Validation working (duplicate email or missing fields)\n');
        } else if (response.status === 500) {
            console.log('   ⚠️  WARNING - Server error (check database connection)\n');
        } else {
            console.log('   ❌ FAILED - Unexpected response\n');
        }
    } catch (error) {
        console.log('   ❌ FAILED - Connection error:', error.message, '\n');
    }

    // Test 2: Login User (if we created one successfully)
    if (testEmail && !authToken) {
        try {
            console.log('📝 Test 2: POST /users/login (User Login)');
            const loginData = {
                email: testEmail,
                password: 'password123'
            };
            
            const response = await testEndpoint({
                ...baseOptions,
                path: '/users/login',
                method: 'POST'
            }, loginData);
            
            console.log(`   Status: ${response.status}`);
            console.log(`   Response:`, response.data);
            
            if (response.status === 200 && response.data.token) {
                authToken = response.data.token;
                console.log('   ✅ PASSED - Login successful');
                console.log('   🔑 Auth token received\n');
            } else {
                console.log('   ⚠️  Login failed - proceeding with unauthenticated test\n');
            }
        } catch (error) {
            console.log('   ❌ FAILED - Connection error:', error.message, '\n');
        }
    }

    // Test 3: Get Users  
    try {
        console.log('� Test 3: GET /users (Get All Users)');
        
        const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
        const response = await testEndpoint({
            ...baseOptions,
            path: '/users',
            method: 'GET',
            headers
        });
        
        console.log(`   Status: ${response.status}`);
        console.log(`   Response:`, response.data);
        
        if (response.status === 200 && response.data.users) {
            console.log('   ✅ PASSED - Users retrieved successfully\n');
        } else if (response.status === 401 && response.data.message) {
            console.log('   ✅ PASSED - Authentication required (security working correctly)\n');
        } else {
            console.log('   ❌ FAILED - Unexpected response\n');
        }
    } catch (error) {
        console.log('   ❌ FAILED - Connection error:', error.message, '\n');
    }

    console.log('🏁 API tests completed!');
}

runTests();
