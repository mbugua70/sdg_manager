import { cookies } from "next/headers";
import { TOKEN_COOKIE_NAME, USER_COOKIE_NAME, ADMIN_USER_ID } from "./constants";

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
  const userRaw = cookieStore.get(USER_COOKIE_NAME)?.value;

  if (!token || !userRaw) return null;

  try {
    const user = JSON.parse(userRaw);
    if (user.id !== ADMIN_USER_ID) return null;
    return { token, user };
  } catch {
    return null;
  }
}

export function getAuthHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}
