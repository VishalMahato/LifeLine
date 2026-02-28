import AuthMiddleware from '../src/api/Auth/v1/Auth.middleware.mjs';
import AuthUtils from '../src/api/Auth/v1/Auth.utils.mjs';
import Auth from '../src/api/Auth/v1/Auth.model.mjs';
import { jest } from '@jest/globals';

describe('AuthMiddleware cookie token fallback', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('authenticates using token from cookies when Authorization header is missing', async () => {
    const req = {
      headers: {},
      cookies: { token: 'cookie-token' },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    jest.spyOn(AuthUtils, 'extractTokenFromHeader').mockReturnValue(null);
    jest.spyOn(AuthUtils, 'extractTokenFromCookie').mockReturnValue('cookie-token');
    jest.spyOn(AuthUtils, 'verifyToken').mockReturnValue({
      userId: '507f1f77bcf86cd799439011',
      role: 'user',
    });
    jest.spyOn(Auth, 'findById').mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      isBlocked: false,
    });

    await AuthMiddleware.authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual({
      userId: '507f1f77bcf86cd799439011',
      role: 'user',
    });
    expect(res.status).not.toHaveBeenCalled();
  });
});
