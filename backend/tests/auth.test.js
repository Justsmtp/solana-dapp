// tests/auth.test.js
const request = require('supertest');
const app = require('../src/server');
const mongoose = require('mongoose');
const User = require('../src/models/User');

describe('Authentication Endpoints', () => {
  
  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/solana-dapp-test');
    }
  });

  afterAll(async () => {
    // Clean up and close connection
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/auth/nonce/:walletAddress', () => {
    it('should generate nonce for new wallet', async () => {
      const walletAddress = 'TestWallet123456789';
      
      const res = await request(app)
        .get(`/api/auth/nonce/${walletAddress}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('nonce');
      expect(res.body.data.nonce).toBeTruthy();
    });

    it('should generate new nonce for existing wallet', async () => {
      const walletAddress = 'TestWallet123456789';
      
      // First request
      const res1 = await request(app)
        .get(`/api/auth/nonce/${walletAddress}`);
      
      const firstNonce = res1.body.data.nonce;

      // Second request
      const res2 = await request(app)
        .get(`/api/auth/nonce/${walletAddress}`)
        .expect(200);

      expect(res2.body.data.nonce).toBeTruthy();
      expect(res2.body.data.nonce).not.toBe(firstNonce);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Server is running');
      expect(res.body).toHaveProperty('uptime');
    });
  });

  describe('GET /', () => {
    it('should return welcome message', async () => {
      const res = await request(app)
        .get('/')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Welcome to Solana dApp API');
      expect(res.body).toHaveProperty('endpoints');
    });
  });
});

describe('Protected Routes', () => {
  it('should deny access without token', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('authentication token');
  });
});