export const dynamic = 'force-dynamic';

export default function EnvPage() {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
		? (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string).slice(0, 8) + '...'
		: undefined;
	return (
		<div className="space-y-2">
			<h2 className="text-base font-semibold">Env check</h2>
			<div>NEXT_PUBLIC_SUPABASE_URL: {url || 'undefined'}</div>
			<div>NEXT_PUBLIC_SUPABASE_ANON_KEY: {anon || 'undefined'}</div>
			<p className="text-sm text-gray-600">
				Jika undefined, pastikan env sudah diset di Netlify (Site settings → Environment variables), lalu Clear cache and deploy.
			</p>
		</div>
	);
}


