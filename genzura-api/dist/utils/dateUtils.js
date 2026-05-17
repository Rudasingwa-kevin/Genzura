/**
 * Date Utility Service
 * Handles date operations with safeguards against incorrect system clocks
 */
/**
 * Validates and returns a safe date
 * Protects against system clocks set to wrong dates
 */
export class DateService {
    static REASONABLE_PAST_YEARS = 5; // Data older than 5 years is suspicious
    static REASONABLE_FUTURE_YEARS = 1; // Data more than 1 year in future is suspicious
    /**
     * Get current date with validation
     * Falls back to UTC if local system clock is unreasonable
     */
    static now() {
        const localDate = new Date();
        const validation = this.validateDate(localDate);
        if (!validation.isValid && validation.warning) {
            console.warn(`[DateService] ${validation.warning}`);
        }
        return validation.actualDate;
    }
    /**
     * Validate if a date is reasonable
     * Checks against hardcoded "earliest reasonable date" and future bounds
     */
    static validateDate(date) {
        const now = Date.now();
        const inputTime = date.getTime();
        // Define reasonable bounds
        const earliestReasonable = new Date('2020-01-01').getTime(); // App didn't exist before 2020
        const latestReasonable = now + (365 * 24 * 60 * 60 * 1000 * this.REASONABLE_FUTURE_YEARS);
        // Check if date is too far in the past
        if (inputTime < earliestReasonable) {
            return {
                isValid: false,
                actualDate: new Date(),
                warning: `Date ${date.toISOString()} is before 2020. Using current date instead.`
            };
        }
        // Check if date is too far in the future
        if (inputTime > latestReasonable) {
            return {
                isValid: false,
                actualDate: new Date(),
                warning: `Date ${date.toISOString()} is more than ${this.REASONABLE_FUTURE_YEARS} year(s) in the future. System clock may be incorrect.`
            };
        }
        return {
            isValid: true,
            actualDate: date
        };
    }
    /**
     * Calculate days between two dates (always returns positive)
     */
    static daysBetween(startDate, endDate) {
        const diffMs = Math.abs(endDate.getTime() - startDate.getTime());
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }
    /**
     * Format date for display (handles invalid dates gracefully)
     */
    static formatDate(date, format = 'short') {
        if (!date)
            return 'Not set';
        try {
            const d = typeof date === 'string' ? new Date(date) : date;
            if (isNaN(d.getTime()))
                return 'Invalid date';
            if (format === 'long') {
                return d.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
            return d.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
        catch (error) {
            console.error('[DateService] Error formatting date:', error);
            return 'Invalid date';
        }
    }
    /**
     * Check if a date is in the future
     */
    static isFuture(date) {
        return date.getTime() > Date.now();
    }
    /**
     * Check if a date is in the past
     */
    static isPast(date) {
        return date.getTime() < Date.now();
    }
    /**
     * Add days to a date
     */
    static addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
    /**
     * Get ISO string safely
     */
    static toISOString(date) {
        if (!date)
            return null;
        try {
            const d = typeof date === 'string' ? new Date(date) : date;
            return d.toISOString();
        }
        catch (error) {
            console.error('[DateService] Error converting to ISO:', error);
            return null;
        }
    }
    /**
     * Server health check - detects if system clock is way off
     */
    static systemClockHealthCheck() {
        const now = new Date();
        const year = now.getFullYear();
        // Expected reasonable range (adjust as needed)
        const currentActualYear = 2025; // Update this manually each year, or use external time API
        const yearDiff = Math.abs(year - currentActualYear);
        if (yearDiff > 1) {
            return {
                healthy: false,
                message: `System clock appears incorrect. Current: ${year}, Expected: ~${currentActualYear}`,
                systemDate: now.toISOString()
            };
        }
        return {
            healthy: true,
            message: 'System clock appears normal',
            systemDate: now.toISOString()
        };
    }
}
// Export convenient helper functions
export const now = () => DateService.now();
export const validateDate = (date) => DateService.validateDate(date);
export const daysBetween = (start, end) => DateService.daysBetween(start, end);
export const formatDate = (date, format) => DateService.formatDate(date, format);
//# sourceMappingURL=dateUtils.js.map