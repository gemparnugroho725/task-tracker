import { createClient } from '@supabase/supabase-js';

export const handler = async (event: any) => {
	try {
		const username = (event.queryStringParameters?.username as string) || 'admin';
		const password = (event.queryStringParameters?.password as string) || 'admin';

		const supabaseUrl = process.env.SUPABASE_URL as string;
		const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
		if (!supabaseUrl || !serviceRoleKey) {
			return { statusCode: 500, body: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' };
		}

		const supabase = createClient(supabaseUrl, serviceRoleKey);

		const existing = await supabase
			.from('local_users')
			.select('user_id')
			.eq('username', username)
			.maybeSingle();

		if (existing.data) {
			const update = await supabase
				.from('local_users')
				.update({ password })
				.eq('user_id', existing.data.user_id);
			if (update.error) {
				return { statusCode: 500, body: 'Failed to update user: ' + update.error.message };
			}
			return { statusCode: 200, body: `Updated password for ${username}` };
		}

		const insert = await supabase
			.from('local_users')
			.insert({ username, password })
			.select('user_id')
			.single();
		if (insert.error) {
			return { statusCode: 500, body: 'Failed to insert user: ' + insert.error.message };
		}

		return { statusCode: 200, body: `Seeded user ${username}` };
	} catch (e: any) {
		return { statusCode: 500, body: 'Server error: ' + (e?.message || 'unknown') };
	}
};


