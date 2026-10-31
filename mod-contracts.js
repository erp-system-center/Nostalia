/* =====================================================================
   العقود (مديول المشتريات): ربط بالموردين + تنبيه قبل الانتهاء بإشعار داخل النظام وبريد إلكتروني
   ===================================================================== */
(()=>{
NAVX.proc.push(['p_ct','العقود']);
{const o=MODS.proc.nav;MODS.proc.nav=()=>{const n=o().filter(x=>x[0]!=='p_ct');if(is('admin','procurement','approver','finance'))n.push(['p_ct','العقود']);return n}}
const ST={T:null,loading:0,err:'',state:'',q:''};
const canW=()=>is('admin','procurement')&&canV('c','p_ct');
const load=force=>{if(force)ST.T=null;
  if(!ST.T&&!ST.loading){ST.loading=1;ST.err='';api('listContract').then(j=>{ST.T=j;ST.loading=0;rr()}).catch(e=>{ST.loading=0;ST.err=e.message;rr()})}
  return ST.T};
const rr=()=>{if(view==='p_ct')render()};
const mut=async(a,d,msg)=>{const j=await run(a,d,msg);ST.T=null;rr();return j};
// كل الموردين: من بيانات النظام الحية (تشمل الموردين المضافين بعد فتح العقود) + قائمة العقود، بدون تكرار
const supAll=(T,cur)=>{const m=new Map();((D.sup||[]).concat((T||{}).sups||[])).forEach(s=>{if(s&&s.id&&!m.has(s.id))m.set(s.id,{id:s.id,name:s.name})});
  if(cur&&!m.has(cur)){const c=((T||{}).list||[]).find(z=>z.sup===cur);m.set(cur,{id:cur,name:(c&&c.supName)||'مورد محذوف'})}
  return [...m.values()].sort((a,b)=>String(a.name).localeCompare(String(b.name),'ar'))};
const find=i=>((ST.T||{}).list||[]).find(c=>c.id==i);
const uName=n=>{const u=((ST.T||{}).users||[]).find(x=>x.username===n);return u?u.name:(n||'—')};
const COL={'ساري':'var(--ok)','قارب على الانتهاء':'#c77a00','منتهي':'#b3261e','ملغي':'#777'};
const badge=c=>`<span class="st" style="background:${COL[c.state]||'#777'};color:#fff">${esc(c.state)}</span>`;
const left=c=>c.state==='ملغي'?'—':(c.left<0?`<b style="color:#b3261e">منتهي منذ ${-c.left} يوم</b>`:(c.left<=30?`<b style="color:#c77a00">${c.left} يوم</b>`:c.left+' يوم'));

V.p_ct=()=>{
  const T=load(),ttl='العقود';
  if(ST.err)return `<div class="tb"><h2>${ttl}</h2></div><div class="box" style="color:#c0392b">${esc(ST.err)} <button class="b s" data-a="ctRe">إعادة المحاولة</button></div>`;
  if(!T)return `<div class="tb"><h2>${ttl}</h2></div><div class="box mu">جارٍ التحميل…</div>`;
  const L=T.list.filter(c=>(!ST.state||c.state===ST.state)&&(!ST.q||(c.code+c.title+c.supName+c.kind).includes(ST.q)));
  const n=s=>T.list.filter(c=>c.state===s).length;
  const val=T.list.filter(c=>c.state==='ساري'||c.state==='قارب على الانتهاء').reduce((s,c)=>s+(+c.value||0),0);
  const cards=[['سارية',n('ساري')],['قاربت على الانتهاء (30 يوم)',n('قارب على الانتهاء')],['منتهية',n('منتهي')],['قيمة العقود السارية',f(val)]];
  return head(ttl,canW()?'nct':'','+ عقد جديد',`<select onchange="ctF(this.value)"><option value="">كل الحالات</option>${['ساري','قارب على الانتهاء','منتهي','ملغي'].map(s=>`<option${ST.state===s?' selected':''}>${s}</option>`).join('')}</select>`)
   +`<div class="cards">${cards.map(c=>`<div class="card"><div class="mu">${c[0]}</div><b>${c[1]}</b></div>`).join('')}</div>`
   +`<div class="box">${tbl(['الكود','العنوان','المورد','النوع','البداية','النهاية','المتبقي','القيمة','المسؤول','الحالة',''],L.map(c=>[esc(c.code),esc(c.title),esc(c.supName||'—'),esc(c.kind),esc(c.start),esc(c.end),left(c),c.value?f(c.value):'—',esc(uName(c.owner)),badge(c),btn('vct',c.id,'عرض','o')+(canW()?btn('nct',c.id,'تعديل','o')+(c.state!=='ملغي'?btn('rct',c.id,'تجديد','g'):'')+btn('dct',c.id,'حذف','r'):'')]))}</div>`
   +`<p class="mu">يُرسل النظام تنبيهًا (إشعار داخل النظام + بريد إلكتروني) عند الوصول لكل مدة تنبيه محددة في العقد قبل تاريخ الانتهاء، وعند انتهاء العقد. التنبيه يصل للمسؤول عن العقد (أو لمدير النظام والمشتريات لو لم يُحدد) وللبريد المضاف في العقد.</p>`;
};
window.ctF=v=>{ST.state=v;rr()};
A.ctRe=()=>{ST.err='';ST.T=null;rr()};
const _nct0=i=>{if(!canW())return;const T=ST.T,x=i?find(i):{start:today(),end:'',remind:'60,30,7',kind:'توريد',value:''};if(!x)return;
  mdl(i?'تعديل عقد '+x.code:'عقد جديد',
   fld('عنوان العقد','title',x.title,'text','full')
   +sel('المورد','sup',[['','— بدون مورد —']].concat(supAll(T,x.sup).map(s=>[s.id,s.name])),x.sup||'')
   +sel('نوع العقد','kind',T.kinds.map(k=>[k,k]),x.kind)
   +fld('تاريخ البداية','start',x.start,'date')+fld('تاريخ الانتهاء','end',x.end,'date')
   +fld('قيمة العقد (اختياري)','value',x.value||'','number')
   +sel('المسؤول عن العقد (يصله التنبيه)','owner',[['','— مدير النظام والمشتريات —']].concat(T.users.map(u=>[u.username,u.name])),x.owner||'')
   +fld('التنبيه قبل الانتهاء بـ (أيام، مفصولة بفاصلة)','remind',x.remind,'text')
   +fld('بريد إضافي للتنبيه (اختياري، أكثر من بريد بفاصلة)','emails',x.emails||'','text')
   +sel('تجديد تلقائي؟','autoRenew',[['','لا'],['true','نعم (للتذكير فقط)']],x.autoRenew||'')
   +(i?sel('حالة العقد','st',[['ساري','ساري'],['ملغي','ملغي']],x.st):'')
   +fld('ملاحظات','note',x.note,'ta','full')
   +(i?attBox('CT',i):'<div class="full mu">بعد الحفظ يمكنك إرفاق صورة العقد (PDF).</div>'),
   ()=>{const o=rd();if(!o.title.trim()){toast('أدخل عنوان العقد',1);return false}if(!o.end){toast('أدخل تاريخ الانتهاء',1);return false}if(i){o.id=i;o.ver=x.ver}return mut('saveContract',o,'تم حفظ العقد')});
  if(i&&typeof attInit==='function')attInit()};
A.nct=async i=>{try{const j=await api('listContract');if(ST.T)ST.T.sups=j.sups}catch(e){}_nct0(i)};
A.vct=i=>{const c=find(i);if(!c)return;
  mdl('عقد '+c.code,kv('العنوان',c.title)+kv('المورد',c.supName)+kv('النوع',c.kind)+kv('الحالة',c.state)+kv('البداية',c.start)+kv('الانتهاء',c.end)+kv('المتبقي',c.state==='ملغي'?'—':c.left+' يوم')+kv('القيمة',c.value?f(c.value):'')+kv('المسؤول',uName(c.owner))+kv('مدد التنبيه (أيام)',c.remind)+kv('بريد التنبيه',c.emails)+kv('مرات التجديد',c.renewals||0)+kv('ملاحظات',c.note)+attBox('CT',i),null);
  if(typeof attInit==='function')attInit()};
A.rct=i=>{if(!canW())return;const c=find(i);if(!c)return;
  mdl('تجديد '+c.code+' — ينتهي حاليًا '+c.end,fld('تاريخ الانتهاء الجديد','end','','date')+fld('القيمة الجديدة (اتركها فارغة لو لم تتغير)','value','','number'),
   ()=>{const o=rd();if(!o.end){toast('أدخل تاريخ الانتهاء الجديد',1);return false}return mut('renewContract',{id:i,ver:c.ver,end:o.end,value:o.value},'تم تجديد العقد')})};
A.dct=i=>{if(!canW())return;const c=find(i);if(c&&confirm('حذف العقد '+c.code+' ومرفقاته؟'))mut('delContract',{id:i},'تم الحذف')};
// فحص التنبيهات مرة عند أول دخول (الخادم يمنع التكرار في نفس اليوم)
{let n=0;const t=setInterval(()=>{if(++n>40)return clearInterval(t);if(D&&D.user&&D.user.username){clearInterval(t);api('ctTick').catch(()=>{})}},1500)}
})();
