/* Client-only simple auth page for sign in/out */
'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@lib/supabaseBrowser';

export const dynamic = 'force-dynamic';

export default function AuthPage() {
	const supabase = createBrowserClient();
	const [email, setEmail] = useState('');
	const [session, setSession] = useState<any>(null);
	const [loading, setLoading] = useState(true);

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
					<button
						className="px-3 py-2 bg-blue-600 text-white rounded"
						onClick={() =>
							supabase.auth.signInWithOAuth({
								provider: 'google',
								options: {
									scopes:
										'openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
									redirectTo: typeof window !== 'undefined' ? window.location.origin + '/auth' : undefined
								}
							})
						}
					>
						Sign in with Google
					</button>
					<div className="text-xs text-gray-600">
						Or sign in via magic link:
					</div>
					<div className="flex gap-2">
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="email@example.com"
							className="border rounded px-2 py-1 flex-1"
						/>
						<button
							className="px-3 py-2 bg-gray-800 text-white rounded"
							onClick={async () => {
								await supabase.auth.signInWithOtp({ email });
								alert('Check your email for the magic link.');
							}}
						>
							Send link
						</button>
					</div>
				</div>
			)}
		</div>
	);
}


