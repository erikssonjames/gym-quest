import { RateLimiterMemory } from 'rate-limiter-flexible';

export const emailLimiter = new RateLimiterMemory({
  points: 5, // Allow 5 requests
  duration: 60, // per 60 seconds per email
});

export const workoutAiMinuteLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60,
  blockDuration: 120,
});

export const workoutAiDailyLimiter = new RateLimiterMemory({
  points: 100,
  duration: 60 * 60 * 24,
});
