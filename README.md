# MindPlay – תרגול

## מעבדת ארכיטקטורה – ממליץ הסרטים

המעבדה משולבת ב־**תרגול פרויקטים – שנה ג׳**: דף הבית → תרגול פרויקטים – שנה ג׳ → ״מעבדת ארכיטקטורה – ממליץ הסרטים״. היא מדמה בדפדפן את פרויקט Flask; GitHub Pages אינו מריץ Python או Flask.

להרצה מקומית פתחו שרת סטטי מתוך תיקיית האתר, לדוגמה `py -3 -m http.server 4173`, וגשו ל־`http://127.0.0.1:4173/`. כל הקישורים יחסיים ולכן עובדים גם תחת נתיב GitHub Pages. ההתקדמות נשמרת ב־`localStorage`; ״התחלה מחדש״ מוחק רק את נתוני המעבדה בדפדפן הנוכחי.

מאגר הסרטים המקורי בן 50 הרשומות לא נמצא בריפו. לכן הסימולטור משתמש ב־fixture חינוכי קטן, שמסומן כך גם בממשק. אין שינוי בפרויקט Flask המקורי של התלמידים.

## Seven-question lab and Google reporting — prepared on main, not deployed

Exactly seven questions remain, one per topic: architecture, HTML form, POST journey, request.form, JSON, filtering and response/debugging. Incorrect answers block Next and future-topic tabs. Students must correct them; the first attempt alone earns 0 or 1 point, maximum 7. Submission starts only after all seven correct completions. A separate v2.seven localStorage key leaves legacy 21-activity progress intact, but does not import it into a new seven-question attempt. New attempts have new stable IDs. Retry/reload preserves the frozen payload and its ID.

### Actual supplied backend comparison

The owner supplied current Code.gs in chat on 2026-11-02. It uses direct JSON POST/ContentService, not an HTML bridge, and already acknowledges matching submission IDs after detail/summary flushes. It uses openByUrl(), duplicate-ID locking, partial-detail repair and teacher email. Its validator ties final correctness to first-attempt score (`r.correct !== (r.score === 1)`), which rejects corrected zero-point answers. The prepared replacement separates these meanings, requires exactly the seven known question IDs, retains numeric group numbers and detailed answers, and ensures mail/log failures do not invalidate saved submissions. Summary correct/incorrect counts describe first-attempt scoring; every final detailed answer is correct on completion.

The replacement retains openByUrl() but moves the private spreadsheet URL to the SPREADSHEET_URL Script Property; no private spreadsheet address is included in frontend code or this report. TEACHER_EMAIL remains a Script Property. GET returns only method_not_allowed. No spreadsheet records were read. Source comparison uses the owner's supplied code; the live deployed revision could not be independently confirmed (the network proxy returned HTTP 403).

### Exact deployment steps — perform only after approval

1. In the existing Apps Script project, back up current Code.gs. Replace it with the complete `google-apps-script/Code.gs` from this checkout. No HTML bridge file is required by this direct POST protocol. If additional deployed HTML/bridge files exist outside the supplied source, review them before changing the transport.
2. Project Settings → Script properties: preserve TEACHER_EMAIL. Add SPREADSHEET_URL using the same private spreadsheet URL from your existing getSpreadsheet_ implementation. No SPREADSHEET_ID property is needed. Do not paste private addresses into frontend code.
3. Save; run testSpreadsheetConnection, then setupSheets as the teacher and authorize Sheets/Mail permissions. These functions do not submit student records or print spreadsheet details. Confirm the three reporting tabs exist privately. Keep spreadsheet General access Restricted and do not publish it to the web.
4. Deploy → Manage deployments → select the deployment corresponding to the configured /exec URL → Edit (pencil) → Version: New version → Deploy. Execute as the teacher, with access allowing the intended students to invoke it. Update this existing deployment so the configured URL stays unchanged. Do not create an unrelated deployment.
5. After separate frontend publishing approval, publish the reviewed main changes. The configured endpoint is https://script.google.com/macros/s/AKfycbxWOPCAziceEkGdFPrq4EctjIeafEUvSic6GctWXJPjoyjboD-Frx6kuFMDyGGwaaX5aQ/exec .
6. From the actual site origin, use only Fictional Student and group 123. Make a wrong attempt then correct it; confirm Next stays blocked until correct and that point stays zero. Complete all seven. Confirm one automatic POST, readable JSON with ok:true and the exact submissionId, one summary row, seven detailed rows and one teacher email. Confirm no POST after only six correct completions. Do not report private row contents.
7. Reload and retry the saved submission; verify the same ID/body, duplicate:true, no additional rows or email. Simulate a lost/offline response: no success message, frozen retry data retained. Never replace CORS with no-cors. If the response is unreadable after Google's redirect, direct transport remains unverified and needs an approved transport fix before classroom use.

### Tests and limits

Run all available tests: `node tests/movie-submission.cjs` and `python tests/movie-lab-ui.py`. The Node suite uses in-memory Sheets, MailApp and fetch doubles. Chromium tests run the real local UI with fictional identities; all external traffic is blocked except intercepted Apps Script requests answered with mocked JSON. They cover seven-question maximum, first-attempt full score, incorrect retries scoring zero, navigation locks, no early POST, automatic completion, reload persistence, matching-ID confirmation and duplicate retries. Syntax and git diff whitespace checks also run.

No real Google submission, Sheets write/read or email delivery was tested. Live CORS, Google permissions, delivery and spreadsheet privacy require the manual checks above. The supplied source was compared, but the deployed revision remains independently unverified. Email is attempted at most once per committed ID; a crash after save can lose a notification. Existing older committed IDs are treated as saved; inspect historical partial records privately if needed. Client-side grading is educational, not tamper-proof identity or exam authentication.

No commit, push or deployment has been performed.
