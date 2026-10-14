import type { Metadata } from "next";
import { Inter, Cinzel, Great_Vibes, Cormorant_Garamond } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
// Certificate fonts, exposed as CSS variables for CertificateTemplate.
const cinzel = Cinzel({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-cinzel" });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-great-vibes" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-cormorant" });

export const metadata: Metadata = {
  title: "C Cube | Character • Competence • Culture",
  description: "C Cube — Character, Competence, and Culture | VIT Pune",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cinzel.variable} ${greatVibes.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
