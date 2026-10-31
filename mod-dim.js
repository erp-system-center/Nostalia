/* =====================================================================
   التحليل المحاسبي متعدد الأبعاد + مراكز التكلفة (مديول الحسابات)
   - c_dim: تجميع أسطر دفتر الأستاذ حسب أي ترتيب من الأبعاد (حساب رئيسي/حساب، فرع، مركز تكلفة، موظف ...)
   - c_cc : دليل مراكز التكلفة (شجري)
   ===================================================================== */
(()=>{
const AC=()=>D.acc;
const isM=()=>['admin','manager'].includes((AC()||{}).role);
NAVX.acc.push(['c_dim','التحليل متعدد الأبعاد'],['c_cc','مراكز التكلفة']);
const yStart=()=>today().slice(0,4)+'-01-01';
const ST={from:yStart(),to:today(),dims:['accgrp','acc','','','',''],mode:'ie',types:[],flt:{},depth:0,res:null,meta:null,busy:false};
const FLT_DIMS=['acctype','accgrp','acc','proj','cc','emp'];
const PRESETS=[
 ['المصروفات حسب مركز التكلفة',{dims:['cc','accgrp','acc','','',''],mode:'ie',types:['expense']}],
 ['الفرع ← الحساب',{dims:['proj','accgrp','acc','','',''],mode:'ie',types:['revenue','expense']}],
 ['الموظف ← الحساب',{dims:['emp','acc','','','',''],mode:'tb',types:[]}],
 ['كل الأبعاد (فرع + مركز + موظف + حساب)',{dims:['proj','cc','emp','acc'],mode:'ie',types:['revenue','expense']}]
];
const TYPES_AR={asset:'أصول',liability:'خصوم',equity:'حقوق الملكية',revenue:'إيرادات',expense:'مصروفات'};
async function meta(){if(!ST.meta)ST.meta=await api('dimMeta');return ST.meta}
const rr=()=>{if(view==='c_dim')$('#v').innerHTML=V.c_dim()};
const dimL=k=>((ST.meta&&ST.meta.dims.find(d=>d.k===k))||{}).l||k;
const nm=(k,n)=>k==='jt'&&window.JTN?window.JTN(n):n;

V.c_dim=()=>{
  if(!ST.meta&&!ST.loading){ST.loading=1;meta().then(()=>{ST.loading=0;rr()}).catch(e=>{ST.loading=0;toast(e.message,1)})}
  const M=ST.meta;
  if(!M)return '<div class="tb"><h2>التحليل المحاسبي متعدد الأبعاد</h2></div><div class="box mu">جارٍ التحميل...</div>';
  const dimOpt=(cur)=>'<option value="">—</option>'+M.dims.map(d=>`<option value="${d.k}"${d.k===cur?' selected':''}>${esc(d.l)}</option>`).join('');
  const fl=k=>{const L=M.lists[k]||[];return `<div><label>${esc(dimL(k))}</label><select data-fk="${k}"><option value="">الكل</option><option value="__none"${ST.flt[k]==='__none'?' selected':''}>— غير محدد —</option>${L.map(x=>`<option value="${esc(x.id)}"${ST.flt[k]===x.id?' selected':''}>${esc(x.name)}</option>`).join('')}</select></div>`};
  return `<div class="tb"><h2>التحليل المحاسبي متعدد الأبعاد</h2></div>
  <div class="box"><h3>نماذج جاهزة</h3><div style="display:flex;flex-wrap:wrap;gap:6px">${PRESETS.map((p,i)=>`<button class="b s o" data-a="dimPre" data-i="${i}">${esc(p[0])}</button>`).join('')}</div></div>
  <div class="box"><h3>إعداد التقرير</h3>
   <div class="db" id="dimf">
    <div><label>من تاريخ</label><input type="date" name="from" value="${ST.from}"></div><div><label>إلى تاريخ</label><input type="date" name="to" value="${ST.to}"></div>
    ${[0,1,2,3,4,5].map(i=>`<div><label>${i?'ثم حسب':'التجميع الأول حسب'}</label><select name="d${i}">${dimOpt(ST.dims[i])}</select></div>`).join('')}
    <div><label>المقاييس</label><select name="mode"><option value="ie"${ST.mode==='ie'?' selected':''}>إيرادات / مصروفات / صافي الربح</option><option value="tb"${ST.mode==='tb'?' selected':''}>حركة مدينة / دائنة / رصيد</option></select></div>
   </div>
   <div style="margin:6px 0"><span class="mu">أنواع الحسابات المشمولة (بدون تحديد = الكل):</span> ${Object.keys(TYPES_AR).map(t=>`<label class="chk"><input type="checkbox" data-ty value="${t}"${ST.types.includes(t)?' checked':''}> ${TYPES_AR[t]}</label>`).join('')}</div>
   <details${Object.values(ST.flt).some(Boolean)?' open':''}><summary>فلاتر على الأبعاد</summary><div class="db" id="dimfl" style="margin-top:6px">${FLT_DIMS.map(fl).join('')}</div></details>
   <p><button class="b g" data-a="dimRun"${ST.busy?' disabled':''}>عرض التقرير</button></p></div>
  ${ST.res?resHtml():''}`;
};
function readForm(){
  const g=n=>($('#dimf [name='+n+']')||{}).value;
  ST.from=g('from')||'';ST.to=g('to')||'';ST.mode=g('mode')||'ie';
  ST.dims=[0,1,2,3,4,5].map(i=>g('d'+i)||'');
  ST.types=$$('#v [data-ty]:checked').map(e=>e.value);
  ST.flt={};$$('#v [data-fk]').forEach(e=>{if(e.value)ST.flt[e.dataset.fk]=e.value});
}
A.dimPre=i=>{const p=PRESETS[+i][1];ST.dims=p.dims.slice();ST.mode=p.mode;ST.types=p.types.slice();ST.flt={};ST.depth=0;rr();A.dimRun()};
A.dimRun=async()=>{
  readForm();
  const dims=ST.dims.filter(Boolean);
  if(!dims.length){toast('اختر بُعدًا واحدًا على الأقل',1);return}
  if(new Set(dims).size!==dims.length){toast('لا تكرر نفس البعد',1);return}
  const filters={};Object.entries(ST.flt).forEach(([k,v])=>{filters[k]=[v==='__none'?'':v]});
  ST.busy=true;
  try{ST.res=await api('dimRep',{from:ST.from,to:ST.to,dims,filters,types:ST.types});ST.res.mode=ST.mode;ST.depth=0}
  catch(e){toast(e.message,1)}
  ST.busy=false;rr();
};
A.dimDepth=v=>{ST.depth=+v||0;const b=$('#dimres');if(b)b.outerHTML=resHtml()};
const cell=(v,b)=>{const t=f(v);return b?'<b>'+t+'</b>':t};
function resHtml(){
  const R=ST.res,n=R.dims.length,ie=R.mode==='ie';
  const depth=ST.depth||n;
  const head=R.dims.map(d=>esc(d.l)).concat(ie?['إيرادات','مصروفات','صافي الربح / (الخسارة)']:['مدين','دائن','الرصيد (مدين − دائن)']);
  const vals=g=>ie?[g.rev,g.exp,g.rev-g.exp]:[g.dr,g.cr,g.dr-g.cr];
  const sum=rows=>rows.reduce((s,g)=>{const v=vals(g);return [s[0]+v[0],s[1]+v[1],s[2]+v[2]]},[0,0,0]);
  const out=[];
  const walk=(rows,lvl,prefix)=>{
    // تجميع بحسب البعد lvl مع الحفاظ على ترتيب الظهور
    const order=[],map={};
    rows.forEach(g=>{const k=g.k[lvl];if(!map[k]){map[k]=[];order.push(k)}map[k].push(g)});
    order.forEach(k=>{
      const grp=map[k],name=nm(R.dims[lvl].k,grp[0].n[lvl]);
      const cells=new Array(n).fill('');cells[lvl]=(lvl?'<span style="display:inline-block;width:'+lvl*14+'px"></span>':'')+esc(name);
      const s=sum(grp);
      if(lvl===n-1||lvl+1>=depth){
        const leaf=lvl===n-1;
        out.push(cells.concat(s.map(x=>cell(x,!leaf))).map(c=>leaf?c:(typeof c==='string'&&c.startsWith('<b>')?c:'<b>'+c+'</b>')));
        return;
      }
      out.push(cells.map((c,i)=>i===lvl?'<b>'+c+'</b>':c).concat(s.map(x=>cell(x,true))));
      walk(grp,lvl+1);
    });
  };
  walk(R.rows,0);
  const t=ie?[R.total.rev,R.total.exp,R.total.rev-R.total.exp]:[R.total.dr,R.total.cr,R.total.dr-R.total.cr];
  out.push(['<b>الإجمالي</b>'].concat(new Array(n-1).fill(''),t.map(x=>cell(x,true))));
  const dsel=n>1?`<label>عمق العرض</label> <select onchange="A.dimDepth(this.value)">${R.dims.map((d,i)=>`<option value="${i+1}"${(ST.depth||n)===i+1?' selected':''}>${i+1===n?'كل التفاصيل':'حتى «'+esc(d.l)+'»'}</option>`).join('')}</select>`:'';
  return `<div class="box" id="dimres"><h3>النتيجة ${R.from||R.to?'— '+esc(R.from||'البداية')+' إلى '+esc(R.to||'اليوم'):''}</h3>
  <p class="mu">${R.lines} سطر قيد مرحّل · ${R.rows.length} مجموعة ${dsel?' · ':''}${dsel}</p>
  <div style="overflow-x:auto">${tbl(head,out)}</div>
  ${R.notes.length?'<ul class="mu">'+R.notes.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':''}
  <p class="mu">الأسطر غير المرتبطة ببُعد تظهر «— غير محدد —». الفلتر على بُعد يستبعد الأسطر الأخرى من نفس القيد، لذا قد لا يتوازن المدين والدائن مع الفلاتر. للتصدير استخدم زر «تصدير Excel» أعلى الصفحة.</p></div>`;
}

/* ---------- مراكز التكلفة ---------- */
const CC=()=>D.cc||[];
function ordered(){
  const all=CC(),out=[];
  const walk=(pid,d)=>all.filter(c=>(c.parent||'')===pid).sort((a,b)=>a.code<b.code?-1:1).forEach(c=>{out.push([c,d]);walk(c.id,d+1)});
  walk('',0);
  all.forEach(c=>{if(!out.some(o=>o[0]===c))out.push([c,0])});
  return out;
}
V.c_cc=()=>head('مراكز التكلفة',isM()?'ncc':'','+ مركز تكلفة')+`<div class="box"><p class="mu">مركز التكلفة يُحدَّد على سطر القيد اليدوي، وللفرع مركز افتراضي (الإدارة ← الفروع) تَرِثه القيود التلقائية. يُستخدم في «التحليل متعدد الأبعاد».</p>${tbl(['الكود','الاسم','الحالة','ملاحظات',''],ordered().map(([c,d])=>[`<b>${esc(c.code)}</b>`,'<span style="display:inline-block;width:'+d*16+'px"></span>'+esc(c.name),st(c.active?'نشط':'موقوف'),esc(c.note||''),isM()?btn('ncc',c.id,'تعديل','o')+(c.used?'':' '+btn('dcc',c.id,'حذف','r')):'']))}</div>`;
A.ncc=i=>{
  const x=i?CC().find(c=>c.id==i):{active:true};
  const all=ordered().map(o=>o[0]).filter(c=>c.id!=i&&(c.active||c.id==x.parent));
  mdl(i?'تعديل مركز تكلفة':'مركز تكلفة جديد',fld(x.used?'الكود (مقفل: عليه حركات)':'الكود (اتركه فارغًا للترقيم التلقائي CC-001)','code',x.code||'')+fld('الاسم','name',x.name||'','text','full')+sel('المركز الأب (اختياري)','parent',[['','— مركز رئيسي —']].concat(all.map(c=>[c.id,c.code+' · '+c.name])),x.parent||'','full')+fld('ملاحظات','note',x.note||'','ta','full')+(i?sel('الحالة','active',[['true','نشط'],['false','موقوف']],x.active?'true':'false'):''),
  ()=>run('saveCC',{...rd(),id:i||undefined,ver:x.ver},'تم حفظ مركز التكلفة'));
  if(i&&x.used)$('#m [name=code]').readOnly=true;
};
A.dcc=i=>{if(confirm('حذف مركز التكلفة؟'))run('delCC',{id:i},'تم الحذف')};
})();
