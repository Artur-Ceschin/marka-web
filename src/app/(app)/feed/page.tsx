"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tag, TagGroup, Badge } from "@/components/ui";
import { feed, type FeedItem } from "@/lib/api";
import styles from "./page.module.scss";

type Filter = "all" | "week" | "popular";
type View = "list" | "map";

function confidenceVariant(pct: number): "green" | "amber" | "berry" {
  if (pct >= 80) return "green";
  if (pct >= 50) return "amber";
  return "berry";
}

function confidenceLabel(pct: number) {
  if (pct >= 80) return "High Confidence";
  if (pct >= 50) return "Medium Confidence";
  return "Low Confidence";
}

export default function FeedPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<View>("list");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["feed"],
    queryFn: feed.list,
  });

  return (
    <div className={styles.page}>
      {/* ── Header ───────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Feed</h1>
          <p className={styles.subtitle}>What&apos;s sprouting in the wild</p>
        </div>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleBtn} ${view === "list" ? styles.toggleBtnActive : ""}`}
            onClick={() => setView("list")}
            aria-label="List view"
          >
            <ListIcon />
          </button>
          <button
            className={`${styles.toggleBtn} ${view === "map" ? styles.toggleBtnActive : ""}`}
            onClick={() => setView("map")}
            aria-label="Map view"
          >
            <MapIcon />
          </button>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────── */}
      <div className={styles.filters}>
        <TagGroup type="single" value={filter} onValueChange={(v) => v && setFilter(v as Filter)}>
          <Tag value="all" variant="dark">
            All
          </Tag>
          <Tag value="week" variant="dark">
            This week
          </Tag>
          <Tag value="popular" variant="dark">
            Popular
          </Tag>
        </TagGroup>
      </div>

      {/* ── Content ──────────────────────────────── */}
      {view === "list" ? (
        isLoading ? (
          <div className={styles.list}>
            <p style={{ color: "var(--color-text-muted, #888)", padding: "2rem 0" }}>Loading…</p>
          </div>
        ) : (
          <div className={styles.list}>
            {items.map((item) => (
              <FeedCard key={item.id} item={item} />
            ))}
          </div>
        )
      ) : (
        <div className={styles.mapPlaceholder}>
          <p className={styles.mapComingSoon}>Map view coming soon</p>
        </div>
      )}
    </div>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: () => (item.likedByMe ? feed.unlike(item.id) : feed.like(item.id)),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      queryClient.setQueryData<FeedItem[]>(["feed"], (old = []) =>
        old.map((f) =>
          f.id === item.id
            ? { ...f, likedByMe: !f.likedByMe, likesCount: f.likesCount + (f.likedByMe ? -1 : 1) }
            : f,
        ),
      );
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  const variant = confidenceVariant(item.confidence);
  const date = new Date(item.createdAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });

  return (
    <article className={styles.card}>
      <div className={styles.cardUser}>
        <div className={styles.cardAvatar}>
          {item.user.avatarUrl ? (
            <Image src={item.user.avatarUrl} alt={item.user.name} width={36} height={36} />
          ) : (
            <Image src="/images/bianca-profile.png" alt={item.user.name} width={36} height={36} />
          )}
        </div>
        <div className={styles.cardUserInfo}>
          <span className={styles.cardUserName}>{item.user.name}</span>
          {item.location && (
            <span className={styles.cardLocation}>
              <PinIcon /> {item.location}
            </span>
          )}
        </div>
        <span className={styles.cardDate}>{date}</span>
      </div>

      {item.imageUrl && (
        <div className={styles.cardPhoto}>
          <Image src={item.imageUrl} alt={item.plantName} fill style={{ objectFit: "cover" }} />
        </div>
      )}

      <div className={styles.cardBody}>
        <h2 className={styles.cardPlantName}>{item.plantName}</h2>
        <p className={styles.cardLatin}>{item.latinName}</p>

        <div className={styles.confidenceRow}>
          <div className={styles.confidenceBar}>
            <div
              className={styles.confidenceFill}
              style={{
                width: `${item.confidence}%`,
                backgroundColor:
                  variant === "green" ? "#4a6741" : variant === "amber" ? "#c97b3a" : "#8b4f6b",
              }}
            />
          </div>
          <span className={styles.confidencePct}>{item.confidence}%</span>
        </div>

        {item.note && <p className={styles.cardNote}>{item.note}</p>}

        <div className={styles.cardFooter}>
          <Badge variant={variant}>{confidenceLabel(item.confidence)}</Badge>

          <div className={styles.cardActions}>
            <button
              className={`${styles.actionBtn} ${item.likedByMe ? styles.actionBtnActive : ""}`}
              onClick={() => likeMutation.mutate()}
            >
              <HeartIcon filled={item.likedByMe} /> <span>{item.likesCount}</span>
            </button>
            <button className={styles.actionBtn}>
              <CommentIcon />
            </button>
            <button className={`${styles.actionBtn} ${styles.shareBtn}`}>
              <ShareIcon /> <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function ListIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}
function MapIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "inline", marginRight: 2 }}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
function CommentIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function ShareIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}
