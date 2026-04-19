import { NextRequest, NextResponse } from "next/server";
import { getCaptionReview } from "@/app/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { executionId, approval } = await req.json();

    if (!executionId) {
      return NextResponse.json({ error: "Missing executionId" }, { status: 400 });
    }

    const entry = getCaptionReview(executionId);
    if (!entry) {
      return NextResponse.json({ error: "No pending caption for this executionId" }, { status: 404 });
    }

    await fetch(entry.resumeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: { approval } }),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
