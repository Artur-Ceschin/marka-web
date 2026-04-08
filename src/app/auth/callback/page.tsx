"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { exchangeCodeForTokens, CognitoError } from "@/lib/cognito";
import { useAuthStore } from "@/store/auth.store";
import { getSubFromToken } from "@/lib/auth";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const handled = useRef(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      setErrorMsg(`Sign in was cancelled or failed (${error}). Redirecting…`);
      setTimeout(() => router.replace("/signin"), 2000);
      return;
    }

    if (!code) {
      router.replace("/signin");
      return;
    }

    exchangeCodeForTokens(code)
      .then((tokens) => {
        const userId = getSubFromToken(tokens.idToken) ?? "";
        setAuthenticated(userId, tokens.idToken, tokens.refreshToken);
        router.replace("/");
      })
      .catch((err) => {
        const msg = err instanceof CognitoError ? err.message : "Something went wrong.";
        setErrorMsg(`${msg} Redirecting…`);
        setTimeout(() => router.replace("/signin"), 2000);
      });
  }, [searchParams]);

  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#1e231d",
      color: errorMsg ? "#ff7b7b" : "rgba(250,248,244,0.55)",
      fontFamily: "sans-serif",
      fontSize: 14,
      gap: 8,
    }}>
      {errorMsg || "Signing you in…"}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1e231d",
        color: "rgba(250,248,244,0.55)",
        fontFamily: "sans-serif",
        fontSize: 14,
      }}>
        Signing you in…
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
