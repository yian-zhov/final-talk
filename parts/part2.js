// Part 2: How a prefix monitor is scored. Slides 6-9 (Methods).
// SPEC.md section 4 describes each slide; parts/sample.js shows the registration API.
// Every number and quote is read from the fact table (shared/facts.js and the facts below).
// Each slide draws its picture in the upper part of a fixed box (parts/part2.css) and, under
// it, says what the step brings in a caption of two lines at most; the caption changes with
// the click, and the three cues keep the terms on screen.
(() => {
  'use strict';

  const PART = 2;
  const DUR = Deck.timeline.DUR;
  const { kit, util } = Deck;
  const { example: EX, kicker, readers: READER_KEYS } = Deck.motifs;
  const t = (key) => Deck.fact(key).text;
  const v = (key) => Deck.fact(key).value;
  const KICK = kicker(PART, 'Methods');
  const two = (n) => n.toFixed(2);
  const signed = (n) => `${n < 0 ? '−' : '+'}${Math.abs(n).toFixed(3)}`;

  // ---------------------------------------------------------------- facts of this part
  // Facts that only Part 2 needs. Each was read on 2026-11-17 in the paper's source text
  // (final-project/paper/tmlr/sections; `file` is relative to final-project/, as in
  // shared/facts.js, and `where` is the place as numbered in paper.pdf). A `text` is the
  // paper's wording with its symbols and markup left out; the slides say it in the deck's
  // words and print only the numbers and the names.
  const paper = (where, file, rest) => Object.freeze({ src: 'paper', where, file, ...rest });
  const TEX = 'paper/tmlr/sections';

  // Slide 6: what a reader and a label are, and the nine readers in three kinds (where the
  // prefix is cut is the shared fact 'task.cut_r'). The counts 3, 2 and 4 are the paper's readers (1) to (3), (4, 5) and
  // (6) to (9); the names are printed as the paper prints them. Who is made to answer in
  // each forced reader, and what the two prompts of the frontier readers ask (AP, IN), are
  // facts of the same reading.
  Deck.addFacts({
    'p2.reader_def': paper('Sec. 1', `${TEX}/01_intro.tex:19`, { text: 'A reader maps a prefix to a continuous score or a binary verdict' }),
    'p2.label_def': paper('Sec. 1', `${TEX}/01_intro.tex:15-16`, { text: 'a trace follows the hint if it ends at that answer and resists it otherwise' }),
    'p2.same_prefixes': paper('Sec. 3.2', `${TEX}/03_tasks.tex:31`, { text: 'All readers read the same prefixes' }),
    'p2.kind_forced': paper('Sec. 3.2, readers (1) to (3)', `${TEX}/03_tasks.tex:32-35`, { value: 3, text: '3' }),
    'p2.kind_open': paper('Sec. 3.2, readers (4, 5)', `${TEX}/03_tasks.tex:36-38`, { value: 2, text: '2' }),
    'p2.kind_frontier': paper('Sec. 3.2, readers (6) to (9)', `${TEX}/03_tasks.tex:39-42`, { value: 4, text: '4' }),
    'p2.open_names': paper('Sec. 3.2', `${TEX}/03_tasks.tex:36`, { text: 'Qwen3-8B and Qwen3-32B' }),
    'p2.frontier_names': paper('Sec. 3.2', `${TEX}/03_tasks.tex:39`, { text: 'Claude Opus 5.5 and GPT-6 Astra' }),
    'p2.frontier_prompts': paper('Sec. 3.2', `${TEX}/03_tasks.tex:40`, { value: 2, text: 'two prompts' }),
    'p2.forced_subject': paper('Sec. 3.2, reader (1)', `${TEX}/03_tasks.tex:32-33`, {
      text: 'the forced answer: the subject model gets its prompt, the prefix, its end-of-thinking marker and an answer stub, and the score is its probability of X over the four letters',
    }),
    'p2.forced_nohint': paper('Sec. 3.2, reader (2)', `${TEX}/03_tasks.tex:34`, { text: 'the forced answer with the hint removed from the prompt' }),
    'p2.forced_other': paper('Sec. 3.2, reader (3)', `${TEX}/03_tasks.tex:35`, { text: 'Qwen3-32B forced to answer on the subject’s prefix' }),
    'p2.prompt_ap': paper('Sec. 3.2', `${TEX}/03_tasks.tex:40-41`, {
      text: 'AP-num, a probability for each option under the answer-prediction prompt, scored by X’s',
    }),
    'p2.prompt_in': paper('Sec. 3.2', `${TEX}/03_tasks.tex:41-42`, {
      text: 'IN-num, the probability that the final answer will be the hint’s, under the influence prompt',
    }),
    // Read on 2026-11-18: the open monitors answer the same prompt as the frontier readers' AP.
    'p2.open_prompt': paper('Sec. 3.2, readers (4, 5)', `${TEX}/03_tasks.tex:36-38`, {
      text: 'the open monitors with the answer-prediction prompt, scored by the letter probability of X',
    }),
  });
  // Slide 7: an AUROC as a share of pairs, within question or pooled.
  Deck.addFacts({
    'p2.auroc_pairs': paper('Sec. 2, Table 1', `${TEX}/02_definitions.tex:20-21`, {
      text: 'Share of (positive, negative) pairs from the same cluster in which the positive scores higher',
    }),
    'p2.pooled_pairs': paper('Sec. 2, Table 1', `${TEX}/02_definitions.tex:21`, { text: 'Pooled: over all pairs.' }),
    'p2.within_prompt': paper('Sec. 1', `${TEX}/01_intro.tex:21-22`, { text: 'A within-prompt (within-question, within-state) AUROC compares only traces of the same prompt.' }),
    'p2.within_meaning': paper('Sec. 4', `${TEX}/04_readers.tex:141-142`, {
      text: 'within-question AUROC measures what a reader learns from the reasoning beyond the prompt',
    }),
  });
  // Slide 8: a continuation and who writes it, K, the share and its AUROC, what the
  // reference is for, the small K of the first resampling, and the label from a held-out
  // continuation (the share then comes from the other 15), with what sets its ending apart
  // from the trace's own: it is a draw of the sampler that drew the others, the kind of
  // ending that the shares count.
  Deck.addFacts({
    'p2.continuation_def': paper('Sec. 1', `${TEX}/01_intro.tex:20-21`, {
      text: 'A continuation is a fresh sample of the model’s reasoning from a prefix to its end, and K is the number drawn per prefix.',
    }),
    'p2.resampling_auroc': paper('Sec. 2, Table 1', `${TEX}/02_definitions.tex:23-24`, {
      text: 'the share of K continuations that reach the outcome; its within-cluster AUROC, the resampling AUROC',
    }),
    'p2.reference_use': paper('Sec. 5', `${TEX}/05_ceiling.tex:4-5`, {
      text: 'To judge how much of what a prefix reveals a reader captures, compare it with the best AUROC any reader of the prefix could reach. Resampling estimates it',
    }),
    'p2.k_small': paper('Sec. 3.1', `${TEX}/03_tasks.tex:21-22`, { value: 2, text: '2' }),
    'p2.heldout_label': paper('Sec. 5.1', `${TEX}/05_ceiling.tex:71`, { text: 'the outcome of one held-out continuation' }),
    'p2.heldout_others': paper('Sec. 5.1', `${TEX}/05_ceiling.tex:75`, { value: 15, text: '15' }),
    'p2.own_not_a_draw': paper('Sec. 1, contribution (i); Sec. 5.1', `${TEX}/01_intro.tex:53-54 (${TEX}/05_ceiling.tex:61-62)`, {
      text: 'If the trace’s own remainder is one more draw from the continuation sampler (assumption M), the limit bounds every reader in expectation; our prefix cut violates M.',
    }),
    'p2.heldout_is_a_draw': paper('Sec. 1, contribution (i); Sec. 5.1', `${TEX}/01_intro.tex:54-55 (${TEX}/05_ceiling.tex:71-73)`, {
      text: 'With a held-out continuation’s outcome as the label, M holds by construction.',
    }),
    // Read on 2026-11-18: why the trace's own ending is not such a draw. The cut is placed at
    // a share of the trace's own reasoning, so where it falls depends on how long the trace's
    // own remainder is; a continuation is drawn after the cut is fixed.
    'p2.cut_looks_ahead': paper('Sec. 3.1; App. E, S2a', `${TEX}/03_tasks.tex:20-21 (paper/tmlr/appendix/e_ceiling.tex:27-28)`, {
      text: 'A prefix at position r ends at the last paragraph boundary at or before a share r of the trace’s own thinking tokens. The cut at a share of the trace’s own thinking makes the prefix a function of the remainder’s length, so M can fail.',
    }),
    // Read on 2026-11-18 (third cold read): the continuations start from a cut that is
    // already fixed, so no continuation's length enters where the cut falls.
    'p2.continuations_from_cut': paper('Sec. 3.1', `${TEX}/03_tasks.tex:24-25`, {
      text: 'each of the 1,226 drawn hinted traces was resampled again with K = 16 continuations from the exact cut its readers read at r = 0.5',
    }),
    // Read on 2026-11-18 (fourth cold read): why a held-out continuation's ending is the same
    // kind of thing as what the reference is built from. A share estimates the probability
    // that a continuation from the prefix reaches the outcome, and the held-out
    // continuation's outcome is one draw at that very probability.
    'p2.heldout_same_kind': paper('Sec. 5.1', `${TEX}/05_ceiling.tex:55, 71-72`, {
      text: 'Let p(x) be the probability that a continuation from prefix x reaches the outcome. Given the prefixes, the outcome of one held-out continuation is Bernoulli(p(x)), so M holds for it by construction.',
    }),
  });
  // Slide 9: what is resampled (whole questions, the paper's clusters).
  // Read on 2026-11-18: the two readers of a difference are recomputed on the same draws of
  // the questions, and the difference is taken draw by draw; and the two scores of the
  // slide's difference before rounding, which give the +0.026 that the results file prints
  // (the scores as printed, 0.828 and 0.803, are 0.025 apart).
  Deck.addFacts({
    'p2.question_clusters': paper('Table 2, caption', `${TEX}/04_readers.tex:12`, { text: 'question-cluster percentile interval' }),
    'p2.diff_same_draws': paper('App. J', 'paper/tmlr/appendix/k_inference.tex:6-12 (configs/revision/inference_frozen.md:43-44, 59-60)', {
      text: 'each model’s 20 questions are its clusters, with the paper’s 2,000 question-cluster replicates; the statistic is averaged replicate by replicate, and a pair’s difference is that of the two readers’ over-model means',
    }),
    'p2.unrounded_opus_ap': paper('Table 2', 'results/prompt_only_pooled/prompt_only_pooled.json (over_models, claude-opus-5-5|p1, within, mean, point)', { value: 0.8282736683368286, text: '0.8283' }),
    'p2.unrounded_qwen8': paper('Table 2', 'results/prompt_only_pooled/prompt_only_pooled.json (over_models, qwen3-8b|score, within, mean, point)', { value: 0.8027275220771053, text: '0.8027' }),
  });

  // ---------------------------------------------------------------- shared by the four slides
  // The picture's part of the box (parts/part2.css): the caption stands under it.
  const PIC = Object.freeze({ width: 1728, height: 536 });

  // The caption of a step is the kit's (kit.says, kit.say): one block per step, one
  // paragraph per line; parts/part2.css places it under the picture.

  // Where an element stands inside an ancestor that is positioned, in stage pixels: layout
  // offsets, so that neither the scale of the stage nor a transform of the timeline enters.
  const placeIn = (el, ancestor) => {
    if (!el || el === ancestor) return { x: 0, y: 0 };
    const up = placeIn(el.offsetParent, ancestor);
    return { x: up.x + el.offsetLeft, y: up.y + el.offsetTop };
  };

  // The cut trace, the talk's motif, is the kit's (kit.cutTrace, at the size of a label):
  // the name of the cut, and the answer chip while it is open and once it is given.
  const CUT_NAME = `cut · <span class="dk-cut__r">r = ${t('task.cut_r')}</span>`;
  const OPEN_END = 'answer: ?';
  const answerOf = (trace) => `answer: (${trace.answer})`;
  const prefixOf = (trace) => trace.lines.slice(0, EX.cut);
  const restOf = (trace) => trace.lines.slice(EX.cut);
  // The terminals carry the names the dataset slide gives the two traces of the worked
  // example (parts/part1.js): the one that follows is "one run", the other "another run".
  const RUN_NAME = Object.freeze({ follows: 'One run', resists: 'Another run' });

  // ---------------------------------------------------------------- slide 6: prefix, reader, label
  // The nine readers in three kinds, each reader of the motif in exactly one of them. The
  // dots of a card stand in the motif's order. The sentences are ours, after the paper's
  // list of readers (1) to (9) ('readers.kinds'), and short: a card holds three lines at the
  // size of a caption. The forced card says who is made to answer ('p2.forced_subject',
  // 'p2.forced_nohint', 'p2.forced_other') and prints what sets the three readers' names
  // apart in the charts of Part 3 ('reader.<key>.name' without the word they share, which
  // is the card's own); the frontier card gives the two prompts a line each, by the letters
  // those charts use, AP and IN ('p2.prompt_ap', 'p2.prompt_in'), and the open card says
  // that its two monitors answer AP ('p2.open_prompt'). What the score is, the probability
  // of the hinted answer, is said in the caption under the cards, and there for a forced
  // answer too: the probability that the model made to answer gives the hinted option
  // ('p2.forced_subject'). The cards leave at the last click; what the two letters ask stays
  // on screen as the third cue, in the card's words (ASKS), since the charts of Part 3 name
  // six of their readers by them. How many readers a kind holds is its dots.
  const KIND_OF = Object.freeze({
    forced: ['forced_nohint', 'forced', 'qwen32_forced'],
    open: ['qwen32', 'qwen8'],
    frontier: ['opus_ap', 'opus_in', 'astra_in', 'astra_ap'],
  });
  const FORCED_WORD = 'Forced, ';
  const variant = (key) => {
    const name = t(`reader.${key}.name`);
    if (!name.startsWith(FORCED_WORD)) throw Deck.fail(`part 2: the forced reader "${name}" is not named "${FORCED_WORD}..."`);
    return `<b>${name.slice(FORCED_WORD.length)}</b>`;
  };
  // A model's name is not broken at its hyphen.
  const whole = (names) => names.split(' ').map((word) => (word.includes('-') ? `<span class="p2-reader__whole">${word}</span>` : word)).join(' ');
  // What each of the two prompts asks, by the letters of the readers' names: one wording for
  // the frontier card and for the cue that keeps it. The facts name the prompts by these letters.
  const ASKS = Object.freeze({ AP: 'predict the answer', IN: 'will it be the hinted one?' });
  if (!t('p2.prompt_ap').startsWith('AP') || !t('p2.prompt_in').startsWith('IN')) throw Deck.fail('part 2: the facts of the two prompts no longer name them AP and IN');
  const prompt = (letters) => `<span class="p2-reader__prompt"><b>${letters}</b> ${ASKS[letters]}</span>`;
  const KINDS = Object.freeze([
    { key: 'forced', name: 'Forced answer', count: 'p2.kind_forced',
      does: `Made to answer at the cut: the trace’s model (${variant('forced')}, ${variant('forced_nohint')}) or another (${variant('qwen32_forced')}).` },
    { key: 'open', name: 'Open monitors', count: 'p2.kind_open',
      does: `${whole(t('p2.open_names'))} predict the answer (<b>AP</b>).` },
    { key: 'frontier', name: 'Frontier monitors', count: 'p2.kind_frontier',
      does: `${whole(t('p2.frontier_names'))}:${prompt('AP')}${prompt('IN')}` },
  ].map((kind) => Object.freeze({ ...kind, readers: READER_KEYS.filter((key) => KIND_OF[kind.key].includes(key)) })));
  (() => {
    const placed = KINDS.flatMap((kind) => kind.readers);
    const forced = READER_KEYS.filter((key) => Deck.fact(`reader.${key}.name`).forced);
    if (placed.length !== READER_KEYS.length || READER_KEYS.length !== v('readers.count')) {
      throw Deck.fail(`part 2: the three kinds hold ${placed.length} readers, the motif ${READER_KEYS.length}, the paper ${v('readers.count')}`);
    }
    KINDS.forEach((kind) => {
      if (kind.readers.length !== v(kind.count)) throw Deck.fail(`part 2: kind "${kind.key}" holds ${kind.readers.length} readers, the paper ${v(kind.count)}`);
    });
    if (forced.join() !== KINDS[0].readers.join()) throw Deck.fail('part 2: the forced kind is not the three readers the facts mark as forced');
  })();

  // How the label is written as a number: a trace that follows is 1, one that resists 0.
  const LABEL = Object.freeze({ follows: 1, resists: 0 });
  // The trace and its score stand mid-stage until the score (termX) and the cards (flowY)
  // arrive, and return to mid-height when the cards leave for the label; the full trace of
  // the dataset slide is shown for `cutAt` ms before it is cut.
  const READER = Object.freeze({ termX: 392, flowY: 100, cutAt: 1300, sweep: 1000, typeCps: 45 });

  const kindHtml = (kind) => `
    <div class="p2-reader__kind" data-kind="${kind.key}">
      <div class="p2-reader__kind-head">
        <span class="p2-reader__kind-name">${kind.name}</span>
        <span class="p2-reader__kind-dots">${kind.readers.map((key) => `<i data-reader="${key}"></i>`).join('')}</span>
      </div>
      <p class="p2-reader__kind-does">${kind.does}</p>
    </div>`;

  Deck.register({
    id: 'p2-reader',
    part: PART,
    kicker: KICK,
    title: 'A reader turns a prefix into a score; the label is how the trace really ended',
    cues: [
      { text: 'Reader: prefix in, score out. A monitor is one kind', step: 1 },
      { text: 'Nine readers of three kinds read the same prefixes', step: 2 },
      // The cards of click 2 leave at click 3; what AP and IN ask stays, in the cards' words.
      { text: `<b>AP:</b> ${ASKS.AP} · <b>IN:</b> ${ASKS.IN}`, step: 3 },
    ],
    cite: [{ src: 'paper', where: 'Sec. 1, 3.1-3.2' }],
    figure: ['schematic', 'illustrative'],
    html: `
      <div class="p2-box p2-reader">
        <div class="p2-reader__flow">
          <div class="dk-term p2-reader__term">
            <div class="dk-term__label">${RUN_NAME[EX.follower.outcome]}</div>
            ${kit.cutTrace({ key: 'reader', seen: prefixOf(EX.follower), unseen: restOf(EX.follower), cut: CUT_NAME, end: answerOf(EX.follower), plain: true })}
            ${kit.lens({ key: 'reader' })}
          </div>
          <i class="p2-reader__wire"></i>
          <div class="p2-reader__score">${kit.meter({ key: 'reader-score', label: 'score', tone: 'read' })}</div>
          <div class="p2-reader__label">
            <span class="p2-reader__label-name">label</span>
            <span class="p2-reader__label-run"><i></i>${kit.flag({ key: 'reader-label', text: EX.follower.outcome })}</span>
            <span class="p2-reader__label-value">${LABEL.follows}</span>
            <span class="p2-reader__label-key"><span class="c-alarm">follows = ${LABEL.follows}</span> · <span class="c-ok">resists = ${LABEL.resists}</span></span>
          </div>
        </div>
        <div class="p2-reader__kinds">${KINDS.map(kindHtml).join('')}</div>
        ${kit.says({
    prefix: [
      `<b>Prefix at r = ${t('task.cut_r')}:</b> cut at the last paragraph break before half of the reasoning.`,
      'No reader sees the rest.',
    ],
    reader: [
      'Here the <b class="c-read">score</b> says how likely this trace is to end at the hinted answer.',
      'Forced answer: the probability the model gives the hinted option.',
    ],
    label: ['<b>Label:</b> did this trace end at the hinted answer?'],
  })}
      </div>`,
    setup: (ctx) => {
      const flow = ctx.q('.p2-reader__flow');
      const term = ctx.q('.p2-reader__term');
      const lens = ctx.q('[data-lens="reader"]');
      const cut = kit.cutParts(ctx.q('[data-cut="reader"]'));
      const chip = ctx.q('[data-flag="reader-label"]');
      const score = EX.follower.score;
      // The lens reads the prefix and nothing else: from the top of its first paragraph to
      // the bottom of its last.
      const last = cut.seen[cut.seen.length - 1];
      const span = { top: cut.seen[0].offsetTop, bottom: last.offsetTop + last.offsetHeight };
      const sweep = (step, at, dur) => {
        step.tween(lens, { opacity: [0, 1] }, { at: at - DUR.micro, dur: DUR.micro });
        step.tween(lens, { y: [span.top, span.bottom] }, { at, dur, ease: 'linear' });
        step.tween(lens, { opacity: [1, 0] }, { at: at + dur, dur: DUR.enter });
      };

      // Entrance: the follower trace of the dataset slide, whole, as that slide left it; then
      // the cut drops after its second paragraph. What a reader is shown turns teal, what
      // lies beyond the cut gives way to dashed outlines, and the answer is open again.
      const enter = ctx.step({ label: 'the prefix of one trace' });
      const { cutAt } = READER;
      const rest = restOf(EX.follower);
      enter.show(term, { at: 200 });
      cut.unseenTexts.forEach((text, i) => enter.type(text, rest[i], { dur: 0 }));
      enter.cls(cut.seen, 'is-prefix', { at: cutAt + DUR.micro });
      enter.cls(cut.unseen, 'is-open', { at: cutAt + DUR.micro });
      enter.tween(cut.rule, { height: ['0px', '32px'], marginTop: ['-8px', '0px'], opacity: [0, 1] }, { at: cutAt, dur: DUR.enter });
      enter.tween(cut.unseenTexts, { opacity: [1, 0] }, { at: cutAt + DUR.micro, dur: DUR.enter, stagger: 120 });
      enter.tween(cut.unseen, { '--dk-dash': [0, 1] }, { at: cutAt + DUR.enter, dur: DUR.enter, stagger: 120 });
      enter.type(cut.end, answerOf(EX.follower), { dur: 0 });
      enter.tween(cut.end, { scale: [1, 1] }, { dur: 0 });
      enter.type(cut.end, OPEN_END, { at: cutAt + DUR.move, dur: 0 });
      enter.cls(cut.end, 'is-follows', { at: cutAt + DUR.move, on: false });
      kit.say(enter, 'prefix', [cutAt + DUR.micro, cutAt + DUR.move + DUR.micro]);
      enter.hold(DUR.enter);

      // Click 1: a reader. The terminal makes room, the lens sweeps the two paragraphs of the
      // prefix, and the meter beside it fills to the score (a made-up one: the tag
      // "Illustrative" covers it).
      const read = ctx.step({ label: 'a reader gives a score' });
      const sweepAt = 1000;
      const scored = sweepAt + READER.sweep;
      read.tween(term, { x: [READER.termX, 0] }, { dur: DUR.move, ease: 'inOut' });
      sweep(read, sweepAt, READER.sweep);
      read.tween('.p2-reader__wire', { opacity: [0, 1], x: [-16, 0] }, { at: scored - DUR.micro, dur: DUR.enter });
      read.tween('.p2-reader__score', { opacity: [0, 1] }, { at: scored - DUR.micro, dur: DUR.enter });
      read.tween('[data-meter="reader-score"] .dk-meter__fill', { '--v': ['0%', `${score * 100}%`] }, { at: scored, dur: DUR.move });
      read.count('[data-meter="reader-score"] .dk-meter__value', [0, score], { at: scored, dur: DUR.move, format: two });
      kit.say(read, 'reader', [scored], { leaves: 'prefix' });

      // Click 2: the nine readers. The trace and its score move up, the three cards arrive
      // under them, and the lens goes over the prefix once more while the nine dots fill:
      // the same prefix feeds every reader. The caption of click 1 stays and gets its second
      // line: what the score of a forced answer is.
      const nine = ctx.step({ label: 'nine readers of three kinds' });
      nine.tween(flow, { y: [READER.flowY, 0] }, { dur: DUR.move, ease: 'inOut' });
      nine.show('.p2-reader__kind', { at: 500, stagger: 180 });
      sweep(nine, 1400, READER.sweep);
      nine.cls(ctx.qa('.p2-reader__kind-dots i'), 'is-fed', { at: 1500, stagger: 100 });
      nine.tween('[data-says-line="reader:1"]', { opacity: [0, 1] }, { at: 1500 + READER_KEYS.length * 100, dur: DUR.enter });
      nine.hold(DUR.enter);

      // Click 3: the label. The three cards have been read and leave, and the trace with
      // its score returns to mid-height, so that this step shows the trace, its score and
      // its label and nothing else. The model writes the rest, the answer lands on the
      // hinted option, and the outcome travels from the answer to its place under the score.
      const label = ctx.step({ label: 'the label' });
      const typed = (text) => Math.round((text.length / READER.typeCps) * 1000);
      const cleared = DUR.micro + DUR.move;
      label.tween('.p2-reader__kind', { opacity: [1, 0] }, { dur: DUR.micro });
      label.tween(flow, { y: [0, READER.flowY] }, { at: DUR.micro, dur: DUR.move, ease: 'inOut' });
      const starts = rest.reduce((at, line) => [...at, at[at.length - 1] + typed(line) + DUR.micro], [cleared + 100]);
      const answered = starts[rest.length];
      cut.unseenTexts.forEach((text, i) => {
        label.tween(text, { opacity: [0, 1] }, { at: starts[i], dur: 0 });
        label.type(text, rest[i], { at: starts[i], cps: READER.typeCps });
      });
      label.type(cut.end, answerOf(EX.follower), { at: answered, dur: 0 });
      label.cls(cut.end, 'is-follows', { at: answered });
      label.tween(cut.end, { scale: [1.4, 1] }, { at: answered, dur: DUR.enter });
      const from = placeIn(cut.end, flow);
      const to = placeIn(chip, flow);
      const lands = answered + DUR.enter + DUR.move;
      label.cls(chip, 'is-flagged', { at: 0 });
      label.tween(chip, { opacity: [0, 1] }, { at: answered + DUR.enter, dur: DUR.micro });
      label.tween(chip, { x: [from.x - to.x, 0], y: [from.y - to.y, 0] }, { at: answered + DUR.enter, dur: DUR.move, ease: 'inOut' });
      label.tween('.p2-reader__label-name, .p2-reader__label-run i', { opacity: [0, 1] }, { at: lands - DUR.micro, dur: DUR.enter });
      label.tween('.p2-reader__label-value', { opacity: [0, 1], scale: [1.4, 1] }, { at: lands, dur: DUR.enter });
      label.tween('.p2-reader__label-key', { opacity: [0, 1] }, { at: lands + DUR.micro, dur: DUR.enter });
      kit.say(label, 'label', [200], { leaves: 'reader' });
      label.hold(DUR.enter);
    },
  });

  // ---------------------------------------------------------------- slide 7: AUROC, within and pooled
  // The grid of 100 pairs explains what an AUROC is and names no reader: at that click
  // neither kind of pair has been defined, so the slide prints no measured AUROC. How many
  // of the 100 are ranked correctly is made up, and the readout says so under the number
  // (the tag "Illustrative" covers it). It is kept away from the nine readers' measured
  // within-question AUROCs ('readers.within_min' to 'readers.within_max', 0.803 to 0.844), so
  // that it is not taken for one: earlier builds showed 83 of 100, one reader's 0.828 in
  // whole pairs, and the third cold read took that for a result. Which cells are the wrong
  // ones, and the order in which the cells fill, are seeded. The first cell is the pair of
  // the entrance, which is ranked correctly.
  const PAIRS = 100;
  const PAIRS_RIGHT = 70;
  const GRID = (() => {
    const rest = util.range(PAIRS).slice(1);
    const wrong = util.shuffled(rest, 3).slice(0, PAIRS - PAIRS_RIGHT);
    return Object.freeze({ wrong: Object.freeze(wrong), order: Object.freeze(util.shuffled(rest, 5)), cell: 32, perCell: 18 });
  })();
  // The pair of the entrance: the two prefixes of the worked example, and where each stands.
  const PAIR = Object.freeze([
    { key: 'follower', trace: EX.follower, state: 'is-flagged' },
    { key: 'resister', trace: EX.resister, state: 'is-clean' },
  ]);
  // The blocks as parts/part2.css places them: the pair (its box and its middle), and the
  // grid's block, which stands mid-stage (`center`) until the columns arrive.
  const AUROC_AT = Object.freeze({
    pair: Object.freeze({ x: 864, y: 268 }),
    many: Object.freeze({ top: 54, width: 776, center: (PIC.width - 776) / 2 }),
  });

  // Question columns, the kit's (kit.cols): one column per question, its traces as red and
  // green dots, the followers on top; an arc joins a follower and a resister (kit.colsArc).
  // Arcs inside a column bow out to its right; arcs across columns are faint and run under
  // the columns. The mixes are made up, and differ between the columns. The key under the
  // columns names the two kinds of line in the words of the motivation slide's key (slide
  // 3): "within a question" for the bright arcs and, once the faint lines are drawn (click
  // 3), "across questions" for those.
  const QUESTIONS = Object.freeze({
    key: 'auroc', cls: 'p2-auroc__art', width: 872, height: 392, x: Object.freeze([136, 436, 736]),
    box: Object.freeze({ w: 88, top: 56, h: 320, r: 16 }), labelY: 36, dotTop: 96, pitch: 48, r: 14, bow: 0.42,
    questions: Object.freeze([[4, 2], [3, 3], [2, 4]].map(([followers, resisters], col) => Object.freeze({
      label: `Question ${col + 1}`, follows: followers, traces: followers + resisters,
    }))),
  });
  // A dot is [column, row]; a pair is a follower and a resister, inside one column or across two.
  const COL_DOTS = Object.freeze(QUESTIONS.questions.flatMap((q, col) => util.range(q.traces)
    .map((row) => Object.freeze({ at: Object.freeze([col, row]), follows: row < q.follows }))));
  const COL_PAIRS = Object.freeze(COL_DOTS.filter((dot) => dot.follows)
    .flatMap((a) => COL_DOTS.filter((dot) => !dot.follows).map((b) => Object.freeze({ a: a.at, b: b.at, inside: a.at[0] === b.at[0] }))));
  const arcsHtml = (inside) => `<g>${COL_PAIRS.filter((pair) => pair.inside === inside)
    .map((pair) => `<path class="dk-cols__arc${inside ? '' : ' is-faint'}" data-arc="${inside ? 'inside' : 'across'}" data-col="${pair.a[0]}" d="${kit.colsArc(QUESTIONS, pair.a, pair.b).d}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>`).join('')}</g>`;

  const pairHtml = ({ key, trace, state }) => `
    <div class="p2-auroc__trace" data-trace="${key}">
      <div class="dk-term p2-auroc__term">
        <div class="dk-term__label">${RUN_NAME[trace.outcome]}</div>
        <div class="p2-auroc__status"><span>label</span><span class="dk-flag ${state}">${trace.outcome}</span></div>
        ${kit.cutTrace({ key: `pair-${key}`, seen: prefixOf(trace), unseen: restOf(trace).map(() => ''), end: OPEN_END })}
      </div>
      ${kit.meter({ key: `pair-${key}`, label: 'score', tone: 'read' })}
    </div>`;

  Deck.register({
    id: 'p2-auroc',
    part: PART,
    kicker: KICK,
    title: 'AUROC is the share of pairs that a reader ranks correctly',
    cues: [
      { text: '0.5: a coin flip. 1.0: every pair ranked correctly', step: 1 },
      { text: 'Within question: same prompt, only the reasoning differs', step: 2 },
      { text: 'Pooled: any follower against any resister, across questions', step: 3 },
    ],
    cite: [{ src: 'paper', where: 'Sec. 1, 2, 3.1, 4; Table 1' }],
    figure: ['schematic', 'illustrative'],
    numbers: 'reported',
    html: `
      <div class="p2-box p2-auroc">
        <div class="p2-auroc__pair">
          ${PAIR.map(pairHtml).join('')}
          <i class="p2-auroc__check"></i>
          <div class="p2-auroc__gt">&gt;</div>
        </div>
        <div class="p2-auroc__many">
          <div class="p2-auroc__grid">${kit.grid({ key: 'pairs', n: PAIRS, cols: 10, tone: 'read' })}</div>
          <div class="p2-auroc__readout">
            <div class="p2-auroc__name">AUROC</div>
            <div class="p2-auroc__value">${two(PAIRS_RIGHT / PAIRS)}</div>
            <div class="p2-auroc__madeup">a made-up example</div>
            <div class="p2-auroc__keys">
              <span><i></i>ranked correctly</span>
              <span><i class="p2-is-wrong"></i>ranked wrongly</span>
            </div>
          </div>
        </div>
        <div class="p2-auroc__cols">
          ${kit.cols({ ...QUESTIONS, back: arcsHtml(false), under: arcsHtml(true) })}
          <div class="p2-auroc__legend">
            <span><i class="is-follows"></i>follows</span><span><i></i>resists</span><span data-key="within"><i class="is-arc"></i>within a question</span><span data-key="across"><i class="is-line"></i>across questions</span>
          </div>
          <div class="p2-auroc__counter"><span>Our data: ${t('task.sample_questions')} questions per model, not ${QUESTIONS.questions.length}.</span><span>Only <b>${t('pooled.within_share_min')} to ${t('pooled.within_share_max')}</b> of those pairs share a question.</span></div>
        </div>
        ${kit.says({
    pair: [
      'One trace will follow, one will resist. A reader scored both prefixes.',
      'The follower got the higher score: this pair is ranked correctly.',
    ],
    many: [
      `Take ${PAIRS} such pairs.`,
      `<b class="p2-num">${PAIRS_RIGHT}</b> are ranked correctly.`,
    ],
    within: ['<b>Within question:</b> a follower is paired only with resisters of its own question.'],
    pooled: ['<span class="p2-ask">Which pairs to count is a choice. Does it change the number?</span>'],
  })}
      </div>`,
    setup: (ctx) => {
      const cell = (i) => `[data-grid="pairs"] [data-cell="${i}"]`;

      // Entrance: one pair. The two prefixes with the label each trace will get, the
      // reader's two scores, and the verdict on the pair.
      const enter = ctx.step({ label: 'one pair of traces' });
      enter.show('.p2-auroc__trace', { at: 200, stagger: 200 });
      enter.tween(cell(0), { scale: [1, 1] }, { dur: 0 });
      PAIR.forEach(({ key, trace }, i) => {
        const at = 900 + i * 300;
        enter.tween(`[data-meter="pair-${key}"] .dk-meter__fill`, { '--v': ['0%', `${trace.score * 100}%`] }, { at, dur: DUR.move });
        enter.count(`[data-meter="pair-${key}"] .dk-meter__value`, [0, trace.score], { at, dur: DUR.move, format: two });
      });
      const judged = 900 + 300 + DUR.move + DUR.micro;
      enter.tween('.p2-auroc__gt', { opacity: [0, 1] }, { at: judged, dur: DUR.micro });
      enter.tween('.p2-auroc__check', { opacity: [0, 1], scale: [1.8, 1] }, { at: judged + DUR.micro, dur: DUR.enter });
      kit.say(enter, 'pair', [300, judged + DUR.enter]);
      enter.hold(DUR.enter);

      // Click 1: many pairs. The pair shrinks into the first cell of the grid and the other
      // cells fill in a seeded order. No number runs while they fill: the count and the
      // AUROC arrive when the last cell has landed, so no frame prints a count or a share
      // that is not the final one. The AUROC arrives with the words that say it is made up.
      const many = ctx.step({ label: 'many pairs make an AUROC' });
      const first = { x: AUROC_AT.many.center + GRID.cell / 2, y: AUROC_AT.many.top + GRID.cell / 2 };
      const filling = DUR.move + DUR.micro;
      const filled = filling + GRID.order.length * GRID.perCell;
      many.tween('.p2-auroc__pair', { x: [0, first.x - AUROC_AT.pair.x], y: [0, first.y - AUROC_AT.pair.y], scale: [1, 0.03] }, { dur: DUR.move, ease: 'inOut' });
      many.tween('.p2-auroc__pair', { opacity: [1, 0] }, { at: DUR.move - DUR.micro, dur: DUR.micro });
      many.tween('.p2-auroc__grid', { opacity: [0, 1] }, { at: DUR.micro, dur: DUR.enter });
      many.cls(cell(0), 'is-on', { at: DUR.move });
      many.tween(cell(0), { scale: [2.4, 1] }, { at: DUR.move, dur: DUR.enter });
      GRID.order.forEach((i, n) => many.cls(cell(i), GRID.wrong.includes(i) ? 'p2-is-wrong' : 'is-on', { at: filling + n * GRID.perCell }));
      many.tween('.p2-auroc__keys', { opacity: [0, 1] }, { at: filling, dur: DUR.enter });
      many.tween('.p2-auroc__name', { opacity: [0, 1] }, { at: filled + DUR.enter, dur: DUR.micro });
      many.tween('.p2-auroc__value', { opacity: [0, 1], scale: [1.3, 1] }, { at: filled + DUR.enter, dur: DUR.enter });
      many.tween('.p2-auroc__madeup', { opacity: [0, 1] }, { at: filled + DUR.enter, dur: DUR.enter });
      kit.say(many, 'many', [DUR.enter, filled], { leaves: 'pair' });
      many.hold(DUR.enter);

      // Click 2: within question. The grid makes room; three questions arrive as columns,
      // each with its own traces, and arcs join a follower and a resister inside a column
      // only.
      const within = ctx.step({ label: 'within question' });
      within.tween('.p2-auroc__many', { x: [AUROC_AT.many.center, 0] }, { dur: DUR.move, ease: 'inOut' });
      QUESTIONS.x.forEach((_, col) => within.tween(`.p2-auroc__art [data-col="${col}"]:not(path)`, { opacity: [0, 1] }, { at: 500 + col * 200, dur: DUR.enter }));
      within.tween('.p2-auroc__legend', { opacity: [0, 1] }, { at: 700, dur: DUR.enter });
      within.tween('[data-arc="inside"]', { 'attr:stroke-dashoffset': [1, 0] }, { at: 1300, dur: 450, stagger: 45 });
      kit.say(within, 'within', [300], { leaves: 'many' });
      within.hold(DUR.enter);

      // Click 3: pooled. The same dots, and now every follower against every resister: the
      // arcs across columns arrive in a seeded order until those inside a column are the
      // minority. Three columns cannot show the measured share (with three, a third of the
      // pairs share a column), so the line under them carries the number and says why the
      // picture shows another: the data has 20 questions per model, the sketch three.
      const pooled = ctx.step({ label: 'pooled' });
      const across = util.shuffled(ctx.qa('[data-arc="across"]'), 9);
      const crossed = 500 + across.length * 22 + 500;
      pooled.tween(across, { 'attr:stroke-dashoffset': [1, 0] }, { at: 500, dur: 500, stagger: 22 });
      pooled.tween('.p2-auroc__legend [data-key="across"]', { opacity: [0, 1] }, { at: 500, dur: DUR.enter });
      pooled.tween('.p2-auroc__counter', { opacity: [0, 1] }, { at: crossed, dur: DUR.enter });
      kit.say(pooled, 'pooled', [crossed + DUR.move], { leaves: 'within' });
      pooled.hold(DUR.enter);
    },
  });

  // ---------------------------------------------------------------- slide 8: continuations and K
  // The fan: K paths from one cut. K is the real number of continuations per prefix; how
  // many of them end at the hinted answer is made up (the tag "Illustrative" covers it), and
  // which ones, and the order in which they are drawn, are seeded. `first` are the lanes of
  // the two continuations that are shown before the others: one resists, one follows. The
  // one that resists is the continuation that is later held out; the share then comes from
  // the others ('p2.heldout_others').
  const FAN = (() => {
    const k = v('task.sample_k');
    const follow = 11;
    const first = Object.freeze({ resists: 10, follows: 3 });
    const others = util.range(k).filter((i) => i !== first.resists && i !== first.follows);
    const red = [first.follows, ...util.shuffled(others, 7).slice(0, follow - 1)];
    if (k - 1 !== v('p2.heldout_others')) throw Deck.fail(`part 2: one of ${k} continuations held out leaves ${k - 1}, the paper has ${v('p2.heldout_others')}`);
    return Object.freeze({
      k, follow, first, small: v('p2.k_small'), others: Object.freeze(others),
      // The lanes of the two that stay when K is small, the upper one first.
      smallLanes: Object.freeze([first.resists, first.follows].sort((a, b) => a - b)),
      follows: Object.freeze(util.range(k).map((i) => red.includes(i))),
      order: Object.freeze(util.shuffled(others, 11)),
    });
  })();
  // Where the paths start (the right end of the cut) and end, the lanes of the two endings
  // that serve as labels (the trace's own, a held-out continuation's) and the K lanes of
  // the continuations; then the bar of the readout (parts/part2.css, .p2-fan__cells).
  const FAN_AT = Object.freeze({
    ox: 704, oy: 320, ex: 1180, own: 36, held: 92, top: 148, pitch: 23, r: 9,
    bar: Object.freeze({ left: 1220, top: 290, height: 40, cell: 24, pitch: 30 }),
    draw: 600, perLane: 150,
  });
  const laneY = (i) => FAN_AT.top + i * FAN_AT.pitch;
  const fanPath = (y) => {
    const bend = (FAN_AT.ex - FAN_AT.ox) / 2;
    return `M${FAN_AT.ox} ${FAN_AT.oy} C${FAN_AT.ox + bend} ${FAN_AT.oy} ${FAN_AT.ex - bend} ${y} ${FAN_AT.ex} ${y}`;
  };
  // A path is drawn by a clip that opens from the cut to the right (a dashed line cannot
  // be drawn by its dash offset).
  const CLIP = Object.freeze({ x: FAN_AT.ox - 4, width: FAN_AT.ex - FAN_AT.ox + 8 });
  const laneHtml = (key, y, own) => `
    <g data-lane="${key}">
      <clipPath id="p2-fan-clip-${key}"><rect data-clip="${key}" x="${CLIP.x}" y="0" width="0" height="${PIC.height}"/></clipPath>
      <path class="p2-fan__path${own ? ' p2-fan__path--own' : ''}" data-path="${key}" d="${fanPath(y)}" clip-path="url(#p2-fan-clip-${key})"/>
      <circle class="p2-fan__dot" data-dot="${key}" cx="${FAN_AT.ex}" cy="${y}" r="0"/>
    </g>`;
  // The bracket at the right of the fan spans the lanes that are drawn: from lane `from` to
  // lane `to`.
  const braceHtml = (key, from, to) => `<path class="p2-fan__brace" data-brace="${key}" d="M${FAN_AT.ex + 16} ${laneY(from) - FAN_AT.r} h8 V${laneY(to) + FAN_AT.r} h-8"/>`;
  const endHtml = (key, y, state, text, tag) => `
    <div class="p2-fan__end" data-end="${key}" style="top:${y - 22}px">
      <span class="dk-flag ${state}">${text}</span>${tag ? `<span class="p2-fan__tag">${tag}</span>` : ''}
    </div>`;
  const CHIP = Object.freeze({
    follows: Object.freeze({ state: 'is-flagged', text: EX.follower.outcome }),
    resists: Object.freeze({ state: 'is-clean', text: EX.resister.outcome }),
  });
  const shareOf = (red, k) => Object.freeze({ k: String(k), frac: `${red} / ${k}`, share: two(red / k) });
  // K takes three values on the slide; beside each stands why it is that one. Sixteen is
  // what the project drew for each prefix ('task.sample_k'); two is a thought experiment
  // (and the K of the project's first resampling, 'p2.k_small'); fifteen is the sixteen
  // less the one that is held out as the label ('p2.heldout_others').
  const WHY_K = Object.freeze({
    all: 'as in our data',
    small: `what if only ${v('p2.k_small')}?`,
    others: `one of ${v('task.sample_k')} held out`,
  });
  // The shares of three other prefixes, as bars under this prefix's: how many of their K
  // continuations end at the hinted answer is made up (the tag "Illustrative" covers it).
  // The reference is the AUROC of such shares, one per prefix, and no single share.
  const OTHER_PREFIXES = Object.freeze([4, 14, 7]);
  const otherHtml = (red) => `<div class="p2-fan__row">${util.range(FAN.k).map((j) => `<i${j < red ? ' class="is-on"' : ''}></i>`).join('')}</div>`;
  // The two kinds of ending, as a key of the fan's two strokes under the prefix (click 5).
  // The trace's own ending, the solid line, was written before the cut was placed: the cut
  // stands at a share of the trace's own reasoning ('p2.cut_looks_ahead'). A continuation,
  // a dashed line, was sampled after it, from the cut ('p2.continuations_from_cut'). The
  // reference is built from the dashed kind, and the second label is one of that kind
  // ('p2.heldout_same_kind'). The key says where each kind comes from and no more: how the
  // cut depends on the length of the trace's own ending is not on the slide (three cold
  // reads could not follow it, in words or as a picture of two traces cut at half).
  const ORIGINS = Object.freeze([
    { key: 'own', own: true, text: 'already written when we cut' },
    { key: 'again', own: false, text: 'sampled after we cut' },
  ]);
  const ORIGIN_MARK = Object.freeze({ width: 72, height: 16 });
  const originsHtml = () => `
        <div class="p2-origins">${ORIGINS.map(({ key, own, text }) => `
          <span class="p2-origins__row" data-origin="${key}"><svg viewBox="0 0 ${ORIGIN_MARK.width} ${ORIGIN_MARK.height}" width="${ORIGIN_MARK.width}" height="${ORIGIN_MARK.height}" aria-hidden="true"><path class="p2-fan__path${own ? ' p2-fan__path--own' : ''}" d="M0 ${ORIGIN_MARK.height / 2} H${ORIGIN_MARK.width}"/></svg>${text}</span>`).join('')}
        </div>`;

  Deck.register({
    id: 'p2-resample',
    part: PART,
    kicker: KICK,
    title: 'Resampling: the model that wrote a prefix finishes it K times; count the endings',
    cues: [
      { text: 'Continuation: a fresh ending, sampled from the same prefix', step: 1 },
      { text: 'K: the number of continuations per prefix', step: 2 },
      { text: 'The reference (resampling AUROC): AUROC of all prefixes’ shares', step: 3 },
    ],
    cite: [{ src: 'paper', where: 'Sec. 1, 3.1, 5' }],
    figure: ['schematic', 'illustrative'],
    html: `
      <div class="p2-box p2-fan">
        <div class="dk-term p2-fan__term">
          <div class="dk-term__label">${RUN_NAME[EX.follower.outcome]}</div>
          ${kit.cutTrace({ key: 'fan', seen: prefixOf(EX.follower), cut: CUT_NAME })}
        </div>${originsHtml()}
        <svg class="p2-fan__art" viewBox="0 0 ${PIC.width} ${PIC.height}" width="${PIC.width}" height="${PIC.height}" aria-hidden="true">
          ${laneHtml('own', FAN_AT.own, true)}
          <g class="p2-fan__all">${util.range(FAN.k).map((i) => laneHtml(i, laneY(i), false)).join('')}</g>
          ${braceHtml('all', 0, FAN.k - 1)}
          ${braceHtml('small', ...FAN.smallLanes)}
        </svg>
        ${endHtml('own', FAN_AT.own, CHIP.follows.state, CHIP.follows.text, 'its own ending')}
        ${endHtml('first-resists', laneY(FAN.first.resists), CHIP.resists.state, CHIP.resists.text)}
        ${endHtml('first-follows', laneY(FAN.first.follows), CHIP.follows.state, CHIP.follows.text)}
        ${endHtml('held', FAN_AT.held, CHIP.resists.state, CHIP.resists.text, 'held out: the second label')}
        <div class="p2-fan__readout">
          <div class="p2-fan__k">K = <span data-fan="k"></span><span class="p2-fan__why" data-fan="why"></span></div>
          <div class="p2-fan__share">share = <b data-fan="frac"></b> = <b data-fan="share"></b></div>
          <div class="p2-fan__ref">this prefix</div>
          <div class="p2-fan__cells" data-cells="all">${util.range(FAN.k).map((j) => `<i data-cell="${j}"></i>`).join('')}</div>
          <div class="p2-fan__cells" data-cells="small">${util.range(FAN.small).map((j) => `<i data-half="${j}"></i>`).join('')}</div>
          <div class="p2-fan__others">${OTHER_PREFIXES.map(otherHtml).join('')}<span>other prefixes</span></div>
          <div class="p2-fan__auroc">AUROC of all these shares: the reference</div>
          <div class="p2-fan__ask p2-ask">How many continuations are enough?</div>
        </div>
        ${util.range(FAN.k).map((i) => `<i class="p2-fan__ghost${FAN.follows[i] ? '' : ' is-resist'}" data-ghost="${i}" style="left:${FAN_AT.ex - FAN_AT.r}px; top:${laneY(i) - FAN_AT.r}px"></i>`).join('')}
        ${kit.says({
    open: ['A prefix does not fix the ending. How much does it reveal?'],
    continuation: ['<b class="c-hidden">Continuation:</b> that model writes the rest again. It can end differently.'],
    k: [`${FAN.follow} of these ${FAN.k} continuations end at the hinted answer.`],
    reference: [
      'That share is a score too: the model’s own, for this one prefix.',
      '<b class="c-hidden">The reference</b> is a ruler for readers, not a ceiling.',
    ],
    coarse: ['Then the share can only be 0, ½ or 1: a coarse reference.'],
    second: [
      'The label so far: the trace’s own ending. <span class="p2-fan__but">But the reference is built from continuations.</span>',
      '<b>A second label:</b> a held-out continuation’s ending. Same kind, so the reference is a fair ruler.',
    ],
  })}
      </div>`,
    setup: (ctx) => {
      const { first } = FAN;
      const lane = (key) => `[data-lane="${key}"]`;
      const dot = (key) => `[data-dot="${key}"]`;
      const end = (key) => `[data-end="${key}"]`;
      // A path is drawn from the cut to its end, and its dot lands when the path arrives
      // there, not before; returns the time of arrival.
      const draw = (step, key, at, dur = FAN_AT.draw) => {
        step.tween(`[data-clip="${key}"]`, { 'attr:width': [0, CLIP.width] }, { at, dur, ease: 'inOut' });
        step.tween(dot(key), { 'attr:r': [0, FAN_AT.r] }, { at: at + dur, dur: DUR.micro, ease: 'back' });
        return at + dur;
      };
      // The chip of an ending lands like a stamp; what the ending is follows it.
      const name = (step, key, at) => {
        step.tween(`${end(key)} .dk-flag`, { opacity: [0, 1], scale: [1.6, 1] }, { at, dur: DUR.enter });
        if (ctx.qa(`${end(key)} .p2-fan__tag`).length) step.tween(`${end(key)} .p2-fan__tag`, { opacity: [0, 1] }, { at: at + DUR.micro, dur: DUR.enter });
      };
      // The readout says what is drawn: how many continuations, and how many of them end
      // at the hinted answer.
      const count = (step, at, red, k) => Object.entries(shareOf(red, k))
        .forEach(([field, text]) => step.type(`[data-fan="${field}"]`, text, { at, dur: 0 }));
      // K changes twice on the slide: the readout says the new K and why, with a beat.
      const because = (step, at, why, beat = true) => {
        step.type('[data-fan="why"]', why, { at, dur: 0 });
        if (beat) step.tween('.p2-fan__k', { scale: [1.25, 1] }, { at, dur: DUR.enter });
      };
      // A dot is red (follows) unless the class says that its ending resists.
      const resists = (step, key, on, at) => step.cls(dot(key), 'is-resist', { at, on });

      // Entrance: the cut trace once more, and beyond the cut its own ending: one path, to
      // the hinted answer.
      const enter = ctx.step({ label: 'one prefix, one ending so far' });
      util.range(FAN.k).forEach((i) => resists(enter, i, !FAN.follows[i], 0));
      enter.show('.p2-fan__term', { at: 200 });
      enter.tween('[data-path="own"]', { '--p2-own-w': [4, 4] }, { dur: 0 });
      const ownEnd = draw(enter, 'own', 800, DUR.move);
      name(enter, 'own', ownEnd);
      kit.say(enter, 'open', [400]);
      enter.hold(DUR.enter);

      // Click 1: a continuation. From the same cut a second path leaves and ends elsewhere;
      // then a third, at the hinted answer again.
      const again = ctx.step({ label: 'a continuation' });
      const secondEnd = draw(again, first.resists, 500);
      name(again, 'first-resists', secondEnd);
      const thirdEnd = draw(again, first.follows, secondEnd + DUR.move);
      name(again, 'first-follows', thirdEnd);
      kit.say(again, 'continuation', [200], { leaves: 'open' });
      again.hold(DUR.enter);

      // Click 2, the strong picture of the part: one prefix, K futures. The two chips give
      // way to their dots, the other paths fan out in a seeded order, and the readout counts
      // with them: the share of the paths drawn so far, which settles as they land.
      const fan = ctx.step({ label: 'K continuations and their share' });
      fan.tween(`${end('first-resists')}, ${end('first-follows')}`, { opacity: [1, 0] }, { dur: DUR.micro });
      fan.tween('.p2-fan__k, .p2-fan__share, [data-brace="all"]', { opacity: [0, 1] }, { at: DUR.micro, dur: DUR.enter });
      count(fan, 0, 1, 2);
      because(fan, 0, WHY_K.all, false);
      fan.tween('.p2-fan__k', { scale: [1, 1] }, { dur: 0 });
      const fanned = FAN.order.reduce((red, i, n) => {
        const landed = draw(fan, i, 700 + n * FAN_AT.perLane, 450);
        const now = red + (FAN.follows[i] ? 1 : 0);
        count(fan, landed, now, n + 3);
        return now;
      }, 1);
      if (fanned !== FAN.follow) throw Deck.fail(`part 2: the fan ends ${fanned} paths at the hinted answer, not ${FAN.follow}`);
      kit.say(fan, 'k', [200], { leaves: 'continuation' });
      fan.hold(DUR.move);

      // Click 3: the share is a score. The endings leave the fan for a bar of one cell per
      // continuation, those at the hinted answer first: each slides down the ends of the
      // lanes to the height of the bar and then into its cell, so that none crosses the
      // readout over the bar. The bar is named "this prefix"; under it arrive the shares of
      // other prefixes, and the line that says what the reference is: the AUROC of all these
      // shares. "The reference" is the one name the slides give it: the cue of this click
      // adds the paper's name once, in brackets ("resampling AUROC", which Part 3's chart
      // prints on its axis), and the caption says what kind of thing it is in the word that
      // the result on K ends on: a ruler, not a ceiling. No reader's score stands beside
      // the bar: one prefix's share and one score of a reader are not what the reference
      // compares.
      const scored = ctx.step({ label: 'the share is a score too' });
      const sorted = [...util.range(FAN.k).filter((i) => FAN.follows[i]), ...util.range(FAN.k).filter((i) => !FAN.follows[i])];
      const flight = DUR.move;
      scored.tween('.p2-fan__all', { opacity: [1, 0.45] }, { at: DUR.micro, dur: DUR.enter });
      scored.tween('[data-cells="all"]', { opacity: [0, 1] }, { at: DUR.micro, dur: DUR.enter });
      sorted.forEach((i, j) => {
        const at = 600 + j * 60;
        const to = { x: FAN_AT.bar.left + j * FAN_AT.bar.pitch + FAN_AT.bar.cell / 2, y: FAN_AT.bar.top + FAN_AT.bar.height / 2 };
        scored.tween(`[data-ghost="${i}"]`, { opacity: [0, 1] }, { at, dur: 80 });
        scored.tween(`[data-ghost="${i}"]`, { y: [0, to.y - laneY(i)] }, { at, dur: flight / 2, ease: 'inOut' });
        scored.tween(`[data-ghost="${i}"]`, { x: [0, to.x - FAN_AT.ex] }, { at: at + flight / 2, dur: flight / 2, ease: 'inOut' });
        scored.tween(`[data-ghost="${i}"]`, { opacity: [1, 0] }, { at: at + flight, dur: DUR.micro });
        if (FAN.follows[i]) scored.cls(`[data-cells="all"] [data-cell="${j}"]`, 'is-on', { at: at + flight });
      });
      const folded = 600 + (FAN.k - 1) * 60 + flight + DUR.micro;
      const others = folded + DUR.enter;
      const named = others + OTHER_PREFIXES.length * 200 + DUR.enter;
      scored.tween('.p2-fan__ref', { opacity: [0, 1] }, { at: folded, dur: DUR.enter });
      scored.tween('.p2-fan__row', { opacity: [0, 1], x: [-16, 0] }, { at: others, dur: DUR.enter, stagger: 200 });
      scored.tween('.p2-fan__others span', { opacity: [0, 1] }, { at: others, dur: DUR.enter });
      scored.tween('.p2-fan__auroc', { opacity: [0, 1] }, { at: named, dur: DUR.enter });
      kit.say(scored, 'reference', [200, named], { leaves: 'k' });
      scored.hold(DUR.enter);

      // Click 4: few continuations. Only the first two paths stay, the bracket closes around
      // their two lanes, and the bar has two cells; the shares of the other prefixes and the
      // line under them leave. The two are drawn again and again: both at the hinted answer,
      // neither, one of the two. The share can take three values and no other.
      const coarse = ctx.step({ label: 'few continuations: a coarse reference' });
      const halves = (step, at, red) => util.range(FAN.small).forEach((j) => step.cls(`[data-half="${j}"]`, 'is-on', { at, on: j < red }));
      // A path that is drawn again: its dot leaves before the path starts over, and lands
      // again, in the color of the new ending, when the path arrives.
      const redraw = (step, at, ends) => {
        const shown = at + 350;
        [first.follows, first.resists].forEach((key, n) => {
          step.tween(dot(key), { 'attr:r': [FAN_AT.r, 0] }, { at: at - DUR.micro, dur: DUR.micro, ease: 'in' });
          draw(step, key, at, 350);
          resists(step, key, !ends[n], shown);
        });
        const red = ends.filter(Boolean).length;
        count(step, shown, red, FAN.small);
        halves(step, shown, red);
      };
      coarse.tween('.p2-fan__all', { opacity: [0.45, 1] }, { dur: DUR.enter });
      coarse.tween('.p2-fan__others, .p2-fan__auroc', { opacity: [1, 0] }, { dur: DUR.micro });
      coarse.tween(FAN.others.map((i) => ctx.q(lane(i))), { opacity: [1, 0] }, { dur: DUR.enter });
      coarse.tween('[data-brace="all"]', { opacity: [1, 0] }, { dur: DUR.enter });
      coarse.tween('[data-brace="small"]', { opacity: [0, 1] }, { at: DUR.micro, dur: DUR.enter });
      coarse.tween('[data-cells="all"]', { opacity: [1, 0] }, { at: DUR.micro, dur: DUR.micro });
      coarse.tween('[data-cells="small"]', { opacity: [0, 1] }, { at: DUR.enter, dur: DUR.micro });
      count(coarse, DUR.enter, 1, FAN.small);
      because(coarse, DUR.enter, WHY_K.small);
      // Of the two that stay, one ends at the hinted answer: one cell of the two is on.
      coarse.cls('[data-half="0"]', 'is-on', { at: DUR.enter });
      redraw(coarse, 1400, [true, true]);
      redraw(coarse, 2400, [false, false]);
      redraw(coarse, 3400, [true, false]);
      kit.say(coarse, 'coarse', [200], { leaves: 'reference' });
      coarse.hold(DUR.move);

      // Click 5: a second label, and why: the reference is built from continuations, so the
      // label that goes with it is a continuation's ending; the trace's own ending is not one
      // ('p2.own_not_a_draw', 'p2.heldout_is_a_draw', 'p2.heldout_same_kind'). Three beats,
      // and the picture carries each. First the label so far: the trace's own ending, the
      // solid line, lands a beat, and the key under the prefix says where it comes from
      // (written before the cut was placed). Then what the reference is built from: all K
      // continuations leave the cut again, at once and alike, where click 2 drew them one by
      // one; the key names their kind (sampled after the cut), and the readout is back at
      // K = 16. Then one of them, the one that resisted, is taken out of the bundle to a
      // lane of its own under the trace's own ending: still dashed, the line of a label now.
      // Its ending is the second label, the share comes from the others, and the caption
      // says what that buys: label and reference are the same kind, so the reference is a
      // fair ruler; no slide says more than that. How the cut depends on the length of the
      // trace's own ending ('p2.cut_looks_ahead') is not on the slide. The question the
      // slide ends on stands under K, which it is about.
      const second = ctx.step({ label: 'a second label' });
      const held = first.resists;
      const beat = { own: DUR.enter, sweep: 1000 };
      const landed = beat.sweep + FAN_AT.draw;
      const picked = landed + DUR.enter;
      const lifted = picked + DUR.micro;
      const pulled = lifted + DUR.move;
      const said = pulled + FAN_AT.draw;
      // The label so far.
      second.tween('[data-origin="own"]', { opacity: [0, 1] }, { at: beat.own, dur: DUR.enter });
      second.tween('[data-path="own"]', { '--p2-own-w': [9, 4] }, { at: beat.own, dur: DUR.enter });
      second.tween(`${end('own')} .dk-flag`, { scale: [1.12, 1] }, { at: beat.own, dur: DUR.enter });
      // What the reference is built from: every continuation, from the cut, alike.
      second.tween('.p2-fan__but', { opacity: [0, 1] }, { at: beat.sweep, dur: DUR.enter });
      second.tween('[data-origin="again"]', { opacity: [0, 1] }, { at: beat.sweep, dur: DUR.enter });
      second.tween(FAN.others.map((i) => ctx.q(lane(i))), { opacity: [0, 1] }, { at: beat.sweep, dur: 0 });
      util.range(FAN.k).forEach((i) => {
        second.tween(dot(i), { 'attr:r': [FAN_AT.r, 0] }, { at: beat.sweep - DUR.micro, dur: DUR.micro, ease: 'in' });
        draw(second, i, beat.sweep, FAN_AT.draw);
      });
      second.tween('[data-brace="small"]', { opacity: [1, 0] }, { at: beat.sweep, dur: DUR.micro });
      second.tween('[data-brace="all"]', { opacity: [0, 1] }, { at: landed, dur: DUR.enter });
      second.tween('[data-cells="small"]', { opacity: [1, 0] }, { at: landed, dur: DUR.micro });
      second.tween('[data-cells="all"]', { opacity: [0, 1] }, { at: landed + DUR.micro, dur: DUR.micro });
      count(second, landed, FAN.follow, FAN.k);
      because(second, landed, WHY_K.all, false);
      // One of them is taken out: its ending is the label, the others make the share.
      const path = ctx.q(`[data-path="${held}"]`);
      second.tween(dot(held), { 'attr:r': [FAN_AT.r * 1.8, FAN_AT.r] }, { at: picked, dur: DUR.enter });
      second.cls(path, 'is-label', { at: picked });
      second.fn((p) => path.setAttribute('d', fanPath(util.lerp(laneY(held), FAN_AT.held, p).toFixed(1))), { at: lifted, dur: DUR.move, ease: 'inOut' });
      second.tween(dot(held), { 'attr:cy': [laneY(held), FAN_AT.held] }, { at: lifted, dur: DUR.move, ease: 'inOut' });
      name(second, 'held', pulled);
      second.tween(`[data-cells="all"] [data-cell="${FAN.k - 1}"]`, { opacity: [1, 0] }, { at: pulled, dur: DUR.micro });
      count(second, pulled, FAN.follow, FAN.k - 1);
      because(second, pulled, WHY_K.others);
      second.tween('.p2-fan__ask', { opacity: [0, 1] }, { at: said + DUR.move, dur: DUR.enter });
      kit.say(second, 'second', [DUR.micro, said], { leaves: 'coarse' });
      second.hold(DUR.enter);
    },
  });

  // ---------------------------------------------------------------- slide 9: the bootstrap interval
  // The score of the slide is one reader's within-question AUROC, and is printed with that
  // reader's name as the charts of Part 3 print it ('reader.opus_ap.name'): the frontier
  // model gives two readers, one per prompt, and this is the one under AP.
  const SCORE = Deck.fact('test.interval_opus_ap');
  if (SCORE.value !== v('reader.opus_ap.within')) throw Deck.fail('part 2: the score of the slide on intervals is not the within-question AUROC of reader.opus_ap');
  const SCORE_NAME = t('reader.opus_ap.name');
  // One of the 15 differences, with the larger reader first: the registered pair is the
  // smaller reader minus the larger one, so its sign and its interval are turned around.
  // The difference is computed before the two scores are rounded ('p2.unrounded_opus_ap',
  // 'p2.unrounded_qwen8'): to three decimals it is not the difference of the two scores as
  // the charts print them, and the slide says so under it.
  const DIFF = (() => {
    const pair = v('test.pairs').find((p) => p.a === 'qwen8' && p.b === 'opus_ap');
    if (!pair) throw Deck.fail('part 2: the pair qwen8 - opus_ap is not among the facts of test.pairs');
    const unrounded = v('p2.unrounded_opus_ap') - v('p2.unrounded_qwen8');
    if (unrounded.toFixed(3) !== (-pair.d).toFixed(3)) throw Deck.fail(`part 2: the two scores before rounding differ by ${unrounded.toFixed(4)}, the registered difference is ${(-pair.d).toFixed(3)}`);
    if (v('p2.unrounded_opus_ap').toFixed(3) !== SCORE.text) throw Deck.fail('part 2: the score before rounding is not the score of the slide');
    return Object.freeze({ d: -pair.d, lo: -pair.hi, hi: -pair.lo });
  })();

  // The standard normal quantile (Acklam's rational approximation).
  const NORMAL = Object.freeze({
    a: [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00],
    b: [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01],
    c: [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00],
    d: [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00],
    edge: 0.02425,
  });
  const quantile = (p) => {
    const { a, b, c, d, edge } = NORMAL;
    const tail = (q) => (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    if (p < edge) return tail(Math.sqrt(-2 * Math.log(p)));
    if (p > 1 - edge) return -tail(Math.sqrt(-2 * Math.log(1 - p)));
    const q = p - 0.5;
    const r = q * q;
    return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  };

  // The picture of a bootstrap (parts/part2.css): the questions as a row of tiles, under
  // each the copies of it that a draw holds, and an axis on which a recomputed score lands
  // as a dot. Only three numbers of a pile are data, its center and the two ends of its
  // interval; the pile itself is a drawing of the method: `dots` dots at the quantiles of a
  // bell whose outer 2.5% lie beyond those two ends, in columns `bin` wide. Both axes have
  // the same scale. A tile holds its question's traces as six dots, a made-up mix.
  const BOOT = Object.freeze({
    questions: v('task.sample_questions'), pitch: 44, rowTop: 36, copyTop: 88, copyPitch: 48, levels: 3,
    axisY: 440, dropFrom: 236, perUnit: 7300, dots: 240, r: 5.5, bin: 13, draws: 6, traces: 6,
    one: Object.freeze({ width: 876, center: 438 }),
    diff: Object.freeze({ width: 784, zero: 219 }),
  });
  const TAIL = (1 - v('test.interval_level') / 100) / 2;
  const pileOf = ({ center, lo, hi, at, seed }) => {
    const z95 = -quantile(TAIL);
    const sd = { lo: (center - lo) / z95, hi: (hi - center) / z95 };
    const draws = util.range(BOOT.dots).map((i) => {
      const share = (i + 0.5) / BOOT.dots;
      const z = quantile(share);
      return { tail: share < TAIL || share > 1 - TAIL, bin: Math.round((z * (z < 0 ? sd.lo : sd.hi) * BOOT.perUnit) / BOOT.bin) };
    });
    // In the order in which they drop: a dot lands on those of its column that are there.
    return Object.freeze(util.shuffled(draws, seed).reduce((done, draw) => [...done, Object.freeze({
      ...draw, x: at + draw.bin * BOOT.bin, y: BOOT.axisY - BOOT.r - 2 - done.filter((d) => d.bin === draw.bin).length * BOOT.bin,
    })], []));
  };
  const SCORE_PILE = pileOf({ center: SCORE.value, lo: SCORE.interval[0], hi: SCORE.interval[1], at: BOOT.one.center, seed: 17 });
  const DIFF_AT = Object.freeze({
    zero: BOOT.diff.zero, d: BOOT.diff.zero + DIFF.d * BOOT.perUnit, lo: BOOT.diff.zero + DIFF.lo * BOOT.perUnit, hi: BOOT.diff.zero + DIFF.hi * BOOT.perUnit,
  });
  const SCORE_AT = Object.freeze({
    d: BOOT.one.center, lo: BOOT.one.center + (SCORE.interval[0] - SCORE.value) * BOOT.perUnit, hi: BOOT.one.center + (SCORE.interval[1] - SCORE.value) * BOOT.perUnit,
  });
  const DIFF_PILE = pileOf({ center: DIFF.d, lo: DIFF.lo, hi: DIFF.hi, at: DIFF_AT.d, seed: 23 });
  // The draws that the picture shows: each is 20 questions drawn with repeats (seeded; a
  // draw that would stack a question higher than the picture has room for is drawn again).
  const DRAWS = (() => {
    const next = util.rng(29);
    const one = () => util.range(BOOT.questions).map(() => Math.floor(next() * BOOT.questions));
    const fits = (draw) => util.range(BOOT.questions).every((q) => draw.filter((x) => x === q).length <= BOOT.levels);
    const drawOne = () => { const draw = one(); return fits(draw) ? draw : drawOne(); };
    return Object.freeze(util.range(BOOT.draws).map(() => Object.freeze(drawOne())));
  })();
  const timesDrawn = (draw, q) => draw.filter((x) => x === q).length;
  const MIXES = (() => {
    const next = util.rng(31);
    return Object.freeze(util.range(BOOT.questions).map(() => 1 + Math.floor(next() * (BOOT.traces - 1))));
  })();
  const tileDots = (q) => util.range(BOOT.traces).map((i) => `<i${i < MIXES[q] ? ' class="is-follows"' : ''}></i>`).join('');
  const pileHtml = (pile, name) => pile.map((dot, k) => `<circle class="p2-boot__draw" data-${name}="${k}" cx="${dot.x}" cy="${dot.y}" r="${BOOT.r}"/>`).join('');
  const spanHtml = (name, at) => `
    <line class="p2-boot__guide" data-guide="${name}" x1="${at.lo}" y1="${BOOT.dropFrom + 16}" x2="${at.lo}" y2="${BOOT.axisY + 14}"/>
    <line class="p2-boot__guide" data-guide="${name}" x1="${at.hi}" y1="${BOOT.dropFrom + 16}" x2="${at.hi}" y2="${BOOT.axisY + 14}"/>
    <rect class="p2-boot__span" data-span="${name}" x="${at.lo}" y="${BOOT.axisY + 4}" width="${at.hi - at.lo}" height="8" rx="4"/>`;
  // Two bells that stand side by side and then merge: the two readers' piles on the way to
  // the pile of their difference. Each is a sketch of that reader's recomputed scores, like
  // the pile at the left; one line under the two says so, and that both readers are
  // recomputed on the same draws of the questions ('p2.diff_same_draws'). The two have no
  // common axis and no numbers (only the first reader's pile is drawn from data, at the left).
  const BELL = Object.freeze({ sd: 48, height: 88, base: 152, points: 25, one: 170, minus: 392, other: 614 });
  const bellPath = (cx) => {
    const points = util.range(BELL.points).map((i) => {
      const z = -2.6 + (5.2 * i) / (BELL.points - 1);
      return `${(cx + z * BELL.sd).toFixed(1)} ${(BELL.base - BELL.height * Math.exp(-(z * z) / 2)).toFixed(1)}`;
    });
    return `M${points.join(' L')} Z`;
  };
  const bellHtml = (key, role) => `<path class="p2-boot__bell${key === 'other' ? ' p2-boot__bell--other' : ''}" data-${role}="${key}" d="${bellPath(BELL[key])}"/>`;
  const nameHtml = (key, text) => `<span data-name="${key}" style="left:${BELL[key]}px">${text}</span>`;
  const numHtml = (key, x, text, extra = '') => `<div class="p2-boot__num${extra}" data-num="${key}" style="left:${x.toFixed(1)}px">${text}</div>`;

  Deck.register({
    id: 'p2-interval',
    part: PART,
    kicker: KICK,
    title: 'A bootstrap interval shows how far a score could move with other questions',
    cues: [
      { text: `Resample the questions, recompute, repeat ${t('test.replicates')} times`, step: 1 },
      { text: `${t('test.interval_level')} interval: the middle ${t('test.interval_level')} of the recomputed scores`, step: 2 },
      { text: 'Resolved: a difference whose interval excludes zero', step: 3 },
    ],
    cite: [{ src: 'paper', where: 'Sec. 1, 4; Table 2-3' }],
    figure: 'schematic',
    numbers: 'reported',
    html: `
      <div class="p2-box p2-boot">
        <div class="p2-boot__one">
          <div class="p2-boot__rowname" data-row="have">The ${t('task.sample_questions')} questions</div>
          <div class="p2-boot__rowname" data-row="draw">↓ drawn again, with repeats</div>
          ${util.range(BOOT.questions).map((q) => `<span class="p2-boot__tile" data-tile="${q}" style="left:${q * BOOT.pitch}px; top:${BOOT.rowTop}px">${tileDots(q)}</span>`).join('')}
          ${util.range(BOOT.questions).flatMap((q) => util.range(BOOT.levels).map((level) => `<span class="p2-boot__tile p2-boot__copy" data-copy="${q}-${level}" style="left:${q * BOOT.pitch}px; top:${BOOT.copyTop + level * BOOT.copyPitch}px">${tileDots(q)}</span>`)).join('')}
          <svg class="p2-boot__art" viewBox="0 0 ${BOOT.one.width} ${PIC.height}" width="${BOOT.one.width}" height="${PIC.height}" aria-hidden="true">
            <line class="p2-boot__from" x1="${BOOT.one.center}" y1="${BOOT.copyTop}" x2="${BOOT.one.center}" y2="${BOOT.axisY - 16}"/>
            ${pileHtml(SCORE_PILE, 'draw')}
            <line class="p2-boot__axis" x1="0" y1="${BOOT.axisY}" x2="${BOOT.one.width}" y2="${BOOT.axisY}"/>
            ${spanHtml('one', SCORE_AT)}
            <circle class="p2-boot__score" cx="${BOOT.one.center}" cy="${BOOT.axisY}" r="10"/>
          </svg>
          <div class="p2-boot__what">${SCORE_NAME} · within-question AUROC</div>
          ${numHtml('one-lo', SCORE_AT.lo, SCORE.interval[0].toFixed(3))}
          ${numHtml('one-d', SCORE_AT.d, SCORE.text, ' p2-boot__num--main')}
          ${numHtml('one-hi', SCORE_AT.hi, SCORE.interval[1].toFixed(3))}
        </div>
        <div class="p2-boot__diff">
          <div class="p2-boot__names">${nameHtml('one', SCORE_NAME)}${nameHtml('minus', 'minus')}${nameHtml('other', t('reader.qwen8.name'))}</div>
          <div class="p2-boot__piles">both recomputed on the same redrawn questions</div>
          <div class="p2-boot__verdict">${kit.flag({ key: 'resolved', text: 'not resolved' })}</div>
          <svg class="p2-boot__art" viewBox="0 0 ${BOOT.diff.width} ${PIC.height}" width="${BOOT.diff.width}" height="${PIC.height}" aria-hidden="true">
            ${bellHtml('one', 'bell')}${bellHtml('other', 'bell')}
            ${bellHtml('one', 'ghost')}${bellHtml('other', 'ghost')}
            ${pileHtml(DIFF_PILE, 'gap')}
            <line class="p2-boot__axis" x1="0" y1="${BOOT.axisY}" x2="${BOOT.diff.width}" y2="${BOOT.axisY}"/>
            <line class="p2-boot__zero" x1="${DIFF_AT.zero}" y1="${BOOT.dropFrom + 8}" x2="${DIFF_AT.zero}" y2="${BOOT.axisY + 14}"/>
            ${spanHtml('diff', DIFF_AT)}
          </svg>
          ${numHtml('zero', DIFF_AT.zero, '0', ' p2-boot__num--zero')}
          ${numHtml('diff-lo', DIFF_AT.lo, signed(DIFF.lo))}
          ${numHtml('diff-d', DIFF_AT.d, signed(DIFF.d), ' p2-boot__num--main')}
          ${numHtml('diff-hi', DIFF_AT.hi, signed(DIFF.hi))}
          <div class="p2-boot__unrounded" style="left:${DIFF_AT.d.toFixed(1)}px">computed before rounding</div>
        </div>
        ${kit.says({
    one: [`This score rests on the scored sample: ${t('task.sample_questions')} questions per model. Others would give another number.`],
    boot: ['<b>Bootstrap:</b> draw whole questions again and recompute the score.'],
    diff: [
      'A difference between readers gets its interval the same way.',
      'This one contains zero.',
    ],
  })}
      </div>`,
    setup: (ctx) => {
      const tile = (q) => `[data-tile="${q}"]`;
      const copy = (q, level) => `[data-copy="${q}-${level}"]`;
      const DOT = 0.8;
      // A recomputed score drops from the draw onto its column of the pile.
      const drop = (step, name, k, pile, at, dur) => {
        step.tween(`[data-${name}="${k}"]`, { opacity: [0, DOT] }, { at, dur: 80 });
        step.tween(`[data-${name}="${k}"]`, { 'attr:cy': [BOOT.dropFrom, pile[k].y] }, { at, dur, ease: 'in' });
      };
      // The outer 2.5% on each side fade, a bar spans the rest, and its ends get their numbers.
      const span = (step, name, pileName, pile, at, numbers, anchor) => {
        const tails = pile.map((dot, k) => (dot.tail ? ctx.q(`[data-${pileName}="${k}"]`) : null)).filter(Boolean);
        step.tween(tails, { opacity: [DOT, 0.15] }, { at, dur: DUR.enter });
        step.tween(`[data-guide="${name}"]`, { opacity: [0, 1] }, { at: at + DUR.micro, dur: DUR.enter });
        step.tween(`[data-span="${name}"]`, { 'attr:x': [anchor.d, anchor.lo], 'attr:width': [0, anchor.hi - anchor.lo] }, { at: at + DUR.micro, dur: DUR.move, ease: 'inOut' });
        step.tween(`[data-span="${name}"]`, { opacity: [0, 1] }, { at: at + DUR.micro, dur: DUR.micro });
        step.tween(numbers, { opacity: [0, 1] }, { at: at + DUR.micro + DUR.move, dur: DUR.enter });
      };

      // Entrance: one score on its axis, and over it the questions it was computed from.
      // The block stands mid-stage until the difference arrives beside it.
      const enter = ctx.step({ label: 'one score, from 20 questions per model' });
      enter.tween(ctx.qa('.p2-boot__copy'), { opacity: [0, 0] }, { dur: 0 });
      enter.show('[data-row="have"]', { at: 200, rise: 0 });
      enter.tween(ctx.qa('.p2-boot__one > [data-tile]'), { opacity: [0, 1] }, { at: 300, dur: DUR.micro, stagger: 25 });
      enter.tween('.p2-boot__one .p2-boot__axis, .p2-boot__from', { opacity: [0, 1] }, { at: 900, dur: DUR.enter });
      enter.tween('.p2-boot__score', { 'attr:r': [0, 10] }, { at: 1300, dur: DUR.enter, ease: 'back' });
      enter.tween('[data-num="one-d"], .p2-boot__what', { opacity: [0, 1] }, { at: 1400, dur: DUR.enter });
      kit.say(enter, 'one', [400]);
      enter.hold(DUR.enter);

      // Click 1: the bootstrap. The first draw is made tile by tile: a copy drops under the
      // question it was drawn from, some questions twice or more and some not at all (those
      // dim), and the recomputed score lands on the axis. A second draw, then the draws
      // speed up and the scores pile up.
      const boot = ctx.step({ label: 'the bootstrap' });
      const firstAt = 500;
      const perCopy = 55;
      const drawn = firstAt + BOOT.questions * perCopy + DUR.enter;
      // When each later draw replaces the one before: slower at first, then faster.
      const drawAt = [drawn, drawn + 900, drawn + 1500, drawn + 1750, drawn + 2000, drawn + 2250];
      boot.tween('.p2-boot__from', { opacity: [1, 0] }, { dur: DUR.micro });
      boot.tween('[data-row="draw"]', { opacity: [0, 1] }, { at: DUR.micro, dur: DUR.enter });
      DRAWS[0].forEach((q, n) => {
        const level = DRAWS[0].slice(0, n).filter((x) => x === q).length;
        const at = firstAt + n * perCopy;
        boot.tween(copy(q, level), { opacity: [0, 1] }, { at, dur: 100 });
        boot.tween(copy(q, level), { y: [BOOT.rowTop - (BOOT.copyTop + level * BOOT.copyPitch), 0] }, { at, dur: 350 });
      });
      util.range(BOOT.questions).forEach((q) => DRAWS.forEach((draw, d) => {
        const now = timesDrawn(draw, q);
        const before = d === 0 ? null : timesDrawn(DRAWS[d - 1], q);
        if (d > 0) {
          util.range(BOOT.levels).filter((level) => (level < now) !== (level < before))
            .forEach((level) => boot.tween(copy(q, level), { opacity: level < now ? [0, 1] : [1, 0] }, { at: drawAt[d], dur: 120 }));
        }
        if ((now === 0) !== (before === null ? false : before === 0)) boot.cls(tile(q), 'is-out', { at: drawAt[d], on: now === 0 });
      }));
      DRAWS.forEach((_, d) => drop(boot, 'draw', d, SCORE_PILE, drawAt[d] + DUR.micro, d < 2 ? 450 : 300));
      const rainAt = drawAt[2];
      const rest = SCORE_PILE.length - DRAWS.length;
      util.range(rest).forEach((n) => drop(boot, 'draw', DRAWS.length + n, SCORE_PILE, rainAt + Math.round(2200 * ((n + 1) / rest) ** 0.6), 300));
      kit.say(boot, 'boot', [200], { leaves: 'one' });
      boot.hold(DUR.move);

      // Click 2: the interval of the pile. The cue of this click says what it is; the
      // caption of the bootstrap stays.
      const interval = ctx.step({ label: 'the 95% interval' });
      span(interval, 'one', 'draw', SCORE_PILE, 300, '[data-num="one-lo"], [data-num="one-hi"]', SCORE_AT);
      interval.hold(DUR.enter);

      // Click 3: a difference. The block makes room; beside it two piles, one per reader,
      // merge into the pile of their difference around a zero line, and its interval is
      // drawn the same way: it crosses the line.
      const diff = ctx.step({ label: 'a difference has an interval too' });
      const merged = 1900;
      const piled = merged + 1500;
      diff.tween('.p2-boot__one', { x: [(PIC.width - BOOT.one.width) / 2, 0] }, { dur: DUR.move, ease: 'inOut' });
      ['one', 'other'].forEach((key, i) => {
        diff.tween(`[data-bell="${key}"], [data-name="${key}"]`, { opacity: [0, 1] }, { at: 600 + i * 500, dur: DUR.enter });
        diff.tween(`[data-ghost="${key}"]`, { opacity: [0, 0.8] }, { at: merged - DUR.micro, dur: DUR.micro });
        diff.tween(`[data-ghost="${key}"]`, { x: [0, DIFF_AT.d - BELL[key]], y: [0, BOOT.axisY - BELL.base] }, { at: merged, dur: DUR.move, ease: 'inOut' });
        diff.tween(`[data-ghost="${key}"]`, { opacity: [0.8, 0] }, { at: merged + DUR.enter, dur: DUR.move });
      });
      diff.tween('[data-name="minus"]', { opacity: [0, 1] }, { at: 600 + 250, dur: DUR.enter });
      diff.tween('.p2-boot__piles', { opacity: [0, 1] }, { at: 600 + 500 + DUR.micro, dur: DUR.enter });
      diff.tween('.p2-boot__diff .p2-boot__axis', { opacity: [0, 1] }, { at: merged - DUR.enter, dur: DUR.enter });
      DIFF_PILE.forEach((_, k) => drop(diff, 'gap', k, DIFF_PILE, merged + DUR.enter + Math.round(1100 * ((k + 1) / DIFF_PILE.length) ** 0.7), 300));
      diff.tween('.p2-boot__zero, [data-num="zero"]', { opacity: [0, 1] }, { at: piled, dur: DUR.enter });
      span(diff, 'diff', 'gap', DIFF_PILE, piled + DUR.enter, '[data-num="diff-lo"], [data-num="diff-d"], [data-num="diff-hi"], .p2-boot__unrounded', DIFF_AT);
      const judged = piled + DUR.enter + DUR.micro + DUR.move + DUR.enter;
      diff.tween('[data-flag="resolved"]', { opacity: [0, 1], scale: [1.6, 1] }, { at: judged, dur: DUR.enter });
      kit.say(diff, 'diff', [200, judged], { leaves: 'boot' });
      diff.hold(DUR.enter);
    },
  });
})();
