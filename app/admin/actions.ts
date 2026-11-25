'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { adminSession, serverSupabase, serviceSupabase } from '@/lib/supabase';
import { database } from '@/lib/database';
import { limits, models, type ContentKind } from '@/lib/content-model';

const value = (data: FormData, name: string) => String(data.get(name) ?? '').trim();
const contentKey = z.string().regex(/^[a-z0-9][a-z0-9-]{0,95}$/);
const emailKey = z.email().max(254);

function dashboard(entity: string, message: string): never {
  revalidatePath('/admin');
  redirect('/admin?entity=' + encodeURIComponent(entity) + '&message=' + encodeURIComponent(message));
}

export async function signIn(form: FormData) {
  const auth = await serverSupabase();
  if (!auth) redirect('/admin/login?state=configuration');
  const email = emailKey.safeParse(value(form,'email').toLowerCase());
  const password = form.get('password');
  if (!email.success || typeof password !== 'string' || password.length < 1 || password.length > 1024) redirect('/admin/login?state=invalid');
  const { error } = await auth.auth.signInWithPassword({email:email.data,password});
  if (error) redirect('/admin/login?state=invalid');
  const access = await auth.rpc('is_admin');
  if (access.data === true) redirect('/admin');
  const db = database();
  if (db && (await db.query('select 1 from newsroom_staff where email=$1',[email.data])).rowCount) redirect('/#tool/desk');
  await auth.auth.signOut();
  redirect('/admin/login?state=restricted');
}

export async function signOut() {
  const auth = await serverSupabase();
  await auth?.auth.signOut();
  redirect('/admin/login');
}

export async function storeRecord(form: FormData) {
  const session = await adminSession();
  if (!session) redirect('/admin/login?state=restricted');
  const entity = value(form,'entity');
  const id = value(form,'id');
  const mode = value(form,'mode');
  if (mode !== 'create' && mode !== 'update') dashboard(entity,'অজানা পরিবর্তন।');
  const raw = value(form,'data');
  if (raw.length > 120000) dashboard(entity,'রেকর্ডটি অনেক বড়।');
  let fields: unknown;
  try { fields = JSON.parse(raw); } catch { dashboard(entity,'JSON ডেটা যাচাই করুন।'); }
  const client = session.client;
  if (Object.hasOwn(models,entity)) {
    if (!contentKey.safeParse(id).success) dashboard(entity,'রেকর্ডের আইডি যাচাই করুন।');
    const result = models[entity as ContentKind].safeParse(fields);
    if (!result.success) dashboard(entity,result.error.issues[0].path.join('.')+' · '+result.error.issues[0].message);
    const position = z.coerce.number().int().min(0).max(100000).safeParse(value(form,'position'));
    if (!position.success) dashboard(entity,'অবস্থান ০ থেকে ১০০০০০ দিন।');
    const record = {kind:entity,slug:id,payload:result.data,position:position.data,active:form.get('active')==='on'};
    const response = mode === 'create'
      ? await client.from('portal_content').insert(record)
      : await client.from('portal_content').update(record).eq('kind',entity).eq('slug',id);
    if (response.error) dashboard(entity,'রেকর্ড সংরক্ষণ করা যায়নি। আইডি ও তথ্য যাচাই করুন।');
    dashboard(entity,'সংরক্ষণ হয়েছে।');
  }
  if (!Object.hasOwn(limits,entity)) dashboard('newsroom_articles','অজানা রেকর্ড।');
  if (mode === 'create' && ['shop_orders','reader_submissions'].includes(entity)) dashboard(entity,'নতুন রেকর্ড মূল ফর্ম থেকে তৈরি করুন।');
  const result = limits[entity as keyof typeof limits].safeParse(fields);
  if (!result.success) dashboard(entity,result.error.issues[0].path.join('.')+' · '+result.error.issues[0].message);
  const pk = entity === 'newsroom_staff' ? 'email' : 'id';
  const key = id || randomUUID();
  if (!(pk === 'email' ? emailKey : contentKey).safeParse(key).success) dashboard(entity,'রেকর্ডের আইডি যাচাই করুন।');
  const record: Record<string,unknown> = { ...result.data };
  if (entity === 'newsroom_articles') {
    if (mode === 'create') record.editor_email = session.user.email!.toLowerCase();
    if (record.status === 'published' && !record.publish_at) record.publish_at = new Date().toISOString();
    if (record.status !== 'published') record.publish_at = null;
    const file = form.get('image');
    if (file instanceof File && file.size) {
      const signatures: Record<string, number[]> = { 'image/jpeg':[255,216,255], 'image/png':[137,80,78,71], 'image/webp':[82,73,70,70] };
      const signature = signatures[file.type];
      if (!signature || file.size > 3*1024*1024) dashboard(entity,'JPG, PNG বা WebP ব্যবহার করুন। সর্বোচ্চ ৩ এমবি।');
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (!signature.every((byte,index)=>bytes[index]===byte) ||
          (file.type === 'image/webp' && new TextDecoder().decode(bytes.slice(8,12)) !== 'WEBP')) dashboard(entity,'ছবির ধরন যাচাই করুন।');
      const service = serviceSupabase();
      if (!service) dashboard(entity,'স্টোরেজ কনফিগার করুন।');
      const stored = await service.storage.from('portal-private').upload('newsroom/'+key,file,{upsert:true,contentType:file.type});
      if (stored.error) dashboard(entity,'ছবি সংরক্ষণ করা যায়নি।');
      record.image_type = file.type;
    }
  }
  const response = mode === 'create'
    ? await client.from(entity).insert({...record,[pk]:key})
    : await client.from(entity).update(record).eq(pk,key);
  if (response.error) dashboard(entity,'রেকর্ড সংরক্ষণ করা যায়নি। তথ্য ও সম্পর্ক যাচাই করুন।');
  dashboard(entity,'সংরক্ষণ হয়েছে।');
}

export async function deleteRecord(form: FormData) {
  const session = await adminSession();
  if (!session) redirect('/admin/login?state=restricted');
  const entity = value(form,'entity'), id = value(form,'id');
  const client = session.client;
  if (!id) dashboard(entity,'আইডি প্রয়োজন।');
  if (Object.hasOwn(models,entity)) {
    const { error } = await client.from('portal_content').delete().eq('kind',entity).eq('slug',id);
    if (error) dashboard(entity,'মোছা যায়নি।');
  } else if (Object.hasOwn(limits,entity)) {
    const { error } = await client.from(entity).delete().eq(entity==='newsroom_staff'?'email':'id',id);
    if (error) dashboard(entity,'মোছা যায়নি।');
    const path = entity === 'newsroom_articles' ? 'newsroom/'+id : entity === 'reader_submissions' ? 'reader-inbox/'+id : '';
    if (path) {
      const service = serviceSupabase();
      await service?.storage.from('portal-private').remove([path]);
    }
  } else dashboard('newsroom_articles','অজানা রেকর্ড।');
  dashboard(entity,'মুছে দেওয়া হয়েছে।');
}
