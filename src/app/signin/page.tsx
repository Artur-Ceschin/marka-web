"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { PasswordInput } from "../PasswordInput";
import { LeafMark } from "@/components/MarkaLogo";
import { signIn, startGoogleSignIn, CognitoError } from "@/lib/cognito";
import { useAuthStore } from "@/store/auth.store";
import { SignInSchema } from "./schema";
import styles from "../auth.module.scss";

export default function SignInPage() {
  const router = useRouter();
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const channel = new BroadcastChannel("google_auth");
    channel.onmessage = (e) => {
      if (e.data?.type === "AUTH_SUCCESS") {
        setGoogleLoading(false);
        setAuthenticated(e.data.userId);
        router.replace("/identify");
      } else if (e.data?.type === "AUTH_ERROR") {
        setGoogleLoading(false);
        setErrors({ form: "Google sign in failed. Please try again." });
      }
    };
    return () => channel.close();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const form = e.currentTarget;
    const raw = {
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      password: (form.elements.namedItem("password") as HTMLInputElement).value,
    };

    const result = SignInSchema.safeParse(raw);
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      setErrors({
        email: flat.email?.[0] ?? "",
        password: flat.password?.[0] ?? "",
      });
      return;
    }

    setLoading(true);
    try {
      const { userId } = await signIn(raw.email, raw.password);
      setAuthenticated(userId);
      router.push("/identify");
    } catch (err) {
      setErrors({ email: err instanceof CognitoError ? err.message : "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* ── Brand panel (desktop left) ─────────────────── */}
      <div className={styles.brand}>
        <video
          className={styles.brandVideo}
          src="/videos/signin-video.mp4"
          autoPlay
          muted
          loop
          playsInline
        />

        <div className={styles.brandBack}>
          <Link href="/">← Back to marka</Link>
        </div>

        <div className={styles.brandBody}>
          <LeafMark size={80} />
          <span className={styles.brandWordmark}>marka</span>
          <p className={styles.brandTagline}>Know every plant you pass.</p>
        </div>

        <div className={styles.brandFooter}>© 2026 Marka</div>
      </div>

      {/* ── Form pane ─────────────────────────────────── */}
      <div className={styles.formPane}>
        {/* Mobile-only header */}
        <div className={styles.mobileHeader}>
          <LeafMark size={52} />
          <span className={styles.mobileWordmark}>marka</span>
        </div>

        <div className={styles.formCard}>
          <h1 className={styles.formTitle}>Welcome back</h1>
          <p className={styles.formSub}>Sign in to your field journal</p>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.darkInputs}>
              <Input
                name="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                error={errors.email || undefined}
                pill
              />
            </div>

            <div className={styles.darkInputs}>
              <PasswordInput
                name="password"
                label="Password"
                placeholder="••••••••••"
                autoComplete="current-password"
                required
                error={errors.password || undefined}
                pill
              />
            </div>

            <div className={styles.forgotRow}>
              <Link href="/forgot-password">Forgot password?</Link>
            </div>

            <Button type="submit" variant="primary" size="xl" fullWidth loading={loading}>
              Sign in to Marka
            </Button>
          </form>

          <div className={styles.divider}>or continue with</div>

          <button
            type="button"
            className={styles.googleBtn}
            disabled={googleLoading}
            onClick={() => {
              startGoogleSignIn();
              setErrors({});
              setGoogleLoading(true);
              // Clear spinner if user comes back to this tab without completing
              const onFocus = () => {
                window.removeEventListener("focus", onFocus);
                setTimeout(
                  () =>
                    setGoogleLoading((v) => {
                      // Only clear if still loading (BroadcastChannel may have already cleared it)
                      return v ? false : v;
                    }),
                  2000,
                );
              };
              window.addEventListener("focus", onFocus);
            }}
          >
            {googleLoading ? <GoogleSpinner /> : <GoogleIcon />}
            {googleLoading ? "Signing in…" : "Continue with Google"}
          </button>

          <div className={styles.footer}>
            <span>Don&apos;t have an account?</span>
            <Link href="/signup">Sign up free</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleSpinner() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: "spin 0.75s linear infinite" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
      <path
        d="M9 2a7 7 0 0 1 7 7"
        stroke="rgba(255,255,255,0.75)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}
