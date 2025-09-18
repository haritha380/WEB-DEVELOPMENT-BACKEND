const axios = require('axios');
const { expect } = require('chai');

describe('Security Tests', () => {
  const baseURL = 'http://localhost:3000/api';

  describe('Authentication Security', () => {
    it('should reject login without required fields', async () => {
      try {
        await axios.post(`${baseURL}/users/login`, {});
        throw new Error('Should have failed');
      } catch (err) {
        expect(err.response.status).to.equal(400);
        expect(err.response.data.message).to.include('required');
      }
    });

    it('should reject invalid JWT tokens', async () => {
      try {
        await axios.get(`${baseURL}/users`, {
          headers: { Authorization: 'Bearer invalid-token' }
        });
        throw new Error('Should have failed');
      } catch (err) {
        expect(err.response.status).to.equal(401);
      }
    });

    it('should prevent SQL injection in login', async () => {
      try {
        await axios.post(`${baseURL}/users/login`, {
          email: "' OR '1'='1",
          password: "' OR '1'='1"
        });
        throw new Error('Should have failed');
      } catch (err) {
        expect(err.response.status).to.equal(401);
      }
    });
  });

  describe('Input Validation', () => {
    it('should reject invalid email formats', async () => {
      try {
        await axios.post(`${baseURL}/users`, {
          email: 'invalid-email',
          password: 'password123'
        });
        throw new Error('Should have failed');
      } catch (err) {
        expect(err.response.status).to.equal(400);
      }
    });

    it('should require strong passwords', async () => {
      try {
        await axios.post(`${baseURL}/users`, {
          email: 'test@example.com',
          password: '123'
        });
        throw new Error('Should have failed');
      } catch (err) {
        expect(err.response.status).to.equal(400);
      }
    });
  });
});
