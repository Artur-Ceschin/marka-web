import Image from 'next/image';
import Link from 'next/link';
import { LeafMark } from '@/components/MarkaLogo';
import { Marquee } from '@/components/Marquee';
import { Reveal } from '@/components/Reveal';
import { HeroVideo } from './_components/HeroVideo';
import { ScrolledHeader } from './_components/ScrolledHeader';
import { StatsCounter } from './_components/StatsCounter';
import styles from './page.module.scss';

const PLANTS = [
  {
    name: 'Araucaria araucana',
    latin: 'Monkey Puzzle Tree',
    tag: 'Conifer',
    match: 97,
    size: 'tall',
    desc: 'Ancient conifer native to the southern Andes. Its interlocking scale-like leaves and towering silhouette make it unmistakable against mountain skies.',
    img: '/images/plant-araucaria.jpg',
  },
  {
    name: 'Mycena galopus',
    latin: 'Milking Bonnet',
    tag: 'Fungi',
    match: 94,
    size: 'short',
    desc: 'Delicate white fungi found clustered on decaying bark. Exudes a milky sap when broken — a key identification trait.',
    img: '/images/plant-mycena.jpg',
  },
  {
    name: 'Lupinus polyphyllus',
    latin: 'Large-leaved Lupin',
    tag: 'Wildflower',
    match: 91,
    size: 'medium',
    desc: 'Dense spires of violet-blue flowers, naturalised across temperate meadows. Rich in nitrogen-fixing root nodules.',
    img: '/images/plant-lupin.jpg',
  },
  {
    name: 'Sequoiadendron giganteum',
    latin: 'Giant Sequoia',
    tag: 'Conifer',
    match: 88,
    size: 'short',
    desc: 'The largest tree by volume on Earth. Towering trunks with cinnamon-red bark can reach over 84 metres, living for thousands of years.',
    img: '/images/plant-sequoia.avif',
  },
  {
    name: 'Arctic Poppy',
    latin: 'Papaver radicatum',
    tag: 'Alpine',
    match: 97,
    size: 'short',
    desc: 'Observed in the rocky alpine tundra. Known for its resilient, vibrantly veined petals that track the path of the sun throughout the day.',
    img: '/images/plant-poppy.png',
  },
  {
    name: 'Common Juniper',
    latin: 'Juniperus communis',
    tag: 'Shrub',
    match: 92,
    size: 'tall',
    desc: 'A hardy evergreen shrub found across diverse northern latitudes. Berries exhibit a unique dusty blue-green bloom when ripe.',
    img: '/images/plant-juniper.png',
  },
];

