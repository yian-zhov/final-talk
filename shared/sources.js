// Bibliography registry. A slide cites by key: cite: [{ src: 'paper', where: 'Table 2' }].
// The footer prints `short, where`; the final Sources slide prints `authors. title. full ?? ref`.
// Shared file. `paper` is this project's own paper, read in its v2 draft: the PDF
// sources/paper-v2-draft.pdf (main text and references; sources/README.md has its digest),
// whose section, table and figure numbers the cites use. shared/facts.js names the page and
// the words behind every fact, and SPEC.md section 7.13 records the change of source. It
// names no author: the authors' names stand on the title slide alone. `talk1` is the special
// topic talk that this talk's second slide takes up (the deck of the sibling worktree,
// special-topic/). Every other entry is a paper of that PDF's reference list (pages 17 to
// 21: title, authors and arXiv id as printed there, compared on 2026-11-19); none of those
// papers was opened for this deck.
// A part that needs another source registers it in its own file with Deck.addSources.
Deck.addSources({
  paper: {
    short: 'Our paper',
    authors: 'This project',
    title: 'How Not to Score a Chain-of-Thought Prefix Monitor: Scoring Pitfalls Measured on a Hint-Following Task',
    ref: 'CS6120 final paper, 2026',
  },
  talk1: {
    short: 'Our special topic talk',
    authors: 'This group',
    title: 'When Thoughts Stop Being Words',
    ref: 'CS6120 special topic, 2026',
  },
  korbak2025: {
    short: 'Korbak et al. 2025',
    authors: 'Korbak, Balesni, Barnes, Bengio, Benton, Bloom, et al.',
    title: 'Chain of Thought Monitorability: A New and Fragile Opportunity for AI Safety',
    ref: 'arXiv:2507.11473',
  },
  jia2026: {
    short: 'Jia et al. 2026',
    authors: 'Jia, Liu, Chong, et al.',
    title: 'The Window Is in the Reasoning: When LLM Agents Decide to Follow Prompt Injections',
    ref: 'arXiv:2610.24048',
  },
  // The paper's reference list has three entries of this author and year and prints this
  // one as "Young (2026c)" (page 21 of the PDF).
  young2026lie: {
    short: 'Young 2026c',
    authors: 'Young',
    title: 'Lie to Me: How Faithful Is Chain-of-Thought Reasoning in Open-Weight Reasoning Models?',
    ref: 'arXiv:2603.22582',
  },
  gema2024: {
    short: 'Gema et al. 2024',
    authors: 'Gema, Leang, Hong, et al.',
    title: 'Are We Done with MMLU?',
    ref: 'arXiv:2406.04127',
  },
  merrill2026: {
    short: 'Merrill & Srivastava 2026',
    authors: 'Merrill, Srivastava',
    title: 'The Point of No Return: Counterfactual Localization of Deceptive Commitment in Language-Model Reasoning',
    ref: 'arXiv:2605.17113',
  },
});
