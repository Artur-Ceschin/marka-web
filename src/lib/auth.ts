import { CognitoUserPool } from "amazon-cognito-identity-js";

const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;
const COGNITO_DOMAIN = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!;

export const pool = new CognitoUserPool({
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
  ClientId: CLIENT_ID,
});

export interface Session {
  idToken: string;
  userId: string;
  email: string | null;
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
}

function storagePrefix(): string {
  return `CognitoIdentityServiceProvider.${CLIENT_ID}`;
}

function readStoredTokens(): { idToken: string; refreshToken: string; username: string } | null {
  try {
    const prefix = storagePrefix();
    const username = localStorage.getItem(`${prefix}.LastAuthUser`);
    if (!username) return null;
    const idToken = localStorage.getItem(`${prefix}.${username}.idToken`);
    const refreshToken = localStorage.getItem(`${prefix}.${username}.refreshToken`);
    if (!idToken || !refreshToken) return null;
    return { idToken, refreshToken, username };
  } catch {
    return null;
  }
}

function sessionFromToken(idToken: string): Session | null {
  try {
    const payload = decodeJwtPayload(idToken);
    if ((payload.exp as number) * 1000 < Date.now()) return null;
    return {
      idToken,
      userId: payload.sub as string,
      email: (payload.email as string) ?? null,
    };
  } catch {
    return null;
  }
}

async function refreshWithCognito(refreshToken: string): Promise<Session | null> {
  try {
    const res = await fetch(`https://${COGNITO_DOMAIN}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: CLIENT_ID,
        refresh_token: refreshToken,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const idToken: string = data.id_token;
    const accessToken: string = data.access_token;
    const payload = decodeJwtPayload(idToken);
    const username = (payload["cognito:username"] ?? payload.sub) as string;
    const prefix = storagePrefix();

    localStorage.setItem(`${prefix}.${username}.idToken`, idToken);
    localStorage.setItem(`${prefix}.${username}.accessToken`, accessToken);

    return {
      idToken,
      userId: payload.sub as string,
      email: (payload.email as string) ?? null,
    };
  } catch {
    return null;
  }
}

/** Restores the current session, auto-refreshing if the idToken is expired. */
export function getCurrentSession(): Promise<Session | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(null);

    const user = pool.getCurrentUser();
    if (!user) return resolve(resolveFromStorage());

    user.getSession(async (err: Error | null, session: any) => {
      if (!err && session?.isValid()) {
        const p = session.getIdToken().payload;
        return resolve({
          idToken: session.getIdToken().getJwtToken() as string,
          userId: p.sub as string,
          email: (p.email as string) ?? null,
        });
      }
      resolve(await resolveFromStorage());
    });
  });
}

async function resolveFromStorage(): Promise<Session | null> {
  const stored = readStoredTokens();
  if (!stored) return null;

  const existing = sessionFromToken(stored.idToken);
  if (existing) return existing;

  return refreshWithCognito(stored.refreshToken);
}

/** Returns a valid idToken for use in API Authorization headers. */
export async function getValidToken(): Promise<string | null> {
  const session = await getCurrentSession();
  return session?.idToken ?? null;
}

/** Signs out the current user and clears SDK storage. */
export function signOutCognito(): void {
  pool.getCurrentUser()?.signOut();
}
