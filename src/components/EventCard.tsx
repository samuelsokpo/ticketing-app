import Link from 'next/link';
export default function EventCard({ event }: { event: any }) {
  return (
    <article className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)]">
      <h3 className="font-semibold text-lg">{event.title}</h3>
      <p className="text-sm text-slate-400">{new Date(event.startAt).toLocaleString()}</p>
      <p className="mt-2 text-sm">{event.location} • ₦{event.price}</p>
      <p className="mt-2 text-xs text-slate-400">{event.purchaseCount || event.purchases_last_24h || 0} bought</p>
      <div className="mt-4">
        <Link href={`/events/${event.slug || event.id}`}><a className="text-sm font-medium">View</a></Link>
      </div>
    </article>
  );
}
