'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@lib/supabaseBrowser';
import { getLocalUser } from '@lib/localSession';

type Task = {
	id: string;
	title: string;
	status: 'open' | 'done';
	due_at: string | null;
	calendar_event_id: string | null;
};

export default function TaskList() {
	const supabase = createBrowserClient();
	const [tasks, setTasks] = useState<Task[]>([]);

	async function load(userId: string) {
		const { data } = await supabase
			.from('tasks')
			.select('*')
			.eq('user_id', userId)
			.order('created_at', { ascending: false });
		setTasks(data ?? []);
	}

	useEffect(() => {
		const user = getLocalUser();
		if (!user) return;
		load(user.id);
		const channel = supabase
			.channel('public:tasks')
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` },
				() => load(user.id)
			)
			.subscribe();
		return () => {
			channel.unsubscribe();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function toggleDone(task: Task) {
		await supabase.from('tasks').update({ status: task.status === 'done' ? 'open' : 'done' }).eq('id', task.id);
	}

	async function removeTask(id: string) {
		await supabase.from('tasks').delete().eq('id', id);
	}

	return (
		<div className="bg-white border rounded p-3">
			<ul className="divide-y">
				{tasks.map((t) => (
					<li key={t.id} className="py-2 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<input type="checkbox" checked={t.status === 'done'} onChange={() => toggleDone(t)} />
							<div>
								<div className={t.status === 'done' ? 'line-through' : ''}>{t.title}</div>
								{t.due_at && <div className="text-xs text-gray-500">Due: {new Date(t.due_at).toLocaleString()}</div>}
							</div>
						</div>
						<button className="text-sm text-red-600" onClick={() => removeTask(t.id)}>Delete</button>
					</li>
				))}
				{tasks.length === 0 && <li className="py-2 text-sm text-gray-500">No tasks yet.</li>}
			</ul>
		</div>
	);
}


