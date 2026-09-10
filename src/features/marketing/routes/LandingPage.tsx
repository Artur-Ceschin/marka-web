import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';

import { Capabilities } from '../components/Capabilities';
import { ClosingCta } from '../components/ClosingCta';
import { Connect } from '../components/Connect';
import { GoalBand } from '../components/GoalBand';
import { Hero } from '../components/Hero';

export function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Capabilities />
        <GoalBand />
        <Connect />
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  );
}
