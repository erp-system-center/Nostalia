/* =====================================================================
   تصميم واجهة الدور بالشكل الفعلي (مثل أنظمة الـ ERP)
   • المدير يفتح النظام بنفس شكله ويُعلّم بمربعات اختيار على كل ما يظهر لأصحاب الدور:
     مديول رئيسي / تاب فرعي / زر أو خيار / عمود جدول / كارت مؤشر / حقل نموذج.
   • المحفوظ في الدور (Profiles.ui): hide = عناصر مخفية من الشاشة (إجراء a: / عمود c: / كارت k: / حقل f:)
     وsens = مجموعات بيانات حساسة تُحجب من الخادم نفسه (فلا تصل المتصفح أصلًا).
   • هذا هو المكان الوحيد لضبط صلاحيات الدور: مستوى كل مديول (من سجل المديولات تلقائيًا) + أفعال كل شاشة (عرض/إنشاء/اعتماد/حذف/تقارير) يفرضها الخادم.
   • الزر المخفي تُستخرج منه إجراءات الخادم التابعة لشاشته (denyApi) ويرفضها الخادم أيضًا؛ العمود/الكارت/الحقل المخفي إخفاء عرض، والبيانات الحساسة تُحجب من الخادم.
   ===================================================================== */
(()=>{
const SENS={
 hr_pay:{t:'رواتب الموظفين ومسيرات الرواتب',pre:'h_',cols:['الأساسي','البدلات','مكافأة','استقطاع ثابت','استقطاع إضافي','خصم سلفة','الصافي','الاستقطاعات','الإجمالي','الراتب']},
 hr_id:{t:'هوية الموظفين وبياناتهم البنكية وتواصلهم',pre:'h_',cols:['الرقم القومي','البنك','الهاتف','البريد']},
 inv_cost:{t:'تكلفة وقيمة المخزون',pre:'i_',cols:['القيمة','المتوسط','متوسط التكلفة','التكلفة','القيمة الحالية']}
};
let DES=null;               // حالة وضع التصميم
const KEEP=['bootstrap','ping','pub'];
const readOnly=a=>KEEP.includes(a)||(typeof LD_READ!=='undefined'&&LD_READ.test(a))||/(Dash|Cats|Inbox|Runs)$/.test(a)||/^(att|note)List$/.test(a);

/* ---------- عناصر الشاشة القابلة للتحكم ---------- */
const colLabel=th=>th.textContent.replace(/[⇅↑↓▲▼↕]/g,'').replace(/\s+/g,' ').trim();
const cardLabel=c=>{const m=c.querySelector('.mu')||c;return m.textContent.replace(/\s+/g,' ').trim().slice(0,60)};
const fieldWrap=el=>{const w=el.closest('#mb > div, #mb .db > div, #mb .full, #mb div');return w&&w.querySelector('label')&&w.querySelectorAll('[name]').length===1?w:null};
const items=(root,isDlg)=>{
  const v=typeof view==='string'?view:'',out=[];
  root.querySelectorAll('[data-a]').forEach(e=>{
    const a=e.dataset.a;if(!a||['go','mod','ng','home','itab','cmd','bell','prof','xl','ref','dzgo','dzsave','dzcancel','dzsens'].includes(a)||e.closest('#dzbar,.itabs,#nav,#mods'))return;
    out.push({el:e,key:'a:'+v+'|'+a,kind:'a'})});
  root.querySelectorAll('.card').forEach(c=>{const l=cardLabel(c);if(l)out.push({el:c,key:'k:'+v+'|'+l,kind:'k'})});
  root.querySelectorAll('table').forEach(t=>{const hr=t.tHead&&t.tHead.rows[0];if(!hr)return;
    [...hr.cells].forEach((th,i)=>{const l=colLabel(th);if(l)out.push({el:th,key:'c:'+v+'|'+l,kind:'c',table:t,idx:i})})});
  if(isDlg)root.querySelectorAll('[name]').forEach(e=>{const w=fieldWrap(e);if(w&&!e.closest('#dzbar'))out.push({el:w,key:'f:'+v+'|'+e.name,kind:'f'})});
  return out;
};
const sensHit=(label)=>{const v=typeof view==='string'?view:'';const S=D.user&&D.user.ui&&D.user.ui.sens||[];
  return S.some(g=>SENS[g]&&v.startsWith(SENS[g].pre)&&SENS[g].cols.includes(label))};
const hiddenSet=()=>DES?DES.hide:new Set((D.user&&D.user.ui&&D.user.ui.hide)||[]);

// حذف عدة أعمدة من جدول دفعة واحدة: تُلتقط خلايا كل صف سليم (عدد خلاياه n) قبل أي حذف حتى لا يتغير ترقيم الأعمدة
// أثناء الحذف (كان الحذف المتتابع يُسقط كل عمود بعد الأول). ويُحفظ ما حُذف لتنظيف الصفوف التي تُضاف لاحقًا بكامل أعمدتها
const removeCols=(t,idxs,n)=>{
  const idx=[...new Set(idxs)];
  [...t.rows].filter(r=>r.cells.length===n).forEach(r=>{const cs=idx.map(i=>r.cells[i]);cs.forEach(c=>c&&c.remove())});
  let prev=null;try{prev=t.dataset.dzr?JSON.parse(t.dataset.dzr):null}catch(e){}
  t.dataset.dzr=JSON.stringify({n:n,i:[...new Set((prev&&prev.n===n?prev.i:[]).concat(idx))]});
};
const fixAppended=root=>root.querySelectorAll('table[data-dzr]').forEach(t=>{try{const o=JSON.parse(t.dataset.dzr);removeCols(t,o.i,o.n)}catch(e){}});
const applyReal=(root,isDlg)=>{
  const H=hiddenSet(),S=D.user&&D.user.ui;if(!S||(!S.hide.length&&!S.sens.length)||D.user.role==='admin')return;
  fixAppended(root);
  const its=items(root,isDlg),cols={};
  its.forEach(x=>{
    if(x.kind==='c'){if(H.has(x.key)||sensHit(colLabel(x.el))){(cols[x.table.dataset.dzt||(x.table.dataset.dzt=Math.random().toString(36).slice(2))]=cols[x.table.dataset.dzt]||{t:x.table,n:x.table.tHead.rows[0].cells.length,i:[]}).i.push(x.idx)}}
    else if(H.has(x.key))x.el.remove()});
  Object.values(cols).forEach(c=>removeCols(c.t,c.i,c.n));
};

/* ---------- وضع التصميم ---------- */
const mk=(key,checked,title)=>{const i=document.createElement('input');i.type='checkbox';i.className='dz';i.dataset.dk=key;i.checked=checked;i.title=title||'ظاهر لأصحاب الدور';return i};
const VB=[['v','عرض'],['c','إنشاء/تعديل'],['a','اعتماد/ترحيل'],['d','حذف/إلغاء'],['x','تقارير']];
const getVB=k=>{if(!DES.vb[k]){const t=DES.p.tabs&&DES.p.tabs[k]||'',dn=DES.p.deny&&DES.p.deny[k]||'',S=new Set();
  if(t!=='x'){S.add('v');['c','a','d'].forEach(v=>{if(t!=='r'&&!dn.includes(v))S.add(v)});if(!dn.includes('x'))S.add('x')}DES.vb[k]=S}return DES.vb[k]};
const modOn=k=>!!DES.modR[k]&&DES.modR[k]!=='none';
const defRole=k=>{const L=Object.keys(MODR[k]||{}).filter(r=>r!=='none'&&r!=='admin');return L.includes('viewer')?'viewer':L[0]||'none'};
const isOn=key=>{if(key.startsWith('m:'))return modOn(key.slice(2));if(key.startsWith('t:'))return getVB(key.slice(2)).has('v');return !DES.hide.has(key)};
const compile=()=>{const tabs={...(DES.p.tabs||{})},deny={...(DES.p.deny||{})};
  Object.keys(DES.vb).forEach(k=>{const S=DES.vb[k];delete tabs[k];delete deny[k];
    if(!S.has('v')){tabs[k]='x';return}
    const dn=['c','a','d','x'].filter(v=>!S.has(v));
    if(!S.has('c')&&!S.has('a')&&!S.has('d')){tabs[k]='r';if(dn.includes('x'))deny[k]='x'}else if(dn.length)deny[k]=dn.join('')});
  return {tabs,deny}};
// إجراءات الخادم التي يستدعيها معالج زر (بحث في نص المعالج وما يستدعيه)
const apisOf=(name,seen=new Set(),d=0)=>{const out=new Set();if(seen.has(name)||d>3||typeof A[name]!=='function')return out;seen.add(name);
  const src=String(A[name]),re=/\b(?:run|api)\(\s*['"]([A-Za-z0-9_]+)['"]/g;let m;while((m=re.exec(src)))out.add(m[1]);
  const re2=/\bA\.([A-Za-z0-9_]+)\(/g;while((m=re2.exec(src)))apisOf(m[1],seen,d+1).forEach(x=>out.add(x));return out};
const denyApis=()=>{const out=new Set();DES.hide.forEach(k=>{if(k[0]!=='a')return;const [v,n]=k.slice(2).split('|');apisOf(n).forEach(a=>{if(!readOnly(a))out.add(v+'|'+a)})});return [...out]};
const colCells=(x)=>{const t=x.table;return [...t.rows].map(r=>r.cells.length===t.tHead.rows[0].cells.length?r.cells[x.idx]:null).filter(Boolean)};
const decorate=(root,isDlg)=>{
  if(!DES)return;const seen=new Set();
  items(root,isDlg).forEach(x=>{
    if(x.el.dataset.dzk)return;x.el.dataset.dzk=x.key;
    if(x.kind==='c')colCells(x).forEach(c=>{c.dataset.dzk=x.key});
    x.el.classList.toggle('dzoff',!isOn(x.key));if(x.kind==='c')colCells(x).forEach(c=>c.classList.toggle('dzoff',!isOn(x.key)));
    if(seen.has(x.key)&&x.kind==='a')return; seen.add(x.key);
    const cb=mk(x.key,isOn(x.key),{a:'إظهار هذا الزر/الخيار',c:'إظهار هذا العمود',k:'إظهار هذا الكارت',f:'إظهار هذا الحقل في النموذج'}[x.kind]);
    if(x.kind==='a')x.el.prepend(cb);else if(x.kind==='k'){x.el.style.position='relative';cb.classList.add('dzc');x.el.prepend(cb)}else if(x.kind==='f'){const l=x.el.querySelector('label');(l||x.el).prepend(cb)}else x.el.prepend(cb);
  });
  document.querySelectorAll('[data-dzk]').forEach(e=>{const k=e.dataset.dzk;if(!k.startsWith('m:')&&!k.startsWith('t:'))e.classList.toggle('dzoff',!isOn(k))});
};
const decorateNav=()=>{
  if(!DES)return;
  document.querySelectorAll('[data-a="mod"][data-i]').forEach(e=>{const k=e.dataset.i;if(!(k in MODN)||e.dataset.dzn||e.closest('.bc'))return;e.dataset.dzn=1;
    const key='m:'+k;e.dataset.dzk=key;e.classList.toggle('dzoff',!isOn(key));const cb=mk(key,isOn(key),'إظهار هذا المديول لأصحاب الدور');cb.classList.add('dzm');e.prepend(cb)});
  document.querySelectorAll('#nav [data-a="go"][data-i]').forEach(e=>{const k=e.dataset.i;if(e.dataset.dzn)return;e.dataset.dzn=1;
    const key='t:'+k;e.dataset.dzk=key;e.classList.toggle('dzoff',!isOn(key));const cb=mk(key,isOn(key),'إظهار هذا التاب لأصحاب الدور');cb.classList.add('dzt');e.prepend(cb)});
};
const curTab=()=>{const v=typeof view==='string'?view:'';let r=null;Object.values(TABL).forEach(([t,L])=>L.forEach(([k,n])=>{if(k===v)r=[k,n]}));return r};
const bar=()=>{let b=document.getElementById('dzbar');if(!DES){if(b)b.remove();return}
  if(!b){b=document.createElement('div');b.id='dzbar';document.body.appendChild(b)}
  const open=[...b.querySelectorAll('details[open]')].map(d=>d.dataset.p);
  const n=DES.hide.size+Object.keys(DES.vb).filter(k=>getVB(k).size<5).length+Object.keys(MODN).filter(k=>!modOn(k)).length;
  const ct=curTab();
  b.innerHTML=`<b>${svg('palette',18)} مصمم الصلاحيات: ${esc(DES.name)}</b><span class="mu">المربع المحدد = ظاهر/مسموح. تنقّل بين الشاشات وافتح النوافذ لتعليم الأزرار والأعمدة والكروت والحقول (العمليات الفعلية معطّلة).</span>
  <details class="dzs" data-p="m"><summary>${svg('grid',16)} المديولات ومستواها</summary><div>${Object.keys(MODN).map(k=>`<label class="dzr"><span>${esc(MODN[k])}</span><select data-dzm="${k}">${[['none','بدون وصول']].concat(Object.entries(MODR[k]||{}).filter(e=>e[0]!=='admin'&&e[0]!=='none')).map(([r,l])=>`<option value="${esc(r)}"${(DES.modR[k]||'none')===r?' selected':''}>${esc(l)}</option>`).join('')}</select></label>`).join('')}</div></details>
  ${ct?`<details class="dzs" data-p="v"><summary>${svg('check',16)} أفعال الشاشة: ${esc(ct[1])}</summary><div>${VB.map(([v,l])=>`<label class="chk"><input type="checkbox" data-dzv="${v}"${getVB(ct[0]).has(v)?' checked':''}> ${l}</label>`).join('')}<div class="mu">يفرضها الخادم على كل إجراءات هذه الشاشة.</div></div></details>`:''}
  <details class="dzs" data-p="s"><summary>${svg('lock',16)} حجب بيانات حساسة من الخادم (${DES.sens.size})</summary><div>${Object.entries(SENS).map(([k,s])=>`<label class="chk"><input type="checkbox" data-dzs="${k}"${DES.sens.has(k)?' checked':''}> ${s.t}</label>`).join('')}<div class="mu">المحجوب لا يصل متصفح المستخدم أصلًا (حتى من أدوات المطوّر).</div></div></details>
  <span class="dzn">مقيّد: ${n}</span><button class="b g" data-a="dzsave">حفظ التصميم</button><button class="b o" data-a="dzcancel">إلغاء</button>`;
  b.querySelectorAll('details').forEach(d=>{if(open.includes(d.dataset.p))d.open=true})};

document.addEventListener('click',e=>{
  const t=e.target;if(!DES||!t||!t.classList)return;
  if(t.classList.contains('dz')){e.stopPropagation();const key=t.dataset.dk,on=t.checked;
    if(key.startsWith('m:')){const k=key.slice(2);DES.modR[k]=on?(DES.modR[k]&&DES.modR[k]!=='none'?DES.modR[k]:defRole(k)):'none'}
    else if(key.startsWith('t:')){const S=getVB(key.slice(2));on?S.add('v'):S.delete('v')}
    else{if(on)DES.hide.delete(key);else DES.hide.add(key)}
    document.querySelectorAll('[data-dzk="'+CSS.escape(key)+'"]').forEach(x=>x.classList.toggle('dzoff',!on));
    document.querySelectorAll('input.dz[data-dk="'+CSS.escape(key)+'"]').forEach(x=>{x.checked=on});bar();return}
  if(t.dataset&&t.dataset.dzs!==undefined){e.stopPropagation();return}
},true);
document.addEventListener('change',e=>{const t=e.target;if(!DES||!t||!t.dataset)return;
  if(t.dataset.dzs){t.checked?DES.sens.add(t.dataset.dzs):DES.sens.delete(t.dataset.dzs);bar()}
  else if(t.dataset.dzm){const k=t.dataset.dzm;DES.modR[k]=t.value;document.querySelectorAll('input.dz[data-dk="m:'+k+'"]').forEach(x=>{x.checked=modOn(k)});document.querySelectorAll('[data-dzk="m:'+k+'"]').forEach(x=>x.classList.toggle('dzoff',!modOn(k)));bar()}
  else if(t.dataset.dzv){const ct=curTab();if(!ct)return;const S=getVB(ct[0]);t.checked?S.add(t.dataset.dzv):S.delete(t.dataset.dzv);
    document.querySelectorAll('input.dz[data-dk="t:'+ct[0]+'"]').forEach(x=>{x.checked=S.has('v')});document.querySelectorAll('[data-dzk="t:'+ct[0]+'"]').forEach(x=>x.classList.toggle('dzoff',!S.has('v')));bar()}});

// منع العمليات الفعلية في وضع التصميم (القراءة فقط)
{const o=window.api;window.api=function(a){if(DES&&!readOnly(a)){toast('وضع التصميم: العمليات الفعلية معطّلة',1);return Promise.reject(new Error('وضع التصميم: العمليات الفعلية معطّلة'))}return o.apply(this,arguments)}}

A.dzgo=i=>{const p=(D.profiles||[]).find(x=>x.id==i);if(!p)return;
  DES={id:p.id,p,name:p.name,hide:new Set((p.ui&&p.ui.hide)||[]),sens:new Set((p.ui&&p.ui.sens)||[]),vb:{},modR:{}};
  Object.keys(MODN).forEach(k=>{DES.modR[k]=(p.mods&&p.mods[k])||'none'});
  document.body.classList.add('dzmode');try{dlg.close()}catch(e){}
  UX.home=true;render();bar();toast('وضع التصميم: علّم على ما يظهر لأصحاب الدور «'+p.name+'»')};
A.dzcancel=()=>{if(!DES)return;if(!confirm('إلغاء التصميم بدون حفظ؟'))return;exit()};
const exit=()=>{DES=null;document.body.classList.remove('dzmode');document.querySelectorAll('input.dz').forEach(x=>x.remove());document.querySelectorAll('[data-dzk],[data-dzn]').forEach(x=>{delete x.dataset.dzk;delete x.dataset.dzn;x.classList.remove('dzoff')});bar();UX.home=true;render()};
A.dzsave=async()=>{if(!DES)return;const d=DES,p=d.p,mods={};
  Object.keys(MODN).forEach(k=>{mods[k]=modOn(k)?d.modR[k]:'none'});
  const {tabs,deny}=compile(),ui={hide:[...d.hide],sens:[...d.sens],denyApi:denyApis()};
  DES=null;document.body.classList.remove('dzmode');
  try{await run('saveProfile',{id:p.id,name:p.name,desc:p.desc==='auto'?'':p.desc,active:p.active,mods,tabs,deny,limits:p.limits||{},scope:p.scope||{},ui},'تم حفظ صلاحيات الدور «'+p.name+'»')}catch(e){toast(e.message,1)}
  document.querySelectorAll('input.dz').forEach(x=>x.remove());document.querySelectorAll('[data-dzk],[data-dzn]').forEach(x=>{delete x.dataset.dzk;delete x.dataset.dzn;x.classList.remove('dzoff')});bar();render()};

/* ---------- الربط بالعرض ---------- */
{const o=window.render;window.render=function(){o.apply(this,arguments);try{
  const v=document.getElementById('v');if(!D.user||!v)return;
  if(DES){decorate(v,false);decorateNav();bar()}else applyReal(v,false);watch()}catch(e){console.error('ui',e)}}}
{const o=window.mdl;window.mdl=function(){o.apply(this,arguments);try{
  const m=document.getElementById('mb');if(!m||!D.user)return;
  if(DES)decorate(m,true);else applyReal(m,true);watch()}catch(e){console.error('ui',e)}}}
/* إعادة تطبيق الإخفاء بعد أي تحديث جزئي للشاشة أو النافذة (تقارير تُحمَّل بعد الرسم، إعادة كتابة #v مباشرة، صفوف تُضاف، نتائج بحث)
   وإلا ظهرت الأزرار والأعمدة والحقول المخفية للدور من جديد. التطبيق متكرر الأمان (idempotent) ولا يُشغَّل لمدير النظام */
let OBS=null,OBS_BUSY=false,OBS_Q=0;
function watch(){
  if(OBS||typeof MutationObserver==='undefined')return;
  const run=()=>{OBS_Q=0;if(!D.user||(!DES&&D.user.role==='admin'))return;OBS_BUSY=true;
    try{const v=document.getElementById('v'),m=document.getElementById('mb');
      if(DES){if(v)decorate(v,false);if(m)decorate(m,true)}else{if(v)applyReal(v,false);if(m)applyReal(m,true)}}
    catch(e){console.error('ui',e)}finally{OBS.takeRecords();OBS_BUSY=false}};
  OBS=new MutationObserver(()=>{if(OBS_BUSY||OBS_Q)return;OBS_Q=requestAnimationFrame(run)});
  ['v','mb'].forEach(id=>{const e=document.getElementById(id);if(e)OBS.observe(e,{childList:true,subtree:true})});
}
const st=document.createElement('style');st.textContent=`
body.dzmode{padding-bottom:84px}
#dzbar{position:fixed;left:0;right:0;bottom:0;z-index:90;background:color-mix(in srgb,var(--p) 78%,#000);color:#fff;padding:10px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;box-shadow:0 -4px 16px rgba(0,0,0,.25)}
#dzbar .mu{color:color-mix(in srgb,var(--p) 25%,#fff);font-size:12px;flex:1;min-width:260px}
#dzbar .dzs{position:relative}#dzbar .dzs summary{cursor:pointer;background:color-mix(in srgb,var(--p) 60%,#000);padding:6px 10px;border-radius:8px}
#dzbar .dzs>div{position:absolute;bottom:42px;right:0;background:#fff;color:#222;border-radius:10px;padding:12px;min-width:320px;box-shadow:0 6px 22px rgba(0,0,0,.3)}
#dzbar .dzs .chk{display:block;margin:4px 0;color:#222}
#dzbar .dzr{display:flex;justify-content:space-between;gap:10px;align-items:center;margin:5px 0;color:#222}#dzbar .dzr select{min-width:150px}
#dzbar summary{display:flex;align-items:center;gap:6px}#dzbar b{display:flex;align-items:center;gap:6px}
#dzbar .dzs>div{max-height:60vh;overflow:auto}
#dzbar .dzn{background:#c77a00;border-radius:12px;padding:3px 10px;font-size:12px}
input.dz{margin:0 4px}
input.dz.dzc{position:absolute;top:6px;left:6px;z-index:2}
input.dz.dzm,input.dz.dzt{margin-inline-end:6px}
.dzoff{opacity:.35;text-decoration:line-through}
td.dzoff,th.dzoff{background:repeating-linear-gradient(45deg,transparent 0 6px,rgba(179,38,30,.07) 6px 12px)}
`;document.head.appendChild(st);
})();
