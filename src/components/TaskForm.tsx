'use client';

import { useState } from 'react';
import { createBrowserClient } from '@lib/supabaseBrowser';

export default function TaskForm() {
	const supabase = createBrowserClient();
	const [title, setTitle] = useState('');
	const [dueAt, setDueAt] = useState('');
	const [saving, setSaving] = useState(false);

	async function addTask() {
		if (!title) return;
		setSaving(true);
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) {
			alert('Please sign in first.');
			setSaving(false);
			return;
		}
		await supabase.from('tasks').insert({
			user_id: user.id,
			title,
			due_at: dueAt ? new Date(dueAt).toISOString() : null
		});
		setTitle('');
		setDueAt('');
		setSaving(false);
	}

	return (
		<div className="bg-white border rounded p-3">
			<div className="flex flex-col gap-2">
				<input
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Task title"
					className="border rounded px-2 py-1"
				/>
				<input
					type="datetime-local"
					value={dueAt}
					onChange={(e) => setDueAt(e.target.value)}
					className="border rounded px-2 py-1"
				/>
				<button
					disabled={saving}
					onClick={addTask}
					className="self-start px-3 py-2 bg-green-600 text-white rounded disabled:opacity-50"
				>
					Add task
				</button>
			</div>
		</div>
	);
}


