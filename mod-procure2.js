/* =====================================================================
   عروض الأسعار (RFQ) + سلاسل الاعتماد والتفويض (إدارة) + تقدّم الاعتماد في الطلبات 
   ===================================================================== */
(()=>{
const jp=(v,d)=>{if(v&&typeof v==='object')return v;try{return v?JSON.parse(v):d}catch(e){return d}};
const RF=()=>D.rfq||[];
const canRfq=()=>is('admin','procurement');
const supN=id=>(D.sup.find(s=>s.id==id)||{}).name||'؟';
const uN=n=>{const u=(D.users||[]).find(x=>x.username===n);return u?u.name+' ('+n+')':n};
const WF=()=>({rules:(D.ap&&D.ap.rules)||(D.wf||{}).rules||[],deleg:(D.ap&&D.ap.deleg)||(D.wf||{}).deleg||[]});
NAVX.proc.push(['p_rfq','عروض الأسعار']);
/* نضيف التاب بعد الموردين دون تكرار إن وُجد */
{const o=MODS.proc.nav;MODS.proc.nav=()=>{const n=o().filter(x=>x[0]!=='p_rfq');if(is('admin','procurement','approver','finance'))n.push(['p_rfq','عروض الأسعار']);return n}}

/* ---------- عروض الأسعار ---------- */
const rst=x=>({'مفتوح':'مفتوح','مُرسى':'مُرسى','محوّل':'محوّل لأمر توريد','ملغي':'ملغي'}[x]||x);
V.p_rfq=()=>{const L=RF();return head('طلبات عروض الأسعار',canRfq()?'nrfq':'','+ طلب عروض')+`<div class="box">${tbl(['الرقم','التاريخ','طلب الشراء','الموردون','البنود','آخر موعد','الحالة','أمر التوريد',''],L.map(r=>[esc(r.no),esc(r.date),esc(r.prNo||'—'),r.sups.length+' ('+Object.keys(r.quotes).length+' عرض)',r.items.length,esc(r.due||'—'),st(rst(r.st)),esc(r.poNo||'—'),btn('rfv',r.id,'مقارنة','o')+(canRfq()&&r.st==='مفتوح'?btn('rfd',r.id,'إلغاء','r'):'')]))}</div>
<p class="mu">اختر موردَين على الأقل، سجّل عرض كل مورد، قارن، ثم رسِّ الطلب (مع مبرر إن لم يكن الأقل سعرًا) وحوّله لأمر توريد.</p>`};
A.nrfq=()=>{const prs=D.pr.filter(p=>p.st==='معتمد');
  mdl('طلب عروض أسعار',sel('من طلب شراء معتمد (اختياري)','prId',[['','— بنود يدوية —']].concat(prs.map(p=>[p.id,p.no+' · '+pjl(p.proj)])),'','full')
  +`<div class="full"><label>الموردون (اختر موردَين على الأقل)</label><div class="msx" id="rsx"><button type="button" class="msb" data-a="rsto"><span id="rsn">اختر الموردين</span><span>▾</span></button><div class="msp" hidden><input type="search" class="mss" placeholder="ابحث عن مورد..." autocomplete="off"><div class="msa"><button type="button" class="b s o" data-a="rsall">تحديد المعروض</button> <button type="button" class="b s o" data-a="rsclr">مسح التحديد</button></div><div class="msl">${D.sup.map(s=>`<label class="chk msi" data-n="${esc(String(s.name).toLowerCase())}"><input type="checkbox" class="rs" value="${esc(s.id)}"> ${esc(s.name)}</label>`).join('')||'<span class="mu">لا موردين</span>'}</div></div><div class="msc" id="rsc"></div></div></div>`
  +fld('آخر موعد لاستلام العروض','due','','date')+fld('ملاحظات','note','','text','full')
  +`<div class="full" id="rman"><label>البنود اليدوية (إن لم تختر طلب شراء) — بيان | وحدة | كمية</label><div id="rit"></div><button type="button" class="b o s" data-a="rfadd">+ بند</button></div>`,
  ()=>{const o=rd();o.sups=$$('#mb .rs:checked').map(x=>x.value);if(o.sups.length<2){toast('اختر موردَين على الأقل',1);return false}
   if(!o.prId){o.items=$$('#rit .ri').map(r=>{const i=r.querySelectorAll('input');return{d:i[0].value.trim(),u:i[1].value.trim(),q:+i[2].value||0}}).filter(x=>x.d);if(!o.items.length){toast('أضف بندًا أو اختر طلب شراء',1);return false}}
   return run('saveRFQ',o,'تم إنشاء طلب العروض')});A.rfadd()};
const rsUp=()=>{const c=$$('#mb .rs:checked');const n=$('#rsn');if(n)n.textContent=c.length?c.length+' مورد محدد':'اختر الموردين';const b=$('#rsc');if(b)b.innerHTML=c.map(x=>`<span class="mch">${esc(x.parentNode.textContent.trim())}</span>`).join('')};
A.rsto=()=>{const p=$('#rsx .msp');p.hidden=!p.hidden;if(!p.hidden)p.querySelector('.mss').focus()};
A.rsall=()=>{$$('#rsx .msi').forEach(l=>{if(l.style.display!=='none')l.querySelector('input').checked=true});rsUp()};
A.rsclr=()=>{$$('#rsx .rs').forEach(x=>x.checked=false);rsUp()};
document.addEventListener('input',e=>{const t=e.target;if(t&&t.classList&&t.classList.contains('mss')){const q=t.value.trim().toLowerCase();$$('#rsx .msi').forEach(l=>{l.style.display=!q||l.dataset.n.includes(q)?'':'none'})}});
document.addEventListener('change',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('rs'))rsUp()});
{const st=document.createElement('style');st.textContent='.msx .msb{width:100%;display:flex;justify-content:space-between;padding:9px 12px;border:1px solid var(--l);border-radius:10px;background:#fff;cursor:pointer;font:inherit}.msp{border:1px solid var(--l);border-radius:10px;margin-top:4px;padding:8px;background:#fff}.msp .mss{width:100%;margin-bottom:6px}.msl{max-height:210px;overflow:auto}.msi{display:flex;gap:8px;padding:5px 4px;font-weight:400}.msi:hover{background:var(--s)}.msc{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}.mch{background:var(--s);color:var(--p);border-radius:12px;padding:2px 10px;font-size:12px}';document.head.appendChild(st)}
A.rfadd=()=>{const d=document.createElement('div');d.className='ri';d.style.cssText='display:flex;gap:6px;margin:3px 0';d.innerHTML='<input placeholder="البيان" style="flex:3"><input placeholder="الوحدة" style="width:70px"><input type="number" min="0" step="any" placeholder="الكمية" style="width:80px">';$('#rit').appendChild(d)};
A.rfd=i=>{const r=RF().find(x=>x.id==i);if(confirm('إلغاء طلب العروض '+r.no+'؟'))run('delRFQ',{id:i,ver:r.ver},'تم الإلغاء')};
A.rfv=async i=>{const r=RF().find(x=>x.id==i);let c;try{c=await api('rfqCmp',{id:i})}catch(e){toast(e.message,1);return}
  const aw=r.award;
  const head1=['البند','الكمية'].concat(c.sups.map(s=>esc(s.name)));
  const rows=c.items.map((it,k)=>[esc(it.d),it.q+' '+esc(it.u||'')].concat(c.sups.map(s=>{const p=s.quote?+s.quote.prices[k]:0;if(!s.quote)return'—';if(!(p>0))return'<span class="mu">لم يُسعّر</span>';const isB=c.best[k]&&c.best[k].sup===s.id;return isB?`<b style="color:var(--ok)">${f(p)} ✔</b>`:f(p)})));
  rows.push([ '<b>الإجمالي بدون ضريبة</b>','' ].concat(c.sups.map(s=>s.total?`<b>${f(s.total.total)}</b>${s.total.complete?'':' <small class="mu">(ناقص)</small>'}`:'—')));
  rows.push(['الضريبة %',''].concat(c.sups.map(s=>s.quote?s.quote.vat:'—')));
  rows.push(['<b>الإجمالي شامل</b>',''].concat(c.sups.map(s=>s.total?`<b>${f(s.total.gross)}</b>${c.lowest===s.id?' ⭐':''}`:'—')));
  rows.push(['التسليم / الشروط',''].concat(c.sups.map(s=>s.quote?esc((s.quote.delivery||'')+' '+(s.quote.terms||'')):'—')));
  rows.push(['',''].concat(c.sups.map(s=>(canRfq()&&r.st==='مفتوح'?btn('rfq1',r.id+'|'+s.id,s.quote?'تعديل العرض':'تسجيل عرض','o'):'')+(canRfq()&&r.st==='مفتوح'&&s.total&&s.total.complete?btn('rfaw',r.id+'|'+s.id,'ترسية','g'):''))));
  mdl('مقارنة العروض '+r.no+' — '+rst(r.st),`<div class="full" style="overflow-x:auto">${tbl(head1,rows)}</div><div class="full mu">⭐ الأقل سعرًا إجمالًا بين العروض المكتملة — ✔ الأقل في البند.</div>`
   +(aw?`<div class="full"><b>الترسية:</b> ${esc(supN(aw.sup))} — بواسطة ${esc(aw.byName)} ${aw.lowest?'(الأقل سعرًا)':'(ليس الأقل — مبرر: '+esc(aw.reason)+')'}</div>`:'')
   +(canRfq()&&r.st==='مُرسى'?`<div class="full"><button class="b g" data-a="rf2po" data-i="${r.id}">إنشاء أمر توريد من العرض المُرسى</button></div>`:'')+attBox('RFQ',r.id),null)};
