import { readFileSync, writeFileSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const input = JSON.parse(readFileSync(new URL('reference/companion-fixtures.json', root), 'utf8'));
const sql = value => "'" + value.replaceAll("'", "''") + "'";
const content = [];
const push = (kind, slug, payload, position) => content.push('('+[kind,slug,JSON.stringify(payload)].map(sql).join(',')+','+position+')');
input.compare.products.forEach((item,i) => push('comparison','comparison-'+(i+1),{
  ...item, offers:item.offers.map(([price,delivery],index)=>({merchant:input.compare.stores[index],price,delivery}))
},i));
input.jobs.listings.forEach(([kind,title,location,eligibility,keywords,description,offset],i) =>
  push('opportunity','opportunity-'+(i+1),{kind,title,location,eligibility,keywords,description,demoDays:offset},i));
input.shop.products.forEach(([name,category,description,keywords,price],i) =>
  push('product','product-'+(i+1),{name,category,description,keywords,price,stock:30},i));
push('delivery-zone','dhaka',{label:'ঢাকার ভেতরে',fee:70},0);
push('delivery-zone','outside-dhaka',{label:'ঢাকার বাইরে',fee:130},1);
const demo = `begin;

insert into public.portal_content(kind,slug,payload,position) values
${content.join(',\n')}
on conflict(kind,slug) do nothing;

insert into public.newsroom_articles (id,title,summary,body,category,author,editor_email,status,publish_at) values
('newsroom-training-draft','প্রতিবেদনের সম্পাদকীয় খসড়া','প্রকাশের আগে তথ্য ও উৎস যাচাই করুন।','স্থানীয় খবরের ক্ষেত্রে স্থান, সময় ও প্রত্যক্ষ সূত্র যাচাই করে প্রতিবেদন প্রস্তুত করুন।','national','বিডি এভরিডে ডেস্ক','newsroom@bdeveryday.com','draft',null)
on conflict(id) do nothing;

commit;
`;
writeFileSync(new URL('supabase/demo.sql', root),demo);
