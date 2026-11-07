/* =====================================================================
   فواتير المشتريات (مديول المشتريات): مطابقة ثلاثية أمر التوريد ← الاستلام ← فاتورة المشتريات
   ===================================================================== */
(()=>{
{const o=MODS.proc.nav;MODS.proc.nav=()=>{const r=o().filter(n=>n[0]!=='p_inv');if(canW())r.push(['p_inv','فواتير المشتريات']);return r}}
const AC=()=>D.acc||{};
const role=()=>AC().role;
const canW=()=>is('admin','procurement','finance')||['admin','manager','accountant'].includes(role());
const isMgr=()=>is('admin','finance')||['admin','manager'].includes(role());
const canPay=()=>(AC().payAccts||[]).length>0;
const COL={'مسودة':'#c77a00','مرحّل':'#1d5fa8','مدفوع':'var(--ok)','مقبوض':'var(--ok)','مدفوع جزئيًا':'#8a6d00','مقبوض جزئيًا':'#8a6d00','ملغي':'#777','مطابقة':'var(--ok)','فروقات':'#b3261e','كمية':'#b3261e'};
const bd=s=>`<span class="st" style="background:${COL[s]||'#777'};color:#fff">${esc(s)}</span>`;
const expAccs=()=>(AC().accounts||[]).filter(a=>a.active&&a.type==='expense');
const accO=(arr,cur,ph)=>`<option value="">${ph||'— اختر —'}</option>`+arr.map(a=>`<option value="${esc(a.id)}"${a.id==cur?' selected':''}>${esc(a.code)} · ${esc(a.name)}</option>`).join('');
const num=v=>+v||0;
const supN=id=>((AC().sups||[]).find(s=>s.id==id)||{}).name||'';
let DM=null,DMT=0;
const dimsLoad=async()=>{if(DM&&Date.now()-DMT<60000)return;DMT=Date.now();try{DM=await api('invDims')}catch(e){DM=DM||{}}};
const dopt=(k,cur)=>'<option value="">— بدون —</option>'+((DM&&DM[k])||[]).map(x=>`<option value="${esc(x.id)}"${x.id==cur?' selected':''}>${esc(x.name)}</option>`).join('');
const P=(l,t)=>t?`<p><b>${l}:</b> ${esc(t)}</p>`:'';


/* ================= فواتير المشتريات ================= */
const PS={q:'',st:''};
V.p_inv=()=>{
  if(!AC().linked)return head('فواتير المشتريات')+'<div class="box mu">الربط المحاسبي غير مُفعَّل.</div>';
  const q=PS.q.trim(),L=(AC().pinv||[]).filter(x=>(!PS.st||x.st===PS.st)&&(!q||(x.no+x.supNo+x.supName+x.poNo).includes(q)));
  const me=D.user.username;
  const acts=x=>{let b=btn('vpi',x.id,'عرض / طباعة','o');
    if(canW()&&x.st==='مسودة'&&(x.by===me||isMgr()))b+=btn('npi',x.id,'تعديل','o')+btn('ppi',x.id,'ترحيل','g')+btn('dpi',x.id,'حذف','r');
    if(canPay()&&!x.po&&['مرحّل','مدفوع جزئيًا'].includes(x.st))b+=btn('ypi',x.id,'سداد','g');
    if(isMgr()&&['مرحّل','مدفوع','مدفوع جزئيًا'].includes(x.st)&&!x.paid)b+=btn('cpi',x.id,'إلغاء','r');
    return b};
  const open=(AC().invPos||[]).filter(p=>p.open);
  const cards=[['مسودات',(AC().pinv||[]).filter(x=>x.st==='مسودة').length],['استلامات بانتظار الفوترة',open.length+' أمر'],['فواتير بفروقات (مرحّلة)',(AC().pinv||[]).filter(x=>x.po&&x.match==='فروقات'&&x.st!=='مسودة'&&x.st!=='ملغي').length]];
  return head('فواتير المشتريات',canW()?'npi':'','+ فاتورة مشتريات',`<select onchange="piF('st',this.value)"><option value="">كل الحالات</option>${['مسودة','مرحّل','مدفوع جزئيًا','مدفوع','ملغي'].map(s=>`<option${PS.st===s?' selected':''}>${s}</option>`).join('')}</select>`)
   +`<div class="cards">${cards.map(c=>`<div class="card"><div class="mu">${c[0]}</div><b>${c[1]}</b></div>`).join('')}</div>`
   +`<div class="box">${tbl(['الرقم','التاريخ','المورد','رقم فاتورة المورد','أمر التوريد','الإجمالي','المطابقة','فروق على المورد','الحالة',''],L.map(x=>[esc(x.no),esc(x.date),esc(x.supName),esc(x.supNo),esc(x.poNo)||'<span class="mu">مباشرة</span>',f(x.total),(x.po?bd(x.match):'<span class="mu">—</span>'),x.po?f(x.dPrice+x.dVat+x.extra):'—',bd(x.st),acts(x)]))}</div>
   <p class="mu">الدورة: أمر توريد ← استلام مخزني (يقيّد المورد بسعر الأمر) ← <b>فاتورة المشتريات</b> تُطابَق على المستلم، ولا يُكرَّر القيد: يُرحَّل فقط فرق السعر والضريبة والبنود الإضافية (كالشحن) على حساب المورد. الفاتورة المباشرة بلا أمر توريد للمصروفات والخدمات فقط.</p>`;
};
window.piF=(k,v)=>{PS[k]=v;render()};
const piFind=i=>(AC().pinv||[]).find(x=>x.id==i);

// واجهة بنود الفاتورة
const piLines=(po,old)=>{
  if(!po)return '';
  const m={};(old||[]).filter(l=>l.k==='po').forEach(l=>m[l.pl]=l);
  return `<div class="full" style="overflow-x:auto"><table id="pil"><thead><tr><th>البند</th><th>المستلم</th><th>سبق فوترته</th><th>المتاح للفوترة</th><th>كمية الفاتورة</th><th>سعر الأمر</th><th>سعر فاتورة المورد</th></tr></thead><tbody>`
   +po.lines.map(l=>{const o=m[l.pl],left=Math.max(0,r2(l.left+(o&&old?0:0)));
     return `<tr data-pl="${l.pl}"><td>${esc(l.d)}<br><small class="mu">${esc(l.u)}</small></td><td>${l.rec}</td><td>${l.inv}</td><td>${left}</td><td><input class="pq" type="number" min="0" step="any" value="${o?o.q:left||''}" style="width:90px"></td><td>${f(l.p)}</td><td><input class="pp" type="number" min="0" step="any" value="${o?o.p:l.p}" style="width:100px"></td></tr>`}).join('')
   +`</tbody></table></div>`;
};
const exRow=(x={})=>`<tr><td><input class="xd" value="${esc(x.d||'')}" placeholder="مثال: رسوم شحن" style="min-width:160px"></td><td><input class="xa" type="number" step="any" value="${x.amt??''}" style="width:100px" title="سالب = خصم"></td><td><select class="xc" style="min-width:180px">${accO(expAccs(),x.acc,'— مصروف الخدمات —')}</select></td><td><button type="button" class="b s r" onclick="this.closest('tr').remove();piCalc()">×</button></td></tr>`;
const PIT=()=>AC().pItems||[];
const dnCell=(k,x)=>k==='x'?`<input class="dd" value="${esc(x.d||'')}" placeholder="مثال: إيجار، رسوم شحن" style="min-width:170px">`
  :`<select class="di" style="min-width:190px"><option value="">— اختر الصنف —</option>${PIT().filter(i=>k==='i'?i.type==='مخزني':i.type!=='مخزني').map(i=>`<option value="${esc(i.id)}"${i.id==x.item?' selected':''}>${esc(i.code+' · '+i.name)} (${esc(i.unit)})</option>`).join('')}</select>`;
const expNm=id=>{const a=((D.svc||{}).expAccs||[]).find(z=>z.id==id);return a?a.code+' · '+a.name:''};
const expLabel=it=>{if(!it)return '';if(it.acc&&expNm(it.acc))return expNm(it.acc);const c=((D.svc||{}).cats||[]).find(z=>z.active&&z.name===it.cat);if(c&&c.expAcc&&expNm(c.expAcc))return expNm(c.expAcc)+' (من التصنيف)';return it.type==='مستهلك'?'مصروف المواد (افتراضي)':'مصروف الخدمات (افتراضي)'};
const dcCell=(k,x)=>k==='x'?`<select class="dc2" style="min-width:170px">${accO(expAccs(),x.acc,'— اختر حساب المصروف —')}</select>`:(k==='i'?'<span class="mu">المخزون</span>':`<span class="mu da2">${esc(expLabel(PIT().find(i=>i.id==x.item)))||'حساب الخدمة'}</span>`);
const pdRow=(x={})=>{const k=x.k||'i';return `<tr><td><select class="dk"><option value="i"${k==='i'?' selected':''}>صنف مخزني</option><option value="v"${k==='v'?' selected':''}>خدمة / مستهلك</option><option value="x"${k==='x'?' selected':''}>مصروف</option></select></td><td class="dn">${dnCell(k,x)}</td><td><input class="dq" type="number" step="any" min="0" value="${x.q??1}" style="width:80px"></td><td><input class="dp" type="number" step="any" min="0" value="${x.p??''}" style="width:100px"></td><td><input class="ddc" type="number" min="0" max="100" step="any" value="${x.disc||''}" placeholder="0"></td><td><input class="dvt" type="number" min="0" max="100" step="any" value="${x.vp??''}" placeholder="الفاتورة"></td><td class="da">0.00</td><td class="dc">${dcCell(k,x)}</td><td><button type="button" class="b s r" onclick="this.closest('tr').remove();piWh();piCalc()">×</button></td></tr>`};
window.pdRowH=()=>pdRow();
const piWh=()=>{const w=$('#m .pi-wh');if(w)w.hidden=!$$('#pdl tbody tr').some(r=>r.querySelector('.dk').value==='i')};
window.piWh=piWh;
const piGet=()=>{
  const lines=[];
  $$('#pil tbody tr').forEach(r=>{const q=+r.querySelector('.pq').value||0;if(q>0)lines.push({k:'po',pl:+r.dataset.pl,q,p:r.querySelector('.pp').value})});
  $$('#pix tbody tr').forEach(r=>{const a=+r.querySelector('.xa').value||0,d=r.querySelector('.xd').value.trim();if(a||d)lines.push({k:'x',d,amt:a,acc:r.querySelector('.xc').value||undefined})});
  $$('#pdl tbody tr').forEach(r=>{const k=r.querySelector('.dk').value,q=+r.querySelector('.dq').value||0,pv=r.querySelector('.dp').value;
    const disc=r.querySelector('.ddc').value,vp=r.querySelector('.dvt').value;
     if(k==='x'){const d=r.querySelector('.dd').value.trim();if(+pv||d)lines.push({k:'x',d,q,p:pv,disc,vp,acc:r.querySelector('.dc2').value||undefined})}
    else{const it=r.querySelector('.di').value;if(it)lines.push({k,item:it,q,p:pv,disc,vp})}});
  return lines;
};
window.piCalc=()=>{const e=$('#pit');if(!e)return;const poId=(($('#m [name=po]')||{}).value)||'',po=(AC().invPos||[]).find(p=>p.id==poId);
  let sub=0,dp=0,ex=0;
  $$('#pil tbody tr').forEach(r=>{const q=+r.querySelector('.pq').value||0,p=+r.querySelector('.pp').value||0,l=po&&po.lines[+r.dataset.pl];if(l){sub+=q*p;dp+=q*(p-l.p)}});
  $$('#pix tbody tr').forEach(r=>{const a=+r.querySelector('.xa').value||0;ex+=a;sub+=a});
  let lv=0,vl=false;const vp1=po?po.vat:(+($('#m [name=vat]')||{}).value||0);
   $$('#pdl tbody tr').forEach(r=>{const g=r2((+r.querySelector('.dq').value||0)*(+r.querySelector('.dp').value||0)),dc=Math.min(100,Math.max(0,+r.querySelector('.ddc').value||0)),v=r2(g-r2(g*dc/100)),vr=r.querySelector('.dvt').value,lp=vr===''?vp1:Math.min(100,Math.max(0,+vr||0));r.querySelector('.da').textContent=f(v);sub+=v;lv+=r2(v*lp/100);if(vr!==''&&Math.abs(lp-vp1)>1e-9)vl=true});
  const vp=po?po.vat:(+($('#m [name=vat]')||{}).value||0),vi=$('#m [name=vatAmt]');
  const auto=(!po&&vl)?r2(lv):r2(sub*vp/100);if(vi&&vi.dataset.auto!=='0')vi.value=auto;
  const va=vi&&vi.value!==''?+vi.value:auto;
  e.innerHTML=`الإجمالي قبل الضريبة: <b>${f(sub)}</b> — الضريبة: <b>${f(va)}</b> — إجمالي الفاتورة: <b>${f(r2(sub+va))}</b>`+(po?`<br>فرق السعر عن أمر التوريد: <b style="color:${Math.abs(dp)>0.004?'#b3261e':'inherit'}">${f(dp)}</b> — بنود إضافية: <b>${f(ex)}</b>`:'');
};
dlg.addEventListener('input',e=>{if(e.target&&e.target.closest&&e.target.closest('#pil,#pix,#pdl')||e.target&&e.target.name==='vat')piCalc();if(e.target&&e.target.name==='vatAmt')e.target.dataset.auto='0'});
dlg.addEventListener('change',e=>{const c0=e.target&&e.target.classList;if(c0&&c0.contains('dk')){const r=e.target.closest('tr'),k=e.target.value;r.querySelector('.dn').innerHTML=dnCell(k,{});r.querySelector('.dc').innerHTML=dcCell(k,{});piWh();piCalc()}if(c0&&c0.contains('di')){piWh();const r2_=e.target.closest&&e.target.closest('tr'),l2=r2_&&r2_.querySelector('.da2');if(l2)l2.textContent=expLabel(PIT().find(i=>i.id==e.target.value))||'حساب الخدمة'}if(e.target&&e.target.name==='po'&&$('#pibody'))piMode();if(e.target&&e.target.name==='payMode'){const c=$('#m .pi-cash');if(c)c.hidden=e.target.value!=='cash'}});
const cashN=id=>{const a=((AC().accounts||[]).find(z=>z.id==id));return a?a.code+' · '+a.name:''};
const piMode=()=>{const poId=($('#m [name=po]')||{}).value,po=(AC().invPos||[]).find(p=>p.id==poId),b=$('#pibody');if(!b)return;
  $('#m .pi-sup').hidden=!!po;$('#m .pi-vat').hidden=!!po;const pp=$('#m .pi-pay');if(pp)pp.hidden=!!po;
  if(po){const s=$('#m [name=sup]');if(s)s.value=po.sup}
  b.innerHTML=po?(piLines(po,null)+`<div class="full"><b>بنود إضافية (شحن، رسوم، خصم...)</b><table id="pix"><thead><tr><th>البيان</th><th>المبلغ (قبل الضريبة)</th><th>حساب المصروف</th><th></th></tr></thead><tbody></tbody></table><button type="button" class="b o s" onclick="$('#pix tbody').insertAdjacentHTML('beforeend',window.exRowH());piCalc()">+ بند</button></div>`)
   :`<div class="full" style="overflow-x:auto"><b>بنود فاتورة المشتريات</b><table id="pdl"><thead><tr><th>النوع</th><th>البند / البيان</th><th>الكمية</th><th>السعر (قبل الضريبة)</th><th>خصم %</th><th>ضريبة %</th><th>المبلغ (بعد الخصم)</th><th>الحساب</th><th></th></tr></thead><tbody>${pdRow()}</tbody></table><button type="button" class="b o s" onclick="$('#pdl tbody').insertAdjacentHTML('beforeend',window.pdRowH());piWh();piCalc()">+ بند</button><div class="mu">«صنف مخزني» يدخل المخزن تلقائيًا ويُقيَّد على المخزون · «خدمة / مستهلك» يُقيَّد على حساب الصنف · «مصروف» على الحساب الذي تختاره.</div></div>
   <div class="pi-wh full" hidden>${sel('مخزن الاستلام (للأصناف المخزنية)','wh',[['','— اختر المخزن —']].concat((AC().whs||[]).map(w=>[w.id,w.name])),(window.__piWh||''))}</div>`;
  piCalc()};
window.exRowH=()=>exRow();
A.npi=async i=>{if(!canW())return;await dimsLoad();const x=i?piFind(i):{date:today(),items:[]};if(i&&!x)return;window.__piWh=x.wh||'';
  const pos=(AC().invPos||[]).filter(p=>p.open||p.id==x.po);
  mdl(i?'تعديل فاتورة مشتريات '+x.no:'فاتورة مشتريات جديدة',
   sel('أمر التوريد (مطابقة ثلاثية)','po',[['','— فاتورة مشتريات مباشرة (صنف مخزني / خدمة / مصروف) —']].concat(pos.map(p=>[p.id,p.no+' — '+p.supName])),x.po||'','full')
   +`<div class="pi-sup full"${x.po?' hidden':''}>${sel('المورد','sup',[['','— اختر المورد —']].concat((AC().sups||[]).map(s=>[s.id,s.name])),x.sup||'')}</div>`
   +fld('رقم فاتورة المورد','supNo',x.supNo||'')+fld('تاريخ فاتورة المورد','supDate',x.supDate||today(),'date')+fld('تاريخ القيد','date',x.date,'date')+fld('تاريخ الاستحقاق','due',x.due||'','date')
   +`<div class="pi-pay full"${x.po?' hidden':''}><div class="db">${sel('طريقة السداد','payMode',[['credit','آجل (على حساب المورد)'],['cash','نقدًا (يُسدَّد عند الترحيل)']],x.cashAcc?'cash':'credit')}<div class="pi-cash"${x.cashAcc?'':' hidden'}>${sel('حساب الخزينة / البنك','cashAcc',[['','— اختر الحساب —']].concat((AC().payAccts||[]).map(a=>[a.id,a.code+' · '+a.name+' (رصيد '+f(a.bal)+')'])),x.cashAcc||'')}</div></div></div>`
   +`<div class="pi-vat"${x.po?' hidden':''}>${fld('نسبة الضريبة %','vat',x.vat??14,'number')}</div>`
   +`<div id="pibody" class="full"></div>`
   +fld('ضريبة الفاتورة الفعلية (من فاتورة المورد)','vatAmt',x.id?x.vatAmt:'','number')+`<div class="full" id="pit"></div>`+fld('ملاحظات','note',x.note||'','ta','full'),
   ()=>{const o=rd(),it=piGet();if(!o.supNo.trim()){toast('أدخل رقم فاتورة المورد',1);return false}if(!it.length){toast('أدخل كمية مفوترة أو بندًا واحدًا على الأقل',1);return false}
    if(!o.po&&!o.sup){toast('اختر المورد',1);return false}
    if(!o.po&&it.some(l=>l.k==='i')&&!o.wh){toast('اختر مخزن الاستلام للأصناف المخزنية',1);return false}
    if(!o.po&&o.payMode==='cash'&&!o.cashAcc){toast('اختر حساب الخزينة / البنك للسداد النقدي',1);return false}
    return run('savePinv',{id:i||undefined,ver:x.ver,po:o.po||undefined,sup:o.sup,supNo:o.supNo,supDate:o.supDate,date:o.date,due:o.due,vat:o.vat,vatAmt:o.vatAmt,note:o.note,cashAcc:(!o.po&&o.payMode==='cash')?o.cashAcc:'',wh:(!o.po&&it.some(l=>l.k==='i'))?o.wh:'',items:it},'تم حفظ الفاتورة كمسودة').then(r=>r!==false)});
  piMode();
  if(i){const b=$('#pibody');if(x.po){const po=(AC().invPos||[]).find(p=>p.id==x.po);b.innerHTML=piLines(po,x.items)+`<div class="full"><b>بنود إضافية</b><table id="pix"><thead><tr><th>البيان</th><th>المبلغ</th><th>حساب المصروف</th><th></th></tr></thead><tbody>${x.items.filter(l=>l.k==='x').map(exRow).join('')}</tbody></table><button type="button" class="b o s" onclick="$('#pix tbody').insertAdjacentHTML('beforeend',window.exRowH());piCalc()">+ بند</button></div>`}
   else{$('#pdl tbody').innerHTML=x.items.map(l=>pdRow({...(l.k==='x'?{k:'x',d:l.d,q:1,p:l.amt,acc:l.acc}:l),vp:(l.vp!=null&&l.vp!==''&&Math.abs(+l.vp-(+x.vat||0))>1e-9)?l.vp:''})).join('')||pdRow();piWh()}
   const vi=$('#m [name=vatAmt]');if(vi)vi.dataset.auto='0';piCalc()}
};
A.dpi=i=>{if(confirm('حذف مسودة الفاتورة؟'))run('delPinv',{id:i},'تم الحذف')};
A.ppi=i=>{const x=piFind(i);if(!x)return;
  mdl('ترحيل فاتورة المشتريات '+x.no,kv('المورد',x.supName)+kv('رقم فاتورة المورد',x.supNo)+kv('الإجمالي',f(x.total))+kv('المطابقة',x.match)
   +(x.po?`<div class="full">فرق السعر: <b>${f(x.dPrice)}</b> — فرق الضريبة: <b>${f(x.dVat)}</b> — بنود إضافية: <b>${f(x.extra)}</b><br><small class="mu">تُرحَّل هذه الفروق فقط على حساب المورد (قيد الاستلام قائم ولا يتكرر).${x.match==='مطابقة'?' الفاتورة مطابقة تمامًا فلن يُنشأ قيد.':''}</small></div>`:`<div class="full mu">فاتورة مشتريات مباشرة: مدين المخزون (للأصناف المخزنية) / المصروف + الضريبة، دائن المورد.${x.items.some(l=>l.k==='i')?' <b>وسيُنشأ استلام مخزني تلقائي للأصناف المخزنية في «'+esc(((AC().whs||[]).find(w=>w.id==x.wh)||{}).name||'')+'».</b>':''}${x.cashAcc?' <b>وسيُسدَّد نقدًا من «'+esc(cashN(x.cashAcc))+'» بتاريخ الفاتورة (يلزم رصيد كافٍ في الحساب).</b>':''}</div>`),
   ()=>run('postPinv',{id:i,ver:x.ver},'تم ترحيل الفاتورة').then(r=>r!==false),'ترحيل')};
A.cpi=i=>{const x=piFind(i);mdl('إلغاء فاتورة المشتريات '+x.no,(x.grn?'<div class="full mu">سيُعكس الاستلام المخزني المرتبط بها (يُمنع لو توجد حركة لاحقة على أصنافها في المخزن).</div>':'')+fld('سبب الإلغاء (إلزامي)','reason','','ta','full'),()=>{const r=rd().reason.trim();if(!r){toast('اكتب السبب',1);return false}return run('cancelPinv',{id:i,ver:x.ver,reason:r},'تم الإلغاء').then(z=>z!==false)},'تأكيد الإلغاء')};
A.ypi=i=>{const x=piFind(i);const left=r2(x.total-x.paid);
  mdl('سداد فاتورة '+x.no,kv('المورد',x.supName)+kv('المتبقي',f(left))+sel('الدفع من','acc',AC().payAccts.map(a=>[a.id,a.code+' · '+a.name+' (رصيد '+f(a.bal)+')']))+fld('التاريخ','date',today(),'date')+fld('المبلغ','amount',left,'number')+fld('المرجع','ref'),
   ()=>{const o=rd();if(!(+o.amount>0)){toast('أدخل المبلغ',1);return false}return run('payPinv',{id:i,acc:o.acc,date:o.date,amount:+o.amount,ref:o.ref},'تم تسجيل السداد').then(r=>r!==false)})};
const piHtml=(x,pr)=>{
  const KT={i:'صنف مخزني',v:'خدمة / مستهلك',x:'مصروف'},direct=!x.po;
  const dh=direct&&x.items.some(l=>(+l.disc||0)>0||(l.vp!=null&&l.vp!==''&&Math.abs(+l.vp-(+x.vat||0))>1e-9)),rows=direct?x.items.map(l=>[esc(l.d),KT[l.k]||'مصروف',l.k==='x'?'':l.q+' '+esc(l.u||''),l.k==='x'?'':f(l.p),...(dh?[l.disc?f(l.disc)+'%':'—',(l.vp!=null?l.vp:x.vat)+'%']:[]),f(l.amt)]):x.items.map(l=>l.k==='po'?[esc(l.d),l.q,f(l.pp),f(l.p),f(r2(l.q*l.p)),f(r2(l.q*(l.p-l.pp)))]:[esc(l.d)+' <small class="mu">(إضافي)</small>','','','',f(l.amt),'']);
  return (pr?printHead(x.po?'فاتورة مشتريات (مطابقة)':'فاتورة مشتريات'):'')+`<div class="g"><div>${P('رقم القيد الداخلي',x.no)+P('المورد',x.supName)+P('رقم فاتورة المورد',x.supNo)+P('تاريخ فاتورة المورد',x.supDate)}</div><div>${P('أمر التوريد',x.poNo||'مباشرة')+(x.wh?P('مخزن الاستلام',((AC().whs||[]).find(w=>w.id==x.wh)||{}).name||''):'')+P('التاريخ',x.date)+P('الاستحقاق',x.due)+P('السداد',x.cashAcc?'نقدًا — '+cashN(x.cashAcc):'آجل')+P('الحالة',x.st)+P('المطابقة',x.match)}</div></div>`
   +tbl(direct?['البند','النوع','الكمية','السعر',...(dh?['خصم %','ضريبة %']:[]),'القيمة']:['البند','الكمية','سعر الأمر','سعر الفاتورة','القيمة','فرق السعر'],rows)
   +`<p>الإجمالي قبل الضريبة: <b>${f(x.sub)}</b> — الضريبة: <b>${f(x.vatAmt)}</b> — <b>إجمالي الفاتورة: ${f(x.total)}</b></p>`
   +(x.po?`<p>الفروق المرحّلة على حساب المورد: سعر ${f(x.dPrice)} + ضريبة ${f(x.dVat)} + إضافي ${f(x.extra)}</p>`:'')+(x.note?P('ملاحظات',x.note):'')+(pr?printFoot():'')};
A.vpi=i=>{const x=piFind(i);if(!x)return;
  mdl('فاتورة مشتريات '+x.no,`<div class="full" style="overflow-x:auto">${piHtml(x,false)}</div><div class="full"><button class="b g" data-a="ppip" data-i="${esc(i)}">طباعة</button> <button class="b g" data-a="ppix" data-i="${esc(i)}">Excel</button></div>`+(typeof attBox==='function'?attBox('PINV',x.id):''),null);if(typeof attInit==='function')attInit()};
A.ppip=i=>{const x=piFind(i);if(x)docOut(piHtml(x,true),'فاتورة مشتريات '+x.no)};
A.ppix=i=>{const x=piFind(i);if(x)docOut(piHtml(x,true),'فاتورة مشتريات '+x.no,1)};

})();
