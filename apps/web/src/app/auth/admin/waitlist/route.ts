import { NextResponse } from "next/server";

export async function GET() {
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
  if (backendUrl) {
    try {
      const res = await fetch(`${backendUrl.replace(/\/$/, "")}/auth/admin/waitlist`);
      if (res.ok) {
        return NextResponse.json(await res.json());
      }
    } catch {}
  }
  // Fallback demo retailers for dashboard
  return NextResponse.json({
    success: true,
    data: [
      {
        id: "retailer-01",
        name: "Parth Sharma",
        email: "parthsharma17prs@gmail.com",
        shop_name: "PRS Jewels Jaipur",
        status: "active",
        waitlist_position: 3234,
        credits: 50,
        created_at: 1762140000
      },
      {
        id: "retailer-02",
        name: "Rajesh Soni",
        email: "rajesh@sonijewellers.in",
        shop_name: "Soni Jewellers Delhi",
        status: "waitlisted",
        waitlist_position: 3235,
        credits: 0,
        created_at: 1762140300
      }
    ]
  });
}
