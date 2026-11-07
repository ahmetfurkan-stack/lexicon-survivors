const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const questions = JSON.parse(fs.readFileSync(path.join(root, "assets/data/questions.json"), "utf8"));
const webQuestions = JSON.parse(fs.readFileSync(path.join(root, "build/web/questions.json"), "utf8"));
assert.deepEqual(webQuestions, questions, "Godot and web must ship the same authored question bank");
assert.equal(questions.length, 200, "Question bank should grow from 160 to 200 curated cards");

const counts = new Map([[0, 0], [1, 0], [2, 0], [3, 0]]);
const words = new Set();
const ids = new Set();
const prompts = new Set();
for (const card of questions) {
  assert(card.id && card.word && card.level && card.question_type, `Missing question identity or level: ${card.word}`);
  assert.equal(card.options?.length, 4, `${card.word} needs four choices`);
  assert.equal(new Set(card.options.map(value => value.trim().toLocaleLowerCase("en"))).size, 4, `${card.word} has duplicate choices`);
  assert(card.correct_index >= 0 && card.correct_index < 4, `${card.word} has an invalid answer index`);
  assert(card.example?.trim(), `${card.word} needs a usage example`);
  assert(!words.has(card.word.toLocaleLowerCase("en")), `Duplicate vocabulary card: ${card.word}`);
  assert(!ids.has(String(card.id)), `Duplicate question id: ${card.id}`);
  assert(!prompts.has(card.question.trim().toLocaleLowerCase("tr")), `Duplicate prompt: ${card.question}`);
  words.add(card.word.toLocaleLowerCase("en"));
  ids.add(String(card.id));
  prompts.add(card.question.trim().toLocaleLowerCase("tr"));
  counts.set(card.correct_index, counts.get(card.correct_index) + 1);
}

assert.deepEqual([...counts.values()], [50, 50, 50, 50], "Correct answers should not reveal a preferred option position");
for (const level of ["A1", "A2", "B1", "B2", "C1", "C2"]) {
  assert(questions.some(card => card.level === level), `Missing CEFR band ${level}`);
}
assert(questions.filter(card => card.type === "Prefix").length >= 4, "Prefix practice must support the existing Prefix Overdrive synergy");
console.log("Learning campaign regression passed: 200 unique questions, balanced keys, A1–C2 and prefix coverage.");
