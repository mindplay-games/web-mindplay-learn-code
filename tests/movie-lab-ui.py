"""Approved questions in real local Chromium. Google navigation is mocked; no submission."""
import html
import json
import threading
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import parse_qs, urlparse
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
STORE='mindplay.movieArchitectureLab.v3.approved'
OLD_STORE='mindplay.movieArchitectureLab.v2.seven'
FORM='https://docs.google.com/forms/d/e/1FAIpQLScKmgVwoDWkDnnl22cZOdMjt2wWyKbkJV41K1By4g4HMWF5Cw/viewform'
TITLES=['מי אחראי על מה בפרויקט?','מתקנים את טופס הסרטים','איך בקשת POST מגיעה לשרת?','איך Flask קורא את הבחירה מהטופס?','בלשי ה־JSON','מי נכנס לרשימת הסרטים?','בלשי הבאגים: לאן נעלמה התוצאה?']
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'
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
                body='<meta charset="utf-8"><title>Mock Google Form</title>'
                body+=''.join(f'<textarea name="{html.escape(k)}">{html.escape(v[0])}</textarea>' for k,v in values.items() if k.startswith('entry.'))
                r.fulfill(content_type='text/html',body=body);return
            r.abort()
        context.route('**/*',route)
        page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.goto(base+'/movie-lab.html')
        page.locator('#startLab').click();assert page.locator('#intro').is_visible()
        page.locator('#studentId').fill('נועה' if retry else 'Alex');page.locator('#studentClass').fill('x');page.locator('#startLab').click();assert page.locator('#intro').is_visible()
        page.locator('#studentClass').fill('3');page.locator('#startLab').click()
        assert page.locator('#moduleTabs button').count()==7
        page.locator('#moduleTabs button').nth(6).click();assert page.locator('#questionTitle').inner_text()==TITLES[0]
        def set_parts(values):
            for j,value in enumerate(values):page.locator(f'[data-part="{j}"] input[value="{value}"]').check()
        def set_order(order):
            for target,id in enumerate(order):
                while page.locator('.flowRow').evaluate_all('(rows,id)=>rows.findIndex(r=>r.dataset.v===id)',id)>target:
                    button=page.locator(f'.flowRow[data-v="{id}"] .up');button.focus();page.keyboard.press('Enter')
                    assert page.locator(f'.flowRow[data-v="{id}"] .up').evaluate('(button)=>document.activeElement===button')
        def answer(i,correct):
            if i==0:page.locator('.option').nth(0 if correct else 1).click()
            elif i==1:set_parts(['genre','comedy' if correct else 'genre'])
            elif i==2:set_order(['click','post','route','read'] if correct else ['read','route','post','click'])
            elif i==3:set_parts(['genre','comedy','genre' if correct else 'action'])
            elif i==4:set_parts(['Shrek','length','comedy','length' if correct else 'name'])
            elif i==5:
                for id in ['shrek','kung-fu-panda','funny-movie','short-comedy']:page.locator(f'.moviePick input[value="{id}"]').set_checked(id in (['shrek','short-comedy'] if correct else ['shrek','funny-movie']))
            else:page.locator('.option').nth(1 if correct else 0).click()
        for i in range(7):
            assert page.locator('#questionTitle').inner_text()==TITLES[i]
            assert page.locator('#solution').is_hidden()
            assert page.locator('#projectExamples pre').count()>=1
            for block in page.locator('#projectExamples pre').all():assert block.evaluate('(el)=>getComputedStyle(el).direction')=='ltr'
            assert page.evaluate('getComputedStyle(document.body).direction')=='rtl'
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(width,i)
            if i!=2:assert page.locator('#checkAnswer').is_disabled()
            if i in (1,3,4):
                assert page.locator('#activity input:not([type="radio"])').count()==0
                page.locator('[data-part="0"] input').first.check();assert page.locator('#checkAnswer').is_disabled()
                if i==1:
                    page.reload();assert page.locator('[data-part="0"] input[value="genre"]').is_checked();assert page.locator('#checkAnswer').is_disabled()
            if i==2:
                assert page.locator('.flowRow').evaluate_all('(rows)=>rows.map(r=>r.dataset.v)')!=['click','post','route','read']
                assert page.locator('.flowRow code').count()==4
            if i==6:
                assert 'Shrek' in page.locator('.outputComparison').inner_text()
                assert 'החיפוש הסתיים' in page.locator('.outputComparison').inner_text()
                assert 'return movie_name' not in page.locator('#projectExamples').inner_text()
            if retry:
                answer(i,False);page.locator('#checkAnswer').click()
                assert page.locator('#nextQuestion').is_hidden();assert page.locator('#solution').is_hidden()
                assert page.locator('#checkAnswer').is_enabled()
                assert page.locator('#feedback').inner_text().startswith('✕')
                # Wrong feedback must not reveal the success-only output/corrected code.
                assert page.locator('#solution').inner_html()==''
            answer(i,True)
            if i==1:assert 'name="① genre"' in page.locator('#projectExamples').text_content() and 'value="② comedy"' in page.locator('#projectExamples').text_content()
            if i==3:assert 'request.form["genre"]' in page.locator('#projectExamples').inner_text()
            if i==4:assert page.locator('#jsonPreview').inner_text()=='print(movie["length"])'
            page.locator('#checkAnswer').click()
            assert page.locator('#feedback').inner_text().startswith('✓')
            assert page.locator('#nextQuestion').is_visible()
            assert page.locator('#completion').is_hidden() # Success remains visible, including Q7.
            if i==3:assert page.locator('#solution').inner_text().strip().endswith('comedy')
            if i==4:assert page.locator('#solution').inner_text().strip().endswith('90')
            if i==6:assert 'return movie_name' in page.locator('#solution').inner_text() and page.locator('#solution').inner_text().endswith('Shrek')
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),('solved',width,i)
            page.screenshot(path=str(ROOT/'work'/f'approved-{width}-q{i+1}-{retry}.png'),full_page=True)
            if i==4:
                page.reload();assert page.locator('#questionTitle').inner_text()==TITLES[4];assert page.locator('#solution').is_visible()
                assert page.locator('[data-part="3"] input[value="length"]').is_checked()
            page.locator('#nextQuestion').click()
        assert page.locator('.resultQuestion').count()==7
        assert ('0/7' if retry else '7/7') in page.locator('#completion').inner_text()
        assert page.locator('.attemptHistory li').count()==(14 if retry else 7)
        saved=page.evaluate('(key)=>JSON.parse(localStorage.getItem(key))',STORE)
        assert sum(a['score'] for a in saved['answers'].values())==(0 if retry else 7)
        assert len(saved['answers']['html_name']['submitted']['parts'])==2
        assert len(saved['answers']['request_key']['submitted']['parts'])==3
        assert len(saved['answers']['json_key']['submitted']['parts'])==4
        assert saved['answers']['and_operator']['submitted']['movies'][1]['id']=='short-comedy'
        assert [c['id'] for c in saved['answers']['post_order']['submitted']['order']]==['click','post','route','read']
        assert len(context.pages)==1 and opened==[]
        page.reload();assert opened==[]
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),('summary',width)
        # The transport/length guard is intentionally unchanged. Full new multi-part
        # reports can exceed its budget; test its explicit manual-paste path.
        page.locator('#sendResults').click()
        if page.locator('#formFallback').is_visible():
            href=page.locator('#formFallback').get_attribute('href');fields=parse_qs(urlparse(href).query)
            assert fields['entry.455032283']==['נועה' if retry else 'Alex']
            assert fields['entry.980947848']==['0/7' if retry else '7/7']
            assert 'entry.1484528458' not in fields
            assert 'שום תשובה לא קוצרה' in page.locator('#sendState').inner_text()
        else:
            form=context.pages[-1];form.wait_for_url('https://docs.google.com/forms/**');form.locator('textarea').first.wait_for();assert form.locator('textarea').count()==4
            assert form.locator('[name="entry.1484528458"]').input_value().count('התשובה הנכונה:')==7
            form.close()
        assert 'נשלחו בהצלחה' not in page.locator('#completion').inner_text()
        context.close()
    # Prior question-set results are retained; only identification carries over.
    context=browser.new_context();context.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.abort())
    page=context.new_page();page.goto(base+'/movie-lab.html')
    old={'studentId':'Alex','studentClass':'3','firstNameOnly':True,'completed':True,'index':6,'answers':{'arch_frontend':{'correct':True,'score':1,'attempts':1,'answer':'old answer'}}}
    page.evaluate('([key,value])=>localStorage.setItem(key,JSON.stringify(value))',[OLD_STORE,old]);page.reload()
    assert page.locator('#intro').is_visible() and page.locator('#studentId').input_value()=='Alex'
    page.locator('#startLab').click();assert page.locator('#questionTitle').inner_text()==TITLES[0]
    assert page.evaluate('(key)=>JSON.parse(localStorage.getItem(key))',OLD_STORE)==old
    context.close()
    # Unrelated-page smoke tests.
    context=browser.new_context();context.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.abort())
    page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
    for path in ('/','/category.html?group=projects_y3','/practice.html','/typing.html'):
        response=page.goto(base+path);assert response.status==200;assert page.title();assert page.locator('body').inner_text().strip()
    context.close();browser.close()
server.shutdown()
assert errors==[],errors
print('PASS: 56 approved-question/viewport combinations; eight full first-attempt/retry flows; live code previews, repeatable matching, keyboard ordering, exact multi-select, deferred outputs, history, 0/7 and 7/7, preserved transport/length fallback and old progress. External requests blocked; Google not submitted.')
