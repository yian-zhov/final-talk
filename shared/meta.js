// Deck-wide facts: title, the authors and the three parts.
// `title` is the title of the paper's v2 (\title of main_v2.tex, line 41 of the snapshot
// sources/paper-v2-tex/, its line breaks as spaces); tools/selftest.mjs compares the two.
// Shared file. `authors` are the real names, in the order of the project proposal; they stand
// on the title slide alone, each followed by the same mark. No part is assigned to a name.
// A part's `name` is the plain name of that third of the talk. The kicker over a slide's title
// does not show it: every slide of the talk sets its own kicker, "Part N · <course block>",
// with one of the six blocks the course asks a final presentation to have (SPEC.md, section 2;
// tools/selftest.mjs checks that all six stand on screen, in order).
Deck.configure({
  title: 'When Is a Resampling Ceiling a Ceiling? Bounds and Alarm Timing for Chain-of-Thought Prefix Monitors',
  course: 'CS6120 · Final Project',
  authors: ['Yizhang Cao', 'Sicheng Xue', 'Yian Zhou'],
  parts: {
    1: { name: 'The problem and the data' },
    2: { name: 'How a prefix monitor is scored' },
    3: { name: 'What we found' },
  },
});
