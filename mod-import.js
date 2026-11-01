/* =====================================================================
   مديول الاستيراد من Excel: قوالب محددة بقوائم منسدلة من بيانات النظام ← فحص بالمعاينة ← استيراد على دفعات ← تقرير بالمرفوض
   قارئ xlsx مدمج (بدون مكتبات): فك ZIP + DecompressionStream، ويقبل CSV أيضًا.
   كل صف يُحفظ في الخادم عبر نفس دوال الحفظ العادية (نفس التحققات والصلاحيات).
   ===================================================================== */
(()=>{
/* ---------- قراءة الملفات ---------- */
const dec=new TextDecoder('utf-8');
const unesc=s=>s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&#(\d+);/g,(m,n)=>String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi,(m,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&amp;/g,'&');
async function inflate(bytes){
  const ds=new DecompressionStream('deflate-raw');
  const w=ds.writable.getWriter();w.write(bytes);w.close();
  return new Uint8Array(await new Response(ds.readable).arrayBuffer());
}
async function unzip(buf){
  const b=new Uint8Array(buf),v=new DataView(b.buffer,b.byteOffset,b.byteLength);
  let e=-1;for(let i=b.length-22;i>=Math.max(0,b.length-70000);i--){if(v.getUint32(i,true)===0x06054b50){e=i;break}}
  if(e<0)throw new Error('الملف ليس xlsx صحيحًا');
  const n=v.getUint16(e+10,true);let p=v.getUint32(e+16,true);const out={};
  for(let i=0;i<n;i++){
    if(v.getUint32(p,true)!==0x02014b50)throw new Error('ملف xlsx تالف');
    const method=v.getUint16(p+10,true),csz=v.getUint32(p+20,true),nl=v.getUint16(p+28,true),el=v.getUint16(p+30,true),cl=v.getUint16(p+32,true),off=v.getUint32(p+42,true);
    const name=dec.decode(b.subarray(p+46,p+46+nl));
    p+=46+nl+el+cl;
    if(!/\.(xml|rels)$/i.test(name))continue;
    const ln=v.getUint16(off+26,true),le=v.getUint16(off+28,true),st=off+30+ln+le;
    const data=b.subarray(st,st+csz);
    out[name]=dec.decode(method===0?data:await inflate(data));
  }
  return out;
}
const colIdx=r=>{let n=0;for(const ch of r.replace(/[^A-Z]/gi,'').toUpperCase())n=n*26+ch.charCodeAt(0)-64;return n-1};
function sheetRows(xml,sst){
  const rows=[];
  const rre=/<row\b[^>]*?(?:\sr="(\d+)")?[^>]*?(?:\/>|>([\s\S]*?)<\/row>)/g;let m,auto=0;
  while((m=rre.exec(xml))){
    auto++;const rn=m[1]?+m[1]:auto;auto=rn;const cells=[];
    if(m[2]){
      const cre=/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;let c,ci=0;
      while((c=cre.exec(m[2]))){
        const at=c[1],ref=/\sr="([A-Z]+\d+)"/.exec(' '+at),t=/\st="(\w+)"/.exec(' '+at);
        const idx=ref?colIdx(ref[1]):ci;ci=idx+1;
        const body=c[2]||'';let val=null;
        const vv=/<v>([\s\S]*?)<\/v>/.exec(body);
        const ty=t?t[1]:'n';
        if(ty==='s'&&vv)val=sst[+vv[1]];
        else if(ty==='inlineStr'){val=[...body.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map(x=>unesc(x[1])).join('')}
        else if(ty==='str'||ty==='e')val=vv?unesc(vv[1]):null;
        else if(ty==='b')val=vv?(vv[1]==='1'?'نعم':'لا'):null;
        else if(vv&&vv[1]!==''){const x=Number(vv[1]);val=isFinite(x)?x:unesc(vv[1])}
        cells[idx]=val;
      }
    }
    rows[rn-1]=cells;
  }
  for(let i=0;i<rows.length;i++)if(!rows[i])rows[i]=[];
  return rows;
}
async function readXlsx(buf){
  const f=await unzip(buf);
  if(!f['xl/workbook.xml'])throw new Error('الملف ليس xlsx صحيحًا');
  const sst=[];
  if(f['xl/sharedStrings.xml'])for(const m of f['xl/sharedStrings.xml'].matchAll(/<si\b[^>]*?(?:\/>|>([\s\S]*?)<\/si>)/g))sst.push([...(m[1]||'').matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map(x=>unesc(x[1])).join(''));
  const rels={};
  for(const m of (f['xl/_rels/workbook.xml.rels']||'').matchAll(/<Relationship\b[^>]*>/g)){const id=/\sId="([^"]+)"/.exec(m[0]),tg=/\sTarget="([^"]+)"/.exec(m[0]);if(id&&tg)rels[id[1]]=tg[1].replace(/^\/?(xl\/)?/,'xl/')}
  const sheets=[];
  for(const m of f['xl/workbook.xml'].matchAll(/<sheet\b[^>]*>/g)){
    const nm=/\sname="([^"]*)"/.exec(m[0]),rid=/r:id="([^"]+)"/.exec(m[0]),hid=/state="(hidden|veryHidden)"/.test(m[0]);
    const path=rid&&rels[rid[1]];if(!nm||!path||!f[path])continue;
    sheets.push({name:unesc(nm[1]),hidden:hid,rows:sheetRows(f[path],sst)});
  }
  return sheets;
}
function parseCsv(text){
  text=text.replace(/^﻿/,'');
  const first=text.split('\n')[0]||'',sep=(first.match(/;/g)||[]).length>(first.match(/,/g)||[]).length?';':(first.includes('\t')?'\t':',');
  const rows=[];let row=[],cur='',q=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(q){if(c==='"'){if(text[i+1]==='"'){cur+='"';i++}else q=false}else cur+=c}
    else if(c==='"')q=true;
    else if(c===sep){row.push(cur);cur=''}
    else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cur);rows.push(row);row=[];cur=''}
    else cur+=c;
  }
  if(cur!==''||row.length){row.push(cur);rows.push(row)}
  return [{name:'CSV',hidden:false,rows:rows.map(r=>r.map(x=>x===''?null:x))}];
}
async function readFile(file){
  const buf=await file.arrayBuffer();
  if(/\.csv$|\.txt$/i.test(file.name))return {buf,sheets:parseCsv(dec.decode(buf))};
  return {buf,sheets:await readXlsx(buf)};
}
async function sha(buf,extra){
  const d=new Uint8Array(buf.byteLength+extra.length);d.set(new Uint8Array(buf));d.set(new TextEncoder().encode(extra),buf.byteLength);
  const h=new Uint8Array(await crypto.subtle.digest('SHA-256',d));
  return [...h].map(x=>x.toString(16).padStart(2,'0')).join('');
}

/* ---------- الجدول → وحدات استيراد ---------- */
const normH=s=>String(s==null?'':s).replace(/[*＊]/g,'').replace(/\s+/g,' ').trim();
const blankV=v=>v===null||v===undefined||(typeof v==='string'&&v.trim()==='');
function pickSheet(sheets){
  return sheets.find(s=>s.name==='البيانات')||sheets.find(s=>!s.hidden&&s.name!=='التعليمات'&&s.name!=='Lists')||sheets[0];
}
// الحركات: تكرار الصفوف طبيعي فلا يُرفض (حتى لو لم يُرسل الخادم علامة txn)
const TXN_={};
function toUnits(ent,sheet,max){
  const rows=sheet.rows;
  let hr=-1;
  for(let i=0;i<Math.min(rows.length,10);i++){if((rows[i]||[]).some(x=>!blankV(x))){hr=i;break}}
  if(hr<0)throw new Error('الملف فارغ');
  const hmap={};(rows[hr]||[]).forEach((h,i)=>{if(!blankV(h))hmap[normH(h)]=i});
  const idx={};const missing=[];
  ent.cols.forEach(c=>{const i=hmap[normH(c.l)];if(i===undefined){if(c.req)missing.push(c.l)}else idx[c.k]=i});
  if(missing.length)throw new Error('أعمدة مطلوبة غير موجودة في الملف: '+missing.join('، ')+' — استخدم القالب المُنزَّل من هذه الشاشة ولا تغيّر عناوين الأعمدة');
  const known=new Set(ent.cols.map(c=>normH(c.l)));
  const unknown=Object.keys(hmap).filter(h=>!known.has(h)&&h!=='سبب الرفض');
  const items=[];
  for(let r=hr+1;r<rows.length;r++){
    const row=rows[r]||[];if(!row.some(x=>!blankV(x)))continue;
    const o={_r:r+1};ent.cols.forEach(c=>{if(idx[c.k]!==undefined){const v=row[idx[c.k]];o[c.k]=blankV(v)?'':v}});
    items.push(o);
  }
  if(!items.length)throw new Error('لا توجد صفوف بيانات بعد صف العناوين');
  if(items.length>max)throw new Error('عدد الصفوف ('+items.length+') أكبر من الحد المسموح ('+max+') — قسّم الملف');
  const units=[];
  if(ent.group){
    const gi={};
    items.forEach(o=>{
      const key=(ent.gcols||[]).map(k=>String(o[k]==null?'':o[k]).trim()).join('|');
      const blank=(ent.gcols||[]).some(k=>blankV(o[k]));
      if(blank||gi[key]===undefined){units.push({rows:[o]});if(!blank)gi[key]=units.length-1}
      else units[gi[key]].rows.push(o);
    });
  }else if(ent.txn||TXN_[ent.key]){
    // الحركات: تكرار الصفوف طبيعي فلا يُرفض داخل الملف
    items.forEach(o=>units.push({rows:[o]}));
  }else{
    const seen={};
    items.forEach(o=>{
      const sig=JSON.stringify(ent.cols.map(c=>o[c.k]));
      if(seen[sig]!==undefined)units.push({rows:[o],pre:'صف مكرر داخل الملف (مطابق للصف '+seen[sig]+')'});
      else{seen[sig]=o._r;units.push({rows:[o]})}
    });
  }
  return {units,items,header:rows[hr],hr:hr+1,unknown};
}

/* ---------- بناء القالب ---------- */
const TYL={text:'نص',num:'رقم',int:'عدد صحيح',date:'تاريخ (يوم/شهر/سنة)',phone:'هاتف',enum:'اختيار من القائمة',ref:'اختيار من القائمة',yn:'نعم / لا'};
function buildTemplate(ent,lists){
  const N=5001;
  const lk=[...new Set(ent.cols.filter(c=>c.list).map(c=>c.list))];
  const col=i=>{let s='';i++;while(i>0){const m=(i-1)%26;s=String.fromCharCode(65+m)+s;i=Math.floor((i-1)/26)}return s};
  const lcol={};lk.forEach((k,i)=>lcol[k]=col(i));
  const hdr=ent.cols.map(c=>({v:c.l+(c.req?' *':''),s:c.req?7:1}));
  const dv=[];
  ent.cols.forEach((c,i)=>{
    const L=col(i),sq=`${L}2:${L}${N}`;
    if(c.list){const n=Math.max(2,(lists[c.list]||[]).length+1);dv.push({sqref:sq,type:'list',f1:`Lists!$${lcol[c.list]}$2:$${lcol[c.list]}$${n}`,warn:!!c.free,err:c.free?'القيمة ليست في القائمة (مسموح بمجموعة جديدة)':'اختر من القائمة المنسدلة فقط',prompt:c.hint||'',promptT:c.l})}
    else if(c.t==='yn')dv.push({sqref:sq,type:'list',f1:'"نعم,لا"',err:'اختر نعم أو لا',prompt:c.hint||'',promptT:c.l});
    else if(c.t==='num')dv.push({sqref:sq,type:'decimal',op:'greaterThanOrEqual',f1:'0',err:'أدخل رقمًا (0 أو أكبر)',prompt:c.hint||'',promptT:c.l});
    else if(c.t==='int')dv.push({sqref:sq,type:'whole',op:'greaterThanOrEqual',f1:'0',err:'أدخل عددًا صحيحًا',prompt:c.hint||'',promptT:c.l});
    else if(c.t==='date')dv.push({sqref:sq,type:'date',op:'greaterThan',f1:'36526',err:'أدخل تاريخًا صحيحًا (مثال 2026-10-14)',prompt:(c.hint?c.hint+' — ':'')+'يوم/شهر/سنة',promptT:c.l});
    else if(c.hint)dv.push({sqref:sq,type:'custom',f1:'TRUE',prompt:c.hint,promptT:c.l,err:''});
  });
  const data={name:'البيانات',rows:[hdr],headerRow:1,dv,widths:ent.cols.map(c=>Math.max(14,Math.min(34,c.l.length*1.6+4))),colStyle:ent.cols.map(c=>c.t==='date'?8:(c.t==='text'||c.t==='phone'||c.t==='enum'||c.t==='ref'?6:0))};
  const ins=[[{v:'تعليمات استيراد: '+ent.label,t:true}],[],
    ['1) املأ البيانات في ورقة «البيانات» ابتداءً من الصف الثاني. لا تغيّر عناوين الأعمدة ولا ترتيبها.'],
    ['2) الأعمدة ذات العنوان البرتقالي (*) مطلوبة. الأعمدة المنسدلة تقبل قيم النظام فقط (انسخ/اختر من القائمة).'],
    ['3) القوائم مأخوذة من بيانات النظام وقت تنزيل هذا القالب؛ لو أضفت صنفًا/حسابًا/فرعًا جديدًا نزّل القالب مرة أخرى.'],
    ['4) التواريخ: يوم/شهر/سنة أو سنة-شهر-يوم. المبالغ أرقام بدون رموز عملة.'],
    ent.note?[{v:'ملاحظة: '+ent.note,b:true}]:[],[],
    [{v:'العمود',h:true},{v:'مطلوب؟',h:true},{v:'النوع',h:true},{v:'ملاحظات / القيم المسموحة',h:true}]]
    .concat(ent.cols.map(c=>[{v:c.l,b:true},c.req?'نعم':'لا',TYL[c.t]||'',(c.hint?c.hint+' — ':'')+(c.t==='enum'?(lists[c.list]||[]).join(' / '):(c.t==='ref'?'من قائمة '+c.l+' في ورقة Lists':'')) ]));
  const ml=Math.max(1,...lk.map(k=>(lists[k]||[]).length));
  const lrows=[lk.map(k=>({v:k,b:true}))];
  for(let i=0;i<ml;i++)lrows.push(lk.map(k=>(lists[k]||[])[i]));
  return XL.build([data,{name:'التعليمات',rows:ins,widths:[30,10,22,90]},{name:'Lists',rows:lrows,hidden:true,widths:lk.map(()=>38)}]);
}

/* ---------- الحالة والواجهة ---------- */
const ST={meta:null,ent:'',file:null,parsed:null,checks:null,run:null,busy:false,prog:'',opts:{},force:false};
const ent=()=>(ST.meta&&ST.meta.ents&&ST.meta.ents.find(e=>e.key===ST.ent))||null;
const hasEnts=()=>D.imp&&D.imp.ents&&D.imp.ents.length;
MODS.imp={title:'الاستيراد',has:()=>D.user.mods.imp&&hasEnts(),nav:()=>[['i_imp','استيراد من Excel'],['i_log','سجل الاستيراد']]};
const ENT_ORDER=['je','sinvHist','pinvHist','accounts','opn','items','customers','suppliers','employees'];
const ENT_LBL={sinvHist:'فواتير مبيعات سنوات سابقة',pinvHist:'فواتير موردين سنوات سابقة',je:'قيود اليومية',accounts:'دليل الحسابات',opn:'أرصدة المخزون الافتتاحية',items:'أصناف المخزون (منتجات وخامات)',customers:'العملاء',suppliers:'الموردون',employees:'الموظفون'};
async function ensureMeta(){if(!ST.meta||ST.meta._t<Date.now()-60000){const j=await api('impMeta');ST.meta=j;ST.meta._t=Date.now()}return ST.meta}
const rerender=()=>{if(view==='i_imp'||view==='i_log')$('#v').innerHTML=V[view]()};

V.i_imp=()=>{
  const ks=(D.imp.ents||[]).slice().sort((a,b)=>ENT_ORDER.indexOf(a)-ENT_ORDER.indexOf(b));
  if(!ST.ent||!ks.includes(ST.ent))ST.ent=ks[0]||'';
  if(!ST.meta&&!ST.loading){ST.loading=1;ensureMeta().then(()=>{ST.loading=0;rerender()}).catch(e=>{ST.loading=0;toast(e.message,1)})}
  const e=ent();
  let h=`<div class="tb"><h2>استيراد البيانات من Excel</h2></div>
  <div class="box"><h3>1) اختر نوع البيانات</h3><div style="display:flex;flex-wrap:wrap;gap:8px">${ks.map(k=>`<button class="b s ${k===ST.ent?'g':'o'}" data-a="impPick" data-i="${k}"${ST.busy?' disabled':''}>${esc(ENT_LBL[k]||k)}</button>`).join('')}</div></div>`;
  if(!e)return h+'<div class="box mu">جارٍ تحميل القوالب...</div>';
  h+=`<div class="box"><h3>2) نزّل القالب واملأه</h3>
    <p class="mu">${esc(e.note||'')}</p>
    <p class="mu">القالب فيه قوائم منسدلة من بيانات النظام الحالية (${e.cols.filter(c=>c.list).map(c=>esc(c.l)).join('، ')||'لا قوائم'}) وتعليمات وتنبيهات للأخطاء. نزّله من جديد كل مرة لتحصل على أحدث الأكواد.</p>
    <table><thead><tr><th>العمود</th><th>مطلوب</th><th>النوع</th><th>ملاحظات</th></tr></thead><tbody>${e.cols.map(c=>`<tr><td>${esc(c.l)}</td><td>${c.req?'✔':''}</td><td>${esc(TYL[c.t]||'')}</td><td class="mu">${esc(c.hint||'')}</td></tr>`).join('')}</tbody></table>
    <p><button class="b g" data-a="impTpl"${ST.busy?' disabled':''}>⬇ تنزيل قالب «${esc(e.label)}»</button></p></div>
  <div class="box"><h3>3) ارفع الملف المملوء</h3>
    ${e.opts.map(o=>`<label style="display:block;margin:4px 0"><input type="checkbox" ${ST.opts[o.k]?'checked ':''}onchange="A.impOpt('${o.k}',this.checked)"> ${esc(o.l)}</label>`).join('')}
    <p><input type="file" accept=".xlsx,.csv" onchange="A.impFile(this)"${ST.busy?' disabled':''}></p>
    <div id="impProg" class="mu">${esc(ST.prog)}</div></div>`;
  if(ST.parsed&&ST.checks)h+=previewHtml();
  if(ST.run)h+=resultHtml();
  return h;
};
function sumChecks(){
  const ok=ST.checks.filter(c=>c.ok),bad=ST.checks.filter(c=>!c.ok);
  const rc=a=>a.reduce((s,c)=>s+c.rows.length,0);
  return {ok,bad,okR:rc(ok),badR:rc(bad)};
}
function previewHtml(){
  const s=sumChecks();
  const rowsTxt=c=>c.rows.length>1?c.rows[0]._r+'–'+c.rows[c.rows.length-1]._r+' ('+c.rows.length+' أسطر)':c.rows[0]._r;
  const list=s.bad.concat(s.ok).slice(0,300);
  return `<div class="box"><h3>4) نتيجة الفحص — ${esc(ST.file.name)}</h3>
   <p><b style="color:var(--ok)">${s.ok.length} ${ent().group?'سجل':'صف'} سليم</b> ${s.bad.length?` · <b style="color:#b3261e">${s.bad.length} مرفوض</b>`:''} <span class="mu">(الفحص هنا للصيغة والقوائم والتوازن والتكرار؛ بعض القواعد التجارية تظهر وقت الحفظ)</span></p>
   ${ST.parsed.unknown.length?`<p class="mu">أعمدة غير معروفة تم تجاهلها: ${esc(ST.parsed.unknown.join('، '))}</p>`:''}
   <div style="max-height:360px;overflow:auto">${tbl(['الصف','الحالة','التفاصيل'],list.map(c=>[rowsTxt(c),c.ok?'<span style="color:var(--ok)">سليم</span>':'<span style="color:#b3261e">مرفوض</span>',esc(c.msg)]))}</div>
   ${s.ok.length+s.bad.length>300?'<p class="mu">يعرض أول 300 (المرفوضة أولًا).</p>':''}
   <p><label><input type="checkbox" ${ST.force?'checked ':''}onchange="A.impForce(this.checked)"> إعادة استيراد ملف سبق استيراده</label></p>
   <p>${s.ok.length?`<button class="b g" data-a="impGo"${ST.busy?' disabled':''}>استيراد ${s.ok.length} ${ent().group?'سجل':'صف'} سليم</button> `:'<span class="mu">لا توجد صفوف سليمة للاستيراد.</span> '}${s.bad.length?`<button class="b o" data-a="impErrFile">⬇ تنزيل الصفوف المرفوضة مع الأسباب</button>`:''}</p></div>`;
}
function resultHtml(){
  const r=ST.run,ok=r.res.filter(x=>x.ok),bad=r.res.filter(x=>!x.ok);
  return `<div class="box"><h3>5) نتيجة الاستيراد</h3>
   ${r.cut?`<p style="color:#b3261e"><b>انقطع الاتصال أثناء الحفظ:</b> ${esc(r.cut)}. الصفوف غير المؤكدة قد تكون حُفظت؛ أعد رفع نفس الملف وسيُظهر الفحص ما حُفظ فعلًا كمكرر.</p>`:''}<p><b style="color:var(--ok)">تم حفظ ${ok.length}</b>${bad.length?` · <b style="color:#b3261e">رُفض ${bad.length}</b>`:''}</p>
   <div style="max-height:360px;overflow:auto">${tbl(['الصف','الحالة','الرقم / التفاصيل'],r.res.slice().sort((a,b)=>a.ok-b.ok).slice(0,300).map(x=>[x.r.length>1?x.r[0]+'–'+x.r[x.r.length-1]:x.r[0],x.ok?'<span style="color:var(--ok)">تم</span>':'<span style="color:#b3261e">مرفوض</span>',esc((x.ref?x.ref+' — ':'')+x.msg)]))}</div>
   ${bad.length?`<p><button class="b o" data-a="impErrFile2">⬇ تنزيل المرفوض (للتصحيح وإعادة الرفع)</button></p>`:''}</div>`;
}

A.impPick=k=>{if(ST.busy)return;ST.ent=k;ST.file=null;ST.parsed=null;ST.checks=null;ST.run=null;ST.opts={};ST.prog='';ST.force=false;rerender()};
A.impOpt=(k,v)=>{ST.opts[k]=v};
A.impForce=v=>{ST.force=v};
A.impTpl=async()=>{
  try{const m=await ensureMeta();const e=ent();XL.download('قالب استيراد - '+e.label,buildTemplate(e,m.lists));toast('تم تنزيل القالب')}catch(x){toast(x.message,1)}
};
const chunks=(a,n)=>{const o=[];for(let i=0;i<a.length;i+=n)o.push(a.slice(i,i+n));return o};
const setProg=t=>{ST.prog=t;const p=$('#impProg');if(p)p.textContent=t};
A.impFile=async inp=>{
  const f=inp.files&&inp.files[0];if(!f)return;
  ST.busy=true;ST.parsed=null;ST.checks=null;ST.run=null;ST.file=f;
  const H=ldrHold('جارٍ قراءة الملف وفحصه');
  try{
    setProg('جارٍ قراءة الملف...');
    const m=await ensureMeta(),e=ent();
    if(f.size>8*1024*1024)throw new Error('الملف كبير (الحد 8 ميجا)');
    const {buf,sheets}=await readFile(f);
    const sh=pickSheet(sheets);if(!sh)throw new Error('لا توجد ورقة بيانات في الملف');
    const p=toUnits(e,sh,m.max);p.hash=await sha(buf,'|'+e.key);p.buf=buf;ST.parsed=p;
    const checks=[];
    const pre=p.units.filter(u=>u.pre),todo=p.units.filter(u=>!u.pre);
    pre.forEach(u=>checks.push({rows:u.rows,ok:false,msg:u.pre}));
    let done=0;
    for(const ch of chunks(todo,40)){
      setProg('جارٍ فحص الصفوف... '+done+' / '+todo.length);H.set(done,todo.length,'جارٍ فحص الصفوف');
      const j=await api('impCheck',{ent:e.key,units:ch.map(u=>({rows:u.rows})),opts:ST.opts});
      j.results.forEach((r,i)=>checks.push({rows:ch[i].rows,ok:r.ok,msg:r.msg}));
      done+=ch.length;
    }
    H.set(todo.length,todo.length,'جارٍ فحص الصفوف');
    checks.sort((a,b)=>a.rows[0]._r-b.rows[0]._r);
    ST.checks=checks;setProg('');
  }catch(x){toast(x.message,1);setProg('');ST.file=null;ST.parsed=null;ST.checks=null;inp.value=''}
  H.end();ST.busy=false;rerender();
};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// إعادة المحاولة بنفس معرّف الطلب (rid): لو نُفِّذ الطلب فعلًا ثم انقطع الرد يُرجِع الخادم نفس النتيجة ولا يُكرِّر الحفظ
async function callRetry(a,d){
  const rid=newRid();let err;
  for(let i=0;i<4;i++){
    try{return await api(a,d,rid)}
    catch(x){err=x;if(!/تعذر الاتصال|مشغول|timeout|Lock/i.test(x.message))throw x;await sleep(2000*(i+1))}
  }
  throw err;
}
A.impGo=async()=>{
  if(ST.busy||!ST.checks)return;
  const e=ent(),s=sumChecks();
  if(!s.ok.length)return;
  if(!confirm('سيتم حفظ '+s.ok.length+' '+(e.group?'سجل':'صف')+' في النظام'+(s.bad.length?' (وتخطي '+s.bad.length+' مرفوض)':'')+'. متابعة؟'))return;
  ST.busy=true;ST.run=null;rerender();
  const H=ldrHold('جارٍ حفظ الاستيراد'),lbl=e.group?'سجل':'صف';
  const res=[];let logId='',cut='';
  const units=s.ok.map(c=>({rows:c.rows}));
  try{
    const b=await api('impBegin',{ent:e.key,hash:ST.parsed.hash,file:ST.file.name,total:s.okR,force:ST.force});logId=b.id;
    let done=0;
    for(const ch of chunks(units,10)){
      setProg('جارٍ الحفظ... '+done+' / '+units.length);H.set(done,units.length,'جارٍ حفظ الاستيراد ('+lbl+')');
      let j;
      try{j=await callRetry('impRun',{ent:e.key,units:ch,opts:ST.opts})}
      catch(x){cut=x.message;break}
      j.results.forEach((r,i)=>res.push(Object.assign({rows:ch[i].rows},r)));
      done+=ch.length;H.set(done,units.length);
    }
    // وحدات لم يصل ردّها: قد تكون حُفظت فعلًا في الخادم، فنُظهرها صراحةً بدل إخفائها من النتيجة
    for(let i=res.length;i<units.length;i++)res.push({rows:units[i].rows,ok:false,r:units[i].rows.map(z=>z._r),msg:'غير مؤكد: انقطع الاتصال قبل وصول الرد (قد يكون حُفظ). أعد رفع نفس الملف: الفحص سيُظهر المحفوظ فعلًا كـ«مكرر» والباقي سليمًا',unsure:true});
  }catch(x){toast(x.message,1)}
  if(logId){try{await api('impEnd',{id:logId,ok:res.filter(r=>r.ok).reduce((a,r)=>a+r.rows.length,0),fail:res.filter(r=>!r.ok).reduce((a,r)=>a+r.rows.length,0)})}catch(x){}}
  ST.run={res,cut};ST.busy=false;setProg('');
  H.set(units.length,units.length,'جارٍ تحديث البيانات');
  try{await load(1)}catch(x){}
  H.end();
  rerender();
  if(cut)toast('انقطع الاتصال أثناء الحفظ — راجع النتيجة ثم أعد رفع الملف لإكمال الباقي',1);
  else if(res.length)toast('انتهى الاستيراد: '+res.filter(r=>r.ok).length+' تم، '+res.filter(r=>!r.ok).length+' مرفوض');
};
function errFile(list){
  const e=ent(),p=ST.parsed;
  const byRow={};p.items.forEach(o=>byRow[o._r]=o);
  const rows=[e.cols.map(c=>({v:c.l+(c.req?' *':''),s:c.req?7:1})).concat([{v:'سبب الرفض',s:1}])];
  list.forEach(c=>c.rows.forEach(r=>{const o=byRow[r._r]||r;rows.push(e.cols.map(k=>blankV(o[k.k])?null:o[k.k]).concat([c.msg]))}));
  XL.download('مرفوض - '+e.label,XL.build([{name:'البيانات',rows,headerRow:1,widths:e.cols.map(()=>20).concat([60]),colStyle:e.cols.map(c=>c.t==='date'?8:(c.t==='text'||c.t==='phone'||c.t==='enum'||c.t==='ref'?6:0))}]));
}
A.impErrFile=()=>{if(ST.checks)errFile(ST.checks.filter(c=>!c.ok))};
A.impErrFile2=()=>{if(ST.run)errFile(ST.run.res.filter(r=>!r.ok).map(r=>({rows:r.rows,msg:r.msg})))};

/* ---------- سجل الاستيراد ---------- */
let LOG=null;
V.i_log=()=>{
  if(LOG===null){LOG=[];api('impLog').then(j=>{LOG=j.rows;rerender()}).catch(e=>toast(e.message,1))}
  return `<div class="tb"><h2>سجل الاستيراد</h2><button class="b s o" data-a="impLogRef">تحديث</button></div><div class="box">${tbl(['التاريخ','المستخدم','النوع','الملف','الصفوف','تم','مرفوض','الحالة'],LOG.map(x=>[esc(String(x.at).slice(0,16).replace('T',' ')),esc(x.byName),esc(x.label),esc(x.file),x.total,x.ok,x.fail,st(x.st)]))}</div>`;
};
A.impLogRef=()=>{LOG=null;rerender()};
window.IMPX={readXlsx,parseCsv,toUnits,buildTemplate,pickSheet};
})();
