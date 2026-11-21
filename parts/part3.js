// Part 3: What we found. Slides 10-13 (Results, Conclusion).
// SPEC.md section 5 describes each slide; parts/sample.js shows the registration API.
// The three results are the paper's three contributions (its v2, Sec. 4 to 6): when a
// resampling ceiling is a ceiling (slide 10), whether alarms come in time (slide 11), what a
// comparison of readers can resolve (slide 12). They share one frame (.p3-res): the result's
// head (kit.resultHead), the picture, and under it the caption of the step (kit.says). On
// the last click the caption's place holds the recommendation (kit.rec) and its limit. The
// closing slide (13) is text only.
// Every number and quote on screen is read from the fact table by key. What a drawing makes
// up (the lengths of slide 10's bars, the endings and the alarm of slide 11's one trace) is
// named where it is defined, and the footer tag "Schematic" covers it. A term or a mark is
// said in plain words where it first stands: an axis has its ticks, a mark its key, and a
// count the things it counts.
(() => {
  'use strict';

  const PART = 3;
  const { kit, util } = Deck;
  const DUR = Deck.timeline.DUR;
  const { choices: CHOICES, recs: RECS, kicker, readers: READERS, kept: KEPT } = Deck.motifs;
  // The four readers that the held-out label sets above the small open monitor (slide 12):
  // the paper's "frontier readings", two models under two prompts.
  const HELD_ABOVE = Object.freeze(['opus_ap', 'astra_ap', 'opus_in', 'astra_in']);
  // The forced reader that was never checked against the numerical tolerance (slide 12): the
  // paper's "Qwen3-32B forced" ('readers.forced_aside').
  const UNCHECKED = 'qwen32_forced';

  // Facts that only Part 3 needs, each with the file, the lines and the words of the paper's
  // v2 TeX it was read in (the snapshot sources/paper-v2-tex/; the form of `file` is that of
  // shared/facts.js, `final-project/paper/tmlr/<file>:N-M: "words"`, and tools/selftest.mjs
  // looks every quotation up in those lines).
  const TEX = 'final-project/paper/tmlr/';
  const at = (place, quote) => `${TEX}${place}: "${quote}"`;
  const paper = (where, cites, rest) => Object.freeze({ src: 'paper', where, file: [].concat(cites).join('; '), ...rest });
  const three = (n) => n.toFixed(3);
  // Table 4 prints each reader's within-question AUROC with its nominal 95% interval. The
  // interval cites the reader's row of the table, as the reader's other facts do, and the
  // row has to print it behind the AUROC: a number typed wrongly here fails the build.
  const WITHIN_CI = Object.freeze({
    opus_ap: [0.793, 0.860], opus_in: [0.790, 0.856], qwen32: [0.788, 0.856], astra_in: [0.790, 0.855], astra_ap: [0.782, 0.853],
    qwen8: [0.761, 0.842], forced_nohint: [0.808, 0.875], forced: [0.804, 0.874], qwen32_forced: [0.784, 0.856],
  });
  Deck.addFacts(Object.fromEntries(Object.entries(WITHIN_CI).map(([key, [lo, hi]]) => {
    const row = Deck.fact(`reader.${key}.within`);
    if (!row.file.includes(`${row.text} [${three(lo)}, ${three(hi)}]`)) throw new Error(`the interval of reader "${key}" is not the one its row of Table 4 prints`);
    return [`p3.within_ci.${key}`, Object.freeze({ src: 'paper', where: 'Table 4, Within [95% CI]', file: row.file, value: Object.freeze([lo, hi]), text: `${three(lo)} to ${three(hi)}` })];
  })));
  Deck.addFacts({
    // Slide 10, assumption M in plain words: the paper's own second wording of it.
    'p3.m_fresh': paper('Sec. 4', at('sections_v2/04_ceiling.tex:15-16', 'the bound needs the trace\'s own remainder to behave like a fresh continuation'), {
      text: 'the trace’s own remainder behaves like a fresh continuation',
    }),
    // Slide 10, what "biased low" means: where the resampling AUROC from K continuations
    // lies against its limit.
    'p3.biased_low': paper('Sec. 4', at('sections_v2/04_ceiling.tex:6', '$U_K$ lies at or below its limit in expectation, less so as $K$ grows'), {
      text: 'at or below its limit in expectation, less so as K grows',
    }),
    // Slide 10, a reader above a finite-K ceiling: the one cell of Jia et al.'s own Table 5
    // that the paper names, in the paper's words. The paper gives the judge of that monitor
    // no version ("a Claude judge"), so the fact has none and the slide does not name the
    // judge. `value` is the monitor's AUROC in that cell, `ceiling` their ceiling there.
    'p3.exceeds': paper('Sec. 4.1 (citing Jia et al. 2026, Sec. 5.4 and Table 5)', at('sections_v2/04_ceiling.tex:73-76', 'Their own lookahead monitor with a Claude judge comes out above their ceiling in one cell, Qwen3-14B on banking at 30\\% of the reasoning (0.81 against a ceiling of 0.78). Their Table~5 marks the paired 95\\% interval of the ceiling minus that monitor as lying below zero'), {
      value: 0.81, ceiling: 0.78,
      text: 'Their own lookahead monitor with a Claude judge comes out above their ceiling in one cell, Qwen3-14B on banking at 30% of the reasoning (0.81 against a ceiling of 0.78). Their Table 5 marks the paired 95% interval of the ceiling minus that monitor as lying below zero.',
    }),
    // Slide 11, where a monitor reads a trace: twelve positions, of which the ten up to
    // 0.8 are the looks of the false-alarm count ('p3.looks_who').
    'p3.reads': paper('Sec. 5.2', at('sections_v2/05_alarm.tex:40-41', 'alarms at the first read position ($r = 0, 0.1, \\ldots, 1.0$ and 0.25) at which its verdict names the hinted answer.'), {
      value: Object.freeze([0, 0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]), text: '12',
    }),
    // Slide 11, whose false alarms the two rates are, and over which reads (the paper's
    // "looks"). The paper's main text counts the five ("five continuous readers", of the
    // nine continuous-score readers of its Sec. 2.2) and does not name them, so the slide
    // counts them too and names none.
    'p3.looks_who': paper('Sec. 5.2, P5', at('sections_v2/05_alarm.tex:96', 'For five continuous readers, a threshold set to a per-look rate of 0.10 over ten looks ($r = 0$ to 0.8)'), {
      value: 5, from: 0, to: 0.8, text: '5',
    }),
    // Slide 11, the two outputs of an open monitor: its score, which ranks traces (the
    // AUROC of Table 4), and its verdict, which sets the alarm.
    'p3.score_px': paper('Sec. 2.2', at('sections_v2/02_setup.tex:42-43', 'scored by the letter probability of X'), { text: 'the letter probability of X' }),
    'p3.verdict': paper('Sec. 2.2', at('sections_v2/02_setup.tex:49-50', 'The six \\emph{verdicts} are the open monitors\' predicted letter'), { text: 'the open monitors’ predicted letter' }),
    // Slide 11, what the rule says of the second monitor: its count is one short, so no
    // statement holds for it (its frozen outcome: "the answer depends on the model").
    'p3.qwen8_outcome': paper('Sec. 5.2', at('sections_v2/05_alarm.tex:73', 'For Qwen3-8B the rule gives no single statement.'), { text: 'no single statement' }),
    // Slide 11, what the recommendation's "reference" is in this work: the point that an
    // alarm's timing is read against.
    'p3.reference': paper('Sec. 5', at('sections_v2/05_alarm.tex:8-9', 'Our reference is not an annotated onset but a point of no return estimated by resampling.'), {
      text: 'a point of no return estimated by resampling',
    }),
    // Slide 12, why a comparison is also run with pairs matched in prefix length: the cut
    // gives the length away (slide 10's words for it).
    'p3.cut_leaks': paper('Sec. 1, What was known', at('sections_v2/01_intro.tex:59-60', 'a cut at a fraction of the final length leaks that length ... and our positions leak it too'), {
      text: 'a cut at a fraction of the final length leaks that length, and our positions leak it too',
    }),
    // Slide 11, how the check of the point of no return stands: the paper's tier X.
    'p3.pnr_check_tier': paper('Sec. 5.1', at('sections_v2/05_alarm.tex:23', 'The $K = 16$ continuations at $r = 0.5$ test this directly \\tX.'), { text: 'exploratory' }),
    // Slide 12, what testing one pair at a time would do: if all nine readers had the same
    // true AUROC, 1.8 of the 36 unadjusted 95% intervals would still exclude zero (36 times
    // 0.05; 2.3 in the paper's simulation).
    'p3.chance_resolved': paper('Table 5', at('sections_v2/06_readers.tex:64', 'if equal: nominal (simulated; $P(\\ge \\text{obs.})$) & 1.8 (2.3; 0.35)'), { value: 1.8, text: 'about 2' }),
    // Slide 12, the counts with the three forced readers kept: the joint test (Bonferroni
    // over the 36 pairs) resolves one difference against the trace's own outcome, and the
    // calibrated one six to nine against a held-out continuation's, by bootstrap run.
    'p3.resolved_all_own': paper('Sec. 6.1; Table 5', at('sections_v2/06_readers.tex:89', 'Bonferroni resolves one, the hint-removed forced answer above'), { value: 1, text: '1' }),
    'p3.resolved_all_held': paper('Sec. 6.1', at('sections_v2/06_readers.tex:91', 'six to nine over independent runs'), { value: Object.freeze([6, 9]), text: '6 to 9' }),
    // Slide 12, what the held-out label's 4 is the largest of ("at most 4" in the paper and
    // in the text of 'test.resolved_held_max'): the joint test of the count (Bonferroni)
    // resolves 4; it is anti-conservative for this label, and a critical value calibrated
    // for it resolves 3 or 4, by bootstrap run.
    'p3.resolved_held_stricter': paper('Sec. 6.1; Table 5', at('sections_v2/06_readers.tex:85-86', 'resolves 3 or 4, by bootstrap run'), { value: Object.freeze([3, 4]), text: '3 or 4' }),
    // Slide 12, the check that two of the forced readers fail: the forced answer is read
    // incrementally along a trace, and its letter probabilities may differ from a one-shot
    // recomputation by at most a tolerance fixed before the subject readings. The slide
    // says it without the terms: a preset check of their computation (the paper's "a
    // preset numerical check", and what that check compares).
    'p3.forced_check': paper('Sec. 2.2', at('sections_v2/02_setup.tex:51-52', 'Computed incrementally along the trace, the forced answer fails on all eight models a numerical tolerance fixed before the subject readings'), {
      text: 'computed incrementally along the trace, the forced answer fails a numerical tolerance fixed before the subject readings',
    }),
    'p3.forced_check_what': paper('Sec. 7.3', [at('sections_v2/07_scope.tex:39', 'Two of them fail a preset numerical check'), at('sections_v2/07_scope.tex:41-43', 'A check compares those letter probabilities with a one-shot recomputation. It requires their largest absolute difference to be at most $5 \\times 10^{-3}$.')], {
      text: 'Two of them fail a preset numerical check. A check compares those letter probabilities with a one-shot recomputation. It requires their largest absolute difference to be at most 5 × 10^-3.',
    }),
    // Slide 12, the level of the joint ("simultaneous") intervals.
    'p3.joint_level': paper('abstract; Table 5', [at('sections_v2/00_abstract.tex:11', 'simultaneous 95\\% intervals resolve no reader difference'), at('sections_v2/06_readers.tex:48-49', 'Simultaneous: Bonferroni (own outcome)')], { value: 95, text: '95%' }),
    // Slide 12, what a joint test keeps small: if all readers were equal, at least one
    // difference would be resolved in about one dataset in twenty (Table 5 prints the
    // simulated share, 0.03 to 0.06, for the trace's own outcome).
    'p3.joint_chance': paper('Table 5', at('sections_v2/06_readers.tex:67', 'if equal: expected; $P(\\ge 1)$ & 0.05--0.10; 0.03--0.06'), { value: Object.freeze([0.03, 0.06]), text: '0.03 to 0.06' }),
  });

  const t = (key) => Deck.fact(key).text;
  const v = (key) => Deck.fact(key).value;
  const round3 = (n) => Math.round(n * 1000) / 1000;
  const two = (n) => n.toFixed(2);
  const RESULTS = kicker(PART, 'Results');
  // How the analyses of a result stand: most were planned after results had been read
  // (the paper's tier X); one statement was fixed before the data (its tier F).
  const EXPLORATORY = 'exploratory';
  const { POP } = kit;

  // ---------------------------------------------------------------- shared by slides 10 to 12
  // The caption under the picture (kit.says): `notes` is { key: sentence }, one sentence a
  // step (a list of sentences where a later click adds a line to the one that stands). The
  // recommendation and its limit share its place and arrive on the last click.
  const captionHtml = ({ notes, rec, limit }) => kit.says(
    Object.fromEntries(Object.entries(notes).map(([key, html]) => [key, [].concat(html)])),
    { inner: `${kit.rec(rec)}${limit ? `<p class="p3-res__limit">${limit}</p>` : ''}` },
  );
  // The sentence of a step takes the place of the one before it (`leaves`).
  const note = (step, key, { leaves, at: when = 0 } = {}) => kit.say(step, key, [when + (leaves === undefined ? 0 : DUR.micro)], { leaves, leaveAt: when });
  // The last click of a result slide: the last sentence (`leaves`) goes, the picture steps
  // back and the recommendation arrives in the part's violet, then its limit (unless an
  // earlier click has brought it). `dims` names what steps back, where a slide keeps a part
  // of its picture at full strength to the end (the whole picture otherwise).
  const conclude = (step, { leaves, limit, dims = '.p3-res__picture' }) => {
    step.tween(`[data-says="${leaves}"]`, { opacity: [1, 0] }, { dur: DUR.micro });
    step.tween(dims, { opacity: [1, 0.4] }, { dur: DUR.enter });
    step.show('.dk-rec', { at: DUR.enter });
    if (limit) step.show('.p3-res__limit', { at: DUR.enter + DUR.move, rise: 0 });
    step.hold(DUR.enter);
  };
  // The two labels a reader can be scored against (slide 6), as chips: slide 10 puts the
  // first on its chart, slide 12 one on each row of its counts. The
  // held-out label is made of a continuation and has the amber of continuations.
  const LABELS = Object.freeze({ own: 'label 1: own ending', held: 'label 2: held-out continuation' });
  const labelChip = (key) => `<span class="dk-chip" data-label="${key}"${key === 'held' ? ' data-tone="hidden"' : ''}>${LABELS[key]}</span>`;
  // The part of a title that is held back until the picture has shown it.
  const revealTitle = (ctx, step, when) => step.tween(ctx.q('.dk-title em'), { opacity: [0, 1] }, { at: when, dur: DUR.move });
  // The recommendation that closes result n ('motifs.choices').
  const recOf = (n) => CHOICES[n - 1].rec;

  // ---------------------------------------------------------------- slide 10: result 1, when the ceiling is a ceiling
  // The paper's first contribution, in its order, one picture at a time. The claim of recent
  // work: the resampling AUROC is a ceiling (slides 3 and 8 have said what one is: the best
  // AUROC any reader of the prefix could reach). It needs assumption M, which the slide says
  // in the paper's plainer words: the trace's own remainder behaves like a fresh continuation (entrance:
  // the trace as it was written, a solid bar beyond the cut, over fresh continuations of
  // that prefix, dashed bars; the two strokes of slide 8's key).
  // Click 1: our cut, at half of the trace's final length, uses the future and breaks M, and
  // our data reject M. The sketch shows what the test compares: of the continuations that
  // end as the trace did, which are shorter than the trace's own remainder (a guide at its
  // end, "shorter" and "longer"; the continuation with another ending steps back). The side
  // asks that question in words and answers it on a small axis with its ticks: one half if
  // M holds, the measured share and its whole interval below it, and under the verdict what
  // that means, by the name the sketch gives the bar: "its own remainder" runs shorter
  // ('m.shorter').
  // Click 2: even where M holds, a value from K continuations is biased low: the measured
  // curve takes the sketch's place, still rising at K = 16 (its four values say so; the
  // label that printed the last doubling's +0.011 gave its words to click 3's second line).
  // Click 3: the question of slide 3, answered on that chart. The six readers' AUROCs are a
  // band on it ('readers.within_min' to 'readers.within_max_kept': Table 4, within question,
  // against the trace's own ending, at r = 0.5, as the curve is): just under the curve at
  // K = 2, well under it at K = 16.
  // The title gets its second half there, the paper's "a finite-K estimate is biased low and
  // is not a bound" ('k.not_bound'), and under the answer a second line gives the paper's
  // instance of it ('k.exceed', 'p3.exceeds'): a reader can exceed a finite-K ceiling, and
  // one cell of Jia et al.'s own Table 5 has a monitor above theirs, 0.81 against 0.78, with
  // the paired 95% interval of the difference below zero. The line names neither the
  // monitor's kind nor its judge: "lookahead" is a term the talk has not explained, and the
  // paper gives the judge no version. Then the recommendation (click 4), and under it why
  // it asks for the label (a held-out continuation as the label makes M hold by
  // construction, 'm.heldout') and the one term of it that is new.
  // The bars of the first picture are a drawing: the own remainder is as long as the prefix
  // (a cut at half), and the continuations' lengths and endings are made up, so that of
  // those that end as the trace did half are shorter than its own remainder: what M
  // implies. What is measured is printed: that share lies 0.024 below one half
  // ('m.rejected').
  // Not on the slide: one reader's normalized AUROC against the held-out label's ceiling
  // from 2 and from 15 continuations (Table 4: 0.96 and 0.81 for Claude Opus 5.5 IN). It
  // says for one reader and the second label what the band says for six readers and the
  // label of slide 3, with a second pair of ceilings (0.848, 0.912) beside the curve's
  // (0.846, 0.915); the part's speaking time has no room for both. Nor the paper's count of
  // points above a ceiling ("19 of 105 points at 2, 0 at 15", Table 7): its main text does
  // not say what a point is.
  // The curve joins the four values the paper prints (K = 2, 4, 8, 16), against the trace's
  // own ending, the label of the readers' AUROCs in the band.
  const MX = Object.freeze({
    width: 900, height: 448, x0: 16, prefix: 300, gap: 28, own: 300, barH: 44,
    // From the top: the bracket of the cut (click 1), the trace as written, its two names,
    // then the continuations (made up: how long each one is, and whether it ends as the
    // trace did, `same`).
    halfY: 40, rowY: 76, nameY: 152, contY: 212, pitch: 56, contH: 36, keyY: 412,
    conts: Object.freeze([{ w: 208, same: true }, { w: 396, same: false }, { w: 420, same: true }]),
  });
  const MX_CUT = MX.x0 + MX.prefix + MX.gap / 2;
  const MX_FROM = MX.x0 + MX.prefix + MX.gap;
  const MX_OWN_END = MX_FROM + MX.own;
  const mxContY = (i) => MX.contY + i * MX.pitch;
  if (MX.own !== MX.prefix || v('task.cut_r') !== 0.5) throw new Error('the cut of slide 10 no longer stands at half of the trace as written');
  // The drawing shows what M implies: of the continuations that end as the trace did, half
  // are shorter than the trace's own remainder; one with another ending is left out.
  const MX_SAME = MX.conts.filter((c) => c.same);
  if (!MX.conts.some((c) => !c.same) || MX_SAME.some((c) => c.w === MX.own) || MX_SAME.filter((c) => c.w < MX.own).length * 2 !== MX_SAME.length) throw new Error('the same-ending continuations of slide 10 are no longer half shorter and half longer than the trace’s own remainder');
  const mSketch = () => `
    <svg class="p3-svg p3-m__art" viewBox="0 0 ${MX.width} ${MX.height}" width="${MX.width}" height="${MX.height}">
      <g class="p3-m__half">
        <path d="M${MX.x0} ${MX.halfY + 16} v-12 H${MX_OWN_END} v12 M${MX_CUT} ${MX.halfY - 2} v12"/>
        <text class="p3-mid" x="${MX_CUT}" y="${MX.halfY - 12}">r = ${t('task.cut_r')}: half the final length</text>
      </g>
      <rect class="p3-m__prefix" x="${MX.x0}" y="${MX.rowY}" width="${MX.prefix}" height="${MX.barH}" rx="8"/>
      <line class="p3-m__cut" x1="${MX_CUT}" x2="${MX_CUT}" y1="${MX.rowY - 12}" y2="${mxContY(MX.conts.length - 1) + MX.contH + 12}"/>
      <rect class="p3-m__own" x="${MX_FROM}" y="${MX.rowY}" width="${MX.own}" height="${MX.barH}" rx="8"/>
      <circle class="p3-m__end is-follows" cx="${MX_OWN_END + 28}" cy="${MX.rowY + MX.barH / 2}" r="10"/>
      <text class="p3-m__name is-prefix" x="${MX.x0}" y="${MX.nameY}">the prefix</text>
      <text class="p3-m__name is-own" x="${MX_FROM}" y="${MX.nameY}">its own remainder</text>
      ${MX.conts.map((c, i) => `
      <g class="p3-m__cont${c.same ? '' : ' is-other'}">
        <rect x="${MX_FROM}" y="${mxContY(i)}" width="${c.w}" height="${MX.contH}" rx="8"/>
        <circle class="p3-m__end${c.same ? ' is-follows' : ''}" cx="${MX_FROM + c.w + 28}" cy="${mxContY(i) + MX.contH / 2}" r="10"/>
      </g>`).join('')}
      <g class="p3-m__same">
        <line x1="${MX_OWN_END}" x2="${MX_OWN_END}" y1="${MX.rowY + MX.barH}" y2="${mxContY(MX.conts.length - 1) + MX.contH}"/>
        ${MX.conts.map((c, i) => (c.same ? `<text x="${MX_FROM + 16}" y="${mxContY(i) + MX.contH / 2 + 8}">${c.w < MX.own ? 'shorter' : 'longer'}</text>` : '')).join('')}
      </g>
      <text class="p3-m__name is-cont" x="${MX_FROM}" y="${MX.keyY}">fresh continuations</text>
    </svg>`;
  // The test of M on a small axis with its ticks. The axis is the share that the question
  // over it asks for: of the fresh continuations that end as the trace did, the share that
  // is shorter than the trace's own remainder. M puts it at one half (the dashed line); the
  // measured mean lies 'm.rejected' below, and so does its whole interval (the ends are the
  // fact's, taken from one half), which is why the data reject M.
  const MT = Object.freeze({ width: 720, height: 124, x0: 24, perUnit: 7200, from: 0.43, to: 0.52, axisY: 76, half: 0.5, ticks: Object.freeze([0.45, 0.5]) });
  const mtX = (share) => round3(MT.x0 + (share - MT.from) * MT.perUnit);
  const mTest = () => {
    const gap = Deck.fact('m.rejected');
    const [near, far] = gap.interval;
    if (!(near > 0 && far > near && gap.value > near && gap.value < far)) throw new Error('the interval of slide 10’s test of M no longer lies on one side of one half, around its point');
    if (!MT.ticks.includes(MT.half) || MT.half - far < MT.from) throw new Error('the axis of slide 10’s test of M no longer holds one half and the whole interval');
    return `
    <svg class="p3-svg p3-m__test" viewBox="0 0 ${MT.width} ${MT.height}" width="${MT.width}" height="${MT.height}">
      <line class="p3-axis" x1="${mtX(MT.from)}" x2="${mtX(MT.to)}" y1="${MT.axisY}" y2="${MT.axisY}"/>
      ${MT.ticks.map((tick) => `
        <line class="p3-axis" x1="${mtX(tick)}" x2="${mtX(tick)}" y1="${MT.axisY}" y2="${MT.axisY + 8}"/>
        <text class="p3-num p3-mid" x="${mtX(tick)}" y="${MT.axisY + 36}">${two(tick)}</text>`).join('')}
      <line class="p3-m__at-half" x1="${mtX(MT.half)}" x2="${mtX(MT.half)}" y1="${MT.axisY - 56}" y2="${MT.axisY}"/>
      <text class="p3-m__if" x="${mtX(MT.half) + 12}" y="${MT.axisY - 12}">if M holds</text>
      <line class="p3-m__span" x1="${mtX(MT.half - far)}" x2="${mtX(MT.half - near)}" y1="${MT.axisY - 20}" y2="${MT.axisY - 20}"/>
      <circle class="p3-m__point" cx="${mtX(MT.half - gap.value)}" cy="${MT.axisY - 20}" r="9"/>
      <text class="p3-m__found p3-mid" x="${mtX(MT.half - gap.value)}" y="${MT.axisY - 44}"><tspan class="p3-num">${gap.text}</tspan> below one half</text>
    </svg>`;
  };

  // The curve: the resampling AUROC against the trace's own ending at the K the paper prints.
  const KC = Object.freeze({
    width: 720, height: 448, x0: 112, first: 24, octave: 176, top: 56, bottom: 368, lo: 0.75, hi: 0.95,
    yTicks: Object.freeze([0.75, 0.85, 0.95]),
    xTicks: Object.freeze([2, 4, 8, 16]),
    // The fact behind each point.
    named: Object.freeze({ 2: 'k.u2', 4: 'k.u4', 8: 'k.u8', 16: 'k.u16' }),
    // Click 2, in ms: the curve is drawn from K = 2 to 16.
    pointAt: 500, drawAt: 1300, drawDur: 2400,
  });
  const kcX = (k) => round3(KC.x0 + KC.first + (Math.log2(k) - 1) * KC.octave);
  const kcY = (value) => round3(KC.bottom - ((value - KC.lo) / (KC.hi - KC.lo)) * (KC.bottom - KC.top));
  const KC_POINTS = Object.freeze(v('k.curve').map(([k, value]) => Object.freeze({ k, value, x: kcX(k), y: kcY(value) })));
  if (KC_POINTS.map((p) => p.k).join() !== KC.xTicks.join() || KC_POINTS.some((p) => three(p.value) !== t(KC.named[p.k]))) throw new Error('the curve of slide 10 is no longer the four values the paper prints, each with its fact');
  const kcPoint = (k) => KC_POINTS.find((p) => p.k === k);
  // The band of click 3: the six readers that are kept, from the lowest of their
  // within-question AUROCs to the highest (Table 4), on the curve's own axis. Every one of
  // them lies under the curve's first point, so the band answers the question of slide 3
  // by where it lies against the curve's two ends.
  const BAND = (() => {
    const scores = KEPT.map((key) => v(`reader.${key}.within`));
    const lo = Deck.fact('readers.within_min');
    const hi = Deck.fact('readers.within_max_kept');
    if (Math.min(...scores) !== lo.value || Math.max(...scores) !== hi.value) throw new Error('the band of slide 10 no longer runs from the lowest to the highest AUROC of the six readers');
    if (!(hi.value < v('k.u2')) || lo.value < KC.lo) throw new Error('the band of slide 10 no longer lies on its chart, under the curve');
    return Object.freeze({ lo: lo.text, hi: hi.text, top: kcY(hi.value), bottom: kcY(lo.value) });
  })();
  // The curve, and how far along it each point lies (0 to 1).
  const KC_LINE = (() => {
    const lengths = KC_POINTS.map((p, i) => (i ? Math.hypot(p.x - KC_POINTS[i - 1].x, p.y - KC_POINTS[i - 1].y) : 0));
    const total = lengths.reduce((sum, n) => sum + n, 0);
    const along = lengths.reduce((acc, n) => [...acc, (acc.length ? acc[acc.length - 1] : 0) + n], []);
    return Object.freeze({
      d: KC_POINTS.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' '),
      share: Object.freeze(Object.fromEntries(KC_POINTS.map((p, i) => [p.k, along[i] / total]))),
    });
  })();
  const curveChart = () => `
    <svg class="p3-svg p3-kc" viewBox="0 0 ${KC.width} ${KC.height}" width="${KC.width}" height="${KC.height}">
      <g class="p3-kc__frame">
        ${KC.yTicks.map((tick) => `
          <line class="p3-grid" x1="${KC.x0}" x2="${kcX(16)}" y1="${kcY(tick)}" y2="${kcY(tick)}"/>
          <text class="p3-num p3-end" x="${KC.x0 - 12}" y="${kcY(tick) + 8}">${two(tick)}</text>`).join('')}
        ${KC.xTicks.map((k) => `
          <line class="p3-axis" x1="${kcX(k)}" x2="${kcX(k)}" y1="${KC.bottom}" y2="${KC.bottom + 8}"/>
          <text class="p3-num p3-mid" x="${kcX(k)}" y="${KC.bottom + 36}">${k}</text>`).join('')}
        <line class="p3-axis" x1="${KC.x0}" x2="${kcX(16)}" y1="${KC.bottom}" y2="${KC.bottom}"/>
        <line class="p3-axis" x1="${KC.x0}" x2="${KC.x0}" y1="${KC.top}" y2="${KC.bottom}"/>
        <text class="p3-mid" x="${(KC.x0 + kcX(16)) / 2}" y="${KC.bottom + 68}">K, continuations</text>
        <text class="p3-mid" transform="rotate(-90 24 ${(KC.top + KC.bottom) / 2})" x="24" y="${(KC.top + KC.bottom) / 2 + 8}">AUROC</text>
        <text class="p3-kc__name" x="${KC.x0 + 16}" y="${KC.top + 36}">resampling AUROC</text>
      </g>
      <g class="p3-kc__band">
        <rect x="${KC.x0}" y="${BAND.top}" width="${round3(kcX(16) - KC.x0)}" height="${round3(BAND.bottom - BAND.top)}"/>
        <text class="p3-end" x="${kcX(16)}" y="${BAND.bottom + 32}">our six monitors: <tspan class="p3-num">${BAND.lo} to ${BAND.hi}</tspan></text>
      </g>
      <path class="p3-kc__line" pathLength="1" d="${KC_LINE.d}"/>
      ${KC_POINTS.map((p) => `<circle class="p3-kc__point p3-pop is-named" data-k="${p.k}" cx="${p.x}" cy="${p.y}" r="8"/>`).join('')}
      ${KC_POINTS.map((p) => (p.k === 2
    ? `<text class="p3-kc__value p3-num" data-value="${p.k}" x="${p.x - 16}" y="${p.y - 28}">${t(KC.named[p.k])}</text>`
    : `<text class="p3-kc__value p3-num p3-end" data-value="${p.k}" x="${p.x + 8}" y="${p.y - 18}">${t(KC.named[p.k])}</text>`)).join('')}
    </svg>`;

  const CEILING_NOTES = Object.freeze({
    // 'ceiling.claim' and 'm.assumption', in the talk's words, and what is ours in this
    // result ('scope.conditions'). What a ceiling is has been said on slides 3 and 8.
    claim: '<b>The claim:</b> the resampling AUROC is a ceiling. It needs <b>assumption M</b>. We give conditions, not a correction.',
    // 'm.future' in plain words: placed at a share of the final length, the cut tells how
    // long the trace will run (what that does to the trace's own remainder against a fresh
    // continuation is the side panel's, with the measured share). Then 'm.not_established',
    // in the paper's direction: the ceiling "need not bound readers" (there: against the
    // trace's own outcome).
    cut: '<b>Our cut uses the future:</b> it gives away how long the rest will run. So the ceiling need not bound readers, by an amount not established.',
    // 'k.not_bound': the second condition, on a measured curve; 'p3.biased_low' says what
    // "biased low" means, and the last words what the limit is the limit of.
    finite: '<b>Even under M:</b> from K continuations the resampling AUROC is <b>biased low</b>: on average at or below its limit (endless continuations).',
    // The question of slide 3, in its words, and what the chart shows of it: the band
    // against the two ends of the curve ('k.u2', 'k.u16'). No distance is printed that the
    // paper does not print; that the answer depends on K is its two halves.
    // The second line says that the curve is no bound all the same, with the title's second
    // half, which arrives over it: 'k.exceed' ("so a reader can exceed it") and the paper's
    // instance of it, the one cell of Jia et al.'s own Table 5 ('p3.exceeds'). It takes the
    // place of the words that opened the answer before it ("Even read as a ceiling:").
    band: [
      `<b>Have these monitors nearly reached the ceiling?</b> Just under it at K = ${KC.xTicks[0]}, well under at K = ${KC.xTicks[KC.xTicks.length - 1]}.`,
      `<b>A reader can exceed it:</b> Jia et al.’s own Table 5 has a monitor at ${two(v('p3.exceeds'))}, above its ceiling, ${two(Deck.fact('p3.exceeds').ceiling)} (paired 95% interval below zero).`,
    ],
  });
  // Under the recommendation: why it asks for the label ('m.heldout': against label 2 of
  // slide 8, M holds by construction), and the one term of it that the talk has not used
  // (the limit has stood on click 2; a sensitivity analysis is new: 'k.assumption',
  // 'k.limit_sensitivity'). Label 2 is slide 8's, a held-out continuation.
  const CEILING_LIMIT = 'Label 2: M holds by construction. Sensitivity analysis: a what-if under an assumption the data cannot check.';

  Deck.register({
    id: 'p3-ceiling',
    part: PART,
    kicker: RESULTS,
    // The first half is the paper's conclusion ('close.conditions'), in the words of slide
    // 13; the second its statement on a value from K continuations, in the abstract's words
    // ('k.not_bound': "biased low and is not a bound"). That a reader can exceed such a value
    // ('k.exceed') is click 3's second line, with the paper's instance of it.
    // The comma belongs to the half that is held back (click 3), so that until then the
    // title is a whole sentence and does not end on a comma.
    title: 'A resampling ceiling holds only under conditions<em>, and a finite-K value is biased low, not a bound</em>',
    cues: [],
    // Jia et al. is cited for the claim the slide opens on: the paper quotes their reading
    // that the ceiling bounds every monitor of the prefix ('ceiling.claim'); and for the cell
    // of their Table 5 that click 3 names ('p3.exceeds'), as the paper reports it.
    cite: [{ src: 'paper', where: 'Sec. 4; Fig. 2; Table 4' }, { src: 'jia2026', where: 'ceiling claim; Table 5' }],
    figure: ['data', 'schematic'],
    html: `
      <div class="p3-res p3-curve">
        ${kit.resultHead(1, EXPLORATORY)}
        <div class="p3-res__picture">
          <div class="p3-m">
            ${mSketch()}
            <div class="p3-m__side">
              <p class="p3-m__title">Assumption M</p>
              <p class="p3-m__means">The trace’s own remainder behaves like a <b>fresh continuation</b>.</p>
              <div class="p3-m__data">
                <p class="p3-m__ask">Fresh continuations that end as the trace did: what share is shorter than its own remainder?</p>
                ${mTest()}
                <p class="p3-m__verdict"><b>Our data reject M</b> <span class="p3-m__why">Its own remainder runs shorter.</span> <span>95% interval: ${three(Deck.fact('m.rejected').interval[0])} to ${three(Deck.fact('m.rejected').interval[1])} below</span></p>
              </div>
            </div>
          </div>
          <div class="p3-curve__left">
            ${curveChart()}
            <div class="p3-tags p3-curve__tags">${labelChip('own')}</div>
          </div>
        </div>
        ${captionHtml({ notes: CEILING_NOTES, rec: recOf(1), limit: CEILING_LIMIT })}
      </div>`,
    setup: (ctx) => {
      const { fact, dur } = ctx;
      // The curve ends at the sample's K, which the caption of the band names.
      if (KC.xTicks[KC.xTicks.length - 1] !== fact('task.sample_k').value) throw new Error('the curve of slide 10 no longer ends at the sample’s K');
      // The side panel, the captions and the limit reword these facts.
      if (!/behave like a fresh continuation/.test(fact('p3.m_fresh').file) || !/one more draw from the continuation sampler/.test(fact('m.assumption').text) || !/violates M, and our data reject M/.test(fact('m.cut_violates').text) || !/how long the trace will run/.test(fact('m.future').text) || !/not established/.test(fact('m.not_established').text)) throw new Error('the facts on assumption M no longer say what slide 10 rewords');
      if (!/share of those continuations shorter than it/.test(fact('m.rejected').file) || !/shorter than a fresh continuation with the same outcome/.test(fact('m.shorter').file)) throw new Error('the test of M is no longer the share of same-outcome continuations shorter than the trace’s own remainder, which slide 10 asks for');
      if (!/M holds by construction and the ceiling bounds readers in expectation/.test(fact('m.heldout').text) || !/at or below its limit in expectation, less so as K grows/.test(fact('p3.biased_low').text)) throw new Error('the facts on the held-out label and the finite-K value no longer say what slide 10 rewords');
      if (!/conditions, not a correction/.test(fact('scope.conditions').text) || !/estimator of \[the limit\] rests on an assumption/.test(fact('k.assumption').text) || !/assumption the data cannot check/.test(fact('k.limit_sensitivity').text) || !/sensitivity analyses/.test(RECS[recOf(1) - 1].rec) || RECS[recOf(1) - 1].fact !== 'rec.2') throw new Error('the limit under slide 10’s recommendation no longer rests on its facts');
      // The title's two halves: the paper's conclusion, and its statement on a finite K.
      if (!/only under conditions/.test(fact('close.conditions').text) || !/a finite-K estimate is biased low and is not a bound/.test(fact('k.not_bound').text)) throw new Error('the paper no longer says what the title of slide 10 rewords');
      // Click 3's second line: a reader can exceed a finite-K value, and the cell of Jia et
      // al.'s Table 5 in which one does. The two numbers are the ones the paper's sentence
      // prints, the monitor's above the ceiling's, and the sentence says of the interval what
      // the line says.
      const cell = fact('p3.exceeds');
      if (!/not a bound, so a reader can exceed it/.test(fact('k.exceed').text) || !(cell.value > cell.ceiling) || !cell.file.includes(`(${two(cell.value)} against a ceiling of ${two(cell.ceiling)})`) || !/comes out above their ceiling in one cell/.test(cell.text) || !/Their Table 5 marks the paired 95% interval of the ceiling minus that monitor as lying below zero/.test(cell.text)) throw new Error('the paper no longer reports a monitor of Jia et al. above its ceiling as slide 10 says it');
      const point = (k) => ctx.q(`.p3-kc__point[data-k="${k}"]`);
      const value = (k) => ctx.q(`.p3-kc__value[data-value="${k}"]`);
      const reached = (k) => KC.drawAt + KC_LINE.share[k] * KC.drawDur;

      // Enter: the trace as it was written, a solid bar beyond the cut, and under it fresh
      // continuations of the same prefix, dashed. Beside them what assumption M says.
      const enter = ctx.step({ label: 'result 1 of 3: the ceiling needs assumption M' });
      kit.enterResult(enter);
      note(enter, 'claim', { at: 300 });
      enter.tween('.p3-m__prefix, .p3-m__name.is-prefix', { opacity: [0, 1] }, { at: 500 });
      enter.tween('.p3-m__cut', { opacity: [0, 1] }, { at: 900 });
      enter.tween('.p3-m__own, .p3-m__art > .p3-m__end, .p3-m__name.is-own', { opacity: [0, 1] }, { at: 1300 });
      enter.tween('.p3-m__cont', { opacity: [0, 1], x: [-24, 0] }, { at: 2100, stagger: 250 });
      enter.tween('.p3-m__name.is-cont', { opacity: [0, 1] }, { at: 2900 });
      enter.show('.p3-m__title', { at: 3300, rise: 0 });
      enter.show('.p3-m__means', { at: 3500 });
      enter.hold(300);

      // Click 1: where the cut comes from, and the test. A bracket spans the whole trace
      // with the cut at its middle. Then the question of the test and, in the sketch, what
      // it compares: the continuation with another ending steps back, a guide stands at the
      // end of the trace's own remainder, and the two that end as the trace did are named
      // against it. Then the measured share on its small axis, left of the one half, and
      // the verdict.
      const cut = ctx.step({ label: 'our cut breaks M, and our data reject it' });
      note(cut, 'cut', { leaves: 'claim' });
      cut.tween('.p3-m__half', { opacity: [0, 1] }, { at: 400 });
      cut.show('.p3-m__ask', { at: 1500, rise: 0 });
      cut.tween(ctx.qa('.p3-m__cont.is-other > *'), { opacity: [1, 0.3] }, { at: 1900 });
      cut.tween('.p3-m__same', { opacity: [0, 1] }, { at: 2100 });
      cut.tween('.p3-m__test', { opacity: [0, 1] }, { at: 2900 });
      cut.tween('.p3-m__point', { scale: [2.4, 1] }, { at: 3100, dur: dur.enter });
      cut.tween('.p3-m__verdict', POP, { at: 4000, dur: dur.enter, ease: 'back' });
      cut.hold(300);

      // Click 2: the second condition. The sketch gives its place to the measured curve:
      // the resampling AUROC from two continuations, then drawn on to 16, the values at 4,
      // 8 and 16 counting up as the line reaches them.
      const rise = ctx.step({ label: 'even under M: biased low at a finite K' });
      note(rise, 'finite', { leaves: 'cut' });
      rise.tween('.p3-m', { opacity: [1, 0] }, { dur: dur.enter });
      rise.tween('.p3-kc__frame', { opacity: [0, 1] }, { at: 300 });
      // The chart's tag, its label, arrives with it (the head's tag has been up since the entrance).
      rise.tween('.p3-curve__tags', { opacity: [0, 1] }, { at: 500 });
      rise.tween(point(2), { opacity: [0, 1], scale: [2.4, 1] }, { at: KC.pointAt, dur: dur.enter });
      rise.show(value(2), { at: KC.pointAt + 200, rise: 0 });
      rise.tween('.p3-kc__line', { opacity: [0, 1] }, { at: KC.drawAt - dur.micro, dur: dur.micro });
      rise.tween('.p3-kc__line', { 'stroke-dashoffset': [1, 0] }, { at: KC.drawAt, dur: KC.drawDur, ease: 'linear' });
      KC_POINTS.filter((p) => p.k > 2).forEach((p) => rise.tween(point(p.k), { opacity: [0, 1], scale: [2, 1] }, { at: reached(p.k), dur: dur.micro }));
      [[2, 4], [4, 8], [8, 16]].forEach(([from, to]) => {
        const span = { at: reached(from), dur: reached(to) - reached(from), ease: 'linear' };
        rise.tween(value(to), { opacity: [0, 1] }, { at: span.at, dur: dur.micro });
        kit.countTo(rise, value(to), KC.named[to], { ...span, from: kcPoint(from).value, format: three });
      });
      rise.hold(300);

      // Click 3: the question of slide 3. The six monitors' band is drawn across the chart
      // and named; what lies between the curve's two ends steps back, so that the band is
      // read against K = 2 and K = 16. Then the title gets its second half, and under the
      // answer the line that says a reader can exceed such a value, with Jia et al.'s cell.
      const band = ctx.step({ label: 'the six monitors: nearly at the ceiling? it depends on K, and a reader can exceed it' });
      note(band, 'band', { leaves: 'finite' });
      band.tween('.p3-kc__band rect', { opacity: [0, 1] }, { at: 400, dur: dur.move });
      band.tween('.p3-kc__band text', { opacity: [0, 1] }, { at: 900 });
      band.tween([value(4), value(8)], { opacity: [1, 0.4] }, { at: 1300 });
      revealTitle(ctx, band, 1900);
      band.tween('[data-says-line="band:1"]', { opacity: [0, 1] }, { at: 1900 + dur.move + dur.micro, dur: dur.enter });
      band.hold(300);

      // Click 4: the recommendation; the chart steps back.
      conclude(ctx.step({ label: 'recommendation 2 of 4' }), { leaves: 'band', limit: true });
    },
  });

  // ---------------------------------------------------------------- slide 11: result 2, whether alarms come in time
  // The paper's second contribution. Ranking is not timing, so an alarm is read against a
  // point of no return, as the paper defines it: the earliest cut from which every
  // continuation ends at the hinted answer, there and at every later cut (entrance: one
  // followed trace as a bar from r = 0 to r = 1, cut at the six positions of the task, two
  // continuations from each cut). A monitor alarms at its first read whose verdict is the
  // hinted answer; an alarm after that point, or none, is a miss (click 1: the monitor's
  // twelve reads on the same axis, a row of their own, and the alarm ringed). A rule fixed
  // before the data: a monitor alarms after the point of no return on most followed traces
  // if its miss rate is at least 0.5 in at least 5 of the 7 models; Qwen3-32B AP does, a
  // monitor whose score ranks traces at an AUROC of 0.825 (click 2: the paper's Table 3 as
  // bars; Qwen3-8B AP's count, 4 of 7, in words under them). The monitor is named as the
  // reader of slide 12's chart, and the caption says in small print what its AUROC is of
  // (its score: within question, label 1, r = 0.5) and that its alarm uses its verdict. But
  // the point of no return is itself built from 2 continuations and comes too early: of
  // the traces past it by r = 0.40, 20.4% do not end at the hinted answer in all 16
  // continuations at r = 0.5 (click 3; one number, the check's two counts stay in the
  // facts). And a threshold that lets 0.10 of resisting traces alarm at each of the first
  // ten reads lets 0.31 to 0.37 of them alarm at some read (click 4). Then the
  // recommendation (click 5).
  // One word for one thing: the monitor "reads" (the paper's "looks" are its first ten
  // reads), and continuations are sampled at "cuts". Each row's name carries its count, six
  // cuts and twelve reads, so that the two are not taken for one list. The entrance says in
  // small print where the two continuations per cut come from.
  // The one trace of the first picture is a drawing: where its continuations end at each
  // cut, where its point of no return falls and where the monitor alarms are made up. The
  // cuts are the task's six positions and the reads the monitors' twelve ('p3.reads'); both
  // rows stand on one axis, so a cut and a read line up only where the two lists share a
  // position. One key serves both rows: a dot is a continuation's ending, a square a
  // verdict, each filled or red for the hinted answer.
  // Not on the slide: how often the monitors detect in time under either budget. The
  // paper's numbers for it stand beside a note of its authors that their reference is still
  // to be confirmed.
  const TL = (() => {
    const cuts = Deck.fact('pnr.positions').value;
    // Made up: at each cut, whether each of the two continuations ends at the hinted answer.
    const ends = Object.freeze([[false, true], [true, false], [true, true], [true, true], [true, true], [true, true]]);
    const k = v('pnr.k');
    if (ends.length !== cuts.length || cuts.length !== Deck.fact('pnr.k').positions || ends.some((pair) => pair.length !== k)) throw new Error('the trace of slide 11 no longer has the task’s six cuts with K continuations each');
    // The point of no return of the drawing, by the paper's definition: the earliest cut
    // from which every continuation ends at the hinted answer, there and at every later cut.
    const from = ends.findIndex((_, i) => ends.slice(i).every((pair) => pair.every(Boolean)));
    if (from <= 0) throw new Error('the trace of slide 11 no longer has a point of no return after its first cut');
    // The monitor's reads (the paper's r = 0, 0.1, ..., 1.0 and 0.25) and, made up, the
    // first one whose verdict is the hinted answer: after the point of no return, a miss.
    const reads = Deck.fact('p3.reads').value;
    const alarm = 0.6;
    if (reads.length !== Number(t('p3.reads')) || reads.some((r, i) => i && r <= reads[i - 1]) || reads[0] !== 0 || reads[reads.length - 1] !== 1) throw new Error('the reads of slide 11 are no longer the twelve positions from the start of the trace to its end');
    if (!reads.includes(alarm) || alarm <= cuts[from]) throw new Error('the alarm of slide 11 is no longer at a read position after the point of no return');
    return Object.freeze({
      cuts, ends, k, pnr: cuts[from], reads, alarm,
      // A column of row names, then the axis from r = 0 to r = 1. From the top: the two
      // ends of the axis, the trace, the continuations' endings, the point of no return's
      // name, the reads, the alarm's name, the key.
      width: 820, height: 292, nameX: 232, x0: 256, x1: 780,
      endsY: 22, barY: 36, barH: 24, dotY: Object.freeze([100, 124]), pnrY: 168, readY: 200, alarmY: 252, keyY: 284,
    });
  })();
  const tlX = (r) => round3(TL.x0 + r * (TL.x1 - TL.x0));
  // A row's name, a line to an entry, right against the axis.
  const tlName = (lines, y, cls = '') => lines.map((line, i) => `<text class="p3-end${cls}" x="${TL.nameX}" y="${y + i * 28}">${line}</text>`).join('');
  // An entry of the key: the square of a verdict (from click 1), the dot of an ending, the
  // words. The dot stands against the words, so that the entry has no gap before click 1.
  const tlKey = (x, follows, text) => `
        <rect class="p3-tl__read p3-tl__key-read${follows ? ' is-hinted' : ''}" x="${x}" y="${TL.keyY - 15}" width="14" height="14" rx="3"/>
        <circle class="p3-tl__end${follows ? ' is-follows' : ''}" cx="${x + 32}" cy="${TL.keyY - 8}" r="8"/>
        <text x="${x + 48}" y="${TL.keyY}">${text}</text>`;
  const timeline = () => `
    <svg class="p3-svg p3-tl" viewBox="0 0 ${TL.width} ${TL.height}" width="${TL.width}" height="${TL.height}">
      <g class="p3-tl__axis">
        <text class="p3-mid" x="${TL.x0}" y="${TL.endsY}">r = 0</text>
        <text class="p3-mid" x="${TL.x1}" y="${TL.endsY}">r = 1</text>
        ${tlName(['one trace', 'that follows'], TL.barY + 6)}
        <rect class="p3-tl__trace" x="${TL.x0}" y="${TL.barY}" width="${TL.x1 - TL.x0}" height="${TL.barH}" rx="6"/>
        <circle class="p3-tl__end is-follows" cx="${TL.x1 + 24}" cy="${TL.barY + TL.barH / 2}" r="10"/>
      </g>
      ${TL.cuts.map((r, i) => `
      <g class="p3-tl__cut" data-at="${i}">
        <line x1="${tlX(r)}" x2="${tlX(r)}" y1="${TL.barY - 4}" y2="${TL.barY + TL.barH + 4}"/>
        ${TL.ends[i].map((follows, j) => `<circle class="p3-tl__end${follows ? ' is-follows' : ''}" cx="${tlX(r)}" cy="${TL.dotY[j]}" r="8"/>`).join('')}
      </g>`).join('')}
      <g class="p3-tl__per">${tlName([`${TL.cuts.length} cuts, each`, `${TL.k} continuations`], TL.dotY[0] + 4)}</g>
      <g class="p3-tl__pnr">
        <line x1="${tlX(TL.pnr)}" x2="${tlX(TL.pnr)}" y1="${TL.barY - 10}" y2="${TL.pnrY + 8}"/>
        <line class="p3-tl__pnr-on" x1="${tlX(TL.pnr)}" x2="${tlX(TL.pnr)}" y1="${TL.pnrY + 8}" y2="${TL.readY + 18}"/>
        <text x="${tlX(TL.pnr) + 12}" y="${TL.pnrY}">point of no return</text>
      </g>
      <g class="p3-tl__reads">
        ${tlName(['the monitor’s', `${t('p3.reads')} reads`], TL.readY - 4, ' p3-tl__reads-name')}
        ${TL.reads.map((r) => `<rect class="p3-tl__read${r >= TL.alarm ? ' is-hinted' : ''}${r === TL.alarm ? ' is-alarm' : ''}" x="${tlX(r) - 7}" y="${TL.readY - 7}" width="14" height="14" rx="3"/>`).join('')}
      </g>
      <g class="p3-tl__alarm">
        <circle cx="${tlX(TL.alarm)}" cy="${TL.readY}" r="16"/>
        <line x1="${tlX(TL.alarm)}" x2="${tlX(TL.alarm)}" y1="${TL.readY + 16}" y2="${TL.alarmY - 26}"/>
        <text class="p3-mid" x="${tlX(TL.alarm)}" y="${TL.alarmY}">alarm: a miss</text>
      </g>
      <g class="p3-tl__key">${tlKey(TL.nameX, true, 'the hinted answer')}${tlKey(TL.nameX + 312, false, 'another answer')}</g>
    </svg>`;

  // The paper's Table 3 as bars: Qwen3-32B's miss rate in each of the seven models that
  // wrote the traces, with the line at 0.5 that the fixed rule draws. One series, one
  // encoding: a bar's length. The models are those that wrote the traces (the paper's
  // "subject models", a word the talk does not use), which the chart's head says. Qwen3-8B's
  // rates are not drawn; its count stands in words under the chart, with what the rule then
  // says of it ('p3.qwen8_outcome').
  const MISS = Deck.fact('alarm.miss').value;
  const MR = Object.freeze({
    width: 856, height: 276, nameX: 452, x0: 468, perUnit: 320, rowY: 52, pitch: 28, barH: 16,
    headY: 22, ticks: Object.freeze([0, 0.5, 1]),
    // Click 2, in ms: the rows one after the other, then the line and the count.
    rowAt: 400, perRow: 180,
  });
  const mrX = (rate) => round3(MR.x0 + rate * MR.perUnit);
  const mrRow = (i) => MR.rowY + i * MR.pitch;
  const MISSED = Object.freeze({
    line: v('alarm.most'),
    qwen32: MISS.filter((row) => row.qwen32 >= v('alarm.most')).length,
    qwen8: MISS.filter((row) => row.qwen8 >= v('alarm.most')).length,
  });
  const missChart = () => `
    <svg class="p3-svg p3-mr" viewBox="0 0 ${MR.width} ${MR.height}" width="${MR.width}" height="${MR.height}">
      <g class="p3-mr__frame">
        <text class="p3-mr__what p3-end" x="${MR.width}" y="${MR.headY}">timing, by its verdict: miss rate on each model’s traces</text>
        ${MR.ticks.map((tick) => `<text class="p3-num p3-mid" x="${mrX(tick)}" y="${mrRow(MISS.length) + 16}">${tick}</text>`).join('')}
        <line class="p3-axis" x1="${mrX(0)}" x2="${mrX(1)}" y1="${mrRow(MISS.length) - 12}" y2="${mrRow(MISS.length) - 12}"/>
      </g>
      ${MISS.map((row, i) => `
      <g class="p3-mr__row" data-model="${i}">
        <text class="p3-mr__name p3-end" x="${MR.nameX}" y="${mrRow(i) + 8}">${row.model}</text>
        <rect class="p3-mr__bar" x="${mrX(0)}" y="${mrRow(i) - MR.barH / 2}" width="${round3(row.qwen32 * MR.perUnit)}" height="${MR.barH}" rx="3"/>
      </g>`).join('')}
      <g class="p3-mr__most">
        <line x1="${mrX(MISSED.line)}" x2="${mrX(MISSED.line)}" y1="${MR.rowY - 20}" y2="${mrRow(MISS.length) - 12}"/>
      </g>
    </svg>`;
  // The check of the point of no return, as one bar: the followed traces whose K = 2 point
  // of no return lies at or before r = 0.40, and the part of them that ends at the hinted
  // answer in all 16 continuations at r = 0.5 (amber). The rest fails the definition: the
  // one number of the check that is printed, beside the bar. The two counts behind the
  // share ('pnr.early_traces', 'pnr.early_hold') are checked here and stay off the screen.
  const CHECK = (() => {
    const all = Deck.fact('pnr.early_traces');
    const hold = Deck.fact('pnr.early_hold');
    if (((hold.value / all.value) * 100).toFixed(1) !== String(hold.share) || `${(100 - hold.share).toFixed(1)}%` !== t('pnr.early_fail') || (100 - hold.share).toFixed(1) !== String(v('pnr.early_fail'))) throw new Error('the counts of slide 11’s check of the point of no return no longer give the shares it prints');
    if (all.by !== TL.pnr) throw new Error('the trace of slide 11 no longer has its point of no return where the check draws its line');
    return Object.freeze({ by: all.by.toFixed(2), fail: t('pnr.early_fail'), width: (hold.value / all.value) * 100 });
  })();
  // One threshold, many looks ('looks.per_look', 'looks.per_trace'): two bars on one scale,
  // under whose rates they are and over which looks ('p3.looks_who').
  const LOOKS = (() => {
    const look = Deck.fact('looks.per_look');
    const who = Deck.fact('p3.looks_who');
    const [lo, hi] = v('looks.per_trace');
    if (!(lo > look.value) || !/resisted hinted trace/.test(t('looks.negative'))) throw new Error('the false alarms of slide 11 are no longer more per trace than per look, on traces that resist');
    // The ten looks are the monitor's reads up to r = 0.8: ten of the twelve of the picture.
    if (TL.reads.filter((r) => r >= who.from && r <= who.to).length !== look.looks) throw new Error('the looks of slide 11 are no longer the reads from r = 0 to 0.8');
    // The five are some of the nine readers, and the ten reads the first ten of the twelve.
    if (!(who.value < READERS.length) || TL.reads.slice(0, look.looks).some((r) => r > who.to) || TL.reads[look.looks] <= who.to) throw new Error('the false alarms of slide 11 are no longer those of some of the nine readers over the first ten reads');
    return Object.freeze({ look: look.text, count: look.looks, who: who.text, perUnit: 520, lo, hi });
  })();
  // One word for one thing: a "cut" is where continuations are sampled (six of them), a
  // "read" is where the monitor reads the prefix (twelve; the paper's "looks" are the first
  // ten of them). A caption can carry a second line in small print (parts/part3.css).
  const ALARM_NOTES = Object.freeze({
    pnr: Object.freeze([
      // 'pnr.def', in the talk's words ("cut" for the paper's "position"). "As we define
      // it": the name is also that of other work, and the definition is the paper's own
      // ("We define the point of no return").
      '<b>Point of no return (PNR), as we define it:</b> the earliest cut from which every continuation ends at the hinted answer, there and at every later cut.',
      // Where the two continuations per cut come from ('task.resampled_models',
      // 'task.sample_questions'); the picture has the two per cut and the six cuts.
      `Data: all hinted traces, ${t('task.sample_questions')} questions × ${t('task.resampled_models')} models.`,
    ]),
    // 'alarm.when' and 'alarm.miss_def'; the verdict in plain words ('p3.verdict').
    alarm: '<b>Alarm:</b> the monitor’s first read whose <b>verdict</b>, the answer it predicts, is the hinted answer. After the PNR, or never: a <b>miss</b>.',
    rule: Object.freeze([
      // 'alarm.most' and 'alarm.rule'.
      `<b>The rule:</b> miss rate at least ${t('alarm.most')} in at least ${t('alarm.rule')} models: the monitor mostly alarms after the PNR.`,
      // What the AUROC over the chart is ('reader.qwen32.within'); the chart's two heads say
      // that it is of the score ('p3.score_px') and that the alarm uses the verdict.
      `Its AUROC: within question, label 1, r = ${t('task.cut_r')}.`,
    ]),
    // 'pnr.biased_early', 'pnr.operational' and 'pnr.lateness'; the picture has the number.
    early: `Two continuations often agree by chance, so the K = ${t('pnr.k')} PNR comes early: an operational threshold, not literal irreversibility. Part of the lateness may come from the PNR itself.`,
    // 'looks.negative' and 'time.rec_budget'; whose rates they are ('p3.looks_who').
    looks: '<b>False alarm:</b> an alarm on a trace that resists. A per-read budget hides the per-trace rate.',
  });
  // Under the recommendation: what its "reference" is in this work ('p3.reference'). The
  // recommendation's words are the paper's and stand on slide 13 too ('motifs.recs').
  const ALARM_LIMIT = 'Our reference: the PNR.';
  Deck.register({
    id: 'p3-alarm',
    part: PART,
    kicker: RESULTS,
    // The first half is the paper's own general statement ('close.timing', 'time.not_auroc');
    // the second its count for this monitor ('alarm.qwen32'). The slide prints how this
    // monitor ranks ('reader.qwen32.within') beside how it times, and says no more of it.
    // The monitor has the name that the chart of slide 12 gives it, so that it is not taken
    // for the forced reader of the same model.
    // The colon belongs to the half that is held back (click 2), so that until then the title
    // is a whole sentence.
    title: `Ranking is not timing<em>: ${t('reader.qwen32.name')} mostly alarms after the point of no return in ${t('alarm.qwen32')} models</em>`,
    cues: [],
    cite: [{ src: 'paper', where: 'Sec. 2, 5; Table 2-4' }],
    figure: ['data', 'schematic'],
    html: `
      <div class="p3-res p3-al">
        ${kit.resultHead(2, t('alarm.fixed'))}
        <div class="p3-res__picture">
          <div class="p3-al__left">
            ${timeline()}
            <div class="p3-al__check">
              <p class="p3-al__line"><span class="dk-chip">${EXPLORATORY}</span>PNRs at or before r = ${CHECK.by},<br>re-checked with ${t('task.sample_k')} continuations:</p>
              <p class="p3-al__fail"><span class="p3-al__bar"><i style="width:${CHECK.width.toFixed(1)}%"></i></span><span class="p3-al__said"><b>${CHECK.fail}</b> fail the definition</span></p>
            </div>
          </div>
          <div class="p3-al__right">
            <p class="p3-al__who">${kit.standing(t('reader.qwen32.name'))}<span class="p3-al__rank">ranking, by its score: AUROC <b>${t('reader.qwen32.within')}</b></span></p>
            ${missChart()}
            <p class="p3-al__count"><b>${t('alarm.qwen32')}</b> at or above ${t('alarm.most')}<span>${t('reader.qwen8.name')}: ${t('alarm.qwen8')}, ${t('p3.qwen8_outcome')}</span></p>
            <div class="p3-al__looks">
              <p class="p3-al__line p3-al__tier"><span class="dk-chip">${t('looks.tier')}</span></p>
              <p class="p3-al__line p3-al__whose">False alarms, first ${LOOKS.count} reads, ${LOOKS.who} readers by score threshold</p>
              <p class="p3-al__look"><span>per read</span><i style="width:${(Deck.fact('looks.per_look').value * LOOKS.perUnit).toFixed(1)}px"></i><b>${LOOKS.look}</b></p>
              <p class="p3-al__look" data-look="trace"><span>per trace</span><i style="width:${(LOOKS.hi * LOOKS.perUnit).toFixed(1)}px"></i><b>${t('looks.per_trace')}</b></p>
            </div>
          </div>
        </div>
        ${captionHtml({ notes: ALARM_NOTES, rec: recOf(2), limit: ALARM_LIMIT })}
      </div>`,
    setup: (ctx) => {
      const { fact, dur } = ctx;
      // What is drawn is what is counted: the bars at or above the rule's line are as many
      // as the paper counts for each monitor, and the rule asks for that many.
      if (MISSED.qwen32 !== fact('alarm.qwen32').value || MISSED.qwen8 !== fact('alarm.qwen8').value || MISS.length !== fact('alarm.rule').of || fact('alarm.rule').value !== fact('alarm.qwen32').value) throw new Error('the miss rates of slide 11 no longer give the counts of models that the paper states');
      if (fact('alarm.qwen32').text !== `${MISSED.qwen32} of ${MISS.length}` || !(MISSED.qwen8 < fact('alarm.rule').value) || MISS.length !== fact('task.resampled_models').value) throw new Error('the statement of slide 11 no longer holds for Qwen3-32B and fails for Qwen3-8B, in the seven resampled models');
      // Every model of the chart is one of the task's subject models, by its full name.
      const subjects = fact('task.model_names').text.split(', ');
      if (MISS.some((row) => !subjects.includes(row.model))) throw new Error('a model of slide 11’s chart is not one of the task’s subject models');
      // The title's first half rewords the paper's own statement that ranking is not timing,
      // and the ranking the slide prints is this monitor's own: the reader of Table 4 that
      // carries its model's name.
      if (!/^Ranking is also not timing/.test(fact('close.timing').text) || !/AUROC does not measure this/.test(fact('time.not_auroc').text)) throw new Error('the paper no longer says that ranking is not timing, which the title of slide 11 rewords');
      if (!fact('reader.qwen32.name').text.startsWith(fact('readers.name_qwen32').text) || fact('reader.qwen32.name').forced || !fact('reader.qwen8.name').text.startsWith(fact('readers.name_qwen8').text) || fact('reader.qwen8.name').forced) throw new Error('the AUROC that slide 11 prints is no longer that of the monitor whose alarms it shows, or the second monitor is no longer the small open one');
      // Its score ranks and its verdict alarms: the two outputs of an open monitor.
      if (!/letter probability of X/.test(fact('p3.score_px').text) || !/predicted letter/.test(fact('p3.verdict').text) || !fact('reader.qwen32.within').file.includes('Qwen3-32B $P(X)$')) throw new Error('the score and the verdict of slide 11’s monitor are no longer the ones the paper lists');
      // The data line of the entrance: the task's six cuts in the seven resampled models.
      if (fact('pnr.k').positions !== TL.cuts.length || MISS.length !== fact('task.resampled_models').value || !/20 seeded questions per model for the seven models/.test(fact('task.sample_questions').file)) throw new Error('the data line of slide 11 no longer says where its continuations come from');
      // The captions reword these facts.
      if (!/^We define the point of no return/.test(fact('pnr.def').file.split('"')[1]) || !/earliest position at which every continuation reaches the hinted answer/.test(fact('pnr.def').text) || !/not literal irreversibility/.test(fact('pnr.operational').text) || !/first read position at which its verdict names the hinted answer/.test(fact('alarm.when').text) || !/not at or before the PNR/.test(fact('alarm.miss_def').text)) throw new Error('the facts on the point of no return and the alarm no longer say what slide 11 rewords');
      if (fact('pnr.k').value !== 2 || !/Two continuations often agree by chance/.test(fact('pnr.biased_early').file) || !/biased early/.test(fact('pnr.biased_early').text) || !/may therefore come from the PNR itself, not from the monitor/.test(fact('pnr.lateness').text) || !/budget per trace/.test(fact('time.rec_budget').text) || RECS[recOf(2) - 1].fact !== 'rec.3') throw new Error('the facts on the early point of no return and the recommendation no longer say what slide 11 rewords');
      // The second monitor's count is one short of the rule, which then says nothing single
      // of it; the false alarms are those of readers that alarm on a threshold of their
      // score; and the reference under the recommendation is the point of no return.
      if (MISSED.qwen8 !== fact('alarm.rule').value - 1 || !/one short of the rule/.test(fact('alarm.qwen8').file) || !/the rule gives no single statement/.test(fact('p3.qwen8_outcome').file)) throw new Error('the rule of slide 11 no longer leaves the second monitor one model short, without a single statement');
      if (!/five continuous readers, a threshold set to a per-look rate/.test(fact('p3.looks_who').file) || fact('p3.looks_who').value !== 5) throw new Error('the false alarms of slide 11 are no longer those of five readers at a threshold of their score');
      if (!/point of no return estimated by resampling/.test(fact('p3.reference').text) || !/against a stated reference/.test(RECS[recOf(2) - 1].rec) || !/against a reference defined by/.test(fact('time.rec_reference').text)) throw new Error('the reference under slide 11’s recommendation is no longer the point of no return');
      if (fact('alarm.fixed').text !== 'fixed before the data' || fact('p3.pnr_check_tier').text !== EXPLORATORY || !/data already read/.test(fact('looks.tier').text)) throw new Error('the tiers of slide 11 are no longer the ones its chips print');
      const cuts = ctx.qa('.p3-tl__cut');

      // Enter: one followed trace from r = 0 to r = 1, cut at six positions; from each cut
      // two continuations, the key of their endings, and the point of no return where both
      // end at the hinted answer from then on.
      const enter = ctx.step({ label: 'result 2 of 3: the point of no return' });
      kit.enterResult(enter);
      note(enter, 'pnr', { at: 300 });
      enter.tween('.p3-tl__axis', { opacity: [0, 1] }, { at: 400 });
      enter.tween(cuts, { opacity: [0, 1] }, { at: 1000, stagger: 220 });
      enter.tween('.p3-tl__per', { opacity: [0, 1] }, { at: 1000 });
      enter.tween('.p3-tl__key', { opacity: [0, 1] }, { at: 1000 + cuts.length * 220 });
      enter.tween('[data-says-line="pnr:1"]', { opacity: [0, 1] }, { at: 1000 + cuts.length * 220, dur: dur.enter });
      enter.tween('.p3-tl__pnr', { opacity: [0, 1] }, { at: 1000 + cuts.length * 220 + 700 });
      enter.hold(300);

      // Click 1: the monitor reads the growing prefix, read after read, in a row of its
      // own; the key gets its squares. Its first verdict for the hinted answer is its
      // alarm, ringed, here after the point of no return.
      const alarm = ctx.step({ label: 'the alarm, and a miss' });
      note(alarm, 'alarm', { leaves: 'pnr' });
      alarm.tween('.p3-tl__reads-name', { opacity: [0, 1] }, { at: 300 });
      alarm.tween('.p3-tl__key-read', { opacity: [0, 1] }, { at: 300 });
      // The point of no return's line reaches down through the row of the reads.
      alarm.tween('.p3-tl__pnr-on', { opacity: [0, 1] }, { at: 300 });
      alarm.tween('.p3-tl__reads > .p3-tl__read', { opacity: [0, 1] }, { at: 600, stagger: 140, dur: dur.micro });
      const rang = 600 + TL.reads.indexOf(TL.alarm) * 140;
      alarm.tween('.p3-tl__read.is-alarm', { scale: [2.2, 1] }, { at: rang, dur: dur.enter });
      alarm.tween('.p3-tl__alarm', { opacity: [0, 1] }, { at: rang + 200 });
      alarm.hold(300);

      // Click 2: how this monitor ranks, then how it times: the measured miss rates, model
      // by model, the rule's line and the count; the title gets its second half.
      const rates = ctx.step({ label: 'the statement fixed before the data holds in 5 of 7 models' });
      note(rates, 'rule', { leaves: 'alarm' });
      rates.tween('.p3-al__who', { opacity: [0, 1] }, { at: 200 });
      rates.tween('.p3-mr__frame', { opacity: [0, 1] }, { at: 300 });
      MISS.forEach((row, i) => {
        const when = MR.rowAt + i * MR.perRow;
        rates.tween(`[data-model="${i}"] text`, { opacity: [0, 1] }, { at: when, dur: dur.micro });
        rates.tween(`[data-model="${i}"] .p3-mr__bar`, { opacity: [0, 1], 'attr:width': [0, round3(row.qwen32 * MR.perUnit)] }, { at: when, dur: dur.move });
      });
      const counted = MR.rowAt + MISS.length * MR.perRow + dur.move;
      rates.tween('.p3-mr__most', { opacity: [0, 1] }, { at: counted });
      rates.tween('.p3-al__count', POP, { at: counted + 600, dur: dur.enter, ease: 'back' });
      rates.tween('[data-says-line="rule:1"]', { opacity: [0, 1] }, { at: counted + 600, dur: dur.enter });
      revealTitle(ctx, rates, counted + 900);
      rates.hold(300);

      // Click 3: the reference itself. Under the trace, the followed traces whose point of
      // no return lies at or before r = 0.40 as one bar: the part that still ends at the
      // hinted answer when 16 continuations are drawn in place of 2 fills it, and the rest
      // is the share that fails the definition, printed beside it.
      const early = ctx.step({ label: 'the point of no return comes too early' });
      note(early, 'early', { leaves: 'rule' });
      early.show('.p3-al__check .p3-al__line', { at: 300, rise: 0 });
      early.tween('.p3-al__bar', { opacity: [0, 1] }, { at: 700 });
      early.tween('.p3-al__bar i', { '--p3-grow': ['0%', '100%'] }, { at: 900, dur: dur.reveal, ease: 'inOut' });
      early.tween('.p3-al__said', POP, { at: 900 + dur.reveal, dur: dur.enter, ease: 'back' });
      early.hold(300);

      // Click 4: one threshold, many looks. The check of click 3 has been read and leaves
      // with its caption, so that the false alarms are the one new block on the screen.
      const looks = ctx.step({ label: 'a budget per look, a rate per trace' });
      note(looks, 'looks', { leaves: 'early' });
      looks.tween('.p3-al__check', { opacity: [1, 0] }, { dur: dur.micro });
      looks.tween('.p3-al__count', { opacity: [1, 0] }, { dur: dur.micro });
      looks.show('.p3-al__looks .p3-al__line', { at: 300, rise: 0 });
      looks.show('.p3-al__look', { at: 700, stagger: 900, rise: 0 });
      looks.tween('.p3-al__look[data-look="trace"] i', { '--p3-grow': ['0%', '100%'] }, { at: 1600, dur: dur.move, ease: 'inOut' });
      looks.hold(300);

      // Click 5: the recommendation, and under it what its reference is here.
      conclude(ctx.step({ label: 'recommendation 3 of 4' }), { leaves: 'looks', limit: true });
    },
  });

  // ---------------------------------------------------------------- slide 12: result 3, what comparisons can resolve
  // Nine readers were scored and three are set aside after their counts had been seen: all
  // nine are shown, each with the interval Table 4 prints for it, before the three step
  // back. Among the six that stay there are fifteen pairs, drawn as fifteen arcs between
  // their rows, and the paper prints how many of the fifteen differences a joint test
  // resolves: none against the trace's own ending (click 1), four against a held-out
  // continuation's (click 2), each the small open monitor below a frontier reader: those
  // four arcs are drawn in the amber of that label. The intervals of the fifteen
  // differences are in the paper's appendix, which this deck does not read, so no interval
  // of a difference is drawn.
  // A control for prefix length moves the count as the label does (click 3): with only
  // pairs of traces of similar prefix length scored, the four are none; the arcs stay as
  // the held-out label left them. The paper's second control (the length regressed out) leaves the four
  // and is not on the slide. Then what the design could detect, on each label, and the
  // questions it would take against the questions there were (click 4); the title gets its
  // second half. Then the recommendation (click 5).
  // All that is said about the three readers set aside stands on the entrance, in one
  // place, under the rows that step back: one sentence that says when they were set aside
  // (post hoc: after the results had been seen) and why (two fail a preset check of their
  // computation, 'p3.forced_check' and 'p3.forced_check_what'; the tolerance itself is not
  // on the slide; one was never checked),
  // and in small print under it which two fail, that they score highest and that with the
  // three kept a few more differences are resolved ('p3.resolved_all_own', '_held'). The slide does not
  // argue for the choice, and it does not say that the choice leaves the result as it is.
  // The head asks the question of the motivation slide for readers: from slide 6 on, what
  // is scored is a reader, and a monitor is one kind.
  const RESOLVE_ASK = 'Can the data tell two readers apart?';
  if (CHOICES[2].ask.replace(/\bmonitors\b/, 'readers') !== RESOLVE_ASK) throw new Error('the head of slide 12 no longer asks the third question of the talk, for readers');
  const RS = (() => {
    const own = v('test.resolved_own');
    const held = v('test.resolved_held_max');
    // The counts, one row each: the two labels, then the held-out label once more with
    // pairs of traces matched in prefix length.
    const rows = Object.freeze([
      Object.freeze({ key: 'own', chip: labelChip('own'), count: own }),
      Object.freeze({ key: 'held', chip: labelChip('held'), count: held }),
      Object.freeze({ key: 'matched', chip: '<span class="dk-chip" data-tone="hidden">label 2, length-matched</span>', count: v('test.length_held_matched') }),
    ]);
    return Object.freeze({ rows, pairs: v('test.pairs_kept') });
  })();
  // The nine readers, the six that stay first and the three forced readers apart, as Table
  // 4 lists them: each with its within-question AUROC against the trace's own ending and
  // its 95% interval. At the right of the six, one arc for each pair of them.
  const RD = (() => {
    const forced = READERS.filter((key) => !KEPT.includes(key));
    const rowY = 16;
    const pitch = 32;
    const asideY = rowY + KEPT.length * pitch + 20;
    const yOf = (key) => (KEPT.includes(key) ? rowY + KEPT.indexOf(key) * pitch : asideY + 20 + forced.indexOf(key) * pitch);
    const axisY = yOf(forced[forced.length - 1]) + 20;
    return Object.freeze({
      forced, yOf, asideY, axisY, tickY: axisY + 28, titleY: axisY + 60,
      width: 680, height: axisY + 68, nameX: 292, x0: 312, perUnit: 1700, from: 0.75, to: 0.88,
      ticks: Object.freeze([0.75, 0.80, 0.85]), spine: 556, bulge: 22,
    });
  })();
  const rdX = (value) => round3(RD.x0 + (value - RD.from) * RD.perUnit);
  if (READERS.some((key) => v(`p3.within_ci.${key}`)[0] < RD.from || v(`p3.within_ci.${key}`)[1] > RD.to || !(v(`p3.within_ci.${key}`)[0] < v(`reader.${key}.within`) && v(`reader.${key}.within`) < v(`p3.within_ci.${key}`)[1]))) throw new Error('an interval of slide 12 no longer lies on its axis, around its reader’s AUROC');
  // The pairs of the six, as arcs between their rows; `held`: a difference that the joint
  // test resolves against the held-out label, "each Qwen3-8B below a frontier reading"
  // ('test.resolved_held_who'). Both sides are read from the facts: the small open monitor
  // is the reader that carries that model's name, and a frontier reader is one of the six
  // that is not an open monitor's.
  const OPEN_MODELS = Object.freeze(['readers.name_qwen8', 'readers.name_qwen32'].map(t));
  const readerOf = (model) => KEPT.filter((key) => t(`reader.${key}.name`).startsWith(`${model} `));
  const SMALL = readerOf((/each (\S+) below a frontier reading/.exec(t('test.resolved_held_who')) ?? [])[1]);
  const FRONTIER = Object.freeze(KEPT.filter((key) => !OPEN_MODELS.some((model) => readerOf(model).includes(key))));
  if (SMALL.length !== 1 || SMALL[0] !== readerOf(t('readers.name_qwen8'))[0] || FRONTIER.slice().sort().join() !== HELD_ABOVE.slice().sort().join()) throw new Error('the differences that the held-out label resolves on slide 12 are no longer the small open monitor against each frontier reader');
  // The models behind the frontier readers, each once, and the two forced readers that fail
  // the check, by name: the captions name both.
  const FRONTIER_MODELS = Object.freeze([...new Set(FRONTIER.map((key) => t(`reader.${key}.name`).replace(/ (AP|IN)$/, '')))]);
  const FAILED = Object.freeze(RD.forced.filter((key) => key !== UNCHECKED).map((key) => t(`reader.${key}.name`)));
  if (FRONTIER_MODELS.length !== 2 || !FRONTIER_MODELS.includes(t('readers.name_opus')) || FAILED.length !== 2) throw new Error('the captions of slide 12 no longer name two frontier models and the two forced readers that fail the check');
  const PAIRS = Object.freeze(KEPT.flatMap((a, i) => KEPT.slice(i + 1).map((b, n) => Object.freeze({
    a, b, span: n + 1, held: (SMALL.includes(a) && FRONTIER.includes(b)) || (SMALL.includes(b) && FRONTIER.includes(a)),
  }))));
  const arc = (pair, cls) => {
    const y1 = RD.yOf(pair.a);
    const y2 = RD.yOf(pair.b);
    return `<path class="p3-rd__arc${cls}" d="M ${RD.spine} ${y1} A ${RD.bulge * pair.span} ${(y2 - y1) / 2} 0 0 1 ${RD.spine} ${y2}"/>`;
  };
  const readerRow = (key) => {
    const [lo, hi] = v(`p3.within_ci.${key}`);
    const y = RD.yOf(key);
    return `
        <g class="p3-rd__row${KEPT.includes(key) ? '' : ' is-forced'}" data-reader="${key}">
          <text class="p3-end" x="${RD.nameX}" y="${y + 8}">${t(`reader.${key}.name`)}</text>
          <line x1="${rdX(lo)}" x2="${rdX(hi)}" y1="${y}" y2="${y}"/>
          <circle cx="${rdX(v(`reader.${key}.within`))}" cy="${y}" r="7"/>
        </g>`;
  };
  const readerRows = () => `
    <svg class="p3-svg p3-rd" viewBox="0 0 ${RD.width} ${RD.height}" width="${RD.width}" height="${RD.height}">
      <g class="p3-rd__frame">
        <line class="p3-axis" x1="${RD.x0}" x2="${rdX(RD.to)}" y1="${RD.axisY}" y2="${RD.axisY}"/>
        ${RD.ticks.map((tick) => `
          <line class="p3-grid" x1="${rdX(tick)}" x2="${rdX(tick)}" y1="0" y2="${RD.axisY}"/>
          <text class="p3-num p3-mid" x="${rdX(tick)}" y="${RD.tickY}">${two(tick)}</text>`).join('')}
        <text class="p3-mid" x="${(RD.x0 + rdX(RD.to)) / 2}" y="${RD.titleY}">AUROC, label 1, ${t('test.interval_level')} interval</text>
      </g>
      ${KEPT.map(readerRow).join('')}
      <text class="p3-rd__aside p3-end" x="${RD.nameX}" y="${RD.asideY}">set aside, post hoc:</text>
      ${RD.forced.map(readerRow).join('')}
      <g class="p3-rd__pairs">
        ${PAIRS.map((pair) => arc(pair, '')).join('')}
        ${KEPT.map((key) => `<circle class="p3-rd__node" cx="${RD.spine}" cy="${RD.yOf(key)}" r="4"/>`).join('')}
      </g>
      <g class="p3-rd__held">${PAIRS.filter((pair) => pair.held).map((pair) => arc(pair, ' is-held')).join('')}</g>
    </svg>`;
  // "80% power" in the talk's words: 4 times in 5.
  const timesIn = (power) => {
    const gcd = (a, b) => (b ? gcd(b, a % b) : a);
    const unit = gcd(power, 100);
    return `${power / unit} times in ${100 / unit}`;
  };
  const NEED = Object.freeze({ had: v('test.questions_had'), needed: v('test.questions_needed') });
  // Click 4, in ms after the click: the two lengths, the stacks of tiles, and when the room
  // has been told.
  const NEED_AT = (() => {
    const rulerAt = 500;
    const tilesAt = 2000;
    const perTile = 10;
    const needed = tilesAt + 700;
    return Object.freeze({ rulerAt, tilesAt, perTile, needed, told: needed + NEED.needed * perTile + 300 });
  })();
  const DETECT = Object.freeze({ perUnit: 5600 });
  const tiles = (n) => util.range(n).map(() => '<i></i>').join('');
  // A caption of this slide can carry a second line in small print (parts/part3.css). Only
  // the entrance has one.
  const RESOLVE_NOTES = Object.freeze({
    aside: Object.freeze([
      // 'readers.forced_aside', 'p3.forced_check' and 'p3.forced_check_what', in the talk's
      // words, as one sentence: the check is preset and is of how the two are computed (the
      // paper's Sec. 7.3: read along the trace against a one-shot recomputation).
      'Three forced-answer readers are set aside after we saw the results: two fail a preset check of their computation, one was never checked.',
      // What the choice costs, right behind it: the two that fail the check, by name, have
      // the highest scores of the nine, and with the three kept more differences are
      // resolved under either label; the setup checks the sentence against the counts.
      `The two that fail (${FAILED.join('; ')}) score highest. With all three, a few more are resolved.`,
    ]),
    // What the joint test is for: one pair at a time, 'p3.chance_resolved' of the 36
    // intervals (the pairs of all nine readers) would exclude zero if the readers were
    // equal; tested jointly, the intervals are wider and even one such difference is rare
    // ('p3.joint_level', 'p3.joint_chance').
    joint: `One pair at a time, chance would resolve ${t('p3.chance_resolved')} of all ${t('test.pairs_all')} pairs (${READERS.length} readers). So we test <b>jointly</b>: with wider intervals, chance rarely resolves even one.`,
    // 'test.resolved_held_who': the four arcs say which readers, the caption which models.
    held: `<b>Label 2:</b> ${v('test.resolved_held_max')} are resolved, each ${t('reader.qwen8.name')} below a ${FRONTIER_MODELS.join(' or ')} reader.`,
    // Why the control ('p3.cut_leaks', in slide 10's words: the cut "gives away" length;
    // 'm.length_alone'); 'test.length_match' says what the control is;
    // 'test.label_and_length' what it shows.
    length: `<b>Length-matched</b> (the cut gives away length): score only follower-resister pairs ${t('test.length_match')}. The label or a length control changes the count as much as the readers do.`,
    // What "detectable" means ('test.power'), 'test.most_smaller' and 'test.not_equality'.
    power: `<b>Detectable difference:</b> the smallest one this design would catch ${timesIn(v('test.power'))}. Most observed differences are smaller: not resolved means too small a test, not that the readers are equal.`,
  });

  Deck.register({
    id: 'p3-resolve',
    part: PART,
    kicker: RESULTS,
    // The count of each label, the labels first: 'test.resolved_own' against the trace's own
    // ending, and against a held-out continuation's the joint test's count, the value of
    // 'test.resolved_held_max'. That fact's text is "at most 4" (two stricter checks give
    // fewer); "at most" has nothing on screen to explain it, so the title and the count
    // print the value alone. The setup checks both counts.
    // The comma belongs to the half that is held back (click 4), as on slide 10.
    title: `By either label, only ${t('test.resolved_own')} or ${v('test.resolved_held_max')} of ${t('test.pairs_kept')} reader differences are resolved<em>, and that does not make them equal</em>`,
    cues: [],
    cite: [{ src: 'paper', where: 'Sec. 2.2, 6.1; Table 4-5' }],
    figure: ['data', 'schematic'],
    html: `
      <div class="p3-res p3-resolve">
        ${kit.resultHead(3, EXPLORATORY).replace(CHOICES[2].ask, RESOLVE_ASK)}
        <div class="p3-res__picture">
          ${readerRows()}
          <div class="p3-rs">
            <p class="p3-rs__what">${t('test.pairs_kept')} pairs of ${KEPT.length} readers, resolved jointly:</p>
            ${RS.rows.map((row) => `
            <p class="p3-rs__row" data-row="${row.key}">${row.chip}<b>${row.count}</b></p>`).join('')}
            <div class="p3-rs__detect">
              <p class="p3-rs__what">detectable difference</p>
              <p class="p3-rs__bar" data-row="own"><span>label 1</span><i style="width:${(v('test.detectable_own') * DETECT.perUnit).toFixed(1)}px"></i><b>${t('test.detectable_own')}</b></p>
              <p class="p3-rs__bar" data-row="held"><span>label 2</span><i style="width:${(v('test.detectable_held') * DETECT.perUnit).toFixed(1)}px"></i><b>${t('test.detectable_held')}</b></p>
            </div>
          </div>
          <div class="p3-need">
            <div class="p3-need__stack" data-stack="had">
              <p class="p3-need__n"><b>${t('test.questions_had')}</b></p>
              <p class="p3-need__what">questions per model we had</p>
              <div class="p3-need__tiles">${tiles(NEED.had)}</div>
            </div>
            <div class="p3-need__stack" data-stack="needed">
              <p class="p3-need__n"><span>about</span><b class="p3-need__count"></b></p>
              <p class="p3-need__what">questions per model to detect ${t('test.smallest_target')} (label 1)</p>
              <div class="p3-need__tiles">${tiles(NEED.needed)}</div>
            </div>
          </div>
        </div>
        ${captionHtml({ notes: RESOLVE_NOTES, rec: recOf(3) })}
      </div>`,
    setup: (ctx) => {
      const { fact, dur } = ctx;
      // The arcs are the pairs of the six readers that are kept, and the head counts them.
      if (KEPT.length !== 6 || fact('readers.kept').value !== KEPT.length || (KEPT.length * (KEPT.length - 1)) / 2 !== RS.pairs || PAIRS.length !== RS.pairs || (READERS.length * (READERS.length - 1)) / 2 !== fact('test.pairs_all').value) throw new Error('the arcs of slide 12 are no longer one per pair of six readers, of the 36 pairs of nine');
      // The four that the held-out label resolves are the small open monitor against each
      // of the four frontier readers, all among the six: the four amber arcs.
      if (HELD_ABOVE.length !== fact('test.resolved_held_max').value || HELD_ABOVE.some((key) => !KEPT.includes(key)) || !KEPT.includes(SMALL[0]) || !/each Qwen3-8B below a frontier reading/.test(fact('test.resolved_held_who').text)) throw new Error('the four differences that the held-out label resolves are no longer Qwen3-8B below each frontier reader');
      if (PAIRS.filter((pair) => pair.held).length !== fact('test.resolved_held_max').value || ctx.qa('.p3-rd__arc.is-held').length !== fact('test.resolved_held_max').value) throw new Error('the amber arcs of slide 12 are no longer the differences that the held-out label resolves');
      // The title gives the count of each label, "0 or 4", the own ending's first: the
      // held-out label's has to be the largest of its counts, its fact's "at most" (the
      // paper's wording, printed nowhere), and the own ending's has to be below it.
      if (fact('test.resolved_held_max').text !== `at most ${fact('test.resolved_held_max').value}` || fact('test.resolved_own').value >= fact('test.resolved_held_max').value) throw new Error('the two counts in the title of slide 12 are no longer the own ending’s and, above it, the held-out label’s largest');
      if (!fact('p3.resolved_held_stricter').value.includes(fact('test.resolved_held_max').value) || fact('test.length_held_matched').value >= fact('test.resolved_held_max').value) throw new Error('the held-out label’s count on slide 12 is no longer the largest of its counts (the joint test, the calibrated one, the one matched in length)');
      // The count that the held-out row prints is the title's.
      const heldCount = ctx.q('.p3-rs__row[data-row="held"] b').textContent;
      if (heldCount !== String(fact('test.resolved_held_max').value) || !ctx.q('.dk-title').textContent.includes(` or ${heldCount} of ${fact('test.pairs_kept').text} `)) throw new Error('the count of click 2 and the title of slide 12 no longer print the same count for the held-out label');
      // The intervals are at the level of every interval of the talk, the joint ones too.
      if (fact('p3.joint_level').value !== fact('test.interval_level').value) throw new Error('the joint intervals of slide 12 are no longer at the level of the other intervals');
      // "Chance rarely resolves even one": with equal readers the joint test resolves at
      // least one difference in at most about one dataset in twenty.
      if (Math.max(...fact('p3.joint_chance').value) > 0.1 || !(fact('p3.chance_resolved').value > 1)) throw new Error('the joint test of slide 12 no longer makes a chance difference rare, where one pair at a time gives about two');
      // The entrance says "three", "two fail a preset check of their computation" and "one
      // was never checked": the three forced readers, of which the paper names the one never
      // checked ('readers.forced_aside').
      if (READERS.length - KEPT.length !== fact('readers.forced_aside').value || fact('readers.forced_aside').value !== 3 || !RD.forced.includes(UNCHECKED)) throw new Error('the readers set aside on slide 12 are no longer three');
      if (!/^Two forced readers fail the tolerance and Qwen3-32B forced was never checked/.test(fact('readers.forced_aside').text) || !/post hoc, after reading the counts with them/.test(fact('readers.forced_aside').text)) throw new Error('readers.forced_aside no longer says what the entrance of slide 12 rewords');
      if (!/numerical tolerance fixed before the subject readings/.test(fact('p3.forced_check').text)) throw new Error('the fact on the check of the forced readers no longer says that it is a numerical tolerance, fixed before the subject readings');
      if (!/fail a preset numerical check/.test(fact('p3.forced_check_what').file) || !/compares those letter probabilities with a one-shot recomputation/.test(fact('p3.forced_check_what').file)) throw new Error('the check of the forced readers is no longer a preset check of their computation, which the entrance of slide 12 says');
      // The length control answers what slide 10 said of the cut: it gives the length away,
      // and prefix length alone ranks traces above chance.
      if (!/leaks that length, and our positions leak it too/.test(fact('p3.cut_leaks').text) || !/gives away how long/.test(CEILING_NOTES.cut) || !(fact('m.length_alone').value > 0.5)) throw new Error('the length control of slide 12 no longer answers a cut that gives the length away, as slide 10 says it');
      // Its small print says that the two which fail the check score highest: the two
      // readers at the top are forced readers, and neither is the one never checked.
      const ranked = READERS.slice().sort((a, b) => fact(`reader.${b}.within`).value - fact(`reader.${a}.within`).value);
      if (ranked.slice(0, 2).some((key) => KEPT.includes(key) || key === UNCHECKED) || !KEPT.includes(ranked[2])) throw new Error('the two readers that score highest are no longer the two set aside for failing the check');
      // And that with the three kept more differences are resolved, under either label.
      if (fact('p3.resolved_all_own').value <= fact('test.resolved_own').value || Math.min(...fact('p3.resolved_all_held').value) <= fact('test.resolved_held_max').value) throw new Error('with all nine readers, no more differences are resolved than without the three set aside');
      // The captions reword these facts.
      if (!/change which differences are resolved about as much as the readers do/.test(fact('test.label_and_length').text) || fact('test.length_match').text !== `within ${fact('test.length_match').value}% in prefix length` || !/^Most observed differences are smaller\.$/.test(fact('test.most_smaller').text) || !/not about equality/.test(fact('test.not_equality').text) || RECS[recOf(3) - 1].fact !== 'rec.4') throw new Error('the facts on the length control, the power and the recommendation no longer say what slide 12 rewords');
      if (!(fact('test.detectable_held').value < fact('test.detectable_own').value) || !(fact('test.questions_needed_held').value < NEED.needed) || !(NEED.had < fact('test.questions_needed_held').value)) throw new Error('the detectable differences and the questions needed on slide 12 are no longer smaller with the held-out label, and above the questions there were');
      const forced = ctx.qa('.p3-rd__row.is-forced');
      // A count lands: its label, then its number.
      const land = (step, row, when) => {
        step.tween(`.p3-rs__row[data-row="${row}"] .dk-chip`, { opacity: [0, 1] }, { at: when - 500 });
        step.tween(`.p3-rs__row[data-row="${row}"] b`, POP, { at: when, dur: dur.enter, ease: 'back' });
      };

      // Enter: all nine readers with their intervals, then the three forced readers step
      // back under their line.
      const enter = ctx.step({ label: 'result 3 of 3: six readers' });
      kit.enterResult(enter);
      enter.tween('.p3-rd__frame', { opacity: [0, 1] }, { at: 400 });
      enter.tween('.p3-rd__row', { opacity: [0, 1] }, { at: 500, stagger: 90, dur: dur.micro });
      const asideAt = 500 + READERS.length * 90 + 600;
      note(enter, 'aside', { at: asideAt - 200 });
      enter.tween(forced, { opacity: [1, 0.5] }, { at: asideAt, stagger: 200 });
      enter.cls(forced, 'is-aside', { at: asideAt, stagger: 200 });
      enter.tween('.p3-rd__aside', { opacity: [0, 1] }, { at: asideAt + forced.length * 200 });
      enter.tween('[data-says-line="aside:1"]', { opacity: [0, 1] }, { at: asideAt + forced.length * 200 + 900, dur: dur.enter });
      enter.hold(300);

      // Click 1: the fifteen pairs of the six, an arc each, and the count against the
      // trace's own ending: none.
      const own = ctx.step({ label: 'label 1: none of fifteen differences resolved' });
      note(own, 'joint', { leaves: 'aside' });
      own.tween('.p3-rd__node', { opacity: [0, 1] }, { at: 200, dur: dur.micro });
      own.tween('.p3-rd__pairs .p3-rd__arc', { opacity: [0, 1] }, { at: 300, stagger: 60, dur: dur.micro });
      own.show('.p3-rs > .p3-rs__what', { at: 300 + PAIRS.length * 60, rise: 0 });
      land(own, 'own', 300 + PAIRS.length * 60 + 900);
      own.hold(300);

      // Click 2: the other label, in the amber of its chip: four of the fifteen, and their
      // four arcs.
      const held = ctx.step({ label: 'label 2: four of fifteen' });
      note(held, 'held', { leaves: 'joint' });
      held.tween('.p3-rd__arc.is-held', { opacity: [0, 1] }, { at: 700, stagger: 150 });
      land(held, 'held', 800);
      held.hold(300);

      // Click 3: the control for prefix length, a row of its own: the four are none.
      const length = ctx.step({ label: 'a control for prefix length moves the count too' });
      note(length, 'length', { leaves: 'held' });
      land(length, 'matched', 800);
      length.hold(300);

      // Click 4: what the design could detect, on each label, and the questions there were
      // against the questions it would take; the second half of the title arrives with the
      // tiles, under the caption that says what "not resolved" means.
      const power = ctx.step({ label: 'what the design could detect' });
      note(power, 'power', { leaves: 'length' });
      power.show('.p3-rs__detect > .p3-rs__what', { at: NEED_AT.rulerAt - 200, rise: 0 });
      ctx.qa('.p3-rs__bar').forEach((bar, i) => {
        power.tween(bar, { opacity: [0, 1] }, { at: NEED_AT.rulerAt + i * 500, dur: dur.micro });
        power.tween(bar.querySelector('i'), { '--p3-grow': ['0%', '100%'] }, { at: NEED_AT.rulerAt + i * 500, dur: dur.move });
      });
      power.show('[data-stack="had"] p', { at: NEED_AT.tilesAt, rise: 0 });
      power.tween('[data-stack="had"] .p3-need__tiles i', { opacity: [0, 1] }, { at: NEED_AT.tilesAt, stagger: NEED_AT.perTile, dur: dur.micro });
      power.show('[data-stack="needed"] p', { at: NEED_AT.needed, rise: 0 });
      power.tween('[data-stack="needed"] .p3-need__tiles i', { opacity: [0, 1] }, { at: NEED_AT.needed, stagger: NEED_AT.perTile, dur: dur.micro });
      kit.countTo(power, '.p3-need__count', 'test.questions_needed', { from: NEED.had, at: NEED_AT.needed, dur: NEED.needed * NEED_AT.perTile, ease: 'linear' });
      revealTitle(ctx, power, NEED_AT.told);
      power.hold(300);

      // Click 5: the last recommendation.
      conclude(ctx.step({ label: 'recommendation 4 of 4' }), { leaves: 'power', limit: false });
    },
  });

  // ---------------------------------------------------------------- slide 13: conclusion and open question
  // The paper's conclusion in the talk's words, one clause for each result
  // ('close.conditions', 'close.timing', 'close.power'). Under it the scope line of the
  // motivation slide; then the four recommendations, the first as slide 7 ended on it and
  // the others as slides 10 to 12 did, numbered under one tag, and the limits as quiet rows, the last of them a
  // hypothesis the paper states and does not test ('limit.hint_not_decision'). All of it
  // stays to the last state, the recommendations at full strength: they are what the room
  // takes home. Then the open question, alone: the paper's pilot count behind it ('open.silent'
  // of 'open.followed' traces, another model and another hint than the main task's) is not
  // on the slide, which closes on the question and not on a new setup with new numbers.
  // The statement moves once. From the entrance it stands where the recommendations and the
  // limits will leave it, a little above the middle of the stage, so that click 1 adds them
  // under it and moves nothing; click 2 lifts all of it to make room for the open question.
  const CLOSE = Object.freeze({
    // The third clause is 'close.power' without the word "power", which no slide has
    // explained: slide 12 has shown the 20 questions per model we had against the about
    // 134 it would take.
    says: 'A resampling ceiling holds only under conditions, ranking is not timing, and we had too few questions to tell our readers apart.',
    // 'task.degenerate', 'scope.exploratory', 'readers.forced_aside' and 'second.limited'
    // (slide 4 says what the second task's limit is).
    limits: Object.freeze([
      'one task, one hint, which nearly every trace restates',
      'most analyses exploratory',
      'three readers set aside post hoc',
      'second task: a limited check',
    ]),
    // 'limit.hint_not_decision': the paper's "the decision" is the model's, to follow the
    // hint or not, and the slide says so.
    hypothesis: 'An untested hypothesis, not a finding: monitors may read the hint, not what the model decides.',
    // 'open.question', in plain words.
    ask: 'Is influence that the reasoning never mentions common enough to evaluate monitors on?',
    cite: Object.freeze([{ src: 'paper', where: 'Sec. 1, 10, 11' }]),
    // The row of the course block over the stage, in stage pixels (parts/part3.css).
    kickerRow: 40,
    // Click 1, in ms: the recommendations one after the other, then the limits.
    recAt: 700, perRec: 450, limitsAfter: 500, askAt: 700,
  });

  Deck.register({
    id: 'p3-close',
    part: PART,
    layout: 'bare',
    kicker: kicker(PART, 'Conclusion'),
    title: CLOSE.says.replace(/\.$/, ''),
    cite: CLOSE.cite,
    html: `
      <div class="p3-close">
        <div class="dk-kicker p3-close__kicker">${kicker(PART, 'Conclusion')}</div>
        <div class="p3-close__body">
          <div class="p3-close__head">
            <h2 class="p3-close__say">${CLOSE.says}</h2>
            ${kit.scope({ size: 2 })}
          </div>
          <div class="p3-close__recs"><span class="p3-close__tag">Recommendations</span>${RECS.map((_, i) => kit.rec(i + 1, { short: true })).join('')}</div>
          <div class="p3-close__limits">
            <span class="p3-close__tag">Limits</span>
            <div class="p3-close__rows">
              ${CLOSE.limits.map((limit) => `<span class="p3-close__limit">${limit}</span>`).join('')}
              <span class="p3-close__limit p3-close__guess">${CLOSE.hypothesis}</span>
            </div>
          </div>
        </div>
        <div class="p3-close__open">
          <p class="p3-close__ask"><span class="p3-close__tag">Open question</span><span class="p3-close__asks">${CLOSE.ask}</span></p>
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
      // The statement rewords the three sentences of the paper's conclusion; its third
      // clause says "limited by power" as slide 12 showed it: fewer questions per model
      // than the smallest difference of interest would take.
      if (!/bounds prefix monitors only under conditions/.test(fact('close.conditions').text) || !/^Ranking is also not timing/.test(fact('close.timing').text) || !/comparisons are limited by power/.test(fact('close.power').text) || !(fact('test.questions_had').value < fact('test.questions_needed_held').value)) throw new Error('the paper’s conclusion no longer says what the statement of slide 13 rewords');
      // The four recommendations are the paper's four, in its order.
      if (RECS.length !== 4 || RECS.some((rec, i) => rec.fact !== `rec.${i + 1}`)) throw new Error('the recommendations of slide 13 are no longer the paper’s four, in its order');
      // The open question is the paper's.
      if (!/unverbalized influence common enough to evaluate monitors on/.test(fact('open.question').file)) throw new Error('open.question no longer asks what the last line of slide 13 rewords');
      // The fourth limit is the paper's "limited check".
      if (!/limited check/.test(fact('second.limited').text)) throw new Error('second.limited no longer says what the fourth limit of slide 13 rewords');
      // The last one is the paper's hypothesis, and says that it is one.
      if (!/may read the hint, not the decision/.test(fact('limit.hint_not_decision').text) || !/untested hypothesis, not a finding/.test(fact('limit.hint_not_decision').text)) throw new Error('limit.hint_not_decision no longer says what the last limit of slide 13 rewords');

      const enter = ctx.step({ label: 'the conclusion' });
      enter.show('.p3-close__kicker', { at: 100, rise: 0 });
      enter.show('.p3-close__say', { at: 300, dur: dur.move });
      enter.show('.dk-scope', { at: 1300 });
      enter.hold(300);

      const recs = ctx.step({ label: 'four recommendations, and the limits' });
      recs.show('.p3-close__recs .p3-close__tag', { at: CLOSE.recAt - 300, rise: 0 });
      recs.show('.p3-close__recs .dk-rec', { at: CLOSE.recAt, stagger: CLOSE.perRec });
      recs.show(ctx.qa('.p3-close__limits > *'), { at: CLOSE.recAt + RECS.length * CLOSE.perRec + CLOSE.limitsAfter, rise: 0 });
      recs.hold(300);

      const open = ctx.step({ label: 'the open question' });
      open.tween('.p3-close__body', { y: [group, 0] }, { dur: dur.move, ease: 'inOut' });
      open.tween('.p3-close__ask', POP, { at: CLOSE.askAt, dur: dur.enter, ease: 'back' });
      open.hold(300);
    },
  });
})();
