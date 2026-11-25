begin;

insert into public.portal_content(kind,slug,payload,position) values
('comparison','comparison-1','{"category":1,"name":"রিচার্জেবল ফ্যান","detail":"১২ ইঞ্চি · ৩ গতির সেটিং","keywords":"rechargeable fan","offers":[{"merchant":"COD.com.bd","price":2350,"delivery":110},{"merchant":"নমুনা দোকান A","price":2290,"delivery":190},{"merchant":"নমুনা দোকান B","price":2490,"delivery":0}]}',0),
('comparison','comparison-2','{"category":2,"name":"স্কুল ব্যাগ","detail":"২০ লিটার · প্যাডযুক্ত স্ট্র্যাপ","keywords":"school bag backpack","offers":[{"merchant":"COD.com.bd","price":920,"delivery":80},{"merchant":"নমুনা দোকান A","price":880,"delivery":150},{"merchant":"নমুনা দোকান B","price":990,"delivery":70}]}',1),
('comparison','comparison-3','{"category":3,"name":"ইলেকট্রিক কেটলি","detail":"১.৮ লিটার · স্টেইনলেস স্টিল","keywords":"electric kettle","offers":[{"merchant":"COD.com.bd","price":1190,"delivery":90},{"merchant":"নমুনা দোকান A","price":1120,"delivery":100},{"merchant":"নমুনা দোকান B","price":1280,"delivery":0}]}',2),
('comparison','comparison-4','{"category":1,"name":"পাওয়ার ব্যাংক","detail":"১০,০০০ mAh · USB-C","keywords":"power bank","offers":[{"merchant":"COD.com.bd","price":1490,"delivery":90},{"merchant":"নমুনা দোকান A","price":1450,"delivery":180},{"merchant":"নমুনা দোকান B","price":1550,"delivery":0}]}',3),
('comparison','comparison-5','{"category":2,"name":"স্কুল লাঞ্চ বক্স","detail":"৮০০ মিলি · তিনটি খোপ","keywords":"school lunch box","offers":[{"merchant":"COD.com.bd","price":540,"delivery":70},{"merchant":"নমুনা দোকান A","price":490,"delivery":90},{"merchant":"নমুনা দোকান B","price":590,"delivery":0}]}',4),
('comparison','comparison-6','{"category":3,"name":"ভ্যাকুয়াম ফ্লাস্ক","detail":"৫০০ মিলি · স্টেইনলেস স্টিল","keywords":"vacuum flask bottle","offers":[{"merchant":"COD.com.bd","price":790,"delivery":70},{"merchant":"নমুনা দোকান A","price":760,"delivery":130},{"merchant":"নমুনা দোকান B","price":865,"delivery":0}]}',5),
('opportunity','opportunity-1','{"kind":1,"title":"জুনিয়র সেলস এক্সিকিউটিভ","location":"ঢাকা","eligibility":"নতুন গ্র্যাজুয়েট","keywords":"sales dhaka","description":"গ্রাহকের প্রশ্নের উত্তর দিন এবং পণ্য বাছাইয়ে সহায়তা করুন।","demoDays":1}',0),
('opportunity','opportunity-2','{"kind":2,"title":"ডিজিটাল মার্কেটিং ইন্টার্ন","location":"ঢাকা","eligibility":"৩ মাস","keywords":"digital marketing dhaka","description":"সোশ্যাল মিডিয়ার কনটেন্ট ও সাপ্তাহিক রিপোর্ট তৈরিতে দলকে সহায়তা করুন।","demoDays":3}',1),
('opportunity','opportunity-3','{"kind":1,"title":"কাস্টমার সাপোর্ট অ্যাসিস্ট্যান্ট","location":"চট্টগ্রাম","eligibility":"০–১ বছর অভিজ্ঞতা","keywords":"customer support chattogram","description":"ফোন ও চ্যাটে গ্রাহকদের অর্ডার এবং ডেলিভারি সংক্রান্ত প্রশ্নের উত্তর দিন।","demoDays":8}',2),
('opportunity','opportunity-4','{"kind":3,"title":"স্নাতক শিক্ষার্থীদের বৃত্তি","location":"সারা বাংলাদেশ","eligibility":"বর্তমান স্নাতক শিক্ষার্থী","keywords":"scholarship bangladesh","description":"আবেদনের জন্য শিক্ষাপ্রতিষ্ঠানের প্রত্যয়নপত্র ও ফলাফলের কপি প্রস্তুত রাখুন।","demoDays":12}',3),
('opportunity','opportunity-5','{"kind":4,"title":"এক্সেল ও স্প্রেডশিট প্রশিক্ষণ","location":"অনলাইন","eligibility":"শুরুর স্তর","keywords":"excel online training","description":"ফর্মুলা, ফিল্টার ও দৈনন্দিন হিসাবের জন্য স্প্রেডশিট ব্যবহার শিখুন।","demoDays":2}',4),
('product','product-1','{"name":"ফুড কনটেইনার সেট","category":"রান্নাঘর ও সংরক্ষণ","description":"চারটি ঢাকনাসহ পাত্র","keywords":"food container","price":649,"stock":30}',0),
('product','product-2','{"name":"মসলার জার সেট","category":"রান্নাঘর ও সংরক্ষণ","description":"ছয়টি কাচের জার","keywords":"spice jars","price":790,"stock":30}',1),
('product','product-3','{"name":"স্কুল লাঞ্চ সেট","category":"স্কুল ও অফিস","description":"লাঞ্চ বক্স ও পানির বোতল","keywords":"lunch box bottle school","price":890,"stock":30}',2),
('product','product-4','{"name":"ইনসুলেটেড লাঞ্চ ব্যাগ","category":"স্কুল ও অফিস","description":"স্কুল বা অফিসের জন্য","keywords":"lunch bag","price":490,"stock":30}',3),
('product','product-5','{"name":"রিচার্জেবল লাইট","category":"ঘরের দরকারি জিনিস","description":"USB চার্জিং ও দুই মোড","keywords":"rechargeable light","price":590,"stock":30}',4),
('product','product-6','{"name":"স্টোরেজ বাস্কেট","category":"ঘরের দরকারি জিনিস","description":"হাতলসহ মাঝারি ঝুড়ি","keywords":"storage basket","price":350,"stock":30}',5),
('delivery-zone','dhaka','{"label":"ঢাকার ভেতরে","fee":70}',0),
('delivery-zone','outside-dhaka','{"label":"ঢাকার বাইরে","fee":130}',1)
on conflict(kind,slug) do nothing;

insert into public.newsroom_articles (id,title,summary,body,category,author,editor_email,status,publish_at) values
('newsroom-training-draft','প্রতিবেদনের সম্পাদকীয় খসড়া','প্রকাশের আগে তথ্য ও উৎস যাচাই করুন।','স্থানীয় খবরের ক্ষেত্রে স্থান, সময় ও প্রত্যক্ষ সূত্র যাচাই করে প্রতিবেদন প্রস্তুত করুন।','national','বিডি এভরিডে ডেস্ক','newsroom@bdeveryday.com','draft',null)
on conflict(id) do nothing;

commit;
