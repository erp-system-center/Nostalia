/* =====================================================================
   خدمات مشتركة في الواجهة: الإشعارات (الجرس) + المرفقات + الموازنات
   ===================================================================== */
(()=>{
/* ---------- الإشعارات ---------- */
const NT={pr:['proc','p_pr'],po:['proc','p_po'],req:['inv','i_req'],je:['acc','c_je'],budget:['acc','c_bud'],pay:['hr','h_pay'],lv:['hr','h_lv'],mo:['mfg','m_mo'],ord:['sal','s_ord'],ct:['proc','p_ct'],wf:['ap','ap_in'],exp:['exp','c_exp']};
const goTo=n=>{const t=NT[n.kind];if(t&&MODS[t[0]]&&MODS[t[0]].has()){A.mod(t[0]);A.go(t[1])}};
A.bell=()=>{const L=D.notifs||[];
  mdl('الإشعارات'+(D.unread?' ('+D.unread+' غير مقروءة)':''),(L.length?L.map(n=>`<div class="full ai" style="padding:6px 0;border-bottom:1px solid var(--l);${n.read?'opacity:.6':''}"><div style="flex:1"><b>${esc(n.title)}</b><br><small class="mu">${esc(n.body)} — ${new Date(n.at).toLocaleString('en-GB')}</small></div><button class="b s o" data-a="nt" data-i="${esc(n.id)}">${NT[n.kind]?'فتح':'تمت القراءة'}</button></div>`).join(''):'<div class="full mu">لا توجد إشعارات.</div>')+(D.unread?'<div class="full"><button class="b s" data-a="ntall">تعليم الكل كمقروء</button></div>':''),null)};
A.nt=async i=>{const n=(D.notifs||[]).find(x=>x.id==i);dlg.close();try{if(n&&!n.read)await api('readNotif',{id:i});await load(1)}catch(e){toast(e.message,1)}if(n)goTo(n)};
A.ntall=async()=>{dlg.close();try{await api('readNotif',{all:true});await load(1)}catch(e){toast(e.message,1)}};
A.nmsave=()=>{const v=$('#nml').checked;run('saveNotifCfg',{notifMail:v},'تم حفظ إعدادات الإشعارات')};
// إعدادات الإرسال في مديول الإعدادات (الإعدادات العامة) وليست ضمن نافذة الإشعارات
{const o=V.a_set;V.a_set=()=>o()+`<div class="box"><h3>إعدادات الإشعارات</h3><label class="chk"><input type="checkbox" id="nml"${(D.extra||{}).notifMail?' checked':''}> إرسال الإشعارات أيضًا بالبريد الإلكتروني (للمستخدمين الذين لهم بريد)</label><div class="mu">تظهر الإشعارات داخل النظام دائمًا من أيقونة الجرس.</div><button class="b" data-a="nmsave">حفظ</button></div>`}

/* ---------- المرفقات ---------- */
window.attBox=(k,r)=>`<div class="full att" data-k="${k}" data-r="${esc(r)}"><label>المرفقات</label><div class="al mu">جارٍ التحميل…</div>${tl(view)==='r'?'':'<div><input type="file" class="af" accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx,.xls,.xlsx,.csv,.txt,.ppt,.pptx"><small class="mu"> الحد الأقصى 2.5 ميجابايت للملف</small></div>'}</div>`;
const attList=async()=>{const b=$('#mb .att');if(!b)return;try{const j=await api('attList',{kind:b.dataset.k,ref:b.dataset.r});$('#mb .att .al').innerHTML=j.files.length?j.files.map(x=>`<div class="ai"><span style="flex:1">${esc(x.name)} <small class="mu">(${Math.round(x.size/1024)||1} ك.ب — ${esc(x.byName)})</small></span><button class="b s o" data-a="attGet" data-i="${esc(x.id)}">تنزيل</button>${tl(view)==='r'?'':`<button class="b s r" data-a="attRm" data-i="${esc(x.id)}">حذف</button>`}</div>`).join(''):'<span class="mu">لا توجد مرفقات.</span>'}catch(e){const a=$('#mb .att .al');if(a)a.textContent=e.message}};
window.attInit=attList;
A.attGet=async i=>{try{const j=await api('getFile',{id:i});const bin=atob(j.b64),u=new Uint8Array(bin.length);for(let k=0;k<bin.length;k++)u[k]=bin.charCodeAt(k);const url=URL.createObjectURL(new Blob([u],{type:j.mime||'application/octet-stream'}));const a=document.createElement('a');a.href=url;a.download=j.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000)}catch(e){toast(e.message,1)}};
A.attRm=async i=>{if(!confirm('حذف المرفق؟'))return;try{await api('delAttach',{id:i});toast('تم الحذف');attList()}catch(e){toast(e.message,1)}};
dlg.addEventListener('change',e=>{const el=e.target;if(!el||!el.classList||!el.classList.contains('af')||!el.files[0])return;const b=el.closest('.att'),fl=el.files[0];
  if(fl.size>2500000){toast('الملف أكبر من 2.5 ميجابايت',1);el.value='';return}
  const r=new FileReader();r.onload=async()=>{try{await api('attach',{kind:b.dataset.k,ref:b.dataset.r,name:fl.name,mime:fl.type,b64:String(r.result)});toast('تم رفع المرفق');el.value='';attList()}catch(x){toast(x.message,1);el.value=''}};r.readAsDataURL(fl)});

/* ---------- الموازنات (تاب في الحسابات) ---------- */
NAVX.acc.push(['c_bud','الموازنات'],['c_bvr','تقرير الموازنة'],['c_bct','رقابة الموازنة'],['c_chk','فحص سلامة الدفاتر']);
const isAM=()=>['admin','manager'].includes((D.acc||{}).role);
const PJA=()=>(D.acc&&D.acc.projects)||[];
const pjn=id=>{const p=PJA().find(x=>x.id==id);return p?p.code+' · '+p.name:'—'};
const accN=id=>{const a=(D.acc.accounts||[]).find(x=>x.id==id);return a?a.code+' · '+a.name:'إجمالي الفرع'};
let BS={res:null,proj:'',asOf:''};
const barC=p=>p==null?'#bbb':p>100?'#c0392b':p>=80?'#d9a441':'var(--ok)';
const budRes=()=>{const r=BS.res;if(!r)return '<p class="mu">اضغط «عرض التقرير».</p>';if(!r.rows.length)return '<p class="mu">لا توجد بنود موازنة.</p>';
  return tbl(['الفرع','الفترة','الموازنة','المصروف الفعلي','الارتباطات (أوامر توريد معتمدة غير مستلمة)','المتبقي','الاستهلاك'],r.rows.map(x=>[`<b>${esc(x.code)}</b> ${esc(x.name)}`,esc(x.from+' ← '+x.to),f(x.budget),f(x.actual),f(x.commit),`<span style="color:${x.left<0?'#c0392b':'inherit'}">${f(x.left)}</span>`,x.pct==null?'—':`<div class="bar"><i style="width:${Math.min(100,x.pct)}%;background:${barC(x.pct)}"></i></div><small>${x.pct}%</small>`]))+r.rows.filter(x=>x.lines.length).map(x=>`<h4>${esc(x.code)}: بنود حسب الحساب</h4>`+tbl(['الحساب','الفترة','الموازنة','الفعلي','المتبقي'],x.lines.map(l=>[esc(l.label),esc(l.from+' ← '+l.to),f(l.budget),f(l.actual),`<span style="color:${l.left<0?'#c0392b':'inherit'}">${f(l.left)}</span>`]))).join('')};
V.c_bud=()=>{const L=(D.bud&&D.bud.list)||[],ctl=(D.extra||{}).budCtl||'off';
  return head('الموازنات',isAM()?'nbd':'','+ بند موازنة')+`<div class="box">${tbl(['الفرع','الفترة','البند','المبلغ','ملاحظات','الحالة',''],L.map(b=>[esc(pjn(b.proj)),esc(b.from+' ← '+b.to),esc(accN(b.acc)),f(b.amount),esc(b.note),st(b.active?'نشط':'موقوف'),isAM()?btn('nbd',b.id,'تعديل','o')+btn('dbd',b.id,'حذف','r'):'']))}</div>`};
V.c_bct=()=>{const ctl=(D.extra||{}).budCtl||'off';return head('رقابة الموازنة')+`${isAM()?`<div class="box"><h3>الرقابة على الموازنة عند اعتماد أمر التوريد</h3><div class="db" id="bcf">${sel('الوضع','mode',[['off','بدون رقابة'],['warn','تنبيه فقط (يُعتمد مع تحذير وإشعار لمدير الحسابات)'],['block','منع الاعتماد عند تجاوز المتبقي']],ctl)}</div><button class="b" data-a="bcs">حفظ</button><p class="mu">المتبقي = الموازنة − المصروف الفعلي (قيود مرحّلة على الفرع) − الارتباطات. تطبَّق الرقابة على أوامر التوريد المرتبطة بفرع له موازنة سارية؛ واعتماد طلب الشراء يكتفي بالتنبيه (التقدير تقريبي). فرع بلا موازنة لا تُطبَّق عليه رقابة.</p></div>`:''}`};
V.c_bvr=()=>head('تقرير الموازنة مقابل الفعلي')+`<div class="box"><h3>تقرير الموازنة مقابل الفعلي</h3><div class="db" id="brf">${fld('حتى تاريخ','asOf',BS.asOf||today(),'date')}${sel('الفرع','proj',[['','كل الفروع']].concat(PJA().map(p=>[p.id,p.code+' · '+p.name])),BS.proj)}</div><button class="b" data-a="brun">عرض التقرير</button><div id="brr" style="margin-top:10px">${budRes()}</div></div>`;
A.nbd=i=>{const x=i?D.bud.list.find(b=>b.id==i):{active:true,from:today().slice(0,4)+'-01-01',to:today().slice(0,4)+'-12-31'};
  mdl(i?'تعديل بند موازنة':'بند موازنة جديد',sel('الفرع','proj',[['','— اختر —']].concat(PJA().map(p=>[p.id,p.code+' · '+p.name])),x.proj||'','full')+fld('من','from',x.from,'date')+fld('إلى','to',x.to,'date')+sel('البند','acc',[['','إجمالي الفرع (سقف عام)']].concat((D.acc.accounts||[]).filter(a=>a.type==='expense'&&a.active).map(a=>[a.id,a.code+' · '+a.name])),x.acc||'','full')+fld('المبلغ (ج.م)','amount',x.amount||'','number')+fld('ملاحظات','note',x.note||'','text','full')+(i?sel('الحالة','active',[['true','نشط'],['false','موقوف']],x.active?'true':'false'):''),
  ()=>{const o=rd();if(!o.proj){toast('اختر الفرع',1);return false}return run('saveBudget',{...o,id:i||undefined},'تم حفظ بند الموازنة')})};
A.dbd=i=>{if(confirm('حذف بند الموازنة؟'))run('delBudget',{id:i},'تم الحذف')};
A.bcs=()=>run('saveBudCfg',rd('#bcf'),'تم حفظ وضع الرقابة');
A.brun=async()=>{const o=rd('#brf');BS.asOf=o.asOf;BS.proj=o.proj;try{BS.res=await api('budRep',{asOf:o.asOf,proj:o.proj||undefined});$('#brr').innerHTML=budRes()}catch(e){toast(e.message,1)}};
})();
