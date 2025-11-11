'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getLocalUser, onLocalUserChange } from '@lib/localSession';

export default function AuthGuard() {
	const pathname = usePathname();
	const router = useRouter();
	const [checking, setChecking] = useState(true);

	useEffect(() => {
		// Allow unauthenticated access to /auth and /env
		if (pathname?.startsWith('/auth') || pathname?.startsWith('/env')) {
			setChecking(false);
			return;
		}
		const user = getLocalUser();
		if (!user) {
			router.replace('/auth');
			return;
		}
		setChecking(false);
		const unsubscribe = onLocalUserChange((next) => {
			if (!next) {
				router.replace('/auth');
			}
		});
		return () => {
			unsubscribe();
		};
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


