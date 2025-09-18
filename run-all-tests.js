const { execSync } = require('child_process');
const fs = require('fs');

console.log('Starting Comprehensive Test Suite\n');

// 1. Run Unit Tests
console.log('Running Unit Tests...');
try {
    execSync('npm test', { stdio: 'inherit' });
    console.log('✅ Unit Tests Completed\n');
} catch (error) {
    console.error('❌ Unit Tests Failed\n');
}

// 2. Run Security Tests
console.log('Running Security Tests...');
try {
    execSync('mocha security-test.js', { stdio: 'inherit' });
    console.log('✅ Security Tests Completed\n');
} catch (error) {
    console.error('❌ Security Tests Failed\n');
}

// 3. Run Load Test
console.log('Running Load Tests...');
try {
    execSync('node http-load-test.js', { stdio: 'inherit' });
    console.log('✅ Load Tests Completed\n');
} catch (error) {
    console.error('❌ Load Tests Failed\n');
}

console.log('All tests completed. Check individual reports for details.');
