/* =====================================================================
   مديول المشتريات: لوحة التحكم، طلبات الشراء، أوامر التوريد، الموردون
   يعتمد على نواة الواجهة في index.html (D, A, V, MODS, mdl, run, tbl ...)
   ===================================================================== */
(()=>{
const L=x=>r2((+x.q||0)*(+x.p||0)),sum=it=>r2(it.reduce((s,x)=>s+L(x),0)),VT=p=>r2(sum(p.items)*(+p.vat||0)/100),T=p=>r2(sum(p.items)+VT(p));
const supN=id=>(D.sup.find(s=>s.id==id)||{}).name||'—';
const ver=(k,id)=>D[k].find(x=>x.id==id);
const canAvail=()=>is('admin','approver','procurement')||(D.user.inv&&D.user.inv!=='none');
const catItem=id=>D.catalog.find(i=>i.id==id);
const apOf=id=>(D.acc.ap||[]).find(x=>x.po==id);
const canPayNow=p=>S().accLink&&tl('c_ap')===''&&D.acc.payAccts.length&&apOf(p.id)&&apOf(p.id).o>0.004;

MODS.proc={title:'المشتريات',has:()=>D.user.mods.proc,nav:()=>{
  const N=[['p_dash','لوحة التحكم'],['p_pr','طلبات الشراء']];
  if(is('admin','approver','procurement','finance'))N.push(['p_po','أوامر التوريد']);
  if(is('admin','procurement'))N.push(['p_sup','الموردون']);
  return N;
}};

/* ---------- محرر البنود (مع ربط اختياري بصنف المخزن) ---------- */
const copts=s=>'<option value="">— بدون ربط بالمخزن —</option>'+D.catalog.map(i=>`<option value="${esc(i.id)}"${i.id==s?' selected':''}>${esc(i.code)} · ${esc(i.name)}</option>`).join('');
const prow=(x={})=>`<tr><td${D.catalog.length?'':' hidden'}><select class="lk">${copts(x.it)}</select><div class="sub av"></div></td><td><input value="${esc(x.d)}" placeholder="البيان"></td><td><input value="${esc(x.u)}" style="width:70px"></td><td><input type="number" min="0" step="any" value="${x.q??''}" style="width:75px" oninput="pcalc()"></td><td><input type="number" min="0" step="any" value="${x.p??''}" style="width:95px" oninput="pcalc()"></td><td class="lt">${f(L(x))}</td><td><button type="button" class="b s r" onclick="this.closest('tr').remove();pcalc()">✕</button></td></tr>`;
const ped=it=>`<div class="full" style="overflow-x:auto"><table id="it"><thead><tr><th${D.catalog.length?'':' hidden'}>صنف المخزن (اختياري)</th><th>البيان</th><th>الوحدة</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th><th></th></tr></thead><tbody>${(it.length?it:[{}]).map(prow).join('')}</tbody></table><button type="button" class="b o s" style="margin-top:6px" onclick="$('#it tbody').insertAdjacentHTML('beforeend',prow())">+ إضافة بند</button> <b id="sm" style="float:left"></b></div>`;
const pgi=()=>$$('#it tbody tr').map(r=>{const i=r.querySelectorAll('input');return{it:r.querySelector('select').value,d:i[0].value.trim(),u:i[1].value.trim(),q:+i[2].value||0,p:+i[3].value||0}}).filter(x=>x.d);
window.prow=prow;
window.pcalc=()=>{if(!$('#it'))return;let s=0;$$('#it tbody tr').forEach(r=>{const i=r.querySelectorAll('input'),t=L({q:i[2].value,p:i[3].value});r.querySelector('.lt').textContent=f(t);s+=t;
  const sl=r.querySelector('select'),av=r.querySelector('.av');if(sl&&av)av.textContent=(sl.value&&canAvail())?'المتاح بالمخزن: '+q3(D.avail[sl.value]||0):''});
  $('#sm').textContent='الإجمالي: '+f(r2(s))};
mdlHook=()=>window.pcalc();
// عند اختيار صنف من المخزن: نملأ البيان والوحدة لو كانت فارغة
dlg.addEventListener('change',e=>{
  if(!(e.target&&e.target.matches&&e.target.matches('#it select.lk')))return;
  const r=e.target.closest('tr'),i=r.querySelectorAll('input'),c=catItem(e.target.value);
  if(c){if(!i[0].value.trim())i[0].value=c.name;if(!i[1].value.trim())i[1].value=c.unit}
  window.pcalc();
});

const itemsView=(it,vat,rec)=>{
  const sb=sum(it),showAv=canAvail()&&it.some(x=>x.it),showRec=Array.isArray(rec);
  const h=['م','البيان','الوحدة','الكمية','السعر','الإجمالي'];if(showRec)h.push('المستلم');if(showAv)h.push('المتاح بالمخزن');
  const rows=it.map((x,n)=>{const r=[n+1,esc(x.d)+(x.it&&catItem(x.it)?`<br><small class="mu">صنف مخزني: ${esc(catItem(x.it).code)}</small>`:''),esc(x.u),x.q,f(x.p),f(L(x))];if(showRec)r.push(q3(rec[n]||0)+' / '+q3(x.q));if(showAv)r.push(x.it?q3(D.avail[x.it]||0):'—');return r});
  return `<div class="full" style="overflow-x:auto">${tbl(h,rows)}<p style="text-align:left"><b>${vat!=null?`قبل الضريبة: ${f(sb)} — الضريبة (${vat}%): ${f(r2(sb*vat/100))} — الإجمالي: ${f(sb+r2(sb*vat/100))}`:`الإجمالي التقديري: ${f(sb)}`}</b></p></div>`;
};

/* ---------- لوحة التحكم ---------- */
V.p_dash=()=>{const me=D.user.username,all=is('admin','approver','procurement','finance'),po=D.po.filter(p=>p.st!='ملغي'),by={};po.forEach(p=>by[p.sup]=(by[p.sup]||0)+T(p));
const e=Object.entries(by).sort((a,b)=>b[1]-a[1]).slice(0,6),mx=e[0]?e[0][1]:1,n=(l,s)=>l.filter(x=>x.st==s).length;
const apPay=(D.acc.ap||[]).filter(x=>x.o>0.004).length,todo=(is('admin','approver')?n(D.pr,'جديد')+n(D.po,'مسودة'):0)+(is('admin','procurement')?n(D.pr,'معتمد')+(S().invLink?0:n(D.po,'معتمد')):0)+(is('admin','finance')?(S().accLink?apPay:n(D.po,'مستلم')):0)+D.pr.filter(x=>x.by==me&&x.st=='مرفوض').length;
const cd=[['بانتظار إجراء منك',todo]];
if(all)cd.push(['طلبات شراء جديدة',n(D.pr,'جديد')],['أوامر قيد التنفيذ',n(D.po,'مسودة')+n(D.po,'معتمد')+n(D.po,'مستلم جزئيًا')],['إجمالي المشتريات (ج.م)',f(po.reduce((s,p)=>s+T(p),0))],['مستحق السداد (ج.م)',S().accLink?f((D.acc.ap||[]).reduce((s,x)=>s+x.o,0)):f(po.filter(p=>['معتمد','مستلم جزئيًا','مستلم'].includes(p.st)).reduce((s,p)=>s+T(p),0))]);
else cd.push(['إجمالي طلباتي',D.pr.length],['قيد الاعتماد',n(D.pr,'جديد')],['معتمدة',n(D.pr,'معتمد')+n(D.pr,'محوّل')],['مرفوضة',n(D.pr,'مرفوض')]);
return `<div class="cards">${cd.map(c=>`<div class="card"><small>${c[0]}</small><h2>${c[1]}</h2></div>`).join('')}</div>`+
(all?`<div class="box"><h3>أعلى الموردين إنفاقًا</h3>${e.length?e.map(x=>`<div style="display:flex;gap:10px;align-items:center;margin:6px 0"><span style="width:160px">${esc(supN(x[0]))}</span><div style="flex:1"><div class="bar" style="width:${x[1]/mx*100}%"></div></div><b>${f(x[1])}</b></div>`).join(''):'<span class="mu">لا توجد أوامر توريد بعد</span>'}</div>`:'')+
`<div class="box"><h3>آخر طلبات الشراء</h3>${tbl(['الرقم','التاريخ','الجهة','الفرع','التقدير','الحالة'],D.pr.slice(0,5).map(p=>[p.no,p.date,esc(dpl(p.dept)),esc(pjl(p.proj)),f(sum(p.items)),st(p.st)]))}</div>`+
(all?`<div class="box"><h3>آخر أوامر التوريد</h3>${tbl(['الرقم','التاريخ','المورد','الإجمالي','الحالة'],D.po.slice(0,5).map(p=>[p.no,p.date,esc(supN(p.sup)),f(T(p)),st(p.st)]))}</div>`:'')};

/* ---------- طلبات الشراء ---------- */
V.p_pr=()=>{const me=D.user.username;return head('طلبات الشراء','npr','+ طلب شراء جديد')+`<div class="box">${tbl(['الرقم','التاريخ','الطالب','الجهة','الفرع','التقدير (ج.م)','الحالة','إجراءات'],D.pr.map(x=>{const own=x.by==me;let b=btn('vpr',x.id,'عرض','o')+btn('ppr',x.id,'طباعة','g')+btn('pprx',x.id,'Excel','g');
if(x.st=='جديد'&&is('admin','approver')&&(!own||is('admin')))b+=btn('ok',x.id,'اعتماد')+btn('rj',x.id,'رفض','r');
if((own||is('admin'))&&['جديد','مرفوض'].includes(x.st))b+=btn('npr',x.id,x.st=='مرفوض'?'تعديل وإعادة إرسال':'تعديل','o');
if(x.st=='معتمد'&&is('admin','procurement'))b+=btn('cv',x.id,'تحويل لأمر توريد','g');
if(x.st!='محوّل'&&(is('admin')||(own&&x.st=='جديد')))b+=btn('dpr',x.id,'حذف','r');
return[x.no,x.date,esc(x.byName),esc(dpl(x.dept)),esc(pjl(x.proj)),f(sum(x.items)),st(x.st)+(x.st=='مرفوض'&&x.reason?`<br><small class="mu">${esc(x.reason)}</small>`:''),b]}))}</div>`};
A.vpr=i=>{const x=ver('pr',i);mdl('طلب شراء '+x.no,kv('الرقم',x.no)+kv('الحالة',x.st)+kv('الطالب',x.byName)+kv('التاريخ',x.date)+kv('الجهة',dpl(x.dept))+kv('الفرع',pjl(x.proj))+(x.reason?kv('سبب الرفض',x.reason):'')+(x.actBy?kv('آخر إجراء بواسطة',x.actBy):'')+itemsView(x.items)+attBox('PR',x.id)+(x.note?`<div class="full"><label>ملاحظات</label>${esc(x.note)}</div>`:'')+`<div class="full">${btn('ppr',x.id,'طباعة','g')} ${btn('pprx',x.id,'Excel','g')}</div>`,null)};
A.npr=i=>{const x=i?ver('pr',i):{items:[],date:today()};mdl(i?'تعديل طلب شراء':'طلب شراء جديد',dsl('الجهة / القسم الطالب',x.dept)+fld('التاريخ','date',x.date,'date')+psl('الفرع',x.proj,'full')+ped(x.items)+fld('ملاحظات','note',x.note,'ta','full'),()=>{const o=rd(),it=pgi();if(!o.dept.trim()||!it.length){toast('أدخل الجهة الطالبة وبندًا واحدًا على الأقل',1);return false}if(it.some(z=>z.q<=0)){toast('الكمية يجب أن تكون أكبر من صفر',1);return false}return run('savePR',{...o,items:it,id:i||undefined,ver:x.ver},'تم حفظ الطلب')})};
A.ok=i=>{if(confirm('اعتماد هذا الطلب؟'))run('decidePR',{id:i,ver:ver('pr',i).ver,decision:'معتمد'},'تم اعتماد الطلب')};
A.rj=i=>mdl('رفض الطلب '+ver('pr',i).no,fld('سبب الرفض (إلزامي)','reason','','ta','full'),()=>{const r=rd().reason.trim();if(!r){toast('اكتب سبب الرفض',1);return false}return run('decidePR',{id:i,ver:ver('pr',i).ver,decision:'مرفوض',reason:r},'تم رفض الطلب')},'تأكيد الرفض');
A.dpr=i=>{if(confirm('تأكيد حذف الطلب؟'))run('delPR',{id:i},'تم الحذف')};
A.cv=i=>A.npo('',i);
/* طباعة طلب الشراء (A4 بنفس هوية أمر التوريد) / تصدير Excel */
A.ppr=(i,xl)=>{const x=ver('pr',i);if(!x)return;const sb=sum(x.items),P=(l,t)=>t?`<p><b>${l}:</b> ${esc(t)}</p>`:'',ap=['معتمد','محوّل'].includes(x.st)&&x.actBy;
docOut(printHead('طلب شراء')+`
<div class="g"><div><h4>بيانات الطلب</h4>${P('رقم الطلب',x.no)+P('التاريخ',x.date)+P('الحالة',x.st)}</div><div><h4>الجهة الطالبة</h4>${P('الجهة / القسم',dpl(x.dept))+P('مقدّم الطلب',x.byName)+P('الفرع',pjl(x.proj))}</div></div>
<table><thead><tr><th>م</th><th>البيان</th><th>الوحدة</th><th>الكمية</th><th>السعر التقديري</th><th>الإجمالي</th></tr></thead><tbody>${x.items.map((z,n)=>`<tr><td>${n+1}</td><td>${esc(z.d)}</td><td>${esc(z.u)}</td><td>${z.q}</td><td>${f(z.p)}</td><td>${f(L(z))}</td></tr>`).join('')}</tbody></table>
<div class="tt"><p><span>الإجمالي التقديري (ج.م)</span><span>${f(sb)}</span></p></div>
${x.st=='مرفوض'&&x.reason?`<p><b>سبب الرفض:</b> ${esc(x.reason)}</p>`:''}${x.note?`<p><b>ملاحظات:</b> ${esc(x.note)}</p>`:''}<div class="sg"><div>مقدّم الطلب<br>${esc(x.byName)}</div><div>${ap?'المعتمد<br>'+esc(x.actBy):'مدير الإدارة / المعتمد'}</div><div>إدارة المشتريات</div></div>`+printFoot(),'طلب شراء '+x.no,xl)};
A.pprx=i=>A.ppr(i,1);

/* ---------- أوامر التوريد ---------- */
const recPct=p=>{if(!['معتمد','مستلم جزئيًا','مستلم','مدفوع'].includes(p.st))return '—';const tot=p.items.reduce((s,x)=>s+x.q*x.p,0)||1,got=p.items.reduce((s,x,i)=>s+Math.min(x.q,(p.rec||[])[i]||0)*x.p,0);return Math.round(got/tot*100)+'%'};
const nx=p=>{
  if(p.st=='مسودة')return['معتمد','اعتماد',['admin','approver']];
  if(p.st=='معتمد'&&!S().invLink)return['مستلم','تأكيد الاستلام',['admin','procurement']];
  if(p.st=='مستلم'&&!S().accLink)return['مدفوع','تسجيل السداد',['admin','finance']];
  return null;
};
V.p_po=()=>{const ac=S().accLink;return head('أوامر التوريد',is('admin','procurement')?'npo':'','+ أمر توريد جديد')+`<div class="box">${tbl(['الرقم','التاريخ','المورد','طلب الشراء','الإجمالي (ج.م)','الاستلام'].concat(ac?['المسدد','المتبقي للمورد']:[]).concat(['الحالة','إجراءات']),D.po.map(p=>{const n=nx(p),a=apOf(p.id);
return[p.no,p.date,esc(supN(p.sup)),esc(p.prno),f(T(p)),recPct(p)].concat(ac?[a?f(a.p):'—',a?f(a.o):'—']:[]).concat([st(p.st),
btn('vpo',p.id,'عرض','o')+(n&&is(...n[2])?btn('adv',p.id+'|'+n[0],n[1]):'')+(canPayNow(p)?btn('pay',p.id,'سداد','g'):'')+(['معتمد','مستلم جزئيًا'].includes(p.st)&&is('admin','procurement')?btn('cls',p.id,'إغلاق الاستلام','o'):'')+btn('pp',p.id,'طباعة','g')+btn('ppx',p.id,'Excel','g')+(p.st=='مسودة'&&is('admin','procurement')?btn('npo',p.id,'تعديل','o'):'')+(['مسودة','معتمد'].includes(p.st)&&is('admin','procurement')?btn('adv',p.id+'|ملغي','إلغاء','o'):'')+(is('admin')&&['مسودة','ملغي'].includes(p.st)?btn('dpo',p.id,'حذف','r'):'')])}))}</div>`};
A.vpo=i=>{const p=ver('po',i),s=D.sup.find(x=>x.id==p.sup)||{};mdl('أمر توريد '+p.no,kv('الرقم',p.no)+kv('الحالة',p.st)+kv('المورد',s.name)+kv('التاريخ',p.date)+kv('طلب الشراء',p.prno)+kv('الفرع',pjl(p.proj))+kv('موقع التسليم',p.loc)+kv('تاريخ التسليم',p.dd)+kv('نسبة الاستلام',recPct(p))+(Array.isArray(p.inv)&&p.inv.some(z=>+z)?kv('المفوتر (كميات)',p.inv.map((z,n)=>q3(z||0)+' / '+q3((p.items[n]||{}).q||0)).join(' ، ')):'')+(S().accLink&&apOf(p.id)?kv('المفوتر (شامل الضريبة)',f(apOf(p.id).b))+kv('المسدد',f(apOf(p.id).p))+kv('المتبقي للمورد',f(apOf(p.id).o)):'')+(p.actBy?kv('آخر إجراء بواسطة',p.actBy):'')+itemsView(p.items,p.vat,p.rec)+attBox('PO',p.id)+(p.note?`<div class="full"><label>ملاحظات</label>${esc(p.note)}</div>`:'')+`<div class="full">${btn('pp',p.id,'طباعة','g')} ${btn('ppx',p.id,'Excel','g')}</div>`,null)};
A.adv=i=>{const[id,to]=i.split('|');if(confirm(to=='ملغي'?'تأكيد إلغاء أمر التوريد؟':'تأكيد الإجراء؟'))run('advancePO',{id,ver:ver('po',id).ver,to},'تم تحديث الحالة')};
A.cls=i=>{const p=ver('po',i);mdl('إغلاق استلام '+p.no,`<div class="full mu">يُستخدم للخدمات (بدون استلام مخزني) أو لإقفال أمر استلم جزئيًا ولن يُورَّد باقيه. بعد الإغلاق يصبح الأمر "مستلم" وجاهزًا للسداد.</div>`+fld('سبب الإغلاق (إلزامي)','reason','','ta','full'),()=>{const r=rd().reason.trim();if(!r){toast('اكتب سبب الإغلاق',1);return false}return run('closeReceipt',{id:i,ver:p.ver,reason:r},'تم إغلاق الاستلام')},'تأكيد الإغلاق')};
A.dpo=i=>{if(confirm('تأكيد حذف أمر التوريد نهائيًا؟'))run('delPO',{id:i},'تم الحذف')};
A.npo=(i,prId)=>{if(!D.sup.length){toast('أضف مورّدًا أولًا',1);return}
const from=prId?ver('pr',prId):null;
const x=i?ver('po',i):{items:from?from.items:[],date:today(),vat:S().vat,pay:'تحويل بنكي',term:'خلال 15 يوم من الاستلام',proj:from?from.proj:'',prno:from?from.no:''};
mdl(i?'تعديل أمر توريد':'أمر توريد جديد',sel('المورد','sup',D.sup.map(s=>[s.id,s.name]),x.sup)+fld('التاريخ','date',x.date,'date')+fld('موقع التسليم','loc',x.loc)+fld('تاريخ التسليم','dd',x.dd,'date')+psl('الفرع',x.proj)+fld('رقم طلب الشراء','prno',x.prno)+fld('طريقة الدفع','pay',x.pay)+fld('مدة السداد','term',x.term)+fld('الضريبة %','vat',x.vat,'number')+ped(x.items)+fld('ملاحظات','note',x.note,'ta','full'),()=>{const o=rd(),it=pgi();if(!it.length||it.some(z=>z.q<=0)){toast('أضف بندًا واحدًا على الأقل بكمية أكبر من صفر',1);return false}return run('savePO',{...o,items:it,id:i||undefined,ver:x.ver,prId:from?from.id:undefined},'تم حفظ أمر التوريد')})};
A.pp=(i,x)=>{const p=ver('po',i),s=D.sup.find(x=>x.id==p.sup)||{},sb=sum(p.items),v=VT(p),P=(l,t)=>`<p><b>${l}:</b> ${esc(t)}</p>`;
docOut(printHead('أمر توريد')+`
<div class="g"><div><h4>بيانات أمر التوريد</h4>${P('رقم الأمر',p.no)+P('التاريخ',p.date)+P('رقم طلب الشراء',p.prno)+P('الفرع',pjl(p.proj))}</div><div><h4>بيانات المورد</h4>${P('الاسم',s.name)+P('العنوان',s.addr)+P('الهاتف',s.phone)+P('الرقم الضريبي',s.tax)}</div><div><h4>بيانات التسليم</h4>${P('الموقع',p.loc)+P('تاريخ التسليم',p.dd)}</div><div><h4>شروط الدفع</h4>${P('طريقة الدفع',p.pay)+P('مدة السداد',p.term)}</div></div>
<table><thead><tr><th>م</th><th>البيان</th><th>الوحدة</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th></tr></thead><tbody>${p.items.map((x,n)=>`<tr><td>${n+1}</td><td>${esc(x.d)}</td><td>${esc(x.u)}</td><td>${x.q}</td><td>${f(x.p)}</td><td>${f(L(x))}</td></tr>`).join('')}</tbody></table>
<div class="tt"><p><span>الإجمالي قبل الضريبة</span><span>${f(sb)}</span></p><p><span>الضريبة (${p.vat}%)</span><span>${f(v)}</span></p><p><span>الإجمالي النهائي (ج.م)</span><span>${f(sb+v)}</span></p></div>
${p.note?`<p><b>ملاحظات:</b> ${esc(p.note)}</p>`:''}<div class="sg"><div>أعدّه<br>${esc(p.byName)}</div><div>المدير المالي</div><div>المدير التنفيذي / الختم</div></div>`+printFoot(),'أمر توريد '+p.no,x)};
A.ppx=i=>A.pp(i,1);

/* ---------- الموردون ---------- */
V.p_sup=()=>head('الموردون','nsup','+ مورد جديد')+`<div class="box">${tbl(['الاسم','النشاط','الهاتف','العنوان','الرقم الضريبي','عدد الأوامر','إجمالي التعامل','الرصيد الختامي','إجراءات'],D.sup.map(s=>{const o=D.po.filter(p=>p.sup==s.id&&p.st!='ملغي');return[esc(s.name),esc(s.cat),esc(s.phone),esc(s.addr),esc(s.tax),o.length,f(o.reduce((a,p)=>a+T(p),0)),s.bal==null?'—':(Math.abs(s.bal)<0.005?'0.00':`<span style="color:${s.bal>0?'#b3261e':'var(--ok)'}" title="${s.bal>0?'مستحق للمورد':'مستحق على المورد'}">${f(Math.abs(s.bal))} ${s.bal>0?'دائن':'مدين'}</span>`),(typeof A.sst==='function'&&D.acc&&D.acc.linked&&D.user.mods.acc?btn('sst',s.id,'كشف حساب','g'):'')+btn('nsup',s.id,'تعديل','o')+btn('dsup',s.id,'حذف','r')]}))}</div>`;
A.nsup=i=>{const x=i?D.sup.find(s=>s.id==i):{};mdl(i?'تعديل مورد':'مورد جديد',fld('اسم المورد','name',x.name,'text','full')+fld('النشاط','cat',x.cat)+fld('الهاتف','phone',x.phone)+fld('العنوان','addr',x.addr)+fld('الرقم الضريبي','tax',x.tax),()=>{const o=rd();if(!o.name.trim()){toast('أدخل اسم المورد',1);return false}return run('saveSup',{...o,id:i||undefined},'تم حفظ المورد')})};
A.dsup=i=>{if(confirm('تأكيد حذف المورد؟'))run('delSup',{id:i},'تم الحذف')};
})();
