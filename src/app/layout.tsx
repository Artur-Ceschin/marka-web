import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { Providers } from "./providers";
import "@/styles/globals.scss";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Marka", template: "%s | Marka" },
  description: "Identify and track the plants around you.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
