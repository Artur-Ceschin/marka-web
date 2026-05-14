'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import {
  BellIcon,
  ChevronRightIcon,
  LogoutIcon,
  MoonIcon,
  PencilIcon,
  PersonIcon,
} from '@/components/icons';
import { useAuthStore } from '@/store/auth.store';
import { users, type UserProfile } from '@/lib/api';
import { cdnUrl } from '@/lib/cdn';

import { EditProfileDialog } from './_components/EditProfileDialog';
import styles from './page.module.scss';
import { useProfile } from '@/hooks/useProfile';

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);
  const authEmail = useAuthStore((s) => s.email);
  const authPicture = useAuthStore((s) => s.picture);
  const [editOpen, setEditOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const raw = file.type.toLowerCase();
    const mimeType =
      raw === 'image/jpeg' || raw === 'image/png' || raw === 'image/webp'
        ? (raw as 'image/jpeg' | 'image/png' | 'image/webp')
        : 'image/jpeg';
    setUploading(true);
    try {
      const { uploadUrl, avatarUrl } = await users.avatarUploadUrl(mimeType);
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': mimeType } });
      const versionedUrl = `${avatarUrl}?v=${Date.now()}`;
      await users.updateMe({ avatarUrl: versionedUrl });
      queryClient.setQueryData<UserProfile>(['users', 'me'], (old) =>
        old ? { ...old, avatarUrl: versionedUrl } : old,
      );
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  const { data: profile } = useProfile();

  const email = profile?.email || authEmail || null;

  function handleLogout() {
    logout();
    router.replace('/signin');
  }

  const stats = [
    { label: 'Plants', value: profile?.plantCount ?? '—' },
    { label: 'This Week', value: profile?.weekCount ?? '—' },
    { label: 'Season', value: profile?.seasonCount ?? '—' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.grain} aria-hidden="true" />

      {/* Editorial header */}
      <header className={styles.header}>
        <div className={styles.headerEyebrow}>
          <span className={styles.headerLine} />
          <span className={styles.headerLabel}>Your Account</span>
        </div>

        <div className={styles.headerMeta}>
          <button
            className={styles.avatarWrap}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            aria-label="Change profile photo"
          >
            <div className={styles.avatar}>
              {profile?.avatarUrl || authPicture ? (
                <img src={cdnUrl(profile?.avatarUrl) ?? authPicture!} alt="Profile" />
              ) : (
                <DefaultAvatar />
              )}
            </div>
            <span className={styles.avatarPencil}>
              <PencilIcon />
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={styles.avatarInput}
              onChange={handleAvatarChange}
            />
          </button>

          <div className={styles.headerText}>
            <h1 className={styles.headerTitle}>
              {profile?.name ? (
                <>
                  {profile.name.split(' ')[0]}
                  {profile.name.split(' ').length > 1 && (
                    <span className={styles.headerTitleItalic}>
                      {' '}
                      {profile.name.split(' ').slice(1).join(' ')}
                    </span>
                  )}
                </>
              ) : (
                <span className={styles.headerTitleItalic}>Field Naturalist</span>
              )}
            </h1>
            {email && <p className={styles.headerEmail}>{email}</p>}
          </div>
        </div>

        {profile?.bio && <p className={styles.headerBio}>{profile.bio}</p>}
      </header>

      <div className={styles.content}>
        {/* Stats */}
        <div className={styles.statsCard}>
          {stats.map((s) => (
            <div key={s.label} className={styles.stat}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Account section */}
        <div className={styles.sectionGroup}>
          <p className={styles.sectionTitle}>Account</p>
          <div className={styles.sectionCard}>
            <button className={styles.row} onClick={() => setEditOpen(true)}>
              <span className={styles.rowIcon}>
                <PersonIcon />
              </span>
              <span>Edit profile</span>
              <ChevronRightIcon className={styles.rowChevron} />
            </button>
            <div className={styles.divider} />
            <button className={styles.row} disabled>
              <span className={styles.rowIcon}>
                <BellIcon />
              </span>
              <span>Notifications</span>
              <span className={styles.rowBadge}>Soon</span>
            </button>
          </div>
        </div>

        {/* Preferences section */}
        <div className={styles.sectionGroup}>
          <p className={styles.sectionTitle}>Preferences</p>
          <div className={styles.sectionCard}>
            <button className={styles.row} disabled>
              <span className={styles.rowIcon}>
                <MoonIcon />
              </span>
              <span>Appearance</span>
              <span className={styles.rowBadge}>Dark</span>
            </button>
          </div>
        </div>

        {/* Session section */}
        <div className={styles.sectionGroup}>
          <p className={styles.sectionTitle}>Session</p>
          <div className={styles.sectionCard}>
            <button className={`${styles.row} ${styles.rowDanger}`} onClick={handleLogout}>
              <span className={styles.rowIcon}>
                <LogoutIcon />
              </span>
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>

      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        profile={
          profile ? { name: profile.name, email: email ?? '', bio: profile.bio ?? null } : null
        }
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
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
      style={{ width: '100%', height: '100%' }}
    >
      <rect width="96" height="96" fill="rgba(74,97,65,0.2)" />
      <circle cx="48" cy="36" r="20" fill="rgba(180,206,167,0.35)" />
      <path d="M8 96c0-22.091 17.909-40 40-40s40 17.909 40 40" fill="rgba(180,206,167,0.35)" />
    </svg>
  );
}
