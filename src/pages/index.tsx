import Head from 'next/head';
import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import Script from 'next/script';
import { useAuth } from './_app';
import WalletWidget from '../components/WalletWidget';
import { authFetch } from '../lib/authFetch';
import {
  Compass,
  Heart,
  Ticket,
  User,
  Search,
  Play,
  ArrowRight,
  ArrowDown,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  Star,
  Zap,
  Shield,
  Globe,
  Calendar,
  Layers,
  Check,
  ChevronRight,
  MoveHorizontal,
} from 'lucide-react';

/* ─── Seats matrix data for NuMetro-style interactive grid ─── */
const generateSeatsGrid = () => {
  const rows = ['J', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
  const cols = 12;
  const takenSeats = new Set([
    'J-10', 'J-11', 'H-3', 'H-4', 'H-9', 'H-10',
    'G-2', 'G-3', 'F-1', 'F-2', 'F-3', 'F-6', 'F-7',
    'E-7', 'E-8', 'D-6', 'D-7', 'C-1', 'C-2', 'C-3', 'B-11', 'A-5', 'A-6', 'A-7'
  ]);
  const initialSelected = new Set(['F-8', 'F-9', 'F-10']);
  return { rows, cols, takenSeats, initialSelected };
};

/* ─── Scroll-reveal wrapper ─── */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Floating ticket card component (Desktop only) ─── */
function FloatingTicketCard() {
  return (
    <motion.div
      className="absolute right-8 bottom-32 lg:right-20 lg:bottom-36 z-20 hidden lg:block"
      initial={{ opacity: 0, x: 80, rotate: 6 }}
      animate={{ opacity: 1, x: 0, rotate: 3 }}
      transition={{ duration: 1.2, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        <div className="w-64 h-36 rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 p-4 flex flex-col justify-between shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#A855F7] tracking-widest font-bold">OKPO PASS</span>
            <span className="text-[10px] font-mono text-[#E5C07B] font-bold">VIP ACCESS</span>
          </div>
          <div>
            <div className="text-white text-sm font-bold font-editorial">KING JFLY LIVE</div>
            <div className="text-[10px] text-slate-400 font-mono">LAG · 20 SEP 2026 · 18:00</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-[#9333EA]" />
              ))}
            </div>
            <span className="text-[8px] font-mono text-slate-400">SEAT F-8 · WOZA</span>
          </div>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none" />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const { user, session } = useAuth();
  const [activeDate, setActiveDate] = useState('SUN 20');
  const [activeTier, setActiveTier] = useState('WOZA');
  const { rows, cols, takenSeats, initialSelected } = generateSeatsGrid();
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(initialSelected);
  const [scrollY, setScrollY] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!session || !user) {
      window.location.href = '/auth';
      return;
    }
    
    if (selectedSeats.size === 0) {
      alert("Please select at least one seat.");
      return;
    }

    setIsCheckingOut(true);
    const totalAmount = selectedSeats.size * selectedTierObj.priceNum;

    try {
      // Create purchase intent
      const res = await authFetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          eventId: "cm6d2524d000109mg202h6374", // Real CUID from seed for featured event
          paymentMethod: 'paystack',
          amount: totalAmount
        })
      });
      const data = await res.json();
      
      if (!data.ok) {
        alert(data.error || 'Error initializing payment');
        setIsCheckingOut(false);
        return;
      }

      const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
      if (!paystackKey) {
        alert('Paystack key not configured');
        setIsCheckingOut(false);
        return;
      }

      const handler = (window as any).PaystackPop?.setup({
        key: paystackKey,
        email: user.email || 'customer@example.com',
        amount: Math.round(data.amount * 100),
        reference: data.paymentRef,
        onClose: () => { setIsCheckingOut(false); },
        callback: (response: any) => {
          setIsCheckingOut(false);
          alert('Payment successful!');
          window.location.href = '/dashboard';
        }
      });
      
      if (handler) {
        handler.openIframe();
      } else {
        alert('Paystack failed to load. Please try again.');
        setIsCheckingOut(false);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
      setIsCheckingOut(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSeat = (seatId: string) => {
    if (takenSeats.has(seatId)) return;
    const next = new Set(selectedSeats);
    if (next.has(seatId)) {
      next.delete(seatId);
    } else {
      next.add(seatId);
    }
    setSelectedSeats(next);
  };

  // Calendar dates - ONLY Sunday 20th has active event
  const calendarDates = [
    { day: 'WED', date: '16', hasEvent: false },
    { day: 'THU', date: '17', hasEvent: false },
    { day: 'FRI', date: '18', hasEvent: false },
    { day: 'SAT', date: '19', hasEvent: false },
    { day: 'SUN', date: '20', hasEvent: true },
    { day: 'MON', date: '21', hasEvent: false },
    { day: 'TUE', date: '22', hasEvent: false },
  ];

  // Ticket Tiers with availability
  const ticketTiers = [
    { name: 'BALENCIAGA', price: '₦5,000', priceNum: 5000, left: 500, color: 'from-slate-700 to-slate-800' },
    { name: 'WOZA', price: '₦20,000', priceNum: 20000, left: 200, color: 'from-[#9333EA] to-[#7E22CE]' },
    { name: 'KALAKUTA', price: '₦500,000', priceNum: 500000, left: 20, color: 'from-[#E5C07B] to-[#D4A853]' },
    { name: 'BAD', price: '₦1,000,000', priceNum: 1000000, left: 10, color: 'from-red-600 to-red-800' },
  ];

  const selectedTierObj = ticketTiers.find((t) => t.name === activeTier) || ticketTiers[1];
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userAvatar = user?.user_metadata?.avatar_url;

  return (
    <>
      <Head>
        <title>OKPO — Discover Amazing Buzz Happening In Your City</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta name="description" content="From meet and greets to grand celebrations. The Okpo experience starts here. Connect with community and make every moment count." />
        <meta property="og:title" content="OKPO: Discover Amazing Buzz Happening In Your City" />
        <meta property="og:description" content="From meet and greets to grand celebrations. The Okpo experience starts here." />
      </Head>
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />

      <div className="min-h-screen bg-[#0B0D12] text-slate-100 overflow-x-hidden w-full">

        {/* ═══════════════════════════════════════════════ */}
        {/* FIXED NAVIGATION BAR                           */}
        {/* ═══════════════════════════════════════════════ */}
        <motion.nav
          className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
          style={{
            backgroundColor: scrollY > 40 ? 'rgba(11, 13, 18, 0.95)' : 'transparent',
            backdropFilter: scrollY > 40 ? 'blur(20px)' : 'none',
            borderBottom: scrollY > 40 ? '1px solid rgba(147,51,234,0.15)' : '1px solid transparent',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            {/* Logo replacing OKPO wordmark */}
            <Link href="/" className="relative w-24 sm:w-32 h-8 sm:h-10 flex items-center flex-shrink-0">
              <Image
                src="/okpo_logo.png"
                alt="OKPO"
                fill
                priority
                className="object-contain object-left"
              />
            </Link>

            {/* Nav Links (Desktop) */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm">
              <a href="#featured" className="text-slate-300 hover:text-white transition-colors">Events</a>
              <a href="#experience" className="text-slate-300 hover:text-white transition-colors">Experience</a>
              <a href="#tickets" className="text-slate-300 hover:text-white transition-colors">Tickets</a>
              <a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors">How It Works</a>
            </div>

            {/* Dynamic Auth Header Widget */}
            <div className="flex items-center gap-2 sm:gap-3">
              {session && user ? (
                /* Logged In User State */
                <>
                  <WalletWidget />
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 sm:gap-3 glass-panel pl-1.5 sm:pl-2 pr-3 sm:pr-4 py-1 sm:py-1.5 rounded-full border border-[#9333EA]/30 hover:border-[#9333EA]/60 transition-all shadow-glow"
                  >
                    {userAvatar ? (
                      <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-[#9333EA]/50">
                        <Image src={userAvatar} alt={userName} fill unoptimized className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#9333EA] to-[#E5C07B] flex items-center justify-center text-xs font-bold text-white">
                        {userName[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col text-xs">
                      <span className="font-semibold text-white max-w-[90px] sm:max-w-[140px] truncate">{userName}</span>
                      <span className="text-[9px] sm:text-[10px] text-[#A855F7] font-mono">DASHBOARD →</span>
                    </div>
                  </Link>
                </>
              ) : (
                /* Logged Out State */
                <>
                  <Link
                    href="/auth"
                    className="hidden sm:inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-white hover:bg-white/10 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth"
                    className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#9333EA] to-[#7E22CE] text-white font-semibold text-xs sm:text-sm shadow-glow hover:scale-105 transition-transform whitespace-nowrap"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.nav>


        {/* ═══════════════════════════════════════════════ */}
        {/* SECTION 1: CINEMATIC HERO                      */}
        {/* ═══════════════════════════════════════════════ */}
        <section className="relative w-full min-h-[100svh] flex items-center pt-28 pb-16 sm:py-0 overflow-hidden">
          {/* Background Image with Ken Burns */}
          <motion.div
            className="absolute inset-0 z-0"
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: 12, ease: 'linear' }}
          >
            <Image
              src="/hero_ticket_catch.jpg"
              alt="Futuristic holographic event ticket"
              fill
              className="object-cover object-center"
              priority
              quality={90}
            />
          </motion.div>

          {/* Responsive Gradient Overlays */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-t sm:bg-gradient-to-r from-[#0B0D12] via-[#0B0D12]/85 sm:via-[#0B0D12]/80 to-[#0B0D12]/40 sm:to-transparent" />
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#0B0D12]/70 via-transparent to-[#0B0D12]" />
          <div className="absolute inset-0 z-[1] bg-gradient-to-br from-[#9333EA]/15 via-transparent to-transparent" />

          {/* Film Grain */}
          <div className="absolute inset-0 z-[2] opacity-[0.04] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')] pointer-events-none" />

          <FloatingTicketCard />

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6"
              >
                <span className="w-6 sm:w-8 h-[1px] bg-[#9333EA]" />
                <span className="text-[11px] sm:text-xs font-mono text-[#A855F7] tracking-[0.25em] uppercase font-semibold">
                  The future of event ticketing
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-4xl sm:text-6xl lg:text-7xl font-editorial font-extrabold leading-[1.1] sm:leading-[1.05] tracking-tight text-white mb-4 sm:mb-6"
              >
                Discover the
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#E5C07B]">
                  amazing buzz
                </span>
                <br />
                in your city.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed max-w-lg mb-8 sm:mb-10"
              >
                From intimate meet and greets to grand celebrations — the Okpo 
                experience starts here. Connect with community and make every 
                moment count.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto"
              >
                <a href="#featured" className="group px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#9333EA] to-[#7E22CE] text-white font-bold text-sm flex items-center justify-center gap-3 shadow-glow hover:scale-105 transition-all text-center">
                  Explore Events
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="#tickets" className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white/5 border border-white/15 text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-all backdrop-blur-sm text-center">
                  <Ticket size={16} className="text-[#A855F7]" />
                  Reserve Passes
                </a>
              </motion.div>

              {/* City Tags: LAG · PHC · ABJ */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.0 }}
                className="grid grid-cols-3 gap-3 sm:gap-8 mt-10 sm:mt-16 pt-6 sm:pt-8 border-t border-white/10 text-center sm:text-left"
              >
                <div>
                  <span className="text-xl sm:text-2xl font-bold text-white font-mono block">50K+</span>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Tickets Sold</p>
                </div>
                <div className="border-l border-white/10 pl-3 sm:pl-8">
                  <span className="text-xl sm:text-2xl font-bold text-white font-mono block">200+</span>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Live Events</p>
                </div>
                <div className="border-l border-white/10 pl-3 sm:pl-8">
                  <span className="text-base sm:text-xl font-bold text-[#E5C07B] font-mono tracking-wider block truncate">LAG·PHC·ABJ</span>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">& Expanding</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-1">
            <span className="text-[9px] font-mono text-slate-500 tracking-widest">SCROLL</span>
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <ArrowDown size={14} className="text-slate-400" />
            </motion.div>
          </div>
        </section>


        {/* ═══════════════════════════════════════════════ */}
        {/* SECTION 2: FEATURED EVENT — KING JFLY           */}
        {/* (Mobile-Optimized Responsive Banner)            */}
        {/* ═══════════════════════════════════════════════ */}
        <section id="featured" className="relative py-12 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <Reveal>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] sm:text-xs font-mono text-[#A855F7] tracking-[0.25em] uppercase font-bold">Featured</span>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9333EA]/20 border border-[#9333EA]/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9333EA] animate-live-pulse" />
                    <span className="text-[9px] sm:text-[10px] font-mono text-[#A855F7] font-bold tracking-wider">TICKETS LIVE</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono text-slate-400">
                  <span className="text-[#00E676]">●</span> 730 Left
                </div>
              </div>
            </Reveal>

            {/* Responsive King Jfly Event Card */}
            <Reveal delay={0.1}>
              <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-[#9333EA]/20 shadow-glowLg bg-gradient-to-b from-[#12151E] to-[#0B0D12]">
                {/* Visual Banner Area */}
                <div className="relative w-full h-48 sm:h-72 lg:h-96">
                  <Image
                    src="/king_jfly_event.jpg"
                    alt="King Jfly Live In Concert"
                    fill
                    priority
                    className="object-cover object-top sm:object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D12] via-[#0B0D12]/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D12]/90 via-[#0B0D12]/40 to-transparent hidden sm:block" />
                  <div className="absolute inset-0 bg-[#9333EA]/10" />

                  <div className="absolute top-4 left-4 sm:left-6 flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-[#9333EA] text-white text-[10px] font-bold flex items-center gap-1 shadow-glow">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-live-pulse" />
                      LIVE CONCERT
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-white font-mono border border-white/10 flex items-center gap-1">
                      <Calendar size={10} /> SUN, 20 SEPT 2026
                    </span>
                  </div>
                </div>

                {/* Details Area */}
                <div className="p-4 sm:p-8 lg:p-10 -mt-8 sm:-mt-16 relative z-10 bg-gradient-to-t from-[#0B0D12] via-[#0B0D12]/95 to-transparent">
                  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="max-w-xl">
                      <h3 className="text-2xl sm:text-4xl lg:text-5xl font-editorial font-extrabold text-white mb-2 leading-tight">
                        KING JFLY
                        <span className="block text-[#A855F7]">LIVE IN CONCERT</span>
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300 mb-5">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-[#A855F7] flex-shrink-0" />
                          The Arena Event Center · Lagos
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} className="text-[#E5C07B] flex-shrink-0" />
                          Showtime 18:00
                        </span>
                      </div>

                      {/* Ticket Tiers Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 mb-6">
                        {ticketTiers.map((tier) => (
                          <div
                            key={tier.name}
                            className={`p-2.5 sm:p-3 rounded-xl bg-gradient-to-r ${tier.color} text-white font-mono border border-white/10 flex flex-col justify-between`}
                          >
                            <span className="text-[10px] sm:text-xs font-bold truncate">{tier.name}</span>
                            <div className="text-xs sm:text-sm font-bold mt-0.5">{tier.price}</div>
                            <div className="text-[9px] sm:text-[10px] text-slate-300 opacity-90 mt-1 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00E676]" />
                              {tier.left} left
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="flex-shrink-0">
                      <a
                        href="#tickets"
                        className="w-full sm:w-auto px-6 sm:px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#7E22CE] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-glow hover:scale-105 transition-all text-center"
                      >
                        Select Seats & Passes <ArrowRight size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>


        {/* ═══════════════════════════════════════════════ */}
        {/* SECTION 3: THE OKPO EXPERIENCE                 */}
        {/* ═══════════════════════════════════════════════ */}
        <section id="experience" className="relative py-16 sm:py-28 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-[#9333EA]/5 rounded-full blur-[150px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <Reveal>
                <div className="relative group max-w-md mx-auto lg:max-w-none">
                  <div className="relative aspect-[4/3] sm:aspect-[3/4] w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                    <Image src="/hero_editorial_model.jpg" alt="VIP experience at Okpo events" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D12] via-transparent to-transparent" />
                    <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between">
                      <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] sm:text-xs font-mono text-[#E5C07B] border border-[#E5C07B]/30 flex items-center gap-1.5">
                        <Star size={11} /> VIP EXPERIENCE
                      </span>
                      <span className="text-[10px] sm:text-xs font-mono text-slate-300">LAG · PHC · ABJ</span>
                    </div>
                  </div>
                </div>
              </Reveal>

              <div className="flex flex-col gap-6 sm:gap-8">
                <Reveal delay={0.1}>
                  <span className="text-[11px] sm:text-xs font-mono text-[#A855F7] uppercase tracking-[0.25em] flex items-center gap-2 font-bold">
                    <CheckCircle2 size={14} /> Why Okpo
                  </span>
                </Reveal>
                <Reveal delay={0.2}>
                  <h2 className="text-3xl sm:text-5xl font-editorial font-extrabold leading-tight text-white">
                    Make every night
                    <br />
                    <span className="text-[#E5C07B] italic">stay on track.</span>
                  </h2>
                </Reveal>
                <Reveal delay={0.3}>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-md">
                    Access curated VIP tables, instant QR entry codes, and exclusive 
                    backstage passes at Nigeria&apos;s premier entertainment events. Designed 
                    for tastemakers who demand seamless, premium experiences.
                  </p>
                </Reveal>
                <Reveal delay={0.4}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#9333EA]/30 transition-all">
                      <Zap size={18} className="text-[#A855F7] mb-2" />
                      <span className="text-xs sm:text-sm font-semibold text-white block mb-0.5">Instant Delivery</span>
                      <span className="text-[11px] sm:text-xs text-slate-400">Tickets via WhatsApp & Email within seconds.</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#E5C07B]/30 transition-all">
                      <Shield size={18} className="text-[#E5C07B] mb-2" />
                      <span className="text-xs sm:text-sm font-semibold text-white block mb-0.5">100% Verified</span>
                      <span className="text-[11px] sm:text-xs text-slate-400">Secure gate access with QR verification.</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#9333EA]/30 transition-all">
                      <Globe size={18} className="text-[#A855F7] mb-2" />
                      <span className="text-xs sm:text-sm font-semibold text-white block mb-0.5">Pay Your Way</span>
                      <span className="text-[11px] sm:text-xs text-slate-400">Paystack (₦) or international USD payments.</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#E5C07B]/30 transition-all">
                      <Ticket size={18} className="text-[#E5C07B] mb-2" />
                      <span className="text-xs sm:text-sm font-semibold text-white block mb-0.5">Pick Your Spot</span>
                      <span className="text-[11px] sm:text-xs text-slate-400">Interactive seat maps for every venue.</span>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>


        {/* ═══════════════════════════════════════════════ */}
        {/* SECTION 4: NuMetro INTERACTIVE SEATING GRID     */}
        {/* (Mobile-Optimized Seating and Pass Picker)       */}
        {/* ═══════════════════════════════════════════════ */}
        <section id="tickets" className="relative py-12 sm:py-24">
          <div className="max-w-7xl mx-auto px-3 sm:px-6">
            <Reveal>
              <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 relative overflow-hidden border border-[#9333EA]/15 shadow-2xl">
                
                {/* Header Step Indicator */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 sm:pb-6 mb-6 text-xs font-mono">
                  <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-none">
                    <span className="text-[#A855F7] font-bold border-b-2 border-[#9333EA] pb-1 flex items-center gap-1.5 whitespace-nowrap">
                      <Sparkles size={13} /> SELECT PASS & SEATS
                    </span>
                    <span className="text-slate-600 hidden sm:inline">→ 03 CHECKOUT</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] sm:text-xs">
                    <Clock size={13} className="text-[#A855F7] flex-shrink-0" />
                    <span>Showtime 18:00 · The Arena Event Center</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                  
                  {/* Left Column: Event Card (Compact on mobile, full poster on desktop) */}
                  <div className="lg:col-span-4 flex flex-col gap-3 sm:gap-4">
                    {/* Compact Card */}
                    <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-white/15 bg-white/5 p-3 sm:p-4 flex flex-row lg:flex-col items-center lg:items-stretch gap-3 sm:gap-4">
                      <div className="relative w-20 h-24 sm:w-28 sm:h-36 lg:w-full lg:aspect-[3/4] rounded-lg lg:rounded-xl overflow-hidden flex-shrink-0">
                        <Image src="/king_jfly.jpg" alt="King Jfly" fill className="object-cover" />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-[9px] font-mono text-[#E5C07B] border border-white/10 hidden lg:block">
                          THE ARENA
                        </div>
                      </div>
                      <div className="flex flex-col justify-center gap-1 sm:gap-1.5 text-left flex-1 min-w-0">
                        <span className="text-[10px] font-mono text-[#A855F7] font-bold uppercase">Featured Showcase</span>
                        <h3 className="text-sm sm:text-lg font-bold text-white font-editorial leading-snug truncate sm:whitespace-normal">
                          KING JFLY LIVE IN CONCERT
                        </h3>
                        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400">
                          <MapPin size={12} className="text-[#A855F7] flex-shrink-0" />
                          <span className="truncate">The Arena Event Center</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400">
                          <Calendar size={12} className="text-[#E5C07B] flex-shrink-0" />
                          <span>Sunday, 20 September</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Interactive Seat Grid & Controls */}
                  <div className="lg:col-span-8 flex flex-col gap-5 sm:gap-6">
                    
                    {/* 1. Date Selection: Sunday 20th active, others disabled */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono text-slate-400">
                        <span>1. SELECT DATE</span>
                        <span className="text-[#00E676] text-[10px] font-semibold">● SUN 20TH ACTIVE</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                        {calendarDates.map((d) => {
                          const isSun20 = d.day === 'SUN' && d.date === '20';
                          return (
                            <button
                              key={d.day + d.date}
                              disabled={!d.hasEvent}
                              onClick={() => d.hasEvent && setActiveDate(`${d.day} ${d.date}`)}
                              className={`py-2 sm:py-2.5 px-1 rounded-lg sm:rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${
                                isSun20
                                  ? 'bg-[#9333EA] text-white font-bold shadow-glow scale-[1.03] border border-[#A855F7]'
                                  : 'bg-white/[0.02] border border-white/5 text-slate-600 opacity-40 cursor-not-allowed'
                              }`}
                            >
                              <span className="text-[9px] sm:text-[10px] font-mono">{d.day}</span>
                              <span className="text-xs sm:text-sm font-bold">{d.date}</span>
                              {d.hasEvent ? (
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-live-pulse" />
                              ) : (
                                <span className="text-[8px] font-mono text-slate-600">--</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. Pass Tier Selection */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono text-slate-400">
                        <span>2. SELECT TIER (SHOWTIME 18:00)</span>
                        <span className="text-[#A855F7] text-[10px] font-bold">SELECTED: {selectedTierObj.name}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                        {ticketTiers.map((tier) => (
                          <button
                            key={tier.name}
                            onClick={() => setActiveTier(tier.name)}
                            className={`p-2.5 sm:p-3 rounded-xl text-left font-mono transition-all border ${
                              activeTier === tier.name
                                ? 'bg-gradient-to-br from-[#9333EA]/35 to-[#7E22CE]/35 border-[#9333EA] shadow-glow scale-[1.02]'
                                : 'glass-panel border-white/10 hover:border-white/20 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[11px] sm:text-xs font-bold text-white truncate">{tier.name}</span>
                              {activeTier === tier.name && <Check size={12} className="text-[#A855F7] flex-shrink-0" />}
                            </div>
                            <div className="text-xs sm:text-sm font-bold text-[#E5C07B]">{tier.price}</div>
                            <div className="text-[9px] sm:text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00E676]" />
                              {tier.left} left
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. Venue Seating Matrix with Mobile Swipe Hint */}
                    <div className="mt-2 flex flex-col items-center w-full">
                      {/* Stage Arc */}
                      <div className="w-full h-7 sm:h-8 border-t-2 border-[#9333EA]/60 rounded-t-[100%] flex items-center justify-center shadow-[0_-8px_16px_rgba(147,51,234,0.15)]">
                        <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-slate-400 bg-[#0B0D12] px-3 sm:px-4 -mt-3 uppercase">
                          MAIN STAGE · 18:00
                        </span>
                      </div>

                      {/* Mobile Swipe Hint */}
                      <div className="sm:hidden flex items-center gap-1.5 text-[10px] font-mono text-slate-400 my-2">
                        <MoveHorizontal size={12} className="text-[#A855F7] animate-pulse" />
                        <span>Swipe horizontally to select seats</span>
                      </div>

                      {/* Touch-Friendly Interactive Grid */}
                      <div className="w-full overflow-x-auto py-2 sm:py-4 scrollbar-none">
                        <div className="min-w-[380px] sm:min-w-[460px] mx-auto flex flex-col gap-1.5 sm:gap-2 items-center px-2">
                          {rows.map((row) => (
                            <div key={row} className="flex items-center gap-1.5 sm:gap-2">
                              <span className="w-3 sm:w-4 text-[9px] sm:text-[10px] font-mono text-slate-500 text-center font-bold">{row}</span>
                              <div className="flex gap-1 sm:gap-1.5">
                                {Array.from({ length: cols }).map((_, idx) => {
                                  const seatId = `${row}-${idx + 1}`;
                                  const isTaken = takenSeats.has(seatId);
                                  const isSelected = selectedSeats.has(seatId);
                                  return (
                                    <button
                                      key={seatId}
                                      onClick={() => toggleSeat(seatId)}
                                      disabled={isTaken}
                                      title={`Seat ${seatId} (${selectedTierObj.name})`}
                                      className={`w-6 h-6 sm:w-5 sm:h-5 rounded-t-sm sm:rounded-t-md text-[8px] sm:text-[8px] font-mono flex items-center justify-center transition-all flex-shrink-0 touch-manipulation ${
                                        isSelected
                                          ? 'bg-[#9333EA] text-white shadow-glow scale-110 font-bold border border-white/40'
                                          : isTaken
                                          ? 'bg-red-500/30 border border-red-500/40 text-red-300 opacity-60 cursor-not-allowed'
                                          : 'bg-slate-800 border border-white/10 hover:bg-slate-700 text-slate-400'
                                      }`}
                                    >
                                      {idx + 1}
                                    </button>
                                  );
                                })}
                              </div>
                              <span className="w-3 sm:w-4 text-[9px] sm:text-[10px] font-mono text-slate-500 text-center font-bold">{row}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-3 text-[10px] sm:text-xs font-mono text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-sm bg-[#9333EA] shadow-glow" /> Selected ({selectedSeats.size})
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-sm bg-slate-800 border border-white/20" /> Available
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-sm bg-red-500/40 border border-red-500/40" /> Taken
                        </div>
                      </div>
                    </div>

                    {/* 4. Total Reservation & Checkout Bar */}
                    <div className="mt-2 p-3 sm:p-4 rounded-xl sm:rounded-2xl glass-panel flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border border-[#9333EA]/30">
                      <div>
                        <span className="text-[10px] sm:text-xs text-slate-400 font-mono block">TOTAL RESERVATION ({selectedTierObj.name})</span>
                        <div className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                          <span>₦{(selectedSeats.size * selectedTierObj.priceNum).toLocaleString()}</span>
                          <span className="text-[10px] sm:text-xs text-[#A855F7] font-mono">({selectedSeats.size} × {selectedTierObj.price})</span>
                        </div>
                      </div>
                      <button
                        onClick={handleCheckout}
                        disabled={isCheckingOut}
                        className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#7E22CE] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-glow hover:scale-105 transition-all text-center disabled:opacity-50"
                      >
                        {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'} <ArrowRight size={16} />
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>


        {/* ═══════════════════════════════════════════════ */}
        {/* SECTION 5: HOW IT WORKS                         */}
        {/* ═══════════════════════════════════════════════ */}
        <section id="how-it-works" className="py-16 sm:py-24 relative">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#9333EA]/20 to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <Reveal>
              <div className="text-center mb-10 sm:mb-16">
                <span className="text-[11px] sm:text-xs font-mono text-[#A855F7] tracking-[0.25em] uppercase block mb-2 font-bold">How it works</span>
                <h2 className="text-2xl sm:text-4xl font-editorial font-bold text-white">
                  Three steps to your
                  <span className="text-[#E5C07B] italic"> next experience.</span>
                </h2>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
              {[
                { step: '01', title: 'Browse & Discover', desc: 'Explore curated events across Lagos, Port Harcourt, and Abuja — concerts, nightlife, tech summits, and exclusive VIP parties.', icon: <Compass size={22} />, accent: '#9333EA' },
                { step: '02', title: 'Choose Your Spot', desc: 'Select your seats with our interactive cinema-style venue map. BALENCIAGA, WOZA, KALAKUTA, or BAD — you decide.', icon: <MapPin size={22} />, accent: '#E5C07B' },
                { step: '03', title: 'Pay & Enter', desc: 'Pay securely via Paystack or USD. Get your instant QR pass via WhatsApp & Email. Show up and enjoy.', icon: <Zap size={22} />, accent: '#A855F7' },
              ].map((item, i) => (
                <Reveal key={item.step} delay={i * 0.15}>
                  <div className="relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/[0.03] border border-white/10 hover:border-[#9333EA]/20 transition-all group h-full">
                    <span className="text-5xl sm:text-6xl font-editorial font-extrabold text-white/[0.04] absolute top-4 right-5">{item.step}</span>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-4 sm:mb-6" style={{ backgroundColor: `${item.accent}15`, color: item.accent }}>
                      {item.icon}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>


        {/* ═══════════════════════════════════════════════ */}
        {/* SECTION 6: CTA / CLOSING                        */}
        {/* ═══════════════════════════════════════════════ */}
        <section className="py-12 sm:py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <Reveal>
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#9333EA]/20">
                <div className="absolute inset-0">
                  <Image src="/hero_ticket_catch.jpg" alt="Okpo ticket experience" fill className="object-cover opacity-30" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D12] via-[#0B0D12]/90 to-[#0B0D12]/70" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#9333EA]/10 via-transparent to-transparent" />
                </div>
                <div className="relative z-10 p-8 sm:p-16 lg:p-20 text-center flex flex-col items-center">
                  <span className="text-[11px] sm:text-xs font-mono text-[#A855F7] tracking-[0.25em] uppercase mb-3 font-bold">Start your experience</span>
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-editorial font-extrabold text-white mb-4 sm:mb-6 max-w-2xl leading-tight">
                    The best nights begin with
                    <span className="text-[#A855F7] italic"> Okpo.</span>
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-base max-w-md mb-8 sm:mb-10">
                    Join thousands of Nigerians already using Okpo to discover, book, and experience the best events in their city.
                  </p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <Link href={session ? "/dashboard" : "/auth"} className="group px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#9333EA] to-[#7E22CE] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-glow hover:scale-105 transition-all text-center">
                      {session ? "Open Dashboard" : "Get Started"} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <button className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-white/5 border border-white/15 text-white font-medium text-xs sm:text-sm hover:bg-white/10 transition-all text-center">
                      List Your Event
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>


        {/* ═══════════════════════════════════════════════ */}
        {/* FOOTER                                          */}
        {/* ═══════════════════════════════════════════════ */}
        <footer className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-10 sm:mb-12">
              <div className="sm:col-span-2 md:col-span-1">
                <div className="relative w-28 h-9 mb-4">
                  <Image src="/okpo_logo.png" alt="OKPO" fill className="object-contain object-left" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                  Discover amazing buzz happening in your city. From meet and greets to grand celebrations across LAG, PHC, and ABJ.
                </p>
              </div>
              <div>
                <h4 className="text-xs font-mono text-[#A855F7] tracking-widest mb-3 sm:mb-4 font-bold">PLATFORM</h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
                  <li><a href="#featured" className="hover:text-white transition-colors">Browse Events</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">List Your Event</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">VIP Membership</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-mono text-[#A855F7] tracking-widest mb-3 sm:mb-4 font-bold">COMPANY</h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
                  <li><a href="#" className="hover:text-white transition-colors">About Okpo</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-mono text-[#A855F7] tracking-widest mb-3 sm:mb-4 font-bold">LEGAL</h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Refund Policy</a></li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/10 pt-6 sm:pt-8 text-[11px] sm:text-xs text-slate-500 font-mono gap-3 text-center sm:text-left">
              <div>© 2026 OKPO GROUP. ALL RIGHTS RESERVED.</div>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <span>PAYSTACK & FLUTTERWAVE INTEGRATED</span>
                <span>BUILT IN NIGERIA 🇳🇬</span>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
