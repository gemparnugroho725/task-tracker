/* Client-only simple auth page for sign in/out */
'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@lib/supabaseBrowser';

export const dynamic = 'force-dynamic';

export default function AuthPage() {
	const supabase = createBrowserClient();
	const [email, setEmail] = useState('admin@local');
	const [password, setPassword] = useState('admin');
	const [session, setSession] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [busy, setBusy] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		supabase.auth.getSession().then(({ data }) => {
			setSession(data.session);
			setLoading(false);
		});
		const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
		return () => sub.subscription.unsubscribe();
	}, [supabase]);

	if (loading) return <div>Loading...</div>;

	return (
		<div className="max-w-md space-y-4">
			{session ? (
				<div className="space-y-3">
					<div className="text-sm">Logged in as {session.user.email}</div>
					<button
						className="px-3 py-2 bg-gray-200 rounded"
						onClick={() => supabase.auth.signOut()}
					>
						Sign out
					</button>
				</div>
			) : (
				<div className="space-y-3">
					<div className="text-sm font-medium">Email & Password</div>
					<div className="flex flex-col gap-2">
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="email@example.com"
							className="border rounded px-2 py-1"
						/>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="password"
							className="border rounded px-2 py-1"
						/>
					</div>
					<div className="flex items-center gap-2">
						<button
							disabled={busy}
							className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
							onClick={async () => {
								setBusy(true);
								setMessage(null);
								const { error } = await supabase.auth.signInWithPassword({ email, password });
								if (error) setMessage(error.message);
								setBusy(false);
							}}
						>
							Sign in
						</button>
						<button
							disabled={busy}
							className="px-3 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
							onClick={async () => {
								setBusy(true);
								setMessage(null);
								// Create admin user (admin@local/admin) if not exists, then sign in
								const signup = await supabase.auth.signUp({ email: 'admin@local', password: 'admin' });
								if (signup.error && !signup.error.message.includes('already registered')) {
									setMessage(signup.error.message);
									setBusy(false);
									return;
								}
								const { error } = await supabase.auth.signInWithPassword({ email: 'admin@local', password: 'admin' });
								if (error) setMessage(error.message);
								setBusy(false);
							}}
						>
							Create admin and sign in
						</button>
					</div>
					{message && <div className="text-sm text-red-600">{message}</div>}
				</div>
			)}
		</div>
	);
}


