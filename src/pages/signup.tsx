import Head from 'next/head';
import { useState } from 'react';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<any>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const r = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const j = await r.json();
    setResp(j);
    setLoading(false);
  }

  return (
    <>
      <Head>
        <title>Sign up — Ticketing</title>
      </Head>
      <main className="min-h-screen flex items-center justify-center bg-[#07090c] text-slate-100">
        <form onSubmit={submit} className="w-full max-w-md p-8 bg-[rgba(255,255,255,0.02)] rounded-2xl">
          <h2 className="text-2xl font-bold">Create account</h2>
          <label className="block mt-4">Name
            <input required name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full mt-2 p-3 rounded-lg bg-transparent border border-slate-700" />
          </label>
          <label className="block mt-4">Email
            <input required name="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" className="w-full mt-2 p-3 rounded-lg bg-transparent border border-slate-700" />
          </label>
          <label className="block mt-4">Phone
            <input name="phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full mt-2 p-3 rounded-lg bg-transparent border border-slate-700" />
          </label>
          <button disabled={loading} className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 font-semibold">{loading ? 'Creating...' : 'Create account'}</button>

          {resp && (
            <pre className="mt-4 text-xs text-slate-300 bg-[rgba(255,255,255,0.02)] p-3 rounded">{JSON.stringify(resp, null, 2)}</pre>
          )}
        </form>
      </main>
    </>
  );
}