A.rfq1=p=>{const [id,sid]=p.split('|');const r=RF().find(x=>x.id==id),q=r.quotes[sid]||{prices:[],vat:0};dlg.close();
  setTimeout(()=>mdl('عرض '+supN(sid)+' — '+r.no,`<div class="full" style="overflow-x:auto">${tbl(['البند','الكمية','سعر الوحدة'],r.items.map((it,k)=>[esc(it.d),it.q+' '+esc(it.u||''),`<input class="qp" type="number" min="0" step="any" value="${q.prices[k]||''}" style="width:110px">`]))}</div>`+fld('ضريبة %','vat',q.vat||0,'number')+fld('مدة التسليم','delivery',q.delivery||'')+fld('شروط الدفع','terms',q.terms||'')+fld('ملاحظات','note',q.note||'','text','full'),
   async()=>{const o=rd();o.id=id;o.ver=r.ver;o.sup=sid;o.prices=$$('#mb .qp').map(x=>x.value);const j=await run('quoteRFQ',o,'تم تسجيل العرض');if(j!==false&&j!==undefined)setTimeout(()=>A.rfv(id),400);return j}),200)};
A.rfaw=p=>{const [id,sid]=p.split('|');const r=RF().find(x=>x.id==id);dlg.close();
  setTimeout(()=>mdl('ترسية على '+supN(sid),fld('مبرر الترسية (إلزامي إن لم يكن الأقل سعرًا أو عرض واحد مكتمل)','reason','','ta','full'),async()=>{const j=await run('awardRFQ',{id,ver:r.ver,sup:sid,reason:rd().reason},'تمت الترسية');if(j!==false&&j!==undefined)setTimeout(()=>A.rfv(id),400);return j},'ترسية'),200)};
