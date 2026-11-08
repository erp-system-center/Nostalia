/* =====================================================================
   مديول المبيعات: لوحة التحكم، العملاء (وكشف الحساب)، فواتير المبيعات والتحصيل، التقارير (أعمار الديون ومبيعات حسب العميل/الصنف)
   ===================================================================== */
(()=>{
const SL=()=>D.sal||{custs:[],sinv:[],rcts:[],items:[],whs:[],stock:{},cash:[],revs:[],projects:[],pkgs:[],ords:[]};
const role=()=>SL().role;
const canW=()=>['admin','officer','manager'].includes(role());
const isMgr=()=>['admin','manager'].includes(role());
const COL={'مسودة':'#c77a00','مرحّل':'#1d5fa8','مقبوض':'var(--ok)','مقبوض جزئيًا':'#8a6d00','ملغي':'#777'};
const bd=s=>`<span class="st" style="background:${COL[s]||'#777'};color:#fff">${esc(s)}</span>`;
let DM=null,DMT=0;
const dimsLoad=async()=>{if(DM&&Date.now()-DMT<60000)return;DMT=Date.now();try{DM=await api('invDims')}catch(e){DM=DM||{}}};
const P=(l,t)=>t?`<p><b>${l}:</b> ${esc(t)}</p>`:'';
const noLink=t=>head(t)+'<div class="box mu">الربط المحاسبي غير مُفعَّل؛ يفعّله مدير النظام من مديول الحسابات.</div>';
MODS.sal={title:'المبيعات',has:()=>D.user.mods.sal&&D.sal,nav:()=>[['s_dash','لوحة التحكم'],['s_cus','العملاء'],['s_ord','طلبات المناسبات'],['s_pkg','باقات المنيو'],['s_inv','فواتير المبيعات'],['s_rep','التقارير']]};
/* ================= العملاء ================= */
let CS={};
V.s_cus=()=>{
  if(!SL().linked)return noLink('العملاء');
  const L=SL().custs,tot=L.reduce((s,c)=>s+c.bal,0);
  return head('العملاء',canW()?'ncu':'','+ عميل')
   +`<div class="cards"><div class="card"><div class="mu">عدد العملاء</div><b>${L.length}</b></div><div class="card"><div class="mu">إجمالي المستحق على العملاء</div><b>${f(tot)}</b></div></div>`
   +`<div class="box">${tbl(['الكود','العميل','الهاتف','الرقم الضريبي','حد الائتمان','الرصيد (مدين)','الحالة',''],L.map(c=>[esc(c.code),esc(c.name),esc(c.phone),esc(c.tax),c.credit?f(c.credit):'—',f(c.bal),c.active?'<span class="st">نشط</span>':'<span class="st">موقوف</span>',btn('cst',c.id,'كشف حساب','g')+(canW()?btn('ncu',c.id,'تعديل','o'):'')+(isMgr()?btn('dcu',c.id,'حذف','r'):'')]))}</div>`};
A.dcu=i=>{const x=SL().custs.find(c=>c.id==i);if(x&&confirm('حذف العميل «'+x.name+'»؟ (لا يُحذف إن كانت عليه فواتير أو طلبات؛ أوقفه بدل الحذف)'))run('delCust',{id:i},'تم حذف العميل')};
A.ncu=i=>{const x=i?SL().custs.find(c=>c.id==i):{active:true};
  mdl(i?'تعديل عميل '+x.code:'عميل جديد',fld('اسم العميل','name',x.name||'','text','full')+fld('الهاتف','phone',x.phone||'')+fld('البريد','email',x.email||'')+fld('العنوان','addr',x.addr||'','text','full')+fld('الرقم الضريبي','tax',x.tax||'')+fld('حد الائتمان (0 = بلا حد)','credit',x.credit||0,'number')+(i?sel('الحالة','active',[['true','نشط'],['false','موقوف']],x.active?'true':'false'):'')+fld('ملاحظات','note',x.note||'','ta','full'),
   ()=>{const o=rd();if(!o.name.trim()){toast('أدخل اسم العميل',1);return false}return run('saveCust',{...o,id:i||undefined,ver:x.ver},'تم حفظ العميل').then(r=>r!==false)})};
const csHtml=(j,pr)=>(pr?printHead('كشف حساب عميل'):'')+`<div class="g"><div>${P('العميل',j.cust.code+' · '+j.cust.name)+P('الهاتف',j.cust.phone)+P('الرقم الضريبي',j.cust.tax)}</div><div>${P('الفترة',(j.from||j.to)?('من '+(j.from||'البداية')+' إلى '+(j.to||'اليوم')):'كل الفترات')+P('تاريخ الإصدار',j.generated)}</div></div>`
  +tbl(['التاريخ','رقم القيد','النوع','الفاتورة','البيان','مدين','دائن','الرصيد'],[['','','','','<b>رصيد أول المدة</b>','','',f(j.opening)]].concat(j.rows.map(r=>[esc(r.date),esc(r.no),esc(r.type),esc(r.inv),esc(r.memo),r.dr>0.004?f(r.dr):'',r.cr>0.004?f(r.cr):'',f(r.bal)])).concat([['','','','','<b>الإجمالي</b>','<b>'+f(j.totalDr)+'</b>','<b>'+f(j.totalCr)+'</b>','<b>'+f(j.closing)+'</b>']]))+`<p>الرصيد الختامي: <b>${f(Math.abs(j.closing))}</b> ج.م — ${j.closing>0.004?'مدين (مستحق لنا)':j.closing<-0.004?'دائن (مستحق للعميل)':'لا رصيد'}</p>`+(pr?printFoot():'');
const csShow=async()=>{const j=await api('custStmt',{cust:CS.id,from:CS.from,to:CS.to});CS.res=j;const b=$('#csbody');if(b)b.innerHTML=csHtml(j,false);return j};
A.cst=async i=>{const t=today();CS={id:i,from:t.slice(0,4)+'-01-01',to:t,res:null};
  try{const j=await csShow();mdl('كشف حساب العميل: '+j.cust.name,`<div class="full db" style="display:flex;gap:8px;flex-wrap:wrap;align-items:end">${fld('من تاريخ','sfrom',CS.from,'date')}${fld('إلى تاريخ','sto',CS.to,'date')}<button type="button" class="b" data-a="cstf">عرض الفترة</button><button type="button" class="b o" data-a="cstm" data-i="a">كل الفترات</button></div><div class="full" id="csbody" style="overflow-x:auto">${csHtml(j,false)}</div><div class="full"><button class="b g" data-a="cstp">طباعة</button> <button class="b g" data-a="cstx">Excel</button> ${HR.box()}</div>`,null)}catch(e){toast(e.message,1)}};
A.cstf=async()=>{CS.from=($('#m [name=sfrom]')||{}).value||'';CS.to=($('#m [name=sto]')||{}).value||'';try{await csShow()}catch(e){toast(e.message,1)}};
A.cstm=async()=>{CS.from='';CS.to='';const a=$('#m [name=sfrom]'),b=$('#m [name=sto]');if(a)a.value='';if(b)b.value='';try{await csShow()}catch(e){toast(e.message,1)}};
const csOut=async x=>{if(!CS.res)return;try{const j=HR.on()?await api('custStmt',{cust:CS.id,from:CS.from,to:CS.to,hideRev:true}):CS.res;docOut(csHtml(j,true),'كشف حساب '+j.cust.name,x)}catch(e){toast(e.message,1)}};
A.cstp=()=>csOut(0);A.cstx=()=>csOut(1);
A.aar=async()=>{try{const j=await api('arAging',{});
  mdl('أعمار الديون على العملاء',tbl(['0–30 يوم','31–60','61–90','أكثر من 90','الإجمالي'],[j.buckets.map(f).concat([f(j.total)])])+`<div class="full" style="overflow-x:auto">${tbl(['العميل','الفاتورة','التاريخ','الاستحقاق','العمر (يوم)','المتبقي'],j.rows.map(r=>[esc(r.custName),esc(r.no),esc(r.date),esc(r.due)||'—',r.age,f(r.o)]))}</div>`,null)}catch(e){toast(e.message,1)}};

/* ================= فواتير المبيعات ================= */
const SS={q:'',st:''};
const sfind=i=>SL().sinv.find(x=>x.id==i);
const custN=id=>(SL().custs.find(c=>c.id==id)||{}).name||'';
V.s_inv=()=>{
  if(!SL().linked)return noLink('فواتير المبيعات');
  const q=SS.q.trim(),L=SL().sinv.filter(x=>(!SS.st||x.st===SS.st)&&(!q||(x.no+x.custName).includes(q)));
  const me=D.user.username,open=SL().sinv.filter(x=>['مرحّل','مقبوض جزئيًا'].includes(x.st)).reduce((s,x)=>s+x.total-x.paid,0);
  const bkOk=x=>canW()&&x.st==='مسودة'&&(x.by===me||isMgr());
   const acts=x=>{let b=btn('vsi',x.id,'عرض / طباعة','o');
    if(canW()&&x.st==='مسودة'&&(x.by===me||isMgr()))b+=btn('nsi',x.id,'تعديل','o')+btn('psi',x.id,'ترحيل','g')+btn('dsi',x.id,'حذف','r');
    if(canW()&&['مرحّل','مقبوض جزئيًا'].includes(x.st))b+=btn('rsi',x.id,'تحصيل','g');
    if(isMgr()&&['مرحّل','مقبوض','مقبوض جزئيًا'].includes(x.st))b+=btn('csi',x.id,'إلغاء','r');
    return b};
  return head('فواتير المبيعات',canW()?'nsi':'','+ فاتورة مبيعات',(canW()?bkBar('si'):'')+`<select onchange="siF('st',this.value)"><option value="">كل الحالات</option>${['مسودة','مرحّل','مقبوض جزئيًا','مقبوض','ملغي'].map(s=>`<option${SS.st===s?' selected':''}>${s}</option>`).join('')}</select>`)
   +`<div class="cards"><div class="card"><div class="mu">مبيعات بانتظار التحصيل</div><b>${f(open)}</b></div><div class="card"><div class="mu">مسودات</div><b>${SL().sinv.filter(x=>x.st==='مسودة').length}</b></div></div>`
   +`<div class="box">${tbl((canW()?[bkHead('si')]:[]).concat(['الرقم','التاريخ','العميل','الإجمالي','المحصَّل','المتبقي','الحالة','']),L.map(x=>(canW()?[bkOk(x)?bkCell('si',x.id):'']:[]).concat([esc(x.no)+(x.cashAcc?' <span class="st">نقدي</span>':''),esc(x.date),esc(x.custName),f(x.total),f(x.paid),f(r2(x.total-x.paid)),bd(x.st),acts(x)])))}</div>
   <p class="mu">الترحيل: مدين العملاء ← دائن إيراد المبيعات + ضريبة المخرجات. وللأصناف المخزنية: مدين تكلفة البضاعة المباعة ← دائن المخزون (بمتوسط التكلفة) مع خصم الكمية من المخزن.</p>`;
};
window.siF=(k,v)=>{SS[k]=v;render()};
bkReg('si',{act:'postSinv',label:'ترحيل المحدد',nm:id=>(sfind(id)||{}).no||id,pay:id=>{const x=sfind(id);return x&&x.st==='مسودة'?{id,ver:x.ver}:null}});
const catOf=n=>((D.svc||{}).cats||[]).find(c=>c.active&&c.name===n);
const revNm=id=>{const a=((D.svc||{}).revAccs||[]).find(z=>z.id==id);return a?a.code+' · '+a.name:''};
const revLabel=it=>{if(!it)return '';if(it.revAcc&&revNm(it.revAcc))return revNm(it.revAcc);const c=catOf(it.cat);if(c&&c.revAcc&&revNm(c.revAcc))return revNm(c.revAcc)+' (من التصنيف)';return 'إيرادات المبيعات (افتراضي)'};
const sdItems=k=>SL().items.filter(i=>k==='i'?i.type==='مخزني':i.type==='خدمة');
const sdName=(k,x)=>k==='r'?`<input class="dd" value="${esc(x.d||'')}" placeholder="مثال: رسوم تركيب، إيراد متنوع" style="min-width:180px">`
  :`<select class="di" style="min-width:190px"><option value="">— اختر ${k==='i'?'الصنف':'الخدمة'} —</option>${sdItems(k).map(i=>`<option value="${esc(i.id)}"${i.id==x.item?' selected':''} data-p="${i.price||0}">${esc(i.code+' · '+i.name)} (${esc(i.unit)})</option>`).join('')}</select><div class="sub si_s mu"></div>`;
const sdAcc=(k,x)=>k==='r'?`<select class="dc2" style="min-width:170px"><option value="">— إيراد المبيعات (الافتراضي) —</option>${(SL().revs||[]).map(a=>`<option value="${esc(a.id)}"${a.id==x.acc?' selected':''}>${esc(a.code+' · '+a.name)}</option>`).join('')}</select>`:`<span class="mu da2">${esc(revLabel(SL().items.find(z=>z.id==x.item)))}</span>`;
const siRow=(x={})=>{const k=x.k||(x.item?((SL().items.find(z=>z.id==x.item)||{}).type==='مخزني'?'i':'v'):(x.d?'r':'i'));
  return `<tr><td><select class="dk"><option value="i"${k==='i'?' selected':''}>صنف مخزني</option><option value="v"${k==='v'?' selected':''}>خدمة</option><option value="r"${k==='r'?' selected':''}>إيراد</option></select></td><td class="dn">${sdName(k,x)}</td><td><input class="dbn" type="text" maxlength="200" value="${esc(x.n||'')}" placeholder="بيان البند"></td><td><input class="dq" type="number" min="0" step="any" value="${x.q??1}" style="width:80px"></td><td><input class="dp" type="number" min="0" step="any" value="${x.p??''}" style="width:100px"></td><td><input class="ddc" type="number" min="0" max="100" step="any" value="${x.disc||''}" placeholder="0"></td><td><input class="dvt" type="number" min="0" max="100" step="any" value="${x.vp??''}" placeholder="الفاتورة"></td><td class="da">0.00</td><td class="dc">${sdAcc(k,Object.assign({acc:x.racc},x))}</td><td><button type="button" class="b s r" onclick="this.closest('tr').remove();siCalc()">×</button></td></tr>`};
window.siRowH=()=>siRow({k:'i'});
const siGet=()=>$$('#sil tbody tr').map(r=>{const k=r.querySelector('.dk').value,q=+r.querySelector('.dq').value||0,p=r.querySelector('.dp').value;
  const disc=r.querySelector('.ddc').value,vp=r.querySelector('.dvt').value;
  const n=r.querySelector('.dbn').value.trim();
  if(k==='r')return{k,d:r.querySelector('.dd').value.trim(),n,q,p,disc,vp,acc:r.querySelector('.dc2').value||undefined};
  return{k,item:r.querySelector('.di').value||undefined,n,q,p,disc,vp}}).filter(l=>l.q>0&&(l.k==='r'?l.d:l.item));
window.siCalc=()=>{if(!$('#sil'))return;let sub=0,stock=false;const wh=($('#m [name=wh]')||{}).value,vp=+($('#m [name=vat]')||{}).value||0;let lv=0,vl=false;
  $$('#sil tbody tr').forEach(r=>{const k=r.querySelector('.dk').value,q=+r.querySelector('.dq').value||0,p=+r.querySelector('.dp').value||0,g=r2(q*p),dc=Math.min(100,Math.max(0,+r.querySelector('.ddc').value||0)),v=r2(g-r2(g*dc/100)),vr=r.querySelector('.dvt').value,lp=vr===''?vp:Math.min(100,Math.max(0,+vr||0));sub+=v;lv+=r2(v*lp/100);if(vr!==''&&Math.abs(lp-vp)>1e-9)vl=true;r.querySelector('.da').textContent=f(v);
    if(k==='i'){stock=true;const id=r.querySelector('.di').value,s=r.querySelector('.si_s');if(s){if(id){const av=wh?(SL().stock[wh+'|'+id]||0):null;s.innerHTML=wh?`المتاح في المخزن: <b>${av}</b>${q>av?' <span style="color:#b3261e">— غير كافٍ</span>':''}`:'اختر المخزن'}else s.textContent=''}}});
  const w=$('#m .si-wh');if(w)w.hidden=!stock;
  const va=vl?r2(lv):r2(sub*vp/100),e=$('#sit');if(e)e.innerHTML=`الإجمالي: <b>${f(sub)}</b> — الضريبة: <b>${f(va)}</b> — <b>الصافي: ${f(r2(sub+va))}</b>`};
dlg.addEventListener('input',e=>{if(e.target&&e.target.closest&&(e.target.closest('#sil')||e.target.name==='vat'))siCalc()});
dlg.addEventListener('change',e=>{const t=e.target;if(!t||!t.classList)return;const r=t.closest&&t.closest('#sil tr');
  if(t.classList.contains('dk')&&r){const k=t.value;r.querySelector('.dn').innerHTML=sdName(k,{});r.querySelector('.dc').innerHTML=sdAcc(k,{});r.querySelector('.dp').value=''}
  if(t.classList.contains('di')&&r){const o=t.selectedOptions[0],p=r.querySelector('.dp');if(o&&o.value&&!+p.value)p.value=o.dataset.p||'';const it=SL().items.find(z=>z.id==t.value),l=r.querySelector('.da2');if(l)l.textContent=revLabel(it)}
  if((r&&r.closest('#sil'))||t.name==='wh')siCalc()});
A.nsi=async i=>{if(!canW())return;await dimsLoad();const x=i?sfind(i):{date:today(),items:[{}],vat:SL().vat??14};if(i&&!x)return;
  const cu=SL().custs.filter(c=>c.active||c.id==x.cust);
  mdl(i?'تعديل فاتورة مبيعات '+x.no:'فاتورة مبيعات جديدة',
   sel('العميل','cust',[['','— اختر العميل —']].concat(cu.map(c=>[c.id,c.code+' · '+c.name])),x.cust||'','full')
   +fld('التاريخ','date',x.date,'date')+fld('تاريخ الاستحقاق','due',x.due||'','date')+fld('نسبة الضريبة %','vat',x.vat??SL().vat??14,'number')+sel('الفرع *','proj',[['','— اختر الفرع —']].concat((SL().projects||[]).map(p=>[p.id,p.code+' · '+p.name])),x.proj||'')
   +sel('طريقة السداد','payMode',[['credit','آجل (على حساب العميل)'],['cash','نقدًا (يُحصَّل عند الترحيل)']],x.cashAcc?'cash':'credit')
   +`<div class="si-cash"${x.cashAcc?'':' hidden'}>${sel('حساب الخزينة / البنك','cashAcc',[['','— اختر الحساب —']].concat((SL().cash||[]).map(a=>[a.id,a.code+' · '+a.name])),x.cashAcc||'')}</div>`
   +`<div class="si-wh"${(x.items||[]).some(l=>l.t==='مخزني')?'':' hidden'}>${sel('المخزن (للأصناف المخزنية)','wh',[['','— اختر المخزن —']].concat(SL().whs.map(w=>[w.id,w.name])),x.wh||'')}</div>`
   +`<div class="full" style="overflow-x:auto"><table id="sil"><thead><tr><th>النوع</th><th>البند</th><th>البيان</th><th>الكمية</th><th>السعر (قبل الضريبة)</th><th>خصم %</th><th>ضريبة %</th><th>القيمة (بعد الخصم)</th><th>حساب الإيراد</th><th></th></tr></thead><tbody>${(x.items&&x.items.length?x.items:[{}]).map(l=>siRow({...l,vp:(l.vp!=null&&l.vp!==''&&Math.abs(+l.vp-(+x.vat||0))>1e-9)?l.vp:''})).join('')}</tbody></table><button type="button" class="b o s" onclick="$('#sil tbody').insertAdjacentHTML('beforeend',window.siRowH());siCalc()">+ بند</button><div class="mu">«صنف مخزني» يخصم من المخزن ويقيّد التكلفة · «خدمة» من دليل الخدمات · «إيراد» بيان حر على حساب إيراد تختاره. حساب الإيراد لكل صنف/خدمة يُحدَّد من الصنف ثم تصنيفه ثم الافتراضي.</div></div><div class="full" id="sit"></div>`
   +`<details class="full"><summary>أبعاد تحليلية (اختياري)</summary><div class="db">${sel('مركز التكلفة','cc',[['','— بدون —']].concat(((DM&&DM.cc)||[]).map(z=>[z.id,z.name])),x.cc||'')}${sel('حساب الإيراد الافتراضي (للبنود بلا حساب)','rev',[['','— إيراد المبيعات (الافتراضي) —']].concat((SL().revs||[]).map(a=>[a.id,a.code+' · '+a.name])),x.rev||'')}</div></details>`
   +fld('ملاحظات','note',x.note||'','ta','full'),
   ()=>{const o=rd(),it=siGet();if(!o.cust){toast('اختر العميل',1);return false}if((SL().projects||[]).length&&!o.proj){toast('اختر الفرع (إلزامي)',1);return false}if(!it.length){toast('أضف بندًا واحدًا على الأقل',1);return false}
    if(it.some(l=>l.k==='i')&&!o.wh){toast('اختر المخزن للأصناف المخزنية',1);return false}
    if(o.payMode==='cash'&&!o.cashAcc){toast('اختر حساب الخزينة / البنك للسداد النقدي',1);return false}
    return run('saveSinv',{...o,cashAcc:o.payMode==='cash'?o.cashAcc:'',id:i||undefined,ver:x.ver,items:it},'تم حفظ الفاتورة كمسودة').then(r=>r!==false)});
  siCalc()};
dlg.addEventListener('change',e=>{if(e.target&&e.target.name==='payMode'){const c=$('#m .si-cash');if(c)c.hidden=e.target.value!=='cash'}});
const cashN=id=>{const a=(SL().cash||[]).find(z=>z.id==id);return a?a.code+' · '+a.name:''};
A.dsi=i=>{if(confirm('حذف مسودة الفاتورة؟'))run('delSinv',{id:i},'تم الحذف')};
A.psi=i=>{const x=sfind(i);if(!x)return;const stock=x.items.some(l=>l.t==='مخزني');
  mdl('ترحيل فاتورة المبيعات '+x.no,kv('العميل',x.custName)+kv('الإجمالي',f(x.total))+`<div class="full mu">سيُرحَّل: مدين العملاء ${f(x.total)} ← دائن الإيراد ${f(x.sub)}${x.vatAmt?' + ضريبة '+f(x.vatAmt):''}.${x.cashAcc?' <b>وسيُحصَّل نقدًا في «'+esc(cashN(x.cashAcc))+'» بتاريخ الفاتورة.</b>':''}${stock?' وستُخصم الأصناف المخزنية من المخزن وتُقيَّد تكلفتها (متوسط التكلفة).':''}</div>`,
   ()=>run('postSinv',{id:i,ver:x.ver},'تم ترحيل الفاتورة').then(r=>r!==false),'ترحيل')};
A.csi=i=>{const x=sfind(i);mdl('إلغاء فاتورة المبيعات '+x.no,`<div class="full mu">يُعكس القيد وتعود كميات المخزن. لا تُلغى فاتورة عليها تحصيلات.</div>`+fld('سبب الإلغاء (إلزامي)','reason','','ta','full'),()=>{const r=rd().reason.trim();if(!r){toast('اكتب السبب',1);return false}return run('cancelSinv',{id:i,ver:x.ver,reason:r},'تم الإلغاء').then(z=>z!==false)},'تأكيد الإلغاء')};
A.rsi=i=>{const x=sfind(i);const left=r2(x.total-x.paid);
  mdl('تحصيل فاتورة '+x.no,kv('العميل',x.custName)+kv('المتبقي',f(left))+sel('الإيداع في','acc',(SL().cash||[]).map(a=>[a.id,a.code+' · '+a.name]))+fld('تاريخ التحصيل','date',today(),'date')+fld('المبلغ','amount',left,'number')+fld('المرجع (رقم الشيك / التحويل)','ref'),
   ()=>{const o=rd();if(!(+o.amount>0)){toast('أدخل المبلغ',1);return false}return run('recvSinv',{id:i,acc:o.acc,date:o.date,amount:+o.amount,ref:o.ref},'تم تسجيل التحصيل').then(r=>r!==false)})};
A.xrc=i=>{mdl('عكس التحصيل',fld('سبب العكس (إلزامي)','reason','','ta','full'),()=>{const r=rd().reason.trim();if(!r){toast('اكتب السبب',1);return false}return run('reverseRct',{id:i,reason:r},'تم عكس التحصيل').then(z=>z!==false)},'تأكيد العكس')};
const sHas=x=>(x.items||[]).some(l=>(+l.disc||0)>0||(l.vp!=null&&l.vp!==''&&Math.abs(+l.vp-(+x.vat||0))>1e-9)),sPad=x=>sHas(x)?['','']:[];
const siHtml=(x,pr)=>{const cu=SL().custs.find(c=>c.id==x.cust)||{};
  return (pr?printHead('فاتورة مبيعات'):'')+`<div class="g"><div>${P('رقم الفاتورة',x.no)+P('التاريخ',x.date)+P('الاستحقاق',x.due)+P('السداد',x.cashAcc?'نقدًا — '+cashN(x.cashAcc):'آجل')+P('الحالة',x.st)}</div><div>${P('العميل',x.custName)+P('الهاتف',cu.phone)+P('العنوان',cu.addr)+P('الرقم الضريبي',cu.tax)}</div></div>`
   +tbl(['البيان','الوحدة','الكمية','السعر',...(sHas(x)?['خصم %','ضريبة %']:[]),'القيمة'],x.items.map(l=>[esc(l.d)+(l.n?'<br><small class="mu">'+esc(l.n)+'</small>':'')+(pr?'':' <small class="mu">('+({i:'صنف مخزني',v:'خدمة',r:'إيراد'}[l.k]||(l.item?(l.t==='مخزني'?'صنف مخزني':'خدمة'):'إيراد'))+(l.racc&&revNm(l.racc)?' — '+esc(revNm(l.racc)):'')+')</small>'),esc(l.u),l.q,f(l.p),...(sHas(x)?[l.disc?f(l.disc)+'%':'—',(l.vp!=null?l.vp:x.vat)+'%']:[]),f(l.v)]).concat([['<b>الإجمالي (بعد الخصم)</b>','','','',...sPad(x),'<b>'+f(x.sub)+'</b>'],['ضريبة القيمة المضافة '+(sHas(x)&&x.items.some(l=>l.vp!=null&&Math.abs(+l.vp-(+x.vat||0))>1e-9)?'(حسب البنود)':x.vat+'%'),'','','',...sPad(x),f(x.vatAmt)],['<b>الصافي المستحق</b>','','','',...sPad(x),'<b>'+f(x.total)+'</b>']]))
   +(x.paid?`<p>المحصَّل: <b>${f(x.paid)}</b> — المتبقي: <b>${f(r2(x.total-x.paid))}</b></p>`:'')+(x.note?P('ملاحظات',x.note):'')+(pr?`<div class="sg"><div>أعدّه<br>${esc(x.byName)}</div><div>المحاسب</div><div>العميل / المستلم</div></div>`+printFoot():'')};
A.vsi=i=>{const x=sfind(i);if(!x)return;const rc=SL().rcts.filter(r=>r.inv==i);
  mdl('فاتورة مبيعات '+x.no,`<div class="full" style="overflow-x:auto">${siHtml(x,false)}</div>`+(rc.length?`<div class="full"><b>التحصيلات</b>${tbl(['الرقم','التاريخ','المبلغ','المرجع','الحالة',''],rc.map(r=>[esc(r.no),esc(r.date),f(r.amount),esc(r.ref),bd(r.st==='مرحّل'?'مقبوض':r.st==='معكوس'?'ملغي':r.st),isMgr()&&r.st==='مرحّل'?btn('xrc',r.id,'عكس','r'):'']))}</div>`:'')+`<div class="full"><button class="b g" data-a="psip" data-i="${esc(i)}">طباعة</button> <button class="b g" data-a="psix" data-i="${esc(i)}">Excel</button></div>`+(typeof attBox==='function'?attBox('SINV',x.id):''),null);if(typeof attInit==='function')attInit()};
A.psip=i=>{const x=sfind(i);if(x)docOut(siHtml(x,true),'فاتورة مبيعات '+x.no)};
A.psix=i=>{const x=sfind(i);if(x)docOut(siHtml(x,true),'فاتورة مبيعات '+x.no,1)};
/* ---- لوحة التحكم ---- */
V.s_dash=()=>{
  if(!SL().linked)return noLink('لوحة المبيعات');
  const t=today(),ym=t.slice(0,7),inv=SL().sinv.filter(x=>!['مسودة','ملغي'].includes(x.st));
  const mon=inv.filter(x=>x.date.slice(0,7)===ym).reduce((s,x)=>s+x.sub,0),open=inv.filter(x=>x.st!=='مقبوض'),due=open.reduce((s,x)=>s+x.total-x.paid,0);
  const late=open.filter(x=>x.due&&x.due<t).reduce((s,x)=>s+x.total-x.paid,0);
  const col=SL().rcts.filter(r=>r.st==='مرحّل'&&!r.dep&&r.date.slice(0,7)===ym).reduce((s,r)=>s+r.amount,0)+(SL().ords||[]).reduce((s,o)=>s+(o.deps||[]).filter(p=>p.st==='مرحّل'&&p.date.slice(0,7)===ym).reduce((a,p)=>a+p.amount,0),0);
  const top=SL().custs.filter(c=>c.bal>0.004).sort((a,b)=>b.bal-a.bal).slice(0,6),mx=top[0]?top[0].bal:1;
  const cards=[['مبيعات الشهر (قبل الضريبة)',f(mon)],['المحصّل هذا الشهر',f(col)],['مستحق على العملاء',f(due)],['متأخر عن الاستحقاق',f(late)],['مسودات',SL().sinv.filter(x=>x.st==='مسودة').length]];
  return head('لوحة المبيعات')+`<div class="cards">${cards.map(c=>`<div class="card"><div class="mu">${c[0]}</div><b>${c[1]}</b></div>`).join('')}</div>`
   +`<div class="box"><h3>أكبر المستحقات على العملاء</h3>${top.length?top.map(c=>`<div style="display:flex;gap:8px;align-items:center;margin:4px 0"><span style="width:180px">${esc(c.name)}</span><div style="flex:1;background:#e5e5e5;height:10px;border-radius:5px"><div style="width:${Math.round(c.bal/mx*100)}%;height:10px;border-radius:5px;background:var(--p)"></div></div><b>${f(c.bal)}</b></div>`).join(''):'<span class="mu">لا مستحقات.</span>'}</div>`
   +(window.catUpcoming?window.catUpcoming():'')
    +`<div class="box"><h3>آخر الفواتير</h3>${tbl(['الرقم','التاريخ','العميل','الصافي','الحالة'],SL().sinv.slice(0,8).map(x=>[esc(x.no),esc(x.date),esc(x.custName),f(x.total),bd(x.st)]))}</div>`};

/* ---- التقارير ---- */
const RP={from:'',to:''};
const srData=()=>{const inv=SL().sinv.filter(x=>!['مسودة','ملغي'].includes(x.st)&&x.date>=RP.from&&x.date<=RP.to),byC={},byI={};
  inv.forEach(x=>{const c=byC[x.cust]=byC[x.cust]||{n:x.custName,k:0,s:0,v:0,t:0,p:0};c.k++;c.s+=x.sub;c.v+=x.vatAmt;c.t+=x.total;c.p+=x.paid;
    x.items.forEach(l=>{const i=byI[l.item||l.d]=byI[l.item||l.d]||{n:l.d,u:l.u,q:0,v:0};i.q+=l.q;i.v+=l.v})});
  const C=Object.values(byC).sort((a,b)=>b.t-a.t);return[C,Object.values(byI).sort((a,b)=>b.v-a.v),C.reduce((s,c)=>s+c.t,0),inv.length]};
const srHtml=(C,I,tt,n,pr)=>(pr?printHead('تقرير المبيعات'):'')+`<p>الفترة: ${esc(RP.from)} إلى ${esc(RP.to)} — عدد الفواتير: <b>${n}</b> — إجمالي المبيعات شامل الضريبة: <b>${f(tt)}</b></p>`
  +`<div class="box"><h3>المبيعات حسب العميل</h3>${tbl(['العميل','عدد الفواتير','المبيعات','الضريبة','الإجمالي','المحصّل','المتبقي'],C.map(c=>[esc(c.n),c.k,f(c.s),f(c.v),f(c.t),f(c.p),f(c.t-c.p)]))}</div>`
  +`<div class="box"><h3>المبيعات حسب الصنف / الخدمة</h3>${tbl(['البيان','الوحدة','الكمية','القيمة'],I.map(i=>[esc(i.n),esc(i.u),i.q,f(i.v)]))}</div>`+(pr?printFoot():'');
V.s_rep=()=>{
  if(!SL().linked)return noLink('تقارير المبيعات');
  if(!RP.from)RP.from=today().slice(0,4)+'-01-01';if(!RP.to)RP.to=today();
  return head('تقارير المبيعات')+`<div class="box"><div class="db" id="srf">${fld('من تاريخ','from',RP.from,'date')}${fld('إلى تاريخ','to',RP.to,'date')}</div><button class="b" data-a="srun">عرض</button> <button class="b o" data-a="aar" data-i="">أعمار الديون</button> <button class="b g" data-a="srp">طباعة</button> <button class="b g" data-a="srx">Excel</button></div><div id="srbody">${srHtml(...srData())}</div>`};
A.srun=()=>{const o=rd('#srf');RP.from=o.from;RP.to=o.to;render()};
A.srp=()=>{const o=rd('#srf');RP.from=o.from;RP.to=o.to;docOut(srHtml(...srData(),1),'تقرير المبيعات')};
A.srx=()=>{const o=rd('#srf');RP.from=o.from;RP.to=o.to;docOut(srHtml(...srData(),1),'تقرير المبيعات',1)};

})();
