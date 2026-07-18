#!/usr/bin/env node
// scripts/generate_index.js
// Generates entries/index.json from markdown filenames in entries/ directory.

const fs = require('fs');
const path = require('path');

const entriesDir = path.join(__dirname, '..', 'entries');
const outPath = path.join(entriesDir, 'index.json');

function isDateFilename(name){
  return /^\d{4}-\d{2}-\d{2}\.md$/.test(name);
}

function filenameToDate(name){
  return name.replace(/\.md$/, '');
}

function main(){
  if(!fs.existsSync(entriesDir)){
    console.error('entries/ directory does not exist');
    process.exit(1);
  }
  const files = fs.readdirSync(entriesDir).filter(isDateFilename);
  if(files.length === 0){
    console.warn('No markdown entries found in entries/');
  }
  // sort chronologically ascending by filename (YYYY-MM-DD)
  files.sort((a,b)=>{
    const da = new Date(filenameToDate(a));
    const db = new Date(filenameToDate(b));
    return da - db;
  });
  const out = files.map(f => ({ date: filenameToDate(f), file: f }));
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${out.length} entries to ${path.relative(process.cwd(), outPath)}`);
}

main();
