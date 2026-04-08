"use client";

import { useState } from "react";
import Image from "next/image";
import { Tag, TagGroup, Badge } from "@/components/ui";
import styles from "./page.module.scss";

const FEED_ITEMS = [
  {
    id: "1",
    user: { name: "Artur", avatar: "/images/bianca-profile.png", location: "San Francisco, CA, United States" },
    date: "16 Mar",
    plantName: "Bottle gourd",
    latin: "Lagenaria siceraria (Molina) Standl.",
    imageUrl: "/images/plant-araucaria.jpg",
    confidence: 82,
    confidenceLabel: "Medium Confidence",
    confidenceVariant: "amber" as const,
    note: "Found it growing along the fence near the trail.",
    likes: 0,
  },
  {
    id: "2",
    user: { name: "Artur", avatar: "/images/bianca-profile.png", location: "San Francisco, CA, United States" },
    date: "16 Mar",
    plantName: "Brazilian pine",
    latin: "Araucaria angustifolia (Bertol.) Steud.",
    imageUrl: "/images/plant-sequoia.avif",
    confidence: 45,
    confidenceLabel: "Low Confidence",
    confidenceVariant: "berry" as const,
    note: "Araucaria brasikeira",
    likes: 0,
  },
  {
    id: "3",
    user: { name: "Artur", avatar: "/images/bianca-profile.png", location: "Porto Alegre, Brazil" },
    date: "14 Mar",
    plantName: "Giant Sequoia",
    latin: "Sequoiadendron giganteum (Lindl.) J.Buchholz",
    imageUrl: "/images/plant-juniper.png",
    confidence: 90,
    confidenceLabel: "High Confidence",
    confidenceVariant: "green" as const,
    note: "Spotted in the park, incredible size.",
    likes: 3,
  },
];

type Filter = "all" | "week" | "popular";
type View = "list" | "map";

export default function FeedPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<View>("list");

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
          <Tag value="all" variant="dark">All</Tag>
          <Tag value="week" variant="dark">This week</Tag>
          <Tag value="popular" variant="dark">Popular</Tag>
        </TagGroup>
      </div>

      {/* ── Content ──────────────────────────────── */}
      {view === "list" ? (
        <div className={styles.list}>
          {FEED_ITEMS.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className={styles.mapPlaceholder}>
          <p className={styles.mapComingSoon}>Map view coming soon</p>
        </div>
      )}
    </div>
  );
}

function FeedCard({ item }: { item: typeof FEED_ITEMS[0] }) {
  const [liked, setLiked] = useState(false);
  const likeCount = item.likes + (liked ? 1 : 0);

  return (
    <article className={styles.card}>
      {/* User row */}
      <div className={styles.cardUser}>
        <div className={styles.cardAvatar}>
          <Image src={item.user.avatar} alt={item.user.name} width={36} height={36} />
        </div>
        <div className={styles.cardUserInfo}>
          <span className={styles.cardUserName}>{item.user.name}</span>
          <span className={styles.cardLocation}>
            <PinIcon /> {item.user.location}
          </span>
        </div>
        <span className={styles.cardDate}>{item.date}</span>
      </div>

      {/* Photo */}
      <div className={styles.cardPhoto}>
        <Image src={item.imageUrl} alt={item.plantName} fill style={{ objectFit: "cover" }} />
      </div>

      {/* Body */}
      <div className={styles.cardBody}>
        <h2 className={styles.cardPlantName}>{item.plantName}</h2>
        <p className={styles.cardLatin}>{item.latin}</p>

        {/* Confidence bar */}
        <div className={styles.confidenceRow}>
          <div className={styles.confidenceBar}>
            <div
              className={styles.confidenceFill}
              style={{ width: `${item.confidence}%`, backgroundColor: item.confidenceVariant === "green" ? "#4a6741" : item.confidenceVariant === "amber" ? "#c97b3a" : "#8b4f6b" }}
            />
          </div>
          <span className={styles.confidencePct}>{item.confidence}%</span>
        </div>

        {item.note && <p className={styles.cardNote}>{item.note}</p>}

        <div className={styles.cardFooter}>
          <Badge variant={item.confidenceVariant}>{item.confidenceLabel}</Badge>

          <div className={styles.cardActions}>
            <button className={`${styles.actionBtn} ${liked ? styles.actionBtnActive : ""}`} onClick={() => setLiked((l) => !l)}>
              <HeartIcon filled={liked} /> <span>{likeCount}</span>
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  );
}
function MapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
      <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
    </svg>
  );
}
function PinIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", marginRight: 2 }}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
  );
}
function CommentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
    </svg>
  );
}
