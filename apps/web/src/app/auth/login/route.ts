import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;
    
    // SuperAdmin bypass directly on web
    if (email && email.trim().toLowerCase() === "admin@aabhushan.ai" && password === "AabhushanAdmin@2026!") {
      return NextResponse.json({
        success: true,
        data: {
          user_id: "admin-super-01",
          name: "Super Admin",
          email: "admin@aabhushan.ai",
          status: "active",
          role: "super_admin",
          credits: 9999,
          redirect: "/manage-portal-2026-secure"
        }
      });
    }

    // Attempt proxy to backend if NEXT_PUBLIC_API_URL or BACKEND_URL configured
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${backendUrl.replace(/\/$/, "")}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    // If backend isn't reached, allow verified retailer mock / admin fallback
    return NextResponse.json({
      success: false,
      detail: "Invalid credentials or backend service unreachable."
    }, { status: 401 });
  }
}
