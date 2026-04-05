import { NextRequest, NextResponse } from "next/server";
import { storeCompletion } from "@/app/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { executionId, status, platforms, caption } = body;
    if (!executionId) {
      return NextResponse.json({ error: "Missing executionId" }, { status: 400 });
    }
    storeCompletion({
      executionId,
      status: status ?? "success",
      platforms: Array.isArray(platforms) ? platforms : [],
      caption: caption ?? "",
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
