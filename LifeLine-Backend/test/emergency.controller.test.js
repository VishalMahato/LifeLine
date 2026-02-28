import { EmergencyController } from '../src/api/Emergency/Emergency.controller.mjs';

const createMockResponse = () => {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  return res;
};

describe('EmergencyController SOS validation', () => {
  test('rejects SOS payload without coordinates', async () => {
    const req = {
      user: { userId: '507f1f77bcf86cd799439011' },
      body: { address: 'Connaught Place, New Delhi' },
    };
    const res = createMockResponse();

    await EmergencyController.triggerSOS(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/coordinates/i);
  });

  test('rejects SOS payload without address', async () => {
    const req = {
      user: { userId: '507f1f77bcf86cd799439011' },
      body: { longitude: 77.209, latitude: 28.6139 },
    };
    const res = createMockResponse();

    await EmergencyController.triggerSOS(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/address/i);
  });

  test('rejects SOS payload with invalid longitude', async () => {
    const req = {
      user: { userId: '507f1f77bcf86cd799439011' },
      body: {
        longitude: 200,
        latitude: 28.6139,
        address: 'Connaught Place, New Delhi',
      },
    };
    const res = createMockResponse();

    await EmergencyController.triggerSOS(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/longitude/i);
  });

  test('rejects SOS payload with invalid latitude', async () => {
    const req = {
      user: { userId: '507f1f77bcf86cd799439011' },
      body: {
        longitude: 77.209,
        latitude: -120,
        address: 'Connaught Place, New Delhi',
      },
    };
    const res = createMockResponse();

    await EmergencyController.triggerSOS(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/latitude/i);
  });
});
