const liveIdPattern=/^[a-f0-9-]{36}$/;
const liveEventFields='id,title,summary,started_at,ended_at';
async function publicLive(env,path){
  if(path==='/api/live'){
    const result=await env.DB.prepare('SELECT '+liveEventFields+' FROM live_events ORDER BY ended_at IS NOT NULL, started_at DESC LIMIT 80').all();
    return json(result.results);
  }
  const id=path.split('/').pop();
  if(!liveIdPattern.test(id))return fail('Live coverage unavailable.',404);
  const event=await env.DB.prepare('SELECT '+liveEventFields+' FROM live_events WHERE id=?').bind(id).first();
  if(!event)return fail('Live coverage unavailable.',404);
  const updates=await env.DB.prepare('SELECT id,headline,body,author,posted_at FROM live_updates WHERE event_id=? ORDER BY posted_at DESC,id DESC').bind(id).all();
  return json({...event,updates:updates.results});
}
async function editLive(request,env){
  if(request.method!=='POST')return fail('Method unavailable.',405);
  let fields;
  try{fields=await request.json()}catch{return fail('Send valid update fields.',400)}
  if(!fields||typeof fields!=='object')return fail('Send valid update fields.',400);
  const field=(name,max)=>typeof fields[name]==='string'&&fields[name].length<=max?fields[name].trim():'';
  const action=fields.action,id=field('id',36);
  if(action==='start'){
    const title=field('title',150),summary=field('summary',500);
    if(!title||!summary)return fail('Enter a title and summary.',400);
    const eventId=crypto.randomUUID();
    await env.DB.prepare('INSERT INTO live_events (id,title,summary,started_at) VALUES (?,?,?,?)').bind(eventId,title,summary,now()).run();
    return json({id:eventId},201);
  }
  if(!liveIdPattern.test(id))return fail('Live coverage unavailable.',404);
  if(action==='update'){
    const headline=field('headline',150),body=field('body',5000),author=field('author',100);
    if(!headline||!body||!author)return fail('Enter a headline, update and byline.',400);
    const result=await env.DB.prepare('INSERT INTO live_updates (id,event_id,headline,body,author,posted_at) SELECT ?,id,?,?,?,? FROM live_events WHERE id=? AND ended_at IS NULL').bind(crypto.randomUUID(),headline,body,author,now(),id).run();
    if(!result.meta.changes)return fail('This event is unavailable or has ended.',409);
    return json({id},201);
  }
  if(action==='end'){
    const result=await env.DB.prepare('UPDATE live_events SET ended_at=? WHERE id=? AND ended_at IS NULL').bind(now(),id).run();
    if(!result.meta.changes)return fail('This event is unavailable or has ended.',409);
    return json({id});
  }
  return fail('Unknown live coverage action.',400);
}
