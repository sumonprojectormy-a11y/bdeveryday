/* eslint-disable @next/next/no-html-link-for-pages -- Public pages are Route Handler HTML documents. */
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { adminSession } from '@/lib/supabase';
import { models } from '@/lib/content-model';
import { deleteRecord, signOut, storeRecord } from './actions';
import { StorageUpload } from './storage-upload';

export const metadata: Metadata = { title:'নিউজরুম | BD Everyday', robots:{index:false,follow:false} };
export const dynamic = 'force-dynamic';

const labels: Record<string,string> = {
  newsroom_articles:'প্রতিবেদন', newsroom_staff:'সংবাদকর্মী', live_events:'লাইভ ইভেন্ট',
  live_updates:'লাইভ আপডেট', reader_submissions:'পাঠকের বার্তা', article_notes:'সংশোধনী ও সূত্র', shop_orders:'অর্ডার',
  comparison:'মূল্য তুলনা', opportunity:'চাকরি ও সুযোগ', product:'পণ্য', 'delivery-zone':'ডেলিভারি এলাকা',
  layout:'প্রচ্ছদ বিন্যাস', video:'ভিডিও', gallery:'ছবির গ্যালারি', edition:'ই-পেপার',
  navigation:'নেভিগেশন', copy:'সাইটের লেখা', translation:'ইংরেজি সংস্করণ', media:'মিডিয়া'
};

const fieldClass = 'rounded border border-stone-300 bg-white p-2';
const buttonClass = 'rounded bg-red-800 px-3 py-2 text-white';
type Row = Record<string,unknown>;

const fields: Record<string,string[]> = {
  newsroom_articles:['title','summary','body','category','author','district','country','status','breaking','publish_at','image_type'],
  newsroom_staff:['role'], live_events:['title','summary','started_at','ended_at'],
  live_updates:['event_id','headline','body','author'], article_notes:['article_id','note','source'],
  reader_submissions:['reviewed_at'], shop_orders:['status']
};

const newData: Record<string,object> = {
  newsroom_articles:{title:'',summary:'',body:'',category:'national',author:'',status:'draft',breaking:0},
  newsroom_staff:{role:'reporter'}, live_events:{title:'',summary:''},
  live_updates:{event_id:'',headline:'',body:'',author:''},
  article_notes:{article_id:'',note:'',source:null},
  comparison:{category:1,name:'',detail:'',keywords:'',offers:[]},
  opportunity:{kind:1,title:'',location:'',eligibility:'',keywords:'',description:'',deadline:''},
  product:{name:'',category:'',description:'',keywords:'',price:0,stock:0},
  'delivery-zone':{label:'',fee:0}, layout:{items:[]},
  video:{type:'',title:'',duration:'0:00',description:'',src:'',poster:''},
  gallery:{title:'',items:[]}, edition:{date:'',edition:'morning',pages:[]},
  navigation:{label:'',href:''}, copy:{bn:'',en:''}, translation:{title:'',summary:'',body:''},
  media:{url:'',alt:''}
};

function RecordForm({entity,id,row,cms}: {entity:string;id?:string;row?:Row;cms:boolean}) {
  const data = row ? cms ? row.payload : Object.fromEntries(fields[entity].filter(key=>Object.hasOwn(row,key)).map(key=>[key,row[key]])) : newData[entity];
  return <form action={storeRecord} className="grid gap-3">
    <input type="hidden" name="entity" value={entity}/>
    <input type="hidden" name="mode" value={row?'update':'create'}/>
    {id ? <input type="hidden" name="id" value={id}/> :
      <label className="grid gap-1">{entity==='newsroom_staff'?'কর্মীর ইমেইল':'রেকর্ড আইডি'}
        <input name="id" className={fieldClass} required={cms || entity==='newsroom_staff'} maxLength={entity==='newsroom_staff'?254:96} type={entity==='newsroom_staff'?'email':'text'}/>
      </label>}
    {cms && <div className="flex flex-wrap items-center gap-4">
      <label>অবস্থান <input name="position" type="number" min={0} max={100000} className={fieldClass} defaultValue={Number(row?.position ?? 0)}/></label>
      <label><input type="checkbox" name="active" defaultChecked={row ? row.active===true : true}/> সক্রিয়</label>
    </div>}
    <label className="grid gap-1">রেকর্ডের তথ্য (JSON)
      <textarea className={fieldClass+' font-mono text-sm'} name="data" rows={9} required maxLength={120000} defaultValue={JSON.stringify(data,null,2)} spellCheck={false}/>
    </label>
    {entity==='newsroom_articles' && <label className="grid gap-1">প্রতিবেদনের ছবি<input name="image" type="file" accept="image/jpeg,image/png,image/webp"/></label>}
    <button className={buttonClass+' justify-self-start'}>সংরক্ষণ করুন</button>
  </form>;
}

