const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const ids=['arch_frontend','html_name','post_order','request_key','json_key','and_operator','response_debug'];
const payload=()=>({submissionId:'fictional-test-0001',studentName:'Fictional Student',groupNumber:123,submittedAt:'2026-11-01T10:00:00Z',score:7,maxScore:7,percentage:100,correctAnswers:7,incorrectAnswers:0,totalAttempts:7,durationSeconds:60,topicsForImprovement:[],completionStatus:'completed',results:ids.map(id=>({id,topic:'test',answer:'=fictional()',expected:'example',correct:true,attempts:1,score:1}))});
function backend(){
 const sheets=new Map();let mails=0,failDetail=false,failMain=false,failMail=false,failLog=false;
 function sheet(){const rows=[];return {rows,getLastRow:()=>rows.length,appendRow:r=>{if(failLog&&['email_failed','email_sent'].includes(r[2]))throw Error('log');if(failMain&&r[0]==='fictional-test-0001')throw Error('write');rows.push(r)},setFrozenRows(){},deleteRow:n=>rows.splice(n-1,1),getRange:(row,col,n=1)=>({setFontWeight(){},getValues:()=>rows.slice(row-1,row-1+n).map(r=>[r[col-1]]),setValues:values=>{if(failDetail){rows.push(values[0]);throw Error('partial write')}values.forEach(r=>rows.push(r))}})}}
 const book={getSheetByName:n=>sheets.get(n),insertSheet:n=>{const s=sheet();sheets.set(n,s);return s},getUrl:()=> 'private-url'};
 const ctx=vm.createContext({LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},SpreadsheetApp:{openByUrl:()=>book,flush(){}},PropertiesService:{getScriptProperties:()=>({getProperty:()=> 'configured'})},Session:{getScriptTimeZone:()=> 'UTC'},Utilities:{formatDate:()=> 'date'},MailApp:{sendEmail:()=>{if(failMail)throw Error('mail');mails++}},ContentService:{MimeType:{JSON:'json'},createTextOutput:s=>({setMimeType:()=>JSON.parse(s)})}});
 vm.runInContext(fs.readFileSync('google-apps-script/Code.gs','utf8'),ctx);
 return {ctx,sheets,mails:()=>mails,failDetail:v=>failDetail=v,failMain:v=>failMain=v,failMail:v=>failMail=v,failLog:v=>failLog=v,post:d=>ctx.doPost({postData:{contents:JSON.stringify(d)}})};
}
test('fictional submission commits details, escapes formulas, numeric group and acknowledges ID; retry sends no duplicate email',()=>{const b=backend(),d=payload();assert.equal(b.post(d).submissionId,d.submissionId);assert.equal(b.post(d).duplicate,true);assert.equal(b.mails(),1);assert.equal(b.sheets.get('Student Submissions').rows.length,2);const row=b.sheets.get('Detailed Answers').rows[1];assert.equal(row[2],123);assert.equal(row[5],"'=fictional()");assert.equal(row[6],'example');assert.equal(b.ctx.safe_('\t=fictional()',500),"' =fictional()");});
test('partial detail and summary failures recover without duplicate rows or emails',()=>{for(const kind of ['failDetail','failMain']){const b=backend();b[kind](true);assert.equal(b.post(payload()).ok,false);assert.equal(b.mails(),0);b[kind](false);assert.equal(b.post(payload()).ok,true);assert.equal(b.sheets.get('Detailed Answers').rows.length,8);assert.equal(b.sheets.get('Student Submissions').rows.length,2);assert.equal(b.mails(),1);}});
test('invalid data rejected and public GET exposes no records',()=>{const b=backend();for(const patch of [{groupNumber:'123'},{score:8},{totalAttempts:8},{submittedAt:'bad'},{results:[]},{topicsForImprovement:null}])assert.equal(b.post({...payload(),...patch}).ok,false);assert.equal(JSON.stringify(b.ctx.doGet()),'{"ok":false,"error":"method_not_allowed"}');});
const source=fs.readFileSync('js/movie-lab.js','utf8');
function frontend(fetch){const elements={sendState:{},sendResults:{}};let saved;const state={studentId:'Fictional Student',studentClass:'123',submissionId:'fictional-test-0001',startedAt:Date.now(),answers:Object.fromEntries(ids.map(id=>[id,{correct:true,score:1,attempts:1,topic:'test',answer:'=fictional()',expected:'example'}]))};const ctx=vm.createContext({state,questions:ids.map(id=>({id})),allAnswered:()=>true,APPS_SCRIPT_URL:'https://example.test/exec',$:id=>elements[id],save:()=>{saved=JSON.stringify(state)},clean:(v,n)=>String(v??'').slice(0,n),fetch,AbortSignal});vm.runInContext(source.slice(source.indexOf('let sending = false;'),source.indexOf("  $('startLab').onclick")),ctx);return {ctx,state,elements,saved:()=>saved};}
test('failed/opaque/mismatched acknowledgements retain identical retry payload and never confirm success',async()=>{for(const response of [{ok:true,type:'opaque',json:async()=>({ok:true,submissionId:'fictional-test-0001'})},{ok:true,json:async()=>({ok:true,submissionId:'wrong-id'})},{ok:true,json:async()=>{throw Error('HTML redirect/login')} }]){const requests=[];const f=frontend(async(url,opts)=>{requests.push(opts);return response});await f.ctx.submit();assert.ok(!f.state.submitted);assert.ok(f.saved().includes('=fictional()'));await f.ctx.submit();assert.equal(requests[0].body,requests[1].body);assert.equal(JSON.parse(requests[0].body).groupNumber,123);assert.equal(requests[0].mode,'cors');assert.equal(requests[0].redirect,'follow');assert.equal(f.elements.sendResults.disabled,false);}});
test('matching acknowledgement confirms; concurrent clicks send once',async()=>{let resolve,calls=0;const f=frontend(()=>{calls++;return new Promise(r=>resolve=r)});const first=f.ctx.submit();await f.ctx.submit();assert.equal(calls,1);resolve({ok:true,json:async()=>({ok:true,submissionId:'fictional-test-0001'})});await first;assert.equal(f.state.submitted,true);});
test('completion sends automatically only after every activity, including after reload',()=>{
 const elements={};let sends=0,renders=0;
 const questions=Array.from({length:7},(_,i)=>({id:`q${i}`}));
 const state={answers:Object.fromEntries(questions.slice(0,6).map(q=>[q.id,{score:1,correct:true,topic:'fictional'}]))};
 const ctx=vm.createContext({state,questions,$:id=>elements[id]??=( {} ),save(){},render(){renders++},submit(){sends++},esc:s=>s});
 vm.runInContext(source.slice(source.indexOf('  function allAnswered()'),source.indexOf('  let sending = false;')),ctx);
 ctx.complete();assert.equal(sends,0);assert.equal(state.completed,false);assert.equal(state.index,6);
 state.answers.q6={score:1,correct:true,topic:'fictional'};ctx.complete();assert.equal(sends,1);assert.equal(state.completed,true);
 ctx.complete();assert.equal(sends,2);assert.equal(renders,1);
});
test('last checked activity triggers completion automatically',()=>{
 let completed=0;const elements={feedback:{},nextQuestion:{},checkAnswer:{}};
 const state={answers:{}};const ctx=vm.createContext({state,current:()=>({id:'q1',topic:'fictional'}),validate:()=>true,responseFor:()=> 'fictional answer',expectedFor:()=> 'fictional answer',save(){},$:id=>elements[id],renderProgressOnly(){},allAnswered:()=>true,complete(){completed++}});
 vm.runInContext(source.slice(source.indexOf('  function check()'),source.indexOf('  function renderProgressOnly()')),ctx);ctx.check();assert.equal(completed,1);
});
test('seven corrected answers with zero first-attempt points are valid; incomplete/foreign/duplicate IDs rejected',()=>{
 const b=backend(),d=payload();d.results.forEach(r=>{r.attempts=2;r.score=0});Object.assign(d,{score:0,percentage:0,correctAnswers:0,incorrectAnswers:7,totalAttempts:14});
 assert.equal(b.post(d).ok,true);assert.equal(b.post(d).duplicate,true);assert.equal(b.mails(),1);
 for(const change of [x=>x.results.pop(),x=>x.results[0].correct=false,x=>x.results[0].id='foreign',x=>x.results[0].id=x.results[1].id]){const x=payload();change(x);assert.equal(backend().post(x).ok,false)}
});
test('mail and notification-log failures do not invalidate the saved submission or trigger duplicate mail',()=>{
 for(const failedMail of [false,true]){const b=backend();b.failMail(failedMail);b.failLog(true);const reply=b.post(payload());assert.equal(reply.ok,true);assert.equal(reply.submissionId,payload().submissionId);assert.equal(b.post(payload()).duplicate,true);assert.equal(b.mails(),failedMail?0:1);}
});
test('incorrect retries block advancement and preserve zero score until corrected',()=>{
 let ok=false,index=0,completed=0;const elements={feedback:{},nextQuestion:{},checkAnswer:{}};const state={answers:{},index:0};
 const ctx=vm.createContext({state,questions:[{id:'q1'},{id:'q2'}],current:()=>({id:'q1',topic:'fictional'}),validate:()=>ok,responseFor:()=>ok?'correct':'wrong',expectedFor:()=> 'correct',save(){},$:id=>elements[id],renderProgressOnly(){},allAnswered:()=>false,complete(){completed++},render(){index++}});
 vm.runInContext(source.slice(source.indexOf('  function check()'),source.indexOf('  function renderProgressOnly()')),ctx);
 vm.runInContext(source.slice(source.indexOf('  function next()'),source.indexOf('  function clean(')),ctx);
 ctx.check();ctx.next();assert.equal(state.index,0);assert.equal(elements.nextQuestion.hidden,true);assert.equal(elements.checkAnswer.hidden,false);
 ctx.check();ok=true;ctx.check();assert.equal(state.answers.q1.score,0);assert.equal(state.answers.q1.attempts,3);assert.equal(state.answers.q1.correct,true);ctx.next();assert.equal(state.index,1);assert.equal(completed,0);
});

test('actual frontend seven-question payload is accepted by the backend including retry scores',async()=>{for(const retry of [false,true]){const b=backend();const f=frontend(async(url,opts)=>({ok:true,json:async()=>b.post(JSON.parse(opts.body))}));if(retry)Object.values(f.state.answers).forEach(r=>{r.attempts=2;r.score=0});await f.ctx.submit();assert.equal(f.state.submitted,true);await f.ctx.submit();assert.equal(b.sheets.get('Student Submissions').rows.length,2);assert.equal(b.sheets.get('Detailed Answers').rows.length,8);assert.equal(b.mails(),1);}});
