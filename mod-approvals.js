/* =====================================================================
   وحدة «الاعتمادات»: اعتماداتي + إعداد سلاسل الاعتماد لكل المستندات + التفويض + سجل السلاسل
   ===================================================================== */
(()=>{
const ST={T:null,loading:0,err:'',H:null,hl:0};
const uN=n=>{const u=(D.users||[]).find(x=>x.username===n);return u?u.name:n};
const AP=()=>D.ap||{kinds:[],rules:[],deleg:[],n:0,mine:false};
const adm=()=>D.user&&D.user.role==='admin';
const rr=()=>{if(['ap_in','ap_cfg','ap_dl','ap_hist'].includes(view))render()};
const loadIn=force=>{if(force)ST.T=null;if(!ST.T&&!ST.loading){ST.loading=1;ST.err='';api('wfInbox').then(j=>{ST.T=j;ST.loading=0;rr()}).catch(e=>{ST.loading=0;ST.err=e.message;rr()})}return ST.T};
const mut=async(a,d,msg)=>{const j=await run(a,d,msg);ST.T=null;rr();return j};
MOD_ORDER.splice(1,0,'ap');
MODS.ap={title:'الاعتمادات',has:()=>!!D.user&&(adm()||AP().mine),
 nav:()=>{const n=[['ap_in','اعتماداتي']];if(adm()||AP().mine)n.push(['ap_dl','التفويض']);if(adm()){n.push(['ap_cfg','سلاسل الاعتماد']);n.push(['ap_hist','سجل السلاسل'])}return n}};
const chainTxt=r=>r.levels.map((l,i)=>(i+1)+') '+esc(l.name)+': '+esc((l.users||[]).map(uN).concat((l.profs||[]).map(p=>'دور '+((D.profiles||[]).find(x=>x.id==p)||{name:p}).name)).join('، ')+(l.fin?' <span class="tag" title="يُنفَّذ التأكيد/الصرف تلقائيًا مع الاعتماد">+ تنفيذ مالي</span>':''))).join('<br>');
const prog=x=>{const t=[];for(let i=0;i<x.of;i++)t.push(`<span style="display:inline-block;width:18px;height:8px;border-radius:4px;margin-inline-end:2px;background:${i<x.steps.length?'var(--ok)':i===x.steps.length?'#d9a441':'#ccc'}"></span>`);return t.join('')+`<br><small class="mu">${esc(x.levelName)} (${x.level}/${x.of})</small>`};

V.ap_in=()=>{const T=loadIn();
  if(ST.err)return `<div class="box">تعذّر التحميل: ${esc(ST.err)} <button class="b s o" data-a="apre">إعادة</button></div>`;
  if(!T)return '<div class="box mu">جارٍ التحميل…</div>';
  const L=T.list;
  return head('اعتماداتي — ما ينتظر قرارك','apre','تحديث')+`<div class="box">${L.length?tbl(['النوع','المستند','المبلغ','أعدّه','السلسلة والمرحلة','التقدّم',''],L.map(x=>[esc(x.label),`<b>${esc(x.desc)}</b>`,x.amount?f(x.amount):'—',esc(x.byName||uN(x.by)||'—'),esc(x.chain),prog(x),
    (x.mine?btn('api1',x.kind+'|'+x.doc,'اعتماد','g')+(x.rej?btn('apr1',x.kind+'|'+x.doc,'رفض','r'):''):'<small class="mu">للمتابعة (ليس دورك)</small>')+btn('apo',x.kind+'|'+x.doc,'فتح','o')])):'<p class="mu" style="text-align:center;padding:14px">لا شيء ينتظر اعتمادك الآن ✓</p>'}</div>
  <p class="mu">كل مستند يمر بالمراحل التي حدّدها مدير النظام بالترتيب. عند اعتمادك مرحلة غير أخيرة ينتقل المستند للمرحلة التالية ويصلها إشعار، والمرحلة الأخيرة تُنفّذ الاعتماد الفعلي.</p>`};
const pick=i=>{const [k,id]=String(i).split('|');return {x:((ST.T||{}).list||[]).find(a=>a.kind===k&&a.doc===id),k,id}};
A.apre=()=>{ST.T=null;rr()};
A.api1=i=>{const {x}=pick(i);if(!x)return;
  mdl('اعتماد '+x.desc,`<div class="full">المرحلة: <b>${esc(x.levelName)}</b> (${x.level} من ${x.of}) — ${esc(x.label)}${x.amount?' — المبلغ '+f(x.amount):''}</div>`+fld('ملاحظة (اختياري)','note','','ta','full'),
   ()=>mut(x.act,Object.assign({id:x.doc,ver:x.ver,note:rd().note},x.args),'تم الاعتماد'),'اعتماد')};
A.apr1=i=>{const {x}=pick(i);if(!x||!x.rej)return;
  mdl('رفض '+x.desc,fld('سبب الرفض','reason','','ta','full'),()=>{const r=rd().reason.trim();if(!r){toast('اكتب سبب الرفض',1);return false}return mut(x.rejAct,Object.assign({id:x.doc,ver:x.ver,reason:r},x.rej),'تم الرفض')},'رفض')};
A.apo=i=>{const {x}=pick(i);if(!x)return;const NTT={REQ:['inv','i_req'],CNT:['inv','i_cnt'],JE:['acc','c_je'],LV:['hr','h_lv'],PAY:['hr','h_pay'],MO:['mfg','m_mo'],ADV:['acc','c_adv']}[x.kind];
  if(NTT&&MODS[NTT[0]]&&MODS[NTT[0]].has()){A.mod(NTT[0]);A.go(NTT[1])}else toast('ليس لديك وصول لشاشة هذا المستند — يمكنك الاعتماد من هنا',1)};

/* ---------- إعداد السلاسل: نظرة شاملة لكل أنواع المستندات ---------- */
A.nwk=k=>{window.__wfk=k;try{A.nwf('')}finally{window.__wfk=null}};
V.ap_cfg=()=>{const P=AP(),R=P.rules;
  const rows=P.kinds.map(k=>{const rs=R.filter(r=>r.kind===k.kind);
    return [`<b>${esc(k.label)}</b>`,rs.length?rs.map(r=>`<div style="margin-bottom:6px">${st(r.active?'فعّالة':'موقوفة')} <b>${esc(r.name)}</b> <small class="mu">(${f(r.min)} ← ${r.max?f(r.max):'∞'})</small><br><small>${chainTxt(r)}</small> ${btn('nwf',r.id,'تعديل','o')}${btn('xwf',r.id,'حذف','r')}</div>`).join(''):'<span class="mu">بدون سلسلة — اعتماد بخطوة واحدة</span>',btn('nwk',k.kind,'+ سلسلة','g')]});
  return head('سلاسل الاعتماد لكل المستندات')+`<div class="box">${tbl(['المستند','السلاسل (حسب المبلغ)',''],rows)}</div>
  <p class="mu">اختر نوع المستند ثم عرّف المراحل بالترتيب (مثال: المالية ثم المدير). المرحلة تضم أشخاصًا و/أو أدوارًا، ولا يعتمد الشخص مرحلتين ولا مستندَه، ويتجاوز المدير العام المراحل. المرحلة الأخيرة تنفّذ الاعتماد الفعلي، وتشترط صلاحية «الاعتماد» في تاب المستند حسب صلاحيات المستخدم.</p>`};
V.ap_dl=()=>{const W=AP().deleg;
  return head('تفويض الاعتماد (أثناء الإجازة/الغياب)','ndl','+ تفويض')+`<div class="box">${tbl(['من','إلى (المفوَّض)','من تاريخ','إلى تاريخ','ملاحظة','الحالة',''],W.map(x=>[esc(uN(x.from)),esc(uN(x.to)),esc(x.start),esc(x.end),esc(x.note||''),st(!x.active?'موقوف':(x.end<today()?'منتهٍ':(x.start>today()?'قادم':'ساري'))),btn('ndl',x.id,'تعديل','o')+btn('xdl',x.id,'حذف','r')]))}</div>`};
V.ap_hist=()=>{if(!ST.H&&!ST.hl){ST.hl=1;api('wfRuns').then(j=>{ST.H=j;ST.hl=0;rr()}).catch(()=>{ST.hl=0;ST.H={list:[]};rr()})}
  if(!ST.H)return '<div class="box mu">جارٍ التحميل…</div>';
  return head('سجل سلاسل الاعتماد')+`<div class="box">${tbl(['التاريخ','النوع','المستند','السلسلة','الحالة','المراحل المنفّذة'],ST.H.list.map(r=>[esc((r.at||'').slice(0,10)),esc(((AP().kinds||[]).find(k=>k.kind===r.kind)||{}).label||r.kind),esc(r.no||r.doc),esc(r.name),st(r.st),r.steps.map(s=>esc(s.name)+': '+esc(s.byName||s.by)).join('<br>')||'—']))}</div>`};
/* ---------- بناء السلسلة بشارات (أسهل من القوائم المتعددة) ---------- */
const prN=id=>((D.profiles||[]).find(x=>x.id==id)||{name:id}).name;
const apc=(k,v)=>`<span class="apc" data-k="${k}" data-v="${esc(v)}">${k==='p'?'دور: ':''}${esc(k==='p'?prN(v):uN(v))}<b data-a="apcx" title="إزالة">×</b></span>`;
const lvOpts=()=>'<option value="">+ إضافة معتمد أو دور…</option><optgroup label="أشخاص">'+(D.users||[]).filter(u=>u.active!==false).map(u=>`<option value="u:${esc(u.username)}">${esc(u.name)} (${esc(u.username)})</option>`).join('')+'</optgroup>'+((D.profiles||[]).length?'<optgroup label="أدوار (كل من له الدور)">'+(D.profiles||[]).map(p=>`<option value="p:${esc(p.id)}">دور: ${esc(p.name)}</option>`).join('')+'</optgroup>':'');
const lvRow2=(l={})=>`<div class="lvr box" style="padding:8px;margin:6px 0"><div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><b class="lvn"></b><input class="ln" placeholder="اسم المرحلة (مثال: المالية)" value="${esc(l.name||'')}" style="flex:1;min-width:140px"><button type="button" class="b s o" data-a="lvup" title="تقديم">▲</button><button type="button" class="b s o" data-a="lvdn" title="تأخير">▼</button><button type="button" class="b s r" data-a="lvx">حذف</button></div><div class="chs" style="margin:6px 0;display:flex;gap:4px;flex-wrap:wrap">${(l.users||[]).map(u=>apc('u',u)).join('')}${(l.profs||[]).map(p=>apc('p',p)).join('')}</div><select class="ladd">${lvOpts()}</select><label class="chk" style="display:flex;gap:6px;align-items:center;font-size:12px;margin-top:6px"><input type="checkbox" class="lfin" style="width:auto"${l.fin?' checked':''}> هذه المرحلة تشمل التنفيذ المالي (مدير حسابات): يُطبَّق التأكيد/الصرف تلقائيًا مع الاعتماد دون انتظار الحسابات — يسري على المرحلة الأخيرة</label></div>`;
const lvGet=()=>$$('#lvs .lvr').map(r=>({name:r.querySelector('.ln').value.trim(),users:[...r.querySelectorAll('.apc[data-k=u]')].map(c=>c.dataset.v),profs:[...r.querySelectorAll('.apc[data-k=p]')].map(c=>c.dataset.v),fin:!!(r.querySelector('.lfin')||{}).checked}));
const lvPv=()=>{const r=$$('#lvs .lvr');r.forEach((e,i)=>{e.querySelector('.lvn').textContent='المرحلة '+(i+1)});const pv=$('#lvpv');if(!pv)return;
  const L=lvGet();pv.innerHTML='<b>مسار الاعتماد:</b> المستند ← '+(L.map((l,i)=>`<span class="tag">${esc(l.name||('المرحلة '+(i+1)))}: ${esc(l.users.map(uN).concat(l.profs.map(p=>'دور '+prN(p))).join('، ')||'— لم يُحدَّد —')}</span>`).join(' ← ')||'—')+' ← يُنفَّذ الاعتماد'};
A.lvadd=()=>{$('#lvs').insertAdjacentHTML('beforeend',lvRow2());lvPv()};
A.lvx=()=>{const e=window.event&&window.event.target&&window.event.target.closest('.lvr');if(e&&$$('#lvs .lvr').length>1){e.remove();lvPv()}else toast('لا بد من مرحلة واحدة على الأقل',1)};
A.lvup=()=>{const e=window.event.target.closest('.lvr'),p=e.previousElementSibling;if(p){p.before(e);lvPv()}};
A.lvdn=()=>{const e=window.event.target.closest('.lvr'),n=e.nextElementSibling;if(n){n.after(e);lvPv()}};
A.apcx=()=>{const c=window.event.target.closest('.apc');if(c){c.remove();lvPv()}};
document.addEventListener('change',e=>{const s=e.target;if(!s.classList||!s.classList.contains('ladd')||!s.value)return;
  const [k,v]=s.value.split(/:(.*)/s),row=s.closest('.lvr');
  if(!row.querySelector(`.apc[data-k=${k}][data-v="${CSS.escape(v)}"]`))row.querySelector('.chs').insertAdjacentHTML('beforeend',apc(k,v));
  s.value='';lvPv()});
document.addEventListener('input',e=>{if(e.target.closest&&e.target.closest('#lvs'))lvPv()});
A.nwf=i=>{const x=i?AP().rules.find(r=>r.id==i):{kind:window.__wfk||'PR',min:0,max:0,levels:[{}],active:true};if(!x)return;
  mdl(i?'تعديل سلسلة اعتماد':'سلسلة اعتماد جديدة',
   fld('اسم السلسلة','name',x.name,'text','full')+sel('ينطبق على','kind',(AP().kinds||[]).map(k=>[k.kind,k.label]),x.kind)+sel('الحالة','active',[['true','فعّالة'],['false','موقوفة']],String(x.active!==false))
   +fld('من مبلغ (0 = من أول جنيه)','min',x.min,'number')+fld('إلى مبلغ (0 = بلا حد أعلى)','max',x.max,'number')
   +`<div class="full"><label>المراحل بالترتيب — اختر من القائمة لإضافة معتمد (شخص أو دور) وسيظهر كشارة تُزال بـ ×</label><div id="lvs">${x.levels.map(lvRow2).join('')}</div><button type="button" class="b o s" data-a="lvadd">+ مرحلة</button></div>
   <div class="full box mu" id="lvpv" style="padding:8px"></div>
   <div class="full mu" style="font-size:12px">• لا يعتمد صاحب المستند مستنده، ولا يعتمد الشخص مرحلتين. • يتجاوز المدير العام المراحل. • المرحلة الأخيرة تنفّذ الاعتماد الفعلي. • الإشعار يصل لمعتمدي المرحلة الحالية فقط.</div>`,
   ()=>{const o=rd();if(i)o.id=i;o.levels=lvGet();
     for(const [n,l] of o.levels.entries())if(!l.users.length&&!l.profs.length){toast('المرحلة '+(n+1)+': أضف معتمدًا أو دورًا',1);return false}
     return run('saveWf',o,'تم الحفظ')});lvPv()};

/* ---------- إخفاء أزرار الاعتماد عمّن ليس معتمد المرحلة الحالية ---------- */
const BM={pst:'JE',rjj:'JE',lva:'LV',lvr:'LV',rok:'REQ',rrj:'REQ',cok:'CNT',crj:'CNT',apm:'MO',iad:'ADV',pya:'PAY',ok:'PR|PO',rj:'PR|PO'};
let hq=0;
const hideAp=()=>{hq=0;const P=D.ap;if(!P||!D.user||D.user.role==='admin'||!(P.chain||[]).length)return;
  const ch=new Set(P.chain),mn=new Set(P.mineDocs||[]);
  document.querySelectorAll('button[data-a]').forEach(b=>{let ks=BM[b.dataset.a],id=b.dataset.i||'';
    if(b.dataset.a==='adv'){const [d,to]=id.split('|');if(to!=='معتمد')return;ks='PO';id=d}
    if(!ks)return;const k=ks.split('|').find(z=>ch.has(z+'|'+id));
    if(k&&!mn.has(k+'|'+id)){const sp=document.createElement('small');sp.className='mu';sp.textContent='بانتظار المعتمد';b.replaceWith(sp)}})};
new MutationObserver(()=>{if(!hq){hq=1;requestAnimationFrame(hideAp)}}).observe(document.body,{childList:true,subtree:true});
{const st=document.createElement('style');st.textContent='.apc{display:inline-flex;align-items:center;gap:4px;background:var(--s);color:var(--t);border:1px solid var(--p);border-radius:14px;padding:2px 8px;font-size:12px}.apc b{cursor:pointer;color:#b03030}.tag{display:inline-block;background:var(--s);color:var(--t);border:1px solid var(--l);border-radius:10px;padding:1px 8px;margin:1px}';document.head.appendChild(st)}

})();
