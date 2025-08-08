import { useRouter } from 'next/router';
import useSWR from 'swr';
import PaystackCheckout from '../../components/PaystackCheckout';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function EventDetail() {
  const { query } = useRouter();
  const slug = query.slug as string;
  const { data } = useSWR(() => slug ? `/api/events?search=${slug}` : null, fetcher);
  const event = data?.events?.[0];

  if (!event) return <div className="p-6">Loading...</div>;

  return (
    <main className="p-6">
      <h1 className="text-4xl font-bold">{event.title}</h1>
      <p className="mt-4">{event.description}</p>
      <div className="mt-6">
        <PaystackCheckout event={event} />
      </div>
    </main>
  );
}
