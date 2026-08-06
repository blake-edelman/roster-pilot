import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const absoluteAsset = /(?:src|href)=["']\/assets\//;
const relativeAsset = /(?:src|href)=["']\.\/assets\//;

if (absoluteAsset.test(html) || !relativeAsset.test(html)) {
  throw new Error('Production assets must use ./assets paths so Electron can load them through file://.');
}

console.log('Verified Electron-safe relative asset paths.');
