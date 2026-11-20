import test from "node:test";
import assert from "node:assert/strict";
import { layoutManuscript } from "./layout.js";

const line = (result, page, row) => result.pages[page][row].map(cell => cell.text);

test("첫 문단과 새 문단은 한 칸 들여쓴다", () => {
  const result = layoutManuscript("가나다\n라마", 10, 10);
  assert.deepEqual(line(result, 0, 0).slice(0, 5), ["", "가", "나", "다", ""]);
  assert.deepEqual(line(result, 0, 1).slice(0, 5), ["", "라", "마", "", ""]);
});

test("이어지는 줄의 첫 칸은 비우지 않고 줄 끝 공백을 넘기지 않는다", () => {
  const result = layoutManuscript("가나다라마바사아자차", 10, 10);
  assert.deepEqual(line(result, 0, 0), ["", "가", "나", "다", "라", "마", "바", "사", "아", "자"]);
  assert.equal(result.pages[0][1][0].text, "차");
});

test("줄 끝 문장 부호는 마지막 글자와 같은 칸에 둔다", () => {
  const result = layoutManuscript("가나다라마바사아자.", 10, 10);
  assert.equal(result.pages[0][0][9].text, "자.");
  assert.equal(result.pages[0][0][9].kind, "shared");
  assert.equal(result.pages.length, 1);
});

test("숫자는 두 자리씩 배치하고 페이지를 추가한다", () => {
  const result = layoutManuscript("20261 " + "가".repeat(100), 10, 10);
  assert.deepEqual(line(result, 0, 0).slice(0, 5), ["", "20", "26", "1", ""]);
  assert.equal(result.pages.length, 2);
});

test("규격 범위를 확인한다", () => {
  assert.throws(() => layoutManuscript("가", 9, 10), RangeError);
  assert.throws(() => layoutManuscript("가", 20, 51), RangeError);
  assert.doesNotThrow(() => layoutManuscript("가", 50, 50));
});

test("물음표 뒤 공백은 입력한 대로 유지한다", () => {
  const result = layoutManuscript("갈까?좋아", 10, 10);
  assert.deepEqual(line(result, 0, 0).slice(0, 6), ["", "갈", "까", "?", "좋", "아"]);
  const spaced = layoutManuscript("갈까? 좋아", 10, 10);
  assert.deepEqual(line(spaced, 0, 0).slice(0, 7), ["", "갈", "까", "?", "", "좋", "아"]);
});

test("쉼표와 마침표 뒤 입력 공백을 원고지에서 생략한다", () => {
  const result = layoutManuscript("가, 나. 다", 10, 10);
  assert.deepEqual(line(result, 0, 0).slice(0, 6), ["", "가", ",", "나", ".", "다"]);
  assert.equal(result.pages[0][0][2].kind, "half-mark");
});

test("숫자의 쉼표와 소수점을 두 글자씩 묶는다", () => {
  const result = layoutManuscript("825명 1,037명 6.5%", 20, 10);
  assert.deepEqual(line(result, 0, 0).slice(0, 13), ["", "82", "5", "명", "", "1,", "03", "7", "명", "", "6.", "5", "%"]);
  assert.equal(result.pages[0][0][12].kind, "unit");
});

test("대문자와 소문자, 단위 기호를 구별한다", () => {
  const result = layoutManuscript("All 10cm Ⅲ", 15, 10);
  assert.deepEqual(line(result, 0, 0).slice(0, 8), ["", "A", "ll", "", "10", "cm", "", "Ⅲ"]);
});

test("마지막 칸에 혼자 남는 여는 괄호만 다음 줄로 옮긴다", () => {
  const result = layoutManuscript("가나다라마바사아(바)", 10, 10);
  assert.deepEqual(line(result, 0, 0), ["", "가", "나", "다", "라", "마", "바", "사", "아", ""]);
  assert.deepEqual(line(result, 0, 1).slice(0, 3), ["(", "바", ")"]);
});

test("괄호 내용이 다음 줄로 이어져도 여는 괄호는 현재 줄에 둔다", () => {
  const result = layoutManuscript("가".repeat(22) + "초과근무(16.4%)", 30, 10);
  assert.equal(result.pages[0][0][27].text, "(");
  assert.equal(result.pages[0][0][28].text, "16");
  assert.equal(result.pages[0][0][29].text, ".4");
});

test("키보드로 입력한 따옴표도 문장 부호로 처리한다", () => {
  const result = layoutManuscript('가나다라마바사아"바"', 10, 10);
  assert.equal(result.pages[0][1][0].text, '"');
  assert.equal(result.pages[0][1][0].kind, "quote-open-double");
  assert.equal(result.pages[0][1][2].text, '"');
  assert.equal(result.pages[0][1][2].kind, "quote-close-double");
});

test("여닫는 따옴표와 마침표를 위치에 맞게 분류한다", () => {
  const result = layoutManuscript("그는 “안녕.” 했다", 15, 10);
  const cells = result.pages[0][0];
  assert.equal(cells[4].kind, "quote-open-double");
  assert.equal(cells[7].kind, "mark-quote");
  assert.equal(cells[7].text, ".”");
  assert.equal(cells[7].quoteSize, "double");
});

test("물음표와 닫는 따옴표는 각각 한 칸을 쓴다", () => {
  const result = layoutManuscript('“정말?”', 10, 10);
  const cells = result.pages[0][0];
  assert.equal(cells[4].text, "?");
  assert.equal(cells[5].kind, "quote-close-double");
});

test("줄 끝에서도 물음표와 닫는 따옴표를 합치지 않는다", () => {
  const result = layoutManuscript('“가나다라마바사아?”', 10, 10);
  assert.equal(result.pages[0][0][9].kind, "carry");
  assert.deepEqual(line(result, 0, 1).slice(0, 3), ["아", "?", "”"]);
});

test("마지막 칸의 여는 괄호는 비우고 다음 줄에서 시작한다", () => {
  const result = layoutManuscript("가나다라마바사아(라)", 10, 10);
  assert.equal(result.pages[0][0][9].kind, "carry");
  assert.deepEqual(line(result, 0, 1).slice(0, 3), ["(", "라", ")"]);
});

test("줄임표와 줄표는 두 칸에 나누어 쓴다", () => {
  const result = layoutManuscript("가……나―다", 10, 10);
  assert.deepEqual(result.pages[0][0].slice(2, 4).map(cell => cell.kind), ["ellipsis-first", "ellipsis-last"]);
  assert.deepEqual(result.pages[0][0].slice(5, 7).map(cell => cell.kind), ["dash-start", "dash-end"]);
});

