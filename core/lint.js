// In-page lint for the slide on screen: projection legibility and layout overflow; and the
// text of the slide as the audience sees it (visibleText, at the end of this file).
// tools/capture.mjs --lint calls it at the end of every step. Canvas text is not visible
// to this check; keep canvas fonts at 24px or more by hand.
(() => {
  'use strict';

  const D = window.Deck;
  const MIN_FONT_PX = 24;
  const TITLE_MAX_LINES = 2;
  const EDGE_TOLERANCE_PX = 1;

  const ownText = (el) => Array.from(el.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent.trim())
    .join(' ')
    .trim();

  const stageScale = (root) => root.getBoundingClientRect().width / D.STAGE.width;

  // Font size in stage pixels. SVG text is measured through its transform to the screen.
  const fontPx = (el, scale) => {
    const size = parseFloat(getComputedStyle(el).fontSize);
    if (!(el instanceof SVGElement) || !el.getScreenCTM) return size;
    const ctm = el.getScreenCTM();
    return ctm ? (size * Math.hypot(ctm.a, ctm.b)) / scale : size;
  };

  const lintSlide = (mounted) => {
    const root = document.getElementById('dk-root');
    const scale = stageScale(root);
    const box = root.getBoundingClientRect();
    const id = mounted.def.id;
    const finding = (rule, detail) => ({ slide: id, rule, detail });
    const textNodes = Array.from(mounted.section.querySelectorAll('*')).filter((el) => ownText(el));

    const small = textNodes
      .map((el) => ({ el, px: fontPx(el, scale) }))
      .filter(({ px }) => px < MIN_FONT_PX - 0.01)
      .map(({ el, px }) => finding('font-size', `${px.toFixed(1)}px < ${MIN_FONT_PX}px: "${ownText(el).slice(0, 40)}"`));

    const outside = textNodes
      .filter((el) => getComputedStyle(el).visibility !== 'hidden' && Number(getComputedStyle(el).opacity) > 0)
      .map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.width > 0 && (r.left < box.left - EDGE_TOLERANCE_PX || r.right > box.right + EDGE_TOLERANCE_PX
        || r.top < box.top - EDGE_TOLERANCE_PX || r.bottom > box.bottom + EDGE_TOLERANCE_PX))
      .map(({ el }) => finding('off-stage', `text outside the 1920x1080 stage: "${ownText(el).slice(0, 40)}"`));

    const title = mounted.section.querySelector('.dk-title');
    const titleLines = title ? Math.round(title.getBoundingClientRect().height / scale / parseFloat(getComputedStyle(title).lineHeight)) : 0;
    const longTitle = titleLines > TITLE_MAX_LINES ? [finding('title-lines', `title wraps to ${titleLines} lines (max ${TITLE_MAX_LINES})`)] : [];

    // Visible content that pokes out of its container. Elements not yet revealed (opacity 0)
    // do not count; an element marked data-bleed (and its content) may leave the stage on purpose.
    const spillOf = (selector, rule) => {
      const container = mounted.section.querySelector(selector);
      if (!container) return [];
      const edge = container.getBoundingClientRect();
      const out = (r) => r.left < edge.left - EDGE_TOLERANCE_PX || r.right > edge.right + EDGE_TOLERANCE_PX
        || r.top < edge.top - EDGE_TOLERANCE_PX || r.bottom > edge.bottom + EDGE_TOLERANCE_PX;
      return Array.from(container.querySelectorAll('*'))
        .filter((el) => !el.closest('[data-bleed]') && el.checkVisibility({ opacityProperty: true, visibilityProperty: true }))
        .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && out(r); })
        .slice(0, 3)
        .map((el) => finding(rule, `<${el.tagName.toLowerCase()} class="${el.getAttribute('class') ?? ''}"> extends beyond ${selector}`));
    };
    const cite = mounted.section.querySelector('.dk-cite');
    const cutCite = cite && cite.scrollWidth > cite.clientWidth + EDGE_TOLERANCE_PX
      ? [finding('cite-truncated', `footer cite needs ${cite.scrollWidth}px, has ${cite.clientWidth}px; shorten "where"`)]
      : [];

    const noCite = mounted.def.layout === 'default' && mounted.def.part !== 0 && !mounted.def.cite.length
      ? [finding('no-cite', 'a default-layout slide states facts and needs at least one cite')]
      : [];

    // A cite marked `named` is left out of the footer because the slide names the source on
    // screen: one of the forms of its name (Deck.namedAs) has to stand in the stage's text.
    const stageText = (mounted.section.querySelector('.dk-stage')?.textContent ?? '').replace(/\s+/g, ' ');
    const notNamed = mounted.def.cite
      .filter((c) => c.named && !D.namedAs(c.src).some((name) => stageText.includes(name)))
      .map((c) => finding('cite-not-named', `cite of "${c.src}" is marked named, but the stage does not print ${D.namedAs(c.src).map((name) => `"${name}"`).join(' or ')}`));

    return [...small, ...outside, ...longTitle, ...spillOf('.dk-stage', 'stage-overflow'),
      ...spillOf('.dk-cues', 'cues-overflow'), ...cutCite, ...noCite, ...notNamed];
  };

  // The text of a slide as the audience sees it now: one entry per text node that is on the
  // stage and not transparent (its own opacity times that of every element around it, above
  // 0.05). `key` names the node's place in the slide, so that two states can be compared
  // node by node; `aside` marks a note to whoever builds the slide (an element with
  // data-aside, as a storyboard's notes are), which is not a word of the talk.
  // tools/words.mjs counts the words a step brings from this; tools/selftest.mjs reads the
  // statements a slide must show.
  const VISIBLE_OPACITY = 0.05;
  const placeOf = (node, top) => {
    const path = [];
    for (let at = node; at && at !== top; at = at.parentNode) path.unshift(Array.prototype.indexOf.call(at.parentNode.childNodes, at));
    return path.join('.');
  };
  const opacityOf = (el, top) => {
    let value = 1;
    for (let at = el; at && at !== top.parentElement; at = at.parentElement) value *= Number(getComputedStyle(at).opacity);
    return value;
  };
  const visibleText = (mounted) => {
    const box = document.getElementById('dk-root').getBoundingClientRect();
    const walker = document.createTreeWalker(mounted.section, NodeFilter.SHOW_TEXT);
    const entries = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.nodeValue.replace(/\s+/g, ' ').trim();
      const el = node.parentElement;
      if (!text || !el) continue;
      const r = el.getBoundingClientRect();
      const onStage = r.width > 0 && r.height > 0 && r.right > box.left && r.left < box.right && r.bottom > box.top && r.top < box.bottom;
      if (!onStage || getComputedStyle(el).visibility === 'hidden' || opacityOf(el, mounted.section) <= VISIBLE_OPACITY) continue;
      entries.push({ key: placeOf(node, mounted.section), text, aside: Boolean(el.closest('[data-aside]')) });
    }
    return entries;
  };

  D.lint = lintSlide;
  D.visibleText = visibleText;
})();
