import Link from 'next/link';
export default function EventCard({ event }: { event: any }) {
  return (
    <article className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)]">
      <h3 className="font-semibold text-lg">{event.title}</h3>
      <p className="text-sm text-slate-400">{new Date(event.startAt).toLocaleString()}</p>
      <p className="mt-2 text-sm">{event.location} • ₦{event.price}</p>
      <p className="mt-2 text-xs text-slate-400">
        {event.soldOut ? (
          <span className="text-red-500 font-bold">SOLD OUT</span>
        ) : (
          <span>{event.ticketsRemaining !== undefined ? `${event.ticketsRemaining} tickets left` : `${event.purchaseCount || event.purchases_last_24h || 0} bought`}</span>
        )}
      </p>
      <div className="mt-4">
        <Link href={`/events/${event.slug || event.id}`}>
          <a className={`text-sm font-medium ${event.soldOut ? 'opacity-50 cursor-not-allowed pointer-events-none text-slate-500' : ''}`}>
            {event.soldOut ? 'Sold Out' : 'View'}
          </a>
        </Link>
      </div>
    </article>
  );
}
