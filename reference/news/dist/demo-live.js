const demoCoverageId='demo-book-fair';
function demoCoverage(){
  const copy=(bn,en)=>document.documentElement.lang==='en'?en:bn;
  const author=copy('বিডি এভরিডে নমুনা ডেস্ক','BD Everyday Demo Desk');
  return {
    id:demoCoverageId,demo:true,
    title:copy('পাড়ার বই বিনিময়: নমুনা লাইভ কভারেজ','Neighbourhood book swap: sample live coverage'),
    summary:copy('একটি কাল্পনিক বই বিনিময় আয়োজনের তিনটি সময়ভিত্তিক আপডেট।','Three timestamped updates from a fictional community book swap.'),
    started_at:'2026-11-23T03:30:00Z',
    ended_at:'2026-11-23T06:00:00Z',
    updates:[
      {posted_at:'2026-11-23T06:00:00Z',author,headline:copy('বই বিনিময় শেষ','The swap has ended'),
        body:copy('শেষ পর্বে অবশিষ্ট বই আলাদা করে রাখা হয়েছে। আয়োজনের শুরু থেকে শেষ পর্যন্ত আগের আপডেটগুলো নিচে পড়তে পারেন।','The remaining books were set aside at closing. Earlier updates below show how the event progressed.')},
      {posted_at:'2026-11-23T04:40:00Z',author,headline:copy('পাঠচক্রে পছন্দের বই নিয়ে আলোচনা','Readers share their favourite books'),
        body:copy('পাঠচক্রে প্রত্যেকে নিজের পছন্দের একটি বইয়ের কথা বলেছে। এরপর টেবিলের বই বিনিময় আবার শুরু হয়।','Participants each described a favourite book during the reading circle, then returned to the swap tables.')},
      {posted_at:'2026-11-23T03:30:00Z',author,headline:copy('বইয়ের টেবিল খুলেছে','The book tables are open'),
        body:copy('প্রবেশপথের পাশে বই জমা এবং শিশুদের বইয়ের জন্য দুটি আলাদা টেবিল রাখা হয়েছে।','Two tables near the entrance separate general donations from children’s books.')}
    ]
  };
}
