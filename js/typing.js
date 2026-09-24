const TYPING_SETS = {
  commands: [
    { target: "print", translation: "הדפסה למסך" },
    { target: "input", translation: "קבלת מידע מהמשתמש" },
    { target: "if", translation: "אם — בדיקת תנאי" },
    { target: "else", translation: "אחרת" },
    { target: "elif", translation: "בדיקת תנאי נוסף" },
    { target: "for", translation: "לולאה על אוסף או טווח" },
    { target: "while", translation: "לולאה שרצה כל עוד תנאי נכון" },
    { target: "range", translation: "יצירת טווח מספרים" },
    { target: "import", translation: "ייבוא כלי או ספרייה" },
    { target: "def", translation: "הגדרת פונקציה" },
    { target: "return", translation: "החזרת ערך מפונקציה" },
    { target: "break", translation: "יציאה מיידית מלולאה" },
  ],
  code: [
    { target: 'print("Hello!")', translation: "הדפיסו ברכה למסך — בתוך הטקסט מותר להשתמש באות גדולה או קטנה" },
    { target: "name = input()", translation: "קבלו שם מהמשתמש ושמרו אותו" },
    { target: 'if score > 10:\n    print("Great!")', translation: "תנאי ושורה מוזחת", hint: "אחרי Enter לחצו Tab כדי ליצור הזחה של 4 רווחים" },
    { target: "for i in range(5):\n    print(i)", translation: "לולאה והפעולה שמתבצעת בתוכה", hint: "הנקודות · מסמנות את ארבעת הרווחים בתחילת השורה" },
    { target: "while lives > 0:\n    lives = lives - 1", translation: "לולאת while עם עדכון משתנה מוזח", hint: "השורה השנייה שייכת ללולאה ולכן מתחילה ב־4 רווחים" },
    { target: 'def greet(name):\n    print(f"Hello, {name}!")', translation: "פונקציה עם פקודה בתוכה", hint: "גוף הפונקציה חייב להיות מוזח ב־4 רווחים" },
    { target: "if player_ready:\n    if lives > 0:\n        print(\"Start!\")", translation: "תנאי בתוך תנאי — הזחה כפולה", hint: "השורה האחרונה נמצאת בתוך שני תנאים ולכן מתחילה ב־8 רווחים" },
    { target: "def double(number):\n    result = number * 2\n    return result", translation: "פונקציה עם שתי שורות מוזחות", hint: "שתי השורות שייכות לפונקציה וחייבות להיות באותה הזחה" },
  ],
  keyboard: [
    { target: "()", translation: "סוגריים עגולים — משמשים להפעלת פונקציות", hint: "הקלידו סוגר פותח וסוגר סוגר" },
    { target: '""', translation: "גרשיים כפולים — עוטפים טקסט", hint: "ברוב המקלדות: Shift יחד עם מקש הגרשיים" },
    { target: ":", translation: "נקודתיים — מסיימות שורת תנאי, לולאה או פונקציה", hint: "במקלדת אנגלית: Shift יחד עם ;" },
    { target: "==", translation: "שני סימני שווה — בדיקת שוויון", hint: "הקלידו = פעמיים" },
    { target: "[]", translation: "סוגריים מרובעים — משמשים לרשימות", hint: "עברו למקלדת באנגלית" },
    { target: "{}", translation: "סוגריים מסולסלים — משמשים למילונים ול־f-string", hint: "במקלדת אנגלית: Shift יחד עם [ או ]" },
    { target: "_", translation: "קו תחתון — מחבר מילים בשמות משתנים", hint: "במקלדת אנגלית: Shift יחד עם -" },
    { type: "activity", activity: "tabKey", target: "Tab  /  ↹  /  ⇥", keys: ["Tab"], translation: "מכירים את מקש ההזחה ואת הסימנים שמופיעים עליו" },
    { type: "activity", activity: "selectAll", target: "Ctrl + A", keys: ["Ctrl", "A"], translation: "בחירת כל הקוד בלחיצה אחת" },
    { type: "activity", activity: "copyPaste", target: "Ctrl + C  →  Ctrl + V", keys: ["Ctrl", "C", "V"], translation: "העתקה והדבקה בלי להקליד מחדש" },
    { type: "activity", activity: "undo", target: "Ctrl + Z", keys: ["Ctrl", "Z"], translation: "ביטול הפעולה האחרונה ותיקון טעות" },
    { type: "activity", activity: "save", target: "Ctrl + S", keys: ["Ctrl", "S"], translation: "שמירת השינויים בקובץ" },
  ],
};

