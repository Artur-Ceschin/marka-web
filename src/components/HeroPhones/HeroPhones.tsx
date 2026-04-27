"use client";

import { useRef, useCallback } from "react";
import styles from "./HeroPhones.module.scss";

// ── Dark Mode Phone (Feed screen) ────────────────────────────────────────────
function DarkPhone() {
  return (
    <div className={styles.phone} data-theme="dark">
      <div className={styles.phoneFrame}>
        <div className={styles.notch} />

        {/* Status bar */}
        <div className={styles.statusBar}>
          <span>18:53</span>
          <span className={styles.statusIcons}>
            <svg width="12" height="9" viewBox="0 0 12 9" fill="currentColor">
              <rect x="0" y="4" width="2" height="5" rx="0.5" />
              <rect x="3" y="3" width="2" height="6" rx="0.5" />
              <rect x="6" y="1" width="2" height="8" rx="0.5" />
              <rect x="9" y="0" width="2" height="9" rx="0.5" />
            </svg>
          </span>
        </div>

        {/* Green header */}
        <div className={styles.darkHeader}>
          <div className={styles.darkHeaderBg} />
          <div className={styles.darkHeaderContent}>
            <div>
              <div className={styles.screenTitle}>Feed</div>
              <div className={styles.screenSub}>What&apos;s sprouting in the wild</div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className={styles.darkContent}>
          {/* Filter pills */}
          <div className={styles.filterRow}>
            <span className={styles.filterActive}>All</span>
            <span className={styles.filterPill}>This week</span>
            <span className={styles.filterPill}>Popular</span>
          </div>

          {/* Plant card */}
          <div className={styles.feedCard}>
            <div className={styles.feedCardMeta}>
              <div className={styles.avatar} />
              <div>
                <div className={styles.feedUser}>Artur</div>
                <div className={styles.feedLocation}>📍 San Francisco, CA</div>
              </div>
              <span className={styles.feedTime}>1m ago</span>
            </div>
            <div className={styles.feedImage}>
              <div className={styles.feedImagePlant}>🌿</div>
            </div>
            <div className={styles.feedCardBody}>
              <div className={styles.feedPlantName}>Bottle gourd</div>
              <div className={styles.feedLatin}>Lagenaria siceraria (Molina) Standl.</div>
              <div className={styles.feedConfBar}>
                <div className={styles.feedConfFill} style={{ width: "82%" }} />
                <span>82%</span>
              </div>
              <div className={styles.feedNote}>Achei tomando um mate no soul Ben Baguio</div>
              <div className={styles.feedTag}>Medium Confidence</div>
              <div className={styles.feedActions}>
                <span>♡ 0</span>
                <span>💬</span>
                <span style={{ marginLeft: "auto" }}>↗ Share</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <div className={styles.darkNav}>
          {["Feed", "Identify", "Notebook", "Profile"].map((label, i) => (
            <div key={label} className={`${styles.navItem} ${i === 0 ? styles.navItemActive : ""}`}>
              <div className={styles.navIcon}>
                {i === 0 && "🌿"}
                {i === 1 && "🔍"}
                {i === 2 && "📓"}
                {i === 3 && "👤"}
              </div>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Light Mode Phone (Notebook screen) ───────────────────────────────────────
function LightPhone() {
  return (
    <div className={styles.phone} data-theme="light">
      <div className={`${styles.phoneFrame} ${styles.phoneFrameLight}`}>
        <div className={`${styles.notch} ${styles.notchLight}`} />

        {/* Status bar */}
        <div className={`${styles.statusBar} ${styles.statusBarLight}`}>
          <span>18:53</span>
          <span className={styles.statusIcons}>
            <svg width="12" height="9" viewBox="0 0 12 9" fill="currentColor">
              <rect x="0" y="4" width="2" height="5" rx="0.5" />
              <rect x="3" y="3" width="2" height="6" rx="0.5" />
              <rect x="6" y="1" width="2" height="8" rx="0.5" />
              <rect x="9" y="0" width="2" height="9" rx="0.5" />
            </svg>
          </span>
        </div>

        {/* Green header */}
        <div className={styles.darkHeader}>
          <div className={styles.darkHeaderBg} />
          <div className={styles.darkHeaderContent}>
            <div>
              <div className={styles.screenTitle}>Notebook</div>
              <div className={styles.screenSub}>Your field journal</div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className={styles.lightContent}>
          {/* Search */}
          <div className={styles.searchBar}>
            <span>🔍</span>
            <span className={styles.searchPlaceholder}>Search plants, notes...</span>
          </div>

          {/* Filter pills */}
          <div className={styles.filterRow}>
            <span className={styles.filterActiveDark}>All</span>
            <span className={styles.filterPillDark}>This month</span>
            <span className={styles.filterPillDark}>With notes</span>
            <span className={styles.filterPillDark}>Located</span>
          </div>

          {/* Plant card */}
          <div className={styles.lightCard}>
            <div className={styles.lightCardMeta}>
              <span>📅 16 Mar 2026</span>
              <span className={styles.lightCardLocation}>📍 San Francisco, CA</span>
            </div>
            <div className={styles.lightCardImage}>
              <div className={styles.lightCardImagePlant}>🌲</div>
            </div>
            <div className={styles.lightCardBody}>
              <div className={styles.lightPlantName}>Brazilian pine</div>
              <div className={styles.lightLatin}>Araucaria angustifolia (Bertol.) Steud.</div>
              <div className={styles.lightCommon}>Araucaria brasikeira</div>
              <div className={styles.lightTag}>Low Confidence</div>
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <div className={styles.lightNav}>
          {["Feed", "Identify", "Notebook", "Profile"].map((label, i) => (
            <div
              key={label}
              className={`${styles.lightNavItem} ${i === 2 ? styles.lightNavItemActive : ""}`}
            >
              <div className={styles.navIcon}>
                {i === 0 && "🌿"}
                {i === 1 && "🔍"}
                {i === 2 && "📓"}
                {i === 3 && "👤"}
              </div>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main export with tilt effect ─────────────────────────────────────────────
export function HeroPhones() {
  const wrapRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2); // -1 to 1
    const dy = (e.clientY - cy) / (rect.height / 2); // -1 to 1
    wrap.style.setProperty("--tilt-x", `${dy * -10}deg`);
    wrap.style.setProperty("--tilt-y", `${dx * 10}deg`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    wrap.style.setProperty("--tilt-x", "0deg");
    wrap.style.setProperty("--tilt-y", "0deg");
  }, []);

  return (
    <div
      ref={wrapRef}
      className={styles.phonesWrap}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.phonesGlow} />
      <div className={styles.phonesInner}>
        <DarkPhone />
        <LightPhone />
      </div>
    </div>
  );
}
