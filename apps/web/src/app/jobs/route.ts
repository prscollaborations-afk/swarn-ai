import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
    if (backendUrl) {
      try {
        const res = await fetch(`${backendUrl.replace(/\/$/, "")}/jobs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        if (res.ok) return NextResponse.json(await res.json());
      } catch (e) {}
    }

    const jobId = "job-" + Date.now();
    return NextResponse.json({
      success: true,
      data: {
        job_id: jobId,
        status: "processing"
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, detail: err.message }, { status: 500 });
  }
}
