(async () => {
    const http = require('http');
    
    // Test configuration
    const config = {
        url: 'http://localhost:3000/users/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            email: 'yohani@gmail.com',
            password: 'yohani123'
        },
        numRequests: 100,
        concurrency: 10
    };

    // Create a simple Express server for testing
    const express = require('express');
    const app = express();
    app.use(express.json());

    app.post('/users/login', (req, res) => {
        setTimeout(() => {
            res.json({ success: true });
        }, Math.random() * 100);
    });

    // Start server
    const server = app.listen(3000, () => {
        console.log('Test server started on port 3000');
        runLoadTest();
    });

    // Load test function
    async function runLoadTest() {
        console.log('Starting load test...');
        console.log(`Total requests: ${config.numRequests}`);
        console.log(`Concurrent users: ${config.concurrency}`);
        console.log('-'.repeat(40));

        const results = {
            successful: 0,
            failed: 0,
            totalTime: 0,
            responseTimes: []
        };

        const startTime = Date.now();
        const batches = Math.ceil(config.numRequests / config.concurrency);

        for (let i = 0; i < batches; i++) {
            const batchSize = Math.min(config.concurrency, config.numRequests - i * config.concurrency);
            const promises = [];

            for (let j = 0; j < batchSize; j++) {
                promises.push(new Promise((resolve) => {
                    const reqStart = Date.now();

                    const req = http.request({
                        hostname: 'localhost',
                        port: 3000,
                        path: '/users/login',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }, (res) => {
                        res.on('data', () => {});
                        res.on('end', () => {
                            const responseTime = Date.now() - reqStart;
                            if (res.statusCode === 200) {
                                results.successful++;
                                results.responseTimes.push(responseTime);
                            } else {
                                results.failed++;
                            }
                            resolve();
                        });
                    });

                    req.on('error', () => {
                        results.failed++;
                        resolve();
                    });

                    req.write(JSON.stringify(config.data));
                    req.end();
                }));
            }

            await Promise.all(promises);
            console.log(`Completed batch ${i + 1}/${batches}`);
        }

        const totalTime = (Date.now() - startTime) / 1000;
        const avgResponseTime = results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length;

        console.log('\nLoad Test Results');
        console.log('=================');
        console.log(`Total Requests: ${config.numRequests}`);
        console.log(`Successful: ${results.successful}`);
        console.log(`Failed: ${results.failed}`);
        console.log(`Total Time: ${totalTime.toFixed(2)} seconds`);
        console.log(`Requests/second: ${(config.numRequests/totalTime).toFixed(2)}`);
        
        if (results.responseTimes.length > 0) {
            const sorted = [...results.responseTimes].sort((a, b) => a - b);
            console.log('\nResponse Times (ms):');
            console.log(`Average: ${avgResponseTime.toFixed(2)}`);
            console.log(`Median: ${sorted[Math.floor(sorted.length/2)]}`);
            console.log(`90th percentile: ${sorted[Math.floor(sorted.length * 0.9)]}`);
            console.log(`95th percentile: ${sorted[Math.floor(sorted.length * 0.95)]}`);
            console.log(`99th percentile: ${sorted[Math.floor(sorted.length * 0.99)]}`);
        }

        server.close(() => {
            console.log('\nTest completed and server shut down.');
            process.exit(0);
        });
    }
})();
