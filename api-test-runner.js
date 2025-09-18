const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    results: []
};

async function runTest(testName, testFunction) {
    testResults.total++;
    try {
        await testFunction();
        testResults.passed++;
        testResults.results.push({ test: testName, status: 'PASSED', message: 'Test completed successfully' });
        console.log(`✅ ${testName} - PASSED`);
    } catch (error) {
        testResults.failed++;
        testResults.results.push({ test: testName, status: 'FAILED', message: error.message });
        console.log(`❌ ${testName} - FAILED: ${error.message}`);
    }
}

async function runAPITests() {
    console.log('🚀 Starting API Tests\n');
    console.log('Target Server:', BASE_URL);
    console.log('='.repeat(50));

    // Test 1: Get All Users
    await runTest('GET /Users/ - Retrieve all users', async () => {
        const response = await axios.get(`${BASE_URL}/Users/`);
        
        // Check status code
        if (response.status !== 200) {
            throw new Error(`Expected status 200, got ${response.status}`);
        }
        
        // Check if response has users property
        if (!response.data.hasOwnProperty('users')) {
            throw new Error('Response does not contain "users" property');
        }
        
        console.log(`   Status: ${response.status}`);
        console.log(`   Users found: ${response.data.users ? response.data.users.length : 0}`);
    });

    // Test 2: Create User
    await runTest('POST /Users/ - Create new user', async () => {
        const userData = {
            email: "apitest@example.com",
            password: "testpassword123",
            name: "API Test User"
        };
        
        const response = await axios.post(`${BASE_URL}/Users/`, userData);
        
        // Check status code (200 or 201)
        if (![200, 201].includes(response.status)) {
            throw new Error(`Expected status 200 or 201, got ${response.status}`);
        }
        
        // Check if response has user property
        if (!response.data.hasOwnProperty('user')) {
            throw new Error('Response does not contain "user" property');
        }
        
        console.log(`   Status: ${response.status}`);
        console.log(`   User created: ${response.data.user ? response.data.user.email : 'Unknown'}`);
    });

    // Test 3: Login User
    await runTest('POST /Users/login - User login', async () => {
        const loginData = {
            email: "apitest@example.com",
            password: "testpassword123"
        };
        
        const response = await axios.post(`${BASE_URL}/Users/login`, loginData);
        
        // Check status code
        if (![200, 201].includes(response.status)) {
            throw new Error(`Expected status 200 or 201, got ${response.status}`);
        }
        
        console.log(`   Status: ${response.status}`);
        console.log(`   Login successful: ${response.data.success ? 'Yes' : 'No'}`);
    });

    // Print Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 API TEST RESULTS SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    
    console.log('\nDetailed Results:');
    testResults.results.forEach((result, index) => {
        const status = result.status === 'PASSED' ? '✅' : '❌';
        console.log(`${index + 1}. ${status} ${result.test}`);
        if (result.status === 'FAILED') {
            console.log(`   Error: ${result.message}`);
        }
    });
}

// Run the tests
runAPITests().catch(error => {
    console.error('❌ Test suite failed to run:', error.message);
});
