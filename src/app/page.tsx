import Image from "next/image";
import Link from "next/link";
import { LeafMark } from "@/components/MarkaLogo";
import styles from "./page.module.scss";

const PLANTS = [
  {
    name: "Araucaria araucana",
    latin: "Monkey Puzzle Tree",
    match: 97,
    desc: "Ancient conifer native to the southern Andes. Its interlocking scale-like leaves and towering silhouette make it unmistakable against mountain skies.",
    img: "/images/plant-araucaria.jpg",
  },
  {
    name: "Mycena galopus",
    latin: "Milking Bonnet",
    match: 94,
    desc: "Delicate white fungi found clustered on decaying bark. Exudes a milky sap when broken — a key identification trait.",
    img: "/images/plant-mycena.jpg",
  },
  {
    name: "Lupinus polyphyllus",
    latin: "Large-leaved Lupin",
    match: 91,
    desc: "Dense spires of violet-blue flowers, naturalised across temperate meadows. Rich in nitrogen-fixing root nodules.",
    img: "/images/plant-lupin.jpg",
  },
  {
    name: "Sequoiadendron giganteum",
    latin: "Giant Sequoia",
    match: 88,
    desc: "The largest tree by volume on Earth. Towering trunks with cinnamon-red bark can reach over 84 metres, living for thousands of years.",
    img: "/images/plant-sequoia.avif",
  },
  {
    name: "Arctic Poppy",
    latin: "Papaver radicatum",
    match: 97,
    desc: "Observed in the rocky alpine tundra. Known for its resilient, vibrantly veined petals that track the path of the sun throughout the day.",
    img: "/images/plant-poppy.png",
  },
  {
    name: "Common Juniper",
    latin: "Juniperus communis",
    match: 92,
    desc: "A hardy evergreen shrub found across diverse northern latitudes. Berries exhibit a unique dusty blue-green bloom when ripe.",
    img: "/images/plant-juniper.png",
  },
];

