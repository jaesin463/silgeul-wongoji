// Each character in a row occupies one manuscript cell; spaces are empty cells.
export const correctionExamples = [
  { title: "띄움표", description: "붙여 쓴 말 사이를 가리켜 한 칸을 비웁니다.", before: ["학교앞에"], after: ["학교 앞에"], marks: [{ type: "gap", col: 2 }] },
  { title: "둠표 · 띄움 취소", description: "잘못 그린 띄움표에 가로선을 그어 띄우지 않고 그대로 둡니다.", before: ["학교앞에"], after: ["학교앞에"], marks: [{ type: "gapCancel", col: 2 }] },
  { title: "붙임표", description: "불필요하게 비운 칸을 곡선으로 묶어 붙입니다.", before: ["학 교에"], after: ["학교에"], marks: [{ type: "join", col: 1 }] },
  { title: "둠표 · 붙임 취소", description: "잘못 그린 붙임표에 짧은 선을 그어 원래 빈칸을 살립니다.", before: ["학 교에"], after: ["학 교에"], marks: [{ type: "joinCancel", col: 1 }] },
  { title: "넣음표", description: "빠진 자리의 경계에 표시하고 넣을 글자를 위에 적습니다.", before: ["학에 간다."], after: ["학교에 간다."], marks: [{ type: "insert", col: 1, label: "교" }] },
  { title: "부호 넣음표", description: "마침표처럼 칸의 아래쪽에 찍는 부호가 빠졌을 때 그 자리와 부호를 표시합니다.", before: ["오늘은 맑다"], after: ["오늘은 맑다."], marks: [{ type: "punctInsert", col: 6, label: "." }] },
  { title: "고침표", description: "잘못 쓴 글자에 선을 긋고 새 글자를 위에 적습니다.", before: ["사과을 먹다"], after: ["사과를 먹다"], marks: [{ type: "replace", col: 2, label: "를" }] },
  { title: "뺌표", description: "필요 없는 한 글자를 동그라미와 사선으로 지정해 뺍니다.", before: ["봄이이 온다"], after: ["봄이 온다"], marks: [{ type: "removeOne", col: 2 }] },
  { title: "지움표", description: "지울 글자나 구절 전체에 선을 긋습니다. 뒤 글자는 빈칸 없이 당깁니다.", before: ["오늘오늘 간다"], after: ["오늘 간다"], marks: [{ type: "delete", start: 0, end: 1 }] },
  { title: "살림표", description: "잘못 지운 표시 위에 동그라미 친 ‘生’을 적어 원래 글자를 살립니다.", before: ["좋은 날"], after: ["좋은 날"], marks: [{ type: "restore", start: 0, end: 1 }] },
  { title: "자리 바꿈표", description: "두 글자나 구절을 각각 지정하고 서로의 자리를 바꿉니다.", before: ["너와 나"], after: ["나와 너"], marks: [{ type: "swap", from: 0, to: 3 }] },
  { title: "부분 자리 옮김표", description: "옮길 부분을 동그라미로 묶고 화살표 끝으로 새 위치를 가리킵니다.", before: ["나는 간다 오늘"], after: ["나는 오늘 간다"], marks: [{ type: "move", start: 6, end: 7, target: 3 }] },
  { title: "문장 옮기기", description: "옮길 문장 전체를 가리켜 새 줄의 목적지로 보냅니다.", before: ["오늘 쉰다.", "내일 간다.", "모레 온다."], after: ["내일 간다.", "모레 온다.", "오늘 쉰다."], marks: [{ type: "sentenceMove" }] },
  { title: "오른 자리 옮김표", description: "표시한 글자부터 오른쪽으로 한 칸씩 옮겨 빈칸을 만듭니다.", before: ["나는간다."], after: ["나는 간다."], marks: [{ type: "shift", start: 2, end: 4, direction: 1 }] },
  { title: "왼 자리 옮김표", description: "표시한 글자부터 왼쪽으로 한 칸씩 당겨 빈칸을 없앱니다.", before: ["나는 간다."], after: ["나는간다."], marks: [{ type: "shift", start: 3, end: 5, direction: -1 }] },
  { title: "줄 바꿈표", description: "지정한 지점부터 다음 줄 첫 칸으로 옮깁니다.", before: ["나는 간다.오늘"], after: ["나는 간다.", "오늘"], marks: [{ type: "break", col: 6 }] },
  { title: "줄 이음표", description: "불필요하게 나뉜 두 줄을 이어 한 줄로 씁니다.", before: ["비 온다.", "곧 갠다."], after: ["비 온다.곧 갠다."], marks: [{ type: "lineJoin" }] },
  { title: "줄 비움표", description: "두 줄 사이에 엑스자 표시를 하여 빈 줄 하나를 넣습니다.", before: ["비 온다.", "곧 갠다."], after: ["비 온다.", "", "곧 갠다."], marks: [{ type: "lineGap" }] },
  { title: "줄 붙임표", description: "불필요한 빈 줄을 없애고 아래 줄을 올립니다.", before: ["비 온다.", "", "곧 갠다."], after: ["비 온다.", "곧 갠다."], marks: [{ type: "lineRemoveGap" }] },
  { title: "줄 서로 바꿈표", description: "두 줄을 가리키고 위아래 순서를 바꿉니다.", before: ["해가 뜬다.", "달이 뜬다."], after: ["달이 뜬다.", "해가 뜬다."], marks: [{ type: "lineSwap" }] },
];

