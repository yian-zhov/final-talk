// Part 1: The problem and the data. Slides 1-4 (Introduction, Motivation, Dataset).
// SPEC.md section 3 describes each slide; parts/sample.js shows the registration API.
// All four slides are built. Each keeps the id, kicker, title, cues, cite and tags of its
// storyboard, and one step per click with the storyboard's label.
(() => {
  'use strict';

  const DUR = Deck.timeline.DUR;
  const PART = 1;
  const { example: EX, choices: CHOICES, kicker, kept: KEPT } = Deck.motifs;
  const { kit, util } = Deck;
  const t = (key) => Deck.fact(key).text;
  const v = (key) => Deck.fact(key).value;

  // The facts that only this part prints. 'p1.bridge_tag', read at its source on 2026-11-17:
  // the tag in front of the third recommendation on the special topic deck's closing slide
  // (keepTag(3) with three entries in KEEP). The others, read in the paper's source text on
  // 2026-11-18 (`file` is relative to final-project/, as in shared/facts.js): plain words for
  // what the paper says in its own terms, each with the sentence it stands on.
  const TEX = 'paper/tmlr/sections';
  const paper = (where, file, text) => ({ text, src: 'paper', where, file });
  Deck.addFacts({
    'p1.bridge_tag': {
      text: 'Recommendation 3 of 3',
      src: 'talk1', where: 'closing slide, the tag of the third recommendation', file: 'special-topic/parts/part3.js:614-626 (sibling worktree)',
    },
    'p1.cot_gloss': paper('Sec. 1', `${TEX}/01_intro.tex:4-5 ("the chain of thought (CoT) of reasoning models ... the text written before an answer")`,
      'the reasoning a model writes before it answers'),
    'p1.outcome': paper('Sec. 1', `${TEX}/01_intro.tex:15-16 ("a trace follows the hint if it ends at that answer and resists it otherwise")`,
      'the final answer shows whether a trace followed'),
    'p1.sampled': paper('Sec. 3.1', `${TEX}/03_tasks.tex:11 ("temperature T = 0.6, top-p 0.95")`,
      'sampling is random'),
    'p1.benchmark_kind': paper('Sec. 3.1', `${TEX}/03_tasks.tex:7,10 ("A four-option question"; "300 subject-stratified MMLU-Redux 2.0 items")`,
      'multiple-choice questions across subjects'),
    'p1.unparsed_out': paper('Sec. 3.1; App. E', `${TEX}/03_tasks.tex:17-18 ("belong to neither group"); paper/tmlr/appendix/e_ceiling.tex:24-25 ("unparsed traces are not in the sample")`,
      'left out'),
    'p1.sample_scored': paper('Sec. 3.1; Sec. 4', `${TEX}/03_tasks.tex:21-25 ("On 20 seeded questions per model for the seven models"; "the 1,226 drawn hinted traces"); ${TEX}/04_readers.tex:125 ("against our 20")`,
      'scored on a sample'),
    // Read on 2026-11-18, after the second cold read. Why the sample has seven of the eight
    // models: the paper gives no reason, only that the eighth was dropped before any data.
    'p1.sample_models': paper('Sec. 3.1', `${TEX}/03_tasks.tex:13-14 ("Qwen3.8-27B was left out of all resampling before any data were read, so most of what follows is on seven models")`,
      'chosen in advance'),
    // How 20 questions of 7 models come to 1,226 traces and not to 20 traces each.
    'p1.sample_draw': {
      ...paper('Sec. 3.1; Sec. 4', `${TEX}/03_tasks.tex:22-24 ("a seeded draw of at most 6 followed, 6 resisted and 2 unhinted traces per resampled question (747, 479 and 280 traces"; "the 1,226 drawn hinted traces"); ${TEX}/04_readers.tex:146 ("at most 6 followed and 6 resisted traces per question")`,
        '6'),
      value: 6,
    },
    // What the hint moves the answer against: the same model's runs without the hint.
    'p1.influence_vs': paper('Sec. 3.1', `${TEX}/03_tasks.tex:14-16 ("the questions the hint influences (hinted share of X at least 0.33 above the unhinted share, which is at most 0.25)")`,
      'compared with no hint'),
    // What a state of the second task's corpus is, without the paper's "cells".
    'p1.second_state': paper('Sec. 3.3', `${TEX}/03_tasks.tex:53-55 ("environments in which deception is never prompted but pays"; "For each state they sample several trajectories and keep one honest and one deceptive")`,
      'situations where deception pays'),
    // Read on 2026-11-18, after the fourth cold read: what "exploratory" says of an analysis
    // (the paper's tier X), for the legend at the entrance of slide 2.
    'p1.exploratory': paper('Sec. 2; App. A', `${TEX}/02_definitions.tex:39,48-49 ("X, exploratory"; "followed every main-task result and are exploratory"); paper/tmlr/appendix/a_provenance.tex:85-86 ("exploratory: defined after the results had been read")`,
      'defined after the results were read'),
  });
  // A count as a word, for a sentence that opens on it or reads better with it.
  const COUNT_WORDS = Object.freeze(['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']);
  const inWords = (n) => {
    if (!COUNT_WORDS[n]) throw Deck.fail(`part 1: no word for the count ${n}`);
    return COUNT_WORDS[n];
  };
  const capital = (word) => word[0].toUpperCase() + word.slice(1);

  // ---------------------------------------------------------------- slide 1: title
  // The one place that shows a real name. The three authors share the talk, so each name
  // carries the same mark. The slide has no line that explains the mark.
  const EQUAL_MARK = '*';
  const authors = () => Deck.meta.authors.map((name) => `
    <span class="p1-title__person">${name}<span class="p1-title__mark">${EQUAL_MARK}</span></span>`).join('');
  // The talk's motif, the cut trace (kit.cutTrace): the first paragraphs of the worked example
  // (the prefix, what a monitor has read), a cut, and the rest of the reasoning not written yet.
  const TITLE = Object.freeze({
    // The title says "Chain-of-Thought"; every slide after it says "reasoning". Said once
    // here that the two are one thing.
    gloss: `<b>Chain of thought:</b> ${t('p1.cot_gloss')}.`,
    says: 'A monitor reads its start and has to call the ending:',
    cut: 'the monitor has read this far',
    end: 'answer: ?',
    // A compound that must not break at its hyphens.
    whole: 'Chain-of-Thought',
    typeAt: 1700,
    cps: 40,
  });
  const seen = EX.follower.lines.slice(0, EX.cut);
  const unseen = EX.follower.lines.slice(EX.cut);

  Deck.register({
    id: 'p1-title',
    part: PART,
    layout: 'bare',
    title: Deck.meta.title,
    cite: [],
    figure: 'illustrative',
    html: `
      <div class="p1-title">
        <div class="p1-title__course">${Deck.meta.course}</div>
        <h1 class="p1-title__name">${Deck.meta.title.replace(TITLE.whole, `<span class="p1-title__whole">${TITLE.whole}</span>`)}</h1>
        <p class="p1-title__sub">${Deck.meta.subtitle}</p>
        <p class="p1-title__says"><span class="p1-title__gloss">${TITLE.gloss}</span>${TITLE.says}</p>
        <div class="p1-title__trace">${kit.cutTrace({ key: 'title', seen, unseen: unseen.map(() => ''), cut: TITLE.cut, end: TITLE.end, size: 28 })}</div>
        <div class="p1-title__who">${authors()}</div>
      </div>`,
    setup: (ctx) => {
      const cut = kit.cutParts(ctx.q('[data-cut="title"]'));
      const enter = ctx.step({ label: 'a trace is typed, cut halfway' });
      enter.show('.p1-title__course', { at: 200 });
      enter.show('.p1-title__name', { at: 350, dur: DUR.move });
      enter.show('.p1-title__sub', { at: 800 });
      enter.show('.p1-title__person', { at: 1100, stagger: 140 });
      enter.show('.p1-title__says', { at: TITLE.typeAt - DUR.micro, rise: 0 });
      // The prefix types in teal: what the monitor reads.
      seen.forEach((line, i) => enter.type(cut.seenTexts[i], line, { at: i === 0 ? TITLE.typeAt : enter.end + DUR.micro, cps: TITLE.cps }));
      // The cut lands, and what lies beyond it is not written yet.
      enter.show(cut.rule, { at: enter.end + DUR.enter, rise: 0 });
      enter.tween(cut.unseen, { opacity: [0, 1] }, { at: enter.end, stagger: DUR.micro });
      enter.show(cut.end, { at: enter.end, rise: 0 });
      enter.hold(DUR.enter);
    },
  });

  // ---------------------------------------------------------------- slide 2: introduction
  // The bridge from the special topic talk, then one trace drawn in time, from left to
  // right: the prompt, the reasoning as one bar per paragraph, the answer. The row is the cut
  // trace of the title slide drawn in time (kit.cutTrace, as bars). It holds no text of a
  // trace (the worked example arrives whole on slide 4), but it has that example's shape: as
  // many paragraphs, cut after as many.
  // The earlier talk's recommendation, broken at its comma: "track" is what this talk takes up.
  const REC = (() => {
    const text = t('bridge.rec3');
    const comma = text.indexOf(',');
    if (comma < 0) throw Deck.fail('p1-prefix: the earlier talk’s recommendation has no comma to break at');
    return Object.freeze({ track: text.slice(0, comma), rest: text.slice(comma) });
  })();
  // That talk's definition ends on "reading it?". Away from its slide "it" has no noun, and
  // a listener who was not there cannot fill it in, so the line names the reasoning. That
  // makes it this talk's wording: it stands under the quoted block, not inside it, with no
  // quotation marks and without the block's rule.
  const MONITORABILITY = (() => {
    const text = t('bridge.monitorability');
    if (!/ it\?$/.test(text)) throw Deck.fail('p1-prefix: the earlier talk’s definition of monitorability no longer ends on "it?"');
    return text.replace(/ it\?$/, ' the reasoning?');
  })();
  // The one tag of the talk that no footer carries: Part 3 sets it beside a result (slides 9
  // to 11). The legend of the entrance shows it as those slides do, a chip, with the paper's
  // meaning in a few words; the slide's setup refuses a word that no slide shows as a chip.
  const EXPLORATORY = Object.freeze({ tag: 'exploratory', means: t('p1.exploratory') });
  if (!t('scope.exploratory').includes(EXPLORATORY.tag)) throw Deck.fail(`p1-prefix: the legend’s "${EXPLORATORY.tag}" is not a word of scope.exploratory`);
  // The two ends of a score, as the slide's last line says them. Not a measured number.
  const SCORE_ENDS = Object.freeze({ lo: 0, hi: 1 });
  const PRE = Object.freeze({
    todayY: 376,                                   // where the line for today stands under the bridge
    prompt: Object.freeze({ x: 0, w: 200 }),
    bar: Object.freeze({ x: 280, w: 216, gap: 16, cutGap: 40 }),
    answer: Object.freeze({ x: 1296, w: 144 }),
    arrows: Object.freeze({ in: 208, out: 1224 }),
    verdict: 1496,
    lens: 8,                                       // the width of the lens (core/kit.css)
    lensLead: 12,                                  // it starts and ends this far outside the bars
    cutShort: 292, cutLong: 440,                   // the cut line: to the prefix's line, then on to the monitor's
  });
  const PARAGRAPHS = EX.follower.lines.length;
  const BARS = kit.cutBars({ count: PARAGRAPHS, cut: EX.cut, ...PRE.bar });
  const barX = BARS.barX;
  const CUT_X = BARS.cutX;
  const TRACE_W = PRE.answer.x + PRE.answer.w - barX(0);
  const LENS = Object.freeze({
    from: barX(0) - PRE.lensLead,
    to: barX(PARAGRAPHS - 1) + PRE.bar.w + PRE.lensLead - PRE.lens,
    cut: CUT_X - PRE.lensLead,
  });
  // When a lens that travels from x0 to x1 in `dur` ms, from `at` on, is over the middle of bar i.
  const passes = (i, x0, x1, at, dur) => at + ((barX(i) + PRE.bar.w / 2 - PRE.lens / 2 - x0) / (x1 - x0)) * dur;
  // The beats of click 1, in ms: the prompt, the first bar, one bar, the lens over all bars.
  // `judged` is when the verdict lands: after the answer has been at rest for 0.8 s and the
  // lens has crossed the whole trace. The second cue waits for it.
  const PRE_AT = (() => {
    const prompt = 700;
    const write = 1100;
    const perBar = 500;
    const read = 1200;
    const answered = write + PARAGRAPHS * perBar + 100;
    const out = answered + DUR.enter;
    const reads = out + 800;
    const judged = reads + read + DUR.micro;
    return Object.freeze({ prompt, write, perBar, read, answered, out, reads, judged });
  })();

  const place = (x, w) => `style="left:${x}px${w === undefined ? '' : `;width:${w}px`}"`;
  const arrowHtml = (key) => `
        <svg class="p1-pre__arrow" data-arrow="${key}" ${place(PRE.arrows[key])} viewBox="0 0 64 24" width="64" height="24"><path d="M2 12h56M48 4l10 8-10 8"/></svg>`;
  const nameHtml = (key, x) => `<span class="p1-pre__name" data-name="${key}" ${place(x)}>${key}</span>`;
  const preHtml = () => `
    <div class="p1-pre">
      <div class="p1-pre__bridge">
        <p class="p1-pre__from">Our special topic talk:</p>
        <p class="p1-pre__tag">${t('p1.bridge_tag')}</p>
        <p class="p1-pre__rec">“<span class="p1-pre__track">${REC.track}</span>${REC.rest}.”</p>
      </div>
      <p class="p1-pre__gloss"><b>Monitorability:</b> ${MONITORABILITY}</p>
      <p class="p1-pre__today"><b>Today:</b> how a monitor gets its <em>score</em>, and three ways that score can mislead.</p>
      <div class="p1-pre__tags">
        <p class="p1-pre__tags-head">Tags</p>
        <ul class="dk-tags__list"></ul>
        <p class="p1-pre__mark"><span class="dk-chip">${EXPLORATORY.tag}</span><span class="dk-tags__means">${EXPLORATORY.means}</span></p>
      </div>
      <div class="p1-pre__run">
        <p class="p1-pre__trace" ${place(barX(0), TRACE_W)}><b>Trace:</b> one run of a model’s reasoning, up to its answer.</p>
        <i class="p1-pre__brace" ${place(barX(0), TRACE_W)}></i>
        ${kit.cutTrace({ key: 'pre', bars: BARS, end: PRE.answer, inner: kit.cutBar({ x: PRE.prompt.x, w: PRE.prompt.w, strokes: 2, cls: 'p1-pre__prompt' }) })}
        ${arrowHtml('in')}
        ${arrowHtml('out')}
        <div class="p1-pre__verdict" ${place(PRE.verdict)}>${kit.flag({ key: 'pre-verdict', text: 'verdict' })}</div>
        ${kit.lens({ key: 'pre' })}
        ${nameHtml('prompt', PRE.prompt.x)}
        ${nameHtml('reasoning', barX(0))}
        ${nameHtml('answer', PRE.answer.x)}
        ${nameHtml('monitor', PRE.verdict)}
        <p class="p1-pre__cut-label" ${place(CUT_X + PRE.bar.cutGap / 2)}>cut halfway: r = ${t('task.cut_r')}</p>
        <p class="p1-pre__prefix" ${place(0, CUT_X - PRE.bar.cutGap / 2)}><b>Prefix:</b> the reasoning up to a cut.</p>
        <p class="p1-pre__rest" ${place(CUT_X + PRE.bar.cutGap / 2)}>The rest is not written yet.</p>
        <p class="p1-pre__monitor" ${place(0, CUT_X - PRE.bar.cutGap / 2)}><b>Prefix monitor:</b> reads the prefix and predicts the ending.</p>
        <div class="p1-pre__score" ${place(CUT_X + PRE.bar.cutGap / 2)}><span>${SCORE_ENDS.lo}</span>${kit.meter({ key: 'pre-score', label: '', tone: 'read' })}<span>${SCORE_ENDS.hi}</span></div>
        <p class="p1-pre__between" ${place(CUT_X + PRE.bar.cutGap / 2)}>Its prediction is a score.</p>
      </div>
    </div>`;

  Deck.register({
    id: 'p1-prefix',
    part: PART,
    kicker: kicker(PART, 'Introduction'),
    title: 'To act in time, a monitor reads only the start of the reasoning: <em>a prefix</em>',
    cues: [
      'Tracking monitorability needs a score',
      { text: 'A verdict after the answer comes too late', step: 1, at: PRE_AT.judged },
      // Which ending: the one this talk scores (the paper's Sec. 1: a trace follows the hint if
      // it ends at the wrong answer the hint names). The hint itself arrives on slide 4.
      { text: 'The ending here: will the model follow a wrong hint?', step: 3 },
    ],
    cite: [{ src: 'paper', where: 'Sec. 1, 2' }, { src: 'talk1', where: 'closing slide' }, { src: 'korbak2025', where: '' }],
    figure: 'schematic',
    html: preHtml(),
    setup: (ctx) => {
      const trace = kit.cutParts(ctx.q('[data-cut="pre"]'));
      const bars = trace.pieces;
      const ink = (piece) => piece.querySelector('.dk-cut__ink');
      const answer = trace.end;
      const open = answer.querySelector('.dk-cut__q');
      const lens = ctx.q('.p1-pre__run .dk-lens');
      const chip = ctx.q('.p1-pre__verdict .dk-flag');
      const beyond = util.range(PARAGRAPHS).slice(EX.cut);
      // The lens crosses the bars from x0 to x1; each bar in `over` turns read (or back) as it
      // passes.
      const sweep = (step, { x0, x1, at, dur, over, on }) => {
        step.tween(lens, { opacity: [0, 1] }, { at: at - DUR.micro, dur: DUR.micro });
        step.tween(lens, { x: [x0, x1] }, { at, dur, ease: 'linear' });
        over.forEach((i) => step.cls(bars[i], 'is-read', { at: passes(i, x0, x1, at, dur), on }));
        step.tween(lens, { opacity: [1, 0] }, { at: at + dur, dur: DUR.micro });
      };

      // The legend of the footer tags, said once where the first footer with room for it
      // stands: the tags every slide of the deck carries, each in a few words (Deck.tagLegend;
      // the sources slide has the full sentences). It is filled in here and not in the markup,
      // because the slides of the other parts register after this file. Under them, in a row
      // of its own and outside that list, the tag that stands beside a result.
      ctx.q('.p1-pre__tags .dk-tags__list').innerHTML = Deck.tagLegend(Deck.slides, 'short');
      const asChip = new RegExp(`class="dk-chip[^"]*">${EXPLORATORY.tag}<`);
      if (!Deck.slides.some((slide) => slide.part !== PART && asChip.test(slide.html))) {
        throw Deck.fail(`p1-prefix: the legend explains "${EXPLORATORY.tag}", and no slide of another part shows a chip with that word`);
      }

      // Entrance: the earlier talk's third recommendation, its definition, and today's turn.
      const enter = ctx.step({ label: 'the bridge from the special topic talk' });
      enter.tween('.p1-pre__bridge', { opacity: [0, 1] }, { at: 200 });
      enter.show('.p1-pre__from', { at: 300, rise: 0 });
      enter.show('.p1-pre__tag', { at: 600, rise: 0 });
      enter.show('.p1-pre__rec', { at: 700, dur: DUR.move });
      enter.show('.p1-pre__gloss', { at: 1700 });
      enter.tween('.p1-pre__track', { '--p1-under': ['0%', '100%'] }, { at: 2900, dur: DUR.move, ease: 'inOut' });
      enter.tween('.p1-pre__today', { opacity: [0, 1], y: [PRE.todayY + 16, PRE.todayY] }, { at: 3100 });
      enter.tween('.p1-pre__tags', { opacity: [0, 1] }, { at: 3900 });
      enter.hold(DUR.micro);

      // Click 1: the trace is written from left to right; only then does the monitor read it.
      const run = ctx.step({ label: 'a monitor that reads the finished reasoning' });
      run.tween('.p1-pre__bridge, .p1-pre__gloss, .p1-pre__tags', { opacity: [1, 0] }, { dur: DUR.micro });
      run.tween('.p1-pre__today', { y: [PRE.todayY, 0] }, { at: 100, dur: DUR.move, ease: 'inOut' });
      run.show('.p1-pre__prompt', { at: PRE_AT.prompt });
      run.show('[data-name="prompt"]', { at: PRE_AT.prompt, rise: 0 });
      run.tween('[data-arrow="in"]', { opacity: [0, 1] }, { at: PRE_AT.prompt + 300, dur: DUR.micro });
      bars.forEach((bar, i) => {
        const at = PRE_AT.write + i * PRE_AT.perBar;
        run.tween(bar, { opacity: [0, 1] }, { at, dur: DUR.micro });
        run.tween(ink(bar), { '--dk-ink': ['0%', '100%'] }, { at: at + 60, dur: PRE_AT.perBar - 100, ease: 'linear' });
      });
      run.show('[data-name="reasoning"]', { at: PRE_AT.write, rise: 0 });
      run.tween('[data-arrow="out"]', { opacity: [0, 1] }, { at: PRE_AT.answered - 100, dur: DUR.micro });
      run.tween(answer, { opacity: [0, 1], scale: [0.6, 1] }, { at: PRE_AT.answered, dur: DUR.enter, ease: 'back' });
      run.show('[data-name="answer"]', { at: PRE_AT.answered, rise: 0 });
      run.tween('.p1-pre__brace', { opacity: [0, 1] }, { at: PRE_AT.out + 100 });
      run.show('.p1-pre__trace', { at: PRE_AT.out + 200 });
      sweep(run, { x0: LENS.from, x1: LENS.to, at: PRE_AT.reads, dur: PRE_AT.read, over: util.range(PARAGRAPHS), on: true });
      kit.stamp(run, chip, 'p1-is-given', PRE_AT.judged);
      run.show('[data-name="monitor"]', { at: PRE_AT.judged, rise: 0 });
      run.hold(DUR.micro);

      // Click 2: the same row rewinds to its middle, and the cut drops there.
      const cut = ctx.step({ label: 'the cut' });
      cut.tween(chip, { opacity: [1, 0] }, { dur: DUR.micro });
      cut.tween('[data-name="monitor"]', { opacity: [1, 0] }, { dur: DUR.micro });
      sweep(cut, { x0: LENS.to, x1: LENS.from, at: 300, dur: 700, over: util.range(PARAGRAPHS), on: false });
      cut.cls(answer, 'is-open', { at: 300 });
      cut.tween(ink(answer), { opacity: [1, 0] }, { at: 300, dur: DUR.micro });
      cut.tween(open, { opacity: [0, 1] }, { at: 300, dur: DUR.micro });
      [...beyond].reverse().forEach((i, n) => {
        const at = 400 + n * 300;
        cut.tween(ink(bars[i]), { '--dk-ink': ['100%', '0%'] }, { at, dur: 300, ease: 'linear' });
        cut.cls(bars[i], 'is-open', { at: at + 300 });
      });
      const rewound = 400 + beyond.length * 300;
      cut.tween(trace.rule, { opacity: [0, 1], y: [-56, 0] }, { at: rewound + 200, dur: DUR.enter });
      cut.cls(trace.seen, 'is-prefix', { at: rewound + 500 });
      cut.show('.p1-pre__cut-label', { at: rewound + 600, rise: 0 });
      cut.show('.p1-pre__prefix', { at: rewound + 1000 });
      cut.show('.p1-pre__rest', { at: rewound + 1600 });
      cut.hold(DUR.micro);

      // Click 3: the monitor reads the prefix and gives a score while the rest is still open;
      // only then is the rest written and does the answer land.
      const ahead = ctx.step({ label: 'a prefix monitor predicts the ending' });
      ahead.tween(trace.rule, { height: [`${PRE.cutShort}px`, `${PRE.cutLong}px`] }, { dur: DUR.enter });
      ahead.show('.p1-pre__monitor', { at: 100 });
      sweep(ahead, { x0: LENS.from, x1: LENS.cut, at: 900, dur: 800, over: util.range(EX.cut), on: true });
      ahead.show('.p1-pre__score', { at: 1500, rise: 0 });
      ahead.tween('[data-meter="pre-score"] .dk-meter__fill', { '--v': ['0%', `${Math.round(EX.follower.score * 100)}%`] }, { at: 1800, dur: DUR.move });
      ahead.show('.p1-pre__between', { at: 2200 });
      const later = 3800;
      ahead.tween('.p1-pre__rest', { opacity: [1, 0] }, { at: later, dur: DUR.micro });
      beyond.forEach((i, n) => {
        const at = later + n * 500;
        ahead.cls(bars[i], 'is-open', { at, on: false });
        ahead.cls(bars[i], 'is-beyond', { at });
        ahead.tween(ink(bars[i]), { '--dk-ink': ['0%', '100%'] }, { at: at + 60, dur: 400, ease: 'linear' });
      });
      const landed = later + beyond.length * 500 + 100;
      ahead.cls(answer, 'is-open', { at: landed, on: false });
      ahead.tween(open, { opacity: [1, 0] }, { at: landed, dur: DUR.micro });
      ahead.tween(ink(answer), { opacity: [0, 1] }, { at: landed, dur: DUR.micro });
      ahead.tween(answer, { scale: [0.7, 1] }, { at: landed, dur: DUR.enter, ease: 'back' });
      ahead.hold(DUR.enter);
    },
  });

  // ---------------------------------------------------------------- slide 3: motivation
  // Six scores on one axis and a magnified stretch of it; under them a panel of three dials,
  // the three scoring choices; then what the project is and what it is not.
  // The six dots are the six readers that Part 3 keeps, at their within-question scores
  // (Table 2); they are not named here, and the first line says that they are six of nine.
  // When the first dial turns they are drawn again, in the magnified stretch, at their pooled
  // scores, the same table's next column: the first choice, which Part 3 takes up. Rings
  // stay where they stood, and a key in the strip names the two in plain words (ring: within
  // a question; dot: across questions, the words in which slide 6 then explains "within
  // question" and "pooled"). No number is printed for where they land, and
  // nothing says which dot is which; the strip has a scale of its own (a line every 0.01, two
  // of them numbered), so how far the dots moved can be read off it. On the whole scale six
  // dots on one spot cannot be counted, so from that click on it shows two marks: an outline
  // over the range the six stood in and a filled bar over the range they stand in pooled.
  // Those two stay to the last step, where the strip has closed, and the key moves under
  // them: the same six readers, a little to the right, at the scale's true size.
  // Between the two states the dots travel as one group, all by the same amount (`shift`,
  // the mean rise): each score moves by its own amount in the data, and drawn that way the
  // dots would overtake one another, which a room reads as "the ranking changed". The paper
  // could not tell a reordering from noise (its conclusion), so the slide shows that the
  // levels move and does not show who passes whom.
  // The ends of the score's scale and what each means, as the axis says them. Not measured numbers.
  const SCALE = Object.freeze({ lo: 0.5, hi: 1, loSays: 'guessing', hiSays: 'perfect' });
  const STK = (() => {
    const readers = KEPT.map((key) => Object.freeze({ key, within: v(`reader.${key}.within`), pooled: v(`reader.${key}.pooled`) }));
    const lo = Math.min(...readers.map((reader) => reader.within));
    const hi = Math.max(...readers.map((reader) => reader.within));
    if (readers.length !== v('readers.kept') || lo !== v('readers.within_min') || hi !== v('readers.within_max_kept')) {
      throw Deck.fail('p1-stakes: the readers that are kept do not span readers.within_min to readers.within_max_kept');
    }
    const aside = v('readers.count') - readers.length;
    if (Deck.motifs.readers.length !== v('readers.count') || aside <= 0) throw Deck.fail('p1-stakes: readers.count is not the number of readers, or none is set aside');
    // The stretch of the axis that the magnifier shows: the six scores before and after the
    // first dial turns, with a margin.
    const margin = 0.01;
    const pooledLo = Math.min(...readers.map((reader) => reader.pooled));
    const pooledHi = Math.max(...readers.map((reader) => reader.pooled));
    const zoom = Object.freeze({ lo: lo - margin, hi: pooledHi + margin });
    const mean = (field) => readers.reduce((sum, reader) => sum + reader[field], 0) / readers.length;
    // The strip's own scale: a line at every hundredth inside it, the first and the last numbered.
    const hundredths = util.range(Math.floor(zoom.hi * 100 + 1e-9) - Math.ceil(zoom.lo * 100 - 1e-9) + 1).map((n) => (Math.ceil(zoom.lo * 100 - 1e-9) + n) / 100);
    if (hundredths.length < 2) throw Deck.fail('p1-stakes: the magnified stretch holds fewer than two hundredths to number');
    return Object.freeze({
      readers, lo, hi, pooledLo, pooledHi, zoom, shift: mean('pooled') - mean('within'), range: `${t('readers.within_min')} to ${t('readers.within_max_kept')}`,
      ticks: Object.freeze(hundredths.map((value, i) => Object.freeze({ value, label: i === 0 || i === hundredths.length - 1 ? value.toFixed(2) : '' }))),
      // Who the six are, in the first line's words: six of the nine, three set aside in Part 3 ('readers.forced_aside').
      // The nine are readers, and not every one of them is a monitor (slide 5), so the line says "readers".
      who: `${capital(inWords(readers.length))} of our ${inWords(v('readers.count'))} readers (${inWords(aside)} set aside: Part 3)`,
    });
  })();
  // Geometry in stage pixels. AXIS: the whole scale. ZOOM: the magnified stretch (`line` is
  // the height of its rail, `row` the step between rows of dots that would overlap).
  const AXIS = Object.freeze({ x: 120, w: 1488, y: 36, ticks: 6 });
  const ZOOM = Object.freeze({ w: 1728, pad: 96, line: 132, dot: 28, row: 30, grid: Object.freeze({ top: 84, bottom: 180 }) });
  const FAN = Object.freeze({ h: 44 });
  const SETTINGS_LIFT = 224;                       // how far the panel moves up at the last click
  // The key of the two marks, each entry placed by the edge that faces the other, so that a
  // wider font moves neither: in the strip's top right corner, then (`rest`) on the row under
  // the scale, the ring's entry in front of the range it names and the dot's behind the bar.
  const KEY = Object.freeze({
    top: 160, ring: 1352, dot: 1384,
    rest: Object.freeze({ top: 96, ring: 870, dot: 1136 }),
  });
  const onAxis = (value) => AXIS.x + ((value - SCALE.lo) / (SCALE.hi - SCALE.lo)) * AXIS.w;
  const onZoom = (value) => ZOOM.pad + ((value - STK.zoom.lo) / (STK.zoom.hi - STK.zoom.lo)) * (ZOOM.w - 2 * ZOOM.pad);
  // Scores closer than a dot is wide stand in rows over and under the rail (0, -1, 1).
  const ZOOM_ROWS = (() => {
    const placed = [];
    [...STK.readers].sort((a, b) => a.within - b.within).forEach((reader) => {
      const x = onZoom(reader.within);
      const row = [0, -1, 1].find((r) => placed.every((p) => p.row !== r || Math.abs(p.x - x) >= ZOOM.dot + 4));
      if (row === undefined) throw Deck.fail('p1-stakes: more than three scores on one spot of the magnified axis');
      placed.push({ key: reader.key, x, row });
    });
    return Object.freeze(Object.fromEntries(placed.map((p) => [p.key, p.row])));
  })();
  // The three dials: where each hand points, in degrees from the top; the first one turns.
  const DIALS = Object.freeze([{ from: -64, to: 52 }, { from: 28 }, { from: -22 }]);
  const DIAL = Object.freeze({ size: 96, inner: 41, outer: 47, sweep: 120, step: 20 });
  const dialTicks = util.range((2 * DIAL.sweep) / DIAL.step + 1).map((n) => {
    const a = ((-DIAL.sweep + n * DIAL.step) * Math.PI) / 180;
    const point = (r) => [(DIAL.size / 2 + r * Math.sin(a)).toFixed(1), (DIAL.size / 2 - r * Math.cos(a)).toFixed(1)];
    const [x1, y1] = point(DIAL.inner);
    const [x2, y2] = point(DIAL.outer);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  }).join('');
  const choiceHtml = (choice, i) => `
          <div class="p1-stk__choice" data-choice="${i}">
            <div class="p1-stk__dial">
              <svg class="p1-stk__ticks" viewBox="0 0 ${DIAL.size} ${DIAL.size}" width="${DIAL.size}" height="${DIAL.size}">${dialTicks}</svg>
              <div class="p1-stk__knob"><i class="p1-stk__hand"></i><span class="p1-stk__num">${i + 1}</span></div>
            </div>
            <p class="p1-stk__name">${choice.ask}</p>
          </div>`;
  const dotsHtml = (cls, place) => STK.readers.map((reader) => {
    const { x, y } = place(reader);
    return `<i class="${cls}" data-reader="${reader.key}" style="left:${x.toFixed(1)}px;top:${y}px"></i>`;
  }).join('');
  const axisPlace = (reader) => ({ x: onAxis(reader.within), y: AXIS.y });
  const zoomPlace = (reader) => ({ x: onZoom(reader.within), y: ZOOM.line + ZOOM_ROWS[reader.key] * ZOOM.row });
  const stakesHtml = () => `
    <div class="p1-stk">
      <p class="p1-stk__lead">${STK.who}, one AUROC each (explained in Part 2):</p>
      <div class="p1-stk__axis">
        <i class="p1-stk__line" style="left:${AXIS.x}px;width:${AXIS.w}px;top:${AXIS.y}px"></i>
        ${util.range(AXIS.ticks).map((n) => `<i class="p1-stk__tick" style="left:${AXIS.x + (n * AXIS.w) / (AXIS.ticks - 1)}px;top:${AXIS.y}px"></i>`).join('')}
        <span class="p1-stk__end" style="left:${AXIS.x}px;top:${AXIS.y}px">${SCALE.lo} = ${SCALE.loSays}</span>
        <span class="p1-stk__end" style="left:${AXIS.x + AXIS.w}px;top:${AXIS.y}px">${SCALE.hi} = ${SCALE.hiSays}</span>
        <i class="p1-stk__window" style="left:${onAxis(STK.zoom.lo).toFixed(1)}px;width:${(onAxis(STK.zoom.hi) - onAxis(STK.zoom.lo)).toFixed(1)}px;top:${AXIS.y}px"></i>
        <i class="p1-stk__stood" style="left:${onAxis(STK.lo).toFixed(1)}px;width:${(onAxis(STK.hi) - onAxis(STK.lo)).toFixed(1)}px;top:${AXIS.y}px"></i>
        <i class="p1-stk__moved" style="left:${onAxis(STK.pooledLo).toFixed(1)}px;width:${(onAxis(STK.pooledHi) - onAxis(STK.pooledLo)).toFixed(1)}px;top:${AXIS.y}px"></i>
        ${dotsHtml('p1-stk__dot', axisPlace)}
        <span class="p1-stk__kept" style="right:${(ZOOM.w - onAxis(STK.hi)).toFixed(1)}px;top:${AXIS.y}px">${STK.range}</span>
      </div>
      <svg class="p1-stk__fan" viewBox="0 0 ${ZOOM.w} ${FAN.h}" width="${ZOOM.w}" height="${FAN.h}">
        <line x1="${onAxis(STK.zoom.lo).toFixed(1)}" y1="0" x2="1" y2="${FAN.h}"/>
        <line x1="${onAxis(STK.zoom.hi).toFixed(1)}" y1="0" x2="${ZOOM.w - 1}" y2="${FAN.h}"/>
      </svg>
      <div class="p1-stk__zoom">
        <span class="p1-stk__range" style="left:${onZoom((STK.lo + STK.hi) / 2).toFixed(1)}px">${STK.range}</span>
        <i class="p1-stk__span" style="left:${(onZoom(STK.lo) - ZOOM.dot).toFixed(1)}px;width:${(onZoom(STK.hi) - onZoom(STK.lo) + 2 * ZOOM.dot).toFixed(1)}px"></i>
        ${STK.ticks.map((tick) => `<i class="p1-stk__grid" style="left:${onZoom(tick.value).toFixed(1)}px;top:${ZOOM.grid.top}px;height:${ZOOM.grid.bottom - ZOOM.grid.top}px"></i>`).join('')}
        ${STK.ticks.filter((tick) => tick.label).map((tick) => `<span class="p1-stk__at" style="left:${onZoom(tick.value).toFixed(1)}px;top:${ZOOM.grid.bottom}px">${tick.label}</span>`).join('')}
        <i class="p1-stk__rail" style="top:${ZOOM.line}px"></i>
        ${dotsHtml('p1-stk__ghost p1-stk__ghost--zoom', zoomPlace)}
        ${dotsHtml('p1-stk__dot p1-stk__dot--zoom', zoomPlace)}
      </div>
      <span class="p1-stk__key" data-mark="ring" style="right:${ZOOM.w - KEY.ring}px;top:${KEY.top}px"><i></i>within a question</span>
      <span class="p1-stk__key" data-mark="dot" style="left:${KEY.dot}px;top:${KEY.top}px"><i></i>across questions</span>
      <p class="p1-stk__ask">Is any really better?</p>
      <div class="p1-stk__settings">
        <div class="p1-stk__panel">${CHOICES.map(choiceHtml).join('')}
        </div>
        <p class="p1-stk__each">Part 3 shows: these choices move scores as much as the readers differ.</p>
      </div>
      <div class="p1-stk__aim">
        ${kit.scope({ size: 3, stacked: true })}
        <p class="p1-stk__limits"><span>None of these mechanisms is new: we add their size, on one task.</span><span>Most of our analyses are exploratory.</span></p>
      </div>
    </div>`;

  Deck.register({
    id: 'p1-stakes',
    part: PART,
    kicker: kicker(PART, 'Motivation'),
    title: 'A monitor’s score depends on how it is scored, <em>so we measured by how much</em>',
    cues: [
      'Recent studies score prefix monitors with a single number',
      // With the panel of dials, at the click that brings it: what the dials are.
      { text: 'Three scoring choices sit behind that number', step: 1, at: 600 },
    ],
    cite: [{ src: 'paper', where: 'Sec. 1, 4, 7; Table 2' }],
    figure: 'schematic',
    numbers: 'reported',
    html: stakesHtml(),
    setup: (ctx) => {
      const dial = (i) => ctx.q(`[data-choice="${i}"] .p1-stk__dial`);
      const hand = (i) => ctx.q(`[data-choice="${i}"] .p1-stk__hand`);
      const dot = (cls, reader) => ctx.q(`.${cls}[data-reader="${reader.key}"]`);
      const middle = onZoom((STK.lo + STK.hi) / 2);

      // Entrance: six dots land almost on one spot; the magnifier opens on them.
      const enter = ctx.step({ label: 'six readers, six scores' });
      enter.show('.p1-stk__lead', { at: 200 });
      enter.tween('.p1-stk__line, .p1-stk__tick, .p1-stk__end', { opacity: [0, 1] }, { at: 500 });
      enter.tween('.p1-stk__axis > .p1-stk__dot', { opacity: [0, 1], y: [-44, 0] }, { at: 1100, stagger: 150 });
      const opens = 1100 + STK.readers.length * 150 + DUR.enter + 300;
      enter.tween('.p1-stk__window', { opacity: [0, 1] }, { at: opens, dur: DUR.micro });
      enter.tween('.p1-stk__fan', { opacity: [0, 1] }, { at: opens + 100 });
      enter.tween('.p1-stk__zoom', { opacity: [0, 1] }, { at: opens + 100 });
      STK.readers.forEach((reader) => {
        enter.tween(dot('p1-stk__dot--zoom', reader), { x: [middle - onZoom(reader.within), 0] }, { at: opens + 400, dur: DUR.move, ease: 'inOut' });
      });
      enter.tween('.p1-stk__span', { opacity: [0, 1] }, { at: opens + 1300 });
      enter.tween('.p1-stk__range', { opacity: [0, 1] }, { at: opens + 1400 });
      enter.show('.p1-stk__ask', { at: opens + 2300 });
      enter.hold(DUR.micro);

      // Click 1: the panel of dials; the first one turns and the six scores move. In the
      // strip rings stay where they stood; the dots fade there and are drawn again at their
      // pooled scores, arriving as one group that glides to the right (see STK), and the key
      // names rings and dots. On the scale the six dots give way to one outline over their
      // range, and a filled bar over their pooled range leaves it by the same glide.
      const set = ctx.step({ label: 'the score has settings' });
      set.tween('.p1-stk__ask', { opacity: [1, 0] }, { dur: DUR.micro });
      set.show('.p1-stk__panel', { at: 600 });
      DIALS.forEach((d, i) => set.tween(hand(i), { rotate: [d.from, d.from] }, { dur: 0 }));
      const turns = 1700;
      const turning = { at: turns, dur: 1400, ease: 'inOut' };
      set.cls(dial(0), 'p1-is-set', { at: turns });
      set.tween(hand(0), { rotate: [DIALS[0].from, DIALS[0].to] }, turning);
      const redrawn = turns + DUR.micro;
      const gliding = { at: redrawn, dur: turning.dur - DUR.micro, ease: 'inOut' };
      set.tween('.p1-stk__ghost, .p1-stk__stood', { opacity: [0, 1] }, { at: turns, dur: DUR.micro });
      set.tween('.p1-stk__axis > .p1-stk__dot', { opacity: [1, 0] }, { at: turns, dur: DUR.micro });
      set.tween('.p1-stk__dot--zoom', { opacity: [1, 0] }, { at: turns, dur: DUR.micro });
      set.tween('.p1-stk__dot--zoom', { opacity: [0, 1] }, { at: redrawn, dur: DUR.enter });
      set.tween('.p1-stk__key', { opacity: [0, 1] }, { at: redrawn, dur: DUR.enter });
      set.tween('.p1-stk__moved', { opacity: [0, 1] }, { at: redrawn, dur: DUR.enter });
      set.tween('.p1-stk__moved', { x: [onAxis(STK.lo) - onAxis(STK.lo + STK.shift), 0] }, gliding);
      STK.readers.forEach((reader) => {
        const el = dot('p1-stk__dot--zoom', reader);
        const row = -ZOOM_ROWS[reader.key] * ZOOM.row;       // the row it leaves in the strip
        const to = onZoom(reader.pooled) - onZoom(reader.within);
        const glide = onZoom(STK.lo + STK.shift) - onZoom(STK.lo);
        set.tween(el, { x: [0, 0], y: [0, 0] }, { dur: 0 });
        set.tween(el, { y: [row, row] }, { at: redrawn, dur: 0 });
        set.tween(el, { x: [to - glide, to] }, gliding);
      });
      set.hold(DUR.enter);

      // Click 2: the dials get their names, in the order and the words of Part 3's results.
      const named = ctx.step({ label: 'three scoring choices' });
      CHOICES.forEach((_, i) => {
        const at = 300 + i * 900;
        named.cls(dial(i), 'p1-is-named', { at });
        named.tween(`[data-choice="${i}"] .p1-stk__num`, { opacity: [0, 1], scale: [1.6, 1] }, { at, dur: DUR.enter, ease: 'back' });
        named.show(`[data-choice="${i}"] .p1-stk__name`, { at: at + 100 });
      });
      named.show('.p1-stk__each', { at: 300 + CHOICES.length * 900 + 300 });
      named.hold(DUR.micro);

      // Click 3: the magnifier closes, the panel steps back and up, and the scope line arrives
      // in its frame. The two marks on the scale stay, and the key of the strip moves to the
      // row under them, one entry to each side of the range: what the first dial did is still
      // on screen when the strip is not.
      const aim = ctx.step({ label: 'what the project is, and what it is not' });
      aim.tween('.p1-stk__fan, .p1-stk__zoom, .p1-stk__window', { opacity: [1, 0] }, { dur: 300 });
      ['ring', 'dot'].forEach((mark) => {
        aim.tween(`.p1-stk__key[data-mark="${mark}"]`, { x: [0, KEY.rest[mark] - KEY[mark]], y: [0, KEY.rest.top - KEY.top] }, { at: 200, dur: DUR.move, ease: 'inOut' });
      });
      aim.tween('.p1-stk__settings', { y: [0, -SETTINGS_LIFT] }, { at: 200, dur: DUR.move, ease: 'inOut' });
      aim.tween('.p1-stk__ticks, .p1-stk__hand', { opacity: [1, 0.45] }, { at: 200 });
      aim.tween('.p1-stk__kept', { opacity: [0, 1] }, { at: 600 });
      aim.tween('.dk-scope', { opacity: [0, 1], scale: [0.96, 1] }, { at: 1700, dur: DUR.move });
      aim.show('.p1-stk__limits span', { at: 2700, stagger: 600, rise: 0 });
      aim.hold(DUR.micro);
    },
  });

  // ---------------------------------------------------------------- slide 4: dataset
  // Five scenes on one stage. The task (the earlier talk's question card with this project's
  // hint typed in front of it), two runs of that prompt, the counts from top to bottom, then
  // wow 1: of every 1,000 traces that follow the hint, at least 977 restate it; and the
  // second task. The stage cannot hold all of it at a size a room can read, so what has
  // been read folds away: the example when the counts arrive, the upper counts when the
  // grid arrives. The bar of the 14,300 traces stays: the grid stands under its red part,
  // as wide as that part, and is those traces by the hundred.
  const HINT_PARTS = (() => {
    const hint = Deck.motifs.hint();
    const target = `(${EX.target})`;
    const at = hint.indexOf(target);
    if (at < 0 || hint.indexOf(target, at + 1) >= 0) throw Deck.fail('p1-data: the hint should name its option exactly once');
    return Object.freeze({ before: `“${hint.slice(0, at)}`, target, after: `${hint.slice(at + target.length)}”` });
  })();
  // The two traces of the worked example. `state` is the chip's class in core/kit.css: red
  // for a trace that follows the hint, green for one that resists, for the whole talk.
  const RUNS = Object.freeze([
    Object.freeze({ key: 'follower', label: 'One run', run: EX.follower, tone: 'alarm', state: 'is-flagged', means: `the hint: answers (${EX.follower.answer})` }),
    Object.freeze({ key: 'resister', label: 'Another run', run: EX.resister, tone: 'ok', state: 'is-clean', means: 'any other answer' }),
  ]);
  // The hinted traces by outcome, as the bar shows them.
  const TRACES = (() => {
    const total = v('task.hinted');
    const groups = Object.freeze([
      Object.freeze({ key: 'followed', fact: 'task.followed', tone: 'alarm', says: 'follow' }),
      Object.freeze({ key: 'resisted', fact: 'task.resisted', tone: 'ok', says: 'resist' }),
      Object.freeze({ key: 'unparsed', fact: 'task.unparsed', tone: 'dim', says: `no answer parsed: ${t('p1.unparsed_out')}` }),
    ]);
    if (groups.reduce((sum, group) => sum + v(group.fact), 0) !== total) throw Deck.fail('p1-data: followed, resisted and unparsed traces do not add up to task.hinted');
    const sample = Object.freeze([['alarm', v('task.sample_followed')], ['ok', v('task.sample_resisted')]]);
    if (sample.reduce((sum, [, n]) => sum + n, 0) !== v('task.sample_traces')) throw Deck.fail('p1-data: the sample’s followed and resisted traces do not add up to task.sample_traces');
    return Object.freeze({ total, groups, sample });
  })();
  // Geometry in stage pixels. `band` is where the bar stands in the funnel; it moves to the
  // top at click 3. The grid: a thousand cells for the traces that follow the hint, drawn
  // to scale, a row to the hundred, so that the share beside it (one decimal) is a whole
  // number of cells.
  const DATA = Object.freeze({
    w: 1728, lift: 172, band: 384, barGap: 4, cps: 48, linePause: 250,
    grid: Object.freeze({ n: 1000, cols: 100, cell: 8, gap: 2, lead: 14, seed: 41, rowLag: 20 }),
    unlit: 0.5, beat: 1.03,                        // a cell's size before it lights up; how far the grid swells as the title lands
    states: 3,
  });
  // Click 2, in ms: when the bar splits by outcome, and when the scored sample arrives under it.
  const SPLITS_AT = 4900;
  const SAMPLE_AT = SPLITS_AT + 2000;
  const GRID_W = DATA.grid.cols * DATA.grid.cell + (DATA.grid.cols - 1) * DATA.grid.gap;
  const FOLLOWED_W = ((DATA.w - (TRACES.groups.length - 1) * DATA.barGap) * v('task.followed')) / TRACES.total;
  // How many of the thousand cells light up: the lowest share of any model under the stricter
  // keyword rule, which the slide prints beside the grid. The grid shows that number and no
  // other: a share that is not a whole number of cells would be rounded, and is refused.
  const LIT = (() => {
    const cells = (v('task.restate_rule_b') * DATA.grid.n) / 100;
    if (Math.abs(cells - Math.round(cells)) > 1e-6) throw Deck.fail(`p1-data: ${t('task.restate_rule_b')} of ${DATA.grid.n} cells is not a whole number of cells`);
    return Math.round(cells);
  })();
  const share = (value) => `${value.toFixed(1)}%`;
  // What one cell of the grid stands for, as its label says it: the grid is drawn to scale
  // and is not a count of traces (8,919 follow the hint; a label "1,000 traces that follow
  // the hint" read as a number of the data). One cell of a thousand is 0.1%. "These traces"
  // are the ones of the brace over the label, the bar's "8,919 follow", as in the line
  // beside the grid ("of these traces do"); the longer "of the traces that follow" leaves
  // the brace in Verdana.
  const CELL_SHARE = (() => {
    const text = `${100 / DATA.grid.n}%`;
    if (!/^\d+(\.\d)?%$/.test(text)) throw Deck.fail(`p1-data: one cell of ${DATA.grid.n} is not a share the label can print (${text})`);
    return text;
  })();
  // The corpus is named on the slide as the paper names it in running text.
  const CORPUS = Deck.sources.merrill2026.short.replace('&', 'and');
  const PAIRING = (() => {
    const text = t('second.pairing');
    if (!text.includes('honest') || !text.includes('deceptive')) throw Deck.fail('p1-data: second.pairing no longer names an honest and a deceptive trace');
    return text.replace('honest', '<span class="c-ok">honest</span>').replace('deceptive', '<span class="c-alarm">deceptive</span>');
  })();

  // What the second task can and cannot say, in plain words: the paper's "limited check"
  // ('second.limited') whose test "has almost no power to confirm or refute transfer" ('second.power').
  const LIMITED = (() => {
    if (!/limited check/.test(t('second.limited')) || !/confirm or refute transfer/.test(t('second.power'))) {
      throw Deck.fail('p1-data: second.limited or second.power no longer says what the second task’s last line rewords');
    }
    return '<b>A limited check:</b> it can hardly confirm or refute that the results carry over.';
  })();

  const runHtml = ({ key, label, run, tone, means }) => `
          <div class="p1-data__trace" data-run="${key}" style="--p1-chars:${Math.max(...run.lines.map((line) => line.length))}">
            <div class="p1-data__stack">${kit.term({ label, lines: run.lines.map((_, i) => `${key}-${i}`) })}</div>
            <p class="p1-data__outcome" data-tone="${tone}">${kit.flag({ key, text: run.outcome })}<span class="p1-data__means">${means}</span></p>
          </div>`;
  const number = (key) => `<b class="p1-data__n" data-count="${key}" style="min-width:${t(`task.${key}`).length}ch"></b>`;
  const splitHtml = (group, i) => {
    const before = TRACES.groups.slice(0, i).reduce((sum, g) => sum + v(g.fact), 0);
    const where = i === TRACES.groups.length - 1 ? 'right:0' : `left:${((before / TRACES.total) * 100).toFixed(2)}%`;
    return `<span data-split="${group.key}" data-tone="${group.tone}" style="${where}"><b style="min-width:${t(group.fact).length}ch"></b> ${group.says}</span>`;
  };
  const dataHtml = () => `
    <div class="p1-data">
      <div class="p1-data__example">
        <div class="p1-data__lift">
          <div class="p1-data__prompt">
            <span class="p1-data__tab">Prompt</span>
            <p class="p1-data__hint"><span data-hint="before"></span><b data-hint="target"></b><span data-hint="after"></span></p>
            <div class="p1-data__asks">
              <span class="p1-data__question">${EX.question}</span>
              <span class="p1-data__options">${EX.options.map(([letter, name]) => `<span data-option="${letter}"><b>(${letter})</b> ${name}${letter === EX.target ? '<i class="p1-data__ring"></i>' : ''}</span>`).join('')}</span>
            </div>
          </div>
          <p class="p1-data__def"><b>The hint:</b> one wrong option, named in the prompt.</p>
        </div>
        <p class="p1-data__runs">One prompt, many runs: ${t('p1.sampled')}, so traces differ.</p>
        <div class="p1-data__traces">${RUNS.map(runHtml).join('')}
        </div>
        <p class="p1-data__why"><b>Why this task:</b> ${t('p1.outcome')}, so every prediction can be scored.</p>
      </div>
      <div class="p1-data__funnel">
        <div class="p1-data__pool">
          <div class="p1-data__tile">${number('questions')}<p>${t('p1.benchmark_kind')}, from <span class="p1-data__bench">${t('task.benchmark')}</span></p></div>
          <span class="p1-data__times">×</span>
          <div class="p1-data__tile">${number('models')}<p>open reasoning models</p></div>
        </div>
        <svg class="p1-data__down" viewBox="0 0 24 40" width="24" height="40"><path d="M12 2v34M3 26l9 10 9-10"/></svg>
        <div class="p1-data__kept">${number('pairs')}<p>model-question pairs where the hint moves the answer, ${t('p1.influence_vs')}</p></div>
        <div class="p1-data__each"><span class="p1-data__times">×</span>${number('hinted_each')}<p>hinted runs per pair:</p>${number('hinted')}</div>
        <div class="p1-data__band">
          <div class="p1-data__bar">${TRACES.groups.map((group) => `<i data-seg="${group.key}" data-tone="${group.tone}" style="flex-grow:${v(group.fact)}"></i>`).join('')}</div>
          <div class="p1-data__split">${TRACES.groups.map(splitHtml).join('')}</div>
        </div>
        <div class="p1-data__sample">
          <span class="p1-data__sub" style="width:${((DATA.w * v('task.sample_traces')) / TRACES.total).toFixed(1)}px">${TRACES.sample.map(([tone, n]) => `<i data-tone="${tone}" style="flex-grow:${n}"></i>`).join('')}</span>
          <p>The scored sample: ${t('task.resampled_models')} of ${t('task.models')} models (${t('p1.sample_models')}) × <b>${t('task.sample_questions')} questions</b><br>× up to <span class="c-alarm">${t('p1.sample_draw')} follow</span> + <span class="c-ok">${t('p1.sample_draw')} resist</span>: ${t('task.sample_traces')} traces</p>
        </div>
      </div>
      <div class="p1-data__wow">
        <i class="p1-data__of" style="width:${FOLLOWED_W.toFixed(1)}px"></i>
        <div class="p1-data__head" style="width:${FOLLOWED_W.toFixed(1)}px">
          <p class="p1-data__q">Does the reasoning restate the hint?</p>
          <p class="p1-data__unit">each dot: ${CELL_SHARE} of these traces</p>
        </div>
        <div class="p1-data__grid" style="--cell:${DATA.grid.cell}px;--gap:${DATA.grid.gap}px;--p1-unlit:${DATA.unlit};left:${((FOLLOWED_W - GRID_W) / 2).toFixed(1)}px">${kit.grid({ key: 'restate', n: DATA.grid.n, cols: DATA.grid.cols, tone: 'read' })}${kit.lens({ key: 'restate' })}</div>
        <div class="p1-data__says" style="left:${Math.ceil(FOLLOWED_W) + 40}px">
          <p class="p1-data__lead">In every model, at least</p>
          <p class="p1-data__share"></p>
          <p class="p1-data__tail">of these traces do.</p>
        </div>
        <div class="p1-data__limit">${kit.says({ limit: ['<b>So the cue is on the page.</b> This task is close to predicting an answer under an open hint: it says nothing about <em>hidden</em> ones.'] }, { tone: 'hidden' })}</div>
      </div>
      <div class="p1-data__second">
        <div class="p1-data__states">${util.range(DATA.states).map(() => '<span class="p1-data__state"><i data-tone="ok"></i><i data-tone="alarm"></i></span>').join('')}</div>
        <div class="p1-data__second-says">
          <p><b>Second task:</b> a published deception corpus (${CORPUS}).</p>
          <p>${t('second.states')} ${t('p1.second_state')}, each with ${PAIRING} trace.</p>
          <p>${LIMITED}</p>
        </div>
      </div>
    </div>`;

  Deck.register({
    id: 'p1-data',
    part: PART,
    kicker: kicker(PART, 'Dataset'),
    title: `${t('task.hinted')} reasoning traces follow or resist a wrong hint, <em>and nearly all restate it</em>`,
    // One cue: it stays to the last step, where the counts have folded away, and says which
    // traces every later score is computed on ('p1.sample_scored'). Its count does not break
    // from its unit (a no-break space): the funnel has another 20, of runs per pair.
    cues: [
      { text: `Monitors are ${t('p1.sample_scored')}: ${t('task.sample_questions')}\u00a0questions per model`, step: 2, at: SAMPLE_AT },
    ],
    cite: [{ src: 'paper', where: 'Sec. 1, 3, 8' }, { src: 'young2026lie', where: 'hint (quoted)' }, { src: 'gema2024', where: '' }, { src: 'merrill2026', named: true }],
    figure: 'illustrative',
    numbers: 'reported',
    html: dataHtml(),
    setup: (ctx) => {
      const typeMs = (text) => Math.round((text.length / DATA.cps) * 1000);
      // The second half of the title is held back until the count of click 3 has landed.
      const held = ctx.q('.dk-title em');
      held.classList.add('p1-data__held');

      // Entrance: the earlier talk's question card; this task's hint is typed in front of it.
      const enter = ctx.step({ label: 'the task: a question and a wrong hint' });
      enter.show('.p1-data__prompt', { at: 300 });
      const typing = 1300;
      enter.cls('.p1-data__hint', 'p1-is-hinted', { at: typing - 100 });
      enter.type('[data-hint="before"]', HINT_PARTS.before, { at: typing, cps: DATA.cps });
      const named = typing + typeMs(HINT_PARTS.before);
      enter.type('[data-hint="target"]', HINT_PARTS.target, { at: named, cps: DATA.cps });
      enter.type('[data-hint="after"]', HINT_PARTS.after, { at: named + typeMs(HINT_PARTS.target), cps: DATA.cps });
      const typed = named + typeMs(HINT_PARTS.target) + typeMs(HINT_PARTS.after);
      enter.cls(`[data-option="${EX.target}"]`, 'p1-is-hinted', { at: typed + 200 });
      enter.tween('.p1-data__ring', { opacity: [0, 1], scale: [1.5, 1] }, { at: typed + 200, dur: DUR.enter, ease: 'back' });
      enter.show('.p1-data__def', { at: typed + 800 });
      enter.hold(DUR.micro);

      // Click 1: the same prompt, run twice. Both traces are typed at once, paragraph by
      // paragraph: they begin alike, on the hint, and end apart.
      const runs = ctx.step({ label: 'one prompt, many traces: some follow, some resist' });
      runs.tween('.p1-data__lift', { y: [DATA.lift, 0] }, { dur: DUR.move, ease: 'inOut' });
      runs.show('.p1-data__runs', { at: 600 });
      runs.show('.p1-data__stack', { at: 1100, stagger: 150 });
      const paragraphAt = util.range(PARAGRAPHS).reduce((ats, i) => [
        ...ats, ats[i] + Math.max(...RUNS.map(({ run }) => typeMs(run.lines[i]))) + DATA.linePause,
      ], [1800]);
      util.range(PARAGRAPHS).forEach((i) => RUNS.forEach(({ key, run }) => {
        runs.type(`[data-line="${key}-${i}"]`, run.lines[i], { at: paragraphAt[i], cps: DATA.cps });
      }));
      RUNS.forEach(({ key, state }, n) => {
        const lands = paragraphAt[PARAGRAPHS] + n * 600;
        kit.stamp(runs, ctx.q(`[data-flag="${key}"]`), state, lands);
        runs.show(`[data-run="${key}"] .p1-data__means`, { at: lands + 150, rise: 0 });
      });
      runs.show('.p1-data__why', { at: paragraphAt[PARAGRAPHS] + RUNS.length * 600 + 300 });
      runs.hold(DUR.micro);

      // Click 2: the example folds away and the counts build from top to bottom.
      const numbers = ctx.step({ label: 'the numbers' });
      numbers.tween('.p1-data__example', { opacity: [1, 0] }, { dur: 300 });
      numbers.show('.p1-data__pool', { at: 400 });
      kit.countTo(numbers, '[data-count="questions"]', 'task.questions', { at: 500 });
      kit.countTo(numbers, '[data-count="models"]', 'task.models', { at: 900 });
      numbers.tween('.p1-data__down', { opacity: [0, 1] }, { at: 1900 });
      numbers.show('.p1-data__kept', { at: 2000 });
      kit.countTo(numbers, '[data-count="pairs"]', 'task.pairs', { at: 2100 });
      numbers.show('.p1-data__each', { at: 3200 });
      kit.countTo(numbers, '[data-count="hinted_each"]', 'task.hinted_each', { at: 3300, dur: DUR.enter });
      kit.countTo(numbers, '[data-count="hinted"]', 'task.hinted', { at: 3700 });
      numbers.tween('.p1-data__bar', { '--p1-grow': ['0%', '100%'] }, { at: 3700, dur: DUR.move, ease: 'inOut' });
      const splits = SPLITS_AT;
      numbers.tween('.p1-data__bar', { '--p1-tint': ['0%', '100%'], '--p1-gap': ['0px', `${DATA.barGap}px`] }, { at: splits, dur: DUR.enter });
      TRACES.groups.forEach((group, n) => {
        numbers.show(`[data-split="${group.key}"]`, { at: splits + n * 350, rise: 0 });
        kit.countTo(numbers, `[data-split="${group.key}"] b`, group.fact, { at: splits + n * 350 });
      });
      numbers.show('.p1-data__sample', { at: SAMPLE_AT });
      numbers.hold(DUR.micro);

      // Click 3, wow 1: the counts above the bar fold away, the bar moves to the top, and a
      // grid of a thousand cells, each 0.1% of the traces that follow the hint, is drawn out
      // of its red part. The lens
      // sweeps the grid; a cell whose reasoning restates the hint grows and lights up (its
      // size is the class's, in parts/part1.css: a thousand cells get one track each, not four).
      const wow = ctx.step({ label: 'wow 1: nearly every trace restates the hint' });
      wow.tween('.p1-data__pool, .p1-data__down, .p1-data__kept, .p1-data__each, .p1-data__sample', { opacity: [1, 0] }, { dur: 300 });
      wow.tween('.p1-data__band', { y: [0, -DATA.band] }, { at: 200, dur: DUR.move, ease: 'inOut' });
      wow.tween('.p1-data__of', { opacity: [0, 1] }, { at: 1100 });
      wow.tween('.p1-data__unit, .p1-data__grid', { opacity: [0, 1] }, { at: 1300 });
      wow.show('.p1-data__q', { at: 1900 });
      const sweepAt = 2900;
      const sweepMs = 2600;
      const travel = GRID_W + 2 * DATA.grid.lead;
      const lens = ctx.q('.p1-data__grid .dk-lens');
      wow.show('.p1-data__lead', { at: sweepAt - 400, rise: 0 });
      wow.tween('.p1-data__share', { opacity: [0, 1] }, { at: sweepAt - 200, dur: DUR.micro });
      kit.countTo(wow, '.p1-data__share', 'task.restate_rule_b', { at: sweepAt, dur: sweepMs, ease: 'linear', format: share });
      wow.tween(lens, { opacity: [0, 1] }, { at: sweepAt - DUR.micro, dur: DUR.micro });
      wow.tween(lens, { x: [0, travel] }, { at: sweepAt, dur: sweepMs, ease: 'linear' });
      wow.tween(lens, { opacity: [1, 0] }, { at: sweepAt + sweepMs, dur: DUR.enter });
      const revealed = sweepAt + sweepMs + 300;
      const dark = new Set(util.shuffled(util.range(DATA.grid.n), DATA.grid.seed).slice(0, DATA.grid.n - LIT));
      ctx.qa('[data-grid="restate"] [data-cell]').forEach((cell, i) => {
        if (dark.has(i)) return;
        const col = i % DATA.grid.cols;
        const row = Math.floor(i / DATA.grid.cols);
        const passed = sweepAt + ((col * (DATA.grid.cell + DATA.grid.gap) + DATA.grid.cell / 2 + DATA.grid.lead) / travel) * sweepMs + row * DATA.grid.rowLag;
        wow.cls(cell, 'is-on', { at: passed });
      });
      // The grid beats once as the title gets its second half.
      wow.tween('[data-grid="restate"]', { scale: [1, DATA.beat] }, { at: revealed, dur: DUR.micro });
      wow.tween('[data-grid="restate"]', { scale: [DATA.beat, 1] }, { at: revealed + DUR.micro, dur: DUR.enter });
      wow.show('.p1-data__tail', { at: sweepAt + sweepMs, rise: 0 });
      wow.tween(held, { opacity: [0, 1] }, { at: revealed, dur: DUR.move });
      wow.tween(held, { '--p1-glow': [1, 0] }, { at: revealed + DUR.enter, dur: DUR.reveal });
      wow.show('.p1-data__limit', { at: revealed + 1500 });
      wow.hold(DUR.enter);

      // Click 4: what is left of the funnel dims, and the second task arrives in one card.
      const second = ctx.step({ label: 'the second task' });
      second.tween('.p1-data__band', { opacity: [1, 0.6] }, { dur: DUR.enter });
      second.show('.p1-data__second', { at: 300 });
      second.tween('.p1-data__state', { opacity: [0, 1], x: [-16, 0] }, { at: 600, stagger: 150 });
      second.show('.p1-data__second-says p', { at: 800, stagger: 600, rise: 0 });
      second.hold(DUR.micro);
    },
  });
})();
