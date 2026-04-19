import { NextRequest } from "next/server";

export function verifyBasicAuth(req: NextRequest): boolean {
  const header = req.headers.get("authorization") ?? "";
  if (!header.startsWith("Basic ")) return false;

  const decoded = Buffer.from(header.slice(6), "base64").toString("utf-8");
  const [user, ...rest] = decoded.split(":");
  const pass = rest.join(":");

  return (
    user === process.env.BASIC_AUTH_USER &&
    pass === process.env.BASIC_AUTH_PASS
  );
}
