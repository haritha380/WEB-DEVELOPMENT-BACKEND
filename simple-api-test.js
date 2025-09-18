const http = require('http');

function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = data ? JSON.parse(data) : {};
                    resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data, headers: res.headers });
                }
            });
        });
        
        req.on('error', reject);
        
        if (postData) {
            req.write(JSON.stringify(postData));
        }
        req.end();
    });
}

async function runAPITests() {
    console.log('🚀 API Test Suite Starting...\n');
    
    const baseOptions = {
        hostname: 'localhost',
        port: 5000,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    let passed = 0;
    let failed = 0;

    // Test 1: GET Users
    try {
        console.log('📝 Test 1: GET /Users/');
        const response = await makeRequest({
            ...baseOptions,
            path: '/Users/',
            method: 'GET'
        });
        
        console.log(`   Status: ${response.status}`);
        
        if (response.status === 200 && response.data.users) {
            console.log('   ✅ PASSED - Status 200 and has users array');
            passed++;
        } else {
            console.log('   ❌ FAILED - Expected status 200 with users array');
            failed++;
        }
    } catch (error) {
        console.log('   ❌ FAILED - Connection error:', error.message);
        failed++;
    }

    // Test 2: POST User
    try {
        console.log('\n📝 Test 2: POST /Users/');
        const userData = {
            email: "test@example.com",
            password: "123456"
        };
        
        const response = await makeRequest({
            ...baseOptions,
            path: '/Users/',
            method: 'POST'
        }, userData);
        
        console.log(`   Status: ${response.status}`);
        
        if ([200, 201].includes(response.status) && response.data.user) {
            console.log('   ✅ PASSED - Status 200/201 and has user object');
            passed++;
        } else {
            console.log('   ❌ FAILED - Expected status 200/201 with user object');
            failed++;
        }
    } catch (error) {
        console.log('   ❌ FAILED - Connection error:', error.message);
        failed++;
    }

    // Summary
    console.log('\n' + '='.repeat(40));
    console.log('📊 API TEST RESULTS');
    console.log('='.repeat(40));
    console.log(`Tests Run: ${passed + failed}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${passed + failed > 0 ? ((passed / (passed + failed)) * 100).toFixed(1) : 0}%`);
    
    if (failed === 0) {
        console.log('🎉 All tests passed!');
    } else {
        console.log('⚠️ Some tests failed. Check server connection.');
    }
}

runAPITests();
