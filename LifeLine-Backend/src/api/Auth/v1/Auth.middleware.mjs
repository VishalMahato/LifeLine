import AuthUtils from './Auth.utils.mjs';
import AuthConstants from './Auth.constants.mjs';
import Auth from './Auth.model.mjs';

/**
 * AuthMiddleware - Authentication middleware for protecting routes
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */
class AuthMiddleware {
    /**
     * Verify JWT token and attach user to request
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static async authenticate(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            let token = AuthUtils.extractTokenFromHeader(authHeader);

            // Fallback to cookie-based auth when Authorization header is absent
            if (!token) {
                token = AuthUtils.extractTokenFromCookie(req.cookies);
            }

            if (!token) {
                const response = AuthUtils.createErrorResponse(
                    AuthConstants.MESSAGES.AUTH.UNAUTHORIZED,
                    null,
                    AuthConstants.HTTP_STATUS.UNAUTHORIZED
                );
                return res.status(response.statusCode).json(response.response);
            }

            // Verify token
            const decoded = AuthUtils.verifyToken(token);

            // Check if user still exists and is not blocked
            const user = await Auth.findById(decoded.userId);
            if (!user || user.isBlocked) {
                const response = AuthUtils.createErrorResponse(
                    AuthConstants.MESSAGES.AUTH.TOKEN_INVALID,
                    null,
                    AuthConstants.HTTP_STATUS.UNAUTHORIZED
                );
                return res.status(response.statusCode).json(response.response);
            }

            // Attach user to request
            req.user = decoded;
            next();
        } catch (error) {
            let message = AuthConstants.MESSAGES.AUTH.TOKEN_INVALID;
            let statusCode = AuthConstants.HTTP_STATUS.UNAUTHORIZED;

            if (error.message === 'Token has expired') {
                message = AuthConstants.MESSAGES.AUTH.TOKEN_EXPIRED;
            }

            const response = AuthUtils.createErrorResponse(message, null, statusCode);
            res.status(response.statusCode).json(response.response);
        }
    }

    /**
     * Check if user has required role
     * @param {string[]} roles - Array of allowed roles
     * @returns {Function} Middleware function
     */
    static authorize(roles = []) {
        return (req, res, next) => {
            if (!req.user) {
                const response = AuthUtils.createErrorResponse(
                    AuthConstants.MESSAGES.AUTH.UNAUTHORIZED,
                    null,
                    AuthConstants.HTTP_STATUS.UNAUTHORIZED
                );
                return res.status(response.statusCode).json(response.response);
            }

            if (roles.length > 0 && !roles.includes(req.user.role)) {
                const response = AuthUtils.createErrorResponse(
                    AuthConstants.MESSAGES.AUTH.UNAUTHORIZED,
                    null,
                    AuthConstants.HTTP_STATUS.FORBIDDEN
                );
                return res.status(response.statusCode).json(response.response);
            }

            next();
        };
    }

    /**
     * Check if user owns the resource or is admin
     * @param {string} resourceUserId - User ID of the resource owner
     * @returns {Function} Middleware function
     */
    static ownsResource(resourceUserId) {
        return (req, res, next) => {
            if (!req.user) {
                const response = AuthUtils.createErrorResponse(
                    AuthConstants.MESSAGES.AUTH.UNAUTHORIZED,
                    null,
                    AuthConstants.HTTP_STATUS.UNAUTHORIZED
                );
                return res.status(response.statusCode).json(response.response);
            }

            // Allow if user owns the resource or is admin/helper
            if (req.user.userId !== resourceUserId &&
                !['admin', 'helper'].includes(req.user.role)) {
                const response = AuthUtils.createErrorResponse(
                    'Access denied. You do not own this resource.',
                    null,
                    AuthConstants.HTTP_STATUS.FORBIDDEN
                );
                return res.status(response.statusCode).json(response.response);
            }

            next();
        };
    }

    /**
     * Optional authentication - doesn't fail if no token
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static optionalAuth(req, res, next) {
        const authHeader = req.headers.authorization;
        let token = AuthUtils.extractTokenFromHeader(authHeader);

        if (!token) {
            token = AuthUtils.extractTokenFromCookie(req.cookies);
        }

        if (token) {
            try {
                const decoded = AuthUtils.verifyToken(token);
                req.user = decoded;
            } catch (error) {
                // Ignore token errors for optional auth
            }
        }

        next();
    }

    /**
     * Rate limiting middleware for auth endpoints
     * @param {Object} options - Rate limiting options
     * @returns {Function} Rate limiting middleware
     */
    static createRateLimit(options) {
        const { windowMs, max, message } = options;
        let requests = new Map();

        return (req, res, next) => {
            const key = req.ip;
            const now = Date.now();
            const windowStart = now - windowMs;

            // Clean old requests
            for (const [ip, timestamps] of requests) {
                requests.set(ip, timestamps.filter(timestamp => timestamp > windowStart));
                if (requests.get(ip).length === 0) {
                    requests.delete(ip);
                }
            }

            // Check current requests
            const userRequests = requests.get(key) || [];
            if (userRequests.length >= max) {
                const response = AuthUtils.createErrorResponse(
                    message || 'Too many requests, please try again later.',
                    { retryAfter: Math.ceil(windowMs / 1000) },
                    AuthConstants.HTTP_STATUS.TOO_MANY_REQUESTS
                );
                return res.status(response.statusCode).json(response.response);
            }

            // Add current request
            userRequests.push(now);
            requests.set(key, userRequests);

            next();
        };
    }

    /**
     * CORS middleware for auth endpoints
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static cors(req, res, next) {
        res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');

        if (req.method === 'OPTIONS') {
            res.sendStatus(200);
        } else {
            next();
        }
    }

    /**
     * Security headers middleware
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static securityHeaders(req, res, next) {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        next();
    }

    /**
     * Request logging middleware
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static logging(req, res, next) {
        const start = Date.now();

        res.on('finish', () => {
            const duration = Date.now() - start;
            console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
        });

        next();
    }
}

export default AuthMiddleware;
