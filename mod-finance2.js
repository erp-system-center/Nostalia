/* =====================================================================
   الخزينة والأصول الثابتة (تابات داخل الحسابات): تحويلات، شيكات، تسوية بنكية، عهد وسلف، أصول ثابتة
   البيانات تُجلب عند فتح كل تاب وتُمسح بعد أي عملية
   ===================================================================== */
(()=>{
[['c_trn','التحويلات'],['c_chq','الشيكات'],['c_bnk','التسوية البنكية'],['c_adv','العهد والسلف'],['c_fa','الأصول الثابتة']].forEach(x=>NAVX.acc.push(x));
let TS={},LD={},BK={acc:'',stmt:'',asOf:'',rep:null};
const cw=()=>['admin','manager','accountant'].includes((D.acc||{}).role);
const PJ=()=>(D.acc&&D.acc.projects)||[];
const pjl=id=>{const p=PJ().find(x=>x.id==id);return p?p.code+' · '+p.name:'—'};
const EXPA=()=>((D.acc&&D.acc.accounts)||[]).filter(a=>a.type==='expense'&&a.active!==false&&!['INV','AP'].includes(a.sys));
const need=(k,act,data)=>{
  if(TS[k])return TS[k];
  if(!LD[k]){LD[k]=1;api(act,data||{}).then(j=>{TS[k]=j;LD[k]=0;render()}).catch(e=>{LD[k]=0;TS[k]={err:e.message};render()})}
  return null};
const loading=k=>'<div class="box mu">جارٍ التحميل…</div>';
const bad=T=>T&&T.err?`<div class="box" style="color:#c0392b">${esc(T.err)} <button class="b s" data-a="f2r">إعادة المحاولة</button></div>`:'';
A.f2r=()=>{TS={};LD={};render()};
const mut=async(a,d,msg)=>{TS={};const j=await run(a,d,msg);TS={};render();return j};
const cn=(L,id)=>{const a=(L||[]).find(x=>x.id==id);return a?esc(a.code+' · '+a.name):'—'};
const csel=(L,n,v,l='الحساب')=>sel(l,n,[['','— اختر —']].concat((L||[]).map(a=>[a.id,a.code+' · '+a.name])),v||'');

/* ---------- التحويلات ---------- */
V.c_trn=()=>{const T=need('trn','listTrn');if(!T)return head('التحويلات بين الحسابات النقدية')+loading();if(T.err)return bad(T);
  return head('التحويلات بين الحسابات النقدية',cw()?'ntr':'','+ تحويل جديد')+`<div class="box">${tbl(['الرقم','التاريخ','من','إلى','المبلغ','البيان','الحالة',''],T.list.map(r=>[esc(r.no),esc(r.date),cn(T.cash,r.from),cn(T.cash,r.to),f(r.amount),esc(r.memo||r.ref),st(r.st),cw()&&r.st==='منفّذ'?btn('xtr',r.id,'إلغاء','r'):'']))}</div><p class="mu">كل تحويل يُرحَّل فورًا بقيد (مدين الوجهة / دائن المصدر) ولا يؤثر على الإيرادات أو المصروفات. الإلغاء بقيد عكسي.</p>`};
A.ntr=()=>{const T=TS.trn;if(!T)return;mdl('تحويل بين حسابين نقديين',csel(T.cash,'from','','من حساب')+csel(T.cash,'to','','إلى حساب')+fld('التاريخ','date',today(),'date')+fld('المبلغ','amount','','number')+fld('مرجع','ref')+fld('بيان','memo','','text','full'),
  async()=>{const o=rd();return mut('saveTransfer',o,'تم التحويل')})};
A.xtr=i=>{if(!TS['trn'])return;const r=TS.trn.list.find(x=>x.id==i);mdl('إلغاء التحويل '+r.no,fld('سبب الإلغاء','reason','','text','full'),()=>{const o=rd();return mut('cancelTransfer',{id:i,ver:r.ver,reason:o.reason},'تم الإلغاء')},'تأكيد الإلغاء')};

/* ---------- الشيكات ---------- */
const CST={'صادر':['محرّر','مسلَّم','مصروف','مرتجع','ملغى'],'وارد':['تحت التحصيل','محصّل','مرتد','ملغى']};
V.c_chq=()=>{const T=need('chq','listChq');if(!T)return head('الشيكات')+loading();if(T.err)return bad(T);
  const open=r=>['محرّر','مسلَّم','تحت التحصيل'].includes(r.st);
  const due=T.list.filter(r=>open(r)&&r.due<=T.today);
  return head('الشيكات',cw()?'ncq':'','+ شيك')+(due.length?`<div class="box" style="background:#fff3e0">⏰ ${due.length} شيك مستحق/متأخر: ${due.map(r=>esc(r.chqNo)).join('، ')}</div>`:'')+`<div class="box">${tbl(['الرقم','النوع','رقم الشيك','البنك','الطرف','المبلغ','التحرير','الاستحقاق','الحالة',''],T.list.map(r=>[esc(r.no),esc(r.dir),esc(r.chqNo),cn(T.cash,r.bank),esc(r.party),f(r.amount),esc(r.issue),`<span style="${open(r)&&r.due<=T.today?'color:#c0392b;font-weight:700':''}">${esc(r.due)}</span>`,st(r.st),cw()?btn('scq',r.id,'الحالة','o')+(r.st===CST[r.dir][0]?btn('ncq',r.id,'تعديل','o')+btn('dcq',r.id,'حذف','r'):''):'']))}</div><p class="mu">سجل متابعة للشيكات الصادرة والواردة؛ لا ينشئ قيودًا تلقائية (يُسجَّل الصرف/التحصيل الفعلي بالسداد أو القيود ثم يُطابَق في التسوية البنكية).</p>`};
A.ncq=i=>{if(!TS['chq'])return;const T=TS.chq,x=i?T.list.find(r=>r.id==i):{dir:'صادر',issue:today(),due:today()};
  mdl(i?'تعديل شيك':'شيك جديد',(i?'':sel('النوع','dir',[['صادر','صادر (ندفعه)'],['وارد','وارد (نستلمه)']],x.dir))+csel(T.cash,'bank',x.bank,'الحساب البنكي')+fld('رقم الشيك','chqNo',x.chqNo)+fld('الطرف (المستفيد/الساحب)','party',x.party)+fld('المبلغ','amount',x.amount,'number')+fld('تاريخ التحرير','issue',x.issue,'date')+fld('تاريخ الاستحقاق','due',x.due,'date')+fld('مرجع','ref',x.ref)+fld('ملاحظات','memo',x.memo,'text','full'),
  ()=>{const o=rd();if(i){o.id=i;o.ver=x.ver;o.dir=x.dir}return mut('saveCheque',o,'تم الحفظ')})};
A.scq=i=>{if(!TS['chq'])return;const r=TS.chq.list.find(x=>x.id==i);mdl('حالة الشيك '+r.chqNo,sel('الحالة','st',CST[r.dir].map(s=>[s,s]),r.st),()=>mut('setCheque',{id:i,ver:r.ver,st:rd().st},'تم'))};
A.dcq=i=>{if(!TS['chq'])return;const r=TS.chq.list.find(x=>x.id==i);if(confirm('حذف الشيك؟'))mut('delCheque',{id:i,ver:r.ver},'تم الحذف')};

/* ---------- التسوية البنكية ---------- */
const bkKey=()=>'bank:'+BK.acc;
V.c_bnk=()=>{const T0=need('bank0','listBank');if(!T0)return head('التسوية البنكية')+loading();if(T0.err)return bad(T0);
  if(!BK.acc){const b=T0.cash.find(c=>/بنك|bank/i.test(c.name))||T0.cash[0];BK.acc=b?b.id:'';BK.asOf=BK.asOf||today()}
  const T=BK.acc?need(bkKey(),'listBank',{acc:BK.acc}):{lines:[],book:[]};if(!T)return head('التسوية البنكية')+loading();if(T.err)return bad(T);
  const um=T.lines.filter(l=>!l.matched),mt=T.lines.filter(l=>l.matched);
  return head('التسوية البنكية')+`<div class="box"><div class="db">${sel('الحساب البنكي','bacc',T0.cash.map(c=>[c.id,c.code+' · '+c.name]),BK.acc)}</div>
${cw()?`<button class="b g" data-a="bimp">استيراد كشف حساب</button> <button class="b" data-a="bauto">مطابقة تلقائية (نفس المبلغ ±3 أيام)</button> <button class="b s r" data-a="bdel">حذف السطور غير المطابقة</button>`:''}</div>
<div class="box"><h3>تقرير التسوية</h3><div class="db" id="brp">${fld('رصيد كشف البنك الختامي','stmt',BK.stmt,'number')}${fld('حتى تاريخ','asOf',BK.asOf||today(),'date')}</div><button class="b" data-a="brep">عرض التقرير</button><div id="brr">${repHtml()}</div></div>
<div class="box"><h3>سطور البنك غير المطابقة (${um.length})</h3>${tbl(['التاريخ','البيان','المرجع','المبلغ',''],um.map(l=>[esc(l.date),esc(l.desc),esc(l.ref),f(l.amount),cw()?btn('bmt',l.id,'مطابقة يدوية','o'):'']))}</div>
<div class="box"><h3>حركات الدفتر غير المطابقة (${T.book.length})</h3>${tbl(['التاريخ','القيد','البيان','المبلغ'],T.book.map(l=>[esc(l.date),esc(l.jeNo),esc(l.memo),f(l.amt)]))}<p class="mu">تظهر هنا حركات الدفتر التي لم تقابلها حركة في الكشف (شيكات لم تُصرف، إيداعات في الطريق…). القيود المعكوسة مع عكسها لا تظهر.</p></div>
<div class="box"><h3>المطابَق (${mt.length})</h3>${tbl(['التاريخ','البيان','المبلغ',''],mt.slice(0,100).map(l=>[esc(l.date),esc(l.desc),f(l.amount),cw()?btn('bun',l.id,'فك المطابقة','o'):'']))}</div>`};
const repHtml=()=>{const r=BK.rep;if(!r)return '<p class="mu">أدخل رصيد الكشف الختامي واضغط «عرض التقرير».</p>';
  return `<table><tbody><tr><td>رصيد الدفتر (${esc(r.acc.name)}) في ${esc(r.asOf)}</td><td>${f(r.book)}</td></tr><tr><td>رصيد كشف البنك</td><td>${f(r.stmt)}</td></tr><tr><td>إيداعات بالدفتر لم تظهر في الكشف (في الطريق)</td><td>${f(r.inTransit)}</td></tr><tr><td>مدفوعات بالدفتر لم تظهر في الكشف (شيكات معلقة)</td><td>${f(r.outstanding)}</td></tr><tr><td>صافي حركات الكشف غير المسجلة بالدفتر</td><td>${f(r.bankOnly)}</td></tr><tr><td><b>الفرق غير المفسَّر</b></td><td><b style="color:${Math.abs(r.diff)<0.005?'var(--ok)':'#c0392b'}">${f(r.diff)} ${Math.abs(r.diff)<0.005?'✔ متطابق':'✘ راجع السطور غير المطابقة'}</b></td></tr></tbody></table>`};
const rerender=()=>{delete TS[bkKey()];render()};
document.addEventListener('change',e=>{if(e.target&&e.target.name==='bacc'){BK.acc=e.target.value;BK.rep=null;render()}});
A.bimp=()=>BK.acc&&mdl('استيراد كشف حساب بنكي',`<div class="full mu">ألصق السطور بصيغة: <b>التاريخ(YYYY-MM-DD),البيان,المبلغ,المرجع</b> — المبلغ موجب للإيداع وسالب للسحب. أو اختر ملف CSV.</div><div class="full"><input type="file" id="bcsv" accept=".csv,.txt"></div><div class="full"><label>السطور</label><textarea name="rows" rows="9" dir="ltr" style="width:100%"></textarea></div>`,async()=>{
  const rows=rd().rows.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).map(s=>{const p=s.split(/[,;\t]/).map(x=>x.trim());return {date:p[0],desc:p[1]||'',amount:parseFloat((p[2]||'').replace(/[^\d.\-]/g,'')),ref:p[3]||''}}).filter(r=>/^\d{4}-\d{2}-\d{2}$/.test(r.date));
  if(!rows.length){toast('لا توجد سطور صالحة (التاريخ أولًا بصيغة YYYY-MM-DD)',1);return false}
  const j=await mut('importBank',{acc:BK.acc,lines:rows});if(j)toast('أُضيف '+j.added+' سطر'+(j.dup?' (مكرر مُتجاهَل: '+j.dup+')':''));return !!j});
dlg.addEventListener('change',e=>{const el=e.target;if(el&&el.id==='bcsv'&&el.files[0]){const r=new FileReader();r.onload=()=>{$('#mb [name=rows]').value=String(r.result)};r.readAsText(el.files[0])}});
A.bauto=async()=>{TS={};const j=await run('matchBank',{auto:true,acc:BK.acc});TS={};render();if(j)toast('طُوبق '+j.matched+' سطر')};
A.bdel=()=>{if(confirm('حذف كل السطور غير المطابقة لهذا الحساب؟'))mut('delBankLines',{acc:BK.acc},'تم الحذف')};
A.bun=i=>mut('unmatchBank',{id:i},'تم فك المطابقة');
A.bmt=i=>{if(!TS[bkKey()])return;const T=TS[bkKey()],l=T.lines.find(x=>x.id==i);
  mdl('مطابقة يدوية: '+l.desc+' ('+f(l.amount)+')',sel('حركة الدفتر','jl',[['','— اختر —']].concat(T.book.map(b=>[b.id,b.date+' · '+b.jeNo+' · '+f(b.amt)+' · '+(b.memo||'')])),'','full')+`<label class="full"><input type="checkbox" name="force" style="width:auto"> السماح باختلاف المبلغ</label>`,()=>{const o=rd(),fc=$('#mb [name=force]').checked;if(!o.jl){toast('اختر حركة',1);return false}return mut('matchBank',{id:i,jl:o.jl,force:fc||undefined},'تمت المطابقة')})};
A.brep=async()=>{const o=rd('#brp');BK.stmt=o.stmt;BK.asOf=o.asOf;try{BK.rep=await api('bankRep',{acc:BK.acc,asOf:o.asOf,stmt:o.stmt});$('#brr').innerHTML=repHtml()}catch(e){toast(e.message,1)}};

/* ---------- العهد والسلف ---------- */
const AKIND=['عهدة','سلفة','عهدة نثرية'];
V.c_adv=()=>{const T=need('adv','listAdv');if(!T)return head('العهد والسلف')+loading();if(T.err)return bad(T);
  const open=T.list.filter(r=>r.st==='مصروفة'),tot=open.reduce((s,r)=>s+r.left,0);
  return head('العهد والسلف',cw()?'nad':'','+ عهدة / سلفة')+`<div class="box">عهد مفتوحة: <b>${open.length}</b> بمتبقٍ إجمالي <b>${f(tot)}</b></div><div class="box">${tbl(['الرقم','النوع','المسؤول','التاريخ','المبلغ','المصروف','المردود','المتبقي','الفرع','الغرض','الحالة',''],T.list.map(r=>[esc(r.no),esc(r.kind),`<a href="#" onclick="A.estm('${esc(r.emp)}');return false">${esc(r.empName||r.emp)}</a>`,esc(r.date),f(r.amount),f(r.settled),f(r.returned),f(r.left),esc(r.proj||'—'),esc(r.purpose),st(r.st),!cw()?'':r.st==='مسودة'?btn('nad',r.id,'تعديل','o')+btn('iad',r.id,'صرف','g')+btn('cad',r.id,'حذف','r'):r.st==='مصروفة'?btn('sad',r.id,'تسوية','g')+(r.hist.length?btn('uad',r.id,'عكس آخر تسوية','o'):btn('cad',r.id,'إلغاء','r')):''] ))}</div><p class="mu">الصرف: مدين «عهد وسلف العاملين» / دائن الخزينة. التسوية: مدين المصروفات (على الفرع) + المردود النقدي / دائن العهدة. سداد السلفة من الراتب يُسجَّل لاحقًا بالمردود النقدي أو قيد يدوي.</p>`};
A.nad=i=>{if(!TS['adv'])return;const T=TS.adv,x=i?T.list.find(r=>r.id==i):{kind:'عهدة',date:today()};
  mdl(i?'تعديل':'عهدة / سلفة جديدة',sel('النوع','kind',AKIND.map(k=>[k,k]),x.kind)+sel('الموظف المسؤول','emp',[['','— اختر الموظف —']].concat((D.emps||[]).filter(e=>e.st==='نشط'||e.id==x.emp).map(e=>[e.id,e.code+' · '+e.name])),x.emp||'')+fld('التاريخ','date',x.date,'date')+fld('المبلغ','amount',x.amount,'number')+csel(T.cash,'cash',x.cash,'الصرف من')+fld('الفرع (اختياري)','proj',x.proj)+fld('الغرض','purpose',x.purpose,'text','full'),
  ()=>{const o=rd();if(i){o.id=i;o.ver=x.ver}return mut('saveAdv',o,'تم الحفظ')})};
A.iad=i=>{if(!TS['adv'])return;const r=TS.adv.list.find(x=>x.id==i);if(confirm('صرف '+f(r.amount)+' للعهدة '+r.no+'؟'))mut('issueAdv',{id:i,ver:r.ver},'تم الصرف وترحيل القيد')};
A.cad=i=>{if(!TS['adv'])return;const r=TS.adv.list.find(x=>x.id==i);if(r.st==='مسودة'){if(confirm('حذف المسودة؟'))mut('cancelAdv',{id:i,ver:r.ver},'تم الحذف');return}
  mdl('إلغاء العهدة '+r.no,fld('السبب','reason','','text','full'),()=>mut('cancelAdv',{id:i,ver:r.ver,reason:rd().reason},'تم الإلغاء'),'تأكيد')};
A.uad=i=>{if(!TS['adv'])return;const r=TS.adv.list.find(x=>x.id==i);mdl('عكس آخر تسوية للعهدة '+r.no,fld('السبب','reason','','text','full'),()=>mut('undoAdvSettle',{id:i,ver:r.ver,reason:rd().reason},'تم العكس'),'تأكيد')};
A.sad=i=>{if(!TS['adv'])return;const T=TS.adv,r=T.list.find(x=>x.id==i),E=EXPA();
  const row=n=>`<div class="full" style="display:grid;grid-template-columns:2fr 1fr 2fr;gap:6px">${sel('حساب المصروف','a'+n,[['','—']].concat(E.map(a=>[a.id,a.code+' · '+a.name])),'')}${fld('المبلغ','m'+n,'','number')}${fld('بيان','d'+n)}</div>`;
  mdl('تسوية '+r.no+' — المتبقي '+f(r.left),fld('تاريخ التسوية','date',today(),'date','full')+row(1)+row(2)+row(3)+fld('مبلغ مردود نقدًا','ret','0','number')+csel(T.cash,'cashIn',r.cash,'يُودَع في'),
  ()=>{const o=rd(),items=[1,2,3].filter(n=>o['a'+n]||+o['m'+n]).map(n=>({acc:o['a'+n],amount:o['m'+n],memo:o['d'+n]}));return mut('settleAdv',{id:i,ver:r.ver,date:o.date,items,returned:o.ret,cashIn:o.cashIn},'تمت التسوية')})};

/* ---------- كشف حساب الموظف (عهد/سلف/رواتب وأي قيد وُسم بالموظف) ---------- */
A.estm=async(id,from,to)=>{try{const j=await api('empStmt',{emp:id,from,to});
  const T=j.totals.map(t=>[esc(t.acc),f(t.dr),f(t.cr),`<b>${f(t.dr-t.cr)}</b>`]);
  mdl('كشف حساب الموظف: '+j.emp.code+' · '+j.emp.name,`<div class="full"><b>الأرصدة (مدين − دائن):</b>${tbl(['الحساب','مدين','دائن','الرصيد'],T)}</div><div class="full"><b>الحركات:</b>${tbl(['التاريخ','القيد','النوع','الحساب','مدين','دائن','البيان'],j.rows.map(r=>[esc(r.date),esc(r.jeNo),esc(r.jt),esc(r.acc),r.dr?f(r.dr):'',r.cr?f(r.cr):'',esc(r.memo)]))}</div>${j.advances.length?`<div class="full"><b>العهد والسلف:</b>${tbl(['الرقم','النوع','التاريخ','المبلغ','المتبقي','الحالة'],j.advances.map(a=>[esc(a.no),esc(a.kind),esc(a.date),f(a.amount),f(a.left),st(a.st)]))}</div>`:''}<div class="full"><button class="b g" data-a="estp" data-i="${esc(id)}|${esc(from||'')}|${esc(to||'')}">طباعة</button> <button class="b g" data-a="estx" data-i="${esc(id)}|${esc(from||'')}|${esc(to||'')}">Excel</button> ${HR.box()}</div>`,null)}catch(e){toast(e.message,1)}};
const estOut=async(v,x)=>{const [id,from,to]=v.split('|');try{const j=await api('empStmt',HR.p({emp:id,from,to}));
  docOut(printHead('كشف حساب الموظف — '+j.emp.name)+`<p>الفترة: ${esc(from||'البداية')} إلى ${esc(to||'اليوم')}</p>`+tbl(['الحساب','مدين','دائن','الرصيد'],j.totals.map(t=>[esc(t.acc),f(t.dr),f(t.cr),f(t.dr-t.cr)]))+tbl(['التاريخ','القيد','الحساب','مدين','دائن','البيان'],j.rows.map(r=>[esc(r.date),esc(r.jeNo),esc(r.acc),r.dr?f(r.dr):'',r.cr?f(r.cr):'',esc(r.memo)]))+printFoot(),'كشف حساب '+j.emp.name,x?1:0)}catch(e){toast(e.message,1)}};
A.estp=v=>estOut(v,0);A.estx=v=>estOut(v,1);

/* ---------- الأصول الثابتة ---------- */
V.c_fa=()=>{const T=need('fa','listAsset');if(!T)return head('الأصول الثابتة')+loading();if(T.err)return bad(T);
  const act=T.list.filter(a=>a.st==='عامل'),c=act.reduce((s,a)=>s+ +a.cost,0),d=act.reduce((s,a)=>s+(+a.accDep||0),0);
  return head('الأصول الثابتة',cw()?'nfa':'','+ أصل')+`<div class="box">عدد الأصول العاملة <b>${act.length}</b> — التكلفة <b>${f(c)}</b> — مجمع الإهلاك <b>${f(d)}</b> — صافي القيمة <b>${f(c-d)}</b></div>
<div class="box">${tbl(['الكود','الأصل','الفئة','الاقتناء','التكلفة','التخريدية','العمر (شهر)','القسط الشهري','المجمع','الصافي','الموقع / الأمين','الفرع','الحالة',''],T.list.map(a=>[esc(a.code),esc(a.name),esc(a.cat),esc(a.acqDate),f(a.cost),f(a.salvage),a.life,f(a.monthly),f(a.accDep),f(a.nbv),esc((a.loc||'—')+' / '+(a.custodian||'—')),esc(a.proj||'—'),st(a.st),!cw()||a.st!=='عامل'?'':btn('nfa',a.id,'تعديل','o')+btn('dfa',a.id,'استبعاد','r')+((a.depTo||a.jeAcq)?'':btn('xfa',a.id,'حذف','r'))]))}</div>
${cw()?`<div class="box"><h3>تشغيل الإهلاك الشهري (قسط ثابت)</h3><div class="db" id="dpf">${fld('عن شهر','period',today().slice(0,7),'month')}</div><button class="b g" data-a="rdp">تشغيل الإهلاك</button><p class="mu">يُحتسب لكل أصل عامل من شهر الاقتناء (شهر الاقتناء بالأيام فقط للأصول المحددة بذلك، وإلا شهر كامل) (أو من بعد آخر إهلاك) حتى الشهر المختار بقيد واحد (مدين مصروف الإهلاك على فرع الأصل / دائن مجمع الإهلاك). لا يتكرر لنفس الأصل والشهر. الاستبعاد يتطلب إهلاكًا حتى الشهر السابق.</p></div>`:''}
<div class="box"><h3>عمليات الإهلاك المنفَّذة</h3>${tbl(['الشهر','الإجمالي',''],T.runs.map(r=>[esc(r.period),f(r.amount),cw()&&r===T.runs[0]?btn('udp',r.period,'عكس','r'):'']))}</div>`};
A.nfa=i=>{if(!TS['fa'])return;const T=TS.fa,x=i?T.list.find(a=>a.id==i):{acqDate:today(),life:60,salvage:0};const lock=i&&x.depTo;
  mdl(i?'تعديل أصل':'أصل جديد',fld('اسم الأصل','name',x.name,'text','full')+fld('الفئة','cat',x.cat)+fld('تاريخ الاقتناء','acqDate',x.acqDate,'date')+fld('التكلفة','cost',x.cost,'number')+fld('القيمة التخريدية','salvage',x.salvage,'number')+fld('العمر الإنتاجي (بالأشهر)','life',x.life,'number')+(lock?'':sel('إهلاك شهر الاقتناء','dep1',[['day','بالأيام (من يوم الاقتناء حتى نهاية الشهر)'],['month','شهر كامل']],i?(x.dep1==='day'?'day':'month'):'day','full'))+fld('الموقع','loc',x.loc)+fld('الأمين / المسؤول','custodian',x.custodian)+fld('الفرع (كود)','proj',x.proj)
  +(i?'':sel('الاقتناء','acq',[['existing','موجود بالفعل (لا قيد — يُرحَّل رصيده الافتتاحي بقيد يدوي)'],['cash','شراء نقدي الآن (قيد: مدين الأصول / دائن الخزينة)']],'existing','full')+csel(T.cash,'cash','','حساب السداد (للشراء النقدي)')+fld('مجمع الإهلاك الافتتاحي (للأصول قبل بداية التطبيق)','openDep','0','number'))+fld('ملاحظات','note',x.note,'text','full')+(lock?'<div class="full mu">بدأ الإهلاك: التكلفة والعمر وتاريخ الاقتناء مقفلة.</div>':''),
  ()=>{const o=rd();if(i){o.id=i;o.ver=x.ver}return mut('saveAsset',o,'تم الحفظ')})};
A.xfa=i=>{if(!TS['fa'])return;if(confirm('حذف الأصل؟'))mut('delAsset',{id:i},'تم الحذف')};
A.dfa=i=>{if(!TS['fa'])return;const T=TS.fa,a=T.list.find(x=>x.id==i);mdl('استبعاد '+a.name+' — الصافي '+f(a.nbv),fld('تاريخ الاستبعاد','date',today(),'date')+fld('مبلغ البيع (0 للتخريد)','amount','0','number')+csel(T.cash,'cash','','يُحصَّل في'),()=>{const o=rd();return mut('disposeAsset',{id:i,ver:a.ver,date:o.date,amount:o.amount,cash:o.cash||undefined},'تم الاستبعاد وترحيل القيد')})};
A.rdp=()=>{const p=rd('#dpf').period;if(!p){toast('اختر الشهر',1);return}if(confirm('تشغيل الإهلاك حتى '+p+'؟'))mut('runDep',{period:p}).then(j=>{if(j)toast('أُهلك '+j.count+' أصل بإجمالي '+f(j.total))})};
A.udp=p=>mdl('عكس إهلاك '+p,fld('السبب','reason','','text','full'),()=>mut('undoDep',{period:p,reason:rd().reason},'تم العكس'),'تأكيد');
})();
