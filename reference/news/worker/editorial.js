const articleId=/^[a-z0-9-]{1,96}$/;
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const permanent=(id,locale='bn')=>(locale==='en'?'/en':'')+'/article/'+encodeURIComponent(id);
const getPublished=(env,id)=>env.DB.prepare('SELECT '+publicFields+' FROM newsroom_articles WHERE id=? AND '+visible).bind(id,now()).first();
function canonicalOrigin(url){
  const configured=globalThis.process?.env?.NEXT_PUBLIC_SITE_URL;
  if(configured){try{return new URL(configured).origin}catch{}}
  return /^(www\.)?bdeveryday\.com$/i.test(url.hostname)?'https://bdeveryday.com':url.origin;
}
function articleImage(item,origin){
  if(item.image_type)return origin+'/article-photo/'+item.id;
  return new URL((item.photo?.startsWith('/')||item.photo?.startsWith('https://'))?item.photo:'/apple-touch-icon.png',origin).href;
}
async function permanentArticle(request,env,locale,id){
  const bundled=Object.hasOwn(demoIndex[locale],id)?demoIndex[locale][id]:null;
  const published=await getPublished(env,id);
  const item=published??bundled;
  const demo=!published&&bundled&&!publishedGuides.has(id);
  if(!item)return missingPage(request);
  let localized=item;
  if(published&&locale==='en'){
    const cache='english-v1/'+encodeURIComponent(id)+'/'+encodeURIComponent(item.updated_at)+'/full.json';
    const translation=await env.BUCKET.get(cache);
    if(translation)localized={...item,...await translation.json()};
    else {
      const card=await englishArticle(env,id,false);
      if(card.ok)localized={...item,...await card.json()};
    }
  }
  const origin=canonicalOrigin(new URL(request.url));
  const url=origin+permanent(id,locale),image=articleImage(item,origin),title=localized.title+' | BD Everyday';
  const summary=(demo?(locale==='en'?'Demo article. ':'নমুনা প্রতিবেদন। '):'')+localized.summary;
  const raw=await staticAsset(new Request(request.url),locale==='en'?'/en/':'/').text();
  const meta=(demo?'<meta name="robots" content="noindex">':'')+'<meta name="description" content="'+escapeHtml(summary)+'"><link rel="canonical" href="'+escapeHtml(url)+'">'+['bn','en'].map(lang=>'<link rel="alternate" hreflang="'+lang+'" href="'+escapeHtml(origin+permanent(id,lang))+'">').join('')+
    Object.entries({'og:type':'article','og:title':title,'og:description':summary,'og:url':url,'og:image':image,'og:site_name':'BD Everyday','og:locale':locale==='en'?'en_GB':'bn_BD'}).map(([k,v])=>'<meta property="'+k+'" content="'+escapeHtml(v)+'">').join('')+'<meta name="twitter:card" content="summary_large_image">';
  const article='<article class="reading"><h1>'+escapeHtml(localized.title)+'</h1><p>'+escapeHtml(summary)+'</p>'+localized.body.split(/\n+/).filter(Boolean).map(p=>'<p>'+escapeHtml(p)+'</p>').join('')+'</article>';
  const html=raw.replace(/<title>[^<]*<\/title>/,()=>'<title>'+escapeHtml(title)+'</title>').replace(/<meta name="description"[^>]*>/,()=>meta).replace('<div id="content"></div>',()=>'<div id="content">'+article+'</div>');
  const headers={'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'};
  if(demo)headers['X-Robots-Tag']='noindex';
  return new Response(request.method==='HEAD'?null:html,{headers});
}
export async function sitemapPaths(env){
  const rows=(await env.DB.prepare('SELECT id,updated_at FROM newsroom_articles WHERE '+visible).bind(now()).all()).results;
  const pages = new Map();
  for (const path of ['/', '/about', '/contact', '/privacy-policy', '/en/', '/country/', '/en/country/', '/compare', '/opportunities', '/shop', ...Object.keys(desks)]) {
    pages.set(path, undefined);
  }
  for (const lang of ['bn', 'en']) {
    for (const id of publishedGuides) {
      pages.set(permanent(id, lang), demoIndex[lang][id].date);
    }
    for (const item of rows) {
      pages.set(permanent(item.id, lang), item.updated_at);
    }
  }
  return Array.from(pages);
}
async function sitemap(request,env){
  const origin=canonicalOrigin(new URL(request.url));
  const pages=await sitemapPaths(env);
  return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pages.map(([path,date])=>'<url><loc>'+escapeHtml(origin+path)+'</loc>'+(date?'<lastmod>'+escapeHtml(date)+'</lastmod>':'')+'</url>').join('')+'</urlset>',{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=300'}});
}
async function readerSubmission(request,env){
  if(request.headers.get('Origin')!==new URL(request.url).origin)return fail('Invalid origin.',403);
  if(Number(request.headers.get('Content-Length'))>3_200_000)return fail('The submission is too large.',413);
  let form;try{form=await request.formData()}catch{return fail('Invalid form.',400)}
  const field=name=>typeof form.get(name)==='string'?form.get(name).trim():'';
  if(field('website'))return json({ok:true},202);
  const kind=field('kind'),id=field('article'),location=field('location'),message=field('message'),contact=field('contact');
  if(!['tip','correction'].includes(kind)||message.length<10||message.length>4000||contact.length>180||location.length>160)return fail('Check the submission fields.',400);
  if(kind==='tip'&&!location)return fail('Enter a location.',400);
  if(kind==='correction'&&(!articleId.test(id)||(!Object.hasOwn(demoIndex.bn,id)&&!await getPublished(env,id))))return fail('Article unavailable.',404);
  const upload=form.get('photo'),key=crypto.randomUUID();
  let image=null;
  if(upload instanceof File&&upload.size){
    if(kind!=='tip'||upload.size>3*1024*1024||!imageTypes[upload.type])return fail('Use JPEG, PNG or WebP up to 3 MB.',400);
    const bytes=new Uint8Array(await upload.arrayBuffer());
    if(!imageTypes[upload.type].every((byte,index)=>bytes[index]===byte)||(upload.type==='image/webp'&&new TextDecoder().decode(bytes.slice(8,12))!=='WEBP'))return fail('Invalid image.',400);
    await env.BUCKET.put('reader-inbox/'+key,bytes);
    image=upload.type;
  }
  try{
    await env.DB.prepare('INSERT INTO reader_submissions (id,kind,article_id,location,message,contact,image_type,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(key,kind,kind==='correction'?id:null,location||null,message,contact||null,image,now()).run();
  }catch(error){if(image)await env.BUCKET.delete('reader-inbox/'+key);throw error}
  return json({ok:true},202);
}
async function editorialRoute(request,env,path){
  const key=new URL(request.url).searchParams.get('id');
  if(path==='/api/newsroom/inbox/photo'&&request.method==='GET'){
    const item=await env.DB.prepare('SELECT image_type FROM reader_submissions WHERE id=?').bind(key).first();
    if(!item?.image_type)return fail('Photo unavailable.',404);
    const object=await env.BUCKET.get('reader-inbox/'+key);
    return object?new Response(object.body,{headers:{'Content-Type':item.image_type,'Cache-Control':'private,no-store','X-Content-Type-Options':'nosniff'}}):fail('Photo unavailable.',404);
  }
  if(path==='/api/newsroom/inbox'&&request.method==='GET'){
    const rows=await env.DB.prepare('SELECT * FROM reader_submissions ORDER BY reviewed_at IS NOT NULL,created_at DESC LIMIT 100').all();
    return json(rows.results);
  }
  if(request.method!=='POST')return fail('Method unavailable.',405);
  let fields;try{fields=await request.json()}catch{return fail('Invalid fields.',400)}
  const field=key=>typeof fields?.[key]==='string'?fields[key].trim():'';
  if(path==='/api/newsroom/inbox'){
    await env.DB.prepare('UPDATE reader_submissions SET reviewed_at=? WHERE id=? AND reviewed_at IS NULL').bind(now(),field('id')).run();
    return json({ok:true});
  }
  const id=field('article'),note=field('note'),source=field('source');
  if(!articleId.test(id)||!note||note.length>1500||source.length>1000||(!Object.hasOwn(demoIndex.bn,id)&&!await getPublished(env,id)))return fail('Check the article and correction fields.',400);
  if(source){try{if(!['http:','https:'].includes(new URL(source).protocol))throw Error()}catch{return fail('Use a valid source URL.',400)}}
  await env.DB.prepare('INSERT INTO article_notes (id,article_id,note,source,created_at) VALUES (?,?,?,?,?)').bind(crypto.randomUUID(),id,note,source||null,now()).run();
  return json({ok:true},201);
}

function sectionPage(request, route, path) {
  const home = route.locale === 'en' ? '/en/' : '/';
  const shell = new TextDecoder().decode(Uint8Array.from(atob(assets[home][1]), c => c.charCodeAt(0)));
  const origin = canonicalOrigin(new URL(request.url));
  const suffix = path.slice(home.length);
  const meta = '<link rel="canonical" href="'+escapeHtml(origin+path)+'">'+['bn','en'].map(lang =>
    '<link rel="alternate" hreflang="'+lang+'" href="'+escapeHtml(origin+(lang==='en'?'/en/':'/')+suffix)+'">'
  ).join('');
  const title = escapeHtml(route.label);
  const html = shell.replace(/<title>[^<]*<\/title>/, () => '<title>'+title+' | BD Everyday</title>'+meta)
    .replace('<body>', '<body data-desk="'+route.type+'" data-key="'+route.key+'">')
    .replace('<div id="content"></div>', () => '<div id="content"><h1>'+title+'</h1></div>');
  return new Response(request.method==='HEAD'?null:html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'}});
}

function missingPage(request) {
  const english = /^\/en(?:\/|$)/.test(new URL(request.url).pathname);
  const home = english ? '/en/' : '/';
  const title = english ? 'Page not found' : 'পাতাটি পাওয়া যায়নি';
  const search = english ? 'Search news' : 'খবর খুঁজুন';
  const html = `<!doctype html><html lang="${english?'en':'bn'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} | BD Everyday</title><link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/newspaper-theme.css?v=missing-page"></head><body><main class="missing-page"><a href="${home}"><img src="/bd-everyday-logo.svg" alt="BD Everyday"></a><p class="missing-status">404</p><h1>${title}</h1><p>${english?'Try searching for the headline or a keyword.':'শিরোনাম বা কোনো শব্দ লিখে খবরটি খুঁজে দেখুন।'}</p><form action="${home}" method="get"><label for="missing-query">${search}</label><input id="missing-query" name="q" type="search" required><button>${english?'Search':'খুঁজুন'}</button></form><div><a href="${home}latest/">${english?'Latest news':'সর্বশেষ খবর'}</a><a href="${home}">${english?'Home':'প্রচ্ছদ'}</a></div></main></body></html>`;
  return new Response(request.method==='HEAD'?null:html,{status:404,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'}});
}
