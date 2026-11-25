// CLM Daily app logic. State lives in localStorage under KEY. Data files load first (see index.html).
const KEY="daily.v1";
let S={wc:0,lastLevel:null,skin:"parchment",accent:null,newsRead:{},tProg:{},topicDone:{},tOver:null,tShift:null,favQ:{},seen:{},level:2,recent:[],vday:null,learned:{},vocabDone:{},extra:0,groceries:[],stretchDone:{},goal:{text:"",target:30},gHist:{}};
try{const r=localStorage.getItem(KEY);if(r)S=Object.assign(S,JSON.parse(r))}catch(e){}
if(!S.goal.text)S.goal.text="Touch my toes with straight legs";
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
function applyAccent(){
 const r=document.documentElement.style;
 if(S.accent){r.setProperty("--accent",S.accent);const h=S.accent.slice(1),c=[0,2,4].map(i=>parseInt(h.substr(i,2),16));r.setProperty("--accent-ink",(.299*c[0]+.587*c[1]+.114*c[2])>150?"#1a1a1a":"#fff")}
 else{r.removeProperty("--accent");r.removeProperty("--accent-ink")}
}
const SW=["#2f5d46","#8c2f39","#1f4e79","#b45309","#5b3a8c","#374151"];
const SKINS=[["parchment","Parchment","Classic warm paper"],["quest","Quest","RPG and fantasy"],["forest","Forest","Nature"],["arena","Arena","Sports"],["pixel","Pixel","Retro video game"]];
function applySkin(){document.documentElement.setAttribute("data-skin",S.skin||"parchment")}
const TABS={today:["Today"],news:["News"],vocab:["Vocab"],topic:["Topic"],quote:["Quote"],groceries:["Grocery"],stretch:["Stretch"],settings:["Settings"]};
const ICONS={
 today:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
 news:'<path d="M4 5h13v14H6a2 2 0 0 1-2-2z"/><path d="M17 9h3v8a2 2 0 0 1-2 2"/><path d="M8 9h5M8 13h5"/>',
 vocab:'<path d="M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4z"/><path d="M20 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z"/>',
 topic:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
 quote:'<path d="M7 7h4v4H9c0 2 1 3 2 3v2c-3 0-4-2-4-5zM14 7h4v4h-2c0 2 1 3 2 3v2c-3 0-4-2-4-5z"/>',
 groceries:'<circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/><path d="M3 4h2l2.5 11h10L20 8H6.5"/>',
 stretch:'<circle cx="12" cy="5" r="2"/><path d="M12 8v6M5 11l7-1 7 1M9 21l3-7 3 7"/>',
 settings:'<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
 more:'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>'
};
const icon=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]}</svg>`;
const CHECK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
function ring(n,t){const c=2*Math.PI*20,f=c*n/t;return `<svg class="ring" viewBox="0 0 48 48" role="img" aria-label="${n} of ${t} habits done"><circle cx="24" cy="24" r="20" class="rt"/>${n?`<circle cx="24" cy="24" r="20" class="rf" stroke-dasharray="${f.toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 24 24)"/>`:""}<text x="24" y="29" text-anchor="middle">${n}/${t}</text></svg>`}
// Reading time for the news brief at about 220 words a minute.
function readMin(){const t=NEWS.items.map(i=>[i.h,i.w,i.y,i.p].join(" ")).concat(NEWS.also).join(" ");return Math.max(1,Math.round(t.split(/\s+/).length/220))}
const pins=()=>(S.pins&&S.pins.length?S.pins:["news","vocab","topic"]).filter(k=>TABS[k]&&k!=="today").slice(0,3);
function renderNav(){
 const p=["today"].concat(pins()),rest=Object.keys(TABS).filter(k=>!p.includes(k));
 const btn=k=>`<button data-tab="${k}" aria-current="${k===tab}">${icon(k)}<span>${TABS[k][0]}</span></button>`;
 document.querySelector("nav div").innerHTML=p.map(btn).join("")+`<button data-act="more" aria-current="${rest.includes(tab)||moreOpen}" aria-expanded="${moreOpen}">${icon("more")}<span>More</span></button>`;
 let sh=document.getElementById("sheet");
 if(!sh){sh=document.createElement("div");sh.id="sheet";document.body.appendChild(sh)}
 sh.innerHTML=moreOpen?`<div class="scrim" data-act="more"></div><div class="sheet"><div>${rest.map(btn).join("")}</div></div>`:"";
}
function setMsg(m){bmsg=m;const e=document.getElementById("bmsg");if(e)e.textContent=m}
function backupDownload(){
 try{
  const blob=new Blob([JSON.stringify(S,null,2)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);a.download="clm-daily-backup-"+today()+".json";
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  setMsg("Backup downloaded.");
 }catch(e){setMsg("Download isn\u2019t available here. Use Copy instead.")}
}
async function backupCopy(){
 const txt=JSON.stringify(S);
 try{await navigator.clipboard.writeText(txt);setMsg("Copied. Paste it somewhere safe, like Notes.")}
 catch(e){const t=document.getElementById("btxt");if(t){t.value=txt;t.select();setMsg("Copy was blocked. The backup is in the box below: select all and copy it.")}}
}
function restoreFrom(txt){
 try{
  const o=JSON.parse(txt);
  if(!o||typeof o!=="object"||Array.isArray(o)||!("goal" in o||"groceries" in o||"seen" in o))throw 0;
  S=Object.assign({},S,o);save();applyAccent();selL=null;bmsg="Backup restored.";render();
 }catch(e){setMsg("That doesn’t look like a valid backup.")}
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pad=n=>String(n).padStart(2,"0");
const keyOf=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const today=()=>keyOf(new Date());
const dayNum=()=>{const d=new Date();return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5)};
function streak(map){let d=new Date(),n=0;if(!map[keyOf(d)])d.setDate(d.getDate()-1);while(map[keyOf(d)]){n++;d.setDate(d.getDate()-1)}return n}
let tab=(location.hash||"#today").slice(1);if(!["today","news","vocab","topic","quote","groceries","stretch","settings"].includes(tab))tab="today";
let timer=null,stepI=0,selL=null,bmsg="",moreOpen=false;
let rt=null,rtI=null,rtMsg="",ac=null,wake=null;
// Short tone. The audio context is unlocked by the tap that starts a timer (iPhone requires that).
function unlockAudio(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;ac=ac||new C();if(ac.state==="suspended")ac.resume()}catch(e){}}
function beep(f=880,ms=300){
 if(navigator.vibrate)try{navigator.vibrate(ms)}catch(e){}
 if(!ac)return;try{const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;o.connect(g);g.connect(ac.destination);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.35,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+ms/1000);o.start(t);o.stop(t+ms/1000+.05)}catch(e){}
}
async function keepAwake(on){try{if(on&&!wake&&navigator.wakeLock)wake=await navigator.wakeLock.request("screen");else if(!on&&wake){await wake.release();wake=null}}catch(e){}}
const REST=5;
function rtStart(){unlockAudio();rt={phase:"work",n:STRETCHES[stepI][2],paused:false};rtMsg="";keepAwake(true);clearInterval(rtI);rtI=setInterval(rtTick,1000);render()}
function rtStop(msg){clearInterval(rtI);rtI=null;rt=null;keepAwake(false);rtMsg=msg||"";render()}
function rtTick(){
 if(!rt||rt.paused)return;
 rt.n--;
 const tm=$("#tm");if(tm)tm.textContent=Math.max(rt.n,0)+"s";
 if(rt.n>0)return;
 if(rt.phase==="work"){
  beep(880,350);
  if(stepI>=STRETCHES.length-1){S.stretchDone[today()]=true;save();stepI=0;return rtStop("Routine complete. Marked done for today.")}
  stepI++;rt={phase:"rest",n:REST,paused:false};
 }else{beep(660,180);rt={phase:"work",n:STRETCHES[stepI][2],paused:false}}
 render();
}
function stopTimer(){if(timer){clearInterval(timer);timer=null}}
const $=s=>document.querySelector(s);
let shown=null;
function render(){
 stopTimer();
 renderNav();
 const app=$("#app");
 if(shown!==tab){app.classList.remove("fade");void app.offsetWidth;app.classList.add("fade");shown=tab}
 app.innerHTML=({today:vToday,news:vNews,vocab:vVocab,topic:vTopic,quote:vQuote,groceries:vGroceries,stretch:vStretch,settings:vSettings})[tab]();
 if(tab==="groceries")bindGroceries();
}
function pickToday(){
 const t=today(),c=S.vday;
 if(c&&c.date===t&&(c.level===S.level||c.stage!=="learn"))return c;
 const pool=LEVELS[S.level];
 let free=pool.filter(i=>!S.seen[WORDS[i][0]]);
 if(!free.length){pool.forEach(i=>delete S.seen[WORDS[i][0]]);free=pool.slice()}
 const idx=free[dayNum()%free.length];
 const others=pool.filter(i=>i!==idx).sort(()=>Math.random()-.5).slice(0,3);
 const opts=others.concat(idx).sort(()=>Math.random()-.5);
 S.vday={date:t,level:S.level,idx,opts,stage:"learn",pick:null};
 save();return S.vday;
}
const weekNum=()=>Math.floor((dayNum()+3)/7);
function curTopic(){
 const wk=weekNum();
 if(S.tOver&&S.tOver.w===wk)return S.tOver.i;
 if(S.tShift===null){S.tShift=(7-wk%7)%7;save()}
 return (wk+S.tShift)%7;
}
// Same answer order all week for a lesson, so the right answer isn't always in one spot.
function order(n,seed){const a=[...Array(n).keys()];let x=seed%233280;for(let i=n-1;i>0;i--){x=(x*9301+49297)%233280;const j=Math.floor(x/233280*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const lessonsDone=(wk,ti)=>[0,1,2,3,4].filter(l=>S.tProg[wk+":"+ti+":"+l]).length;
function curL(){
 if(selL!==null)return selL;
 const d=(dayNum()+3)%7;if(d<5)return d;
 const wk=weekNum(),ti=curTopic();
 for(let l=0;l<5;l++)if(!S.tProg[wk+":"+ti+":"+l])return l;
 return 4;
}
function vTopic(){
 const wk=weekNum(),ti=curTopic(),T=TOPICS[ti],li=curL(),L=T.l[li],P=S.tProg[wk+":"+ti+":"+li];
 const chips=T.l.map((x,i)=>{const d=!!S.tProg[wk+":"+ti+":"+i];return `<button class="alt lz${d?" done":""}" data-act="les" data-l="${i}" aria-pressed="${i===li}" aria-label="Lesson ${i+1}${d?", done":""}">${i+1}${d?CHECK:""}</button>`}).join("");
 const opts=order(L[3].length,wk*7+ti*5+li).map(i=>`<button class="opt" data-act="ans" data-o="${i}">${esc(L[3][i])}</button>`).join("");
 const res=P?`<p class="done-tag" style="margin:14px 0 4px">${P.pick===L[4]?"Correct":"Not quite"}</p><p style="margin:0">The answer: ${esc(L[3][L[4]])}. ${esc(L[5])}</p>`:opts;
 const sk=streak(S.topicDone);
 return `<h1>Weekly topic: ${esc(T.n)}</h1>
 <p class="sub" style="margin:-6px 0 12px">${lessonsDone(wk,ti)} of 5 done this week${sk?` · ${sk}-day streak`:""}</p>
 <div class="row lessons" style="margin:0 0 14px">${chips}</div>
 <div class="card"><p class="pos" style="margin:0 0 4px">Lesson ${li+1} of 5</p><h2 style="font-size:26px;margin:0 0 10px;line-height:1.15">${esc(L[0])}</h2><p style="margin:0">${esc(L[1])}</p></div>
 <div class="card sec"><h2>Knowledge check</h2><p style="margin:6px 0 0">${esc(L[2])}</p>${res}</div>
 <div class="sec"><p class="sub">Switch topic</p><div class="row" style="flex-wrap:wrap;margin-top:8px">${TOPICS.map((x,i)=>`<button class="alt" data-act="topic" data-t="${i}" aria-pressed="${i===ti}" style="flex:none;padding:8px 12px;min-height:40px">${esc(x.n)}</button>`).join("")}</div></div>`;
}
function vNews(){
 const N=NEWS,stale=N.date!==today(),read=!!S.newsRead[today()];
 const card=x=>`<article class="card sec story"><h2>${esc(x.h)}</h2><p class="why"><b>Why it matters:</b> ${esc(x.y)}</p><p class="what">${esc(x.w)}</p>${x.p?`<details class="sides"><summary>Who’s saying what</summary><p>${esc(x.p)}</p></details>`:""}<p class="src">Sources: ${x.s.map(esc).join(", ")}</p></article>`;
 const sec=(t,r)=>`<h2 class="lbl">${t}</h2>${N.items.filter(i=>i.r===r).map(card).join("")}`;
 return `<h1>Daily brief · about ${readMin()} min</h1>
 ${stale?`<div class="card" style="border-color:var(--warm)"><p style="margin:0"><b>This brief is from ${esc(N.label)}.</b> Today’s update hasn’t arrived yet. It usually comes early in the morning.</p></div>`:`<p class="sub">Updated ${esc(N.label)}</p>`}
 ${sec("United States","US")}${sec("World","W")}
 <div class="card sec"><h2>Also noted</h2><ul style="margin:8px 0 0;padding-left:18px;list-style:disc">${N.also.map(a=>`<li style="margin:6px 0">${esc(a)}</li>`).join("")}</ul></div>
 <div class="card sec"><h2>Reading tip</h2><p style="margin:6px 0 0">${esc(N.tip)}</p></div>
 <div class="row"><button class="main" data-act="read">${read?"Read today ✓":"Mark as read"}</button></div>`;
}
function vQuote(){
 const i=dayNum()%QUOTES.length,q=QUOTES[i],fav=!!S.favQ[i];
 const favs=Object.keys(S.favQ).map(Number).filter(k=>QUOTES[k]);
 return `<h1>Quote of the day</h1>
 <div class="card"><p class="def" style="font-size:24px;font-weight:600;line-height:1.3;margin:0 0 12px">“${esc(q[0])}”</p><p class="pos" style="margin:0">${esc(q[1])}, ${esc(q[2])}</p>
 <div class="row"><button class="alt" data-act="fav" data-i="${i}" aria-pressed="${fav}">${fav?"Saved ✓":"Save quote"}</button></div></div>
 <div class="card sec"><h2>About ${esc(q[1])}</h2><p style="margin:6px 0 0">${esc(q[3])}</p></div>
 <div class="card sec"><h2>About the idea</h2><p style="margin:6px 0 0">${esc(q[4])}</p></div>
 <div class="card sec"><h2>Try it today</h2><p style="margin:6px 0 0">${esc(q[5])}</p></div>
 ${favs.length?`<div class="sec"><h2>Saved quotes</h2>${favs.map(k=>`<p class="ex" style="margin:12px 0">“${esc(QUOTES[k][0])}” <span class="sub">${esc(QUOTES[k][1])}</span></p>`).join("")}</div>`:""}`;
}
function vToday(){
 const v=pickToday(),w=WORDS[v.idx],h=new Date().getHours(),q=QUOTES[dayNum()%QUOTES.length];
 const hi=h<12?"Good morning":h<18?"Good afternoon":"Good evening";
 const date=new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});
 const vd=v.stage==="done",sd=!!S.stretchDone[today()],nd=!!S.newsRead[today()],td=!!S.topicDone[today()];
 const left=S.groceries.filter(x=>!x.d).length;
 const days=Object.keys(S.stretchDone).length,tgt=Math.max(1,+S.goal.target||30),TT=TOPICS[curTopic()],ld=lessonsDone(weekNum(),curTopic());
 const n=[nd,vd,td,sd].filter(Boolean).length,qs=!!S.favQ[dayNum()%QUOTES.length];
 const vs=vd?(v.pick===v.idx?"Done":"Review it"):v.stage==="quiz"?"Finish check":"Start";
 const habit=(k,title,sub,done,label)=>`<button class="trow habit${done?" done":""}" data-tab="${k}"><span class="chk">${done?CHECK:""}</span><span class="tx"><b>${title}</b><span class="sub">${sub}</span></span><span class="${done?"done-tag":"go"}">${label}</span></button>`;
 const row=(k,title,sub)=>`<button class="trow" data-tab="${k}"><span class="tx"><b>${title}</b><span class="sub clamp">${sub}</span></span><span class="go">Open</span></button>`;
 return `<h1>${date}</h1><div class="hero"><div><p class="word" style="font-size:34px;margin:0 0 4px">${hi}</p><p class="sub">${n===4?"All four habits done today":n+" of 4 daily habits done"}</p></div>${ring(n,4)}</div>
 ${n===4?`<div class="card note" role="status" style="margin-top:16px"><span class="chk on">${CHECK}</span><span><b>All done for today.</b> Nice work. Come back tomorrow for a new word, lesson and brief.</span></div>`:""}
 <h2 class="lbl">Daily habits</h2>
 ${habit("news","Daily news",`${NEWS.items.length} stories · about ${readMin()} min${NEWS.date!==today()?" · not updated yet":""}`,nd,nd?"Read":"Open")}
 ${habit("vocab","Today’s word",esc(w[0]),vd,vs)}
 ${habit("topic",`Weekly topic: ${esc(TT.n)}`,`${ld} of 5 lessons done this week`,td,td?"Done":"Start")}
 ${habit("stretch","Toe-touch routine",`${streak(S.stretchDone)}-day streak · ${days} of ${tgt} days to goal`,sd,sd?"Done":"Start")}
 <h2 class="lbl">Also today</h2>
 ${row("quote",`Quote of the day${qs?` <span class="tag">Saved</span>`:""}`,`“${esc(q[0])}” ${esc(q[1])}`)}
 ${row("groceries","Groceries",`${left} item${left===1?"":"s"} left to buy`)}`;
}
function vSettings(){
 return `<h1>Settings</h1><div class="card"><h2 style="font-size:17px;margin:0">Theme</h2><div class="themes">${SKINS.map(k=>{const on=(S.skin||"parchment")===k[0];return `<button class="pv" data-skin="${k[0]}" data-act="skin" data-s="${k[0]}" aria-pressed="${on}" aria-label="${k[1]} theme: ${k[2]}"><span class="pv-card"><span class="pv-h">Aa</span><span class="pv-dot">${on?CHECK:""}</span></span><span class="pv-name">${k[1]}</span><span class="pv-sub">${k[2]}</span></button>`}).join("")}</div></div><div class="card sec"><h2>Bottom bar</h2><p class="sub" style="margin:0">Today is always pinned. Pick up to 3 more tabs for the bar. The rest go under More.</p><div class="row" style="flex-wrap:wrap;gap:8px;margin-top:8px">${Object.keys(TABS).filter(k=>k!=="today").map(k=>`<button class="alt" data-act="pin" data-k="${k}" aria-pressed="${pins().includes(k)}" style="flex:none;padding:8px 12px;min-height:40px">${TABS[k][0]}</button>`).join("")}</div></div><div class="card sec"><h2>Accent color</h2>${vAccent()}</div><div class="card sec"><h2>Backup and restore</h2>${vBackup()}</div>`;
}
function vBackup(){
 return `<p class="sub" style="margin:0">Saves your progress, groceries, streaks and settings. Use it to move to a new phone.</p>
 <div class="row" style="margin-top:10px"><button class="alt" data-act="bdl">Download</button><button class="alt" data-act="bcopy">Copy</button></div>
 <p class="sub" id="bmsg" role="status" style="margin:8px 0 0">${bmsg?esc(bmsg):""}</p>
 <h2 style="font-size:15px;margin:18px 0 0">Restore</h2>
 <div class="row" style="margin-top:8px"><label class="btn" for="bfile">Choose backup file</label></div><input type="file" id="bfile" class="vh" accept=".json,application/json">
 <textarea id="btxt" placeholder="Or paste a backup here" aria-label="Paste backup" style="width:100%;min-height:70px;font:inherit;font-size:14px;padding:10px;margin-top:10px;border-radius:var(--r);border:1px solid var(--line);background:var(--surface);color:var(--ink)"></textarea>
 <div class="row" style="margin-top:8px"><button class="alt" data-act="brestore">Restore from pasted backup</button></div>`;
}
function vAccent(){
 return `<p class="sub" style="margin:0">Used for buttons, checks and highlights.</p><div class="row" style="flex-wrap:wrap;gap:10px;margin-top:10px;align-items:center">${SW.map(c=>`<button class="sw" data-act="acc" data-c="${c}" aria-label="Accent ${c}" aria-pressed="${S.accent===c}" style="background:${c}"></button>`).join("")}<input type="color" id="accc" value="${S.accent||"#2f5d46"}" aria-label="Custom accent color"><button class="alt" data-act="accreset" style="flex:none">Reset</button></div>`;
}
function vVocab(){
 const v=pickToday(),w=WORDS[v.idx];
 const head=`<p class="word">${esc(w[0])}</p><p class="pos">${esc(w[1])}</p>`;
 const full=head+`<p class="def">${esc(w[2])}</p><p class="ex">${esc(w[3])}</p>`;
 let body="";
 if(v.stage==="learn")body=`<h1>Today’s word</h1><div class="card">${full}<div class="row"><button class="main" data-act="quiz">Take the quick check</button></div></div>`;
 else if(v.stage==="quiz")body=`<h1>Quick check</h1><div class="card">${head}<p class="def" style="font-size:18px">Which meaning fits?</p>${v.opts.map(i=>`<button class="opt" data-pick="${i}">${esc(WORDS[i][2])}</button>`).join("")}</div>`;
 else{
  const ok=v.pick===v.idx,r=S.recent,hits=r.filter(Boolean).length;
  let tip="";
  if(r.length>=5&&hits===5&&S.level<3)tip=`<div class="row"><button class="alt" data-act="lvl" data-lv="${S.level+1}">5 in a row. Try harder words</button></div>`;
  else if(r.length>=5&&hits<=1&&S.level>1)tip=`<div class="row"><button class="alt" data-act="lvl" data-lv="${S.level-1}">Try easier words</button></div>`;
  body=`<h1>Today’s word</h1><div class="card"><p class="done-tag">${ok?"Correct":"Not quite. Review it below."}</p>${full}</div>${tip}<p class="sub" style="margin-top:12px">Come back tomorrow for a new word.</p>`;
 }
 const note=v.level!==S.level&&v.stage!=="learn"?" (changes tomorrow)":"";
 return body+`<div class="sec"><p class="sub">Word level${note}</p><div class="seg">${[1,2,3].map(n=>`<button class="alt" data-act="lvl" data-lv="${n}" aria-pressed="${S.level===n}">${LNAME[n]}</button>`).join("")}</div></div>
 <div class="stats"><span><b>${Object.keys(S.seen).length}</b> words learned</span><span><b>${streak(S.vocabDone)}</b> day streak</span></div>`;
}
function vGroceries(){
 const g=S.groceries,left=g.filter(x=>!x.d).length,on=new Set(g.filter(x=>!x.d).map(x=>x.t.toLowerCase()));
 const sug=Object.values(S.gHist||{}).filter(h=>!on.has(h.t.toLowerCase())).sort((a,b)=>b.n-a.n||b.last-a.last).slice(0,8);
 const chips=sug.length?`<div class="sec"><p class="sub">Quick add</p><div class="row" style="flex-wrap:wrap;gap:8px;margin-top:8px">${sug.map(h=>`<button class="alt chip" data-act="qadd" data-t="${esc(h.t)}">+ ${esc(h.t)}</button>`).join("")}</div></div>`:"";
 return `<h1>Groceries</h1>
 <div class="row" style="margin-top:0"><input type="text" id="gi" placeholder="Add items: milk, eggs…" aria-label="Add items" autocomplete="off" enterkeyhint="done"><button class="main" data-act="add" style="flex:none">Add</button></div>
 ${g.length?`<ul>${g.map(x=>`<li class="g ${x.d?"done":""}"><label><input type="checkbox" data-id="${x.id}" ${x.d?"checked":""}><span>${esc(x.t)}</span></label><button data-del="${x.id}" aria-label="Remove ${esc(x.t)}">\u00d7</button></li>`).join("")}</ul>
 <div class="row" style="align-items:center;justify-content:space-between"><span class="sub"><b style="color:var(--ink)">${left}</b> left to buy</span>${g.some(x=>x.d)?`<button class="alt" data-act="clear" style="flex:none">Clear checked</button>`:""}</div>`
 :`<p class="empty">Your list is empty.${sug.length?" Tap an item below to add it back.":" Add what you need this week. You can add several at once, like: milk, eggs, bread."}</p>`}
 ${chips}`;
}
function bindGroceries(){
 const el=$("#gi");el.addEventListener("keydown",e=>{if(e.key==="Enter")addG()});
}
// Adds one item, or brings back a checked one with the same name. Remembers it for Quick add.
function addItem(t){
 t=t.replace(/\s+/g," ").trim();if(!t)return;
 const k=t.toLowerCase(),ex=S.groceries.find(x=>x.t.toLowerCase()===k);
 if(ex)ex.d=false;
 else S.groceries.unshift({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),t,d:false});
 const h=S.gHist||(S.gHist={});h[k]={t,n:((h[k]&&h[k].n)||0)+1,last:Date.now()};
}
function addG(){
 const el=$("#gi"),v=el.value;if(!v.trim())return;
 v.split(/[,\n;]/).reverse().forEach(addItem); // reversed so the list keeps the typed order
 save();render();$("#gi").focus();
}
function vStretch(){
 const s=STRETCHES[stepI],done=!!S.stretchDone[today()];
 const days=Object.keys(S.stretchDone).length,g=S.goal,tgt=Math.max(1,+g.target||30);
 const pct=Math.min(100,Math.round(days/tgt*100));
 const rest=rt&&rt.phase==="rest";
 const top=rt
  ?`<div class="card${rest?" resting":""}"><p class="pos" style="margin:0 0 4px">${rest?"Get ready. Up next:":"Now"}</p><p class="word" style="font-size:34px">${esc(s[0])}</p>
 <p class="def" style="font-size:18px">${esc(s[1])}</p>
 <p class="timer" id="tm" aria-live="off">${rt.n}s</p>
 <div class="row"><button class="alt" data-act="rtpause">${rt.paused?"Resume":"Pause"}</button><button class="alt" data-act="rtskip">Skip</button><button class="alt" data-act="rtstop">Stop</button></div></div>`
  :`<div class="card"><p class="word" style="font-size:34px">${esc(s[0])}</p>
 <p class="def" style="font-size:18px">${esc(s[1])}</p>
 <p class="timer" id="tm" aria-live="off">${s[2]}s</p>
 <div class="row"><button class="main" data-act="rtstart">${stepI?"Start routine from here":"Start routine"}</button></div>
 <div class="row" style="margin-top:10px"><button class="alt" id="go" data-act="timer" data-sec="${s[2]}">Timer</button><button class="alt" data-act="step">Next step</button></div></div>
 <div class="row"><button class="alt" data-act="sdone">${done?"Done today \u2713":"Mark done for today"}</button></div>`;
 return `<h1>Toe-touch routine: step ${stepI+1} of ${STRETCHES.length}</h1>
 ${rtMsg?`<div class="card note" role="status" style="margin-bottom:14px"><span class="chk on">${CHECK}</span><span>${esc(rtMsg)}</span></div>`:""}
 ${top}
 ${rt?`<p class="sub" style="margin-top:12px">A tone plays at the end of each step, with ${REST} seconds to get ready for the next. On iPhone, turn off silent mode to hear it.</p>`:""}
 <div class="card sec"><h2>Long-term goal</h2>
 <div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
 <p class="sub"><b style="color:var(--ink)">${days} of ${tgt} days</b>${days>=tgt?". Goal reached!":""} · ${streak(S.stretchDone)}-day streak</p>
 <input type="text" id="gt" value="${esc(g.text)}" placeholder="e.g. Touch my toes" aria-label="Goal" style="margin-top:14px">
 <div class="two"><span class="sub" style="align-self:center">Target days of stretching</span><input type="number" id="gn" min="1" value="${tgt}" aria-label="Target days"></div></div>`;
}
document.addEventListener("click",e=>{
 const t=e.target.closest("button,.scrim");if(!t)return;
 if(t.dataset.tab){if(rt&&t.dataset.tab!=="stretch")rtStop();rtMsg="";moreOpen=false;tab=t.dataset.tab;history.replaceState(null,"","#"+tab);render();window.scrollTo(0,0);return}
 if(t.dataset.del){S.groceries=S.groceries.filter(x=>x.id!==t.dataset.del);save();render();return}
 if(t.dataset.pick){const v=S.vday;if(v&&v.stage==="quiz"){v.pick=+t.dataset.pick;v.stage="done";S.recent.push(v.pick===v.idx);S.recent=S.recent.slice(-5);S.wc=Math.max(S.wc||0,Object.keys(S.seen).length)+1;S.seen[WORDS[v.idx][0]]=true;S.vocabDone[today()]=true;save();render()}return}
 const a=t.dataset.act;if(!a)return;
 if(a==="quiz"){S.vday.stage="quiz";save();render()}
 else if(a==="lvl"){S.level=+t.dataset.lv;S.recent=[];save();render()}
 else if(a==="fav"){const k=t.dataset.i;if(S.favQ[k])delete S.favQ[k];else S.favQ[k]=true;save();render()}
 else if(a==="les"){selL=+t.dataset.l;render()}
 else if(a==="ans"){const k=weekNum()+":"+curTopic()+":"+curL();if(!S.tProg[k]){S.tProg[k]={pick:+t.dataset.o};S.topicDone[today()]=true;save()}render()}
 else if(a==="topic"){S.tOver={w:weekNum(),i:+t.dataset.t};selL=null;save();render()}
 else if(a==="read"){S.newsRead[today()]=!S.newsRead[today()];save();render()}
 else if(a==="acc"){S.accent=t.dataset.c;save();applyAccent();render()}
 else if(a==="accreset"){S.accent=null;save();applyAccent();render()}
 else if(a==="skin"){S.skin=t.dataset.s;save();applySkin();render()}
 else if(a==="more"){moreOpen=!moreOpen;renderNav()}
 else if(a==="pin"){const k=t.dataset.k;let p=pins().slice();if(p.includes(k))p=p.filter(x=>x!==k);else{p.push(k);if(p.length>3)p.shift()}S.pins=p;save();render()}
 else if(a==="bdl")backupDownload();
 else if(a==="bcopy")backupCopy();
 else if(a==="brestore"){const v=document.getElementById("btxt").value.trim();if(v)restoreFrom(v);else setMsg("Paste a backup first.")}
 else if(a==="add")addG();
 else if(a==="qadd"){addItem(t.dataset.t);save();render()}
 else if(a==="rtstart")rtStart();
 else if(a==="rtstop")rtStop();
 else if(a==="rtpause"){if(rt){rt.paused=!rt.paused;render()}}
 else if(a==="rtskip"){if(rt){rt.n=1;rt.paused=false;rtTick()}}
 else if(a==="step"){stepI=(stepI+1)%STRETCHES.length;rtMsg="";render()}
 else if(a==="clear"){S.groceries=S.groceries.filter(x=>!x.d);save();render()}
 else if(a==="sdone"){if(S.stretchDone[today()])delete S.stretchDone[today()];else S.stretchDone[today()]=true;save();render()}
 else if(a==="timer"){
  if(timer){stopTimer();t.textContent="Start timer";return}
  unlockAudio();let n=+t.dataset.sec;t.textContent="Stop";
  timer=setInterval(()=>{n--;const tm=$("#tm");if(tm)tm.textContent=Math.max(n,0)+"s";
   if(n<=0){stopTimer();t.textContent="Timer";beep(880,350)}},1000);
 }
});
document.addEventListener("change",e=>{
 const c=e.target;
 if(c.dataset&&c.dataset.id){const x=S.groceries.find(i=>i.id===c.dataset.id);if(x){x.d=c.checked;save();render()}}
 else if(c.id==="bfile"){const f=c.files&&c.files[0];if(f){const r=new FileReader();r.onload=()=>restoreFrom(String(r.result));r.readAsText(f)}}
 else if(c.id==="accc"){S.accent=c.value;save();applyAccent();render()}
 else if(c.id==="gt"){S.goal.text=c.value.trim();save()}
 else if(c.id==="gn"){S.goal.target=Math.max(1,parseInt(c.value)||30);save();render()}
});
window.addEventListener("hashchange",()=>{const h=location.hash.slice(1);if(["today","news","vocab","topic","quote","groceries","stretch","settings"].includes(h)&&h!==tab){if(rt&&h!=="stretch")rtStop();tab=h;render()}});
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&rt)keepAwake(true)});
applySkin();applyAccent();render();

if("serviceWorker" in navigator&&location.protocol.indexOf("http")===0){
 window.addEventListener("load",()=>{navigator.serviceWorker.register("sw.js").catch(()=>{})});
}
