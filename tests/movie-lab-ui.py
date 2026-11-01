"""Run with a local server on port 4173: python3 tests/movie-lab-ui.py.
Fictional local data only. External requests are blocked; no reporting POSTs.
"""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = Path('/workspace/artifacts/movie-lab')
ARTIFACTS.mkdir(parents=True, exist_ok=True)
source = (ROOT / 'js/movie-lab.js').read_text()
# Test-only access to the real renderer, questions and state; never saved in app.
source = source.replace('})();', 'window.__lab = {questions, state, render, responseFor};})();')
seed = {'studentId':'Fictional Student','studentClass':'123','startedAt':1793520000000,'index':0,'answers':{},'submissionId':'fictional-design-test-0001'}
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    errors = []
    total = 0
    for width in [1280, 768, 390, 320]:
        page = browser.new_page(viewport={'width':width,'height':900}, reduced_motion='reduce')
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.route('https://**/*', lambda r: r.abort())
        page.route('**/js/movie-lab.js', lambda r: r.fulfill(body=source, content_type='application/javascript'))
        page.goto('http://127.0.0.1:4173/movie-lab.html')
        if width in [1280,390]: page.screenshot(path=str(ARTIFACTS / f'intro-{width}.png'),full_page=True)
        page.locator('#studentId').fill(seed['studentId'])
        page.locator('#studentClass').fill(seed['studentClass'])
        page.locator('#startLab').click()
        qs = page.evaluate('__lab.questions')
        assert len(qs)==21
        assert len(set(q['module'] for q in qs))==7
        seen = set()
        for i,q in enumerate(qs):
            page.evaluate('(i)=>{__lab.state.index=i;__lab.render()}',i)
            assert page.locator('#questionTitle').inner_text()==q['title'],(width,q['id'],page.locator('#questionTitle').inner_text())
            assert page.locator('[aria-current="step"]').first.count()
            kind=q['type']
            if kind=='choice':
                page.locator(f'.option[data-v="{q["answer"]}"]').click()
                assert page.evaluate('__lab.responseFor(__lab.questions[__lab.state.index])')==q['options'][q['answer']]
            elif kind=='match':
                for j,answer in enumerate(q['pairs'].values()):
                    page.locator('.matchRow').nth(j).get_by_role('radio', name=answer, exact=True).check()
                assert page.locator('.matchRow select').count()==0
            elif kind=='fill':
                for j,answer in enumerate(q['answer']):
                    page.locator('[data-word]').filter(has_text=answer).first.click()
                    assert page.locator('.fillInput').nth(j).input_value()==answer
            elif kind=='order':
                for j,answer in enumerate(q['answer']):
                    # Use the keyboard alternative to reorder real rows.
                    while page.locator('.flowRow').nth(j).get_attribute('data-v')!=answer:
                        rows=page.locator('.flowRow').all()
                        index=next(n for n,row in enumerate(rows) if row.get_attribute('data-v')==answer)
                        up=page.locator('.flowRow').nth(index).locator('.up')
                        up.focus();page.keyboard.press('Enter')
                        assert page.locator(':focus').get_attribute('class')=='up'
            elif kind=='form': page.locator('#formSend').click()
            elif kind=='journey':
                for _ in range(5): page.locator('#journeyNext').click()
                assert page.locator('#journeyNext').is_disabled()
            elif kind=='filter': page.locator('#runFilter').click()
            # No viewport overflow or clipped wrapping text.
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),(width,q['id'],'viewport overflow')
            clipped=page.locator('.option,.answerChoice,.flowText,.labTabs button,.matchRow legend,h2,.checks').evaluate_all('(els)=>els.filter(e=>e.getBoundingClientRect().width && e.scrollWidth>e.clientWidth+2).map(e=>e.textContent)')
            assert not clipped,(width,q['id'],clipped)
            for select in page.locator('select').all():
                assert select.evaluate('e=>{let c=document.createElement("canvas").getContext("2d");c.font=getComputedStyle(e).font;return Math.max(...[...e.options].map(o=>c.measureText(o.text).width)) < e.clientWidth-44}')
            page.locator('#checkAnswer').click()
            assert 'good' in page.locator('#feedback').get_attribute('class'),(width,q['id'])
            assert page.locator('#feedback').inner_text().strip()
            if kind not in seen and width in [1280,768,390]:
                page.screenshot(path=str(ARTIFACTS / f'{kind}-{width}.png'),full_page=True)
            seen.add(kind);total+=1
        saved=json.loads(page.evaluate('localStorage.getItem("mindplay.movieArchitectureLab.v1")'))
        assert len(saved['answers'])==21
        assert sum(a['score'] for a in saved['answers'].values())==21
        # Verify retrying does not inflate first-attempt scoring.
        page.locator('#retryAnswer').click();page.locator('#checkAnswer').click()
        saved=json.loads(page.evaluate('localStorage.getItem("mindplay.movieArchitectureLab.v1")'))
        assert saved['answers'][qs[-1]['id']]['score']==1
        page.locator('#nextQuestion').click()
        assert page.locator('#completion').is_visible()
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        if width in [1280,390]: page.screenshot(path=str(ARTIFACTS / f'completion-{width}.png'),full_page=True)
        page.reload()
        assert page.locator('#completion').is_visible()
        # Stress long mixed-language labels; native dropdowns only hold short choices.
        page.evaluate('__lab.state.completed=false;__lab.state.index=0;document.querySelector("#lab").hidden=false;document.querySelector("#completion").hidden=true;__lab.render()')
        page.locator('.answerChoice span').first.evaluate('e=>e.textContent="תשובה ארוכה במיוחד עם technical_identifier_and_filename.json ".repeat(8)')
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        assert page.locator('.answerChoice span').first.evaluate('e=>e.scrollWidth<=e.clientWidth+2')
        # Collapsible navigation remains fully keyboard reachable on mobile.
        if width<851:
            page.locator('#moduleNavigator summary').focus();page.keyboard.press('Enter')
            assert page.locator('#moduleTabs button').first.is_visible()
        # Both saved site themes must retain the lab's high-contrast workspace.
        for theme in ['light','dark']:
            page.evaluate('(theme)=>document.documentElement.dataset.theme=theme',theme)
            assert page.locator('#questionTitle').evaluate('e=>getComputedStyle(e).fontSize') in ['27px','28px']
            assert page.locator('#questionTitle').evaluate('e=>getComputedStyle(e).color')=='rgb(24, 43, 69)'
            assert page.locator('.questionCard').evaluate('e=>getComputedStyle(e).backgroundColor')=='rgb(255, 255, 255)'
        assert page.locator('#activity').evaluate('e=>getComputedStyle(e).animationName')=='none'
        # Real keyboard selection and an incorrect-first-try scoring regression.
        page.locator('.matchRow input').first.focus();page.keyboard.press('Space')
        page.keyboard.press('ArrowDown')
        assert page.locator('.matchRow').first.locator('input:checked').count()==1
        assert page.locator(':focus').evaluate('e=>getComputedStyle(e).outlineStyle')=='solid'
        page.evaluate('__lab.state.answers={};__lab.state.index=1;__lab.render()')
        page.locator('.option[data-v="1"]').click();page.locator('#checkAnswer').click()
        assert 'bad' in page.locator('#feedback').get_attribute('class')
        assert page.locator('#feedback').inner_text().startswith('✕ עוד לא.')
        if width in [1280,390]: page.screenshot(path=str(ARTIFACTS / f'error-{width}.png'),full_page=True)
        page.locator('#retryAnswer').click();page.locator('.option[data-v="0"]').click();page.locator('#checkAnswer').click()
        saved=json.loads(page.evaluate('localStorage.getItem("mindplay.movieArchitectureLab.v1")'))
        assert saved['answers']['arch_frontend']['score']==0
        assert saved['answers']['arch_frontend']['correct'] is True
        assert saved['answers']['arch_frontend']['attempts']==2
        if not page.locator('#moduleTabs').is_visible(): page.locator('#moduleNavigator summary').click()
        page.locator('#moduleTabs [data-m="6"]').click()
        assert page.locator('#questionTitle').inner_text()==qs[19]['title']
        page.close()
    assert not errors,errors
    browser.close()
    print(f'PASS: {total} activity/viewport checks; all 21 activities, 7 modules, 7 types at 1280/768/390/320px; keyboard sorting, matching, scoring, local reload, long labels and overflow. Screenshots: {ARTIFACTS}. External services not tested.')
