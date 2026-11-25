'use client';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="mx-auto max-w-xl p-8">
    <h1 className="text-2xl font-bold">পাতাটি খোলা যায়নি</h1>
    <button className="mt-4 rounded bg-red-800 px-4 py-2 text-white" onClick={reset}>আবার চেষ্টা করুন</button>
  </main>;
}
