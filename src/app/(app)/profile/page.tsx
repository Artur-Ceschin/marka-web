"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { PageHeader } from "@/components/PageHeader";
import {
  BellIcon,
  ChevronRightIcon,
  LogoutIcon,
  MoonIcon,
  PersonIcon,
} from "@/components/icons";
import { useAuthStore } from "@/store/auth.store";
import { users } from "@/lib/api";

import { EditProfileDialog } from "./_components/EditProfileDialog";
import styles from "./page.module.scss";

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);
  const authEmail = useAuthStore((s) => s.email);
  const authPicture = useAuthStore((s) => s.picture);
  const [editOpen, setEditOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["users", "me"],
    queryFn: users.me,
  });

  const email = profile?.email || authEmail || null;

  function handleLogout() {
    logout();
    router.replace("/signin");
  }

  const stats = [
    { label: "PLANTS", value: profile?.plantCount ?? "—" },
    { label: "THIS WEEK", value: profile?.weekCount ?? "—" },
    { label: "SEASON", value: profile?.seasonCount ?? "—" },
  ];

  return (
    <div className={styles.page}>
      <PageHeader title="Profile" subtitle="Your account & preferences" />

      <div className={styles.card}>
        <div className={styles.inner}>
          <div className={styles.profileInfo}>
            <div className={styles.avatar}>
              {profile?.avatarUrl || authPicture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile?.avatarUrl ?? authPicture!} alt="Profile" />
              ) : (
                <DefaultAvatar />
              )}
            </div>
            <h2 className={styles.name}>{profile?.name ?? "—"}</h2>
            {email && <p className={styles.email}>{email}</p>}
            {profile?.bio && <p className={styles.bio}>{profile.bio}</p>}
          </div>

          <div className={styles.stats}>
            {stats.map((s) => (
              <div key={s.label} className={styles.stat}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>

          <div className={styles.sections}>
            <p className={styles.sectionTitle}>ACCOUNT</p>
            <div className={styles.section}>
              <button className={styles.row} onClick={() => setEditOpen(true)}>
                <PersonIcon />
                <span>Edit profile</span>
                <ChevronRightIcon />
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
              <button
                className={`${styles.row} ${styles.rowDanger}`}
                onClick={handleLogout}
              >
                <LogoutIcon />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        profile={
          profile
            ? { name: profile.name, email: email ?? "", bio: profile.bio ?? null }
            : null
        }
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ["users", "me"] });
          setEditOpen(false);
        }}
      />
    </div>
  );
}

function DefaultAvatar() {
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }}
    >
      <rect width="96" height="96" fill="rgba(74,103,65,0.25)" />
      <circle cx="48" cy="36" r="20" fill="rgba(122,158,115,0.55)" />
      <path d="M8 96c0-22.091 17.909-40 40-40s40 17.909 40 40" fill="rgba(122,158,115,0.55)" />
    </svg>
  );
}
