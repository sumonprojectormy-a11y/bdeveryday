const countryColors=['#508b78','#6183a5','#c08447','#437a52','#947ca8','#bd6254','#56889b','#a68831'];
const districtTags={'district-market':'24','district-river':'43','paba-reading':'24','hathazari-weekend':'43'};
const upazilaTags={'paba-reading':'383','hathazari-weekend':'73'};
const countryPath='/country/';
function renderCountry(){
  const {divisions,districts,upazilas}=countryData;
  const state=new URLSearchParams(location.search);
  const section=get('content');
  const divisionsById=new Map(divisions);
  const number=new Intl.NumberFormat('bn-BD');
  const colorFor=id=>countryColors[divisions.findIndex(([key])=>key===id)];
  const optionList=(label,items)=>'<option value="">'+label+'</option>'+items.map(([id,name])=>'<option value="'+id+'">'+safe(name)+'</option>').join('');
  section.innerHTML='<section class="section"><h1>জেলার খবর</h1><p>এলাকা বেছে নিন অথবা মানচিত্রে একটি জেলায় চাপ দিন।</p><form id="country-filter" class="country-filter"><label>বিভাগ<select id="division-filter">'+optionList('সব বিভাগ',divisions)+'</select></label><label>জেলা<select id="district-filter"></select></label><label>উপজেলা<select id="upazila-filter"></select></label><button type="submit">খুঁজুন</button><a href="/country/">সব জেলার খবর</a></form><div class="country-layout"><section class="country-map"><h2>বাংলাদেশের জেলা মানচিত্র</h2><ul class="country-legend">'+divisions.map(([id,name])=>'<li><span style="background:'+colorFor(id)+'"></span>'+safe(name)+'</li>').join('')+'</ul><svg viewBox="0 0 460 645" aria-label="জেলা নির্বাচন করুন">'+districts.map(([id,name,division,path])=>'<a href="/country/?district='+id+'" aria-label="'+safe(name)+'" data-district="'+id+'"><title>'+safe(name)+' · '+safe(divisionsById.get(division))+'</title><path d="'+path+'" fill="'+colorFor(division)+'" fill-rule="evenodd"/></a>').join('')+'</svg><p class="map-source"><a href="https://github.com/ifahimreza/bangladesh-geojson">এলাকার তথ্য</a> · <a href="/country-data-license.txt">ডেটা লাইসেন্স</a> · সরলীকৃত সীমানা <a href="https://www.geoboundaries.org/">geoBoundaries</a> (BBS / OCHA ROAP)</p></section><div id="country-results"></div></div></section>';
  const division=get('division-filter'),district=get('district-filter'),upazila=get('upazila-filter');
  function setUpazilas(id=''){
    upazila.innerHTML=optionList('সব উপজেলা',district.value?upazilas.filter(item=>item[2]===district.value):[]);
    upazila.value=Array.from(upazila.options).some(option=>option.value===id)?id:'';
    upazila.disabled=!district.value;
  }
  function setDistricts(id=''){
    district.innerHTML=optionList('সব জেলা',division.value?districts.filter(item=>item[2]===division.value):districts);
    district.value=Array.from(district.options).some(option=>option.value===id)?id:'';
  }
  const selectedDistrict=districts.find(([id])=>id===state.get('district'));
  const selectedDivision=selectedDistrict?.[2]??state.get('division');
  division.value=divisionsById.has(selectedDivision)?selectedDivision:'';
  setDistricts(selectedDistrict?.[0]);
  setUpazilas(state.get('upazila'));
  division.onchange=()=>{setDistricts();setUpazilas()};
  district.onchange=()=>{setUpazilas()};
  get('country-filter').onsubmit=event=>{
    event.preventDefault();
    const query=new URLSearchParams();
    for(const [key,field] of [['division',division],['district',district],['upazila',upazila]])if(field.value)query.set(key,field.value);
    history.pushState(null,'',countryPath+(query.size?'?'+query:''));
    renderCountry();
    get('country-results').scrollIntoView({block:'nearest'});
  };
  const divId=division.value, districtId=district.value, upId=upazila.value;
  section.querySelectorAll('[data-district]').forEach(link=>{
    const id=link.dataset.district;
    if(id===districtId)link.setAttribute('aria-current','true');
    link.onclick=event=>{
      if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
      event.preventDefault();
      history.pushState(null,'',link.href);
      renderCountry();
      get('country-results').scrollIntoView({block:'nearest'});
    };
  });
  const title=upazilas.find(([id])=>id===upId)?.[1]??selectedDistrict?.[1]??divisionsById.get(divId)??'সারা বাংলাদেশ';
  const matches=stories.filter(story=>{
    if((story[1]!=='district'&&!(articleRecord(story[0])?.district??featureById.get(story[0])?.district))||(upId&&(featureById.get(story[0])?.upazila??upazilaTags[story[0]])!==upId))return false;
    const tag=articleRecord(story[0])?.district??featureById.get(story[0])?.district??districtTags[story[0]];
    return districtId?tag===districtId:!divId||districts.some(([id,,group])=>id===tag&&group===divId);
  });
  get('country-results').innerHTML='<h2>'+safe(title)+'</h2><p role="status">'+(matches.length?number.format(matches.length)+'টি নমুনা খবর':'এই এলাকার জন্য কোনো নমুনা খবর পাওয়া যায়নি।')+'</p>'+matches.map(card).join('');
}
