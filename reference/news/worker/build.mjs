import {englishAsset} from './english-build.mjs';
import {mkdirSync,readFileSync,readdirSync,writeFileSync,cpSync} from 'node:fs';
import vm from 'node:vm';
import {extname} from 'node:path';

const types={'.css':'text/css; charset=utf-8','.ico':'image/x-icon','.png':'image/png','.svg':'image/svg+xml','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mp4':'video/mp4','.webp':'image/webp','.txt':'text/plain; charset=utf-8'};
const assets={};
for(const file of readdirSync('dist',{recursive:true})){
  if(file.startsWith('.')||file.startsWith('server/')||!types[extname(file)]) continue;
  const path='/'+file.replace(/(^|\/)index\.html$/,'$1');
  assets[path]=[types[extname(file)],readFileSync('dist/'+file).toString('base64')];
}
for(const path of ['/','/country/','/newsroom.js','/country.js','/live.js']){
  const [type,data]=assets[path];
  const english=englishAsset(path,Buffer.from(data,'base64').toString());
  assets['/en'+path]=[type,Buffer.from(english).toString('base64')];
}
const areaSource=readFileSync('dist/country-data.js','utf8');
const areaNames=JSON.parse(readFileSync('worker/english-places.json','utf8'));
const areaData=JSON.parse(areaSource.slice(areaSource.indexOf('=')+1).trim().replace(/;$/,''));
for(const rows of Object.values(areaData)) for(const row of rows){
  const name=areaNames[row[1]];
  if(!name)throw Error('Missing place name: '+row[1]);
  row[1]=name;
}
assets['/en/country-data.js']=[types['.js'],Buffer.from('const countryData = '+JSON.stringify(areaData)+';').toString('base64')];
mkdirSync('dist/server',{recursive:true});
mkdirSync('dist/.openai',{recursive:true});
const demoIndex={};
const desks={};
for(const [locale,path] of [['bn','/'],['en','/en/']]){
  const page=Buffer.from(assets[path][1],'base64').toString();
  const newsroom=Buffer.from(assets[(locale==='en'?'/en':'')+'/newsroom.js'][1],'base64').toString();
  const labels=vm.runInNewContext(page.match(/^const categories=.*$/m)[0]+'\ncategories');
  const destinations=vm.runInNewContext(newsroom.match(/^const countryNames=.*$/m)[0]+'\ncountryNames');
  for(const [key,label] of Object.entries(labels)){
    if(key!=='home' && key!=='district')desks[path+key+'/']={locale,type:'section',key,label};
  }
  for(const [key,label] of Object.entries(destinations))desks[path+'probash/'+key+'/']={locale,type:'country',key,label};
  const legacy=page.slice(page.indexOf('const legacyStories='),page.indexOf('const keyFor='));
  const context=vm.createContext({dhaka:['/photos/metro.webp'],kl:['/photos/kuala-lumpur.webp']});
  vm.runInContext(readFileSync('dist/feature-stories.js','utf8')+'\n'+legacy,context);
  const featured=vm.runInContext('featureStories',context);
  const articles=vm.runInContext('legacyStories',context).map(([id,section,title,summary,keywords,paragraphs,photo])=>[id,{title,summary,body:paragraphs.join('\n\n'),photo:photo?.[0],date:'2026-11-24'}]);
  demoIndex[locale]=Object.fromEntries([...articles,...featured.map(item=>{
    const [title,summary,...paragraphs]=item[locale];
    return [item.id,{title,summary,body:paragraphs.join('\n\n'),photo:item.photo?'/photos/'+item.photo+'.webp':null,date:item.date??'2026-11-24'}];
  })]);
}
// Only explicitly reviewed bundled guides are eligible for search.
const publishedGuideIds=JSON.parse(readFileSync('worker/published-guides.json','utf8'));
if(!Array.isArray(publishedGuideIds)||new Set(publishedGuideIds).size!==publishedGuideIds.length||
  publishedGuideIds.some(id=>typeof id!=='string'||!['bn','en'].every(lang=>
    Object.hasOwn(demoIndex[lang],id)&&demoIndex[lang][id].body.trim()))) {
  throw Error('Published guides must be unique and have an article body in both editions.');
}
const source='const desks = '+JSON.stringify(desks)+';\nconst demoIndex = '+JSON.stringify(demoIndex)+';\nconst publishedGuides = new Set('+JSON.stringify(publishedGuideIds)+');\n'+readFileSync('worker/editorial.js','utf8')+'\n'+readFileSync('worker/live.js','utf8')+'\n'+readFileSync('worker/translate.js','utf8')+'\n'+readFileSync('worker/index.js','utf8');
writeFileSync('dist/server/index.js','const assets = '+JSON.stringify(assets)+';\n'+source);
cpSync('.openai/hosting.json','dist/.openai/hosting.json');
cpSync('drizzle','dist/.openai/drizzle',{recursive:true});
