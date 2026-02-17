import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL, ADMIN_USER_ID, TOKEN_COOKIE_NAME, USER_COOKIE_NAME } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${API_BASE_URL}/auth/login.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok || data.message !== "Successful login.") {
      return NextResponse.json(
        { error: data.message || "Invalid credentials" },
        { status: 401 }
      );
    }

    if (data.player?.id !== ADMIN_USER_ID) {
      return NextResponse.json(
        { error: "Access denied. Only administrators can sign in." },
        { status: 403 }
      );
    }

    const response = NextResponse.json({
      message: "Login successful",
      user: data.player,
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    };

    response.cookies.set(TOKEN_COOKIE_NAME, data.token, cookieOptions);
    response.cookies.set(
      USER_COOKIE_NAME,
      JSON.stringify(data.player),
      cookieOptions
    );

    return response;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
