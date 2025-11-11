import Calendar from '@components/Calendar';
import TaskForm from '@components/TaskForm';
import TaskList from '@components/TaskList';
import StartGoogleButton from '@components/StartGoogleButton';

export default function Page() {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<section className="space-y-4">
				<h2 className="text-base font-semibold">Tasks</h2>
				<TaskForm />
				<TaskList />
			</section>
			<section className="space-y-4">
				<h2 className="text-base font-semibold">Calendar</h2>
				<Calendar />
				<StartGoogleButton />
			</section>
		</div>
	);
}


