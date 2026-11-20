// Shared visual building blocks, returned as HTML strings for a slide's `html`, and the
// timeline moves that belong to them. They carry the motifs that recur across parts (the cut
// trace, the question columns, the caption of a step, the scope line in its frame, a result's
// head and its recommendation, the trace a monitor reads, meter, unit grid, lattice, the line
// that decays into dots), so a callback in one part is the original of another. A block that
// prints words of the talk reads them from shared/motifs.js when it is called (the parts call
// after that file has loaded). Styles: core/kit.css.
(() => {
  'use strict';

  const D = window.Deck;
  const DUR = D.timeline.DUR;

  const attrs = (map) => Object.entries(map)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => ` ${k}="${String(v).replace(/"/g, '&quot;')}"`)
    .join('');

  // A model's reasoning trace: a label, then one empty line per key for tl.type() to fill.
  // A line is a key, or { key, apart }: `apart` sets it off from the lines above it, for a
  // second example that is not the continuation of the first.
  const term = ({ id, label, lines }) => `
    <div class="dk-term"${attrs({ id })}>
      <div class="dk-term__label">${label}</div>
      ${lines.map((line) => (typeof line === 'string' ? { key: line } : line))
    .map((line) => `<div class="dk-term__line${line.apart ? ' is-apart' : ''}" data-line="${line.key}"></div>`).join('')}
    </div>`;

  // A note about a box's content, set on the box's bottom border (the box is positioned):
  // what a mark in it means, or which model its numbers are from. It sits on the frame,
  // outside the content, so that a note about a trace is never read as part of the trace.
  // Where content comes from, and whether it is a source's or ours, is not said here: the
  // footer says it, in its tags and its cite (SPEC.md section 7.29).
  const legend = ({ key, text = '' }) => `<span class="dk-legend" data-legend="${key}">${text}</span>`;

  // A horizontal meter: animate the fill with tl.tween(fill, { '--v': ['0%', '95%'] })
  // and the number with tl.count(value, [0, 95], { format }).
  const meter = ({ key, label, tone }) => `
    <div class="dk-meter" data-meter="${key}"${attrs({ 'data-tone': tone })}>
      <span class="dk-meter__label">${label}</span>
      <span class="dk-meter__track"><i class="dk-meter__fill"></i></span>
      <span class="dk-meter__value"></span>
    </div>`;

  // A unit chart: n cells in `cols` columns; switch cells on with tl.cls(cell, 'is-on').
  const grid = ({ key, n, cols: columns = 10, tone }) => `
    <div class="dk-grid" data-grid="${key}" style="--cols:${columns}"${attrs({ 'data-tone': tone })}>
      ${D.util.range(n).map((i) => `<i class="dk-grid__cell" data-cell="${i}"></i>`).join('')}
    </div>`;

  // A verdict chip; switch state with tl.cls(flag, 'is-flagged') or 'is-clean'.
  const flag = ({ key, text }) => `<span class="dk-flag" data-flag="${key}">${text}</span>`;

  // The monitor: a scan bar. Place it with CSS, move it with tl.tween(lens, { x: [0, 800] }).
  const lens = ({ key }) => `<i class="dk-lens" data-lens="${key}"></i>`;

  // A trace that a monitor reads: kit.term, the monitor's verdict chip in
  // the top right corner, and its lens as a scan bar that travels down the lines. A line the
  // lens has passed gets a mark in its gutter: a check, or a pointer on a flagged line.
  // `width` (stage pixels) fixes the block's width; `note` is the text of the legend on its
  // border (a slide may type it later); `inner` is extra markup inside the block.
  const trace = ({ key, label, lines, verdict, who = 'monitor', width, note = '', inner = '' }) => `
    <div class="dk-trace" data-trace="${key}"${attrs({ style: width ? `width:${width}px` : undefined })}>
      ${term({ label, lines })}
      <div class="dk-trace__status">
        <span class="dk-trace__who">${who}</span>${flag({ key: `${key}-verdict`, text: verdict })}
      </div>
      ${lens({ key: `${key}-lens` })}
      ${legend({ key: `${key}-note`, text: note })}
      ${inner}
    </div>`;

  // The elements of a mounted trace, for the moves below and for a slide's own tracks.
  const traceParts = (el) => Object.freeze({
    term: el.querySelector('.dk-term'),
    lines: Array.from(el.querySelectorAll('.dk-term__line')),
    line: (key) => el.querySelector(`[data-line="${key}"]`),
    who: el.querySelector('.dk-trace__who'),
    chip: el.querySelector('.dk-trace__status .dk-flag'),
    lens: el.querySelector(':scope > .dk-lens'),
    note: el.querySelector(':scope > .dk-legend'),
  });

  // The lens sweeps down the trace; each line in `marks` ({ key, flag }) gets its gutter mark
  // as the lens passes it. Returns the time at which the sweep ends.
  const readTrace = (step, el, { at, perLine, marks }) => {
    const { lines, line, lens: bar } = traceParts(el);
    const last = lines[lines.length - 1];
    const span = { top: lines[0].offsetTop, bottom: last.offsetTop + last.offsetHeight };
    const dur = lines.length * perLine;
    const passes = (row) => at + ((row.offsetTop + row.offsetHeight / 2 - span.top) / (span.bottom - span.top)) * dur;
    step.tween(bar, { opacity: [0, 1] }, { at: at - DUR.micro, dur: DUR.micro });
    step.tween(bar, { y: [span.top, span.bottom] }, { at, dur, ease: 'linear' });
    marks.forEach(({ key, flag: flagged }) => {
      const row = line(key);
      if (flagged) step.cls(row, 'is-flag', { at: passes(row) });
      step.tween(row, { '--dk-mark': [0, 1] }, { at: passes(row), dur: DUR.micro });
    });
    step.tween(bar, { opacity: [1, 0] }, { at: at + dur, dur: DUR.enter });
    return at + dur;
  };

  // The verdict lands like a stamp. `text` rewrites the chip, `clear` drops its earlier state.
  const stamp = (step, chip, state, at, { text, clear } = {}) => {
    if (clear) step.cls(chip, clear, { at, on: false });
    if (text !== undefined) step.type(chip, text, { at, dur: 0 });
    step.cls(chip, state, { at });
    step.tween(chip, { opacity: [0, 1], scale: [1.8, 1] }, { at, dur: DUR.enter });
  };

  // Shows a trace as a monitor left it, from the first frame of a step: every line typed and
  // toned, the gutter marks set, the verdict stamped: a slide can open on the state in which
  // an earlier slide left the trace. A line without `text` (and tone) is filled by the slide
  // itself.
  const setTrace = (step, el, { lines, verdict, state, alarm = false }) => {
    const parts = traceParts(el);
    lines.forEach(({ key, text, tone, flag: flagged = false, mark = flagged }) => {
      const row = parts.line(key);
      if (text !== undefined) step.type(row, text, { dur: 0 });
      if (tone) step.cls(row, tone);
      if (flagged) step.cls(row, 'is-flag');
      if (mark) step.tween(row, { '--dk-mark': [1, 1] }, { dur: 0 });
    });
    step.tween(parts.who, { opacity: [1, 1] }, { dur: 0 });
    step.type(parts.chip, verdict, { dur: 0 });
    step.cls(parts.chip, state);
    step.tween(parts.chip, { opacity: [1, 1], scale: [1, 1] }, { dur: 0 });
    if (alarm) step.cls(el, 'is-alarm');
  };

  // A line of text whose letters can fall away into dots and come back: one
  // cell per character, so a letter and its dot share one place. A slide animates the
  // .dk-decay__glyph and .dk-decay__dot elements; spaces are plain spans.
  const decay = ({ key, text, label }) => `
    <div class="dk-decay" data-decay="${key}"${attrs({ role: label ? 'img' : undefined, 'aria-label': label })}>${Array.from(text).map((ch) => (ch === ' '
    ? '<span> </span>'
    : `<span class="dk-decay__cell"><span class="dk-decay__glyph">${ch}</span><i class="dk-decay__dot"></i></span>`)).join('')}</div>`;

  // The recurring picture of a transformer: token columns, layer rows, the text row below.
  // Slides that show a model's inside draw on this one lattice so the audience sees the same
  // machine.
  // Geometry is in viewBox units; latticePoint gives the center of a node or of a token chip.
  const LATTICE = Object.freeze({ col: 144, row: 80, pad: 72, top: 40, node: 12, chipW: 120, chipH: 56, chipGap: 40 });
  const latticeSize = ({ cols, rows = 4 }) => ({
    width: LATTICE.pad * 2 + (cols - 1) * LATTICE.col,
    height: LATTICE.top + (rows - 1) * LATTICE.row + LATTICE.chipGap + LATTICE.chipH + LATTICE.node,
  });
  const latticePoint = ({ rows = 4 }, col, row) => ({
    x: LATTICE.pad + col * LATTICE.col,
    y: row === 'token'
      ? LATTICE.top + (rows - 1) * LATTICE.row + LATTICE.chipGap + LATTICE.chipH / 2
      : LATTICE.top + (rows - 1 - row) * LATTICE.row,
  });
  const lattice = ({ key, cols, rows = 4, tokens = [] }) => {
    const shape = { cols, rows };
    const size = latticeSize(shape);
    const columns = D.util.range(cols).map((c) => {
      const links = D.util.range(rows - 1).map((r) => {
        const a = latticePoint(shape, c, r);
        const b = latticePoint(shape, c, r + 1);
        return `<line class="dk-lattice__link" data-link="${c}-${r}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`;
      }).join('');
      const nodes = D.util.range(rows).map((r) => {
        const p = latticePoint(shape, c, r);
        return `<circle class="dk-lattice__node" data-node="${c}-${r}" cx="${p.x}" cy="${p.y}" r="${LATTICE.node}"/>`;
      }).join('');
      const t = latticePoint(shape, c, 'token');
      const chip = `<g class="dk-lattice__token" data-token="${c}">
        <rect x="${t.x - LATTICE.chipW / 2}" y="${t.y - LATTICE.chipH / 2}" width="${LATTICE.chipW}" height="${LATTICE.chipH}" rx="8"/>
        <text x="${t.x}" y="${t.y + 10}">${tokens[c] ?? ''}</text></g>`;
      return `${links}${nodes}${chip}`;
    }).join('');
    return `<svg class="dk-lattice" data-lattice="${key}" viewBox="0 0 ${size.width} ${size.height}" width="${size.width}" height="${size.height}">${columns}</svg>`;
  };

  // ---------------------------------------------------------------- the cut trace
  // The talk's motif (SPEC.md section 2, "Motifs"): the paragraphs of one trace, a cut, and
  // what lies beyond the cut. Slides 1, 6, 7 and 8 draw it as lines of text, slide 2 as a
  // row of bars in time; both are this block, and a paragraph (.dk-cut__piece) has the same
  // states in both:
  //   (none)      plain: written, and nothing said about who reads it
  //   is-prefix   a paragraph of the prefix: what a reader is shown (teal)
  //   is-read     one a monitor has just read (bars: teal ink)
  //   is-open     not written yet: a dashed amber outline (--dk-dash, 0 to 1, is its strength)
  //   is-beyond   written beyond the cut, which no reader was shown (amber)
  // As lines: `seen` are the paragraphs of the prefix, `unseen` the ones beyond the cut (an
  // empty string leaves the outline empty), `cut` names the cut (an empty string leaves the
  // rule without a name), `end` is the answer chip (left out if not given). `size` is the
  // text's size in stage pixels, 24 or 28. With `plain`, no paragraph carries a state yet:
  // the slide switches is-prefix and is-open on when its cut lands.
  // As bars: `bars` is the row's geometry (kit.cutBars), `end` the place of the answer's
  // bar ({ x, w }), `inner` markup that stands in the row's coordinates (the prompt).
  const CUT_SIZES = Object.freeze({ 24: 0, 28: 1 });
  const cutBars = ({ count, cut, x, w, gap, cutGap }) => {
    const barX = (i) => x + i * (w + gap) + (i >= cut ? cutGap - gap : 0);
    return Object.freeze({ count, cut, w, cutGap, barX, cutX: barX(cut) - cutGap / 2 });
  };
  // One bar: a box with `strokes` lines of writing in it (--dk-ink, 0% to 100%, draws them).
  const cutBar = ({ x, w, strokes = 3, cls = '', data = '', inner = '' }) => `
      <div class="dk-cut__piece dk-cut__bar${cls ? ` ${cls}` : ''}" ${data} style="left:${x}px;width:${w}px"><span class="dk-cut__ink">${'<i></i>'.repeat(strokes)}</span>${inner}</div>`;
  const cutRole = (i, cut) => (i < cut ? `data-seen="${i}"` : `data-unseen="${i - cut}"`);
  const cutTrace = ({ key, seen = [], unseen = [], cut = '', end, size = 24, plain = false, bars, inner = '' }) => {
    if (bars) {
      return `
    <div class="dk-cut dk-cut--bars" data-cut="${key}">${inner}
      ${D.util.range(bars.count).map((i) => cutBar({ x: bars.barX(i), w: bars.w, data: cutRole(i, bars.cut) })).join('')}
      ${end ? cutBar({ x: end.x, w: end.w, strokes: 1, data: 'data-end', inner: '<span class="dk-cut__q">?</span>' }) : ''}
      <i class="dk-cut__rule" style="left:${bars.cutX}px"></i>
    </div>`;
    }
    if (!(size in CUT_SIZES)) throw D.fail(`kit.cutTrace "${key}": size must be one of ${Object.keys(CUT_SIZES).join(', ')} (got ${size})`);
    const line = (role, state) => (text, i) => `
      <div class="dk-cut__piece dk-cut__line${plain ? '' : ` ${state}`}${role === 'unseen' && i % 2 ? ' is-short' : ''}" data-${role}="${i}"><span class="dk-cut__text">${text}</span></div>`;
    return `
    <div class="dk-cut" data-cut="${key}" style="--dk-cut-fs:var(--fs-${CUT_SIZES[size]});--dk-cut-lh:var(--lh-${CUT_SIZES[size]})">
      ${seen.map(line('seen', 'is-prefix')).join('')}
      <div class="dk-cut__rule">${cut ? `<span>${cut}</span>` : ''}</div>
      ${unseen.map(line('unseen', 'is-open')).join('')}
      ${end === undefined ? '' : `<div class="dk-cut__end" data-end>${end}</div>`}
    </div>`;
  };
  // The elements of a mounted cut trace: the paragraphs before and beyond the cut (`pieces`:
  // all of them, in order), their text (lines) or their writing (bars), the cut and the answer.
  const cutParts = (el) => {
    const all = (selector) => Array.from(el.querySelectorAll(selector));
    const inside = (pieces, selector) => pieces.map((piece) => piece.querySelector(selector));
    const seen = all('[data-seen]');
    const unseen = all('[data-unseen]');
    const part = el.classList.contains('dk-cut--bars') ? '.dk-cut__ink' : '.dk-cut__text';
    return Object.freeze({
      seen, unseen, pieces: [...seen, ...unseen],
      seenTexts: inside(seen, part), unseenTexts: inside(unseen, part),
      rule: el.querySelector(':scope > .dk-cut__rule'), end: el.querySelector(':scope > [data-end]'),
    });
  };

  // ---------------------------------------------------------------- question columns
  // One column per question, its traces as dots, the followers on top: red for a trace that
  // follows the hint, green for one that resists (slides 7 and 10). `x` are the columns'
  // middles, `box` the column's box ({ w, top, h, r }), `dotTop` and `pitch` place the dots
  // of radius `r`; `questions` is [{ label, follows, traces }]. The slots take a slide's own
  // marks: `back` lies under the boxes, `under` over the boxes and under the dots, `over`
  // on top. `legendY` draws the key of the two dots at that baseline. `cls` is a class of
  // the part's own on the drawing.
  const colsDot = (spec, col, row) => Object.freeze({ x: spec.x[col], y: spec.dotTop + row * spec.pitch });
  // The arc of one pair, from dot a = [col, row] to dot b: `d` is its path and `mid` its
  // middle. Across columns it leaves each dot toward the other column and arrives level
  // (`bend`: how far the curve runs level, as a share of the way); inside a column it bows
  // out to `side` (1 right, -1 left) by `bow` times the distance between the two dots.
  // `gap` keeps the arc's ends off the dots.
  const colsArc = (spec, a, b, { side = 1 } = {}) => {
    const from = colsDot(spec, a[0], a[1]);
    const to = colsDot(spec, b[0], b[1]);
    const reach = spec.r + (spec.gap ?? 0);
    if (a[0] === b[0]) {
      const x = from.x + side * reach;
      const out = x + side * Math.abs(to.y - from.y) * (spec.bow ?? 0.42);
      return Object.freeze({ d: `M${x} ${from.y} C${out} ${from.y} ${out} ${to.y} ${x} ${to.y}`, mid: Object.freeze({ x: x + (out - x) * 0.75, y: (from.y + to.y) / 2 }) });
    }
    const toward = b[0] > a[0] ? 1 : -1;
    const x1 = from.x + toward * reach;
    const x2 = to.x - toward * reach;
    const run = (x2 - x1) * (spec.bend ?? 0.5);
    return Object.freeze({ d: `M${x1} ${from.y} C${x1 + run} ${from.y} ${x2 - run} ${to.y} ${x2} ${to.y}`, mid: Object.freeze({ x: (x1 + x2) / 2, y: (from.y + to.y) / 2 }) });
  };
  const cols = (spec) => {
    const { key, width, height, x, box, labelY, r, questions, back = '', under = '', over = '', legendY, cls = '' } = spec;
    return `
    <svg class="dk-cols${cls ? ` ${cls}` : ''}" data-cols="${key}" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      ${back}
      ${questions.map((q, c) => `
        <rect class="dk-cols__col" data-col="${c}" x="${x[c] - box.w / 2}" y="${box.top}" width="${box.w}" height="${box.h}" rx="${box.r}"/>
        <text class="dk-cols__label" data-col="${c}" x="${x[c]}" y="${labelY}">${q.label}</text>`).join('')}
      ${under}
      ${questions.map((q, c) => D.util.range(q.traces).map((j) => {
    const p = colsDot(spec, c, j);
    return `<circle class="dk-cols__dot${j < q.follows ? ' is-follows' : ''}" data-col="${c}" data-dot="${c}-${j}" cx="${p.x}" cy="${p.y}" r="${r}"/>`;
  }).join('')).join('')}
      ${over}
      ${legendY === undefined ? '' : `
      <g class="dk-cols__legend">
        <circle class="dk-cols__dot is-follows" cx="8" cy="${legendY - 8}" r="8"/>
        <text x="24" y="${legendY}">follows</text>
        <circle class="dk-cols__dot" cx="148" cy="${legendY - 8}" r="8"/>
        <text x="164" y="${legendY}">resists</text>
      </g>`}
    </svg>`;
  };

  // ---------------------------------------------------------------- the caption of a step
  // What the step on screen says, under (or beside) its picture: lines with a rule at their
  // left. `blocks` is { key: [line, ...] }: one block per step, all in one place, and the
  // timeline shows the current one. The rule belongs to each line, so it is as tall as the
  // lines that are shown and no taller. `tone` colors the rule (a color role); `inner` is
  // markup that shares the caption's place (a result's recommendation).
  const says = (blocks, { tone, inner = '' } = {}) => `
    <div class="dk-says"${attrs({ 'data-tone': tone })}>${Object.entries(blocks).map(([key, lines]) => `
      <div class="dk-says__block" data-says="${key}">${lines.map((line, i) => `<p data-says-line="${key}:${i}">${line}</p>`).join('')}</div>`).join('')}${inner}
    </div>`;
  // Shows the lines of block `key`, line i at times[i] (one time per line); the block
  // `leaves`, which stood there, goes first, at `leaveAt`.
  const say = (step, key, times, { leaves, leaveAt = 0 } = {}) => {
    if (leaves !== undefined) step.tween(`[data-says="${leaves}"]`, { opacity: [1, 0] }, { at: leaveAt, dur: DUR.micro });
    times.forEach((at, i) => step.tween(`[data-says-line="${key}:${i}"]`, { opacity: [0, 1] }, { at, dur: DUR.enter }));
  };

  // ---------------------------------------------------------------- the scope line in its frame
  // What the project is about and what it is not (motifs.scope), framed: on the motivation
  // slide and again on the closing slide. `size` is the step of the type scale (3 or 2);
  // `stacked` sets one sentence to a line.
  const SCOPE_SIZES = Object.freeze([2, 3]);
  const scope = ({ size = 3, stacked = false } = {}) => {
    if (!SCOPE_SIZES.includes(size)) throw D.fail(`kit.scope: size must be one of ${SCOPE_SIZES.join(', ')} (got ${size})`);
    return `<div class="dk-scope${stacked ? ' is-stacked' : ''}" data-size="${size}">${D.motifs.scope.split(/(?<=\.)\s+/).map((sentence) => `<span class="dk-scope__line">${sentence}</span>`).join(' ')}</div>`;
  };

  // ---------------------------------------------------------------- a result and its recommendation
  // The three questions of the talk (motifs.choices) and the four practices it recommends
  // (motifs.recs). A result slide opens on its question, in the words of the motivation
  // slide, with a tag that says how its analyses stand, and ends on a recommendation; the
  // closing slide shows the four recommendations again.
  const choice = (n) => {
    const found = D.motifs.choices[n - 1];
    if (!found) throw D.fail(`kit: there is no question ${n} (motifs.choices has ${D.motifs.choices.length})`);
    return found;
  };
  const standing = (text) => `<span class="dk-chip dk-result__standing">${text}</span>`;
  const resultHead = (n, stands) => `
    <div class="dk-result" data-result="${n}">
      <span class="dk-result__n">Result ${n} of ${D.motifs.choices.length}</span>
      <span class="dk-result__ask">${choice(n).ask}</span>
      ${stands ? standing(stands) : ''}
    </div>`;
  // `short`: the tag is the number alone, for a list that stands under a tag of its own (the
  // closing slide).
  const rec = (n, { short = false } = {}) => {
    const found = D.motifs.recs[n - 1];
    if (!found) throw D.fail(`kit: there is no recommendation ${n} (motifs.recs has ${D.motifs.recs.length})`);
    return `
    <p class="dk-rec" data-rec="${n}">
      <span class="dk-rec__tag">${short ? n : `Recommendation ${n} of ${D.motifs.recs.length}`}</span>
      <span class="dk-rec__move">${found.rec}.</span>
    </p>`;
  };
  // How a count, a tag or a short line arrives: a small overshoot inside its own row. A line
  // as wide as the stage does not arrive this way: enlarged, it would reach past the stage.
  const POP = Object.freeze({ opacity: [0, 1], scale: [1.15, 1] });
  // A result's head arrives: its number, its question, then the tag.
  const enterResult = (step) => {
    step.show('.dk-result__n', { at: 150, rise: 0 });
    step.show('.dk-result__ask', { at: 250, rise: 0 });
    step.tween('.dk-result__standing', POP, { at: 700, dur: DUR.enter, ease: 'back' });
  };

  // ---------------------------------------------------------------- counting up to a fact
  // A count as the facts print it: digits in groups of three.
  const grouped = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  // Counts a number from `from` up to a fact's value. The counter ends on the fact's own
  // text, or the slide fails: what stays on screen is the registered wording.
  const countTo = (step, target, key, { from = 0, format = grouped, ...timing } = {}) => {
    const fact = D.fact(key);
    if (format(fact.value) !== fact.text) throw D.fail(`fact "${key}" prints "${fact.text}", the counter ends on "${format(fact.value)}"`);
    return step.count(target, [from, fact.value], { dur: DUR.move, ...timing, format });
  };

  D.kit = Object.freeze({
    term, meter, grid, flag, lens, legend, lattice, latticePoint, latticeSize,
    trace, traceParts, readTrace, stamp, setTrace, decay,
    cutTrace, cutParts, cutBars, cutBar, cols, colsDot, colsArc, says, say, scope,
    resultHead, standing, rec, enterResult, POP, grouped, countTo,
  });
})();
