"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { exchangeCodeForTokens, CognitoError } from "@/lib/cognito";

function PopupCallbackHandler() {
  const searchParams = useSearchParams();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const channel = new BroadcastChannel("google_auth");

    const error = searchParams.get("error");
    const code = searchParams.get("code");

    if (error || !code) {
      channel.postMessage({
        type: "AUTH_ERROR",
        error: error ?? "No authorisation code received.",
      });
      channel.close();
      window.close();
      setTimeout(() => {
        window.location.replace("/signin");
      }, 300);
      return;
    }

    exchangeCodeForTokens(code, `${window.location.origin}/auth/popup-callback`)
      .then(({ userId }) => {
        channel.postMessage({ type: "AUTH_SUCCESS", userId });
        channel.close();
        // Try popup close first; if this is a tab (Arc) it won't close — redirect instead
        window.close();
        setTimeout(() => {
          window.location.replace("/identify");
        }, 300);
      })
      .catch((err) => {
        const msg = err instanceof CognitoError ? err.message : "Something went wrong.";
        channel.postMessage({ type: "AUTH_ERROR", error: msg });
        channel.close();
        window.close();
        setTimeout(() => {
          window.location.replace("/signin");
        }, 300);
      });
  }, []);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1e231d",
        color: "rgba(250,248,244,0.55)",
        fontFamily: "sans-serif",
        fontSize: 14,
      }}
    >
      Completing sign in…
    </div>
  );
}

export default function PopupCallbackPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#1e231d",
            color: "rgba(250,248,244,0.55)",
            fontFamily: "sans-serif",
            fontSize: 14,
          }}
        >
          Completing sign in…
        </div>
      }
    >
      <PopupCallbackHandler />
    </Suspense>
  );
}
