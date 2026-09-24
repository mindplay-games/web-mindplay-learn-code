const TYPING_SETS = {
  words: [
    { target: "variable", translation: "משתנה — קופסה ששומרת מידע" },
    { target: "number", translation: "מספר" },
    { target: "string", translation: "מחרוזת — טקסט בקוד" },
    { target: "condition", translation: "תנאי" },
    { target: "loop", translation: "לולאה — פעולה שחוזרת" },
    { target: "list", translation: "רשימה" },
    { target: "function", translation: "פונקציה" },
    { target: "return", translation: "החזרת ערך" },
  ],
  commands: [
    { target: "print", translation: "הדפסה למסך" },
    { target: "input", translation: "קבלת מידע מהמשתמש" },
    { target: "if", translation: "אם — בדיקת תנאי" },
    { target: "else", translation: "אחרת" },
    { target: "for", translation: "לולאה על אוסף או טווח" },
    { target: "while", translation: "לולאה שרצה כל עוד תנאי נכון" },
    { target: "range", translation: "יצירת טווח מספרים" },
    { target: "import", translation: "ייבוא כלי או ספרייה" },
  ],
  code: [
    { target: 'print("Hello!")', translation: "הדפיסו ברכה למסך" },
    { target: "name = input()", translation: "קבלו שם מהמשתמש ושמרו אותו" },
    { target: "if score > 10:", translation: "בדקו אם הניקוד גדול מ־10" },
    { target: "for i in range(5):", translation: "חזרו על פעולה 5 פעמים" },
    { target: "    print(i)", translation: "הדפיסו את i עם הזחה של 4 רווחים" },
    { target: "numbers.append(7)", translation: "הוסיפו את 7 לרשימה" },
    { target: "def greet(name):", translation: "הגדירו פונקציית ברכה" },
    { target: "return result", translation: "החזירו את התוצאה מהפונקציה" },
  ],
};

const modeTitles = { words: "הקלידו את המילה", commands: "הקלידו את הפקודה", code: "הקלידו את שורת הקוד בדיוק" };
const elements = {
  input: document.getElementById("typingInput"), target: document.getElementById("target"),
  translation: document.getElementById("translation"), message: document.getElementById("typingMessage"),
  next: document.getElementById("nextTypingBtn"), restart: document.getElementById("restartBtn"),
  count: document.getElementById("exerciseCount"), accuracy: document.getElementById("accuracy"),
  speed: document.getElementById("speed"), streak: document.getElementById("streak"),
  progress: document.getElementById("progressBar"), title: document.getElementById("practiceTitle"),
};
let mode = "words";
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
function renderTarget(value = "") {
  const target = currentExercise().target;
  const correctLength = [...value].findIndex((character, position) => character !== target[position]);
  const typedLength = correctLength === -1 ? Math.min(value.length, target.length) : correctLength;
  const current = target[typedLength] ?? "";
  const remaining = target.slice(typedLength + (current ? 1 : 0));
  elements.target.innerHTML = `<span class="typed">${escapeHtml(target.slice(0, typedLength))}</span>` +
    (current ? `<span class="current">${escapeHtml(current)}</span>` : "") + `<span class="remaining">${escapeHtml(remaining)}</span>`;
}
function updateStats() {
  const total = TYPING_SETS[mode].length;
  const elapsedMinutes = startedAt ? Math.max((Date.now() - startedAt) / 60000, 1 / 60) : 0;
  const wordsPerMinute = elapsedMinutes ? Math.round((correctKeystrokes / 5) / elapsedMinutes) : 0;
  const accuracy = totalKeystrokes ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;
  elements.count.textContent = `${index + 1}/${total}`;
  elements.accuracy.textContent = `${accuracy}%`;
  elements.speed.textContent = wordsPerMinute;
  elements.streak.textContent = `${streak} 🔥`;
  elements.progress.style.width = `${((index + (completed ? 1 : 0)) / total) * 100}%`;
}
function showExercise() {
  completed = false;
  previousValue = "";
  elements.input.value = "";
  elements.input.disabled = false;
  elements.input.classList.remove("hasError");
  elements.next.disabled = true;
  elements.next.textContent = index === TYPING_SETS[mode].length - 1 ? "סיום 🎉" : "התרגיל הבא ←";
  elements.translation.textContent = currentExercise().translation;
  elements.title.textContent = modeTitles[mode];
  elements.message.textContent = "הדיוק חשוב יותר מהמהירות 🌟";
  elements.message.className = "typingMessage";
  renderTarget(); updateStats(); elements.input.focus();
}
function resetSession() {
  index = 0; correctKeystrokes = 0; totalKeystrokes = 0; streak = 0; startedAt = null; showExercise();
}
function handleInput() {
  if (!startedAt) startedAt = Date.now();
  const value = elements.input.value;
  const target = currentExercise().target;
  if (value.length > previousValue.length) {
    const added = value.slice(previousValue.length);
    [...added].forEach((character, offset) => {
      totalKeystrokes += 1;
      if (character === target[previousValue.length + offset]) correctKeystrokes += 1;
    });
  }
  previousValue = value;
  const prefixIsCorrect = target.startsWith(value);
  elements.input.classList.toggle("hasError", !prefixIsCorrect);
  elements.message.textContent = prefixIsCorrect ? "מצוין, המשיכו כך…" : "שימו לב: יש תו שלא מתאים. תקנו ונסו שוב 💡";
  elements.message.className = `typingMessage ${prefixIsCorrect ? "" : "status bad"}`;
  renderTarget(value);
  if (value === target) {
    completed = true; streak += 1; elements.input.disabled = true; elements.next.disabled = false;
    elements.message.textContent = "כל הכבוד! הקלדה מדויקת 🎯";
    elements.message.className = "typingMessage status good"; elements.next.focus();
  }
  updateStats();
}
elements.input.addEventListener("input", handleInput);
elements.input.addEventListener("keydown", event => {
  if (event.key === "Tab" && mode === "code") {
    event.preventDefault();
    const start = elements.input.selectionStart;
    elements.input.setRangeText("    ", start, elements.input.selectionEnd, "end");
    handleInput();
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
