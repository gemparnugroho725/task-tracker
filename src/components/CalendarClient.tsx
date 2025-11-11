'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@lib/supabaseBrowser';
import { getLocalUser } from '@lib/localSession';

type TaskEvent = {
	id: string;
	title: string;
	start: string;
};

export default function CalendarClient() {
	const supabase = createBrowserClient();
	const [events, setEvents] = useState<TaskEvent[]>([]);

	async function load(userId: string) {
		const { data } = await supabase
			.from('tasks')
			.select('id,title,due_at')
			.eq('user_id', userId)
			.not('due_at', 'is', null);
		setEvents(
			(data ?? []).map((t) => ({
				id: t.id as string,
				title: t.title as string,
				start: t.due_at as string
			}))
		);
	}

	useEffect(() => {
		const user = getLocalUser();
		if (!user) return;
		load(user.id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="bg-white border rounded p-2">
			<FullCalendar
				plugins={[dayGridPlugin, interactionPlugin]}
				initialView="dayGridMonth"
				events={events}
				height="auto"
			/>
		</div>
	);
}


