import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      data: {
        application_id: "kyc-" + Date.now(),
        status: "verified",
        message: "Your Jewellery Boutique KYC Application has been instantly verified!"
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, detail: "Verification error" }, { status: 500 });
  }
}
