const countryNames={malaysia:'মালয়েশিয়া','saudi-arabia':'সৌদি আরব',uae:'সংযুক্ত আরব আমিরাত',uk:'যুক্তরাজ্য',"oman":"ওমান","qatar":"কাতার","kuwait":"কুয়েত","bahrain":"বাহরাইন","jordan":"জর্ডান","singapore":"সিঙ্গাপুর","japan":"জাপান","south-korea":"দক্ষিণ কোরিয়া","maldives":"মালদ্বীপ","italy":"ইতালি","usa":"যুক্তরাষ্ট্র","canada":"কানাডা","australia":"অস্ট্রেলিয়া"};
let publishedArticles=[];
let deskTask=0;
const bnDate=value=>new Intl.DateTimeFormat('bn-BD',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Dhaka'}).format(new Date(value));
const districtsList=()=>[...countryData.districts].sort((a,b)=>a[1].localeCompare(b[1],'bn'));
const districtName=id=>countryData.districts.find(district=>district[0]===id)?.[1];
const articleRecord=id=>publishedArticles.find(item=>item.id===id);
const storyTuple=item=>[
  item.id,item.category,safe(item.title),safe(item.summary),safe(item.title),
  item.body.split(/\n+/).filter(Boolean).map(safe),
  item.image_type?['/article-photo/'+item.id,safe(item.title)]:null
];
const newsroomOptions=(items,selected)=>items.map(([key,label])=>'<option value="'+safe(key)+'"'+(key===selected?' selected':'')+'>'+safe(label)+'</option>').join('');
async function newsroomApi(path,options){
  const response=await fetch(path,options);
  if(!response.ok){
    const details=await response.json().catch(()=>({}));
    throw new Error(details.error??'অনুরোধটি সম্পন্ন হয়নি।');
  }
  return response.json();
}
async function loadPublished(){
  try{
    publishedArticles=await newsroomApi('/api/articles');
    const id=currentArticleId();
    if(id&&!stories.some(story=>story[0]===id)&&!publishedArticles.some(item=>item.id===id)){
      const item=await newsroomApi('/api/articles/'+encodeURIComponent(id)).catch(()=>null);
      if(item)publishedArticles.push(item);
    }
    const shared=publishedArticles.map(storyTuple);
    const nonShared=stories.filter(item=>!item.shared);
    shared.forEach(item=>{item.shared=true});
    stories.splice(0,stories.length,...shared,...nonShared);
    if(englishEdition)void translateFeed([...publishedArticles]);
  }catch{ /* Existing sample stories are available when the live feed is unavailable. */ }
}
function myDistrictPanel(){
  const id=read('myDistrict','');
  const reports=stories.filter(s=>(articleRecord(s[0])?.district??featureById.get(s[0])?.district??districtTags[s[0]])===id);
  const selected=districtName(id);
  return '<section class="section"><h2>আমার জেলা</h2><form id="my-district-form" class="local-select"><label for="saved-district">আপনার জেলা</label><select id="saved-district" name="district">'+newsroomOptions([['','জেলা বেছে নিন'],...districtsList()],id)+'</select><button>সংরক্ষণ করুন</button></form>'+(selected?'<h3>'+safe(selected)+'</h3>'+(reports.length?'<div class="grid">'+reports.slice(0,3).map(card).join('')+'</div>':'<p>এই জেলার জন্য এখন কোনো খবর নেই।</p>')+'<p><a href="/country/?district='+id+'">জেলার সব খবর</a></p>':'')+'</section>';
}
function diasporaLinks(){
  const groups=[
    ['মধ্যপ্রাচ্য',['saudi-arabia','uae','qatar','oman','kuwait','bahrain','jordan']],
    ['এশিয়া ও ওশেনিয়া',['malaysia','singapore','japan','south-korea','maldives','australia']],
    ['ইউরোপ ও উত্তর আমেরিকা',['uk','italy','usa','canada']]
  ];
  return '<div class="diaspora-directory">'+groups.map(([region,keys])=>'<section><h3>'+region+'</h3><div class="extra-desk">'+keys.map(key=>'<a '+(location.pathname===link('country',key)?'aria-current="page" ':'')+'href="'+link('country',key)+'">'+countryNames[key]+'</a>').join('')+'</div></section>').join('')+'</div>';
}
function diasporaPage(key){
  const localStories=stories.filter(story=>(articleRecord(story[0])?.country??featureById.get(story[0])?.country)===key||(key==='malaysia'&&['malaysia-arrival','malaysia-workweek','malaysia-family-visit'].includes(story[0])));
  return '<section class="section"><a href="'+link('section','probash')+'">প্রবাস ডেস্ক</a><h1>'+countryNames[key]+'</h1>'+diasporaLinks()+(localStories.length?block('খবর ও গাইড',localStories):'<p>এই দেশের জন্য এখন কোনো খবর নেই।</p>')+'</section>';
}
function newsroomMetadata(item){
  if(!item)return '';
  return '<div class="byline"><strong>'+safe(item.author)+'</strong><span>প্রকাশ: '+bnDate(item.publish_at)+'</span>'+(item.updated_at>item.publish_at?'<span>হালনাগাদ: '+bnDate(item.updated_at)+'</span>':'')+'</div>';
}
function articleShare(id){
  const url=new URL(link('story',id),location.origin);
  return '<a class="share-link" href="https://wa.me/?text='+encodeURIComponent(url.href)+'" target="_blank" rel="noopener noreferrer">WhatsApp-এ শেয়ার</a>';
}
function newsroomForm(item,editor){
  const options=newsroomOptions(deskCategories,item?.category??'national');
  const statuses=[['draft','খসড়া'],['review','পর্যালোচনার জন্য'],...(editor?[['published','প্রকাশ করুন']]:[])];
  const districtOptions=newsroomOptions([['','সারা বাংলাদেশ'],...districtsList()],item?.district??'');
  const countryOptions=newsroomOptions([['','দেশ নির্বাচন করুন'],...Object.entries(countryNames)],item?.country??'');
  const publication=item?.publish_at?new Date(Date.parse(item.publish_at)+6*3600000).toISOString().slice(0,16):'';
  const input=(name,label,max)=>'<label>'+label+'<input name="'+name+'" maxlength="'+max+'" required value="'+safe(item?.[name]??'')+'"></label>';
  return '<form class="stack" id="shared-desk-form"><input type="hidden" name="id" value="'+safe(item?.id??'')+'">'+input('title','শিরোনাম',150)+input('author','প্রতিবেদকের নাম',100)+'<label>বিভাগ<select name="category">'+options+'</select></label><label id="desk-district">জেলা<select name="district">'+districtOptions+'</select></label><label id="desk-country">প্রবাসের দেশ<select name="country">'+countryOptions+'</select></label>'+input('summary','সারাংশ',300)+'<label>প্রতিবেদন<textarea name="body" rows="8" maxlength="16000" required>'+safe(item?.body??'')+'</textarea></label><label>ছবি (JPG, PNG বা WebP, ৩ এমবি পর্যন্ত)<input name="image" type="file" accept="image/jpeg,image/png,image/webp"></label><label>অবস্থা<select name="status">'+newsroomOptions(statuses,item?.status??'draft')+'</select></label>'+(editor?'<label>প্রকাশের সময় (বাংলাদেশ সময়)<input type="datetime-local" name="publish_at" value="'+publication+'"></label><label class="check-label"><input type="checkbox" name="breaking" value="yes"'+(item?.breaking?' checked':'')+'>ব্রেকিং বারে দেখান</label>':'')+'<button>সংরক্ষণ করুন</button><p id="shared-desk-status" role="status"></p></form>';
}
function staffForm(staff){
  return '<section><h3>নিউজরুম সদস্য</h3><ul>'+staff.map(member=>'<li>'+safe(member.email)+' · '+(member.role==='editor'?'সম্পাদক':'প্রতিবেদক')+'</li>').join('')+'</ul><form id="staff-form" class="stack"><label>নিউজরুম অ্যাকাউন্টের ইমেইল<input type="email" name="email" required></label><label>ভূমিকা<select name="role"><option value="reporter">প্রতিবেদক</option><option value="editor">সম্পাদক</option><option value="remove">অ্যাক্সেস সরান</option></select></label><button>আপডেট করুন</button><p id="staff-status" role="status"></p></form></section>';
}
async function mountSharedDesk(itemId='',message=''){
  const task=++deskTask;
  const root=get('shared-newsroom');
  if(!root)return;
  try{
    const session=await newsroomApi('/api/newsroom/session');
    if(task!==deskTask||!root.isConnected)return;
    if(!session.signedIn){root.innerHTML='<p>নিউজরুমে প্রবেশ করতে সাইন ইন করুন।</p><a target="_top" href="/admin/login">সাইন ইন করুন</a>';return}
    if(!session.role){root.innerHTML='<p>এই অ্যাকাউন্টে নিউজরুম অ্যাক্সেস নেই।</p>';return}
    const isEditor=session.role!=='reporter';
    const [articles,staff]=await Promise.all([newsroomApi('/api/newsroom/articles'),session.role==='owner'?newsroomApi('/api/newsroom/staff'):[]]);
    if(task!==deskTask||!root.isConnected)return;
    const item=articles.find(article=>article.id===itemId);
    const statusLabels={draft:'খসড়া',review:'পর্যালোচনার জন্য',published:'প্রকাশিত'};
    const statusLabel=article=>article.status==='published'&&Date.parse(article.publish_at)>Date.now()?'নির্ধারিত':statusLabels[article.status];
    root.innerHTML='<p role="status">'+safe(message)+'</p><div class="desk-layout"><section><h3>প্রতিবেদন</h3><button id="desk-new" type="button">নতুন লেখা</button><ul class="desk-articles">'+articles.map(article=>'<li>'+((isEditor||article.status!=='published')?'<button type="button" data-edit="'+safe(article.id)+'">'+safe(article.title)+'</button>':safe(article.title))+' · '+statusLabel(article)+'</li>').join('')+'</ul>'+(session.role==='owner'?staffForm(staff):'')+'</section><section><h3>'+(item?'প্রতিবেদন সম্পাদনা':'নতুন প্রতিবেদন')+'</h3>'+newsroomForm(item,isEditor)+'</section></div>';
    if(isEditor)root.insertAdjacentHTML('afterbegin','<p><a class="share-link" href="#tool/live-desk">লাইভ আপডেট পরিচালনা</a> <a class="share-link" href="#tool/inbox">'+editorialLabels.inbox+'</a></p>');
    root.querySelectorAll('[data-edit]').forEach(button=>button.onclick=()=>mountSharedDesk(button.dataset.edit));
    get('desk-new').onclick=()=>mountSharedDesk();
    const form=get('shared-desk-form');
    function setLocationFields(){
      const value=form.elements.category.value;
      get('desk-district').hidden=!['district','national'].includes(value);
      get('desk-country').hidden=value!=='probash';
      form.elements.district.disabled=get('desk-district').hidden;
      form.elements.country.disabled=get('desk-country').hidden;
    }
    form.elements.category.onchange=setLocationFields;
    setLocationFields();
    form.onsubmit=async event=>{
      event.preventDefault();
      const data=new FormData(form), time=data.get('publish_at');
      if(time)data.set('publish_at',time+'+06:00');
      const button=form.querySelector('button');button.disabled=true;
      try{
        const result=await newsroomApi('/api/newsroom/articles',{method:'POST',body:data});
        await loadPublished();refreshBreakingBar(false);
        await mountSharedDesk(result.id,'প্রতিবেদন সংরক্ষিত হয়েছে।');
      }catch(error){get('shared-desk-status').textContent=error.message;button.disabled=false}
    };
    const staffEditor=get('staff-form');
    if(staffEditor)staffEditor.onsubmit=async event=>{
      event.preventDefault();
      try{
        await newsroomApi('/api/newsroom/staff',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(staffEditor)))});
        await mountSharedDesk(itemId,'সদস্যের অ্যাক্সেস আপডেট হয়েছে।');
      }catch(error){get('staff-status').textContent=error.message}
    };
  }catch(error){if(task===deskTask&&root.isConnected)root.textContent=error.message}
}

