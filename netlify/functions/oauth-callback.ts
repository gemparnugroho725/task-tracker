import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

export const handler = async (event: any) => {
	try {
		const params = new URLSearchParams(event.rawQuery || '');
		const code = params.get('code');
		const stateRaw = params.get('state') || '';
		const state = JSON.parse(decodeURIComponent(stateRaw || '%7B%7D'));
		const userId = state?.userId as string | undefined;
		if (!code || !userId) {
			return { statusCode: 400, body: 'Missing code or userId' };
		}

		const clientId = process.env.GOOGLE_CLIENT_ID as string;
		const clientSecret = process.env.GOOGLE_CLIENT_SECRET as string;
		const redirectUri = process.env.GOOGLE_REDIRECT_URI as string;
		const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
		const { tokens } = await oauth2Client.getToken(code);

		const supabase = createClient(
			process.env.SUPABASE_URL as string,
			process.env.SUPABASE_SERVICE_ROLE_KEY as string
		);

		const { error } = await supabase.from('user_google_tokens').upsert({
			user_id: userId,
			access_token: tokens.access_token,
			refresh_token: tokens.refresh_token,
			expiry_date: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
			scope: tokens.scope || null,
			token_type: tokens.token_type || null
		});
		if (error) {
			console.error(error);
			return { statusCode: 500, body: 'Failed to save tokens' };
		}
		const redirect = (state?.origin as string | undefined) || '/';
		return { statusCode: 302, headers: { Location: redirect }, body: '' };
	} catch (e: any) {
		console.error(e);
		return { statusCode: 500, body: 'Server error' };
	}
};


