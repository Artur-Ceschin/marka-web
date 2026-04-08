"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { BottomNav, type NavItem } from "@/components/ui";
import { useAuthStore } from "@/store/auth.store";
import { LeafMark } from "@/components/MarkaLogo";
import styles from "./layout.module.scss";

const NAV_ITEMS: NavItem[] = [
  { id: "feed",     label: "Feed",     icon: <FeedIcon /> },
  { id: "identify", label: "Identify", icon: <IdentifyIcon /> },
  { id: "notebook", label: "Notebook", icon: <NotebookIcon /> },
  { id: "profile",  label: "Profile",  icon: <ProfileIcon /> },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, hasHydrated, hydrate } = useAuthStore();

  useEffect(() => { hydrate(); }, []);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) router.replace("/signin");
  }, [hasHydrated, isAuthenticated]);

  if (!hasHydrated) return <div className={styles.splash} />;
  if (!isAuthenticated) return null;

  const activeId = pathname.split("/").filter(Boolean)[0] ?? "feed";

  return (
    <div className={styles.shell}>
      {/* ── Desktop sidebar ───────────────────── */}
      <aside className={styles.sidebar}>
        <Link href="/feed" className={styles.sidebarLogo}>
          <LeafMark size={32} />
          <span className={styles.sidebarWordmark}>marka</span>
        </Link>

        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={`/${item.id}`}
              className={`${styles.sidebarItem} ${activeId === item.id ? styles.sidebarItemActive : ""}`}
            >
              <span className={styles.sidebarIcon}>{item.icon}</span>
              <span className={styles.sidebarLabel}>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* ── Main content ──────────────────────── */}
      <main className={styles.main}>
        {children}
      </main>

      {/* ── Mobile bottom nav ─────────────────── */}
      <BottomNav
        items={NAV_ITEMS}
        activeId={activeId}
        onSelect={(id) => router.push(`/${id}`)}
        theme="dark"
        className={styles.mobileNav}
      />
    </div>
  );
}

function FeedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  );
}

function IdentifyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </svg>
  );
}

function NotebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M20 21a8 8 0 1 0-16 0"/>
    </svg>
  );
}
