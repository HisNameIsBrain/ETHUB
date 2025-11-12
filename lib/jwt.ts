import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.PORTAL_JWT_SECRET ?? "";

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}

export function signToken(payload: object, opts?: jwt.SignOptions) {
  return jwt.sign(payload, JWT_SECRET, opts);
}
