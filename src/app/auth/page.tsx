/* Client-only simple auth page for sign in/out */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@lib/supabaseBrowser';
import { getLocalUser, setLocalUser, clearLocalUser, onLocalUserChange } from '@lib/localSession';

export const dynamic = 'force-dynamic';

export default function AuthPage() {
	const supabase = createBrowserClient();
	const router = useRouter();
	const [username, setUsername] = useState('admin');
	const [password, setPassword] = useState('admin');
	const [currentUser, setCurrentUser] = useState(getLocalUser());
	const [busy, setBusy] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		const unsubscribe = onLocalUserChange((user) => setCurrentUser(user));
		return () => {
			unsubscribe();
		};
	}, []);

	return (
		<div className="max-w-md space-y-4">
			{currentUser ? (
				<div className="space-y-3">
					<div className="text-sm">Logged in as {currentUser.username}</div>
					<button
						className="px-3 py-2 bg-gray-200 rounded"
						onClick={() => {
							clearLocalUser();
							setCurrentUser(null);
						}}
					>
						Sign out
					</button>
				</div>
			) : (
				<div className="space-y-3">
					<div className="text-sm font-medium">Username & Password</div>
					<div className="flex flex-col gap-2">
						<input
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder="username"
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
								const { data, error } = await supabase
									.from('local_users')
									.select('user_id, username, password')
									.eq('username', username)
									.limit(1)
									.maybeSingle();
								if (error) {
									setMessage(error.message);
									setBusy(false);
									return;
								}
								if (!data || data.password !== password) {
									setMessage('Invalid username or password.');
									setBusy(false);
									return;
								}
								setLocalUser({ id: data.user_id, username: data.username });
								setCurrentUser({ id: data.user_id, username: data.username });
								router.replace('/');
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
								const existing = await supabase
									.from('local_users')
									.select('user_id, username')
									.eq('username', 'admin')
									.limit(1)
									.maybeSingle();
								let userId = existing.data?.user_id;
								if (!existing.data) {
									const inserted = await supabase
										.from('local_users')
										.insert({ username: 'admin', password: 'admin' })
										.select('user_id')
										.single();
									if (inserted.error) {
										setMessage(inserted.error.message);
										setBusy(false);
										return;
									}
									userId = inserted.data.user_id;
								}
								if (!userId) {
									setMessage('Failed to create admin user.');
									setBusy(false);
									return;
								}
								setLocalUser({ id: userId, username: 'admin' });
								setCurrentUser({ id: userId, username: 'admin' });
								router.replace('/');
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


