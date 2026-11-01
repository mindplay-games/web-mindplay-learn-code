# MindPlay – תרגול

## מעבדת ארכיטקטורה – ממליץ הסרטים

המעבדה משולבת ב־**תרגול פרויקטים – שנה ג׳**: דף הבית → תרגול פרויקטים – שנה ג׳ → ״מעבדת ארכיטקטורה – ממליץ הסרטים״. היא מדמה בדפדפן את פרויקט Flask; GitHub Pages אינו מריץ Python או Flask.

להרצה מקומית פתחו שרת סטטי מתוך תיקיית האתר, לדוגמה `py -3 -m http.server 4173`, וגשו ל־`http://127.0.0.1:4173/`. כל הקישורים יחסיים ולכן עובדים גם תחת נתיב GitHub Pages. ההתקדמות נשמרת ב־`localStorage`; ״התחלה מחדש״ מוחק רק את נתוני המעבדה בדפדפן הנוכחי.

מאגר הסרטים המקורי בן 50 הרשומות לא נמצא בריפו. לכן הסימולטור משתמש ב־fixture חינוכי קטן, שמסומן כך גם בממשק. אין שינוי בפרויקט Flask המקורי של התלמידים.

## Google Sheets ודיוור למורה — הגדרה ידנית נדרשת

הקובץ `google-apps-script/Code.gs` יוצר אוטומטית שני גיליונות פרטיים: `Student Submissions` ו־`Detailed Answers`, וכן `Notification Log` לשגיאות דיוור. הוא שומר כל submission ID פעם אחת בלבד, מנקה ניסיון להזרקת נוסחאות, מגביל payload, ומנסה לשלוח מייל רק אחרי שהנתונים נשמרו. כשל במייל נרשם בלוג ואינו מוחק הגשה.

1. צרו Google Sheet פרטי. העתיקו את מזהה הגיליון מתוך כתובת הדפדפן.
2. בחרו Extensions → Apps Script, החליפו את הקוד בתוכן `google-apps-script/Code.gs` ושמרו.
3. ב־Project Settings → Script properties הוסיפו `SPREADSHEET_ID` ואת `TEACHER_EMAIL` של המורה.
4. הריצו פעם אחת את `setupSheets` מתוך העורך ואשרו הרשאות Google. ודאו שנוצרו שלושת הגיליונות.
5. בחרו Deploy → New deployment → Web app. הגדירו את החשבון שמריץ את הסקריפט לחשבון המורה. מדיניות הגישה חייבת לאפשר לתלמידי האתר לשלוח POST; שמרו את כתובת ה־`/exec`.
6. הדביקו את כתובת ה־`/exec` במשתנה `APPS_SCRIPT_URL` בראש `js/movie-lab.js`. אל תכניסו שם אימייל, מזהה גיליון או סוד.
7. פרסמו את האתר, השלימו הגשה ניסיונית, ובדקו שורה ב־`Student Submissions`, שורות ב־`Detailed Answers` ומייל למורה.

לפני ההגדרה, הכפתור אינו שולח דבר והתוצאות נשמרות מקומית בלבד. במקרה כשל רשת מוצגת אפשרות לנסות שוב והסיכום נשאר בדפדפן. אין לטעון שהמערכת עובדת עד לבדיקת ההגשה האמיתית מול החשבון שלכם.

### פרטיות ומגבלות

נאספים רק שם מלא ומספר קבוצה. שמרו את הגיליון פרטי, הגדירו מדיניות מחיקה לפי צרכי בית הספר, ואל תשתפו קישור עריכה. כתובת Web App ציבורית אינה מאמתת זהות תלמיד/ה ואינה הגנת ספאם מלאה; להגנה חזקה דרוש backend מאומת. ללא רשימת תלמידים אין דרך להסיק מי לא השלים.

### Submission protocol and verification (2026-11-01)

The configured `/exec` endpoint is already present in `js/movie-lab.js`. The frontend sends a CORS POST with `Content-Type: text/plain;charset=utf-8`, omits credentials, and follows redirects. This avoids an application/json preflight; it does **not** bypass CORS. Apps Script ContentService redirects to `script.googleusercontent.com`. The final response must be readable JSON with `ok: true` and the exact `submissionId`. An opaque response, login HTML, timeout, HTTP error, or mismatched acknowledgement never confirms success. Do not switch to `no-cors` as a workaround.

Before sending, the browser persists a frozen payload in localStorage. Retries (including after reload) reuse its ID, timestamp, duration, scores and answers. Group number is sent as a JSON number; leading zeroes are normalized. Answers preserve their original text; spreadsheet formula escaping happens on the server. Resetting the lab deliberately deletes its local results and creates a new submission identity. Local results are specific to this browser and origin; clearing browser storage removes them.

The server validates field types and score/attempt totals, writes details first and summary last under a script lock, and repairs incomplete details on retry. A committed summary suppresses subsequent writes and email attempts. Email delivery is at most once per ID: a crash after saving but before sending can lose the notification. MailApp and Sheets cannot provide transactional exactly-once delivery. Existing rows written by an older deployment are considered committed; inspect their detail rows manually if an older attempt failed partway through.

`doGet` returns only `method_not_allowed`; neither success nor failure responses include records or spreadsheet URLs. This source review does not verify the deployed version or spreadsheet sharing. `setupSheets` creates tabs in the configured spreadsheet; it does not make the spreadsheet private. The owner must set General access to **Restricted**, check individual sharing, and ensure the sheet is not published to the web.

Local verification: `node tests/movie-submission.cjs` runs five fictional-data tests of the frontend submission function and Apps Script with in-memory service doubles. These are not Google Sheets tests. A local Chromium smoke test also exercised all 21 answer records, failure preservation, numeric group number, and identical retry with mocked endpoint responses. JavaScript syntax checks passed. No live submission was sent: the cloud proxy denied `script.google.com` with HTTP 403 before reaching Google. Live redirect/CORS behavior and spreadsheet privacy remain unverified.

Pending owner-approved deployment and manual test:

1. Review both code changes together. The new frontend requires the matching-ID acknowledgement from the new Apps Script source; the previous `{ok:true}` response is intentionally unconfirmed. No changes have been committed, pushed, or deployed.
2. After approving deployment, update the existing Apps Script deployment to the reviewed code and publish the frontend. Keep the spreadsheet private while allowing the intended students to invoke the Web App.
3. From the actual GitHub Pages origin, use only a fictional full name and numeric group. Confirm the POST follows Google's redirect and returns readable JSON with the matching ID. Confirm exactly one summary row, all detailed answers, matching scores and one teacher email.
4. Retry the same saved submission, then reload and retry. Verify the same ID and payload, no extra summary/detail rows, and no extra email. Simulate a lost/offline response; the browser must retain results and permit retry without claiming confirmed success.
5. Signed out, verify `/exec` and GET requests with query parameters return no student data. Verify the spreadsheet's General access is Restricted and it is not published to the web. Do not include real records in test reports.

The integration remains **not live-verified** until the owner confirms the Sheet rows, details, notification and privacy settings. Access to the owner's Google account or spreadsheet is not required for the local tests.
