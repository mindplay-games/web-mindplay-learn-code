/* Required Script Properties: SPREADSHEET_URL (private Sheet URL) and TEACHER_EMAIL. */
const MAX_BODY=30000, MAX_RESULTS=7, SUBMISSIONS='Student Submissions', DETAILS='Detailed Answers', LOG='Notification Log';
function getSpreadsheet_(){return SpreadsheetApp.openByUrl(required_('SPREADSHEET_URL'));}
function testSpreadsheetConnection(){getSpreadsheet_();return true;}
function setupSheets(){const b=getSpreadsheet_();ensure_(b,SUBMISSIONS,['Submission ID','Student name','Group number','Submission date','Submission time','Total score','Maximum score','Percentage','Correct answers','Incorrect answers','Total attempts','Duration (seconds)','Topics requiring improvement','Completion status']);ensure_(b,DETAILS,['Submission ID','Student name','Group number','Question ID','Question topic','Student answer','Correct answer','Correct/incorrect','Number of attempts','Score awarded']);ensure_(b,LOG,['Time','Submission ID','Status','Details']);}
// Public GET never returns records, spreadsheet URLs, names, or submission status.
function doGet(){return reply_({ok:false,error:'method_not_allowed'});}
function doPost(e){
  const lock=LockService.getScriptLock();
  let locked=false;
  try{
    lock.waitLock(10000);locked=true;
    const raw=e&&e.postData&&e.postData.contents||'';
    if(!raw||raw.length>MAX_BODY)return reply_({ok:false,error:'invalid_payload'});
    let d;try{d=JSON.parse(raw)}catch(_){return reply_({ok:false,error:'invalid_json'})}
    if(!valid_(d))return reply_({ok:false,error:'invalid_payload'});
    const b=getSpreadsheet_();
    setupSheets();
    const main=b.getSheetByName(SUBMISSIONS), detail=b.getSheetByName(DETAILS);
    const exists=main.getLastRow()>1&&main.getRange(2,1,main.getLastRow()-1,1).getValues().flat().includes(d.submissionId);
    if(exists)return reply_({ok:true,submissionId:d.submissionId,duplicate:true});
    // A previous attempt may have stopped before committing the summary.
    // Rebuild its detail rows under the same lock, then commit the summary last.
    if(detail.getLastRow()>1){
      const ids=detail.getRange(2,1,detail.getLastRow()-1,1).getValues();
      for(let i=ids.length-1;i>=0;i--)if(ids[i][0]===d.submissionId)detail.deleteRow(i+2);
    }
    const rows=d.results.map(r=>[d.submissionId,safe_(d.studentName,60),d.groupNumber,safe_(r.id,100),safe_(r.topic,100),safe_(r.answer,500),safe_(r.expected,500),r.correct?'נכון':'לא נכון',r.attempts,r.score]);
    detail.getRange(detail.getLastRow()+1,1,rows.length,10).setValues(rows);
    SpreadsheetApp.flush();
    const at=new Date(d.submittedAt);
    main.appendRow([d.submissionId,safe_(d.studentName,60),d.groupNumber,Utilities.formatDate(at,Session.getScriptTimeZone(),'yyyy-MM-dd'),Utilities.formatDate(at,Session.getScriptTimeZone(),'HH:mm:ss'),d.score,d.maxScore,d.percentage,d.correctAnswers,d.incorrectAnswers,d.totalAttempts,d.durationSeconds,safe_(d.topicsForImprovement.join(', '),500),d.completionStatus]);
    SpreadsheetApp.flush();
    // Summary is the durable email claim: retries never send another email.
    // A crash after commit can lose a notification; exactly-once email is not
    // transactional with Sheets/MailApp. Prefer no duplicate mail over replay.
    let status='email_sent';
    try{notify_(d,b.getUrl());}catch(_){status='email_failed';}
    // A failed notification/log must never invalidate the committed submission.
    try{b.getSheetByName(LOG).appendRow([new Date(),d.submissionId,status,status==='email_sent'?'Teacher notification sent':'Notification failed; check Apps Script execution privately']);}catch(_){}
    return reply_({ok:true,submissionId:d.submissionId,duplicate:false});
  }catch(err){return reply_({ok:false,error:'server_error'});}
  finally{if(locked){try{lock.releaseLock();}catch(_){}}}
}
function notify_(d,url){const body=['התקבלה הגשה חדשה במעבדת ארכיטקטורה – ממליץ הסרטים.','',`תלמיד/ה: ${safe_(d.studentName,60)}`,`קבוצה: ${safe_(d.groupNumber,8)}`,`ציון: ${d.score}/${d.maxScore} (${d.percentage}%)`,`משך: ${d.durationSeconds} שניות`,`נושאים לתרגול: ${d.topicsForImprovement.join(', ')||'אין'}`,`גיליון פרטי: ${url}`].join('\n');MailApp.sendEmail(required_('TEACHER_EMAIL'),'תרגול שנה ג׳ – הגשה חדשה',body);}
function valid_(d){
  const integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
  const text=(v,max)=>typeof v==='string'&&v.length<=max;
  if(!d||!text(d.submissionId,100)||!/^[a-zA-Z0-9-]{10,100}$/.test(d.submissionId)||!text(d.studentName,60)||d.studentName.trim().split(/\s+/).length<2)return false;
  if(!integer(d.groupNumber,0,99999999)||!text(d.submittedAt,40)||!Number.isFinite(Date.parse(d.submittedAt))||d.completionStatus!=='completed')return false;
  if(!Array.isArray(d.results)||d.maxScore!==MAX_RESULTS||d.results.length!==d.maxScore||!integer(d.score,0,d.maxScore)||!integer(d.totalAttempts,1,1000)||!integer(d.durationSeconds,0,31536000))return false;
  if(!Array.isArray(d.topicsForImprovement)||d.topicsForImprovement.length>MAX_RESULTS||!d.topicsForImprovement.every(t=>text(t,100)))return false;
  const expectedIds=['arch_frontend','html_name','post_order','request_key','json_key','and_operator','response_debug'];
  const ids=new Set();
  for(const r of d.results){
    if(!r||!text(r.id,100)||!expectedIds.includes(r.id)||ids.has(r.id)||!text(r.topic,100)||!text(r.answer,500)||!text(r.expected,500)||!integer(r.attempts,1,1000)||!integer(r.score,0,1)||r.correct!==true||(r.attempts===1&&r.score!==1))return false;
    ids.add(r.id);
  }
  return d.score===d.results.reduce((n,r)=>n+r.score,0)&&d.totalAttempts===d.results.reduce((n,r)=>n+r.attempts,0)&&d.correctAnswers===d.score&&d.incorrectAnswers===d.maxScore-d.score&&d.percentage===Math.round(d.score/d.maxScore*100);
}
function safe_(v,max){return String(v==null?'':v).replace(/[\u0000-\u001F]/g,' ').slice(0,max).replace(/^(\s*[=+\-@])/,"'$1");}
function required_(n){const v=PropertiesService.getScriptProperties().getProperty(n);if(!v)throw new Error(`Missing Script Property: ${n}`);return v;}
function ensure_(b,n,h){let s=b.getSheetByName(n);if(!s)s=b.insertSheet(n);if(s.getLastRow()===0){s.appendRow(h);s.setFrozenRows(1);s.getRange(1,1,1,h.length).setFontWeight('bold');}return s;}
function reply_(d){return ContentService.createTextOutput(JSON.stringify(d)).setMimeType(ContentService.MimeType.JSON);}
