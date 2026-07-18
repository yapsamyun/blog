// script.js - simple client-side journal viewer

const entries = [
  {
    date: '2024-11-03',
    content: `Today I walked along the river and watched the leaves drift. I wrote a little in my notebook about how sunlight looked on the water.`
  },
  {
    date: '2025-02-17',
    content: `A quiet morning. Made coffee and listened to an old record. I felt thankful for small routines.`
  },
  {
    date: '2026-06-12',
    content: `An evening of rain. I read a short story that lingered with me. I sketched a doorway from memory.`
  }
];

let idx = 0;

const entryTitle = document.getElementById('entryTitle');
const entryContent = document.getElementById('entryContent');
const entryList = document.getElementById('entryList');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');

function renderList(){
  entryList.innerHTML = '';
  entries.forEach((e,i)=>{
    const li = document.createElement('li');
    li.textContent = e.date;
    li.tabIndex = 0;
    li.addEventListener('click', ()=>{ goTo(i); });
    li.addEventListener('keydown', (ev)=>{ if(ev.key === 'Enter') goTo(i); });
    li.classList.toggle('active', i===idx);
    entryList.appendChild(li);
  });
}

function updateEntry(){
  const e = entries[idx];
  entryTitle.textContent = e.date;
  entryContent.innerHTML = `<p>${escapeHtml(e.content).replace(/\n/g,'<br>')}</p>`;
  // update active class in list
  Array.from(entryList.children).forEach((li,i)=>{
    li.classList.toggle('active', i===idx);
  });
  // ensure content scroll top
  const entryEl = document.querySelector('.entry');
  if(entryEl) entryEl.scrollTop = 0;
}

function goTo(i){
  if(typeof i !== 'number') return;
  idx = ((i % entries.length) + entries.length) % entries.length;
  updateEntry();
}

nextBtn.addEventListener('click', ()=> goTo(idx+1));
prevBtn.addEventListener('click', ()=> goTo(idx-1));

// keyboard navigation
window.addEventListener('keydown', (e) => {
  if(e.key === 'ArrowRight') goTo(idx+1);
  if(e.key === 'ArrowLeft') goTo(idx-1);
});

// basic HTML escaping to avoid injection in sample content
function escapeHtml(str){
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

// init
renderList();
updateEntry();
