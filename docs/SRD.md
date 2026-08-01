# Whitecoat Map — System Requirements Document

**Tagline:** The hidden curriculum of getting into medical school in Texas, written down.
**Domain:** whitecoatmap.com (available as of 2026-07-25; registration deferred to launch — decided 2026-08-01)
**Owner:** Hezekiah Lasater
**Status:** Approved, revision 2
**Date:** 2026-07-25

**Revision 2 changes:** Name selected. Accounts and personalized roadmap removed from v1 entirely; v1 is data, data visualization, and guides. Architecture must remain account-ready without building accounts. Data rigor raised to a reproducible pipeline with archived source snapshots.

---

## 1. Problem

A student's odds of reaching medical school depend heavily on whether someone tells them what to do, and when. The information is public, but fragmented across the AAMC, AACOM, TMDSAS, individual school pages, forum threads, YouTube advisors, and paid consultants. None of it is sequenced. Almost none is state-specific. The students who succeed usually had a parent, an advisor, or a peer group who decoded it for them.

This is measurable. A 2024 PLOS One study of California's public universities found pre-health advisor-to-graduate ratios of roughly 1:24,620 at CSU campuses versus 1:1,794 at private institutions — about 13x less access at the less-resourced schools. The authors name first-generation and underrepresented students as the most affected, precisely because they lack the informal networks that substitute for formal advising.

The concrete failure this project exists to prevent: **a Pell-eligible Texas student reaches their junior year having never heard of JAMP**, a state program offering a structured path to guaranteed admission at a participating Texas medical school — which must be applied for in the freshman or sophomore year. By the time the information reaches them through normal channels, the door has closed.

## 2. Users

**Primary — the no-map student.** First-generation, non-traditional, rural, inner-city, or community-college-routed. Early in the path. Does not yet know what questions to ask. Every decision optimizes for this person. Assume no prior knowledge, no advisor, no premed friends, and a phone as the primary device.

**Secondary — pre-health advisors, counselors, and teachers.** People who need something correct and free to hand a student. They are the distribution channel and the credibility check. Content must be accurate and citable enough that a professional will attach their name to recommending it.

**Explicitly not the target:** high-stat applicants optimizing school lists. Already well served. No requirement is written for them.

## 3. Landscape and positioning

Researched 2026-07-25.

### Already solved — cite, link, do not rebuild

| Resource                                | What it does                                                                            | Cost                                         |
| --------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------- |
| AAMC MSAR                               | Canonical school-level admissions data, MD only                                         | Paid (~$28/yr); free via AAMC Fee Assistance |
| Premier Exam Prep free MSAR alternative | 209 MD + DO schools, per-field clickable citations, no account, local list-building     | Free                                         |
| MedSchoolCoach Med School Explorer      | 212 schools incl. 37 DO, tuition, secondary prompts, interview format                   | Free (funnel to paid)                        |
| MyMedStack                              | School and residency explorer                                                           | Free tier                                    |
| GradPilot                               | TMDSAS GPA-by-MCAT crossed acceptance grids, EY2020-2025 pooled, open dataset on GitHub | Free content, paid essay review              |
| AAMC free reports                       | 22 free PDF reports from the MSAR site; FACTS tables                                    | Free                                         |
| AACOM research reports                  | DO applicant/matriculant data by college, historical series                             | Free                                         |
| TMDSAS stats dashboard                  | Official Texas application data reports, 10-year trends                                 | Free                                         |

A national school-stats **table** is a solved problem and we will not build one. We link these tools by name and teach students to use them.

### Where the room actually is

Nobody has built a **visual, interpreted, fully sourced explanation of the Texas admissions landscape tied to guides that say what it means.** The data exists in PDFs, dashboards, and executive summaries that a 17-year-old cannot parse. GradPilot demonstrated the appetite with a single crossed grid; the field is otherwise empty.

### Closest guidance competitor

