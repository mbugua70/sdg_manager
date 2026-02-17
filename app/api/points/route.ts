import { NextRequest, NextResponse } from "next/server";
import { getSession, getAuthHeaders } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const gameId = request.nextUrl.searchParams.get("game_id");
  if (!gameId) return NextResponse.json({ error: "game_id required" }, { status: 400 });

  const res = await fetch(`${API_BASE_URL}/games/filter.php?game_id=${encodeURIComponent(gameId)}`, {
    headers: getAuthHeaders(session.token),
  });
  const data = await res.json();
  return NextResponse.json(Array.isArray(data) ? data : []);
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const res = await fetch(`${API_BASE_URL}/points/manage.php`, {
    method: "PATCH",
    headers: getAuthHeaders(session.token),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