A.rf2po=async i=>{const r=RF().find(x=>x.id==i);if(!confirm('إنشاء أمر توريد من العرض المُرسى؟'))return;const j=await run('rfqToPO',{id:i,ver:r.ver},'تم إنشاء أمر التوريد');if(j)dlg.close()};

/* ---------- تقدم الاعتماد في الطلبات والأوامر ---------- */
const wfBox=(kind,r,amtTxt)=>{const w=jp(r.wf,null);if(!w||!w.levels)return'';
  const rows=w.levels.map((lv,i)=>{const s=w.steps[i];const who=(lv.users||[]).map(uN).concat((lv.profs||[]).map(p=>'دور: '+((D.profiles||[]).find(x=>x.id==p)||{name:p}).name));return[i+1,esc(lv.name),esc(who.join('، ')||'—'),s?`✔ ${esc(s.byName)}${s.via?' (تفويضًا عن '+esc(s.via)+')':''} — ${esc(String(s.at).slice(0,10))}`:(i===w.steps.length&&['جديد','معتمد جزئيًا'].includes(r.st)?'<b>⏳ المرحلة الحالية</b>':'—')]});
  return `<div class="full"><label>سلسلة الاعتماد: ${esc(w.name)}</label>${tbl(['#','المرحلة','المعتمدون','الحالة'],rows)}</div>`};
{const o=A.vpr;A.vpr=i=>{o(i);const x=D.pr.find(p=>p.id==i);const b=wfBox('PR',x);if(b)$('#mb').insertAdjacentHTML('beforeend',b)}}
{const o=A.vpo;A.vpo=i=>{o(i);const x=D.po.find(p=>p.id==i);const b=wfBox('PO',x);if(b)$('#mb').insertAdjacentHTML('beforeend',b)}}

