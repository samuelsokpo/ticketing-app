import { useState } from 'react';
import { useAuth } from '../pages/_app';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { authFetch } from '../lib/authFetch';
import { openPaystackModal } from '../lib/paystack';

export default function PaystackCheckout({ event }: { event: any }) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  async function startCheckout() {
    if (!user) {
      alert('You must be logged in to buy a ticket.');
      router.push('/auth');
      return;
    }

    setLoading(true);
    try {
      const res = await authFetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id || event.slug, paymentMethod: 'paystack' }),
      });
      const data = await res.json();

      if (!data.ok) {
        alert(data.error || 'Error initializing payment');
        setLoading(false);
        return;
      }

      const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
      if (!paystackKey) {
        alert('Paystack key not configured');
        setLoading(false);
        return;
      }

      const opened = openPaystackModal({
        key: paystackKey,
        email: data.email || user.email || 'customer@example.com',
        amountInKobo: Math.round(data.amount * 100),
        reference: data.paymentRef,
        onSuccess: () => {
          setLoading(false);
          alert('Payment successful! Redirecting to your dashboard...');
          router.push('/dashboard');
        },
        onCancel: () => {
          setLoading(false);
        },
      });

      if (!opened) {
        alert('Payment gateway is loading. Please try clicking again in a moment.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'An error occurred during checkout');
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-start gap-4 max-w-sm mt-6">
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
      <div>
        <div className="text-xs font-mono text-slate-400 mb-1">TICKET PRICE</div>
        <div className="text-3xl font-bold text-white">₦{(event.price || 0).toLocaleString()}</div>
      </div>
      <button
        onClick={startCheckout}
        disabled={loading}
        className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#7E22CE] text-white font-bold text-sm shadow-glow hover:scale-[1.02] transition-all disabled:opacity-50"
      >
        {loading ? 'Processing...' : user ? 'Buy Ticket' : 'Sign in to buy'}
      </button>
    </div>
  );
}
