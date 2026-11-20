const PAIRS = { "(": ")", "[": "]", "{": "}", "“": "”", "‘": "’", "「": "」", "『": "』", "<": ">" };
const HALF_MARKS = new Set([".", ",", "。", "．", "，", "、"]);
const UNITS = ["cm²", "cm2", "mm²", "mm2", "mL", "㎖", "cm", "mm", "km", "kg", "mg", "mℓ", "ml", "㎡", "㎠", "㎝", "㎜", "℃", "ℓ", "g", "m", "L", "%"];
const QUOTES = { "“": ["open", "double"], "”": ["close", "double"], "‘": ["open", "single"], "’": ["close", "single"] };

function quoteKind(side, size) { return `quote-${side}-${size}`; }

function readNumber(chars, start) {
  let end = start;
  while (end < chars.length) {
    const char = chars[end];
    if (/^[0-9]$/.test(char)) { end++; continue; }
    if ((char === "." || char === ",") && end > start && /^[0-9]$/.test(chars[end + 1] || "")) { end++; continue; }
    break;
  }
  return chars.slice(start, end).join("");
}

export function layoutManuscript(input, width, height) {
  if (!Number.isInteger(width) || width < 5 || width > 50 || !Number.isInteger(height) || height < 2 || height > 30) throw new RangeError("규격은 가로 5~50칸, 세로 2~30줄로 입력하세요.");
  const paragraphs = String(input).replace(/\r\n?/g, "\n").split(/\n+/).map(s => s.trim().replace(/[\t ]+/g, " ")).filter(Boolean);
  const pages = [];
  const events = [];
  let page = 0, row = 0, col = 0, written = 0;
  const makePage = () => Array.from({ length: height }, () => Array.from({ length: width }, () => ({ text: "", kind: "" })));
  pages.push(makePage());
  const line = () => { col = 0; row++; if (row >= height) { page++; row = 0; pages.push(makePage()); } };
  const put = (text, kind = "", reason = "") => {
    if (col >= width) line();
    pages[page][row][col] = { text, kind, reason };
    if (text) written++;
    col++;
  };
  const carryToNextLine = (reason) => {
    for (let skipped = col; skipped < width; skipped++) {
      pages[page][row][skipped] = { text: "", kind: "carry", reason };
    }
    line();
  };
  const mergeQuoteWithDot = (text, size) => {
    if (col === 0) return false;
    const previous = pages[page][row][col - 1];
    if (previous.kind !== "half-mark" || !/[.。．]$/.test(previous.text)) return false;
    previous.text += text;
    previous.kind = "mark-quote";
    previous.quoteSize = size;
    previous.reason = "온점과 닫는 따옴표는 한 칸에 함께 씁니다. 온점은 왼쪽 아래, 닫는 따옴표는 오른쪽 위에 둡니다.";
    return true;
  };
  const punctuation = new Set(Array.from(".,!?;:。．，、？！；：·…—―~～/()[]{}“”‘’「」『』<>%×\"'"));
  const closing = new Set(Object.values(PAIRS));
  for (const [pIndex, paragraph] of paragraphs.entries()) {
    if (pIndex > 0 && col > 0) line();
    if (col >= width) line();
    put("", "indent", "새 문단은 첫 칸을 비우고 둘째 칸부터 씁니다.");
    const chars = Array.from(paragraph);
    const straightQuoteOpen = { '"': false, "'": false };
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      if (char === " ") {
        if (col > 0 && col < width && pages[page][row][col - 1].text) put("", "space", "단어 사이를 한 칸 띄웁니다. 줄 끝에 걸리는 공백은 다음 줄 첫 칸에 다시 쓰지 않습니다.");
        continue;
      }
      if (/^[0-9]$/.test(char)) {
        const run = readNumber(chars, i);
        for (let offset = 0; offset < run.length; offset += 2) {
          put(run.slice(offset, offset + 2), "number", "아라비아 숫자는 두 자리씩 한 칸에 씁니다. 숫자 사이의 쉼표·소수점도 함께 두 글자씩 배치합니다.");
        }
        i += run.length - 1;
        const rest = chars.slice(i + 1).join("");
        const unit = UNITS.find(value => rest.startsWith(value) && !/[A-Za-z]/.test(rest[value.length] || ""));
        if (unit) { put(unit, "unit", "숫자 뒤의 단위 기호는 한 칸에 씁니다."); i += Array.from(unit).length; }
        continue;
      }
      if (/^[A-Z]$/.test(char)) { put(char, "upper", "알파벳 대문자는 한 칸에 한 자씩 씁니다."); continue; }
      if (/^[a-z]$/.test(char)) {
        const next = chars[i + 1];
        const pair = next && /^[a-z]$/.test(next) ? char + next : char;
        put(pair, "lower", "알파벳 소문자는 두 자씩 한 칸에 씁니다. 남는 한 자는 한 칸을 사용합니다.");
        if (pair.length === 2) i++;
        continue;
      }
      if (/[\u2160-\u217f]/u.test(char)) { put(char, "roman", "로마 숫자는 한 칸에 한 자씩 씁니다."); continue; }
      if (char === '"' || char === "'") {
        if (/^[A-Za-z]$/.test(chars[i - 1] || "") && /^[A-Za-z]$/.test(chars[i + 1] || "")) {
          put(char, "punctuation", "영문 단어 안의 아포스트로피입니다.");
          continue;
        }
        const side = straightQuoteOpen[char] ? "close" : "open";
        const size = char === '"' ? "double" : "single";
        straightQuoteOpen[char] = !straightQuoteOpen[char];
        if (side === "open") {
          const end = chars.indexOf(char, i + 1);
          const length = end < 0 ? 0 : end - i + 1;
          if (col === width - 1 || (length && length <= width && length > width - col)) carryToNextLine("여는 따옴표가 줄 끝에 홀로 남지 않도록 다음 줄로 옮겼습니다.");
        } else if (mergeQuoteWithDot(char, size)) continue;
        if (side === "close" && col === width && pages[page][row][width - 1].text) {
          const cell = pages[page][row][width - 1];
          cell.text += char; cell.kind = "shared"; cell.quoteSize = size;
          cell.reason = "닫는 따옴표만 다음 줄 첫 칸에 놓이지 않도록 마지막 칸에 함께 표시했습니다.";
        } else put(char, quoteKind(side, size), `${side === "open" ? "여는" : "닫는"} 따옴표는 ${side === "open" ? "오른쪽" : "왼쪽"} 위에 씁니다.`);
        continue;
      }
      if (Object.hasOwn(QUOTES, char)) {
        const [side, size] = QUOTES[char];
        if (side === "open") {
          const end = chars.indexOf(PAIRS[char], i + 1);
          const length = end < 0 ? 0 : end - i + 1;
          if (col === width - 1 || (length && length <= width && length > width - col)) carryToNextLine("여는 따옴표가 줄 끝에 홀로 남지 않도록 다음 줄로 옮겼습니다.");
        } else if (mergeQuoteWithDot(char, size)) continue;
        if (side === "close" && col === width && pages[page][row][width - 1].text) {
          const cell = pages[page][row][width - 1];
          cell.text += char; cell.kind = "shared"; cell.quoteSize = size;
          cell.reason = "닫는 따옴표만 다음 줄 첫 칸에 놓이지 않도록 마지막 칸에 함께 표시했습니다.";
        } else put(char, quoteKind(side, size), `${side === "open" ? "여는" : "닫는"} 따옴표는 ${side === "open" ? "오른쪽" : "왼쪽"} 위에 씁니다.`);
        continue;
      }
      if (Object.hasOwn(PAIRS, char)) {
        const end = chars.indexOf(PAIRS[char], i + 1);
        const length = end < 0 ? 0 : end - i + 1;
        if (col === width - 1 || (col > 0 && col < width && length > width - col && length <= width)) {
          carryToNextLine("여는 괄호가 줄 끝에 홀로 남지 않도록 이 칸을 비우고 다음 줄에서 시작합니다.");
        }
        put(char, "punctuation", "여는 괄호는 한 칸을 씁니다. 줄 끝에 홀로 남으면 다음 줄에서 시작합니다.");
        continue;
      }
      if ((char === "…" && chars[i + 1] === "…") || chars.slice(i, i + 6).join("") === "......") {
        if (col === width - 1) carryToNextLine("줄임표는 두 칸에 나누어 쓰므로 마지막 한 칸에서 시작하지 않습니다.");
        put("…", "ellipsis-first", "줄임표의 앞 세 점을 첫 칸 오른쪽 아래에 씁니다.");
        put("…", "ellipsis-last", "줄임표의 뒤 세 점을 다음 칸 왼쪽 아래에 씁니다.");
        i += char === "…" ? 1 : 5;
        continue;
      }
      if (char === "—" || char === "―") {
        if (col === width - 1) carryToNextLine("줄표는 두 칸을 사용하므로 마지막 한 칸에서 시작하지 않습니다.");
        put(char, "dash-start", "줄표는 두 칸에 걸쳐 씁니다.");
        put(char, "dash-end", "줄표는 두 칸에 걸쳐 씁니다.");
        continue;
      }
      if ((char === "?" || char === "!" || char === "？" || char === "！") && col === width - 1) {
        const next = chars[i + 1];
        if (Object.hasOwn(QUOTES, next) && QUOTES[next][0] === "close" || (next === '"' || next === "'") && straightQuoteOpen[next]) {
          carryToNextLine("물음표·느낌표와 닫는 따옴표는 각각 한 칸을 사용합니다.");
        }
      }
      if ((closing.has(char) || punctuation.has(char)) && col === width && pages[page][row][width - 1].text) {
        const cell = pages[page][row][width - 1];
        cell.text += char; cell.kind = "shared";
        cell.reason = "줄 끝에 문장 부호만 남으면 마지막 칸의 글자와 함께 쓰거나 칸 밖 여백에 씁니다. 이 화면은 같은 칸으로 표시합니다.";
        events.push("줄 끝 문장 부호를 마지막 칸에 함께 표시했습니다.");
        continue;
      }
      if (punctuation.has(char)) {
        put(char, HALF_MARKS.has(char) ? "half-mark" : "punctuation", HALF_MARKS.has(char) ? "마침표·쉼표는 칸의 왼쪽 아래에 작게 쓰고, 다음 칸을 비우지 않습니다." : "문장 부호는 한 칸에 하나씩 씁니다.");
        if (HALF_MARKS.has(char)) {
          while (chars[i + 1] === " ") { i++; events.push("마침표·쉼표 뒤의 공백을 원고지 관행에 따라 생략했습니다."); }
        }
        continue;
      }
      if (col === width - 1 && /[?!？！]/u.test(chars[i + 1] || "")) {
        const afterMark = chars[i + 2];
        if ((Object.hasOwn(QUOTES, afterMark) && QUOTES[afterMark][0] === "close") || ((afterMark === '"' || afterMark === "'") && straightQuoteOpen[afterMark])) {
          carryToNextLine("물음표·느낌표와 닫는 따옴표를 따로 쓸 수 있도록 마지막 글자부터 다음 줄로 옮겼습니다.");
        }
      }
      put(char, "", "한글은 한 칸에 한 글자씩 씁니다.");
    }
  }
  return { pages, events, written, paragraphs: paragraphs.length };
}

