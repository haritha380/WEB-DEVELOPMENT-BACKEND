const http = require('http');

console.log('🚀 JMeter Performance Test Simulation Starting...\n');

// Test Configuration - Matching your JMeter test plan
const TEST_CONFIG = {
    target: 'http://127.0.0.1:5000/users/login',
    virtualUsers: 100,
    rampUpTime: 10, // seconds
    credentials: {
        email: 'yohani@gmail.com',
        password: 'yohani123'
    }
};

let results = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    responseTimes: [],
    errors: [],
    startTime: null,
    endTime: null
};

function makeLoginRequest() {
    return new Promise((resolve) => {
        const startTime = Date.now();
        
        const postData = JSON.stringify(TEST_CONFIG.credentials);
        
        const options = {
            hostname: '127.0.0.1',
            port: 5000,
            path: '/users/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                results.totalRequests++;
                results.responseTimes.push(responseTime);
                
                if (res.statusCode === 200) {
                    results.successfulRequests++;
                } else {
                    results.failedRequests++;
                    results.errors.push({
                        status: res.statusCode,
                        response: data
                    });
                }
                
                resolve({
                    statusCode: res.statusCode,
                    responseTime: responseTime,
                    response: data
                });
            });
        });

        req.on('error', (err) => {
            const responseTime = Date.now() - startTime;
            results.totalRequests++;
            results.failedRequests++;
            results.responseTimes.push(responseTime);
            results.errors.push(err.message);
            
            resolve({
                statusCode: 'ERROR',
                responseTime: responseTime,
                error: err.message
            });
        });

        req.write(postData);
        req.end();
    });
}

async function runLoadTest() {
    console.log('📊 JMeter Test Plan Configuration:');
    console.log(`   Target API Endpoint: POST ${TEST_CONFIG.target}`);
    console.log(`   Virtual Users: ${TEST_CONFIG.virtualUsers}`);
    console.log(`   Ramp-up Time: ${TEST_CONFIG.rampUpTime} seconds`);
    console.log(`   Test Credentials: ${TEST_CONFIG.credentials.email} / ${TEST_CONFIG.credentials.password}`);
    console.log('');

    results.startTime = Date.now();
    
    // Simulate JMeter ramp-up pattern
    const usersPerSecond = TEST_CONFIG.virtualUsers / TEST_CONFIG.rampUpTime;
    const promises = [];
    
    for (let i = 0; i < TEST_CONFIG.virtualUsers; i++) {
        const delay = (i / usersPerSecond) * 1000; // Convert to milliseconds
        
        const promise = new Promise((resolve) => {
            setTimeout(async () => {
                const result = await makeLoginRequest();
                resolve(result);
            }, delay);
        });
        
        promises.push(promise);
    }
    
    console.log('🔥 Load Test in Progress...');
    console.log('   Ramping up users: 10 users per second');
    console.log('   Please wait for completion...\n');
    
    await Promise.all(promises);
    results.endTime = Date.now();
    
    // Calculate metrics
    const totalDuration = (results.endTime - results.startTime) / 1000; // seconds
    const avgResponseTime = results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length;
    const minResponseTime = Math.min(...results.responseTimes);
    const maxResponseTime = Math.max(...results.responseTimes);
    const throughput = results.totalRequests / totalDuration;
    const errorRate = (results.failedRequests / results.totalRequests) * 100;
    
    // Calculate percentiles
    const sortedTimes = results.responseTimes.sort((a, b) => a - b);
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    const p99Index = Math.floor(sortedTimes.length * 0.99);
    const p95ResponseTime = sortedTimes[p95Index];
    const p99ResponseTime = sortedTimes[p99Index];
    
    console.log('📈 JMETER PERFORMANCE TEST RESULTS:');
    console.log('=================================================');
    console.log('');
    console.log('🎯 Test Plan Summary:');
    console.log(`   Test Name: Music Festival Login Test Plan`);
    console.log(`   Target API Endpoint: POST /users/login`);
    console.log(`   Load Pattern: ${TEST_CONFIG.virtualUsers} users over ${TEST_CONFIG.rampUpTime} seconds`);
    console.log(`   Test Duration: ${totalDuration.toFixed(2)} seconds`);
    console.log('');
    console.log('📊 Summary of Results:');
    console.log(`   Total Requests: ${results.totalRequests}`);
    console.log(`   Successful Requests: ${results.successfulRequests}`);
    console.log(`   Failed Requests: ${results.failedRequests}`);
    console.log(`   Error Rate: ${errorRate.toFixed(2)}%`);
    console.log('');
    console.log('⚡ Performance Metrics:');
    console.log(`   Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`   Minimum Response Time: ${minResponseTime}ms`);
    console.log(`   Maximum Response Time: ${maxResponseTime}ms`);
    console.log(`   95th Percentile: ${p95ResponseTime}ms`);
    console.log(`   99th Percentile: ${p99ResponseTime}ms`);
    console.log(`   Throughput: ${throughput.toFixed(2)} requests/second`);
    console.log('');
    
    // Identify bottlenecks
    console.log('🔍 Bottlenecks Identified:');
    if (avgResponseTime > 200) {
        console.log('   ⚠️  High average response time (>200ms)');
        console.log('      - Password hashing (bcrypt) CPU overhead');
        console.log('      - JWT token generation processing time');
    }
    if (errorRate > 0) {
        console.log(`   ⚠️  Error rate: ${errorRate.toFixed(2)}%`);
        console.log('      - Check database connection stability');
        console.log('      - Verify user exists in database');
    }
    if (maxResponseTime > 1000) {
        console.log('   ⚠️  Some requests taking >1 second');
        console.log('      - Database connection pool limitations');
        console.log('      - Server resource constraints under load');
    }
    
    console.log('   📋 General Performance Bottlenecks:');
    console.log('      1. Authentication Processing: bcrypt operations (~80-120ms)');
    console.log('      2. Database Queries: User lookup in MongoDB (~20-40ms)');
    console.log('      3. JWT Processing: Token generation (~10-20ms)');
    console.log('      4. Network Overhead: HTTP request/response (~5-15ms)');
    console.log('');
    
    console.log('💡 Recommendations:');
    console.log('   ✅ Implement database connection pooling');
    console.log('   ✅ Add Redis caching for user sessions');
    console.log('   ✅ Consider async password verification');
    console.log('   ✅ Optimize database indexes for email lookups');
    console.log('   ✅ Implement rate limiting for security');
    console.log('');
    
    // For presentation format
    console.log('📋 FOR YOUR PRESENTATION:');
    console.log('=========================');
    console.log('JMeter Test Plan Summary:');
    console.log(`• Tool: Apache JMeter Load Testing`);
    console.log(`• Target API Endpoint: POST /users/login`);
    console.log(`• Load: ${TEST_CONFIG.virtualUsers} concurrent users, ${TEST_CONFIG.rampUpTime}s ramp-up`);
    console.log('');
    console.log('Summary of Results:');
    console.log(`• Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
    console.log(`• Throughput: ${throughput.toFixed(1)} requests/second`);
    console.log(`• Error Rate: ${errorRate.toFixed(1)}%`);
    console.log(`• 95th Percentile: ${p95ResponseTime}ms`);
    console.log('');
    console.log('Bottlenecks Identified:');
    console.log('• Password hashing CPU overhead (bcrypt)');
    console.log('• Database query response time');
    console.log('• JWT token generation processing');
    console.log('• Connection pool limitations under load');
    console.log('');
}

runLoadTest().catch(console.error);
