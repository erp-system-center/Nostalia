/* =====================================================================
   مديول الحسابات: لوحة التحكم، القيود، الموردون والسداد، دفتر الأستاذ، ميزان المراجعة،
   القوائم المالية (قائمة الدخل حسب الفرع، المركز المالي، تقادم الموردين)،
   دليل الحسابات، الفروع ومراكز الربح، الفترات وفحص السلامة
   ===================================================================== */
(()=>{
const AC=()=>D.acc;
const ar=()=>AC().role;
const isAM=()=>['admin','manager'].includes(ar());
const canJE=()=>['admin','manager','accountant'].includes(ar());
const accO=id=>AC().accounts.find(a=>a.id==id)||{};
const accN=id=>{const a=accO(id);return a.code?a.code+' · '+a.name:'—'};
const prjN=id=>id?((AC().projects.find(p=>p.id==id)||{}).name||'؟'):'غير موزع';
const TYPES={asset:'أصول',liability:'خصوم',equity:'حقوق الملكية',revenue:'إيرادات',expense:'مصروفات'};
const JT={MAN:'قيد يدوي',EXP:'مصروف',REC:'سند قبض',PAYV:'سند صرف',PAYR:'مسير رواتب',PAYP:'صرف رواتب',GRN:'استلام مخزني',ISS:'صرف مخزني',OPN:'رصيد افتتاحي مخزني',CNT:'تسوية جرد',PAY:'سداد مورد',PINV:'فاتورة مورد',SINV:'فاتورة مبيعات',RCT:'تحصيل عميل',ODP:'عربون عميل (دفعة مقدمة)',OPENAP:'قيد افتتاحي',TRN:'تحويل نقدي',ADV:'صرف عهدة/سلفة',ADVS:'تسوية عهدة',DEP:'إهلاك أصول',FAP:'اقتناء أصل',FAD:'استبعاد أصل',MIS:'صرف خامات للتصنيع',MRT:'مرتجع خامات من التصنيع',MFR:'استلام منتج تام',MTM:'تحميل عمل تصنيع',MVR:'تسوية فروقات التصنيع'};
const jtN=t=>String(t).startsWith('REV-')?'عكس: '+(JT[t.slice(4)]||t.slice(4)):(JT[t]||t);
window.JTN=jtN;
const jTot=j=>Math.round(j.lines.reduce((s,l)=>s+(+l.dr||0),0)*100)/100;
const yStart=()=>today().slice(0,4)+'-01-01';
const ST={tb:{from:yStart(),to:today(),proj:''},gl:{acc:'',from:yStart(),to:today(),proj:''},ie:{from:yStart(),to:today()},bs:{to:today()},age:{to:today()},rt:'ie'};
const jeById=id=>AC().je.find(j=>j.id==id)||(JR.res&&JR.res.list.find(j=>j.id==id));

MODS.acc={title:'الحسابات',has:()=>D.user.mods.acc,nav:()=>{
  if(!AC().linked)return ar()=='admin'?[['c_act','تفعيل الحسابات']]:[['c_na','غير مفعّل']];
  const N=[['c_dash','لوحة التحكم'],['c_je','القيود'],['c_ap','الموردون والسداد'],['c_gl','دفتر الأستاذ'],['c_tb','ميزان المراجعة'],['c_rep','القوائم المالية'],['c_coa','دليل الحسابات'],['c_prj','الفروع ومراكز الربح'],['c_map','ربط الحسابات'],['c_per','الفترات والفحص']];
  return N.concat(NAVX.acc);
}};

/* ---------- غير مفعّل ---------- */
V.c_na=()=>`<div class="box"><h3>مديول الحسابات غير مفعّل بعد</h3><p class="mu">يفعّله مدير النظام. بعد التفعيل تُنشأ القيود تلقائيًا من المشتريات والمخازن.</p></div>`;
V.c_act=()=>`<div class="box"><h3>تفعيل الربط المحاسبي</h3>
<p>عند التفعيل يحدث الآتي، ولا يمكن التراجع عنه:</p>
<ul><li>يُنشأ دليل حسابات جاهز لنشاط الكيترينج (يمكن تعديله وإضافة حسابات).</li>
<li>يُرحَّل قيد افتتاحي تلقائي بقيمة المخزون الحالية وبما استُلم ولم يُسدَّد من أوامر التوريد.</li>
<li>كل استلام وصرف وجرد ورصيد افتتاحي مخزني يُنشئ قيده تلقائيًا، وسداد الموردين يتم بدفعات من الخزينة أو البنك.</li>
<li>لا تُقبل مستندات مخزنية أو قيود بتاريخ قبل اليوم (بداية التطبيق المحاسبي)، ويصبح ربط المخازن بالمشتريات إلزاميًا.</li></ul>
<p class="mu">قبل التفعيل: أدخل الأرصدة الافتتاحية للمخزون، وأنهِ أو أغلق أوامر التوريد التي لا تريدها في المستحقات.</p>
<button class="b" data-a="cact">تفعيل الربط المحاسبي</button></div>`;
A.cact=()=>{if(confirm('تفعيل الربط المحاسبي؟ لا يمكن التراجع عن هذا الإجراء.'))run('enableAcc',{},'تم تفعيل الحسابات')};

/* ---------- لوحة التحكم ---------- */
V.c_dash=()=>{const s=AC().sum||{cash:0,ap:0,rev:0,exp:0,cogs:0,gross:0,profit:0},dr=AC().je.filter(j=>j.st=='مسودة'),cash=AC().accounts.filter(a=>a.cash);
  const cd=[['النقدية والبنوك (ج.م)',f(s.cash)],['مستحق للموردين (ج.م)',f(s.ap)],['إجمالي الإيرادات',f(s.rev)],['مجمل الربح',f(s.gross)],['إجمالي المصروفات (شامل تكلفة المبيعات)',f(s.exp)],['صافي الربح / (الخسارة)',f(s.profit)]];
  if(isAM())cd.push(['قيود بانتظار الترحيل',dr.length]);
  return `<div class="cards">${cd.map(c=>`<div class="card"><small>${c[0]}</small><h2>${c[1]}</h2></div>`).join('')}</div>
<div class="box"><h3>أرصدة الخزائن والبنوك</h3>${tbl(['الحساب','الرصيد'],cash.map(a=>[esc(a.code+' · '+a.name),f(AC().bal[a.id]||0)]))}</div>
<div class="box"><h3>آخر القيود</h3>${tbl(['الرقم','التاريخ','النوع','البيان','المبلغ','الحالة'],AC().je.filter(j=>j.st!='مسودة').slice(0,8).map(j=>[j.no,j.date,jtN(j.type),esc(j.memo),f(jTot(j)),st(j.st)]))}</div>
<p class="mu">${AC().closedTo?'الفترة مُقفلة حتى '+esc(AC().closedTo)+'. ':'لا توجد فترة مُقفلة. '}بداية التطبيق المحاسبي: ${esc(AC().start)} (تُقبل حركات بتواريخ أقدم وتدخل في الأرصدة الافتتاحية).</p>`};

/* ---------- القيود ---------- */
const jsel=(s,manual)=>'<option value="">— الحساب —</option>'+AC().accounts.filter(a=>a.active&&!(manual&&['INV','AP'].includes(a.sys))).map(a=>`<option value="${esc(a.id)}"${a.id==s?' selected':''}>${esc(a.code)} · ${esc(a.name)}</option>`).join('');
const psel=s=>'<option value="">غير موزع</option>'+AC().projects.filter(p=>p.active||p.id==s).map(p=>`<option value="${esc(p.id)}"${p.id==s?' selected':''}>${esc(p.code+' · '+p.name)}</option>`).join('');
const EMPR=['ADV','SAL_PAY'];
const needEmp=id=>{const a=AC().accounts.find(q=>q.id==id);return !!a&&EMPR.includes(a.sys)};
const empN=id=>{const e=(D.emps||[]).find(q=>q.id==id);return e?e.code+' · '+e.name:''};
/* أبعاد تحليلية على سطر القيد (كأنظمة ERP): مركز تكلفة، موظف، مورد — بجانب الحساب والفرع */
const JDM=[['cc','مركز التكلفة'],['emp','الموظف'],['sup','المورد']];
const JREQ=()=>String((D.settings||{}).jeReq||'').split(',').filter(Boolean);
const JALL=[['proj','الفرع']].concat(JDM);
let JLS=null,JLT=0,JS=['cc'];
const jlLoad=async()=>{if(JLS&&Date.now()-JLT<60000)return;JLT=Date.now();try{JLS=await api('jeDims')}catch(e){JLS=JLS||{}}};
const jsLoad=()=>{try{const v=JSON.parse(localStorage.getItem('gh_jdims')||'null');if(Array.isArray(v))return v.filter(k=>JDM.some(d=>d[0]===k))}catch(e){}return ['cc']};
const jsMust=()=>{JREQ().forEach(k=>{if(k!=='proj'&&!JS.includes(k))JS.push(k)});JS=JDM.map(d=>d[0]).filter(z=>JS.includes(z))};
const jsSave=()=>{try{localStorage.setItem('gh_jdims',JSON.stringify(JS))}catch(e){}};
const dopt=(k,cur)=>'<option value="">— بدون —</option>'+((JLS&&JLS[k])||[]).map(x=>`<option value="${esc(x.id)}"${x.id==cur?' selected':''}>${esc(x.name)}</option>`).join('');
const dname=(k,id)=>{if(!id)return '';const x=((JLS&&JLS[k])||[]).find(q=>q.id==id);if(x)return x.name;if(k==='cc'){const c=(D.cc||[]).find(q=>q.id==id);if(c)return c.code+' · '+c.name}if(k==='emp')return empN(id)||'؟';return '؟'};
const jhead=()=>'<tr><th>الحساب</th><th>مدين</th><th>دائن</th><th>الفرع'+'</th>'+JS.map(k=>'<th>'+JDM.find(d=>d[0]===k)[1]+'</th>').join('')+'<th>بيان السطر</th><th></th></tr>';
const jrow=(x={})=>{
  const hid=JDM.filter(d=>!JS.includes(d[0])).map(d=>` data-h-${d[0]}="${esc(x[d[0]]||'')}"`).join('');
  return `<tr${hid}><td><select class="ja" style="min-width:210px">${jsel(x.acc,true)}</select></td><td><input class="jd" type="number" min="0" step="any" value="${x.dr||''}" style="width:100px" oninput="jcalc()"></td><td><input class="jc" type="number" min="0" step="any" value="${x.cr||''}" style="width:100px" oninput="jcalc()"></td><td><select class="jp" style="min-width:140px">${psel(x.proj)}</select></td>${JS.map(k=>`<td><select class="jx" data-k="${k}" style="min-width:140px">${dopt(k,x[k])}</select></td>`).join('')}<td><input class="jm" value="${esc(x.memo)}" placeholder="بيان السطر" style="min-width:130px"></td><td><button type="button" class="b s r" onclick="this.closest('tr').remove();jcalc()">✕</button></td></tr>`};
const jpicker=()=>`<div class="full" id="jdm"><span class="mu">أبعاد تحليلية للأسطر:</span> ${JDM.map(([k,l])=>`<label class="chk"><input type="checkbox" data-jdm="${k}"${JS.includes(k)?' checked':''}${JREQ().includes(k)?' disabled':''}> ${l}</label>`).join('')}</div>`;
const jtbl=lines=>`<thead>${jhead()}</thead><tbody>${lines.map(jrow).join('')}</tbody>`;
window.jadd=()=>{$('#jl tbody').insertAdjacentHTML('beforeend',jrow());jcalc()};
window.jcalc=()=>{if(!$('#jl'))return;let d=0,c=0;$$('#jl tbody tr').forEach(r=>{d+=+r.querySelector('.jd').value||0;c+=+r.querySelector('.jc').value||0});d=r2(d);c=r2(c);
  const e=$('#jt');e.innerHTML=`مدين: <b>${f(d)}</b> — دائن: <b>${f(c)}</b> — الفرق: <b class="${d==c&&d>0?'good':''}" ${d==c&&d>0?'':'style="color:#a11"'}>${f(r2(d-c))}</b>`};
const jget=()=>$$('#jl tbody tr').map(r=>{const o={acc:r.querySelector('.ja').value,dr:+r.querySelector('.jd').value||0,cr:+r.querySelector('.jc').value||0,proj:r.querySelector('.jp').value,memo:r.querySelector('.jm').value.trim()};JDM.forEach(([k])=>{const e=r.querySelector('.jx[data-k="'+k+'"]');o[k]=e?e.value:(r.getAttribute('data-h-'+k)||'')});return o}).filter(l=>l.acc||l.dr||l.cr);
const jrebuild=()=>{const ls=jget();$('#jl').innerHTML=jtbl(ls.length?ls:[{},{}]);jcalc()};
dlg.addEventListener('change',e=>{const el=e.target;if(!el||!el.classList)return;if(el.classList.contains('ja')&&needEmp(el.value)&&!JS.includes('emp')&&$('#jl')){JS.push('emp');jrebuild();return}if(el.dataset&&el.dataset.jdm&&$('#jl')){const k=el.dataset.jdm;if(el.checked){if(!JS.includes(k))JS.push(k)}else JS=JS.filter(z=>z!==k);JS=JDM.map(d=>d[0]).filter(z=>JS.includes(z));jsSave();jrebuild();return}if(el.name==='oth'){const w=$('#vemp');if(w)w.style.display=needEmp(el.value)?'':'none'}});
const prevH=mdlHook;mdlHook=()=>{prevH&&prevH();jcalc()};

let JR={f:{from:'',to:'',type:'',src:'',st:'',q:'',emp:''},res:null};
const JTK=Object.keys(JT);
const jList=()=>JR.res?JR.res.list:AC().je;
V.c_je=()=>{const me=D.user.username,L=jList();
  const fb=`<div class="box"><div class="db" id="jrf">${fld('من تاريخ','from',JR.f.from,'date')}${fld('إلى تاريخ','to',JR.f.to,'date')}${sel('النوع','type',[['','الكل']].concat(JTK.map(k=>[k,JT[k]])),JR.f.type)}${sel('المصدر','src',[['','الكل'],['manual','يدوي'],['auto','تلقائي (من المستندات)']],JR.f.src)}${sel('الحالة','st',[['','الكل'],['مسودة','مسودة'],['مرحّل','مرحّل'],['مرفوض','مرفوض'],['معكوس','معكوس']],JR.f.st)}${sel('الموظف','emp',[['','الكل']].concat((D.emps||[]).map(e=>[e.id,e.code+' · '+e.name])),JR.f.emp)}${fld('بحث (رقم/بيان/مستند)','q',JR.f.q)}</div><button class="b" data-a="jrun">عرض</button> <button class="b o" data-a="jrst">كل القيود الحديثة</button> <button class="b g" data-a="jxl">تصدير القيود والحركات إلى Excel (للفترة)</button>${JR.res?`<span class="mu"> — ${JR.res.total} قيد${JR.res.truncated?' (معروض أول '+JR.res.list.length+' — ضيّق الفلتر)':''}</span>`:'<span class="mu"> — يعرض آخر 300 قيد؛ استخدم الفلتر لأي فترة</span>'}</div>`;
  return head('القيود اليومية',canJE()?'nje':'','+ قيد يدوي',canJE()?`<button class="b o" data-a="nvc" data-i="REC">+ سند قبض</button><button class="b o" data-a="nvc" data-i="PAYV">+ سند صرف</button>`:'')+fb+`<div class="box">${tbl(['الرقم','التاريخ','النوع','المصدر','البيان','المبلغ','الحالة','إجراءات'],L.map(j=>{const man=['MAN','REC','PAYV'].includes(j.type)&&!j.src,own=j.by==me;let b=btn('vje',j.id,'عرض','o')+btn('pje',j.id,'طباعة','g')+btn('pjex',j.id,'Excel','g');
  if(man&&['مسودة','مرفوض'].includes(j.st)&&canJE()&&(own||isAM()))b+=btn('nje',j.id,j.st=='مرفوض'?'تعديل وإعادة إرسال':'تعديل','o')+btn('djc',j.id,'حذف','r');
  if(man&&j.st=='مسودة'&&isAM()&&(!own||ar()=='admin'))b+=btn('pst',j.id,'ترحيل')+btn('rjj',j.id,'رفض','r');
  if(man&&j.st=='مرحّل'&&isAM())b+=btn('rvj',j.id,'عكس','r');
  const emps=[...new Set(j.lines.filter(l=>l.emp).map(l=>empN(l.emp)))];
  return[j.no,j.date,jtN(j.type),j.src?`<span class="st">تلقائي</span> <small class="mu">${esc(j.srcNo||'')}</small>`:'يدوي',esc(j.memo)+(emps.length?`<br><small class="mu">👤 ${esc(emps.join('، '))}</small>`:'')+(j.st=='مرفوض'&&j.reason?`<br><small class="mu">${esc(j.reason)}</small>`:''),f(jTot(j)),st(j.st),b]}))}</div>`};
const jrQ=()=>{const o=rd('#jrf');JR.f=o;return o};
A.jrun=async()=>{const o=jrQ();try{JR.res=await api('listJE',o);render()}catch(e){toast(e.message,1)}};
A.jrst=()=>{JR={f:{from:'',to:'',type:'',src:'',st:'',q:'',emp:''},res:null};render()};
A.jxl=async()=>{const o=jrQ();if(!o.from||!o.to){toast('حدّد «من تاريخ» و«إلى تاريخ» للتصدير',1);return}try{const j=await api('exportJE',o);window.xlTables(j,'القيود والحركات '+o.from+' إلى '+o.to)}catch(e){toast(e.message,1)}};
const jhdr=j=>kv('الرقم',j.no)+kv('النوع',jtN(j.type))+kv('الحالة',j.st)+kv('التاريخ',j.date)+kv('أعدّه',j.byName)+(j.actBy?kv('آخر إجراء بواسطة',j.actBy):'')+(j.srcNo&&j.src?kv('المستند المصدر',j.srcNo):'')+(j.reason?kv('السبب',j.reason):'');
const jtab=j=>{const ks=JDM.map(d=>d[0]).filter(k=>j.lines.some(l=>l[k]));return tbl(['الحساب','مدين','دائن','الفرع'].concat(ks.map(k=>JDM.find(d=>d[0]===k)[1]),['البيان']),j.lines.map(l=>[esc(accN(l.acc)),l.dr?f(l.dr):'',l.cr?f(l.cr):'',esc(prjN(l.proj))].concat(ks.map(k=>esc(dname(k,l[k]))),[esc(l.memo)])).concat([['<b>الإجمالي</b>','<b>'+f(jTot(j))+'</b>','<b>'+f(jTot(j))+'</b>',''].concat(ks.map(()=>''),[''])]))};
A.vje=async i=>{await jlLoad();const j=jeById(i);mdl('قيد '+j.no,jhdr(j)+`<div class="full"><label>البيان</label>${esc(j.memo)}</div><div class="full" style="overflow-x:auto">${jtab(j)}</div>`+attBox('JE',j.id),null)};
A.pje=async(i,x)=>{await jlLoad();const j=jeById(i),P=(l,t)=>t?`<p><b>${l}:</b> ${esc(t)}</p>`:'';
  docOut(printHead(j.type=='REC'?'سند قبض':j.type=='PAYV'?'سند صرف':'قيد يومية')+`<div class="g"><div>${P('الرقم',j.no)+P('التاريخ',j.date)}</div><div>${P('النوع',jtN(j.type))+P('الحالة',j.st)}</div></div>${P('البيان',j.memo)}`+jtab(j)+`<div class="sg"><div>أعدّه<br>${esc(j.byName)}</div><div>المراجع / المحاسب</div><div>المعتمد${j.actBy&&j.st!='مسودة'?'<br>'+esc(j.actBy):''}</div></div>`+printFoot(),(j.type=='REC'?'سند قبض ':j.type=='PAYV'?'سند صرف ':'قيد ')+j.no,x)};
A.pjex=i=>A.pje(i,1);
A.nje=async i=>{await jlLoad();JS=jsLoad();const x=i?jeById(i):{lines:[{},{}],date:today(),memo:'',type:'MAN'};
  x.lines.forEach(l=>{JDM.forEach(([k])=>{if(l[k]&&!JS.includes(k))JS.push(k)});if(l.acc&&needEmp(l.acc)&&!JS.includes('emp'))JS.push('emp')});JS=JDM.map(d=>d[0]).filter(z=>JS.includes(z));jsMust();
  mdl(i?'تعديل قيد':'قيد يدوي جديد',fld('التاريخ','date',x.date,'date')+fld('البيان','memo',x.memo,'text','full')+jpicker()+`<div class="full" style="overflow-x:auto"><table id="jl">${jtbl(x.lines)}</table><button type="button" class="b o s" style="margin-top:6px" onclick="jadd()">+ سطر</button> <span id="jt" style="float:left"></span></div><div class="full mu">يحفظ كمسودة، ويرحّله مدير حسابات آخر (حسابا المخزون والموردين لا يُرحَّل عليهما يدويًا).</div>`,()=>{const o=rd(),l=jget();
    if(!o.memo.trim()){toast('اكتب بيان القيد',1);return false}
    for(const [n,ln] of l.entries()){for(const k of JREQ()){if(!ln[k]){toast('السطر '+(n+1)+': '+JALL.find(d=>d[0]===k)[1]+' إلزامي',1);return false}}}
    return run('saveJE',{id:i||undefined,ver:x.ver,type:x.type||'MAN',date:o.date,memo:o.memo,lines:l},'تم حفظ القيد كمسودة')})};
A.nvc=async t=>{await jlLoad();const rq=JREQ().filter(k=>!['proj','emp'].includes(k)),empReq=JREQ().includes('emp'),rec=t=='REC',cash=AC().accounts.filter(a=>a.cash&&a.active),oth=AC().accounts.filter(a=>a.active&&!['INV','AP'].includes(a.sys)&&!a.cash&&(rec?['revenue','liability','equity','asset']:['expense','asset','liability']).includes(a.type));
  mdl(rec?'سند قبض':'سند صرف',fld('التاريخ','date',today(),'date')+sel(rec?'استلام في (خزينة/بنك)':'الصرف من (خزينة/بنك)','cash',cash.map(a=>[a.id,a.code+' · '+a.name+' (رصيد '+f(AC().bal[a.id]||0)+')']))+sel(rec?'الإيراد / الحساب الدائن':'المصروف / الحساب المدين','oth',[['','— اختر —']].concat(oth.map(a=>[a.id,a.code+' · '+a.name])))+`<div id="vemp" style="${empReq?'':'display:none'}">${sel('الموظف (للعهد/السلف/الرواتب)','emp',[['','— اختر الموظف —']].concat((D.emps||[]).filter(e=>e.st==='نشط').map(e=>[e.id,e.code+' · '+e.name])),'')}</div>`+fld('المبلغ','amt','','number')+sel('الفرع','proj',[['','غير موزع']].concat(AC().projects.filter(p=>p.active).map(p=>[p.id,p.name])))+rq.map(k=>sel(JDM.find(d=>d[0]===k)[1]+' *','v_'+k,[['','— اختر —']].concat(((JLS&&JLS[k])||[]).map(x=>[x.id,x.name])))).join('')+fld('البيان','memo','','text','full'),()=>{const o=rd(),a=+o.amt;
    if(!o.oth||!(a>0)||!o.memo.trim()){toast('اختر الحساب وأدخل المبلغ والبيان',1);return false}
    if((needEmp(o.oth)||empReq)&&!o.emp){toast('اختر الموظف',1);return false}
    if(JREQ().includes('proj')&&!o.proj){toast('اختر الفرع (إلزامي)',1);return false}
    for(const k of rq){if(!o['v_'+k]){toast(JDM.find(d=>d[0]===k)[1]+' إلزامي',1);return false}}
    const em=(needEmp(o.oth)||empReq)?o.emp:'';let L=rec?[{acc:o.cash,dr:a,cr:0,proj:o.proj},{acc:o.oth,dr:0,cr:a,proj:o.proj,emp:em}]:[{acc:o.oth,dr:a,cr:0,proj:o.proj,emp:em},{acc:o.cash,dr:0,cr:a,proj:o.proj}];
    L=L.map(x=>{const y=Object.assign({},x);rq.forEach(k=>y[k]=o['v_'+k]);if(empReq)y.emp=em;return y});
    return run('saveJE',{type:t,date:o.date,memo:o.memo,lines:L},'تم حفظ السند كمسودة')})};
A.djc=i=>{if(confirm('حذف المسودة؟'))run('delJE',{id:i},'تم الحذف')};
A.pst=i=>{if(confirm('ترحيل القيد إلى دفتر الأستاذ؟'))run('postJE',{id:i,ver:jeById(i).ver},'تم ترحيل القيد')};
A.rjj=i=>mdl('رفض القيد '+jeById(i).no,fld('سبب الرفض (إلزامي)','reason','','ta','full'),()=>{const r=rd().reason.trim();if(!r){toast('اكتب سبب الرفض',1);return false}return run('rejectJE',{id:i,ver:jeById(i).ver,reason:r},'تم رفض القيد')},'تأكيد الرفض');
A.rvj=i=>mdl('عكس القيد '+jeById(i).no,`<div class="full mu">يُرحَّل قيد عكسي بتاريخ اليوم ويبقى القيد الأصلي ظاهرًا بحالة "معكوس".</div>`+fld('سبب العكس (إلزامي)','reason','','ta','full'),()=>{const r=rd().reason.trim();if(!r){toast('اكتب سبب العكس',1);return false}return run('reverseJE',{id:i,ver:jeById(i).ver,reason:r},'تم عكس القيد')},'تأكيد العكس');

/* ---------- الموردون والسداد ---------- */
const payBtn=a=>AC().payAccts.length&&a.o>0.004?btn('pay',a.po,'سداد','g'):'';
V.c_ap=()=>{const A_=AC().ap,sup={},sid={};A_.forEach(a=>{const o=sup[a.supName]||(sup[a.supName]={b:0,p:0,o:0});o.b+=a.b;o.p+=a.p;o.o+=a.o;sid[a.supName]=a.sup});
  return head('الموردون والسداد')+`<div class="box"><h3>أرصدة الموردين</h3>${tbl(['المورد','المفوتر','المسدد','المتبقي',''],Object.entries(sup).map(([n,o])=>[esc(n),f(o.b),f(o.p),f(o.o),sid[n]?btn('sst',sid[n],'كشف حساب','g'):'']))}</div>
<div class="box"><h3>أوامر التوريد المستلمة</h3>${tbl(['أمر التوريد','المورد','الفرع','أول استلام','المفوتر','المسدد','المتبقي','الحالة',''],A_.map(a=>[a.no,esc(a.supName),esc(pjl(a.proj)),a.first||'—',f(a.b),f(a.p),f(a.o),st(a.st),payBtn(a)]))}</div>
<div class="box"><h3>دفعات السداد</h3>${tbl(['الرقم','التاريخ','أمر التوريد','المورد','المبلغ','المرجع','الحالة',''],AC().pays.map(p=>[p.no,p.date,esc(p.poNo),esc(p.supName),f(p.amount),esc(p.ref),st(p.st)+(p.st=='معكوس'&&p.reason?`<br><small class="mu">${esc(p.reason)}</small>`:''),p.st=='مرحّل'&&isAM()?btn('rpay',p.id,'عكس','r'):'']))}</div>`};
A.pay=poId=>{const a=(AC().ap||[]).find(x=>x.po==poId);if(!a){toast('لا يوجد مستحق على هذا الأمر',1);return}
  mdl('سداد '+a.no+' — '+a.supName,kv('المفوتر',f(a.b))+kv('المسدد',f(a.p))+kv('المتبقي',f(a.o))+sel('الدفع من','acc',AC().payAccts.map(x=>[x.id,x.code+' · '+x.name+' (رصيد '+f(x.bal)+')']))+fld('التاريخ','date',today(),'date')+fld('المبلغ','amount',a.o,'number')+fld('المرجع (رقم الشيك / التحويل)','ref')+fld('ملاحظات','note','','ta','full'),()=>{const o=rd();
    if(!(+o.amount>0)){toast('أدخل مبلغًا أكبر من صفر',1);return false}return run('payPO',{poId,acc:o.acc,date:o.date,amount:+o.amount,ref:o.ref,note:o.note},'تم تسجيل السداد')},'تسجيل السداد')};
A.rpay=i=>{const p=AC().pays.find(x=>x.id==i);mdl('عكس الدفعة '+p.no,`<div class="full mu">يُنشأ قيد عكسي وتعود المبالغ لمستحقات المورد.</div>`+fld('سبب العكس (إلزامي)','reason','','ta','full'),()=>{const r=rd().reason.trim();if(!r){toast('اكتب سبب العكس',1);return false}return run('reversePay',{id:i,reason:r},'تم عكس الدفعة')},'تأكيد العكس')};

/* ---------- عناصر التقارير ---------- */
const accOpts=s=>'<option value="">— اختر الحساب —</option>'+AC().accounts.map(a=>`<option value="${esc(a.id)}"${a.id==s?' selected':''}>${esc(a.code)} · ${esc(a.name)}</option>`).join('');
const pOpts=s=>'<option value="">كل الفروع</option><option value="-"'+(s=='-'?' selected':'')+'>غير موزع</option>'+AC().projects.map(p=>`<option value="${esc(p.id)}"${p.id==s?' selected':''}>${esc(p.name)}</option>`).join('');
const dr=(v,cr)=>v>0.004?f(v):'';
const rp=h=>{const e=$('#rp');if(e)e.innerHTML=h};
const bar=(items)=>`<div class="tb" style="flex-wrap:wrap;gap:8px">${items}</div>`;
const V$=id=>($('#'+id)||{}).value||'';
const rapi=async(a,d)=>{try{return await api(a,d)}catch(e){toast(e.message,1);return null}};

/* ---------- دفتر الأستاذ ---------- */
V.c_gl=()=>{const s=ST.gl;setTimeout(()=>s.acc&&A.glRun(),0);return head('دفتر الأستاذ','','',``)+bar(`<select id="gla" style="min-width:240px">${accOpts(s.acc)}</select><label>من</label><input id="glf" type="date" value="${s.from}"><label>إلى</label><input id="glt" type="date" value="${s.to}"><select id="glp" class="sel-sm">${pOpts(s.proj)}</select><button class="b" data-a="glRun">عرض</button><button class="b o" data-a="glPr">طباعة</button><button class="b o" data-a="glX">Excel</button>${HR.box()}`)+`<div class="box" id="rp"><span class="mu">اختر الحساب ثم اضغط عرض.</span></div>`};
let GLR=null;
A.glRun=async()=>{const s=ST.gl;s.acc=V$('gla')||s.acc;s.from=V$('glf');s.to=V$('glt');s.proj=V$('glp');if(!s.acc){toast('اختر الحساب',1);return}
  const j=await rapi('gl',{acc:s.acc,from:s.from,to:s.to,proj:s.proj});if(!j)return;GLR=j;
  rp(`<h3>${esc(j.acc.code+' · '+j.acc.name)}</h3><div style="overflow-x:auto">${tbl(['التاريخ','القيد','النوع','البيان','الفرع','مدين','دائن','الرصيد'],[['','','','<b>رصيد أول المدة</b>','','','',f(j.open)]].concat(j.rows.map(r=>[r.date,`<a href="#" data-a="vje2" data-i="${esc(r.jeId)}">${esc(r.jeNo)}</a>`,jtN(r.jt),esc(r.memo),esc(prjN(r.proj)),dr(r.dr),dr(r.cr),f(r.bal)])).concat([['','','','<b>الرصيد الختامي</b>','','','','<b>'+f(j.close)+'</b>']]))}</div><p class="mu">الرصيد: موجب = مدين، سالب = دائن.</p>`)};
A.vje2=i=>{const j=jeById(i);if(j)A.vje(i);else toast('القيد خارج آخر 300 قيد محمّلة؛ ابحث عنه برقمه من النسخة الاحتياطية أو ضيّق الفترة',1)};
A.glPr=async x=>{if(!GLR){toast('اعرض التقرير أولًا',1);return}let j=GLR;if(HR.on()){const s=ST.gl;j=await rapi('gl',{acc:s.acc,from:s.from,to:s.to,proj:s.proj,hideRev:true});if(!j)return}docOut(printHead('دفتر الأستاذ — '+j.acc.name)+`<p>الفترة: ${esc(ST.gl.from)} إلى ${esc(ST.gl.to)}</p>`+tbl(['التاريخ','القيد','البيان','مدين','دائن','الرصيد'],[['','','رصيد أول المدة','','',f(j.open)]].concat(j.rows.map(r=>[r.date,esc(r.jeNo),esc(r.memo),dr(r.dr),dr(r.cr),f(r.bal)])))+printFoot(),'دفتر الأستاذ '+j.acc.name,x?1:0)};
A.glX=()=>A.glPr(1);

/* ---------- ميزان المراجعة ---------- */
const TBT=[['asset','الأصول'],['liability','الالتزامات'],['equity','حقوق الملكية'],['revenue','الإيرادات'],['expense','المصروفات']];
V.c_tb=()=>{const s=ST.tb;setTimeout(()=>A.tbRun(),0);return head('ميزان المراجعة')+bar(`<label>من</label><input id="tbf" type="date" value="${s.from}" style="width:auto"><label>إلى</label><input id="tbt" type="date" value="${s.to}" style="width:auto"><label style="font-weight:400"><input id="tbz" type="checkbox" style="width:auto"${s.zero?' checked':''}> إظهار الحسابات الصفرية</label><details style="display:inline-block"><summary class="mu" style="cursor:pointer">تصفية إضافية (اختياري)</summary><label>الفرع</label><select id="tbp" class="sel-sm" style="width:auto">${pOpts(s.proj)}</select></details><button class="b" data-a="tbRun">عرض</button><button class="b o" data-a="tbPr">طباعة</button>`)+`<div class="box" id="rp"></div>`};
let TBR=null;
const split=v=>[v>0.004?f(v):'',v<-0.004?f(-v):''];
const tbRows=j=>{const out=[];TBT.forEach(([t,n])=>{const L=j.rows.filter(r=>r.type===t);if(!L.length)return;
  out.push({h:n});let o=0,d=0,c=0,cl=0;L.forEach(r=>{out.push({r});o=r2(o+r.open);d=r2(d+r.dr);c=r2(c+r.cr);cl=r2(cl+r.close)});out.push({sub:'إجمالي '+n,o,d,c,cl})});
  const rest=j.rows.filter(r=>!TBT.some(x=>x[0]===r.type));rest.forEach(r=>out.push({r}));return out};
A.tbRun=async()=>{const s=ST.tb;if($('#tbf')){s.from=V$('tbf');s.to=V$('tbt');s.proj=V$('tbp');s.zero=!!($('#tbz')||{}).checked}
  const j=await rapi('tb',{from:s.from,to:s.to,proj:s.proj,zero:s.zero});if(!j)return;TBR=j;
  const T=j.totals,bal=Math.abs(T.dr-T.cr)<0.005&&Math.abs(T.open)<0.005&&Math.abs(T.close)<0.005;
  const body=tbRows(j).map(x=>x.h?`<tr><td colspan="8" style="background:var(--s);font-weight:700">${esc(x.h)}</td></tr>`:x.sub?`<tr style="font-weight:700"><td></td><td>${esc(x.sub)}</td>${split(x.o).map(v=>'<td>'+v+'</td>').join('')}<td>${f(x.d)}</td><td>${f(x.c)}</td>${split(x.cl).map(v=>'<td>'+v+'</td>').join('')}</tr>`:`<tr><td>${esc(x.r.code)}</td><td>${esc(x.r.name)}</td>${split(x.r.open).map(v=>'<td>'+v+'</td>').join('')}<td>${dr(x.r.dr)}</td><td>${dr(x.r.cr)}</td>${split(x.r.close).map(v=>'<td>'+v+'</td>').join('')}</tr>`).join('');
  rp(`<div style="overflow-x:auto"><table><thead><tr>${['الكود','الحساب','الافتتاحي مدين','الافتتاحي دائن','حركة مدينة','حركة دائنة','الختامي مدين','الختامي دائن'].map(h=>'<th>'+h+'</th>').join('')}</tr></thead><tbody>${body||'<tr><td colspan="8" style="text-align:center;color:var(--m)">لا توجد حركة في الفترة</td></tr>'}<tr style="font-weight:700;border-top:2px solid var(--p)"><td></td><td>الإجمالي العام</td>${split(T.open).map(v=>'<td>'+v+'</td>').join('')}<td>${f(T.dr)}</td><td>${f(T.cr)}</td>${split(T.close).map(v=>'<td>'+v+'</td>').join('')}</tr></tbody></table></div>`+(s.proj?`<p class="mu">⚠ الميزان مُصفّى بفرع (${esc(s.proj==='-'?'غير موزع':((AC().projects.find(p=>p.id==s.proj)||{}).name||s.proj))}) — قد لا يتوازن لأن القيد الواحد يُوزَّع على أكثر من فرع. أزل التصفية للميزان العام.</p>`:`<p class="${bal?'good':''}">${bal?'✔ الميزان متوازن (إجمالي المدين = إجمالي الدائن).':'⚠ الميزان غير متوازن!'}</p>`))};
A.tbPr=()=>{if(!TBR){toast('اعرض التقرير أولًا',1);return}const j=TBR;const rows=tbRows(j).map(x=>x.h?[`<b>${esc(x.h)}</b>`,'','','','','','']:x.sub?['',`<b>${esc(x.sub)}</b>`,'<b>'+f(x.o)+'</b>','<b>'+f(x.d)+'</b>','<b>'+f(x.c)+'</b>','<b>'+f(x.cl)+'</b>']:[esc(x.r.code),esc(x.r.name),f(x.r.open),dr(x.r.dr),dr(x.r.cr),f(x.r.close)]).map(r=>r.slice(0,6));
  printHtml(printHead('ميزان المراجعة')+`<p>الفترة: ${esc(ST.tb.from)} إلى ${esc(ST.tb.to)}${ST.tb.proj?' — مُصفّى بفرع':''}</p>`+tbl(['الكود','الحساب','افتتاحي','مدين','دائن','ختامي'],rows.concat([['','<b>الإجمالي العام</b>','<b>'+f(j.totals.open)+'</b>','<b>'+f(j.totals.dr)+'</b>','<b>'+f(j.totals.cr)+'</b>','<b>'+f(j.totals.close)+'</b>']]))+printFoot())};

/* ---------- القوائم المالية ---------- */
V.c_rep=()=>{setTimeout(()=>A.repRun(),0);const t=ST.rt;
  return head('القوائم المالية')+`<div class="tb" style="gap:8px">${[['ie','قائمة الدخل حسب الفرع'],['bs','المركز المالي'],['age','تقادم أرصدة الموردين']].map(x=>`<button class="b ${t==x[0]?'':'o'}" data-a="repT" data-i="${x[0]}">${x[1]}</button>`).join('')}</div>`+
  bar(t=='ie'?`<label>من</label><input id="rf" type="date" value="${ST.ie.from}"><label>إلى</label><input id="rt" type="date" value="${ST.ie.to}">`:`<label>حتى تاريخ</label><input id="rt" type="date" value="${ST[t].to}">`)+`<div class="tb"><button class="b" data-a="repRun">عرض</button><button class="b o" data-a="repPr">طباعة</button></div><div class="box" id="rp"></div>`};
A.repT=i=>{ST.rt=i;render()};
let REPH='';
A.repRun=async()=>{const t=ST.rt;if(t=='ie'){if($('#rf')){ST.ie.from=V$('rf');ST.ie.to=V$('rt')}}else if($('#rt'))ST[t].to=V$('rt');
  if(t=='ie'){const j=await rapi('ie',{from:ST.ie.from,to:ST.ie.to});if(!j)return;
    const cols=j.projects.map(p=>({id:p.id,n:p.name,fu:''})).concat([{id:'',n:'غير موزع',fu:''}]);
    const sec=ty=>j.rows.filter(r=>r.type==ty),sm=rs=>cols.map(c=>r2(rs.reduce((s,r)=>s+(r.byProj[c.id]||0),0)));
    const rv=sec('revenue'),cg=j.rows.filter(r=>r.type=='expense'&&r.cls=='cogs'),ex=j.rows.filter(r=>r.type=='expense'&&r.cls!='cogs'),rs=sm(rv),cs=sm(cg),es=sm(ex),gp=rs.map((v,i)=>r2(v-cs[i])),tot=gp.map((v,i)=>r2(v-es[i])),hd=l=>['<b>'+l+'</b>'].concat(cols.map(()=>''),['']);
    const row=(r)=>[esc(r.code+' · '+r.name)].concat(cols.map(c=>f(r.byProj[c.id]||0)),['<b>'+f(r.total)+'</b>']);
    const sumRow=(l,a)=>['<b>'+l+'</b>'].concat(a.map(v=>'<b>'+f(v)+'</b>'),['<b>'+f(r2(a.reduce((x,y)=>x+y,0)))+'</b>']);
    const h=['البند'].concat(cols.map(c=>esc(c.n)+(c.fu?'<br><small class="mu">'+esc(c.fu)+'</small>':'')),['الإجمالي']);
    REPH=`<h3>قائمة الدخل — ${esc(ST.ie.from)} إلى ${esc(ST.ie.to)}</h3><div style="overflow-x:auto">${tbl(h,[hd('الإيرادات')].concat(rv.map(row),[sumRow('إجمالي الإيرادات',rs)],[hd('تكلفة المبيعات')],cg.map(row),[sumRow('إجمالي تكلفة المبيعات',cs)],[sumRow('مجمل الربح',gp)],[hd('المصروفات التشغيلية والإدارية')],ex.map(row),[sumRow('إجمالي المصروفات التشغيلية',es)],[sumRow('صافي الربح / (الخسارة)',tot)]))}</div>`;rp(REPH)}
  else if(t=='bs'){const j=await rapi('bs',{to:ST.bs.to});if(!j)return;const sec=(l,a)=>[['<b>'+l+'</b>','']].concat(a.map(x=>[esc(x.code+' · '+x.name),f(x.v)]));
    REPH=`<h3>قائمة المركز المالي حتى ${esc(ST.bs.to)}</h3><div style="overflow-x:auto">${tbl(['البند','المبلغ'],sec('الأصول',j.assets).concat([['<b>إجمالي الأصول</b>','<b>'+f(j.totals.assets)+'</b>']],sec('الخصوم',j.liabilities),[['<b>إجمالي الخصوم</b>','<b>'+f(j.totals.liabilities)+'</b>']],sec('حقوق الملكية',j.equity),[['ربح / (خسارة) الفترة (الإيرادات − المصروفات)',f(j.profit)],['<b>إجمالي حقوق الملكية</b>','<b>'+f(j.totals.equity)+'</b>'],['<b>إجمالي الخصوم وحقوق الملكية</b>','<b>'+f(j.totals.le)+'</b>']]))}</div><p class="${Math.abs(j.totals.assets-j.totals.le)<0.005?'good':''}">${Math.abs(j.totals.assets-j.totals.le)<0.005?'✔ الأصول = الخصوم + حقوق الملكية.':'⚠ المعادلة المحاسبية غير متوازنة!'}</p>`;rp(REPH)}
  else{const j=await rapi('apAging',{to:ST.age.to});if(!j)return;const B=['0-30 يوم','31-60','61-90','أكثر من 90'];
    REPH=`<h3>تقادم أرصدة الموردين حتى ${esc(ST.age.to)}</h3><div style="overflow-x:auto">${tbl(['أمر التوريد','المورد','الفرع','أول استلام','العمر (يوم)','الفئة','المتبقي'],j.rows.map(r=>[esc(r.no),esc(r.supName),esc(pjl(r.proj)),r.first,r.age,B[r.bucket],f(r.o)]).concat([['<b>الإجمالي</b>','','','','','','<b>'+f(j.total)+'</b>']]))}</div><div class="cards" style="margin-top:12px">${B.map((b,i)=>`<div class="card"><small>${b}</small><h2>${f(j.buckets[i])}</h2></div>`).join('')}</div>`;rp(REPH)}};
A.repPr=()=>{if(!REPH){toast('اعرض التقرير أولًا',1);return}printHtml(printHead('قوائم مالية')+REPH.replace(/<a [^>]*>/g,'').replace(/<\/a>/g,'')+printFoot())};

/* ---------- دليل الحسابات ---------- */
V.c_coa=()=>head('دليل الحسابات',isAM()?'nacc':'','+ حساب جديد')+`<div class="box">${tbl(['الكود','الحساب','النوع','المجموعة','خصائص','الرصيد (مدين + / دائن −)','الحالة',''],AC().accounts.map(a=>[esc(a.code),esc(a.name),TYPES[a.type],esc(a.grp),[a.cash?'خزينة/بنك':'',a.sys?'مرتبط بالنظام':''].filter(Boolean).join('، ')||'—',f(AC().bal[a.id]||0),a.active?'<span class="st">نشط</span>':'<span class="st">موقوف</span>',isAM()?btn('nacc',a.id,'تعديل','o')+((!a.sys||String(a.sys).startsWith('PRV:'))?btn('xacc',a.id,'حذف','r'):''):'']))}</div><p class="mu">حسابا المخزون والموردين تحت رقابة المخازن والمشتريات؛ لا يُرحَّل عليهما يدويًا.</p>`;
const ACC_GR={asset:['نقدية وبنوك','أصول متداولة','أصول ثابتة'],liability:['خصوم متداولة','خصوم طويلة الأجل'],equity:['حقوق الملكية'],revenue:['الإيرادات'],expense:['تكلفة المبيعات','المصروفات']};
const accGroups=ty=>{const s=new Set(ACC_GR[ty]||[]);AC().accounts.forEach(a=>{if(a.type===ty&&a.grp)s.add(a.grp)});return [...s]};
/* نفس خوارزمية الخادم (المعاينة فقط؛ الخادم هو الذي يقرر الكود النهائي) */
const accNext=(ty,gp)=>{const T={asset:1,liability:2,equity:3,revenue:4,expense:5}[ty];if(!T||!gp)return '';const all=AC().accounts,four=a=>/^\d{4}$/.test(a.code),used={},pf={},cnt={};
  all.forEach(a=>{used[a.code]=1;if(four(a))pf[a.code.slice(0,2)]=1});['4130','1230','1410','1510','1590','5310','5410','5420','5430','5440','5450','2310','2320'].forEach(c=>used[c]=1);
  all.forEach(a=>{if(a.type===ty&&a.grp===gp&&four(a)&&a.code[0]==T){const p=a.code.slice(0,2);cnt[p]=(cnt[p]||0)+1}});
  let p=Object.keys(cnt).sort((x,y)=>cnt[y]-cnt[x]||(x<y?-1:1))[0];
  if(!p)for(let k=1;k<=9&&!p;k++)if(!pf[''+T+k])p=''+T+k;
  if(!p)return '';let mx=0;all.forEach(a=>{if(four(a)&&a.code.slice(0,2)===p&&!String(a.sys||'').startsWith('PRV:'))mx=Math.max(mx,+a.code)});
  const b=+p*100;for(let n=Math.floor(Math.max(mx,b)/10)*10+10;n<=b+90;n+=10)if(!used[''+n])return ''+n;for(let n=b+1;n<=b+99;n++)if(!used[''+n])return ''+n;return ''};
const accGrpHtml=(ty,cur)=>accGroups(ty).map(g=>`<option value="${esc(g)}"${g===cur?' selected':''}>${esc(g)}</option>`).join('')+'<option value="__new">+ مجموعة جديدة…</option>';
window.accPrev=()=>{const ty=($('#m [name=type]')||{}).value,gs=$('#m [name=grpsel]'),gn=$('#m .accgn'),e=$('#m #accpv');if(!gs||!e)return;const nw=gs.value==='__new';if(gn)gn.hidden=!nw;
  const gp=nw?(($('#m [name=grpnew]')||{}).value||'').trim():gs.value,man=(($('#m [name=code]')||{}).value||'').trim();
  e.innerHTML=man?'كود يدوي: <b>'+esc(man)+'</b>':(gp?'الكود التلقائي المتوقع: <b>'+esc(accNext(ty,gp)||'سيحدده الخادم')+'</b>':'اختر المجموعة لعرض الكود')};
dlg.addEventListener('change',e=>{const n=e.target&&e.target.name;if(!$('#m #accpv'))return;
  if(n==='type'){const gs=$('#m [name=grpsel]');gs.innerHTML=accGrpHtml(e.target.value,'')}
  if(n==='type'||n==='grpsel')accPrev()});
dlg.addEventListener('input',e=>{if($('#m #accpv')&&['grpnew','code'].includes(e.target&&e.target.name))accPrev()});
A.xacc=i=>{const a=accO(i);if(!a)return;const prv=String(a.sys||'').startsWith('PRV:');if(!confirm('حذف الحساب '+a.code+' · '+a.name+'؟'+(prv?'\nحساب وسيط قديم: ستُنقل حركاته التاريخية إلى حساب المورد (ضمن الموردين) ويُحذف الحساب.':'')))return;run('delAcc',{id:i},'تم حذف الحساب')};
A.nacc=i=>{const x=i?accO(i):{type:'expense',active:true,grp:''};
  mdl(i?'تعديل حساب':'حساب جديد',
   (i?fld('كود الحساب (ثابت)','code',x.code):`<div class="full mu">الكود يتولّد تلقائيًا: الخانة الأولى للنوع (1 أصول، 2 خصوم، 3 حقوق الملكية، 4 إيرادات، 5 مصروفات)، الثانية للمجموعة، والأخيرتان تسلسل بخطوة 10.</div>`)
   +fld('اسم الحساب','name',x.name,'text','full')+sel('النوع','type',Object.entries(TYPES),x.type)
   +(i?fld('المجموعة (للعرض)','grp',x.grp):`<div><label>المجموعة</label><select name="grpsel">${accGrpHtml(x.type,'')}</select></div><div class="accgn" hidden>${fld('اسم المجموعة الجديدة','grpnew','')}</div>`)
   +(i?'':`<div class="full"><span id="accpv" class="mu"></span></div>`+fld('كود يدوي (اختياري — اتركه فارغًا للتوليد التلقائي)','code','','text','full'))
   +sel('خزينة / بنك؟ (يظهر في السداد والسندات)','cash',[['false','لا'],['true','نعم (أصل نقدي)']],String(!!x.cash))+(i?sel('الحالة','active',[['true','نشط'],['false','موقوف']],x.active?'true':'false'):''),
   ()=>{const o=rd();if(!i){o.grp=o.grpsel==='__new'?(o.grpnew||'').trim():o.grpsel;delete o.grpsel;delete o.grpnew}return run('saveAcc',{...o,id:i||undefined},'تم حفظ الحساب')});
  if(i){const c=$('#m [name=code]');if(c)c.readOnly=true}else accPrev()};

/* ---------- الفروع ---------- */
V.c_prj=()=>head('الفروع ومراكز الربح',isAM()?'nprj':'','+ فرع جديد')+`<div class="box">${tbl(['الكود','الفرع','إيرادات','مصروفات','الحالة',''],AC().projects.map(p=>{const j=AC().je.filter(x=>x.st=='مرحّل'||x.st=='معكوس'),sum=ty=>j.reduce((s,x)=>s+x.lines.filter(l=>l.proj==p.id&&accO(l.acc).type==ty).reduce((a,l)=>a+(ty=='revenue'?l.cr-l.dr:l.dr-l.cr),0),0);
  return[esc(p.code),esc(p.name),f(sum('revenue')),f(sum('expense')),p.active?'<span class="st">نشط</span>':'<span class="st">موقوف</span>',isAM()?btn('nprj',p.id,'تعديل','o'):'']}))}</div><p class="mu">الفروع تُكوَّد مركزيًا (الإدارة ← الفروع) ويختارها المستخدم من قائمة في طلب الشراء وأمر التوريد وطلب الصرف، فتُوزَّع القيود عليها تلقائيًا؛ ما بلا فرع يظهر "غير موزع". الأرقام هنا من آخر القيود المحمّلة؛ التقرير الكامل في القوائم المالية.</p>`;

/* ---------- الفترات والفحص ---------- */
V.c_per=()=>head('إقفال الفترات')+`<div class="box"><h3>إقفال الفترات</h3><p>${AC().closedTo?'الفترة مُقفلة حتى <b>'+esc(AC().closedTo)+'</b>: لا قيود ولا مستندات مخزنية ولا سداد بتاريخ ضمنها.':'لا توجد فترة مُقفلة.'}</p>${isAM()?`<button class="b" data-a="clp">إقفال حتى تاريخ</button> `:''}${ar()=='admin'&&AC().closedTo?`<button class="b o" data-a="rop">إعادة فتح (مدير النظام)</button>`:''}<p class="mu">لا يُقفل بوجود قيود غير مُرحَّلة ضمن الفترة. لا حاجة لقيود إقفال سنوية: ربح/خسارة الفترة يُحسب في قائمة المركز المالي.</p></div>`;
V.c_chk=()=>head('فحص سلامة الدفاتر')+`<div class="box"><h3>فحص سلامة الدفاتر</h3><p class="mu">يتحقق من توازن كل قيد وميزان المراجعة، ومطابقة رصيد المخزون وحساب الموردين مع المخازن وأوامر التوريد، وسلامة الدفعات.</p>${['admin','manager','viewer'].includes(ar())?'<button class="b o" data-a="chk">تشغيل الفحص</button>':''}</div>`;
A.clp=()=>mdl('إقفال فترة',fld('إقفال حتى تاريخ (شامل)','date',today(),'date')+`<div class="full mu">بعد الإقفال لا يمكن الترحيل بتاريخ ضمن الفترة إلا بإعادة فتحها بواسطة مدير النظام.</div>`,()=>run('closePeriod',{date:rd().date},'تم إقفال الفترة'),'إقفال');
A.rop=()=>mdl('إعادة فتح الفترات',fld('فتح الفترات بعد التاريخ (اتركه فارغًا لفتح الكل)','date','','date')+fld('السبب (إلزامي)','reason','','ta','full'),()=>{const o=rd();if(!o.reason.trim()){toast('اكتب السبب',1);return false}return run('reopenPeriod',{date:o.date,reason:o.reason},'تمت إعادة الفتح')},'إعادة فتح');
A.chk=async()=>{const j=await rapi('acctCheck',{});if(!j)return;mdl('فحص سلامة الدفاتر',`<div class="full">${j.issues.length?`<p style="color:#a11"><b>${j.issues.length} ملاحظة:</b></p><ul>${j.issues.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p class="good"><b>✔ الدفاتر سليمة ومطابقة للمخازن والمشتريات.</b></p>'}<p class="mu">تم فحص ${j.lines} سطر دفتر و${j.entries} قيد.</p></div>`,null)};

/* ---------- ربط الحسابات بأدوار النظام ---------- */
const MAPR=[['INV','asset','المخزون','المخازن: الاستلام يُدين والصرف يُدائن','lock'],['AP','liability','الموردون','المشتريات: ذمم الموردين والسداد','lock'],['VATIN','asset','ضريبة القيمة المضافة - مدخلات','فواتير التوريد'],['ISS_EXP','expense','مصروف صرف المواد','صرف المخزون على الطلبات والفروع'],['PROC_EXP','expense','مصروف الخدمات والأعمال','بنود الخدمات في أوامر التوريد'],['INV_ADJ','expense','فروقات الجرد','تسويات الجرد (زيادة/عجز)'],['OPEN_EQ','equity','الرصيد الافتتاحي','الأرصدة الافتتاحية للمخزون والموردين'],['SALES_REV','revenue','إيرادات المبيعات والخدمات','فواتير المبيعات'],['CUST_ADV','liability','دفعات مقدمة من العملاء','عربون طلبات المناسبات (يُنشأ 2150 تلقائيًا)'],['ADV','asset','عهد وسلف العاملين','العهد والسلف (يُنشأ 1410 تلقائيًا)'],['FA','asset','الأصول الثابتة (بالتكلفة)','الأصول الثابتة (1510)'],['ACCDEP','asset','مجمع إهلاك الأصول الثابتة','الإهلاك (1590)'],['DEPEXP','expense','مصروف الإهلاك','الإهلاك (5310)'],['FA_GAIN','revenue','أرباح استبعاد أصول','الاستبعاد (4190)'],['FA_LOSS','expense','خسائر استبعاد أصول','الاستبعاد (5290)']];
const TYN={asset:'أصول',liability:'خصوم',equity:'حقوق ملكية',revenue:'إيرادات',expense:'مصروفات'};
V.c_map=()=>{const A_=AC().accounts;
  return head('ربط الحسابات بأدوار النظام')+`<div class="box">${tbl(['الدور','يُستخدم في','النوع المطلوب','الحساب المرتبط حاليًا','إجراءات'],MAPR.map(m=>{const a=A_.find(x=>x.sys===m[0]);return[`<b>${esc(m[2])}</b><br><small class="mu">${m[0]}</small>`,esc(m[3]),TYN[m[1]],a?esc(a.code+' · '+a.name):'<span class="mu">تلقائي (يُنشأ/يُربط بالكود المعتاد عند أول استخدام)</span>',isAM()?btn('map',m[0],'تغيير الحساب','o'):'']}))}</div>
<div class="box"><h3>ملاحظات</h3><p class="mu">• تغيير الربط يسري على القيود الجديدة فقط؛ القيود القديمة تبقى على حساباتها (ويظهر الفرق في ميزان المراجعة).<br>• المخزون والموردون لا يُنقلان بعد وجود قيود على الحساب الحالي أو الجديد لارتباطهما بتسوية الأرصدة؛ اربطهما قبل بدء العمل أو بحسابات لم تُستخدم.<br>• الحساب الواحد لا يؤدي إلا دورًا واحدًا، ولا يصح ربط حساب خزينة/بنك.<br>• لإضافة حساب جديد ثم ربطه: دليل الحسابات ← حساب جديد.</p></div>`};
A.map=k=>{const m=MAPR.find(x=>x[0]==k),cur=AC().accounts.find(x=>x.sys===k);
  const el=AC().accounts.filter(a=>a.type===m[1]&&a.active&&!a.cash&&(!a.sys||a.sys===k));
  mdl('ربط دور: '+m[2],`<div class="full mu">${esc(m[3])}${m[4]?'<br>هذا الدور لا يُنقل بعد وجود قيود على الحساب.':''}</div>`+sel('الحساب ('+TYN[m[1]]+')','acc',[['','— اختر —']].concat(el.map(a=>[a.id,a.code+' · '+a.name])),cur?cur.id:'','full'),()=>{const o=rd();if(!o.acc){toast('اختر الحساب',1);return false}return run('saveAccMap',{key:k,acc:o.acc},'تم ربط الحساب')})};

/* ---------- كشف حساب المورد (فترة + طباعة + Excel) ---------- */
let SS={id:'',from:'',to:'',res:null};
const ssHtml=(j,pr)=>{const S=j.sup,per=(j.from||j.to)?('من '+(j.from||'البداية')+' إلى '+(j.to||'اليوم')):'كل الفترات';
  const side=v=>v>0.004?'دائن (مستحق للمورد)':v<-0.004?'مدين (مستحق على المورد)':'متزن';
  const rows=[['','','','رصيد افتتاحي','','','',f(Math.abs(j.opening))+' '+(j.opening>0.004?'دائن':j.opening<-0.004?'مدين':'')]]
   .concat(j.rows.map(r=>[esc(r.date),esc(r.no),esc(r.type),esc(r.po||'—'),esc(r.memo),r.dr?f(r.dr):'',r.cr?f(r.cr):'',f(Math.abs(r.bal))+' '+(r.bal>0.004?'دائن':r.bal<-0.004?'مدين':'')]));
  rows.push(['<b>الإجمالي</b>','','','','',`<b>${f(j.totalDr)}</b>`,`<b>${f(j.totalCr)}</b>`,`<b>${f(Math.abs(j.closing))} ${j.closing>0.004?'دائن':j.closing<-0.004?'مدين':''}</b>`]);
  return (pr?printHead('كشف حساب مورد'):'')+`<p><b>المورد:</b> ${esc(S.name)}${S.phone?' — '+esc(S.phone):''}${S.tax?' — الرقم الضريبي '+esc(S.tax):''} &nbsp; <b>الفترة:</b> ${per}</p>`
   +tbl(['التاريخ','رقم القيد','البيان','أمر التوريد','التفاصيل','مدين','دائن','الرصيد'],rows)
   +`<p><b>الرصيد الختامي:</b> ${f(Math.abs(j.closing))} ج.م — ${side(j.closing)}</p>`+(pr?printFoot():'')};
const ssFetch=async()=>HR.on()?await api('supStmt',{sup:SS.id,from:SS.from,to:SS.to,hideRev:true}):SS.res;
const ssShow=async()=>{const j=await api('supStmt',{sup:SS.id,from:SS.from,to:SS.to});SS.res=j;const b=$('#ssbody');if(b)b.innerHTML=ssHtml(j,false);return j};
A.sst=async i=>{const t=today();SS={id:i,from:t.slice(0,4)+'-01-01',to:t,res:null};
  try{const j=await ssShow.call(null);
   mdl('كشف حساب المورد: '+j.sup.name,`<div class="full db" style="display:flex;gap:8px;flex-wrap:wrap;align-items:end">${fld('من تاريخ','sfrom',SS.from,'date')}${fld('إلى تاريخ','sto',SS.to,'date')}<button type="button" class="b" data-a="sstf">عرض الفترة</button><button type="button" class="b o" data-a="sstm" data-i="m">هذا الشهر</button><button type="button" class="b o" data-a="sstm" data-i="y">هذه السنة</button><button type="button" class="b o" data-a="sstm" data-i="a">كل الفترات</button></div><div class="full" id="ssbody" style="overflow-x:auto">${ssHtml(j,false)}</div><div class="full"><button class="b g" data-a="sstp">طباعة</button> <button class="b g" data-a="sstx">Excel</button> ${HR.box()}</div>`,null)}catch(e){toast(e.message,1)}};
A.sstf=async()=>{SS.from=($('#m [name=sfrom]')||{}).value||'';SS.to=($('#m [name=sto]')||{}).value||'';try{await ssShow()}catch(e){toast(e.message,1)}};
A.sstm=async i=>{const t=today();const p=i==='m'?{from:t.slice(0,8)+'01',to:t}:i==='y'?{from:t.slice(0,4)+'-01-01',to:t}:{from:'',to:''};SS.from=p.from;SS.to=p.to;
  const a=$('#m [name=sfrom]'),b=$('#m [name=sto]');if(a)a.value=p.from;if(b)b.value=p.to;try{await ssShow()}catch(e){toast(e.message,1)}};
A.sstp=async()=>{if(!SS.res)return;try{const j=await ssFetch();docOut(ssHtml(j,true),'كشف حساب '+j.sup.name)}catch(e){toast(e.message,1)}};
A.sstx=async()=>{if(!SS.res)return;try{const j=await ssFetch();docOut(ssHtml(j,true),'كشف حساب '+j.sup.name,1)}catch(e){toast(e.message,1)}};
})();
