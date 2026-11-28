import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'গোপনীয়তা নীতি | BD Everyday',
  description: 'বিডি এভরিডেতে পড়ার পছন্দ, পাঠকের পাঠানো তথ্য এবং অ্যাকাউন্ট সংক্রান্ত তথ্য কীভাবে ব্যবহৃত হয়।',
  alternates: { canonical: 'https://bdeveryday.com/privacy-policy' }
};

export default function PrivacyPolicyPage() {
  return <>
    <h1 className="text-3xl font-bold text-[#8d1423]">গোপনীয়তা নীতি</h1>
    <section className="space-y-2">
      <h2 className="text-xl font-semibold">পড়ার পছন্দ ও তালিকা</h2>
      <p>পড়ার তালিকা, প্রদর্শনের পছন্দ ও পাঠক প্রোফাইলের নাম এই ব্রাউজারে সংরক্ষিত হতে পারে। ব্রাউজারের সেটিংস থেকে সাইটের ডেটা মুছে সেগুলো সরাতে পারেন। সংবাদ পড়তে অ্যাকাউন্ট লাগে না।</p>
    </section>
    <section className="space-y-2">
      <h2 className="text-xl font-semibold">পাঠকের পাঠানো তথ্য</h2>
      <p>খবরের তথ্য বা সংশোধনী পাঠালে আপনার দেওয়া বিবরণ, ঐচ্ছিক যোগাযোগের তথ্য এবং প্রযোজ্য ক্ষেত্রে ছবি সম্পাদকের পর্যালোচনার জন্য জমা হয়। ফর্মে অপ্রয়োজনীয় ব্যক্তিগত তথ্য দেবেন না।</p>
    </section>
    <section className="space-y-2">
      <h2 className="text-xl font-semibold">সাইন-ইন ও অর্ডার</h2>
      <p>নিউজরুমে সাইন-ইনের জন্য সেশন কুকি ব্যবহৃত হয়। দোকানে অর্ডার করলে নাম, ফোন নম্বর ও ডেলিভারি ঠিকানা অর্ডার প্রক্রিয়াকরণের জন্য ব্যবহৃত হয়।</p>
    </section>
    <p>গোপনীয়তা নিয়ে প্রশ্ন থাকলে <Link className="font-semibold text-[#8d1423] underline underline-offset-4" href="/contact">যোগাযোগের পথগুলো দেখুন</Link>।</p>
  </>;
}
