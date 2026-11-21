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
  // A reader's score for one prefix is a probability and is printed as a percentage; an
  // AUROC keeps its decimals. So the made-up score of one prefix (0.81) cannot be taken for
  // one of the measured AUROCs, which lie near it (0.803 to 0.844).
  const percent = (n) => `${Math.round(n * 100)}%`;

  // ---------------------------------------------------------------- facts of this part
  // Facts that only Part 2 needs, each with the file, the lines and the words of the paper's
  // v2 TeX it was read in (the snapshot sources/paper-v2-tex/; the form of `file` is that of
  // shared/facts.js, `final-project/paper/tmlr/<file>:N-M: "words"`, and tools/selftest.mjs
  // looks every quotation up in those lines). A `text` is the paper's wording with its
  // symbols left out; the slides say it in the deck's words and print only the numbers and
  // the names.
  const TEX = 'final-project/paper/tmlr/';
  const at = (place, quote) => `${TEX}${place}: "${quote}"`;
  const paper = (where, cites, rest) => Object.freeze({ src: 'paper', where, file: [].concat(cites).join('; '), ...rest });

  // Slide 6: what a reader is, the two labels and what each asks, and the nine readers in
  // three kinds (where the prefix is cut is the shared fact 'task.cut_r'). The counts 3, 2
  // and 4 are the paper's readers (1) to (3), (4, 5) and (6) to (9); the names are printed
  // as the paper prints them. Who is made to answer in each forced reader, and what the two
  // prompts of the frontier readers ask (AP, IN), are facts of the same reading.
  Deck.addFacts({
    'p2.reader_def': paper('Sec. 1', at('sections_v2/01_intro.tex:27', 'A \\emph{reader} maps a prefix to a continuous score or a binary verdict.'), { text: 'A reader maps a prefix to a continuous score or a binary verdict' }),
    'p2.label_def': paper('Sec. 1', at('sections_v2/01_intro.tex:23-24', 'a trace \\emph{follows} the hint if it ends at that answer and \\emph{resists} it otherwise'), { text: 'a trace follows the hint if it ends at that answer and resists it otherwise' }),
    'p2.two_labels': paper('Sec. 3', at('sections_v2/03_labels.tex:4', 'We use two labels, and they answer two different questions.'), { value: 2, text: 'We use two labels, and they answer two different questions.' }),
    'p2.label_own': paper('Sec. 3', at('sections_v2/03_labels.tex:6-7', 'The first label is the trace\'s own outcome: does this trace end at the hinted answer? A monitor scored against it predicts the fate of one run.'), {
      text: 'The first label is the trace’s own outcome: does this trace end at the hinted answer? A monitor scored against it predicts the fate of one run.',
    }),
    'p2.label_held': paper('Sec. 3', at('sections_v2/03_labels.tex:7-8', 'The second label is the outcome $L$ of a held-out continuation drawn from the same prefix: has the model committed by this prefix?'), {
      text: 'The second label is the outcome of a held-out continuation drawn from the same prefix: has the model committed by this prefix?',
    }),
    'p2.label_held_asks': paper('Sec. 3', at('sections_v2/03_labels.tex:8-9', 'scored against it predicts what the model tends to do from here, not what this particular run did'), {
      text: 'predicts what the model tends to do from here, not what this particular run did',
    }),
    'p2.same_prefixes': paper('Sec. 2.2', at('sections_v2/02_setup.tex:36', 'All readers read the same prefixes'), { text: 'All readers read the same prefixes' }),
    'p2.kind_forced': paper('Sec. 2.2, readers (1) to (3)', [at('sections_v2/02_setup.tex:37', '(1)~the \\emph{forced answer}'), at('sections_v2/02_setup.tex:40', '(3)~\\emph{Qwen3-32B forced} to answer on the subject\'s prefix')], { value: 3, text: '3' }),
    'p2.kind_open': paper('Sec. 2.2, readers (4, 5)', at('sections_v2/02_setup.tex:41', '(4, 5)~the open monitors \\emph{Qwen3-8B} and \\emph{Qwen3-32B}'), { value: 2, text: '2' }),
    'p2.kind_frontier': paper('Sec. 2.2, readers (6) to (9)', at('sections_v2/02_setup.tex:44', '(6--9)~\\emph{Claude Opus 5.5} and \\emph{GPT-6 Astra}'), { value: 4, text: '4' }),
    'p2.open_names': paper('Sec. 2.2', at('sections_v2/02_setup.tex:41', 'the open monitors \\emph{Qwen3-8B} and \\emph{Qwen3-32B}'), { text: 'Qwen3-8B and Qwen3-32B' }),
    'p2.frontier_names': paper('Sec. 2.2', at('sections_v2/02_setup.tex:44', '(6--9)~\\emph{Claude Opus 5.5} and \\emph{GPT-6 Astra}'), { text: 'Claude Opus 5.5 and GPT-6 Astra' }),
    'p2.frontier_prompts': paper('Sec. 2.2', at('sections_v2/02_setup.tex:44-45', 'each asked for a number under two prompts'), { value: 2, text: 'two prompts' }),
    'p2.forced_subject': paper('Sec. 2.2, reader (1)', at('sections_v2/02_setup.tex:37-38', 'the \\emph{forced answer}: the subject model gets its prompt, the prefix, its end-of-thinking marker and an answer stub, and the score is its probability of X over the four letters'), {
      text: 'the forced answer: the subject model gets its prompt, the prefix, its end-of-thinking marker and an answer stub, and the score is its probability of X over the four letters',
    }),
    'p2.forced_nohint': paper('Sec. 2.2, reader (2)', at('sections_v2/02_setup.tex:39', 'answer \\emph{with the hint removed} from the prompt'), { text: 'the forced answer with the hint removed from the prompt' }),
    'p2.forced_other': paper('Sec. 2.2, reader (3)', at('sections_v2/02_setup.tex:40', '\\emph{Qwen3-32B forced} to answer on the subject\'s prefix'), { text: 'Qwen3-32B forced to answer on the subject’s prefix' }),
    'p2.prompt_ap': paper('Sec. 2.2', at('sections_v2/02_setup.tex:45-46', '\\emph{AP-num}, a probability for each option under the answer-prediction prompt, scored by X\'s'), {
      text: 'AP-num, a probability for each option under the answer-prediction prompt, scored by X’s',
    }),
    'p2.prompt_in': paper('Sec. 2.2', at('sections_v2/02_setup.tex:46', '\\emph{IN-num}, the probability that the final answer will be the hint\'s, under the influence prompt'), {
      text: 'IN-num, the probability that the final answer will be the hint’s, under the influence prompt',
    }),
    // The open monitors answer the same prompt as the frontier readers' AP.
    'p2.open_prompt': paper('Sec. 2.2, readers (4, 5)', [at('sections_v2/02_setup.tex:41-42', 'with the answer-prediction prompt of \\citet{boppana2026}'), at('sections_v2/02_setup.tex:42-43', 'scored by the letter probability of X')], {
      text: 'the open monitors with the answer-prediction prompt, scored by the letter probability of X',
    }),
  });
  // Slide 7: an AUROC as a share of pairs, within question or pooled.
  Deck.addFacts({
    'p2.auroc_pairs': paper('Table 1', at('sections_v2/02_setup.tex:94-95', 'Share of (positive, negative) pairs from the same cluster in which the positive scores higher'), {
      text: 'Share of (positive, negative) pairs from the same cluster in which the positive scores higher',
    }),
    'p2.pooled_pairs': paper('Table 1', at('sections_v2/02_setup.tex:95', 'Pooled: over all pairs.'), { text: 'Pooled: over all pairs.' }),
    'p2.within_prompt': paper('Sec. 3', at('sections_v2/03_labels.tex:20-21', 'A \\emph{within-prompt} AUROC compares only traces of the same prompt; a pooled AUROC compares all pairs.'), {
      text: 'A within-prompt AUROC compares only traces of the same prompt; a pooled AUROC compares all pairs.',
    }),
    'p2.within_meaning': paper('Sec. 3', at('sections_v2/03_labels.tex:23-24', 'within-question AUROC measures what a reader learns from the reasoning beyond the prompt'), {
      text: 'within-question AUROC measures what a reader learns from the reasoning beyond the prompt',
    }),
    // What a reader shown the prompt alone can and cannot do: the paper's example for pooling.
    'p2.prompt_only': paper('Sec. 3', at('sections_v2/03_labels.tex:25-26', 'a reader that sees only the prompt, and never the reasoning, cannot rank two traces of the same question'), {
      text: 'a reader that sees only the prompt, and never the reasoning, cannot rank two traces of the same question',
    }),
  });
  // Slide 8: a continuation and who writes it, K, the share and its AUROC, how recent work
  // reads that AUROC (as a ceiling), the small K of the first resampling, and the label from
  // a held-out continuation (the share then comes from the other 15).
  Deck.addFacts({
    'p2.continuation_def': paper('Sec. 1', at('sections_v2/01_intro.tex:28-29', 'A \\emph{continuation} is a fresh sample of the model\'s reasoning from a prefix to its end, and $K$ is the number drawn per prefix.'), {
      text: 'A continuation is a fresh sample of the model’s reasoning from a prefix to its end, and K is the number drawn per prefix.',
    }),
    'p2.resampling_auroc': paper('Table 1', [at('sections_v2/02_setup.tex:97', 'the share of $K$ continuations that reach the outcome'), at('sections_v2/02_setup.tex:97-98', 'its within-cluster AUROC')], {
      text: 'the share of K continuations that reach the outcome; its within-cluster AUROC, the resampling AUROC',
    }),
    'p2.ceiling_use': paper('Sec. 4', at('sections_v2/04_ceiling.tex:4-5', 'To judge how much of what a prefix reveals a reader captures, compare it with the best AUROC any reader of the prefix could reach. Resampling estimates it'), {
      text: 'To judge how much of what a prefix reveals a reader captures, compare it with the best AUROC any reader of the prefix could reach. Resampling estimates it',
    }),
    'p2.ceiling_name': paper('Sec. 1', at('sections_v2/01_intro.tex:12-13', 'They call the resulting within-state AUROC a decision ceiling and read every monitor against it.'), {
      text: 'They call the resulting within-state AUROC a decision ceiling and read every monitor against it.',
    }),
    'p2.noisy': paper('Sec. 4', at('sections_v2/04_ceiling.tex:6', 'is a noisy reading of the continuation probability'), { text: 'a noisy reading of the continuation probability' }),
    'p2.k_small': paper('Sec. 2.1', at('sections_v2/02_setup.tex:26-27', 'trace was resampled with $K = 2$ continuations at $r = 0.1, 0.25, 0.4, 0.55, 0.7$ and $0.85$'), { value: 2, text: '2' }),
    'p2.heldout_label': paper('Sec. 4.3', at('sections_v2/04_ceiling.tex:100', 'the outcome $L$ of one held-out continuation'), { text: 'the outcome of one held-out continuation' }),
    'p2.heldout_others': paper('Sec. 4.3', at('sections_v2/04_ceiling.tex:104', 'the AUROC against $L$ of the share of $m$ of the other 15'), { value: 15, text: '15' }),
    // The continuations start from a cut that is already fixed, where the readers read.
    'p2.continuations_from_cut': paper('Sec. 2.1', at('sections_v2/02_setup.tex:29-30', 'each of the 1,226 drawn hinted traces was resampled again with $K = 16$ continuations from the exact cut its readers read at $r = 0.5$'), {
      text: 'each of the 1,226 drawn hinted traces was resampled again with K = 16 continuations from the exact cut its readers read at r = 0.5',
    }),
  });
  // Slide 9: what is resampled (whole questions, the paper's clusters).
  Deck.addFacts({
    'p2.question_clusters': paper('Table 4, caption', at('sections_v2/06_readers.tex:12', 'nominal 95\\% question-cluster percentile interval'), { text: 'question-cluster percentile interval' }),
    // What "resolved" stands for in the paper's table of differences: an interval that
    // excludes zero.
    'p2.excluding_zero': paper('Table 5; abstract', [at('sections_v2/06_readers.tex:65', 'Excluding 0, simultaneous'), at('sections_v2/00_abstract.tex:11', 'simultaneous 95\\% intervals resolve no reader difference')], { text: 'Excluding 0' }),
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
  // that its two monitors answer AP ('p2.open_prompt'). What the score is, for every reader,
  // the caption of the reader's step says ("The score: how likely this trace is to end at
  // the hinted answer."); for a forced answer the forced card says it again in its own last
  // sentence, "Score: its probability of the hinted answer." ('p2.forced_subject'). The
  // cards stay to the end of the slide, under the trace and its labels: the charts of
  // Part 3 name six of their readers by the two letters, and a card that left after one click was not read. How many
  // readers a kind holds is its dots, one dot per reader, which the second cue says. The two
  // kinds whose names say "monitors" are the monitors of the talk, six of the nine (the
  // second cue counts them); a forced answer is a reader and not a monitor. Qwen3-32B is in
  // two kinds, and the cards say what differs: as a forced reader it is made to answer, as
  // an open monitor it is asked to predict the trace's answer (the paper's readers (3) and
  // (5): "(3) has the weights of (5) but is elicited as a forced answer"). "Hint removed"
  // says where the hint is removed from, the prompt ('p2.forced_nohint').
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
  // The two prompts, by the letters of the readers' names: what each letter pair stands for
  // (the paper's "answer-prediction prompt" and "influence prompt") and, for the second,
  // what it asks. The facts name the prompts by these letters and these words.
  const ASKS = Object.freeze({ AP: 'answer prediction', IN: 'influence: will it be the hinted one?' });
  if (!t('p2.prompt_ap').startsWith('AP') || !t('p2.prompt_in').startsWith('IN') || !/answer-prediction prompt/.test(t('p2.prompt_ap')) || !/influence prompt/.test(t('p2.prompt_in'))) {
    throw Deck.fail('part 2: the facts of the two prompts no longer name them AP and IN, the answer-prediction and the influence prompt');
  }
  const prompt = (letters) => `<span class="p2-reader__prompt"><b>${letters}</b>, ${ASKS[letters]}</span>`;
  const KINDS = Object.freeze([
    { key: 'forced', name: 'Forced answer', count: 'p2.kind_forced',
      does: `Made to answer at the cut: the trace’s model (${variant('forced')}, or ${variant('forced_nohint')} from the prompt) or another (${variant('qwen32_forced')}). Score: its probability of the hinted answer.` },
    { key: 'open', name: 'Open monitors', count: 'p2.kind_open',
      does: `${whole(t('p2.open_names'))}, asked to predict the trace’s answer (<b>AP</b>).` },
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
    if (!/probability of X/.test(t('p2.forced_subject'))) throw Deck.fail('part 2: p2.forced_subject no longer says what the score of a forced answer is');
    if (!/removed from the prompt/.test(t('p2.forced_nohint'))) throw Deck.fail('part 2: p2.forced_nohint no longer says that the hint is removed from the prompt');
  })();
  // The monitors among the nine: the readers of the two kinds that are not forced answers.
  // The second cue says how many, in words.
  const MONITORS = KINDS.filter((kind) => kind.key !== 'forced').reduce((sum, kind) => sum + kind.readers.length, 0);
  if (v('readers.count') !== 9 || MONITORS !== 6) throw Deck.fail(`part 2: the second cue of the slide on the reader says nine readers and six monitors, the facts ${v('readers.count')} and ${MONITORS}`);
  // The terminal's name: the run of the worked example and, once the model has written the
  // rest again from the same prefix (the last click), that it is no longer that run.
  const TERM_NAME = Object.freeze({ run: RUN_NAME[EX.follower.outcome], again: 'Finished again' });

  // How the label is written as a number: a trace that follows is 1, one that resists 0.
  const LABEL = Object.freeze({ follows: 1, resists: 0 });
  // The second ending of the worked example's prefix (motifs.example): a continuation, which
  // the last click types beyond the cut and takes as the second label. It has to end
  // elsewhere than the trace's own ending, or the two labels of the slide would not differ.
  const AGAIN = EX.follower.again;
  if (AGAIN.outcome === EX.follower.outcome || AGAIN.answer === EX.target || AGAIN.lines.length !== EX.follower.lines.length - EX.cut) {
    throw Deck.fail('part 2: the continuation of the worked example no longer ends elsewhere than the trace, in as many paragraphs');
  }
  if (v('p2.two_labels') !== 2 || !/own outcome/.test(t('p2.label_own')) || !/held-out continuation/.test(t('p2.label_held')) || !/tends to do from here/.test(t('p2.label_held_asks'))) {
    throw Deck.fail('part 2: the facts of the two labels no longer say what the slide on the reader rewords');
  }
  // The trace and its score stand mid-stage until the score (termX) and the cards (flowY)
  // arrive, and stay where the cards put them; the full trace of the dataset slide is shown
  // for `cutAt` ms before it is cut. `back`: the cards once they have been read, set back
  // while the two labels are read over them (still legible).
  const READER = Object.freeze({ termX: 392, flowY: 100, cutAt: 1300, sweep: 1000, typeCps: 45, back: 0.5 });

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
    // "Check", not "score": on this slide a score is what a reader gives one prefix.
    title: 'A reader turns a prefix into a score, and we check it against two labels',
    // The first cue takes up slide 3's definition of a reader, a sentence to a line.
    cues: [
      { text: 'Reader: prefix in, score out.<br>A monitor is one kind.', step: 1 },
      { text: 'Nine readers (one dot each), the same prefixes: six are monitors', step: 2 },
    ],
    cite: [{ src: 'paper', where: 'Sec. 1, 2.1-2.2, 3' }],
    figure: ['schematic', 'illustrative'],
    html: `
      <div class="p2-box p2-reader">
        <div class="p2-reader__flow">
          <div class="dk-term p2-reader__term">
            <div class="dk-term__label">${TERM_NAME.run}</div>
            ${kit.cutTrace({ key: 'reader', seen: prefixOf(EX.follower), unseen: restOf(EX.follower), cut: CUT_NAME, end: answerOf(EX.follower), plain: true })}
            ${kit.lens({ key: 'reader' })}
          </div>
          <i class="p2-reader__wire"></i>
          <div class="p2-reader__score">${kit.meter({ key: 'reader-score', label: 'score', tone: 'read' })}</div>
          <div class="p2-reader__label">
            <span class="p2-reader__label-name" data-label="own">label 1</span>
            <span class="p2-reader__label-run" data-label="own"><i></i>${kit.flag({ key: 'reader-label', text: EX.follower.outcome })}</span>
            <span class="p2-reader__label-value" data-label="own">${LABEL[EX.follower.outcome]}</span>
            <span class="p2-reader__label-name" data-label="held">label 2</span>
            <span class="p2-reader__label-run" data-label="held"><i></i>${kit.flag({ key: 'reader-label-held', text: AGAIN.outcome })}</span>
            <span class="p2-reader__label-value" data-label="held">${LABEL[AGAIN.outcome]}</span>
          </div>
        </div>
        <div class="p2-reader__kinds">${KINDS.map(kindHtml).join('')}</div>
        ${kit.says({
    prefix: [
      `<b>Prefix at r = ${t('task.cut_r')}:</b> cut at the last paragraph break by halfway.`,
    ],
    reader: [
      'The <b class="c-read">score</b>: how likely this trace is to end at the hinted answer.',
    ],
    label: ['<b>Label 1, the trace’s own ending:</b> did this run end at the hinted answer?'],
    held: [
      '<b>Label 2:</b> the model finishes this prefix again; one such ending, held out, is the label.',
    ],
  })}
      </div>`,
    setup: (ctx) => {
      const flow = ctx.q('.p2-reader__flow');
      const term = ctx.q('.p2-reader__term');
      const lens = ctx.q('[data-lens="reader"]');
      const cut = kit.cutParts(ctx.q('[data-cut="reader"]'));
      const chip = ctx.q('[data-flag="reader-label"]');
      const heldChip = ctx.q('[data-flag="reader-label-held"]');
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
      enter.type('.p2-reader__term .dk-term__label', TERM_NAME.run, { dur: 0 });
      enter.tween('.p2-reader__term .dk-term__label', { opacity: [1, 1] }, { dur: 0 });
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
      kit.say(enter, 'prefix', [cutAt + DUR.micro]);
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
      read.count('[data-meter="reader-score"] .dk-meter__value', [0, score], { at: scored, dur: DUR.move, format: percent });
      kit.say(read, 'reader', [scored], { leaves: 'prefix' });

      // Click 2: the nine readers. The trace and its score move up, the three cards arrive
      // under them, and the lens goes over the prefix once more while the nine dots fill:
      // the same prefix feeds every reader. The caption of click 1 stays.
      const nine = ctx.step({ label: 'nine readers of three kinds' });
      nine.tween(flow, { y: [READER.flowY, 0] }, { dur: DUR.move, ease: 'inOut' });
      nine.show('.p2-reader__kind', { at: 500, stagger: 180 });
      sweep(nine, 1400, READER.sweep);
      nine.cls(ctx.qa('.p2-reader__kind-dots i'), 'is-fed', { at: 1500, stagger: 100 });
      nine.hold(DUR.enter);

      // Click 3: the label. The three cards stay where they are, set back, and nothing moves
      // but the trace's own text: the model writes the rest, the answer lands on the hinted
      // option, and the outcome travels from the answer to its place under the score. The
      // two rows of labels say how a label is written as a number (follows 1, resists 0).
      const label = ctx.step({ label: 'the label' });
      label.tween('.p2-reader__kinds', { opacity: [1, READER.back] }, { dur: DUR.enter });
      const typed = (text) => Math.round((text.length / READER.typeCps) * 1000);
      const cleared = DUR.enter;
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
      label.tween('.p2-reader__label-name[data-label="own"], .p2-reader__label-run[data-label="own"] i', { opacity: [0, 1] }, { at: lands - DUR.micro, dur: DUR.enter });
      label.tween('.p2-reader__label-value[data-label="own"]', { opacity: [0, 1], scale: [1.4, 1] }, { at: lands, dur: DUR.enter });
      kit.say(label, 'label', [200], { leaves: 'reader' });
      label.hold(DUR.enter);

      // Click 4: the second label. What the model wrote beyond the cut is taken away, the
      // answer is open again, and the model writes the rest once more from the same prefix:
      // other words, another answer. The terminal's name changes with it, so that the new
      // ending is not read as the first run rewritten. That ending travels to its own row
      // under the first label, and the two labels of one prefix stand one over the other:
      // 1 and 0.
      const again = ctx.step({ label: 'a second label: a held-out continuation' });
      const wiped = DUR.enter;
      again.type('.p2-reader__term .dk-term__label', TERM_NAME.again, { at: DUR.micro, dur: 0 });
      again.tween('.p2-reader__term .dk-term__label', { opacity: [0, 1] }, { at: DUR.micro, dur: DUR.enter });
      again.tween(cut.unseenTexts, { opacity: [1, 0] }, { dur: DUR.micro });
      again.type(cut.end, OPEN_END, { at: DUR.micro, dur: 0 });
      again.cls(cut.end, 'is-follows', { at: DUR.micro, on: false });
      const retyped = AGAIN.lines.reduce((at, line) => [...at, at[at.length - 1] + typed(line) + DUR.micro], [wiped + DUR.enter]);
      cut.unseenTexts.forEach((text, i) => {
        again.tween(text, { opacity: [0, 1] }, { at: retyped[i], dur: 0 });
        again.type(text, AGAIN.lines[i], { at: retyped[i], cps: READER.typeCps });
      });
      const reanswered = retyped[AGAIN.lines.length];
      again.type(cut.end, answerOf(AGAIN), { at: reanswered, dur: 0 });
      again.cls(cut.end, 'p2-is-resists', { at: reanswered });
      again.tween(cut.end, { scale: [1.4, 1] }, { at: reanswered, dur: DUR.enter });
      const heldTo = placeIn(heldChip, flow);
      const heldLands = reanswered + DUR.enter + DUR.move;
      again.cls(heldChip, 'is-clean', { at: 0 });
      again.tween(heldChip, { opacity: [0, 1] }, { at: reanswered + DUR.enter, dur: DUR.micro });
      again.tween(heldChip, { x: [from.x - heldTo.x, 0], y: [from.y - heldTo.y, 0] }, { at: reanswered + DUR.enter, dur: DUR.move, ease: 'inOut' });
      again.tween('.p2-reader__label-name[data-label="held"], .p2-reader__label-run[data-label="held"] i', { opacity: [0, 1] }, { at: heldLands - DUR.micro, dur: DUR.enter });
      again.tween('.p2-reader__label-value[data-label="held"]', { opacity: [0, 1], scale: [1.4, 1] }, { at: heldLands, dur: DUR.enter });
      kit.say(again, 'held', [200], { leaves: 'label' });
      again.hold(DUR.enter);
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

  // The last click: the paper's example of what pooling does, a reader that is shown the
  // prompt alone ('p2.prompt_only'). It is not one of the nine readers the talk counts, so
  // the slide calls it a score and says that it is not among the nine, as it
  // says that the two numbers are its measured AUROCs. The slide prints them, says that the point is
  // known and replicated ('pooled.known', 'pooled.we_score') and where it is shown
  // ('pooled.only_there'), and ends on the first recommendation; it fails to build if a fact
  // stops saying so, or if the pooled value is not above the within-question one.
  if (!/^it is known that pooling the AUROC across prompts/.test(t('pooled.known')) || !/This point is known$/.test(t('pooled.we_score')) || !/selected for influence$/.test(t('pooled.only_there')) || !/never the reasoning/.test(t('p2.prompt_only'))) {
    throw Deck.fail('part 2: the facts on pooling no longer say what the last click of the slide on AUROC rewords');
  }
  if (!(v('pooled.prompt_only') > v('pooled.prompt_only_within')) || Deck.motifs.recs[0].fact !== 'rec.1') throw Deck.fail('part 2: the prompt-only reader no longer scores higher pooled, or the first recommendation is no longer the one on pooling');
  // The count that the prompt-only score is set apart from, in the word of slide 6's second cue.
  const NINE = 'nine';
  if (v('readers.count') !== 9 || !/prompt-only reader on the same traces/.test(Deck.fact('pooled.prompt_only').file)) throw Deck.fail('part 2: the prompt-only score of the slide on AUROC is no longer the paper’s prompt-only reader, beside nine readers');

  const pairHtml = ({ key, trace, state }) => `
    <div class="p2-auroc__trace" data-trace="${key}">
      <div class="dk-term p2-auroc__term">
        <div class="dk-term__label">${RUN_NAME[trace.outcome]}</div>
        <div class="p2-auroc__status"><span>label 1</span><span class="dk-flag ${state}">${trace.outcome}</span></div>
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
      { text: 'Pooled: any follower against any resister', step: 3 },
    ],
    // Jia et al. is cited for what the last click calls known: they are among those who
    // write the pooled AUROC as a mix of within- and between-prompt AUROCs, with a
    // prompt-only score at 1/2 within (the paper's Sec. 1, "What was known").
    cite: [{ src: 'paper', where: 'Sec. 1-3, 11; Fig. 1a' }, { src: 'jia2026', where: 'pooling' }],
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
        <div class="p2-auroc__prompt">
          <p class="p2-auroc__who">A prompt-only score (not among the ${NINE})</p>
          <p class="p2-auroc__never">its measured AUROC</p>
          <div class="p2-auroc__two">
            <p><span>within question</span><b>${t('pooled.prompt_only_within')}</b></p>
            <p><span>pooled</span><b class="p2-auroc__lifted">${t('pooled.prompt_only')}</b></p>
          </div>
        </div>
        <div class="p2-auroc__cols">
          ${kit.cols({ ...QUESTIONS, back: arcsHtml(false), under: arcsHtml(true) })}
          <div class="p2-auroc__legend">
            <span><i class="is-follows"></i>follows</span><span><i></i>resists</span><span data-key="within"><i class="is-arc"></i>within a question</span><span data-key="across"><i class="is-line"></i>across questions</span>
          </div>
          <div class="p2-auroc__counter"><span>With ${t('task.sample_questions')} questions per model, only <b>${t('pooled.within_share_min')} to ${t('pooled.within_share_max')}</b></span><span>of pooled pairs share a question.</span></div>
        </div>
        ${kit.says({
    pair: [
      'The follower got the higher score: this pair is ranked correctly.',
    ],
    many: [
      `Take ${PAIRS} such pairs.`,
      `<b class="p2-num">${PAIRS_RIGHT}</b> are ranked correctly.`,
    ],
    within: ['A follower is paired only with resisters of its own question.'],
    known: ['<b>Pooled, the prompt alone raises the AUROC:</b> a known point, which we replicate on this task only.'],
  }, { inner: kit.rec(1) })}
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
        enter.count(`[data-meter="pair-${key}"] .dk-meter__value`, [0, trace.score], { at, dur: DUR.move, format: percent });
      });
      const judged = 900 + 300 + DUR.move + DUR.micro;
      enter.tween('.p2-auroc__gt', { opacity: [0, 1] }, { at: judged, dur: DUR.micro });
      enter.tween('.p2-auroc__check', { opacity: [0, 1], scale: [1.8, 1] }, { at: judged + DUR.micro, dur: DUR.enter });
      kit.say(enter, 'pair', [judged + DUR.enter]);
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
      // picture shows another: the data has 20 questions per model (the sketch has three).
      const pooled = ctx.step({ label: 'pooled' });
      const across = util.shuffled(ctx.qa('[data-arc="across"]'), 9);
      const crossed = 500 + across.length * 22 + 500;
      pooled.tween(across, { 'attr:stroke-dashoffset': [1, 0] }, { at: 500, dur: 500, stagger: 22 });
      pooled.tween('.p2-auroc__legend [data-key="across"]', { opacity: [0, 1] }, { at: 500, dur: DUR.enter });
      pooled.tween('.p2-auroc__counter', { opacity: [0, 1] }, { at: crossed, dur: DUR.enter });
      pooled.hold(DUR.enter);

      // Click 4: what the choice does, in one measured number, and the first of the four
      // recommendations. The made-up grid gives its place to a reader that is shown the
      // prompt and never the reasoning: within a question it cannot rank two traces (0.50);
      // pooled it scores well above that. The point is known and the paper replicates it
      // ('pooled.known', 'pooled.we_score'), so the slide says so and moves on: Part 3 does
      // not take it up again.
      const known = ctx.step({ label: 'pooled, the prompt alone raises the AUROC: a known point' });
      known.tween('.p2-auroc__many', { opacity: [1, 0] }, { dur: DUR.enter });
      // The line under the columns was read at the click before: it leaves, so that this
      // click brings one reader, two numbers and one sentence.
      known.tween('.p2-auroc__counter', { opacity: [1, 0] }, { dur: DUR.enter });
      known.tween('.p2-auroc__prompt', { opacity: [0, 1] }, { at: DUR.enter, dur: DUR.enter });
      known.show('.p2-auroc__two p', { at: DUR.move, stagger: 900, rise: 0 });
      known.tween('.p2-auroc__lifted', { scale: [1.5, 1] }, { at: DUR.move + 900, dur: DUR.enter });
      kit.say(known, 'known', [DUR.move + 2400], { leaves: 'within' });
      known.show('.dk-rec', { at: DUR.move + 3400 });
      known.hold(DUR.enter);
    },
  });

  // ---------------------------------------------------------------- slide 8: continuations and K
  // What a ceiling is, in the paper's words, which slide 3 uses too ('p1.ceiling_gloss'): the
  // caption of click 3 says them, and the slide fails to build if the paper's sentence
  // stops holding them.
  const CEILING_IS = 'the best AUROC any reader of the prefix could reach';
  if (!t('p2.ceiling_use').includes(CEILING_IS)) throw Deck.fail('part 2: p2.ceiling_use no longer says what a ceiling is in the words of the slide on resampling');
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
    dim: 0.6,                                      // the fan while the bar of its endings is read: set back, still legible
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
  // K takes two values on the slide; beside each stands why it is that one. Sixteen is
  // what the project drew for each prefix ('task.sample_k'); two is a thought experiment
  // (and the K of the project's first resampling, 'p2.k_small'). When one of the sixteen is
  // held out as the label, fifteen are left for the share ('p2.heldout_others').
  // K itself stays sixteen when one continuation is held out: the readout keeps "K = 16"
  // and says beside it how many are left for the share, so that K is one number on the slide
  // and in Part 3.
  const WHY_K = Object.freeze({
    all: 'as in our data',
    small: `what if only ${v('p2.k_small')}?`,
    others: `one held out, ${v('p2.heldout_others')} left`,
  });
  // The shares of three other prefixes, as bars under this prefix's: how many of their K
  // continuations end at the hinted answer is made up (the tag "Illustrative" covers it).
  // The resampling AUROC is the AUROC of such shares, one per prefix, and no single share.
  const OTHER_PREFIXES = Object.freeze([4, 14, 7]);
  const otherHtml = (red) => `<div class="p2-fan__row">${util.range(FAN.k).map((j) => `<i${j < red ? ' class="is-on"' : ''}></i>`).join('')}</div>`;
  // The two kinds of ending, as a key of the fan's two strokes under the prefix (click 5).
  // The trace's own ending, the solid line, was written before the cut was placed: the cut
  // stands at a share of the trace's own reasoning ('task.cut'). A continuation, a dashed
  // line, was sampled after it, from the cut ('p2.continuations_from_cut'). The shares are
  // built from the dashed kind, and the second label is one of that kind
  // ('p2.heldout_label'). The key says where each kind comes from and no more; what follows
  // from it, the condition under which the resampling AUROC is a ceiling, is result 1
  // (slide 10).
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
      { text: 'K: the number of continuations per prefix', step: 2 },
      { text: 'Resampling AUROC: the AUROC of all prefixes’ shares', step: 3 },
    ],
    cite: [{ src: 'paper', where: 'Sec. 1, 2.1, 4' }, { src: 'jia2026', where: 'decision ceiling' }],
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
        ${endHtml('own', FAN_AT.own, CHIP.follows.state, CHIP.follows.text, 'its own ending: label 1')}
        ${endHtml('first-resists', laneY(FAN.first.resists), CHIP.resists.state, CHIP.resists.text)}
        ${endHtml('first-follows', laneY(FAN.first.follows), CHIP.follows.state, CHIP.follows.text)}
        ${endHtml('held', FAN_AT.held, CHIP.resists.state, CHIP.resists.text, 'held out: label 2')}
        <div class="p2-fan__readout">
          <div class="p2-fan__k">K = <span data-fan="k"></span><span class="p2-fan__why" data-fan="why"></span></div>
          <div class="p2-fan__share">share = <b data-fan="frac"></b> = <b data-fan="share"></b></div>
          <div class="p2-fan__ref">this prefix</div>
          <div class="p2-fan__cells" data-cells="all">${util.range(FAN.k).map((j) => `<i data-cell="${j}"></i>`).join('')}</div>
          <div class="p2-fan__cells" data-cells="small">${util.range(FAN.small).map((j) => `<i data-half="${j}"></i>`).join('')}</div>
          <div class="p2-fan__others">${OTHER_PREFIXES.map(otherHtml).join('')}<span>other prefixes</span></div>
          <div class="p2-fan__auroc">AUROC of these shares, against label&nbsp;1</div>
          <div class="p2-fan__ask p2-ask">Is that AUROC really a ceiling?</div>
        </div>
        ${util.range(FAN.k).map((i) => `<i class="p2-fan__ghost${FAN.follows[i] ? '' : ' is-resist'}" data-ghost="${i}" style="left:${FAN_AT.ex - FAN_AT.r}px; top:${laneY(i) - FAN_AT.r}px"></i>`).join('')}
        ${kit.says({
    open: ['How much of the ending does a prefix reveal?'],
    continuation: ['<b class="c-hidden">Continuation:</b> that model writes the rest again. It can end differently.'],
    k: [`${FAN.follow} of these ${FAN.k} continuations end at the hinted answer.`],
    reference: [
      'That share is a score too: the model’s own.',
      `Recent work reads its AUROC as a <b class="c-hidden">ceiling</b>: ${CEILING_IS}.`,
    ],
    coarse: ['Then the share can only be 0, ½ or 1: a noisy reading of the prefix.'],
    second: [
      'The shares are built from continuations, <span class="p2-fan__but">but label 1 is the trace’s own ending, not one of them.</span>',
      '<b>Label 2</b> is one of them, held out.',
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
      // other prefixes, and the line that names the AUROC of all these shares: the
      // resampling AUROC, the paper's name, which Part 3's chart prints on its axis. The
      // caption says how recent work reads it, as a ceiling ('p2.ceiling_name',
      // 'p2.ceiling_use'); whether it is one is result 1. No reader's score stands beside
      // the bar: one prefix's share and one score of a reader are not what that AUROC
      // compares.
      const scored = ctx.step({ label: 'the share is a score too' });
      const sorted = [...util.range(FAN.k).filter((i) => FAN.follows[i]), ...util.range(FAN.k).filter((i) => !FAN.follows[i])];
      const flight = DUR.move;
      scored.tween('.p2-fan__all', { opacity: [1, FAN_AT.dim] }, { at: DUR.micro, dur: DUR.enter });
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
      const coarse = ctx.step({ label: 'few continuations: a noisy share' });
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
      coarse.tween('.p2-fan__all', { opacity: [FAN_AT.dim, 1] }, { dur: DUR.enter });
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

      // Click 5: the second label of slide 6, inside the fan. Three beats, and the picture
      // carries each. First the label so far: the trace's own ending, the solid line, lands
      // a beat, and the key under the prefix says where it comes from (written before the
      // cut was placed). Then what the shares are built from: all K continuations leave the
      // cut again, at once and alike, where click 2 drew them one by one; the key names
      // their kind (sampled after the cut), and the readout is back at K = 16. Then one of
      // them, the one that resisted, is taken out of the bundle to a lane of its own under
      // the trace's own ending: still dashed, the line of a label now. Its ending is label
      // 2 and the share comes from the others ('p2.heldout_label', 'p2.heldout_others').
      // The slide ends on the question that result 1 answers, under K.
      const second = ctx.step({ label: 'label 2 in the fan: one continuation held out' });
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
      // What the shares are built from: every continuation, from the cut, alike.
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
      // The share is now of the fifteen that are left; K, the number drawn, stays sixteen.
      const left = shareOf(FAN.follow, FAN.k - 1);
      ['frac', 'share'].forEach((field) => second.type(`[data-fan="${field}"]`, left[field], { at: pulled, dur: 0 }));
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
  // The difference of the last click is made up (the tag "Illustrative" covers it, and the
  // slide says so under it): the paper's main text prints the counts of resolved
  // differences and not the fifteen differences themselves. It is drawn like the pile at
  // the left, on the same scale, with an interval that contains zero, as every one of the
  // fifteen does against the trace's own ending ('test.resolved_own'); no number of it is
  // printed but the zero.
  const DIFF = Object.freeze({ d: 0.02, lo: -0.012, hi: 0.052 });
  if (!(DIFF.lo < 0 && DIFF.hi > 0) || v('test.resolved_own') !== 0) throw Deck.fail('part 2: the made-up difference of the slide on intervals no longer contains zero, as the fifteen measured ones do');

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
  // The scale of the difference's axis: a tick at every hundredth of an AUROC, counted from
  // the zero line, and a bracket over one step with its size. The made-up difference still
  // prints no number of its own. `at` is the step the bracket marks, beyond the interval.
  const TICKS = (() => {
    const step = 0.01;
    const px = step * BOOT.perUnit;
    const from = Math.ceil((8 - BOOT.diff.zero) / px);
    const to = Math.floor((BOOT.diff.width - 8 - BOOT.diff.zero) / px);
    const xs = util.range(to - from + 1).map((n) => BOOT.diff.zero + (from + n) * px);
    const at = xs.length - 2;
    if (at < 0 || xs[at] < DIFF_AT.hi) throw Deck.fail('part 2: the axis of the difference has no step beyond the interval to mark the scale on');
    return Object.freeze({ xs: Object.freeze(xs), px, at, text: `${step} AUROC` });
  })();
  const ticksHtml = () => TICKS.xs.map((x) => `<line class="p2-boot__tick" x1="${x.toFixed(1)}" y1="${BOOT.axisY}" x2="${x.toFixed(1)}" y2="${BOOT.axisY + 18}"/>`).join('');
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
  // Two bells that stand side by side and then merge: two readers' piles on the way to the
  // pile of their difference. Each is a sketch of a reader's recomputed scores, like the
  // pile at the left. The two have no common axis, no numbers and no reader's name (only
  // the first pile, at the left, is drawn from data).
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
      { text: `${t('test.interval_level')} interval: the middle ${t('test.interval_level')} of the recomputed scores`, step: 2 },
      { text: 'Resolved: a difference whose interval excludes zero', step: 3 },
    ],
    cite: [{ src: 'paper', where: 'Sec. 2.1, 6; Table 4-5' }],
    figure: ['schematic', 'illustrative'],
    numbers: 'reported',
    html: `
      <div class="p2-box p2-boot">
        <div class="p2-boot__one">
          <div class="p2-boot__rowname" data-row="have">The ${t('task.sample_questions')} questions (dot: trace)</div>
          <div class="p2-boot__rowname" data-row="draw">↓ redrawn with repeats</div>
          ${util.range(BOOT.questions).map((q) => `<span class="p2-boot__tile" data-tile="${q}" style="left:${q * BOOT.pitch}px; top:${BOOT.rowTop}px">${tileDots(q)}</span>`).join('')}
          ${util.range(BOOT.questions).flatMap((q) => util.range(BOOT.levels).map((level) => `<span class="p2-boot__tile p2-boot__copy" data-copy="${q}-${level}" style="left:${q * BOOT.pitch}px; top:${BOOT.copyTop + level * BOOT.copyPitch}px">${tileDots(q)}</span>`)).join('')}
          <svg class="p2-boot__art" viewBox="0 0 ${BOOT.one.width} ${PIC.height}" width="${BOOT.one.width}" height="${PIC.height}" aria-hidden="true">
            <line class="p2-boot__from" x1="${BOOT.one.center}" y1="${BOOT.copyTop}" x2="${BOOT.one.center}" y2="${BOOT.axisY - 16}"/>
            ${pileHtml(SCORE_PILE, 'draw')}
            <line class="p2-boot__axis" x1="0" y1="${BOOT.axisY}" x2="${BOOT.one.width}" y2="${BOOT.axisY}"/>
            ${spanHtml('one', SCORE_AT)}
            <circle class="p2-boot__score" cx="${BOOT.one.center}" cy="${BOOT.axisY}" r="10"/>
          </svg>
          <div class="p2-boot__what">${SCORE_NAME} · within-question AUROC, label 1</div>
          ${numHtml('one-lo', SCORE_AT.lo, SCORE.interval[0].toFixed(3))}
          ${numHtml('one-d', SCORE_AT.d, SCORE.text, ' p2-boot__num--main')}
          ${numHtml('one-hi', SCORE_AT.hi, SCORE.interval[1].toFixed(3))}
        </div>
        <div class="p2-boot__diff">
          <div class="p2-boot__names">${nameHtml('one', 'one reader')}${nameHtml('minus', 'minus')}${nameHtml('other', 'another reader')}</div>
          <div class="p2-boot__verdict">${kit.flag({ key: 'resolved', text: 'not resolved' })}</div>
          <svg class="p2-boot__art" viewBox="0 0 ${BOOT.diff.width} ${PIC.height}" width="${BOOT.diff.width}" height="${PIC.height}" aria-hidden="true">
            ${bellHtml('one', 'bell')}${bellHtml('other', 'bell')}
            ${bellHtml('one', 'ghost')}${bellHtml('other', 'ghost')}
            ${pileHtml(DIFF_PILE, 'gap')}
            <g class="p2-boot__ticks">${ticksHtml()}</g>
            <line class="p2-boot__axis" x1="0" y1="${BOOT.axisY}" x2="${BOOT.diff.width}" y2="${BOOT.axisY}"/>
            <line class="p2-boot__zero" x1="${DIFF_AT.zero}" y1="${BOOT.dropFrom + 8}" x2="${DIFF_AT.zero}" y2="${BOOT.axisY + 14}"/>
            ${spanHtml('diff', DIFF_AT)}
          </svg>
          ${numHtml('zero', DIFF_AT.zero, '0', ' p2-boot__num--zero')}
          <div class="p2-boot__madeup" style="left:${DIFF_AT.d.toFixed(1)}px">a made-up example</div>
          <div class="p2-boot__scale" style="left:${TICKS.xs[TICKS.at].toFixed(1)}px; width:${TICKS.px.toFixed(1)}px"><i></i><span>${TICKS.text}</span></div>
        </div>
        ${kit.says({
    one: [`This score rests on ${t('task.sample_questions')} questions per model. Others would give another number.`],
    boot: [`<b>Bootstrap:</b> draw whole questions again and recompute, ${t('test.replicates')} times.`],
    diff: [
      'A difference between readers gets an interval too.',
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
      diff.tween('.p2-boot__diff .p2-boot__axis, .p2-boot__ticks, .p2-boot__scale', { opacity: [0, 1] }, { at: merged - DUR.enter, dur: DUR.enter });
      DIFF_PILE.forEach((_, k) => drop(diff, 'gap', k, DIFF_PILE, merged + DUR.enter + Math.round(1100 * ((k + 1) / DIFF_PILE.length) ** 0.7), 300));
      diff.tween('.p2-boot__zero, [data-num="zero"]', { opacity: [0, 1] }, { at: piled, dur: DUR.enter });
      span(diff, 'diff', 'gap', DIFF_PILE, piled + DUR.enter, '.p2-boot__madeup', DIFF_AT);
      const judged = piled + DUR.enter + DUR.micro + DUR.move + DUR.enter;
      diff.tween('[data-flag="resolved"]', { opacity: [0, 1], scale: [1.6, 1] }, { at: judged, dur: DUR.enter });
      kit.say(diff, 'diff', [200, judged], { leaves: 'boot' });
      diff.hold(DUR.enter);
    },
  });
})();
