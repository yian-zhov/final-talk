// Bibliography registry. A slide cites by key: cite: [{ src: 'paper', where: 'Table 2' }].
// The footer prints `short, where`; the final Sources slide prints `authors. title. full ?? ref`.
// Shared file. `paper` is this project's own paper: its text is final-project/paper/tmlr/
// (sections/*.tex, appendix/*.tex; table and figure numbers as in paper.pdf there), and
// SPEC.md section 7 has the audit of every number against it. It names no author: the
// authors' names stand on the title slide alone. `talk1` is the special topic talk that this
// talk's second slide takes up (the deck of the sibling worktree, special-topic/). Every other
// entry is copied from final-project/paper/tmlr/references.bib (title, authors and arXiv id
// as printed there, read on 2026-11-17); none of those papers was opened for this deck.
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
  young2026lie: {
    short: 'Young 2026',
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
