"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { LeafMark } from "@/components/MarkaLogo";
import styles from "../auth.module.scss";

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // TODO: wire up auth
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
  }

  return (
    <div className={styles.page}>
      {/* ── Brand panel (desktop left) ─────────────────── */}
      <div className={styles.brand}>
        <div className={styles.brandBlob1} />
        <div className={styles.brandBlob2} />

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

        <div className={styles.formCard}>
          <h1 className={styles.formTitle}>Create your account</h1>
          <p className={styles.formSub}>Free forever. Start your field journal today.</p>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.darkInputs}>
              <Input
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
                label="Email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                pill
              />
            </div>

            <div className={styles.darkInputs}>
              <Input
                label="Password"
                type="password"
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                minLength={8}
                hint="Minimum 8 characters"
                required
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

          <button type="button" className={styles.googleBtn}>
            <GoogleIcon />
            Continue with Google
          </button>

          <div className={styles.footer}>
            <span>Already have an account?</span>
            <Link href="/signin">Sign in</Link>
          </div>
        </div>
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
