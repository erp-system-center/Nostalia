/* =====================================================================
   mod-catering.js — باقات المنيو + طلبات المناسبات (داخل مديول المبيعات)
   التابات: s_ord طلبات المناسبات، s_pkg باقات المنيو. الخادم: Catering.gs
   ===================================================================== */
(()=>{
const SL=()=>D.sal||{};
const role=()=>SL().role;
const canW=()=>['admin','officer','manager'].includes(role());
const isMgr=()=>['admin','manager'].includes(role());
const COL={'مسودة':'#c77a00','مؤكد':'#1d5fa8','قيد التنفيذ':'#6a3fa0','منفّذ':'var(--ok)','ملغي':'#777'};
const bd=s=>`<span class="st" style="background:${COL[s]||'#777'};color:#fff">${esc(s)}</span>`;
const noLink=t=>head(t)+'<div class="box mu">الربط المحاسبي غير مُفعَّل؛ يفعّله مدير النظام من مديول الحسابات.</div>';
const PKS=()=>SL().pkgs||[],ORD=()=>SL().ords||[],ITM=()=>SL().items||[];
const itemN=id=>{const i=ITM().find(z=>z.id==id);return i?i.name:'؟'};
const custN=id=>(SL().custs.find(c=>c.id==id)||{}).name||'';
const pfind=i=>PKS().find(x=>x.id==i),ofind=i=>ORD().find(x=>x.id==i);
const pkgTxt=p=>p.items.map(x=>esc(itemN(x.item))+' × '+x.q).join('، ');

/* ================= باقات المنيو ================= */
V.s_pkg=()=>{
  if(!SL().linked)return noLink('باقات المنيو');
  return head('باقات المنيو',canW()?'npk':'','+ باقة جديدة')
   +`<div class="box">${tbl(['الكود','الباقة','السعر','حساب الإيراد','محتوى الباقة','الحالة',''],PKS().map(p=>[esc(p.code),esc(p.name),f(p.price),esc((((D.svc||{}).revAccs||[]).find(a=>a.id==p.revAcc)||{}).name||'')||'<span class="mu">الافتراضي</span>',pkgTxt(p),p.active?'<span class="st">نشطة</span>':'<span class="st">موقوفة</span>',canW()?btn('npk',p.id,'تعديل','o')+(isMgr()?btn('dpk',p.id,'حذف','r'):''):'']))}</div>
   <p class="mu">الباقة = مجموعة منتجات بسعر بيع واحد (مثال: «بوفيه 100 فرد»). تُستخدم كبند في طلب المناسبة، وتُفرد تلقائيًا إلى أصنافها عند حساب التكلفة والاحتياج وأوامر التصنيع.</p>`;
};
const pkRow=(x={})=>`<tr><td><select class="pk_i" style="min-width:220px"><option value="">— اختر الصنف —</option>${ITM().map(i=>`<option value="${esc(i.id)}"${i.id==x.item?' selected':''}>${esc(i.code+' · '+i.name)}${i.pk?' ('+esc(i.pk)+')':''}</option>`).join('')}</select></td><td><input class="pk_q" type="number" min="0" step="any" value="${x.q??1}" style="width:90px"></td><td><button type="button" class="b s r" onclick="this.closest('tr').remove()">×</button></td></tr>`;
window.pkRowH=()=>pkRow();
A.npk=i=>{if(!canW())return;const x=i?pfind(i):{active:true,items:[{}]};if(i&&!x)return;
  mdl(i?'تعديل باقة '+x.code:'باقة جديدة',fld('اسم الباقة','name',x.name||'','text','full')+fld('سعر الباقة','price',x.price??'','number')+sel('حساب الإيراد (عند فوترة الطلب)','revAcc',[['','— إيرادات المبيعات (الافتراضي) —']].concat(((D.svc||{}).revAccs||[]).map(a=>[a.id,a.code+' · '+a.name])),x.revAcc||'')+(i?sel('الحالة','active',[['true','نشطة'],['false','موقوفة']],x.active?'true':'false'):'')
   +`<div class="full" style="overflow-x:auto"><table id="pkl"><thead><tr><th>الصنف</th><th>الكمية</th><th></th></tr></thead><tbody>${(x.items&&x.items.length?x.items:[{}]).map(pkRow).join('')}</tbody></table><button type="button" class="b o s" onclick="$('#pkl tbody').insertAdjacentHTML('beforeend',window.pkRowH())">+ صنف</button></div>`
   +fld('ملاحظات','note',x.note||'','ta','full'),
   ()=>{const o=rd(),it=$$('#pkl tbody tr').map(r=>({item:r.querySelector('.pk_i').value,q:+r.querySelector('.pk_q').value||0})).filter(l=>l.item&&l.q>0);
    if(!o.name.trim()){toast('أدخل اسم الباقة',1);return false}if(!it.length){toast('أضف صنفًا واحدًا على الأقل',1);return false}
    return run('savePkg',{...o,id:i||undefined,ver:x&&x.ver,items:it},'تم حفظ الباقة').then(r=>r!==false)})};
A.dpk=i=>{const x=pfind(i);if(x&&confirm('حذف الباقة «'+x.name+'»؟'))run('delPkg',{id:i},'تم الحذف')};

/* ================= طلبات المناسبات ================= */
const SO={st:''};
window.orF=(k,v)=>{SO[k]=v;render()};
const lnkInv=o=>o.sinv?SL().sinv.find(x=>x.id===o.sinv&&x.st!=='ملغي'):null;
V.s_ord=()=>{
  if(!SL().linked)return noLink('طلبات المناسبات');
  const t=today(),L=ORD().filter(x=>!SO.st||x.st===SO.st);
  const up=ORD().filter(x=>['مؤكد','قيد التنفيذ'].includes(x.st)&&x.evDate>=t);
  const acts=x=>{let b=btn('vor',x.id,'عرض','o');if(canW()&&x.st==='مسودة'&&(x.by===D.user.username||isMgr()))b+=btn('nor',x.id,'تعديل','o')+btn('dor',x.id,'حذف','r');return b};
  return head('طلبات المناسبات',canW()?'nor':'','+ طلب مناسبة',`<select onchange="orF('st',this.value)"><option value="">كل الحالات</option>${['مسودة','مؤكد','قيد التنفيذ','منفّذ','ملغي'].map(s=>`<option${SO.st===s?' selected':''}>${s}</option>`).join('')}</select>`)
   +`<div class="cards"><div class="card"><div class="mu">مناسبات قادمة (مؤكدة)</div><b>${up.length}</b></div><div class="card"><div class="mu">قيمتها</div><b>${f(up.reduce((s,x)=>s+x.total,0))}</b></div><div class="card"><div class="mu">عربون مستلم عليها</div><b>${f(up.reduce((s,x)=>s+x.deposit,0))}</b></div><div class="card"><div class="mu">مسودات</div><b>${ORD().filter(x=>x.st==='مسودة').length}</b></div></div>`
   +`<div class="box">${tbl(['الرقم','تاريخ المناسبة','العميل','الأفراد','الإجمالي','العربون','الحالة',''],L.map(x=>[esc(x.no),esc(x.evDate)+(x.evTime?' '+esc(x.evTime):''),esc(x.custName),x.guests||'—',f(x.total),x.deposit?f(x.deposit):'—',bd(x.st),acts(x)]))}</div>`;
};
window.catUpcoming=()=>{const t=today(),up=ORD().filter(x=>['مؤكد','قيد التنفيذ'].includes(x.st)&&x.evDate>=t).sort((a,b)=>a.evDate<b.evDate?-1:1).slice(0,6);
  return `<div class="box"><h3>مناسبات قادمة</h3>${up.length?tbl(['التاريخ','العميل','الأفراد','الإجمالي','الحالة'],up.map(x=>[esc(x.evDate),esc(x.custName),x.guests||'—',f(x.total),bd(x.st)])):'<span class="mu">لا مناسبات قادمة.</span>'}</div>`};

const opts=k=>k==='pkg'?PKS().filter(p=>p.active).map(p=>`<option value="${esc(p.id)}" data-p="${p.price}">${esc(p.code+' · '+p.name)}</option>`).join(''):ITM().map(i=>`<option value="${esc(i.id)}" data-p="${i.price||0}">${esc(i.code+' · '+i.name)}</option>`).join('');
const orRow=(x={})=>{const k=x.k||'item';return `<tr><td><select class="or_k"><option value="item"${k==='item'?' selected':''}>صنف</option><option value="pkg"${k==='pkg'?' selected':''}>باقة</option></select></td><td><select class="or_r" style="min-width:210px"><option value="">— اختر —</option>${opts(k).replace('value="'+(x.ref||'')+'"','value="'+(x.ref||'')+'" selected')}</select></td><td><input class="or_q" type="number" min="0" step="any" value="${x.q??1}" style="width:80px"></td><td><input class="or_p" type="number" min="0" step="any" value="${x.p??''}" style="width:100px"></td><td class="or_v">0.00</td><td><button type="button" class="b s r" onclick="this.closest('tr').remove();orCalc()">×</button></td></tr>`};
window.orRowH=()=>orRow();
const orGet=()=>$$('#orl tbody tr').map(r=>({k:r.querySelector('.or_k').value,ref:r.querySelector('.or_r').value,q:+r.querySelector('.or_q').value||0,p:r.querySelector('.or_p').value})).filter(l=>l.ref&&l.q>0);
window.orCalc=()=>{if(!$('#orl'))return;let sub=0;$$('#orl tbody tr').forEach(r=>{const v=r2((+r.querySelector('.or_q').value||0)*(+r.querySelector('.or_p').value||0));sub+=v;r.querySelector('.or_v').textContent=f(v)});
  const vp=+($('#m [name=vat]')||{}).value||0,va=r2(sub*vp/100),tot=r2(sub+va),g=+($('#m [name=guests]')||{}).value||0,e=$('#ort');
  if(e)e.innerHTML=`الإجمالي: <b>${f(sub)}</b> — الضريبة: <b>${f(va)}</b> — <b>الصافي: ${f(tot)}</b>${g>0?` — للفرد: <b>${f(r2(tot/g))}</b>`:''}`};
dlg.addEventListener('input',e=>{if(e.target&&e.target.closest&&(e.target.closest('#orl')||['vat','guests'].includes(e.target.name)))orCalc()});
dlg.addEventListener('change',e=>{const t=e.target;if(!t||!t.classList)return;const r=t.closest&&t.closest('#orl tr');if(!r)return;
  if(t.classList.contains('or_k')){r.querySelector('.or_r').innerHTML='<option value="">— اختر —</option>'+opts(t.value);r.querySelector('.or_p').value=''}
  if(t.classList.contains('or_r')){const o=t.selectedOptions[0];if(o&&o.value){const p=r.querySelector('.or_p');if(!+p.value)p.value=o.dataset.p||''}}
  orCalc()});
A.nor=i=>{if(!canW())return;const x=i?ofind(i):{date:today(),evDate:today(),lines:[{}],vat:SL().vat??14,deposit:0};if(i&&!x)return;
  const cu=SL().custs.filter(c=>c.active||c.id==x.cust);
  mdl(i?'تعديل طلب '+x.no:'طلب مناسبة جديد',
   sel('العميل','cust',[['','— اختر العميل —']].concat(cu.map(c=>[c.id,c.code+' · '+c.name])),x.cust||'','full')
   +fld('تاريخ الطلب','date',x.date,'date')+fld('تاريخ المناسبة','evDate',x.evDate,'date')+fld('وقت المناسبة','evTime',x.evTime||'','text')+fld('عدد الأفراد','guests',x.guests||'','number')
   +fld('مكان المناسبة','venue',x.venue||'','text','full')
   +`<div class="full" style="overflow-x:auto"><table id="orl"><thead><tr><th>النوع</th><th>الصنف / الباقة</th><th>الكمية</th><th>السعر</th><th>القيمة</th><th></th></tr></thead><tbody>${(x.lines&&x.lines.length?x.lines:[{}]).map(orRow).join('')}</tbody></table><button type="button" class="b o s" onclick="$('#orl tbody').insertAdjacentHTML('beforeend',window.orRowH());orCalc()">+ بند</button></div><div class="full" id="ort"></div>`
   +fld('نسبة الضريبة %','vat',x.vat??14,'number')+fld('العربون المتفق عليه','deposit',x.deposit||0,'number')
   +sel('الفرع','proj',[['','— بدون —']].concat((SL().projects||[]).map(p=>[p.id,p.code+' · '+p.name])),x.proj||'')
   +fld('ملاحظات','note',x.note||'','ta','full'),
   ()=>{const o=rd(),it=orGet();if(!o.cust){toast('اختر العميل',1);return false}if(!it.length){toast('أضف بندًا واحدًا على الأقل',1);return false}
    return run('saveOrd',{...o,id:i||undefined,ver:x.ver,items:it},'تم حفظ الطلب كمسودة').then(r=>r!==false)});
  orCalc()};
A.dor=i=>{if(confirm('حذف مسودة الطلب؟'))run('delOrd',{id:i},'تم الحذف')};

const orHtml=(x,pr)=>{const cu=SL().custs.find(c=>c.id==x.cust)||{},P=(l,t)=>t?`<p><b>${l}:</b> ${esc(t)}</p>`:'';
  return (pr?printHead('طلب مناسبة / عرض سعر'):'')+`<div class="g"><div>${P('رقم الطلب',x.no)+P('تاريخ الطلب',x.date)+P('تاريخ المناسبة',x.evDate+(x.evTime?' '+x.evTime:''))+P('المكان',x.venue)+P('عدد الأفراد',x.guests||'')+P('الحالة',x.st)}</div><div>${P('العميل',x.custName)+P('الهاتف',cu.phone)+P('العنوان',cu.addr)}</div></div>`
   +tbl(['البند','الوحدة','الكمية','السعر','القيمة'],x.lines.map(l=>[esc(l.d)+(l.k==='pkg'?'<br><small class="mu">'+(pfind(l.ref)?pkgTxt(pfind(l.ref)):'')+'</small>':''),esc(l.u),l.q,f(l.p),f(l.v)]).concat([['<b>الإجمالي</b>','','','','<b>'+f(x.sub)+'</b>'],['ضريبة القيمة المضافة '+x.vat+'%','','','',f(x.vatAmt)],['<b>الصافي</b>','','','','<b>'+f(x.total)+'</b>']].concat(x.depPaid?[['العربون المستلم','','','',f(x.depPaid)],['<b>المتبقي عند التسليم</b>','','','','<b>'+f(r2(x.total-x.depPaid))+'</b>']]:(x.deposit?[['العربون المتفق عليه','','','',f(x.deposit)]]:[]))))
   +(x.note?P('ملاحظات',x.note):'')+(pr?`<div class="sg"><div>أعدّه<br>${esc(x.byName)}</div><div>المدير</div><div>العميل</div></div>`+printFoot():'')};
A.vor=i=>{const x=ofind(i);if(!x)return;const iv=lnkInv(x),T={'مسودة':['مؤكد','تأكيد الطلب','g'],'مؤكد':['قيد التنفيذ','بدء التنفيذ','g'],'قيد التنفيذ':['منفّذ','تم التنفيذ','g']}[x.st];
  let b='';
  if(canW()&&T)b+=`<button class="b ${T[2]}" data-a="ogo" data-i="${esc(x.id+'|'+T[0])}">${T[1]}</button> `;
  b+=`<button class="b o" data-a="opl" data-i="${esc(x.id)}">التكلفة والاحتياج</button> `;
  if(canW()&&['مؤكد','قيد التنفيذ'].includes(x.st))b+=`<button class="b o" data-a="opr" data-i="${esc(x.id)}">طلب شراء للعجز</button> `;
  if(canW()&&['مؤكد','قيد التنفيذ','منفّذ'].includes(x.st)&&x.depPaid<x.total-0.004)b+=`<button class="b g" data-a="odp" data-i="${esc(x.id)}">تسجيل عربون</button> `;
  if(canW()&&['مؤكد','قيد التنفيذ'].includes(x.st)&&!x.mos.length)b+=`<button class="b o" data-a="omo" data-i="${esc(x.id)}">إنشاء أوامر تصنيع</button> `;
  if(canW()&&['مؤكد','قيد التنفيذ','منفّذ'].includes(x.st)&&!iv)b+=`<button class="b o" data-a="oiv" data-i="${esc(x.id)}">إنشاء فاتورة</button> `;
  if(canW()&&!['منفّذ','ملغي'].includes(x.st)&&(isMgr()||(x.st==='مسودة'&&x.by===D.user.username)))b+=`<button class="b r" data-a="ocx" data-i="${esc(x.id)}">إلغاء الطلب</button> `;
  b+=`<button class="b g" data-a="opp" data-i="${esc(x.id)}">طباعة</button> <button class="b g" data-a="opx" data-i="${esc(x.id)}">Excel</button>`;
  mdl('طلب مناسبة '+x.no,`<div class="full" style="overflow-x:auto">${orHtml(x,false)}</div>`
   +depBox(x)+(x.mos.length?`<div class="full mu">أوامر التصنيع المنشأة: ${x.mos.length} (راجعها في مديول التصنيع)</div>`:'')+(iv?`<div class="full mu">الفاتورة: <b>${esc(iv.no)}</b> (${esc(iv.st)})</div>`:'')+(x.reason?`<div class="full mu">سبب الإلغاء: ${esc(x.reason)}</div>`:'')+`<div class="full">${b}</div>`,null)};
const cashN=id=>{const a=(SL().cash||[]).find(z=>z.id==id);return a?a.name:'—'};
const depBox=x=>{const ap=(x.deps||[]).filter(p=>p.st==='مرحّل').reduce((s,p)=>s+p.applied,0);
  return `<div class="full"><b>العربون</b> <span class="mu">— المتفق عليه: ${f(x.deposit)} · المستلم: ${f(x.depPaid||0)} · المسوّى على الفواتير: ${f(ap)} · المتبقي على العميل من قيمة الطلب: ${f(r2(x.total-(x.depPaid||0)))}</span>${(x.deps||[]).length?tbl(['الرقم','التاريخ','الحساب','المبلغ','المسوّى','الحالة',''],x.deps.map(p=>[esc(p.no),esc(p.date),esc(cashN(p.acc)),f(p.amount),f(p.applied),bd(p.st==='مرحّل'?'مؤكد':'ملغي'),isMgr()&&p.st==='مرحّل'&&!p.applied?btn('odr',p.id,'عكس / رد','r'):''])):''}</div>`};
A.opp=i=>{const x=ofind(i);if(x)docOut(orHtml(x,true),'طلب مناسبة '+x.no)};
A.odp=i=>{const x=ofind(i);if(!x)return;dlg.close();const dueDep=Math.max(0,r2((x.deposit||0)-(x.depPaid||0))),rest=r2(x.total-(x.depPaid||0));
  setTimeout(()=>mdl('تسجيل عربون — '+x.no,`<div class="full mu">يُقيَّد: من حـ/ الخزينة أو البنك إلى حـ/ دفعات مقدمة من العملاء، ويُسوَّى تلقائيًا على فاتورة هذا الطلب عند ترحيلها. المتبقي من قيمة الطلب: ${f(rest)}.</div>`+fld('المبلغ','amount',dueDep||rest,'number')+fld('التاريخ','date',today(),'date')+sel('الخزينة / البنك','acc',[['','— اختر —']].concat((SL().cash||[]).map(a=>[a.id,a.code+' · '+a.name])))+fld('المرجع (رقم إيصال / تحويل)','ref','','text')+fld('ملاحظة','note','','ta','full'),
   ()=>{const o=rd();if(!(+o.amount>0)){toast('أدخل المبلغ',1);return false}if(!o.acc){toast('اختر الخزينة أو البنك',1);return false}return run('ordDeposit',{id:i,amount:o.amount,date:o.date,acc:o.acc,ref:o.ref,note:o.note},'تم تسجيل العربون').then(r=>r!==false)},'تسجيل'),50)};
A.odr=i=>{let dp=null;ORD().forEach(o=>(o.deps||[]).forEach(p=>{if(p.id==i)dp=p}));if(!dp)return;dlg.close();setTimeout(()=>mdl('عكس العربون '+dp.no,`<div class="full mu">يُنشأ قيد عكسي (رد العربون للعميل أو تصحيح خطأ). لا يجوز قبل عكس تسويته على أي فاتورة.</div>`+fld('السبب (إلزامي)','reason','','ta','full'),()=>{const r=rd().reason.trim();if(!r){toast('اكتب السبب',1);return false}return run('ordDepRev',{id:i,reason:r},'تم عكس العربون').then(z=>z!==false)},'تأكيد العكس'),50)};
A.opr=i=>{const x=ofind(i);if(!x)return;dlg.close();setTimeout(()=>mdl('طلب شراء لعجز الخامات — '+x.no,`<div class="full mu">يُنشأ طلب شراء (جديد، بانتظار الاعتماد) بالخامات المخزنية الناقصة فقط حسب «التكلفة والاحتياج». يتطلب صلاحية إنشاء طلبات شراء.</div>`+dsl('الجهة / القسم الطالب',D.user.dept||''),
   ()=>{const o=rd();if(!(o.dept||'').trim()){toast('اختر الجهة / القسم الطالب',1);return false}return run('ordPR',{id:i,dept:o.dept},'تم إنشاء طلب الشراء').then(r=>{if(r&&r.no)setTimeout(()=>toast('أُنشئ طلب الشراء '+r.no+' ('+r.count+' صنف)'),600);return r!==false})},'إنشاء'),50)};
A.opx=i=>{const x=ofind(i);if(x)docOut(orHtml(x,true),'طلب مناسبة '+x.no,1)};
A.ogo=p=>{const [id,to]=p.split('|'),x=ofind(id);if(!x)return;dlg.close();run('decideOrd',{id:id,ver:x.ver,to:to},'تم تحديث حالة الطلب')};
A.ocx=i=>{const x=ofind(i);if(!x)return;dlg.close();setTimeout(()=>mdl('إلغاء الطلب '+x.no,fld('سبب الإلغاء (إلزامي)','reason','','ta','full'),()=>{const r=rd().reason.trim();if(!r){toast('اكتب السبب',1);return false}return run('decideOrd',{id:i,ver:x.ver,to:'ملغي',reason:r},'تم إلغاء الطلب').then(z=>z!==false)},'تأكيد الإلغاء'),50)};
A.opl=async i=>{try{const j=await api('ordPlan',{id:i}),x=ofind(i),see=j.cost!==undefined;
  dlg.close();setTimeout(()=>mdl('التكلفة والاحتياج — '+x.no,
   `<div class="cards"><div class="card"><div class="mu">الإيراد (قبل الضريبة)</div><b>${f(j.revenue)}</b></div>${see?`<div class="card"><div class="mu">التكلفة التقديرية</div><b>${f(j.cost)}</b></div><div class="card"><div class="mu">الهامش</div><b>${f(j.margin)} (${j.marginPct}%)</b></div>${j.perGuest?`<div class="card"><div class="mu">إيراد الفرد</div><b>${f(j.perGuest)}</b></div>`:''}${j.indirect!==undefined?`<div class="card"><div class="mu">مصروفات غير مباشرة محمَّلة (${esc(j.allocRun.no)})</div><b>${f(j.indirect)}</b></div><div class="card"><div class="mu">التكلفة الكاملة</div><b>${f(j.fullCost)}</b></div><div class="card"><div class="mu">الهامش بعد التحميل</div><b>${f(j.fullMargin)} (${j.fullMarginPct}%)</b></div>`:''}${j.actual?`<div class="card"><div class="mu">التكلفة الفعلية (أوامر التصنيع ${j.actual.closed}/${j.actual.orders} مقفلة)</div><b>${f(j.actual.cost)}</b></div><div class="card"><div class="mu">الهامش الفعلي</div><b>${f(j.actual.margin)}</b></div>`:''}`:''}</div>`
   +`<div class="full" style="overflow-x:auto">${tbl(['البند','الكمية','السعر','القيمة'].concat(see?['تكلفة الوحدة','التكلفة']:[]),j.lines.map(l=>[esc(l.d),l.q,f(l.p),f(l.v)].concat(see?[f(l.unitCost),f(l.cost)]:[])))}</div>`
   +`<div class="full"><b>احتياج الخامات مقابل الرصيد (كل المخازن)</b>${tbl(['الصنف','الوحدة','المطلوب','المتاح','العجز'],j.needs.map(n=>[esc(n.name),esc(n.unit),n.need,n.stock,n.short>0?`<b style="color:#b3261e">${n.short}</b>`:'—']))}</div>`
   +`<div class="full mu">التكلفة تقديرية: من قوائم المواد (متوسط تكلفة الخامات الحالي + عمالة وأعباء مراكز العمل)، وليست التكلفة الفعلية. الأصناف بلا قائمة مواد تُحتسب بمتوسط تكلفتها في المخزن. الاحتياج يعرض أصناف المخزون فقط.${j.indirect!==undefined?' المصروفات غير المباشرة من تشغيل التحميل '+esc(j.allocRun.no)+' ('+esc(j.allocRun.from)+' → '+esc(j.allocRun.to)+') بنصيب الوحدة لكل منتج.':''}</div>`,null),50)}catch(e){toast(e.message,1)}};
A.omo=i=>{const x=ofind(i);if(!x)return;const W=(SL().whs||[]).map(w=>[w.id,w.name]);dlg.close();
  setTimeout(()=>mdl('أوامر تصنيع للطلب '+x.no,`<div class="full mu">سيُنشأ أمر تصنيع (مسودة) لكل منتج له قائمة مواد، بكميات الطلب (الباقات تُفرد لأصنافها) وتاريخ تسليم = تاريخ المناسبة. يتطلب صلاحية في مديول التصنيع، ويحتاج اعتمادًا هناك.</div>`+sel('مخزن الخامات','whSrc',[['','— اختر —']].concat(W))+sel('مخزن المنتج التام','whDst',[['','— اختر —']].concat(W)),
   async()=>{const o=rd();if(!o.whSrc||!o.whDst){toast('اختر المخزنين',1);return false}const j=await run('ordMO',{id:i,whSrc:o.whSrc,whDst:o.whDst},'تم إنشاء أوامر التصنيع');if(j===false)return false;if(j&&j.skipped&&j.skipped.length)setTimeout(()=>toast('بلا قائمة مواد (لم يُنشأ لها أمر): '+j.skipped.join('، '),1),1200);return true},'إنشاء'),50)};
A.oiv=i=>{const x=ofind(i);if(!x)return;const stock=x.lines.some(l=>l.k==='item'&&(ITM().find(z=>z.id==l.item)||{}).type==='مخزني'),W=(SL().whs||[]).map(w=>[w.id,w.name]);dlg.close();
  setTimeout(()=>mdl('إنشاء فاتورة من الطلب '+x.no,`<div class="full mu">تُنشأ فاتورة مبيعات (مسودة) بنفس البنود. الباقات تظهر كبند خدمة واحد بسعرها (دون خصم مخزني).${x.deposit?' العربون ('+f(x.deposit)+') لا يُسجَّل محاسبيًا هنا؛ سجّله كتحصيل بعد ترحيل الفاتورة.':''}</div>`+(stock?sel('مخزن الصرف (للأصناف المخزنية)','wh',[['','— اختر —']].concat(W)):''),
   ()=>{const o=rd();if(stock&&!o.wh){toast('اختر المخزن',1);return false}return run('ordInvoice',{id:i,wh:o.wh||undefined},'تم إنشاء الفاتورة كمسودة').then(r=>r!==false)},'إنشاء'),50)};
})();