const modeTitles = { commands: "הקלידו את הפקודה", code: "הקלידו את שורת הקוד", keyboard: "קיצורים ותווים מיוחדים" };
const elements = {
  input: document.getElementById("typingInput"), inputLabel: document.getElementById("inputLabel"),
  target: document.getElementById("target"), translation: document.getElementById("translation"),
  message: document.getElementById("typingMessage"), next: document.getElementById("nextTypingBtn"),
  restart: document.getElementById("restartBtn"), count: document.getElementById("exerciseCount"),
  accuracy: document.getElementById("accuracy"), speed: document.getElementById("speed"),
  streak: document.getElementById("streak"), progress: document.getElementById("progressBar"),
  title: document.getElementById("practiceTitle"), shortcutActivity: document.getElementById("shortcutActivity"),
};
let mode = "commands";
let index = 0;
let correctKeystrokes = 0;
let totalKeystrokes = 0;
let streak = 0;
let startedAt = null;
let completed = false;
let previousValue = "";
let activityBuffer = "";
let hintLevel = 0;

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function currentExercise() { return TYPING_SETS[mode][index]; }
function isInsideString(target, position) {
  let quote = null;
  for (let i = 0; i < position; i += 1) {
    if ((target[i] === '"' || target[i] === "'") && target[i - 1] !== "\\") {
      quote = quote === target[i] ? null : (quote ?? target[i]);
    }
  }
  return quote !== null;
}
function charactersMatch(actual, expected, position, target) {
  if (actual === expected) return true;
  return isInsideString(target, position) && actual.toLowerCase() === expected.toLowerCase();
}
function prefixMatches(value, target) {
  return value.length <= target.length && [...value].every((character, position) => charactersMatch(character, target[position], position, target));
}
function renderSegment(segment, startPosition, target) {
  return [...segment].map((character, offset) => {
    const position = startPosition + offset;
    const lineStart = target.lastIndexOf("\n", position - 1) + 1;
    const isIndentation = character === " " && target.slice(lineStart, position).trim() === "";
    return isIndentation ? '<span class="indentSpace">·</span>' : escapeHtml(character);
  }).join("");
}
function renderTarget(value = "") {
  const target = currentExercise().target;
  const wrongAt = [...value].findIndex((character, position) => !charactersMatch(character, target[position], position, target));
  const typedLength = wrongAt === -1 ? Math.min(value.length, target.length) : wrongAt;
  const current = target[typedLength] ?? "";
  const remaining = target.slice(typedLength + (current ? 1 : 0));
  elements.target.setAttribute("aria-label", target);
  elements.target.innerHTML = `<span class="typed">${renderSegment(target.slice(0, typedLength), 0, target)}</span>` +
    (current ? `<span class="current">${renderSegment(current, typedLength, target)}</span>` : "") +
    `<span class="remaining">${renderSegment(remaining, typedLength + (current ? 1 : 0), target)}</span>`;
}
function updateStats() {
  const total = TYPING_SETS[mode].length;
  const elapsedMinutes = startedAt ? Math.max((Date.now() - startedAt) / 60000, 1 / 60) : 0;
  const charactersPerMinute = elapsedMinutes ? Math.round(correctKeystrokes / elapsedMinutes) : 0;
  const accuracy = totalKeystrokes ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;
  elements.count.textContent = `${index + 1}/${total}`;
  elements.accuracy.textContent = `${accuracy}%`;
  elements.speed.textContent = charactersPerMinute;
  elements.streak.textContent = `${streak} 🔥`;
  elements.progress.style.width = `${((index + (completed ? 1 : 0)) / total) * 100}%`;
}
function keyboardHtml(expectedKeys) {
  const expected = new Set(expectedKeys.map(key => key.toLowerCase()));
  const keys = ["Tab", "A", "S", "D", "F", "Ctrl", "Z", "X", "C", "V"];
  return `<div class="keyboardGuide" aria-label="מקלדת עזר">${keys.map(key =>
    `<span class="keyboardKey ${["Tab", "Ctrl"].includes(key) ? "wideKey" : ""} ${expected.has(key.toLowerCase()) ? "expected" : ""}" data-key="${key.toLowerCase()}">${key === "Tab" ? "Tab ↹" : key}</span>`
  ).join("")}</div>`;
}
function setPressedKey(key, code, pressed) {
  const normalized = key === "Control" || key === "Meta" ? "ctrl" :
    (code?.startsWith("Key") ? code.slice(3).toLowerCase() : key.toLowerCase());
  elements.shortcutActivity.querySelector(`[data-key="${normalized}"]`)?.classList.toggle("pressed", pressed);
}
function activityFeedback(message, isError = false) {
  elements.message.textContent = message;
  elements.message.className = `typingMessage ${isError ? "status bad" : ""}`;
}
function recordShortcutAttempt(success) {
  if (!startedAt) startedAt = Date.now();
  totalKeystrokes += 1;
  if (success) correctKeystrokes += 1;
  updateStats();
}
function finishActivity(message) {
  if (completed) return;
  recordShortcutAttempt(true);
  completeExercise();
  elements.message.textContent = message;
}
function addShortcutListener(element, handler) {
  element.addEventListener("keydown", event => {
    setPressedKey(event.key, event.code, true);
    if (event.ctrlKey || event.metaKey) event.preventDefault();
    handler(event);
  });
  element.addEventListener("keyup", event => setPressedKey(event.key, event.code, false));
}
function isEnglishShortcutKey(event, expectedKey) {
  const matches = event.key.toLowerCase() === expectedKey;
  if (!matches && event.code === `Key${expectedKey.toUpperCase()}`) {
    activityFeedback("המקש הנכון נמצא, אבל המקלדת אינה באנגלית. העבירו ל־ENG או EN ונסו שוב.", true);
  }
  return matches;
}
function renderShortcutActivity(exercise) {
  hintLevel = 0;
  const instructions = {
    tabKey: "מצאו במקלדת את המקש שעליו כתוב Tab, ↹ או ⇥ ולחצו עליו פעם אחת.",
    selectAll: "בחרו את כל שלוש שורות הקוד באמצעות קיצור המקלדת.",
    copyPaste: "שלב 1: העתיקו את השורה המסומנת עם Ctrl + C. שלב 2: הדביקו את העותק בתיבה הריקה עם Ctrl + V.",
    undo: "יש טעות מיותרת בסוף הקוד. בטלו את הפעולה האחרונה.",
    save: "יש שינויים שלא נשמרו. שמרו אותם בעזרת קיצור המקלדת.",
  };
  elements.shortcutActivity.innerHTML = `<p class="shortcutInstruction"><b>המשימה:</b> ${instructions[exercise.activity]}</p>` +
    keyboardHtml(exercise.keys) + `<div id="activityWorkspace" class="activityWorkspace"></div>` +
    `<button id="shortcutHintBtn" class="btn btnGhost shortcutHintBtn" type="button">רמז 💡</button>`;
  const workspace = elements.shortcutActivity.querySelector("#activityWorkspace");
  const hintButton = elements.shortcutActivity.querySelector("#shortcutHintBtn");
  hintButton.addEventListener("click", () => {
    hintLevel += 1;
    const firstKey = exercise.keys[0];
    activityFeedback(hintLevel === 1
      ? (firstKey === "Tab" ? "חפשו בצד שמאל מקש רחב שעליו כתוב Tab, ↹ או ⇥." : `חפשו את ${firstKey} בפינה השמאלית התחתונה של המקלדת.`)
      : `החזיקו את ${firstKey}, ובזמן שהוא לחוץ הקישו ${exercise.keys.slice(1).join(" ואז ")}.`);
    if (hintLevel > 1) elements.shortcutActivity.querySelectorAll(".keyboardKey.expected").forEach(key => key.classList.add("hinted"));
  });

  if (exercise.activity === "tabKey") {
    workspace.innerHTML = '<div class="tabPractice"><span class="tabKeyLarge">Tab</span><span class="tabKeyLarge">↹</span><span class="tabKeyLarge">⇥</span><p>הכיתוב משתנה בין מקלדות, אבל זה אותו מקש. הוא נמצא בדרך כלל משמאל לאות Q.</p></div><textarea class="activityEditor tabFocusTarget" rows="2" readonly placeholder="לחצו כאן ואז הקישו Tab"></textarea>';
    const editor = workspace.querySelector("textarea");
    addShortcutListener(editor, event => {
      if (event.key === "Tab") {
        event.preventDefault(); finishActivity("מצוין! מצאתם את Tab — המקש שמשמש אותנו ליצירת הזחה בפייתון 🎉");
      } else if (!["Control", "Meta", "Shift", "Alt"].includes(event.key)) {
        recordShortcutAttempt(false); activityFeedback(`לחצתם ${event.key}. חפשו את Tab, ↹ או ⇥ בצד שמאל.`, true);
      }
    });
    editor.focus();
  } else if (exercise.activity === "selectAll") {
    workspace.innerHTML = '<textarea class="activityEditor" rows="4" spellcheck="false">name = "Noa"\nscore = 10\nprint(name, score)</textarea>';
    const editor = workspace.querySelector("textarea");
    addShortcutListener(editor, event => {
      if ((event.ctrlKey || event.metaKey) && isEnglishShortcutKey(event, "a")) {
        editor.select();
        const selectedAll = editor.selectionStart === 0 && editor.selectionEnd === editor.value.length;
        if (selectedAll) finishActivity("הצלחתם! כל הקוד נבחר בבת אחת 🎉");
      } else if (!["Control", "Meta"].includes(event.key) && event.code !== "KeyA") {
        recordShortcutAttempt(false); activityFeedback(`לחצתם ${event.key}, אבל המטרה היא לבחור את כל הקוד.`, true);
      }
    });
    editor.focus();
  } else if (exercise.activity === "copyPaste") {
    activityBuffer = "";
    workspace.innerHTML = '<label>הקוד להעתקה:<textarea class="activityEditor activitySource" rows="2" readonly>print("Hello")</textarea></label><label>הדביקו כאן:<textarea class="activityEditor activityDestination" rows="2" spellcheck="false"></textarea></label>';
    const source = workspace.querySelector(".activitySource");
    const destination = workspace.querySelector(".activityDestination");
    source.select();
    addShortcutListener(source, event => {
      if ((event.ctrlKey || event.metaKey) && isEnglishShortcutKey(event, "c") && source.selectionStart === 0 && source.selectionEnd === source.value.length) {
        activityBuffer = source.value; recordShortcutAttempt(true); activityFeedback("הועתק! עכשיו עברו לתיבה הריקה ולחצו Ctrl + V."); destination.focus();
      } else if (!["Control", "Meta"].includes(event.key) && event.code !== "KeyC") {
        recordShortcutAttempt(false); activityFeedback("קודם העתיקו את השורה המסומנת בעזרת Ctrl + C.", true);
      }
    });
    addShortcutListener(destination, event => {
      if ((event.ctrlKey || event.metaKey) && isEnglishShortcutKey(event, "v") && activityBuffer) {
        destination.value = activityBuffer; finishActivity("מעולה! העתקתם והדבקתם את הקוד בלי לכתוב אותו מחדש 🎉");
      } else if (!["Control", "Meta"].includes(event.key) && event.code !== "KeyV") {
        recordShortcutAttempt(false); activityFeedback("אין צורך להקליד מחדש — השתמשו בקיצור ההדבקה.", true);
      }
    });
  } else if (exercise.activity === "undo") {
    workspace.innerHTML = '<textarea class="activityEditor" rows="2" spellcheck="false">print("Hello")xxxx</textarea><span class="saveState badState">יש טעות בקוד</span>';
    const editor = workspace.querySelector("textarea");
    addShortcutListener(editor, event => {
      if ((event.ctrlKey || event.metaKey) && isEnglishShortcutKey(event, "z")) {
        editor.value = 'print("Hello")'; workspace.querySelector(".saveState").textContent = "הטעות בוטלה ✓";
        finishActivity("כל הכבוד! ביטלתם את הפעולה האחרונה והקוד תוקן 🎉");
      } else if (!["Control", "Meta"].includes(event.key) && event.code !== "KeyZ") {
        recordShortcutAttempt(false); activityFeedback("אל תמחקו ידנית — נסו לבטל את הפעולה האחרונה.", true);
      }
    });
    editor.focus();
  } else {
    workspace.innerHTML = '<textarea class="activityEditor" rows="2" spellcheck="false">score = 10\nprint(score)</textarea><span class="saveState unsaved">● יש שינויים שלא נשמרו</span>';
    const editor = workspace.querySelector("textarea");
    addShortcutListener(editor, event => {
      if ((event.ctrlKey || event.metaKey) && isEnglishShortcutKey(event, "s")) {
        const state = workspace.querySelector(".saveState"); state.textContent = "✓ נשמר בהצלחה"; state.className = "saveState saved";
        finishActivity("מצוין! שמרתם את השינויים בלי לעזוב את המקלדת 🎉");
      } else if (!["Control", "Meta"].includes(event.key) && event.code !== "KeyS") {
        recordShortcutAttempt(false); activityFeedback("השינויים עדיין לא נשמרו. נסו את קיצור השמירה.", true);
      }
    });
    editor.focus();
  }
}
function showExercise() {
  const exercise = currentExercise();
  completed = false; previousValue = ""; elements.input.value = ""; elements.input.disabled = false;
  elements.input.classList.remove("hasError"); elements.next.disabled = true;
  elements.next.textContent = index === TYPING_SETS[mode].length - 1 ? "סיום 🎉" : "התרגיל הבא ←";
  elements.translation.textContent = exercise.translation; elements.title.textContent = modeTitles[mode];
  const isActivity = exercise.type === "activity";
  elements.inputLabel.textContent = "התחילו להקליד כאן:";
  elements.inputLabel.classList.toggle("hidden", isActivity);
  elements.input.classList.toggle("hidden", isActivity);
  elements.shortcutActivity.classList.toggle("hidden", !isActivity);
  elements.input.readOnly = false;
  elements.input.rows = mode === "code" ? 5 : 2;
  elements.input.placeholder = exercise.type === "shortcut" ? "לחצו על הקיצור יחד…" : "";
  elements.message.textContent = exercise.hint ?? (isActivity ? "בצעו את הפעולה באזור התרגול" : "הדיוק חשוב יותר מהמהירות 🌟");
  elements.message.className = "typingMessage"; renderTarget(); updateStats();
  if (isActivity) renderShortcutActivity(exercise); else elements.input.focus();
}
function resetSession() {
  index = 0; correctKeystrokes = 0; totalKeystrokes = 0; streak = 0; startedAt = null; showExercise();
}
function completeExercise() {
  completed = true; streak += 1; elements.input.disabled = true; elements.next.disabled = false;
  elements.message.textContent = "כל הכבוד! ביצוע מדויק 🎯";
  elements.message.className = "typingMessage status good"; elements.next.focus(); updateStats();
}
function handleInput() {
  if (currentExercise().type === "activity") return;
  if (!startedAt) startedAt = Date.now();
  const value = elements.input.value;
  const target = currentExercise().target;
  if (value.length > previousValue.length) {
    const added = value.slice(previousValue.length);
    [...added].forEach((character, offset) => {
      totalKeystrokes += 1;
      if (charactersMatch(character, target[previousValue.length + offset], previousValue.length + offset, target)) correctKeystrokes += 1;
    });
  }
  previousValue = value;
  const isCorrectPrefix = prefixMatches(value, target);
  const firstMismatch = [...value].findIndex((character, position) => !charactersMatch(character, target[position], position, target));
  const indentationError = mode === "code" && firstMismatch !== -1 &&
    (target[firstMismatch] === " " || value[firstMismatch] === " " || target[firstMismatch] === "\n");
  elements.input.classList.toggle("hasError", !isCorrectPrefix);
  elements.message.textContent = isCorrectPrefix
    ? "מצוין, המשיכו כך…"
    : (indentationError
      ? "בדקו את ההזחה: כל נקודה כתומה מייצגת רווח אחד. אפשר להשתמש ב־Tab 💡"
      : "שימו לב: יש תו שלא מתאים. פקודות פייתון חייבות להישאר באותיות קטנות 💡");
  elements.message.className = `typingMessage ${isCorrectPrefix ? "" : "status bad"}`;
  renderTarget(value);
  if (value.length === target.length && isCorrectPrefix) completeExercise();
  else updateStats();
}
elements.input.addEventListener("input", handleInput);
elements.input.addEventListener("keydown", event => {
  const exercise = currentExercise();
  if (event.key === "Tab" && mode === "code") {
    event.preventDefault();
    const start = elements.input.selectionStart;
    elements.input.setRangeText("    ", start, elements.input.selectionEnd, "end"); handleInput();
  }
});
elements.next.addEventListener("click", () => {
  if (!completed) return;
  if (index === TYPING_SETS[mode].length - 1) {
    elements.message.textContent = `סיימתם את המסלול עם ${elements.accuracy.textContent} דיוק! 🏆`;
    elements.message.className = "typingMessage status good"; elements.next.disabled = true; elements.restart.focus(); return;
  }
  index += 1; showExercise();
});
elements.restart.addEventListener("click", resetSession);
document.querySelectorAll(".typingTab").forEach(tab => {
  tab.addEventListener("click", () => {
    mode = tab.dataset.mode;
    document.querySelectorAll(".typingTab").forEach(item => item.setAttribute("aria-selected", String(item === tab)));
    resetSession();
  });
});
showExercise();
