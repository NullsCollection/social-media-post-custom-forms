import { NextRequest, NextResponse } from "next/server";
import { storeCompletion } from "@/app/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[post-complete] Received from n8n:", JSON.stringify(body, null, 2));
    const { executionId, status } = body;
    if (!executionId) {
      return NextResponse.json({ error: "Missing executionId" }, { status: 400 });
    }
    storeCompletion({
      executionId,
      status: status ?? "success",
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
