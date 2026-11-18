// The last slide: every source cited by any slide, in order of first use, with the slides
// that cite it, and what the tags in the footers mean (and the one tag beside a result).
// Generated from the registry, so parts never edit a shared reference list.
(() => {
  'use strict';

  const D = window.Deck;
  const keys = D.slides
    .flatMap((slide) => slide.cite.map((c) => c.src))
    .filter((key, i, all) => all.indexOf(key) === i);

  // Where each source is used: the slide numbers that cite it.
  const usedOn = (key) => D.slides
    .map((slide, i) => (slide.cite.some((c) => c.src === key) ? i + 1 : 0))
    .filter(Boolean);

  const rows = keys.map((key) => {
    const s = D.sources[key];
    const who = (s.authors ?? s.short).replace(/\.$/, '');
    const on = usedOn(key);
    // A title that ends in its own mark (a question) gets no period after it.
    const title = /[.?!]$/.test(s.title) ? s.title : `${s.title}.`;
    return `<li><b>${who}.</b> ${title} <span class="dk-ref">${s.full ?? s.ref}</span> <span class="dk-used">slide${on.length > 1 ? 's' : ''} ${on.join(', ')}</span></li>`;
  }).join('');

  // What the tags in the footers mean: those that a footer of this deck carries
  // (Deck.tagLegend, core/deck.js). A definition without a slide to look at would only
  // raise the question of where that tag is.
  const tags = D.tagLegend(D.slides);

  // The one tag of the talk that no footer carries: the chip "exploratory", which Part 3
  // sets beside a result. The first legend (slide 2) explains it in a row of its own under
  // the footer tags; this one does too, in the same words ('p1.exploratory'), so that the
  // legend which stays up during questions holds every tag the room has seen. The row is
  // outside the list: the list is the footer tags in use and no other (tools/selftest.mjs).
  // Like a footer tag, it is listed only if a slide shows it: a slide whose markup holds the
  // chip and no legend of its own (the first legend shows the chip to explain it).
  const MARK = Object.freeze({ tag: 'exploratory', fact: 'p1.exploratory' });
  const asChip = new RegExp(`class="dk-chip[^"]*">${MARK.tag}<`);
  const marked = D.slides.some((slide) => asChip.test(slide.html) && !/dk-tags__list/.test(slide.html));
  const mark = marked
    ? `<p class="dk-tags__mark"><span class="dk-chip">${MARK.tag}</span><span class="dk-tags__means">beside a result: ${D.fact(MARK.fact).text}</span></p>`
    : '';

  D.register({
    id: 'sources',
    part: 0,
    kicker: 'Sources',
    title: 'Every reported number traces to one of these',
    cues: [],
    cite: [],
    html: `
      <ol class="dk-sources">${rows}</ol>
      <div class="dk-tags">
        <div class="dk-tags__head">The tags in the footers</div>
        <ul class="dk-tags__list">${tags}</ul>${mark}
      </div>`,
    setup: (ctx) => {
      const enter = ctx.step();
      enter.show('.dk-sources li', { stagger: 40 });
      enter.show('.dk-tags', { at: 400 });
    },
  });
})();