**The UpLIFT Project** (uplift.guide) — a nonprofit, open-access, 18-chapter guide by ~26 Penn medical students for underrepresented, low-income, and first-generation applicants, published in _Academic Medicine_ (2021). Genuinely good, shares our mission.

Room it leaves: national and generic (no TMDSAS, no Texas residency rules, no JAMP, no Texas schools); a downloadable document rather than a navigable, updatable site; published 2020-21 with no visible freshness signal; no visualization; no per-fact sourcing.

Everything else — MedEdits, Shemmassian, AcceptMed, MedSchoolCoach, JackWestin, Med School Insiders, Medical School Headquarters — is substantial free content funneling toward paid consulting, organized by SEO topic rather than by where a student stands.

The FGLI support ecosystem (Rise First, FGLIMed, Project S.H.O.R.T., Pre-Health Dreamers, AAMC first-gen resources) provides community and mentorship, not a sequenced manual. Partners and outbound links, not competitors.

### Positioning

> The free, Texas-specific operating manual for becoming a doctor — with the data drawn out where you can actually see it — written for someone who has no one to ask.

We win on: state specificity, visual clarity, plain language, no paywall and no upsell, and per-fact sourcing with visible verification dates.

## 4. Scope of v1

Four modules. No accounts, no personalization, no saved state.

### Module A — The Data (co-primary)

Four headline visualizations, all Texas, all sourced:

1. **Acceptance landscape grid** — GPA crossed against MCAT, colored by historical acceptance rate, split by Texas resident and non-resident. The most-wanted view in Texas premed. _(Corrected 2026-08-01 by the Phase 0 audit:)_ TMDSAS does publish crossed GPA × MCAT data — in archived per-year PDF matrices and inside its Power BI dashboard's data model — but never as a readable, linkable grid. That readable view is what we build; see `docs/SOURCES.md`.
2. **The Texas funnel** — how a cohort moves through the pipeline: Texans who apply, interview, are accepted, and matriculate, with dropoff at each stage. Reframes "am I good enough" into "here is what the process actually is."
3. **Per-school profiles** — consistent small charts on each school page: GPA and MCAT ranges rather than bare medians, class size, in-state share, cost.
4. **Trends over time** — application volume and competitiveness by entry year across the last decade. Context for students, ammunition for advisors.

**Where I Stand (stateless).** A student may type a GPA and MCAT score. The charts then mark where they fall in the distribution and which schools' published ranges they sit inside. Nothing is stored, nothing is transmitted, nothing persists past a refresh.

**Hard constraint:** the tool never displays a probability, an acceptance rate for the student's own band, a score, a verdict, or a school recommendation. It shows position only. Rationale: the target user cannot distinguish a shallow model from a good one, and a number attached to their own name will be read as a judgment about whether they should continue.

### Module B — The Texas Reference

- **TMDSAS mechanics** — how the Texas application differs from AMCAS and AACOMAS: earlier timeline, its own essays, the match system.
- **Texas residency** — the two qualifying pathways (high school graduation, domicile), why it matters, how to establish it. State law caps non-residents at 10% of entering classes at the public schools, making this the highest-leverage fact on the site.
- **JAMP** — eligibility, deadlines, benefits, participating undergraduate and medical institutions, with a prominent warning about the freshman/sophomore application window.
- **Other Texas pathway and pipeline programs** — post-baccs, summer programs, early assurance.
- **School directory** — one page per TMDSAS-participating medical program: core stats plus logistics (GPA/MCAT medians and ranges, class size, in-state percentage, MD vs DO, prerequisites, deadlines, application system), every field carrying a source URL and verified-on date.

### Module C — The Guides

Stage-based navigation. A student identifies where they stand and sees what is relevant now, with later stages visible but collapsed.

Stages: deciding whether medicine is for you; high school; community college and early undergrad; late undergrad; application year; gap year; reapplying.

Each stage answers, in order: what actually matters right now; what to do this semester; what can safely wait; the common mistakes at this stage; the Texas-specific notes.

