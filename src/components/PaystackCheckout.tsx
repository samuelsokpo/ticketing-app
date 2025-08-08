import { useState } from 'react';

export default function PaystackCheckout({ event }: { event: any }) {
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    setLoading(true);
    // create purchase intent
    const res = await fetch('/api/purchase', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId: event.id, paymentMethod: 'paystack' }) });
    const j = await res.json();
    if (!j.ok) { alert('Error'); setLoading(false); return; }
    // initialize Paystack using their inline script
    const { paymentRef, amount } = j;
    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    // open Paystack checkout
    const handler = (window as any).PaystackPop?.setup({
      key: paystackKey,
      email: 'customer@example.com',
      amount: Math.round(amount * 100),
      reference: paymentRef,
      onClose: () => { setLoading(false); },
      callback: (res: any) => {
        // optionally verify on server
        setLoading(false);
        alert('Payment Completed');
      }
    });
    handler && handler.openIframe();
  }

  return (
    <div>
      <div className="text-lg">Price: ₦{event.price}</div>
      <button onClick={startCheckout} disabled={loading} className="mt-4 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500">{loading ? 'Processing...' : 'Buy Ticket'}</button>
      <script src="https://js.paystack.co/v1/inline.js"></script>
    </div>
  );
}
