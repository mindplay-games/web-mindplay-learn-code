# Movie Architecture Lab redesign

The lab uses a dedicated light workspace with MindPlay cyan, yellow and rounded cards. Other site pages and the saved site theme are unchanged. The welcome banner becomes compact during activities so the question has the strongest visual emphasis. The reading width is capped at 1000px inside a 1048px padded container.

## Activity types

- **Choice (11 activities):** full-width wrapping answer cards, numeric markers, explicit selected state and isolated technical tokens.
- **Matching (3):** vertically stacked file/component fieldsets, with labeled native radio choices. Desktop choices use two columns inside each card; tablet/mobile use one. Native Tab, Space and arrow-key behavior supports keyboard users.
- **Code completion (2):** a separate LTR code example with numbered blanks, large labeled inputs, and a word bank that fills and focuses the next empty input.
- **Ordering (2):** numbered station cards, drag support and large up/down buttons. Keyboard reordering retains focus and announces the new position.
- **HTML form (1):** labeled, generously sized selects containing only short choices, followed by a readable key/value result.
- **Data journey (1):** HTML → POST → Flask → Python → JSON overview, six numbered stations and a highlighted current step with explanation. Reaching the final step completes the journey.
- **Filtering (1):** large preference controls, an expandable explanation, and movie cards showing each condition and the final result without fading text.

All 21 original questions, IDs, module assignments, answer keys and first-attempt scoring are retained. Student identity, localStorage key, submission ID and Google reporting protocol remain compatible with the existing implementation. Presentation markers are excluded from reported answers. The activity completion flag is cleared when switching activities, preventing a previous simulation from incorrectly completing the next one.

The seven-module map is a stepper on desktop and collapsible on smaller screens. Completed modules and the current module have distinct labels and styles. Progress, current activity, total, topic and score are visible. Error/success feedback includes an explanation, receives focus after checking, and offers an explicit retry without increasing first-attempt points.

## Verification

Serve the repository with `python3 -m http.server 4173 --bind 127.0.0.1`, then run:

```sh
node --check js/movie-lab.js
node tests/movie-submission.cjs
python3 tests/movie-lab-ui.py
```

The Python browser test requires Playwright and `/usr/bin/chromium`, both available in this environment. Its test-only renderer access is injected into the intercepted script response; no test hook is shipped in the app. It uses fictional local identities and blocks all external HTTPS requests. It never sends a Google submission.

The responsive suite covers all 21 activities at 1280, 768, 390 and 320 CSS pixels (84 activity/viewport checks), all seven modules, correct feedback, answer preservation, native radio selection, keyboard sorting, first-attempt retry scoring, progress persistence through reload, completion, mobile navigation, long mixed-language labels, no viewport overflow, no clipped answer text, and sufficient dropdown width for every option. It also checks both saved site themes, reduced motion and visible keyboard focus. Screenshots cover every activity type at desktop, tablet and mobile widths, plus intro, completion and error states. They are saved outside the checkout in `/workspace/artifacts/movie-lab/`.

The five existing submission tests pass, including partial-write recovery and duplicate prevention. These are local service doubles. Google Sheets, real Google redirects/CORS and email delivery are not tested by this redesign. Browser checks use Chromium and fallback fonts with external requests disabled; Safari/Firefox and downloaded Google Fonts are outside this run.

Existing uncommitted reporting/backend/README changes were preserved. No commit, push or deployment was performed.
