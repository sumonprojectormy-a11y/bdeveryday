const categories=new Set(['national','probash','world','business','sport','politics','district','entertainment','jobs','education','opinion','lifestyle','tech','faith','culture','satire','fashion','editorial','corporate','features','media','social','health','events','science']);
const countries=new Set(['malaysia','saudi-arabia','uae','uk','oman','qatar','kuwait','bahrain','jordan','singapore','japan','south-korea','maldives','italy','usa','canada','australia']);
const publicFields='id,title,summary,body,category,author,district,country,image_type,breaking,publish_at,updated_at';
const visible="status='published' AND publish_at<=?";
const imageTypes={'image/jpeg':[255,216,255],'image/png':[137,80,78,71],'image/webp':[82,73,70,70]};
const json=(payload,status=200)=>Response.json(payload,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const fail=(message,status)=>json({error:message},status);
const now=()=>new Date().toISOString();

async function identity(request,env){
  const id=request.headers.get('oai-authenticated-user-id');
  const email=request.headers.get('oai-authenticated-user-email')?.trim().toLowerCase();
  if(!id||!email)return null;
  if(email===env.NEWSROOM_OWNER?.trim().toLowerCase())return {email,role:'owner'};
  const member=await env.DB.prepare('SELECT role FROM newsroom_staff WHERE email=?').bind(email).first();
  return {email,role:member?.role??null};
}

async function editorRoute(request,env,path){
  const user=await identity(request,env);
  if(path==='/api/newsroom/session'&&request.method==='GET')return json({signedIn:!!user,role:user?.role??null});
  if(!user?.role)return fail('Newsroom access required.',user?403:401);
  const isEditor=user.role!=='reporter';
  if(request.method!=='GET'&&request.headers.get('Origin')!==new URL(request.url).origin)return fail('Invalid origin.',403);
  if(['/api/newsroom/inbox','/api/newsroom/inbox/photo','/api/newsroom/notes'].includes(path)){
    if(!isEditor)return fail('Editor access required.',403);
    return editorialRoute(request,env,path);
  }
  if(path==='/api/newsroom/live'){
    if(!isEditor)return fail('Editor access required.',403);
    return editLive(request,env);
  }
  if(path==='/api/newsroom/staff'){
    if(user.role!=='owner')return fail('Owner access required.',403);
    if(request.method==='GET')return json((await env.DB.prepare('SELECT email,role FROM newsroom_staff ORDER BY email').all()).results);
    if(request.method!=='POST')return fail('Method unavailable.',405);
    const fields=await request.json();
    const email=typeof fields.email==='string'?fields.email.trim().toLowerCase():'';
    if(email.length>254||!/^\S+@\S+\.\S+$/.test(email)||email===user.email)return fail('Use a valid staff email.',400);
    if(fields.role==='remove')await env.DB.prepare('DELETE FROM newsroom_staff WHERE email=?').bind(email).run();
    else if(['editor','reporter'].includes(fields.role))await env.DB.prepare('INSERT INTO newsroom_staff(email,role) VALUES(?,?) ON CONFLICT(email) DO UPDATE SET role=excluded.role').bind(email,fields.role).run();
    else return fail('Choose a staff role.',400);
    return json({ok:true});
  }
  if(path!=='/api/newsroom/articles')return fail('Page unavailable.',404);
  if(request.method==='GET'){
    const access=isEditor?'':' WHERE editor_email=?';
    const statement=env.DB.prepare('SELECT * FROM newsroom_articles'+access+' ORDER BY updated_at DESC');
    return json((await (isEditor?statement:statement.bind(user.email)).all()).results);
  }
  if(request.method!=='POST')return fail('Method unavailable.',405);
  const fields=await request.formData();
  const field=name=>{const value=fields.get(name);return typeof value==='string'?value.trim():''};
  const id=field('id')||crypto.randomUUID();
  const previous=await env.DB.prepare('SELECT * FROM newsroom_articles WHERE id=?').bind(id).first();
  if(field('id')&&!previous)return fail('Article unavailable.',404);
  if(!isEditor&&previous&&(previous.editor_email!==user.email||previous.status==='published'))return fail('Article access denied.',403);
  const title=field('title'),summary=field('summary'),body=field('body'),category=field('category'),author=field('author');
  const district=field('district')||null,country=field('country')||null,status=field('status');
  if(!title||title.length>150||!summary||summary.length>300||!body||body.length>16000||!author||author.length>100||!categories.has(category))return fail('Check the article fields and length limits.',400);
  if(district&&(!['national','district'].includes(category)||!/^([1-9]|[1-5][0-9]|6[0-4])$/.test(district)))return fail('Choose a valid district for district or national coverage.',400);
  if(country&&(category!=='probash'||!countries.has(country)))return fail('Choose a valid country for diaspora coverage.',400);
  if(!['draft','review','published'].includes(status)||(!isEditor&&status==='published'))return fail('This role cannot use the requested status.',403);
  const requestedTime=field('publish_at');let publishAt=null;
  if(status==='published'){
    if(requestedTime&&!Number.isFinite(Date.parse(requestedTime)))return fail('Enter a valid publication time.',400);
    publishAt=requestedTime?new Date(requestedTime).toISOString():previous?.publish_at??now();
  }
  const file=fields.get('image');
  let imageType=previous?.image_type??null;
  if(file instanceof File&&file.size){
    const signature=imageTypes[file.type];
    if(file.size>3*1024*1024||!signature)return fail('Use JPEG, PNG, or WebP up to 3 MB.',400);
    const bytes=new Uint8Array(await file.arrayBuffer());
    if(!signature.every((value,index)=>bytes[index]===value)||(file.type==='image/webp'&&new TextDecoder().decode(bytes.slice(8,12))!=='WEBP'))return fail('The uploaded image did not match its file type.',400);
    await env.BUCKET.put('newsroom/'+id,bytes,{httpMetadata:{contentType:file.type}});
    imageType=file.type;
  }
  const updated=now(),breaking=isEditor&&field('breaking')==='yes'?1:0;
  if(previous){
    await env.DB.prepare('UPDATE newsroom_articles SET title=?,summary=?,body=?,category=?,author=?,district=?,country=?,image_type=?,breaking=?,status=?,updated_at=?,publish_at=? WHERE id=?').bind(title,summary,body,category,author,district,country,imageType,breaking,status,updated,publishAt,id).run();
  }else{
    await env.DB.prepare('INSERT INTO newsroom_articles (id,title,summary,body,category,author,editor_email,district,country,image_type,breaking,status,created_at,updated_at,publish_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,title,summary,body,category,author,user.email,district,country,imageType,breaking,status,updated,updated,publishAt).run();
  }
  return json({id,status,publishAt});
}

function staticAsset(request,path){
  const item=assets[path]??(path.endsWith('/index.html')?assets[path.slice(0,-10)]:assets[path+'/']);
  if(!item)return new Response('Page not found',{status:404});
  const [type,base64]=item;
  const bytes=Uint8Array.from(atob(base64),character=>character.charCodeAt(0));
  const headers={'Content-Type':type,'X-Content-Type-Options':'nosniff','Cache-Control':type.startsWith('text/html')?'no-cache':'public, max-age=300'};
  const match=/^bytes=(\d*)-(\d*)$/.exec(request.headers.get('Range')??'');
  if(match&&type==='video/mp4'){
    const start=match[1]?Number(match[1]):Math.max(0,bytes.length-Number(match[2]));
    const end=match[1]&&match[2]?Math.min(Number(match[2]),bytes.length-1):bytes.length-1;
    if(start>end||start>=bytes.length)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+bytes.length}});
    return new Response(request.method==='HEAD'?null:bytes.slice(start,end+1),{status:206,headers:{...headers,'Accept-Ranges':'bytes','Content-Range':`bytes ${start}-${end}/${bytes.length}`,'Content-Length':String(end-start+1)}});
  }
  return new Response(request.method==='HEAD'?null:bytes,{headers:{...headers,'Content-Length':String(bytes.length)}});
}

