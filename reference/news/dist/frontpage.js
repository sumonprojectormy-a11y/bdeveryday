const managedContent=window.portalContent??{};
const managedCopy=(key, fallback)=> {
  const record=managedContent.copy?.[key];
  return (document.documentElement.lang==='en'?record?.en:record?.bn)??fallback;
};
const managedStories=(key,fallback)=>{
  const ids=managedContent.layout?.[key];
  return Array.isArray(ids)?ids.map(editorialStory).filter(Boolean):fallback;
};
const editionCopy=(bn,en)=>document.documentElement.lang==='en'?en:bn;
const sourceFile=(name)=>'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(name);
const editorialPhotos={
  metro:['আগারগাঁও মেট্রো স্টেশনে প্রবেশরত ট্রেন','A train entering Agargaon metro station','Wasiul Bahar','Train_entering_at_Agargaon_metro_station_Platform.jpg','CC BY-SA 4.0','https://creativecommons.org/licenses/by-sa/4.0/'],
  market:['ঢাকার নিউ মার্কেট','Dhaka New Market','Yahya','Dhaka_New_Market_(01).jpg','CC BY-SA 4.0','https://creativecommons.org/licenses/by-sa/4.0/'],
  'kuala-lumpur':['সন্ধ্যায় কুয়ালালামপুর','The Kuala Lumpur skyline at dusk','Walkerssk','Kuala_Lumpur_Skyline_at_dusk_1.jpg','CC0 1.0','https://creativecommons.org/publicdomain/zero/1.0/'],
  padma:['রাজশাহী শহরের কাছে পদ্মা নদী','The Padma River near Rajshahi','মোঃ সাকিবুল হাসান','Padma_River_near_Rajshahi_city.jpg','CC BY 4.0','https://creativecommons.org/licenses/by/4.0/'],
  tea:['শ্রীমঙ্গলের কাছে চা-বাগান','Tea garden near Sreemangal','Xahidur Reza','Tea_Garden_near_Srimangal,_Sylhet,_Bangladesh.jpg','CC BY 2.0','https://creativecommons.org/licenses/by/2.0/']
};
const featureById=new Map(featureStories.map(item=>[item.id,item]));
function photoRecord(key){
  const [bn,en,author,file,license,licenseUrl]=editorialPhotos[key];
  return ['/photos/'+key+'.webp',editionCopy(bn,en),sourceFile(file),author,license,licenseUrl];
}
function featureTuples(){
  return featureStories.map(item=>{
    const [title,summary,...body]=editionCopy(item.bn,item.en);
    return [item.id,item.section,safe(title),safe(summary),item.keywords,body.map(safe),item.photo?photoRecord(item.photo):null];
  });
}
function photoCaption(photo){
  return '<figcaption>'+safe(photo[1])+(photo[2]?' · <a href="'+safe(photo[2])+'">'+safe(photo[3]??editionCopy('ছবির উৎস','Photo source'))+'</a>':'')+(photo[5]?' · <a href="'+photo[5]+'">'+photo[4]+'</a> · '+editionCopy('আকার পরিবর্তিত','Resized'):'')+'</figcaption>';
}
function storyFigure(story){
  if(!story[6])return '';
  return '<figure>'+storyPicture(story)+photoCaption(story[6])+'</figure>';
}
function storyPicture(story,priority=false){
  const photo=story[6];
  if(!photo)return '';
  return '<img src="'+safe(photo[0])+'" alt="'+safe(photo[1])+'" '+(priority?'fetchpriority="high"':'loading="lazy"')+'>';
}
const editorialStory=id=>stories.find(story=>story[0]===id);
const primarySections=['home','latest','national','politics','district','world','business','sport','probash','entertainment','opinion','lifestyle'];
function primaryNavigation(section,type){
  const active=type==='live'||(type==='tool'&&location.hash==='#tool/live');
  return primarySections.map(key=>'<a '+(key===section&&!['search','tool','live','country'].includes(type)?'aria-current="page" ':'')+'href="'+(key==='home'?editionHome():link('section',key))+'">'+categories[key]+'</a>').join('')+'<a class="nav-live" '+(active?'aria-current="page" ':'')+'href="#tool/live">'+liveLabel()+'</a>';
}
const editionHome=()=>editionCopy('/','/en/');
function readerShortcuts(){
  const shortcuts=[
    ['live','M8 8a6 6 0 0 0 0 8m8-8a6 6 0 0 1 0 8M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14M12 11v2'],
    ['mydistrict','M20 10c0 5-8 11-8 11s-8-6-8-11a8 8 0 1 1 16 0ZM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z'],
    ['paper','M4 4h16v16H4zM8 8h8m-8 4h8m-8 4h5'],
    ['video','M4 5h16v14H4zM10 9l5 3-5 3z'],
    ['photo','M4 4h16v16H4zM4 16l5-5 4 4 3-3 4 4m-4-8h.01'],
    ['topics','M6 4h12v17l-6-4-6 4z'],
    ['briefing','M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 4v5l3 2'],
    ['tips','M4 5h16v12H9l-5 3zm4 4h8m-8 4h5']
  ];
  return shortcuts.map(([key,path])=>{
    const icon='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="'+path+'"/></svg>';
    return '<a '+(key==='live'?'class="quick-live" ':'')+'href="'+link('tool',key)+'"><span class="quick-icon">'+icon+'</span><span>'+utilities[key]+'</span></a>';
  }).join('');
}
function facebookPageLink(iconOnly=false){
  const label=managedCopy('facebook-label',editionCopy('ফেসবুকে অনুসরণ করুন','Follow on Facebook'));
  const icon='<svg aria-hidden="true" focusable="false" width="32" height="32" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#0866ff"/><path fill="white" d="M13.66 23.88v-8.89h2.98l.45-3.46h-3.43V9.32c0-1 .28-1.68 1.72-1.68h1.84V4.55a24 24 0 0 0-2.68-.14c-2.65 0-4.46 1.62-4.46 4.59v2.53H7.1v3.46h2.98v8.86a12 12 0 0 0 3.58.03Z"/></svg>';
  const attributes=iconOnly?' class="footer-facebook" aria-label="'+safe(label)+'" title="'+safe(label)+'"':'';
  return '<a'+attributes+' href="https://www.facebook.com/share/151KDnsRgvy/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">'+(iconOnly?icon:safe(label))+'</a>';
}
function footerLinks(){
  const groups=[
    [editionCopy('সংবাদ','News'),[['section','national'],['section','district'],['section','probash'],['tool','live']]],
    [editionCopy('পাঠকের জন্য','For readers'),[['tool','paper'],['tool','archive'],['tool','saved'],['tool','topics']]],
    [editionCopy('বিডি এভরিডে','BD Everyday'),[['tool','about'],['tool','privacy'],['tool','connections'],['tool','desk']]]
  ];
  return '<div class="footer-brand"><a href="'+editionHome()+'" lang="en"><img src="/bd-everyday-footer-logo.svg" width="2080" height="358" alt="BD Everyday" loading="lazy"></a><p>'+safe(managedCopy('slogan',editionCopy('প্রতিদিনের পাতায় বাংলাদেশ','Bangladesh on every page')))+'</p><p>'+facebookPageLink(true)+'</p></div>'+groups.map(([title,items])=>'<div><h2>'+title+'</h2><ul>'+items.map(([type,key])=>'<li><a href="'+link(type,key)+'">'+(type==='section'?categories[key]:utilities[key])+'</a></li>').join('')+'</ul></div>').join('');
}
function storyCard(story,{image=false}={}){
  const href=link('story',story[0]);
  return '<article class="card newsroom-card">'+(image&&story[6]?'<a class="story-thumb" href="'+href+'">'+storyPicture(story)+'</a>':'')+'<a class="label" href="'+link('section',story[1])+'">'+categories[story[1]]+'</a><h3><a href="'+href+'">'+story[2]+'</a></h3><p>'+story[3]+'</p></article>';
}
function premiumDesk(title,items,href,label){
  if(!items.length)return '';
  return '<section class="edition-desk"><header><h2>'+title+'</h2>'+(href?'<a href="'+href+'">'+label+'</a>':'')+'</header><div class="desk-grid'+(items.length===4?' desk-grid-four':'')+'">'+items.map(story=>storyCard(story,{image:true})).join('')+'</div></section>';
}
function frontPage(){
  const photoLead=editorialStory('metro-day-planner');
  const leadStory=managedStories('lead',[]).find(story=>story[6])??stories.find(story=>story.shared&&story[6])??photoLead;
  const related=managedStories('secondary',['market-basket-notes','kl-weekend-first'].map(editorialStory)).filter(story=>story!==leadStory);
  const featuredDistrict=['padma-evening','tea-walk-guide','khulna-river-route','sylhet-market-route'].map(editorialStory);
  const desk=(key,items)=>premiumDesk(categories[key],managedStories(key,items),link('section',key),editionCopy('সব খবর','All stories'));
  const deskStories=key=>orderedStories().filter(story=>story[1]===key).slice(0,4);
  return '<section class="newspaper-front" aria-label="'+editionCopy('প্রচ্ছদ','Front page')+'"><div class="top-story"><span class="front-kicker">'+editionCopy('প্রধান প্রতিবেদন','Top story')+'</span><a class="top-photo" href="'+link('story',leadStory[0])+'">'+storyPicture(leadStory,true)+'</a><a class="label" href="'+link('section',leadStory[1])+'">'+categories[leadStory[1]]+'</a><h1><a href="'+link('story',leadStory[0])+'">'+leadStory[2]+'</a></h1><p>'+leadStory[3]+'</p></div><div class="front-secondary">'+related.map(story=>storyCard(story,{image:true})).join('')+'</div><aside class="rail front-rail"><div class="tab" aria-label="'+editionCopy('খবর বাছাই','Choose headlines')+'"><button type="button" data-feed="latest" aria-pressed="true">'+categories.latest+'</button><button type="button" data-feed="picks" aria-pressed="false">'+editionCopy('সম্পাদকের বাছাই','Editor’s picks')+'</button></div><div id="headlines">'+latest().map(headline).join('')+'</div><a class="rail-more" href="'+link('section','latest')+'">'+editionCopy('সব সর্বশেষ খবর','All latest stories')+'</a></aside></section>'
    +desk('district',featuredDistrict)
    +videoDesk()
    +desk('probash',['kl-weekend-first','riyadh-family-checkin','dubai-commute-notes','diaspora-singapore'].map(editorialStory))
    +'<section class="edition-desk diaspora-shortcuts"><header><h2>'+editionCopy('প্রবাসের দেশ','Diaspora by country')+'</h2></header>'+diasporaLinks()+'</section>'
    +desk('national',stories.filter(s=>s[1]==='national'&&s!==leadStory).slice(0,4))
    +premiumDesk(editionCopy('ব্যাখ্যা ও গাইড','Explainers and guides'),managedStories('guides',['scorecard-explainer','world-source-reading','repair-or-replace','past-paper-study'].map(editorialStory)))
    +desk('business',deskStories('business'))
    +desk('sport',deskStories('sport'))
    +desk('education',deskStories('education'))
    +myDistrictPanel()
    +departmentDirectory();
}
function departmentDirectory(){
  const headlines=new Map(departmentRoundup.map(item=>[item.section,editorialStory(item.id)]));
  for(const story of publishedArticles)if(!headlines.get(story.category)?.shared)headlines.set(story.category,editorialStory(story.id));
  return '<section class="section"><h2>'+editionCopy('সব সংবাদ বিভাগ','All news departments')+'</h2><div class="department-headlines">'+searchSections.map(([key,label])=>{
    const story=headlines.get(key);
    return '<article class="department-headline"><h3><a href="'+link('section',key)+'">'+label+'</a></h3>'+(story?'<p><a href="'+link('story',story[0])+'">'+story[2]+'</a></p>':'')+'</article>';
  }).join('')+'</div></section>';
}
function photoEdition(){
  const collections=[
    [editionCopy('শহরের পথে','Around the city'),[['metro','station-photo-composition'],['market','unit-price-market'],['kuala-lumpur','kl-weekend-first']]],
    [editionCopy('নদী ও সবুজ','Rivers and greenery'),[['padma','padma-evening'],['tea','tea-photo-walk']]]
  ];
  if(managedContent.gallery?.length){
    return '<section class="section"><h1>'+utilities.photo+'</h1>'+managedContent.gallery.map(group=>
      '<section><h2>'+safe(editionCopy(group.title,group.titleEn??group.title))+'</h2><div class="gallery editorial-gallery">'+group.items.map(item=>{
        const media=item.photo, story=editorialStory(item.article);
        const photo=[media.url,editionCopy(media.alt,media.altEn??media.alt),media.source,media.creator,media.license,media.licenseUrl];
        return '<figure><img src="'+safe(photo[0])+'" alt="'+safe(photo[1])+'" loading="lazy">'+photoCaption(photo)+(story?'<p><a href="'+link('story',item.article)+'">'+story[2]+'</a></p>':'')+'</figure>';
      }).join('')+'</div></section>'
    ).join('')+'</section>';
  }
  return '<section class="section"><h1>'+utilities.photo+'</h1>'+collections.map(([title,items])=>'<section><h2>'+title+'</h2><div class="gallery editorial-gallery">'+items.map(([key,id])=>{
    const photo=photoRecord(key),story=editorialStory(id);
    return '<figure><img src="'+photo[0]+'" alt="'+safe(photo[1])+'" loading="lazy">'+photoCaption(photo)+'<p><a href="'+link('story',id)+'">'+story[2]+'</a></p></figure>';
  }).join('')+'</div></section>').join('')+'</section>';
}
function additionalVideos(){
  return [
    {id:'station',type:editionCopy('বাংলাদেশ','Bangladesh'),title:editionCopy('স্টেশন থেকে শেষ পথের পরিকল্পনা','Plan your last mile'),duration:editionCopy('০:০৭','0:07'),description:editionCopy('স্টেশন থেকে হাঁটার পথ ও প্রবেশের সুবিধা আগে দেখে নিন।','Check the walking route and station access.')},
    {id:'study',type:editionCopy('শিক্ষা','Education'),title:editionCopy('দলগত পড়াশোনার কাজ ভাগ করুন','Build a study plan'),duration:editionCopy('০:০৭','0:07'),description:editionCopy('গবেষণা, লেখা ও উপস্থাপনার কাজ ভাগ করুন।','Divide research, writing and presentation.')}
  ];
}
function followedSections(){
  const value=read('following',[]);
  return Array.isArray(value)?value.filter(key=>Object.hasOwn(categories,key)&&!['home','latest'].includes(key)):[];
}
function followAction(key){
  const following=followedSections().includes(key);
  return '<button type="button" data-follow="'+key+'" aria-pressed="'+String(following)+'">'+(following?editionCopy('অনুসরণ করছেন','Following'):editionCopy('বিভাগ অনুসরণ করুন','Follow section'))+'</button>';
}
function topicsPage(){
  const followed=followedSections();
  const district = read('myDistrict','');
  const country = read('editionCountry','');
  const matches = orderedStories().filter(story => {
    const record = articleRecord(story[0]) ?? featureById.get(story[0]);
    const localDistrict = record?.district || districtTags[story[0]];
    const localCountry = record?.country || (['malaysia-arrival','malaysia-workweek','malaysia-family-visit'].includes(story[0]) ? 'malaysia' : '');
    return followed.includes(story[1]) || (district && localDistrict === district) || (country && localCountry === country);
  });
  const all = editionCopy('বেছে নিন','Choose');
  const labelDistrict = editionCopy('আমার জেলা','My district');
  const labelCountry = editionCopy('বসবাসের দেশ','Country of residence');
  const settings = '<div class="edition-preferences"><label>'+labelDistrict+'<select id="edition-district">'+newsroomOptions([['',all],...districtsList()],district)+'</select></label><label>'+labelCountry+'<select id="edition-country">'+newsroomOptions([['',all],...Object.entries(countryNames)],country)+'</select></label></div>';
  const sections = '<details id="edition-sections"><summary>'+editionCopy('বিভাগ বেছে নিন','Choose sections')+' ('+new Intl.NumberFormat(document.documentElement.lang).format(followed.length)+')</summary><div class="topic-grid">'+searchSections.map(([key,label])=>'<div><a href="'+link('section',key)+'">'+label+'</a>'+followAction(key)+'</div>').join('')+'</div></details>';
  return '<section class="section edition-settings"><h1>'+utilities.topics+'</h1>'+settings+sections+'</section>'+(matches.length?premiumDesk(editionCopy('আপনার খবর','Your news'),matches):'<p class="empty" role="status">'+((district || country || followed.length) ? editionCopy('আপনার পছন্দের জন্য এখন কোনো খবর নেই।','There are no stories for these choices yet.') : editionCopy('পছন্দ অনুযায়ী খবর দেখতে জেলা, দেশ বা বিভাগ বেছে নিন।','Choose a district, country or section to see matching stories.'))+'</p>');
}
function aboutPage(){
  return '<article class="reading"><h1>'+utilities.about+'</h1><p>'+editionCopy('বিডি এভরিডে বাংলাদেশের স্থানীয় সংবাদ, প্রবাসের জীবন এবং প্রতিদিনের দরকারি খবরের বাংলা ও ইংরেজি সংবাদপোর্টাল।','BD Everyday is a Bangla and English news portal for Bangladesh, local stories and life in the diaspora.')+'</p><p>'+editionCopy('নমুনা প্রতিবেদনগুলোতে আলাদা চিহ্ন আছে। ছবির নিচে উৎস ও প্রযোজ্য লাইসেন্স দেওয়া হয়েছে। নিউজরুম থেকে প্রকাশিত প্রতিবেদনে লেখকের নাম ও প্রকাশের সময় দেখা যাবে।','Demo articles are labelled. Image captions identify the source and applicable licence. Published newsroom articles show a byline and publication time.')+'</p></article>';
}
function sectionEdition(section){
  const items=section==='latest'?orderedStories():orderedStories().filter(story=>story[1]===section);
  return '<section class="section section-landing"><div class="section-mast"><h1>'+categories[section]+'</h1>'+(section==='latest'?'':followAction(section))+'</div>'+(section==='probash'?diasporaLinks():'')+'<div class="desk-grid">'+items.map(story=>storyCard(story,{image:true})).join('')+'</div></section>';
}
function articleReadingTools(story){
  const minutes=Math.max(1,Math.ceil(story[5].join(' ').trim().split(/\s+/).length/180));
  const formatted=new Intl.NumberFormat(editionCopy('bn-BD','en-GB')).format(minutes);
  const alternate = story[0].startsWith('local-') ? '' : '<a class="article-language" href="'+(englishEdition?'':'/en')+'/article/'+encodeURIComponent(story[0])+'" lang="'+(englishEdition?'bn':'en')+'">'+editionCopy('Read in English','বাংলায় পড়ুন')+'</a>';
  return '<div class="reading-options">'+alternate+'<span>'+formatted+' '+editionCopy('মিনিট পড়া','min read')+'</span>'+followAction(story[1])+'<button type="button" id="reading-size" aria-pressed="'+String(read('largeReading',false)===true)+'">'+editionCopy('বড় অক্ষর','Larger text')+'</button></div>';
}
function togglePremiumButton(event){
  const button=event.target.closest('button[data-follow],button#reading-size');
  if(!button)return false;
  if(button.id==='reading-size'){
    const large=read('largeReading',false)!==true;
    if(write('largeReading',large)){
      document.documentElement.classList.toggle('large-reading',large);
      button.setAttribute('aria-pressed',String(large));
    }
    return true;
  }
  const key=button.dataset.follow;
  const followed=followedSections();
  if(!write('following',followed.includes(key)?followed.filter(value=>value!==key):[...followed,key]))return true;
  if(location.hash==='#tool/topics'){
    render();
    get('edition-sections').open=true;
    get('content').querySelector('button[data-follow="'+key+'"]')?.focus();
  }else{
    const next=followedSections().includes(key);
    button.setAttribute('aria-pressed',String(next));
    button.textContent=next?editionCopy('অনুসরণ করছেন','Following'):editionCopy('বিভাগ অনুসরণ করুন','Follow section');
  }
  return true;
}

