'use client';

import { createBrowserClient } from '@lib/supabaseBrowser';

export default function StartGoogleButton() {
	const supabase = createBrowserClient();
	return (
		<div className="text-sm text-gray-600">
			<button
				className="px-3 py-2 bg-blue-600 text-white rounded"
				onClick={async () => {
					const { data: { user } } = await supabase.auth.getUser();
					if (!user) {
						alert('Please sign in first.');
						return;
					}
					const res = await fetch('/api/google/start?user_id=' + encodeURIComponent(user.id), {
						method: 'POST'
					});
					const d = await res.json();
					if (d.url) window.location.href = d.url;
				}}
			>
				Connect Google Calendar
			</button>
		</div>
	);
}


