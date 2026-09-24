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
    { target: "if score > 10:", translation: "בדקו אם הניקוד גדול מ־10" },
    { target: "for i in range(5):", translation: "חזרו על פעולה 5 פעמים" },
    { target: "    print(i)", translation: "הדפיסו את i עם הזחה של 4 רווחים" },
    { target: "numbers.append(7)", translation: "הוסיפו את 7 לרשימה" },
    { target: "def greet(name):", translation: "הגדירו פונקציית ברכה" },
    { target: 'print(f"Hello, {name}!")', translation: "הדפיסו ברכה שמשלבת משתנה" },
    { target: "return result", translation: "החזירו את התוצאה מהפונקציה" },
  ],
  keyboard: [
    { target: "()", translation: "סוגריים עגולים — משמשים להפעלת פונקציות", hint: "הקלידו סוגר פותח וסוגר סוגר" },
    { target: '""', translation: "גרשיים כפולים — עוטפים טקסט", hint: "ברוב המקלדות: Shift יחד עם מקש הגרשיים" },
    { target: ":", translation: "נקודתיים — מסיימות שורת תנאי, לולאה או פונקציה", hint: "במקלדת אנגלית: Shift יחד עם ;" },
    { target: "==", translation: "שני סימני שווה — בדיקת שוויון", hint: "הקלידו = פעמיים" },
    { target: "[]", translation: "סוגריים מרובעים — משמשים לרשימות", hint: "עברו למקלדת באנגלית" },
    { target: "{}", translation: "סוגריים מסולסלים — משמשים למילונים ול־f-string", hint: "במקלדת אנגלית: Shift יחד עם [ או ]" },
    { target: "_", translation: "קו תחתון — מחבר מילים בשמות משתנים", hint: "במקלדת אנגלית: Shift יחד עם -" },
    { type: "shortcut", target: "Ctrl + C", key: "c", translation: "העתקה" },
    { type: "shortcut", target: "Ctrl + V", key: "v", translation: "הדבקה" },
    { type: "shortcut", target: "Ctrl + S", key: "s", translation: "שמירת הקובץ" },
    { type: "shortcut", target: "Ctrl + Z", key: "z", translation: "ביטול הפעולה האחרונה" },
    { type: "shortcut", target: "Ctrl + A", key: "a", translation: "בחירת הכול" },
    { type: "shortcut", target: "Ctrl + F", key: "f", translation: "חיפוש בקובץ" },
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
  title: document.getElementById("practiceTitle"),
};
let mode = "commands";
let index = 0;
let correctKeystrokes = 0;
let totalKeystrokes = 0;
let streak = 0;
let startedAt = null;
let completed = false;
let previousValue = "";

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
function renderTarget(value = "") {
  const target = currentExercise().target;
  const wrongAt = [...value].findIndex((character, position) => !charactersMatch(character, target[position], position, target));
  const typedLength = wrongAt === -1 ? Math.min(value.length, target.length) : wrongAt;
  const current = target[typedLength] ?? "";
  const remaining = target.slice(typedLength + (current ? 1 : 0));
  elements.target.innerHTML = `<span class="typed">${escapeHtml(target.slice(0, typedLength))}</span>` +
    (current ? `<span class="current">${escapeHtml(current)}</span>` : "") + `<span class="remaining">${escapeHtml(remaining)}</span>`;
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
function showExercise() {
  const exercise = currentExercise();
  completed = false; previousValue = ""; elements.input.value = ""; elements.input.disabled = false;
  elements.input.classList.remove("hasError"); elements.next.disabled = true;
  elements.next.textContent = index === TYPING_SETS[mode].length - 1 ? "סיום 🎉" : "התרגיל הבא ←";
  elements.translation.textContent = exercise.translation; elements.title.textContent = modeTitles[mode];
  elements.inputLabel.textContent = exercise.type === "shortcut" ? "לחצו עכשיו על צירוף המקשים:" : "התחילו להקליד כאן:";
  elements.input.readOnly = exercise.type === "shortcut";
  elements.input.placeholder = exercise.type === "shortcut" ? "לחצו על הקיצור יחד…" : "";
  elements.message.textContent = exercise.hint ?? (exercise.type === "shortcut" ? "יש ללחוץ על שני המקשים יחד" : "הדיוק חשוב יותר מהמהירות 🌟");
  elements.message.className = "typingMessage"; renderTarget(); updateStats(); elements.input.focus();
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
  if (currentExercise().type === "shortcut") return;
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
  elements.input.classList.toggle("hasError", !isCorrectPrefix);
  elements.message.textContent = isCorrectPrefix ? "מצוין, המשיכו כך…" : "שימו לב: יש תו שלא מתאים. פקודות פייתון חייבות להישאר באותיות קטנות 💡";
  elements.message.className = `typingMessage ${isCorrectPrefix ? "" : "status bad"}`;
  renderTarget(value);
  if (value.length === target.length && isCorrectPrefix) completeExercise();
  else updateStats();
}
elements.input.addEventListener("input", handleInput);
elements.input.addEventListener("keydown", event => {
  const exercise = currentExercise();
  if (exercise.type === "shortcut") {
    event.preventDefault();
    if (!startedAt) startedAt = Date.now();
    totalKeystrokes += 1;
    const modifierPressed = event.ctrlKey || event.metaKey;
    if (modifierPressed && event.key.toLowerCase() === exercise.key) {
      correctKeystrokes += 1; completeExercise();
    } else if (!["Control", "Meta"].includes(event.key)) {
      elements.message.textContent = `נלחץ ${event.key}. נסו שוב ולחצו על שני המקשים יחד`;
      elements.message.className = "typingMessage status bad"; updateStats();
    }
    return;
  }
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