const translationJobs=new Map();
const translationState=new WeakMap();
async function translateStory(item,full=false){
  if(!englishEdition||!item)return;
  const state=translationState.get(item)??{};
  const scope=full?'full':'card';
  if(state[scope]==='ready'||state[scope]==='failed')return;
  const key=item.id+'/'+item.updated_at+'/'+scope;
  if(translationJobs.has(key))return translationJobs.get(key);
  const job=(async()=>{
    state[scope]='loading';translationState.set(item,state);
    try{
      const fields=await newsroomApi('/api/articles/'+encodeURIComponent(item.id)+'/english'+(full?'?full=1':''));
      if(articleRecord(item.id)!==item)return;
      Object.assign(item,fields);
      const index=stories.findIndex(story=>story.shared&&story[0]===item.id);
      if(index>=0){const tuple=storyTuple(item);tuple.shared=true;stories[index]=tuple}
      state[scope]='ready';state.card='ready';
    }catch{state[scope]='failed'}
    finally{translationJobs.delete(key)}
    if(!location.hash.startsWith('#tool/desk')&&!document.querySelector('#content input:focus,#content select:focus'))render();
  })();
  translationJobs.set(key,job);
  return job;
}
async function translateFeed(items){
  const opened=items.find(a=>currentArticleId()===a.id || location.hash==='#story/'+encodeURIComponent(a.id));
  if(opened)await translateStory(opened,true);
  for(const item of items)await translateStory(item);
}
function translationNotice(item){
  if(!englishEdition||!item)return '';
  const status=translationState.get(item)?.full;
  if(status==='ready')return '<small>English translation</small>';
  if(status==='failed')return '<p role="status">English translation is temporarily unavailable. Showing the original. <button type="button" data-retry-translation>Retry translation</button></p>';
  return '<p role="status">Translating this report into English…</p>';
}
