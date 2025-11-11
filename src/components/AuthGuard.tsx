'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@lib/supabaseBrowser';
import { usePathname, useRouter } from 'next/navigation';

export default function AuthGuard() {
	const pathname = usePathname();
	const router = useRouter();
	const supabase = createBrowserClient();
	const [checking, setChecking] = useState(true);

	useEffect(() => {
		// Allow unauthenticated access to /auth and /env
		if (pathname?.startsWith('/auth') || pathname?.startsWith('/env')) {
			setChecking(false);
			return;
		}
		supabase.auth.getSession().then(({ data }) => {
			if (!data.session) {
				router.replace('/auth');
			} else {
				setChecking(false);
			}
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname]);

	if (checking) {
		return (
			<div className="fixed inset-0 flex items-center justify-center bg-white/70">
				<div className="text-sm text-gray-700">Checking session...</div>
			</div>
		);
	}
	return null;
}


