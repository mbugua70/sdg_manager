import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/constants";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(`${API_BASE_URL}/team/list.php`, {
    headers: {
      Authorization: `Bearer ${session.token}`,
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  return NextResponse.json(Array.isArray(data) ? data : []);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const res = await fetch(`${API_BASE_URL}/team/manage.php`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: formData,
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
    headers: {
      Authorization: `Bearer ${session.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
