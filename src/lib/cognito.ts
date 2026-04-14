import {
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";
import { pool } from "@/lib/auth";

const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;

export class CognitoError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "CognitoError";
  }
}

function friendlyMessage(code: string): string {
  switch (code) {
    case "NotAuthorizedException":
      return "Incorrect email or password.";
    case "UserNotFoundException":
      return "No account found with that email.";
    case "UserNotConfirmedException":
      return "Please confirm your email before signing in.";
    case "UsernameExistsException":
      return "An account with that email already exists.";
    case "InvalidPasswordException":
      return "Password must be at least 8 characters with a number and a symbol.";
    case "CodeMismatchException":
      return "Invalid confirmation code. Please try again.";
    case "ExpiredCodeException":
      return "Confirmation code has expired. Request a new one.";
    case "TooManyRequestsException":
    case "LimitExceededException":
      return "Too many attempts. Please wait a moment and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

const COGNITO_DOMAIN = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!;

export function startGoogleSignIn(): void {
  const callbackUrl = `${window.location.origin}/auth/popup-callback`;
  const params = new URLSearchParams({
    client_id:         CLIENT_ID,
    response_type:     "code",
    scope:             "openid email profile",
    redirect_uri:      callbackUrl,
    identity_provider: "Google",
  });

  const url = `https://${COGNITO_DOMAIN}/oauth2/authorize?${params}`;
  window.open(url, "_blank");
}

export async function exchangeCodeForTokens(code: string, redirectUri?: string): Promise<{ userId: string }> {
  const callbackUrl = redirectUri ?? `${window.location.origin}/auth/callback`;
  const res = await fetch(`https://${COGNITO_DOMAIN}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type:   "authorization_code",
      client_id:    CLIENT_ID,
      code,
      redirect_uri: callbackUrl,
    }),
  });

  if (!res.ok) throw new CognitoError("TokenExchangeError", "Something went wrong. Please try again.");

  const data = await res.json();
  return storeTokens(data.id_token, data.access_token, data.refresh_token);
}

export function storeTokens(idToken: string, accessToken: string, refreshToken: string): { userId: string } {
  const payload  = JSON.parse(atob(idToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  const username = (payload["cognito:username"] ?? payload.sub) as string;
  const prefix   = `CognitoIdentityServiceProvider.${CLIENT_ID}`;

  localStorage.setItem(`${prefix}.LastAuthUser`,             username);
  localStorage.setItem(`${prefix}.${username}.idToken`,      idToken);
  localStorage.setItem(`${prefix}.${username}.accessToken`,  accessToken);
  localStorage.setItem(`${prefix}.${username}.refreshToken`, refreshToken);
  localStorage.setItem(`${prefix}.${username}.clockDrift`,   "0");

  return { userId: payload.sub as string };
}

export function signIn(email: string, password: string): Promise<{ userId: string }> {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: pool });
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });

    user.authenticateUser(authDetails, {
      onSuccess(session) {
        resolve({ userId: session.getIdToken().payload.sub as string });
      },
      onFailure(err) {
        reject(new CognitoError(err.code ?? err.name, friendlyMessage(err.code ?? err.name)));
      },
    });
  });
}

export function signUp(name: string, email: string, password: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const attributes = [
      new CognitoUserAttribute({ Name: "email", Value: email }),
      new CognitoUserAttribute({ Name: "name", Value: name }),
    ];

    pool.signUp(email, password, attributes, [], (err) => {
      if (err) {
        reject(new CognitoError(err.name, friendlyMessage(err.name)));
      } else {
        resolve();
      }
    });
  });
}

export function confirmSignUp(email: string, code: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: pool });

    user.confirmRegistration(code, true, (err) => {
      if (err) {
        reject(new CognitoError(err.name, friendlyMessage(err.name)));
      } else {
        resolve();
      }
    });
  });
}

export function resendConfirmationCode(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: pool });

    user.resendConfirmationCode((err) => {
      if (err) {
        reject(new CognitoError(err.name, friendlyMessage(err.name)));
      } else {
        resolve();
      }
    });
  });
}
