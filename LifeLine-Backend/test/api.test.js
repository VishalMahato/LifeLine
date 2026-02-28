import request from 'supertest';
import app from '../src/server.mjs';

describe('API Smoke Tests', () => {
  test('GET /health returns service status payload', async () => {
    const response = await request(app).get('/health');

    expect(response.statusCode).toBe(200);
    expect(['ok', 'degraded']).toContain(response.body.status);
    expect(response.body.message).toBe('LifeLine Backend is running');
    expect(response.body).toHaveProperty('database');
  });

  test('Unknown routes return 404 payload', async () => {
    const response = await request(app).get('/route-that-does-not-exist');

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: 'Route not found',
    });
  });

  test.each([
    ['get', '/api/auth/profile'],
    ['get', '/api/auth/v1/profile'],
    ['post', '/api/auth/change-password'],
    ['get', '/api/users/profile/me'],
    ['get', '/api/helpers/profile/me'],
    ['get', '/api/medical/profile/me'],
    ['post', '/api/medical/create'],
    ['post', '/api/medical/v1/create'],
    ['get', '/api/locations/user/me/locations'],
    ['get', '/api/locations/user/me/stats'],
    ['post', '/api/locations/current'],
    ['get', '/api/emergency/user/me'],
    ['get', '/api/emergency/v1/user/me'],
    ['post', '/api/emergency/sos'],
    ['post', '/api/emergency/v1/sos'],
  ])('Protected endpoint %s %s rejects missing token', async (method, endpoint) => {
    const response = await request(app)[method](endpoint);

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(String(response.body.message).toLowerCase()).toMatch(/authorized|unauthorized/);
  });
});
