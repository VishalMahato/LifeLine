import bcrypt from 'bcryptjs';
import AuthUtils from '../src/api/Auth/v1/Auth.utils.mjs';
import AuthConstants from '../src/api/Auth/v1/Auth.constants.mjs';

describe('AuthUtils password hashing compatibility', () => {
  test('hashPassword creates an argon2 hash that verifies', async () => {
    const password = 'StrongPass123';
    const hash = await AuthUtils.hashPassword(password);

    expect(AuthUtils.isArgon2Hash(hash)).toBe(true);
    await expect(AuthUtils.comparePassword(password, hash)).resolves.toBe(true);
  });

  test('comparePassword supports existing bcrypt hashes', async () => {
    const password = 'LegacyPass123';
    const legacyHash = await bcrypt.hash(password, 10);

    expect(AuthUtils.isLegacyBcryptHash(legacyHash)).toBe(true);
    await expect(AuthUtils.comparePassword(password, legacyHash)).resolves.toBe(true);
  });

  test('needsPasswordRehash detects legacy bcrypt hashes only', async () => {
    const password = 'NeedsRehash123';
    const legacyHash = await bcrypt.hash(password, 10);
    const argonHash = await AuthUtils.hashPassword(password);

    expect(AuthUtils.needsPasswordRehash(legacyHash)).toBe(true);
    expect(AuthUtils.needsPasswordRehash(argonHash)).toBe(false);
  });

  test('extractTokenFromCookie reads token cookie when present', () => {
    expect(AuthUtils.extractTokenFromCookie({ token: 'cookie-token' })).toBe('cookie-token');
  });

  test('extractTokenFromCookie returns null when token cookie is missing', () => {
    expect(AuthUtils.extractTokenFromCookie({})).toBeNull();
    expect(AuthUtils.extractTokenFromCookie(undefined)).toBeNull();
  });

  test('createErrorResponse maps database-unavailable errors to service unavailable', () => {
    const result = AuthUtils.createErrorResponse(
      'Failed to create auth record: Database is unavailable. Please start MongoDB and try again.',
    );

    expect(result.statusCode).toBe(AuthConstants.HTTP_STATUS.SERVICE_UNAVAILABLE);
    expect(result.response.success).toBe(false);
  });

  test('createErrorResponse keeps default bad-request status for validation errors', () => {
    const result = AuthUtils.createErrorResponse('Email is required');

    expect(result.statusCode).toBe(AuthConstants.HTTP_STATUS.BAD_REQUEST);
    expect(result.response.success).toBe(false);
  });
});
