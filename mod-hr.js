/* =====================================================================
   مديول الموارد البشرية: الموظفون، الإجازات، الرواتب (مسير + قيد تلقائي + صرف)
   ===================================================================== */
(()=>{
const HR=()=>D.hr;
const hrole=()=>HR().role;
const isM=()=>['admin','manager'].includes(hrole());
const canW=()=>['admin','manager','officer'].includes(hrole());
const sal=()=>hrole()!=='viewer';
const opt=a=>a.map(x=>[x,x]);
const emO=id=>HR().emps.find(e=>e.id==id)||{};
const emN=id=>{const e=emO(id);return e.code?e.code+' · '+e.name:'—'};
const canPayHr=()=>['admin','manager','accountant'].includes((D.acc||{}).role);
let SH={ym:today().slice(0,7)};
MODS.hr={title:'الموارد البشرية',has:()=>D.user.mods.hr&&D.hr,nav:()=>[['h_emp','الموظفون'],['h_lv','الإجازات'],['h_pay','الرواتب']]};

/* ---------- الموظفون ---------- */
V.h_emp=()=>{const L=HR().emps;
  return head('الموظفون',canW()?'nem':'','+ موظف')+`<div class="box">${tbl(['الكود','الاسم','الوظيفة','الإدارة','التعيين','الفرع الافتراضي'].concat(sal()?['الأساسي','البدلات','استقطاع ثابت']:[],['عهد/سلف (رصيد الدفتر)','الحالة','']),L.map(e=>[esc(e.code),`<b>${esc(e.name)}</b>`,esc(e.title),esc(e.dept?dpl(e.dept):''),esc(e.hire),esc(e.proj||'—')].concat(sal()?[f(e.basic),f(e.allow),f(e.ded)]:[],[(e.led||e.open)?`<b>${f(e.led||0)}</b>`+(Math.abs((e.led||0)-(e.open||0))>0.004?` <small class="mu">(مسجل ${f(e.open||0)})</small>`:''):'—',st(e.st),(canW()?btn('nem',e.id,'تعديل','o'):'')+btn('estmh',e.id,'كشف الحساب','g')+(isM()?(e.st==='نشط'?btn('tem',e.id,'إنهاء خدمة','r'):btn('rem',e.id,'إعادة تفعيل','o')):'')])))}</div>
<p class="mu">لا توجد جداول ضرائب/تأمينات نظامية: الاستقطاع الثابت يُدخل لكل موظف، وتُضاف استقطاعات إضافية في المسير. الأجر والبدلات يعدّلها مدير الموارد البشرية فقط.</p>`};
A.estmh=i=>A.estm(i);
A.nem=i=>{const x=i?emO(i):{hire:today(),leaveBal:21,basic:0,allow:0,ded:0};
  mdl(i?'تعديل موظف':'موظف جديد',fld('الاسم','name',x.name,'text','full')+fld('الرقم القومي','nid',x.nid)+fld('الوظيفة','title',x.title)+dsl('الإدارة','dept',x.dept||'')+fld('تاريخ التعيين','hire',x.hire,'date')+fld('الفرع الافتراضي لتحميل الراتب (كود)','proj',x.proj)
  +(isM()?fld('الأساسي الشهري','basic',x.basic,'number')+fld('البدلات','allow',x.allow,'number')+fld('استقطاع ثابت (تأمينات/ضرائب)','ded',x.ded,'number'):'<div class="full mu">الأجر والبدلات يحددها مدير الموارد البشرية.</div>')
  +fld('رصيد الإجازة السنوية (أيام)','leaveBal',x.leaveBal,'number')+fld('الحساب البنكي/المحفظة','bank',x.bank)+fld('الهاتف','phone',x.phone)+fld('البريد','email',x.email)+fld('ملاحظات','note',x.note,'text','full')+(i?attBox('EMP',i):''),
  ()=>{const o=rd();if(i){o.id=i;o.ver=x.ver}if(!isM()){delete o.basic;delete o.allow;delete o.ded;if(i){o.basic=x.basic;o.allow=x.allow;o.ded=x.ded}}return run('saveEmp',o,'تم الحفظ')});if(i)attInit&&attInit()};
A.tem=i=>{const e=emO(i);mdl('إنهاء خدمة '+e.name,fld('تاريخ انتهاء الخدمة','date',today(),'date'),()=>run('termEmp',{id:i,ver:e.ver,date:rd().date},'تم إنهاء الخدمة'),'تأكيد')};
A.rem=i=>{const e=emO(i);if(confirm('إعادة تفعيل '+e.name+'؟'))run('termEmp',{id:i,ver:e.ver,reactivate:true},'تم')};

/* ---------- الإجازات ---------- */
V.h_lv=()=>{const L=HR().leaves;
  return head('الإجازات',canW()?'nlv':'','+ طلب إجازة')+`<div class="box">${tbl(['الرقم','الموظف','النوع','من','إلى','الأيام','السبب','الحالة',''],L.map(x=>[esc(x.no),esc(emN(x.emp)),esc(x.kind),esc(x.from),esc(x.to),x.days,esc(x.reason),st(x.st),(isM()&&x.st==='معلقة'?btn('lva',x.id,'اعتماد','g')+btn('lvr',x.id,'رفض','r'):'')+(canW()&&['معلقة','معتمدة'].includes(x.st)?btn('lvc',x.id,'إلغاء','r'):'')]))}</div>
<div class="box"><h3>أرصدة الإجازة السنوية (${today().slice(0,4)})</h3>${tbl(['الموظف','الرصيد','المستخدم/المعلق','المتبقي'],HR().emps.filter(e=>e.st==='نشط').map(e=>{const u=L.filter(x=>x.emp===e.id&&x.kind==='سنوية'&&['معلقة','معتمدة'].includes(x.st)&&String(x.from).slice(0,4)===today().slice(0,4)).reduce((s,x)=>s+x.days,0);return[esc(e.code+' · '+e.name),e.leaveBal,u,e.leaveBal-u]}))}</div>`};
A.nlv=()=>mdl('طلب إجازة',sel('الموظف','emp',[['','— اختر —']].concat(HR().emps.filter(e=>e.st==='نشط').map(e=>[e.id,e.code+' · '+e.name])),'','full')+sel('النوع','kind',opt(HR().kinds),'سنوية')+fld('من','from',today(),'date')+fld('إلى','to',today(),'date')+fld('السبب','reason','','text','full'),()=>{const o=rd();if(!o.emp){toast('اختر الموظف',1);return false}return run('saveLeave',o,'تم تسجيل الطلب')});
A.lva=i=>{const x=HR().leaves.find(l=>l.id==i);run('decideLeave',{id:i,ver:x.ver,decision:'معتمدة'},'تم الاعتماد')};
A.lvr=i=>{const x=HR().leaves.find(l=>l.id==i);mdl('رفض الإجازة',fld('السبب','reason','','text','full'),()=>run('decideLeave',{id:i,ver:x.ver,decision:'مرفوضة',reason:rd().reason},'تم الرفض'),'رفض')};
A.lvc=i=>{const x=HR().leaves.find(l=>l.id==i);if(confirm('إلغاء الإجازة؟'))run('cancelLeave',{id:i,ver:x.ver},'تم الإلغاء')};

/* ---------- الرواتب ---------- */
V.h_pay=()=>{const L=HR().runs;
  return head('مسيرات الرواتب','')+(canW()&&hrole()!=='viewer'?`<div class="box"><div class="db" id="pyf">${fld('إعداد مسير لشهر','period',SH.ym,'month')}</div><button class="b g" data-a="ppp">إعداد المسير</button> <span class="mu">يُحتسب الأساسي والبدلات والاستقطاع الثابت لكل موظف مستحق (مع التناسب في شهر التعيين/إنهاء الخدمة)، ثم تضيف المكافآت والاستقطاعات وخصم السلف قبل الاعتماد.</span></div>`:'')+`<div class="box">${tbl(['الرقم','الشهر','الإجمالي','الاستقطاعات','الصافي','الحالة','أعدّه',''],L.map(r=>[esc(r.no),esc(r.period),f(r.gross),f(r.dedTotal),f(r.net),st(r.st),esc(r.byName),btn('vrn',r.id,'عرض','o')]))}</div>`};
A.ppp=async()=>{const p=rd('#pyf').period;SH.ym=p;const j=await run('prepPay',{period:p},'تم إعداد المسير');if(j)setTimeout(()=>A.vrn(j.id),400)};
const runTbl=(r,edit)=>{const t=tbl(['الكود','الموظف','الأساسي','البدلات','مكافأة','استقطاع ثابت','استقطاع إضافي','خصم سلفة','الصافي','ملاحظة','مصروف'],r.lines.map(l=>{const ee=emO(l.emp);const inp=(n,v,max)=>edit?`<input class="pl" data-e="${l.emp}" data-n="${n}" type="number" min="0" step="any" value="${v||0}" style="width:90px">`:f(v);return[esc(l.code),esc(l.name),f(l.basic),f(l.allow),inp('bonus',l.bonus),f(l.ded),inp('other',l.other),inp('advDed',l.advDed)+(edit&&ee.loan?`<br><small class="mu">سلف مفتوحة ${f(ee.loan)}</small>`:''),`<b>${f(l.net)}</b>`,esc(l.note||''),l.paid?'✔ '+esc(l.payNo||''):'—']}));return t};
A.vrn=i=>{const r=HR().runs.find(x=>x.id==i);if(!r)return;const draft=r.st==='مسودة';
  const acs=((D.acc&&D.acc.payAccts)||[]);
  mdl('مسير '+r.no+' — '+r.period+' ('+r.st+')',`<div class="full" style="overflow-x:auto">${runTbl(r,draft&&canW())}</div><div class="full">الإجمالي ${f(r.gross)} — استقطاعات ${f(r.dedTotal)} — الصافي <b>${f(r.net)}</b></div>`
   +(r.payJes.length?`<div class="full"><b>قيود الصرف:</b> ${r.payJes.map(p=>esc(p.no)+' ('+f(p.amount)+')').join('، ')}</div>`:'')
   +(['معتمد','مدفوع جزئيًا'].includes(r.st)&&canPayHr()?`<div class="full">${sel('الصرف من','acc',acs.map(a=>[a.id,a.code+' · '+a.name+' (رصيد '+f(a.bal)+')']),'')}<button class="b g" data-a="pyp" data-i="${r.id}">صرف الرواتب غير المصروفة</button></div>`:'')
   +'<div class="full" style="display:flex;gap:6px;flex-wrap:wrap">'+(draft&&canW()?`<button class="b" data-a="pys" data-i="${r.id}">حفظ التعديلات</button>`:'')+(draft&&isM()?`<button class="b g" data-a="pya" data-i="${r.id}">اعتماد وترحيل القيد</button>`:'')+(isM()&&['مسودة','معتمد'].includes(r.st)?`<button class="b r" data-a="pyc" data-i="${r.id}">${draft?'حذف المسودة':'إلغاء المسير'}</button>`:'')+((D.user||{}).role==='admin'&&r.st==='معتمد'?`<button class="b o" data-a="pyo" data-i="${r.id}">إعادة فتح للتعديل</button>`:'')+`<button class="b o" data-a="pyx" data-i="${r.id}">طباعة</button></div>`+attBox('PAYRUN',r.id),null);attInit&&attInit()};
const collect=()=>{const m={};$$('#mb .pl').forEach(e=>{(m[e.dataset.e]=m[e.dataset.e]||{emp:e.dataset.e})[e.dataset.n]=e.value});return Object.values(m)};
A.pys=async i=>{const r=HR().runs.find(x=>x.id==i);const j=await run('savePay',{id:i,ver:r.ver,lines:collect()},'تم الحفظ');if(j){dlg.close();setTimeout(()=>A.vrn(i),300)}};
A.pya=async i=>{const r=HR().runs.find(x=>x.id==i);const ed=collect();if(ed.length){const s=await run('savePay',{id:i,ver:r.ver,lines:ed});if(!s)return}const r2=HR().runs.find(x=>x.id==i);if(!confirm('اعتماد المسير وترحيل قيد الرواتب؟'))return;const j=await run('approvePay',{id:i,ver:r2.ver},'تم الاعتماد وترحيل القيد');if(j){dlg.close();setTimeout(()=>A.vrn(i),300)}};
A.pyp=async i=>{const r=HR().runs.find(x=>x.id==i),acc=$('#mb [name=acc]').value;if(!acc){toast('اختر حساب الصرف',1);return}const j=await run('payPay',{id:i,ver:r.ver,acc},'تم صرف الرواتب');if(j){dlg.close();setTimeout(()=>A.vrn(i),300)}};
A.pyc=i=>{const r=HR().runs.find(x=>x.id==i);if(r.st==='مسودة'){if(confirm('حذف المسودة؟')){dlg.close();run('cancelPay',{id:i,ver:r.ver},'تم الحذف')}return}dlg.close();mdl('إلغاء المسير '+r.no,revFld(i)+fld('السبب','reason','','text','full'),()=>run('cancelPay',{id:i,ver:r.ver,reason:rd().reason,revDate:rd().revDate||undefined},'تم الإلغاء'),'تأكيد')};
A.pyo=i=>{const r=HR().runs.find(x=>x.id==i);dlg.close();mdl('إعادة فتح المسير '+r.no+' للتعديل',`<div class="full mu">لمدير النظام فقط. يُعكس قيد الاعتماد وتُفكّ السلف المخصومة ثم يعود المسير <b>مسودة</b> تعدّله وتعتمده من جديد. لا يُفتح مسير صُرف منه شيء ولا داخل فترة مقفلة.</div>`+revFld(i)+fld('سبب إعادة الفتح (إلزامي)','reason','','text','full'),()=>{const q=rd().reason.trim();if(!q){toast('اكتب السبب',1);return false}return run('cancelPay',{id:i,ver:r.ver,reopen:true,reason:q,revDate:rd().revDate||undefined},'أُعيد المسير مسودة للتعديل').then(z=>z!==false)},'إعادة فتح')};
A.pyx=i=>{const r=HR().runs.find(x=>x.id==i);docOut(printHead('مسير رواتب '+r.period)+`<p>الرقم: ${esc(r.no)} — الحالة: ${esc(r.st)}</p>`+tbl(['الكود','الموظف','الأساسي','البدلات','مكافأة','استقطاعات','خصم سلفة','الصافي'],r.lines.map(l=>[esc(l.code),esc(l.name),f(l.basic),f(l.allow),f(l.bonus),f((+l.ded)+(+l.other||0)),f(l.advDed),f(l.net)]).concat([['','<b>الإجمالي</b>','','','','<b>'+f(r.dedTotal)+'</b>','','<b>'+f(r.net)+'</b>']]))+`<div class="sg"><div>أعدّه<br>${esc(r.byName)}</div><div>المراجعة</div><div>اعتماد</div></div>`+printFoot())};
})();