const VALUE_PROPS = [
  {
    title: 'Honest Free Alternative',
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
    title: 'Field Journal for Nature Lovers',
    body: 'Document plants you find in the wild. GPS, photos, notes, and species data in one place.',
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
    title: 'Personal Botanical Archive',
    body: 'Your lifetime plant collection. Track every species you encounter.',
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
  {
    title: 'AI-Powered Identification',
    body: 'Snap a photo and get instant species recognition with confidence scores and detailed info.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M11 2v2M11 18v2M2 11h2M18 11h2M4.93 4.93l1.41 1.41M15.66 15.66l1.41 1.41M4.93 17.07l1.41-1.41M15.66 6.34l1.41-1.41"
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
    title: 'Temperate Deciduous',
    sub: 'Identification of broad-leafed species',
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
    title: 'Coastal Flora',
    sub: 'Survival strategies in saline environments',
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
    title: 'Mycological Wonders',
    sub: 'Guide to spores and mycelial networks',
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
      <ScrolledHeader className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoBadge}>
              <LeafMark size={18} />
            </span>
            <span className={styles.logoText}>Marka</span>
          </Link>

          <nav className={styles.navLinks}>
            <span className={styles.navItem}>Explore</span>
            <span className={styles.navItem}>Identify</span>
            <span className={styles.navItem}>Journal</span>
          </nav>

          <div className={styles.navRight}>
            <Link href="/signin" className={styles.navSignIn}>
              Sign in
            </Link>
            <Link href="/signup" className={styles.navGetStarted}>
              Get started
            </Link>
          </div>
        </div>
      </ScrolledHeader>

      {/* ── Hero video ───────────────────────────────────── */}
      <section className={styles.hero}>
        <HeroVideo
          src={`${process.env.NEXT_PUBLIC_ASSETS_URL}/videos/hero-forest.mp4`}
          poster={`${process.env.NEXT_PUBLIC_ASSETS_URL}/images/hero-forest-poster.jpg`}
        />
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

      {/* ── Marquee ──────────────────────────────────────── */}
      <div className={styles.marqueeBand}>
        <Marquee />
      </div>

      {/* ── Value props ──────────────────────────────────── */}
      <section className={styles.valueProps}>
        <div className={styles.valuePropsInner}>
          {VALUE_PROPS.map((vp, i) => (
            <Reveal key={vp.title} className={styles.valueProp} delay={i * 120}>
              <div className={styles.vpHeader}>
                <span className={styles.vpIcon}>{vp.icon}</span>
                <span className={styles.vpNum}>{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3 className={styles.vpTitle}>{vp.title}</h3>
              <p className={styles.vpBody}>{vp.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <Reveal>
        <StatsCounter />
      </Reveal>

      {/* ── Main content ─────────────────────────────────── */}
      <main className={styles.main}>
        <div className={styles.mainInner}>
          {/* Left: Recent Discoveries */}
          <section className={styles.content}>
            <p className={styles.sectionMeta}>
              <span className={styles.liveDot} />
              Field Log · {PLANTS.length} species
            </p>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recent Discoveries</h2>
              <Link href="/signup" className={styles.viewAll}>
                View All
              </Link>
            </div>

            <div className={styles.discoveryGrid}>
              {[0, 1].map((col) => (
                <div key={col} className={styles.discoveryCol}>
                  {PLANTS.filter((_, i) => i % 2 === col).map((plant) => {
                    const i = PLANTS.indexOf(plant);
                    return (
                      <Reveal key={`${plant.name}-${i}`} delay={i * 70}>
                        <Link href="/signup" className={styles.plantCard} data-size={plant.size}>
                          <div className={styles.plantImgWrap}>
                            <Image
                              src={plant.img}
                              alt={plant.name}
                              fill
                              className={styles.plantImg}
                              sizes="(max-width: 768px) 50vw, 280px"
                            />
                          </div>
                          <span className={styles.cardNum}>{String(i + 1).padStart(2, '0')}</span>
                          <span className={styles.matchBadge}>
                            <span
                              className={styles.matchDot}
                              data-tier={
                                plant.match >= 90 ? 'high' : plant.match >= 80 ? 'mid' : 'low'
                              }
                            />
                            {plant.match}%
                          </span>
                          <div className={styles.plantInfo}>
                            <span className={styles.plantTag}>{plant.tag}</span>
                            <h3 className={styles.plantName}>{plant.name}</h3>
                            <p className={styles.plantLatin}>{plant.latin}</p>
                            <p className={styles.plantDesc}>{plant.desc}</p>
                          </div>
                        </Link>
                      </Reveal>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>

          {/* Right: Sidebar */}
          <aside className={styles.sidebar}>
            {/* Field Guides */}
            <Reveal className={styles.sideSection}>
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
            </Reveal>
            {/* Community Highlights */}
            <Reveal className={styles.sideSection} delay={80}>
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
            </Reveal>

            {/* CTA card */}
            <Reveal delay={160}>
              <div className={styles.ctaCard}>
                <h3 className={styles.ctaTitle}>
                  <em>Start Your Journal</em>
                </h3>
                <p className={styles.ctaBody}>
                  Join over 50,000 nature enthusiasts cataloging the beauty of the wild. Record
                  observations, get AI-assisted identification, and contribute to global
                  biodiversity data.
                </p>
                <Link href="/signup" className={styles.ctaBtn}>
                  Join the Community
                </Link>
              </div>
            </Reveal>
          </aside>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <Link href="/" className={styles.footerLogo}>
              <span className={styles.footerLogoBadge}>
                <LeafMark size={16} />
              </span>
              <span>Marka</span>
            </Link>
            <p className={styles.footerTagline}>
              Your field journal for the modern naturalist. Document every species you encounter.
            </p>
          </div>

          <div className={styles.footerCol}>
            <p className={styles.footerColHead}>Product</p>
            <Link href="/signup">Identify</Link>
            <Link href="/signup">Explore</Link>
            <Link href="/signup">Field Journal</Link>
            <Link href="/signup">Species Database</Link>
          </div>

          <div className={styles.footerCol}>
            <p className={styles.footerColHead}>Community</p>
            <Link href="/signup">Global Map</Link>
            <Link href="/signup">Citizen Science</Link>
            <Link href="/signup">Guides</Link>
          </div>

          <div className={styles.footerCol}>
            <p className={styles.footerColHead}>Company</p>
            <Link href="#">About</Link>
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>© 2026 Marka Inc.</span>
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
      </footer>
    </div>
  );
}

function HeartIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }}
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
