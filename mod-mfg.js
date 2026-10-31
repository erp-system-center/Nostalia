/* =====================================================================
   مديول التصنيع: لوحة التحكم والاحتياجات، أوامر التصنيع (صرف خامات / مرتجع / عمل / استلام منتج تام / إقفال)،
   قوائم المواد (BOM) ومسارات التشغيل، مراكز العمل، تقارير التكلفة والفروقات
   مرتبط بالمخازن (مستندات MIS/MRT/MFR)، والحسابات (إنتاج تحت التشغيل)، والفروع، والمرفقات والملاحظات.
   ===================================================================== */
(()=>{
const MF=()=>D.mfg;
const mr=()=>MF().role;
const isM=()=>['admin','manager'].includes(mr());
const canW=()=>['admin','manager','operator'].includes(mr());
const cst=()=>MF().cost;
const CAT=()=>D.catalog||[];
const itO=id=>CAT().find(x=>x.id==id)||{};
const itN=id=>{const i=itO(id);return i.code?i.code+' · '+i.name:'؟'};
const itU=id=>itO(id).unit||'';
const whN=id=>((MF().whs||[]).find(w=>w.id==id)||{}).name||'—';
const bomO=id=>MF().boms.find(x=>x.id==id)||{};
const moO=id=>MF().orders.find(x=>x.id==id)||{};
const wcO=id=>MF().wcs.find(x=>x.id==id)||{};
const wcN=id=>{const w=wcO(id);return w.code?w.code+' · '+w.name:'—'};
const opt=a=>a.map(x=>[x,x]);
const ST={short:null,rep:{from:today().slice(0,4)+'-01-01',to:today(),res:null},fs:''};
const DTM={MIS:'صرف خامات',MRT:'مرتجع خامات',MFR:'استلام منتج تام'};
const SBG={'مسودة':'#eee','معتمد':'#e3eefc','قيد التنفيذ':'#fff3d6','مكتمل':'#dff3e6','مقفل':'#d9dde0','ملغي':'#f6dede'};
const sb=x=>`<span class="st" style="background:${SBG[x]||'#eee'}">${esc(x)}</span>`;
const r2=n=>Math.round((+n||0)*100)/100;
const r3=n=>Math.round((+n||0)*1000)/1000;

MODS.mfg={title:'التصنيع',has:()=>D.user.mods.mfg&&D.mfg,nav:()=>[['m_dash','لوحة التحكم'],['m_mo','أوامر التصنيع'],['m_bom','قوائم المواد'],['m_wc','مراكز العمل']].concat(MF().accs?[['m_pool','تجمّعات التكلفة'],['m_alloc','تحميل المصروفات']]:[]).concat([['m_rep','التقارير']])};

/* ---------- عناصر مشتركة ---------- */
const itemOpts=cur=>'<option value="">— الصنف —</option>'+CAT().map(i=>`<option value="${esc(i.id)}"${i.id==cur?' selected':''}>${esc(i.code+' · '+i.name+' ('+i.unit+')')}</option>`).join('');
const wcOpts=cur=>'<option value="">— مركز العمل —</option>'+MF().wcs.filter(w=>w.active||w.id==cur).map(w=>`<option value="${esc(w.id)}"${w.id==cur?' selected':''}>${esc(w.code+' · '+w.name)}</option>`).join('');
const whOpts=cur=>[['','— اختر المخزن —']].concat((MF().whs||[]).map(w=>[w.id,w.code+' · '+w.name]));
const addRow=(tb,html)=>{$(tb+' tbody').insertAdjacentHTML('beforeend',html)};
const delBtn='<td><button type="button" class="b s r" onclick="this.closest(\'tr\').remove()">✕</button></td>';
const linesTbl=(id,heads,rows,addFn,addLbl)=>`<div class="full" style="overflow-x:auto"><table id="${id}"><thead><tr>${heads.map(h=>'<th>'+h+'</th>').join('')}<th></th></tr></thead><tbody>${rows.join('')}</tbody></table><button type="button" class="b s o" onclick="${addFn}">${addLbl}</button></div>`;
const num=(cls,v,w,step)=>`<input class="${cls}" type="number" min="0" step="${step||'any'}" value="${v==null||v===''?'':v}" style="width:${w||90}px">`;
const reopen=id=>r=>{if(r!==false)setTimeout(()=>A.vmo(id),60);return r!==false};

/* ---------- لوحة التحكم ---------- */
V.m_dash=()=>{const L=MF().orders,n=s=>L.filter(x=>x.st==s).length,t=today();
  const late=L.filter(x=>['معتمد','قيد التنفيذ'].includes(x.st)&&x.due&&x.due<t);
  const cd=[['بانتظار الاعتماد',n('مسودة')],['معتمدة (لم تبدأ)',n('معتمد')],['قيد التنفيذ',n('قيد التنفيذ')],['مكتملة (لم تُقفل)',n('مكتمل')],['متأخرة عن التسليم',late.length]];
  if(cst())cd.push(['إنتاج تحت التشغيل (ج.م)',f(L.filter(x=>x.st!=='مقفل'&&x.st!=='ملغي').reduce((s,x)=>s+(+x.wip||0),0))]);
  const sh=ST.short;
  const shBox=`<div class="box"><h3>احتياجات الخامات مقابل الأرصدة</h3>${sh?tbl(['الصنف','الاحتياج المتبقي','المتاح','العجز','الأوامر'],sh.map(x=>[esc(x.code+' · '+x.name),q3(x.need)+' '+esc(x.unit),q3(x.avail),x.short>0?`<b style="color:#a11">${q3(x.short)}</b>`:'—',esc(x.orders.join('، '))])):'<p class="mu">اضغط «تحديث» لحساب الاحتياجات المتبقية على الأوامر المفتوحة ومقارنتها بالأرصدة.</p>'}<button class="b o" data-a="mSh">تحديث الاحتياجات</button></div>`;
  return `<div class="cards">${cd.map(c=>`<div class="card"><small>${c[0]}</small><h2>${c[1]}</h2></div>`).join('')}</div>
<div class="box"><h3>أوامر قيد التنفيذ</h3>${tbl(['الأمر','المنتج','المخطط','المنتَج','التقدم','التسليم','إجراءات'],L.filter(x=>x.st=='قيد التنفيذ').slice(0,10).map(x=>[esc(x.no),esc(itN(x.item)),q3(x.plan),q3(x.done),prog(x.done,x.plan),esc(x.due)||'—',btn('vmo',x.id,'تفاصيل','g')]))}</div>
${isM()?`<div class="box"><h3>بانتظار الاعتماد</h3>${tbl(['الأمر','المنتج','الكمية','أنشأه','إجراءات'],L.filter(x=>x.st=='مسودة').map(x=>[esc(x.no),esc(itN(x.item)),q3(x.plan),esc(x.byName),btn('vmo',x.id,'عرض','o')+btn('apm',x.id,'اعتماد','g')]))}</div>`:''}
${shBox}`};
const prog=(a,b)=>{const p=b>0?Math.min(100,Math.round(a/b*1000)/10):0;return `<div style="background:#eee;border-radius:4px;min-width:90px"><div style="background:var(--p);color:#fff;font-size:11px;padding:1px 4px;border-radius:4px;width:${p}%;min-width:30px">${p}%</div></div>`};
A.mSh=async()=>{try{const j=await api('mfgShort');ST.short=j.rows;render()}catch(e){toast(e.message,1)}};

/* ---------- أوامر التصنيع ---------- */
V.m_mo=()=>{const L=MF().orders.filter(x=>!ST.fs||x.st===ST.fs);
  const sf=`<select onchange="mfs(this.value)" style="width:auto"><option value="">كل الحالات</option>${['مسودة','معتمد','قيد التنفيذ','مكتمل','مقفل','ملغي'].map(s=>`<option${ST.fs===s?' selected':''}>${s}</option>`).join('')}</select>`;
  return head('أوامر التصنيع',canW()?'nmo':'','+ أمر تصنيع',sf)+`<div class="box">${tbl(['الأمر','المنتج','القائمة','الفرع','المخطط','المنتَج','التقدم','من','التسليم','الحالة','إجراءات'],L.map(x=>[`<b>${esc(x.no)}</b>`,esc(itN(x.item)),esc(x.bomName),esc(pjl(x.proj))||'—',q3(x.plan),q3(x.done),prog(x.done,x.plan),esc(x.start),esc(x.due)||'—',sb(x.st),
    btn('vmo',x.id,'تفاصيل','g')+(x.st==='مسودة'&&canW()&&(isM()||x.by===D.user.username)?btn('nmo',x.id,'تعديل','o'):'')+(x.st==='مسودة'&&isM()&&(x.by!==D.user.username||D.user.role==='admin')?btn('apm',x.id,'اعتماد','g'):'')]))}</div>`};
window.mfs=v=>{ST.fs=v;render()};
A.nmo=i=>{const x=i?Object.assign({},moO(i)):{start:today()};
  if(!MF().boms.filter(b=>b.active).length){toast('أنشئ قائمة مواد (BOM) أولًا',1);return}
  mdl(i?'تعديل '+x.no:'أمر تصنيع جديد',sel('قائمة المواد (المنتج)','bom',[['','— اختر —']].concat(MF().boms.filter(b=>b.active||b.id==x.bom).map(b=>[b.id,b.code+' · '+b.name+' ← '+itN(b.item)])),x.bom||'','full')+fld('الكمية المخططة','plan',x.plan||'','number')+psl('الفرع (تُحمَّل عليه التكلفة)',x.proj||'')
   +sel('مخزن الخامات (المصدر)','whSrc',whOpts(),x.whSrc||'')+sel('مخزن المنتج التام (الوجهة)','whDst',whOpts(),x.whDst||'')+fld('تاريخ البدء','start',x.start||'','date')+fld('تاريخ التسليم المخطط','due',x.due||'','date')+fld('ملاحظات','note',x.note,'ta','full')
   +'<div class="full mu">تُحسب الخامات والعمليات المطلوبة تلقائيًا من قائمة المواد حسب الكمية (شاملة نسبة الهالك). يُعتمد الأمر من مدير التصنيع قبل الصرف.</div>',
  ()=>run('saveMO',{...rd(),id:i||undefined,ver:x.ver},'تم حفظ أمر التصنيع كمسودة').then(r=>r!==false))};
A.apm=i=>{const x=moO(i);if(!confirm('اعتماد أمر التصنيع '+x.no+'؟'))return;run('decideMO',{id:i,ver:x.ver,decision:'اعتماد'},'تم اعتماد الأمر')};
A.xmo=i=>{const x=moO(i);mdl('إلغاء '+x.no,fld('سبب الإلغاء','reason','','ta','full'),()=>run('decideMO',{id:i,ver:x.ver,decision:'إلغاء',reason:rd().reason},'تم إلغاء الأمر').then(r=>r!==false),'إلغاء الأمر')};
A.dmo=i=>{const x=moO(i);if(confirm('حذف المسودة '+x.no+'؟'))run('delMO',{id:i,ver:x.ver},'تم الحذف')};

const hist=mo=>{const D2=MF().docs.filter(d=>d.refId==mo.id),T=MF().times.filter(t=>t.mo==mo.id),live=!['مقفل','ملغي'].includes(mo.st);
  const dr=D2.map(d=>[esc(d.no),esc(DTM[d.type]||d.type),esc(d.date),esc((d.items||[]).map(l=>itN(l.item)+' × '+q3(l.q)).join('، ')),cst()?f((d.items||[]).reduce((s,l)=>s+(+l.v||0),0)):'—',esc(d.st==='معكوس'?'معكوس':'مرحّل'),isM()&&live&&d.st==='مرحّل'?btn('mrv',d.id+'|'+mo.id,'عكس','r'):'']);
  const tr=T.map(t=>[esc(t.date),esc(t.opName),q3(t.hrs),esc(wcN(t.wc)),cst()?f(t.lab+t.oh):'—',esc(t.st),isM()&&live&&t.st==='مرحّل'?btn('mrt2',t.id+'|'+mo.id,'عكس','r'):'']);
  return `<div class="full"><h4>مستندات المخزون</h4>${tbl(['المستند','النوع','التاريخ','الأصناف','القيمة','الحالة',''],dr)}</div><div class="full"><h4>تسجيل العمل</h4>${tbl(['التاريخ','العملية','ساعات','مركز العمل','التكلفة','الحالة',''],tr)}</div>`};
A.vmo=i=>{const x=moO(i);if(!x.id)return;const c=cst(),st=x.st,act=['معتمد','قيد التنفيذ'].includes(st),me=D.user.username;
  const comps=x.comps.map(k=>{const rem=r3(Math.max(0,k.q-(k.iss||0)));return [esc(itN(k.item)),q3(k.q)+' '+esc(itU(k.item)),q3(k.iss||0),rem>0?q3(rem):'—',c?f(k.v||0):'—']});
  const ops=x.ops.map(o=>[esc(o.name),esc(wcN(o.wc)),q3(o.hrs),q3(o.act||0)]);
  const cost=c?`<div class="cards full">${[['خامات',x.matV],['أجور',x.labV],['أعباء',x.ohV],['إجمالي التكلفة',x.matV+x.labV+x.ohV],['محوَّل لمنتج تام',x.fgV],['تحت التشغيل',x.wip]].map(k=>`<div class="card"><small>${k[0]}</small><h3>${f(k[1])}</h3></div>`).join('')}</div>`+(x.done>0?`<div class="full mu">متوسط تكلفة الوحدة المنتَجة: <b>${f(x.fgV/x.done)}</b> ج.م</div>`:''):'';
  const bt=[];
  if(canW()&&act){bt.push(btn('mis',x.id,'صرف خامات','g'));if(st==='قيد التنفيذ')bt.push(btn('mrt',x.id,'مرتجع خامات','o'));bt.push(btn('mtm',x.id,'تسجيل عمل','g'));if(st==='قيد التنفيذ')bt.push(btn('mfr',x.id,'استلام منتج تام','g'))}
  if(canW()&&st==='مكتمل')bt.push(btn('mtm',x.id,'تسجيل عمل','o'),btn('mrt',x.id,'مرتجع خامات','o'));
  if(isM()&&['قيد التنفيذ','مكتمل'].includes(st))bt.push(btn('mcl',x.id,'إقفال الأمر','r'));
  if(isM()&&st==='مسودة'&&(x.by!==me||D.user.role==='admin'))bt.push(btn('apm',x.id,'اعتماد','g'));
  if(['مسودة','معتمد','قيد التنفيذ'].includes(st)&&(isM()||x.by===me)&&canW())bt.push(btn('xmo',x.id,'إلغاء الأمر','r'));
  if(st==='مسودة'&&canW()&&(isM()||x.by===me))bt.push(btn('dmo',x.id,'حذف','r'));
  bt.push(btn('pmo',x.id,'طباعة أمر التشغيل','o'));
  mdl(x.no+' — '+itN(x.item),kv('الحالة',st)+kv('قائمة المواد',x.bomName)+kv('الكمية المخططة',q3(x.plan))+kv('المنتَج / التالف',q3(x.done)+' / '+q3(x.scrap))+kv('مخزن الخامات',whN(x.whSrc))+kv('مخزن المنتج التام',whN(x.whDst))+kv('الفرع',pjl(x.proj))+kv('الفترة',x.start+' ← '+(x.due||'—'))+kv('أنشأه',x.byName)+(x.reason?kv('السبب',x.reason):'')+(x.note?`<div class="full"><label>ملاحظات</label>${esc(x.note)}</div>`:'')
   +`<div class="full" style="overflow-x:auto"><h4>الخامات</h4>${tbl(['الخامة','المطلوب','المصروف (صافي)','المتبقي','قيمة المصروف'],comps)}</div>`+(ops.length?`<div class="full" style="overflow-x:auto"><h4>العمليات</h4>${tbl(['العملية','مركز العمل','ساعات مخططة','ساعات فعلية'],ops)}</div>`:'')+cost+hist(x)+`<div class="full">${bt.join(' ')}</div>`+(typeof attBox==='function'?attBox('MO',x.id):''),null);
  if(typeof attInit==='function')attInit()};
A.pmo=i=>{const x=moO(i);
  docOut(printHead('أمر تشغيل '+x.no)+`<div class="g"><div><p><b>المنتج:</b> ${esc(itN(x.item))}</p><p><b>الكمية:</b> ${q3(x.plan)} ${esc(itU(x.item))}</p></div><div><p><b>الفرع:</b> ${esc(pjl(x.proj))||'—'}</p><p><b>الفترة:</b> ${esc(x.start)} ← ${esc(x.due||'—')}</p></div><div><p><b>مخزن الخامات:</b> ${esc(whN(x.whSrc))}</p><p><b>مخزن المنتج التام:</b> ${esc(whN(x.whDst))}</p></div></div><h3>الخامات المطلوبة</h3>`+tbl(['الخامة','الكمية المطلوبة','الوحدة','المصروف فعليًا'],x.comps.map(k=>[esc(itN(k.item)),q3(k.q),esc(itU(k.item)),'']))+(x.ops.length?'<h3>مراحل التشغيل</h3>'+tbl(['العملية','مركز العمل','ساعات مخططة','ساعات فعلية','توقيع'],x.ops.map(o=>[esc(o.name),esc(wcN(o.wc)),q3(o.hrs),'',''])):'')+`<div class="sg"><div>أعدّه<br>${esc(x.byName)}</div><div>مدير التصنيع<br>${esc(x.actBy||'')}</div><div>مسؤول الإنتاج</div></div>`+printFoot())};

/* ---------- صرف الخامات ---------- */
const mrow=(x={},cls='mi')=>`<tr><td><select class="${cls}k" style="min-width:210px">${itemOpts(x.item)}</select></td><td>${num(cls+'q',x.q,100)}</td>${delBtn}</tr>`;
window.maddI=()=>addRow('#mlt',mrow());
const getLines=()=>$$('#mlt tbody tr').map(r=>({item:r.querySelector('select').value,q:r.querySelector('input').value})).filter(l=>l.item&&+l.q>0);
A.mis=i=>{const x=moO(i);
  const rows=x.comps.map(k=>({item:k.item,q:r3(Math.max(0,k.q-(k.iss||0)))})).filter(k=>k.q>0);
  mdl('صرف خامات على '+x.no,fld('تاريخ الصرف','date',today(),'date')+`<div class="full mu">الصرف من مخزن ${esc(whN(x.whSrc))}. الكميات مقترحة بالمتبقي حسب قائمة المواد؛ عدّلها أو أضف صنفًا آخر.</div>`+linesTbl('mlt',['الصنف','الكمية'],rows.map(r=>mrow(r)),'maddI()','+ صنف')+fld('ملاحظات','note','','text','full'),
  ()=>{const L=getLines();if(!L.length){toast('أدخل كمية لصنف واحد على الأقل',1);return false}return run('mfgIssue',{id:i,ver:x.ver,date:rd().date,note:rd().note,items:L},'تم صرف الخامات وقيدها على الأمر').then(reopen(i))},'صرف')};
A.mrt=i=>{const x=moO(i);
  const rows=x.comps.filter(k=>(k.iss||0)>0).map(k=>({item:k.item,q:''}));
  if(!rows.length){toast('لا خامات مصروفة على هذا الأمر',1);return}
  mdl('مرتجع خامات من '+x.no,fld('تاريخ المرتجع','date',today(),'date')+`<div class="full mu">يعود المرتجع لمخزن ${esc(whN(x.whSrc))} بنفس متوسط تكلفة ما صُرف على هذا الأمر. الحد الأقصى = الصافي المصروف.</div>`+linesTbl('mlt',['الصنف','كمية المرتجع'],rows.map(r=>mrow(r)),'maddI()','+ صنف')+fld('ملاحظات','note','','text','full'),
  ()=>{const L=getLines();if(!L.length){toast('أدخل كمية مرتجع لصنف واحد على الأقل',1);return false}return run('mfgReturn',{id:i,ver:x.ver,date:rd().date,note:rd().note,items:L},'تم تسجيل المرتجع').then(reopen(i))},'تسجيل المرتجع')};

/* ---------- تسجيل العمل ---------- */
window.mtmSw=()=>{const v=($('#m [name=op]')||{}).value,e=$('#m .mtx');if(e)e.hidden=v!=='';};
A.mtm=i=>{const x=moO(i);
  const ops=[['','عمل إضافي (حدّد مركز العمل)']].concat(x.ops.map((o,n)=>[String(n),o.name+' — '+wcN(o.wc)+' (مخطط '+q3(o.hrs)+' س / فعلي '+q3(o.act||0)+' س)']));
  mdl('تسجيل عمل على '+x.no,fld('التاريخ','date',today(),'date')+sel('العملية','op',ops,x.ops.length?'0':'','full')+`<div class="mtx full" ${x.ops.length?'hidden':''}><label>مركز العمل</label><select name="wc">${wcOpts('')}</select>${fld('اسم العمل','opName','عمل إضافي')}</div>`+fld('عدد الساعات','hrs','','number')+fld('ملاحظات','note','','text','full')
   +(cst()?'<div class="full mu">تُحمَّل التكلفة = الساعات × (أجر + أعباء) مركز العمل، مدين إنتاج تحت التشغيل.</div>':''),
  ()=>{const o=rd();return run('mfgTime',{id:i,ver:x.ver,date:o.date,op:o.op,wc:o.wc,opName:o.opName,hrs:o.hrs,note:o.note},'تم تسجيل العمل').then(reopen(i))},'تسجيل');
  const sel0=$('#m [name=op]');if(sel0)sel0.setAttribute('onchange','mtmSw()')};
A.mrt2=i=>{const [tid,mid]=String(i).split('|');mdl('عكس تسجيل عمل',fld('سبب العكس','reason','','ta','full'),()=>run('reverseMfgTime',{id:tid,reason:rd().reason},'تم العكس').then(reopen(mid)),'عكس')};

/* ---------- استلام المنتج التام والإقفال ---------- */
A.mfr=i=>{const x=moO(i),left=r3(Math.max(0,x.plan-x.done));
  mdl('استلام منتج تام — '+x.no,fld('تاريخ الاستلام','date',today(),'date')+fld('الكمية المنتجة (الصالحة) — المتبقي '+q3(left),'q',left||'','number')+fld('كمية التالف (إن وُجدت — للمتابعة فقط)','scrap','0','number')+fld('ملاحظات','note','','text','full')
   +`<div class="full mu">يُستلم المنتج في مخزن ${esc(whN(x.whDst))} بتكلفته الفعلية المحمّلة (خامات + أجور + أعباء)${cst()?'. المتاح للتحويل الآن: <b>'+f(x.wip)+'</b> ج.م':''}. عند استلام آخر كمية تُحوَّل كل التكلفة المتبقية على الأمر.</div>`,
  async()=>{const o=rd(),r=await run('mfgReceive',{id:i,ver:x.ver,date:o.date,q:o.q,scrap:o.scrap,note:o.note},'تم استلام المنتج التام');if(r&&r.unit&&cst())toast('تكلفة الوحدة: '+f(r.unit)+' ج.م');if(r!==false)setTimeout(()=>A.vmo(i),60);return r!==false},'استلام')};
A.mcl=i=>{const x=moO(i);
  mdl('إقفال '+x.no,`<div class="full">الكمية المنتَجة <b>${q3(x.done)}</b> من <b>${q3(x.plan)}</b>.${cst()?' المتبقي تحت التشغيل: <b>'+f(x.wip)+'</b> ج.م سيُرحَّل إلى «فروقات التصنيع».':''}</div><div class="full mu">الإقفال نهائي: لا صرف ولا استلام بعده. تأكد من تسجيل كل الخامات والمرتجعات والعمل أولًا.</div>`,
  ()=>run('closeMO',{id:i,ver:x.ver},'تم إقفال الأمر').then(r=>r!==false),'إقفال نهائي')};
A.mrv=i=>{const [did,mid]=String(i).split('|'),d=MF().docs.find(z=>z.id==did);
  mdl('عكس '+(d?DTM[d.type]+' '+d.no:'مستند'),`<div class="full mu">يُنشئ حركة عكسية في دفتر المخزون وقيدًا عكسيًا، ولا يحذف المستند.</div>`+fld('سبب العكس','reason','','ta','full'),()=>run('reverseMfgDoc',{id:did,reason:rd().reason},'تم العكس').then(reopen(mid)),'عكس')};

/* ---------- قوائم المواد ---------- */
V.m_bom=()=>head('قوائم المواد (BOM)',isM()?'nbm':'','+ قائمة مواد')+`<div class="box">${tbl(['الكود','الاسم','المنتج','الكمية المرجعية','المكونات','العمليات','الحالة','إجراءات'],MF().boms.map(b=>[`<b>${esc(b.code)}</b>`,esc(b.name),esc(itN(b.item)),q3(b.qty)+' '+esc(itU(b.item)),b.comps.length,b.ops.length,st(b.active?'نشطة':'موقوفة'),btn('vbm',b.id,'عرض','g')+(cst()?btn('bmc',b.id,'التكلفة المعيارية','o'):'')+(isM()?btn('nbm',b.id,'تعديل','o')+btn('dbm',b.id,'حذف','r'):'')]))}</div><p class="mu">القائمة تحدد خامات ووقت تصنيع كمية مرجعية من المنتج؛ تُضرب تلقائيًا في كمية أمر التصنيع.</p>`;
const bcrow=(x={})=>`<tr><td><select style="min-width:210px">${itemOpts(x.item)}</select></td><td>${num('bq',x.q,90)}</td><td>${num('bs',x.scrap||'',70)}</td>${delBtn}</tr>`;
const borow=(x={})=>`<tr><td><input class="on" type="text" value="${esc(x.name||'')}" style="width:150px"></td><td><select class="ow">${wcOpts(x.wc)}</select></td><td>${num('om',x.min,90)}</td>${delBtn}</tr>`;
window.maddC=()=>addRow('#bct',bcrow());window.maddO=()=>addRow('#bot',borow());
A.nbm=i=>{const x=i?Object.assign({},bomO(i)):{active:true,qty:1,comps:[],ops:[]};
  mdl(i?'تعديل '+x.code:'قائمة مواد جديدة',fld('اسم القائمة','name',x.name,'text','full')+sel('المنتج التام','item',itemOpts0(x.item),x.item||'')+fld('الكمية المرجعية (تُنتَج بالمكونات أدناه)','qty',x.qty,'number')
   +'<div class="full"><label>المكونات (الكمية لإنتاج الكمية المرجعية) — نسبة الهالك % اختيارية</label></div>'+linesTbl('bct',['الخامة','الكمية','هالك %'],(x.comps.length?x.comps:[{}]).map(bcrow),'maddC()','+ مكوّن')
   +'<div class="full"><label>العمليات (زمن كل عملية بالدقيقة للكمية المرجعية) — اختيارية</label></div>'+linesTbl('bot',['العملية','مركز العمل','الدقائق'],x.ops.map(borow),'maddO()','+ عملية')
   +fld('ملاحظات','note',x.note,'ta','full')+(i?sel('الحالة','active',[['true','نشطة'],['false','موقوفة']],x.active?'true':'false'):''),
  ()=>{const o=rd();
    const comps=$$('#bct tbody tr').map(r=>({item:r.querySelector('select').value,q:r.querySelector('.bq').value,scrap:r.querySelector('.bs').value})).filter(c=>c.item||+c.q);
    const ops=$$('#bot tbody tr').map(r=>({name:r.querySelector('.on').value,wc:r.querySelector('.ow').value,min:r.querySelector('.om').value})).filter(c=>c.name||c.wc||+c.min);
    return run('saveBom',{...o,comps,ops,id:i||undefined,ver:x.ver},'تم حفظ قائمة المواد').then(r=>r!==false)})};
const itemOpts0=cur=>[['','— اختر المنتج —']].concat(CAT().map(i=>[i.id,i.code+' · '+i.name+' ('+i.unit+')']));
A.vbm=i=>{const b=bomO(i);mdl(b.code+' · '+b.name,kv('المنتج',itN(b.item))+kv('الكمية المرجعية',q3(b.qty)+' '+itU(b.item))+`<div class="full" style="overflow-x:auto"><h4>المكونات</h4>${tbl(['الخامة','الكمية','هالك %'],b.comps.map(c=>[esc(itN(c.item)),q3(c.q)+' '+esc(itU(c.item)),q3(c.scrap||0)]))}</div>`+(b.ops.length?`<div class="full" style="overflow-x:auto"><h4>العمليات</h4>${tbl(['العملية','مركز العمل','دقائق'],b.ops.map(o=>[esc(o.name),esc(wcN(o.wc)),q3(o.min)]))}</div>`:'')+(b.note?`<div class="full">${esc(b.note)}</div>`:''),null)};
A.dbm=i=>{const b=bomO(i);if(confirm('حذف القائمة '+b.code+'؟'))run('delBom',{id:i,ver:b.ver},'تم الحذف')};
A.bmc=async i=>{try{const j=await api('bomCost',{id:i}),b=bomO(i);
  mdl('التكلفة المعيارية التقديرية — '+b.code,`<div class="full mu">الخامات بمتوسط التكلفة الحالي في المخازن، والعمليات بمعدلات مراكز العمل. تقدير لا قيد.</div><div class="full" style="overflow-x:auto">${tbl(['الخامة','الكمية (بالهالك)','متوسط التكلفة','القيمة'],j.rows.map(r=>[esc(r.name),q3(r.q),f(r.avg),f(r.v)]))}</div><div class="cards full">${[['خامات',j.mat],['أجور',j.lab],['أعباء',j.oh],['الإجمالي لـ '+q3(j.qty),j.total],['تكلفة الوحدة',j.unit]].concat(j.allocRun?[['نصيب الوحدة من المصروفات المحمّلة ('+j.allocRun.no+')',j.ind],['التكلفة الكاملة للوحدة',j.full]]:[]).map(k=>`<div class="card"><small>${k[0]}</small><h3>${f(k[1])}</h3></div>`).join('')}</div>`,null)}catch(e){toast(e.message,1)}};

/* ---------- مراكز العمل ---------- */
V.m_wc=()=>head('مراكز العمل',isM()?'nwc':'','+ مركز عمل')+`<div class="box">${tbl(['الكود','المركز'].concat(cst()?['أجر الساعة','أعباء الساعة']:[]).concat(['ملاحظات','الحالة','إجراءات']),MF().wcs.map(w=>[`<b>${esc(w.code)}</b>`,esc(w.name)].concat(cst()?[f(w.rate),f(w.ohRate)]:[]).concat([esc(w.note)||'—',st(w.active?'نشط':'موقوف'),isM()?btn('nwc',w.id,'تعديل','o')+btn('dwc',w.id,'حذف','r'):''])))}</div><p class="mu">مركز العمل (ماكينة / ورشة / خط إنتاج) له تكلفة ساعة للأجور وأخرى للأعباء؛ تُحمَّل على أمر التصنيع عند تسجيل الساعات.</p>`;
A.nwc=i=>{const x=i?Object.assign({},wcO(i)):{active:true};
  mdl(i?'تعديل '+x.name:'مركز عمل جديد',fld('اسم المركز','name',x.name,'text','full')+fld('تكلفة ساعة الأجور (ج.م)','rate',x.rate||'','number')+fld('تكلفة ساعة الأعباء (ج.م)','ohRate',x.ohRate||'','number')+fld('ملاحظات','note',x.note,'ta','full')+(i?sel('الحالة','active',[['true','نشط'],['false','موقوف']],x.active?'true':'false'):''),
  ()=>run('saveWC',{...rd(),id:i||undefined},'تم الحفظ').then(r=>r!==false))};
A.dwc=i=>{const w=wcO(i);if(confirm('حذف مركز العمل '+w.name+'؟'))run('delWC',{id:i},'تم الحذف')};

/* ---------- التقارير ---------- */
const repTbl=r=>{if(!r)return '<p class="mu">اختر الفترة واضغط «عرض».</p>';
  return tbl(['الأمر','المنتج','الحالة','المخطط','المنتَج','التالف','خامات','أجور','أعباء','التكلفة','تحت التشغيل','فروقات','تكلفة الوحدة','زيادة صرف الخامات %'],r.rows.map(x=>[esc(x.no),esc(x.item),sb(x.st),q3(x.plan),q3(x.done),q3(x.scrap),f(x.mat),f(x.lab),f(x.oh),f(x.cost),f(x.wip),f(x.variance),x.done>0?f(x.unit):'—',x.overUse+'%']).concat([['<b>الإجمالي</b>','','','','','',`<b>${f(r.sum.mat)}</b>`,`<b>${f(r.sum.lab)}</b>`,`<b>${f(r.sum.oh)}</b>`,'',`<b>${f(r.sum.wip)}</b>`,`<b>${f(r.sum.variance)}</b>`,'','']]))};
V.m_rep=()=>{const s=ST.rep;
  return `<div class="tb"><h2>تقارير التصنيع</h2></div><div class="box"><div class="db" id="mrf">${fld('من (تاريخ بدء الأمر)','from',s.from,'date')}${fld('إلى','to',s.to,'date')}</div><button class="b" data-a="mrRun">عرض</button> <button class="b o" data-a="mrPr">طباعة</button> <button class="b g" data-a="xl">تصدير Excel</button></div><div class="box" id="mrr">${repTbl(s.res)}</div><p class="mu">«زيادة صرف الخامات» = ما صُرف فوق المطلوب بالقائمة نسبةً للمطلوب. «فروقات» = ما رُحِّل عند الإقفال إلى حساب فروقات التصنيع.</p>`};
A.mrRun=async()=>{const o=rd('#mrf');Object.assign(ST.rep,{from:o.from,to:o.to});try{const j=await api('mfgRep',{from:o.from,to:o.to});ST.rep.res=j;$('#mrr').innerHTML=repTbl(j)}catch(e){toast(e.message,1)}};
A.mrPr=()=>{const s=ST.rep;if(!s.res){toast('اعرض التقرير أولًا',1);return}docOut(printHead('تقرير التصنيع')+`<p>الفترة: ${esc(s.from)} إلى ${esc(s.to)}</p>`+repTbl(s.res)+printFoot())};
})();
