import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'যোগাযোগ | BD Everyday',
  description: 'স্থানীয় খবরের তথ্য পাঠাতে, সংশোধনী জানাতে বা বিডি এভরিডের সঙ্গে যোগাযোগ করতে এই পথগুলো ব্যবহার করুন।',
  alternates: { canonical: 'https://bdeveryday.com/contact' }
};

export default function ContactPage() {
  return <>
    <h1 className="text-3xl font-bold text-[#8d1423]">যোগাযোগ</h1>
    <section className="space-y-2">
      <h2 className="text-xl font-semibold">খবরের তথ্য পাঠান</h2>
      <p>আপনার এলাকার কোনো ঘটনা জানাতে স্থান, তারিখ ও সংক্ষিপ্ত বিবরণ লিখুন। প্রাসঙ্গিক ছবি এবং আপনার যোগাযোগের তথ্য চাইলে যোগ করতে পারেন।</p>
      <Link className="font-semibold text-[#8d1423] underline underline-offset-4" href="/#tool/tips" prefetch={false}>খবর পাঠানোর ফর্ম খুলুন</Link>
    </section>
    <section className="space-y-2">
      <h2 className="text-xl font-semibold">সংশোধনী জানান</h2>
      <p>সংশ্লিষ্ট প্রতিবেদন খুলে “ভুল জানাতে চান?” ফর্মে কোন তথ্যটি ভুল এবং সম্ভব হলে সঠিক তথ্যের উৎস লিখুন।</p>
    </section>
    <p><a className="font-semibold text-[#8d1423] underline underline-offset-4" href="https://www.facebook.com/share/151KDnsRgvy/?mibextid=wwXIfr">ফেসবুকে বিডি এভরিডে</a></p>
  </>;
}
