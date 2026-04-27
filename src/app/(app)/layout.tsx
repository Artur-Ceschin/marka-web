"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { LeafMark } from "@/components/MarkaLogo";
import { IoCompassOutline, IoBookOutline, IoPersonOutline, IoScanOutline } from "react-icons/io5";
import { MobileNav } from "./_components/MobileNav";
import { useInactivityTimer } from "@/lib/useInactivityTimer";
import styles from "./layout.module.scss";

const NAV_ITEMS = [
  { id: "identify", label: "Scan", icon: <IoScanOutline size={22} /> },
  { id: "notebook", label: "Journal", icon: <IoBookOutline size={22} /> },
  { id: "profile", label: "Profile", icon: <IoPersonOutline size={22} /> },
];

const SIDEBAR_ITEMS = [
  { id: "identify", label: "Identify", icon: <IoCompassOutline size={22} /> },
  { id: "notebook", label: "Notebook", icon: <IoBookOutline size={22} /> },
  { id: "profile", label: "Profile", icon: <IoPersonOutline size={22} /> },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, hasHydrated, hydrate } = useAuthStore();

  useInactivityTimer();

  useEffect(() => {
    if (!hasHydrated) hydrate();
  }, []);

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
          {SIDEBAR_ITEMS.map((item) => (
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
      <main className={styles.main}>{children}</main>

      {/* ── Mobile bottom nav ─────────────────── */}
      <div className={styles.mobileNav}>
        <MobileNav
          items={NAV_ITEMS}
          activeId={activeId}
          onSelect={(id) => router.push(`/${id}`)}
        />
      </div>
    </div>
  );
}

