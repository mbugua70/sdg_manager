import { NextRequest, NextResponse } from "next/server";
import { getSession, getAuthHeaders } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/constants";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(`${API_BASE_URL}/team/list.php`, {
    headers: getAuthHeaders(session.token),
  });
  const data = await res.json();
  return NextResponse.json(Array.isArray(data) ? data : []);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const res = await fetch(`${API_BASE_URL}/team/manage.php`, {
    method: "POST",
    headers: getAuthHeaders(session.token),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const res = await fetch(`${API_BASE_URL}/team/manage.php`, {
    method: "PATCH",
    headers: getAuthHeaders(session.token),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const res = await fetch(`${API_BASE_URL}/team/manage.php`, {
    method: "DELETE",
    headers: getAuthHeaders(session.token),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
