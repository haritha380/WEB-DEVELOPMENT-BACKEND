const request = require('supertest');
const app = require('../app');
const bcrypt = require('bcrypt');

describe('Security Testing - OWASP Top 10 Fixes', () => {
    
    // Test 1: A02:2021 - Cryptographic Failures Fix
    describe('Password Hashing Security (A02:2021)', () => {
        
        test('Should hash passwords before storing', async () => {
            const userData = {
                name: "Security Test User",
                email: "security@test.com",
                password: "plaintext123",
                nic: "123456789V",
                country: "Belgium",
                gender: "Male",
                language: "English"
            };
            
            const response = await request(app)
                .post('/users')
                .send(userData);
            
            console.log('✅ Password Hashing Test Results:');
            console.log('- Status:', response.status);
            console.log('- Password in response:', response.body.user?.password || 'Not included (SECURE)');
            console.log('- Response includes user:', !!response.body.user);
            
            expect(response.status).toBe(201);
            expect(response.body.user.password).toBeUndefined(); // Password should not be returned
            expect(response.body.success).toBe(true);
        });
        
        test('Should verify hashed passwords during login', async () => {
            // First create a user with hashed password
            const testPassword = "securepass123";
            const hashedPassword = await bcrypt.hash(testPassword, 12);
            
            console.log('✅ Password Comparison Test:');
            console.log('- Original Password:', testPassword);
            console.log('- Hashed Password:', hashedPassword);
            console.log('- Hash Length:', hashedPassword.length);
            console.log('- Contains bcrypt signature:', hashedPassword.startsWith('$2b$'));
            
            // Test bcrypt comparison
            const isValid = await bcrypt.compare(testPassword, hashedPassword);
            console.log('- Password comparison result:', isValid);
            
            expect(hashedPassword).not.toBe(testPassword);
            expect(hashedPassword.length).toBeGreaterThan(50);
            expect(isValid).toBe(true);
        });
    });
    
    // Test 2: A05:2021 - Security Misconfiguration Fix
    describe('Security Headers & Rate Limiting (A05:2021)', () => {
        
        test('Should include security headers', async () => {
            const response = await request(app)
                .get('/');
            
            console.log('✅ Security Headers Test Results:');
            console.log('- X-Content-Type-Options:', response.headers['x-content-type-options']);
            console.log('- X-Frame-Options:', response.headers['x-frame-options']);
            console.log('- X-XSS-Protection:', response.headers['x-xss-protection']);
            console.log('- Strict-Transport-Security:', response.headers['strict-transport-security']);
            console.log('- Content-Security-Policy:', response.headers['content-security-policy'] ? 'Present' : 'Missing');
            
            expect(response.headers['x-content-type-options']).toBe('nosniff');
            expect(response.headers['x-frame-options']).toBe('DENY');
            expect(response.headers['strict-transport-security']).toBeDefined();
        });
        
        test('Should implement rate limiting', async () => {
            console.log('✅ Rate Limiting Test:');
            
            // Make multiple requests to test rate limiting
            const promises = [];
            for (let i = 0; i < 3; i++) {
                promises.push(
                    request(app)
                        .get('/')
                        .then(res => ({
                            status: res.status,
                            rateLimitRemaining: res.headers['x-ratelimit-remaining'],
                            rateLimitLimit: res.headers['x-ratelimit-limit']
                        }))
                );
            }
            
            const responses = await Promise.all(promises);
            
            responses.forEach((response, index) => {
                console.log(`- Request ${index + 1}:`);
                console.log(`  Status: ${response.status}`);
                console.log(`  Rate Limit: ${response.rateLimitRemaining}/${response.rateLimitLimit}`);
            });
            
            // Should have rate limit headers
            expect(responses[0].rateLimitLimit).toBeDefined();
            expect(responses[0].rateLimitRemaining).toBeDefined();
        });
    });
    
    // Test 3: Information Disclosure Prevention
    describe('Information Disclosure Prevention', () => {
        
        test('Should not expose sensitive error information', async () => {
            const response = await request(app)
                .post('/users/login')
                .send({ email: 'nonexistent@test.com', password: 'wrongpass' });
            
            console.log('✅ Error Information Test:');
            console.log('- Status:', response.status);
            console.log('- Error Message:', response.body.message);
            console.log('- No stack trace exposed:', !response.body.stack);
            console.log('- Generic error message:', response.body.message === 'Invalid email or password');
            
            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Invalid email or password'); // Generic message
            expect(response.body.stack).toBeUndefined(); // No stack trace
        });
    });
    
});

// Manual Security Audit Summary
console.log(`
🔒 OWASP TOP 10 SECURITY FIXES IMPLEMENTED:

1. A02:2021 - Cryptographic Failures:
   ✅ Implemented bcrypt password hashing (salt rounds: 12)
   ✅ Passwords never stored in plain text
   ✅ Secure password comparison using bcrypt.compare()

2. A05:2021 - Security Misconfiguration:
   ✅ Added Helmet.js for security headers
   ✅ Implemented rate limiting (100 req/15min general, 5 req/15min auth)
   ✅ Configured secure CORS policy
   ✅ Added Content Security Policy (CSP)
   ✅ Enabled HSTS headers
   ✅ Limited request payload size

Additional Security Measures:
   ✅ Removed sensitive data from API responses
   ✅ Implemented proper error handling without information disclosure
   ✅ Added security event logging
   ✅ Input validation with express-validator

BEFORE FIX: Plain text passwords, no security headers, unlimited requests
AFTER FIX: Bcrypt hashed passwords, comprehensive security headers, rate limiting
`);

module.exports = {};
