"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input, Textarea, MarkaDialog } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import { users, type UpdateProfileBody } from "@/lib/api";
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
      </div>

      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        profile={profile ? { name: profile.name, email: email ?? "", bio: profile.bio ?? null } : null}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ["users", "me"] });
          setEditOpen(false);
        }}
      />
    </div>
  );
}

function EditProfileDialog({
  open,
  onOpenChange,
  profile,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profile: { name: string; email: string; bio: string | null } | null;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (open && profile) {
      setName(profile.name ?? "");
      setBio(profile.bio ?? "");
    }
  }, [open, profile]);

  const { mutate, isPending } = useMutation({
    mutationFn: (body: UpdateProfileBody) => users.updateMe(body),
    onSuccess: () => {
      toast.success("Profile updated.");
      onSaved();
    },
  });

  function handleSave() {
    const body: UpdateProfileBody = {};
    if (name.trim() && name.trim() !== profile?.name) body.name = name.trim();
    if (bio.trim() !== (profile?.bio ?? "")) body.bio = bio.trim();
    if (Object.keys(body).length === 0) {
      onSaved();
      return;
    }
    mutate(body);
  }

  return (
    <MarkaDialog
      title="Edit profile"
      description="Update your name and bio."
      open={open}
      onOpenChange={onOpenChange}
      className={styles.editDialog}
    >
      <div className={styles.editForm}>
        <Input
          label="Email"
          value={profile?.email ?? ""}
          disabled
        />
        <Input
          label="Name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Textarea
          label="Bio"
          placeholder="Tell us about yourself…"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={160}
          showCount
          rows={3}
        />
        <div className={styles.editActions}>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isPending}
            onClick={handleSave}
          >
            Save changes
          </Button>
        </div>
      </div>
    </MarkaDialog>
  );
}

function DefaultAvatar() {
  return (
    <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="96" height="96" fill="rgba(74,103,65,0.25)" />
      <circle cx="48" cy="36" r="20" fill="rgba(122,158,115,0.55)" />
      <path d="M8 96c0-22.091 17.909-40 40-40s40 17.909 40 40" fill="rgba(122,158,115,0.55)" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}
function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
