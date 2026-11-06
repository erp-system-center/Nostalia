/* =====================================================================
   mod-svc.js — دليل الخدمات (المبيعات والمشتريات) + تصنيفات الأصناف بحساباتها الافتراضية
   التابات: s_svc (من المبيعات)، p_svc (من المشتريات)، c_icat (من الحسابات). الخادم: Coding.gs
   الآلية: الخدمة لها كود SRV وحساب إيراد (عند البيع) وحساب مصروف (عند الشراء)؛ وإن تُركا تُورَّث من «تصنيف» الخدمة، وإلا الافتراضي النظامي.
   ===================================================================== */
(()=>{
const SV=()=>D.svc||{svcs:[],cats:[],revAccs:[],expAccs:[]};
const accNm=(l,id)=>{const a=(l||[]).find(x=>x.id==id);return a?a.code+' · '+a.name:''};
const catOf=n=>SV().cats.find(c=>c.active&&c.name===n);
const effRev=s=>{if(s.revAcc&&accNm(SV().revAccs,s.revAcc))return accNm(SV().revAccs,s.revAcc);const c=catOf(s.cat);return c&&c.revAcc&&accNm(SV().revAccs,c.revAcc)?accNm(SV().revAccs,c.revAcc)+' <small class="mu">(من التصنيف)</small>':'<span class="mu">إيرادات المبيعات (افتراضي)</span>'};
const effExp=s=>{if(s.acc&&accNm(SV().expAccs,s.acc))return accNm(SV().expAccs,s.acc);const c=catOf(s.cat);return c&&c.expAcc&&accNm(SV().expAccs,c.expAcc)?accNm(SV().expAccs,c.expAcc)+' <small class="mu">(من التصنيف)</small>':'<span class="mu">مصروف الخدمات (افتراضي)</span>'};
const canS=()=>D.sal&&['admin','officer','manager'].includes(D.sal.role);
const canP=()=>D.user&&(D.user.role==='admin'||D.user.role==='procurement');
const canC=()=>D.acc&&['admin','manager'].includes(D.acc.role);
const bd=on=>`<span class="st">${on?'نشط':'موقوف'}</span>`;

/* ---------- دليل الخدمات ---------- */
const svcView=(mode)=>{
  const can=mode==='s'?canS():canP(),L=SV().svcs;
  return head(mode==='s'?'دليل الخدمات (للبيع)':'دليل الخدمات (للشراء)',can?(mode==='s'?'nsvs':'nsvp'):'','+ خدمة جديدة')
   +`<div class="box">${tbl(['الكود','الخدمة','الوحدة','سعر البيع','التصنيف','حساب الإيراد (البيع)','حساب المصروف (الشراء)','الحالة',''],L.map(s=>[esc(s.code),esc(s.name),esc(s.unit),f(s.price),esc(s.cat)||'—',effRev(s),effExp(s),bd(s.active),can?btn(mode==='s'?'nsvs':'nsvp','e|'+s.id,'تعديل','o')+btn(mode==='s'?'dsvs':'dsvp',s.id,'حذف','r'):'']))}</div>`
   +`<p class="mu">كل خدمة لها كود ثابت (SRV-0001...) وتُباع في فاتورة المبيعات وتُشترى في فاتورة المشتريات. <b>الحساب يُحدَّد تلقائيًا:</b> حساب الخدمة ← حساب تصنيفها ← الحساب النظامي الافتراضي. أنشئ التصنيفات وحساباتها من «تصنيفات الأصناف» في الحسابات.</p>`;
};
V.s_svc=()=>svcView('s');
V.p_svc=()=>svcView('p');
const svcForm=(mode,arg)=>{
  const id=(arg||'').startsWith('e|')?arg.slice(2):'',x=id?SV().svcs.find(s=>s.id==id):{active:true,price:0};if(id&&!x)return;
  const catOpts=[['','— بدون تصنيف —']].concat(SV().cats.filter(c=>c.active||c.name===x.cat).map(c=>[c.name,c.name]));
  mdl(id?'تعديل خدمة '+x.code:'خدمة جديدة',
   fld('اسم الخدمة','name',x.name||'','text','full')+fld('الوحدة','unit',x.unit||'خدمة','text')+fld('سعر البيع الافتراضي','price',x.price??0,'number')
   +sel('التصنيف (يورّث حساباته)','cat',catOpts,x.cat||'','full')
   +sel('حساب الإيراد (عند البيع)','revAcc',[['','— حسب التصنيف / الافتراضي —']].concat(SV().revAccs.map(a=>[a.id,a.code+' · '+a.name])),x.revAcc||'')
   +sel('حساب المصروف (عند الشراء)','acc',[['','— حسب التصنيف / الافتراضي —']].concat(SV().expAccs.map(a=>[a.id,a.code+' · '+a.name])),x.acc||'')
   +(id?sel('الحالة','active',[['true','نشطة'],['false','موقوفة']],x.active?'true':'false'):''),
   ()=>{const o=rd();if(!(o.name||'').trim()){toast('أدخل اسم الخدمة',1);return false}
    return run(mode==='s'?'saveSvc':'saveSvcP',{...o,id:id||undefined},'تم حفظ الخدمة').then(r=>r!==false)})};
A.nsvs=a=>{if(canS())svcForm('s',a)};
A.nsvp=a=>{if(canP())svcForm('p',a)};
const svcDel=(mode,i)=>{const x=SV().svcs.find(s=>s.id==i);if(x&&confirm('حذف الخدمة «'+x.name+'»؟ (لا تُحذف إن استُخدمت في مستندات؛ أوقفها بدل الحذف)'))run(mode==='s'?'delSvc':'delSvcP',{id:i},'تم حذف الخدمة')};
A.dsvs=i=>svcDel('s',i);
A.dsvp=i=>svcDel('p',i);

/* ---------- تصنيفات الأصناف والخدمات ---------- */
V.c_icat=()=>{
  const L=SV().cats;
  return head('تصنيفات الأصناف والخدمات',canC()?'nic':'','+ تصنيف جديد')
   +`<div class="box">${tbl(['الكود','التصنيف','حساب الإيراد الافتراضي','حساب المصروف الافتراضي','الحالة',''],L.map(c=>[esc(c.code),esc(c.name),esc(accNm(SV().revAccs,c.revAcc))||'<span class="mu">—</span>',esc(accNm(SV().expAccs,c.expAcc))||'<span class="mu">—</span>',bd(c.active),canC()?btn('nic','e|'+c.id,'تعديل','o')+btn('dic',c.id,'حذف','r'):'']))}</div>`
   +`<p class="mu">التصنيف يحمل حسابات افتراضية تَرثها كل الأصناف والخدمات التي تحمل اسمه (مثل: «تموين» ← إيرادات التموين / مصروف التموين). حساب الصنف نفسه يتغلّب على حساب التصنيف. أنشئ حسابات الإيراد والمصروف من دليل الحسابات أولًا.</p>`;
};
A.nic=arg=>{if(!canC())return;const id=(arg||'').startsWith('e|')?arg.slice(2):'',x=id?SV().cats.find(c=>c.id==id):{active:true};if(id&&!x)return;
  mdl(id?'تعديل تصنيف '+x.code:'تصنيف جديد',fld('اسم التصنيف','name',x.name||'','text','full')
   +sel('حساب الإيراد الافتراضي','revAcc',[['','— بدون —']].concat(SV().revAccs.map(a=>[a.id,a.code+' · '+a.name])),x.revAcc||'')
   +sel('حساب المصروف الافتراضي','expAcc',[['','— بدون —']].concat(SV().expAccs.map(a=>[a.id,a.code+' · '+a.name])),x.expAcc||'')
   +(id?sel('الحالة','active',[['true','نشط'],['false','موقوف']],x.active?'true':'false'):''),
   ()=>{const o=rd();if(!(o.name||'').trim()){toast('أدخل اسم التصنيف',1);return false}return run('saveICat',{...o,id:id||undefined,ver:x.ver},'تم حفظ التصنيف').then(r=>r!==false)})};
A.dic=i=>{const x=SV().cats.find(c=>c.id==i);if(x&&confirm('حذف التصنيف «'+x.name+'»؟'))run('delICat',{id:i},'تم الحذف')};

/* ---------- التنقل ---------- */
const wrap=(k,items)=>{const m=MODS[k];if(!m)return;const o=m.nav;m.nav=()=>o().concat(items())};
wrap('sal',()=>[['s_svc','دليل الخدمات']]);
wrap('proc',()=>canP()?[['p_svc','دليل الخدمات']]:[]);
if(typeof NAVX!=='undefined'&&NAVX.acc)NAVX.acc.push(['c_icat','تصنيفات الأصناف']);
})();
