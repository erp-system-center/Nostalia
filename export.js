/* =====================================================================
   التصدير إلى Excel (.xlsx حقيقي) بدون أي مكتبات خارجية:
   - مولّد xlsx (ZIP بدون ضغط) مع اتجاه يمين لليسار وتجميد الرأس وفلتر وأعمدة بعرض مناسب
   - تصدير أي شاشة (كل الجداول والبطاقات الظاهرة، مع احترام البحث/الفلتر)
   - تصدير أي مستند طباعة (أمر توريد/فاتورة، إذن استلام/صرف، تحويل، قيد، سند)
   - تصدير كل بيانات النظام (مدير النظام)
   ===================================================================== */
(()=>{
/* ---------- ZIP + XLSX ---------- */
const CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
const crc32=b=>{let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=CRC[(c^b[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0};
const cat=a=>{let n=0;a.forEach(x=>n+=x.length);const o=new Uint8Array(n);let p=0;a.forEach(x=>{o.set(x,p);p+=x.length});return o};
function zip(files){
  const enc=new TextEncoder(),parts=[],cd=[];let off=0;
  files.forEach(f=>{
    const nb=enc.encode(f.name),d=enc.encode(f.text),c=crc32(d),sz=d.length;
    const lh=new Uint8Array(30+nb.length),v=new DataView(lh.buffer);
    v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x0800,true);v.setUint16(8,0,true);v.setUint16(10,0,true);v.setUint16(12,0x21,true);
    v.setUint32(14,c,true);v.setUint32(18,sz,true);v.setUint32(22,sz,true);v.setUint16(26,nb.length,true);lh.set(nb,30);
    parts.push(lh,d);
    const ch=new Uint8Array(46+nb.length),w=new DataView(ch.buffer);
    w.setUint32(0,0x02014b50,true);w.setUint16(4,20,true);w.setUint16(6,20,true);w.setUint16(8,0x0800,true);w.setUint16(12,0,true);w.setUint16(14,0x21,true);
    w.setUint32(16,c,true);w.setUint32(20,sz,true);w.setUint32(24,sz,true);w.setUint16(28,nb.length,true);w.setUint32(42,off,true);ch.set(nb,46);
    cd.push(ch);off+=lh.length+sz;
  });
  const cdb=cat(cd),end=new Uint8Array(22),e=new DataView(end.buffer);
  e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cdb.length,true);e.setUint32(16,off,true);
  return cat([...parts,cdb,end]);
}
const X=s=>String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const colL=i=>{let s='';i++;while(i>0){const m=(i-1)%26;s=String.fromCharCode(65+m)+s;i=Math.floor((i-1)/26)}return s};
// أنماط الخلايا: 0 عادي، 1 رأس الجدول، 2 رقم بخانتين، 3 غامق، 4 رقم غامق بخانتين، 5 عنوان
const STYLES=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="yyyy\-mm\-dd"/></numFmts><fonts count="4"><font><sz val="11"/><name val="Arial"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Arial"/></font><font><b/><sz val="11"/><name val="Arial"/></font><font><b/><sz val="14"/><name val="Arial"/></font></fonts><fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1B6B4A"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFC2570C"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="9"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="4" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="4" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1" applyNumberFormat="1"/><xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="49" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="0" fontId="1" fillId="3" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;

// خلية: نص | رقم | {v, m:true للمبلغ، b:true للغامق، h:true للرأس، t:true للعنوان}
function cellXml(c,r,ci){
  const ref=colL(ci)+r;
  let o=c;if(o===null||o===undefined||o==='')return'';
  if(typeof o!=='object')o={v:o};
  let s=0;
  if(o.s!==undefined)s=o.s;else if(o.t)s=5;else if(o.h)s=1;else if(typeof o.v==='number')s=o.m?(o.b?4:2):(o.b?3:0);else s=o.b?3:0;
  if(typeof o.v==='number'&&isFinite(o.v))return`<c r="${ref}"${s?` s="${s}"`:''}><v>${o.v}</v></c>`;
  return`<c r="${ref}"${s?` s="${s}"`:''} t="inlineStr"><is><t xml:space="preserve">${X(o.v)}</t></is></c>`;
}
function dvXml(dv){
  if(!dv||!dv.length)return'';
  return`<dataValidations count="${dv.length}">${dv.map(d=>`<dataValidation type="${d.type}"${d.op?` operator="${d.op}"`:''} allowBlank="1" showInputMessage="1" showErrorMessage="1" errorStyle="${d.warn?'warning':'stop'}"${d.err?` errorTitle="${X((d.errT||'قيمة غير صحيحة').slice(0,32))}" error="${X(d.err.slice(0,255))}"`:''}${d.prompt?` promptTitle="${X((d.promptT||'').slice(0,32))}" prompt="${X(d.prompt.slice(0,255))}"`:''} sqref="${d.sqref}"><formula1>${X(d.f1)}</formula1>${d.f2!==undefined?`<formula2>${X(d.f2)}</formula2>`:''}</dataValidation>`).join('')}</dataValidations>`;
}
function sheetXml(sh){
  const rows=sh.rows,hr=sh.headerRow||0; // headerRow: رقم صف الرأس (1-based) لتجميده وتفعيل الفلتر
  let maxC=0;rows.forEach(r=>{if(r.length>maxC)maxC=r.length});
  const w=[];for(let c=0;c<maxC;c++){if(sh.widths&&sh.widths[c]){w.push(sh.widths[c]);continue}let m=0;rows.forEach((r,i)=>{const x=r[c];if(x===undefined||x===null)return;const t=String(typeof x==='object'?x.v:x);const isTitle=x&&x.t;if(isTitle)return;m=Math.max(m,t.length)});w.push(Math.min(60,Math.max(9,Math.round(m*1.25)+2)))}
  const data=rows.map((r,i)=>`<row r="${i+1}">${r.map((c,ci)=>cellXml(c,i+1,ci)).join('')}</row>`).join('');
  const pane=hr?`<pane ySplit="${hr}" topLeftCell="A${hr+1}" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A${hr+1}" sqref="A${hr+1}"/>`:'';
  const af=hr&&maxC&&rows.length>hr?`<autoFilter ref="A${hr}:${colL(maxC-1)}${rows.length}"/>`:'';
  return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView rightToLeft="1" workbookViewId="0">${pane}</sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/><cols>${w.map((x,i)=>`<col min="${i+1}" max="${i+1}" width="${x}" customWidth="1"${sh.colStyle&&sh.colStyle[i]?` style="${sh.colStyle[i]}"`:''}/>`).join('')}</cols><sheetData>${data}</sheetData>${af}${dvXml(sh.dv)}</worksheet>`;
}
function safeName(n,used){
  let s=String(n||'ورقة').replace(/[\[\]:*?\/\\]/g,' ').replace(/\s+/g,' ').trim().slice(0,31)||'ورقة';
  let k=s,i=2;while(used.includes(k.toLowerCase())){const suf=' '+i++;k=s.slice(0,31-suf.length)+suf}
  used.push(k.toLowerCase());return k;
}
function buildXlsx(sheets){
  const used=[],names=sheets.map(s=>safeName(s.name,used));
  const files=[
    {name:'[Content_Types].xml',text:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((s,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`},
    {name:'_rels/.rels',text:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`},
    {name:'xl/workbook.xml',text:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets>${names.map((n,i)=>`<sheet name="${X(n)}" sheetId="${i+1}"${sheets[i].hidden?' state="hidden"':''} r:id="rId${i+1}"/>`).join('')}</sheets></workbook>`},
    {name:'xl/_rels/workbook.xml.rels',text:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((s,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`},
    {name:'xl/styles.xml',text:STYLES}
  ].concat(sheets.map((s,i)=>({name:`xl/worksheets/sheet${i+1}.xml`,text:sheetXml(s)})));
  return zip(files);
}
function download(name,bytes){
  const b=new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name.replace(/[\\\/:*?"<>|]+/g,' ').trim()+'.xlsx';
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
}
window.XL={build:buildXlsx,download:download};

/* ---------- تحويل نص معروض إلى خلية ---------- */
const BLANK=/^[—–-]$/;
const NUM=/^-?\d[\d,]*(\.\d+)?$/;
const NOTNUM=/هاتف|الهاتف|كود|الكود|رقم|الرقم|تاريخ|التاريخ|الرقم الضريبي/;
const txt=el=>{const c=el.cloneNode(true);c.querySelectorAll('br').forEach(b=>b.replaceWith(' — '));c.querySelectorAll('button,script,style,datalist').forEach(b=>b.remove());return c.textContent.replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim()};
const toNum=s=>+String(s).replace(/,/g,'');
function typeCols(head,body){
  // body: مصفوفة صفوف نصية. تُعتبر العمود رقميًا إن كانت كل خلاياه الممتلئة أرقامًا وعنوانه ليس كودًا/تاريخًا/هاتفًا
  return head.map((h,c)=>{
    const vals=body.map(r=>r.t[c]).filter(v=>v!==''&&!BLANK.test(v));
    if(!vals.length||NOTNUM.test(h))return null;
    if(!vals.every(v=>NUM.test(v)&&!/^0\d/.test(v)))return null;
    return vals.every(v=>/\.\d{2}$/.test(v))?'m':'n';
  });
}
function tableSheet(t,title,meta){
  const ths=[...t.querySelectorAll('thead th')];
  const keep=[];ths.forEach((th,i)=>{const h=txt(th);if(h&&h!=='إجراءات')keep.push(i)});
  const head=keep.map(i=>txt(ths[i]));
  const trs=[...t.querySelectorAll('tbody tr')].filter(r=>!r.hidden&&r.children.length===ths.length);
  let sn=0;const kb=keep.find(i=>!ths[i].classList.contains('sq'));
  const body=trs.map(r=>{const sq=r.querySelector('td.sq');if(sq)sn++;return{t:keep.map(i=>ths[i].classList.contains('sq')?(sq?String(sn):''):txt(r.children[i])),b:(()=>{const c=r.children[kb],b=c&&c.querySelector('b');return !!(b&&txt(b)===txt(c))})()}});
  const ty=typeCols(head,body);
  const rows=[];
  rows.push([{v:title,t:true}]);
  (meta||[]).forEach(m=>rows.push([m]));
  rows.push([]);
  rows.push(head.map(h=>({v:h,h:true})));
  const hr=rows.length;
  body.forEach(r=>rows.push(r.t.map((v,c)=>{if(v===''||BLANK.test(v))return'';if(ty[c])return{v:toNum(v),m:ty[c]=='m',b:r.b};return r.b?{v,b:true}:v})));
  if(!body.length)rows.push(['لا توجد بيانات']);
  return{name:title,rows,headerRow:hr};
}
const orgLine=()=>{const d=new Date();return (S().org||'')+' — تاريخ التصدير: '+today()+' '+d.toTimeString().slice(0,5)+' — '+(D.user?D.user.name:'')};
function filterMeta(){
  const m=[];
  $$('#v .tb').forEach(bar=>{
    [...bar.children].forEach((el,i,a)=>{
      if(el.tagName==='LABEL'){const n=a[i+1];if(n&&n.tagName==='INPUT'&&n.value)m.push(el.textContent.trim()+': '+n.value)}
      else if(el.tagName==='SELECT'&&el.selectedIndex>0&&!el.name){m.push(el.options[el.selectedIndex].textContent.trim())}
    });
  });
  const q=$('#v input[placeholder="بحث..."]');if(q&&q.value)m.push('بحث: '+q.value);
  return m.length?['الفلتر: '+m.join(' | ')]:[];
}
function viewSheets(){
  const sheets=[],mt=(($('#mods .on')||{}).textContent||'').trim(),vt=(($('#nav .on')||{}).textContent||'').trim();
  const meta=[orgLine()].concat(filterMeta());
  const cards=$$('#v .cards .card');
  if(cards.length){
    const rows=[[{v:vt+' — ملخص',t:true}],[meta[0]],[],[{v:'البند',h:true},{v:'القيمة',h:true}]];
    cards.forEach(c=>{const l=txt(c.querySelector('small')),v=txt(c.querySelector('h2'));rows.push([l,NUM.test(v)&&!/^0\d/.test(v)?{v:toNum(v),m:/\.\d{2}$/.test(v)}:v])});
    sheets.push({name:'ملخص',rows,headerRow:4});
  }
  $$('#v table').forEach((t,i)=>{
    const box=t.closest('.box')||t.parentElement;let h=box&&box.querySelector('h3');
    let title=h?txt(h):(vt||'جدول');
    if(!h&&$$('#v table').length>1)title=vt+' '+(i+1);
    sheets.push(tableSheet(t,title,meta));
  });
  return{sheets,name:[S().org,mt,vt,today()].filter(Boolean).join(' - ')};
}
A.xl=()=>{
  try{
    const{sheets,name}=viewSheets();
    if(!sheets.length){toast('لا توجد جداول في هذه الشاشة للتصدير',1);return}
    download(name,buildXlsx(sheets));toast('تم تصدير الشاشة إلى Excel');
  }catch(e){toast('تعذر التصدير: '+e.message,1)}
};

/* ---------- تصدير مستند طباعة (فاتورة/إذن/قيد) ---------- */
function docSheet(html,title){
  const box=document.createElement('div');box.innerHTML=html;
  const rows=[],T=(el)=>txt(el);
  const t=box.querySelector('.h .t'),org=box.querySelector('.h h1');
  rows.push([{v:title||(t?T(t):'مستند'),t:true}]);
  rows.push([(org?T(org):S().org)+' — تاريخ التصدير: '+today()]);
  rows.push([]);
  const pair=p=>{const b=p.querySelector('b');if(b){const l=T(b).replace(/[:：]\s*$/,'');const c=p.cloneNode(true);c.querySelector('b').remove();rows.push([{v:l,b:true},T(c)])}else if(T(p))rows.push([T(p)])};
  [...box.children].forEach(el=>{
    if(el.classList.contains('h')||el.classList.contains('sg')||el.classList.contains('ft'))return;
    if(el.classList.contains('g')){
      [...el.children].forEach(g=>{const h=g.querySelector('h4');if(h)rows.push([{v:T(h),b:true}]);g.querySelectorAll('p').forEach(pair)});rows.push([]);return}
    if(el.tagName==='TABLE'){
      const s=tableSheet(el,'');rows.push(...s.rows.slice(s.headerRow-1));rows.push([]);return}
    if(el.classList.contains('tt')){
      el.querySelectorAll('p').forEach(p=>{const sp=p.querySelectorAll('span');if(sp.length>=2){const v=T(sp[1]);rows.push([{v:T(sp[0]),b:true},NUM.test(v)?{v:toNum(v),m:true,b:true}:v])}else pair(p)});rows.push([]);return}
    if(el.tagName==='P')pair(el);
    else if(T(el))rows.push([T(el)]);
  });
  return{name:(title||'مستند').slice(0,31),rows,headerRow:0};
}
window.docOut=(html,title,x)=>{
  if(!x){printHtml(html);return}
  try{
    const sh=docSheet(html,title);
    // الصف الأول (رأس الجدول) قد يكون ضمن البيانات؛ لا تجميد/فلتر للمستندات
    download(title+' - '+today(),buildXlsx([sh]));toast('تم تصدير المستند إلى Excel');
  }catch(e){toast('تعذر التصدير: '+e.message,1)}
};

/* ---------- تصدير كل البيانات (مدير النظام) ---------- */
window.xlTables=(j,label)=>{
  const sheets=j.tables.map(t=>{
    const rows=[[{v:t.name,t:true}],[orgLine()],[],t.cols.map(c=>({v:c,h:true}))];
    t.rows.forEach(r=>rows.push(r.map(v=>{
      if(typeof v==='number')return{v,m:false};
      if(typeof v==='string'&&/^-?\d+(\.\d+)?$/.test(v)&&!/^0\d/.test(v)&&v.length<16)return{v:+v};
      return v===undefined||v===null?'':v;
    })));
    return{name:t.name,rows,headerRow:4};
  });
  download((S().org||'نظام')+' - '+label,buildXlsx(sheets));toast('تم التصدير ('+sheets.length+' أوراق)');
};
A.xall=async()=>{
  try{
    const j=await api('exportAll');
    const sheets=j.tables.map(t=>{
      const rows=[[{v:t.name,t:true}],[orgLine()],[],t.cols.map(c=>({v:c,h:true}))];
      t.rows.forEach(r=>rows.push(r.map(v=>{
        if(typeof v==='number')return{v,m:false};
        if(typeof v==='string'&&/^-?\d+(\.\d+)?$/.test(v)&&!/^0\d/.test(v)&&v.length<16)return{v:+v};
        return v===undefined||v===null?'':v;
      })));
      return{name:t.name,rows,headerRow:4};
    });
    download((S().org||'نظام')+' - كل البيانات - '+today(),buildXlsx(sheets));toast('تم تصدير كل البيانات ('+sheets.length+' ورقة)');
  }catch(e){toast(e.message,1)}
};
})();
