/* =====================================================================
   مديول المصروفات (مستقل): تسجيل ← اعتماد (سلسلة الاعتماد) ← صرف بقيد محاسبي + تصنيفات + تقارير متعددة الأبعاد
   ===================================================================== */
(()=>{
MODS.exp={title:'المصروفات',has:()=>D.user.mods&&D.user.mods.exp,nav:()=>[['x_dash','لوحة التحكم'],['c_exp','المصروفات'],['x_cat','تصنيفات المصروفات'],['c_exr','تقارير المصروفات']].concat(NAVX.exp)};
const ST={T:null,loading:0,err:'',q:'',st:'',cat:'',R:null,rl:0,rerr:'',dim:'cat',from:today().slice(0,4)+'-01-01',to:today()};
const role=()=>D.user.role==='admin'?'admin':D.user.exp;
const canW=()=>['admin','manager','officer'].includes(role())&&canV('c','c_exp');
const isMgr=()=>['admin','manager'].includes(role());
const COL={'مسودة':'#c77a00','معتمد':'#1d5fa8','مدفوع':'var(--ok)','مرفوض':'#b3261e','ملغي':'#777'};
const bd=s=>`<span class="st" style="background:${COL[s]||'#777'};color:#fff">${esc(s)}</span>`;
const rr=()=>{if(['c_exp','c_exr','x_dash','x_cat'].includes(view))render()};
const load=force=>{if(force)ST.T=null;if(!ST.T&&!ST.loading){ST.loading=1;ST.err='';api('listExp').then(j=>{ST.T=j;ST.loading=0;rr()}).catch(e=>{ST.loading=0;ST.err=e.message;rr()})}return ST.T};
const mut=async(a,d,msg)=>{const j=await run(a,d,msg);ST.T=null;ST.R=null;DB.D=null;rr();return j};
const find=i=>((ST.T||{}).list||[]).find(x=>x.id==i);
const nm=(L,id)=>((L||[]).find(x=>x.id==id)||{}).name||'—';
const opts=(L,none)=>[['',none]].concat((L||[]).map(x=>[x.id,x.name]));
A.exre=()=>{ST.err='';ST.T=null;rr()};

V.c_exp=()=>{const T=load(),ttl='المصروفات';
  if(ST.err)return head(ttl)+`<div class="box" style="color:#c0392b">${esc(ST.err)} <button class="b s" data-a="exre">إعادة المحاولة</button></div>`;
  if(!T)return head(ttl)+'<div class="box mu">جارٍ التحميل…</div>';
  const ym=today().slice(0,7),sum=(f)=>T.list.filter(f).reduce((s,x)=>s+x.amount,0);
  const cards=[['مصروف هذا الشهر (معتمد + مدفوع)',f(sum(x=>x.date.startsWith(ym)&&['معتمد','مدفوع'].includes(x.st)))],['بانتظار الاعتماد',T.list.filter(x=>x.st==='مسودة').length+' — '+f(sum(x=>x.st==='مسودة'))],['معتمد وبانتظار الصرف',T.list.filter(x=>x.st==='معتمد').length+' — '+f(sum(x=>x.st==='معتمد'))],['مدفوع هذا الشهر',f(sum(x=>x.date.startsWith(ym)&&x.st==='مدفوع'))]];
  const q=ST.q.trim();
  const L=T.list.filter(x=>(!ST.st||x.st===ST.st)&&(!ST.cat||x.cat===ST.cat)&&(!q||(x.no+x.payee+x.desc+x.ref+x.catName).includes(q)));
  const me=D.user.username;
  const acts=x=>{let b=btn('vex',x.id,'عرض','o');
    if(canW()&&['مسودة','مرفوض'].includes(x.st)&&(x.by===me||isMgr()))b+=btn('nex',x.id,'تعديل','o');
    if(canW()&&['مسودة','مرفوض','ملغي'].includes(x.st)&&(x.by===me||isMgr()))b+=btn('dlx',x.id,'حذف','r');
    if(x.st==='مسودة'&&canV('a','c_exp')&&(isMgr()||(D.ap&&D.ap.mine))&&x.by!==me||x.st==='مسودة'&&D.user.role==='admin')b+=btn('apx',x.id,'اعتماد','g')+btn('rjx',x.id,'رفض','r');
    if(canW()&&x.st==='معتمد'&&T.linked&&canV('a','c_exp'))b+=btn('expy',x.id,'صرف','g');
    if(canW()&&x.st!=='ملغي')b+=btn('dpx',x.id,'نسخ','o');
    if(canW()&&x.st!=='ملغي'&&(['مسودة','معتمد','مرفوض'].includes(x.st)&&(x.by===me||isMgr())||x.st==='مدفوع'&&isMgr()))b+=btn('clx',x.id,'إلغاء','r');
    return b};
  return head(ttl,canW()?'nex':'','+ مصروف جديد',`<input placeholder="بحث" value="${esc(ST.q)}" oninput="exF('q',this.value)" style="width:150px"><select onchange="exF('st',this.value)"><option value="">كل الحالات</option>${['مسودة','معتمد','مدفوع','مرفوض','ملغي'].map(s=>`<option${ST.st===s?' selected':''}>${s}</option>`).join('')}</select><select onchange="exF('cat',this.value)"><option value="">كل التصنيفات</option>${T.cats.map(c=>`<option value="${esc(c.id)}"${ST.cat===c.id?' selected':''}>${esc(c.name)}</option>`).join('')}</select>`)
   +`<div class="cards">${cards.map(c=>`<div class="card"><div class="mu">${c[0]}</div><b>${c[1]}</b></div>`).join('')}</div>`
   +(!T.cats.length?`<div class="box">لا توجد تصنيفات بعد. ${isMgr()?'<button class="b s g" data-a="go" data-i="x_cat">افتح «تصنيفات المصروفات» لإنشائها</button>':'اطلب من مدير المصروفات إنشاءها.'}</div>`:'')
   +`<div class="box">${tbl(['الرقم','التاريخ','التصنيف','المدفوع له','البيان','المبلغ','الفرع','الحالة',''],L.map(x=>[esc(x.no),esc(x.date),esc(x.catName),esc(x.payee),esc(x.desc.length>40?x.desc.slice(0,40)+'…':x.desc),f(x.amount),esc(x.proj||'—'),bd(x.st)+(x.st==='مرفوض'&&x.reason?`<br><small class="mu">${esc(x.reason)}</small>`:''),acts(x)]))}</div>
   <p class="mu">الدورة: تسجيل ← اعتماد (حسب سلسلة الاعتماد التي حدّدها المدير لنوع «المصروفات») ← صرف من خزينة/بنك بقيد تلقائي (مدين حساب المصروف / دائن الخزينة). تُنسب المصروفات للفرع / الفرع ومركز التكلفة فتظهر في التقارير والتحليل متعدد الأبعاد، وتُفحص موازنة الفرع عند الاعتماد.</p>`};
window.exF=(k,v)=>{ST[k]=v;rr()};

A.nex=i=>{const T=ST.T;if(!T||!canW())return;const x=i?find(i):{date:today(),method:'نقدي',cat:'',amount:''};if(!x)return;
  const act=T.cats.filter(c=>c.active);
  mdl(i?'تعديل مصروف '+x.no:'مصروف جديد',
   fld('التاريخ','date',x.date,'date')+sel('التصنيف','cat',[['','— اختر —']].concat(act.map(c=>[c.id,c.name+(c.budget?'':'')])),x.cat||'')
   +fld('المبلغ (ج.م)','amount',x.amount,'number')+sel('طريقة الدفع','method',T.methods.map(m=>[m,m]),x.method||'نقدي')
   +fld('المدفوع له (مورد / جهة / شخص)','payee',x.payee||'','text','full')
   +sel('مورد (اختياري)','sup',opts(T.sups,'— بدون —'),x.sup||'')+sel('موظف (اختياري)','emp',opts(T.emps,'— بدون —'),x.emp||'')
   +fld('البيان','desc',x.desc||'','ta','full')+fld('رقم الفاتورة / المرجع','ref',x.ref||'')
   +fld('الفرع (كود)','proj',x.proj||'','text')+sel('مركز التكلفة','cc',opts(T.ccs,'— بدون —'),x.cc||'')
   +(T.cash.length?sel('حساب الصرف المقترح','cash',[['','— يحدّده المختص عند الصرف —']].concat(T.cash.map(c=>[c.id,c.code+' · '+c.name])),x.cash||''):'')
   +(i?attBox('EXP',i):'<div class="full mu">بعد الحفظ يمكنك إرفاق صورة الفاتورة.</div>'),
   ()=>{const o=rd();if(!o.cat){toast('اختر التصنيف',1);return false}if(!(+o.amount>0)){toast('أدخل المبلغ',1);return false}if(!o.desc.trim()){toast('اكتب البيان',1);return false}if(i){o.id=i;o.ver=x.ver}return mut('saveExp',o,i?'تم الحفظ':'تم تسجيل المصروف وإرساله للاعتماد')});
  if(i&&typeof attInit==='function')attInit()};
A.dlx=i=>{const x=find(i);if(x&&confirm('حذف المصروف '+x.no+' نهائيًا؟'))run('delExp',{id:i},'تم حذف المصروف')};
A.vex=i=>{const x=find(i),T=ST.T;if(!x)return;
  mdl('مصروف '+x.no,kv('التاريخ',x.date)+kv('التصنيف',x.catName)+kv('المبلغ',f(x.amount)+' ج.م')+kv('المدفوع له',x.payee)+(x.supName?kv('المورد',x.supName):'')+kv('طريقة الدفع',x.method)+kv('البيان',x.desc)+(x.ref?kv('المرجع',x.ref):'')+kv('الفرع',x.proj||'—')+kv('مركز التكلفة',nm(T.ccs,x.cc))+kv('الحالة',x.st)+(x.reason?kv('السبب',x.reason):'')+kv('سجّله',x.byName)+(x.actBy?kv('آخر إجراء',x.actBy):'')+(x.payDate?kv('تاريخ الصرف',x.payDate)+kv('من حساب',nm((T.cash||[]).map(c=>({id:c.id,name:c.code+' · '+c.name})),x.cash)):'')+attBox('EXP',x.id),null);
  if(typeof attInit==='function')attInit()};
A.apx=i=>{const x=find(i);if(!x)return;
  mdl('اعتماد المصروف '+x.no,`<div class="full">${esc(x.payee)} — <b>${f(x.amount)}</b> ج.م — ${esc(x.catName)}</div><div class="full mu">إن كان لهذا النوع سلسلة اعتماد فسيُسجَّل اعتمادك لمرحلتك وينتقل للمرحلة التالية، والمرحلة الأخيرة تُعتمد نهائيًا.</div>`,()=>mut('approveExp',{id:i,ver:x.ver},'تم الاعتماد'),'اعتماد')};
A.rjx=i=>{const x=find(i);if(!x)return;mdl('رفض المصروف '+x.no,fld('سبب الرفض','reason','','ta','full'),()=>{const r=rd().reason.trim();if(!r){toast('اكتب سبب الرفض',1);return false}return mut('rejectExp',{id:i,ver:x.ver,reason:r},'تم الرفض')},'رفض')};
A.expy=i=>{const x=find(i),T=ST.T;if(!x)return;
  mdl('صرف المصروف '+x.no,`<div class="full">${esc(x.payee)} — <b>${f(x.amount)}</b> ج.م</div>`+sel('الصرف من','cash',[['','— اختر —']].concat(T.cash.map(c=>[c.id,c.code+' · '+c.name])),x.cash||'')+fld('تاريخ الصرف','date',today(),'date'),()=>{const o=rd();if(!o.cash){toast('اختر حساب الصرف',1);return false}return mut('payExp',{id:i,ver:x.ver,cash:o.cash,date:o.date},'تم الصرف وترحيل القيد')},'صرف')};
A.clx=i=>{const x=find(i);if(!x)return;mdl('إلغاء المصروف '+x.no,(x.st==='مدفوع'?'<div class="full mu">سيُعكس قيد الصرف.</div>':'')+fld('السبب','reason','','text','full'),()=>mut('cancelExp',{id:i,ver:x.ver,reason:rd().reason},'تم الإلغاء'),'إلغاء المصروف')};
A.dpx=i=>{if(confirm('نسخ هذا المصروف كمسودة جديدة بتاريخ اليوم؟'))mut('dupExp',{id:i},'تم النسخ — راجعه واعتمد')};
/* ---------- تصنيفات المصروفات (تاب مستقل) ---------- */
const CT={C:null,l:0,err:''};
const loadC=force=>{if(force)CT.C=null;if(!CT.C&&!CT.l){CT.l=1;CT.err='';api('expCats').then(j=>{CT.C=j;CT.l=0;rr()}).catch(e=>{CT.l=0;CT.err=e.message;rr()})}return CT.C};
const mutC=async(a,d,msg)=>{const j=await run(a,d,msg);CT.C=null;ST.T=null;rr();return j};
V.x_cat=()=>{const C=loadC(),ttl='تصنيفات المصروفات';
  if(CT.err)return head(ttl)+`<div class="box" style="color:#c0392b">${esc(CT.err)} <button class="b s" data-a="xcre">إعادة المحاولة</button></div>`;
  if(!C)return head(ttl)+'<div class="box mu">جارٍ التحميل…</div>';
  return head(ttl,isMgr()?'nxc':'','+ تصنيف',isMgr()?'<button class="b o" data-a="xseed">إنشاء من حسابات المصروف</button>':'')
   +`<div class="cards"><div class="card"><div class="mu">عدد التصنيفات</div><b>${C.cats.length}</b></div><div class="card"><div class="mu">فعّالة</div><b>${C.cats.filter(c=>c.active).length}</b></div><div class="card"><div class="mu">بموازنة سنوية</div><b>${C.cats.filter(c=>c.budget>0).length}</b></div></div>`
   +`<div class="box">${tbl(['الكود','التصنيف','حساب المصروف','الموازنة السنوية','عدد المصروفات','الحالة',''],C.cats.map(c=>[esc(c.code),esc(c.name),esc(c.accName),c.budget?f(c.budget):'—',c.used,st(c.active?'فعّال':'موقوف'),isMgr()?btn('nxc',c.id,'تعديل','o')+(c.used?'':btn('dxc',c.id,'حذف','r')):'']))}</div>
   <p class="mu">كل تصنيف مرتبط بحساب مصروف في دليل الحسابات؛ عند صرف المصروف يُقيَّد على هذا الحساب تلقائيًا. الموازنة السنوية اختيارية وتظهر في تقارير المصروفات ولوحة التحكم. التصنيف الذي عليه مصروفات يُوقَف ولا يُحذف.</p>`};
A.xcre=()=>{CT.err='';CT.C=null;rr()};
A.nxc=i=>{const C=CT.C;if(!C||!isMgr())return;const x=i?C.cats.find(c=>c.id==i):{active:true};if(!x)return;
  mdl(i?'تعديل تصنيف':'تصنيف جديد',fld('اسم التصنيف','name',x.name||'','text','full')+sel('حساب المصروف (من دليل الحسابات)','acc',[['','— اختر —']].concat(C.accs.map(a=>[a.id,a.name])),x.acc||'')+fld('الموازنة السنوية (اختياري)','budget',x.budget||'','number')+sel('الحالة','active',[['true','فعّال'],['false','موقوف']],String(x.active!==false)),
   ()=>{const o=rd();if(!o.name.trim()||!o.acc){toast('أدخل الاسم واختر الحساب',1);return false}if(i){o.id=i;o.ver=x.ver}return mutC('saveExpCat',o,'تم الحفظ')})};
A.dxc=i=>{if(confirm('حذف التصنيف؟'))mutC('delExpCat',{id:i},'تم الحذف')};
A.xseed=async()=>{const j=await mutC('seedExpCats',{},'');if(j&&j!==false)toast('أُنشئ '+j.n+' تصنيف')};

/* ---------- لوحة التحكم ---------- */
const DB={D:null,l:0,err:''};
const loadD=force=>{if(force)DB.D=null;if(!DB.D&&!DB.l){DB.l=1;DB.err='';api('expDash').then(j=>{DB.D=j;DB.l=0;rr()}).catch(e=>{DB.l=0;DB.err=e.message;rr()})}return DB.D};
A.xdre=()=>{DB.D=null;DB.err='';rr()};
const bar=(v,mx,c)=>`<div style="background:var(--l);border-radius:4px;height:10px;min-width:80px"><div style="width:${Math.min(100,Math.round(v/Math.max(mx,1)*100))}%;background:${c||'var(--p)'};height:10px;border-radius:4px"></div></div>`;
V.x_dash=()=>{const J=loadD(),ttl='لوحة تحكم المصروفات';
  if(DB.err)return head(ttl)+`<div class="box" style="color:#c0392b">${esc(DB.err)} <button class="b s" data-a="xdre">إعادة المحاولة</button></div>`;
  if(!J)return head(ttl)+'<div class="box mu">جارٍ التحميل…</div>';
  const k=J.k,mx=Math.max(1,...J.months.map(m=>m.v)),mt=Math.max(1,...J.top.map(t=>t.v));
  const card=(l,v,a,i)=>`<div class="card"${a?` style="cursor:pointer" data-a="${a}" data-i="${i||''}"`:''}><div class="mu">${l}</div><b>${v}</b></div>`;
  return head(ttl,canW()?'nex':'','+ مصروف جديد','<button class="b o" data-a="xdre">تحديث</button>')
   +`<div class="cards">${card('مصروف هذا الشهر',f(k.month))}${card('مصروف هذه السنة',f(k.year))}${card('بانتظار الاعتماد',k.pendN+' — '+f(k.pend),'go','c_exp')}${card('معتمد بانتظار الصرف',k.apprN+' — '+f(k.appr),'go','c_exp')}${k.rejN?card('مرفوض',k.rejN,'go','c_exp'):''}</div>`
   +`<div class="box"><h3>آخر 6 أشهر</h3>${tbl(['الشهر','المنصرف','التوزيع'],J.months.map(m=>[m.m,f(m.v),bar(m.v,mx)]))}</div>`
   +`<div class="box"><h3>أعلى التصنيفات هذا الشهر</h3>${tbl(['التصنيف','المنصرف','التوزيع'],J.top.map(t=>[esc(t.name),f(t.v),bar(t.v,mt)]))}</div>`
   +(J.budgets.length?`<div class="box"><h3>استهلاك الموازنة السنوية (بالتصنيف)</h3>${tbl(['التصنيف','الموازنة','المنصرف','%','الاستهلاك'],J.budgets.map(b=>[esc(b.name),f(b.budget),f(b.spent),`<b style="color:${b.pct>100?'#b3261e':b.pct>80?'#c77a00':'inherit'}">${b.pct}%</b>`,bar(b.spent,b.budget,b.pct>100?'#b3261e':b.pct>80?'#c77a00':'')]))}</div>`:'')
   +`<div class="box"><h3>آخر المصروفات</h3>${tbl(['الرقم','التاريخ','التصنيف','المدفوع له','المبلغ','الحالة',''],J.recent.map(x=>[esc(x.no),esc(x.date),esc(x.cat),esc(x.payee),f(x.amount),bd(x.st),btn('go','c_exp','فتح','o')]))}</div>`};

/* ---------- التقارير ---------- */
const DIMS=[['cat','التصنيف'],['proj','الفرع'],['month','الشهر'],['payee','المدفوع له'],['method','طريقة الدفع']];
const loadR=()=>{if(!ST.R&&!ST.rl){ST.rl=1;ST.rerr='';api('expRep',{from:ST.from,to:ST.to}).then(j=>{ST.R=j;ST.rl=0;rr()}).catch(e=>{ST.rl=0;ST.rerr=e.message;ST.R={by:{},totals:{}};rr()})}return ST.R};
V.c_exr=()=>{const R=loadR(),ttl='تقارير المصروفات';
  const bar=`<div class="box" style="display:flex;gap:8px;flex-wrap:wrap;align-items:end"><label>من<input type="date" value="${esc(ST.from)}" onchange="exR('from',this.value)"></label><label>إلى<input type="date" value="${esc(ST.to)}" onchange="exR('to',this.value)"></label><span style="flex:1"></span>${DIMS.map(d=>`<button class="b s${ST.dim===d[0]?'':' o'}" data-a="exdim" data-i="${d[0]}">${d[1]}</button>`).join('')}</div>`;
  if(!R)return head(ttl)+bar+'<div class="box mu">جارٍ التحميل…</div>';
  if(ST.rerr)return head(ttl)+bar+`<div class="box" style="color:#c0392b">${esc(ST.rerr)}</div>`;
  const t=R.totals,L=R.by[ST.dim]||[],mx=Math.max(1,...L.map(x=>x.total+x.pending));
  const cards=[['إجمالي المنصرف (مدفوع + معتمد)',f(t.total)],['مدفوع',f(t.paid)],['معتمد بانتظار الصرف',f(t.approved)],['مسودات بانتظار الاعتماد',f(t.pending)],['عدد المصروفات',t.n]];
  const hasB=ST.dim==='cat';
  return head(ttl)+bar+`<div class="cards">${cards.map(c=>`<div class="card"><div class="mu">${c[0]}</div><b>${c[1]}</b></div>`).join('')}</div>
  <div class="box">${tbl([DIMS.find(d=>d[0]===ST.dim)[1],'العدد','مدفوع','معتمد','مسودات','الإجمالي','التوزيع'].concat(hasB?['الموازنة السنوية','% منها']:[]),L.map(x=>[esc(x.name),x.n,f(x.paid),f(x.approved),f(x.pending),`<b>${f(x.total)}</b>`,`<div style="background:var(--l);border-radius:4px;height:10px;min-width:100px"><div style="width:${Math.round(x.total/mx*100)}%;background:var(--p);height:10px;border-radius:4px"></div></div>`].concat(hasB?[x.budget?f(x.budget):'—',x.budget?`<b style="color:${x.total>x.budget?'#b3261e':'inherit'}">${Math.round(x.total/x.budget*100)}%</b>`:'—']:[])))}</div>
  <p class="mu">الفترة حسب تاريخ المصروف. «الإجمالي» = المدفوع + المعتمد. نسبة الموازنة تقارن إجمالي الفترة بالموازنة السنوية للتصنيف.</p>`};
window.exR=(k,v)=>{ST[k]=v;ST.R=null;rr()};
A.exdim=i=>{ST.dim=i;rr()};
})();
