import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from './_app';
import { supabase } from '../lib/supabase';
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

/* ─── Mock user stats (will be replaced with Supabase queries) ─── */
const mockStats = {
  ticketsBought: 7,
  upcomingEvents: 2,
  moneySpent: 145000,
};

/* ─── Upcoming events data ─── */
const upcomingEvents = [
  {
    id: 1,
    name: 'King Jfly Live In Concert',
    date: 'Sun, 20 Sept 2026',
    time: '18:00',
    venue: 'The Arena Event Center',
    tier: 'WOZA',
    price: '₦20,000',
    image: '/king_jfly_event.jpg',
    daysUntil: 27,
  },
];

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

  // Calculate milestone progress
  const userTickets = mockStats.ticketsBought;
  const computedMilestones = milestones.map((m) => ({
    ...m,
    progress: Math.min((userTickets / m.tickets) * 100, 100),
    unlocked: userTickets >= m.tickets,
  }));

  // Current tier
  const currentTier = [...computedMilestones].reverse().find((m) => m.unlocked);
  const nextTier = computedMilestones.find((m) => !m.unlocked);

  if (loading || !session) {
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
        <meta name="description" content="Your OKPO dashboard — track tickets, events, and rewards." />
      </Head>

      <div className="min-h-screen bg-[#0B0D12] text-slate-100 flex">

        {/* ═══════════════════════════ */}
        {/* Sidebar                     */}
        {/* ═══════════════════════════ */}
        <aside className="hidden lg:flex w-20 min-h-screen flex-col items-center py-8 border-r border-white/5">
          {/* Logo */}
          <div className="relative w-10 h-10 mb-8">
            <Image src="/okpo_logo.png" alt="Okpo" fill className="object-contain" />
          </div>

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
        <main className="flex-1 p-6 lg:p-10 max-w-[1200px] mx-auto w-full">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-10"
          >
            <div>
              <h1 className="text-2xl font-editorial font-bold text-white">
                Welcome back, <span className="text-[#A855F7]">{userName}</span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">Here&apos;s what&apos;s happening with your events.</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile menu */}
              <Link href="/" className="lg:hidden px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:text-white transition-all">
                Home
              </Link>
              <div className="flex items-center gap-3 glass-panel pl-2 pr-4 py-1.5 rounded-full">
                {userAvatar ? (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#9333EA]/40">
                    <Image src={userAvatar} alt={userName} fill unoptimized className="object-cover" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9333EA] to-[#E5C07B] flex items-center justify-center text-xs font-bold text-white">
                    {userName[0]?.toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:flex flex-col text-xs">
                  <span className="font-semibold text-white">{userName}</span>
                  <span className="text-[10px] text-[#A855F7] font-mono">
                    {currentTier ? `${currentTier.label.toUpperCase()} MEMBER` : 'NEW MEMBER'}
                  </span>
                </div>
              </div>
              <button onClick={handleLogout} className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all">
                <LogOut size={18} />
              </button>
            </div>
          </motion.div>


          {/* ─── Stats Cards ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {[
              {
                label: 'Tickets Bought',
                value: mockStats.ticketsBought.toString(),
                icon: <Ticket size={20} />,
                accent: '#9333EA',
                sub: 'All time',
              },
              {
                label: 'Upcoming Events',
                value: mockStats.upcomingEvents.toString(),
                icon: <Calendar size={20} />,
                accent: '#A855F7',
                sub: 'This month',
              },
              {
                label: 'Money Spent',
                value: `₦${mockStats.moneySpent.toLocaleString()}`,
                icon: <DollarSign size={20} />,
                accent: '#E5C07B',
                sub: 'Total investment',
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl glass-panel border border-white/10 hover:border-[#9333EA]/20 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.accent}15`, color: stat.accent }}
                  >
                    {stat.icon}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">{stat.sub}</span>
                </div>
                <div className="text-3xl font-bold text-white font-mono mb-1">{stat.value}</div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>


          {/* ─── Upcoming Events ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-editorial font-bold text-white">Upcoming Events</h2>
              <Link href="/" className="text-xs text-[#A855F7] hover:text-white transition-colors flex items-center gap-1">
                Browse More <ChevronRight size={14} />
              </Link>
            </div>

            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="relative rounded-2xl overflow-hidden border border-[#9333EA]/15 group"
              >
                <div className="relative w-full aspect-[3/1] sm:aspect-[4/1]">
                  <Image
                    src={event.image}
                    alt={event.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D12] via-[#0B0D12]/80 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D12] via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-[#9333EA]/5" />
                </div>

                <div className="absolute inset-0 p-6 sm:p-8 flex items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 rounded-full bg-[#9333EA] text-white text-[10px] font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-live-pulse" />
                        TICKETS LIVE
                      </span>
                      <span className="px-2 py-1 rounded-full bg-[#E5C07B]/20 text-[#E5C07B] text-[10px] font-mono font-bold border border-[#E5C07B]/30">
                        {event.tier}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-editorial font-bold text-white mb-2">{event.name}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-[#A855F7]" /> {event.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} className="text-[#A855F7]" /> {event.time}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-[#A855F7]" /> {event.venue}
                      </span>
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col items-end gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-mono block">IN</span>
                      <span className="text-3xl font-bold text-white font-mono">{event.daysUntil}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">DAYS</span>
                    </div>
                    <Link href="/#tickets" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#7E22CE] text-white text-xs font-bold flex items-center gap-2 shadow-glow hover:scale-105 transition-transform">
                      View Ticket <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>


          {/* ─── Milestone Trackboard ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-editorial font-bold text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-[#A855F7]" />
                  Milestone Rewards
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Buy more tickets to unlock exclusive rewards and discounts.
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-[#A855F7] font-mono">{userTickets}</span>
                <span className="text-xs text-slate-400 block">tickets total</span>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-white/10">
              {/* Progress Track */}
              <div className="relative mb-8">
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
                  {computedMilestones.map((m) => {
                    const position = (m.tickets / 50) * 100;
                    return (
                      <div
                        key={m.id}
                        className="flex flex-col items-center"
                        style={{ width: `${100 / milestones.length}%` }}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 -mt-3 relative z-10 transition-all ${
                            m.unlocked
                              ? 'border-transparent shadow-glow'
                              : 'border-white/20 bg-[#0B0D12]'
                          }`}
                          style={{
                            backgroundColor: m.unlocked ? m.color : undefined,
                          }}
                        />
                        <span className="text-[10px] font-mono text-slate-500 mt-1">{m.tickets}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Milestone Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {computedMilestones.map((m) => (
                  <div
                    key={m.id}
                    className={`relative p-4 rounded-xl border transition-all ${
                      m.unlocked
                        ? 'bg-white/5 border-white/15'
                        : 'bg-white/[0.02] border-white/5 opacity-60'
                    }`}
                  >
                    {m.unlocked && (
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#9333EA]/20 text-[#A855F7]">
                          UNLOCKED
                        </span>
                      </div>
                    )}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{
                        backgroundColor: `${m.color}20`,
                        color: m.color,
                      }}
                    >
                      {m.icon}
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">{m.label}</h4>
                    <p className="text-xs text-slate-400 mb-2">{m.tickets} tickets needed</p>
                    <div className="flex items-center gap-2">
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
                    <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                      {Math.min(userTickets, m.tickets)}/{m.tickets}
                    </span>
                  </div>
                ))}
              </div>

              {/* Next milestone hint */}
              {nextTier && (
                <div className="mt-6 p-4 rounded-xl bg-[#9333EA]/5 border border-[#9333EA]/15 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles size={16} className="text-[#A855F7]" />
                    <span className="text-sm text-slate-300">
                      <strong className="text-white">{nextTier.tickets - userTickets} more tickets</strong> to unlock {nextTier.label} ({nextTier.reward})
                    </span>
                  </div>
                  <Link href="/" className="text-xs text-[#A855F7] hover:text-white transition-colors flex items-center gap-1">
                    Browse Events <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>


          {/* Mobile Bottom Nav */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
            <div className="glass-panel border-t border-white/10 px-6 py-3 flex items-center justify-around">
              {[
                { id: 'home', icon: <Home size={20} />, label: 'Home' },
                { id: 'explore', icon: <Compass size={20} />, label: 'Explore' },
                { id: 'tickets', icon: <Ticket size={20} />, label: 'Tickets' },
                { id: 'settings', icon: <Settings size={20} />, label: 'Settings' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`flex flex-col items-center gap-1 transition-all ${
                    activeNav === item.id ? 'text-[#A855F7]' : 'text-slate-500'
                  }`}
                >
                  {item.icon}
                  <span className="text-[10px] font-mono">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

        </main>
      </div>
    </>
  );
}