const NS = "http://www.w3.org/2000/svg";
const CELL = 30;
const TOP = 40;
const WIDTH = 10;
const RED = "#a84d44";
function svgNode(tag, attributes = {}, content) {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  if (content !== undefined) node.textContent = content;
  return node;
}
function inkPath(svg, d, arrow = false) {
  svg.append(svgNode("path", { d, fill: "none", stroke: RED, "stroke-width": 2.3, "stroke-linecap": "round", "stroke-linejoin": "round", ...(arrow ? { "marker-end": "url(#correction-arrow)" } : {}) }));
}
function inkText(svg, x, y, value, size = 17) {
  svg.append(svgNode("text", { x, y, fill: RED, "font-size": size, "font-family": "Batang, serif", "font-weight": 700, "text-anchor": "middle" }, value));
}
function addMark(svg, mark) {
  const x = (col) => col * CELL;
  const middle = (col) => x(col) + CELL / 2;
  const y = TOP;
  switch (mark.type) {
    case "gap":
      inkPath(svg, `M${x(mark.col) - 9} ${y - 13} L${x(mark.col)} ${y - 3} L${x(mark.col) + 9} ${y - 13}`);
      break;
    case "gapCancel":
      inkPath(svg, `M${x(mark.col) - 9} ${y - 13} L${x(mark.col)} ${y - 3} L${x(mark.col) + 9} ${y - 13} M${x(mark.col) - 12} ${y - 8} H${x(mark.col) + 12}`);
      break;
    case "join":
      inkPath(svg, `M${x(mark.col) - 7} ${y - 5} Q${middle(mark.col)} ${y - 27} ${x(mark.col + 1) + 7} ${y - 5}`);
      break;
    case "joinCancel":
      inkPath(svg, `M${x(mark.col) - 7} ${y - 5} Q${middle(mark.col)} ${y - 27} ${x(mark.col + 1) + 7} ${y - 5} M${middle(mark.col) - 5} ${y - 21} V${y - 12} M${middle(mark.col)} ${y - 22} V${y - 13} M${middle(mark.col) + 5} ${y - 21} V${y - 12}`);
      break;
    case "insert":
      inkPath(svg, `M${x(mark.col) - 14} ${y - 9} Q${x(mark.col) - 14} ${y - 2} ${x(mark.col) - 8} ${y - 2} L${x(mark.col) - 5} ${y - 6} L${x(mark.col)} ${y - 2} L${x(mark.col) + 5} ${y - 6} L${x(mark.col) + 8} ${y - 2} Q${x(mark.col) + 14} ${y - 2} ${x(mark.col) + 14} ${y - 9}`);
      inkText(svg, x(mark.col), y - 16, mark.label, 15);
      break;
    case "punctInsert":
      inkPath(svg, `M${x(mark.col) - 10} ${y + 34} L${x(mark.col)} ${y + 19} L${x(mark.col) + 10} ${y + 34}`);
      inkText(svg, x(mark.col), y + 51, mark.label, 17);
      break;
    case "replace":
      inkPath(svg, `M${x(mark.col) + 5} ${y + 22} L${x(mark.col + 1) - 5} ${y + 8}`);
      inkPath(svg, `M${middle(mark.col) - 9} ${y - 11} L${middle(mark.col)} ${y - 3} L${middle(mark.col) + 9} ${y - 11}`);
      inkText(svg, middle(mark.col), y - 17, mark.label, 16);
      break;
    case "removeOne":
      svg.append(svgNode("ellipse", { cx: middle(mark.col), cy: y + 15, rx: 12, ry: 13, fill: "none", stroke: RED, "stroke-width": 2.3 }));
      inkPath(svg, `M${x(mark.col) + 3} ${y + 27} L${x(mark.col + 1) - 3} ${y + 3}`);
      break;
    case "delete":
      inkPath(svg, `M${x(mark.start) + 3} ${y + 15} L${x(mark.end + 1) - 3} ${y + 15}`);
      break;
    case "restore":
      inkPath(svg, `M${x(mark.start) + 3} ${y + 15} L${x(mark.end + 1) - 3} ${y + 15}`);
      svg.append(svgNode("circle", { cx: middle(mark.start), cy: y - 17, r: 12, fill: "#fffdf8", stroke: RED, "stroke-width": 2 }));
      inkText(svg, middle(mark.start), y - 12, "生", 13);
      break;
    case "swap":
      inkPath(svg, `M${x(mark.from) - 3} ${y + 2} Q${middle(mark.from)} ${y + 35} ${middle(mark.to)} ${y - 5} M${x(mark.to + 1) + 3} ${y + 2} Q${middle(mark.to)} ${y + 35} ${middle(mark.from)} ${y - 5}`);
      break;
    case "move":
      svg.append(svgNode("ellipse", { cx: (x(mark.start) + x(mark.end + 1)) / 2, cy: y + 15, rx: (mark.end - mark.start + 1) * CELL / 2 + 3, ry: 15, fill: "none", stroke: RED, "stroke-width": 2.3 }));
      inkPath(svg, `M${x(mark.start)} ${y + 30} Q${middle(mark.target)} ${y + 56} ${x(mark.target)} ${y + 31}`, true);
      break;
    case "sentenceMove":
      inkPath(svg, `M${x(0) + 3} ${y + 29} H${x(6) - 3}`);
      inkPath(svg, `M${x(7)} ${y + 15} H${x(9)} V${y + 78} H${x(7)}`, true);
      break;
    case "shift": {
      const source = x(mark.start);
      const target = source + mark.direction * CELL;
      inkPath(svg, `M${source} ${y + 4} V${y + 34} H${target} V${y + 54}`);
      inkText(svg, (source + target) / 2, y + 51, "1칸", 12);
      break;
    }
    case "break":
      inkPath(svg, `M${x(mark.col) - 7} ${y - 18} H${x(mark.col) + 7} V${y - 5} H${x(mark.col) - 2}`);
      break;
    case "lineJoin":
      inkPath(svg, `M${x(7)} ${y + 11} Q${x(9)} ${y + 26} ${x(7)} ${y + 46}`, true);
      break;
    case "lineGap":
      inkPath(svg, `M${x(7)} ${y + 21} L${x(8)} ${y + 40} M${x(8)} ${y + 21} L${x(7)} ${y + 40}`);
      break;
    case "lineRemoveGap":
      inkPath(svg, `M${x(1)} ${y + 30} Q${x(0)} ${y + 45} ${x(1)} ${y + 60} M${x(8)} ${y + 30} Q${x(9)} ${y + 45} ${x(8)} ${y + 60}`);
      break;
    case "lineSwap":
      inkPath(svg, `M${x(7)} ${y + 9} C${x(9)} ${y + 8} ${x(9)} ${y + 42} ${x(7)} ${y + 43}`, true);
      inkPath(svg, `M${x(6)} ${y + 49} C${x(4)} ${y + 48} ${x(4)} ${y + 17} ${x(6)} ${y + 14}`, true);
      break;
  }
}

