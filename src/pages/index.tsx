import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>The Future of Events Has Arrived</title>
        <meta name="description" content="Minimalist futuristic ticketing" />
      </Head>
      <main className="min-h-screen flex items-center justify-center bg-[#07090c] text-slate-100">
        <section className="max-w-4xl mx-auto p-8 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">The Future of Events Has Arrived</h1>
          <p className="mt-6 text-lg text-slate-300">Discover curated events, buy tickets, and earn rewards — all in a sleek, minimalist experience.</p>
          <div className="mt-10">
            <Link href="/signup">
              <a className="inline-block px-8 py-4 rounded-2xl text-lg font-semibold bg-gradient-to-r from-cyan-400 to-purple-500 shadow-lg hover:scale-[1.01] transition-transform">Explore Events Near You</a>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
