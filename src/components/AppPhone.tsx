import styles from "./AppPhone.module.scss";

type Theme = "dark" | "light";

interface AppPhoneProps {
  theme?: Theme;
}

export function AppPhone({ theme = "dark" }: AppPhoneProps) {
  return (
    <div className={`${styles.shell} ${theme === "light" ? styles.shellLight : ""}`}>
      <div className={styles.notch} />

      {/* Status */}
      <div className={`${styles.status} ${theme === "light" ? styles.statusLight : ""}`}>
        <span>18:53</span>
        <span className={styles.statusRight}>
          <SignalIcon />
          <BatteryIcon />
        </span>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerBg} />
        <div className={styles.headerContent}>
          {theme === "dark" ? (
            <>
              <p className={styles.headerTitle}>Feed</p>
              <p className={styles.headerSub}>What&apos;s sprouting in the wild</p>
            </>
          ) : (
            <>
              <p className={styles.headerTitle}>Notebook</p>
              <p className={styles.headerSub}>Your field journal</p>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      {theme === "dark" ? <DarkBody /> : <LightBody />}

      {/* Bottom nav */}
      <div className={`${styles.nav} ${theme === "light" ? styles.navLight : ""}`}>
        {(["Feed", "Identify", "Notebook", "Profile"] as const).map((label, i) => {
          const active = theme === "dark" ? i === 0 : i === 2;
          return (
            <div
              key={label}
              className={`${styles.navItem} ${active ? (theme === "dark" ? styles.navItemActiveDark : styles.navItemActiveLight) : ""}`}
            >
              <div className={styles.navDot} />
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DarkBody() {
  return (
    <div className={styles.darkBody}>
      <div className={styles.filters}>
        <span className={styles.filterOn}>All</span>
        <span className={styles.filterOff}>This week</span>
        <span className={styles.filterOff}>Popular</span>
      </div>

      <div className={styles.feedCard}>
        <div className={styles.feedMeta}>
          <div className={styles.avatar} />
          <div className={styles.feedUser}>
            <span>Artur</span>
            <span className={styles.feedLoc}>📍 San Francisco</span>
          </div>
          <span className={styles.feedTime}>1m ago</span>
        </div>
        <div className={styles.feedImg}>
          <div className={styles.feedImgInner}>
            {/* Stylised plant silhouette via CSS */}
            <div className={styles.plantSilhouette} />
          </div>
        </div>
        <div className={styles.feedInfo}>
          <p className={styles.feedName}>Bottle gourd</p>
          <p className={styles.feedLatin}>Lagenaria siceraria (Molina) Standl.</p>
          <div className={styles.confRow}>
            <div className={styles.confBar}>
              <div className={styles.confFill} style={{ width: "82%" }} />
            </div>
            <span className={styles.confPct}>82%</span>
          </div>
          <span className={styles.feedChip}>Medium Confidence</span>
          <div className={styles.feedActions}>
            <span>♡ 0</span>
            <span>↗ Share</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LightBody() {
  return (
    <div className={styles.lightBody}>
      <div className={styles.searchRow}>
        <span className={styles.searchIcon}>⌕</span>
        <span className={styles.searchText}>Search plants, notes...</span>
      </div>

      <div className={styles.filters}>
        <span className={styles.filterOnDark}>All</span>
        <span className={styles.filterOffDark}>This month</span>
        <span className={styles.filterOffDark}>Located</span>
      </div>

      <div className={styles.notebookCard}>
        <div className={styles.notebookMeta}>
          <span>📅 16 Mar 2026</span>
          <span className={styles.notebookLoc}>San Francisco, CA</span>
        </div>
        <div className={styles.notebookImg}>
          <div className={styles.notebookImgInner} />
        </div>
        <div className={styles.notebookInfo}>
          <p className={styles.notebookName}>Brazilian pine</p>
          <p className={styles.notebookLatin}>Araucaria angustifolia (Bertol.) Steud.</p>
          <span className={styles.notebookChip}>Low Confidence</span>
        </div>
      </div>
    </div>
  );
}

function SignalIcon() {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
      <rect x="0" y="6" width="2" height="4" rx="0.5" />
      <rect x="3" y="4" width="2" height="6" rx="0.5" />
      <rect x="6" y="2" width="2" height="8" rx="0.5" />
      <rect x="9" y="0" width="2" height="10" rx="0.5" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
      <rect
        x="0.5"
        y="0.5"
        width="14"
        height="9"
        rx="2"
        stroke="currentColor"
        strokeOpacity="0.6"
      />
      <rect x="2" y="2" width="10" height="6" rx="1" fill="currentColor" />
      <path
        d="M15.5 3.5v3"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
