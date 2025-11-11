import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(req: NextRequest) {
	const origin = req.headers.get('origin') || '';
	const { searchParams } = new URL(req.url);
	const userId = searchParams.get('user_id') || '';

	const clientId = process.env.GOOGLE_CLIENT_ID!;
	const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
	const redirectUri = process.env.GOOGLE_REDIRECT_URI!;

	const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
	const url = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		prompt: 'consent',
		scope: [
			'openid',
			'email',
			'profile',
			'https://www.googleapis.com/auth/calendar',
			'https://www.googleapis.com/auth/calendar.events'
		],
		state: encodeURIComponent(JSON.stringify({ userId, origin }))
	});
	return NextResponse.json({ url });
}


