// Reference slide for part authors: one slide that uses every piece of the registration API.
// Not part of the talk. It registers only when the URL has ?sample (capture: --sample).
// Read-only for parts: copy patterns from here into parts/partN.js.
(() => {
  'use strict';
  if (!Deck.flags.sample) return;

  // Numbers never appear as literals: they come from shared/facts.js by key.
  const READERS = Object.freeze([
    { key: 'opus_ap', name: 'reader.opus_ap.name', within: 'reader.opus_ap.within', pooled: 'reader.opus_ap.pooled' },
    { key: 'qwen8', name: 'reader.qwen8.name', within: 'reader.qwen8.within', pooled: 'reader.qwen8.pooled' },
  ]);
  const RING = Object.freeze({ size: 360, radius: 150, width: 28, backing: 2 });
  const score = (v) => (v / 100).toFixed(2);
  const turn = (share) => -Math.PI / 2 + (Math.PI * 2 * share) / 100;

  // A canvas painter is a pure function of its inputs: same inputs, same pixels.
  const drawRing = (canvas, from, to, color) => {
    const c = canvas.getContext('2d');
    const mid = RING.size / 2;
    const arc = (a, b, stroke) => {
      c.strokeStyle = stroke;
      c.beginPath();
      c.arc(mid, mid, RING.radius, turn(a), turn(b));
      c.stroke();
    };
    c.setTransform(RING.backing, 0, 0, RING.backing, 0, 0);
    c.clearRect(0, 0, RING.size, RING.size);
    c.lineWidth = RING.width;
    c.lineCap = 'butt';
    arc(0, 100, color('surface-2'));
    arc(0, from, color('dim'));
    if (to > from) arc(from, to, color('read'));
  };

  const readerRow = (kit, reader) => `
    <div class="sm-hack">
      <div class="sm-hack__name">${Deck.fact(reader.name).text}</div>
      ${kit.meter({ key: `${reader.key}-within`, label: 'Within question', tone: 'dim' })}
      ${kit.meter({ key: `${reader.key}-pooled`, label: 'Pooled', tone: 'read' })}
    </div>`;

  Deck.register({
    id: 'sample',                       // lowercase; a part's ids start with p1-, p2- or p3-
    part: 0,                            // 1, 2 or 3 in a part file; decides the kicker ("Part N · name") and the progress segment
    kicker: 'Sample slide · not in the talk',   // optional; default is "Part N · name"
    title: 'Pooling lifts a reader’s score, <em>even a reader that reads nothing</em>',   // one conclusion sentence
    cues: [                             // at most 3, about 10 words each; `step` = when it appears
      'Two of the nine readers, at half of the reasoning',
      { text: 'Within question: only pairs that share a prompt', step: 1 },
      { text: 'Pooled: every pair, whatever the question', step: 2 },
    ],
    cite: [{ src: 'paper', where: 'Table 2; Fig. 2a' }],   // keys from shared/sources.js
    figure: 'data',                     // 'data' | 'schematic' | 'illustrative': tag in the footer
    html: `
      <div class="sm-wrap">
        <div class="sm-term">
          ${Deck.kit.term({ label: 'Two readers', lines: ['first', 'second', 'note'] })}
        </div>
        <div class="sm-hacks">${READERS.map((reader) => readerRow(Deck.kit, reader)).join('')}</div>
        <div class="sm-ring">
          <canvas width="${RING.size * RING.backing}" height="${RING.size * RING.backing}"></canvas>
          <div class="sm-ring__text"><span class="sm-ring__num"></span><span class="sm-ring__label">prompt only</span></div>
        </div>
      </div>`,
    setup: (ctx) => {
      const { fact, dur } = ctx;
      const canvas = ctx.q('.sm-ring canvas');
      // The ring is drawn in hundredths: a reader that sees only the prompt, within and pooled.
      const joint = { from: fact('pooled.prompt_only_within').value * 100, to: fact('pooled.prompt_only').value * 100 };

      // The first ctx.step() is the entrance: it plays when the slide arrives.
      const enter = ctx.step({ label: 'the two readers' });
      enter.show('.sm-term', { at: 300 });
      enter.type('[data-line="first"]', fact(READERS[0].name).text, { at: 700, cps: 14 });
      enter.type('[data-line="second"]', fact(READERS[1].name).text, { at: enter.end + 200, cps: 14 });
      enter.type('[data-line="note"]', 'read the same prefixes', { at: enter.end + 200 });
      enter.cls('[data-line="note"]', 'is-quiet');
      enter.show('.sm-hack', { at: enter.end, stagger: 120 });

      // Every later ctx.step() is one click. Going back shows the previous step's end state.
      const bars = (step, field, startAt) => READERS.forEach((reader, i) => {
        const meter = `[data-meter="${reader.key}-${field}"]`;
        const value = fact(reader[field]).value * 100;
        const timing = { at: startAt + i * 240, dur: dur.move };
        step.tween(`${meter} .dk-meter__fill`, { '--v': ['0%', `${value}%`] }, timing);
        step.count(`${meter} .dk-meter__value`, [0, value], { ...timing, format: score });
      });
      bars(ctx.step({ label: 'within question' }), 'within', 0);
      bars(ctx.step({ label: 'pooled' }), 'pooled', 0);

      // A signal is a number that moves with the clock; ctx.paint redraws from it every frame.
      const reveal = ctx.step({ label: 'a reader that sees only the prompt' });
      reveal.show('.sm-ring', { rise: 0 });
      const sweep = reveal.signal({ at: 400, dur: dur.reveal, ease: 'inOut' });
      reveal.count('.sm-ring__num', [joint.from, joint.to], { at: 400, dur: dur.reveal, ease: 'inOut', format: score });
      reveal.cls('.sm-ring__num', 'c-read', { at: 400 + dur.reveal });
      ctx.paint(() => drawRing(canvas, joint.from, joint.from + (joint.to - joint.from) * sweep(), ctx.color));
    },
  });
})();
