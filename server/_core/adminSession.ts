import crypto from "node:crypto";
import type { Request } from "express";

export const ADMIN_COOKIE = "aj_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "ajwears2026";
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createAdminToken() {
  const payload = Buffer.from(JSON.stringify({ role: "admin", exp: Date.now() + SESSION_TTL_MS })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token?: string | null) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = sign(payload);
  const validSignature = signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!validSignature) return false;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { role?: string; exp?: number };
    return decoded.role === "admin" && typeof decoded.exp === "number" && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

export function getAdminTokenFromRequest(req: Request) {
  const cookie = req.headers.cookie?.split(";").map(value => value.trim()).find(value => value.startsWith(`${ADMIN_COOKIE}=`));
  return cookie?.slice(ADMIN_COOKIE.length + 1);
}

export function isAdminRequest(req: Request) {
  return verifyAdminToken(getAdminTokenFromRequest(req));
}

export function sessionCookieOptions(req: Request) {
  const isPublicHttps = req.headers["x-forwarded-proto"] === "https";
  return {
    httpOnly: true,
    secure: isPublicHttps,
    sameSite: isPublicHttps ? "none" as const : "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_MS,
  };
}
