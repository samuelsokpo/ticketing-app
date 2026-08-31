import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { useAuth } from './_app';
import { supabase } from '../lib/supabase';
import { authFetch } from '../lib/authFetch';
import {
  Ticket,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  LogOut,
  Home,
  Compass,
  Heart,
  Settings,
  Trophy,
  Gift,
  Star,
  Crown,
  Diamond,
  ArrowRight,
  Loader2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

/* ─── Milestone tiers ─── */
const milestones = [
  { id: 'bronze', label: 'Bronze', icon: <Trophy size={18} />, tickets: 3, reward: '5% Discount', color: '#CD7F32', progress: 0 },
  { id: 'silver', label: 'Silver', icon: <Star size={18} />, tickets: 10, reward: '15% Discount', color: '#C0C0C0', progress: 0 },
  { id: 'gold', label: 'Gold', icon: <Crown size={18} />, tickets: 25, reward: 'Free Ticket', color: '#E5C07B', progress: 0 },
  { id: 'diamond', label: 'Diamond', icon: <Diamond size={18} />, tickets: 50, reward: 'VIP Upgrade', color: '#A855F7', progress: 0 },
];

/* ─── Mock data (removed mockStats in favor of API) ─── */

/* ─── Upcoming events data ─── */
const upcomingEvents: any[] = [];

export default function Dashboard() {
  const router = useRouter();
  const { session, user, loading } = useAuth();
  const [activeNav, setActiveNav] = useState('home');

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !session) {
      router.push('/auth');
    }
  }, [session, loading, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Fetch dashboard stats
  const fetcher = (url: string) => authFetch(url).then(res => res.json());
  const { data: dashboardData, mutate } = useSWR(session ? '/api/user/dashboard' : null, fetcher);

  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);

  // Handle payment callback result from URL query params
  useEffect(() => {
    const { payment, msg } = router.query;
    if (payment === 'success') {
      setPaymentMessage('🎉 Payment successful! Your ticket has been confirmed.');
      mutate(); // refresh dashboard data
      // Clean up URL
      router.replace('/dashboard', undefined, { shallow: true });
    } else if (payment === 'failed') {
      setPaymentMessage(`❌ Payment failed: ${msg || 'Please try again.'}`);  
      router.replace('/dashboard', undefined, { shallow: true });
    } else if (payment === 'error') {
      setPaymentMessage(`⚠️ Payment verification error: ${msg || 'Please contact support.'}`);  
      router.replace('/dashboard', undefined, { shallow: true });
    }
  }, [router.query]);

  // Calculate milestone progress
  const userTickets = dashboardData?.ticketsPurchased || 0;
  const computedMilestones = milestones.map((m) => ({
    ...m,
    progress: Math.min((userTickets / m.tickets) * 100, 100),
    unlocked: userTickets >= m.tickets,
  }));

  // Current tier
  const currentTier = [...computedMilestones].reverse().find((m) => m.unlocked);
  const nextTier = computedMilestones.find((m) => !m.unlocked);

  if (loading || !session || !dashboardData) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#9333EA] animate-spin" />
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userAvatar = user?.user_metadata?.avatar_url;

  return (
    <>
      <Head>
        <title>Dashboard — OKPO</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Your OKPO dashboard — track tickets, events, and rewards." />
      </Head>

      <div className="min-h-screen bg-[#0B0D12] text-slate-100 flex overflow-x-hidden w-full">

        {/* ═══════════════════════════ */}
        {/* Sidebar (Desktop)           */}
        {/* ═══════════════════════════ */}
        <aside className="hidden lg:flex w-20 min-h-screen flex-col items-center py-8 border-r border-white/5 flex-shrink-0">
          {/* Logo */}
          <Link href="/" className="relative w-10 h-10 mb-8 block">
            <Image src="/okpo_logo.png" alt="OKPO" fill className="object-contain" />
          </Link>

          {/* Nav Icons */}
          <nav className="flex flex-col items-center gap-4 flex-1">
            {[
              { id: 'home', icon: <Home size={20} />, label: 'Home' },
              { id: 'explore', icon: <Compass size={20} />, label: 'Explore' },
              { id: 'tickets', icon: <Ticket size={20} />, label: 'Tickets' },
              { id: 'favorites', icon: <Heart size={20} />, label: 'Favorites' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                title={item.label}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  activeNav === item.id
                    ? 'bg-[#9333EA]/20 text-[#A855F7]'
                    : 'text-slate-500 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.icon}
              </button>
            ))}
          </nav>

          {/* Bottom */}
          <div className="flex flex-col items-center gap-4">
            <button title="Settings" className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-white/5 hover:text-white transition-all">
              <Settings size={20} />
            </button>
            <button onClick={handleLogout} title="Logout" className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </aside>


        {/* ═══════════════════════════ */}
        {/* Main Content                */}
        {/* ═══════════════════════════ */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1200px] mx-auto w-full pb-24 lg:pb-10">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10"
          >
            <div>
              <h1 className="text-xl sm:text-2xl font-editorial font-bold text-white">
                Welcome back, <span className="text-[#A855F7]">{userName}</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Here&apos;s what&apos;s happening with your events.</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/" className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-slate-300 hover:text-white transition-all">
                Home
              </Link>
              <div className="flex items-center gap-2.5 glass-panel pl-2 pr-3 sm:pr-4 py-1.5 rounded-full border border-[#9333EA]/30">
                {userAvatar ? (
                  <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-[#9333EA]/40">
                    <Image src={userAvatar} alt={userName} fill unoptimized className="object-cover" />
                  </div>
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#9333EA] to-[#E5C07B] flex items-center justify-center text-xs font-bold text-white">
                    {userName[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col text-xs">
                  <span className="font-semibold text-white max-w-[100px] sm:max-w-[120px] truncate">{userName}</span>
                  <span className="text-[9px] sm:text-[10px] text-[#A855F7] font-mono">
                    {currentTier ? `${currentTier.label.toUpperCase()} MEMBER` : 'NEW MEMBER'}
                  </span>
                </div>
              </div>
              <button onClick={handleLogout} title="Logout" className="lg:hidden w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all border border-white/10">
                <LogOut size={16} />
              </button>
            </div>
          </motion.div>



          {/* ─── Payment Result Banner ─── */}
          {paymentMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-xl border text-sm font-medium ${
                paymentMessage.includes('successful')
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              {paymentMessage}
              <button
                onClick={() => setPaymentMessage(null)}
                className="ml-4 text-xs underline opacity-70 hover:opacity-100"
              >
                Dismiss
              </button>
            </motion.div>
          )}

          {/* ─── Stats Cards ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-10">
            {/* Total Spent Card (Special) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-[#9333EA]/20 to-[#0B0D12] border border-[#9333EA]/30 hover:border-[#9333EA]/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#9333EA]/20 text-[#A855F7] flex items-center justify-center">
                    <DollarSign size={18} />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-mono text-slate-500 uppercase">Total</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white font-mono mb-0.5">
                  ₦{(dashboardData?.totalSpent || 0).toLocaleString()}
                </div>
                <div className="text-xs text-slate-400">Money Spent</div>
              </div>
            </motion.div>

            {[
              {
                label: 'Tickets Bought',
                value: (dashboardData?.ticketsPurchased || 0).toString(),
                icon: <Ticket size={18} />,
                accent: '#E5C07B',
                sub: 'All time',
              },
              {
                label: 'Upcoming Events',
                value: upcomingEvents.length.toString(),
                icon: <Calendar size={18} />,
                accent: '#9333EA',
                sub: 'This month',
              },
              {
                label: 'Free Ticket Progress',
                value: `${dashboardData?.progressPercent || 0}%`,
                icon: <Gift size={18} />,
                accent: '#CD7F32',
                sub: 'Spend ₦50k for free',
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i + 1) * 0.1 }}
                className="p-4 sm:p-6 rounded-2xl glass-panel border border-white/10 hover:border-white/20 transition-all group flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.accent}15`, color: stat.accent }}
                  >
                    {stat.icon}
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-mono text-slate-500 uppercase">{stat.sub}</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white font-mono mb-0.5 mt-auto">{stat.value}</div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>


          {/* ─── Upcoming Events ─── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 sm:mb-10"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-editorial font-bold text-white">Upcoming Events</h2>
              <Link href="/" className="text-xs text-[#A855F7] hover:text-white transition-colors flex items-center gap-1">
                Browse More <ChevronRight size={14} />
              </Link>
            </div>

            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="relative rounded-2xl overflow-hidden border border-[#9333EA]/20 bg-[#12151E]"
              >
                {/* Background Image on Desktop */}
                <div className="relative w-full h-40 sm:h-52 lg:h-44">
                  <Image
                    src={event.image}
                    alt={event.name}
                    fill
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D12] via-[#0B0D12]/80 to-[#0B0D12]/40 sm:bg-gradient-to-r sm:from-[#0B0D12] sm:via-[#0B0D12]/85 sm:to-transparent" />
                  <div className="absolute inset-0 bg-[#9333EA]/10" />
                </div>

                <div className="p-4 sm:p-6 lg:absolute lg:inset-0 lg:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#9333EA] text-white text-[9px] sm:text-[10px] font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-live-pulse" />
                        TICKETS LIVE
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#E5C07B]/20 text-[#E5C07B] text-[9px] sm:text-[10px] font-mono font-bold border border-[#E5C07B]/30">
                        {event.tier} PASS
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-editorial font-bold text-white mb-2">{event.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs text-slate-300">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-[#A855F7]" /> {event.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-[#A855F7]" /> {event.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-[#A855F7]" /> {event.venue}
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-3 sm:pt-0 border-t border-white/10 sm:border-t-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 font-mono">COUNTDOWN: </span>
                      <span className="text-lg sm:text-2xl font-bold text-[#E5C07B] font-mono">{event.daysUntil} DAYS</span>
                    </div>
                    <Link href="/#tickets" className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#7E22CE] text-white text-xs font-bold flex items-center gap-1.5 shadow-glow hover:scale-105 transition-transform whitespace-nowrap">
                      View Ticket <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>


          {/* ─── Milestone Trackboard ─── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h2 className="text-base sm:text-lg font-editorial font-bold text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-[#A855F7]" />
                  Milestone Rewards
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Buy more tickets to unlock exclusive rewards and discounts.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl sm:text-2xl font-bold text-[#A855F7] font-mono">{userTickets}</span>
                <span className="text-[10px] text-slate-400 block font-mono">tickets total</span>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-white/10">
              {/* Progress Track */}
              <div className="relative mb-6 sm:mb-8">
                {/* Background track */}
                <div className="w-full h-2 rounded-full bg-white/5 relative">
                  {/* Filled portion */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((userTickets / 50) * 100, 100)}%` }}
                    transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#9333EA] to-[#A855F7]"
                  />
                </div>

                {/* Milestone markers */}
                <div className="flex justify-between mt-1">
                  {computedMilestones.map((m) => (
                    <div
                      key={m.id}
                      className="flex flex-col items-center"
                      style={{ width: `${100 / milestones.length}%` }}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full border-2 -mt-2.5 relative z-10 transition-all ${
                          m.unlocked
                            ? 'border-transparent shadow-glow'
                            : 'border-white/20 bg-[#0B0D12]'
                        }`}
                        style={{
                          backgroundColor: m.unlocked ? m.color : undefined,
                        }}
                      />
                      <span className="text-[9px] font-mono text-slate-500 mt-1">{m.tickets}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestone Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {computedMilestones.map((m) => (
                  <div
                    key={m.id}
                    className={`relative p-3.5 sm:p-4 rounded-xl border transition-all ${
                      m.unlocked
                        ? 'bg-white/5 border-white/15'
                        : 'bg-white/[0.02] border-white/5 opacity-60'
                    }`}
                  >
                    {m.unlocked && (
                      <div className="absolute top-3 right-3">
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#9333EA]/20 text-[#A855F7]">
                          UNLOCKED
                        </span>
                      </div>
                    )}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5"
                      style={{
                        backgroundColor: `${m.color}20`,
                        color: m.color,
                      }}
                    >
                      {m.icon}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white mb-0.5">{m.label}</h4>
                    <p className="text-[11px] text-slate-400 mb-2">{m.tickets} tickets needed</p>
                    <div className="flex items-center gap-1.5">
                      <Gift size={12} className="text-[#E5C07B]" />
                      <span className="text-xs text-[#E5C07B] font-medium">{m.reward}</span>
                    </div>

                    {/* Mini progress */}
                    <div className="mt-3 w-full h-1 rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${m.progress}%`,
                          backgroundColor: m.color,
                        }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono mt-1 block">
                      {Math.min(userTickets, m.tickets)}/{m.tickets}
                    </span>
                  </div>
                ))}
              </div>

              {/* Next milestone hint */}
              {nextTier && (
                <div className="mt-4 sm:mt-6 p-3.5 sm:p-4 rounded-xl bg-[#9333EA]/5 border border-[#9333EA]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Sparkles size={16} className="text-[#A855F7] flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-slate-300">
                      <strong className="text-white">{nextTier.tickets - userTickets} more tickets</strong> to unlock {nextTier.label} ({nextTier.reward})
                    </span>
                  </div>
                  <Link href="/" className="text-xs text-[#A855F7] hover:text-white transition-colors flex items-center gap-1 whitespace-nowrap">
                    Browse Events <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>


          {/* Mobile Bottom Nav */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
            <div className="glass-panel border-t border-white/10 px-6 py-2.5 flex items-center justify-around bg-[#0B0D12]/95 backdrop-blur-xl">
              {[
                { id: 'home', icon: <Home size={18} />, label: 'Home' },
                { id: 'explore', icon: <Compass size={18} />, label: 'Explore' },
                { id: 'tickets', icon: <Ticket size={18} />, label: 'Tickets' },
                { id: 'settings', icon: <Settings size={18} />, label: 'Settings' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`flex flex-col items-center gap-0.5 transition-all ${
                    activeNav === item.id ? 'text-[#A855F7]' : 'text-slate-500'
                  }`}
                >
                  {item.icon}
                  <span className="text-[9px] font-mono">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

        </main>
      </div>
    </>
  );
}
