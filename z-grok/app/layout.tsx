import "./globals.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";

export const metadata: Metadata = {
	title: "Z Grok",
	description: "Grok-style AI layer over GitLab for Z company"
};

export default function RootLayout({
	children
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className={GeistSans.className}>
			<body>
				<header className="border-b border-[var(--border)] sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur">
					<div className="container-max flex items-center gap-4 py-3">
						<div className="h-8 w-8 rounded-md bg-[var(--muted)]" />
						<div className="text-lg font-semibold tracking-tight">Z Grok</div>
						<div className="ml-auto flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
							<a href="/" className="hover:text-[var(--foreground)]">Chat</a>
							<a href="/projects" className="hover:text-[var(--foreground)]">Projects</a>
						</div>
					</div>
				</header>
				<main className="container-max py-6">{children}</main>
			</body>
		</html>
	);
}