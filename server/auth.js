import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import process from "node:process";

export const SESSION_COOKIE_NAME = "dbn_session";

function getSessionSecret() {
  return process.env.APP_SESSION_SECRET || "change-me-in-production";
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedValue) {
  const [salt, hash] = String(storedValue).split(":");
  if (!salt || !hash) {
    return false;
  }

  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, 64);

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}

export function createSessionToken(payload, expiresInMs = 1000 * 60 * 60 * 24 * 30) {
  const encodedPayload = base64UrlEncode(
    JSON.stringify({
      ...payload,
      exp: Date.now() + expiresInMs,
    }),
  );
  const signature = createHmac("sha256", getSessionSecret())
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token) {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  const expectedSignature = createHmac("sha256", getSessionSecret())
    .update(encodedPayload)
    .digest("base64url");

  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(signature || "");

  if (expectedBuffer.length !== actualBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(expectedBuffer, actualBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (!payload.exp || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function readSessionToken(cookieHeader = "") {
  const cookies = cookieHeader.split(";").map((part) => part.trim());
  const sessionCookie = cookies.find((cookie) => cookie.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (!sessionCookie) {
    return null;
  }

  return decodeURIComponent(sessionCookie.slice(SESSION_COOKIE_NAME.length + 1));
}
