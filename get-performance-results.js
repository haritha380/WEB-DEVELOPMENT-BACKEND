const http = require('http');

console.log('🚀 Performance Test - Getting Avg Response Time & Throughput\n');

// Test Configuration
const TEST_CONFIG = {
    virtualUsers: 100,
    rampUpTime: 10, // seconds
    testCredentials: {
        email: 'yohani@gmail.com',
        password: 'yohani123'
    }
};

let results = {
    responseTimes: [],
    successCount: 0,
    errorCount: 0,
    startTime: null,
    endTime: null
};

function makeLoginRequest() {
    return new Promise((resolve) => {
        const requestStart = Date.now();
        
        const postData = JSON.stringify(TEST_CONFIG.testCredentials);
        
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
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                const responseTime = Date.now() - requestStart;
                results.responseTimes.push(responseTime);
                
                if (res.statusCode === 200) {
                    results.successCount++;
                } else {
                    results.errorCount++;
                }
                
                resolve({
                    statusCode: res.statusCode,
                    responseTime: responseTime
                });
            });
        });

        req.on('error', (err) => {
            const responseTime = Date.now() - requestStart;
            results.responseTimes.push(responseTime);
            results.errorCount++;
            
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

async function runPerformanceTest() {
    console.log('📊 Test Configuration:');
    console.log(`   Target: POST /users/login`);
    console.log(`   Virtual Users: ${TEST_CONFIG.virtualUsers}`);
    console.log(`   Ramp-up: ${TEST_CONFIG.rampUpTime} seconds`);
    console.log(`   Credentials: ${TEST_CONFIG.testCredentials.email}\n`);

    results.startTime = Date.now();
    
    // Create requests with ramp-up pattern
    const promises = [];
    const usersPerSecond = TEST_CONFIG.virtualUsers / TEST_CONFIG.rampUpTime;
    
    for (let i = 0; i < TEST_CONFIG.virtualUsers; i++) {
        const delay = (i / usersPerSecond) * 1000;
        
        const promise = new Promise((resolve) => {
            setTimeout(async () => {
                const result = await makeLoginRequest();
                resolve(result);
            }, delay);
        });
        
        promises.push(promise);
    }
    
    console.log('🔥 Running Performance Test...\n');
    
    await Promise.all(promises);
    results.endTime = Date.now();
    
    // Calculate Results
    const totalDuration = (results.endTime - results.startTime) / 1000; // seconds
    const totalRequests = results.responseTimes.length;
    const avgResponseTime = results.responseTimes.reduce((a, b) => a + b, 0) / totalRequests;
    const throughput = totalRequests / totalDuration;
    const errorRate = (results.errorCount / totalRequests) * 100;
    
    // Calculate percentiles
    const sortedTimes = results.responseTimes.sort((a, b) => a - b);
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    const p95ResponseTime = sortedTimes[p95Index];
    const minResponseTime = Math.min(...results.responseTimes);
    const maxResponseTime = Math.max(...results.responseTimes);
    
    console.log('📈 PERFORMANCE TEST RESULTS');
    console.log('=============================\n');
    
    console.log('📊 Summary of Results:');
    console.log(`   Total Requests: ${totalRequests}`);
    console.log(`   Successful Requests: ${results.successCount}`);
    console.log(`   Failed Requests: ${results.errorCount}`);
    console.log(`   Test Duration: ${totalDuration.toFixed(2)} seconds`);
    console.log(`   Error Rate: ${errorRate.toFixed(2)}%\n`);
    
    console.log('⚡ KEY PERFORMANCE METRICS:');
    console.log(`   Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
    console.log(`   Throughput: ${throughput.toFixed(1)} requests/second`);
    console.log(`   Min Response Time: ${minResponseTime}ms`);
    console.log(`   Max Response Time: ${maxResponseTime}ms`);
    console.log(`   95th Percentile: ${p95ResponseTime}ms\n`);
    
    console.log('📋 FOR YOUR PRESENTATION:');
    console.log('===========================');
    console.log('Summary of Results:');
    console.log(`• Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
    console.log(`• Throughput: ${throughput.toFixed(1)} requests/second`);
    console.log(`• 95th Percentile: ${p95ResponseTime}ms`);
    console.log(`• Error Rate: ${errorRate.toFixed(1)}%`);
    console.log(`• Total Test Duration: ${totalDuration.toFixed(1)} seconds\n`);
    
    // Performance Analysis
    console.log('🔍 Performance Analysis:');
    if (avgResponseTime < 200) {
        console.log('   ✅ Excellent response time (<200ms)');
    } else if (avgResponseTime < 500) {
        console.log('   ⚠️  Acceptable response time (200-500ms)');
    } else {
        console.log('   ❌ High response time (>500ms)');
    }
    
    if (throughput > 10) {
        console.log('   ✅ Good throughput (>10 req/sec)');
    } else if (throughput > 5) {
        console.log('   ⚠️  Moderate throughput (5-10 req/sec)');
    } else {
        console.log('   ❌ Low throughput (<5 req/sec)');
    }
    
    console.log('\n✅ Performance test completed successfully!');
}

runPerformanceTest().catch(console.error);
