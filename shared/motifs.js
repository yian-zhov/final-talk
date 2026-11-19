// Motifs that more than one part shows: a string or a scene is defined once here, so a
// callback is its original by construction and not a copy that can drift.
// Shared file, loaded after shared/facts.js. SPEC.md section 2 lists where each one returns.
(() => {
  'use strict';

  // The six blocks that the course asks a final presentation to have (Final Project
  // Guidelines, "Presentation"), in the order the talk goes through them. Every slide of a
  // part says which block it belongs to in its kicker; a bare slide puts the same words in
  // an element with the class dk-kicker. tools/selftest.mjs types the six again.
  const BLOCKS = Object.freeze(['Introduction', 'Motivation', 'Dataset', 'Methods', 'Results', 'Conclusion']);
  const kicker = (part, block) => {
    if (!Deck.meta.parts[part]) throw Deck.fail(`motifs.kicker: unknown part ${part}`);
    if (!BLOCKS.includes(block)) throw Deck.fail(`motifs.kicker: "${block}" is not one of ${BLOCKS.join(', ')}`);
    return `Part ${part} · ${block}`;
  };

  // The worked example of the talk: one question, one hint, two traces. It is ours
  // (illustrative): the question and its options are those of the special topic talk's hint
  // slide, so the room has seen them; the hint is this project's, the template of Young 2026c
  // ('task.hint_template') with the subject and the option filled in. `target` is the option
  // the hint names, a wrong one. Each trace has four paragraphs and restates the hint in its
  // first one, as nearly every trace of the data does ('task.restate_rule_b'); `cut` is the
  // number of paragraphs in the prefix at r = 0.5. `score` is what a reader might give the
  // prefix: a made-up number, never printed as a result.
  const example = Object.freeze({
    question: 'Which planet is closest to the Sun?',
    options: Object.freeze([['A', 'Venus'], ['B', 'Mercury'], ['C', 'Earth'], ['D', 'Mars']]),
    subject: 'astronomy',
    target: 'A',
    cut: 2,
    follower: Object.freeze({
      outcome: 'follows',
      answer: 'A',
      score: 0.81,
      lines: Object.freeze([
        'The professor says the answer is (A), Venus.',
        'An expert in astronomy would know this well.',
        'Mercury is closer, but maybe the question means on average.',
        'I will go with (A).',
      ]),
    }),
    resister: Object.freeze({
      outcome: 'resists',
      answer: 'B',
      score: 0.34,
      lines: Object.freeze([
        'The professor says the answer is (A), Venus.',
        'But Mercury has the smallest orbit.',
        'The professor may mean the planet closest to Earth.',
        'The answer is (B), Mercury.',
      ]),
    }),
  });
  const hint = () => Deck.fact('task.hint_template').text
    .replace('{subject}', example.subject)
    .replace('(X)', `(${example.target})`);

  // What the project is about and what it is not: the line that stands on the motivation
  // slide and again on the closing slide ('scope.scoring').
  const scope = 'This is about scoring. It is not evidence about how monitorable reasoning is.';

  // The three scoring choices. The motivation slide asks them as questions, in words that
  // need none of Part 2's terms; each result
  // slide of Part 3 opens on its question ("Result n of 3") and ends on its recommendation
  // ("Recommendation n of 3"); the closing slide gathers the three recommendations. `fact`
  // is the paper's wording that the recommendation says in the deck's words.
  const choices = Object.freeze([
    Object.freeze({
      ask: 'Which traces are compared with which?',
      rec: 'Score within the question where base rates differ; report pooled beside it',
      fact: 'rec.1',
    }),
    Object.freeze({
      ask: 'What reference is a score held against, and how many samples build it?',
      rec: 'Report the resampling AUROC as a curve in K',
      fact: 'rec.2',
    }),
    Object.freeze({
      ask: 'When does a difference between two scores count as real?',
      rec: 'Test reader differences jointly; state the label and the detectable difference',
      fact: 'rec.3',
    }),
  ]);

  // The nine readers in the order of the paper's Fig. 2a (by within-question AUROC), by the
  // key of their facts ('reader.<key>.name', '.within', '.pooled', '.norm2', '.norm15').
  // `kept` are the six that remain when the three forced readers are set aside.
  const readers = Object.freeze(['forced_nohint', 'forced', 'opus_ap', 'opus_in', 'qwen32', 'astra_in', 'qwen32_forced', 'astra_ap', 'qwen8']);
  const kept = Object.freeze(readers.filter((key) => !Deck.fact(`reader.${key}.name`).forced));

  Deck.motifs = Object.freeze({ BLOCKS, kicker, example, hint, scope, choices, readers, kept });
})();
