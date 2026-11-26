import { access, readFile } from 'node:fs/promises';
await access('public/index.html'); await access('netlify/functions');
console.log('GOLU static site build checks passed.');
