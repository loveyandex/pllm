import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Z Grok",
  description: "Grok-style AI layer over GitLab for Z company",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="border-b border-neutral-800 sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur">
          <div className="container-max flex items-center gap-4 py-3">
            <div className="h-8 w-8 rounded-md bg-neutral-900 border border-neutral-800" />
            <div className="text-lg font-semibold tracking-tight">Z Grok</div>
            <div className="ml-auto flex items-center gap-3 text-sm text-neutral-400">
              <a href="/" className="hover:text-white">Chat</a>
              <a href="/projects" className="hover:text-white">Projects</a>
            </div>
          </div>
        </header>
        <main className="container-max py-6">{children}</main>
      </body>
    </html>
  );
}
