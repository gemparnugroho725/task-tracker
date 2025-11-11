import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import AuthGuard from '@components/AuthGuard';

export const metadata: Metadata = {
	title: 'Task Tracker',
	description: 'Tasks tracking with Google Calendar sync'
};

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body>
				<AuthGuard />
				<div className="min-h-screen">
					<header className="border-b bg-white">
						<div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
							<h1 className="text-lg font-semibold">Task Tracker</h1>
							<nav className="flex gap-3 text-sm">
								<a href="/" className="hover:underline">Dashboard</a>
								<a href="/auth" className="hover:underline">Auth</a>
							</nav>
						</div>
					</header>
					<main className="mx-auto max-w-5xl px-4 py-6">
						{children}
					</main>
				</div>
			</body>
		</html>
	);
}


