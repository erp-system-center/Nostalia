/* =====================================================================
   قائمة الملف الشخصي (أيقونة المستخدم أعلى اليسار — كأنظمة ERP):
   الملف الشخصي، تغيير كلمة المرور، المظهر (تلقائي/فاتح/داكن)، صلاحياتي، الإشعارات، بحث وأوامر، تسجيل الخروج
   ===================================================================== */
(()=>{
const TK='gh_theme';
const getTheme=()=>{try{return localStorage.getItem(TK)||'auto'}catch(e){return 'auto'}};
const applyTheme2=()=>{const t=getTheme(),r=document.documentElement;if(t==='auto')r.removeAttribute('data-theme');else r.setAttribute('data-theme',t)};
applyTheme2();
const st=document.createElement('style');st.textContent=`
#hb .pv{display:inline-flex;align-items:center;gap:8px;padding:3px 10px 3px 4px;border-radius:99px}
#hb .pv .av,#pm .ph .av2,#avp{overflow:hidden}#hb .pv .av img,#pm .ph .av2 img,#avp img{width:100%;height:100%;object-fit:cover;border-radius:50%;display:block}#hb .pv .av{width:28px;height:28px;border-radius:50%;background:var(--a);color:#1b1b1b;display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:14px}
#hb .pv .pn{max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}
@media(max-width:640px){#hb .pv .pn{display:none}}
#pm{position:fixed;top:calc(var(--hh,56px) - 4px);inset-inline-end:auto;left:12px;z-index:60;width:300px;max-width:calc(100vw - 24px);background:var(--c);color:var(--t);border:1px solid var(--l);border-radius:12px;box-shadow:0 12px 34px #0004;overflow:hidden}
#pm[hidden]{display:none}
#pm .ph{display:flex;gap:12px;align-items:center;padding:14px;background:var(--s);border-bottom:1px solid var(--l)}
#pm .ph .av2{width:46px;height:46px;border-radius:50%;background:var(--p);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;flex:none}
#pm .ph b{display:block;font-size:15px}#pm .ph small{display:block;color:var(--m);line-height:1.5}
#pm .pi{display:flex;align-items:center;gap:10px;width:100%;padding:10px 14px;background:none;border:0;color:inherit;font:inherit;text-align:start;cursor:pointer}
#pm .pi:hover{background:var(--s)}#pm .pi .ic{color:var(--m);flex:none}#pm .pi .bn{margin-inline-start:auto}
#pm hr{border:0;border-top:1px solid var(--l);margin:4px 0}
#pm .pt{display:flex;gap:6px;padding:6px 14px 10px;align-items:center}#pm .pt span{color:var(--m);font-size:12px;margin-inline-end:auto}
#pm .pt button{border:1px solid var(--l);background:none;color:inherit;border-radius:99px;padding:2px 10px;font:inherit;font-size:12px;cursor:pointer}
#pm .pt button.on{background:var(--p);color:#fff;border-color:var(--p)}
#pm .pi.out{color:#c0392b}#pm .pi.out .ic{color:#c0392b}
`;document.head.appendChild(st);
const ic=(d)=>`<svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const IC={user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>',key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',shield:'<path d="M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',bell:'<path d="M6 16V11a6 6 0 0112 0v5l2 2H4z"/><path d="M10 21h4"/>',search:'<circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/>',out:'<path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9"/>'};
const roleTxt=u=>u.role==='admin'?'مدير النظام':(u.profName||'—');
let pm=null;
const closePm=()=>{if(pm)pm.hidden=true};
const menu=()=>{const u=D.user;
  return `<div class="ph"><div class="av2">${avIn(u)}</div><div style="min-width:0"><b>${esc(u.name)}</b><small>${esc(u.username)} · ${esc(roleTxt(u))}</small>${u.deptName?`<small>${esc(u.deptName)}</small>`:''}${u.email?`<small style="direction:ltr;text-align:right">${esc(u.email)}</small>`:''}</div></div>
  <button class="pi" data-a="myp">${ic(IC.user)}الملف الشخصي</button>
  <button class="pi" data-a="pw">${ic(IC.key)}تغيير كلمة المرور</button>
  <button class="pi" data-a="myacc">${ic(IC.shield)}صلاحياتي</button>
  <button class="pi" data-a="bell">${ic(IC.bell)}الإشعارات${D.unread?`<b class="bn">${D.unread}</b>`:''}</button>
  <button class="pi" data-a="cmd">${ic(IC.search)}بحث وأوامر <small class="mu" style="margin-inline-start:auto">Ctrl+K</small></button>
  <hr><div class="pt"><span>المظهر</span>${[['auto','تلقائي'],['light','فاتح'],['dark','داكن']].map(([k,t])=>`<button data-a="thm" data-i="${k}" class="${getTheme()===k?'on':''}">${t}</button>`).join('')}</div>
  <hr><button class="pi out" data-a="out">${ic(IC.out)}تسجيل الخروج</button>`};
A.prof=()=>{if(!pm){pm=document.createElement('div');pm.id='pm';pm.hidden=true;document.body.appendChild(pm)}
  if(!pm.hidden){pm.hidden=true;return}pm.innerHTML=menu();pm.hidden=false};
A.thm=k=>{try{localStorage.setItem(TK,k)}catch(e){}applyTheme2();if(pm&&!pm.hidden)pm.innerHTML=menu()};
document.addEventListener('click',e=>{if(!pm||pm.hidden)return;const t=e.target;if(t.closest&&t.closest('[data-a=prof]'))return;
  if(t.closest&&t.closest('#pm')){const b=t.closest('button[data-a]');if(b&&b.dataset.a!=='thm')setTimeout(closePm,0);return}closePm()},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closePm()});
window.avPick=fl=>{if(!fl)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const n=Math.min(im.width,im.height),c=document.createElement('canvas');c.width=c.height=160;const x=c.getContext('2d');x.drawImage(im,(im.width-n)/2,(im.height-n)/2,n,n,0,0,160,160);let u=c.toDataURL('image/webp',.85);if(!u.startsWith('data:image/webp'))u=c.toDataURL('image/jpeg',.85);if(u.length>38000)u=c.toDataURL('image/jpeg',.6);if(u.length>38000){toast('الصورة كبيرة، اختر صورة أخرى',1);return}$('#m [name=avatar]').value=u;const p=$('#avp');if(p)p.innerHTML='<img src="'+u+'" alt="">'};im.onerror=()=>toast('تعذّر قراءة الصورة',1);im.src=r.result};r.readAsDataURL(fl)};
window.avDel=()=>{$('#m [name=avatar]').value='';const p=$('#avp');if(p)p.textContent=(String(D.user.name||'؟').trim()[0]||'؟')};
A.myp=()=>{const u=D.user;
  mdl('الملف الشخصي',`<div class="full" style="display:flex;gap:12px;align-items:center"><div style="width:52px;height:52px;border-radius:50%;background:var(--p);color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;overflow:hidden;flex:none" id="avp">${avIn(u)}</div><div><b>${esc(u.username)}</b><div class="mu">${esc(roleTxt(u))}${u.deptName?' — '+esc(u.deptName):''}</div></div></div>`
   +`<div class="full"><label>صورتك الشخصية</label><input type="hidden" name="avatar" value="__keep"><input type="file" accept="image/*" onchange="avPick(this.files[0])"> <button type="button" class="b s o" onclick="avDel()">إزالة الصورة</button><div class="mu">تُقصّ تلقائيًا إلى مربع وتُصغَّر.</div></div>`+fld('الاسم','name',u.name,'text','full')+fld('البريد الإلكتروني','email',u.email||'','email')+fld('الهاتف','phone',u.phone||'','tel')
   +`<div class="full mu">الدور والصلاحيات والإدارة يحدّدها مدير النظام ولا تُعدَّل من هنا.</div><div class="full"><button type="button" class="b s o" data-a="pw">تغيير كلمة المرور</button></div>`,
   async()=>{const o=rd();if(!o.name.trim()){toast('أدخل اسمك',1);return false}try{await api('saveMyProfile',o);await load(1);toast('تم حفظ الملف الشخصي');return true}catch(e){toast(e.message,1);return false}})};
A.myacc=()=>{const u=D.user,N=(typeof MODN!=='undefined'?MODN:{});
  const mods=u.role==='admin'?Object.values(N).concat(['الاعتمادات','الإعدادات']):Object.keys(N).filter(k=>u.mods&&u.mods[k]).map(k=>N[k]);
  const tabs=(u.tabs&&Object.keys(u.tabs).length)?Object.entries(u.tabs).map(([k,v])=>k+': '+({x:'مخفي',r:'عرض فقط'}[v]||v)).join('، '):'';
  const deny=Object.entries(u.deny||{}).filter(([k,v])=>v).map(([k,v])=>k+' ('+v+')').join('، ');
  mdl('صلاحياتي',kv('المستخدم',u.name+' ('+u.username+')')+kv('الدور',roleTxt(u))+kv('الإدارة',u.deptName||'—')+kv('المديولات المتاحة',mods.join('، ')||'—')+(tabs?kv('قيود التابات',tabs):'')+(deny?kv('أفعال محظورة',deny):'')+`<div class="full mu">للتعديل على صلاحياتك تواصل مع مدير النظام.</div>`,null)};
})();
