import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (email && email.trim().toLowerCase() === "admin@aabhushan.ai" && password === "AabhushanAdmin@2026!") {
      return NextResponse.json({
        success: true,
        data: {
          admin_id: "admin-super-01",
          email: "admin@aabhushan.ai",
          role: "super_admin",
          token: "aabhushan_admin_session_token_xyz987"
        }
      });
    }
    return NextResponse.json({ success: false, detail: "Invalid admin credentials" }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ success: false, detail: "Login error" }, { status: 500 });
  }
}
