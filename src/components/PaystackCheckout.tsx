import { useState } from 'react';
import { useAuth } from '../pages/_app';
import { useRouter } from 'next/router';
import Script from 'next/script';

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
      // create purchase intent securely with authenticated backend
      const res = await fetch('/api/purchase', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ eventId: event.id, paymentMethod: 'paystack' }) 
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

      // open Paystack checkout
      const handler = (window as any).PaystackPop?.setup({
        key: paystackKey,
        email: user.email || 'customer@example.com',
        amount: Math.round(data.amount * 100),
        reference: data.paymentRef,
        onClose: () => { setLoading(false); },
        callback: (res: any) => {
          setLoading(false);
          router.push('/dashboard');
        }
      });
      
      if (handler) {
        handler.openIframe();
      } else {
        alert('Paystack failed to load. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-start gap-4 max-w-sm mt-6">
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
      <div>
        <div className="text-xs font-mono text-slate-400 mb-1">TICKET PRICE</div>
        <div className="text-3xl font-bold text-white">₦{event.price.toLocaleString()}</div>
      </div>
      <button 
        onClick={startCheckout} 
        disabled={loading || !user} 
        className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#7E22CE] text-white font-bold text-sm shadow-glow hover:scale-[1.02] transition-all disabled:opacity-50"
      >
        {loading ? 'Processing...' : (user ? 'Buy Ticket' : 'Sign in to buy')}
      </button>
    </div>
  );
}
