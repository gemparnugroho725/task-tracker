import dynamic from 'next/dynamic';
const CalendarClient = dynamic(() => import('./CalendarClient'), { ssr: false });
export default CalendarClient;


