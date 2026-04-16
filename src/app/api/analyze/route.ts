import { NextResponse } from "next/server";

const PYTHON_BRIDGE_URL = process.env.PYTHON_BRIDGE_URL || "http://127.0.0.1:5001/analyze";

export async function POST(req: Request) {
  try {
    const { input, imageBase64, mimeType } = await req.json();

    if (!input || typeof input !== "string" || !input.trim()) {
      return NextResponse.json({ error: "No input provided" }, { status: 400 });
    }

    // Forward request to the persistent Python model server
    let bridgeResponse: Response;
    try {
      console.log('Attempting to connect to AI Engine at:', PYTHON_BRIDGE_URL);
      const body = JSON.stringify({ input, imageBase64, mimeType });

      bridgeResponse = await fetch(PYTHON_BRIDGE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
        signal: AbortSignal.timeout(30_000),
      });
    } catch (fetchError: any) {
      console.error("CRITICAL: AI Bridge connection failed!");
      console.error("Target URL:", PYTHON_BRIDGE_URL);
      console.error("Error Message:", fetchError.message);
      return NextResponse.json(
        {
          error:
            "The AI Engine is currently starting up (Cold Start). Please wait 30 seconds and try again.",
        },
        { status: 503 }
      );
    }

    const data = await bridgeResponse.json();
    console.log('✅ Bridge responded with status:', bridgeResponse.status);

    if (!bridgeResponse.ok || data.error) {
      console.error("AI Space Error:", data.error || data);
      return NextResponse.json(
        { error: data.error || "Analysis failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
