import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'আমাদের সম্পর্কে | BD Everyday',
  description: 'বিডি এভরিডে বাংলাদেশের স্থানীয় সংবাদ, প্রবাসজীবন ও দৈনন্দিন জীবনের গাইড নিয়ে বাংলা ও ইংরেজি সংবাদপোর্টাল।',
  alternates: { canonical: 'https://bdeveryday.com/about' }
};

export default function AboutPage() {
  return <>
    <h1 className="text-3xl font-bold text-[#8d1423]">আমাদের সম্পর্কে</h1>
    <p>বিডি এভরিডে বাংলাদেশের স্থানীয় সংবাদ, প্রবাসজীবন ও দৈনন্দিন জীবনের দরকারি গাইড নিয়ে বাংলা ও ইংরেজি সংবাদপোর্টাল। জেলার খবরের পাশাপাশি এখানে শিক্ষা, ব্যবসা, খেলাধুলা ও প্রযুক্তির খবর পাওয়া যায়।</p>
    <p>নিউজরুমের প্রকাশিত প্রতিবেদনে লেখকের নাম ও প্রকাশের সময় দেওয়া হয়। কোনো প্রতিবেদনে ভুল দেখলে সেই প্রতিবেদনের সংশোধনী ফর্মে জানাতে পারেন।</p>
    <p><Link className="font-semibold text-[#8d1423] underline underline-offset-4" href="/contact">নিউজরুমের সঙ্গে যোগাযোগ করুন</Link></p>
  </>;
}
