import { layoutManuscript } from "./layout.js";

const sample = `글을 쓰는 일은 생각을 정리하는 과정이다. 원고지에 한 글자씩 옮기면 문장의 흐름도 더 또렷하게 보인다.

그래서 나는 오늘도 천천히, 정확하게 쓰는 연습을 한다.`;
const $ = (id) => document.getElementById(id);
const manuscript = $("manuscript"), columns = $("columns"), rows = $("rows");
const papers = $("papers"), notice = $("notice"), summary = $("summary"), explanation = $("explanation");

function quoteGlyph(side, size, extraClass = "") {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 64 64");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("class", `quote-glyph quote-${side} quote-${size} ${extraClass}`);
  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  if (side === "close") group.setAttribute("transform", "translate(64 0) scale(-1 1)");
  const pathData = "M16 11 C9 15 5 24 5 34 C5 44 11 50 18 50 C25 50 29 45 29 39 C29 32 25 28 19 28 C17 28 15 29 13 30 C15 24 18 20 23 17 Z";
  for (const shift of size === "double" ? [0, 28] : [14]) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    path.setAttribute("transform", `translate(${shift} 0)`);
    group.append(path);
  }
  svg.append(group);
  return svg;
}

function renderCellContent(element, cell) {
  if (cell.kind.startsWith("quote-")) {
    const [, side, size] = cell.kind.split("-");
    element.append(quoteGlyph(side, size));
  } else if (cell.kind === "mark-quote") {
    const mark = document.createElement("span"); mark.className = "combo-mark"; mark.textContent = Array.from(cell.text)[0];
    element.append(mark, quoteGlyph("close", cell.quoteSize || "double", "combo-quote"));
  } else if (cell.kind === "emphasis" || cell.kind === "underlined") {
    const letter = document.createElement("span"); letter.className = "emphasis-letter"; letter.textContent = Array.from(cell.text)[0];
    element.append(letter);
    if (cell.kind === "emphasis") {
      const dot = document.createElement("span"); dot.className = "emphasis-dot"; dot.textContent = "·"; element.append(dot);
    }
  } else if (cell.kind === "shared" && Array.from(cell.text).length > 1) {
    const parts = Array.from(cell.text);
    const base = parts.slice(0, -1);
    const hasDot = cell.quoteSize && /[.。．]/u.test(base.at(-1));
    const letter = document.createElement("span"); letter.className = "share-letter"; letter.textContent = (hasDot ? base.slice(0, -1) : base).join("");
    element.append(letter);
    if (hasDot) { const dot = document.createElement("span"); dot.className = "share-dot"; dot.textContent = base.at(-1); element.append(dot); }
    if (cell.quoteSize) element.append(quoteGlyph("close", cell.quoteSize, "shared-quote"));
    else {
      const mark = document.createElement("span"); mark.className = "share-mark"; mark.textContent = parts.at(-1);
      if (/[.,。．，、]/u.test(parts.at(-1))) mark.classList.add("share-half");
      if (/[)\]}〉》>≫」』｣]/u.test(parts.at(-1))) mark.classList.add("share-closing");
      element.append(mark);
    }
  } else {
    element.textContent = cell.text;
  }
}

function cellClass(cell) {
  const length = Array.from(cell.text).length;
  const compact = ["number", "lower", "unit"].includes(cell.kind);
  return `cell ${cell.kind}${compact && length > 2 ? " compact-long" : compact && length === 2 ? " compact-pair" : ""}`;
}

function renderGuideExamples() {
  for (const article of document.querySelectorAll(".guide-grid article[data-example]")) {
    const source = article.dataset.example;
    const width = Number(article.dataset.width);
    const example = document.createElement("div"); example.className = "rule-example";
    const label = document.createElement("span"); label.className = "rule-example-label";
    label.textContent = `예시 · ${source.replace(/\n/g, " / ")}`;
    const grid = document.createElement("div"); grid.className = "grid";
    grid.style.gridTemplateColumns = `repeat(${width}, var(--cell-size))`;
    grid.style.setProperty("--cell-size", "26px");
    const result = layoutManuscript(source, width, 10);
    const usedRows = result.pages[0].filter(row => row.some(cell => cell.text || cell.kind === "carry" || cell.kind === "indent"));
    for (const row of usedRows.slice(0, 3)) for (const cell of row) {
      const box = document.createElement("span"); box.className = cellClass(cell);
      renderCellContent(box, cell);
      box.title = cell.reason;
      grid.append(box);
    }
    example.append(label, grid); article.append(example);
  }
}

function drawHero() {
  const chars = Array.from("　원고지에 한 글자씩 쓰면 생각이 선명해진다.　").concat(Array(160).fill(""));
  const root = $("hero-grid");
  chars.slice(0, 100).forEach((ch) => {
    const box = document.createElement("span");
    box.textContent = ch;
    root.append(box);
  });
}
function render() {
  let result;
  const width = Number(columns.value), height = Number(rows.value);
  try { result = layoutManuscript(manuscript.value, width, height); }
  catch (error) { notice.textContent = error.message; papers.replaceChildren(); summary.textContent = ""; return; }
  papers.replaceChildren();
  for (const [pageIndex, page] of result.pages.entries()) {
    const paper = document.createElement("div");
    paper.className = "paper";
    const head = document.createElement("div"); head.className = "paper-head";
    const pageName = document.createElement("span"); pageName.textContent = `${pageIndex + 1} / ${result.pages.length}장`;
    const dimensions = document.createElement("span"); dimensions.textContent = `${width}칸 × ${height}줄`;
    head.append(pageName, dimensions);
    const grid = document.createElement("div"); grid.className = "grid";
    grid.style.setProperty("--cols", width);
    for (const [rowIndex, row] of page.entries()) {
      for (const [colIndex, cell] of row.entries()) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = cellClass(cell);
        renderCellContent(button, cell);
        button.title = cell.reason || `${rowIndex + 1}줄 ${colIndex + 1}칸`;
        button.setAttribute("aria-label", `${pageIndex + 1}장 ${rowIndex + 1}줄 ${colIndex + 1}칸: ${cell.text || "빈칸"}`);
        button.addEventListener("click", () => {
          explanation.textContent = `${pageIndex + 1}장 ${rowIndex + 1}줄 ${colIndex + 1}칸 · ${cell.reason || (cell.text ? "한 칸에 한 글자를 배치했습니다." : "비어 있는 칸입니다.")}`;
        });
        grid.append(button);
      }
    }
    paper.append(head, grid); papers.append(paper);
  }
  summary.textContent = `${result.paragraphs}문단 · ${result.pages.length}장 · 사용한 칸 ${result.written}개`;
  notice.textContent = result.events.length ? [...new Set(result.events)].join(" ") : "";
}
drawHero();
renderGuideExamples();
[manuscript, columns, rows].forEach(el => el.addEventListener("input", render));
$("example").addEventListener("click", () => { manuscript.value = sample; render(); manuscript.focus(); });
$("clear").addEventListener("click", () => { manuscript.value = ""; render(); manuscript.focus(); });
$("print").addEventListener("click", () => window.print());
render();