Guides and data are cross-linked in both directions — every chart links to the guide explaining what it means, every guide links to the data behind its claims.

**Money** is a first-class section within the guides: what the process costs end to end, the AAMC Fee Assistance Program, TMDSAS fee waivers, MCAT registration and prep costs, primary and secondary fees, interview travel, JAMP stipends. Written for someone deciding between an MCAT prep course and rent.

### Module D — Orientation (one page)

An honest comparison of MD, DO, PA, NP, and RN: training length, total cost, scope of practice, lifestyle, admissions difficulty, and how to tell which fits. Routes MD/DO readers into the site and points everyone else outward.

## 5. Out of scope for v1

- **Accounts, login, user profiles, saved state, progress tracking, and personalized gap analysis.** Deferred to v2 by decision; architecture stays ready (§8).
- Any state other than Texas. Architecture must not preclude expansion; content must not attempt it.
- Health professions other than MD/DO beyond the single orientation page.
- TMDSAS dental, veterinary, and podiatry programs.
- MCAT prep content, question banks, study material.
- Essay review, essay examples, admissions consulting.
- Forums, community features, messaging, user-generated content.
- Any AI-generated content shown to users (§7).
- Mobile apps. Responsive web only.

## 6. Content requirements

**Authoring and storage.** Every page is an MDX file in the repository, reviewed via pull request. Frontmatter carries title, stage, topic tags, sources, author, and last-verified date. Factual changes are versioned and auditable.

**Voice.** Neutral and encyclopedic. No first person in main text. Where personal judgment adds value it appears in a visually distinct, clearly labeled callout so opinion never masquerades as fact.

**Plain language rules, enforced in review:**

- Target roughly an 8th-grade reading level in main text.
- Every acronym expanded on first use on every page. No page assumes the reader knows what AMCAS, BCPM, or a secondary is.
- Short sentences, concrete numbers, no hedged prose.
- No unexplained jargon. A glossary exists and terms link to it.

**Sourcing standard, non-negotiable:**

- No factual claim about requirements, deadlines, costs, or statistics publishes without a source URL and a verified-on date.
- Primary sources only: the school's own site, TMDSAS, AAMC, AACOM, the Texas Higher Education Coordinating Board, or the program itself. Secondary sources may be read for leads, never cited as authority.
- One documented exception: **GradPilot's open TMDSAS dataset** may be cited and linked with attribution, since it is openly published and independently auditable. Any figure taken from it is labeled as third-party derived, not primary.
- Every displayed figure shows its verified-on date.
- AI may draft extractions; **nothing publishes until a human has opened the source and confirmed the value.**

**Freshness.** Admissions data is annual. A refresh runs each cycle against the entry-year calendar. Any field past its staleness threshold displays a visible "may be out of date, verify at the source" notice rather than silently showing stale numbers.

## 7. Data pipeline

Because data quality is the core promise, data is produced by a reproducible pipeline, not hand-entry.

- **Source inventory.** Every source document is enumerated in a manifest: URL, publisher, what it provides, cadence, and retrieval method.
- **Archived snapshots.** Each retrieval stores a copy of the source document in-repo with its retrieval timestamp and a content hash. When a school silently changes its class profile page, the number on the site remains traceable to the document it came from.
- **Scripted extraction.** Extraction from snapshots into structured data is code, re-runnable, and diffable.
- **Human verification gate.** Every field carries a `verified_by` and `verified_on`. Unverified fields do not render.
- **Schema validation in CI.** Malformed or unsourced data fails the build.
- **Provenance visible to users.** Every figure on the site can be traced by a reader to its source document and date.

Scope: all TMDSAS-participating medical programs (roughly 15 MD and DO programs), plus Texas-wide aggregate datasets.

## 8. Account readiness without accounts

v1 ships with no user system. The following constraints keep that reversible cheaply:

