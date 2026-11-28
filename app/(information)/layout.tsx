import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const links = [
  ['/about', 'আমাদের সম্পর্কে'],
  ['/contact', 'যোগাযোগ'],
  ['/privacy-policy', 'গোপনীয়তা নীতি']
] as const;

export default function InformationLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#faf8f8]">
      <header className="border-b border-[#eadede] bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <Link href="/" prefetch={false} aria-label="বিডি এভরিডে প্রচ্ছদ">
            <Image src="/bd-everyday-logo.svg" width={208} height={36} alt="BD Everyday" unoptimized />
          </Link>
          <nav aria-label="মূল সংস্করণ" className="flex gap-4 text-sm font-semibold">
            <Link href="/" prefetch={false}>প্রচ্ছদ</Link>
            <Link href="/en/" prefetch={false} lang="en">English edition</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto my-8 max-w-3xl px-5 sm:my-12">
        <article className="space-y-5 rounded-xl border border-[#eadede] bg-white px-6 py-9 leading-relaxed sm:px-10">
          {children}
        </article>
      </main>
      <footer className="mx-auto max-w-3xl px-5 pb-10">
        <nav aria-label="বিডি এভরিডে সম্পর্কে" className="flex flex-wrap gap-x-5 gap-y-2 text-sm underline underline-offset-4">
          {links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>
      </footer>
    </div>
  );
}
