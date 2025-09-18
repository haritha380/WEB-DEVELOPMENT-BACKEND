const http = require('http');
const { performance } = require('perf_hooks');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/users/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const payload = JSON.stringify({
  email: 'test@example.com',
  password: 'testpassword123'
});

const TOTAL_REQUESTS = 100;
const CONCURRENT_USERS = 10;
let completed = 0;
let successful = 0;
let failed = 0;
const responseTimes = [];

function makeRequest() {
  const startTime = performance.now();
  
  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      const endTime = performance.now();
      responseTimes.push(endTime - startTime);
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        successful++;
      } else {
        failed++;
      }
      
      completed++;
      
      if (completed === TOTAL_REQUESTS) {
        printResults();
      }
    });
  });
  
  req.on('error', (error) => {
    failed++;
    completed++;
    console.error('Request failed:', error);
    
    if (completed === TOTAL_REQUESTS) {
      printResults();
    }
  });
  
  req.write(payload);
  req.end();
}

function printResults() {
  const totalTime = Math.max(...responseTimes) - Math.min(...responseTimes);
  const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  
  console.log('\nLoad Test Results:');
  console.log('=================');
  console.log(`Total Requests: ${TOTAL_REQUESTS}`);
  console.log(`Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(`Successful Requests: ${successful}`);
  console.log(`Failed Requests: ${failed}`);
  console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`Total Test Duration: ${totalTime.toFixed(2)}ms`);
  console.log(`Requests Per Second: ${(TOTAL_REQUESTS / (totalTime / 1000)).toFixed(2)}`);
}

console.log(`Starting load test with ${TOTAL_REQUESTS} total requests and ${CONCURRENT_USERS} concurrent users...`);

// Start concurrent requests
for (let i = 0; i < TOTAL_REQUESTS; i++) {
  setTimeout(makeRequest, Math.floor(i / CONCURRENT_USERS) * 100);
}
