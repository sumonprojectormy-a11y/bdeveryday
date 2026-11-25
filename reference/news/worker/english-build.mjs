import { readFileSync } from 'node:fs';
const dictionary=JSON.parse(readFileSync('worker/english-copy.json','utf8'));
const phrases=/[\u0980-\u09ff](?:[\u0980-\u09ff\u0964\u200c\u200d :,।·–—/-]*[\u0980-\u09ff।])?/gu;
export function englishAsset(path,source){
  let text=source.replace(phrases,key=>{
    if(!Object.hasOwn(dictionary,key)) throw Error('Missing English copy: '+key);
    return dictionary[key];
  });
  text=text.replaceAll('bn-BD','en-GB').replaceAll("localeCompare(b[1],'bn')","localeCompare(b[1],'en')")
    .replaceAll('/country/','/en/country/').replaceAll('href="/"','href="/en/"')
    .replaceAll('/#story/','/en/#story/').replaceAll('WhatsApp-share','Share on WhatsApp')
    .replaceAll('src="/country','src="/en/country').replaceAll('src="/newsroom.js','src="/en/newsroom.js').replaceAll('src="/live.js','src="/en/live.js')
    .replaceAll('<html lang="bn">','<html lang="en">').replaceAll('<span lang="bn">','<span lang="en">')
    .replaceAll('Google News-:','Google News:').replaceAll('App Store-:','App Store:');
  return text;
}
