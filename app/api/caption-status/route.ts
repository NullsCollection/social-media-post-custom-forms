import { NextRequest, NextResponse } from "next/server";
import { getCaptionReview, getCompletion, clearCaptionReview } from "@/app/lib/store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const executionId = searchParams.get("executionId");

  if (!executionId) {
    return NextResponse.json({ error: "Missing executionId" }, { status: 400 });
  }

  const completion = getCompletion(executionId);
  if (completion) {
    return NextResponse.json({
      completed: true,
    });
  }

  const caption = getCaptionReview(executionId);
  if (!caption) {
    return NextResponse.json({ pending: true });
  }

  return NextResponse.json({
    pending: false,
    caption: caption.caption,
    executionId: caption.executionId,
    resumeUrl: caption.resumeUrl,
    fileName: caption.fileName,
  });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const executionId = searchParams.get("executionId");
  if (!executionId) {
    return NextResponse.json({ error: "Missing executionId" }, { status: 400 });
  }
  clearCaptionReview(executionId);
  return NextResponse.json({ ok: true });
}
