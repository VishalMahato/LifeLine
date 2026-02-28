import request from 'supertest';
import app from '../src/server.mjs';

describe('Complete API Validation Tests', () => {
  test('POST /api/auth/v1/create/user/auth validates required fields', async () => {
    const response = await request(app).post('/api/auth/v1/create/user/auth').send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('GET /api/auth/v1/check-email with invalid email returns validation error', async () => {
    const response = await request(app).get('/api/auth/v1/check-email/not-an-email');

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('POST /api/auth/signup-step1 validates required fields', async () => {
    const response = await request(app).post('/api/auth/signup-step1').send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('POST /api/auth/login validates required fields', async () => {
    const response = await request(app).post('/api/auth/login').send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('GET /api/auth/v1/signup/medical/:authId validates auth ID format', async () => {
    const response = await request(app).get('/api/auth/v1/signup/medical/not-a-valid-id');

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('GET /api/auth/check-email with invalid email returns validation error', async () => {
    const response = await request(app).get('/api/auth/check-email/not-an-email');

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('POST /api/users validates required fields', async () => {
    const response = await request(app).post('/api/users').send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('POST /api/helpers validates required fields', async () => {
    const response = await request(app).post('/api/helpers').send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('POST /api/medical rejects unauthenticated requests', async () => {
    const response = await request(app).post('/api/medical').send({});

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test('POST /api/medical/create rejects unauthenticated requests', async () => {
    const response = await request(app).post('/api/medical/create').send({});

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test('POST /api/locations validates required fields', async () => {
    const response = await request(app).post('/api/locations').send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
