import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const caption = formData.get("caption") as string;
    const images = formData.getAll("images") as File[];

    const validImages = images.filter((f) => f && f.size > 0);

    if (!validImages.length) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 },
      );
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
    forwardData.append("caption", caption || "");
    forwardData.append(
      "filenames",
      JSON.stringify(validImages.map((f) => f.name)),
    );
    forwardData.append("image_count", String(validImages.length));
    forwardData.append("submitted_at", new Date().toISOString());

    const auth = Buffer.from(
      `${process.env.BASIC_AUTH_USER}:${process.env.BASIC_AUTH_PASS}`,
    ).toString("base64");

    console.log("Sending to webhook:", process.env.WEBHOOK_URL);
    console.log("Auth user:", process.env.BASIC_AUTH_USER);
    console.log("Auth configured:", !!process.env.BASIC_AUTH_PASS);

    const webhookRes = await fetch(process.env.WEBHOOK_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
      },
      body: forwardData,
    });

    console.log("Webhook response status:", webhookRes.status);
    const responseText = await webhookRes.text();
    console.log("Webhook response:", responseText);

    if (!webhookRes.ok) {
      return NextResponse.json(
        { error: "Webhook failed", details: responseText },
        { status: 502 },
      );
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
