// Part 3: What we found. Slides 9-12 (Results, Conclusion).
// SPEC.md section 5 describes each slide; parts/sample.js shows the registration API.
// Slides 9 to 11 share one frame (.p3-res): the result's head (kit.resultHead), the picture,
// and under it the caption of the step (kit.says). On the last click the caption's place
// holds the recommendation (kit.rec) and, under it, its limits. On slides 9 and 11 nothing
// moves to make room: what a later click brings has its place from the start. Slide 10
// shows its chart alone in the middle until the gauge needs the right half. The closing
// slide (12) is text only and keeps what is on screen in its middle.
// Every number and quote on screen is read from the fact table by key. What a drawing makes
// up (the follow rates of slide 9's three columns) is named where it is defined, and the
// footer tag "Schematic" covers it.
(() => {
  'use strict';

  const PART = 3;
  const { kit, util } = Deck;
  const DUR = Deck.timeline.DUR;
  const { choices: CHOICES, kicker, readers: READERS, kept: KEPT } = Deck.motifs;
  // The four readers that the held-out label sets above the small open monitor (slide 11).
  const HELD_ABOVE = Object.freeze(['opus_ap', 'astra_ap', 'opus_in', 'astra_in']);
  // The forced reader that was never checked against the numerical tolerance (slide 11): the
  // paper's "Qwen3-32B forced" ('readers.forced_aside'; paper/tmlr/sections/03_tasks.tex:47-48).
  const UNCHECKED = 'qwen32_forced';

  // Facts that only Part 3 needs. Each was read at its source on 2026-11-17; `file` is
  // relative to final-project/, as in shared/facts.js.
  Deck.addFacts({
    // Slide 9, what the readers' rise under pooling is held against: the spread of the nine
    // readers' within-question AUROCs, largest mean minus smallest (0.844 - 0.803, the two
    // ends that the caption of click 3 prints). Read on 2026-11-18.
    'p3.reader_spread': {
      value: 0.041, text: '0.041', src: 'paper', where: 'Table 3',
      file: 'paper/tmlr/sections/04_readers.tex:71 (Spread of reader means, observed 0.041; results/revision_inference/inference.txt:122; the two ends in results/prompt_only_pooled/prompt_only_pooled.txt:30)',
    },
    // Slide 10, the level of the gauge's reader: Opus IN's (the paper's Opus IN-num)
    // within-question AUROC against a held-out continuation's ending. It is the numerator of
    // the two normalized AUROCs that Table 2 prints for this reader (0.96 and 0.81); Table 12
    // prints the value itself.
    'p3.opus_in_heldout': {
      value: 0.833, text: '0.833', src: 'paper', where: 'App. E; Table 12',
      file: 'results/revision_round6/round6.txt:16 (also paper/tmlr/appendix/e_ceiling.tex:115)',
    },
    // Slide 10, why the gauge's larger reference is "from 15" while the curve ends at K = 16:
    // one of the 16 continuations is held out as the label, and the reference is the share
    // of m of the other 15.
    'p3.heldout_others': {
      value: 15, text: '15', src: 'paper', where: 'Sec. 5.1', file: 'paper/tmlr/sections/05_ceiling.tex:75-76',
    },
    // Slide 10, the points that are counted above the reference: the nine readers of the
    // talk in the seven resampled models. The paper counts 19 of 105 cells, which adds the
    // six verdicts (15 readers, Sec. 5.4, paper/tmlr/sections/05_ceiling.tex:172); the
    // results file has the 19 among the 63 cells of the nine readers ("graded (63): point >
    // 1 19"), and none of the 63 above the reference from 15 (its next line).
    'p3.reader_points': {
      value: 63, text: '63', src: 'paper', where: 'Sec. 5.4; Table 12',
      file: 'results/revision_round6/round6.txt:25-26 (graded (63): point > 1 19, then 0)',
    },
    // Slide 11, what testing one pair at a time would do: if all nine readers had the same
    // true AUROC, 1.8 of the 36 unadjusted 95% intervals would still exclude zero (36 times
    // 0.05; 2.3 in the paper's simulation).
    'p3.chance_resolved': {
      value: 1.8, text: 'about 2', src: 'paper', where: 'Table 3',
      file: 'results/revision_inference/inference.txt:114-115 (analytic 1.80, simulated 2.27; paper/tmlr/sections/04_readers.tex:64)',
    },
    // Slide 11, the counts with the three forced readers kept: the joint test (Bonferroni
    // over the 36 pairs) resolves one difference against the trace's own outcome, and the
    // calibrated one six to nine against a held-out continuation's, by bootstrap run.
    // Unadjusted, three of the 36 exclude zero against the trace's own outcome.
    'p3.resolved_all_own': {
      value: 1, text: '1', src: 'paper', where: 'Sec. 4; Table 3',
      file: 'results/revision_inference/inference.txt:113 (also paper/tmlr/sections/04_readers.tex:87-88)',
    },
    'p3.resolved_all_held': {
      value: Object.freeze([6, 9]), text: '6 to 9', src: 'paper', where: 'Sec. 1; Sec. 4',
      file: 'paper/tmlr/sections/04_readers.tex:89-90 (also paper/tmlr/sections/01_intro.tex:68-69)',
    },
    // Slide 11, the four differences that the joint test resolves against the held-out
    // label: the small open monitor below each of these four readers ('test.resolved_held_who').
    'p3.resolved_held_pairs': {
      value: HELD_ABOVE,
      text: `${Deck.fact('readers.name_qwen8').text} below ${HELD_ABOVE.map((key) => Deck.fact(`reader.${key}.name`).text).join(', ')}`,
      src: 'paper', where: 'Sec. 4; App. J', file: 'results/revision_cold_r4/cold_r4.txt:18',
    },
    // Slide 11, click 2: the same 15 differences against a held-out continuation's ending,
    // point and bootstrap standard error (a minus b, in the order of 'test.pairs'), read on
    // 2026-11-18. The results file holds no percentile interval for this label, so the bar
    // of a pair alone is d +- 1.960 SE and the joint interval d +- 3.197 SE: the paper's
    // joint test for this label resolves a pair when |d| / SE is above 3.197
    // (src/cotx/analysis/revision_cold_r4_core.py:49-57). `alone`: how many exclude zero
    // one pair at a time (cold_r4.txt:17, "unadjusted 8"); the slide fails to build if the
    // bars drawn from these values do not give that count and the four of the joint test.
    'p3.pairs_held': {
      value: Object.freeze([
        ['qwen8', 'qwen32', -0.01942, 0.00828],
        ['qwen8', 'opus_ap', -0.03065, 0.00914],
        ['qwen8', 'astra_ap', -0.03921, 0.01025],
        ['qwen8', 'opus_in', -0.04360, 0.01104],
        ['qwen8', 'astra_in', -0.04020, 0.00993],
        ['qwen32', 'opus_ap', -0.01123, 0.00978],
        ['qwen32', 'astra_ap', -0.01979, 0.00890],
        ['qwen32', 'opus_in', -0.02418, 0.00980],
        ['qwen32', 'astra_in', -0.02078, 0.00855],
        ['opus_ap', 'astra_ap', -0.00856, 0.01123],
        ['opus_ap', 'opus_in', -0.01295, 0.00837],
        ['opus_ap', 'astra_in', -0.00955, 0.01001],
        ['astra_ap', 'opus_in', -0.00439, 0.00876],
        ['astra_ap', 'astra_in', -0.00099, 0.00571],
        ['opus_in', 'astra_in', 0.00340, 0.00702],
      ].map(([a, b, d, se]) => Object.freeze({ a, b, d, se }))),
      alone: 8, text: '15 differences', src: 'paper', where: 'Sec. 4; App. J',
      file: 'results/revision_cold_r4/cold_r4.json:1996-2087 (analysis.per_pair["held|none"].rest_15.pairs: d, se; counts in cold_r4.txt:17)',
    },
    // The critical value of an interval for one pair alone; the joint one is this times
    // 'test.joint_widening' (3.197).
    'p3.z_alone': {
      value: 1.960, text: '1.960', src: 'paper', where: 'Table 3; App. J',
      file: 'results/revision_round8/mdd.txt:2 (z: unadjusted 1.960, z36 3.197)',
    },
    // Slide 11, what "at most 4" depends on: the joint test of the count (Bonferroni)
    // resolves 4; it is anti-conservative for this label, and a critical value calibrated
    // for it (c* = 3.370) resolves 3 or 4, by bootstrap run; keeping only pairs of traces
    // within 25% in length, the joint test resolves none.
    'p3.resolved_held_stricter': {
      value: Object.freeze([3, 4]), text: '3 or 4', src: 'paper', where: 'Sec. 4; Table 3',
      file: 'paper/tmlr/sections/04_readers.tex:85-87 (also results/revision_cold_r4/cold_r4.txt:17, c_star 3, and :35, runs)',
    },
    'p3.resolved_held_matched': {
      value: 0, text: '0', src: 'paper', where: 'Sec. 4',
      file: 'paper/tmlr/sections/04_readers.tex:84-85 (also results/revision_cold_r4/cold_r4.txt:21, held|L1 rest_15 z36 0; paper/tmlr/sections/04_readers.tex:13, within 25% in prefix length)',
    },
    // Slide 11, the check that two of the forced readers fail: the forced answer is read
    // incrementally along a trace, and its letter probabilities may differ from a one-shot
    // recomputation by at most a tolerance fixed before the subject readings (5e-3, fixed
    // on 2026-10-24). The slide says it without the terms: the score, computed two ways,
    // must agree within a limit. Read again on 2026-11-18.
    'p3.forced_check': {
      text: 'computed incrementally along the trace, the forced answer fails a numerical tolerance fixed before the subject readings',
      src: 'paper', where: 'Sec. 3.2; App. A',
      file: 'paper/tmlr/sections/03_tasks.tex:46-48 (the check: paper/tmlr/appendix/a_provenance.tex:219-221)',
    },
    // Slide 11, what "tested jointly" means, beside the key of the two marks: the paper's
    // simultaneous 95% intervals, which on the main task are Bonferroni over the 36 pairs
    // (chosen by a rule fixed in advance). The level is nominal: the simulated coverage of
    // the family is 0.939 (paper/tmlr/sections/04_readers.tex:48-49). Read on 2026-11-18.
    'p3.joint_level': {
      value: 95, text: '95%', src: 'paper', where: 'App. J; Table 3',
      file: 'paper/tmlr/appendix/k_inference.tex:21-22 (simultaneous 95% intervals; Bonferroni on the main task: :25-26)',
    },
    // Slide 12, the pilot behind the open question: its hint is a block <question_metadata>
    // in the user turn whose <answer_key> field names the wrong option, and its model is
    // QwQ-32B. Neither is the main task's: that task's hint is a sentence in the prompt (the
    // sycophancy template, 'task.hint_template') and QwQ-32B is not one of its eight models
    // ('task.model_names'). The slide says so, in the words "another model" and "another
    // hint", and fails to build if either stops being true of the facts. Read on 2026-11-18.
    'p3.pilot_hint': {
      text: 'a metadata block whose answer-key field names the wrong option', src: 'paper', where: 'App. I',
      file: 'paper/tmlr/appendix/i_s22.tex:7-8',
    },
    // Slide 12, the limit on the second task, with its result: for six of the paper's eight
    // pitfalls a check was frozen "(written to a file with a recorded digest, under our own
    // version control) before the second task's traces were downloaded (four sample files
    // excepted)"; four of the six passed ('second.checks'), and the test has almost no power
    // to confirm or refute transfer ('second.power'). The slide says "fixed in advance" for
    // "frozen before the download". Read on 2026-11-18.
    'p3.second_frozen': {
      text: 'fixed in advance', src: 'paper', where: 'Sec. 1; Sec. 6.1',
      file: 'paper/tmlr/sections/01_intro.tex:25-27 (a check was frozen before the second task\'s traces were downloaded, four sample files excepted; also paper/tmlr/sections/07_checklist.tex:65, "Of the six frozen checks, four passed, exactly the threshold")',
    },
    'p3.pilot_other': {
      text: 'another model, another hint', src: 'paper', where: 'Sec. 3.1; App. I',
      file: 'paper/tmlr/appendix/i_s22.tex:7-8 (the metadata hint; the subject model is QwQ-32B) against paper/tmlr/sections/03_tasks.tex:8-13 (the main task: the sycophancy template; eight subject models, QwQ-32B not among them)',
    },
  });

  const t = (key) => Deck.fact(key).text;
  const v = (key) => Deck.fact(key).value;
  const percent = (key) => `${Math.round(v(key) * 100)}%`;
  const round3 = (n) => Math.round(n * 1000) / 1000;
  const two = (n) => n.toFixed(2);
  const three = (n) => n.toFixed(3);
  const RESULTS = kicker(PART, 'Results');
  // How the analyses of a result slide stand: most were planned after results had been read.
  const EXPLORATORY = 'exploratory';
  const { POP } = kit;

  // ---------------------------------------------------------------- shared by slides 9 to 11
  // The caption under the picture (kit.says): `notes` is { key: sentence }, one sentence a
  // step (a list of sentences where a later click adds a line to the one that stands). The
  // recommendation and its limits share its place and arrive on the last click; a slide
  // whose limit stands in its cue row has no `limit`.
  const captionHtml = ({ notes, rec, limit }) => kit.says(
    Object.fromEntries(Object.entries(notes).map(([key, html]) => [key, [].concat(html)])),
    { inner: `${kit.rec(rec)}${limit ? `<p class="p3-res__limit">${limit}</p>` : ''}` },
  );
  // The sentence of a step takes the place of the one before it (`leaves`).
  const note = (step, key, { leaves, at = 0 } = {}) => kit.say(step, key, [at + (leaves === undefined ? 0 : DUR.micro)], { leaves, leaveAt: at });
  // The last click of a result slide: the last sentence (`leaves`) goes, the picture steps
  // back and the recommendation arrives in the part's violet, then its limits (unless an
  // earlier click has brought them). `dims` names what steps back, where a slide keeps a
  // part of its picture at full strength to the end (the whole picture otherwise).
  const conclude = (step, { leaves, limit, dims = '.p3-res__picture' }) => {
    step.tween(`[data-says="${leaves}"]`, { opacity: [1, 0] }, { dur: DUR.micro });
    step.tween(dims, { opacity: [1, 0.4] }, { dur: DUR.enter });
    step.show('.dk-rec', { at: DUR.enter });
    if (limit) step.show('.p3-res__limit', { at: DUR.enter + DUR.move, rise: 0 });
    step.hold(DUR.enter);
  };
  // A mark beats once when something lands on it.
  const beat = (step, target, at) => {
    step.tween(target, { scale: [1, 1.5] }, { at, dur: 160 });
    step.tween(target, { scale: [1.5, 1] }, { at: at + 160, dur: 300 });
  };
  // The two labels a reader can be scored against (slide 7), as chips: slide 10 puts one on
  // its curve and the other on its gauge, slide 11 one on each of its two counts. The
  // held-out label is made of a continuation and has the amber of continuations.
  const LABELS = Object.freeze({ own: 'label: own ending', held: 'label: held-out continuation' });
  const labelChip = (key) => `<span class="dk-chip" data-label="${key}"${key === 'held' ? ' data-tone="hidden"' : ''}>${LABELS[key]}</span>`;
  // The part of a title that is held back until the picture has shown it.
  const revealTitle = (ctx, step, at) => step.tween(ctx.q('.dk-title em'), { opacity: [0, 1] }, { at, dur: DUR.move });

  // ---------------------------------------------------------------- slide 9: result 1, pooled or within
  // The peak of the talk. A reader that never sees the reasoning gives every trace of a
  // question one score, how often that question is followed. Within a question every pair
  // is then a tie (click 1); across questions a follower of a question that is usually
  // followed beats a resister of one that is usually resisted, and the reader's pooled
  // square slides from 0.50 to 0.62 while the title gets its answer (click 2). The nine real
  // readers rise too (click 3), and the slide ends on the first recommendation (click 4).
  // The three columns get their scores on the entrance, one after the other, so that the
  // room has read "one score per question" before a pair is compared.
  // The title's answer is the least expected number of the talk and is set in red, the role
  // "alarm" (parts/part3.css): a reader that reads nothing should score 0.5. It is not in the
  // teal of a reader's score nor in the part's violet, which would read as a way of scoring
  // to prefer. It lands once, with a beat and a glow that fades, as the second half of slide
  // 4's title does.
  // The slide has one cue, the size of the readers' rise: what the reader is shown and that
  // every pair inside a question is a tie are said by the caption, so that the last state
  // holds the recommendation, its limits, one cue and the chart, which stays at full
  // strength; only the columns at the left step back.
  // The cue sets the rise beside what it is as large as, in numbers: the spread of the nine
  // readers' within-question AUROCs ('p3.reader_spread', 0.041: the 0.803 to 0.844 of the
  // caption of that click). "As much as readers differ" left the room to check it against
  // the six readers' 0.803 to 0.828 of slides 3 and 11, which are 0.025 apart.
  // The title prints the measured 0.62 beside the three columns, and a listener can count
  // the columns' dots: with rates of 90%, 50% and 20% the sketch itself scored 0.81 pooled,
  // and the 0.62 read as a mistake. The rates are still made up, but chosen so that the
  // sketch, counted off its dots, gives the measured number (POOL_AUROC, below).
  const POOL = Object.freeze({
    traces: 15,
    // Made up: how many of fifteen traces follow the hint in each of three questions.
    follows: Object.freeze([10, 9, 6]),
    // The pairs across columns that are drawn. `bundles`: the follower's column, the
    // resister's column, how many pairs: the follower's question is followed more often, so
    // the prompt-only reader ranks the pair correctly. `misses`: pairs the other way round,
    // which it ranks wrongly (the follower's column and row, the resister's). Two arcs are
    // drawn right for each one drawn wrong, about as the sketch's pairs across columns
    // stand (231 ranked correctly, 111 wrongly).
    bundles: Object.freeze([[0, 1, 3], [1, 2, 3], [0, 2, 4]]),
    misses: Object.freeze([[1, 2, 0, 11], [1, 7, 0, 14], [2, 0, 1, 10], [2, 4, 1, 13], [2, 2, 0, 12]]),
    stampY: 84, tieBow: 30,
    // Enter, in ms: the columns, the reader with its lens covered, then one stamp a column.
    colsAt: 400, readerAt: 1000, capAt: 1500, stampAt: 2200, perStamp: 450,
    // Click 1, in ms: the reader's dot lands at 0.50. Click 3: the nine squares slide out.
    dotAt: 1900, liftAt: 1500,
    // Click 2, in ms: the arcs light up one by one, then the square slides. The title's
    // answer lands from `answerBeat` times its size.
    arcAt: 300, perArc: 70, slideAfter: 500, answerBeat: 1.3,
  });
  const POOL_QUESTIONS = Object.freeze(POOL.follows.map((follows, c) => Object.freeze({ label: `Question ${c + 1}`, follows, traces: POOL.traces })));
  // The question columns of the slide on AUROC (kit.cols), in this slide's size.
  const COLS = Object.freeze({
    key: 'pool', cls: 'p3-svg', width: 660, height: 392, x: Object.freeze([112, 330, 548]),
    box: Object.freeze({ w: 104, top: 36, h: 320, r: 16 }), labelY: 24, dotTop: 106, pitch: 17, r: 7, gap: 2, bend: 0.4,
    legendY: 384, questions: POOL_QUESTIONS,
  });
  // The score the prompt-only reader stamps on a column: that question's follow rate.
  const poolRate = (c) => `${Math.round((POOL.follows[c] / POOL.traces) * 100)}%`;
  // What the sketch itself scores, pooled: every follower against every resister of the
  // three columns, a trace's score being its column's follow rate. The reader ranks a pair
  // correctly if the follower's column is followed more often; a pair inside a column (or
  // between columns of one rate) is a tie and counts a half. Rates are compared as whole
  // numbers, so that a tie is exact.
  const poolAuroc = (questions) => {
    const cells = questions.flatMap((f) => questions.map((r) => {
      const ahead = f.follows * r.traces - r.follows * f.traces;
      return { pairs: f.follows * (r.traces - r.follows), won: ahead > 0 ? 1 : ahead === 0 ? 0.5 : 0 };
    }));
    const sum = (of) => cells.reduce((acc, cell) => acc + of(cell), 0);
    return sum((cell) => cell.pairs * cell.won) / sum((cell) => cell.pairs);
  };
  const POOL_AUROC = poolAuroc(POOL_QUESTIONS);
  if (two(POOL_AUROC) !== t('pooled.prompt_only')) {
    throw new Error(`the three columns of slide 9 score ${POOL_AUROC.toFixed(4)} pooled, counted off their dots; the slide prints ${t('pooled.prompt_only')} beside them`);
  }
  // Inside a column: a follower and a resister near where the two kinds meet, joined on the
  // side of the column that no pair across columns touches (the last column: its right).
  // Every tie bows out by the same `tieBow` pixels, however far apart its two dots are.
  const poolTie = (c) => {
    const follows = POOL.follows[c];
    const a = Math.max(0, follows - 2);
    const b = Math.min(POOL.traces - 1, follows + 1);
    return kit.colsArc({ ...COLS, bow: POOL.tieBow / ((b - a) * COLS.pitch) }, [c, a], [c, b], { side: c === POOL.follows.length - 1 ? 1 : -1 });
  };
  // Across columns: a follower (column i, row a) against a resister (column j, row b). The
  // prompt-only reader ranks the pair correctly when question i is followed more often than
  // question j. The pairs of a bundle are spread evenly over both columns, so that their
  // arcs do not cross.
  const spread = (items, n) => util.range(n).map((k) => items[Math.round((k * (items.length - 1)) / (n - 1))]);
  const POOL_PAIRS = Object.freeze([
    ...POOL.bundles.flatMap(([i, j, n]) => {
      const resisters = spread(util.range(POOL.traces).slice(POOL.follows[j]), n);
      return spread(util.range(POOL.follows[i]), n).map((a, k) => ({ i, j, a, b: resisters[k] }));
    }),
    ...POOL.misses.map(([i, a, j, b]) => ({ i, j, a, b })),
  ].map((pair) => Object.freeze({ ...pair, right: POOL.follows[pair.i] > POOL.follows[pair.j] })));
  if (POOL_PAIRS.some((pair) => pair.a >= POOL.follows[pair.i] || pair.b < POOL.follows[pair.j] || pair.b >= POOL.traces)) throw new Error('a pair of slide 9 no longer joins a follower and a resister');
  if (POOL_PAIRS.some((pair, n) => pair.right !== n < POOL_PAIRS.length - POOL.misses.length)) throw new Error('the arcs of slide 9 are no longer the pairs ranked correctly, then the pairs ranked wrongly');
  const POOL_RIGHT = POOL_PAIRS.filter((pair) => pair.right).length;
  const poolCross = ({ i, j, a, b }) => kit.colsArc(COLS, [i, a], [j, b]).d;
  // Under the dots: the web of pairs as the slide on AUROC left it, the same arcs in the
  // color of how the reader ranks them, and the pair that ties inside each column.
  const poolUnder = () => `
    ${POOL_PAIRS.map((pair) => `<path class="p3-pool__web" d="${poolCross(pair)}"/>`).join('')}
    ${POOL_PAIRS.map((pair) => `<path class="p3-pool__cross${pair.right ? '' : ' is-wrong'}" pathLength="1" d="${poolCross(pair)}"/>`).join('')}
    ${POOL_QUESTIONS.map((_, c) => `<path class="p3-pool__tie" pathLength="1" d="${poolTie(c).d}"/>`).join('')}`;
  const poolOver = () => `
    ${POOL_QUESTIONS.map((_, c) => {
    const { mid } = poolTie(c);
    return `
        <text class="p3-pool__stamp p3-pop" data-stamp="${c}" x="${COLS.x[c]}" y="${POOL.stampY}">${poolRate(c)}</text>
        <g class="p3-pool__equal p3-pop"><circle cx="${mid.x}" cy="${mid.y}" r="14"/><text x="${mid.x}" y="${mid.y + 8}">=</text></g>`;
  }).join('')}
    ${[0, 1].map((c) => `<text class="p3-pool__gt p3-pop" x="${(COLS.x[c] + COLS.x[c + 1]) / 2}" y="${POOL.stampY}">&gt;</text>`).join('')}
    <g class="p3-pool__arckey">
      <line class="p3-pool__cross" x1="280" x2="304" y1="${COLS.legendY - 8}" y2="${COLS.legendY - 8}"/>
      <text x="312" y="${COLS.legendY}">ranked correctly</text>
      <line class="p3-pool__cross is-wrong" x1="548" x2="572" y1="${COLS.legendY - 8}" y2="${COLS.legendY - 8}"/>
      <text x="580" y="${COLS.legendY}">wrongly</text>
    </g>`;

  // The chart is the paper's Fig. 2a drawn from the facts: an AUROC axis from 0.5 to 0.9, the
  // prompt-only row at the bottom and the nine readers above it, each a dot (within
  // question), a square (pooled) and a line between the two. No ranks and no arrows between
  // rows: the paper could not tell whether pooling reorders the readers. The prompt-only
  // reader's range by model and its value at the traces' natural frequency are not drawn:
  // the pooled 0.62 carries the result.
  const PC = Object.freeze({
    width: 1040, height: 448, x0: 340, perUnit: 1600, from: 0.5,
    ticks: Object.freeze([0.5, 0.6, 0.7, 0.8, 0.9]),
    // From the top: the legend of the two marks, the nine readers, the prompt-only reader
    // with its two values over its marks, the axis.
    legendY: 20, rowY: 56, pitch: 34, heroY: 366, valueY: 344, axisY: 396, tickY: 428,
    nameX: 804, heroNameX: 324, mark: 6, heroMark: 9,
    // The note on the three forced readers, in the empty left of the rows under them.
    asideX: 348, asideRow: 2,
  });
  const pcX = (value) => round3(PC.x0 + (value - PC.from) * PC.perUnit);
  const pcRow = (i) => PC.rowY + i * PC.pitch;
  const pcSquare = (x, y, half, cls, attrs = '') => `<rect class="${cls}" x="${round3(x - half)}" y="${y - half}" width="${half * 2}" height="${half * 2}" ${attrs}/>`;
  // The legend says what a dot and a square are on every row of the chart, the nine readers'
  // as well as the prompt-only reader's: its marks have the color of neither. The three
  // forced readers carry a star: slide 11 sets them aside, and the note says so here, where
  // the room first sees that two of them score highest.
  const poolChart = () => {
    const hero = { within: pcX(v('pooled.prompt_only_within')), pooled: pcX(v('pooled.prompt_only')) };
    const y = PC.heroY;
    const legend = PC.legendY;
    return `
    <svg class="p3-svg p3-pool__chart" viewBox="0 0 ${PC.width} ${PC.height}" width="${PC.width}" height="${PC.height}">
      <g class="p3-pool__frame">
        ${PC.ticks.map((tick) => `
          <line class="p3-grid" x1="${pcX(tick)}" x2="${pcX(tick)}" y1="${tick >= 0.8 ? legend + 20 : y - 28}" y2="${PC.axisY}"/>
          <line class="p3-axis" x1="${pcX(tick)}" x2="${pcX(tick)}" y1="${PC.axisY}" y2="${PC.axisY + 8}"/>
          <text class="p3-num p3-mid" x="${pcX(tick)}" y="${PC.tickY}">${tick.toFixed(1)}</text>`).join('')}
        <line class="p3-axis" x1="${PC.x0}" x2="${pcX(PC.ticks[PC.ticks.length - 1])}" y1="${PC.axisY}" y2="${PC.axisY}"/>
        <text class="p3-end" x="300" y="${PC.tickY}">AUROC</text>
        <text class="p3-pool__name is-hero" x="${PC.heroNameX}" y="${y + 10}">Prompt-only reader</text>
      </g>
      <g class="p3-pool__legend" data-legend="within">
        <circle cx="${PC.x0 + 10}" cy="${legend}" r="10"/>
        <text x="${PC.x0 + 32}" y="${legend + 10}">within question</text>
      </g>
      <g class="p3-pool__legend" data-legend="pooled">
        ${pcSquare(PC.x0 + 318, legend, 10, 'p3-pool__glyph')}
        <text x="${PC.x0 + 340}" y="${legend + 10}">pooled</text>
      </g>
      <g class="p3-pool__aside">
        <text x="${PC.asideX}" y="${pcRow(PC.asideRow) + 8}">* set aside</text>
        <text x="${PC.asideX}" y="${pcRow(PC.asideRow) + 36}">(slide 11)</text>
      </g>
      <line class="p3-pool__rise is-hero" x1="${hero.within}" x2="${hero.within}" y1="${y}" y2="${y}"/>
      <circle class="p3-pool__within is-hero p3-pop" cx="${hero.within}" cy="${y}" r="${PC.heroMark}"/>
      ${pcSquare(hero.within, y, PC.heroMark, 'p3-pool__pooled is-hero p3-pop')}
      <text class="p3-pool__value p3-num p3-mid" data-value="within" x="${hero.within}" y="${PC.valueY}">${t('pooled.prompt_only_within')}</text>
      <text class="p3-pool__value p3-pool__lift p3-num p3-mid p3-pop" x="${hero.pooled}" y="${PC.valueY}"></text>
      ${READERS.map((key, i) => {
    const x = pcX(v(`reader.${key}.within`));
    return `
        <text class="p3-pool__name" data-name="${key}" x="${PC.nameX}" y="${pcRow(i) + 10}">${t(`reader.${key}.name`)}${KEPT.includes(key) ? '' : '<tspan class="p3-pool__star">*</tspan>'}</text>
        <line class="p3-pool__rise" data-rise="${key}" x1="${x}" x2="${x}" y1="${pcRow(i)}" y2="${pcRow(i)}"/>
        <circle class="p3-pool__within p3-pop" data-within="${key}" cx="${x}" cy="${pcRow(i)}" r="${PC.mark}"/>
        ${pcSquare(x, pcRow(i), PC.mark, 'p3-pool__pooled', `data-pooled="${key}"`)}`;
  }).join('')}
    </svg>`;
  };
  const RISE = `${t('pooled.reader_rise_min')} to ${t('pooled.reader_rise_max')}`;
  // The spread that the cue prints is the distance between the two ends that the caption
  // prints, and the largest rise is as large as it: the cue's comparison.
  if (three(v('readers.within_max') - v('readers.within_min')) !== t('p3.reader_spread')) throw new Error('the nine readers of slide 9 no longer span the spread that its cue prints');
  if (v('pooled.reader_rise_max') < v('p3.reader_spread')) throw new Error('the largest rise under pooling on slide 9 is no longer as large as the spread of the nine readers');
  // The caption of the entrance says what the reader is shown and stays through click 1,
  // which adds its second line: one score per question is why every pair inside a question
  // is a tie.
  const POOL_NOTES = Object.freeze({
    reader: Object.freeze([
      'Shown only the question and the hint, it gives every trace of a question one score: how often that question is followed.',
      `Within question every pair is a tie: ${t('pooled.prompt_only_within')}.`,
    ]),
    across: 'Across questions it wins: a follower from a usually followed question, against a resister from a usually resisted one.',
    // What pooling does to them is the cue of that click, which stays to the last state; the
    // two ends printed here are 'p3.reader_spread' apart, the number the cue compares with.
    nine: `Nine real readers score ${t('readers.within_min')} to ${t('readers.within_max')} within question.`,
  });
  // Under the recommendation: its one term that the talk has not used ("base rate"), in the
  // words in which the caption of the entrance says what the columns' scores are; then
  // 'pooled.only_there', 'pooled.known' and 'scope.size', in the talk's words, on a line of
  // their own.
  const POOL_LIMIT = 'Base rate: how often a question is followed.<br>Shown on this task only, on questions chosen because the hint moves the answer. The mechanism was known; we add its size.';

  Deck.register({
    id: 'p3-pooled',
    part: PART,
    kicker: RESULTS,
    title: `What does a reader score if it never sees the reasoning? <em>Pooled, ${t('pooled.prompt_only')}</em>`,
    cues: [
      { text: `Pooling adds ${RISE}; nine readers span ${t('p3.reader_spread')}`, step: 3, at: POOL.liftAt },
    ],
    // Jia et al. is cited for what the last click calls known: they write the pooled AUROC
    // as a mix of within- and between-prompt AUROCs, with a prompt-only score at 1/2 within
    // (paper/tmlr/sections/01_intro.tex:41-42).
    cite: [{ src: 'paper', where: 'Sec. 4; Table 2; Fig. 2a; App. F' }, { src: 'jia2026', where: 'pooled vs within' }],
    figure: ['data', 'schematic'],
    html: `
      <div class="p3-res p3-pool">
        ${kit.resultHead(1, EXPLORATORY)}
        <div class="p3-res__picture">
          <div class="p3-pool__left">
            <div class="p3-pool__reader">
              <span class="p3-pool__who">Prompt-only reader</span>
              <span class="p3-pool__lens">${kit.lens({ key: 'covered' })}<i class="p3-pool__cap"></i></span>
              <span class="p3-pool__capnote">never sees the reasoning</span>
            </div>
            ${kit.cols({ ...COLS, under: poolUnder(), over: poolOver() })}
          </div>
          <div class="p3-pool__right">
            ${poolChart()}
          </div>
        </div>
        ${captionHtml({ notes: POOL_NOTES, rec: 1, limit: POOL_LIMIT })}
      </div>`,
    setup: (ctx) => {
      const { fact, dur } = ctx;
      const within = fact('pooled.prompt_only_within');
      const pooled = fact('pooled.prompt_only');
      const hero = { dot: ctx.q('.p3-pool__within.is-hero'), square: ctx.q('.p3-pool__pooled.is-hero'), rise: ctx.q('.p3-pool__rise.is-hero') };

      // Enter: the columns of the slide on AUROC, the reader with its lens covered (it never
      // sees the reasoning), and one score stamped on each column: how often that question
      // is followed.
      const enter = ctx.step({ label: 'result 1 of 3: the prompt-only reader' });
      kit.enterResult(enter);
      note(enter, 'reader', { at: 300 });
      enter.show('.dk-cols__label', { at: POOL.colsAt, stagger: 80, rise: 0 });
      enter.tween('.dk-cols__col', { opacity: [0, 1] }, { at: POOL.colsAt, stagger: 80 });
      enter.tween('.dk-cols > .dk-cols__dot', { opacity: [0, 1] }, { at: POOL.colsAt + 100, stagger: 15, dur: dur.micro });
      enter.tween('.p3-pool__web', { opacity: [0, 1] }, { at: POOL.colsAt + 400, dur: dur.move });
      enter.tween('.dk-cols__legend', { opacity: [0, 1] }, { at: POOL.colsAt + 500 });
      enter.tween('.p3-pool__frame', { opacity: [0, 1] }, { at: 700 });
      enter.show('.p3-pool__who', { at: POOL.readerAt, rise: 0 });
      enter.tween('.p3-pool__lens', { opacity: [0, 1] }, { at: POOL.readerAt + 100 });
      enter.tween('.p3-pool__cap', { opacity: [0, 1], y: [-20, 0] }, { at: POOL.capAt, dur: dur.enter });
      enter.show('.p3-pool__capnote', { at: POOL.capAt + 300, rise: 0 });
      enter.tween('.p3-pool__stamp', { opacity: [0, 1], scale: [1.8, 1] }, { at: POOL.stampAt, stagger: POOL.perStamp, dur: dur.enter });
      enter.hold(300);

      // Click 1: within a question every trace carries the same score, so a follower and a
      // resister tie. The reader's dot lands at 0.50.
      const tie = ctx.step({ label: 'within question: a coin flip' });
      tie.tween('.p3-pool__tie', { opacity: [0, 1], 'stroke-dashoffset': [1, 0] }, { at: 300, stagger: 250, dur: dur.move });
      tie.tween('.p3-pool__equal', POP, { at: 900, stagger: 250, dur: dur.enter, ease: 'back' });
      tie.tween('[data-legend="within"]', { opacity: [0, 1] }, { at: POOL.dotAt - dur.micro });
      tie.tween(hero.dot, { opacity: [0, 1], scale: [2.4, 1] }, { at: POOL.dotAt, dur: dur.enter });
      tie.tween('[data-value="within"]', { opacity: [0, 1] }, { at: POOL.dotAt, dur: dur.enter });
      tie.tween('[data-says-line="reader:1"]', { opacity: [0, 1] }, { at: POOL.dotAt, dur: dur.enter });
      tie.hold(300);

      // Click 2, wow 2: pairs reach across questions. The arcs light up as ranked correctly
      // (two, the other way round, as ranked wrongly: it does not win every pair), the
      // pooled square slides out of the dot to 0.62, its value counting up over where it
      // lands, and the title gets its answer, in red, with a beat and a glow.
      const wow = ctx.step({ label: 'wow 2: pooled, it scores well above chance' });
      note(wow, 'across', { leaves: 'reader' });
      const lit = { dur: dur.move, stagger: POOL.perArc };
      const missAt = POOL.arcAt + POOL_RIGHT * POOL.perArc;
      wow.tween('path.p3-pool__cross:not(.is-wrong)', { opacity: [0, 1], 'stroke-dashoffset': [1, 0] }, { ...lit, at: POOL.arcAt });
      wow.tween('.p3-pool__gt', POP, { at: POOL.arcAt + 400, stagger: 500, dur: dur.enter, ease: 'back' });
      wow.tween('path.p3-pool__cross.is-wrong', { opacity: [0, 1], 'stroke-dashoffset': [1, 0] }, { ...lit, at: missAt });
      wow.tween('.p3-pool__arckey', { opacity: [0, 1] }, { at: missAt });
      const slideAt = POOL.arcAt + POOL_PAIRS.length * POOL.perArc + POOL.slideAfter;
      const landed = slideAt + dur.reveal;
      const gliding = { at: slideAt, dur: dur.reveal, ease: 'inOut' };
      wow.tween('[data-legend="pooled"]', { opacity: [0, 1] }, { at: slideAt - dur.enter });
      wow.tween([hero.square, hero.rise, ctx.q('.p3-pool__lift')], { opacity: [0, 1] }, { at: slideAt - dur.micro, dur: dur.micro });
      wow.tween(hero.square, { 'attr:x': [pcX(within.value) - PC.heroMark, pcX(pooled.value) - PC.heroMark] }, gliding);
      wow.tween(hero.rise, { 'attr:x2': [pcX(within.value), pcX(pooled.value)] }, gliding);
      kit.countTo(wow, '.p3-pool__lift', 'pooled.prompt_only', { ...gliding, from: within.value, format: two });
      beat(wow, hero.square, landed);
      beat(wow, '.p3-pool__lift', landed);
      const answer = ctx.q('.dk-title em');
      const answerAt = landed + 200;
      wow.tween(answer, { opacity: [0, 1] }, { at: answerAt, dur: dur.enter });
      wow.tween(answer, { scale: [POOL.answerBeat, 1] }, { at: answerAt, dur: dur.move, ease: 'out' });
      wow.tween(answer, { '--p3-glow': [1, 0] }, { at: answerAt + dur.enter, dur: dur.reveal });
      wow.hold(300);

      // Click 3: the nine readers, in the order of the paper's Fig. 2a. Their dots land
      // within question; then every square slides out to its pooled value.
      const nine = ctx.step({ label: 'the nine readers rise too' });
      note(nine, 'nine', { leaves: 'across' });
      READERS.forEach((key, i) => {
        const from = pcX(fact(`reader.${key}.within`).value);
        const to = pcX(fact(`reader.${key}.pooled`).value);
        const at = 300 + i * 90;
        const lift = { at: POOL.liftAt + i * 40, dur: dur.move, ease: 'inOut' };
        const square = ctx.q(`[data-pooled="${key}"]`);
        const line = ctx.q(`[data-rise="${key}"]`);
        nine.tween(ctx.q(`[data-name="${key}"]`), { opacity: [0, 1] }, { at, dur: dur.micro });
        nine.tween(ctx.q(`[data-within="${key}"]`), { opacity: [0, 1], scale: [2.4, 1] }, { at: at + 100, dur: dur.enter });
        nine.tween([square, line], { opacity: [0, 1] }, { at: lift.at - dur.micro, dur: dur.micro });
        nine.tween(square, { 'attr:x': [from - PC.mark, to - PC.mark] }, lift);
        nine.tween(line, { 'attr:x2': [from, to] }, lift);
      });
      nine.tween('.p3-pool__aside', { opacity: [0, 1] }, { at: POOL.liftAt + dur.move + 300 });
      nine.hold(300);

      // Click 4: the columns step back and the chart stays; the first recommendation, then
      // what limits it.
      conclude(ctx.step({ label: 'recommendation 1' }), { leaves: 'nine', limit: true, dims: '.p3-pool__left' });
    },
  });

  // ---------------------------------------------------------------- slide 10: result 2, the curve in K
  // The resampling AUROC as a curve in K (the paper's Fig. 1), and what its rise does to a
  // reader's standing. The standing is drawn as a gauge: a ruler from guessing (0.5) to the
  // reference, with one reader's level fixed on it. Built from 2 continuations the
  // reference lies just above the reader (click 2); built from 15 it lies higher, the ruler
  // stretches under the reader's mark, and the reading falls from 96% to 81% (click 3,
  // wow 3). The two ends of that comparison stop on a click each, as SPEC.md section 2 asks
  // of every comparison.
  // The gauge uses another reference than the curve: the one behind the paper's normalized
  // AUROCs, against a held-out continuation's ending ('k.ceiling_2', 'k.ceiling_15'). Its two
  // levels are labeled by their number of continuations; no point of the curve moves to them.
  // The two halves say which label they are scored against, in the chips that slide 11 uses
  // for its two counts, and the gauge prints the three AUROCs its reading is made of: the
  // reader's 0.833 and the references 0.848 and 0.912, all against the held-out label, so
  // that (0.833 - 0.5) / (0.848 - 0.5) and (0.833 - 0.5) / (0.912 - 0.5) can be checked on
  // screen. The larger reference is from 15 and not from 16: one of the 16 continuations is
  // the label ('p3.heldout_others'). The curve is drawn from K = 2, where the talk starts;
  // the point at K = 1 of the paper's figure is left out.
  // The two halves are scored against two labels, and the curve's 0.846 at K = 2 stands
  // beside the gauge's reference from 2, 0.848: from the click that brings the gauge each
  // half stands in a frame under its label's chip, gray for the trace's own ending and
  // amber for the held-out continuation, and the reader's 0.833 says which label it is
  // scored against (it is above the 0.803 to 0.828 that slides 3 and 11 give for the six
  // readers against the trace's own ending). Under the reader's level the gauge writes out
  // its reading with the three numbers beside it: (0.833 - 0.5) / (0.848 - 0.5) = 96%. On
  // the last click the reading and the line under it stay at full strength.
  // The frames were not enough: the curve's 0.846 and 0.915 (own ending) were still read as
  // the gauge's 0.848 and 0.912 (held-out label) written wrongly. So the values on the curve
  // leave when the gauge arrives; the curve, its axes and the gain of its last doubling
  // stay, and the only AUROCs printed in the picture are then the gauge's.
  // Two sets of numbers that nearly agree still stood side by side with nothing to say how
  // they belong together (the title's first half rests on the curve, its second on the
  // gauge): the gauge's chips open on "Same rise, with", so that the right half reads
  // as the rise of the curve under the other label (0.848 from 2 to 0.912 from 15, against
  // the curve's 0.846 at K = 2 and 0.915 at K = 16).
  // The K axis doubles from tick to tick: its label says "(log scale)", and a short tick
  // stands at every K between the labeled ones.
  // The reading is written out twice, one fraction for each reference, and both stand in
  // the last state, the first one stepped back: (0.833 - 0.5) / (0.848 - 0.5) = 96% over
  // (0.833 - 0.5) / (0.912 - 0.5) = 81%. With one fraction whose reference was exchanged,
  // the 96% was gone from the picture that the title's "96% of the way becomes 81%" rests on.
  // On click 3 the higher reference is named and the second fraction gets its reference
  // before the ruler moves: the reading starts to fall only then. Falling beside nothing
  // but "reference from 2: 0.848", it read as 81% of the way to the reference from 2.
  // The points are one cell each, lit while above the reference and left as a ring once the
  // reference has passed them: a key under the cells says so, a glyph and a word or two for
  // each state, the ring's when the first ring appears.
  // The points above the reference are counted in the "7 resampled models": slide 4 said
  // that 7 of the 8 models are in the scored sample (paper/tmlr/sections/03_tasks.tex:13-14).
  const KC = Object.freeze({
    width: 720, height: 448, x0: 112, first: 24, octave: 176, top: 56, bottom: 368, lo: 0.75, hi: 0.95,
    yTicks: Object.freeze([0.75, 0.80, 0.85, 0.90, 0.95]),
    xTicks: Object.freeze([2, 4, 8, 16]),
    // The points that carry their value: the fact behind each.
    named: Object.freeze({ 2: 'k.u2', 4: 'k.u4', 8: 'k.u8', 16: 'k.u16' }),
    // Click 1, in ms: the curve is drawn from K = 2 to 16.
    drawAt: 500, drawDur: 2400,
  });
  const kcX = (k) => round3(KC.x0 + KC.first + (Math.log2(k) - 1) * KC.octave);
  const kcY = (value) => round3(KC.bottom - ((value - KC.lo) / (KC.hi - KC.lo)) * (KC.bottom - KC.top));
  const KC_POINTS = Object.freeze(v('k.curve').filter(([k]) => k >= KC.xTicks[0]).map(([k, value]) => Object.freeze({ k, value, x: kcX(k), y: kcY(value) })));
  const kcPoint = (k) => KC_POINTS.find((p) => p.k === k);
  // The curve, and how far along it each point lies (0 to 1).
  const KC_LINE = (() => {
    const drawn = KC_POINTS;
    const lengths = drawn.map((p, i) => (i ? Math.hypot(p.x - drawn[i - 1].x, p.y - drawn[i - 1].y) : 0));
    const total = lengths.reduce((sum, n) => sum + n, 0);
    const along = lengths.reduce((acc, n) => [...acc, (acc.length ? acc[acc.length - 1] : 0) + n], []);
    return Object.freeze({
      d: drawn.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' '),
      share: Object.freeze(Object.fromEntries(drawn.map((p, i) => [p.k, along[i] / total]))),
    });
  })();
  const curveChart = () => {
    const last = kcPoint(16);
    const before = kcPoint(8);
    return `
    <svg class="p3-svg p3-kc" viewBox="0 0 ${KC.width} ${KC.height}" width="${KC.width}" height="${KC.height}">
      <g class="p3-kc__frame">
        ${KC.yTicks.map((tick) => `
          <line class="p3-grid" x1="${KC.x0}" x2="${kcX(16)}" y1="${kcY(tick)}" y2="${kcY(tick)}"/>
          <text class="p3-num p3-end" x="${KC.x0 - 12}" y="${kcY(tick) + 8}">${two(tick)}</text>`).join('')}
        ${KC_POINTS.filter((p) => !KC.xTicks.includes(p.k)).map((p) => `<line class="p3-axis" x1="${p.x}" x2="${p.x}" y1="${KC.bottom}" y2="${KC.bottom + 4}"/>`).join('')}
        ${KC.xTicks.map((k) => `
          <line class="p3-axis" x1="${kcX(k)}" x2="${kcX(k)}" y1="${KC.bottom}" y2="${KC.bottom + 8}"/>
          <text class="p3-num p3-mid" x="${kcX(k)}" y="${KC.bottom + 36}">${k}</text>`).join('')}
        <line class="p3-axis" x1="${KC.x0}" x2="${kcX(16)}" y1="${KC.bottom}" y2="${KC.bottom}"/>
        <line class="p3-axis" x1="${KC.x0}" x2="${KC.x0}" y1="${KC.top}" y2="${KC.bottom}"/>
        <text class="p3-mid" x="${(KC.x0 + kcX(16)) / 2}" y="${KC.bottom + 68}">K, continuations (log scale)</text>
        <text class="p3-mid" transform="rotate(-90 24 ${(KC.top + KC.bottom) / 2})" x="24" y="${(KC.top + KC.bottom) / 2 + 8}">resampling AUROC</text>
      </g>
      <path class="p3-kc__line" pathLength="1" d="${KC_LINE.d}"/>
      <g class="p3-kc__step">
        <line class="p3-kc__level" x1="${before.x}" x2="${last.x + 28}" y1="${before.y}" y2="${before.y}"/>
        <line class="p3-kc__gain" x1="${last.x + 20}" x2="${last.x + 20}" y1="${before.y}" y2="${last.y}"/>
        <text class="p3-end" x="${last.x + 28}" y="${before.y + 44}">K = 8 to 16: <tspan class="p3-num">+${t('k.step_8_16')}</tspan></text>
      </g>
      ${KC_POINTS.map((p) => `<circle class="p3-kc__point p3-pop${KC.named[p.k] ? ' is-named' : ''}" data-k="${p.k}" cx="${p.x}" cy="${p.y}" r="${KC.named[p.k] ? 8 : 5}"/>`).join('')}
      ${Object.entries(KC.named).map(([k, key]) => {
    const p = kcPoint(Number(k));
    return Number(k) === 2
      ? `<text class="p3-kc__value p3-num" data-value="${k}" x="${p.x + 16}" y="${p.y + 36}">${t(key)}</text>`
      : `<text class="p3-kc__value p3-num p3-end" data-value="${k}" x="${p.x + 8}" y="${p.y - 18}">${t(key)}</text>`;
  }).join('')}
    </svg>`;
  };

  // The gauge. `from` is guessing; the ruler runs from there up to the reference, and its
  // quarter marks spread when the reference rises. The reader's mark does not move.
  const GAUGE = Object.freeze({
    width: 520, height: 408, x: 84, bar: 72, base: 364, perUnit: 840, from: 0.5,
    quarters: Object.freeze([0.25, 0.5, 0.75]),
    points: Object.freeze({ cols: 21 }),
    // Click 2, in ms: once the chart has made room, the ruler, the reader's level, the
    // reference, then the count.
    scaleAt: 900, growAt: 1300, growDur: 1200, countAt: 3000, perCell: 40,
    // Click 3, in ms: the higher reference is named and written into the second fraction
    // (`nameAt`); only then the reference climbs and the reading falls; then the points that
    // were above it are counted again. `was`: how far what belongs to the reference from 2
    // steps back (its label, its fraction).
    nameAt: 300, climbAt: 1300, recountAfter: 1700, was: 0.6,
  });
  const gaugeY = (value) => round3(GAUGE.base - (value - GAUGE.from) * GAUGE.perUnit);
  // The gauge's reader, by the name the charts of slides 9 and 11 give it.
  const GAUGE_READER = t('reader.opus_in.name');
  // What "of the way" is, written out with the numbers on the gauge: the reader's AUROC
  // minus guessing over the reference minus guessing. One fraction for the reference from 2
  // continuations and, `pitch` pixels under it, one for the reference from 15; the result
  // of a fraction (`how-is`) can arrive after its two lines.
  const HOW = Object.freeze({
    width: 158, lead: 28, pitch: 92,
    refs: Object.freeze([[2, 'k.ceiling_2', 'reader.opus_in.norm2'], [15, 'k.ceiling_15', 'reader.opus_in.norm15']]),
  });
  const gaugeHow = (x, y) => {
    const minus = `− ${GAUGE.from}`;
    return HOW.refs.map(([m, ref, share], i) => {
      const top = y + i * HOW.pitch;
      return `
      <g class="p3-gauge__how" data-how="${m}">
        <text class="p3-num" x="${x}" y="${top}"><tspan class="p3-gauge__how-reader">${t('p3.opus_in_heldout')}</tspan> ${minus}</text>
        <line class="p3-gauge__how-bar" x1="${x}" x2="${x + HOW.width}" y1="${top + 12}" y2="${top + 12}"/>
        <text class="p3-num p3-gauge__how-ref" x="${x}" y="${top + 12 + HOW.lead}">${t(ref)}</text>
        <text class="p3-num p3-end" x="${x + HOW.width}" y="${top + 12 + HOW.lead}">${minus}</text>
        <text class="p3-num p3-gauge__how-is" x="${x + HOW.width + 12}" y="${top + 20}">= ${percent(share)}</text>
      </g>`;
    }).join('');
  };
  const gaugeHtml = () => {
    const { x, bar, base } = GAUGE;
    const low = gaugeY(v('k.ceiling_2'));
    const high = gaugeY(v('k.ceiling_15'));
    const level = gaugeY(v('p3.opus_in_heldout'));
    return `
    <svg class="p3-svg p3-gauge__svg" viewBox="0 0 ${GAUGE.width} ${GAUGE.height}" width="${GAUGE.width}" height="${GAUGE.height}">
      <g class="p3-gauge__scale">
        <rect class="p3-gauge__ruler" x="${x}" y="${low}" width="${bar}" height="${base - low}"/>
        ${GAUGE.quarters.map((q) => `
          <line class="p3-gauge__tick" data-quarter="${q}" x1="${x}" x2="${x + bar}" y1="${base}" y2="${base}"/>
          <text class="p3-gauge__quarter p3-num p3-end" data-quarter="${q}" x="${x - 20}" y="${base}">${q * 100}%</text>`).join('')}
        <line class="p3-gauge__top" x1="${x - 12}" x2="${x + bar + 12}" y1="${low}" y2="${low}"/>
        <line class="p3-gauge__base" x1="${x - 12}" x2="${x + bar + 12}" y1="${base}" y2="${base}"/>
        <text class="p3-gauge__full p3-num p3-end" x="${x - 20}" y="${low + 8}">100%</text>
        <text class="p3-num p3-end" x="${x - 20}" y="${base + 8}">0%</text>
        <text class="p3-mid" x="${x + bar / 2}" y="${base + 36}">guessing (0.5)</text>
      </g>
      <line class="p3-gauge__ghost" x1="${x - 12}" x2="${x + bar + 12}" y1="${low}" y2="${low}"/>
      <line class="p3-gauge__ghost" data-aim x1="${x - 12}" x2="${x + bar + 12}" y1="${high}" y2="${high}"/>
      <g class="p3-gauge__level">
        <rect class="p3-gauge__fill" x="${x}" y="${base}" width="${bar}" height="0"/>
        <line class="p3-gauge__mark" x1="${x - 12}" x2="${x + bar + 12}" y1="${base}" y2="${base}"/>
      </g>
      <text class="p3-gauge__ref" data-ref="15" x="${x + bar + 24}" y="${high + 8}">reference from ${t('p3.heldout_others')}: <tspan class="p3-num">${t('k.ceiling_15')}</tspan></text>
      <text class="p3-gauge__ref" data-ref="2" x="${x + bar + 24}" y="${low - 4}">reference from 2: <tspan class="p3-num">${t('k.ceiling_2')}</tspan></text>
      <text class="p3-gauge__who" x="${x + bar + 24}" y="${level + 32}">${GAUGE_READER}: <tspan class="p3-num">${t('p3.opus_in_heldout')}</tspan></text>
      <text class="p3-gauge__who" x="${x + bar + 24}" y="${level + 60}">(held-out label)</text>
      ${gaugeHow(x + bar + 24, level + 128)}
    </svg>`;
  };
  const SHARE = Object.freeze({ at2: percent('reader.opus_in.norm2'), at15: percent('reader.opus_in.norm15') });
  // The curve needs no caption: its last doubling is labeled on the chart ("K = 8 to 16:
  // +0.011"), and the cue of click 1 says that it is still rising.
  const CURVE_NOTES = Object.freeze({
    // 'p3.heldout_others': why the reference is from 2 and from 15 of the 16 continuations.
    gauge: `One reader, <b>${GAUGE_READER}</b>, scored against the ending of 1 of ${t('task.sample_k')} continuations; the reference uses 2 of the other ${t('p3.heldout_others')}.<span class="p3-curve__more"> Then all ${t('p3.heldout_others')}.</span>`,
  });
  // The limit of this result is its third cue ('k.not_bound', in the talk's words), which
  // stays in the cue row under the recommendation; the points above the reference show it.

  Deck.register({
    id: 'p3-curve',
    part: PART,
    kicker: RESULTS,
    title: `With more continuations the reference keeps rising, <em>so ${SHARE.at2} of the way becomes ${SHARE.at15}</em>`,
    cues: [
      `Resampling AUROC from K = 2 continuations: ${t('k.u2')}`,
      { text: `At K = 16 it is ${t('k.u16')}, and still rising`, step: 1, at: KC.drawAt + KC.drawDur },
      { text: 'A value at one K is an estimate, not a bound', step: 3, at: GAUGE.climbAt + DUR.reveal + GAUGE.recountAfter },
    ],
    cite: [{ src: 'paper', where: 'Sec. 5; Fig. 1; Table 2, 12' }],
    figure: ['data', 'schematic'],
    html: `
      <div class="p3-res p3-curve">
        ${kit.resultHead(2)}
        <div class="p3-res__picture">
          <div class="p3-curve__left">
            <i class="p3-curve__frame" data-frame="own"></i>
            ${curveChart()}
            <div class="p3-tags p3-curve__tags">${labelChip('own')}${kit.standing('measured curve')}</div>
          </div>
          <div class="p3-gauge">
            <i class="p3-curve__frame" data-frame="held"></i>
            <div class="p3-tags p3-gauge__tags"><span class="p3-gauge__same">Same rise, with</span>${labelChip('held')}<span class="dk-chip">${EXPLORATORY}</span></div>
            ${gaugeHtml()}
            <div class="p3-gauge__side">
              <p class="p3-gauge__reading"><b class="p3-gauge__share"></b><span>of the way</span></p>
              <p class="p3-gauge__punch">The reader did not change.<br>The ruler did.</p>
              <div class="p3-gauge__points">
                ${kit.grid({ key: 'above', n: v('p3.reader_points'), cols: GAUGE.points.cols, tone: 'read' })}
                <p class="p3-gauge__key"><span data-key="on"><i class="is-on"></i>above</span><span data-key="was"><i class="is-was"></i>no longer</span></p>
              </div>
              <p class="p3-gauge__count">Above the reference from 2: ${t('k.above_at_2')} of ${t('p3.reader_points')} (${t('readers.count')} readers × ${t('task.resampled_models')} resampled models).<span class="p3-gauge__none"> From ${t('p3.heldout_others')}: ${t('k.above_at_15')}.</span></p>
            </div>
          </div>
        </div>
        ${captionHtml({ notes: CURVE_NOTES, rec: 2 })}
      </div>`,
    setup: (ctx) => {
      const { fact, dur } = ctx;
      const reader = fact('p3.opus_in_heldout').value;
      const low = fact('k.ceiling_2').value;
      const high = fact('k.ceiling_15').value;
      // The gauge prints what its geometry shows; that has to be the paper's two numbers,
      // and the three AUROCs printed beside it have to give them.
      const shareOf = (reference) => `${Math.round(((reader - GAUGE.from) / (reference - GAUGE.from)) * 100)}%`;
      if (shareOf(low) !== SHARE.at2 || shareOf(high) !== SHARE.at15) throw new Error('the gauge no longer reads the normalized AUROCs of Table 2');
      // The points counted above the reference are the nine readers in the resampled models,
      // and one continuation of the sample's K is the label.
      if (fact('readers.count').value * fact('task.resampled_models').value !== fact('p3.reader_points').value) throw new Error('the points of slide 10 are no longer the nine readers in the resampled models');
      if (fact('task.sample_k').value - 1 !== fact('p3.heldout_others').value) throw new Error('the held-out label no longer leaves all but one continuation for the reference');
      const point = (k) => ctx.q(`.p3-kc__point[data-k="${k}"]`);
      const value = (k) => ctx.q(`.p3-kc__value[data-value="${k}"]`);
      const reached = (k) => KC.drawAt + KC_LINE.share[k] * KC.drawDur;
      // Until the gauge arrives the chart stands in the middle of the picture's row.
      const chart = ctx.q('.p3-curve__left');
      const centered = Math.round((ctx.q('.p3-res__picture').offsetWidth - chart.offsetWidth) / 2);

      // Enter: the axes, and the reference as it is usually reported: from two continuations.
      // The curve's two tags: the label it is scored against, and that it is measured.
      const enter = ctx.step({ label: 'result 2 of 3: two continuations' });
      kit.enterResult(enter);
      enter.tween('.p3-curve__tags [data-label]', POP, { at: 600, dur: dur.enter, ease: 'back' });
      enter.tween('.p3-kc__frame', { opacity: [0, 1] }, { at: 400 });
      enter.tween(point(2), { opacity: [0, 1], scale: [2.4, 1] }, { at: 1200, dur: dur.enter });
      enter.show(value(2), { at: 1400, rise: 0 });
      enter.hold(300);

      // Click 1: the curve of the paper's Fig. 1, point by point. The values at 4, 8 and 16
      // count up as the line reaches them; the last doubling still adds 0.011.
      const rise = ctx.step({ label: 'the curve keeps rising' });
      rise.tween('.p3-kc__line', { opacity: [0, 1] }, { at: KC.drawAt - dur.micro, dur: dur.micro });
      rise.tween('.p3-kc__line', { 'stroke-dashoffset': [1, 0] }, { at: KC.drawAt, dur: KC.drawDur, ease: 'linear' });
      KC_POINTS.filter((p) => p.k > 2).forEach((p) => rise.tween(point(p.k), { opacity: [0, 1], scale: [2, 1] }, { at: reached(p.k), dur: dur.micro }));
      [[2, 4], [4, 8], [8, 16]].forEach(([from, to]) => {
        const span = { at: reached(from), dur: reached(to) - reached(from), ease: 'linear' };
        rise.tween(value(to), { opacity: [0, 1] }, { at: span.at, dur: dur.micro });
        kit.countTo(rise, value(to), KC.named[to], { ...span, from: kcPoint(from).value, format: three });
      });
      rise.tween('.p3-kc__step', { opacity: [0, 1] }, { at: KC.drawAt + KC.drawDur + 300 });
      rise.hold(300);

      // Click 2: the chart moves to the left half, without the values on its curve (they are
      // against the other label), and the gauge takes the right one, under its
      // own label and with the reference built from 2 continuations. The reader is nearly
      // there, and 19 of the 63 points lie above this reference. "Of the way" arrives once
      // the reading has stopped counting, so that no passing number is read as a result.
      const gauge = ctx.step({ label: 'the gauge at 2 continuations: 96% of the way' });
      const lit = ctx.qa('.p3-gauge__points [data-cell]').slice(0, fact('k.above_at_2').value);
      note(gauge, 'gauge');
      gauge.tween(chart, { x: [centered, 0] }, { dur: dur.move, ease: 'inOut' });
      gauge.tween('.p3-kc__value', { opacity: [1, 0] }, { dur: dur.enter });
      gauge.tween('.p3-curve__frame', { opacity: [0, 1] }, { at: GAUGE.scaleAt - 200 });
      gauge.tween('.p3-gauge__tags', { opacity: [0, 1] }, { at: GAUGE.scaleAt - 200 });
      gauge.tween('.p3-gauge__scale', { opacity: [0, 1] }, { at: GAUGE.scaleAt });
      gauge.show('[data-ref="2"]', { at: GAUGE.scaleAt + 200, rise: 0 });
      gauge.tween([ctx.q('.p3-gauge__level'), ctx.q('.p3-gauge__share')], { opacity: [0, 1] }, { at: GAUGE.growAt, dur: dur.micro });
      const grow = gauge.signal({ at: GAUGE.growAt, dur: GAUGE.growDur });
      gauge.show('.p3-gauge__who', { at: GAUGE.growAt + GAUGE.growDur, rise: 0 });
      gauge.show('.p3-gauge__reading span', { at: GAUGE.growAt + GAUGE.growDur, rise: 0 });
      gauge.tween('.p3-gauge__how[data-how="2"]', { opacity: [0, 1] }, { at: GAUGE.growAt + GAUGE.growDur + 300 });
      gauge.tween('.p3-gauge__points', { opacity: [0, 1] }, { at: GAUGE.countAt - 300 });
      gauge.tween('.p3-gauge__key [data-key="on"]', { opacity: [0, 1] }, { at: GAUGE.countAt });
      gauge.cls(lit, 'is-on', { at: GAUGE.countAt, stagger: GAUGE.perCell });
      gauge.show('.p3-gauge__count', { at: GAUGE.countAt, rise: 0 });
      gauge.hold(300);

      // Click 3, wow 3: the reference is built from 15 continuations in place of 2. First
      // the caption says so, the higher reference gets its name and its level (a dashed line
      // where the ruler will end), and the second fraction is written with that reference
      // under the line, still without a result. Only then the reference's line climbs, the
      // ruler stretches under the reader's mark and the reading falls; the first fraction
      // and the lower reference's label step back and stay, and the second fraction gets its
      // result when the reading has stopped. The second half of the title arrives; no point
      // is above the higher reference, and the key says what a ring is.
      const wow = ctx.step({ label: 'wow 3: the ruler moves' });
      const climbed = GAUGE.climbAt + dur.reveal;
      const stepsBack = { at: GAUGE.climbAt - dur.micro, dur: dur.micro };
      wow.tween('.p3-curve__more', { opacity: [0, 1] }, { at: GAUGE.nameAt });
      wow.tween('.p3-gauge__ghost[data-aim]', { opacity: [0, 1] }, { at: GAUGE.nameAt, dur: dur.micro });
      wow.show('[data-ref="15"]', { at: GAUGE.nameAt, rise: 0 });
      wow.tween('.p3-gauge__how[data-how="15"]', { opacity: [0, 1] }, { at: GAUGE.nameAt + dur.micro });
      wow.tween('.p3-gauge__ghost:not([data-aim])', { opacity: [0, 1] }, stepsBack);
      wow.tween('[data-ref="2"]', { opacity: [1, GAUGE.was] }, stepsBack);
      wow.tween('.p3-gauge__how[data-how="2"]', { opacity: [1, GAUGE.was] }, stepsBack);
      const climb = wow.signal({ at: GAUGE.climbAt, dur: dur.reveal, ease: 'inOut' });
      wow.tween('.p3-gauge__how[data-how="15"] .p3-gauge__how-is', { opacity: [0, 1] }, { at: climbed });
      revealTitle(ctx, wow, climbed + 300);
      wow.tween('.p3-gauge__punch', POP, { at: climbed + 1000, dur: dur.enter, ease: 'back' });
      wow.cls(lit, 'is-on', { at: climbed + GAUGE.recountAfter, stagger: GAUGE.perCell, on: false });
      wow.cls(lit, 'is-was', { at: climbed + GAUGE.recountAfter, stagger: GAUGE.perCell });
      wow.tween('.p3-gauge__key [data-key="was"]', { opacity: [0, 1] }, { at: climbed + GAUGE.recountAfter });
      wow.tween('.p3-gauge__none', { opacity: [0, 1] }, { at: climbed + GAUGE.recountAfter + lit.length * GAUGE.perCell });
      wow.hold(300);

      // Click 4: the second recommendation, over the cue that limits it. The reading and the
      // line under it are the result and stay at full strength; the rest steps back.
      conclude(ctx.step({ label: 'recommendation 2' }), {
        leaves: 'gauge', limit: false,
        dims: '.p3-curve__left, .p3-gauge > .p3-curve__frame, .p3-gauge__tags, .p3-gauge__svg, .p3-gauge__points, .p3-gauge__count',
      });

      // The ruler is drawn from its two signals on every frame: how far the reader's level
      // has grown (click 2) and how far the reference has climbed (click 3).
      const parts = {
        ruler: ctx.q('.p3-gauge__ruler'), top: ctx.q('.p3-gauge__top'), full: ctx.q('.p3-gauge__full'),
        fill: ctx.q('.p3-gauge__fill'), mark: ctx.q('.p3-gauge__mark'), share: ctx.q('.p3-gauge__share'),
        ticks: ctx.qa('.p3-gauge__tick'), quarters: ctx.qa('.p3-gauge__quarter'),
      };
      const set = (el, attrs) => Object.entries(attrs).forEach(([name, n]) => el.setAttribute(name, String(round3(n))));
      ctx.paint(() => {
        const reference = util.lerp(low, high, climb());
        const top = gaugeY(reference);
        const level = util.lerp(GAUGE.base, gaugeY(reader), grow());
        set(parts.ruler, { y: top, height: GAUGE.base - top });
        set(parts.top, { y1: top, y2: top });
        set(parts.full, { y: top + 8 });
        const quarterY = (el) => GAUGE.base - (GAUGE.base - top) * Number(el.dataset.quarter);
        parts.ticks.forEach((tick) => set(tick, { y1: quarterY(tick), y2: quarterY(tick) }));
        parts.quarters.forEach((label) => set(label, { y: quarterY(label) + 8 }));
        set(parts.fill, { y: level, height: GAUGE.base - level });
        set(parts.mark, { y1: level, y2: level });
        parts.share.textContent = `${Math.round(((GAUGE.base - level) / (GAUGE.base - top)) * 100)}%`;
      });
    },
  });

  // ---------------------------------------------------------------- slide 11: result 3, testing differences
  // Nine readers were scored and three are set aside after their counts had been seen: all
  // nine are shown before the three step back. Among the six that stay, the fifteen
  // differences are drawn as the results file has them (point and nominal 95% interval);
  // every bar crosses zero, and tested jointly each only gets wider (click 1); a key beside
  // the rows says which mark is which, in the words of the caption: the bar is a pair
  // checked one by one, the thin line the pair tested jointly, and under those words what
  // "jointly" means ('p3.joint_level': widened so that all 36 hold at once, 95% of the
  // time). The key stays at full strength on the last click, beside the recommendation that
  // uses the word. The five rows with Qwen3-8B carry the other reader's name at their left,
  // under a heading that says what is subtracted; the ten others share one label. Against the other label at
  // most four are resolved (click 2): the fifteen rows move to their intervals against that
  // label ('p3.pairs_held'), in the amber of its chip, and the four rows whose joint
  // interval then excludes zero get a mark at their left. What is drawn is what is counted:
  // the cue that every interval contains zero names its label. On click 3 the rows move
  // back to the trace's own ending, the label of the title, the marks go, and so does the
  // other label's count: only the chip of the label on screen is left. Then what the
  // design could detect on that label: the
  // largest difference observed against the detectable one, on the scale of the bars, and
  // the questions it would take against the questions there were (click 3).
  // Each difference is drawn as the second reader of its pair minus the first. For the five
  // pairs with Qwen3-8B that is the other reader minus Qwen3-8B: the way round in which the
  // slide on intervals showed one of them (Opus AP: +0.026, from -0.003 to +0.055).
  // The title gives the count of each label, as the paper's conclusion does (none of 15
  // against the trace's own outcome, at most four against a held-out continuation's,
  // paper/tmlr/sections/10_conclusion.tex:4-5): with the count of the own ending alone it
  // read as the label picked for its result. All that is said about the three readers set
  // aside stands on the entrance, in one place, under the dots that step back: one sentence
  // that says when they were set aside (after the results had been seen: post hoc) and why
  // (two fail a numerical check fixed in advance, 'p3.forced_check'; one was never checked),
  // and in small print under it that the two score highest and that with the three kept a
  // few more differences are resolved ('p3.resolved_all_own', '_held'). Spread over three
  // clicks ("after we saw the counts", then "a check fixed in advance", then "two set aside
  // score highest"), the same facts read as a contradiction and as picking data. The counts
  // with all nine (1 of 36 against the trace's own ending, 6 to 9 against a held-out
  // continuation's) are not on screen. It does not argue for the choice, and it does not
  // say that the choice leaves the result as it is. The 36 of the key ("widened so all 36
  // pairs of nine readers hold") are not the 15 of the chart: the note under the dots says
  // that six readers make 15 pairs.
  const PAIRS = Object.freeze(v('test.pairs').map((pair) => Object.freeze({ a: pair.a, b: pair.b, d: 0 - pair.d, lo: 0 - pair.hi, hi: 0 - pair.lo })));
  // The pairs with Qwen3-8B come first in the list; each of their rows carries a name.
  const FX_NAMED = PAIRS.findIndex((pair) => pair.a !== 'qwen8');
  const FX = Object.freeze({
    width: 720, height: 376, zero: 404, perUnit: 3400, from: -0.06, to: 0.08, half: 4,
    // From the top: the heading of the named rows, those rows a line of text apart, then the
    // other rows, closer.
    headY: 24, rowY: 44, namedPitch: 24, restY: 162, pitch: 13, nameX: 188,
    axisY: 290, tickY: 318, ticks: Object.freeze([-0.05, 0, 0.05]), rulerY: Object.freeze([338, 364]),
    // The mark of a row that the other label resolves: a pointer on the rule at the left of
    // the rows, where no bar reaches.
    markX: 195, perMark: 120,
    // The key of the two marks of a row, at the right of the lower rows, where no interval
    // of either label reaches; under its second entry, what "jointly" means, a line each.
    keyX: 612, keyW: 36, keyY: Object.freeze([160, 192]), keyLead: 28,
    // Click 1, in ms: the bars, one after the other; then all of them widen.
    barAt: 500, perBar: 60, widenAfter: 700,
    // Clicks 2 and 3, in ms: the rows step back, change label and move (`moveAt`), then come
    // forward; on click 2 the marks of the resolved rows follow. `otherCount`: how far the
    // count of the label that is not on screen steps back on click 2.
    moveAt: 400, marksAt: 1500, otherCount: 0.4,
    // The entrance, in ms: the caption's small print, after the note under the dots.
    smallAfter: 600,
    // Click 3, in ms: the two lengths, then the tiles of the two stacks, one after the other.
    rulerAt: 1300, perRuler: 600, tilesAt: 2800, neededAfter: 700, perTile: 10,
  });
  const fxX = (d) => round3(FX.zero + d * FX.perUnit);
  const fxRow = (i) => (i < FX_NAMED ? FX.rowY + i * FX.namedPitch : FX.restY + (i - FX_NAMED) * FX.pitch);
  // Each end of an interval, pushed out from the point by the joint test's factor: the
  // paper's, Bonferroni over the 36 differences among all nine readers ('test.joint_widening').
  const fxWide = (pair) => {
    const k = v('test.joint_widening');
    return Object.freeze({ lo: pair.d - (pair.d - pair.lo) * k, hi: pair.d + (pair.hi - pair.d) * k });
  };
  // The same rows against a held-out continuation's ending ('p3.pairs_held'), the way round
  // of PAIRS: the interval of a pair alone and the joint one, each the point plus and minus
  // its critical value times the standard error.
  const HELD = Object.freeze(v('p3.pairs_held').map((pair) => {
    const d = 0 - pair.d;
    const alone = v('p3.z_alone') * pair.se;
    const joint = alone * v('test.joint_widening');
    return Object.freeze({ a: pair.a, b: pair.b, d, lo: d - alone, hi: d + alone, wide: Object.freeze({ lo: d - joint, hi: d + joint }) });
  }));
  const excludesZero = ({ lo, hi }) => lo > 0 || hi < 0;
  // The rows that the other label resolves: Qwen3-8B against each reader of the fact.
  const HELD_ROWS = Object.freeze(PAIRS.map((pair, i) => (pair.a === 'qwen8' && v('p3.resolved_held_pairs').includes(pair.b) ? i : -1)).filter((i) => i >= 0));
  const signed = (d) => (d === 0 ? '0' : `${d > 0 ? '+' : '−'}${two(Math.abs(d))}`);
  // What "tested jointly" means, under those words in the key ('p3.joint_level'), and what
  // its 36 are: all pairs of the nine readers ('test.pairs_all'), of which the chart shows
  // the 15 among the six that are kept. One entry a line.
  const JOINT_MEANS = Object.freeze([
    `widened so all ${t('test.pairs_all')} pairs`,
    'of nine readers hold',
    `at once, ${t('p3.joint_level')} of the time`,
  ]);
  const forest = () => {
    const first = FX_NAMED;
    const rule = (y1, y2) => `<line class="p3-axis" x1="196" x2="196" y1="${y1}" y2="${y2}"/>`;
    const ruler = (i, label, value) => `
        <g class="p3-fx__ruler" data-ruler="${i}">
          <text class="p3-end" x="${FX.zero - 12}" y="${FX.rulerY[i] + 8}">${label}</text>
          <rect x="${FX.zero}" y="${FX.rulerY[i] - 7}" width="${round3(value * FX.perUnit)}" height="14"/>
        </g>`;
    return `
    <svg class="p3-svg p3-fx" viewBox="0 0 ${FX.width} ${FX.height}" width="${FX.width}" height="${FX.height}">
      <g class="p3-fx__frame">
        <text x="8" y="${FX.headY}">each minus ${t('reader.qwen8.name')}:</text>
        ${PAIRS.slice(0, first).map((pair, i) => `<text class="p3-fx__name p3-end" x="${FX.nameX}" y="${fxRow(i) + 8}">${t(`reader.${pair.b}.name`)}</text>`).join('')}
        ${rule(fxRow(0) - 8, fxRow(first - 1) + 8)}
        <text x="8" y="${fxRow(first + 4) + 2}">the other</text>
        <text x="8" y="${fxRow(first + 4) + 30}">ten pairs</text>
        ${rule(fxRow(first) - 8, fxRow(PAIRS.length - 1) + 8)}
        <line class="p3-fx__zero" x1="${FX.zero}" x2="${FX.zero}" y1="2" y2="${FX.axisY}"/>
        <line class="p3-axis" x1="${fxX(FX.from)}" x2="${fxX(FX.to)}" y1="${FX.axisY}" y2="${FX.axisY}"/>
        ${FX.ticks.map((tick) => `
          <line class="p3-axis" x1="${fxX(tick)}" x2="${fxX(tick)}" y1="${FX.axisY}" y2="${FX.axisY + 6}"/>
          <text class="p3-num p3-mid" x="${fxX(tick)}" y="${FX.tickY}">${signed(tick)}</text>`).join('')}
        <text x="8" y="${FX.tickY}">difference</text>
      </g>
      ${HELD_ROWS.map((i) => `<path class="p3-fx__held" d="M${FX.markX} ${fxRow(i) - 6} h12 l8 6 l-8 6 h-12 Z"/>`).join('')}
      <g class="p3-fx__bars">
        ${PAIRS.map((pair, i) => `
          <g data-pair="${i}">
            <line class="p3-fx__joint" x1="${fxX(pair.lo)}" x2="${fxX(pair.hi)}" y1="${fxRow(i)}" y2="${fxRow(i)}"/>
            <line class="p3-fx__cap" data-end="lo" x1="${fxX(pair.lo)}" x2="${fxX(pair.lo)}" y1="${fxRow(i) - 6}" y2="${fxRow(i) + 6}"/>
            <line class="p3-fx__cap" data-end="hi" x1="${fxX(pair.hi)}" x2="${fxX(pair.hi)}" y1="${fxRow(i) - 6}" y2="${fxRow(i) + 6}"/>
            <rect class="p3-fx__bar" x="${fxX(pair.lo)}" y="${fxRow(i) - FX.half}" width="${round3(fxX(pair.hi) - fxX(pair.lo))}" height="${FX.half * 2}" rx="2"/>
            <circle class="p3-fx__point" cx="${fxX(pair.d)}" cy="${fxRow(i)}" r="3"/>
          </g>`).join('')}
      </g>
      <g class="p3-fx__key" data-key="alone">
        <rect x="${FX.keyX}" y="${FX.keyY[0] - FX.half}" width="${FX.keyW}" height="${FX.half * 2}" rx="2"/>
        <text x="${FX.keyX + FX.keyW + 12}" y="${FX.keyY[0] + 8}">checked one by one</text>
      </g>
      <g class="p3-fx__key" data-key="joint">
        <path d="M${FX.keyX} ${FX.keyY[1] - 6} v12 M${FX.keyX} ${FX.keyY[1]} h${FX.keyW} M${FX.keyX + FX.keyW} ${FX.keyY[1] - 6} v12"/>
        <text x="${FX.keyX + FX.keyW + 12}" y="${FX.keyY[1] + 8}">tested jointly:</text>
        ${JOINT_MEANS.map((line, i) => `<text x="${FX.keyX + FX.keyW + 12}" y="${FX.keyY[1] + 8 + (i + 1) * FX.keyLead}">${line}</text>`).join('')}
      </g>
      ${ruler(0, `largest observed: ${t('test.max_difference')}`, v('test.max_difference'))}
      ${ruler(1, `detectable: ${t('test.detectable_own')}`, v('test.detectable_own'))}
    </svg>`;
  };
  // The nine readers on one AUROC axis, within question; the three forced readers are marked.
  const RD = Object.freeze({ width: 500, height: 448, x0: 320, perUnit: 2500, from: 0.79, nameX: 306, rowY: 22, pitch: 28, axisY: 266, tickY: 296, ticks: Object.freeze([0.80, 0.85]), noteY: Object.freeze([344, 376, 424]) });
  const rdX = (value) => round3(RD.x0 + (value - RD.from) * RD.perUnit);
  const readerDots = () => `
    <svg class="p3-svg p3-rd" viewBox="0 0 ${RD.width} ${RD.height}" width="${RD.width}" height="${RD.height}">
      <g class="p3-rd__frame">
        <line class="p3-axis" x1="${RD.x0}" x2="${rdX(0.855)}" y1="${RD.axisY}" y2="${RD.axisY}"/>
        ${RD.ticks.map((tick) => `
          <line class="p3-grid" x1="${rdX(tick)}" x2="${rdX(tick)}" y1="8" y2="${RD.axisY}"/>
          <text class="p3-num p3-mid" x="${rdX(tick)}" y="${RD.tickY}">${two(tick)}</text>`).join('')}
        <text class="p3-end" x="${RD.nameX}" y="${RD.tickY}">AUROC</text>
      </g>
      ${READERS.map((key, i) => `
        <g class="p3-rd__row${KEPT.includes(key) ? '' : ' is-forced'}" data-reader="${key}">
          <text class="p3-end" x="${RD.nameX}" y="${RD.rowY + i * RD.pitch + 8}">${t(`reader.${key}.name`)}</text>
          <circle cx="${rdX(v(`reader.${key}.within`))}" cy="${RD.rowY + i * RD.pitch}" r="7"/>
        </g>`).join('')}
      <g class="p3-rd__kept">
        <circle class="p3-rd__glyph" cx="20" cy="${RD.noteY[0] - 8}" r="7"/>
        <text x="40" y="${RD.noteY[0]}">Six readers (${t('test.pairs_kept')} pairs), within question:</text>
        <text class="p3-rd__range p3-num" x="40" y="${RD.noteY[1]}">${t('readers.within_min')} to ${t('readers.within_max_kept')}</text>
      </g>
      <g class="p3-rd__aside">
        <circle class="p3-rd__glyph is-forced" cx="20" cy="${RD.noteY[2] - 8}" r="7"/>
        <text x="40" y="${RD.noteY[2]}">set aside, post hoc</text>
      </g>
    </svg>`;
  // "80% power" in the talk's words: 4 times in 5.
  const timesIn = (power) => {
    const gcd = (a, b) => (b ? gcd(b, a % b) : a);
    const unit = gcd(power, 100);
    return `${power / unit} times in ${100 / unit}`;
  };
  const NEED = Object.freeze({ had: v('test.questions_had'), needed: v('test.questions_needed') });
  // Click 3, in ms after the click: the second stack starts, and the room has been told.
  const NEED_AT = (() => {
    const needed = FX.tilesAt + FX.neededAfter;
    return Object.freeze({ needed, told: needed + NEED.needed * FX.perTile + 300 });
  })();
  const tiles = (n) => util.range(n).map(() => '<i></i>').join('');
  // A caption of this slide can carry a second line in small print (parts/part3.css). Only
  // the entrance has one: all that is said about the three readers set aside stands there,
  // in one place, beside the dots that step back.
  const RESOLVE_NOTES = Object.freeze({
    aside: Object.freeze([
      // 'readers.forced_aside' and 'p3.forced_check', in the talk's words, as one sentence:
      // when the three were set aside (after the counts with them had been read: post hoc)
      // and why (two fail a numerical tolerance that was fixed before the subject readings;
      // the third was never checked against it). The sixth cold read had "after we saw the
      // counts" on the entrance and "a check fixed in advance" a click later, and took the
      // two for a contradiction. A no-break space keeps "post hoc" on one line.
      'Three forced-answer readers are set aside after we saw the results (post\u00a0hoc): two fail a numerical check we fixed in advance, one was never checked.',
      // What the choice costs, right behind it: the two that fail the check have the highest
      // scores of the nine, and with the three kept more differences are resolved under
      // either label ('p3.resolved_all_own': 1 of 36 against 0 of 15; 'p3.resolved_all_held':
      // 6 to 9 of 36 against at most 4 of 15). The counts themselves are not on screen (the
      // sixth cold read could not retell them); the setup checks the sentence against them.
      // The slide does not say that setting the three aside leaves the result as it is.
      'The two score highest. With them, a few more differences are resolved.',
    ]),
    // The paper states its counts with the joint test over all 36 pairs of the nine
    // readers, also for the 15 pairs of the six (paper/tmlr/appendix/k_inference.tex:187-189).
    // What the joint test is for: one pair at a time, 'p3.chance_resolved' of the 36
    // intervals would exclude zero if the readers were equal. It opens on the words of the
    // key; what the joint test does about it, and what the 36 are, stands in the key.
    joint: `Checked one by one, ${t('p3.chance_resolved')} of ${t('test.pairs_all')} differences would look resolved even if the readers were equal.`,
    // Which four ('p3.resolved_held_pairs') is on the picture: the rows with a mark carry
    // their readers' names. The count beside the chip is "at most 4": two stricter checks
    // give fewer, the critical value calibrated for this label ('p3.resolved_held_stricter':
    // 3 or 4, by bootstrap run) and the control for prefix length ('p3.resolved_held_matched':
    // 0). They are not on screen (the sixth cold read could not retell "one stricter check
    // resolves 3 or 4, another 0"); the setup still checks that 4 is the largest of the three.
    held: `Held-out label: ${v('test.resolved_held_max')} joint intervals exclude zero.`,
    // What the ruler's word "detectable" means; its value stands on the ruler over the caption.
    power: `Detectable (own-ending label): smallest difference this design would catch ${timesIn(v('test.power'))}.`,
  });
  // 'test.not_equality', in the talk's words. The title's second half says the same from
  // click 3 on, so the line does without "to tell" behind "too small" (the two words pay
  // for the title's).
  const RESOLVE_LIMIT = 'Not resolved means the test was too small, not that the readers are equal.';

  Deck.register({
    id: 'p3-resolve',
    part: PART,
    kicker: RESULTS,
    // One count that holds for both labels: 'test.resolved_own' against the trace's own
    // ending, 'test.resolved_held_max' ("at most 4") against a held-out continuation's
    // (paper/tmlr/sections/10_conclusion.tex:4-5). The setup checks that it covers both.
    title: `At most ${v('test.resolved_held_max')} of ${t('test.pairs_kept')} reader differences are resolved, by either label, <em>and that does not make them equal</em>`,
    cues: [
      // A no-break space keeps the cue's last two words on one line.
      { text: `Own-ending label: all ${t('test.pairs_kept')} intervals contain\u00a0zero`, step: 1, at: FX.barAt + PAIRS.length * FX.perBar },
    ],
    cite: [{ src: 'paper', where: 'Sec. 3.2, 4; Table 2-3; App. J' }],
    figure: ['data', 'schematic'],
    html: `
      <div class="p3-res p3-resolve">
        ${kit.resultHead(3, EXPLORATORY)}
        <div class="p3-res__picture">
          ${readerDots()}
          <div class="p3-resolve__mid">
            <div class="p3-resolve__counts">
              <p class="p3-resolve__count" data-count="own">${labelChip('own')}<b>${t('test.resolved_own')} of ${t('test.pairs_kept')} resolved</b></p>
              <p class="p3-resolve__count" data-count="held">${labelChip('held')}<b>${t('test.resolved_held_max')} of ${t('test.pairs_kept')}</b></p>
            </div>
            ${forest()}
          </div>
          <div class="p3-need">
            <p class="p3-need__head">questions per model</p>
            <div class="p3-need__stack" data-stack="had">
              <p class="p3-need__n"><b>${t('test.questions_had')}</b></p>
              <p class="p3-need__what">we had</p>
              <div class="p3-need__tiles">${tiles(NEED.had)}</div>
            </div>
            <div class="p3-need__stack" data-stack="needed">
              <p class="p3-need__n"><span>about</span><b class="p3-need__count"></b></p>
              <p class="p3-need__what">to detect ${t('test.smallest_target')}</p>
              <div class="p3-need__tiles">${tiles(NEED.needed)}</div>
            </div>
          </div>
        </div>
        ${captionHtml({ notes: RESOLVE_NOTES, rec: 3, limit: RESOLVE_LIMIT })}
      </div>`,
    setup: (ctx) => {
      const { fact, dur } = ctx;
      if (HELD_ROWS.length !== fact('test.resolved_held_max').value || HELD_ROWS[HELD_ROWS.length - 1] - HELD_ROWS[0] !== HELD_ROWS.length - 1) {
        throw new Error('the rows that the held-out label resolves are no longer the four in a block that the count names');
      }
      // The cue counts the intervals; they are the pairs of the six readers that are kept
      // (the rows say which: five names under "each minus Qwen3-8B AP", then the other ten).
      if (KEPT.length !== 6 || fact('readers.kept').value !== KEPT.length || (KEPT.length * (KEPT.length - 1)) / 2 !== PAIRS.length || PAIRS.length !== fact('test.pairs_kept').value) throw new Error('the intervals of slide 11 are no longer one per pair of six readers');
      // What is drawn is what is counted. Against the trace's own ending every interval
      // contains zero, alone and jointly; against the held-out label the rows are the same
      // pairs, the joint interval excludes zero on the four rows that carry a mark and on
      // no other, and one by one as many exclude it as the results file counts.
      if (PAIRS.some((pair) => excludesZero(pair) || excludesZero(fxWide(pair)))) throw new Error('an interval against the own ending no longer contains zero');
      if (HELD.length !== PAIRS.length || HELD.some((pair, i) => pair.a !== PAIRS[i].a || pair.b !== PAIRS[i].b)) throw new Error('the held-out intervals are no longer the pairs of the bars, in their order');
      const heldJoint = HELD.map((pair, i) => (excludesZero(pair.wide) ? i : -1)).filter((i) => i >= 0);
      if (heldJoint.join() !== HELD_ROWS.join()) throw new Error('the joint intervals against the held-out label no longer exclude zero on the four marked rows only');
      if (HELD.filter(excludesZero).length !== fact('p3.pairs_held').alone) throw new Error('one by one, the held-out intervals no longer exclude zero as often as the results file counts');
      if (!fact('p3.resolved_held_stricter').value.includes(fact('test.resolved_held_max').value) || fact('p3.resolved_held_matched').value >= fact('test.resolved_held_max').value) throw new Error('"at most" on slide 11 is no longer the largest of the held-out label\'s counts (the joint test, the calibrated one, the one matched by length)');
      // The title gives one count for both labels: the held-out label's largest count has to
      // be its fact's "at most", and the own ending's count may not be above it.
      if (fact('test.resolved_held_max').text !== `at most ${fact('test.resolved_held_max').value}` || fact('test.resolved_own').value > fact('test.resolved_held_max').value) throw new Error('the count in the title of slide 11 no longer holds for both labels');
      // The first group of bars is named row by row, under "each minus Qwen3-8B AP"; the
      // second by its size ("the other ten pairs"). The marked rows are among the named ones.
      if (PAIRS.some((pair, i) => (pair.a === 'qwen8') !== (i < FX_NAMED)) || PAIRS.length - FX_NAMED !== 10) throw new Error('the bars are no longer the pairs with Qwen3-8B, then ten others');
      if (HELD_ROWS.some((i) => i >= FX_NAMED)) throw new Error('a row that the held-out label resolves no longer carries a name');
      // The key says at what level the joint intervals hold: the level of every interval of the talk.
      if (fact('p3.joint_level').value !== fact('test.interval_level').value) throw new Error('the joint intervals of slide 11 are no longer at the level of the other intervals');
      // The key names the family of the joint test; the bars widen by that family's factor.
      if (fact('test.joint_widening').family !== fact('test.pairs_all').value) throw new Error('the joint test of slide 11 is no longer the one over all pairs of the nine readers');
      // The entrance says "three", "two fail a check" and "one was never checked": the three
      // forced readers, of which the paper names the one never checked ('readers.forced_aside').
      if (READERS.length - KEPT.length !== fact('readers.forced_aside').value || fact('readers.forced_aside').value !== 3) throw new Error('the readers set aside on slide 11 are no longer three');
      if (!/^Two forced readers fail the tolerance and Qwen3-32B forced was never checked/.test(fact('readers.forced_aside').text) || !/post hoc, after reading the counts with them/.test(fact('readers.forced_aside').text)) throw new Error('readers.forced_aside no longer says what the entrance of slide 11 rewords');
      if (!/numerical tolerance fixed before the subject readings/.test(fact('p3.forced_check').text)) throw new Error('p3.forced_check no longer says that the tolerance was fixed before the subject readings');
      // Its small print says that the two which fail the check score highest: the two
      // readers at the top are forced readers, and neither is the one never checked.
      const ranked = READERS.slice().sort((a, b) => fact(`reader.${b}.within`).value - fact(`reader.${a}.within`).value);
      if (ranked.slice(0, 2).some((key) => KEPT.includes(key) || key === UNCHECKED) || !KEPT.includes(ranked[2])) throw new Error('the two readers that score highest are no longer the two set aside for failing the check');
      // And that with the three kept more differences are resolved, under either label.
      if (fact('p3.resolved_all_own').value <= fact('test.resolved_own').value || Math.min(...fact('p3.resolved_all_held').value) <= fact('test.resolved_held_max').value) throw new Error('with all nine readers, no more differences are resolved than without the three set aside');
      const forced = ctx.qa('.p3-rd__row.is-forced');

      // Enter: all nine readers, then the three forced readers step back.
      const enter = ctx.step({ label: 'result 3 of 3: six readers' });
      kit.enterResult(enter);
      enter.tween('.p3-rd__frame', { opacity: [0, 1] }, { at: 400 });
      enter.tween('.p3-rd__row', { opacity: [0, 1] }, { at: 500, stagger: 90, dur: dur.micro });
      const asideAt = 500 + READERS.length * 90 + 600;
      note(enter, 'aside', { at: asideAt - 200 });
      enter.tween(forced, { opacity: [1, 0.5] }, { at: asideAt, stagger: 200 });
      enter.cls(forced, 'is-aside', { at: asideAt, stagger: 200 });
      enter.tween('.p3-rd__aside', { opacity: [0, 1] }, { at: asideAt + forced.length * 200 });
      enter.tween('.p3-rd__kept', { opacity: [0, 1] }, { at: asideAt + forced.length * 200 + 500 });
      enter.tween('[data-says-line="aside:1"]', { opacity: [0, 1] }, { at: asideAt + forced.length * 200 + 500 + FX.smallAfter, dur: dur.enter });
      enter.hold(300);

      // Click 1: the fifteen differences of the six, each with its interval; every one
      // crosses zero. Tested jointly they only get wider, and the count lands.
      const diff = ctx.step({ label: 'fifteen differences, none resolved' });
      note(diff, 'joint', { leaves: 'aside' });
      diff.tween('.p3-fx__frame', { opacity: [0, 1] }, { at: 200 });
      const widenAt = FX.barAt + PAIRS.length * FX.perBar + FX.widenAfter;
      const held = ctx.step({ label: 'another label, another count' });
      const power = ctx.step({ label: 'what the design could detect' });
      // A row under one label and under the other: where its bar, its point, its joint line
      // and the two caps of that line stand. The caps are drawn at the ends of the bar
      // against the own ending and moved from there.
      const own = PAIRS.map((pair) => ({ ...pair, wide: fxWide(pair) }));
      const shape = (pair, base) => ({
        bar: { 'attr:x': fxX(pair.lo), 'attr:width': round3(fxX(pair.hi) - fxX(pair.lo)) },
        point: { 'attr:cx': fxX(pair.d) },
        joint: { 'attr:x1': fxX(pair.wide.lo), 'attr:x2': fxX(pair.wide.hi) },
        lo: { x: round3(fxX(pair.wide.lo) - fxX(base.lo)) },
        hi: { x: round3(fxX(pair.wide.hi) - fxX(base.hi)) },
      });
      const between = (from, to) => Object.fromEntries(Object.keys(from).map((name) => [name, [from[name], to[name]]]));
      PAIRS.forEach((pair, i) => {
        const row = ctx.q(`[data-pair="${i}"]`);
        const at = FX.barAt + i * FX.perBar;
        const wide = own[i].wide;
        const widen = { at: widenAt, dur: dur.move, ease: 'inOut' };
        const parts = {
          bar: row.querySelector('.p3-fx__bar'), point: row.querySelector('.p3-fx__point'), joint: row.querySelector('.p3-fx__joint'),
          lo: row.querySelector('[data-end="lo"]'), hi: row.querySelector('[data-end="hi"]'),
        };
        diff.tween(parts.bar, { opacity: [0, 1], 'attr:x': [fxX(pair.d), fxX(pair.lo)], 'attr:width': [0, round3(fxX(pair.hi) - fxX(pair.lo))] }, { at, dur: dur.enter });
        diff.tween(parts.point, { opacity: [0, 1] }, { at, dur: dur.micro });
        diff.tween([parts.joint, parts.lo, parts.hi], { opacity: [0, 1] }, { at: widenAt, dur: dur.micro });
        diff.tween(parts.joint, { 'attr:x1': [fxX(pair.lo), fxX(wide.lo)], 'attr:x2': [fxX(pair.hi), fxX(wide.hi)] }, widen);
        diff.tween(parts.lo, { x: [0, round3(fxX(wide.lo) - fxX(pair.lo))] }, widen);
        diff.tween(parts.hi, { x: [0, round3(fxX(wide.hi) - fxX(pair.hi))] }, widen);
        // Click 2 moves the row to its interval against the held-out label, click 3 back.
        const there = shape(HELD[i], pair);
        const here = shape(own[i], pair);
        const move = { at: FX.moveAt, dur: dur.move, ease: 'inOut' };
        Object.keys(parts).forEach((name) => {
          held.tween(parts[name], between(here[name], there[name]), move);
          power.tween(parts[name], between(there[name], here[name]), move);
        });
      });
      diff.tween('[data-key="alone"]', { opacity: [0, 1] }, { at: FX.barAt });
      diff.tween('[data-key="joint"]', { opacity: [0, 1] }, { at: widenAt });
      diff.tween('[data-count="own"]', POP, { at: widenAt + dur.move + 300, dur: dur.enter, ease: 'back' });
      diff.hold(300);

      // Click 2: the other label. The rows step back, take the amber of that label's chip
      // and move to their intervals against it; the bar of a pair alone stays behind its
      // joint line, which is what the count reads. Then the count, and a mark on the four
      // rows of Qwen3-8B whose joint interval excludes zero. The first count steps well
      // back: the chip at full strength is the label of the bars.
      const stepBack = { at: FX.moveAt - dur.micro, dur: dur.micro };
      const comeBack = { at: FX.moveAt + dur.micro, dur: dur.enter };
      note(held, 'held', { leaves: 'joint' });
      held.tween('[data-count="own"]', { opacity: [1, FX.otherCount] }, { at: 200 });
      held.tween('.p3-fx__bars', { opacity: [1, 0.2] }, stepBack);
      held.cls('.p3-fx__bars', 'is-held', { at: FX.moveAt });
      held.tween('.p3-fx__bars', { opacity: [0.2, 1] }, comeBack);
      held.tween('.p3-fx__bar', { opacity: [1, 0.5] }, stepBack);
      held.tween('[data-count="held"]', POP, { at: FX.moveAt + dur.move - 200, dur: dur.enter, ease: 'back' });
      held.tween('.p3-fx__held', { opacity: [0, 1] }, { at: FX.marksAt, stagger: FX.perMark, dur: dur.micro });
      held.hold(300);

      // Click 3: what the design could detect, on the label of the title: the rows move
      // back to their intervals against the trace's own ending, the marks go, the first
      // count comes forward and the other label's count leaves, so that one chip is on
      // screen, the label of the bars. Then the two lengths on the scale of the bars, and the
      // questions there were against the questions it would take; the second half of the
      // title arrives with the tiles, and under it the limit in full.
      note(power, 'power', { leaves: 'held' });
      power.tween('.p3-fx__held', { opacity: [1, 0] }, { dur: dur.micro });
      power.tween('[data-count="held"]', { opacity: [1, 0] }, { at: 200 });
      power.tween('[data-count="own"]', { opacity: [FX.otherCount, 1] }, { at: 200 });
      power.tween('.p3-fx__bars', { opacity: [1, 0.2] }, stepBack);
      power.cls('.p3-fx__bars', 'is-held', { at: FX.moveAt, on: false });
      power.tween('.p3-fx__bars', { opacity: [0.2, 1] }, comeBack);
      power.tween('.p3-fx__bar', { opacity: [0.5, 1] }, comeBack);
      ctx.qa('.p3-fx__ruler').forEach((ruler, i) => {
        const bar = ruler.querySelector('rect');
        power.tween(ruler, { opacity: [0, 1] }, { at: FX.rulerAt + i * FX.perRuler, dur: dur.micro });
        power.tween(bar, { 'attr:width': [0, Number(bar.getAttribute('width'))] }, { at: FX.rulerAt + i * FX.perRuler, dur: dur.move });
      });
      power.show('.p3-need__head', { at: FX.tilesAt - 300, rise: 0 });
      power.show('[data-stack="had"] p', { at: FX.tilesAt, rise: 0 });
      power.tween('[data-stack="had"] .p3-need__tiles i', { opacity: [0, 1] }, { at: FX.tilesAt, stagger: FX.perTile, dur: dur.micro });
      power.show('[data-stack="needed"] p', { at: NEED_AT.needed, rise: 0 });
      power.tween('[data-stack="needed"] .p3-need__tiles i', { opacity: [0, 1] }, { at: NEED_AT.needed, stagger: FX.perTile, dur: dur.micro });
      kit.countTo(power, '.p3-need__count', 'test.questions_needed', { from: NEED.had, at: NEED_AT.needed, dur: NEED.needed * FX.perTile, ease: 'linear' });
      revealTitle(ctx, power, NEED_AT.told);
      power.show('.p3-res__limit', { at: NEED_AT.told + 500, rise: 0 });
      power.hold(300);

      // Click 4: the third recommendation; the limit stays under it. The picture steps back
      // but for the key of the two marks: it says what the recommendation's "jointly" means.
      conclude(ctx.step({ label: 'recommendation 3' }), {
        leaves: 'power', limit: false,
        dims: '.p3-rd, .p3-resolve__counts, .p3-fx__frame, .p3-fx__bars, .p3-fx__ruler, .p3-need',
      });
    },
  });

  // ---------------------------------------------------------------- slide 12: conclusion and open question
  // The paper's conclusion in the talk's words ('close.levels'): it does not say that
  // scoring reorders the readers. Under it the scope line of the motivation slide; then the
  // three recommendations as slides 9 to 11 ended on them, and the limits as one quiet row;
  // both stay as they are to the last state, the recommendations at full strength: they are
  // what the room takes home. Then the open question, with the pilot's count as a strip in
  // which one cell stands for one trace that followed the hint. The pilot's line first says
  // what the question has to do with evaluating a monitor (it takes traces that follow a
  // hint and never mention it), then that the pilot found few, and in brackets that it is
  // not the main task ('p3.pilot_other'): another model, QwQ-32B, and another hint, in the
  // question's metadata ('p3.pilot_hint'). Without the two "another", its 37 of 1,120 were
  // read against the main task's traces, of which nearly all restate the hint (slide 4),
  // and "open reasoning model" are slide 4's words for the main task's eight models.
  // The statement moves once. From the entrance it stands where the recommendations and the
  // limits will leave it, a little above the middle of the stage, so that click 1 adds them
  // under it and moves nothing; click 2 lifts all of it to make room for the open question.
  const CLOSE = Object.freeze({
    // 'close.levels', in the talk's words. The paper's "levels" are a monitor's number
    // (result 1) and the reference it is held against (result 2: the reference rises and
    // the reader's own AUROC does not move), so the statement names both.
    says: 'On this task, scoring choices move a prefix monitor’s number or its reference as much as monitors differ.',
    // 'task.degenerate', 'scope.exploratory', 'readers.forced_aside' and 'second.limited'.
    // The last one gives the second task's result with its limit: slide 4 introduces that
    // task as a limited check, and no slide said what the check found. Four of the six
    // checks frozen before its traces were downloaded passed ('second.checks',
    // 'p3.second_frozen'), and that can hardly confirm or refute that the results carry
    // over ('second.power', in slide 4's words for it). The setup checks the facts it rewords.
    limits: Object.freeze([
      'one task with one hint, which nearly every trace restates',
      'most analyses exploratory',
      'three readers set aside post hoc',
      `second task, a limited check: ${t('second.checks')} checks ${t('p3.second_frozen')} passed; it can hardly confirm or refute that results carry over`,
    ]),
    // 'open.question', in plain words.
    ask: 'Is influence that the reasoning never mentions common enough to evaluate monitors on?',
    cols: 140, seed: 37,
    // The row of the course block over the stage, in stage pixels (parts/part3.css).
    kickerRow: 40,
    recAt: 700, perRec: 450, askAt: 700, perCell: 30,
  });

  Deck.register({
    id: 'p3-close',
    part: PART,
    layout: 'bare',
    kicker: kicker(PART, 'Conclusion'),
    title: CLOSE.says.replace(/\.$/, ''),
    cite: [{ src: 'paper', where: 'Sec. 1, 8, 9; App. I' }],
    html: `
      <div class="p3-close">
        <div class="dk-kicker p3-close__kicker">${kicker(PART, 'Conclusion')}</div>
        <div class="p3-close__body">
          <div class="p3-close__head">
            <h2 class="p3-close__say">${CLOSE.says}</h2>
            ${kit.scope({ size: 2 })}
          </div>
          <div class="p3-close__recs">${CHOICES.map((_, i) => kit.rec(i + 1)).join('')}</div>
          <div class="p3-close__limits">
            <span class="p3-close__tag">Limits</span>
            ${CLOSE.limits.map((limit) => `<span class="p3-close__limit">${limit}</span>`).join('')}
          </div>
        </div>
        <div class="p3-close__open">
          <p class="p3-close__ask"><span class="p3-close__tag">Open question</span><span class="p3-close__asks">${CLOSE.ask}</span></p>
          <p class="p3-close__pilot">That takes traces that follow a hint and never mention it. A pilot found few: ${t('open.silent')} of ${t('open.followed')} that followed (another model, ${t('open.model')}; another hint, in the question’s metadata).</p>
          <div class="p3-close__strip">${kit.grid({ key: 'pilot', n: v('open.followed'), cols: CLOSE.cols, tone: 'hidden' })}</div>
        </div>
      </div>`,
    setup: (ctx) => {
      const { fact, dur } = ctx;
      // The statement, the recommendations and the limits stand as one group in the middle
      // of the stage, under the row of the course block. The statement has its place in
      // that group from the entrance, so click 1 moves nothing; click 2 lifts the group,
      // undimmed, to its place over the open question.
      const perPixel = ctx.stage.offsetHeight / ctx.stage.getBoundingClientRect().height;
      const middle = (el) => { const r = el.getBoundingClientRect(); return (r.top + r.height / 2) * perPixel; };
      const center = middle(ctx.stage) + CLOSE.kickerRow / 2;
      const group = Math.round(center - middle(ctx.q('.p3-close__body')));
      const silent = util.shuffled(ctx.qa('.p3-close__strip [data-cell]'), CLOSE.seed).slice(0, fact('open.silent').value);
      // The pilot's line says "another model" and "another hint" ('p3.pilot_other'): its
      // model may not be one of the main task's, nor its hint the main task's.
      if (fact('task.model_names').text.includes(fact('open.model').text)) throw new Error('the pilot of slide 12 no longer runs on another model than the main task');
      if (/metadata/i.test(fact('task.hint_template').text) || !/metadata/i.test(fact('p3.pilot_hint').text)) throw new Error('the pilot of slide 12 no longer uses another hint than the main task');
      // The last limit rewords three facts of the second task: the paper's "limited check",
      // its "4 of 6" and "almost no power to confirm or refute transfer".
      if (!/limited check/.test(fact('second.limited').text) || fact('second.checks').text !== `${fact('second.checks').value} of 6` || !/almost no power to confirm or refute transfer/.test(fact('second.power').text)) {
        throw new Error('second.limited, second.checks or second.power no longer says what the last limit of slide 12 rewords');
      }

      const enter = ctx.step({ label: 'the conclusion' });
      enter.show('.p3-close__kicker', { at: 100, rise: 0 });
      enter.show('.p3-close__say', { at: 300, dur: dur.move });
      enter.show('.dk-scope', { at: 1300 });
      enter.hold(300);

      const recs = ctx.step({ label: 'three recommendations, and the limits' });
      recs.show('.p3-close__recs .dk-rec', { at: CLOSE.recAt, stagger: CLOSE.perRec });
      recs.show('.p3-close__limits', { at: CLOSE.recAt + CHOICES.length * CLOSE.perRec + 300, rise: 0 });
      recs.hold(300);

      const open = ctx.step({ label: 'the open question' });
      open.tween('.p3-close__body', { y: [group, 0] }, { dur: dur.move, ease: 'inOut' });
      open.tween('.p3-close__ask', POP, { at: CLOSE.askAt, dur: dur.enter, ease: 'back' });
      open.show('.p3-close__pilot', { at: CLOSE.askAt + 800, rise: 0 });
      open.tween('.p3-close__strip', { opacity: [0, 1] }, { at: CLOSE.askAt + 1200 });
      open.cls(silent, 'is-on', { at: CLOSE.askAt + 1700, stagger: CLOSE.perCell });
      open.hold(300);
    },
  });
})();
