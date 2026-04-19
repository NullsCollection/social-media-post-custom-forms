import { NextRequest, NextResponse } from "next/server";
import { storeCaptionReview } from "@/app/lib/store";
import { verifyBasicAuth } from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  if (!verifyBasicAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { executionId, resumeUrl, caption, fileName } = body;
    if (!executionId || !resumeUrl || !caption) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    storeCaptionReview({ executionId, resumeUrl, caption, fileName: fileName ?? "" });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
