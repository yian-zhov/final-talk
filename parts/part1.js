// Part 1: The problem and the data. Slides 1-5 (Introduction, Motivation, Dataset).
// SPEC.md section 3 describes each slide; parts/sample.js shows the registration API.
// All five slides are built. Slide 3 was rebuilt on 2026-11-19 for the paper's v2 draft (the
// ceiling and the three questions; SPEC.md section 7.13), and slide 5's last click with it.
// One word for one thing: a "prefix monitor" is the kind of tool (the title, slides 1 and 2);
// the nine things we score are "readers", defined on slide 3 and again on slide 6.
(() => {
  'use strict';

  const DUR = Deck.timeline.DUR;
  const PART = 1;
  const { example: EX, choices: CHOICES, kicker, kept: KEPT } = Deck.motifs;
  const { kit, util } = Deck;
  const t = (key) => Deck.fact(key).text;
  const v = (key) => Deck.fact(key).value;

  // The facts that only this part prints: plain words for what the paper says in its own
  // terms, each with the page and the sentence of the v2 draft it stands on
  // (sources/paper-v2-draft.pdf; the form of `file` is that of shared/facts.js, and
  // tools/selftest.mjs looks every quotation up on its page).
  const PDF = 'sources/paper-v2-draft.pdf';
  const at = (page, quote) => `p.${page}: "${quote}"`;
  const paper = (where, cites, text) => ({ text, src: 'paper', where, file: `${PDF}, ${[].concat(cites).join('; ')}` });
  Deck.addFacts({
    'p1.cot_gloss': paper('Sec. 1', at(1, 'Monitoring the chain of thought (CoT) of reasoning models is proposed for safety because the text written before an answer may show how it came about'),
      'the reasoning a model writes before it answers'),
    'p1.sampled': paper('Sec. 2.1', at(3, 'T = 0.6, top-p 0.95'),
      'sampling is random'),
    'p1.benchmark_kind': paper('Sec. 2.1', [at(3, 'A four-option question'), at(3, '300 subject-stratified MMLU-Redux 2.0 items')],
      'multiple-choice questions'),
    // What "exploratory" says of an analysis (the paper's tier X), for the legend at the
    // entrance of slide 2.
    'p1.exploratory': paper('Sec. 2.4; Sec. 10', [at(4, 'X, exploratory'), at(4, 'followed every main-task result and are exploratory'), at(15, 'most analyses were specified after the results had been read')],
      'defined after the results were read'),
    // The two other tags that stand beside a result (slide 11), for the same legend: the
    // paper's tiers F and RS, and what "pre-specified" means in it.
    'p1.standing_fixed': paper('Sec. 2.4', at(4, 'F, fixed before any monitoring sample was read'),
      'before any sample was read'),
    'p1.standing_prespecified': paper('Sec. 2.4', [at(4, 'registered on data already read'), at(4, 'written to version-controlled files before the analysis they govern')],
      'written before its analysis'),
    // Slide 3 defines a reader, the word for each of the nine things we score, in the words
    // of slide 6's title; how its AUROC is computed is left to Part 2.
    'p1.reader_gloss': paper('Sec. 1', at(2, 'A reader maps a prefix to a continuous score or a binary verdict.'),
      'anything that turns a prefix into a score'),
    // What resampling is, in the words slides 5 and 8 use for it.
    'p1.resampling_gloss': paper('Sec. 1', at(2, 'A continuation is a fresh sample of the model’s reasoning from a prefix to its end, and K is the number drawn per prefix.'),
      'the model finishes each prefix again'),
    // Slide 4, which model-question pairs are kept: against the same question without the
    // hint, the hint has to raise the share of the answer it names by a third of the traces.
    'p1.influence': paper('Sec. 2.1', at(3, 'hinted share of X at least 0.33 above the unhinted share, which is at most 0.25'),
      'adding the hint makes the hinted answer much more likely'),
    // What the traces without the hint are: the share the hint's effect is measured against.
    'p1.baseline': paper('Sec. 2.1', at(3, 'hinted share of X at least 0.33 above the unhinted share'),
      'baseline'),
    // Slide 5, what we ran. The traces without the hint, and all traces: the paper prints
    // the two counts and no total, so the total is our sum of them (the slide refuses to
    // draw if the three numbers disagree).
    'p1.unhinted': {
      ...paper('Sec. 2.1', [at(3, '(20 hinted and 8 unhinted traces each)'), at(3, 'as do 149 of the 5,720 unhinted traces')],
        '5,720'),
      value: 5720,
    },
    'p1.traces_all': {
      ...paper('Sec. 2.1 (our sum of its two counts; the paper prints no total)', [at(3, 'Of the 14,300 hinted traces'), at(3, 'the 5,720 unhinted traces')],
        '20,020'),
      value: 20020,
    },
    // What a continuation is, in the words of the row that counts them; slide 8 explains it
    // with its picture.
    'p1.continued': paper('Sec. 1; Sec. 2.1', [at(2, 'A continuation is a fresh sample of the model’s reasoning from a prefix to its end, and K is the number drawn per prefix.'), at(3, 'each of the 1,226 drawn hinted traces was resampled again with K = 16 continuations')],
      'finished again'),
    // The two frontier models among the readers, each by its full name with its version.
    'p1.frontier_models': paper('Sec. 2.2', at(3, '(6–9) Claude Opus 5.5 and GPT-6 Astra'),
      'Claude Opus 5.5 and GPT-6 Astra'),
    // What the counts are for, in the paper's own verb.
    'p1.measured': paper('Sec. 1', at(2, 'We measure what these choices do on one task, with a second as a limited check'),
      'measure what each scoring choice does'),
    // Slide 5, what each count lets us measure: the endings a monitor predicts, how far a
    // prefix fixes them (what resampling estimates), and how well a reader ranks them.
    'p1.predicts': paper('Sec. 1', at(1, 'it reads an unfinished trace, a prefix, and predicts where the trace will end'),
      'the endings to predict'),
    'p1.fixes': paper('Sec. 1', at(1, 'estimate by resampling how far a prefix fixes the outcome'),
      'how far a prefix fixes the ending'),
    'p1.ranks': paper('Table 1', at(4, 'Share of (positive, negative) pairs from the same cluster in which the positive scores higher'),
      'how well each reader predicts it'),
    // Slide 3, what a ceiling is, in the paper's words (slide 8 says it in the same ones), and
    // how recent work gets one.
    'p1.ceiling_gloss': paper('Sec. 4', [at(6, 'compare it with the best AUROC any reader of the prefix could reach. Resampling estimates it'), at(1, 'sample continuations from that prefix')],
      'the best AUROC any reader of the prefix could reach'),
    // Slide 3, whose K is which: recent work draws four continuations per prefix (Jia et
    // al.); ours are the K of the paper's curve, 2 to 16 ('k.curve').
    'p1.recent_k': {
      ...paper('Sec. 1, What was known (of Jia et al. 2026)', at(2, 'they estimate it from four continuations'), '4'),
      value: 4,
    },
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
  // The slide's footer carries the first tag of the talk, a slide ahead of the legend of the
  // tags (slide 2), so the footer says here what this one means, in that legend's words
  // (the tag's short form, core/deck.js).
  const TITLE_FIGURE = 'illustrative';
  const TITLE_TAG = Deck.figureTags.find((tag) => tag.field === 'figure' && tag.value === TITLE_FIGURE);
  if (!TITLE_TAG) throw Deck.fail(`p1-title: no footer tag for the figure kind "${TITLE_FIGURE}"`);

  Deck.register({
    id: 'p1-title',
    part: PART,
    layout: 'bare',
    title: Deck.meta.title,
    cite: [],
    figure: TITLE_FIGURE,
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
      ctx.el.querySelector('.dk-foot').insertAdjacentHTML('beforeend', `<span class="dk-tags__means">${TITLE_TAG.short}</span>`);
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
  // The tags of the talk that no footer carries: Part 3 sets them beside a result (slides 10
  // to 12) to say how its analysis stands (motifs.standings, from the firmest down). The
  // legend of the entrance shows each as those slides do, a chip, with the paper's meaning
  // in a few words; the slide's setup refuses a tag that no slide shows as a chip.
  const STANDINGS = Object.freeze(Deck.motifs.standings.map(({ tag, means }) => Object.freeze({ tag, means: t(means) })));
  if (!STANDINGS.some(({ tag }) => t('scope.exploratory').includes(tag))) throw Deck.fail('p1-prefix: no tag of the legend is a word of scope.exploratory');
  // The two ends of a score, as the slide's last line says them: a score is a probability,
  // and slides 6 and 7 print one as a percentage. Not measured numbers.
  const SCORE_ENDS = Object.freeze({ lo: '0%', hi: '100%' });
  // What the score is the chance of: the ending this talk scores (the paper's Sec. 1: a trace
  // follows the hint if it ends at the wrong answer the hint names). The hint itself arrives
  // on slide 4.
  const SCORE_OF = 'Its score: the chance the model follows a wrong hint.';
  // What lies beyond the cut, before and after the monitor has given its score: the second
  // sentence takes the place of the first when the bars beyond the cut fill.
  const REST = Object.freeze({ open: 'The rest is not written yet.', written: 'The rest is written after the score.' });
  const PRE = Object.freeze({
    todayY: 296,                                   // where the line for today stands under the bridge
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
  // lens has crossed the whole trace. The slide's cue waits for it.
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
        <p class="p1-pre__from">Our special topic talk recommended:</p>
        <p class="p1-pre__rec">“<span class="p1-pre__track">${REC.track}</span>${REC.rest}.”</p>
      </div>
      <p class="p1-pre__gloss"><b>Monitorability:</b> ${MONITORABILITY}</p>
      <p class="p1-pre__today"><b>Today:</b> how a monitor gets its <em>score</em>, and what that score shows.</p>
      <div class="p1-pre__tags">
        <p class="p1-pre__tags-head">Tags</p>
        <ul class="dk-tags__list"></ul>
        <div class="p1-pre__marks">${STANDINGS.map(({ tag, means }) => `
          <p class="p1-pre__mark"><span class="dk-chip">${tag}</span><span class="dk-tags__means">${means}</span></p>`).join('')}
        </div>
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
        <p class="p1-pre__rest" ${place(CUT_X + PRE.bar.cutGap / 2)}>${REST.open}</p>
        <p class="p1-pre__monitor" ${place(0, CUT_X - PRE.bar.cutGap / 2)}><b>Prefix monitor:</b> reads the prefix and predicts the ending.</p>
        <div class="p1-pre__score" ${place(CUT_X + PRE.bar.cutGap / 2)}><span>${SCORE_ENDS.lo}</span>${kit.meter({ key: 'pre-score', label: '', tone: 'read' })}<span>${SCORE_ENDS.hi}</span></div>
        <p class="p1-pre__between" ${place(CUT_X + PRE.bar.cutGap / 2)}>${SCORE_OF}</p>
      </div>
    </div>`;

  Deck.register({
    id: 'p1-prefix',
    part: PART,
    kicker: kicker(PART, 'Introduction'),
    title: 'To act in time, a monitor reads only the start of the reasoning: <em>a prefix</em>',
    cues: [
      // Which ending the monitor predicts is said under its score, at the last click (SCORE_OF).
      { text: 'A verdict after the answer comes too late', step: 1, at: PRE_AT.judged },
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
      // because the slides of the other parts register after this file. Under them, in rows
      // of their own and outside that list, the tags that stand beside a result.
      ctx.q('.p1-pre__tags .dk-tags__list').innerHTML = Deck.tagLegend(Deck.slides, 'short');
      STANDINGS.forEach(({ tag }) => {
        const asChip = new RegExp(`class="dk-chip[^"]*">${tag}<`);
        if (!Deck.slides.some((slide) => slide.part !== PART && asChip.test(slide.html))) {
          throw Deck.fail(`p1-prefix: the legend explains "${tag}", and no slide of another part shows a chip with those words`);
        }
      });

      // Entrance: the earlier talk's third recommendation, its definition, and today's turn.
      const enter = ctx.step({ label: 'the bridge from the special topic talk' });
      enter.tween('.p1-pre__bridge', { opacity: [0, 1] }, { at: 200 });
      enter.show('.p1-pre__from', { at: 300, rise: 0 });
      enter.show('.p1-pre__rec', { at: 700, dur: DUR.move });
      enter.type('.p1-pre__rest', REST.open, { dur: 0 });
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
      ahead.type('.p1-pre__rest', REST.written, { at: later, dur: 0 });
      ahead.tween('.p1-pre__rest', { scale: [1, 1.06] }, { at: later, dur: DUR.micro });
      ahead.tween('.p1-pre__rest', { scale: [1.06, 1] }, { at: later + DUR.micro, dur: DUR.enter });
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
  // Six scores on one axis and a magnified stretch of it; then the ceiling that recent work
  // holds such scores against; then the three questions of the talk; then what the project
  // is and what it is not.
  // The six dots are the six readers that Part 3 keeps, at their within-question scores
  // (Table 4); they are not named here, and the first line says that they are six of nine.
  // On the whole scale six dots on one spot cannot be counted, so a strip under it shows
  // that stretch enlarged, with a scale of its own (a line every 0.01, two of them
  // numbered). At click 1 the strip closes: an outline as long as the six scores' range
  // stays on the scale with the range beside it, and the ceiling lands a little to its
  // right. The ceiling is the paper's resampling AUROC on these traces, against the label
  // the six scores are against, from 2 continuations per prefix ('k.u2'); the slide says
  // what resampling is and what a ceiling is in plain words ('p1.resampling_gloss',
  // 'p1.ceiling_gloss'; a continuation is Part 2's word), and whose K is which: recent work
  // draws 4 continuations ('p1.recent_k'), we draw up to 16 ('task.sample_k'), and the mark
  // on the scale is our value at K = 2, which its label says and result 1 takes up (the
  // value from 16 is not shown here: that it moves is result 1).
  // The six are the monitors among the nine readers (slide 6: the readers that are not
  // forced answers, which is how 'motifs.kept' is made and what tools/selftest.mjs checks of
  // it), so the scale and the question call them monitors, as the title does;
  // the title's "prefix monitors" is slide 2's word for the tool in general, and the
  // definition of the ceiling keeps the paper's "any reader".
  // Click 2 asks the three questions, numbered as Part 3 answers them, under two heads that
  // count as the title does: the ceiling raises two, and the third is ours (what they mean
  // for comparing readers). No mark turns or moves for them. Click 3 is the scope line in
  // its frame.
  // The first line says what a reader is, where the word first stands ('p1.reader_gloss';
  // slide 6 takes it up), and names an AUROC ahead of Part 2, which explains it: here the
  // two ends of the scale say what the number means.
  // The ends of the score's scale and what each means, as the axis says them. Not measured numbers.
  const SCALE = Object.freeze({ lo: 0.5, hi: 1, loSays: 'guessing', hiSays: 'perfect' });
  const STK = (() => {
    const readers = KEPT.map((key) => Object.freeze({ key, within: v(`reader.${key}.within`) }));
    const lo = Math.min(...readers.map((reader) => reader.within));
    const hi = Math.max(...readers.map((reader) => reader.within));
    if (readers.length !== v('readers.kept') || lo !== v('readers.within_min') || hi !== v('readers.within_max_kept')) {
      throw Deck.fail('p1-stakes: the readers that are kept do not span readers.within_min to readers.within_max_kept');
    }
    const aside = v('readers.count') - readers.length;
    if (Deck.motifs.readers.length !== v('readers.count') || aside <= 0) throw Deck.fail('p1-stakes: readers.count is not the number of readers, or none is set aside');
    // The ceiling of the slide lies above every one of the six scores, or the picture's
    // "close under it" would be false.
    const ceiling = v('k.u2');
    if (!(ceiling > hi) || ceiling !== v('k.curve')[0][1]) throw Deck.fail('p1-stakes: the ceiling is no longer the resampling AUROC from 2 continuations, above the six readers');
    // Whose K is which: the mark is our value at the smallest K of our curve, the curve
    // ends at the K we drew, and recent work's K lies between the two.
    const ks = v('k.curve').map(([k]) => k);
    const most = ks[ks.length - 1];
    if (ks[0] !== 2 || most !== v('task.sample_k') || !(v('p1.recent_k') > ks[0] && v('p1.recent_k') < most) || !/from four continuations/.test(Deck.fact('p1.recent_k').file)) {
      throw Deck.fail('p1-stakes: the K of the ceiling’s mark, of recent work and of our data are no longer 2, 4 and up to 16');
    }
    // The stretch of the axis that the magnifier shows: the six scores, with a margin.
    const margin = 0.01;
    const zoom = Object.freeze({ lo: lo - margin, hi: hi + margin });
    // The strip's own scale: a line at every hundredth inside it, the first and the last numbered.
    const hundredths = util.range(Math.floor(zoom.hi * 100 + 1e-9) - Math.ceil(zoom.lo * 100 - 1e-9) + 1).map((n) => (Math.ceil(zoom.lo * 100 - 1e-9) + n) / 100);
    if (hundredths.length < 2) throw Deck.fail('p1-stakes: the magnified stretch holds fewer than two hundredths to number');
    return Object.freeze({
      readers, lo, hi, zoom, ceiling, samples: ks[0], most, range: `${t('readers.within_min')} to ${t('readers.within_max_kept')}`,
      ticks: Object.freeze(hundredths.map((value, i) => Object.freeze({ value, label: i === 0 || i === hundredths.length - 1 ? value.toFixed(2) : '' }))),
      // Who the six are, in the first line's words: six of the nine (slide 12 says which three are set aside, and why).
      // The nine are readers, and not every one of them is a monitor (slide 6): the line opens on what a reader is.
      who: `${capital(inWords(readers.length))} of our ${inWords(v('readers.count'))}`,
    });
  })();
  // Geometry in stage pixels. AXIS: the whole scale. ZOOM: the magnified stretch (`line` is
  // the height of its rail, `row` the step between rows of dots that would overlap).
  const AXIS = Object.freeze({ x: 120, w: 1488, y: 36, ticks: 6 });
  const ZOOM = Object.freeze({ w: 1728, pad: 96, line: 132, dot: 28, row: 30, grid: Object.freeze({ top: 84, bottom: 180 }) });
  const FAN = Object.freeze({ h: 44 });
  const SETTINGS_LIFT = 224;                       // how far the panel moves up at the last click
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
  // The panel's two groups, counted as the title counts them: the two questions that the
  // ceiling raises, and the one we add, what they mean for comparing readers.
  const RAISED = 2;
  const GROUPS = Object.freeze([
    Object.freeze({ key: 'raised', span: RAISED, text: `${capital(inWords(RAISED))} questions` }),
    Object.freeze({ key: 'then', span: CHOICES.length - RAISED, text: 'Our third' }),
  ]);
  const groupOf = (i) => (i < RAISED ? GROUPS[0] : GROUPS[1]).key;
  // The words of the three questions ('motifs.choices'). The two that the ceiling raises are
  // about any monitor; ours is about the nine things we score, so it says "readers", as the
  // head of slide 12 asks it.
  const ASKS = Object.freeze(CHOICES.map((choice, i) => (i < RAISED ? choice.ask : choice.ask.replace(/\bmonitors\b/, 'readers'))));
  if (ASKS.slice(RAISED).some((ask) => !/\breaders\b/.test(ask))) throw Deck.fail('p1-stakes: the question we add no longer asks about readers');
  // One of the three questions: its number in a ring, then its words.
  const choiceHtml = (_, i) => `
          <div class="p1-stk__choice" data-choice="${i}" data-group="${groupOf(i)}">
            <div class="p1-stk__knob"><span class="p1-stk__num">${i + 1}</span></div>
            <p class="p1-stk__name">${ASKS[i]}</p>
          </div>`;
  const dotsHtml = (cls, place) => STK.readers.map((reader) => {
    const { x, y } = place(reader);
    return `<i class="${cls}" data-reader="${reader.key}" style="left:${x.toFixed(1)}px;top:${y}px"></i>`;
  }).join('');
  const axisPlace = (reader) => ({ x: onAxis(reader.within), y: AXIS.y });
  const zoomPlace = (reader) => ({ x: onZoom(reader.within), y: ZOOM.line + ZOOM_ROWS[reader.key] * ZOOM.row });
  // The questions are the paper's two and what they mean for comparing monitors; the words
  // of the questions and of the ceiling's gloss rest on these facts.
  if (!/ceiling a ceiling\?$/.test(t('motive.ask_ceiling')) || !/alarm in time\?$/.test(t('motive.ask_time')) || !/comparing monitors$/.test(t('motive.ask_compare')) || !/ceiling built by resampling/.test(t('motive.ceiling'))) {
    throw Deck.fail('p1-stakes: the facts of the two questions and of the ceiling no longer say what the slide asks');
  }
  if (CHOICES.length !== 3) throw Deck.fail('p1-stakes: the panel has room for three questions');
  const stakesHtml = () => `
    <div class="p1-stk">
      <p class="p1-stk__lead"><b>Reader:</b> ${t('p1.reader_gloss')}. ${STK.who}, one AUROC each (see Part 2).</p>
      <div class="p1-stk__axis">
        <i class="p1-stk__line" style="left:${AXIS.x}px;width:${AXIS.w}px;top:${AXIS.y}px"></i>
        ${util.range(AXIS.ticks).map((n) => `<i class="p1-stk__tick" style="left:${AXIS.x + (n * AXIS.w) / (AXIS.ticks - 1)}px;top:${AXIS.y}px"></i>`).join('')}
        <span class="p1-stk__end" style="left:${AXIS.x}px;top:${AXIS.y}px">${SCALE.lo} = ${SCALE.loSays}</span>
        <span class="p1-stk__end" style="left:${AXIS.x + AXIS.w}px;top:${AXIS.y}px">${SCALE.hi} = ${SCALE.hiSays}</span>
        <i class="p1-stk__window" style="left:${onAxis(STK.zoom.lo).toFixed(1)}px;width:${(onAxis(STK.zoom.hi) - onAxis(STK.zoom.lo)).toFixed(1)}px;top:${AXIS.y}px"></i>
        <i class="p1-stk__stood" style="left:${onAxis(STK.lo).toFixed(1)}px;width:${(onAxis(STK.hi) - onAxis(STK.lo)).toFixed(1)}px;top:${AXIS.y}px"></i>
        ${dotsHtml('p1-stk__dot', axisPlace)}
        <i class="p1-stk__ceiling" style="left:${onAxis(STK.ceiling).toFixed(1)}px;top:${AXIS.y}px"></i>
        <span class="p1-stk__kept" style="right:${(ZOOM.w - onAxis(STK.hi)).toFixed(1)}px;top:${AXIS.y}px">${inWords(STK.readers.length)} monitors: ${STK.range}</span>
        <span class="p1-stk__top" style="left:${(onAxis(STK.ceiling) + 20).toFixed(1)}px;top:${AXIS.y}px">ceiling, K = ${STK.samples}: ${t('k.u2')}</span>
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
        ${dotsHtml('p1-stk__dot p1-stk__dot--zoom', zoomPlace)}
      </div>
      <div class="p1-stk__ceil">
        <p><b>Ceiling:</b> ${t('p1.ceiling_gloss')}.</p>
        <p>Estimated by resampling: ${t('p1.resampling_gloss')}, K times (recent work: ${t('p1.recent_k')}; ours: up to ${STK.most}).</p>
        <p class="p1-stk__ask">Have these monitors nearly reached the ceiling?</p>
      </div>
      <div class="p1-stk__settings">
        <div class="p1-stk__panel">${GROUPS.map((group) => `
          <p class="p1-stk__group" data-group="${group.key}" style="grid-column:span ${group.span}">${group.text}</p>`).join('')}${CHOICES.map(choiceHtml).join('')}
        </div>
      </div>
      <div class="p1-stk__aim">
        ${kit.scope({ size: 3, stacked: true })}
        <p class="p1-stk__limits"><span>The ceiling is recent work’s. We give the conditions for it to hold, not a correction.</span><span>Most of our analyses are exploratory.</span></p>
      </div>
    </div>`;

  Deck.register({
    id: 'p1-stakes',
    part: PART,
    kicker: kicker(PART, 'Motivation'),
    // The title counts the questions as the panel does: two that the ceiling raises, under
    // the head that counts them, and a third that is ours, under a head of its own (GROUPS).
    // The slide needs no cue.
    title: 'Recent work’s ceiling for prefix monitors <em>raises two questions, and we add a third</em>',
    cues: [],
    cite: [{ src: 'paper', where: 'Sec. 1, 4; Table 4' }, { src: 'jia2026', where: 'decision ceiling' }],
    figure: 'schematic',
    numbers: 'reported',
    html: stakesHtml(),
    setup: (ctx) => {
      const knob = (i) => ctx.q(`[data-choice="${i}"] .p1-stk__knob`);
      const dot = (cls, reader) => ctx.q(`.${cls}[data-reader="${reader.key}"]`);
      const middle = onZoom((STK.lo + STK.hi) / 2);

      // Entrance: six dots land almost on one spot; the magnifier opens on them.
      const enter = ctx.step({ label: 'six monitors, six scores' });
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
      enter.hold(DUR.micro);

      // Click 1: the magnifier closes; on the scale the six dots give way to one outline
      // over their range, with the range beside it, and the ceiling drops in a little to
      // its right. Under the scale, what a ceiling is and how recent work gets one, then
      // the reading it invites.
      const top = ctx.step({ label: 'the ceiling' });
      top.tween('.p1-stk__fan, .p1-stk__zoom, .p1-stk__window', { opacity: [1, 0] }, { dur: 300 });
      top.tween('.p1-stk__axis > .p1-stk__dot', { opacity: [1, 0] }, { at: 200, dur: DUR.micro });
      top.tween('.p1-stk__stood', { opacity: [0, 1] }, { at: 200, dur: DUR.micro });
      top.tween('.p1-stk__kept', { opacity: [0, 1] }, { at: 500 });
      top.tween('.p1-stk__ceiling', { opacity: [0, 1], y: [-48, 0] }, { at: 1100, dur: DUR.enter });
      top.tween('.p1-stk__top', { opacity: [0, 1] }, { at: 1400 });
      top.show('.p1-stk__ceil p:not(.p1-stk__ask)', { at: 1700, stagger: 900 });
      top.show('.p1-stk__ask', { at: 4200 });
      top.hold(DUR.micro);

      // Click 2: the three questions, one after the other, in the order and the words of
      // Part 3's results; the ceiling beats once as the first one names it.
      const asks = ctx.step({ label: 'two questions, and the third we add' });
      asks.tween('.p1-stk__ask', { opacity: [1, 0] }, { dur: DUR.micro });
      asks.show('.p1-stk__panel', { at: 300 });
      GROUPS.forEach((group) => asks.show(`.p1-stk__group[data-group="${group.key}"]`, { at: 600 + (group.key === 'raised' ? 0 : RAISED) * 900, rise: 0 }));
      CHOICES.forEach((_, i) => {
        const at = 700 + i * 900;
        asks.cls(knob(i), 'p1-is-named', { at });
        asks.tween(`[data-choice="${i}"] .p1-stk__num`, { opacity: [0, 1], scale: [1.6, 1] }, { at, dur: DUR.enter, ease: 'back' });
        asks.show(`[data-choice="${i}"] .p1-stk__name`, { at: at + 100 });
      });
      asks.tween('.p1-stk__ceiling', { scale: [1, 1.6] }, { at: 800, dur: DUR.micro });
      asks.tween('.p1-stk__ceiling', { scale: [1.6, 1] }, { at: 800 + DUR.micro, dur: DUR.enter });
      asks.hold(DUR.micro);

      // Click 3: what stood under the scale leaves, the panel steps up, and the scope line
      // arrives in its frame. The two marks on the scale stay.
      const aim = ctx.step({ label: 'what the project is, and what it is not' });
      aim.tween('.p1-stk__ceil', { opacity: [1, 0] }, { dur: 300 });
      aim.tween('.p1-stk__settings', { y: [0, -SETTINGS_LIFT] }, { at: 200, dur: DUR.move, ease: 'inOut' });
      aim.tween('.dk-scope', { opacity: [0, 1], scale: [0.96, 1] }, { at: 1500, dur: DUR.move });
      aim.show('.p1-stk__limits span', { at: 2500, stagger: 600, rise: 0 });
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
    // The slide quotes the template's first sentence, the one that names the option, and
    // marks the cut with an ellipsis.
    const rest = hint.slice(at + target.length);
    const stop = rest.indexOf('.') + 1;
    if (stop <= 0 || stop >= rest.length) throw Deck.fail('p1-data: the hint template no longer goes on after the sentence that names its option');
    return Object.freeze({ before: `“${hint.slice(0, at)}`, target, after: `${rest.slice(0, stop)} …”` });
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
      Object.freeze({ key: 'unparsed', fact: 'task.unparsed', tone: 'dim', says: 'no answer parsed' }),
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
    w: 1728, lift: 188, band: 384, barGap: 4, cps: 48, linePause: 250,
    grid: Object.freeze({ n: 1000, cols: 100, cell: 8, gap: 2, lead: 14, seed: 41, rowLag: 20 }),
    unlit: 0.5, beat: 1.03,                        // a cell's size before it lights up; how far the grid swells as the title lands
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
  // What the grid shows and what one cell of it stands for, as its label says it. The share
  // beside the grid is the lowest of any model ("In every model, at least"), so the grid is
  // that model's and not all 8,919 traces pooled: the label names it, "lowest model". The
  // grid is drawn to scale and is not a count of traces: one cell of a thousand is 0.1%.
  // The label is short because a longer one leaves the brace in Verdana.
  const CELL_SHARE = (() => {
    const text = `${100 / DATA.grid.n}%`;
    if (!/^\d+(\.\d)?%$/.test(text)) throw Deck.fail(`p1-data: one cell of ${DATA.grid.n} is not a share the label can print (${text})`);
    return text;
  })();
  // The corpus is named on the slide as the paper names it in running text.
  const CORPUS = Deck.sources.merrill2026.short.replace('&', 'and');

  // What the second task is, in one line that ends on the paper's words for it, "a limited
  // check" ('second.limited'). What the check can and cannot say is the closing slide's
  // (its limits take the words up again).
  const LIMITED = (() => {
    if (!/limited check/.test(t('second.limited'))) throw Deck.fail('p1-data: second.limited no longer calls the second task a limited check');
    return 'as a limited check';
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
        <p class="p1-data__runs">One prompt, many runs: ${t('p1.sampled')}.</p>
        <div class="p1-data__traces">${RUNS.map(runHtml).join('')}
        </div>
      </div>
      <div class="p1-data__funnel">
        <div class="p1-data__pool">
          <div class="p1-data__tile">${number('questions')}<p>${t('p1.benchmark_kind')}, from <span class="p1-data__bench">${t('task.benchmark')}</span></p></div>
          <span class="p1-data__times">×</span>
          <div class="p1-data__tile">${number('models')}<p>open reasoning models</p></div>
        </div>
        <svg class="p1-data__down" viewBox="0 0 24 40" width="24" height="40"><path d="M12 2v34M3 26l9 10 9-10"/></svg>
        <div class="p1-data__kept">${number('pairs')}<p>model-question pairs where ${t('p1.influence')}</p></div>
        <div class="p1-data__each"><span class="p1-data__times">×</span>${number('hinted_each')}<p>hinted runs per pair:</p>${number('hinted')}</div>
        <div class="p1-data__band">
          <div class="p1-data__bar">${TRACES.groups.map((group) => `<i data-seg="${group.key}" data-tone="${group.tone}" style="flex-grow:${v(group.fact)}"></i>`).join('')}</div>
          <div class="p1-data__split">${TRACES.groups.map(splitHtml).join('')}</div>
        </div>
        <div class="p1-data__sample">
          <span class="p1-data__sub" style="width:${((DATA.w * v('task.sample_traces')) / TRACES.total).toFixed(1)}px">${TRACES.sample.map(([tone, n]) => `<i data-tone="${tone}" style="flex-grow:${n}"></i>`).join('')}</span>
          <p>Our readers score a sample of these: <b>${t('task.sample_traces')} traces</b>, from ${t('task.resampled_models')} of the ${t('task.models')} models.</p>
        </div>
      </div>
      <div class="p1-data__wow">
        <i class="p1-data__of" style="width:${FOLLOWED_W.toFixed(1)}px"></i>
        <div class="p1-data__head" style="width:${FOLLOWED_W.toFixed(1)}px">
          <p class="p1-data__q">Does the reasoning restate the hint?</p>
          <p class="p1-data__unit">lowest model · each dot: ${CELL_SHARE}</p>
        </div>
        <div class="p1-data__grid" style="--cell:${DATA.grid.cell}px;--gap:${DATA.grid.gap}px;--p1-unlit:${DATA.unlit};left:${((FOLLOWED_W - GRID_W) / 2).toFixed(1)}px">${kit.grid({ key: 'restate', n: DATA.grid.n, cols: DATA.grid.cols, tone: 'read' })}${kit.lens({ key: 'restate' })}</div>
        <div class="p1-data__says" style="left:${Math.ceil(FOLLOWED_W) + 40}px">
          <p class="p1-data__lead">In every model, at least</p>
          <p class="p1-data__share"></p>
          <p class="p1-data__tail">of these traces do.</p>
        </div>
        <div class="p1-data__limit">${kit.says({ limit: ['<b>So the hint is on the page.</b> This task says nothing about <em>hidden</em> hints.'] }, { tone: 'hidden' })}</div>
      </div>
      <div class="p1-data__second">
        <div class="p1-data__second-says">
          <p><b>Second task:</b> a published deception corpus (${CORPUS}), ${LIMITED}.</p>
        </div>
      </div>
    </div>`;

  Deck.register({
    id: 'p1-data',
    part: PART,
    kicker: kicker(PART, 'Dataset'),
    // The comma belongs to the half that is held back (click 3), so that until then the
    // title is a whole sentence and does not end on a comma.
    title: `${t('task.hinted')} reasoning traces follow or resist a wrong hint<em>, and nearly all restate it</em>`,
    // No cue: the funnel's last row names the scored sample, and slides 7 and 9 say that it
    // holds 20 questions per model, where a score rests on them.
    cite: [{ src: 'paper', where: 'Sec. 1, 2, 10' }, { src: 'young2026lie', where: 'hint (quoted)' }, { src: 'gema2024', where: '' }, { src: 'merrill2026', named: true }],
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
      second.show('.p1-data__second-says p', { at: 800, rise: 0 });
      second.hold(DUR.micro);
    },
  });

  // ---------------------------------------------------------------- slide 5: what we ran
  // Three counts, a row and a step each, in the order of the work: the traces we generated,
  // the continuations we resampled, the readers we evaluated ("scored" would be the verb of
  // what a reader does to a prefix). Beside each count a bar, and the
  // three bars share one scale (RAN.bar pixels for all the traces). The first is slide 4's
  // bar of the 14,300 hinted traces, in its colors, with the traces without the hint as an
  // outline at its end. The second has a block for each of the 16 continuations of a prefix,
  // the third a block for each of the nine readers; a block is the scored sample's 1,226
  // prefixes and so as wide in both rows: the readers read the prefixes that were resampled.
  // The last click says under each row what its count lets us measure, in words that need
  // no term of Part 2 ('p1.predicts', 'p1.fixes', 'p1.ranks'). The three questions of slide
  // 3 are not set against the rows one to one: the
  // ceiling and the point of no return both come from continuations, and every question is
  // about the traces.
  const RAN = Object.freeze({
    rows: Object.freeze([24, 232, 440]),            // where each row starts
    bar: 920, gap: 2,                                // the width of all the traces; the gap between two blocks
    perBlock: Object.freeze({ continuations: 90, readers: 140 }),   // ms from one block to the next
    perFor: 700,                                     // the last click, in ms: from one row's line to the next
  });
  const RAN_ROWS = (() => {
    const all = v('p1.traces_all');
    if (v('task.hinted') + v('p1.unhinted') !== all) throw Deck.fail('p1-scale: the traces with and without the hint do not add up to p1.traces_all');
    if (kit.grouped(v('task.hinted')) !== t('task.hinted')) throw Deck.fail('p1-scale: the count of traces would not start on task.hinted as the facts print it');
    if (v('task.sample_traces') * v('task.sample_k') !== v('task.continuations')) throw Deck.fail('p1-scale: the scored sample’s prefixes times K are not task.continuations');
    if (Deck.motifs.readers.length !== v('readers.count')) throw Deck.fail('p1-scale: readers.count is not the number of readers');
    // The two frontier models stand with their full names, version included, as the list of
    // readers has them: the names are compared whole, so a family name alone is refused.
    const listed = /frontier models \(([^)]+)\)/.exec(t('readers.kinds'));
    const frontier = t('p1.frontier_models').split(' and ');
    if (!listed || listed[1].split(', ').join('|') !== frontier.join('|') || !frontier.includes(t('readers.name_opus'))) {
      throw Deck.fail('p1-scale: p1.frontier_models no longer names the two frontier models as readers.kinds and readers.name_opus do');
    }
    const px = (n) => (n / all) * RAN.bar;
    const seg = (key, tone, from, n) => Object.freeze({ key, tone, x: px(from), w: px(n) - RAN.gap });
    // The hinted traces by outcome, as slide 4's bar has them, then the traces without the hint.
    const hinted = TRACES.groups.map((group, i) => seg(group.key, group.tone,
      TRACES.groups.slice(0, i).reduce((sum, g) => sum + v(g.fact), 0), v(group.fact)));
    const unhinted = Object.freeze({ key: 'unhinted', x: px(v('task.hinted')), w: px(v('p1.unhinted')) });
    // One block per continuation of a prefix, or per reader: each stands for the same prefixes.
    const blocks = (count) => util.range(count).map((i) => seg(`block-${i}`, null, i * v('task.sample_traces'), v('task.sample_traces')));
    return Object.freeze([
      Object.freeze({
        key: 'traces', verb: 'We generated', fact: 'p1.traces_all', noun: 'traces', tone: null, measures: 'p1.predicts',
        segs: Object.freeze([...hinted, unhinted]),
        parts: Object.freeze([
          Object.freeze({ of: 'hinted', x: 0, text: `<b>${t('task.hinted')}</b> with the hint` }),
          // What the traces without the hint are for: the hint's effect is measured against them.
          Object.freeze({ of: 'unhinted', x: unhinted.x, text: `<b>${t('p1.unhinted')}</b> without it (${t('p1.baseline')})` }),
        ]),
        // Whose traces they are is slide 4's (its 8 open reasoning models).
        lines: Object.freeze([]),
      }),
      Object.freeze({
        key: 'continuations', verb: 'We resampled', fact: 'task.continuations', noun: 'continuations', tone: 'hidden', measures: 'p1.fixes',
        segs: Object.freeze(blocks(v('task.sample_k'))),
        parts: Object.freeze([]),
        lines: Object.freeze([
          `<b>${t('task.sample_traces')}</b> prefixes, one per sampled trace`,
          `each ${t('p1.continued')} <b>${t('task.sample_k')}</b> times`,
        ]),
      }),
      Object.freeze({
        key: 'readers', verb: 'We evaluated', fact: 'readers.count', noun: 'readers', tone: 'read', measures: 'p1.ranks',
        segs: Object.freeze(blocks(v('readers.count'))),
        parts: Object.freeze([]),
        // Under the count of readers, "them" are the readers. That every reader reads the
        // same prefixes is slide 6's second cue.
        lines: Object.freeze([`among them <b>${t('p1.frontier_models')}</b>`]),
      }),
    ]);
  })();
  if (RAN.rows.length !== RAN_ROWS.length || RAN_ROWS.some((row) => !t(row.measures))) {
    throw Deck.fail('p1-scale: one place for each row, and for each row what its count lets us measure');
  }
  const toneAttr = (name) => (name ? ` data-tone="${name}"` : '');
  const ranRowHtml = (row, i) => `
      <div class="p1-ran__row" data-row="${row.key}"${toneAttr(row.tone)} style="top:${RAN.rows[i]}px">
        <p class="p1-ran__verb">${row.verb}</p>
        <p class="p1-ran__count"><b class="p1-ran__n" style="min-width:${t(row.fact).length}ch"></b><span class="p1-ran__noun">${row.noun}</span></p>
        <div class="p1-ran__detail" style="width:${RAN.bar}px">
          <div class="p1-ran__bar">${row.segs.map((s) => `<i data-seg="${s.key}"${toneAttr(s.tone)} style="left:${s.x.toFixed(1)}px;width:${s.w.toFixed(1)}px"></i>`).join('')}</div>
          ${row.parts.length ? `<p class="p1-ran__parts">${row.parts.map((part) => `<span data-of="${part.of}" style="left:${part.x.toFixed(1)}px">${part.text}</span>`).join('')}</p>` : ''}
          ${row.lines.map((line) => `<p class="p1-ran__line">${line}</p>`).join('')}
          <p class="p1-ran__for"><span>measures</span>${t(row.measures)}</p>
        </div>
      </div>`;
  const ranHtml = () => `
    <div class="p1-ran">${RAN_ROWS.map(ranRowHtml).join('')}
    </div>`;

  Deck.register({
    id: 'p1-scale',
    part: PART,
    kicker: kicker(PART, 'Dataset'),
    // "On one task" bounds the claim, in the words of the sentence that p1.measured quotes
    // ("We measure what these choices do on one task"): enough to measure what a scoring
    // choice does, which is not enough to tell the readers apart (slide 12).
    title: `On one task, we ran enough to ${t('p1.measured')}`,
    cues: [],
    cite: [{ src: 'paper', where: 'Sec. 1, 2; Table 4; Code and data' }],
    figure: 'schematic',
    numbers: 'reported',
    html: ranHtml(),
    setup: (ctx) => {
      const row = (key) => `[data-row="${key}"]`;
      // A row arrives: what we did, then the place of its count with what is counted.
      const arrive = (step, key, at) => {
        step.show(`${row(key)} .p1-ran__verb`, { at, rise: 0 });
        step.show(`${row(key)} .p1-ran__count`, { at: at + 150 });
      };
      // A bar fills block by block while its count runs up, at the pace of the blocks; then
      // the lines about it, one after the other.
      const fill = (step, key, at) => {
        const blocks = ctx.qa(`${row(key)} .p1-ran__bar i`);
        const ms = blocks.length * RAN.perBlock[key];
        step.tween(blocks, { opacity: [0, 1] }, { at, dur: DUR.micro, stagger: RAN.perBlock[key] });
        kit.countTo(step, `${row(key)} .p1-ran__n`, RAN_ROWS.find((r) => r.key === key).fact, { at, dur: ms, ease: 'linear' });
        step.show(`${row(key)} .p1-ran__line`, { at: at + ms + 200, stagger: 500, rise: 0 });
      };

      // Entrance: slide 4's 14,300 traces and their bar; the traces without the hint join
      // them, and the count runs on to all the traces.
      const enter = ctx.step({ label: 'the traces we generated' });
      arrive(enter, 'traces', 300);
      enter.tween(`${row('traces')} [data-seg]:not([data-seg="unhinted"])`, { opacity: [0, 1] }, { at: 700 });
      enter.show('[data-of="hinted"]', { at: 900, rise: 0 });
      const more = 1900;
      enter.tween('[data-seg="unhinted"]', { '--p1-grow': ['0%', '100%'] }, { at: more, dur: DUR.move, ease: 'inOut' });
      kit.countTo(enter, `${row('traces')} .p1-ran__n`, 'p1.traces_all', { from: v('task.hinted'), at: more, ease: 'inOut' });
      enter.show('[data-of="unhinted"]', { at: more + 300, rise: 0 });
      enter.hold(DUR.micro);

      // Click 1: the continuations, 16 blocks of the scored sample's prefixes.
      const again = ctx.step({ label: 'the continuations we resampled' });
      arrive(again, 'continuations', 0);
      fill(again, 'continuations', 400);
      again.hold(DUR.micro);

      // Click 2: the readers, nine blocks of those same prefixes.
      const read = ctx.step({ label: 'the readers we evaluated' });
      arrive(read, 'readers', 0);
      fill(read, 'readers', 400);
      read.hold(DUR.micro);

      // Click 3: under each row, what its count lets us measure, one row after the other.
      const measure = ctx.step({ label: 'what each count lets us measure' });
      RAN_ROWS.forEach((r, i) => measure.show(`${row(r.key)} .p1-ran__for`, { at: 300 + i * RAN.perFor, rise: 0 }));
      measure.hold(DUR.enter);
    },
  });
})();
