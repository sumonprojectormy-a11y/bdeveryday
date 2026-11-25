const editorialCopy=(bn,en)=>document.documentElement.lang==='en'?en:bn;
const currentArticleId=()=>location.pathname.match(/^(?:\/en)?\/article\/([a-z0-9-]{1,96})\/?$/)?.[1]??'';
const articleHref=id=>(document.documentElement.lang==='en'?'/en':'')+'/article/'+encodeURIComponent(id);
const editorialLabels={
  tips:editorialCopy('সম্প্রদায়ের খবর পাঠান','Send a community news tip'),
  briefing:editorialCopy('আজকের বাংলাদেশ ৫ মিনিটে','Bangladesh in five minutes'),
  inbox:editorialCopy('পাঠকের বার্তা','Reader submissions')
};
function readerForm(kind,id=''){
  const tip=kind==='tip',copy=editorialCopy;
  return '<form class="stack reader-form" data-reader-form><input type="hidden" name="kind" value="'+kind+'"><input type="hidden" name="article" value="'+safe(id)+'"><label hidden>Website<input name="website" tabindex="-1" autocomplete="off"></label>'+
    (tip?'<label>'+copy('জেলা বা দেশ','District or country')+'<input name="location" required maxlength="160"></label>':'')+
    '<label>'+copy('বিবরণ','Details')+'<textarea name="message" required minlength="10" maxlength="4000" rows="5"></textarea></label><label>'+copy('যোগাযোগের তথ্য (ঐচ্ছিক, শুধু সম্পাদকদের জন্য)','Contact details (optional, editors only)')+'<input name="contact" maxlength="180"></label>'+
    (tip?'<label>'+copy('ছবি (ঐচ্ছিক, JPG, PNG বা WebP, সর্বোচ্চ ৩ এমবি)','Photo (optional, JPEG, PNG or WebP, up to 3 MB)')+'<input type="file" name="photo" accept="image/jpeg,image/png,image/webp"></label>':'')+
    '<button>'+copy('পাঠান','Send')+'</button><p role="status"></p></form>';
}
function editorialArticlePanel(id){
  return '<section class="reader-editorial"><h2>'+editorialCopy('সংশোধনী ও সূত্র','Corrections and sources')+'</h2><div id="article-notes"></div><details><summary>'+editorialCopy('ভুল জানাতে চান?','Report a mistake')+'</summary>'+readerForm('correction',id)+'</details></section>';
}
async function mountArticleNotes(id){
  const root=get('article-notes');if(!root)return;
  try{
    const notes=await newsroomApi('/api/articles/'+encodeURIComponent(id)+'/notes');
    if(!root.isConnected)return;
    root.innerHTML=notes.length?notes.map(item=>'<div class="reader-note"><time datetime="'+safe(item.created_at)+'">'+bnDate(item.created_at)+'</time><p>'+safe(item.note)+'</p>'+(item.source?'<a href="'+safe(item.source)+'" rel="noopener noreferrer">'+editorialCopy('সূত্র দেখুন','View source')+'</a>':'')+'</div>').join(''):'';
  }catch{if(root.isConnected)root.textContent=editorialCopy('সংশোধনীর তালিকা এখন পাওয়া যাচ্ছে না।','Corrections are temporarily unavailable.')}
}
async function submitReaderForm(form){
  const button=form.querySelector('button'),status=form.querySelector('[role=status]');
  button.disabled=true;
  try{
    await newsroomApi('/api/reader-submissions',{method:'POST',body:new FormData(form)});
    form.reset();
    status.textContent=editorialCopy('সম্পাদকীয় পর্যালোচনার জন্য পাঠানো হয়েছে।','Sent to the newsroom for editorial review.');
  }catch(error){status.textContent=error.message}
  finally{button.disabled=false}
}
function dailyBriefing(){
  const today=publicationDay(new Date().toISOString());
  const recent=orderedStories().filter(story=>story.shared&&storyDate(story)===today);
  const sample=['metro-day-planner','household-bill-calendar','khulna-river-route','football-match-notes','study-project-checklist'].map(editorialStory).filter(Boolean);
  const items=(recent.length?recent:sample).slice(0,5);
  return '<section class="section"><h1>'+editorialLabels.briefing+'</h1><p>'+editorialDate(recent.length?today:'2026-11-24')+(recent.length?'':' · '+editorialCopy('নমুনা সংস্করণ','Sample edition'))+'</p><ol class="briefing-list">'+items.map(story=>'<li>'+storyCard(story)+'</li>').join('')+'</ol></section>';
}
function editorialUtility(key){
  if(key==='briefing')return dailyBriefing();
  if(key==='tips')return '<section class="section"><h1>'+editorialLabels.tips+'</h1><p>'+editorialCopy('আপনার এলাকার খবর পাঠান। প্রকাশের আগে সম্পাদক তা যাচাই করবেন।','Send news from your community. Editors review submissions before publication.')+'</p>'+readerForm('tip')+'</section>';
  return '<section class="section"><h1>'+editorialLabels.inbox+'</h1><div id="reader-inbox" role="region" aria-label="'+editorialLabels.inbox+'"></div></section>';
}
async function mountInbox(message=''){
  const root=get('reader-inbox');if(!root)return;
  const copy=editorialCopy;
  try{
    const session=await newsroomApi('/api/newsroom/session');
    if(!root.isConnected)return;
    if(!session.signedIn){root.innerHTML='<a target="_top" href="/admin/login">'+copy('সাইন ইন করুন','Sign in')+'</a>';return}
    if(!['owner','editor'].includes(session.role)){root.textContent=copy('সম্পাদক অ্যাক্সেস প্রয়োজন।','Editor access required.');return}
    const entries=await newsroomApi('/api/newsroom/inbox');
    if(!root.isConnected)return;
    root.innerHTML='<p role="status" id="inbox-status">'+safe(message)+'</p><div class="desk-layout"><section><h2>'+copy('বার্তা','Submissions')+'</h2>'+
      (entries.length?entries.map(item=>'<article class="reader-note"><h3>'+copy(item.kind==='tip'?'সংবাদ টিপ':'সংশোধনের অনুরোধ',item.kind==='tip'?'News tip':'Correction request')+'</h3><p>'+safe(item.location??'')+'</p><p>'+safe(item.message)+'</p>'+(item.contact?'<p>'+copy('যোগাযোগ: ','Contact: ')+safe(item.contact)+'</p>':'')+'<time>'+bnDate(item.created_at)+'</time>'+
      (item.image_type?'<p><a href="/api/newsroom/inbox/photo?id='+encodeURIComponent(item.id)+'" target="_blank" rel="noopener">'+copy('ব্যক্তিগত ছবি','Private photo')+'</a></p>':'')+
      (item.article_id?'<p><a href="'+articleHref(item.article_id)+'">'+copy('প্রতিবেদন খুলুন','Open article')+'</a></p><button type="button" data-note-article="'+safe(item.article_id)+'">'+copy('সংশোধনী লিখুন','Write correction')+'</button>':'')+
      (item.reviewed_at?'<p>'+copy('পর্যালোচিত','Reviewed')+'</p>':'<button type="button" data-reviewed="'+safe(item.id)+'">'+copy('পর্যালোচিত হিসেবে চিহ্নিত করুন','Mark reviewed')+'</button>')+'</article>').join(''):'<p>'+copy('এখনো কোনো বার্তা নেই।','No submissions yet.')+'</p>')+
      '</section><section><h2>'+copy('সংশোধনী বা সূত্র প্রকাশ','Publish a correction or source note')+'</h2><form class="stack" id="publish-note"><label>'+copy('প্রতিবেদনের আইডি','Article ID')+'<input required name="article" maxlength="96"></label><label>'+copy('নোট','Note')+'<textarea required maxlength="1500" name="note" rows="5"></textarea></label><label>'+copy('সূত্রের লিংক (ঐচ্ছিক)','Source URL (optional)')+'<input type="url" name="source" maxlength="1000"></label><button>'+copy('নোট প্রকাশ করুন','Publish note')+'</button></form></section></div>';
    const post=async(path,body)=>newsroomApi(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const form=get('publish-note');
    root.querySelectorAll('[data-note-article]').forEach(button=>button.onclick=()=>{form.elements.article.value=button.dataset.noteArticle;form.elements.note.focus()});
    root.querySelectorAll('[data-reviewed]').forEach(button=>button.onclick=async()=>{
      button.disabled=true;
      try{await post('/api/newsroom/inbox',{id:button.dataset.reviewed});await mountInbox(copy('পর্যালোচনা সংরক্ষিত।','Review status saved.'))}
      catch(error){get('inbox-status').textContent=error.message;button.disabled=false}
    });
    form.onsubmit=async event=>{
      event.preventDefault();
      const button=form.querySelector('button');button.disabled=true;
      try{await post('/api/newsroom/notes',Object.fromEntries(new FormData(form)));await mountInbox(copy('নোট প্রকাশিত হয়েছে।','Note published.'))}
      catch(error){get('inbox-status').textContent=error.message;button.disabled=false}
    };
  }catch(error){if(root.isConnected)root.textContent=error.message}
}
function publicationDay(value){
  const parts=new Intl.DateTimeFormat('en-GB',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Asia/Dhaka'}).formatToParts(new Date(value));
  const date=Object.fromEntries(parts.map(part=>[part.type,part.value]));
  return date.year+'-'+date.month+'-'+date.day;
}

function deskUrl(type, key) {
  const home = editionHome();
  if (type === 'country') return home + 'probash/' + encodeURIComponent(key) + '/';
  if (key === 'home') return home;
  return home + (key === 'district' ? 'country' : encodeURIComponent(key)) + '/';
}

async function shareArticle(button) {
  const heading = button.closest('article').querySelector('h1').textContent;
  const url = new URL(articleHref(button.dataset.article), location.origin).href;
  const payload = { title: heading, url };
  if (navigator.share && (!navigator.canShare || navigator.canShare(payload))) {
    try {
      await navigator.share(payload);
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }
  const feedback = document.getElementById('feedback');
  try {
    await navigator.clipboard.writeText(url);
    feedback.textContent = editorialCopy('লিংক কপি হয়েছে।','Link copied.');
  } catch {
    const field = document.createElement('input');
    field.readOnly = true;
    field.value = url;
    field.setAttribute('aria-label', editorialCopy('প্রতিবেদনের লিংক','Article link'));
    feedback.replaceChildren(field);
    field.focus();
    field.select();
  }
}

function shareButtonLabel() {
  return navigator.share ? editorialCopy('শেয়ার করুন','Share') : editorialCopy('লিংক কপি করুন','Copy link');
}
