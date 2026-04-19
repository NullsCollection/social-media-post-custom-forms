import { NextRequest, NextResponse } from "next/server";
import { storeCompletion } from "@/app/lib/store";
import { verifyBasicAuth } from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  if (!verifyBasicAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { executionId, status } = body;
    if (
      !executionId ||
      typeof executionId !== "string" ||
      executionId.trim() === ""
    ) {
      return NextResponse.json(
        { error: "Missing or invalid executionId" },
        { status: 400 },
      );
    }
    storeCompletion({
      executionId,
      status:
        typeof status === "string" && status.trim() !== "" ? status : "success",
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
