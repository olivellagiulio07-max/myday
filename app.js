const $=s=>document.querySelector(s);
const today=new Date(); $('#today').textContent=today.toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long'}).toUpperCase();
const blank={tasks:[],routines:[],notes:'',expenses:[],goals:[]};
let data={...blank,...JSON.parse(localStorage.getItem('myday-data')||'{}')};
let current='home';
function save(){localStorage.setItem('myday-data',JSON.stringify(data));renderSummary()}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function renderSummary(){const total=data.tasks.length,done=data.tasks.filter(x=>x.done).length;$('#progressText').textContent=`${done} di ${total} attività completate`;$ ('#progressBar').style.width=(total?done/total*100:0)+'%'}
function itemList(arr,type){if(!arr.length)return '<p class="empty">Ancora niente qui. Aggiungi il primo elemento.</p>';return arr.map((x,i)=>`<div class="item ${x.done?'done':''}"><input type="checkbox" data-check="${type}" data-i="${i}" ${x.done?'checked':''}><span class="item-label">${esc(x.name)}</span>${x.extra?`<span class="small">${esc(x.extra)}</span>`:''}<button class="delete" data-del="${type}" data-i="${i}" aria-label="Elimina">×</button></div>`).join('')}
function form(title,placeholder,type,extra=''){return `<div class="card"><h3>${title}</h3><form class="row" data-form="${type}"><input class="field" name="name" placeholder="${placeholder}" required>${extra}<button class="btn">Aggiungi</button></form></div>`}
function render(){
  $('.tab.active')?.classList.remove('active');document.querySelector(`[data-view="${current}"]`)?.classList.add('active');
  const v=$('#view');
  if(current==='home')v.innerHTML=`<div class="card"><h3>Benvenuto in MyDay</h3><p class="muted">Un piccolo spazio per dare ordine alle cose importanti.</p><div class="grid"><div class="metric-card"><span class="metric">${data.tasks.filter(x=>x.done).length}</span><p>Attività completate</p></div><div class="metric-card"><span class="metric">${data.routines.filter(x=>x.done).length}</span><p>Routine completate</p></div><div class="metric-card"><span class="metric">${data.goals.length}</span><p>Obiettivi attivi</p></div></div></div><div class="card"><h3>Da fare</h3>${itemList(data.tasks,'tasks')}</div><div class="card"><h3>Routine di oggi</h3>${itemList(data.routines,'routines')}</div>`;
  if(current==='tasks')v.innerHTML=form('Nuova attività','Es. Studiare matematica','tasks')+`<div class="card"><h3>Le tue attività</h3>${itemList(data.tasks,'tasks')}</div>`;
  if(current==='routine')v.innerHTML=form('Nuova abitudine','Es. Leggere 15 minuti','routines')+`<div class="card"><h3>La tua routine</h3>${itemList(data.routines,'routines')}</div>`;
  if(current==='notes')v.innerHTML=`<div class="card"><h3>Note personali</h3><textarea id="notes" class="field" placeholder="Scrivi qui le tue idee...">${esc(data.notes)}</textarea><p class="small">Le note vengono salvate automaticamente su questo dispositivo.</p></div>`;
  if(current==='money')v.innerHTML=form('Registra una spesa','Es. Pranzo','expenses','<input class="field" name="amount" type="number" min="0.01" step="0.01" placeholder="€" required style="max-width:110px">')+`<div class="card"><h3>Le tue spese</h3><p class="metric">${data.expenses.reduce((s,x)=>s+Number(x.amount),0).toLocaleString('it-IT',{style:'currency',currency:'EUR'})}</p>${data.expenses.map((x,i)=>`<div class="item"><span class="item-label">${esc(x.name)}</span><b>${Number(x.amount).toLocaleString('it-IT',{style:'currency',currency:'EUR'})}</b><button class="delete" data-del="expenses" data-i="${i}">×</button></div>`).join('')||'<p class="empty">Nessuna spesa registrata.</p>'}</div>`;
  if(current==='goals')v.innerHTML=form('Nuovo obiettivo mensile','Es. Finire un libro','goals')+`<div class="card"><h3>I tuoi obiettivi</h3>${itemList(data.goals,'goals')}</div>`;
  if(current==='stats')v.innerHTML=`<div class="card"><h3>I tuoi progressi</h3><div class="grid"><div class="metric-card"><span class="metric">${data.tasks.filter(x=>x.done).length}/${data.tasks.length}</span><p>Attività completate</p></div><div class="metric-card"><span class="metric">${data.routines.filter(x=>x.done).length}/${data.routines.length}</span><p>Routine completate</p></div><div class="metric-card"><span class="metric">${data.goals.filter(x=>x.done).length}/${data.goals.length}</span><p>Obiettivi raggiunti</p></div></div></div>`;
  renderSummary();
}
document.addEventListener('click',e=>{
 const tab=e.target.closest('[data-view]');if(tab){current=tab.dataset.view;render()}
 if(e.target.matches('[data-del]')){data[e.target.dataset.del].splice(+e.target.dataset.i,1);save();render()}
});
document.addEventListener('change',e=>{if(e.target.matches('[data-check]')){data[e.target.dataset.check][+e.target.dataset.i].done=e.target.checked;save();render()}});
document.addEventListener('submit',e=>{const f=e.target.closest('[data-form]');if(!f)return;e.preventDefault();const fd=new FormData(f),type=f.dataset.form,obj={name:fd.get('name').trim(),done:false};if(type==='expenses')obj.amount=fd.get('amount');data[type].push(obj);save();render()});
document.addEventListener('input',e=>{if(e.target.id==='notes'){data.notes=e.target.value;save()}});
$('#themeBtn').addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('myday-dark',document.body.classList.contains('dark'))});
if(localStorage.getItem('myday-dark')==='true')document.body.classList.add('dark');
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();