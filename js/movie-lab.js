/* Interactive browser simulation of the Year C Flask movie project. No Python runs on GitHub Pages. */
(() => {
  const STORE = 'mindplay.movieArchitectureLab.v3.approved';
  // Published forms.gle/sFiY816tFREn5yKh8 resolves here (owner confirmed).
  const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScKmgVwoDWkDnnl22cZOdMjt2wWyKbkJV41K1By4g4HMWF5Cw/viewform';
  // Conservative application budget, not a published Google Forms guarantee.
  const MAX_PREFILL_REQUEST_BYTES = 6000;
  const formCode = `<form action="/choice" method="POST">
  <select name="genre">
    <option value="comedy">קומדיה</option>
  </select>
  <button type="submit">חפש סרט</button>
</form>`;
  const questions = [
    {
      id:'arch_frontend',module:0,topic:'ארכיטקטורה',type:'choice',
      title:'מי אחראי על מה בפרויקט?',
      intro:'לפניכם שני קטעי קוד מתוך פרויקט ממליץ הסרטים. קראו אותם וגלו מה התפקיד של כל אחד מהם.',
      code:[{file:'קטע א׳ — index.html',text:formCode},{file:'קטע ב׳ — main.py',text:`@app.route("/choice", methods=["POST"])

def choice():
    data_genre = request.form["genre"]`}],
      prompt:'איזה משפט מתאר נכון את התפקיד של שני קטעי הקוד?',
      options:['קטע א׳ יוצר את הטופס שהמשתמש רואה, וקטע ב׳ מקבל את הבחירה שנשלחה לשרת.','קטע א׳ מחפש סרטים בשרת, וקטע ב׳ מציג את הטופס בדפדפן.','שני קטעי הקוד אחראים רק על העיצוב של הטופס.'],answer:0,
      explain:'נכון! HTML יוצר את הטופס שהמשתמש רואה בדפדפן (Frontend), ו־Flask ב־Python מקבל את המידע שנשלח לשרת (Backend).',
      wrong:'חפשו את תגיות form ו־button בקוד HTML, ואת request.form בקוד Python. איזה קוד מציג את הטופס ואיזה קורא את הבחירה?'
    },
    {
      id:'html_name',module:1,topic:'טופס HTML',type:'parts',
      title:'מתקנים את טופס הסרטים',
      intro:"כדי שהשרת ידע איזה ז'אנר המשתמש בחר, הטופס צריך לשלוח את שם השדה ואת הערך שלו.",
      code:[{file:'index.html',text:`<form action="/choice" method="POST">
  <select name="① ???">
    <option value="② ???">קומדיה</option>
  </select>
</form>`}],
      prompt:'השלימו את שני החלקים החסרים בקוד כך שכאשר המשתמש בוחר "קומדיה", השרת יקבל genre = comedy.',
      parts:[{report:'name',label:'① — מה צריך להיות בתוך name?',options:['genre','comedy','movie'],answer:'genre'},{report:'value',label:'② — מה צריך להיות בתוך value?',options:['comedy','genre','קומדיה'],answer:'comedy'}],
      explain:'מצוין! name="genre" מגדיר את שם השדה, ו־value="comedy" הוא הערך שנשלח לשרת. המילה "קומדיה" היא מה שהמשתמש רואה ברשימה.',
      wrong:'name מתאר איזה מידע אנחנו שולחים, ו־value מתאר מה המשתמש בחר. שימו לב להבדל בין הטקסט שמוצג למשתמש לבין הערך שנשלח.'
    },
    {
      id:'post_order',module:2,topic:'בקשת POST',type:'order',
      title:'איך בקשת POST מגיעה לשרת?',
      intro:'המשתמש בחר בז\'אנר "קומדיה" ולחץ על "חפש סרט". סדרו את הפעולות לפי הסדר שבו הן מתרחשות.',
      code:[{file:'קטע א׳ — index.html',text:formCode},{file:'קטע ב׳ — main.py',text:`@app.route("/choice", methods=["POST"])

def choice():
    genre = request.form["genre"]`}],
      prompt:'סדרו את הפעולות לפי הסדר שבו הן מתרחשות.',
      cards:[
        {id:'click',title:'לחיצה על הכפתור',description:'המשתמש לוחץ על "חפש סרט".',code:'<button type="submit">'},
        {id:'post',title:'שליחת הבקשה',description:'הדפדפן שולח בקשת POST לשרת.',code:'action="/choice" method="POST"'},
        {id:'route',title:'הפעלת הפונקציה בשרת',description:'Flask מזהה את הבקשה ומפעיל את choice().',code:'@app.route("/choice", methods=["POST"])'},
        {id:'read',title:'קריאת הנתונים',description:'Flask קורא את הז\'אנר שנבחר בטופס.',code:'request.form["genre"]'}
      ],answer:['click','post','route','read'],
      explain:'נכון! המשתמש לוחץ על הכפתור, הדפדפן שולח POST לכתובת /choice, Flask מפעיל את הפונקציה המתאימה, ואז קורא את המידע מתוך request.form.',
      wrong:'התחילו מהפעולה שהמשתמש מבצע בדפדפן. לאחר מכן בדקו לאן הטופס נשלח, איזו פונקציה מקבלת את הבקשה, ומתי קוראים את הנתונים.'
    },
    {
      id:'request_key',module:3,topic:'request.form ומשתנים',type:'parts',
      title:'איך Flask קורא את הבחירה מהטופס?',
      intro:'בקשת POST הגיעה לשרת. עכשיו Flask צריך לגלות איזה ז\'אנר המשתמש בחר.',
      code:[{file:'קטע א׳ — index.html',text:`<form action="/choice" method="POST">
  <select name="genre">
    <option value="comedy">קומדיה</option>
    <option value="action">אקשן</option>
  </select>
  <button type="submit">חפש סרט</button>
</form>`},{file:'קטע ב׳ — main.py',text:`@app.route("/choice", methods=["POST"])

def choice():
    data_genre = request.form["???"]
    print(data_genre)`}],
      prompt:'התאימו לכל מושג את הערך המתאים מתוך הקוד.',
      parts:[
        {report:'name',label:'שם השדה בטופס (name)',options:['genre','comedy','action','choice'],answer:'genre'},
        {report:'value',label:'הערך שנשלח כשבוחרים קומדיה (value)',options:['genre','comedy','action','choice'],answer:'comedy'},
        {report:'request.form key',label:'המפתח שצריך להופיע בתוך request.form["???"]',options:['genre','comedy','action','choice'],answer:'genre'}
      ],
      explain:'מצוין! name="genre" מגדיר את שם השדה. כשהמשתמש בוחר קומדיה, הערך שנשלח הוא comedy. לכן request.form["genre"] מחזיר comedy.',
      wrong:'name הוא שם השדה, value הוא הערך שנבחר, ו־request.form משתמש בשם השדה כדי למצוא את הערך.',
      output:'comedy'
    },
    {
      id:'json_key',module:4,topic:'JSON ומילונים',type:'json',
      title:'בלשי ה־JSON',
      intro:'לפניכם מידע על הסרט Shrek מתוך קובץ movies.json.',
      code:[{file:'movies.json',text:`{
  "id": 1,
  "name": "Shrek",
  "genre": "comedy",
  "length": 90,
  "emoji": "🧌"
}`}],
      prompt:'התאימו בין המפתחות לערכים.',
      parts:[
        {report:'name',label:'מה הערך של המפתח name?',options:['Shrek','length','comedy','name','90'],answer:'Shrek'},
        {report:'מפתח אורך',label:'איזה מפתח שומר את אורך הסרט?',options:['Shrek','length','comedy','name','90'],answer:'length'},
        {report:'genre',label:'מה הערך של המפתח genre?',options:['Shrek','length','comedy','name','90'],answer:'comedy'},
        {report:'movie key',label:'איזה מפתח צריך להכניס במקום סימני השאלה?',options:['name','length','genre','90'],answer:'length',quoted:true}
      ],
      secondIntro:'נניח שהמידע על הסרט שמור במשתנה movie. אנחנו רוצים שהקוד ידפיס את אורך הסרט: 90.',
      explain:'מצוין! length הוא המפתח ו־90 הוא הערך שלו. כשכותבים movie["length"], Python שולף את הערך שנמצא תחת המפתח הזה.',
      wrong:'ב־JSON המפתח מופיע לפני הנקודתיים והערך אחריהן. כדי לשלוף מידע ממילון ב־Python משתמשים בשם המפתח, לא בערך עצמו.',
      output:'90'
    },
    {
      id:'and_operator',module:5,topic:'סינון סרטים',type:'multi',
      title:'מי נכנס לרשימת הסרטים?',
      intro:'המשתמש ביקש למצוא סרטי קומדיה שאורכם עד 95 דקות.',
      code:[{file:'main.py',text:`if movie["genre"] == "comedy" and movie["length"] <= 95:
    print(movie["name"])`}],
      prompt:'סמנו את כל הסרטים שהקוד ידפיס.',
      movies:[{id:'shrek',name:'Shrek',genre:'comedy',length:90},{id:'kung-fu-panda',name:'Kung Fu Panda',genre:'animation',length:92},{id:'funny-movie',name:'Funny Movie',genre:'comedy',length:110,fictional:true},{id:'short-comedy',name:'Short Comedy',genre:'comedy',length:85,fictional:true}],
      answer:['shrek','short-comedy'],
      explain:'נכון! and אומר ששני התנאים חייבים להתקיים: גם genre == "comedy" וגם length <= 95. לכן Shrek ו־Short Comedy עוברים את הסינון.',
      wrong:'בדקו כל סרט פעמיים: האם הוא קומדיה? והאם אורכו קטן או שווה ל־95 דקות? אם אחד התנאים לא מתקיים, הסרט לא יודפס.'
    },
    {
      id:'response_debug',module:6,topic:'תגובה ודיבוג',type:'choice',
      title:'בלשי הבאגים: לאן נעלמה התוצאה?',
      intro:'המשתמש בחר ז\'אנר ולחץ על "חפש סרט". המתכנת רצה להציג באתר את שם הסרט שנמצא, אבל השם מופיע בטרמינל ולא בדף האינטרנט.',
      code:[{file:'main.py',text:`@app.route("/choice", methods=["POST"])

def choice():
    movie_name = "Shrek"
    print(movie_name)
    return "החיפוש הסתיים"`}],
      prompt:'המתכנת רוצה שהשם Shrek יופיע בדפדפן במקום "החיפוש הסתיים". איזו שורה צריך לשנות?',
      options:['print("Shrek") — להדפיס את השם ישירות.','return movie_name — להחזיר את שם הסרט מהפונקציה.','movie_name = print("Shrek") — לשמור במשתנה את תוצאת ההדפסה.','return "החיפוש הסתיים" — להשאיר את הקוד כמו שהוא.'],answer:1,
      explain:'מצוין! print() מציג מידע בטרמינל של השרת, ואילו return מחזיר את התגובה ש־Flask שולח לדפדפן.',
      wrong:'print() מיועד להדפסה בטרמינל. חפשו את הפקודה שאחראית להחזיר תשובה מהשרת לדפדפן.',
      correctedCode:`def choice():
    movie_name = "Shrek"
    print(movie_name)
    return movie_name`
    }
  ];
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
  function load(){
    try{
      const saved=JSON.parse(localStorage.getItem(STORE));if(saved)return saved;
      const old=JSON.parse(localStorage.getItem('mindplay.movieArchitectureLab.v2.seven'));
      // New questions need fresh attempts. Preserve the old results at their key.
      return old?{studentId:old.firstNameOnly?old.studentId:String(old.studentId||'').trim().split(/\s+/)[0],studentClass:old.studentClass,firstNameOnly:true,index:0,answers:{}}:null;
    }catch{return null}
  }
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
  function shuffledOrder(q){
    const order=q.cards.map(c=>c.id);
    for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]]}
    if(order.every((id,i)=>id===q.answer[i]))order.push(order.shift());
    return order;
  }
  function draftFor(q){
    state.drafts ||= {};
    if(!state.drafts[q.id])state.drafts[q.id]={choice:null,parts:q.parts?.map(()=>null)||[],order:q.type==='order'?shuffledOrder(q):[],movies:[]};
    return state.drafts[q.id];
  }
  function codeBlock(label,text){return `<section class="approvedCode"><h3>${rich(label)}</h3><pre class="codeBox" dir="ltr"><code>${esc(text)}</code></pre></section>`}
  function q2Badge(index,value){
    return `<span class="q2FieldBadge q2FieldBadge--${index===0?'name':'value'}" dir="ltr"><span>${index===0?'①':'②'}</span>${value===undefined?'':` <span>${esc(value)}</span>`}</span>`;
  }
  function renderCode(q){
    const d=draftFor(q);
    $('projectExamples').innerHTML=q.code.map(block=>{
      let text=block.text;
      if(q.id==='html_name')return codeBlock(block.file,text).replace('① ???',q2Badge(0,d.parts[0]??'???')).replace('② ???',q2Badge(1,d.parts[1]??'???'));
      if(q.id==='request_key'&&d.parts[2]!=null)text=text.replace('???',d.parts[2]);
      return codeBlock(block.file,text);
    }).join('');
    if(q.type==='json')$('jsonPreview').textContent=`print(movie[${d.parts[3]==null?'"???"':JSON.stringify(d.parts[3])}])`;
  }
  function ready(q){
    const d=draftFor(q);
    if(q.type==='choice')return Number.isInteger(d.choice);
    if(q.parts)return q.parts.every((part,i)=>part.options.includes(d.parts[i]));
    if(q.type==='multi')return d.movies.length>0;
    return d.order.length===4;
  }
  function updateAvailability(){const q=current();$('checkAnswer').disabled=!ready(q)||state.answers[q.id]?.correct===true}
  function render(){
    document.body.classList.add('labStarted');const q=current();
    $('topicBadge').innerHTML=rich(q.topic);$('questionCount').textContent=`שאלה ${state.index+1} מתוך 7 · ${state.studentId}`;
    $('questionTitle').textContent=q.title;$('objective').innerHTML=rich(q.intro);
    $('feedback').className='labFeedback';$('feedback').textContent='';$('solution').hidden=true;$('solution').innerHTML='';
    $('nextQuestion').hidden=state.answers[q.id]?.correct!==true;$('nextQuestion').textContent=state.index===6?'לסיכום התוצאות ←':'לשאלה הבאה ←';
    $('retryAnswer').hidden=true;$('checkAnswer').hidden=state.answers[q.id]?.correct===true;
    renderProgressOnly();renderTabs();renderActivity(q);renderCode(q);updateAvailability();save();
    if(state.answers[q.id]?.correct===true)showFeedback(q,true);
  }
  function partChoices(q,part,i){
    const d=draftFor(q),solved=state.answers[q.id]?.correct===true;
    const heading=q.id==='html_name'?q2Badge(i)+rich(part.label.slice(1)):rich(part.label);
    return `<fieldset class="matchRow" data-part="${i}" ${solved?'disabled':''}><legend>${heading}</legend><div class="matchChoices">${part.options.map((value,n)=>`<label class="answerChoice"><input type="radio" name="part-${q.id}-${i}" value="${esc(value)}" ${d.parts[i]===value?'checked':''}><span><bdi dir="auto">${esc(part.quoted?JSON.stringify(value):value)}</bdi></span></label>`).join('')}</div></fieldset>`;
  }
  function renderActivity(q){
    const a=$('activity'),d=draftFor(q),solved=state.answers[q.id]?.correct===true;
    const prompt=`<p>${rich(q.prompt)}</p>`;
    if(q.type==='choice'){
      const comparison=q.id==='response_debug'?`<div class="outputComparison">${codeBlock('טרמינל — המצב הנוכחי','Shrek')}${codeBlock('דפדפן — המצב הנוכחי','החיפוש הסתיים')}</div>`:'';
      a.innerHTML=comparison+prompt+`<div class="choiceGrid">${q.options.map((text,i)=>`<button type="button" class="option" data-v="${i}" aria-pressed="${d.choice===i}" ${solved?'disabled':''}><span class="optionMark" aria-hidden="true">${['א','ב','ג','ד'][i]}</span><span class="answerText">${rich(text)}</span></button>`).join('')}</div>`;
      a.querySelectorAll('[data-v]').forEach(button=>button.onclick=()=>{d.choice=Number(button.dataset.v);a.querySelectorAll('[data-v]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));save();updateAvailability()});
    }else if(q.parts){
      if(q.type==='json')a.innerHTML=`<h3>חלק א׳ — התאמת מפתחות וערכים</h3>${prompt}<div class="matchGrid">${q.parts.slice(0,3).map((p,i)=>partChoices(q,p,i)).join('')}</div><h3>חלק ב׳ — שליפת מידע עם Python</h3><p>${rich(q.secondIntro)}</p><pre class="codeBox" dir="ltr"><code id="jsonPreview"></code></pre>${partChoices(q,q.parts[3],3)}`;
      else a.innerHTML=prompt+`<div class="matchGrid">${q.parts.map((p,i)=>partChoices(q,p,i)).join('')}</div>`;
      a.querySelectorAll('input[type="radio"]').forEach(input=>input.onchange=()=>{const i=Number(input.closest('[data-part]').dataset.part);d.parts[i]=input.value;save();renderCode(q);updateAvailability()});
    }else if(q.type==='order'){
      a.innerHTML=prompt+`<div class="flow" role="group" aria-label="סידור פעולות בקשת POST">${d.order.map(id=>{const c=q.cards.find(c=>c.id===id);return `<div class="flowRow" data-v="${c.id}"><div class="flowText"><strong>${esc(c.title)}</strong><p>${rich(c.description)}</p><code dir="ltr">${esc(c.code)}</code></div><div class="moveButtons"><button type="button" class="up" aria-label="הזיזו את ${esc(c.title)} למעלה" ${solved?'disabled':''}>↑</button><button type="button" class="down" aria-label="הזיזו את ${esc(c.title)} למטה" ${solved?'disabled':''}>↓</button></div></div>`}).join('')}</div><p class="mini">סדרו מלמעלה למטה בעזרת הכפתורים ↑ ↓. אפשר להשתמש גם במקלדת.</p><div id="orderStatus" class="srOnly" role="status"></div>`;
      a.querySelectorAll('.up,.down').forEach(button=>button.onclick=()=>{
        const row=button.closest('.flowRow'),id=row.dataset.v,i=d.order.indexOf(id),to=button.classList.contains('up')?i-1:i+1;
        if(to<0||to>=d.order.length)return;
        [d.order[i],d.order[to]]=[d.order[to],d.order[i]];save();renderActivity(q);
        const moved=$('activity').querySelector(`[data-v="${id}"]`);moved.querySelector(button.classList.contains('up')?'.up':'.down').focus();
        $('orderStatus').textContent=`${q.cards.find(c=>c.id===id).title}: מקום ${to+1} מתוך 4`;
      });
    }else if(q.type==='multi'){
      a.innerHTML=prompt+`<div class="movieSelection">${q.movies.map(movie=>`<label class="moviePick"><input type="checkbox" value="${movie.id}" ${d.movies.includes(movie.id)?'checked':''} ${solved?'disabled':''}><span><strong><bdi dir="ltr">${movie.name}</bdi></strong><span>ז׳אנר: <bdi dir="ltr">${movie.genre}</bdi></span><span>אורך: ${movie.length} דקות</span>${movie.fictional?'<small>דוגמה דמיונית לתרגול</small>':''}</span></label>`).join('')}</div>`;
      a.querySelectorAll('input[type="checkbox"]').forEach(input=>input.onchange=()=>{d.movies=q.movies.filter(m=>a.querySelector(`input[value="${m.id}"]`).checked).map(m=>m.id);save();updateAvailability()});
    }
  }
  function validate(q){
    const d=draftFor(q);
    if(q.type==='choice')return d.choice===q.answer;
    if(q.parts)return q.parts.every((part,i)=>d.parts[i]===part.answer);
    if(q.type==='order')return d.order.join('|')===q.answer.join('|');
    return d.movies.length===q.answer.length&&q.answer.every(id=>d.movies.includes(id));
  }
  function submittedFor(q){
    const d=draftFor(q);
    if(q.type==='choice')return {choice:d.choice,text:q.options[d.choice]};
    if(q.parts)return {parts:q.parts.map((part,i)=>({label:part.label,value:d.parts[i]}))};
    if(q.type==='order')return {order:d.order.map(id=>({id,title:q.cards.find(c=>c.id===id).title}))};
    return {movies:q.movies.filter(m=>d.movies.includes(m.id)).map(m=>({id:m.id,name:m.name}))};
  }
  function responseFor(q){
    const d=draftFor(q);
    if(q.type==='choice')return q.options[d.choice]||'';
    if(q.parts)return q.parts.map((p,i)=>`${p.report||p.label}: ${d.parts[i]??'לא נבחר'}`).join('; ');
    if(q.type==='order')return d.order.map(id=>q.cards.find(c=>c.id===id).title).join(' → ');
    return q.movies.filter(m=>d.movies.includes(m.id)).map(m=>`${m.name} (${m.id})`).join(', ');
  }
  function expectedFor(q){
    if(q.type==='choice')return q.options[q.answer];
    if(q.parts)return q.parts.map(p=>`${p.report||p.label}: ${p.answer}`).join('; ');
    if(q.type==='order')return q.answer.map(id=>q.cards.find(c=>c.id===id).title).join(' → ');
    return q.movies.filter(m=>q.answer.includes(m.id)).map(m=>`${m.name} (${m.id})`).join(', ');
  }
  function showFeedback(q,ok){
    $('feedback').className='labFeedback '+(ok?'good':'bad');$('feedback').innerHTML=rich((ok?'✓ ':'✕ ')+(ok?q.explain:q.wrong));
    $('solution').innerHTML=ok?(q.output?codeBlock('פלט בטרמינל',q.output):q.correctedCode?codeBlock('הקוד המתוקן — main.py',q.correctedCode)+codeBlock('התוצאה בדפדפן לאחר התיקון','Shrek'):''):'';
    $('solution').hidden=!ok||!$('solution').innerHTML;
  }
  function check(){
    const q=current(),prior=state.answers[q.id];if(prior?.correct===true||!ready(q))return;
    const ok=validate(q),answer=responseFor(q),attempts=(prior?.attempts||0)+1,submitted=submittedFor(q);
    state.answers[q.id]={correct:ok,attempts,topic:q.topic,answer,expected:expectedFor(q),score:prior?prior.score:(ok?1:0),firstAnswer:prior?prior.firstAnswer:answer,firstCorrect:prior?prior.firstCorrect:ok,history:[...(prior?.history||[]),{number:attempts,answer,correct:ok,submitted}],submitted,historyMissing:0};
    save();renderProgressOnly();renderTabs();renderActivity(q);renderCode(q);updateAvailability();showFeedback(q,ok);
    $('checkAnswer').hidden=ok;$('nextQuestion').hidden=!ok;$('feedback').focus();
    // Keep successful feedback and any terminal output visible until Next.
  }
  function renderProgressOnly(){const done=questions.filter(q=>state.answers[q.id]?.correct===true).length,score=Object.values(state.answers).reduce((n,x)=>n+(x.score||0),0);$('progressText').textContent=`הושלמו ${done} מתוך 7`;$('scoreText').textContent=`${score} נקודות`;$('progressBar').style.width=`${done/7*100}%`;$('progressBar').parentElement.setAttribute('aria-valuenow',done)}
  function next(){if(state.answers[current().id]?.correct!==true)return;if(state.index<6){state.index++;save();render();$('questionTitle').focus()}else complete()}
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
    // Transport only: omit repeated identity/full prompts/final answers already
    // present in the four fields or history. Never shorten an answer or attempt.
    const lines=[`ציון: ${s.score}/7 | ${s.percentage}% | סך ניסיונות: ${s.attempts}`];
    s.results.forEach((r,i)=>{
      lines.push('',`${i+1}. ${r.topic} — ${r.title}`,`ניסיונות: ${r.attempts} | נקודות: ${r.score}/1`,`התשובה הנכונה: ${r.expected}`);
      (r.history||[]).forEach(a=>lines.push(`ניסיון ${a.number} — ${a.correct?'נכון':'לא נכון'}: ${a.answer||'לא נבחרה תשובה'}`));
      // Preserve old saved records whose latest answer is not in their history.
      if(!(r.history||[]).some(a=>a.number===r.attempts&&a.answer===r.answer))lines.push(`התשובה האחרונה: ${r.answer}`);
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
    const fullUrl=buildPrefilledFormUrl(),out=$('sendState');
    // URL serializes non-ASCII characters as percent-encoded ASCII, so this
    // counts request-target bytes rather than decoded Hebrew characters.
    if((fullUrl.pathname+fullUrl.search).length>MAX_PREFILL_REQUEST_BYTES){
      const manualUrl=new URL(fullUrl);
      manualUrl.searchParams.delete('entry.1484528458');
      $('formFallback').href=manualUrl.toString();$('formFallback').hidden=false;
      $('formFallback').textContent='פתיחת הטופס והדבקת הפירוט המלא ידנית';
      out.textContent='הפירוט המלא יוצר קישור ארוך מדי למילוי אמין. שום תשובה לא קוצרה או נשלחה. בקישור שלמטה ימולאו השם, הקבוצה והציון בלבד; יש להעתיק את הסיכום המלא מהעמוד לשדה הפירוט בטופס Google, לבדוק וללחוץ על ״שליחה״.';
      return;
    }
    const url=fullUrl.toString();
    try{
      // Open synchronously during the click so the browser can allow a new tab.
      const tab=window.open('about:blank','_blank');
      if(!tab)throw new Error('popup_blocked');
      tab.opener=null;
      tab.location.href=url;
      $('formFallback').hidden=true;
      out.textContent="הטופס נפתח עם התוצאות שלך. יש ללחוץ על 'שליחה' בטופס Google כדי להשלים את ההגשה.";
    }catch(_){
      $('formFallback').href=url;$('formFallback').textContent='פתיחת הטופס בכרטיסייה חדשה';$('formFallback').hidden=false;
      out.textContent='הדפדפן חסם את פתיחת הטופס. אפשר להשתמש בקישור שמתחת להודעה. בטופס Google יש לבדוק את התוצאות וללחוץ על ״שליחה״.';
    }
    // No request to a submission endpoint and no submission-status flag.
  }
  $('startLab').onclick=begin;$('restartLab').onclick=()=>{if(confirm('לאפס את ההתקדמות?')){localStorage.removeItem(STORE);location.reload()}};$('checkAnswer').onclick=check;$('nextQuestion').onclick=next;$('studentId').value=state.studentId;$('studentClass').value=state.studentClass;if(state.completed){$('intro').hidden=true;complete()}else if(state.startedAt){$('intro').hidden=true;$('lab').hidden=false;render()}
})();