export default async function Dashboard({searchParams}: {searchParams: Promise<{entity?: string;message?:string;page?:string}>}) {
  const session = await adminSession();
  if (!session) redirect('/admin/login?state=restricted');
  const params = await searchParams;
  const entity = params.entity && Object.hasOwn(labels,params.entity) ? params.entity : 'newsroom_articles';
  const cms = Object.hasOwn(models,entity);
  const pk = entity==='newsroom_staff' ? 'email' : cms ? 'slug' : 'id';
  const page = Math.min(10000,Math.max(1,Number.parseInt(params.page??'1',10)||1));
  let query = session.client.from(cms?'portal_content':entity).select('*',{count:'exact'});
  if (cms) query = query.eq('kind',entity).order('position');
  const {data,error,count} = await query.order(pk).range((page-1)*20,page*20-1);
  const rows = (data??[]) as Row[];
  return <main className="mx-auto grid w-[min(94%,72rem)] gap-5 py-8">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div><a className="text-red-800 underline" href="/">BD Everyday</a><h1 className="text-3xl font-bold">প্রশাসন</h1></div>
      <div className="flex items-center gap-4"><a className="underline" href="/#tool/desk">নিউজরুম</a><form action={signOut}><button className={buttonClass}>সাইন আউট</button></form></div>
    </header>
    <nav className="flex flex-wrap gap-2" aria-label="প্রশাসন বিভাগ">
      {Object.entries(labels).map(([key,label])=><a key={key} href={'/admin?entity='+key} aria-current={entity===key?'page':undefined} className={'rounded border px-3 py-1 '+(entity===key?'border-red-800 bg-red-800 text-white':'border-stone-300 bg-white')}>{label}</a>)}
    </nav>
    <h2 className="text-2xl font-bold">{labels[entity]}</h2>
    {params.message && <p role="status" className="rounded border border-stone-200 bg-white p-3">{params.message}</p>}
    {error && <p role="alert">রেকর্ড পাওয়া যায়নি। ডেটাবেস সংযোগ যাচাই করুন।</p>}
    {entity==='media' && <StorageUpload />}
    {Object.hasOwn(newData,entity) && <details className="rounded border border-stone-200 bg-white p-4"><summary className="mb-3 cursor-pointer font-semibold">নতুন রেকর্ড</summary><RecordForm entity={entity} cms={cms}/></details>}
    {!rows.length && !error && <p>এই বিভাগে কোনো রেকর্ড নেই।</p>}
    {rows.map(row=>{
      const id=String(row[pk]);
      const payload = typeof row.payload==='object' && row.payload ? row.payload as Row : {};
      const title=String(row.title??row.headline??payload.title??payload.name??payload.label??id);
      return <details key={id} className="rounded border border-stone-200 bg-white p-4">
        <summary className="mb-3 cursor-pointer font-semibold">{title} · {id}{cms ? row.active ? ' · সক্রিয়' : ' · বন্ধ' : row.status ? ' · '+String(row.status) : ''}</summary>
        <details className="my-3"><summary className="cursor-pointer">সংরক্ষিত তথ্য</summary><pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded bg-stone-100 p-3 text-xs">{JSON.stringify(row,null,2)}</pre></details>
        <RecordForm entity={entity} id={id} row={row} cms={cms}/>
        <details className="mt-4"><summary className="cursor-pointer text-red-800">রেকর্ড মুছুন</summary><form action={deleteRecord} className="mt-2">
          <input type="hidden" name="entity" value={entity}/><input type="hidden" name="id" value={id}/><button className={buttonClass}>মোছা নিশ্চিত করুন</button>
        </form></details>
      </details>;
    })}
    <nav className="flex gap-4" aria-label="রেকর্ডের পাতা">
      {page>1 && <a className="underline" href={`/admin?entity=${entity}&page=${page-1}`}>আগের পাতা</a>}
      {(count??0)>page*20 && <a className="underline" href={`/admin?entity=${entity}&page=${page+1}`}>পরের পাতা</a>}
    </nav>
  </main>;
}
