const isProduction = process.env.NODE_ENV === "production";

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set and at least 32 characters long");
  }
  return secret;
};

export const getSessionSecret = () => {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters long");
  }
  return secret;
};

export const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict",
  maxAge: 24 * 60 * 60 * 1000,
  path: "/"
};

export const clearAuthCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict",
  path: "/"
};

export const validateAuthEnvironment = () => {
  getJwtSecret();
  getSessionSecret();

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be set");
  }
};