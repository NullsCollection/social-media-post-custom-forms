import { NextRequest } from "next/server";
import { timingSafeEqual } from "crypto";

function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export function verifyBasicAuth(req: NextRequest): boolean {
  const header = req.headers.get("authorization") ?? "";
  if (!header.startsWith("Basic ")) return false;

  const decoded = Buffer.from(header.slice(6), "base64").toString("utf-8");
  const [user, ...rest] = decoded.split(":");
  const pass = rest.join(":");

  return (
    safeCompare(user, process.env.BASIC_AUTH_USER ?? "") &&
    safeCompare(pass, process.env.BASIC_AUTH_PASS ?? "")
  );
}
