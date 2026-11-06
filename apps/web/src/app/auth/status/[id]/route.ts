import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
  if (backendUrl) {
    try {
      const res = await fetch(`${backendUrl.replace(/\/$/, "")}/auth/status/${params.id}`);
      if (res.ok) return NextResponse.json(await res.json());
    } catch {}
  }
  return NextResponse.json({
    success: true,
    data: {
      user_id: params.id,
      status: "active",
      credits: 5
    }
  });
}
