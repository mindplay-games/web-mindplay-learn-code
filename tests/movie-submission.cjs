/* Local tests only. New-tab navigation is mocked; nothing is submitted to Google. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('js/movie-lab.js','utf8');
const form='https://docs.google.com/forms/d/e/1FAIpQLScKmgVwoDWkDnnl22cZOdMjt2wWyKbkJV41K1By4g4HMWF5Cw/viewform';
const ids=['arch_frontend','html_name','post_order','request_key','json_key','and_operator','response_debug'];
const status="הטופס נפתח עם התוצאות שלך. יש ללחוץ על 'שליחה' בטופס Google כדי להשלים את ההגשה.";
function fixture(options={}){
 const state={studentId:'נועה',studentClass:'3',index:0,answers:{},submissionId:'fictional-test-0001',firstNameOnly:true,...options.state};
 if(options.finished!==false)state.answers=Object.fromEntries(ids.map(id=>[id,{correct:true,score:1,attempts:1,topic:'legacy topic',answer:'תשובה דמיונית',expected:'תשובה צפויה'}]));
 const elements=new Proxy({}, {get:(target,key)=>target[key]??=({value:'',hidden:false,style:{},dataset:{},parentElement:{setAttribute(){}},querySelectorAll:()=>[],querySelector:()=>null,setAttribute(){},focus(){}})});
 const storage=new Map([['mindplay.movieArchitectureLab.v3.approved',JSON.stringify(state)]]),opened=[];
 const window={open:(url,target)=>{const tab={opener:{},location:{href:url}};opened.push({url,target,tab});return options.blocked?null:tab}};
 const ctx=vm.createContext({window,document:{getElementById:id=>elements[id],body:{classList:{add(){}}}},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},crypto:{randomUUID:()=> 'fictional-test-0001'},URL,URLSearchParams,console,confirm:()=>false,location:{reload(){}},fetch:()=>{throw Error('Background requests forbidden')}});
 const start=source.lastIndexOf("  $('startLab').onclick");
 vm.runInContext(source.slice(0,start)+"window.lab={state,questions,allAnswered,resultSummary,complete,detailedResults,buildPrefilledFormUrl,openResultsForm,begin,check,next,draftFor,ready,validate,expectedFor,shuffledOrder,render};})();",ctx);
 return {lab:window.lab,elements,storage,opened};
}
test('exactly seven unique questions, one per topic, each with code; obsolete background integrations absent',()=>{
 const {lab}=fixture();assert.equal(lab.questions.length,7);assert.equal(new Set(lab.questions.map(q=>q.module)).size,7);
 assert.deepEqual(Array.from(lab.questions,q=>q.id),ids);for(const q of lab.questions)assert.ok(q.code.length);
 assert.doesNotMatch(source,/script\.google|APPS_SCRIPT_URL|fetch\(|formResponse|Formspree|formEndpoint|התוצאות נשלחו|נשלחו בהצלחה/);
});
test('Hebrew and English first names accepted; blank/numeric names and nonnumeric groups rejected',()=>{
 for(const name of ['נועה','Alex']){const f=fixture({finished:false});f.elements.studentId.value=name;f.elements.studentClass.value='3';f.lab.begin();assert.equal(f.elements.intro.hidden,true);assert.equal(f.lab.state.studentId,name)}
 for(const [name,group] of [['','3'],['123','3'],['Alex',''],['Alex','3x'],['Alex','-2']]){const f=fixture({finished:false});f.elements.studentId.value=name;f.elements.studentClass.value=group;f.lab.begin();assert.notEqual(f.elements.intro.hidden,true)}
});
test('incorrect answers block progression; every answer is retained and corrections keep zero first-attempt points',()=>{
 const f=fixture({finished:false}),q=f.lab.questions[0],d=f.lab.draftFor(q);d.choice=1;
 f.lab.check();f.lab.next();assert.equal(f.lab.state.index,0);assert.equal(f.elements.nextQuestion.hidden,true);assert.equal(f.elements.checkAnswer.hidden,false);
 d.choice=2;f.lab.check();d.choice=0;f.lab.check();const r=f.lab.state.answers[q.id];assert.equal(r.attempts,3);assert.equal(r.score,0);assert.equal(r.correct,true);assert.equal(r.history.length,3);assert.equal(r.history[0].answer,q.options[1]);assert.equal(r.firstAnswer,q.options[1]);assert.equal(r.firstCorrect,false);assert.equal(r.history[2].submitted.choice,0);
 f.lab.next();assert.equal(f.lab.state.index,1);assert.ok([...f.storage.values()][0].includes(q.options[2]));
});
test('first correct complete attempt earns one point; solved question cannot change score/history',()=>{
 const f=fixture({finished:false});f.lab.draftFor(f.lab.questions[0]).choice=0;f.lab.check();f.lab.check();const r=f.lab.state.answers[ids[0]];assert.equal(r.score,1);assert.equal(r.attempts,1);assert.equal(r.history.length,1);assert.equal(r.firstCorrect,true);
});
test('completion/reload renders seven results with real questions and never opens a tab',()=>{
 const f=fixture();f.lab.complete();f.lab.complete();assert.equal(f.opened.length,0);assert.equal(f.lab.state.completed,true);assert.match(f.elements.completion.innerHTML,/נועה/);assert.match(f.elements.completion.innerHTML,/7\/7/);assert.equal((f.elements.completion.innerHTML.match(/class="resultQuestion"/g)||[]).length,7);assert.match(f.elements.completion.innerHTML,/כל הניסיונות/);
});
test('incomplete or incorrect questions cannot generate a prefill or open a tab',()=>{
 const f=fixture();f.lab.state.answers[ids[6]].correct=false;assert.equal(f.lab.buildPrefilledFormUrl(),null);f.lab.openResultsForm();assert.equal(f.opened.length,0);
});
test('all four exact Google field IDs map to actual data with Hebrew/multiline/special-character round trip',()=>{
 const f=fixture({state:{studentId:'נועה & Alex + אב',studentClass:'0042'}});
 const answer='שורה א\nשורה ב & = ? + # % " <tag>';
 f.lab.state.answers[ids[2]].answer=answer;f.lab.state.answers[ids[2]].history=[{number:1,answer,correct:true}];
 const url=f.lab.buildPrefilledFormUrl(),params=url.searchParams;
 assert.equal(url.origin+url.pathname,form);assert.equal(params.get('usp'),'pp_url');assert.equal(params.get('entry.455032283'),'נועה & Alex + אב');assert.equal(params.get('entry.1497177381'),'0042');assert.equal(params.get('entry.980947848'),'7/7');assert.match(params.get('entry.1484528458'),/ציון: 7\/7/);assert.ok(params.get('entry.1484528458').includes(answer));assert.equal(params.size,5);
 const decoded=new URL(url.toString()).searchParams;assert.equal(decoded.get('entry.1484528458'),f.lab.detailedResults());
});
test('seven original topics/questions, actual answers, incorrect attempts and expected answers appear in details and summary',()=>{
 const f=fixture();const r=f.lab.state.answers[ids[2]];Object.assign(r,{attempts:2,score:0,history:[{number:1,answer:'טעות דמיונית',correct:false},{number:2,answer:r.answer,correct:true}]});
 const text=f.lab.detailedResults();assert.match(text,/ציון: 6\/7/);assert.match(text,/סך ניסיונות: 8/);assert.match(text,/ניסיון 1 — לא נכון: טעות דמיונית/);assert.equal((text.match(/התשובה הנכונה:/g)||[]).length,7);
 for(const q of f.lab.questions){assert.ok(text.includes(q.topic));assert.ok(text.includes(q.title));assert.ok(text.includes(f.lab.state.answers[q.id].expected))}
 f.lab.complete();assert.match(f.elements.completion.innerHTML,/טעות דמיונית/);assert.match(f.elements.completion.innerHTML,/לא נכון/);
});
test('prefill values change with the student and score; no example identification is hardcoded',()=>{
 const a=fixture(),b=fixture({state:{studentId:'Fictional',studentClass:'999'}});Object.values(b.lab.state.answers).forEach(r=>{r.score=0;r.attempts=2});
 const pa=a.lab.buildPrefilledFormUrl().searchParams,pb=b.lab.buildPrefilledFormUrl().searchParams;assert.notEqual(pa.get('entry.455032283'),pb.get('entry.455032283'));assert.equal(pb.get('entry.1497177381'),'999');assert.equal(pb.get('entry.980947848'),'0/7');
});
test('opening form removes opener, shows required non-confirmation text, preserves results and permits reopening',()=>{
 const f=fixture();f.lab.complete();const before=JSON.stringify(f.lab.state.answers);f.lab.openResultsForm();assert.equal(f.opened.length,1);assert.equal(f.opened[0].target,'_blank');assert.equal(f.opened[0].tab.opener,null);assert.equal(new URL(f.opened[0].tab.location.href).searchParams.get('entry.980947848'),'7/7');assert.equal(f.elements.sendState.textContent,status);assert.equal(JSON.stringify(f.lab.state.answers),before);assert.equal(f.lab.state.submitted,undefined);f.lab.openResultsForm();assert.equal(f.opened.length,2);
});
test('blocked popup offers an encoded safe link without claiming opened/submitted',()=>{
 const f=fixture({blocked:true});f.lab.openResultsForm();assert.equal(f.elements.formFallback.hidden,false);assert.equal(new URL(f.elements.formFallback.href).searchParams.get('entry.455032283'),'נועה');assert.match(f.elements.sendState.textContent,/חסם/);assert.doesNotMatch(f.elements.sendState.textContent,/הטופס נפתח|בהצלחה/);
});
test('legacy progress preserves latest answer/count/score but marks unrecoverable history honestly',()=>{
 const f=fixture({state:{firstNameOnly:undefined,studentId:'Alex Example',submitted:true,pendingSubmission:{studentName:'Alex Example'},pendingEmail:{},emailSent:true}});const r=f.lab.state.answers[ids[0]];assert.equal(f.lab.state.studentId,'Alex');assert.equal(f.lab.state.pendingSubmission,undefined);assert.equal(f.lab.state.emailSent,undefined);assert.equal(f.lab.state.pendingEmail,undefined);assert.equal(r.history.length,1);
 const state={...f.lab.state,answers:{[ids[0]]:{correct:false,score:0,attempts:3,answer:'known last',expected:'expected'}}};const old=fixture({state,finished:false});assert.equal(old.lab.state.answers[ids[0]].historyMissing,2);assert.equal(old.lab.state.answers[ids[0]].history.length,1);assert.equal(old.lab.state.answers[ids[0]].history[0].number,3);
});

test('oversized prefill never navigates a too-long URL or truncates an answer; offers explicit manual details fallback',()=>{
 const f=fixture();const r=f.lab.state.answers[ids[0]],long='תשובה ארוכה & +\n'.repeat(2000);r.answer=long;r.history=[{number:1,answer:long,correct:true}];
 const full=f.lab.buildPrefilledFormUrl();assert.ok((full.pathname+full.search).length>6000);assert.ok(full.searchParams.get('entry.1484528458').includes(long));
 f.lab.openResultsForm();assert.equal(f.opened.length,0);assert.equal(f.elements.formFallback.hidden,false);assert.match(f.elements.sendState.textContent,/שום תשובה לא קוצרה/);assert.match(f.elements.sendState.textContent,/בלבד/);
 const manual=new URL(f.elements.formFallback.href);assert.equal(manual.searchParams.get('entry.455032283'),'נועה');assert.equal(manual.searchParams.get('entry.980947848'),'7/7');assert.equal(manual.searchParams.has('entry.1484528458'),false);assert.equal(r.answer,long);assert.equal(r.history[0].answer,long);
});
test('compact details remove duplicated prompts and latest answers, keeping every attempt and expected answer exactly',()=>{
 const f=fixture();for(const q of f.lab.questions){const answer=f.lab.expectedFor(q);f.lab.state.answers[q.id]={answer,expected:answer,correct:true,score:1,attempts:1,history:[{number:1,answer,correct:true}]}}
 const full=f.lab.buildPrefilledFormUrl(),details=full.searchParams.get('entry.1484528458');assert.ok((full.pathname+full.search).length>0);assert.equal((details.match(/ניסיון 1 — נכון:/g)||[]).length,7);assert.equal((details.match(/התשובה הנכונה:/g)||[]).length,7);
 for(const q of f.lab.questions)assert.ok(details.includes(f.lab.state.answers[q.id].answer));
 // The existing length guard decides whether to prefill or offer manual paste.
});

test('code-completion parts are one question: incomplete selections are not submitted; partial wrong first attempt stays zero',()=>{
 const f=fixture({finished:false});f.lab.state.index=1;const q=f.lab.questions[1],d=f.lab.draftFor(q);d.parts[0]='genre';assert.equal(f.lab.ready(q),false);f.lab.check();assert.equal(f.lab.state.answers[q.id],undefined);
 d.parts[1]='genre';f.lab.check();assert.equal(f.lab.state.answers[q.id].score,0);assert.equal(f.lab.state.answers[q.id].correct,false);d.parts[1]='comedy';f.lab.check();assert.equal(f.lab.state.answers[q.id].correct,true);assert.equal(f.lab.state.answers[q.id].score,0);assert.equal(f.lab.state.answers[q.id].history[0].submitted.parts.length,2);
});
test('ordering is always shuffled initially, and all four cards must be ordered correctly',()=>{
 const f=fixture({finished:false}),q=f.lab.questions[2];for(let i=0;i<100;i++)assert.notEqual(Array.from(f.lab.shuffledOrder(q)).join('|'),q.answer.join('|'));
 const d=f.lab.draftFor(q);assert.equal(f.lab.validate(q),false);d.order=Array.from(q.answer);assert.equal(f.lab.validate(q),true);assert.equal(new Set(d.order).size,4);
});
test('Flask matching deliberately allows genre twice',()=>{
 const f=fixture({finished:false}),q=f.lab.questions[3];f.lab.draftFor(q).parts=['genre','comedy','genre'];assert.equal(f.lab.ready(q),true);assert.equal(f.lab.validate(q),true);
});
test('JSON combines all three matches and code key into one point',()=>{
 const f=fixture({finished:false});f.lab.state.index=4;const q=f.lab.questions[4],d=f.lab.draftFor(q);d.parts=['Shrek','length','comedy','name'];f.lab.check();assert.equal(f.lab.state.answers[q.id].correct,false);assert.equal(f.elements.solution.hidden,true);assert.doesNotMatch(f.elements.feedback.innerHTML,/movie\[&quot;length/);
 d.parts[3]='length';f.lab.check();assert.equal(f.lab.state.answers[q.id].correct,true);assert.equal(f.lab.state.answers[q.id].score,0);assert.equal(f.lab.state.answers[q.id].history[1].submitted.parts.length,4);assert.match(f.elements.solution.innerHTML,/90/);
});
test('multi-select requires Shrek and Short Comedy, with no missing or extra movies; IDs and names are reported',()=>{
 const f=fixture({finished:false});f.lab.state.index=5;const q=f.lab.questions[5],d=f.lab.draftFor(q);
 for(const selected of [[],['shrek'],['short-comedy'],['shrek','short-comedy','funny-movie'],['kung-fu-panda','short-comedy']]){d.movies=selected;assert.equal(f.lab.validate(q),false)}
 d.movies=['shrek','funny-movie'];f.lab.check();d.movies=['shrek','short-comedy'];f.lab.check();assert.equal(f.lab.state.answers[q.id].score,0);assert.equal(f.lab.state.answers[q.id].submitted.movies[1].id,'short-comedy');assert.match(f.lab.state.answers[q.id].answer,/Short Comedy/);
});
test('last correct answer keeps approved success feedback visible until explicit Next',()=>{
 const f=fixture();f.lab.state.index=6;delete f.lab.state.answers[ids[6]];f.lab.draftFor(f.lab.questions[6]).choice=1;f.lab.check();assert.notEqual(f.lab.state.completed,true);assert.equal(f.elements.completion.innerHTML,undefined);assert.match(f.elements.solution.innerHTML,/return movie_name/);assert.match(f.elements.solution.innerHTML,/Shrek/);f.lab.next();assert.equal(f.lab.state.completed,true);
});