function drawGrid(rows, marks, label) {
  const height = TOP + rows.length * CELL + 28;
  const svg = svgNode("svg", { class: "correction-paper", viewBox: `-2 0 ${WIDTH * CELL + 4} ${height}`, role: "img", "aria-label": label });
  const defs = svgNode("defs");
  const arrow = svgNode("marker", { id: "correction-arrow", viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 5, markerHeight: 5, orient: "auto-start-reverse" });
  arrow.append(svgNode("path", { d: "M1 1 L9 5 L1 9", fill: "none", stroke: RED, "stroke-width": 1.8 }));
  defs.append(arrow); svg.append(defs);
  rows.forEach((row, rowIndex) => {
    Array.from({ length: WIDTH }, (_, col) => {
      const char = Array.from(row)[col] || "";
      const cy = TOP + rowIndex * CELL;
      svg.append(svgNode("rect", { x: col * CELL, y: cy, width: CELL, height: CELL, fill: "#fffdf8", stroke: "#cda9a2", "stroke-width": 1 }));
      if (char && char !== " ") {
        const punctuation = /[.,!?]/u.test(char);
        svg.append(svgNode("text", { x: col * CELL + (punctuation && /[.,]/u.test(char) ? 8 : CELL / 2), y: cy + (punctuation && /[.,]/u.test(char) ? 25 : 21), "text-anchor": "middle", fill: "#273a36", "font-family": "Noto Serif KR, Batang, serif", "font-size": punctuation ? 14 : 16 }, char));
      }
    });
  });
  marks.forEach(mark => addMark(svg, mark));
  return svg;
}

export function renderCorrectionExamples(container) {
  correctionExamples.forEach((example, index) => {
    const article = document.createElement("article");
    const number = document.createElement("b"); number.className = "correction-number"; number.textContent = String(index + 1).padStart(2, "0");
    const heading = document.createElement("h3"); heading.textContent = example.title;
    const description = document.createElement("p"); description.textContent = example.description;
    const comparison = document.createElement("div"); comparison.className = "correction-comparison";
    for (const [type, rows, marks] of [["교정 표시", example.before, example.marks], ["고친 뒤", example.after, []]]) {
      const panel = document.createElement("div"); panel.className = "correction-stage";
      const caption = document.createElement("span"); caption.className = "correction-stage-label"; caption.textContent = type;
      panel.append(caption, drawGrid(rows, marks, `${example.title} ${type}: ${rows.join(" / ")}`));
      comparison.append(panel);
    }
    article.append(number, heading, description, comparison);
    container.append(article);
  });
}
