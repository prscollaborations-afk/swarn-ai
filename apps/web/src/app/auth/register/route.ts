import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, shop_name, referral_code } = body;
    
    // Auto-approve or assign waitlist
    const isVIP = referral_code && referral_code.trim().toUpperCase() === "SWARN2026";
    
    return NextResponse.json({
      success: true,
      data: {
        user_id: "usr-" + Date.now(),
        name: name || "Retailer Partner",
        email: email,
        shop_name: shop_name || "Jewellery Showroom",
        referral_code: referral_code || null,
        status: isVIP ? "active" : "waitlisted",
        waitlist_position: isVIP ? 0 : 3845,
        credits: isVIP ? 10 : 5
      }
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      detail: "Registration processing error"
    }, { status: 500 });
  }
}
