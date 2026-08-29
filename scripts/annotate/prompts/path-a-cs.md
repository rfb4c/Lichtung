# Annotation rubric — counter-stereotypical exemplar attributes

You are annotating US political news reports for a research prototype. For each
report you are given its headline, its summary, and the publishing outlet.

Judge each report **only on what the headline and summary actually state**. Do not
draw on outside knowledge about the people, outlets, or events involved, and do not
infer facts the text does not state. If the text is silent on something an attribute
depends on, that attribute is not satisfied.

Judge the three attributes below **independently of one another**. An attribute is not
more or less likely to hold because another one does.

---

## The stereotype at issue

The relevant stereotype is the perception that the two US parties are internally
homogeneous blocs whose members hold uniform, predictable, and extreme positions on
partisan issues.

A report bears on that stereotype when it depicts an identifiable partisan actor —
a politician, an official, an organization, or a group of ordinary partisans — whose
stated position, behavior, or affiliation does not fit what the stereotype predicts.

If a report depicts no identifiable partisan actor at all (pure event coverage, court
procedure, statistics, or a policy explainer with no actor), then `typicality` and
`heterogeneity` are both `false` and `violation.level` is `"none"`.

---

## Attribute 1 — Typicality (`typicality`)

**Is the actor presented as an ordinary member of their group?**

`true` when all of the following hold:

- the actor's partisan affiliation is clear from the text;
- their role is a routine one for that group — a rank-and-file legislator, a local or
  state official, a sheriff, a party organization, an ordinary supporter or member;
- the text does not frame them as a maverick, a rebel, a renegade, an outlier, or
  "unlike other" members of their party;
- the text does not emphasize their distance or estrangement from their own party.

`false` when the actor is a national celebrity, a marquee politician whose name alone
carries a national profile, or anyone the text codes as an exception to their group.

Why the bar is set here: an actor already perceived as atypical is filed away as an
exception rather than updating the perception of the group, so the counter-stereotypical
information does not generalize (Wilder 1984; Johnston & Hewstone 1992; Richards &
Hewstone 2001).

## Attribute 2 — Heterogeneity cues (`heterogeneity`)

**Does the report explicitly signal that this is not a single individual?**

`true` when the text itself states at least one of:

- multiple members of the group are involved in the same position or action;
- opinion within the party is split, contested, or divided;
- survey or membership figures indicating that a moderate or dissenting position is
  widely held within the group;
- a trend, a surge, or a growing number of members moving in this direction.

`false` when the report describes one person or one action with no indication of how
common it is. A reader's inference that "there must be others" does not count — the
signal has to be on the page.

Why: the target mechanism is the underestimation of within-group variance, so an
explicit cue that the group is internally varied is what does the work (Park & Rothbart
1982; Brauer & Er-rafiy 2011; Santos et al. 2024).

## Attribute 3 — Violation strength (`violation.level`)

**How far does the depicted position depart from the stereotype?**

- `"none"` — the depicted position is what the stereotype predicts, or the report is
  not about a partisan position at all.
- `"moderate"` — the actor departs from the stereotype on one or two dimensions while
  remaining recognizably a member of their group. A Republican official backing one
  specific gun-safety measure; a Democratic mayor backing an enforcement policy; a
  hunter arguing for background checks.
- `"extreme"` — the actor's whole ideological identity is reversed, or the departure is
  so dramatic that the actor reads as a defector rather than a member. Switching parties,
  renouncing their previous politics wholesale, or a portrayal built entirely around how
  extraordinary the person is.

Only `"moderate"` counts toward the score. The relationship is an inverted U: too small
a departure carries no new information, and too large a departure is dismissed as a
special case that says nothing about the group (Weber & Crocker 1983; Kunda & Oleson
1995).

---

## Prototype (`prototype`)

Name which of the three content types this report is, if any. This label is descriptive
and does not affect the attribute judgments — assign it after judging the attributes.

- `"cross_party"` — members of opposing parties acting together, or a member acting
  across the party line: joint bills, bipartisan coalitions, cross-aisle endorsements.
- `"intra_dissent"` — disagreement inside one party: members breaking with the party
  position, internal splits, factions.
- `"individuating"` — one named, concretely described person whose account of their own
  position cuts against the stereotype of their group.
- `null` — none of the three fits.

---

## Evidence

Every attribute judgment carries an `evidence` string.

- Quote **verbatim** from the headline or the summary. Copy the characters exactly; do
  not paraphrase, translate, or repair the wording.
- Keep it under 200 characters — the shortest span that carries the judgment.
- When the attribute holds, quote the span that establishes it.
- When it does not hold, quote the span that most bears on the question — usually the
  one that comes closest without meeting the bar.
- When the report contains nothing bearing on the attribute at all, use the empty
  string `""`.

Never write an `evidence` value that does not appear in the text you were given.

---

## Output

Return a single JSON object matching the supplied schema. No prose outside the JSON.
