export type LocalUser = {
	id: string;
	username: string;
};

const STORAGE_KEY = 'task-tracker-user';
const EVENT_KEY = 'task-tracker-user-changed';

function isBrowser() {
	return typeof window !== 'undefined';
}

export function getLocalUser(): LocalUser | null {
	if (!isBrowser()) return null;
	const raw = window.localStorage.getItem(STORAGE_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as LocalUser;
	} catch {
		return null;
	}
}

export function setLocalUser(user: LocalUser) {
	if (!isBrowser()) return;
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
	window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: user }));
}

export function clearLocalUser() {
	if (!isBrowser()) return;
	window.localStorage.removeItem(STORAGE_KEY);
	window.dispatchEvent(new CustomEvent(EVENT_KEY));
}

export function onLocalUserChange(callback: (user: LocalUser | null) => void) {
	if (!isBrowser()) return () => {};
	const handler = (event: Event) => {
		const custom = event as CustomEvent<LocalUser | undefined>;
		callback(custom.detail ?? getLocalUser());
	};
	window.addEventListener(EVENT_KEY, handler as EventListener);
	const storageHandler = () => callback(getLocalUser());
	window.addEventListener('storage', storageHandler);
	return () => {
		window.removeEventListener(EVENT_KEY, handler as EventListener);
		window.removeEventListener('storage', storageHandler);
	};
}


