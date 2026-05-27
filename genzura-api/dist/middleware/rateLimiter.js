import rateLimit from 'express-rate-limit';
/**
 * General API rate limiter
 * Prevents abuse by limiting requests per IP
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Skip rate limiting for successful requests in development
    skip: (req) => process.env.NODE_ENV === 'development' && req.path.startsWith('/api/test')
});
/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks on login
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Only 5 failed login attempts per 15 minutes
    message: {
        error: 'Too many login attempts from this IP, please try again after 15 minutes.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Only count failed login attempts
    skipSuccessfulRequests: true
});
/**
 * Strict rate limiter for password reset endpoints
 * Prevents abuse of password reset functionality
 */
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Only 3 password reset requests per hour
    message: {
        error: 'Too many password reset attempts. Please try again after 1 hour.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false
});
/**
 * Moderate rate limiter for invitation endpoints
 * Prevents spam invitations
 */
export const invitationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 invitations per hour
    message: {
        error: 'Too many invitation requests. Please try again later.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false
});
/**
 * Strict rate limiter for file upload endpoints
 * Prevents storage abuse
 */
export const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // 30 uploads per 15 minutes
    message: {
        error: 'Too many file uploads. Please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});
//# sourceMappingURL=rateLimiter.js.map