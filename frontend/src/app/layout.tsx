import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import { SearchBox } from "@/components/search-box";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "aaltamar12 — GitHub profile",
  description: "Perfil de GitHub de Alfonso Altamar, servido en vivo desde un endpoint propio en NestJS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-14 sm:py-24">
          <div className="w-full max-w-[640px]">
            <SearchBox />
          </div>
          <div className="mt-4 w-full max-w-[640px] flex flex-col items-start">
            {children}
          </div>
          <p className="mt-6 w-full max-w-[640px] px-1 text-[11.5px] leading-relaxed text-ink-faint">
            Backend en NestJS · datos en vivo desde la API pública de GitHub ·
            sin caché.
          </p>
        </main>
      </body>
    </html>
  );
}
