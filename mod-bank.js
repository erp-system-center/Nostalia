/* =====================================================================
   البنوك والخزينة (مديول الحسابات) — كل بنك/خزينة مربوط بحساب نقدية في دليل الحسابات
   ===================================================================== */
(()=>{
const AC=()=>D.acc||{};
const isM=()=>['admin','manager'].includes(AC().role);
NAVX.acc.push(['c_bk','البنوك والخزينة']);
const ST={T:null,loading:0,err:'',kind:'',q:''};
const KC={'خزينة':'خزائن','بنك':'بنوك','محفظة إلكترونية':'محافظ','أخرى':'أخرى'};
const dr=v=>v>0.004?f(v):'';
const load=(force)=>{if(force)ST.T=null;
  if(!ST.T&&!ST.loading){ST.loading=1;ST.err='';api('bkList').then(j=>{ST.T=j;ST.loading=0;rr()}).catch(e=>{ST.loading=0;ST.err=e.message;rr()})}
  return ST.T};
const rr=()=>{if(view==='c_bk')render()};
const mut=async(a,d,msg)=>{const j=await run(a,d,msg);ST.T=null;if(j!==false)rr();else rr();return j};
const find=i=>((ST.T||{}).list||[]).find(b=>b.id==i);

V.c_bk=()=>{
  const T=load();
  if(ST.err)return `<div class="tb"><h2>البنوك والخزينة</h2></div><div class="box" style="color:#c0392b">${esc(ST.err)} <button class="b s" data-a="bkRe">إعادة المحاولة</button></div>`;
  if(!T)return '<div class="tb"><h2>البنوك والخزينة</h2></div><div class="box mu">جارٍ التحميل…</div>';
  const L=T.list.filter(b=>(!ST.kind||b.kind===ST.kind)&&(!ST.q||(b.name+b.code+b.accName+b.bankName+b.accNo).includes(ST.q)));
  const act=T.list.filter(b=>b.active);
  const sum=k=>act.filter(b=>k?b.kind===k:true).reduce((s,b)=>s+b.bal,0);
  const cards=[['إجمالي الخزائن',sum('خزينة')],['إجمالي البنوك',sum('بنك')],['المحافظ والأخرى',sum('محفظة إلكترونية')+sum('أخرى')],['الإجمالي النقدي',sum('')]]
    .map(c=>`<div class="box" style="flex:1;min-width:150px;margin:0"><div class="mu">${c[0]}</div><div style="font-size:1.3em;font-weight:700">${f(c[1])}</div></div>`).join('');
  const kinds=['','خزينة','بنك','محفظة إلكترونية','أخرى'];
  const al=T.list.filter(b=>b.active&&b.alert).length;
  return `<div class="tb"><h2>البنوك والخزينة</h2><input style="width:200px" placeholder="بحث..." value="${esc(ST.q)}" data-bkq>${isM()&&canV('c')?'<button class="b g" data-a="nbk" data-i="">+ بنك / خزينة</button>':''}</div>
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px">${cards}</div>
  ${al?`<div class="box" style="border-color:#c0392b;color:#c0392b">⚠ ${al} حساب عليه تنبيه (رصيد سالب أو أقل من الحد الأدنى)</div>`:''}
  ${T.orphans?`<div class="box mu">يوجد ${T.orphans} حساب نقدية في دليل الحسابات غير مرتبط بسجل بنك/خزينة — يمكن ربطه من زر «+ بنك / خزينة» ثم «ربط بحساب موجود».</div>`:''}
  <div class="box"><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">${kinds.map(k=>`<button class="b s${ST.kind===k?'':' o'}" data-a="bkKind" data-i="${esc(k)}">${k?esc(KC[k]):'الكل'}</button>`).join('')}</div>
  <div style="overflow-x:auto">${tbl(['الكود','النوع','الاسم','الحساب بدليل الحسابات','بيانات البنك','الرصيد','آخر حركة','تنبيه',''],L.map(b=>[esc(b.code),esc(b.kind),esc(b.name)+(b.active?'':' <span class="mu">(موقوف)</span>'),esc(b.accCode+' · '+b.accName),esc([b.bankName,b.branch,b.accNo].filter(Boolean).join(' / '))||'—',`<b style="${b.bal<0?'color:#c0392b':''}">${f(b.bal)}</b>`,esc(b.last)||'—',b.alert?`<span style="color:#c0392b">${esc(b.alert)}</span>`:(b.unmatchedN?`<span class="mu">${b.unmatchedN} حركة بنكية غير مسواة</span>`:''),
    `<button class="b s o" data-a="bkSt" data-i="${b.id}">كشف حساب</button> `+(b.active&&isM()?`<button class="b s o" data-a="bkV" data-i="${b.id}">سند قبض/صرف</button> `:'')+(isM()?`<button class="b s o" data-a="nbk" data-i="${b.id}">تعديل</button> `+(b.openJe?`<button class="b s o" data-a="bkOr" data-i="${b.id}">عكس الافتتاحي</button> `:(b.active?`<button class="b s o" data-a="bkOp" data-i="${b.id}">رصيد افتتاحي</button> `:''))+(!b.openJe?`<button class="b s r" data-a="dbk" data-i="${b.id}">حذف</button>`:''):'')]))}</div>
  <p class="mu">الرصيد محسوب مباشرة من دفتر الأستاذ للحساب المرتبط، فأي سند أو تحويل أو شيك أو سداد على هذا الحساب يظهر هنا تلقائيًا. التحويلات والشيكات والتسوية البنكية في تابات مستقلة.</p></div>`};
document.addEventListener('input',e=>{const t=e.target;if(t&&t.hasAttribute&&t.hasAttribute('data-bkq')){ST.q=t.value;const p=t.selectionStart;rr();const n=$('[data-bkq]');if(n){n.focus();try{n.setSelectionRange(p,p)}catch(_){}}}});
A.bkRe=()=>{ST.err='';ST.T=null;rr()};
A.bkKind=k=>{ST.kind=k||'';rr()};

const bkUpd=()=>{const k=$('#m [name=kind]');if(!k||!$('#bkBank'))return;
  $('#bkBank').style.display=(k.value==='بنك'||k.value==='محفظة إلكترونية')?'':'none';
  const m=$('#m [name=mode]');if(m){$('#bkAccNew').style.display=m.value==='new'?'':'none';$('#bkAccLink').style.display=m.value==='link'?'':'none'}};
document.addEventListener('change',e=>{if(e.target&&e.target.closest&&e.target.closest('#m')&&$('#bkBank'))bkUpd()});
A.nbk=i=>{
  const T=ST.T;if(!T)return;
  const x=i?find(i):{kind:'بنك',currency:'EGP',active:true,minBal:0};if(!x)return;
  const cand=T.cand.map(a=>[a.id,a.code+' · '+a.name+(a.cash?'':' (سيُعلَّم نقدية)')+' — رصيد '+f(a.bal)]);
  const cur=i?[[x.acc,x.accCode+' · '+x.accName]].concat(cand):cand;
  const mode=i?'':sel('الحساب بدليل الحسابات','mode',[['new','إنشاء حساب جديد تلقائيًا'],['link','ربط بحساب موجود']],'new');
  mdl(i?'تعديل '+x.kind:'بنك / خزينة جديدة',
    sel('النوع','kind',['خزينة','بنك','محفظة إلكترونية','أخرى'].map(k=>[k,k]),x.kind)+fld('الاسم','name',x.name||'','text')+mode+
    `<div id="bkAccNew" ${i?'style="display:none"':''}>${fld('اسم الحساب الجديد (اتركه فارغًا ليطابق الاسم)','accName','')}</div>`+
    `<div id="bkAccLink" ${i?'':'style="display:none"'}>${sel('الحساب المرتبط','acc',[['','— اختر —']].concat(cur),x.acc||'')}</div>`+
    `<div id="bkBank">${fld('اسم البنك','bankName',x.bankName||'')+fld('الفرع','branch',x.branch||'')+fld('رقم الحساب','accNo',x.accNo||'')+fld('الآيبان IBAN','iban',x.iban||'')+fld('السويفت SWIFT','swift',x.swift||'')}</div>`+
    fld('العملة (للبيان)','currency',x.currency||'EGP')+fld('أمين الخزينة / المسؤول','custodian',x.custodian||'')+fld('حد أدنى للرصيد (تنبيه)','minBal',x.minBal||0,'number')+
    (i?sel('الحالة','active',[['true','نشط'],['false','موقوف']],x.active?'true':'false'):fld('رصيد افتتاحي (اختياري)','opening','','number')+fld('تاريخ الرصيد الافتتاحي','openDate',today(),'date'))+fld('ملاحظات','note',x.note||'','text','full'),
    ()=>{const o=rd();
      if(!i){if(o.mode==='link'&&!o.acc){toast('اختر الحساب المرتبط',1);return false}
        o.newAcc=o.mode==='new';if(o.newAcc)delete o.acc}
      delete o.mode;
      if(i){o.id=i;o.ver=x.ver}
      return mut('saveBk',o,'تم الحفظ')});
  bkUpd();
};
A.dbk=i=>{const b=find(i);if(b&&confirm('حذف سجل '+b.name+'؟ (الحساب يبقى في دليل الحسابات)'))mut('delBk',{id:i,ver:b.ver},'تم الحذف')};
A.bkOp=i=>{const b=find(i);if(!b)return;mdl('رصيد افتتاحي — '+b.name,`<p class="mu full">يُسجَّل قيد: من حساب ${esc(b.accName)} إلى حساب «الرصيد الافتتاحي». استخدمه مرة واحدة عند بداية التطبيق.</p>`+fld('المبلغ','amount','','number')+fld('التاريخ','date',today(),'date'),
  ()=>{const o=rd();if(!(+o.amount>0)){toast('أدخل مبلغًا أكبر من صفر',1);return false}return mut('bkOpen',{id:i,amount:o.amount,date:o.date},'تم تسجيل الرصيد الافتتاحي')})};
A.bkOr=i=>{const b=find(i);if(!b)return;mdl('عكس الرصيد الافتتاحي — '+b.name,`<p class="mu full">الرصيد الافتتاحي المسجل: ${f(b.openAmt)} بتاريخ ${esc(b.openDate)}. سيُنشأ قيد عكسي بتاريخ اليوم.</p>`+fld('سبب العكس','reason','','text','full'),
  ()=>{const o=rd();if(!o.reason.trim()){toast('اكتب السبب',1);return false}return mut('bkOpenRev',{id:i,reason:o.reason},'تم عكس الرصيد الافتتاحي')},'تأكيد العكس')};
A.bkV=i=>{const b=find(i);if(!b)return;
  mdl('سند على '+b.name,`<p class="full">اختر نوع السند:</p>`,null,'',false);
  $('#mb').innerHTML=`<div style="display:flex;gap:8px"><button class="b g" data-a="bkV2" data-i="REC|${b.acc}">سند قبض</button><button class="b" data-a="bkV2" data-i="PAYV|${b.acc}">سند صرف</button></div>`};
A.bkV2=v=>{const [t,acc]=v.split('|');$('#mc').click&&dlg.close();Promise.resolve(A.nvc(t)).then(()=>{const s=$('#m [name=cash]');if(s){s.value=acc;s.dispatchEvent(new Event('change',{bubbles:true}))}})};

let SR=null;
A.bkSt=i=>{const b=find(i);if(!b)return;const y=today().slice(0,4)+'-01-01';
  mdl('كشف حساب — '+b.name,`<div class="full" style="display:flex;gap:8px;flex-wrap:wrap;align-items:end">${fld('من','sf',y,'date')}${fld('إلى','st2',today(),'date')}<button class="b" data-a="bkStRun" data-i="${i}">عرض</button><button class="b o" data-a="bkStX" data-i="${i}">Excel</button><button class="b o" data-a="bkStP" data-i="${i}">طباعة</button>${HR.box()}</div><div class="full" id="bkSr"></div>`,null,'',false)};
const stBody=j=>tbl(['التاريخ','القيد','النوع','البيان','مدين (وارد)','دائن (صادر)','الرصيد'],[['','','','<b>رصيد أول المدة</b>','','',f(j.gl.open)]].concat(j.gl.rows.map(r=>[esc(r.date),`<a href="#" data-a="vje2" data-i="${esc(r.jeId)}">${esc(r.jeNo)}</a>`,esc(window.JTN?window.JTN(r.jt):r.jt),esc(r.memo),dr(r.dr),dr(r.cr),f(r.bal)])).concat([['','','','<b>الرصيد الختامي</b>','','','<b>'+f(j.gl.close)+'</b>']]));
A.bkStRun=async i=>{const from=$('#m [name=sf]').value,to=$('#m [name=st2]').value;
  try{const j=await api('bkStmt',{id:i,from,to});SR={j,from,to};$('#bkSr').innerHTML=`<div style="overflow-x:auto">${stBody(j)}</div><p class="mu">الرصيد: موجب = مدين.</p>`}catch(e){toast(e.message,1)}};
A.bkStX=async i=>{if(!SR||SR.j.bank.id!=i)await A.bkStRun(i);if(!SR)return;let j=SR.j;if(HR.on())try{j=await api('bkStmt',{id:i,from:SR.from,to:SR.to,hideRev:true})}catch(e){toast(e.message,1);return}const g=j.gl;
  const rows=[['كشف حساب: '+j.bank.name,'','','','','',''],['من '+SR.from+' إلى '+SR.to,'','','','','',''],['التاريخ','القيد','النوع','البيان','مدين','دائن','الرصيد'],['','','','رصيد أول المدة','','',g.open]].concat(g.rows.map(r=>[r.date,r.jeNo,window.JTN?window.JTN(r.jt):r.jt,r.memo,r.dr||'',r.cr||'',r.bal])).concat([['','','','الرصيد الختامي','','',g.close]]);
  XL.download('كشف حساب - '+j.bank.name,XL.build([{name:'الكشف',rows,headerRow:3,widths:[12,12,16,40,14,14,14]}]))};
A.bkStP=async i=>{if(!SR||SR.j.bank.id!=i)await A.bkStRun(i);if(!SR)return;let j=SR.j;if(HR.on())try{j=await api('bkStmt',{id:i,from:SR.from,to:SR.to,hideRev:true})}catch(e){toast(e.message,1);return}printHtml(printHead('كشف حساب — '+j.bank.name)+`<p>الفترة: ${esc(SR.from)} إلى ${esc(SR.to)}${j.bank.accNo?' — رقم الحساب: '+esc(j.bank.accNo):''}</p>`+stBody(j)+printFoot())};
})();
