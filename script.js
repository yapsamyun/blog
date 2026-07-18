// script.js - load entries from entries/index.json and fetch individual markdown files

const indexPath = './entries/index.json';
const frontPath = './front.md';
let entriesMeta = [];
const contentCache = {};
let idx = 0;
let showingFront = false;

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
    const h2 = trimmed.match(/^##\s+(.+)$/);
    if(h2) return `<h3>${escapeHtml(h2[1])}</h3>`;
    // replace single newlines with <br>
    return `<p>${escapeHtml(trimmed).replace(/\n/g,'<br>')}</p>`;
  }).join('\n');
  return out;
}

function renderList(){
  entryList.innerHTML = '';
  entriesMeta.forEach((m,i)=>{
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${encodeURIComponent(m.date)}`;
    a.textContent = m.date;
    a.addEventListener('click', (ev)=>{
      ev.preventDefault();
      goTo(i);
    });
    li.appendChild(a);
    li.tabIndex = 0;
    li.addEventListener('keydown', (ev)=>{ if(ev.key === 'Enter') goTo(i); });
    li.classList.toggle('active', i===idx && !showingFront);
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

async function renderFront(md){
  // For the front page we do NOT show the date header — user requested no date.
  entryTitle.textContent = '';
  // strip a leading H1 if present, but allow H2 as content (your front.md uses H2)
  const mdWithoutH1 = md.replace(/^\s*#\s+(.+)(?:\r?\n)*/, '');
  entryContent.innerHTML = renderMarkdown(mdWithoutH1);
  showingFront = true;
  Array.from(entryList.children).forEach((li,i)=> li.classList.toggle('active', false));
}

async function updateEntry(){
  if(showingFront){
    // front is already rendered separately
    return;
  }
  if(!entriesMeta.length) return;
  const e = entriesMeta[idx];
  const md = (await loadContentFor(idx)) || '';

  // If the markdown begins with a top-level heading (e.g. "# 2026-06-12"),
  // use it as the page title and strip it from the rendered content so
  // the date/title doesn't appear twice on the page.
  const titleMatch = md.match(/^\s*#\s+(.+)(?:\r?\n)*/);
  if(titleMatch){
    entryTitle.textContent = titleMatch[1].trim();
    const mdWithoutTitle = md.replace(/^\s*#\s+(.+)(?:\r?\n)*/, '');
    entryContent.innerHTML = renderMarkdown(mdWithoutTitle);
  } else {
    entryTitle.textContent = e.date;
    entryContent.innerHTML = renderMarkdown(md);
  }

  Array.from(entryList.children).forEach((li,i)=> li.classList.toggle('active', i===idx));
  const entryEl = document.querySelector('.entry');
  if(entryEl) entryEl.scrollTop = 0;
}

function goTo(i){
  if(!entriesMeta.length) return;
  showingFront = false;
  idx = ((i % entriesMeta.length) + entriesMeta.length) % entriesMeta.length;
  // update URL hash so each entry has its own URL
  const date = entriesMeta[idx].date;
  try{
    location.hash = encodeURIComponent(date);
  }catch(e){/* ignore */}
  updateEntry();
}

nextBtn.addEventListener('click', ()=>{
  if(showingFront){
    // go to first real entry
    if(entriesMeta.length) goTo(0);
  } else {
    goTo(idx+1);
  }
});
prevBtn.addEventListener('click', ()=>{
  if(showingFront){
    // wrap to last entry
    if(entriesMeta.length) goTo(entriesMeta.length-1);
  } else {
    goTo(idx-1);
  }
});

window.addEventListener('hashchange', async ()=>{
  const h = decodeURIComponent(location.hash.slice(1) || '');
  if(!h){
    // show front if available
    try{
      const md = await fetchText(frontPath);
      await renderFront(md);
      return;
    }catch(e){
      // no front available — fallback to first entry
      showingFront = false;
      if(entriesMeta.length) idx = 0;
      updateEntry();
      return;
    }
  }
  const found = entriesMeta.findIndex(m=> m.date === h);
  if(found !== -1) {
    showingFront = false;
    idx = found;
    updateEntry();
  }
});

window.addEventListener('keydown', (e) => {
  if(e.key === 'ArrowRight'){
    if(showingFront){ if(entriesMeta.length) goTo(0); }
    else goTo(idx+1);
  }
  if(e.key === 'ArrowLeft'){
    if(showingFront){ if(entriesMeta.length) goTo(entriesMeta.length-1); }
    else goTo(idx-1);
  }
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
  // if there's a hash, try to open that entry
  const h = decodeURIComponent(location.hash.slice(1) || '');
  if(h){
    const found = entriesMeta.findIndex(m=> m.date === h);
    if(found !== -1) { idx = found; showingFront = false; updateEntry(); return; }
  }
  // No hash: try to render front.md if present; otherwise show first entry
  try{
    const md = await fetchText(frontPath);
    await renderFront(md);
  }catch(e){
    showingFront = false;
    if(entriesMeta.length) idx = 0;
    updateEntry();
  }
})();
