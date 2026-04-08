"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { PasswordInput } from "../PasswordInput";
import { LeafMark } from "@/components/MarkaLogo";
import { signUp, confirmSignUp, resendConfirmationCode, startGoogleSignIn, CognitoError } from "@/lib/cognito";
import styles from "../auth.module.scss";

type Step = "register" | "confirm";

export default function SignUpPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("register");
  const [pendingEmail, setPendingEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      await signUp(name, email, password);
      setPendingEmail(email);
      setStep("confirm");
    } catch (err) {
      setError(err instanceof CognitoError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const code = (form.elements.namedItem("code") as HTMLInputElement).value;

    try {
      await confirmSignUp(pendingEmail, code);
      router.push("/signin");
    } catch (err) {
      setError(err instanceof CognitoError ? err.message : "Something went wrong.");
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
      {/* ── Brand panel (desktop left) ─────────────────── */}
      <div className={styles.brand}>
        <video
          className={styles.brandVideo}
          src="/videos/signup-video.mp4"
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
          <p className={styles.brandTagline}>
            Your personal field journal starts here.
          </p>
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

        {step === "register" ? (
          <div className={styles.formCard}>
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
                  error={error || undefined}
                  pill
                />
              </div>

              <div className={styles.darkInputs}>
                <PasswordInput
                  name="password"
                  label="Password"
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  hint="Minimum 8 characters"
                  required
                  error={error ? " " : undefined}
                  pill
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="xl"
                fullWidth
                loading={loading}
              >
                Create account
              </Button>
            </form>

            <div className={styles.divider}>or continue with</div>

            <button type="button" className={styles.googleBtn} onClick={startGoogleSignIn}>
              <GoogleIcon />
              Continue with Google
            </button>

            <div className={styles.footer}>
              <span>Already have an account?</span>
              <Link href="/signin">Sign in</Link>
            </div>
          </div>
        ) : (
          <div className={styles.formCard}>
            <h1 className={styles.formTitle}>Check your email</h1>
            <p className={styles.formSub}>
              We sent a confirmation code to <strong>{pendingEmail}</strong>
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
                  error={error || undefined}
                  pill
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="xl"
                fullWidth
                loading={loading}
              >
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}
