"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { PasswordInput } from "@/components/PasswordInput";
import { LeafMark } from "@/components/MarkaLogo";
import {
  signUp,
  confirmSignUp,
  resendConfirmationCode,
  startGoogleSignIn,
  CognitoError,
} from "@/lib/cognito";
import { useAuthStore } from "@/store/auth.store";
import { SignUpSchema, ConfirmSchema } from "./schema";
import styles from "../auth.module.scss";

type Step = "register" | "confirm";

export default function SignUpPage() {
  const router = useRouter();
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [step, setStep] = useState<Step>("register");
  const [pendingEmail, setPendingEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resent, setResent] = useState(false);

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

  useEffect(() => {
    const FADE = 0.7;
    const MAX = 0.55;
    let rafId: number;
    function tick() {
      const v = videoRef.current;
      if (v && v.duration) {
        const t = v.currentTime;
        const rem = v.duration - t;
        v.style.opacity = String(
          t < FADE ? (t / FADE) * MAX : rem < FADE ? (rem / FADE) * MAX : MAX,
        );
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const form = e.currentTarget;
    const raw = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      password: (form.elements.namedItem("password") as HTMLInputElement).value,
    };

    const result = SignUpSchema.safeParse(raw);
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      setErrors({
        name: flat.name?.[0] ?? "",
        email: flat.email?.[0] ?? "",
        password: flat.password?.[0] ?? "",
      });
      return;
    }

    setLoading(true);
    try {
      await signUp(raw.name, raw.email, raw.password);
      setPendingEmail(raw.email);
      setStep("confirm");
    } catch (err) {
      setErrors({ email: err instanceof CognitoError ? err.message : "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const form = e.currentTarget;
    const raw = { code: (form.elements.namedItem("code") as HTMLInputElement).value };

    const result = ConfirmSchema.safeParse(raw);
    if (!result.success) {
      setErrors({ code: result.error.flatten().fieldErrors.code?.[0] ?? "" });
      return;
    }

    setLoading(true);
    try {
      await confirmSignUp(pendingEmail, raw.code);
      router.push("/signin");
    } catch (err) {
      setErrors({ code: err instanceof CognitoError ? err.message : "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResent(false);
    try {
      await resendConfirmationCode(pendingEmail);
      setResent(true);
    } catch {
      // silent — don't expose resend errors
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.grain} aria-hidden="true" />

      {/* ── Brand panel (desktop left) ─────────────────── */}
      <div className={styles.brand}>
        <video
          ref={videoRef}
          className={styles.brandVideo}
          src={`${process.env.NEXT_PUBLIC_ASSETS_URL}/videos/signup-video.mp4`}
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
          <p className={styles.brandTagline}>Your personal field journal starts here.</p>
        </div>

        <div className={styles.brandFooter}>© 2026 Marka</div>
      </div>

      {/* ── Form pane ─────────────────────────────────── */}
      <div className={styles.formPane}>
        {/* Mobile-only header */}
        <div className={styles.mobileHeader}>
          <div className={styles.mobileEyebrow}>
            <span className={styles.mobileEyebrowLine} />
            <span className={styles.mobileEyebrowLabel}>Marka</span>
            <span className={styles.mobileEyebrowLine} />
          </div>
          <LeafMark size={48} />
          <span className={styles.mobileWordmark}>marka</span>
        </div>

        {step === "register" ? (
          <div className={styles.formCard}>
            <div className={styles.formEyebrow}>
              <span className={styles.formEyebrowLine} />
              <span className={styles.formEyebrowLabel}>Create account</span>
            </div>
            <h1 className={styles.formTitle}>Create your account</h1>
            <p className={styles.formSub}>Free forever. Start your field journal today.</p>

            <form className={styles.form} onSubmit={handleRegister} noValidate>
              <div className={styles.darkInputs}>
                <Input
                  name="name"
                  label="Full name"
                  type="text"
                  placeholder="Jane Smith"
                  autoComplete="name"
                  required
                  error={errors.name || undefined}
                  pill
                />
              </div>

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
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  hint="Minimum 8 characters"
                  required
                  error={errors.password || undefined}
                  pill
                />
              </div>

              <Button type="submit" variant="primary" size="xl" fullWidth loading={loading}>
                Create account
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
                const onFocus = () => {
                  window.removeEventListener("focus", onFocus);
                  setTimeout(() => setGoogleLoading((v) => (v ? false : v)), 2000);
                };
                window.addEventListener("focus", onFocus);
              }}
            >
              {googleLoading ? <GoogleSpinner /> : <GoogleIcon />}
              {googleLoading ? "Signing in…" : "Continue with Google"}
            </button>

            <div className={styles.footer}>
              <span>Already have an account?</span>
              <Link href="/signin">Sign in</Link>
            </div>
          </div>
        ) : (
          <div className={styles.formCard}>
            <div className={styles.formEyebrow}>
              <span className={styles.formEyebrowLine} />
              <span className={styles.formEyebrowLabel}>Verify email</span>
            </div>
            <h1 className={styles.formTitle}>Check your inbox</h1>
            <p className={styles.formSub}>
              We sent a 6-digit code to <strong>{pendingEmail}</strong>
            </p>

            <form className={styles.form} onSubmit={handleConfirm} noValidate>
              <div className={styles.darkInputs}>
                <Input
                  name="code"
                  label="Confirmation code"
                  type="text"
                  placeholder="123456"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  error={errors.code || undefined}
                  pill
                />
              </div>

              <Button type="submit" variant="primary" size="xl" fullWidth loading={loading}>
                Confirm account
              </Button>
            </form>

            <div className={styles.footer}>
              <span>{resent ? "Code sent!" : "Didn't get it?"}</span>
              <button type="button" onClick={handleResend} className={styles.inlineLink}>
                Resend code
              </button>
            </div>
          </div>
        )}
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
