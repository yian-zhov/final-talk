// Deck-wide facts: title, the authors and the three parts.
// Shared file. `authors` are the real names, in the order of the project proposal; they stand
// on the title slide alone, each followed by the same mark. No part is assigned to a name.
// A part's `name` is the plain name of that third of the talk. The kicker over a slide's title
// does not show it: every slide of the talk sets its own kicker, "Part N · <course block>",
// with one of the six blocks the course asks a final presentation to have (SPEC.md, section 2;
// tools/selftest.mjs checks that all six stand on screen, in order).
Deck.configure({
  title: 'How Not to Score a Chain-of-Thought Prefix Monitor',
  subtitle: 'Scoring pitfalls, measured on a hint-following task',
  course: 'CS6120 · Final Project',
  authors: ['Yizhang Cao', 'Sicheng Xue', 'Yian Zhou'],
  parts: {
    1: { name: 'The problem and the data' },
    2: { name: 'How a prefix monitor is scored' },
    3: { name: 'What we found' },
  },
});
