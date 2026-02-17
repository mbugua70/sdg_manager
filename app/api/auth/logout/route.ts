import { NextResponse } from "next/server";
import { TOKEN_COOKIE_NAME, USER_COOKIE_NAME } from "@/lib/constants";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.set(TOKEN_COOKIE_NAME, "", { maxAge: 0, path: "/" });
  response.cookies.set(USER_COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return response;
}
