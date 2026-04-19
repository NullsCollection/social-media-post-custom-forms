import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const executionId = formData.get("executionId") as string;
    const caption = formData.get("caption") as string;
    const mode = formData.get("mode") as string;
    const videoUrl = formData.get("videoUrl") as string;
    const platforms = formData.getAll("platforms[]") as string[];
    const images = formData.getAll("images") as File[];

    const ALLOWED_MODES = ["manual", "ai", "video"];
    if (!ALLOWED_MODES.includes(mode)) {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    const ALLOWED_PLATFORMS = ["facebook", "instagram", "twitter", "linkedin"];
    const validPlatforms = platforms.filter((p) => ALLOWED_PLATFORMS.includes(p));
    if (!validPlatforms.length) {
      return NextResponse.json({ error: "At least one valid platform is required" }, { status: 400 });
    }

    const validImages = images.filter((f) => f && f.size > 0);

    if (mode !== "video" && !validImages.length) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 },
      );
    }

    if (mode === "video") {
      if (!videoUrl || !videoUrl.trim()) {
        return NextResponse.json({ error: "videoUrl is required in video mode" }, { status: 400 });
      }
      let parsed: URL;
      try {
        parsed = new URL(videoUrl);
      } catch {
        return NextResponse.json({ error: "Invalid videoUrl" }, { status: 400 });
      }
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        return NextResponse.json({ error: "videoUrl must use http or https" }, { status: 400 });
      }
      if (videoUrl.length > 2048) {
        return NextResponse.json({ error: "videoUrl is too long" }, { status: 400 });
      }
    }

    if (!process.env.WEBHOOK_URL) {
      return NextResponse.json(
        { error: "Webhook URL not configured" },
        { status: 500 },
      );
    }

    const forwardData = new FormData();
    validImages.forEach((image) =>
      forwardData.append("images", image, image.name),
    );
    forwardData.append("executionId", executionId || "");
    forwardData.append("caption", caption || "");
    forwardData.append("mode", mode || "manual");
    forwardData.append("videoUrl", videoUrl || "");
    validPlatforms.forEach((platform) =>
      forwardData.append("platforms[]", platform),
    );
    forwardData.append(
      "filenames",
      JSON.stringify(validImages.map((f) => f.name)),
    );
    forwardData.append("image_count", String(validImages.length));
    forwardData.append("submitted_at", new Date().toISOString());

    const auth = Buffer.from(
      `${process.env.BASIC_AUTH_USER}:${process.env.BASIC_AUTH_PASS}`,
    ).toString("base64");

    const webhookRes = await fetch(process.env.WEBHOOK_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
      },
      body: forwardData,
    });

    if (!webhookRes.ok) {
      const responseText = await webhookRes.text();
      console.error(`[submit] Webhook failed — status: ${webhookRes.status}, body: ${responseText}`);
      return NextResponse.json({ error: "Webhook failed" }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
