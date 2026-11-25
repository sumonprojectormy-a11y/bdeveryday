'use client';

import { useState } from 'react';
import { browserSupabase } from '@/lib/supabase-browser';

export function StorageUpload() {
  const [status,setStatus] = useState('');
  const [url,setUrl] = useState('');
  const [busy,setBusy] = useState(false);
  const [file,setFile] = useState<File>();
  const upload = async () => {
    if (!file || busy) return;
    const extensions: Record<string,string> = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
    const extension = extensions[file.type];
    if (!extension || file.size > 3*1024*1024) { setStatus('JPG, PNG, WebP · সর্বোচ্চ ৩ এমবি।'); return; }
    const client = browserSupabase();
    if (!client) {setStatus('স্টোরেজ কনফিগার করুন।');return;}
    setBusy(true);
    setStatus('ছবি আপলোড হচ্ছে…');
    setUrl('');
    try {
      const storage = client.storage.from('portal-public');
      const key = 'media/'+crypto.randomUUID()+'.'+extension;
      const { error } = await storage.upload(key,file,{contentType:file.type,upsert:false});
      if (error) { setStatus('আপলোড করা যায়নি। অনুমতি ও ফাইল যাচাই করুন।'); return; }
      setUrl(storage.getPublicUrl(key).data.publicUrl);
      setStatus('আপলোড হয়েছে। মিডিয়া রেকর্ডে ঠিকানাটি দিন।');
    } catch { setStatus('আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।'); }
    finally { setBusy(false); }
  };
  return <section className="rounded border border-stone-200 bg-white p-4">
    <h2 className="font-bold">সরাসরি ছবি আপলোড</h2>
    <label className="mt-2 block">ছবি <input type="file" accept="image/jpeg,image/png,image/webp" onChange={event=>setFile(event.currentTarget.files?.[0])}/></label>
    <button type="button" className="mt-2 rounded bg-red-800 px-3 py-2 text-white disabled:opacity-50" disabled={!file || busy} onClick={upload}>আপলোড করুন</button>
    <p className="mt-2" role="status">{status}</p>
    {url && <label className="mt-2 grid gap-1">মিডিয়ার ঠিকানা<input className="rounded border p-2" value={url} readOnly onFocus={event=>event.currentTarget.select()} /></label>}
  </section>;
}
