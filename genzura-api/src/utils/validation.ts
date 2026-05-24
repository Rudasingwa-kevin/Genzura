/**
 * Validation utilities for user input
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Email validation with comprehensive checks
 */
export class EmailValidator {
  // Common disposable email domains to block
  private static readonly DISPOSABLE_DOMAINS = [
    'tempmail.com', 'throwaway.email', 'guerrillamail.com', 'mailinator.com',
    '10minutemail.com', 'trashmail.com', 'yopmail.com', 'maildrop.cc'
  ];

  // Valid TLDs for email
  private static readonly VALID_TLDS = [
    'com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'co', 'io', 'ai',
    'law', 'legal', 'biz', 'info', 'us', 'uk', 'ca', 'au', 'de', 'fr', 'rw'
  ];

  /**
   * Validate email format
   */
  static isValidFormat(email: string): boolean {
    // RFC 5322 compliant regex (simplified)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  }

  /**
   * Check if email domain is disposable
   */
  static isDisposable(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase();
    return this.DISPOSABLE_DOMAINS.some(d => domain?.includes(d));
  }

  /**
   * Validate email TLD
   */
  static hasValidTLD(email: string): boolean {
    const tld = email.split('.').pop()?.toLowerCase();
    return tld ? this.VALID_TLDS.includes(tld) : false;
  }

  /**
   * Check if email looks professional (has company domain)
   */
  static looksProfessional(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase();
    const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
    return domain ? !freeDomains.includes(domain) : false;
  }

  /**
   * Comprehensive email validation
   */
  static validate(email: string, options: { allowFreeEmail?: boolean } = {}): { valid: boolean; error?: string; warnings?: string[] } {
    const warnings: string[] = [];

    // Trim and lowercase
    email = email.trim().toLowerCase();

    // Check basic format
    if (!this.isValidFormat(email)) {
      return { valid: false, error: 'Invalid email format' };
    }

    // Check length
    if (email.length > 254) {
      return { valid: false, error: 'Email address is too long' };
    }

    // Check for disposable email
    if (this.isDisposable(email)) {
      return { valid: false, error: 'Disposable email addresses are not allowed' };
    }

    // Check TLD
    if (!this.hasValidTLD(email)) {
      return { valid: false, error: 'Email domain has an invalid top-level domain' };
    }

    // Warn about free email if professional email is preferred
    if (!options.allowFreeEmail && !this.looksProfessional(email)) {
      warnings.push('Consider using your professional email address');
    }

    return { valid: true, warnings: warnings.length > 0 ? warnings : undefined };
  }
}

/**
 * Password validation with strength checking
 */
export class PasswordValidator {
  /**
   * Check password strength
   */
  static checkStrength(password: string): {
    score: number; // 0-4
    feedback: string[];
    isStrong: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters');
      return { score: 0, feedback, isStrong: false };
    }
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Complexity checks
    if (/[a-z]/.test(password)) score++;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Add uppercase letters');

    if (/\d/.test(password)) score++;
    else feedback.push('Add numbers');

    if (/[^a-zA-Z0-9]/.test(password)) score++;
    else feedback.push('Add special characters (!@#$%^&*)');

    // Common patterns to avoid
    const commonPatterns = [
      /^password/i,
      /^123456/,
      /^qwerty/i,
      /^admin/i,
      /^letmein/i,
      /(.)\1{2,}/, // repeated characters (aaa, 111)
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        feedback.push('Avoid common patterns and repeated characters');
        score = Math.max(0, score - 1);
        break;
      }
    }

    // Normalize score to 0-4
    const normalizedScore = Math.min(4, Math.floor(score / 1.5));
    const isStrong = normalizedScore >= 3 && feedback.length === 0;

    return { score: normalizedScore, feedback, isStrong };
  }

  /**
   * Validate password meets minimum requirements
   */
  static validate(password: string, minLength = 8): { valid: boolean; error?: string; strength?: any } {
    if (!password) {
      return { valid: false, error: 'Password is required' };
    }

    if (password.length < minLength) {
      return { valid: false, error: `Password must be at least ${minLength} characters` };
    }

    const strength = this.checkStrength(password);

    if (!strength.isStrong) {
      return {
        valid: false,
        error: 'Password is too weak',
        strength
      };
    }

    return { valid: true, strength };
  }
}

/**
 * Input sanitization
 */
export class Sanitizer {
  /**
   * Sanitize user name
   */
  static sanitizeName(name: string): string {
    return name
      .trim()
      .replace(/[^a-zA-Z\s'-]/g, '') // Only allow letters, spaces, hyphens, apostrophes
      .replace(/\s+/g, ' '); // Collapse multiple spaces
  }

  /**
   * Sanitize email
   */
  static sanitizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  /**
   * Validate and sanitize phone number
   */
  static sanitizePhone(phone: string): string | null {
    const cleaned = phone.replace(/\D/g, ''); // Remove non-digits
    if (cleaned.length < 10) return null;
    return cleaned;
  }
}

/**
 * Rate limiting helper (simple in-memory implementation)
 */
export class RateLimiter {
  private static attempts: Map<string, { count: number; resetAt: number }> = new Map();

  /**
   * Check if request should be rate limited
   */
  static shouldLimit(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now > record.resetAt) {
      this.attempts.set(key, { count: 1, resetAt: now + windowMs });
      return false;
    }

    record.count++;
    if (record.count > maxAttempts) {
      return true;
    }

    return false;
  }

  /**
   * Clear rate limit for a key
   */
  static clear(key: string): void {
    this.attempts.delete(key);
  }
}
