import 'server-only';
import original from './generated/companions.json';
import { scriptJson } from './content';
import { records, type ContentRow } from './content-model';

type Companion = keyof typeof original;

export function companion(path: string): Companion | null {
  const key = path.replace(/^\//,'').replace(/\/$/,'');
  if (key === 'opportunities') return 'jobs';
  return key === 'compare' || key === 'shop' ? key : null;
}

function replaceList(html: string, key: string, next: string) {
  return html.replace(new RegExp('const '+key+'=\\[\\n[\\s\\S]*?\\n\\];'), () => 'const '+key+'='+next+';');
}

function comparison(html: string, rows: ContentRow[]) {
  const items = records(rows,'comparison').map(({data}) => ({...data,offers:data.offers.map(offer => [offer.price,offer.delivery,offer.merchant])}));
  return replaceList(html,'products',scriptJson(items))
    .replace('store:stores[index]', 'store:cost[2] || stores[index]')
    .replace('...cost.map(value=>','...cost.slice(0,2).map(value=>');
}

function jobs(html: string, rows: ContentRow[]) {
  const today = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dhaka',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const items = records(rows,'opportunity').flatMap(({data}) => {
    if (data.deadline && data.deadline < today) return [];
    const offset = data.deadline ? (Date.parse(data.deadline)-Date.parse(today))/86400000 : data.demoDays;
    return [[data.kind,data.title,data.location,data.eligibility,data.keywords,data.description,offset,data.applyUrl ?? null]];
  });
  return replaceList(html,'listings',scriptJson(items))
    .replace('<p class="notice">','<p><a id="apply-link" hidden>আবেদন করুন</a></p><p class="notice" id="job-notice">')
    .replace("get('details').showModal()", "const apply=get('apply-link');apply.hidden=!item[7];get('job-notice').hidden=!!item[7];if(item[7])apply.href=item[7];else apply.removeAttribute('href');get('details').showModal()");
}

function shop(html: string, rows: ContentRow[]) {
  const items = records(rows,'product').map(({slug,data}) => [data.name,data.category,data.description,data.keywords,data.price,slug,data.stock]);
  const zones = records(rows,'delivery-zone');
  const checkout = `let orderId;
get('checkout').onsubmit=async event=>{
  event.preventDefault();
  if(!cart.size)return;
  const form=event.currentTarget;
  const submit=form.querySelector('button[type=submit]');
  if(submit.disabled)return;
  orderId??=crypto.randomUUID();
  const values=new FormData(form);
  const payload={id:orderId,zone:get('area').value,name:values.get('name'),phone:values.get('phone'),address:values.get('address'),lines:[...cart].map(([index,quantity])=>({sku:products[index][5],quantity}))};
  submit.disabled=true;
  try {
    const response=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const result=await response.json();
    if(!response.ok)throw new Error(result.error);
    cart.clear();
    orderId=undefined;
    form.reset();
    get('confirmation').textContent='অর্ডার গ্রহণ করা হয়েছে · '+result.id+' · '+money(result.total);
    renderCart();
  } catch (error) {
    get('confirmation').textContent=error.message||'অর্ডার পাঠানো যায়নি। আবার চেষ্টা করুন।';
  } finally {
    get('confirmation').hidden=false;
    submit.disabled=false;
    renderCart();
  }
};`;
  const fields = '<label>নাম <input name="name" autocomplete="name" required minlength="2" maxlength="100"></label><label>ফোন <input name="phone" type="tel" autocomplete="tel" required minlength="6" maxlength="30"></label><label>ঠিকানা <input name="address" autocomplete="street-address" required minlength="8" maxlength="500"></label>';
  const config = `const zones=${scriptJson(zones)};const zoneSelect=get('area');zoneSelect.replaceChildren(...zones.map(({slug,data})=>new Option(data.label,slug)));const filter=get('filter');filter.replaceChildren(new Option('সব বিভাগ',''),...[...new Set(products.map(item=>item[1]))].map(value=>new Option(value,value)));renderProducts();renderCart();`;
  return replaceList(html,'products',scriptJson(items))
    .replace('<form id="checkout" class="checkout">','<form id="checkout" class="checkout">'+fields)
    .replace("const delivery=count?Number(get('area').value):0;", "const delivery=count?(zones.find(item=>item.slug===get('area').value)?.data.fee??0):0;")
    .replace("if(count>0)cart.set(index,count);else cart.delete(index);","if(count>Math.min(25,products[index][6]))return;orderId=undefined;if(count>0)cart.set(index,count);else cart.delete(index);")
    .replace("button.onclick=()=>{change(index,1);","button.disabled=!products[index][6];button.onclick=()=>{change(index,1);")
    .replace(/get\('checkout'\)\.onsubmit=event=>[^\n]+/, () => checkout)
    .replace('renderProducts();renderCart();', () => config)
    .replace('নমুনা অর্ডার দিন','ক্যাশ অন ডেলিভারি অর্ডার দিন');
}

export function renderCompanion(page: Companion, rows: ContentRow[] | null) {
  if (!rows) return original[page];
  if (page === 'compare') return comparison(original[page],rows);
  if (page === 'jobs') return jobs(original[page],rows);
  return shop(original[page],rows);
}
