/**
 * Auth Module Index - Exports all authentication components
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */

// Core Components
export { default as AuthConstants } from './Auth.constants.mjs';
export { default as AuthValidator } from './Auth.validator.mjs';
export { default as AuthUtils } from './Auth.utils.mjs';
export { default as AuthService } from './Auth.service.mjs';
export { default as AuthController } from './Auth.controller.mjs';
export { default as AuthModel } from './Auth.model.mjs';
export { default as AuthRoutes } from './Auth.routes.mjs';
export { default as AuthMiddleware } from './Auth.middleware.mjs';
export { default as AuthTest } from './Auth.test.mjs';

// Convenience exports for common use cases
export const authRoutes = (await import('./Auth.routes.mjs')).default;
export const authMiddleware = (await import('./Auth.middleware.mjs')).default;