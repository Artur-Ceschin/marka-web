import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { LandingPage } from '@/features/marketing/routes/LandingPage';

export function App() {
  return (
    <ThemeProvider>
      <LandingPage />
    </ThemeProvider>
  );
}
