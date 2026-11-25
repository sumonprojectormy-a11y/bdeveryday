import 'server-only';
import { database } from './database';
import { orderInput, records, type ContentRow } from './content-model';

export async function createOrder(request: Request) {
  const url = new URL(request.url);
  const incomingHost = request.headers.get('host');
  const origin = request.headers.get('origin');
  const allowedOrigins = [url.origin, incomingHost && url.protocol + '//' + incomingHost];
  if (!origin || !allowedOrigins.includes(origin)) return Response.json({error:'Invalid origin.'},{status:403});
  const db = database();
  if (!db) return Response.json({error:'অর্ডার করার সেবা এখন চালু নেই।'},{status:503});
  const raw = await request.text();
  if (raw.length > 12000) return Response.json({error:'অর্ডারের তথ্য খুব বড়।'},{status:413});
  let input: unknown;
  try { input = JSON.parse(raw); } catch { return Response.json({error:'অর্ডারের তথ্য যাচাই করুন।'},{status:400}); }
  const parsed = orderInput.safeParse(input);
  if (!parsed.success) return Response.json({error:'অর্ডারের তথ্য যাচাই করুন।'},{status:400});
  const order = parsed.data;
  const client = await db.connect();
  try {
    await client.query('begin');
    await client.query('select pg_advisory_xact_lock(hashtextextended($1::text,0))',[order.id]);
    const existing = (await client.query(
      'select total_bdt, customer_name, phone, address, zone, lines from shop_orders where id=$1',[order.id]
    )).rows[0];
    if (existing) {
      const same = existing.customer_name === order.name && existing.phone === order.phone &&
        existing.address === order.address && existing.zone === order.zone &&
        existing.lines.length === order.lines.length &&
        order.lines.every(line => existing.lines.some((item: typeof line) => item.sku === line.sku && item.quantity === line.quantity));
      await client.query('commit');
      return same ? Response.json({id:order.id,total:existing.total_bdt}) : Response.json({error:'এই অর্ডার নম্বরটি ব্যবহৃত হয়েছে।'},{status:409});
    }
    const { rows } = await client.query<ContentRow>(
      "select * from portal_content where active and ((kind='product' and slug=any($1::text[])) or (kind='delivery-zone' and slug=$2)) order by kind,slug for update",
      [order.lines.map(line => line.sku),order.zone]
    );
    const zone = records(rows,'delivery-zone')[0];
    const products = new Map(records(rows,'product').map(item => [item.slug,item.data]));
    if (!zone || order.lines.some(line => (products.get(line.sku)?.stock ?? 0) < line.quantity)) {
      await client.query('rollback');
      return Response.json({error:'পণ্যের মজুত বা ডেলিভারি এলাকা বদলেছে।'},{status:409});
    }
    let subtotal = 0;
    const lines = [];
    for (const line of order.lines) {
      const item = products.get(line.sku)!;
      subtotal += line.quantity * item.price;
      lines.push({...line,name:item.name,price:item.price});
      await client.query("update portal_content set payload=jsonb_set(payload,'{stock}',to_jsonb($2::integer)) where kind='product' and slug=$1",[line.sku,item.stock-line.quantity]);
    }
    await client.query(
      'insert into shop_orders(id,customer_name,phone,address,zone,lines,subtotal_bdt,delivery_bdt) values($1,$2,$3,$4,$5,$6,$7,$8)',
      [order.id,order.name,order.phone,order.address,order.zone,JSON.stringify(lines),subtotal,zone.data.fee]
    );
    await client.query('commit');
    return Response.json({id:order.id,total:subtotal+zone.data.fee},{status:201});
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}
