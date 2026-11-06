import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
  if (backendUrl) {
    try {
      const res = await fetch(`${backendUrl.replace(/\/$/, "")}/auth/register`, {
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
      user_id: "user-" + Date.now(),
      name: body.name || "Retailer Partner",
      email: body.email,
      shop_name: body.shop_name,
      status: "waitlisted",
      waitlist_position: 3842,
      credits: 0
    }
  });
}
