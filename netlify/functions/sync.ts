import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

export const handler = async () => {
	const supabase = createClient(
		process.env.SUPABASE_URL as string,
		process.env.SUPABASE_SERVICE_ROLE_KEY as string
	);
	// Fetch users with tokens
	const { data: tokens, error } = await supabase
		.from('user_google_tokens')
		.select('user_id, access_token, refresh_token, expiry_date');
	if (error) {
		console.error(error);
		return { statusCode: 500, body: 'Failed to load tokens' };
	}

	for (const t of tokens || []) {
		try {
			const oauth2Client = new google.auth.OAuth2(
				process.env.GOOGLE_CLIENT_ID as string,
				process.env.GOOGLE_CLIENT_SECRET as string,
				process.env.GOOGLE_REDIRECT_URI as string
			);
			oauth2Client.setCredentials({
				access_token: t.access_token || undefined,
				refresh_token: t.refresh_token || undefined,
				expiry_date: t.expiry_date ? new Date(t.expiry_date).getTime() : undefined
			});
			// Refresh if needed
			try {
				await oauth2Client.getAccessToken();
			} catch {}

			const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

			// Push tasks without calendar_event_id and with due_at
			const { data: tasks } = await supabase
				.from('tasks')
				.select('id,title,due_at,calendar_event_id')
				.eq('user_id', t.user_id)
				.is('calendar_event_id', null)
				.not('due_at', 'is', null)
				.limit(50);

			for (const task of tasks || []) {
				const event = {
					summary: task.title as string,
					start: { dateTime: task.due_at as string },
					end: { dateTime: new Date(new Date(task.due_at as string).getTime() + 30 * 60 * 1000).toISOString() }
				};
				const created = await calendar.events.insert({
					calendarId: 'primary',
					requestBody: event
				});
				const eventId = created.data.id;
				if (eventId) {
					await supabase.from('tasks').update({ calendar_event_id: eventId }).eq('id', task.id as string);
				}
			}
		} catch (e) {
			console.error('sync error for user', t.user_id, e);
		}
	}

	return { statusCode: 200, body: 'ok' };
};


