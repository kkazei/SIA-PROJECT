import jwt from "jsonwebtoken";
import { authCookieOptions, getJwtSecret } from "../config/auth.js";

export const generateTokenAndSetCookie = (res, user) => {
  const token = jwt.sign(
    { sub: user._id.toString() },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || "24h", algorithm: "HS256" }
  );

  res.cookie("jwt", token, authCookieOptions);
  return token;
};