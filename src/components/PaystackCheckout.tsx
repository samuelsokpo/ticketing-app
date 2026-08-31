import { useState } from 'react';
import { useAuth } from '../pages/_app';
import { useRouter } from 'next/router';
import { authFetch } from '../lib/authFetch';

export default function PaystackCheckout({ event }: { event: any }) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  async function startCheckout() {
    if (!user) {
      router.push('/auth');
      return;
    }

    setLoading(true);
    try {
      const res = await authFetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id || event.slug }),
      });
      const data = await res.json();

      if (!data.ok) {
        alert(data.error || 'Error initializing payment');
        setLoading(false);
        return;
      }

      // Redirect to Paystack's hosted checkout page
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
        return; // keep loading state while redirecting
      }

      alert('Could not get payment URL. Please try again.');
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'An error occurred during checkout');
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-start gap-4 max-w-sm mt-6">
      <div>
        <div className="text-xs font-mono text-slate-400 mb-1">TICKET PRICE</div>
        <div className="text-3xl font-bold text-white">₦{(event.price || 0).toLocaleString()}</div>
      </div>
      <button
        onClick={startCheckout}
        disabled={loading}
        className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#7E22CE] text-white font-bold text-sm shadow-glow hover:scale-[1.02] transition-all disabled:opacity-50"
      >
        {loading ? 'Redirecting to payment...' : user ? 'Buy Ticket' : 'Sign in to buy'}
      </button>
    </div>
  );
}
