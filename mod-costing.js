/* =====================================================================
   mod-costing.js — تحميل المصروفات على المنتجات (داخل مديول التصنيع)
   التابات: m_pool تجمّعات التكلفة، m_alloc تحميل المصروفات والنتائج. الخادم: Costing.gs
   ===================================================================== */
(()=>{
const MF=()=>D.mfg||{};
const isM=()=>['admin','manager'].includes(MF().role);
const POOLS=()=>MF().pools||[],RUNS=()=>MF().runs||[],ACCS=()=>MF().accs||[],BASIS=()=>MF().basis||{};
const CAT=()=>(D.catalog||[]).filter(i=>i.type==='مخزني');
const itN=id=>{const i=(D.catalog||[]).find(x=>x.id==id);return i?i.name:'؟'};
const accN=id=>{const a=ACCS().find(x=>x.id==id);return a?a.code+' · '+a.name:'؟'};
const note=t=>`<p class="mu">${t}</p>`;
const bd=s=>`<span class="st" style="background:${s==='معتمد'?'var(--ok)':'#777'};color:#fff">${esc(s)}</span>`;
const noLink=t=>head(t)+'<div class="box mu">الربط المحاسبي غير مُفعَّل؛ يفعّله مدير النظام من مديول الحسابات.</div>';

/* ================= تجمّعات التكلفة ================= */
V.m_pool=()=>{
  if(!MF().accs)return noLink('تجمّعات التكلفة');
  return head('تجمّعات التكلفة',isM()?'npl':'','+ تجمّع جديد')
   +`<div class="box">${tbl(['الكود','التجمّع','الحسابات (المصروفات)','المحمَّل','أساس التوزيع','المنتجات المستهدفة','الحالة',''],POOLS().map(p=>[esc(p.code),esc(p.name),p.accs.map(a=>esc(accN(a))).join('<br>'),p.pct+'%',esc(BASIS()[p.basis]||p.basis),p.targets.length?p.targets.map(t=>esc(itN(t.item))+(p.basis==='fixed'?' ('+t.pct+'%)':'')).join('، '):'<span class="mu">كل المنتجات</span>',p.active?'<span class="st">نشط</span>':'<span class="st">موقوف</span>',isM()?btn('npl',p.id,'تعديل','o')+btn('dpl',p.id,'حذف','r'):'']))}</div>`
   +note('التجمّع = مجموعة حسابات مصروف (إيجار، كهرباء، غاز، نقل، رواتب إدارية...) يُحمَّل جزء منها أو كلها على المنتجات بأساس توزيع تختاره. المصروف الواحد يمكن أن يدخل في أكثر من تجمّع بنسب مجموعها 100% كحد أقصى، والمنتج الواحد يأخذ نصيبًا من كل التجمّعات التي تشمله. اختر مصروفات غير محمَّلة أصلًا بمعدلات مراكز العمل حتى لا تتكرر في التكلفة.');
};
const tgRow=(x={})=>`<tr><td><select class="tg_i" style="min-width:200px"><option value="">— اختر المنتج —</option>${CAT().map(i=>`<option value="${esc(i.id)}"${i.id==x.item?' selected':''}>${esc(i.code+' · '+i.name)}</option>`).join('')}</select></td><td><input class="tg_p" type="number" min="0" max="100" step="any" value="${x.pct??''}" style="width:80px" placeholder="%"></td><td><button type="button" class="b s r" onclick="this.closest('tr').remove()">×</button></td></tr>`;
window.tgRowH=()=>tgRow();
const syncBasis=()=>{const b=($('#m [name=basis]')||{}).value;$$('#m .tg-pct').forEach(e=>e.style.display=b==='fixed'?'':'none');const h=$('#m .tg-hint');if(h)h.textContent=b==='fixed'?'أساس «نسب ثابتة»: حدّد نسبة كل منتج ويجب أن يكون المجموع 100%.':'اختياري: اترك القائمة فارغة لتوزيع التجمّع على كل المنتجات المنتَجة في الفترة، أو حدّد منتجات بعينها (تجاهل خانة النسبة).'};
dlg.addEventListener('change',e=>{if(e.target&&e.target.name==='basis'&&$('#m .tg-hint'))syncBasis()});
A.npl=i=>{if(!isM())return;const x=i?POOLS().find(p=>p.id==i):{active:true,pct:100,basis:'qty',accs:[],targets:[]};if(i&&!x)return;
  mdl(i?'تعديل تجمّع '+x.code:'تجمّع تكلفة جديد',
   fld('اسم التجمّع','name',x.name||'','text','full')
   +sel('أساس التوزيع','basis',Object.keys(BASIS()).map(k=>[k,BASIS()[k]]),x.basis)+fld('نسبة المحمَّل من المبلغ %','pct',x.pct,'number')
   +(i?sel('الحالة','active',[['true','نشط'],['false','موقوف']],x.active?'true':'false'):'')
   +`<div class="full"><label>حسابات المصروف التي يتكوّن منها التجمّع</label><div id="plac" style="max-height:170px;overflow:auto;border:1px solid #ccc;border-radius:6px;padding:6px">${ACCS().map(a=>`<label class="chk" style="display:block"><input type="checkbox" value="${esc(a.id)}"${x.accs.includes(a.id)?' checked':''}> ${esc(a.code+' · '+a.name)}</label>`).join('')||'<span class="mu">لا حسابات مصروف.</span>'}</div></div>`
   +`<div class="full" style="overflow-x:auto"><label>المنتجات المستهدفة</label><table id="tgl"><thead><tr><th>المنتج</th><th class="tg-pct">النسبة %</th><th></th></tr></thead><tbody>${x.targets.map(tgRow).join('')}</tbody></table><button type="button" class="b o s" onclick="$('#tgl tbody').insertAdjacentHTML('beforeend',window.tgRowH());syncBasisG()">+ منتج</button><div class="mu tg-hint"></div></div>`
   +fld('ملاحظات','note',x.note||'','ta','full'),
   ()=>{const o=rd(),accs=$$('#plac input:checked').map(c=>c.value),tg=$$('#tgl tbody tr').map(r=>({item:r.querySelector('.tg_i').value,pct:r.querySelector('.tg_p').value})).filter(t=>t.item);
    if(!o.name.trim()){toast('أدخل اسم التجمّع',1);return false}if(!accs.length){toast('اختر حساب مصروف واحدًا على الأقل',1);return false}
    return run('savePool',{...o,id:i||undefined,ver:x.ver,accs:accs,targets:tg},'تم حفظ التجمّع').then(r=>r!==false)});
  syncBasis()};
window.syncBasisG=syncBasis;
A.dpl=i=>{const x=POOLS().find(p=>p.id==i);if(x&&confirm('حذف التجمّع «'+x.name+'»؟'))run('delPool',{id:i},'تم الحذف')};

/* ================= تحميل المصروفات ================= */
const S={from:'',to:'',res:null,margin:30,busy:false};
const resHtml=(r,price)=>{
  const items=r.items||[];
  return `<div class="cards"><div class="card"><div class="mu">إجمالي المحمَّل على المنتجات</div><b>${f(r.total)}</b></div><div class="card"><div class="mu">غير موزَّع (لا إنتاج مطابق)</div><b>${f(r.unalloc)}</b></div><div class="card"><div class="mu">عدد المنتجات</div><b>${items.length}</b></div></div>`
   +`<div class="box"><h3>التجمّعات</h3>${tbl(['التجمّع','أساس التوزيع','المبلغ في الدفتر','المحمَّل %','المبلغ المحمَّل','وُزِّع','غير موزَّع'],(r.pools||[]).map(p=>[esc(p.name),esc(BASIS()[p.basis]||p.basis),f(p.gross),p.pct+'%',f(p.base),f(p.allocated),p.unalloc>0.004?`<b style="color:#b3261e">${f(p.unalloc)}</b>`:'—']))}</div>`
   +`<div class="box" style="overflow-x:auto"><h3>تكلفة المنتج النهائية</h3>${tbl(['المنتج','الكمية المنتجة','خامات','أجور','أعباء (معدلات)','مباشرة للوحدة','نصيب الوحدة من التجمّعات','تكلفة الوحدة النهائية'].concat(price?['سعر مقترح (هامش '+S.margin+'%)','سعر البيع الحالي']:[]).concat(['مبيع (كمية)','إيراد المبيعات','الهامش بالتكلفة الكاملة']),items.map(i=>[`<b>${esc(i.name)}</b>`,i.qty+' '+esc(i.unit),f(i.mat),f(i.lab),f(i.oh),f(i.directUnit),f(i.indirectUnit)+(i.alloc.length?'<br><small class="mu">'+i.alloc.map(a=>esc(a.name)+': '+f(a.amt)).join(' · ')+'</small>':''),`<b>${f(i.unitCost)}</b>`].concat(price?[f(S.margin<100?i.unitCost/(1-S.margin/100):0),i.price?f(i.price):'—']:[]).concat([i.soldQty||'—',i.soldQty?f(i.revenue):'—',i.soldQty?`<span style="color:${i.margin<0?'#b3261e':'var(--ok)'}">${f(i.margin)}</span>`:'—'])))}</div>`
   +note('تكلفة الوحدة النهائية = (خامات + أجور + أعباء بمعدلات مراكز العمل + نصيبها من التجمّعات) ÷ الكمية المنتجة. المنتجات المشمولة = ما أُنتج في أوامر تصنيع بدأت في الفترة. الإيراد من فواتير مبيعات مرحّلة لأصناف بعينها (الباقات تُباع كخدمة فلا تُنسب لمنتج). هذا تحليل تكاليف ولا يُرحَّل قيدًا ولا يغيّر قيمة المخزون.');
};
V.m_alloc=()=>{
  if(!MF().accs)return noLink('تحميل المصروفات');
  if(!S.from){const t=today();S.from=t.slice(0,8)+'01';S.to=t}
  const runs=RUNS();
  return head('تحميل المصروفات على المنتجات')
   +`<div class="box"><div class="db" id="alf">${fld('من تاريخ','from',S.from,'date')}${fld('إلى تاريخ','to',S.to,'date')}${fld('هامش الربح المستهدف %','margin',S.margin,'number')}</div><button class="b" data-a="alp">معاينة</button> ${isM()?'<button class="b g" data-a="alr">اعتماد التشغيل</button>':''}</div>`
   +`<div id="albody">${S.res?resHtml(S.res,true):note('اختر الفترة واضغط «معاينة» لحساب نصيب كل منتج من التجمّعات النشطة، ثم «اعتماد التشغيل» لحفظ النتيجة (تُستخدم تكلفتها غير المباشرة في تقدير طلبات المناسبات وقوائم المواد).')}</div>`
   +`<div class="box"><h3>التشغيلات السابقة</h3>${tbl(['الرقم','من','إلى','المحمَّل','غير موزَّع','الحالة','بواسطة',''],runs.map(r=>[esc(r.no),esc(r.from),esc(r.to),f(r.total),f(r.unalloc),bd(r.st),esc(r.byName),btn('alv',r.id,'عرض','o')+(isM()&&r.st==='معتمد'?btn('alx',r.id,'إلغاء','r'):'')]))}</div>`;
};
const readF=()=>{S.from=($('#alf [name=from]')||{}).value||S.from;S.to=($('#alf [name=to]')||{}).value||S.to;S.margin=Math.min(99,Math.max(0,+($('#alf [name=margin]')||{}).value||0))};
A.alp=async()=>{readF();try{S.res=await api('allocPreview',{from:S.from,to:S.to});render()}catch(e){toast(e.message,1)}};
A.alr=()=>{readF();mdl('اعتماد تشغيل التحميل',`<div class="full mu">سيُحفظ التشغيل للفترة ${esc(S.from)} → ${esc(S.to)} ولا يمكن تعديله (يُلغى ويُعاد). لا يمكن تداخل فترتين معتمدتين.</div>`+fld('ملاحظة','note','','ta','full'),()=>run('allocRun',{from:S.from,to:S.to,note:rd().note},'تم اعتماد التشغيل').then(r=>{if(r!==false){S.res=null}return r!==false}),'اعتماد')};
A.alv=i=>{const r=RUNS().find(x=>x.id==i);if(r)mdl('تشغيل '+r.no+' — '+r.from+' → '+r.to,`<div style="overflow-x:auto">${resHtml(r,false)}</div>`+(r.reason?`<div class="full mu">سبب الإلغاء: ${esc(r.reason)}</div>`:''),null)};
A.alx=i=>{const r=RUNS().find(x=>x.id==i);if(!r)return;mdl('إلغاء التشغيل '+r.no,fld('سبب الإلغاء (إلزامي)','reason','','ta','full'),()=>{const s=rd().reason.trim();if(!s){toast('اكتب السبب',1);return false}return run('allocCancel',{id:i,ver:r.ver,reason:s},'تم إلغاء التشغيل').then(z=>z!==false)},'تأكيد الإلغاء')};
})();
