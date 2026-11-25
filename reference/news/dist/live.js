let liveEvents=[];
let liveEventsReady=false;
const liveText=(bangla,english)=>englishEdition?english:bangla;
const liveLabel=()=>liveText('লাইভ আপডেট','Live updates');
const firstLiveEvent=()=>liveEvents.find(event=>!event.ended_at);
const liveLink=id=>link('live',id);
const liveStatus=event=>event.ended_at?liveText('সমাপ্ত','Ended'):liveText('লাইভ','Live');
function liveTime(value){
  return new Intl.DateTimeFormat(liveText('bn-BD','en-GB'),{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Dhaka'}).format(new Date(value));
}
function liveIndex(){
  return '<section class="section live-coverage"><h1>'+liveLabel()+'</h1><div id="live-feed"><p role="status">'+liveText('লোড হচ্ছে…','Loading…')+'</p></div></section>';
}
function liveHeader(event){
  return '<span class="coverage-status'+(!event.ended_at?' live-now':'')+'">'+liveStatus(event)+'</span><h2>'+safe(event.title)+'</h2><p>'+safe(event.summary)+'</p>';
}
function renderLiveFeed(){
  return '<div class="live-list">'+[...liveEvents,demoCoverage()].map(event=>'<article>'+liveHeader(event)+'<p><a href="'+liveLink(event.id)+'">'+liveText('আপডেট পড়ুন','Read updates')+'</a></p></article>').join('')+'</div>';
}
function renderLiveEvent(event){
  const timeline=event.updates.map(update=>'<li><article><time datetime="'+safe(update.posted_at)+'">'+liveTime(update.posted_at)+'</time><h3>'+safe(update.headline)+'</h3><p class="live-author">'+safe(update.author)+'</p>'+update.body.split(/\n+/).filter(Boolean).map(paragraph=>'<p>'+safe(paragraph)+'</p>').join('')+'</article></li>').join('');
  return '<p><a href="#tool/live">'+liveText('সব লাইভ আপডেট','All live coverage')+'</a></p>'+liveHeader(event)+'<p class="live-author">'+liveText('শুরু ','Started ')+liveTime(event.started_at)+(event.ended_at?' · '+liveText('শেষ ','Ended ')+liveTime(event.ended_at):' · '+liveText('বাংলাদেশ সময়','Bangladesh time'))+'</p>'+(timeline?'<ol class="live-timeline">'+timeline+'</ol>':'<p>'+liveText('প্রথম আপডেটের অপেক্ষায়।','Waiting for the first update.')+'</p>');
}
let liveRefreshId=0;
async function refreshLive(eventId='',showError=true){
  const requestId=++liveRefreshId;
  const root=get('live-feed');
  const requests=[newsroomApi('/api/live'),eventId===demoCoverageId?Promise.resolve(demoCoverage()):eventId?newsroomApi('/api/live/'+encodeURIComponent(eventId)):Promise.resolve(null)];
  const [events,selected]=await Promise.allSettled(requests);
  if(requestId!==liveRefreshId)return;
  if(events.status==='fulfilled'){
    const before=firstLiveEvent();
    const hadLive=liveEventsReady;
    liveEvents=events.value;
    liveEventsReady=true;
    const current=firstLiveEvent();
    if(current?.id!==before?.id||current?.title!==before?.title){
      if(!hadLive&&current)breakingIndex=0;
      refreshBreakingBar(englishEdition);
    }
  }
  if(!root?.isConnected)return;
  const loaded=!eventId||selected.status==='fulfilled';
  if(!loaded){
    if(showError||!root.dataset.loaded)root.innerHTML='<p role="status">'+liveText('লাইভ আপডেট এখন পাওয়া যাচ্ছে না।','Live coverage is currently unavailable.')+'</p>';
    return;
  }
  const html=eventId?renderLiveEvent(selected.value):renderLiveFeed();
  if(html!==root.dataset.content){root.innerHTML=html;root.dataset.content=html}
  root.dataset.loaded='true';
}
function pollLive(){
  if(document.hidden)return;
  const [type,id='']=location.hash.slice(1).split('/');
  void refreshLive(type==='live'?id:'',false);
}
function liveDeskPage(){
  return '<section class="section live-coverage"><p><a href="#tool/desk">নিউজরুমে ফিরুন</a></p><h1>লাইভ আপডেট পরিচালনা</h1><div id="live-desk"><p role="status">লোড হচ্ছে…</p></div></section>';
}
async function mountLiveDesk(selectedId='',message=''){
  const root=get('live-desk');
  if(!root)return;
  try{
    const session=await newsroomApi('/api/newsroom/session');
    if(!root.isConnected)return;
    if(!session.signedIn){root.innerHTML='<p>লাইভ কভারেজ পরিচালনা করতে সাইন ইন করুন।</p><a target="_top" href="/admin/login">সাইন ইন করুন</a>';return}
    if(!['owner','editor'].includes(session.role)){root.textContent='লাইভ কভারেজ পরিচালনার জন্য সম্পাদক অ্যাক্সেস প্রয়োজন।';return}
    const events=await newsroomApi('/api/live');
    if(!root.isConnected)return;
    const active=events.filter(event=>!event.ended_at);
    const selected=active.find(event=>event.id===selectedId)??active[0];
    const options=newsroomOptions(active.map(event=>[event.id,event.title]),selected?.id);
    root.innerHTML='<p id="live-desk-status" role="status">'+safe(message)+'</p><div class="desk-layout"><section><h2>নতুন লাইভ কভারেজ</h2><form class="stack" id="start-live"><input type="hidden" name="action" value="start"><label>শিরোনাম<input name="title" required maxlength="150"></label><label>সারাংশ<textarea name="summary" required maxlength="500" rows="3"></textarea></label><button>লাইভ শুরু করুন</button></form></section><section><h2>চলমান কভারেজ</h2>'+(selected?'<label>কভারেজ <select id="manage-live">'+options+'</select></label><p><a href="'+liveLink(selected.id)+'">পাঠকের পাতা দেখুন</a></p><form class="stack" id="post-live"><input type="hidden" name="action" value="update"><input type="hidden" name="id" value="'+selected.id+'"><label>শিরোনাম<input name="headline" required maxlength="150"></label><label>প্রতিবেদকের নাম<input name="author" required maxlength="100"></label><label>আপডেট<textarea name="body" required maxlength="5000" rows="6"></textarea></label><button>আপডেট প্রকাশ করুন</button></form><form class="tools" id="end-live"><input type="hidden" name="action" value="end"><input type="hidden" name="id" value="'+selected.id+'"><button>কভারেজ শেষ করুন</button></form>':'<p>এখন কোনো কভারেজ চলছে না।</p>')+'</section></div>';
    const manager=get('manage-live');
    if(manager)manager.onchange=()=>void mountLiveDesk(manager.value);
    root.querySelectorAll('form').forEach(form=>{form.onsubmit=async event=>{
      event.preventDefault();
      const fields=Object.fromEntries(new FormData(form));
      if(fields.action==='end'&&!window.confirm('এই লাইভ কভারেজ শেষ করবেন?'))return;
      const button=form.querySelector('button');
      button.disabled=true;
      try{
        const result=await newsroomApi('/api/newsroom/live',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(fields)});
        await refreshLive();
        if(!root.isConnected)return;
        await mountLiveDesk(result.id,{start:'লাইভ কভারেজ শুরু হয়েছে।',update:'আপডেট প্রকাশিত হয়েছে।',end:'কভারেজ শেষ হয়েছে।'}[fields.action]);
      }catch(error){
        if(root.isConnected)get('live-desk-status').textContent=error.message;
        button.disabled=false;
      }
    }});
  }catch(error){if(root.isConnected)root.textContent=error.message}
}
