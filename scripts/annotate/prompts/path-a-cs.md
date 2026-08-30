# Annotation rubric — counter-stereotypical exemplar attributes

You are annotating US political news reports for a research prototype. For each
report you are given the publishing outlet, the headline, and whatever publisher-written
text has survived in a web archive: the publisher's own summary, the article text, or
neither. How much text you get varies from report to report. Nothing has been withheld
from you — what you see is everything that exists for that report.

Judge each report **only on the text you are given**. Do not draw on outside knowledge
about the people, outlets, or events involved, and do not infer facts the text does not
state.

Judge the three attributes below **independently of one another**. An attribute is not
more or less likely to hold because another one does.

---

## When the text does not let you decide

Each attribute has a third outcome, `"insufficient_evidence"`. Return it when the text
you were given does not let you decide that attribute either way. **Do not guess.**

Abstaining is not a failure and it is not a negative judgment. The two are different
claims and are recorded separately:

- `"no"` (or `"none"` for violation strength) says: *I read the text, and the attribute
  does not hold.* A report that depicts no partisan actor at all — pure event coverage,
  court procedure, statistics, a policy explainer — is a **decision**, not an abstention:
  you can see there is no actor. Judge it `"no"` / `"none"`.
- `"insufficient_evidence"` says: *the text does not tell me enough to decide.* This is
  the right answer when you have only a headline, or when the surviving text stops before
  it reaches anything bearing on the attribute.

Each attribute abstains **independently**. It is normal to decide one attribute and
abstain on another for the same report.

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
`heterogeneity` are both `"no"` and `violation.level` is `"none"`. That is a decision,
not an abstention — you can see from the text that there is no actor.

---

## Attribute 1 — Typicality (`typicality`)

**Is the actor presented as an ordinary member of their group?**

`"yes"` when all of the following hold:

- the actor's partisan affiliation is clear from the text;
- their role is a routine one for that group — a rank-and-file legislator, a local or
  state official, a sheriff, a party organization, an ordinary supporter or member;
- the text does not frame them as a maverick, a rebel, a renegade, an outlier, or
  "unlike other" members of their party;
- the text does not emphasize their distance or estrangement from their own party.

`"no"` when the actor is a national celebrity, a marquee politician whose name alone
carries a national profile, or anyone the text codes as an exception to their group.

`"insufficient_evidence"` when the text names an actor but says nothing about their role,
standing, or affiliation — you cannot tell whether they are ordinary or exceptional.

Why the bar is set here: an actor already perceived as atypical is filed away as an
exception rather than updating the perception of the group, so the counter-stereotypical
information does not generalize (Wilder 1984; Johnston & Hewstone 1992; Richards &
Hewstone 2001).

## Attribute 2 — Heterogeneity cues (`heterogeneity`)

**Does the report explicitly signal that this is not a single individual?**

`"yes"` when the text itself states at least one of:

- multiple members of the group are involved in the same position or action;
- opinion within the party is split, contested, or divided;
- survey or membership figures indicating that a moderate or dissenting position is
  widely held within the group;
- a trend, a surge, or a growing number of members moving in this direction.

`"no"` when the report describes one person or one action with no indication of how
common it is. A reader's inference that "there must be others" does not count — the
signal has to be on the page.

`"insufficient_evidence"` when the text is too thin to establish even that much — a bare
headline naming an action, with nothing said about who or how many.

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
- `"insufficient_evidence"` — the text does not state a position clearly enough to place
  the departure anywhere on this scale. Do not fall back on `"none"` for this; `"none"`
  asserts that you looked and there is no departure.

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

- Quote **verbatim** from the text you were given. Copy the characters exactly; do
  not paraphrase, translate, or repair the wording.
- Keep it under 200 characters — the shortest span that carries the judgment.
- When the attribute holds, quote the span that establishes it.
- When it does not hold, quote the span that most bears on the question — usually the
  one that comes closest without meeting the bar.
- When the report contains nothing bearing on the attribute at all, use the empty
  string `""`.
- When you abstain, quote the span that came closest to letting you decide, or the empty
  string `""` if there was nothing at all. The `evidence` field is how a reader checks
  that the abstention was warranted.

Never write an `evidence` value that does not appear in the text you were given.

---

## Output

Return a single JSON object matching the supplied schema. No prose outside the JSON.
