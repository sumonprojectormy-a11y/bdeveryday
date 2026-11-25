// Only the public article route calls this translator. Cache each part so a long
// report can resume after a provider outage or daily quota reset.
const bengaliScript=/[\u0980-\u09ff]/u;
function translationChunks(text){
  const chunks=[];
  let chunk='';
  let bytes=0;
  const encoder=new TextEncoder();
  for(const token of text.match(/\S+\s*|\s+/gu)??[]){
    const size=encoder.encode(token).length;
    if(bytes+size>490&&chunk){chunks.push(chunk);chunk='';bytes=0}
    for(const ch of token){
      const n=encoder.encode(ch).length;
      if(bytes+n>490){chunks.push(chunk);chunk='';bytes=0}
      chunk+=ch;bytes+=n;
    }
  }
  if(chunk)chunks.push(chunk);
  return chunks;
}
async function translatePublishedText(text,bucket,prefix){
  if(!bengaliScript.test(text))return text;
  const parts=translationChunks(text);
  const output=[];
  for(const [i,part] of parts.entries()){
    const key=prefix+'/'+i;
    const existing=await bucket.get(key);
    if(existing){output.push(await existing.text());continue}
    const url=new URL('https://api.mymemory.translated.net/get');
    url.search=new URLSearchParams({q:part.trim(),langpair:'bn|en'}).toString();
    const response=await fetch(url,{signal:AbortSignal.timeout(8000)});
    if(!response.ok)throw Error('Translation temporarily unavailable');
    const result=await response.json();
    const english=result.responseData?.translatedText?.trim();
    if(Number(result.responseStatus)!==200||result.quotaFinished||!english||english===part.trim())throw Error('Translation unavailable');
    await bucket.put(key,english);
    output.push(english);
  }
  return output.join(' ');
}
async function englishArticle(env,id,full){
  const item=await env.DB.prepare('SELECT '+publicFields+' FROM newsroom_articles WHERE id=? AND '+visible).bind(id,now()).first();
  if(!item)return fail('Article unavailable.',404);
  const prefix='english-v1/'+encodeURIComponent(id)+'/'+encodeURIComponent(item.updated_at);
  const key=prefix+(full?'/full.json':'/card.json');
  const cached=await env.BUCKET.get(key);
  if(cached)return json(await cached.json());
  try{
    const fields={};
    for(const name of ['title','summary'])fields[name]=await translatePublishedText(item[name],env.BUCKET,prefix+'/'+name);
    if(full){
      const body=[];
      for(const [i,p] of item.body.split(/\n+/).filter(Boolean).entries()){
        body.push(await translatePublishedText(p,env.BUCKET,prefix+'/body/'+i));
      }
      fields.body=body.join('\n\n');
    }
    await env.BUCKET.put(key,JSON.stringify(fields));
    return json(fields);
  }catch{return fail('English translation is temporarily unavailable.',503)}
}
