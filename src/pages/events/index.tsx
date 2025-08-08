import useSWR from 'swr';
import EventCard from '../../components/EventCard';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function EventsPage() {
  const { data } = useSWR('/api/events', fetcher);
  const { data: hot } = useSWR('/api/events/hot-takes', fetcher);

  return (
    <main className="p-6">
      <h2 className="text-3xl font-bold">Hot Takes</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {hot?.events?.map((e:any) => <EventCard key={e.id} event={e} />)}
      </div>

      <h2 className="text-3xl font-bold mt-8">All Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {data?.events?.map((e:any) => <EventCard key={e.id} event={e} />)}
      </div>
    </main>
  );
}
