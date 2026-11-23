/* =====================================================================
   طبقة تجربة الاستخدام (على نمط تطبيقات ERP الحديثة): شاشة التطبيقات، مسار التنقل، القوائم القابلة للترتيب،
   عرض البطاقات (Kanban)، شريط الحالة، سجل النقاش (Chatter) على السجلات، لوحة الأوامر (Ctrl+K)
   لا تغيّر البيانات ولا الصلاحيات — طبقة عرض فقط فوق الشاشات الموجودة
   ===================================================================== */
(()=>{
const UX={home:(()=>{try{return localStorage.getItem('gh_home')!=='0'}catch(e){return true}})(),kb:{}};
window.UX=UX;
const P={
edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
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
`;st.textContent+=`
/* ===== طبقة التنسيق الموحّدة (أحجام وسلوك موحّد لكل الشاشات والنوافذ والخيارات) ===== */
:root{--ch:36px}
/* كل الخانات بارتفاع واحد وحدود وتركيز موحّدين (نص، رقم، تاريخ، قائمة، بحث منسدل) */
input:not([type=checkbox]):not([type=radio]):not([type=color]):not([type=range]):not([type=file]):not(.bk):not(.dz),select{min-height:var(--ch);line-height:1.35;font-size:14px}
textarea{min-height:72px;line-height:1.5;font-size:14px;resize:vertical}
input[type=color]{min-height:var(--ch);height:var(--ch)}
input[type=file]{padding:4px 6px;font-size:13px}
select:not([multiple]){-webkit-appearance:none;appearance:none;padding-inline-end:28px;background:var(--c) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E") no-repeat left 9px center;cursor:pointer;text-overflow:ellipsis}
select[multiple]{min-height:96px;padding:4px}
select:disabled,input:disabled,textarea:disabled{opacity:.6;cursor:not-allowed}
input:focus,select:focus,textarea:focus,.ss>input:focus{outline:none;border-color:var(--p);box-shadow:0 0 0 3px color-mix(in srgb,var(--p) 22%,transparent)}
input[type=number]{-moz-appearance:textfield;appearance:textfield;font-variant-numeric:tabular-nums}
input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
::placeholder{color:var(--m);opacity:.75}
.db label,.lg label{margin-bottom:3px;line-height:1.4}
/* أزرار بحجم موحّد */
.b{min-height:34px;display:inline-flex;align-items:center;justify-content:center;gap:6px;line-height:1.2}
.b.s{min-height:26px}
.b:focus-visible,.dtb:focus-visible{outline:2px solid var(--a);outline-offset:2px}
.b:not(:disabled):hover{filter:brightness(1.08)}
.b:not(:disabled):active{transform:translateY(1px)}
/* بطاقات المؤشرات بارتفاع متساوٍ */
.cards{grid-auto-rows:1fr}
.card{display:flex;flex-direction:column;justify-content:center;min-height:84px}
/* الجداول: رأس ثابت أثناء التمرير في الشاشات، وصفوف بارتفاع مريح */
#v .box,#v .tb{max-width:100%}
td,th{vertical-align:middle}
tbody tr:hover td{background:color-mix(in srgb,var(--p) 8%,transparent)}
/* ===== النوافذ: تمرير واحد سليم ===== */
/* سبب «السكرول» المعطوب: صفوف الشبكة كانت تنضغط فتتحول الجداول الداخلية لمنطقة تمرير صغيرة بجوار تمرير النافذة */
dialog#m .db{grid-auto-rows:max-content;min-height:0;overflow-y:auto;overflow-x:auto;overscroll-behavior:contain;scroll-padding-block:12px;scrollbar-gutter:stable}
dialog#m{overscroll-behavior:contain}
.ssl,.gsr,#cml{overscroll-behavior:contain}
html:has(dialog#m[open]){overflow:hidden}
dialog,dialog:focus,dialog:focus-visible{outline:none}
/* أغلفة الجداول داخل النافذة لا تصنع تمريرًا رأسيًا؛ التمرير الأفقي فقط عند ضيق الشاشة */
dialog#m .db>.full{max-height:none}
@media(min-width:1000px){dialog#m .db>.full{overflow:visible!important}}
@media(max-width:999px){dialog#m .db>.full{overflow-x:auto!important;overflow-y:visible;-webkit-overflow-scrolling:touch}dialog#m table[data-lg],dialog#m table#jl{min-width:820px}}
/* رأس جدول البنود يبقى ظاهرًا أثناء التمرير (بنود كثيرة) */
@media(min-width:1000px){dialog#m table[data-lg] thead th,dialog#m table#jl thead th{position:sticky;top:-14px;z-index:3;background:var(--s);box-shadow:0 1px 0 var(--l)}}
/* أيقونات داخل الأزرار تأخذ لون الزر (لا يضيع «✕» الأحمر فوق خلفية حمراء) */
.b .si{color:inherit!important}
/* خانات النموذج المتجاورة: تتحاذى من الأسفل فلا تتعرج الخانات إذا التفّ عنوان إحداها على سطرين */
dialog#m .db>div:has(>label:first-child+:is(input,select,textarea,.ss,.dtw)){display:flex;flex-direction:column;justify-content:flex-end}
/* تذييل النافذة: أزرار موحّدة العرض */
.df{align-items:center}
.df .b{min-width:92px}
@media(max-width:700px){.df .b{flex:1 1 40%}#dfx{gap:6px 10px}}
/* على الجوال: حقول النماذج بعرض كامل وحجم لمس مريح */
@media(max-width:700px){dialog#m .db,.dlgx .db{grid-template-columns:minmax(0,1fr);padding:12px}dialog#m .db>*{grid-column:1/-1!important}dialog#m{outline:none}:root{--ch:40px}.tb>input,.tb>select{flex:1 1 100%!important;max-width:none!important}}
@media(max-width:700px){#v .tb .b{flex:1 1 auto}}
@media(prefers-reduced-motion:reduce){*{transition-duration:.01ms!important;animation-duration:.01ms!important}}
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
/* ===== النوافذ كشاشات رئيسية: تُعرض أسفل الشريط العلوي (يبقى الشريط ظاهرًا) وفي أعلاها المسار: الرئيسية ‹ المديول ‹ الشاشة ‹ العملية ===== */
const dlgHH=()=>{const h=document.querySelector('header');return h&&!h.hidden?Math.max(0,Math.round(h.getBoundingClientRect().bottom)):0};
const dlgPos=()=>{dlg.style.setProperty('--hh',dlgHH()+'px')};
const dlgCrumb=t=>{const nav=navOf(mod),cur=(nav.find(n=>n[0]==view)||[])[1];
  return `<span class="bc2"><a data-a="bcHome">الرئيسية</a><i>‹</i><a data-a="bcMod">${esc(modTitle(mod))}</a>${cur?`<i>‹</i><a data-a="bcTab">${esc(cur)}</a>`:''}<i>‹</i><b>${esc(t)}</b></span>`};
A.bcHome=()=>{dlg.close();A.home()};
A.bcMod=()=>{dlg.close();UX.home=false;const f=navOf(mod)[0];view=f?f[0]:view;render()};
A.bcTab=()=>{dlg.close();render()};
{const _mdl=window.mdl;window.mdl=function(t,body,fn,ok,forced){_mdl.apply(this,arguments);if(!forced){const mt=document.getElementById('mt');if(mt)mt.innerHTML=dlgCrumb(t);const mc=document.getElementById('mc');if(mc)mc.textContent='رجوع'}dlgPos()};addEventListener('resize',()=>{if(dlg.open)dlgPos()})}
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
  viewSwitch(v);sortable(v);try{if(window.drList)window.drList()}catch(e){console.error('drl',e)}
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

/* =====================================================================
   نوافذ النماذج:
   (1) تذييل ثابت: أي عنصر بالخاصية data-ftr داخل النموذج (زر «+ بند/سطر» ومؤشرات الإجمالي وتوازن القيد مدين/دائن)
       يُنقل إلى تذييل النافذة بجوار أزرار الحفظ فيبقى ظاهرًا أثناء تمرير البنود.
   (2) مسودة تلقائية: ما يُكتب في أي نموذج (فاتورة، قيد، سند، ...) يُحفظ في هذا المتصفح أولًا بأول، فإن خرجتَ قبل الحفظ
       يبقى كمسودة تظهر في قائمة الشاشة التي فتحتَ منها النموذج (ضمن السجلات) بحالة «مسودة» وبجانبها «متابعة» (تعيد النموذج
       بآخر حالة وصلتَ إليها) و«حذف». «+ جديد» يفتح نموذجًا فارغًا دائمًا فيمكن وجود أكثر من مسودة. تُمسح المسودة عند الحفظ
       الناجح أو بزر «حذف»، وتنتهي تلقائيًا بعد 14 يومًا. نماذج «تعديل ...» لمستند محفوظ تُسترجع بصمت عند فتحه ولا تُدرج في القائمة.
       تُحفظ قيم الحقول وصفوف جداول البنود (لا نسخة من الصفحة) فتبقى حقول التاريخ والبحث تعمل.
   ===================================================================== */
{
const FSEL='input,select,textarea',DRP='gh_draft:',DRMAX=25,DRTTL=14*864e5,DRBIG=600000;
const SKIP=/^(إلغاء|عكس|ترحيل|حذف|رفض|اعتماد|إعادة فتح|تأكيد|سداد|تحصيل)/;
const EDITRX=/تعديل|نسخ/;
let CUR=null,SEQ=0,TM=0,LAST=null,RES=null;
const who=()=>{try{return (D&&D.user&&D.user.username)||''}catch(e){return ''}};
/* ---- (1) التذييل الثابت ---- */
const dfx=()=>{let e=document.getElementById('dfx');if(!e){const df=dlg.querySelector('.df');if(!df)return null;e=document.createElement('div');e.id='dfx';df.insertBefore(e,df.firstChild)}return e};
const ftClear=()=>{const e=document.getElementById('dfx');if(e)e.innerHTML=''};
const ftPlace=()=>{const bars=dlg.querySelectorAll('#mb [data-ftr]'),e=dfx();if(!e)return;e.innerHTML='';bars.forEach(n=>e.appendChild(n))};
/* ---- (2) المسودة ---- */
const okc=e=>{const t=e.type;if(['password','file','hidden','button','submit','reset','image'].includes(t)||e.disabled)return false;
  if(e.classList.contains('dtx')||(e.tagName==='INPUT'&&e.closest('.ss')))return false;return true};
const ck=e=>{const c=(typeof e.className==='string'?e.className:'').split(/\s+/).filter(x=>x&&!/^(dtn|dtx|bad)$/.test(x))[0]||e.tagName.toLowerCase();return c+(e.dataset.k?'['+e.dataset.k+']':'')+(e.dataset.pk?'<'+e.dataset.pk+'>':'')};
const val=e=>(e.type==='checkbox'||e.type==='radio')?(e.checked?1:0):e.value;
const collect=()=>{const mb=document.getElementById('mb'),nc={},o=[];if(!mb)return o;
  mb.querySelectorAll('[name]').forEach(e=>{if(!/^(INPUT|SELECT|TEXTAREA)$/.test(e.tagName)||!okc(e))return;const n=e.name;nc[n]=(nc[n]||0)+1;o.push({e,k:n+'#'+nc[n]})});return o};
const keyed=r=>{const cnt={};return [...r.querySelectorAll(FSEL)].filter(e=>!e.name&&okc(e)).map(e=>{const k=ck(e);cnt[k]=(cnt[k]||0)+1;return{e,k:k+':'+cnt[k]}})};
const cap=()=>{const mb=document.getElementById('mb');if(!mb)return null;const f=collect().map(x=>({k:x.k,v:val(x.e),s:x.e.tagName==='SELECT'?1:0})),t={};
  mb.querySelectorAll('table').forEach((tb,ti)=>{const rows=tb.tBodies[0]?[...tb.tBodies[0].rows]:[],out=[];let any=false;
    rows.forEach(r=>{out.push(keyed(r).map(x=>{any=true;return{k:x.k,v:val(x.e),s:x.e.tagName==='SELECT'?1:0}}))});
    if(any)t[tb.id||('t'+ti)]=out});
  return{f,t}};
const fire=(e,t)=>e.dispatchEvent(new Event(t,{bubbles:true}));
const setv=(e,v,row)=>{if(e.type==='checkbox'||e.type==='radio'){const n=!!+v;if(e.checked!==n){e.checked=n;fire(e,'change')}return}
  const s=String(v);if(e.value===s)return;e.value=s;if(e.tagName==='SELECT')fire(e,'change');else if(row)fire(e,'input')};
const ADD={
  sil:()=>$('#sil tbody').insertAdjacentHTML('beforeend',window.siRowH()),
  pdl:()=>{$('#pdl tbody').insertAdjacentHTML('beforeend',window.pdRowH());if(window.piWh)window.piWh()},
  pix:()=>$('#pix tbody').insertAdjacentHTML('beforeend',window.exRowH()),
  jl:()=>window.jadd(),
  vl:()=>$('#vl tbody').insertAdjacentHTML('beforeend',window.vRowH())};
const adder=id=>{if(!id)return null;if(ADD[id])return ADD[id];
  const b=[...dlg.querySelectorAll('button[onclick]')].find(x=>(x.getAttribute('onclick')||'').includes("'#"+id));return b?()=>b.click():null};
const findTable=key=>{const mb=document.getElementById('mb');if(!mb)return null;if(/^t\d+$/.test(key))return mb.querySelectorAll('table')[+key.slice(1)]||null;return [...mb.querySelectorAll('table')].find(t=>t.id===key)||null};
const calcs=()=>{['siCalc','piCalc','jcalc','vcalc'].forEach(n=>{try{if(typeof window[n]==='function')window[n]()}catch(x){}})};
const apply=d=>{
  const pass=sel=>d.f.filter(x=>!!x.s===sel).forEach(x=>{const m=collect().find(y=>y.k===x.k);if(m)setv(m.e,x.v,false)});
  pass(true);pass(false);                       /* الحقول العامة: القوائم أولًا (قد تعيد بناء ما بعدها) ثم باقي الحقول */
  Object.keys(d.t||{}).forEach(key=>{const tb=findTable(key);if(!tb||!tb.tBodies[0])return;const rows=d.t[key],tbd=tb.tBodies[0],ad=adder(tb.id);
    if(ad){let g=0;while(tbd.rows.length<rows.length&&g++<300)ad();while(tbd.rows.length>rows.length&&tbd.rows.length>0)tbd.lastElementChild.remove()}
    rows.forEach((en,i)=>{const r=tbd.rows[i];if(!r)return;
      [true,false].forEach(sel=>en.filter(x=>!!x.s===sel).forEach(x=>{const m=keyed(r).find(y=>y.k===x.k);if(m)setv(m.e,x.v,true)}))})});
  /* ضريبة فاتورة المورد المعدّلة يدويًا لا يُعاد حسابها تلقائيًا */
  const vi=document.querySelector('#mb [name=vatAmt]'),sv=(d.f.find(x=>x.k==='vatAmt#1')||{}).v;
  calcs();
  if(vi&&sv!==undefined&&sv!==''&&String(vi.value)!==String(sv)){vi.dataset.auto='0';vi.value=sv;calcs()}
};
const load=k=>{try{const j=JSON.parse(localStorage.getItem(k)||'null');if(!j||!j.d)return null;if(Date.now()-j.at>DRTTL){localStorage.removeItem(k);return null}return j}catch(e){return null}};
const del=k=>{try{localStorage.removeItem(k)}catch(e){}};
const prune=hard=>{try{const ks=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.indexOf(DRP)===0){let at=0;try{at=JSON.parse(localStorage.getItem(k)).at||0}catch(e){}ks.push([k,at])}}
  ks.sort((a,b)=>a[0]===b[0]?0:a[1]-b[1]);const keep=hard?Math.floor(DRMAX/2):DRMAX;while(ks.length>keep)localStorage.removeItem(ks.shift()[0])}catch(e){}};
const put=(k,d,meta)=>{const s=JSON.stringify(Object.assign({at:Date.now(),d},meta||{}));if(s.length>DRBIG)return;try{localStorage.setItem(k,s)}catch(e){prune(true);try{localStorage.setItem(k,s)}catch(e2){}}prune()};
const save=()=>{if(!CUR||CUR.off)return;const s=cap();if(!s)return;if(JSON.stringify(s)===CUR.fresh)del(CUR.key);else put(CUR.key,s,CUR.meta)};
const sched=()=>{if(!CUR||CUR.off)return;clearTimeout(TM);TM=setTimeout(save,500)};
window.drClear=()=>{if(!CUR)return;clearTimeout(TM);CUR.off=true;del(CUR.key)};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const fmtAt=at=>{const d=new Date(at),p=n=>String(n).padStart(2,'0');return p(d.getDate())+'/'+p(d.getMonth()+1)+' '+p(d.getHours())+':'+p(d.getMinutes())};
/* متابعة مسودة: نعيد تشغيل الإجراء الذي فتح النموذج أصلًا (زر «+ جديد» مثلًا) ثم تُطبَّق عليه قيم المسودة عند فتحه */
A.drR=k=>{const j=load(k);if(!j||!j.op||typeof A[j.op.a]!=='function'){toast('تعذّر فتح المسودة — احذفها وابدأ من جديد',1);return}
  RES={key:k,title:j.t,op:j.op,t:Date.now()};try{const r=A[j.op.a](j.op.i);if(r&&r.catch)r.catch(e=>toast(e.message,1))}catch(e){RES=null;toast(e.message,1)}};
A.drD=k=>{if(!confirm('حذف هذه المسودة غير المحفوظة نهائيًا؟'))return;del(k);drList()};
/* ---- ظهور المسودات داخل قائمة الشاشة بحالة «مسودة» ---- */
const drItems=()=>{const me=who();if(!me||typeof mod==='undefined'||typeof view==='undefined')return[];const pre=DRP+me+':',ks=[],out=[];
  try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.indexOf(pre)===0)ks.push(k)}}catch(e){return[]}
  ks.forEach(k=>{const j=load(k);if(!j||!j.t||!j.op||j.m!==mod||j.w!==view||EDITRX.test(j.t))return;
    if(dlg.open&&CUR&&CUR.key===k)return;out.push({k,j})});
  return out.sort((a,b)=>b.j.at-a.j.at)};
const drBtns=k=>btn('drR',k,'متابعة','g')+' '+btn('drD',k,'حذف','r');
const drTxt=it=>'<span style="color:var(--p)">'+svg('edit',15)+'</span> <b>'+esc(it.j.t)+'</b><br><small class="mu">لم يُحفظ بعد · آخر تعديل '+fmtAt(it.j.at)+'</small>';
const drDate=j=>((j.d&&j.d.f||[]).find(x=>x.k==='date#1')||{}).v||'';
function drList(){
  const v=document.getElementById('v');if(!v)return;
  v.querySelectorAll('tr.drrow,.drbox').forEach(n=>n.remove());
  v.querySelectorAll('tr[data-drph]').forEach(r=>{r.hidden=false;r.removeAttribute('data-drph')});
  if(typeof UX!=='undefined'&&UX.home)return;
  const items=drItems();if(!items.length)return;
  const clean=h=>h.textContent.replace(/[⇅↑↓▲▼↕]/g,'').trim();
  const tabs=[...v.querySelectorAll('table')].filter(t=>t.tHead&&t.tBodies[0]&&t.tHead.rows[0]&&!t.closest('.pm,.drbox')&&t.getClientRects().length);
  const t=tabs.find(x=>[...x.tHead.rows[0].cells].some(h=>clean(h)==='الحالة'));
  if(!t){                                   /* شاشة بلا جدول فيه عمود «الحالة»: صندوق مستقل أعلى الشاشة */
    const box=document.createElement('div');box.className='box drbox';
    box.innerHTML='<h3>مسودات غير محفوظة</h3>'+tbl(['المسودة','آخر تعديل','الحالة',''],items.map(it=>[drTxt(it),fmtAt(it.j.at),'<span class="st">مسودة</span>',drBtns(it.k)]));
    const tb=v.querySelector(':scope > .tb');if(tb)tb.after(box);else v.prepend(box);return}
  const ths=[...t.tHead.rows[0].cells],H=ths.map(clean),sq=ths.map(h=>h.classList.contains('sq')),n=H.length,last=n-1;
  const iSt=H.indexOf('الحالة'),iNo=H.findIndex((h,i)=>!sq[i]&&/^(الرقم|رقم|الكود|كود)/.test(h)),iDt=H.findIndex((h,i)=>!sq[i]&&/^(التاريخ|تاريخ)/.test(h));
  const iAct=(!sq[last]&&last!==iSt&&/^(إجراءات|الإجراءات|إجراء)?$/.test(H[last]))?last:-1;
  let iTx=H.findIndex((h,i)=>!sq[i]&&i!==iAct&&/^(البيان|الوصف|الاسم|الصنف|البند|الغرض|ملاحظات|العميل|المورد|المستند|التفاصيل|الموضوع|العنوان)/.test(h));
  if(iTx<0)iTx=iNo>=0?iNo:H.findIndex((h,i)=>!sq[i]&&i!==iSt&&i!==iAct&&i!==iDt&&h!=='');
  if(iTx<0)iTx=H.findIndex((h,i)=>!sq[i]&&i!==iSt&&i!==iAct);
  const tb=t.tBodies[0],ph=[...tb.rows].find(r=>r.cells.length===1&&r.cells[0].colSpan>1);if(ph){ph.hidden=true;ph.dataset.drph='1'}
  const anchor=[...tb.rows].find(r=>!r.hidden)||null;
  items.forEach(it=>{const c=new Array(n).fill('');
    if(iNo>=0&&iNo!==iTx)c[iNo]='<span class="mu">—</span>';
    if(iDt>=0&&iDt!==iTx)c[iDt]=esc(drDate(it.j));
    if(iSt>=0)c[iSt]='<span class="st">مسودة</span>';
    c[iTx]=drTxt(it)+(iAct<0?'<div style="margin-top:4px">'+drBtns(it.k)+'</div>':'');
    if(iAct>=0)c[iAct]=drBtns(it.k);
    const tr=document.createElement('tr');tr.className='drrow';
    tr.innerHTML=c.map((x,i)=>'<td'+(sq[i]?' class="sq"':'')+'>'+x+'</td>').join('');
    tb.insertBefore(tr,anchor)})}
window.drList=drList;
{const stl=document.createElement('style');stl.textContent='tr.drrow td{background:color-mix(in srgb,var(--a) 10%,var(--c))}tr.drrow:hover td{background:color-mix(in srgb,var(--a) 18%,var(--c))}';document.head.appendChild(stl)}
const drInit=(my,t,fn,forced)=>{
  if(!fn||forced||!who()||SKIP.test(String(t).trim()))return;
  const op=(LAST&&Date.now()-LAST.t<15000)?{a:LAST.a,i:LAST.i}:null;
  setTimeout(()=>{                                  /* بعد انتهاء ما يضيفه المُنادي مباشرة بعد فتح النافذة (حساب الإجماليات، بناء البنود...) */
    if(my!==SEQ||!dlg.open)return;const mb=document.getElementById('mb');if(!mb)return;
    if(mb.querySelector('input[type=password],[name=revDate]'))return;
    if([...mb.querySelectorAll(FSEL)].filter(e=>okc(e)).length<3)return;
    const c0=cap();if(!c0)return;
    const title=String(t).trim(),base=DRP+who()+':'+title,isEdit=EDITRX.test(title),rs=(RES&&Date.now()-RES.t<15000&&RES.title===title)?RES:null;
    let key,rop=op,d=null,old=null;
    if(rs){RES=null;key=rs.key;rop=rs.op||op;d=load(key)}                                   /* متابعة مسودة من القائمة */
    else if(isEdit||!op){key=base+(isEdit&&op&&op.i?'#'+op.i:'');d=load(key)}               /* تعديل مستند محفوظ، أو نموذج لا يمكن إعادة فتحه: مسودة واحدة تُسترجع بصمت */
    else{key=base+'~'+uid();old=load(base)}                                                 /* نموذج جديد: يبدأ فارغًا ولكل مسودة مفتاحها */
    CUR={key,fresh:JSON.stringify(c0),op:rop,off:false,meta:{t:title,op:rop,m:mod,w:view}};
    if(!d&&old){d=old;del(base)}                                                            /* مسودة بالصيغة القديمة (قبل هذا التحديث): تُسترجع مرة واحدة ثم تتحول للصيغة الجديدة */
    if(d&&LIVE!==my){try{apply(d.d);if(old)save()}catch(e){console.error('draft',e)}}
  },40)};
/* ---- (3) تحديث لحظي للنموذج / المسودة المفتوحة ----
   عند وصول تكويد جديد (صنف، مورد، عميل، حساب، مشروع...) من شاشة أو مستخدم آخر أثناء فتح نموذج، يُعاد تشغيل الإجراء الذي فتحه
   (نفس منطق «متابعة المسودة») فتُبنى القوائم من أحدث البيانات، ثم تُعاد كل القيم والبنود وموضع المؤشر والتمرير كما كانت.
   لا يُطبَّق على نوافذ التأكيد (عكس/إلغاء/ترحيل...) ولا على ما فُتح بعد عملية كتابة (لئلا تتكرر). */
const RO_RX=/^(bootstrap|ping|pub|list\w*|get\w*|\w*(List|Meta|Rep|Stmt|Cmp|Cost|Card|Dims|Inbox|Runs|Cats|Dash|Plan|Preview|Short|Check|Log)|tb|gl|ie|bs|apAging|arAging|exportJE|exportAll|stockCard|reconcile|acctCheck|rfqCmp|bomCost|ordPlan|allocPreview|ctTick|budRep|empStmt|custStmt|supStmt|bankRep|dimRep|attList|noteList|getFile)$/;
let WRT=0,DOP=null,REF=null,LIVE=0,ACT=null;
{const _oc=document.onclick;
 document.onclick=function(e){
   const b=e.target&&e.target.closest&&e.target.closest('[data-a]');
   if(!b||!A[b.dataset.a])return _oc?_oc.call(this,e):undefined;
   const me={a:b.dataset.a,i:b.dataset.i,t:Date.now()};ACT=me;let r;
   try{r=A[me.a](me.i)}finally{if(!(r&&r.then))ACT=null}
   if(r&&r.then)r.finally(()=>{if(ACT===me)ACT=null})}}
{const _a=window.api;if(typeof _a==='function'){window.api=function(a){if(!RO_RX.test(String(a)))WRT=Date.now();return _a.apply(this,arguments)}}}
window.dlgOp=()=>DOP?{a:DOP.a,i:DOP.i,edit:DOP.edit}:null;
const focusInfo=()=>{const a=document.activeElement;if(!a||!dlg.contains(a))return null;
  let e=a;const w=a.closest&&a.closest('.ss');if(w&&a.tagName==='INPUT'&&!a.name){const s=w.querySelector('select');if(s)e=s}
  else if(a.classList&&a.classList.contains('dtx')){const n=a.parentNode&&a.parentNode.querySelector('.dtn');if(n)e=n}
  let pos=null;try{if(a.selectionStart!=null)pos=[a.selectionStart,a.selectionEnd]}catch(x){}
  const c=collect().find(x=>x.e===e);if(c)return{k:c.k,pos};
  const mb=document.getElementById('mb');if(!mb)return null;let r=null;
  mb.querySelectorAll('table').forEach((tb,ti)=>{if(r||!tb.tBodies[0])return;[...tb.tBodies[0].rows].forEach((row,ri)=>{if(r)return;const m=keyed(row).find(x=>x.e===e);if(m)r={ti,ri,k:m.k,pos}})});
  return r};
const refocus=f=>{if(!f)return;let e=null;
  if(f.ti===undefined){const m=collect().find(x=>x.k===f.k);e=m&&m.e}
  else{const tb=document.getElementById('mb').querySelectorAll('table')[f.ti],row=tb&&tb.tBodies[0]&&tb.tBodies[0].rows[f.ri];const m=row&&keyed(row).find(x=>x.k===f.k);e=m&&m.e}
  if(!e)return;const w=e.closest&&e.closest('.ss'),t=(e.classList&&e.classList.contains('dtn'))?(e.parentNode.querySelector('.dtx')||e):(w&&e.tagName==='SELECT'?w.querySelector('input'):e);
  try{t.focus({preventScroll:true});if(f.pos&&t.setSelectionRange&&/^(text|search|tel|url|email|password|)$/.test(t.type||''))t.setSelectionRange(f.pos[0],f.pos[1])}catch(x){}};
const scrolls=()=>{const o=[];[dlg,document.getElementById('mb')].forEach(n=>{if(n)o.push([n,n.scrollTop])});dlg.querySelectorAll('#mb .full').forEach(n=>{if(n.scrollTop||n.scrollLeft)o.push([n,n.scrollTop,n.scrollLeft])});return o};
window.dlgLive=async()=>{
  if(!dlg.open||!DOP||DOP.sk||typeof A[DOP.a]!=='function')return false;
  const sb=document.getElementById('ms');if(sb&&sb.disabled)return false;
  if(typeof ssOpen!=='undefined'&&ssOpen)return false;
  REF={title:DOP.title,t:Date.now()};LAST={a:DOP.a,i:DOP.i,t:Date.now()};
  try{const r=A[DOP.a](DOP.i);if(r&&r.then)await r}catch(e){console.error('live',e)}
  for(let k=0;REF&&k<20;k++)await new Promise(r=>setTimeout(r,100));   /* إجراءات تفتح النافذة بعد مهلة قصيرة */
  const ok=!REF;REF=null;
  if(ok)toast('تم تحديث القوائم في النموذج بتكويد جديد — ما أدخلته محفوظ كما هو');
  return ok};
const liveRestore=(rf,my)=>{
  if(my!==SEQ||!dlg.open)return;
  const fresh=JSON.stringify(cap()||{});
  try{apply(rf.st)}catch(e){console.error('live',e)}
  try{refocus(rf.fx)}catch(e){}
  rf.sc.forEach(x=>{try{x[0].scrollTop=x[1];if(x[2]!==undefined)x[0].scrollLeft=x[2]}catch(e){}});
  setTimeout(()=>{                                   /* بعد أن تُنشئ drInit مسودتها: نُبقي مفتاح المسودة الأصلي وحالتها «الفارغة» الصحيحة */
    if(my!==SEQ||!CUR)return;
    if(rf.cur&&!rf.cur.off){if(CUR.key!==rf.cur.key){del(CUR.key);CUR.key=rf.cur.key}CUR.meta=rf.cur.meta||CUR.meta}
    CUR.fresh=fresh;LIVE=0;sched()},90)};
{const _m=window.mdl;window.mdl=function(t,body,fn,ok,forced){
  let rf=null;
  if(REF&&!dlg.open)REF=null;
  if(REF){                                          /* إعادة بناء النموذج المفتوح */
    if(String(t)!==REF.title){return}               /* نافذة مختلفة: لا نستبدل ما يعمل عليه المستخدم */
    REF=null;rf={st:cap(),fx:focusInfo(),sc:scrolls(),cur:CUR};
    if(!rf.st)return}
  else{
    /* نسجّل «الإجراء المُنشئ» فقط إن فُتحت النافذة أثناء تنفيذه نفسه (لا بعد مهلة ولا من زر آخر) ودون أي عملية كتابة في الخادم قبلها */
    let op=(ACT&&WRT<ACT.t)?{a:ACT.a,i:ACT.i}:null;const tt=String(t).trim();
    if(op&&op.a==='drR'){const j=load(op.i);op=(j&&j.op&&!/^dr/.test(j.op.a))?{a:j.op.a,i:j.op.i}:null}
    DOP=(op&&fn&&!forced&&!SKIP.test(tt)&&!/revDate|type="password"/.test(String(body)))?{a:op.a,i:op.i,title:String(t),edit:EDITRX.test(tt)}:null}
  clearTimeout(TM);CUR=null;const my=++SEQ;ftClear();
  if(rf)LIVE=my;
  let sm=null;if(rf){sm=true;dlg.showModal=function(){}}
  try{_m.apply(this,arguments)}finally{if(sm)delete dlg.showModal}
  try{ftPlace()}catch(e){console.error('ftr',e)}
  try{drInit(my,t,fn,forced)}catch(e){console.error('draft',e)}
  if(rf){
    /* الإجراء الذي فتح النافذة قد يكمل بناء البنود بعد mdl مباشرة (بشكل متزامن)؛ نُعيد القيم بعد ذلك في نفس الدورة قبل أن يكتب المستخدم شيئًا */
    Promise.resolve().then(()=>liveRestore(rf,my))}}}
['input','change','click'].forEach(ev=>dlg.addEventListener(ev,sched,true));
dlg.addEventListener('close',()=>{clearTimeout(TM);if(!dlg.open)save();if(!dlg.open){ftClear();try{drList()}catch(e){console.error('drl',e)}}});
addEventListener('pagehide',save);
document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a]');if(b&&!/^dr/.test(b.dataset.a||''))LAST={a:b.dataset.a,i:b.dataset.i,t:Date.now()}},true);
prune();
}
})();