const VALUE_PROPS = [
  {
    title: "Honest Free Alternative",
    body: "Plant ID journal that's actually free. No subscriptions, no dark patterns.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M11 2C11 2 5 6.5 5 12a6 6 0 0 0 12 0c0-5.5-6-10-6-10Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 12l2 2 3.5-3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Field Journal for Nature Lovers",
    body: "Document plants you find in the wild. GPS, photos, notes, and species data in one place.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="9.5" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M11 2.5C7.41 2.5 4.5 5.41 4.5 9c0 5.25 6.5 10.5 6.5 10.5S17.5 14.25 17.5 9c0-3.59-2.91-6.5-6.5-6.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Personal Botanical Archive",
    body: "Your lifetime plant collection. Track every species you encounter.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect
          x="3.5"
          y="4"
          width="15"
          height="14"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M3.5 8h15" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M7.5 4V2.5M14.5 4V2.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M7.5 12h7M7.5 15h4.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const GUIDES = [
  {
    title: "Temperate Deciduous",
    sub: "Identification of broad-leafed species",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 2C10 2 4 6 4 11a6 6 0 0 0 12 0c0-5-6-9-6-9Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <line
          x1="10"
          y1="11"
          x2="10"
          y2="18"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Coastal Flora",
    sub: "Survival strategies in saline environments",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M2 13c3-3 4-1 6-3s3-5 6-5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M2 17c3-3 4-1 6-3s3-5 6-5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Mycological Wonders",
    sub: "Guide to spores and mycelial networks",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M4 10c0-3.3 2.7-6 6-6s6 2.7 6 6H4Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <line
          x1="10"
          y1="10"
          x2="10"
          y2="16"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <line
          x1="8"
          y1="16"
          x2="12"
          y2="16"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* ── Nav ──────────────────────────────────────────── */}
      <header className={styles.nav}>
        <div className={styles.navInner}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <span className={styles.logoBadge}>
              <LeafMark size={18} />
            </span>
            <span className={styles.logoText}>Marka</span>
          </Link>

          <div className={styles.navRight}>
            <Link href="/signin" className={styles.navLink}>
              Sign in
            </Link>
            <Link href="/signup" className={styles.navSignUp}>
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero video ───────────────────────────────────── */}
      <section className={styles.hero}>
        <video autoPlay muted loop playsInline className={styles.heroVideo}>
          <source
            src={`${process.env.NEXT_PUBLIC_ASSETS_URL}/videos/hero-forest.mp4`}
            type="video/mp4"
          />
        </video>
        <div className={styles.heroOverlay} />
        <div className={styles.heroLoopFade} />
        <div className={styles.heroFadeIn} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroH1}>
            Your Field Journal for the
            <br />
            <em>Modern Naturalist</em>
          </h1>
          <p className={styles.heroSub}>
            Photograph any plant. Get its name, story, and everything about it — instantly.
          </p>
          <div className={styles.heroActions}>
            <Link href="/signup" className={styles.heroBtnPrimary}>
              Get started →
            </Link>
            <Link href="/signin" className={styles.heroBtnSecondary}>
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Value props ──────────────────────────────────── */}
      <section className={styles.valueProps}>
        <div className={styles.valuePropsInner}>
          {VALUE_PROPS.map((vp, i) => (
            <div
              key={vp.title}
              className={styles.valueProp}
              style={{ animationDelay: `${0.15 + i * 0.15}s` }}
            >
              <span className={styles.vpIcon}>{vp.icon}</span>
              <h3 className={styles.vpTitle}>{vp.title}</h3>
              <p className={styles.vpBody}>{vp.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Main content ─────────────────────────────────── */}
      <main className={styles.main}>
        <div className={styles.mainInner}>
          {/* Left: Recent Discoveries */}
          <section className={styles.content}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recent Discoveries</h2>
              <Link href="/signup" className={styles.viewAll}>
                View All
              </Link>
            </div>

            <div className={styles.discoveryGrid}>
              {PLANTS.map((plant, i) => (
                <Link href="/signup" key={`${plant.name}-${i}`} className={styles.plantCard}>
                  <div className={styles.plantImgWrap}>
                    <Image
                      src={plant.img}
                      alt={plant.name}
                      fill
                      className={styles.plantImg}
                      sizes="(max-width: 768px) 50vw, 280px"
                    />
                    <span className={styles.matchBadge}>{plant.match}% match</span>
                  </div>
                  <div className={styles.plantInfo}>
                    <h3 className={styles.plantName}>{plant.name}</h3>
                    <p className={styles.plantLatin}>{plant.latin}</p>
                    <p className={styles.plantDesc}>{plant.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Right: Sidebar */}
          <aside className={styles.sidebar}>
            {/* Field Guides */}
            <div className={styles.sideSection}>
              <h2 className={styles.sectionTitle}>Field Guides</h2>
              <div className={styles.guideList}>
                {GUIDES.map((g) => (
                  <Link href="/signup" key={g.title} className={styles.guideItem}>
                    <span className={styles.guideIcon}>{g.icon}</span>
                    <div>
                      <p className={styles.guideTitle}>{g.title}</p>
                      <p className={styles.guideSub}>{g.sub}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            {/* Community Highlights */}
            <div className={styles.sideSection}>
              <h2 className={styles.sectionTitle}>Community Highlights</h2>
              <div className={styles.communityCard}>
                <div className={styles.communityUser}>
                  <Image
                    src="/images/bianca-profile.png"
                    alt="Bianca Grossi"
                    width={36}
                    height={36}
                    className={styles.avatar}
                  />
                  <div>
                    <p className={styles.userName}>Bianca Grossi</p>
                    <p className={styles.userBadge}>Master Naturalist</p>
                  </div>
                </div>
                <p className={styles.communityQuote}>
                  &ldquo;Found a cluster of Rare Ghost Pipe (Monotropa uniflora) in the North Ridge
                  park today. First time seeing them this far south!&rdquo;
                </p>
                <p className={styles.communityLikes}>
                  <HeartIcon /> 124 likes
                </p>
              </div>
            </div>

            {/* CTA card */}
            <div className={styles.ctaCard}>
              <h3 className={styles.ctaTitle}>
                <em>Start Your Journal</em>
              </h3>
              <p className={styles.ctaBody}>
                Join over 50,000 nature enthusiasts cataloging the beauty of the wild. Record
                observations, get AI-assisted identification, and contribute to global biodiversity
                data.
              </p>
              <Link href="/signup" className={styles.ctaBtn}>
                Join the Community
              </Link>
            </div>
          </aside>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <Link href="/" className={styles.footerLogo}>
              <LeafMark size={22} />
              <span>Marka</span>
            </Link>
            <p className={styles.footerTagline}>
              Dedicated to the documentation and preservation of global biodiversity through the
              eyes of citizen scientists.
            </p>
          </div>

          <div className={styles.footerCol}>
            <p className={styles.footerColHead}>Explore</p>
            <Link href="/signup">Global Map</Link>
            <Link href="/signup">Species Database</Link>
            <Link href="/signup">Citizen Science Projects</Link>
          </div>

          <div className={styles.footerCol}>
            <p className={styles.footerColHead}>Notebook</p>
            <Link href="/signup">Observation Logs</Link>
            <Link href="/signup">Drafts</Link>
            <Link href="/signup">Equipment Guide</Link>
          </div>

          <div className={styles.footerCol}>
            <p className={styles.footerColHead}>Connect</p>
            <div className={styles.socialRow}>
              <a href="#" aria-label="Website">
                <GlobeIcon />
              </a>
              <a href="#" aria-label="Email">
                <MailIcon />
              </a>
              <a href="#" aria-label="Community">
                <ChatIcon />
              </a>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>© 2026 Marka Inc. All rights reserved.</span>
          <div className={styles.footerLegal}>
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function ProfileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }}
    >
      <path
        d="M6.5 11S1 7.5 1 4a2.5 2.5 0 0 1 5.5-.5A2.5 2.5 0 0 1 12 4c0 3.5-5.5 7-5.5 7Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M9 1.5C9 1.5 6 5 6 9s3 7.5 3 7.5M9 1.5C9 1.5 12 5 12 9s-3 7.5-3 7.5M1.5 9h15"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1.5" y="4" width="15" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="m1.5 4.5 7.5 5 7.5-5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M15 3H3a1.5 1.5 0 0 0-1.5 1.5v8A1.5 1.5 0 0 0 3 14h2l2 2.5L9 14h6a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 15 3Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
