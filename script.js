// script.js - load entries from entries/index.json and fetch individual markdown files

const indexPath = './entries/index.json';
let entriesMeta = [];
const contentCache = {};
let idx = 0;

const entryTitle = document.getElementById('entryTitle');
const entryContent = document.getElementById('entryContent');
const entryList = document.getElementById('entryList');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');

async function fetchJson(path){
  const res = await fetch(path);
  if(!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json();
}

async function fetchText(path){
  const res = await fetch(path);
  if(!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.text();
}

function escapeHtml(str){
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

function renderMarkdown(md){
  if(!md) return '';
  // Very small markdown renderer: headings (# ) and paragraphs
  // Split into blocks separated by blank lines
  const blocks = md.split(/\n{2,}/g);
  const out = blocks.map(block => {
    const trimmed = block.trim();
    const h1 = trimmed.match(/^#\s+(.+)$/);
    if(h1) return `<h2>${escapeHtml(h1[1])}</h2>`;
    // replace single newlines with <br>
    return `<p>${escapeHtml(trimmed).replace(/\n/g,'<br>')}</p>`;
  }).join('\n');
  return out;
}

function renderList(){
  entryList.innerHTML = '';
  entriesMeta.forEach((m,i)=>{
    const li = document.createElement('li');
    li.textContent = m.date;
    li.tabIndex = 0;
    li.addEventListener('click', ()=>{ goTo(i); });
    li.addEventListener('keydown', (ev)=>{ if(ev.key === 'Enter') goTo(i); });
    li.classList.toggle('active', i===idx);
    entryList.appendChild(li);
  });
}

async function loadContentFor(i){
  const meta = entriesMeta[i];
  if(!meta) return '';
  if(meta.file){
    if(contentCache[meta.file]) return contentCache[meta.file];
    const path = `./entries/${meta.file}`;
    try{
      const text = await fetchText(path);
      contentCache[meta.file] = text;
      return text;
    }catch(e){
      console.warn(e);
      return `Could not load ${meta.file}.`;
    }
  }
  return meta.content || '';
}

async function updateEntry(){
  if(!entriesMeta.length) return;
  const e = entriesMeta[idx];
  entryTitle.textContent = e.date;
  const md = await loadContentFor(idx);
  entryContent.innerHTML = renderMarkdown(md);
  Array.from(entryList.children).forEach((li,i)=> li.classList.toggle('active', i===idx));
  const entryEl = document.querySelector('.entry');
  if(entryEl) entryEl.scrollTop = 0;
}

function goTo(i){
  if(!entriesMeta.length) return;
  idx = ((i % entriesMeta.length) + entriesMeta.length) % entriesMeta.length;
  updateEntry();
}

nextBtn.addEventListener('click', ()=> goTo(idx+1));
prevBtn.addEventListener('click', ()=> goTo(idx-1));

window.addEventListener('keydown', (e) => {
  if(e.key === 'ArrowRight') goTo(idx+1);
  if(e.key === 'ArrowLeft') goTo(idx-1);
});

// initialize: try to load index.json, fallback to embedded list if needed
(async function init(){
  try{
    entriesMeta = await fetchJson(indexPath);
  }catch(e){
    console.warn('Could not load entries/index.json — falling back to inline samples.', e);
    entriesMeta = [
      { date: '2024-11-03', content: 'Today I walked along the river and watched the leaves drift. I wrote a little in my notebook about how sunlight looked on the water.' },
      { date: '2025-02-17', content: 'A quiet morning. Made coffee and listened to an old record. I felt thankful for small routines.' },
      { date: '2026-06-12', content: 'An evening of rain. I read a short story that lingered with me. I sketched a doorway from memory.' }
    ];
  }
  renderList();
  updateEntry();
})();