- Content and data layers stay entirely independent of anything user-shaped. Adding a user layer must never require restructuring content.
- Any concept of user state sits behind a single storage abstraction, so swapping browser-local for server-backed later is one implementation change, not a refactor.
- Route namespace and header layout reserve space for the eventual account surface, so adding it is not a visual retrofit.

Explicitly **not** built now: auth libraries, database provisioning, user tables, or dark login screens. Unused authentication is a security surface with no upside, and the eventual implementation will want a different shape anyway.

**Privacy posture for v1:** no accounts, no personal data collected, no cookies, no third-party advertising trackers. "Where I Stand" input never leaves the browser and is never persisted. Analytics, if any, must be privacy-respecting and cookie-free.

## 9. AI policy

No model-generated content reaches users in v1. No chat assistant, no generated plans, no live summarization. AI is used internally: drafting content, extracting data from source documents for human verification, and maintenance tooling.

Rationale: a hallucinated deadline, prerequisite, or eligibility rule harms precisely the student who cannot catch the error. A grounded, citation-only assistant is a v2 candidate once the verified corpus exists to ground it in.

## 10. Non-functional requirements

- **Accessibility:** WCAG 2.2 AA. Keyboard navigable, screen-reader correct, honors reduced motion. Every chart has a text or tabular equivalent — a visualization a blind student cannot read is a broken promise given who this is for.
- **Performance:** usable on a mid-range phone on a slow connection. Content pages server-rendered and readable without JavaScript. Charts degrade to their tabular equivalent when JavaScript is unavailable.
- **SEO:** every page a distinct indexable URL, structured around the questions students actually type. Semantic headings, metadata, sitemap, structured data. Search is the primary discovery channel.
- **Responsive:** mobile-first; no horizontal page scroll; wide tables and charts scroll within their own container.
- **Theme:** light and dark both fully styled.
- **Legal:** clear statement that the site is independent and not affiliated with or endorsed by the AAMC, AACOM, TMDSAS, or any school; that it is informational and not admissions advising; that students must verify requirements with the school directly.
- **Licensing:** MSAR content is licensed and will not be reproduced. All data derives from free public sources.

## 11. Design direction

Warm editorial. Trustworthy without being institutional.

- Warm neutral base, one confident accent, color used for signal only.
- Large readable serif headings over a clean sans body. Generous line height and measure; long-form reading is a core activity.
- Real editorial layout with strong typographic hierarchy, not a dashboard grid.
- Charts quiet and precise, with source and date attached. Data presentation follows the project's visualization standards for palette, form, and interaction.
- Motion minimal and purposeful.

Target feeling: a well-made guide written by someone who cares. Not a university portal, not a startup landing page.

## 12. Architecture

- **Framework:** Next.js (App Router) with TypeScript.
- **Styling:** Tailwind CSS over a defined design token layer.
- **Content:** MDX in-repo, compiled at build time, statically generated.
- **Data:** structured files in-repo with per-field provenance, schema-validated at build time, produced by the pipeline in §7.
- **Charts:** bespoke SVG React components built on d3 scales rather than a charting library. Four distinct hand-designed visualizations with strict accessibility and theme requirements are a poor fit for a general chart library's defaults, and bespoke components keep the bundle small and the design fully controlled.
- **No database, no server-side user state, no authentication in v1.**
- **Hosting:** Vercel. Fully static output where possible.
- **Analytics:** privacy-respecting, cookie-free, or none.

## 13. Quality gates

- Test suite covering data schema validation, provenance completeness (no field renders without source and verified date), content frontmatter validation, chart data transforms, and the "Where I Stand" position logic.
- Golden-output tests on fixed data fixtures so silent numeric drift is caught.
- Outbound source link checker; a dead source URL fails the build.
- Accessibility checks in CI.
- GitHub Actions running the full suite on every pull request. No merge on red.
- Squash-merge per ticket, main as trunk.

## 14. Success criteria for v1

**Primary:** a student with no prior knowledge can use the site for one sitting and afterward articulate a correct plan for their next 12 months. Tested by observing 3-5 real students, at least two early-stage and unadvised.