function demoStoryDate(id){
  return featureById.get(id)?.date??archiveDay;
}
function storyDate(story){
  if(!story.shared)return demoStoryDate(story[0]);
  const value=articleRecord(story[0])?.publish_at;
  if(!value)return '';
  const parts=new Intl.DateTimeFormat('en-GB',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Asia/Dhaka'}).formatToParts(new Date(value));
  const values=Object.fromEntries(parts.map(part=>[part.type,part.value]));
  return values.year+'-'+values.month+'-'+values.day;
}
function orderedStories(){
  return [...stories].sort((a,b)=>Number(Boolean(b.shared))-Number(Boolean(a.shared))||storyDate(b).localeCompare(storyDate(a)));
}
function editorialDate(date){
  return new Intl.DateTimeFormat(editionCopy('bn-BD','en-GB'),{dateStyle:'long',timeZone:'Asia/Dhaka'}).format(new Date(date+'T00:00:00+06:00'));
}
function archiveResults(date,category){
  const matches=orderedStories().filter(story=>storyDate(story)===date&&(!category||story[1]===category));
  return matches.length?'<div class="desk-grid">'+matches.map(story=>storyCard(story,{image:true})).join('')+'</div>':'<p role="status">'+editionCopy('এই বাছাইয়ে কোনো প্রতিবেদন পাওয়া যায়নি।','No stories match this selection.')+'</p>';
}
function archivePage(){
  const dates = [...new Set(orderedStories().map(storyDate).filter(Boolean))].sort().reverse();
  const selected = dates[0] ?? archiveDay;
  return '<section class="section"><h2>'+utilities.archive+'</h2><div class="archive-controls"><label>'+editionCopy('প্রকাশের তারিখ','Publication date')+' <input type="date" id="archive-date" value="'+selected+'"></label><label>'+editionCopy('বিভাগ','Section')+' <select id="archive-category">'+newsroomOptions([['',editionCopy('সব বিভাগ','All sections')],...searchSections],'')+'</select></label><div class="archive-dates">'+dates.slice(0,3).map(date=>'<button type="button" data-archive-date="'+date+'">'+editorialDate(date)+'</button>').join('')+'</div></div><div id="archive-list">'+archiveResults(selected,'')+'</div></section>';
}
function refreshArchive(){
  get('archive-list').innerHTML=archiveResults(get('archive-date').value,get('archive-category').value);
}

function menuDirectory(){
  const group=(title,items,feature=false)=>'<section class="menu-group'+(feature?' menu-features':'')+'"><h3>'+title+'</h3><ul>'+items.map(([key,href,label])=>'<li><a'+(key==='live'?' class="menu-live"':'')+' href="'+href+'">'+label+'</a></li>').join('')+'</ul></section>';
  const tools=keys=>keys.map(key=>[key,link('tool',key),utilities[key]]);
  const sections=keys=>keys.map(key=>[key,key==='home'?editionHome():link('section',key),categories[key]]);
  const featured=group(editionCopy('সংবাদ ও মিডিয়া','News and media'),tools(['live','briefing','paper','video','photo','archive','mydistrict','tips']),true);
  const departments=[
    [editionCopy('প্রধান সংবাদ','Top news'),['home','latest','national','district','politics','world','probash']],
    [editionCopy('বাণিজ্য ও শিক্ষা','Business and education'),['business','corporate','jobs','education','tech','science']],
    [editionCopy('জীবন ও সংস্কৃতি','Life and culture'),['sport','entertainment','lifestyle','culture','fashion','faith','health','events']],
    [editionCopy('মতামত ও ফিচার','Opinion and features'),['opinion','editorial','features','media','social','satire']]
  ];
  return featured+'<div class="menu-departments">'+departments.map(([title,keys])=>group(title,sections(keys))).join('')+'</div><div class="menu-secondary">'+group(editionCopy('পাঠকের জন্য','For readers'),tools(['profile','saved','topics']))+group(editionCopy('বিডি এভরিডে','BD Everyday'),tools(['about','privacy','connections','desk']).concat((managedContent.navigation??[]).map(row=>['managed',safe(row.href),safe(editionCopy(row.label,row.labelEn??row.label))])))+'</div>';
}