export default {
  async fetch(request,env){
    const {pathname:path}=new URL(request.url);
    try{
      const article=path.match(/^(\/en)?\/article\/([a-z0-9-]{1,96})\/?$/);
      if(article&&['GET','HEAD'].includes(request.method))return await permanentArticle(request,env,article[1]?'en':'bn',article[2]);
      if(path==='/sitemap.xml'&&request.method==='GET')return await sitemap(request,env);
      if(path==='/robots.txt'&&request.method==='GET')return new Response('User-agent: *\nDisallow: /api/newsroom/\nSitemap: '+canonicalOrigin(new URL(request.url))+'/sitemap.xml\n',{headers:{'Content-Type':'text/plain; charset=utf-8'}});
      if(path==='/api/reader-submissions'&&request.method==='POST')return await readerSubmission(request,env);
      const notes=path.match(/^\/api\/articles\/([a-z0-9-]{1,96})\/notes$/);
      if(notes&&request.method==='GET'){
        const rows=await env.DB.prepare('SELECT note,source,created_at FROM article_notes WHERE article_id=? ORDER BY created_at DESC').bind(notes[1]).all();
        return json(rows.results);
      }
      const single=path.match(/^\/api\/articles\/([a-z0-9-]{1,96})$/);
      if(single&&request.method==='GET'){
        const item=await getPublished(env,single[1]);
        return item?json(item):fail('Article unavailable.',404);
      }
      const translation=path.match(/^\/api\/articles\/([^/]+)\/english$/);
      if(translation&&request.method==='GET')return englishArticle(env,decodeURIComponent(translation[1]),new URL(request.url).searchParams.has('full'));
      if(path.startsWith('/api/newsroom/'))return await editorRoute(request,env,path);
      if((path==='/api/live'||path.startsWith('/api/live/'))&&request.method==='GET')return await publicLive(env,path);
      if(path==='/api/articles'&&request.method==='GET'){
        const result=await env.DB.prepare('SELECT '+publicFields+' FROM newsroom_articles WHERE '+visible+' ORDER BY publish_at DESC LIMIT 100').bind(now()).all();
        return json(result.results);
      }
      if(path.startsWith('/article-photo/')&&['GET','HEAD'].includes(request.method)){
        const id=path.split('/')[2];
        const row=await env.DB.prepare('SELECT image_type FROM newsroom_articles WHERE id=? AND '+visible).bind(id,now()).first();
        if(!row?.image_type)return fail('Image unavailable.',404);
        const photo=await env.BUCKET.get('newsroom/'+id);
        if(!photo)return fail('Image unavailable.',404);
        return new Response(request.method==='HEAD'?null:photo.body,{headers:{'Content-Type':row.image_type,'X-Content-Type-Options':'nosniff','Cache-Control':'public, max-age=60'}});
      }
      if(!['GET','HEAD'].includes(request.method))return fail('Method unavailable.',405);
      const canonical=path.endsWith('/')?path:path+'/';
      if(Object.hasOwn(desks,canonical)){
        if(path!==canonical){const url=new URL(request.url);url.pathname=canonical;return Response.redirect(url.href,308)}
        return sectionPage(request,desks[canonical],canonical);
      }
      const asset=staticAsset(request,path);
      if(asset.status===404 && !path.startsWith('/api/') && !/\.[a-z0-9]+$/i.test(path))return missingPage(request);
      if(asset.status===404 && request.headers.get('Accept')?.includes('text/html'))return missingPage(request);
      return asset;
    }catch(error){
      console.error('Newsroom request failed',path,error?.message);
      return fail('The request could not be completed.',500);
    }
  }
};
