import { CognitoUserPool } from "amazon-cognito-identity-js";

export const pool = new CognitoUserPool({
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
  ClientId:   process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
});

export interface Session {
  idToken: string;
  userId:  string;
}

function sessionFromLocalStorage(): Session | null {
  try {
    const prefix   = `CognitoIdentityServiceProvider.${pool.getClientId()}`;
    const username = localStorage.getItem(`${prefix}.LastAuthUser`);
    if (!username) return null;
    const idToken  = localStorage.getItem(`${prefix}.${username}.idToken`);
    if (!idToken) return null;
    const payload  = JSON.parse(
      atob(idToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    if ((payload.exp as number) * 1000 < Date.now()) return null;
    return { idToken, userId: payload.sub as string };
  } catch {
    return null;
  }
}

/** Restores the current session from SDK storage, auto-refreshing if expired. */
export function getCurrentSession(): Promise<Session | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(null);

    const user = pool.getCurrentUser();
    if (!user) return resolve(sessionFromLocalStorage());

    user.getSession((err: Error | null, session: any) => {
      if (err || !session?.isValid()) {
        // Fallback for federated (Google) users — SDK getSession may fail
        return resolve(sessionFromLocalStorage());
      }
      resolve({
        idToken: session.getIdToken().getJwtToken() as string,
        userId:  session.getIdToken().payload.sub   as string,
      });
    });
  });
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
