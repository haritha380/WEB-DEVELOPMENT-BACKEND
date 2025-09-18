const axios = require('axios');

// Configuration
const BASE_URL = 'http://127.0.0.1:5000';
const TEST_USER = {
    name: 'API Test User',
    email: `test${Date.now()}@example.com`,
    password: 'testpassword123',
    nic: '123456789V',
    country: 'Sri Lanka',
    gender: 'Male',
    language: 'English'
};

let authToken = null;
const testResults = [];

function logTest(testName, status, message, details = {}) {
    const result = { testName, status, message, details, timestamp: new Date().toISOString() };
    testResults.push(result);
    
    const statusIcon = status === 'PASSED' ? '✅' : '❌';
    console.log(`${statusIcon} ${testName}`);
    console.log(`   ${message}`);
    if (details.status) console.log(`   Status: ${details.status}`);
    if (details.responseTime) console.log(`   Response Time: ${details.responseTime}ms`);
    console.log('');
}

async function runAPITests() {
    console.log('🚀 API Test Suite Starting...');
    console.log(`Target: ${BASE_URL}`);
    console.log('='.repeat(60));
    console.log('');

    // Test 1: Create User (Registration)
    try {
        console.log('📝 Test 1: POST /api/users (Create User)');
        const startTime = Date.now();
        
        const response = await axios.post(`${BASE_URL}/users`, TEST_USER);
        const responseTime = Date.now() - startTime;
        
        if ([200, 201].includes(response.status) && response.data.user) {
            logTest(
                'User Registration',
                'PASSED',
                'User created successfully',
                { 
                    status: response.status, 
                    responseTime,
                    userId: response.data.user._id,
                    email: response.data.user.email
                }
            );
            
            // Store token for future tests
            if (response.data.token) {
                authToken = response.data.token;
            }
        } else {
            throw new Error(`Unexpected response: ${response.status}`);
        }
    } catch (error) {
        logTest(
            'User Registration',
            'FAILED',
            error.response ? 
                `Server error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}` :
                `Network error: ${error.message}`,
            { error: error.response?.data || error.message }
        );
    }

    // Test 2: User Login
    try {
        console.log('📝 Test 2: POST /api/users/login (User Login)');
        const startTime = Date.now();
        
        const loginData = {
            email: TEST_USER.email,
            password: TEST_USER.password
        };
        
        const response = await axios.post(`${BASE_URL}/users/login`, loginData);
        const responseTime = Date.now() - startTime;
        
        if (response.status === 200 && response.data.success && response.data.token) {
            authToken = response.data.token;
            logTest(
                'User Login',
                'PASSED',
                'Login successful',
                { 
                    status: response.status, 
                    responseTime,
                    hasToken: !!response.data.token,
                    success: response.data.success
                }
            );
        } else {
            throw new Error(`Login failed: ${response.status}`);
        }
    } catch (error) {
        logTest(
            'User Login',
            'FAILED',
            error.response ? 
                `Login error: ${error.response.status} - ${error.response.data.message || 'Invalid credentials'}` :
                `Network error: ${error.message}`,
            { error: error.response?.data || error.message }
        );
    }

    // Test 3: Get All Users
    try {
        console.log('📝 Test 3: GET /api/users (Get All Users)');
        const startTime = Date.now();
        
        const response = await axios.get(`${BASE_URL}/users`);
        const responseTime = Date.now() - startTime;
        
        if (response.status === 200 && response.data.success && Array.isArray(response.data.users)) {
            logTest(
                'Get All Users',
                'PASSED',
                'Users retrieved successfully',
                { 
                    status: response.status, 
                    responseTime,
                    userCount: response.data.users.length,
                    success: response.data.success
                }
            );
        } else {
            throw new Error(`Unexpected response: ${response.status}`);
        }
    } catch (error) {
        logTest(
            'Get All Users',
            'FAILED',
            error.response ? 
                `Server error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}` :
                `Network error: ${error.message}`,
            { error: error.response?.data || error.message }
        );
    }

    // Test 4: Get User by ID (if we have auth token)
    if (authToken) {
        try {
            console.log('📝 Test 4: GET /api/users (Authenticated Request)');
            const startTime = Date.now();
            
            const response = await axios.get(`${BASE_URL}/users`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            const responseTime = Date.now() - startTime;
            
            logTest(
                'Authenticated Request',
                'PASSED',
                'Authenticated request successful',
                { 
                    status: response.status, 
                    responseTime,
                    authenticated: true
                }
            );
        } catch (error) {
            logTest(
                'Authenticated Request',
                'FAILED',
                error.response ? 
                    `Auth error: ${error.response.status} - ${error.response.data.message || 'Auth failed'}` :
                    `Network error: ${error.message}`,
                { error: error.response?.data || error.message }
            );
        }
    }

    // Print Summary
    console.log('='.repeat(60));
    console.log('📊 API TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    const passed = testResults.filter(r => r.status === 'PASSED').length;
    const failed = testResults.filter(r => r.status === 'FAILED').length;
    const total = testResults.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed === 0) {
        console.log('🎉 All API tests passed!');
    } else {
        console.log('⚠️ Some tests failed. Check the details above.');
    }
    
    console.log('\nTest Details:');
    testResults.forEach((result, index) => {
        const status = result.status === 'PASSED' ? '✅' : '❌';
        console.log(`${index + 1}. ${status} ${result.testName} - ${result.message}`);
    });
}

// Run the tests
console.log('Starting API tests...');
console.log('Make sure your backend server is running on port 3000!');
console.log('');

runAPITests().catch(error => {
    console.error('❌ Test suite failed to run:', error.message);
    console.log('Make sure your backend server is running!');
});
