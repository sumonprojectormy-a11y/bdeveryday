/* eslint-disable @next/next/no-html-link-for-pages -- Public pages are Route Handler HTML documents. */
import type { Metadata } from 'next';
import { publicConfig } from '@/lib/config';
import { signIn } from '../actions';

export const metadata: Metadata = { title:'নিউজরুম সাইন ইন | BD Everyday', robots:{index:false,follow:false} };

const messages: Record<string,string> = {
  configuration:'সাইন ইন চালু করতে Supabase সংযোগ কনফিগার করুন।',
  invalid:'ইমেইল বা পাসওয়ার্ড সঠিক নয়।',
  restricted:'এই অ্যাকাউন্টে নিউজরুমের অনুমতি নেই।'
};

export default async function Login({searchParams}: {searchParams: Promise<{state?:string}>}) {
  const {state=''} = await searchParams;
  const configured = Boolean(publicConfig());
  const message = configured && Object.hasOwn(messages,state) ? messages[state] : !configured ? messages.configuration : '';
  return <main className="mx-auto my-16 w-[min(92%,30rem)] rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
    <a className="font-semibold text-red-800 underline" href="/">BD Everyday</a>
    <h1 className="mt-4 text-3xl font-bold">নিউজরুম সাইন ইন</h1>
    {message && <p className="mt-4 text-red-900" role="status">{message}</p>}
    <form action={signIn} className="mt-5 grid gap-4">
      <label className="grid gap-1">ইমেইল<input className="rounded border p-2" type="email" name="email" autoComplete="username" maxLength={254} required /></label>
      <label className="grid gap-1">পাসওয়ার্ড<input className="rounded border p-2" type="password" name="password" autoComplete="current-password" maxLength={1024} required /></label>
      <button className="rounded bg-red-800 px-4 py-2 text-white disabled:opacity-50" disabled={!configured}>সাইন ইন করুন</button>
    </form>
  </main>;
}
