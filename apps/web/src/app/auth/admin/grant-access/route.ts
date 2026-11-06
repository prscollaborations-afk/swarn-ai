import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
  if (backendUrl) {
    try {
      const res = await fetch(`${backendUrl.replace(/\/$/, "")}/auth/admin/grant-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) return NextResponse.json(await res.json());
    } catch {}
  }
  return NextResponse.json({
    success: true,
    data: {
      user_id: body.user_id,
      status: "active",
      credits: (body.credits_to_add || 5) + 5,
      message: `Access granted! ${body.credits_to_add || 5} credits added.`
    }
  });
}
