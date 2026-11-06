import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      data: {
        user_id: "google-usr-" + Date.now(),
        name: body.name || "Dubai Gold Retailer Partner",
        email: body.email || "partner@dubaigoldjewellers.ae",
        shop_name: "Dubai Gold Souk Atelier",
        status: "active",
        waitlist_position: 1,
        credits: 10
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, detail: "OAuth simulation failed" }, { status: 500 });
  }
}
