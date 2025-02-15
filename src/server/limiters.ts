import { RateLimiterMemory } from 'rate-limiter-flexible';

export const emailLimiter = new RateLimiterMemory({
  points: 5, // Allow 5 requests
  duration: 60, // per 60 seconds per email
});
