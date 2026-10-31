/* =====================================================================
   تابات داخل الشاشة: تفصل الموضوعات المختلفة في الشاشة الواحدة (مثل شاشات مديول الاستيراد)
   كل شاشة لها قائمة تابات، وكل تاب يضم صناديق (.box) بترتيبها. الصناديق المخفية تبقى في الصفحة فلا تضيع قيم الحقول.
   إن اختلف عدد الصناديق عن المتوقع (حالة خاصة) تُعرض الشاشة كاملة بلا تابات.
   ===================================================================== */
(()=>{
const CFG={
 c_ap:{n:3,t:[['أرصدة الموردين',[0]],['أوامر التوريد المستلمة',[1]],['دفعات السداد',[2]]]},
 c_bnk:{n:5,t:[['التسوية والتقرير',[0,1]],['غير المطابق',[2,3]],['المطابَق',[4]]]},
 c_fa:{n:4,t:[['سجل الأصول',[0,1]],['الإهلاك الشهري',[2]],['عمليات الإهلاك',[3]]]},
 a_set:{n:2,t:[['إعدادات الفروع',[0]],['الهوية والبيانات',[1]]]},
 a_bak:{n:2,t:[['النسخ الاحتياطي على GitHub',[0]],['تصدير إلى Excel',[1]]]}
};
const CUR={};
const apply=()=>{const v=document.getElementById('v');if(!v||typeof view==='undefined')return;
  const c=CFG[view];const old=v.querySelector(':scope > .itabs');
  if(!c){if(old)old.remove();return}
  const boxes=[...v.children].filter(e=>e.classList.contains('box'));
  if(boxes.length!==c.n){if(old)old.remove();boxes.forEach(b=>b.style.display='');return}
  const k=view,cur=Math.min(CUR[k]||0,c.t.length-1);
  let bar=old;
  if(!bar){bar=document.createElement('div');bar.className='itabs';bar.innerHTML=c.t.map((t,i)=>`<button type="button" data-a="itab" data-i="${i}">${t[0]}</button>`).join('');
    const tb=v.querySelector(':scope > .tb');if(tb)tb.after(bar);else v.prepend(bar)}
  [...bar.children].forEach((b,i)=>b.classList.toggle('on',i===cur));
  boxes.forEach((b,i)=>{b.style.display=c.t[cur][1].includes(i)?'':'none'});
  v.querySelectorAll(':scope > p.mu').forEach(p=>p.style.display='')};
A.itab=i=>{CUR[view]=+i;apply()};
let q=0;new MutationObserver(()=>{if(!q){q=1;requestAnimationFrame(()=>{q=0;apply()})}}).observe(document.getElementById('v')||document.body,{childList:true});
const o=window.render;window.render=function(){o.apply(this,arguments);apply()};
const st=document.createElement('style');st.textContent='.itabs{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 12px;border-bottom:2px solid var(--l)}.itabs button{background:none;border:0;border-bottom:3px solid transparent;margin-bottom:-2px;padding:8px 14px;font:inherit;font-weight:600;color:var(--m);cursor:pointer}.itabs button.on{color:var(--p);border-bottom-color:var(--p)}';document.head.appendChild(st);
})();
