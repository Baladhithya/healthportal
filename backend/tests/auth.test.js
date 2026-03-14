const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ─── Test Config ─────────────────────────────────────────────────────
let server;
const testUser = {
  email: 'testpatient@example.com',
  password: 'TestPass123',
  firstName: 'Test',
  lastName: 'Patient',
  role: 'patient',
  consentGiven: true,
};

const testProvider = {
  email: 'testprovider@example.com',
  password: 'TestPass123',
  firstName: 'Dr.',
  lastName: 'Provider',
  role: 'provider',
  consentGiven: true,
};

beforeAll(async () => {
  // Connect to test DB
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthportal_test';
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Clean up test data
  await User.deleteMany({ email: { $in: [testUser.email, testProvider.email] } });
  await mongoose.connection.close();
});

// ─── Auth Tests ──────────────────────────────────────────────────────
describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a patient', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      expect(res.statusCode).toBe(201);
      expect(res.body.email).toBe(testUser.email);
      expect(res.body.role).toBe('patient');
      expect(res.body.passwordHash).toBeUndefined();
    });

    it('should reject duplicate email', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      expect(res.statusCode).toBe(409);
    });

    it('should reject registration without consent', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'noconsent@test.com', consentGiven: false });
      expect(res.statusCode).toBe(400);
    });

    it('should reject weak passwords', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'weak@test.com', password: '123' });
      expect(res.statusCode).toBe(400);
    });

    it('should register a provider', async () => {
      const res = await request(app).post('/api/auth/register').send(testProvider);
      expect(res.statusCode).toBe(201);
      expect(res.body.role).toBe('provider');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.role).toBe('patient');
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'WrongPass123' });
      expect(res.statusCode).toBe(401);
    });

    it('should reject non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@test.com', password: 'Test1234' });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user info with valid token', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${loginRes.body.accessToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe(testUser.email);
    });

    it('should reject request without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should return new access token', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: loginRes.body.refreshToken });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
    });
  });
});

// ─── RBAC Tests ──────────────────────────────────────────────────────
describe('Role-Based Access Control', () => {
  it('should deny patient access to provider routes', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    const res = await request(app)
      .get('/api/provider/patients')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('should deny provider access to patient routes', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testProvider.email, password: testProvider.password });

    const res = await request(app)
      .get('/api/patient/profile')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`);
    expect(res.statusCode).toBe(403);
  });
});

// ─── Health Check ────────────────────────────────────────────────────
describe('GET /api/health', () => {
  it('should return healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
