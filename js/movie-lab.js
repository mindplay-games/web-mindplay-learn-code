/* Interactive browser simulation of the Year C Flask movie project. No Python runs on GitHub Pages. */
(() => {
  const STORE = 'mindplay.movieArchitectureLab.v2.seven';
  const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScKmgVwoDWkDnnl22cZOdMjt2wWyKbkJV41K1By4g4HMWF5Cw/viewform';
  const movies = [
    {name:'Shrek',type:'movie',genre:'comedy',length:90,emoji:'🧅'}, {name:'Toy Story',type:'movie',genre:'animation',length:81,emoji:'🧸'},
    {name:'The Incredibles',type:'movie',genre:'action',length:115,emoji:'🦸'}, {name:'Spirited Away',type:'movie',genre:'fantasy',length:125,emoji:'🐉'},
    {name:'Brooklyn Nine-Nine',type:'series',genre:'comedy',length:25,emoji:'👮'}, {name:'Avatar: The Last Airbender',type:'series',genre:'animation',length:23,emoji:'🌊'},
    {name:'The Mandalorian',type:'series',genre:'action',length:40,emoji:'🚀'}, {name:'Wednesday',type:'series',genre:'fantasy',length:45,emoji:'🕷️'},
    {name:'Paddington',type:'movie',genre:'comedy',length:95,emoji:'🐻'}, {name:'Arcane',type:'series',genre:'animation',length:42,emoji:'✨'}
  ];
  const genreHe={comedy:'קומדיה',action:'אקשן',animation:'אנימציה',fantasy:'פנטזיה'};
  const typeHe={movie:'סרט',series:'סדרה'};
  const questions = [
    {id:'arch_frontend',module:0,topic:'ארכיטקטורה',title:'מה נמצא בצד של המשתמש?',objective:'לזהות frontend.',type:'choice',prompt:'איזה חלק מציג את הטופס שהילד/ה רואה?',options:['index.html בדפדפן','movie_data.json','לולאת for ב-main.py','print(movie["name"])'],answer:0,explain:'נכון! index.html נשלח לדפדפן ומציג את הטופס.'},
    {id:'html_name',module:1,topic:'טופס HTML',title:'מה נשלח?',objective:'להבדיל בין טקסט נראה לבין value.',type:'choice',prompt:'כאשר בוחרים באפשרות שמוצגת כ״קומדיה״ עם value="comedy", מה נשלח?',options:['genre → קומדיה','comedy → genre','genre → comedy','value → קומדיה'],answer:2,explain:'נכון: name="genre" הוא המפתח, ו-value="comedy" הוא הערך. הטקסט ״קומדיה״ רק מוצג.'},
    {id:'post_order',module:2,topic:'בקשת POST',title:'סדרו את מסע ה־POST',objective:'לעקוב אחר הבקשה מהדפדפן לשרת.',type:'order',prompt:'סדרו את ארבעת השלבים הראשונים.',items:['Flask מוצא את /choice','נלחץ submit','הדפדפן שולח POST ל-/choice','ממלאים טופס'],answer:['ממלאים טופס','נלחץ submit','הדפדפן שולח POST ל-/choice','Flask מוצא את /choice'],explain:'זו בקשה: ממלאים, שולחים, Flask מקבל ומתאים נתיב.'},
    {id:'request_key',module:3,topic:'request.form ומשתנים',title:'השלימו את המפתח',objective:'להשתמש במפתח HTML נכון.',type:'fill',promptParts:['data_genre = request.form["','"]'],answer:['genre'],bank:['genre','data_genre','comedy','movie'],explain:'נכון. המפתח genre חייב להתאים ל-name="genre" שב־HTML.'},
    {id:'json_key',module:4,topic:'JSON ומילונים',title:'איזה מפתח נבחר?',objective:'לקרוא ערך ממילון סרט.',type:'choice',prompt:'כדי לקבל את משך הסרט מהדוגמה movie, מה נכתוב?',options:['movie["length"]','request.form["length"]','data_length["movie"]','movie.length'],answer:0,explain:'נכון. movie הוא מילון שנקרא מה־JSON, ולכן משתמשים movie["length"].'},
    {id:'and_operator',module:5,topic:'סינון סרטים',title:'כל התנאים יחד',objective:'להבין and.',type:'choice',prompt:'סרט הוא comedy ו-movie, אבל אורכו 95 והבחירה היא 90. האם הוא מתקבל?',options:['כן, שני התנאים הראשונים נכונים','לא, כי 95 <= 90 הוא False ו-and דורש הכול True','כן, length הוא תמיד טקסט','לא, כי comedy שונה מ-comedy'],answer:1,explain:'נכון. and מחזיר True רק כאשר כל ההשוואות נכונות.'},
    {id:'response_debug',module:6,topic:'תגובה ודיבוג',title:'לאן הולך print?',objective:'להבדיל בין פלט שרת לתגובה.',type:'choice',prompt:'בקוד המקורי print(movie["name"]) ואז return data_type. מה רואה הדפדפן?',options:['את כל שמות הסרטים','רק movie_data.json','את הערך data_type, למשל movie','שום דבר כי print עוצר את Flask'],answer:2,explain:'נכון. print מופיע במסוף השרת. התגובה לדפדפן היא data_type בלבד.'}
  ];
  const projectCode={
    arch_frontend:['index.html → Browser | main.py → Flask server', '<form action="/choice" method="POST">\n  <button type="submit">Find a movie</button>\n</form>'],
    html_name:['index.html', '<select name="genre">\n  <option value="comedy">קומדיה</option>\n</select>'],
    post_order:['index.html / main.py', '<form action="/choice" method="POST">…</form>\n\n@app.route("/choice", methods=["POST"])\ndef choice():\n    data_genre = request.form["genre"]'],
    request_key:['main.py — Flask', 'data_genre = request.form["genre"]'],
    json_key:['movie_data.json / main.py', '{"name": "Shrek", "genre": "comedy", "length": 90}\n\nmovie["length"]'],
    and_operator:['main.py — Python', 'data_length = int(request.form["length"])\nif (movie["genre"] == data_genre\n    and movie["type"] == data_type\n    and movie["length"] <= data_length):\n    print(movie["name"])'],
    response_debug:['main.py — Flask', 'print(movie["name"])  # server console\nreturn data_type      # browser response']
  };
  const modules=['1. ארכיטקטורה','2. טופס HTML','3. מסע POST','4. request.form','5. JSON ומילונים','6. סינון','7. תגובה ודיבוג'];
  let state = load() || {studentId:'',studentClass:'',startedAt:null,index:0,answers:{},submissionId:''};
  state.answers ||= {}; state.submissionId ||= (crypto.randomUUID ? crypto.randomUUID() : `movie-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  if(!state.firstNameOnly){
    if(state.emailVersion!==1)state.studentId=String(state.studentId||'').trim().split(/\s+/)[0];
    state.firstNameOnly=true;
  }
  delete state.pendingSubmission;delete state.submitted;
  delete state.pendingEmail;delete state.emailSent;delete state.emailVersion;
  // Older releases retained only the last answer. Keep it without inventing history.
  for(const r of Object.values(state.answers)){
    if(!Array.isArray(r.history)){
      r.history=[{number:r.attempts,answer:r.answer,correct:r.correct===true}];
      r.historyMissing=Math.max(0,(r.attempts||1)-1);
    }
  }
  const $=id=>document.getElementById(id);
  function load(){try{return JSON.parse(localStorage.getItem(STORE))}catch{return null}}
  function save(){localStorage.setItem(STORE,JSON.stringify(state))}
  function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
  function current(){return questions[state.index]}
  function begin(){state.studentId=$('studentId').value.trim().replace(/[\u0000-\u001F]/g,' ').replace(/\s+/g,' ');state.studentClass=$('studentClass').value.trim();const msg=$('identityFeedback');if(!/[\p{L}]/u.test(state.studentId)||state.studentId.length>60){msg.className='labFeedback bad';msg.textContent='כתבו את השם הפרטי שלכם.';return}if(!/^\d{1,8}$/.test(state.studentClass)){msg.className='labFeedback bad';msg.textContent='מספר הקבוצה צריך להכיל ספרות בלבד.';return}msg.textContent='';state.startedAt=state.startedAt||Date.now();save();$('intro').hidden=true;$('lab').hidden=false;render()}
  function renderTabs(){
    const active=current().module;
    $('moduleSummary').textContent=`תחנה ${active+1} מתוך 7 · ${modules[active].replace(/^\d+\. /,'')}`;
    $('moduleTabs').innerHTML=modules.map((m,i)=>{
      const done=questions.filter(q=>q.module===i).every(q=>state.answers[q.id]?.correct===true);
      return `<button class="btn btnGhost ${i===active?'active':''} ${done?'done':''}" type="button" data-m="${i}" ${i===active?'aria-current="step"':''}><span class="stepNumber" aria-hidden="true">${done?'✓':i+1}</span><span>${rich(m.replace(/^\d+\. /,''))}</span><span class="srOnly">תחנה ${i+1} מתוך 7${done?' — הושלמה':''}</span></button>`;
    }).join('');
    [...$('moduleTabs').querySelectorAll('button')].forEach(b=>b.onclick=()=>{const target=questions.findIndex(q=>q.module===+b.dataset.m);if(target>=0&&questions.slice(0,target).every(q=>state.answers[q.id]?.correct===true)){state.index=target;save();if(matchMedia('(max-width:850px)').matches)$('moduleNavigator').open=false;render();$('questionTitle').focus()}});
  }
  // Isolate technical tokens so Hebrew prose keeps its natural reading order.
  function rich(text){
    const tokens=/(?:[A-Za-z_][A-Za-z_0-9.]*\["[A-Za-z_]+"\]|(?:name|value)="[A-Za-z_]+"|\/?[A-Za-z_][A-Za-z_0-9.]*(?:\([^<>]*?\))?)/g;
    let html='',end=0;
    for(const match of String(text).matchAll(tokens)){html+=esc(text.slice(end,match.index))+`<bdi dir="ltr">${esc(match[0])}</bdi>`;end=match.index+match[0].length}
    return html+esc(text.slice(end));
  }
  function routeDiagram(){return '<div class="dataRoute" aria-label="מסלול המידע: HTML, POST, Flask, משתני Python, JSON"><code>HTML</code><b aria-hidden="true">→</b><code>POST</code><b aria-hidden="true">→</b><code>Flask</code><b aria-hidden="true">→</b><code>Python</code><b aria-hidden="true">→</b><code>JSON</code></div>'}
  function render(){document.body.classList.add('labStarted');const q=current(), done=questions.filter(q=>state.answers[q.id]?.correct===true).length, score=Object.values(state.answers).reduce((n,x)=>n+(x.score||0),0), first=state.studentId.split(' ')[0];$('progressText').textContent=`הושלמו ${done} מתוך ${questions.length}`;$('scoreText').textContent=`${score} נקודות`;$('progressBar').style.width=`${done/questions.length*100}%`;$('progressBar').parentElement.setAttribute('aria-valuenow',done);$('topicBadge').innerHTML=rich(q.topic);$('questionCount').textContent=`שאלה ${state.index+1} מתוך ${questions.length} · ${first}`;$('questionTitle').textContent=q.title;$('objective').innerHTML=rich(`המטרה: ${q.objective}`);$('feedback').className='labFeedback';$('feedback').textContent='';$('nextQuestion').hidden=true;$('retryAnswer').hidden=true;$('checkAnswer').hidden=false;renderTabs();renderActivity(q);$('projectCodeLabel').textContent=projectCode[q.id][0];$('projectCode').textContent=projectCode[q.id][1]}
  function renderActivity(q){const a=$('activity');a.innerHTML='';delete a.dataset.complete;if(q.type==='choice'){a.innerHTML=`<p>${rich(q.prompt)}</p><div class="choiceGrid">${q.options.map((x,i)=>`<button class="option" data-v="${i}" aria-pressed="false"><span class="optionMark" aria-hidden="true">${i+1}</span><span class="answerText">${rich(x)}</span></button>`).join('')}</div>`;a.querySelectorAll('.option').forEach(b=>b.onclick=()=>{a.querySelectorAll('.option').forEach(x=>x.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed','true')})}
    else if(q.type==='match'){
      const rights=Object.values(q.pairs).sort(()=>Math.random()-.5);
      a.innerHTML=`<p>מי עושה מה? לכל קובץ או רכיב בחרו את התפקיד המתאים.</p><div class="matchGrid">${Object.keys(q.pairs).map((k,i)=>`<fieldset class="matchRow" data-k="${esc(k)}"><legend><code class="pairLabel">${esc(k)}</code></legend><div class="matchChoices">${rights.map(v=>`<label class="answerChoice"><input type="radio" name="match-${i}" value="${esc(v)}"><span>${rich(v)}</span></label>`).join('')}</div></fieldset>`).join('')}</div>`;
    }
    else if(q.type==='fill'){
      a.innerHTML=`<p>השלימו את הקוד. אפשר להקליד או לבחור מילה מהבנק.</p><pre class="codeBox" aria-label="דוגמת קוד עם מקומות להשלמה"><code>${q.promptParts.map((part,i)=>esc(part)+(i<q.answer.length?`<span class="codeSlot">[${i+1}]</span>`:'')).join('')}</code></pre><div class="fillFields">${q.answer.map((_,i)=>`<label for="fill-${i}">מה נכתוב במקום [${i+1}]?<input id="fill-${i}" class="fillInput" data-i="${i}" aria-label="השלמה ${i+1}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="הקלידו כאן את ההשלמה"></label>`).join('')}</div><div class="wordBank"><p>💡 בנק מילים · לחיצה תמלא את השדה הריק הבא</p><div class="choiceGrid">${q.bank.map(x=>`<button class="option" data-word="${esc(x)}"><bdi dir="auto">${esc(x)}</bdi></button>`).join('')}</div></div>`;
      a.querySelectorAll('[data-word]').forEach(b=>b.onclick=()=>{const e=[...a.querySelectorAll('.fillInput')].find(x=>!x.value);if(e){e.value=b.dataset.word;e.focus()}});
    }
    else if(q.type==='order'){
      const shuffled=[...q.items].sort(()=>Math.random()-.5);
      a.innerHTML=`<p>${rich(q.prompt)}</p>${routeDiagram()}<div class="flow" role="group" aria-label="סידור התחנות">${shuffled.map(x=>`<div class="flowRow" draggable="true" data-v="${esc(x)}"><span class="flowText">${rich(x)}</span><div class="moveButtons"><button type="button" class="up" aria-label="הזיזו את ${esc(x)} למעלה">↑</button><button type="button" class="down" aria-label="הזיזו את ${esc(x)} למטה">↓</button></div></div>`).join('')}</div><p class="mini">סדרו מלמעלה למטה. אפשר לגרור או להשתמש בכפתורי ↑ ↓ עם העכבר, המקלדת או במסך המגע.</p><div id="orderStatus" class="srOnly" role="status"></div>`;
      const announce=row=>$('orderStatus').textContent=`${row.dataset.v}: תחנה ${[...row.parentElement.children].indexOf(row)+1} מתוך ${q.items.length}`;
      let dragged=null;
      a.querySelectorAll('.flowRow').forEach(row=>{row.ondragstart=()=>dragged=row;row.ondragend=()=>dragged=null;row.ondragover=e=>e.preventDefault();row.ondrop=e=>{e.preventDefault();if(dragged&&dragged!==row){row.parentElement.insertBefore(dragged,row);announce(dragged)}}});
      a.querySelectorAll('.up,.down').forEach(b=>b.onclick=()=>{const row=b.closest('.flowRow');if(b.classList.contains('up')){const prev=row.previousElementSibling;if(prev)row.parentElement.insertBefore(row,prev)}else{const next=row.nextElementSibling;if(next)row.parentElement.insertBefore(next,row)}b.focus();announce(row)});
    }
    else if(q.type==='form') renderForm(a,q); else if(q.type==='journey') renderJourney(a,q); else if(q.type==='filter') renderFilter(a,q);
  }
  function renderForm(a,q){a.innerHTML=`<p>בחרו מה תרצו לראות, ואז גלו אילו נתונים הטופס שולח.</p><div class="filterControls"><label>מה תרצו?<select class="labSelect" id="fType"><option value="movie">סרט</option><option value="series">סדרה</option></select></label><label>איזה ז'אנר?<select class="labSelect" id="fGenre">${Object.entries(genreHe).map(([v,h])=>`<option value="${v}">${h}</option>`).join('')}</select></label><label>כמה זמן?<select class="labSelect" id="fLength"><option value="45">עד 45</option><option value="90">עד שעה וחצי</option><option value="150">יש לי זמן</option></select></label></div><button class="btn" id="formSend">מצאו לי משהו לראות</button><div id="formResult" class="kv" role="status" aria-label="הנתונים שנשלחו" hidden></div>`;$('formSend').onclick=()=>{const vals=[['type',$('fType').value],['genre',$('fGenre').value],['length',$('fLength').value]];$('formResult').hidden=false;$('formResult').innerHTML=vals.map(x=>`<b>${x[0]}</b><span>→ ${x[1]}</span>`).join('');a.dataset.complete='true'};}
  function renderJourney(a,q){
    const steps=['הטופס מלא: genre = comedy','POST נשלח אל /choice','Flask קורא request.form["genre"]','data_genre שומר "comedy"','לולאת for בודקת סרטים ב־JSON','Flask מחזיר response'];let i=0;
    a.innerHTML=`<p>לאן הבחירה שלנו עוברת? התקדמו תחנה אחת בכל לחיצה.</p>${routeDiagram()}<div class="journey" id="journey">${steps.map(s=>`<span>${rich(s)}</span>`).join('')}</div><div class="journeyNote" id="journeyCode" role="status"></div><button class="btn" id="journeyNext">לתחנה הבאה ←</button>`;
    const update=()=>{const text=['הדפדפן מחזיק את בחירת המשתמש/ת.','הבקשה מכילה נתונים, לא תשובה.','request.form הוא מילון של שדות שנשלחו.','כעת משתנה Python מחזיק את הערך.','movie הוא מילון אחר: נתון מה־JSON.','response חוזרת לדפדפן. המסע הושלם — אפשר לבדוק!'][i];$('journeyCode').innerHTML=rich(text);[...$('journey').children].forEach((x,n)=>{x.classList.toggle('current',n===i);if(n===i)x.setAttribute('aria-current','step');else x.removeAttribute('aria-current')});if(i===steps.length-1){a.dataset.complete='true';$('journeyNext').disabled=true;$('journeyNext').textContent='כל התחנות הושלמו ✓'}};
    update();$('journeyNext').onclick=()=>{if(i<steps.length-1)i++;update()};
  }
  function renderFilter(a,q){a.innerHTML=`<p>היו במאים לרגע! בחרו העדפות ובדקו אילו סרטים עומדים בכל שלושת התנאים.</p><details class="hint"><summary>💡 איך הסימולטור עובד?</summary><p>זהו מאגר תרגול קטן שנוצר למעבדה; מאגר 50 הסרטים המקורי אינו בפרויקט. החישוב זהה לקוד <bdi dir="ltr">Flask</bdi>: סוג, ז׳אנר ומשך צריכים להתאים יחד.</p></details><div class="filterControls"><label>סוג<select id="sType" class="labSelect"><option value="movie">סרט</option><option value="series">סדרה</option></select></label><label>ז׳אנר<select id="sGenre" class="labSelect">${Object.entries(genreHe).map(([v,h])=>`<option value="${v}">${h}</option>`).join('')}</select></label><label>מקסימום דקות<select id="sLength" class="labSelect"><option value="45">45</option><option value="90" selected>90</option><option value="150">150</option></select></label></div><button class="btn" id="runFilter">הריצו את הסינון</button><div class="movieGrid" id="movieResults" aria-live="polite"></div>`;const update=()=>{const type=$('sType').value,genre=$('sGenre').value,length=Number($('sLength').value);$('movieResults').innerHTML=movies.map(m=>{const checks=[m.genre===genre,m.type===type,m.length<=length],ok=checks.every(Boolean);return `<div class="movieCard ${ok?'good':'bad'}"><strong>${m.emoji} <bdi dir="ltr">${m.name}</bdi></strong><small>${genreHe[m.genre]} • ${typeHe[m.type]} • ${m.length} דק׳</small><div class="checks"><span>${m.genre} == ${genre} → ${checks[0]}</span><span>${m.type} == ${type} → ${checks[1]}</span><span>${m.length} <= ${length} → ${checks[2]}</span><b>${ok?'✓ מתקבל':'✕ לא מתקבל'}</b></div></div>`}).join('');a.dataset.complete='true'};$('runFilter').onclick=update}
  function validate(q){const a=$('activity');if(q.type==='choice'){return +a.querySelector('.option[aria-pressed="true"]')?.dataset.v===q.answer}if(q.type==='match'){return Object.entries(q.pairs).every(([k,v])=>a.querySelector(`[data-k="${CSS.escape(k)}"] input:checked`)?.value===v)}if(q.type==='fill'){return q.answer.every((x,i)=>a.querySelector(`[data-i="${i}"]`).value.trim()===x)}if(q.type==='order'){return [...a.querySelectorAll('.flowRow')].map(x=>x.dataset.v).join('|')===q.answer.join('|')}return a.dataset.complete==='true'}
  function responseFor(q){const a=$('activity');if(q.type==='choice')return a.querySelector('.option[aria-pressed="true"]')?.querySelector('.answerText').textContent.trim()||'';if(q.type==='match')return [...a.querySelectorAll('.matchRow')].map(x=>`${x.dataset.k}=${x.querySelector('input:checked')?.value||''}`).join('; ');if(q.type==='fill')return [...a.querySelectorAll('.fillInput')].map(x=>x.value.trim()).join(', ');if(q.type==='order')return [...a.querySelectorAll('.flowRow')].map(x=>x.dataset.v).join(' → ');return a.dataset.complete==='true'?'הסימולציה הופעלה':''}
  function expectedFor(q){if(q.type==='choice')return q.options[q.answer];if(q.type==='match')return Object.entries(q.pairs).map(([k,v])=>`${k}=${v}`).join('; ');if(q.type==='fill')return q.answer.join(', ');if(q.type==='order')return q.answer.join(' → ');return 'הפעלת הסימולציה'}
  function check(){
    const q=current(),prior=state.answers[q.id];
    if(prior?.correct===true){$('nextQuestion').hidden=false;$('checkAnswer').hidden=true;return}
    const ok=validate(q),answer=responseFor(q),attempts=(prior?.attempts||0)+1;
    state.answers[q.id]={correct:ok,attempts,topic:q.topic,answer,expected:expectedFor(q),score:prior?prior.score:(ok?1:0),history:[...(prior?.history||[]),{number:attempts,answer,correct:ok}],historyMissing:prior?.historyMissing||0};
    save();$('feedback').className='labFeedback '+(ok?'good':'bad');
    $('feedback').textContent=ok?`✓ ${q.explain||'מעולה! המשיכו לשלב הבא.'}`:`✕ ${q.wrong||q.explain||'כמעט. קראו שוב את הרמז ובדקו את המקור של כל ערך.'}`;
    $('nextQuestion').hidden=!ok;$('checkAnswer').hidden=ok;
    renderProgressOnly();if(allAnswered())complete();
  }
  function renderProgressOnly(){const done=questions.filter(q=>state.answers[q.id]?.correct===true).length,score=Object.values(state.answers).reduce((n,x)=>n+(x.score||0),0);$('progressText').textContent=`${done} / ${questions.length} הושלמו`;$('scoreText').textContent=`${score} נקודות`;$('progressBar').style.width=`${done/questions.length*100}%`}
  function next(){if(state.answers[current().id]?.correct!==true)return;if(state.index<questions.length-1){state.index++;save();render()}else complete()}
  function clean(v,n){return String(v??'').slice(0,n)}
  function allAnswered(){return questions.every(q=>state.answers[q.id]?.correct===true)}
  function resultSummary(){
    const results=questions.map(q=>({...state.answers[q.id],id:q.id,title:q.title,topic:q.topic,question:q.prompt||q.promptParts?.join('___')||q.title}));
    const score=results.reduce((n,r)=>n+(r.score||0),0);
    return {results,score,percentage:Math.round(score/7*100),attempts:results.reduce((n,r)=>n+r.attempts,0),weak:[...new Set(results.filter(r=>!r.score).map(r=>r.topic))]};
  }
  function historyNote(r){return r.historyMissing?`תוכן של ${r.historyMissing} ניסיונות קודמים לא נשמר בגרסה הישנה.`:''}
  function complete(){
    if(!allAnswered()){state.completed=false;state.index=questions.findIndex(q=>state.answers[q.id]?.correct!==true);save();$('intro').hidden=true;$('completion').hidden=true;$('lab').hidden=false;render();return}
    state.completed=true;save();document.body.classList.add('labStarted');
    const summary=resultSummary();
    $('lab').hidden=true;$('completion').hidden=false;
    $('completion').innerHTML=`<h2>🎉 סיימתם את כל 7 השאלות!</h2>
      <p class="resultsIdentity"><strong>${esc(state.studentId)}</strong> · קבוצה ${esc(state.studentClass)}</p>
      <div class="summaryTopics"><div><b>${summary.score}/7</b><br>נקודות</div><div><b>${summary.percentage}%</b><br>אחוז הצלחה</div><div><b>${summary.attempts}</b><br>ניסיונות בסך הכול</div></div>
      <p>נקודה ניתנת רק על תשובה נכונה בניסיון הראשון. כל השאלות הושלמו נכון, גם אם נדרש ניסיון נוסף.</p>
      <h3>התשובות שלכם</h3><ol class="resultQuestions">${summary.results.map(r=>`<li class="resultQuestion"><h4>${esc(r.topic)} — ${esc(r.title)}</h4><p>${esc(r.question)}</p><dl><dt>התשובה שלכם</dt><dd dir="auto">${esc(r.answer)}</dd><dt>התשובה הנכונה</dt><dd dir="auto">${esc(r.expected)}</dd><dt>ניסיונות</dt><dd>${r.attempts}</dd><dt>נקודות</dt><dd>${r.score}/1</dd></dl><h5>כל הניסיונות</h5><ul class="attemptHistory">${(r.history||[]).map(a=>`<li><b>ניסיון ${a.number} — ${a.correct?'נכון':'לא נכון'}</b><p dir="auto">${esc(a.answer)||'לא נבחרה תשובה'}</p></li>`).join('')}</ul>${r.historyMissing?`<p class="mini">${esc(historyNote(r))}</p>`:''}</li>`).join('')}</ol>
      <h3>נושאים שכדאי לתרגל</h3><p>${esc(summary.weak.join(' · ')||'כל הכבוד! עניתם נכון בניסיון הראשון בכל הנושאים.')}</p>
      <h3>שליחת התוצאות למורה</h3><p>לחיצה תפתח טופס Google עם השם הפרטי, הקבוצה וכל התוצאות. בדקו את הנתונים ולחצו על ״שליחה״ בטופס Google. התוצאות יישארו זמינות כאן.</p>
      <div class="resultsActions"><button id="sendResults" type="button" class="btn btnGreen">שליחת התוצאות למורה</button><div id="sendState" class="sendState" role="status" aria-live="polite"></div><a id="formFallback" target="_blank" rel="noopener noreferrer" hidden>פתיחת הטופס בכרטיסייה חדשה</a></div>
      <button id="again" class="btn btnGhost" type="button">תרגול מחדש</button>`;
    $('sendResults').onclick=openResultsForm;
    $('again').onclick=()=>{if(confirm('לאפס את כל ההתקדמות במעבדה?')){localStorage.removeItem(STORE);location.reload()}};
    // Completion and reload never open the form or imply a submitted response.
  }
  function detailedResults(){
    const s=resultSummary();
    const lines=[`שם פרטי: ${state.studentId}`,`קבוצה: ${state.studentClass}`,`ציון: ${s.score}/7`,`אחוז הצלחה: ${s.percentage}%`,`מספר ניסיונות כולל: ${s.attempts}`];
    s.results.forEach((r,i)=>{
      lines.push('','--------------------',`${i+1}. ${r.topic} — ${r.title}`,`שאלה: ${r.question}`,`התשובה האחרונה: ${r.answer}`,`התשובה הנכונה: ${r.expected}`,`מספר ניסיונות: ${r.attempts}`,`נקודות: ${r.score}/1`,'כל הניסיונות:');
      (r.history||[]).forEach(a=>lines.push(`ניסיון ${a.number} — ${a.correct?'נכון':'לא נכון'}: ${a.answer||'לא נבחרה תשובה'}`));
      if(r.historyMissing)lines.push(historyNote(r));
    });
    lines.push('',`נושאים לתרגול: ${s.weak.join(', ')||'אין'}`);
    return lines.join('\n');
  }
  function buildPrefilledFormUrl(){
    if(!allAnswered())return null;
    const url=new URL(GOOGLE_FORM_URL);
    const params=new URLSearchParams({
      usp:'pp_url',
      'entry.455032283':state.studentId,
      'entry.1497177381':state.studentClass,
      'entry.980947848':`${resultSummary().score}/7`,
      'entry.1484528458':detailedResults()
    });
    url.search=params.toString();
    return url;
  }
  function openResultsForm(){
    if(!allAnswered())return;
    const url=buildPrefilledFormUrl().toString(),out=$('sendState');
    try{
      // Open synchronously during the click so the browser can allow a new tab.
      const tab=window.open('about:blank','_blank');
      if(!tab)throw new Error('popup_blocked');
      tab.opener=null;
      tab.location.href=url;
      $('formFallback').hidden=true;
      out.textContent="הטופס נפתח עם התוצאות שלך. יש ללחוץ על 'שליחה' בטופס Google כדי להשלים את ההגשה.";
    }catch(_){
      $('formFallback').href=url;$('formFallback').hidden=false;
      out.textContent='הדפדפן חסם את פתיחת הטופס. אפשר להשתמש בקישור שמתחת להודעה. בטופס Google יש לבדוק את התוצאות וללחוץ על ״שליחה״.';
    }
    // No request to a submission endpoint and no submission-status flag.
  }
  $('startLab').onclick=begin;$('restartLab').onclick=()=>{if(confirm('לאפס את ההתקדמות?')){localStorage.removeItem(STORE);location.reload()}};$('checkAnswer').onclick=check;$('nextQuestion').onclick=next;$('studentId').value=state.studentId;$('studentClass').value=state.studentClass;if(state.completed){$('intro').hidden=true;complete()}else if(state.startedAt){$('intro').hidden=true;$('lab').hidden=false;render()}
})();
