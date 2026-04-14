"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { users } from "@/lib/api";
import styles from "./page.module.scss";

export default function ProfilePage() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const { data: profile } = useQuery({
    queryKey: ["users", "me"],
    queryFn: users.me,
  });

  function handleLogout() {
    logout();
    router.replace("/signin");
  }

  const stats = [
    { label: "PLANTS",    value: profile?.plantCount  ?? "—" },
    { label: "THIS WEEK", value: profile?.weekCount   ?? "—" },
    { label: "SEASON",    value: profile?.seasonCount ?? "—" },
  ];

  return (
    <div className={styles.page}>
      {/* ── Header ───────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.avatar}>
          {profile?.avatarUrl ? (
            <Image src={profile.avatarUrl} alt="Profile" width={72} height={72} />
          ) : (
            <Image src="/images/bianca-profile.png" alt="Profile" width={72} height={72} />
          )}
        </div>
        <h1 className={styles.name}>{profile?.name ?? "—"}</h1>
        {profile?.email && <p className={styles.userId}>{profile.email}</p>}
      </div>

      {/* ── Stats ────────────────────────────────── */}
      <div className={styles.stats}>
        {stats.map((s) => (
          <div key={s.label} className={styles.stat}>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Sections ─────────────────────────────── */}
      <div className={styles.sections}>
        <p className={styles.sectionTitle}>ACCOUNT</p>
        <div className={styles.section}>
          <button className={styles.row}>
            <PersonIcon />
            <span>Edit profile</span>
            <ChevronIcon />
          </button>
          <div className={styles.divider} />
          <button className={styles.row} disabled>
            <BellIcon />
            <span>Notifications</span>
            <span className={styles.rowBadge}>Coming soon</span>
          </button>
        </div>

        <p className={styles.sectionTitle}>PREFERENCES</p>
        <div className={styles.section}>
          <button className={styles.row} disabled>
            <MoonIcon />
            <span>Appearance</span>
            <span className={styles.rowBadge}>Dark</span>
          </button>
        </div>

        <p className={styles.sectionTitle}>SESSION</p>
        <div className={styles.section}>
          <button className={`${styles.row} ${styles.rowDanger}`} onClick={handleLogout}>
            <LogoutIcon />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function PersonIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>;
}
function BellIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}
function MoonIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>;
}
function ChevronIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
}
function LogoutIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}
