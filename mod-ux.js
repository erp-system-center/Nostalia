/* =====================================================================
   طبقة تجربة الاستخدام (على نمط تطبيقات ERP الحديثة): شاشة التطبيقات، مسار التنقل، القوائم القابلة للترتيب،
   عرض البطاقات (Kanban)، شريط الحالة، سجل النقاش (Chatter) على السجلات، لوحة الأوامر (Ctrl+K)
   لا تغيّر البيانات ولا الصلاحيات — طبقة عرض فقط فوق الشاشات الموجودة
   ===================================================================== */
(()=>{
const UX={home:(()=>{try{return localStorage.getItem('gh_home')!=='0'}catch(e){return true}})(),kb:{}};
window.UX=UX;
const P={
ap:'<path d="M5 12.5l4.5 4.5L19 7"/><rect x="3" y="3" width="18" height="18" rx="3"/>',
proc:'<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.5 12h11l2-8H6"/>',
inv:'<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
acc:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h2M14 11h2M8 15h2M14 15h2M8 19h2M14 19h2"/>',
hr:'<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.6 3-6 7-6s7 2.4 7 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c3 0 5 1.8 5 4.5"/>',
mfg:'<path d="M3 21V10l6 4V10l6 4V6h3v15z"/><path d="M3 21h18"/>',
imp:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 19h16"/>',
adm:'<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
home:'<path d="M3 11.5L12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M10 20v-5h4v5"/>',
bell:'<path d="M6 8a6 6 0 0112 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 004 0"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
chev:'<path d="M15 6l-6 6 6 6"/>',
list:'<path d="M4 6h16M4 12h16M4 18h16"/>',
grid:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
chat:'<path d="M21 12a8 8 0 01-11.5 7.2L4 20l1-4.5A8 8 0 1121 12z"/>',
warn:'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h0"/>',
ok:'<path d="M5 12.5l4.5 4.5L19 7"/>',
x:'<path d="M6 6l12 12M18 6L6 18"/>',
star:'<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9z"/>',
check:'<path d="M5 12.5l4.5 4.5L19 7"/>',
lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
palette:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 9v12"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
hg:'<path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/>',
user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6.5 8-6.5s8 2.5 8 6.5"/>',
undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>'};
const svg=(k,n=20)=>`<svg class="ic" width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[k]||P.grid}</svg>`;
window.svg=svg;
const st=document.createElement('style');st.textContent=`
body{background:var(--bg)}
header{border-bottom:0;box-shadow:0 1px 4px #0002}
#nav{background:rgba(0,0,0,.14)}
#nav button{border-radius:0;font-weight:600}
#mods button{border-radius:6px}
.bc{display:flex;gap:6px;align-items:center;flex-wrap:wrap;font-size:13px;color:var(--m);margin:-4px 0 10px}
.bc a{color:var(--p);cursor:pointer;font-weight:700}.bc a:hover{text-decoration:underline}.bc b{color:var(--t)}
.box{border-radius:8px;box-shadow:0 1px 2px #0001}
th{background:var(--s);color:var(--t);border-bottom:2px solid var(--l);font-weight:700}
th.sq,td.sq,td.sqx{width:42px;min-width:42px;text-align:center;color:var(--m);font-variant-numeric:tabular-nums}tbody{counter-reset:rn}tbody tr:not([hidden]) td.sq::before{counter-increment:rn;content:counter(rn)}th.sr{cursor:pointer;user-select:none}th.sr:hover{background:var(--l)}th.sr::after{content:' ⇅';opacity:.35;font-size:11px}th.sr.asc::after{content:' ▲';opacity:1}th.sr.dsc::after{content:' ▼';opacity:1}
tbody tr:nth-child(even){background:transparent}tbody tr:hover{background:var(--s)}
.b{border-radius:6px}
.st{border-radius:4px;border:0;background:color-mix(in srgb,var(--p) 14%,transparent);color:var(--p)}
.lst{margin:4px 2px 0;color:var(--m);font-size:12px}
.vs{display:inline-flex;border:1px solid var(--l);border-radius:6px;overflow:hidden}.vs button{background:var(--c);color:var(--t);border:0;padding:3px 10px;cursor:pointer;font:inherit}.vs button.on{background:var(--p);color:#fff}
.kb{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}
.kc{background:var(--c);border:1px solid var(--l);border-radius:8px;padding:10px 12px;border-inline-start:4px solid var(--a);box-shadow:0 1px 2px #0001;display:flex;flex-direction:column;gap:3px}
.kc .t{font-weight:800;color:var(--p)}.kc .s{font-weight:600}.kc .r{display:flex;justify-content:space-between;gap:8px;font-size:12.5px}.kc .r span:first-child{color:var(--m)}.kc .f{margin-top:6px;border-top:1px solid var(--l);padding-top:6px}
.apps{display:flex;flex-wrap:wrap;justify-content:center;gap:18px;max-width:900px;margin:30px auto}.apps .app{width:130px}
.app{background:none;border:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:8px;font:inherit;color:var(--t);padding:12px 6px;border-radius:12px}
.app:hover{background:var(--c);box-shadow:0 2px 10px #0002}
.app i{font-style:normal;font-size:34px;width:74px;height:74px;display:grid;place-items:center;border-radius:18px;background:linear-gradient(135deg,var(--p),color-mix(in srgb,var(--p) 55%,#000));box-shadow:0 3px 8px #0003}
.app b{font-size:13.5px;position:relative}.app em{position:absolute;top:-8px;inset-inline-end:-18px;font-style:normal;background:#c0392b;color:#fff;border-radius:99px;padding:0 6px;font-size:11px}
.hello{text-align:center;color:var(--m);margin-top:24px}
.sbar{grid-column:1/-1;display:flex;gap:0;border:1px solid var(--l);border-radius:6px;overflow:hidden;margin-bottom:2px}
.sbar span{flex:1;text-align:center;padding:5px 8px;font-size:12.5px;background:var(--c);color:var(--m);border-inline-end:1px solid var(--l);white-space:nowrap}
.sbar span.on{background:var(--p);color:#fff;font-weight:800}.sbar span.bad{background:#b3261e;color:#fff;font-weight:800}
.chat{grid-column:1/-1;border-top:2px solid var(--l);padding-top:8px;margin-top:6px}
.chat h4{margin:0 0 6px;color:var(--p)}
.chat .nw{display:flex;gap:6px;align-items:flex-start}.chat textarea{flex:1}
.chat .it{display:flex;gap:8px;margin:8px 0;align-items:flex-start}
.chat .av2{width:30px;height:30px;border-radius:50%;background:var(--p);color:#fff;display:grid;place-items:center;font-weight:800;flex:none}
.chat .it.lg2 .av2{background:var(--l);color:var(--m)}.chat .it.lg2{opacity:.8;font-size:12.5px}
.chat .mt{font-size:11.5px;color:var(--m)}
.cmd{grid-column:1/-1}.cmd .ci{padding:7px 10px;border-radius:6px;cursor:pointer;display:flex;justify-content:space-between}.cmd .ci.on,.cmd .ci:hover{background:var(--p);color:#fff}.cmd .ci small{opacity:.7}
`;st.textContent+=`

:root{--hh:54px;--sw:250px}
header{position:sticky;top:0}
#hb{min-height:var(--hh);padding-block:6px}
#hb .ib{display:inline-flex;align-items:center;gap:4px;padding:5px 9px}
#hb b{letter-spacing:.2px}
header #mods,header #nav{display:none}
#shell{display:flex;align-items:flex-start;min-height:calc(100vh - var(--hh))}
#shell>main{flex:1;min-width:0}
#side{width:var(--sw);flex:none;position:sticky;top:var(--hh);height:calc(100vh - var(--hh));overflow-y:auto;background:var(--c);border-inline-end:1px solid var(--l);padding:10px 8px;display:flex;flex-direction:column;gap:2px}
#side[hidden]{display:none}
body.sb-off #side{display:none}
#side #mods{display:flex;flex-direction:column;gap:2px;padding:0}
#side .mi{display:flex;align-items:center;gap:10px;width:100%;background:none;border:0;border-radius:8px;padding:9px 12px;font:inherit;font-weight:700;color:var(--t);cursor:pointer;text-align:start}
#side .mi:hover{background:var(--s)}
#side .mi .ic{color:var(--p);flex:none}
#side .mi>.ic:last-child{margin-inline-start:auto;opacity:.45;transition:transform .15s;width:14px}
#side .mi.on{background:var(--s);color:var(--p)}
#side .mi.on>.ic:last-child{transform:rotate(-90deg);opacity:.9}#side .mi.on.fold>.ic:last-child{transform:none}
#side .mi.hm.on{background:var(--p);color:#fff}#side .mi.hm.on .ic{color:#fff}
#side #nav[hidden]{display:none}
#side #nav{display:flex;flex-direction:column;gap:1px;overflow:visible;padding:2px 0 8px;margin-inline-start:20px;border-inline-start:2px solid var(--l);background:none}
#side #nav button{background:none;border:0;border-radius:6px;opacity:1;color:var(--t);padding:6px 12px;font:inherit;font-weight:500;cursor:pointer;text-align:start;white-space:normal;margin-inline-start:6px;position:relative}
#side #nav button:hover{background:var(--s)}
#side #nav button.on{background:var(--p);color:#fff;font-weight:700}
#side #nav button.on::before{content:'';position:absolute;inset-inline-start:-9px;top:50%;width:8px;height:8px;margin-top:-4px;border-radius:50%;background:var(--a)}
.ic{vertical-align:middle}
.app i{background:var(--p);box-shadow:0 2px 6px #0002;color:#fff}
.app:hover i{background:color-mix(in srgb,var(--p) 85%,#000)}
.vs button{display:inline-flex;align-items:center}
@media(max-width:899px){#side{position:fixed;top:var(--hh);inset-inline-start:0;z-index:30;height:calc(100vh - var(--hh));box-shadow:0 8px 24px #0004}}
`;st.textContent+=`
:root{--pt:var(--p)}
@media(prefers-color-scheme:dark){:root:not([data-theme=light]){--pt:color-mix(in srgb,var(--p) 40%,#fff)}}
:root[data-theme=dark]{--pt:color-mix(in srgb,var(--p) 40%,#fff)}
.box h3,.tb h2,.card h2,.bc a,.kc .t,.chat h4,.tbm summary,.lg h2,.sub b{color:var(--pt)}
#side .mi .ic,#side .mi.on{color:var(--pt)}
#side .mi.hm.on,#side .mi.hm.on .ic,#side #nav button.on{color:#fff}
.st{color:var(--pt)}
.b.o{color:var(--pt);border-color:var(--pt)}
.card h2{color:var(--pt)}
`;document.head.appendChild(st);

const modTitle=k=>MODS[k]?MODS[k].title:'';
const navOf=k=>{const keep=mod;try{return MODS[k].nav().filter(n=>tl(n[0])!=='x')}finally{}};
const pending=k=>{try{
  if(k==='ap')return (D.ap&&D.ap.n)||0;
  if(k==='proc'&&['admin','approver'].includes(D.user.role))return D.pr.filter(p=>p.st==='جديد').length;
  if(k==='acc'&&D.acc&&D.acc.je)return D.acc.je.filter(j=>j.st==='مسودة').length;
  if(k==='hr'&&D.hr)return D.hr.leaves.filter(l=>l.st==='معلقة').length;
  if(k==='mfg'&&D.mfg&&D.mfg.orders&&['admin','manager'].includes(D.mfg.role))return D.mfg.orders.filter(x=>x.st==='مسودة').length;
}catch(e){}return 0};

/* ---------- الرئيسية: شاشة التطبيقات ---------- */
A.home=()=>{UX.home=true;render()};
const launcher=()=>{const ks=avMods();
  return `<div class="hello">${esc(D.user.name)} — اختر التطبيق</div><div class="apps">${ks.map(k=>{const n=pending(k);return `<button class="app" data-a="mod" data-i="${k}"><i>${svg(k,30)}</i><b>${esc(modTitle(k))}${n?`<em>${n}</em>`:''}</b></button>`}).join('')}</div>`};

{const o=A.mod;A.mod=k=>{if(!UX.home&&k===mod&&view)UX.fold=!UX.fold;else UX.fold=false;UX.home=false;o(k)}}
{const o=A.go;A.go=i=>{UX.home=false;UX.fold=false;o(i)}}

/* ---------- تغليف render ---------- */
const crumb=()=>{const nav=navOf(mod),cur=(nav.find(n=>n[0]==view)||[])[1];
  return `<div class="bc"><a data-a="home">الرئيسية</a>›<a data-a="mod" data-i="${mod}">${esc(modTitle(mod))}</a>${cur?`›<b>${esc(cur)}</b>`:''}</div>`};
const num=s=>{const x=String(s).replace(/[,\s%]/g,'');return x!==''&&!isNaN(x)?+x:NaN};
/* عمود تسلسل «م»: يُضاف تلقائيًا لكل جدول قائمة. الترقيم بعدّاد CSS فيتحدّث وحده مع البحث والفرز */
const SEQ_SKIP=['#','م','الصف','التسلسل','مسلسل','ت'];
const addSeq=t=>{
  if(!t.tHead||!t.tBodies[0]||t.dataset.noseq!==undefined)return;
  const hr=t.tHead.rows[0],n0=hr.cells.length;if(!n0||SEQ_SKIP.includes(hr.cells[0].textContent.trim()))return;
  const rows=[...t.tBodies[0].rows];
  if(!rows.some(r=>r.cells.length===n0&&!r.classList.contains('tot')))return;
  const th=document.createElement('th');th.className='sq';th.textContent='م';hr.insertBefore(th,hr.cells[0]);
  rows.forEach(r=>{
    if(r.cells.length===n0){const td=document.createElement('td');td.className=r.classList.contains('tot')?'sqx':'sq';r.insertBefore(td,r.cells[0])}
    else if(r.cells.length===1&&r.cells[0].colSpan>1)r.cells[0].colSpan+=1;
  });
};
const sortable=root=>{root.querySelectorAll('table').forEach(t=>{
  if(t.dataset.ux||t.closest('.pm'))return;t.dataset.ux=1;addSeq(t);
  const th=[...t.tHead?t.tHead.rows[0].cells:[]];
  th.forEach((h,ci)=>{if(!h.textContent.trim()||h.classList.contains('sq'))return;h.classList.add('sr');h.onclick=()=>{
    const asc=!h.classList.contains('asc');th.forEach(x=>x.classList.remove('asc','dsc'));h.classList.add(asc?'asc':'dsc');
    const tb=t.tBodies[0],rows=[...tb.rows].filter(r=>!r.classList.contains('tot')&&r.cells.length===th.length),tot=[...tb.rows].filter(r=>!rows.includes(r));
    const val=r=>r.cells[ci].textContent.trim();
    rows.sort((a,b)=>{const x=val(a),y=val(b),nx=num(x),ny=num(y);const c=(!isNaN(nx)&&!isNaN(ny))?nx-ny:x.localeCompare(y,'ar');return asc?c:-c});
    rows.concat(tot).forEach(r=>tb.appendChild(r));}});
  const n=t.tBodies[0]?[...t.tBodies[0].rows].filter(r=>r.cells.length===th.length).length:0;
  if(n>0&&t.parentElement&&!t.parentElement.querySelector('.lst'))t.insertAdjacentHTML('afterend','<div class="lst">'+n+' سجل</div>')})};

/* ---------- فلتر الفترة (من / إلى) لأي جدول فيه عمود تاريخ ---------- */
const DF={};
const dIso=t=>{let m=String(t).match(/(\d{4})-(\d{2})-(\d{2})/);if(m)return m[1]+'-'+m[2]+'-'+m[3];m=String(t).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);return m?m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0'):''};
const dfApply=(t,from,to,col)=>{let n=0,tot=0;[...(t.tBodies[0]?t.tBodies[0].rows:[])].forEach(r=>{if(r.classList.contains('tot')||r.cells.length<=col)return;tot++;const d=dIso(r.cells[col].textContent);
    const out=(from||to)&&(!d||(from&&d<from)||(to&&d>to));if(out)r.dataset.dr='1';else{delete r.dataset.dr;n++}});
  const l=t.parentElement&&t.parentElement.querySelector('.lst');if(l)l.textContent=((from||to)?n+' من '+tot:tot)+' سجل'};
const dateFilter=root=>{(root||document).querySelectorAll('#v table').forEach(t=>{
  if(t.dataset.df||t.closest('.pm,#dzbar')||!t.tHead||!t.tBodies[0])return;
  const th=[...t.tHead.rows[0].cells];let col=th.findIndex(h=>/^\s*(التاريخ|الوقت|تاريخ)\s*$/.test(h.textContent.replace(/[⇅↑↓▲▼↕]/g,'')));
  if(col<0)col=th.findIndex(h=>/التاريخ|تاريخ|الوقت/.test(h.textContent));
  const rows=[...t.tBodies[0].rows].filter(r=>!r.classList.contains('tot')&&r.cells.length===th.length);
  if(col<0||rows.length<2||!rows.some(r=>dIso(r.cells[col].textContent)))return;
  t.dataset.df=1;const key=(typeof view==='string'?view:'')+'|'+th.map(h=>h.textContent.trim()).join(',').slice(0,80),st=DF[key]||(DF[key]={f:'',t:''});
  const bar=document.createElement('div');bar.className='dfb';
  bar.innerHTML=`<span>الفترة:</span><label>من <input type="date" class="dff" value="${st.f}"></label><label>إلى <input type="date" class="dft" value="${st.t}"></label><button type="button" class="b s o dfx">كل الفترات</button><span class="mu dfc">${esc(th[col].textContent.replace(/[⇅↑↓▲▼↕]/g,'').trim())}</span>`;
  t.parentElement.insertBefore(bar,t);
  const go=()=>{st.f=bar.querySelector('.dff').value;st.t=bar.querySelector('.dft').value;dfApply(t,st.f,st.t,col)};
  bar.addEventListener('change',go);bar.querySelector('.dfx').onclick=()=>{bar.querySelector('.dff').value='';bar.querySelector('.dft').value='';go()};
  if(st.f||st.t)go()})};
{const st=document.createElement('style');st.textContent='tr[data-dr="1"]{display:none}.dfb{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:0 0 10px;padding:8px 12px;background:var(--s);border:1px solid var(--l);border-radius:10px;font-size:13px}.dfb label{display:flex;align-items:center;gap:6px;font-weight:600;color:var(--m)}.dfb input{width:auto;padding:4px 8px}.dfc{margin-inline-start:auto}';document.head.appendChild(st)}
{let tm=0;const run=()=>{clearTimeout(tm);tm=setTimeout(()=>{try{dateFilter()}catch(e){}},120)};
 const v=document.getElementById('v');if(v)new MutationObserver(run).observe(v,{childList:true,subtree:true})}
const toKanban=(t)=>{const th=[...t.tHead.rows[0].cells].map(h=>h.textContent.replace(/[⇅▲▼]/g,'').trim());
  const rows=[...t.tBodies[0].rows].filter(r=>r.cells.length===th.length);
  const last=th.length-1,hasAct=!th[last];
  return '<div class="kb">'+rows.map(r=>{const c=[...r.cells];let h='<div class="kc"><div class="t">'+c[0].innerHTML+'</div>';
    if(c[1])h+='<div class="s">'+c[1].innerHTML+'</div>';
    for(let i=2;i<(hasAct?last:th.length);i++){if(th[i]&&c[i].textContent.trim())h+='<div class="r"><span>'+esc(th[i])+'</span><span>'+c[i].innerHTML+'</span></div>'}
    if(hasAct&&c[last].innerHTML.trim())h+='<div class="f">'+c[last].innerHTML+'</div>';return h+'</div>'}).join('')+'</div>'};
const viewSwitch=root=>{const box=root.querySelector('.box>table');if(!box)return;const t=box,tb=root.querySelector('.tb');
  if(!tb||tb.querySelector('.vs')||!t.tHead||t.tHead.rows[0].cells.length<4||t.tBodies[0].rows.length<2)return;
  const key=mod+'/'+view,on=UX.kb[key];
  const sw=document.createElement('span');sw.className='vs';sw.innerHTML=`<button class="${on?'':'on'}" data-a="uxv" data-i="0" title="قائمة">${svg('list',16)}</button><button class="${on?'on':''}" data-a="uxv" data-i="1" title="بطاقات">${svg('grid',16)}</button>`;
  tb.appendChild(sw);
  if(on){const k=document.createElement('div');k.innerHTML=toKanban(t);t.style.display='none';t.parentElement.querySelector('.lst')&&(t.parentElement.querySelector('.lst').style.display='none');t.insertAdjacentElement('afterend',k.firstChild)}};
A.uxv=i=>{UX.kb[mod+'/'+view]=i==='1';render()};

const side=document.createElement('aside');side.id='side';side.hidden=true;
const shell=document.createElement('div');shell.id='shell';
const mainEl=$('#v');mainEl.parentNode.insertBefore(shell,mainEl);shell.append(side,mainEl);
const holder=document.createElement('div');holder.id='navh';holder.hidden=true;document.body.appendChild(holder);
side.innerHTML='<button class="mi hm" data-a="home">'+svg('home')+'الرئيسية</button>';
side.appendChild($('#mods'));holder.appendChild($('#nav'));
const sbKey='gh_sb';const sbOff=()=>{try{const v=localStorage.getItem(sbKey);return v==null?innerWidth<900:v==='1'}catch(e){return innerWidth<900}};
const applySb=()=>document.body.classList.toggle('sb-off',sbOff());
A.sbt=()=>{const v=!sbOff();try{localStorage.setItem(sbKey,v?'1':'0')}catch(e){}applySb()};
{const o=render;window.render=function(){const nv=$('#nav');if(nv&&nv.parentNode!==holder)holder.appendChild(nv);o();
  if(!D.user||!API_URL){side.hidden=true;return}
  side.hidden=false;applySb();
  const hb=$('#hb');
  if(hb&&!hb.querySelector('[data-a=sbt]')){hb.insertAdjacentHTML('afterbegin','<button class="b s h ib" data-a="sbt" title="القائمة الجانبية">'+svg('menu')+'</button>');
    const sp=hb.querySelector('span[style*="flex:1"]');if(sp){sp.style.flex='0';sp.insertAdjacentHTML('afterend','<div class="gsb"><span class="gsi">'+svg('search',16)+'</span><input id="gsq" type="search" placeholder="ابحث عن أي شاشة أو إجراء… (Ctrl+K)" autocomplete="off" aria-label="بحث سريع"><div id="gsr" class="gsr" hidden></div></div>')}}
  const bl=hb&&hb.querySelector('[data-a=bell]');if(bl&&!bl.querySelector('svg'))bl.innerHTML=svg('bell',18)+(D.unread?' <b class="bn">'+D.unread+'</b>':'');if(bl)bl.classList.add('ib');
  const ks=avMods(),nav=$('#nav');
  $('#mods').innerHTML=ks.map(k=>{const on=!UX.home&&k==mod;return `<button class="mi ${on?'on':''}" data-a="mod" data-i="${k}">${svg(k)}${esc(modTitle(k))}${svg('chev',14)}</button>`}).join('');
  side.querySelector('.hm').classList.toggle('on',UX.home);
  if(UX.home){nv&&(nv.innerHTML='');$('#v').innerHTML=launcher();return}
  const on=$('#mods button.on');if(on&&nv){nv.hidden=!!UX.fold;on.after(nv);on.classList.toggle('fold',!!UX.fold)}
  const v=$('#v');if(!v.querySelector('.bc'))v.insertAdjacentHTML('afterbegin',crumb());
  viewSwitch(v);sortable(v);
  if(innerWidth<900&&!document.body.classList.contains('sb-off')&&window.__sbc)document.body.classList.add('sb-off')}}
document.addEventListener('click',e=>{if(innerWidth<900&&e.target.closest('#side button[data-a=go],#side button[data-a=home]')){try{localStorage.setItem(sbKey,'1')}catch(x){}applySb()}},true);

/* ---------- شريط الحالة في المستندات ---------- */
const sbar=(flow,cur,bad)=>`<div class="sbar">${flow.map(s=>`<span class="${s===cur?'on':''}">${s}</span>`).join('')}${bad?`<span class="bad">${esc(bad)}</span>`:''}</div>`;
const wrapView=(name,key,flow,badSt)=>{const o=A[name];if(!o)return;A[name]=i=>{o(i);const x=(D[key]||[]).find(r=>r.id==i);if(!x)return;const bad=badSt.includes(x.st)?x.st:'';
  const flow2=flow.includes(x.st)||bad?flow:flow.concat([x.st]);$('#mb').insertAdjacentHTML('afterbegin',sbar(flow2,x.st,bad))}};
wrapView('vpr','pr',['جديد','معتمد','محوّل'],['مرفوض']);
wrapView('vpo','po',['مسودة','معتمد','مستلم جزئيًا','مستلم','مدفوع'],['ملغي']);

/* ---------- سجل النقاش (Chatter) ---------- */
const ini=n=>esc((String(n||'?').trim()[0]||'?'));
const chatLoad=async()=>{const a=$('#mb .att[data-k]'),c=$('#mb .chat');if(!a||!c)return;
  try{const j=await api('noteList',{kind:a.dataset.k,ref:a.dataset.r});
    c.querySelector('.cl').innerHTML=j.items.length?j.items.map(x=>`<div class="it ${x.t==='log'?'lg2':''}"><div class="av2">${x.t==='log'?svg('gear',16):ini(x.byName)}</div><div><div class="mt"><b>${esc(x.byName||'')}</b> · ${esc(String(x.at).replace('T',' ').slice(0,16))}${x.t==='note'&&(x.by===D.user.username||D.user.role==='admin')?` · <a style="cursor:pointer;color:#b3261e" data-a="chdel" data-i="${esc(x.id)}">حذف</a>`:''}</div><div>${esc(x.text)}</div></div></div>`).join(''):'<div class="mu">لا توجد ملاحظات بعد.</div>'}
  catch(e){c.querySelector('.cl').innerHTML='<div class="mu">'+esc(e.message)+'</div>'}};
A.chsend=async()=>{const a=$('#mb .att[data-k]'),ta=$('#mb .chat textarea');if(!a||!ta)return;const text=ta.value.trim();if(!text){toast('اكتب الملاحظة',1);return}
  try{await api('noteAdd',{kind:a.dataset.k,ref:a.dataset.r,text});ta.value='';chatLoad()}catch(e){toast(e.message,1)}};
A.chdel=async i=>{if(!confirm('حذف الملاحظة؟'))return;try{await api('noteDel',{id:i});chatLoad()}catch(e){toast(e.message,1)}};
{const o=window.mdl;window.mdl=function(){o.apply(this,arguments);
  const a=$('#mb .att[data-k]');if(a&&!$('#mb .chat')){a.insertAdjacentHTML('afterend',`<div class="chat"><h4>${svg('chat',16)} النقاش والسجل</h4>${tl(view)==='r'?'':'<div class="nw"><textarea rows="2" placeholder="اكتب ملاحظة…"></textarea><button type="button" class="b s" data-a="chsend">إرسال</button></div>'}<div class="cl mu">جارٍ التحميل…</div></div>`);chatLoad()}}}

/* ---------- لوحة الأوامر: بحث سريع عن أي شاشة ---------- */
A.cmd=()=>{const all=[];avMods().forEach(k=>navOf(k).forEach(n=>all.push({k,v:n[0],t:n[1],m:modTitle(k)})));
  mdl('بحث سريع',`<div class="cmd"><input id="cmdq" placeholder="اكتب اسم الشاشة… (↵ للفتح)" autocomplete="off"><div id="cml" style="margin-top:8px;max-height:50vh;overflow:auto"></div></div>`,null);
  let sel=0,cur=[];const draw=()=>{const q=$('#cmdq').value.trim();cur=all.filter(x=>!q||(x.t+' '+x.m).includes(q)).slice(0,30);sel=Math.min(sel,Math.max(0,cur.length-1));
    $('#cml').innerHTML=cur.map((x,i)=>`<div class="ci ${i==sel?'on':''}" data-a="cmdgo" data-i="${i}"><span>${esc(x.t)}</span><small>${esc(x.m)}</small></div>`).join('')||'<div class="mu">لا نتائج</div>'};
  A.cmdgo=i=>{const x=cur[+i];if(!x)return;dlg.close();UX.home=false;mod=x.k;view=x.v;LASTV[x.k]=x.v;render()};
  draw();const q=$('#cmdq');q.focus();q.oninput=()=>{sel=0;draw()};
  q.onkeydown=e=>{if(e.key==='ArrowDown'){sel=Math.min(sel+1,cur.length-1);draw();e.preventDefault()}else if(e.key==='ArrowUp'){sel=Math.max(sel-1,0);draw();e.preventDefault()}else if(e.key==='Enter'){A.cmdgo(sel)}}};
/* ---------- مربع البحث العام في أعلى الشاشة (نتائج فورية عن أي شاشة متاحة للمستخدم) ---------- */
let GSC=[],GSS=0;
const gsDraw=()=>{const q=$('#gsq'),r=$('#gsr');if(!q||!r)return;const t=q.value.trim(),all=[];avMods().forEach(k=>navOf(k).forEach(n=>all.push({k,v:n[0],t:n[1],m:modTitle(k)})));
  GSC=all.filter(x=>!t||(x.t+' '+x.m).includes(t)).slice(0,12);GSS=Math.min(GSS,Math.max(0,GSC.length-1));
  r.innerHTML=GSC.map((x,i)=>`<div class="ci ${i==GSS?'on':''}" data-gs="${i}"><span>${esc(x.t)}</span><small>${esc(x.m)}</small></div>`).join('')||'<div class="mu" style="padding:10px">لا نتائج</div>';r.hidden=false};
const gsGo=i=>{const x=GSC[+i];if(!x)return;const q=$('#gsq'),r=$('#gsr');if(r)r.hidden=true;if(q){q.value='';q.blur()}UX.home=false;mod=x.k;view=x.v;LASTV[x.k]=x.v;render()};
document.addEventListener('input',e=>{if(e.target&&e.target.id==='gsq'){GSS=0;gsDraw()}});
document.addEventListener('focusin',e=>{if(e.target&&e.target.id==='gsq')gsDraw()});
document.addEventListener('keydown',e=>{const q=$('#gsq');if(q&&e.target===q){if(e.key==='ArrowDown'){GSS=Math.min(GSS+1,GSC.length-1);gsDraw();e.preventDefault()}else if(e.key==='ArrowUp'){GSS=Math.max(GSS-1,0);gsDraw();e.preventDefault()}else if(e.key==='Enter'){gsGo(GSS);e.preventDefault()}else if(e.key==='Escape'){$('#gsr').hidden=true;q.blur()}}});
document.addEventListener('mousedown',e=>{const c=e.target.closest&&e.target.closest('[data-gs]');if(c){e.preventDefault();gsGo(c.dataset.gs);return}const r=$('#gsr');if(r&&!r.hidden&&!(e.target.closest&&e.target.closest('.gsb')))r.hidden=true});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'&&D.user){e.preventDefault();const q=$('#gsq');if(q){q.focus();q.select()}else A.cmd()}});

/* ---- تحويل الرموز النصية (⚠ ✔ ✘ ⭐ ⏰ ⏳ 👤 ↩) إلى أيقونات خطية موحّدة ---- */
const SYM={'⚠':['warn','iw'],'✔':['ok','io'],'✘':['x','ie'],'✕':['x','ie'],'⭐':['star','is'],'⏰':['clock','iw'],'⏳':['hg','iw'],'👤':['user','im'],'↩':['undo','im']};
const SRX=/[⚠✔✘✕⭐⏰⏳👤↩]️?/gu,SKIP=/^(SCRIPT|STYLE|TEXTAREA|OPTION|TITLE)$/;
const decoStyle=document.createElement('style');decoStyle.textContent='.si{display:inline-block;vertical-align:-3px;line-height:0}.si.iw{color:#c77700}.si.io{color:var(--ok)}.si.ie{color:#c0392b}.si.is{color:#d9a21b}.si.im{color:var(--mu,#667)}:root[data-theme=dark] .si.iw{color:#e8b04a}:root[data-theme=dark] .si.io{color:#4cc38a}:root[data-theme=dark] .si.ie{color:#ff7b6b}';document.head.appendChild(decoStyle);
const deco=(root)=>{if(!root)return;if(root.nodeType===3){root=root.parentNode;if(!root)return}
 if(root.nodeType!==1||SKIP.test(root.tagName))return;
 const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>SRX.test(n.nodeValue)&&(SRX.lastIndex=0,!SKIP.test(n.parentNode.tagName))?NodeFilter.FILTER_ACCEPT:(SRX.lastIndex=0,NodeFilter.FILTER_REJECT)});
 const list=[];while(w.nextNode())list.push(w.currentNode);
 list.forEach(n=>{const t=n.nodeValue,f=document.createDocumentFragment();let last=0,m;SRX.lastIndex=0;
  while((m=SRX.exec(t))){f.appendChild(document.createTextNode(t.slice(last,m.index)));const d=SYM[[...m[0]][0]],sp=document.createElement('span');sp.className='si '+d[1];sp.innerHTML=svg(d[0],15);f.appendChild(sp);last=m.index+m[0].length}
  f.appendChild(document.createTextNode(t.slice(last)));n.parentNode.replaceChild(f,n)})};
let pend=new Set(),tm=0;
new MutationObserver(ms=>{ms.forEach(m=>m.addedNodes.forEach(n=>pend.add(n)));if(!tm)tm=requestAnimationFrame(()=>{tm=0;const a=[...pend];pend=new Set();a.forEach(deco)})}).observe(document.body,{childList:true,subtree:true});
deco(document.body);
})();