**Supporting:**

- Every TMDSAS-participating Texas medical program documented and verified.
- All four headline visualizations shipped, accessible, and sourced.
- Every guide stage written and reviewed.
- A pre-health advisor reads it and is willing to recommend it.
- Zero unsourced factual claims in production.

## 15. Pre-launch review

Approach Texas pre-health advisors and relevant organizations (TAAHP, JAMP-participating advisors, TCOM contacts) for review before public launch. Free credibility and error-catching from people who do this professionally. Accepted cost: schedule slip and some scope pressure. Their feedback is advisory; scope decisions remain yours.

## 16. Risks

| Risk                                                   | Mitigation                                                                                                                                             |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Data goes stale and misleads the student who trusts it | Per-field verified-on dates, visible staleness warnings, archived snapshots, annual refresh, build-time validation                                     |
| A student reads position data as a verdict and quits   | No probabilities, no scores, no rates for their own band; framing and copy reviewed specifically for this                                              |
| Scope creep to other states or professions             | Out of scope in v1; architecture allows expansion, content does not attempt it                                                                         |
| Solo maintenance collapses during OMS2                 | Content and data in git so contributors can be added; automated staleness detection instead of manual auditing; nothing requiring continuous operation |
| Wrong or harmful guidance                              | Sourcing standard, no AI output to users, no prediction, explicit not-advising disclaimer, advisor pre-review                                          |
| Mistaken for an official AAMC/TMDSAS resource          | Prominent independence disclaimer; no use of their marks                                                                                               |
| Nobody finds it                                        | SEO-first structure from day one; advisor outreach once the quality bar is met                                                                         |

## 17. Open questions

All resolved 2026-08-01:

1. **Hosting and domain cost ceiling.** Vercel free tier for hosting; the only planned spend is one domain registration (~$10-15/yr) at launch.
2. **Open license for guides.** All rights reserved for now. Revisit at launch (Gate 6) — opening later is always possible; un-opening is not.
3. **Register whitecoatmap.com now.** No. Registration deferred to launch (plan Step 5.7), accepting the small risk the name is taken in the meantime.

---

## Appendix: decisions locked

| Decision                | Choice                                                                         |
| ----------------------- | ------------------------------------------------------------------------------ |
| Name                    | Whitecoat Map — whitecoatmap.com                                               |
| Primary user            | The no-map student                                                             |
| Path scope              | MD + DO deep, one orientation page for other professions                       |
| Geography               | Texas only, deep                                                               |
| v1 center of gravity    | Data and visualization, plus guides. No personalization.                       |
| Accounts                | None in v1; architecture stays account-ready                                   |
| Headline visualizations | Acceptance landscape grid, Texas funnel, per-school profiles, trends over time |
| Personal input          | Stateless position marking only; never a rate, score, or verdict               |
| Data rigor              | Reproducible pipeline with archived source snapshots and human verification    |
| Data scope              | All TMDSAS-participating Texas medical programs plus Texas aggregates          |
| Third-party data        | GradPilot open TMDSAS dataset may be cited with attribution                    |
| AI in product           | None in v1                                                                     |
| Voice                   | Neutral encyclopedic, plain-language enforced                                  |
| Content storage         | MDX in repo                                                                    |
| Guide organization      | By stage of the journey                                                        |
| Money                   | First-class section within the guides                                          |
| Stack                   | Next.js + TypeScript + Tailwind on Vercel, no database                         |
| Charts                  | Bespoke SVG on d3 scales                                                       |
| Design                  | Warm editorial                                                                 |
| Ownership               | Personal project, source public                                                |
| Distribution            | Search-first, then advisor outreach                                            |
| Pre-launch              | Advisor and organization review before public launch                           |
| Timeline                | Quality first, no fixed deadline; build starts after exam Mon 2026-07-27       |
| Success measure         | A no-knowledge student leaves with a correct 12-month plan                     |