/* ---------- إدارة: سلاسل الاعتماد والتفويض ---------- */
const lvRow=(l={})=>`<div class="lvr box" style="padding:8px;margin:4px 0"><div style="display:flex;gap:6px;flex-wrap:wrap"><input class="ln" placeholder="اسم المرحلة" value="${esc(l.name||'')}" style="flex:1;min-width:140px"><select class="lu" multiple size="4" style="min-width:180px" title="المعتمدون">${(D.users||[]).filter(u=>u.active!==false).map(u=>`<option value="${esc(u.username)}"${(l.users||[]).includes(u.username)?' selected':''}>${esc(u.name)} (${esc(u.username)})</option>`).join('')}</select><select class="lp" multiple size="4" style="min-width:160px" title="أدوار">${(D.profiles||[]).filter(p=>p.active).map(p=>`<option value="${esc(p.id)}"${(l.profs||[]).includes(p.id)?' selected':''}>دور: ${esc(p.name)}</option>`).join('')}</select><button type="button" class="b r s" data-a="lvx">حذف</button></div></div>`;
A.lvx=()=>{const e=event&&event.target&&event.target.closest('.lvr');if(e)e.remove()};
A.lvadd=()=>$('#lvs').insertAdjacentHTML('beforeend',lvRow());
A.nwf=i=>{const x=i?WF().rules.find(r=>r.id==i):{kind:window.__wfk||'PR',min:0,max:0,levels:[{},{}],active:true};
  mdl(i?'تعديل سلسلة':'سلسلة اعتماد',fld('اسم السلسلة','name',x.name,'text','full')+sel('ينطبق على','kind',((D.ap&&D.ap.kinds)||[{kind:'PR',label:'طلبات الشراء'},{kind:'PO',label:'أوامر التوريد'}]).map(k=>[k.kind,k.label]),x.kind)+fld('من مبلغ','min',x.min,'number')+fld('إلى مبلغ (0 = بلا حد)','max',x.max,'number')+sel('الحالة','active',[['true','فعّالة'],['false','موقوفة']],String(x.active!==false))
   +`<div class="full"><label>المراحل بالترتيب (اختر معتمدًا أو أكثر و/أو دورًا؛ Ctrl للاختيار المتعدد)</label><div id="lvs">${x.levels.map(lvRow).join('')}</div><button type="button" class="b o s" data-a="lvadd">+ مرحلة</button></div>`,
   ()=>{const o=rd();if(i)o.id=i;o.levels=$$('#lvs .lvr').map(r=>({name:r.querySelector('.ln').value.trim(),users:[...r.querySelector('.lu').selectedOptions].map(x=>x.value),profs:[...r.querySelector('.lp').selectedOptions].map(x=>x.value)}));return run('saveWf',o,'تم الحفظ')})};
A.xwf=i=>{if(confirm('حذف السلسلة؟ لا تتأثر الطلبات الجارية.'))run('delWf',{id:i},'تم الحذف')};
A.ndl=i=>{const x=i?WF().deleg.find(r=>r.id==i):{start:today(),end:today(),active:true};const adm=D.user.role==='admin';
  mdl(i?'تعديل تفويض':'تفويض اعتماد',(adm?sel('المفوِّض','from',(D.users||[]).map(u=>[u.username,u.name+' ('+u.username+')']),x.from||D.user.username):'')+sel('المفوَّض إليه','to',[['','— اختر —']].concat((D.users||[]).filter(u=>u.active!==false&&u.username!==D.user.username).map(u=>[u.username,u.name+' ('+u.username+')'])),x.to||'')+fld('من','start',x.start,'date')+fld('إلى','end',x.end,'date')+sel('الحالة','active',[['true','ساري'],['false','موقوف']],String(x.active!==false))+fld('ملاحظة','note',x.note,'text','full'),()=>{const o=rd();if(i)o.id=i;return run('saveDeleg',o,'تم الحفظ')})};
A.xdl=i=>{if(confirm('حذف التفويض؟'))run('delDeleg',{id:i},'تم الحذف')};


})();
