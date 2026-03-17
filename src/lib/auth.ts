const KEY_ID_TOKEN = "marka_id_token";
const KEY_REFRESH_TOKEN = "marka_refresh_token";

const COGNITO_DOMAIN = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY_ID_TOKEN);
}

export function saveTokens(idToken: string, refreshToken: string): void {
  localStorage.setItem(KEY_ID_TOKEN, idToken);
  localStorage.setItem(KEY_REFRESH_TOKEN, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(KEY_ID_TOKEN);
  localStorage.removeItem(KEY_REFRESH_TOKEN);
}

export function getSubFromToken(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return (decoded.sub as string) ?? null;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Date.now() / 1000 > payload.exp - 60;
  } catch {
    return true;
  }
}

async function refreshTokens(): Promise<string | null> {
  const refreshToken = localStorage.getItem(KEY_REFRESH_TOKEN);
  if (!refreshToken) return null;

  try {
    const res = await fetch(`https://${COGNITO_DOMAIN}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: CLIENT_ID,
        refresh_token: refreshToken,
      }).toString(),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const newIdToken = data.id_token as string;
    localStorage.setItem(KEY_ID_TOKEN, newIdToken);
    return newIdToken;
  } catch {
    return null;
  }
}

export async function getValidToken(): Promise<string | null> {
  const token = getToken();
  if (!token) return null;
  if (!isTokenExpired(token)) return token;
  return refreshTokens();
}
