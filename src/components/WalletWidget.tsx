import { useState } from 'react';
import useSWR from 'swr';
import { useAuth } from '../pages/_app';
import { Wallet, Plus, X, Loader2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function WalletWidget() {
  const { session, user } = useAuth();
  const { data: dashboardData, mutate } = useSWR(session?.user ? '/api/user/dashboard' : null, fetcher);
  const [isOpen, setIsOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number | ''>('');
  const [isToppingUp, setIsToppingUp] = useState(false);

  if (!session || !user) return null;

  const walletBalance = dashboardData?.walletBalance || 0;

  const handleTopUp = async () => {
    if (!topUpAmount || topUpAmount < 1000) {
      alert("Minimum top up is ₦1,000");
      return;
    }

    setIsToppingUp(true);
    try {
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: topUpAmount })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      const paystack = new (window as any).PaystackPop();
      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: data.email,
        amount: Number(topUpAmount) * 100, // kobo
        reference: data.paymentRef,
        onSuccess: () => {
          alert('Top up successful!');
          setTopUpAmount('');
          setIsOpen(false);
          mutate(); // refresh data
        },
        onCancel: () => {
          console.log('Payment cancelled');
        }
      });
    } catch (err: any) {
      alert(err.message || "Failed to initiate top up");
    } finally {
      setIsToppingUp(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 glass-panel px-3 py-1.5 rounded-full border border-[#9333EA]/30 hover:border-[#9333EA]/60 transition-all shadow-glow"
      >
        <Wallet size={14} className="text-[#A855F7]" />
        <span className="font-bold text-white text-xs">₦{walletBalance.toLocaleString()}</span>
        <Plus size={14} className="text-white ml-1" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 p-4 rounded-2xl bg-[#0B0D12] border border-[#9333EA]/30 shadow-2xl z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wallet size={14} className="text-[#A855F7]" /> Wallet
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          </div>
          
          <div className="mb-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Available Balance</span>
            <div className="text-2xl font-bold text-white font-mono">
              ₦{walletBalance.toLocaleString()}
            </div>
          </div>

          <div className="space-y-2">
            <input 
              type="number"
              placeholder="Min ₦1000"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value ? Number(e.target.value) : '')}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#9333EA]/50 font-mono"
            />
            <button 
              onClick={handleTopUp}
              disabled={isToppingUp}
              className="w-full px-4 py-2 bg-[#9333EA] hover:bg-[#7E22CE] text-white rounded-lg text-sm font-bold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isToppingUp ? <Loader2 size={16} className="animate-spin" /> : 'Top Up Balance'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
