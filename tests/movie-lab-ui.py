"""Local Chromium exercise; Google Form GET pages are mocked. No real Google submission."""
import html
import json
import threading
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import parse_qs, urlparse
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'
FORM='https://docs.google.com/forms/d/e/1FAIpQLScKmgVwoDWkDnnl22cZOdMjt2wWyKbkJV41K1By4g4HMWF5Cw/viewform'
STATUS="הטופס נפתח עם התוצאות שלך. יש ללחוץ על 'שליחה' בטופס Google כדי להשלים את ההגשה."
STORE='mindplay.movieArchitectureLab.v2.seven'
errors=[]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for width in (1280,768,390,320):
      for retry in (False,True):
        context=browser.new_context(viewport={'width':width,'height':900})
        opened=[]
        def route(r):
            if r.request.url.startswith(base):r.continue_();return
            if r.request.url.startswith(FORM):
                assert r.request.method=='GET'
                values=parse_qs(urlparse(r.request.url).query);opened.append(values)
                # Test double for checking what the new tab receives; not the real form.
                body='<meta charset="utf-8"><title>Mock prefilled Google Form — not submitted</title><h1>Mock only</h1>'
                body+=''.join(f'<label>{html.escape(key)}<textarea name="{html.escape(key)}">{html.escape(values[key][0])}</textarea></label>' for key in values if key.startswith('entry.'))
                r.fulfill(content_type='text/html',body=body);return
            r.abort()
        context.route('**/*',route)
        page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.goto(base+'/movie-lab.html')
        page.locator('#startLab').click();assert page.locator('#intro').is_visible()
        page.locator('#studentId').fill('נועה' if retry else 'Alex');page.locator('#studentClass').fill('x');page.locator('#startLab').click();assert page.locator('#intro').is_visible()
        page.locator('#studentClass').fill('3');page.locator('#startLab').click()
        assert page.locator('#moduleTabs button').count()==7
        page.locator('#moduleTabs button').nth(6).click();assert '1 מתוך 7' in page.locator('#questionCount').inner_text()
        def answer(i,correct):
            if i==2:
                order=['ממלאים טופס','נלחץ submit','הדפדפן שולח POST ל-/choice','Flask מוצא את /choice']
                if not correct:order.reverse()
                page.locator('.flow').evaluate('(el,order)=>order.forEach(v=>el.append([...el.children].find(n=>n.dataset.v===v)))',order)
            elif i==3:page.locator('.fillInput').fill('genre' if correct else 'טעות & + ?')
            else:
                index={0:0,1:2,4:0,5:1,6:2}[i]
                page.locator('.option').nth(index if correct else (index+1)%4).click()
        for i in range(7):
            assert page.locator('#projectCode').inner_text().strip()
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),(width,i)
            if retry:
                answer(i,False);page.locator('#checkAnswer').click()
                assert page.locator('#nextQuestion').is_hidden();assert page.locator('#checkAnswer').is_visible();assert opened==[]
            answer(i,True);page.locator('#checkAnswer').click()
            if i<6:
                assert opened==[];page.locator('#nextQuestion').click()
                if i==3:page.reload();assert opened==[]
        assert page.locator('.resultQuestion').count()==7
        assert ('0/7' if retry else '7/7') in page.locator('#completion').inner_text()
        assert page.locator('.attemptHistory li').count()==(14 if retry else 7)
        if retry:assert 'טעות & + ?' in page.locator('#completion').inner_text()
        assert opened==[] and len(context.pages)==1
        page.reload();assert opened==[] and len(context.pages)==1
        assert page.locator('.resultQuestion').count()==7
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),('summary',width)
        page.screenshot(path=str(ROOT/'work'/f'google-summary-{width}-{retry}.png'),full_page=True)
        with page.expect_popup() as event:page.locator('#sendResults').click()
        form=event.value;form.wait_for_url('https://docs.google.com/forms/**');form.wait_for_load_state('domcontentloaded')
        assert len(opened)==1;fields=opened[0]
        assert form.evaluate('window.opener === null')
        assert form.locator('textarea').count()==4
        assert form.locator('[name="entry.455032283"]').input_value()==('נועה' if retry else 'Alex')
        assert form.locator('[name="entry.1497177381"]').input_value()=='3'
        assert form.locator('[name="entry.980947848"]').input_value()==('0/7' if retry else '7/7')
        details=form.locator('[name="entry.1484528458"]').input_value()
        assert details.count('התשובה הנכונה:')==7 and details.count('שאלה:')==7
        assert details.count('ניסיון ')==(14 if retry else 7)
        if retry:assert 'טעות & + ?' in details and 'ניסיון 1 — לא נכון' in details
        assert page.locator('#sendState').inner_text()==STATUS
        assert 'נשלחו בהצלחה' not in page.locator('#completion').inner_text()
        form.close();assert page.locator('.resultQuestion').count()==7
        page.reload();assert len(opened)==1
        assert page.locator('#sendState').inner_text()=='' and page.locator('#sendResults').is_enabled()
        with page.expect_popup() as event:page.locator('#sendResults').click()
        form=event.value;form.wait_for_url('https://docs.google.com/forms/**');form.wait_for_load_state('domcontentloaded')
        assert len(opened)==2 and opened[0]==opened[1];form.close();context.close()
    # Legacy progress, unavailable old attempts, retired confirmations, popup blocker.
    context=browser.new_context();context.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.abort())
    page=context.new_page();page.goto(base+'/movie-lab.html')
    state={'studentId':'Alex Example','studentClass':'3','submissionId':'fictional-legacy-0001','index':6,'completed':True,'answers':{id:{'correct':True,'attempts':2,'score':0,'answer':'known final','expected':'expected','topic':'test'} for id in ['arch_frontend','html_name','post_order','request_key','json_key','and_operator','response_debug']},'submitted':True,'emailSent':True,'pendingSubmission':{'studentName':'Alex Example'}}
    page.evaluate('([key,state])=>localStorage.setItem(key,JSON.stringify(state))',[STORE,state]);page.reload()
    assert page.locator('.resultQuestion').count()==7 and 'Alex Example' not in page.locator('#completion').inner_text()
    assert 'לא נשמר בגרסה הישנה' in page.locator('#completion').inner_text()
    assert page.locator('#sendState').inner_text()==''
    page.evaluate('window.open = () => null');page.locator('#sendResults').click()
    assert 'חסם' in page.locator('#sendState').inner_text()
    assert page.locator('#formFallback').is_visible()
    assert page.locator('#formFallback').get_attribute('rel')=='noopener noreferrer'
    assert parse_qs(urlparse(page.locator('#formFallback').get_attribute('href')).query)['entry.980947848']==['0/7']
    context.close()
    # Unrelated pages remain unchanged; basic local regression smoke tests.
    context=browser.new_context();context.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.abort())
    page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
    for path in ('/','/category.html?group=projects_y3','/practice.html','/typing.html'):
        response=page.goto(base+path);assert response.status==200;assert page.title();assert page.locator('body').inner_text().strip()
    context.close();browser.close()
server.shutdown()
assert errors==[],errors
print('PASS: 8 seven-question flows at 1280/768/390/320px; first names/groups; 0/7 and 7/7 scoring; incorrect attempt histories; four prefilled fields; Hebrew/multiline encoding; explicit new tabs; no false confirmation; preserved reloads; popup blocker; legacy migration; unrelated-page smoke tests. Google page mocked; no real submission.')
