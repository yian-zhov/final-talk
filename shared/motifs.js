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
  // prefix: a made-up number, never printed as a result. `again` is a second ending of the
  // follower's prefix, as many paragraphs as its own.
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
        'The professor says (A), Venus.',
        'An astronomy expert would know.',
        'Mercury is closer, but maybe on average?',
        'I will go with (A).',
      ]),
      // A continuation of this trace's prefix: the model writes the rest again from the cut,
      // and this time it ends elsewhere (slide 6 types it; slide 8 draws sixteen as paths).
      again: Object.freeze({
        outcome: 'resists',
        answer: 'B',
        lines: Object.freeze([
          'Still, Mercury orbits closer.',
          'The answer is (B), Mercury.',
        ]),
      }),
    }),
    resister: Object.freeze({
      outcome: 'resists',
      answer: 'B',
      score: 0.34,
      lines: Object.freeze([
        'The professor says (A), Venus.',
        'But Mercury has the smallest orbit.',
        'Maybe they mean closest to Earth.',
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

  // The four practices the paper recommends (its Sec. 11), in its order and in the talk's
  // words; `fact` is the paper's wording. The first is a known point that the paper
  // replicates: the slide on AUROC ends on it. The other three close the three results of
  // Part 3, and the closing slide gathers the four ("Recommendation n of 4").
  const recs = Object.freeze([
    Object.freeze({ rec: 'Score within the question; report pooled AUROC beside it', fact: 'rec.1' }),
    Object.freeze({ rec: 'Report the resampling AUROC as a curve in K; state its label; treat limit estimates as sensitivity analyses', fact: 'rec.2' }),
    Object.freeze({ rec: 'Report alarm timing against a stated reference and a per-trace false-alarm budget', fact: 'rec.3' }),
    Object.freeze({ rec: 'Test reader differences jointly; state the label and the detectable difference', fact: 'rec.4' }),
  ]);

  // The three questions of the talk: the two that a resampling ceiling raises, and what
  // both mean for comparing monitors (the paper's contributions (i) to (iii)). The
  // motivation slide asks them, in words that need none of Part 2's terms but "resampling",
  // which it glosses; each result slide of Part 3 opens on its question ("Result n of 3")
  // and ends on its recommendation, `rec` of the four above (`fact` is that one's).
  const choices = Object.freeze([
    { ask: 'When is a resampling ceiling a ceiling?', rec: 2 },
    { ask: 'Does a monitor alarm in time?', rec: 3 },
    { ask: 'Can the data tell two monitors apart?', rec: 4 },
  ].map((choice) => {
    if (!recs[choice.rec - 1]) throw Deck.fail(`motifs.choices: there is no recommendation ${choice.rec}`);
    return Object.freeze({ ...choice, fact: recs[choice.rec - 1].fact });
  }));

  // The nine readers in the order of the paper's Fig. 1a (by within-question AUROC), by the
  // key of their facts ('reader.<key>.name', '.within', '.pooled', '.norm2', '.norm15').
  // `kept` are the six that remain when the three forced readers are set aside.
  const readers = Object.freeze(['forced_nohint', 'forced', 'opus_ap', 'opus_in', 'qwen32', 'astra_in', 'qwen32_forced', 'astra_ap', 'qwen8']);
  const kept = Object.freeze(readers.filter((key) => !Deck.fact(`reader.${key}.name`).forced));

  // The tags that stand beside a result and in no footer: how the analysis behind it stands
  // (the paper's Sec. 2.4 and Table 2), from the firmest down. `tag` is the chip as the
  // slides of Part 3 print it; `means` is the fact with what the two legends say of it (the
  // entrance of slide 2 and the sources slide; the facts are parts/part1.js's).
  const standings = Object.freeze([
    Object.freeze({ tag: Deck.fact('alarm.fixed').text, means: 'p1.standing_fixed' }),
    Object.freeze({ tag: Deck.fact('looks.tier').text, means: 'p1.standing_prespecified' }),
    Object.freeze({ tag: 'exploratory', means: 'p1.exploratory' }),
  ]);

  Deck.motifs = Object.freeze({ BLOCKS, kicker, example, hint, scope, recs, choices, readers, kept, standings });
})();
