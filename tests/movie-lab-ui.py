"""Local Chromium UI tests. Fictional students; external traffic blocked; acknowledgements mocked."""
import json
import threading
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/movie-lab.html'
STORE='mindplay.movieArchitectureLab.v2.seven'
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for retry in (False,True):
        context=browser.new_context(viewport={'width':390,'height':844})
        requests=[]
        seen=set()
        def route(r):
            if r.request.url.startswith('http://127.0.0.1:'):
                r.continue_(); return
            if r.request.url.startswith('https://script.google.com/'):
                body=json.loads(r.request.post_data)
                requests.append(body)
                duplicate=body['submissionId'] in seen
                seen.add(body['submissionId'])
                r.fulfill(status=200,content_type='application/json',headers={'Access-Control-Allow-Origin':'*'},body=json.dumps({'ok':True,'submissionId':body['submissionId'],'duplicate':duplicate})); return
            r.abort()
        context.route('**/*',route)
        page=context.new_page();page.goto(url)
        page.locator('#studentId').fill('Fictional Student');page.locator('#studentClass').fill('123');page.locator('#startLab').click()
        assert page.locator('#moduleTabs button').count()==7
        # Future-topic navigation cannot bypass a question.
        page.locator('#moduleTabs button').nth(6).click()
        assert '1 מתוך 7' in page.locator('#questionCount').inner_text()
        def answer(i,correct):
            if i==2:
                order=['ממלאים טופס','נלחץ submit','הדפדפן שולח POST ל-/choice','Flask מוצא את /choice']
                if not correct: order.reverse()
                page.locator('.flow').evaluate('(el,order)=>order.forEach(v=>el.append([...el.children].find(n=>n.dataset.v===v)))',order)
            elif i==3:
                page.locator('.fillInput').fill('genre' if correct else 'wrong')
            else:
                index={0:0,1:2,4:0,5:1,6:2}[i]
                page.locator('.option').nth(index if correct else (index+1)%4).click()
        for i in range(7):
            if retry:
                answer(i,False);page.locator('#checkAnswer').click()
                assert page.locator('#nextQuestion').is_hidden()
                assert page.locator('#checkAnswer').is_visible()
                assert requests==[]
            answer(i,True);page.locator('#checkAnswer').click()
            if i<6:
                assert requests==[]
                page.locator('#nextQuestion').click()
                if i==3:
                    page.reload()
                    assert requests==[]
        page.wait_for_function("document.getElementById('sendState').textContent.includes('✓')")
        assert len(requests)==1
        data=requests[0]
        assert data['maxScore']==7 and len(data['results'])==7
        assert data['score']==(0 if retry else 7)
        assert data['totalAttempts']==(14 if retry else 7)
        assert all(x['correct'] is True for x in data['results'])
        assert all(x['score']==(0 if retry else 1) for x in data['results'])
        assert data['studentName']=='Fictional Student' and data['groupNumber']==123
        # Retry/reload must reuse exactly the same payload and receive duplicate acknowledgement.
        page.reload();page.wait_for_function("document.getElementById('sendState').textContent.includes('✓')")
        assert len(requests)==2 and requests[1]==data
        assert len(seen)==1
        page.locator('#sendResults').click()
        page.wait_for_function("document.getElementById('sendState').textContent.includes('✓')")
        assert len(requests)==3 and requests[2]==data
        context.close()
    browser.close()
server.shutdown()
print('PASS: 7/7 first-attempt and 0/7 corrected-retry flows; locked navigation; auto-submit only after 7 correct; persisted reload and duplicate retry. All external submissions mocked.')
