const windowMs = 15 * 60 * 1000;
const maxAttempts = 10;
const attempts = new Map();

const cleanup = (now) => {
  for (const [key, entry] of attempts) {
    if (entry.resetAt <= now) {
      attempts.delete(key);
    }
  }
};

export const authRateLimit = (req, res, next) => {
  const now = Date.now();
  cleanup(now);

  const key = req.ip;
  const entry = attempts.get(key) || { count: 0, resetAt: now + windowMs };
  entry.count += 1;
  attempts.set(key, entry);

  if (entry.count > maxAttempts) {
    return res.status(429).json({
      success: false,
      message: "Too many authentication attempts. Please try again later."
    });
  }

  next();
};