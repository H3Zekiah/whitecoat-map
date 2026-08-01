# Whitecoat Map — Implementation Plan

**Companion to:** `SRD.md` (revision 2)
**Status:** Approved 2026-08-01
**Build started:** 2026-08-01 — repo created, Phase 0 underway

---

## How this plan works

Sequential steps, each with a definition of done. Each step is one commit or a small series of commits on a branch. **Gates** are points where work stops for your review before continuing.

Following your usual cadence: this plan builds the **base system** end to end. Granular tickets and PRs come _after_ a working base exists, so we are not filing speculative tickets that go stale.

Relative sizing: **S** a sitting, **M** a day or two of focused work, **L** several days. Content writing is sized separately because it is your time, not build time.

---

## Phase 0 — Prove the data exists (before any code)

The entire product rests on the claim that this data is obtainable, primary, and citable. If it is not, the shape of Module A changes. This must be settled before a line of application code is written.

### Step 0.1 — Source feasibility audit **(L)**

Enumerate, for every number the site intends to display, exactly which document provides it.

Targets:

- **Acceptance landscape grid.** The known problem: TMDSAS publishes GPA and MCAT _separately, never crossed_. GradPilot claims a crossed grid derived from an open dataset. Determine what the underlying source actually is, whether it is reproducible from primary documents, and whether the crossed view can be built at all without third-party derivation.
- **Texas funnel.** Applicant → interview → accepted → matriculated counts. Verify whether interview-stage counts are published anywhere; this is the stage most likely to be missing.
- **Per-school profiles.** For all TMDSAS-participating medical programs: GPA and MCAT medians _and ranges_, class size, in-state share, cost, prerequisites, deadlines. Ranges are the risk — many schools publish medians only.
- **Trends over time.** Ten-year series from TMDSAS data reports and Texas Higher Education Coordinating Board publications.

Known source pool to work through: TMDSAS stats dashboard and data reports, TMDSAS application guide, Texas Higher Education Coordinating Board / txhes.com publications, UT Austin Health Professions Office admission report executive summaries, AAMC free reports and FACTS tables, AACOM research reports, each school's own admissions and class profile pages, texasjamp.org, GradPilot's open GitHub dataset.

**Definition of done:** `docs/SOURCES.md` exists, listing every intended data field with its source document, publisher, URL, cadence, and a verdict of _primary / third-party derived / not obtainable_. Each of the four visualizations carries an explicit go / modify / drop recommendation.

### GATE 1 — Data reality check

You review `SOURCES.md` and confirm which visualizations survive contact with the actual sources, and whether any needs redesign. Nothing else proceeds until this is settled, because Phase 3 is built directly on it.

**PASSED 2026-08-01.** All four visualizations GO; both headline risks retired; decisions recorded in `SOURCES.md`. One open item: the EY2020 PDF-vs-dashboard discrepancy blocks Step 2.3 publication, not Phase 1.

---

## Phase 1 — Foundations

### Step 1.1 — Repository and deployment skeleton **(S)**

Git repository, public on GitHub. Next.js App Router with TypeScript, Tailwind, linting and formatting. GitHub Actions workflow running typecheck, lint, and tests. Vercel project connected, deploying from main.

**Done when:** a placeholder page is live on a Vercel URL and CI passes on a pull request.

### Step 1.2 — Design system **(M)**

Warm editorial direction from SRD §11, made concrete: color tokens for light and dark, type scale, spacing scale, serif display and sans body pairing, and the core primitives — page shell, header with reserved account slot, footer, prose container, callout, table, source-citation chip, staleness notice.

**Done when:** a `/styleguide` route renders every primitive in both themes, passes contrast checks, and reads well on a phone.

### Step 1.3 — Content system **(M)**

MDX pipeline with typed frontmatter. Frontmatter schema requires title, description, stage or section, sources, and last-verified date on any fact-bearing page. Build-time validation rejects pages missing required provenance. Glossary with automatic term linking. A `<Source>` component rendering citation and verified-on date inline.

**Done when:** one real content page (pick the Texas residency page — highest leverage, most self-contained) renders end to end with visible, correct provenance, and a deliberately malformed page fails the build.

### GATE 2 — Look and feel

You review the styleguide and the first real page on the live URL. Design direction is confirmed or adjusted here, before it is replicated across dozens of pages.

---

## Phase 2 — Data

### Step 2.1 — Data schema and provenance model **(M)**

Schemas for school profiles and aggregate datasets. Every field is a value plus its provenance: source id, source URL, retrieval date, verified-by, verified-on, and a primary-versus-derived flag. Unverified fields are structurally incapable of rendering. Schema validation wired into CI.

**Done when:** validation runs in CI, a fixture with a missing citation fails, and a fixture with an unverified field renders nothing rather than rendering a bare number.

### Step 2.2 — Acquisition and snapshot archive **(M)**

Scripts that fetch each source document from the manifest and archive it in-repo with retrieval timestamp and content hash. Re-running detects and reports when a source has changed since last retrieval.

**Done when:** `npm run data:fetch` populates the archive, and re-running against a changed source reports the change rather than silently overwriting.

### Step 2.3 — Aggregate dataset extraction **(L)**

Scripted extraction from archived snapshots into structured datasets backing the funnel, the trends series, and the acceptance landscape. Human verification pass over every extracted figure against the source document.

**Done when:** every aggregate figure is extracted, verified, and traceable to an archived snapshot, with golden-output tests pinning the transforms.

### Step 2.4 — School directory data **(L)**

All TMDSAS-participating Texas medical programs, every field from Step 2.1's schema, each individually sourced and verified. This is careful manual work with scripted assistance; expect it to be the slowest step in the project.

**Done when:** a coverage report shows every program with every required field sourced and verified, and any field we could not obtain is explicitly marked unavailable rather than left blank or guessed.

### GATE 3 — Data quality review

You spot-check figures against their sources yourself. This is the promise the whole site rests on; it deserves your own eyes before anything is built on top of it.

---

## Phase 3 — Visualization

Project visualization standards govern palette, chart form, and interaction throughout this phase; they are loaded and followed before the first chart is written.

### Step 3.1 — Chart foundation **(M)**

Bespoke SVG chart primitives on d3 scales: responsive container, axes, legend, tooltip, and the accessibility contract — every chart has a real tabular equivalent that is what screen readers and no-JavaScript visitors get. Theme-aware in light and dark.

**Done when:** a reference chart renders correctly in both themes, is keyboard navigable, announces sensibly to a screen reader, and degrades to a readable table with JavaScript disabled.

### Step 3.2 — Acceptance landscape grid **(M)**

Shape depends on Gate 1's verdict. Resident and non-resident views, cited, with a plain-language explanation of what the grid does and does not mean sitting directly beside it.

### Step 3.3 — Texas funnel **(M)**

Stage-by-stage cohort flow with dropoff. The interpretive copy matters as much as the chart: this visualization exists to reframe the process, not to intimidate.

### Step 3.4 — Per-school profile charts **(M)**

Consistent small charts embedded in each school page. Ranges shown, not just medians. Any school missing range data shows that absence explicitly.

### Step 3.5 — Trends over time **(S)**

Ten-year series, application volume and competitiveness.

### Step 3.6 — Where I Stand **(M)**

Stateless GPA and MCAT input that marks position across the charts and highlights which schools' published ranges the student falls inside.

**Hard constraints, enforced by tests:** no probability, no acceptance rate for the student's own band, no score, no verdict, no school recommendation, no persistence, no network transmission. Copy reviewed specifically against the "student reads this as a verdict" risk.

**Done when:** position marking works across every chart, tests assert the absence of every prohibited output, and nothing survives a page refresh.

### GATE 4 — Visualization review

Full data experience reviewed live on the deployed site, on a phone as well as a desktop.

---

## Phase 4 — Guides

Content drafting is independent of code and can begin any time after Gate 1 — including while Phases 2 and 3 are in progress. This is the largest single time investment in the project and it is writing, not engineering.

### Step 4.1 — Information architecture and navigation **(M)**

Stage-based navigation shell. Cross-linking system between guides and data in both directions. Search-friendly URL structure.

### Step 4.2 — Texas reference pages **(L, writing)**

TMDSAS mechanics; Texas residency (already drafted in Step 1.3); JAMP, with prominent placement of the freshman/sophomore application window; other Texas pathway and pipeline programs; school directory pages.

JAMP gets the most care of any page on the site. It is the concrete failure the project exists to prevent.

### Step 4.3 — Stage guides **(L, writing)**

Seven stages: deciding; high school; community college and early undergrad; late undergrad; application year; gap year; reapplying. Each answers, in order: what matters now, what to do this semester, what can wait, common mistakes, Texas-specific notes.

### Step 4.4 — Money **(M, writing)**

Full cost of the process end to end, AAMC Fee Assistance, TMDSAS fee waivers, MCAT costs, application fees, interview travel, JAMP stipends.

### Step 4.5 — Orientation page and glossary **(M, writing)**

MD, DO, PA, NP, RN comparison. Glossary covering every term used anywhere on the site.

**Done when:** every page passes frontmatter validation, every factual claim carries a source, and a plain-language review pass has been done against SRD §6.

### GATE 5 — Content review

Full read-through. This is where the plain-language rules get enforced honestly, because they are easy to write down and easy to violate.

---

## Phase 5 — Launch readiness

### Step 5.1 — Search and metadata **(M)**

Per-page metadata, sitemap, structured data, canonical URLs, social preview cards. Verify every page is independently indexable and titled around what a student would actually type.

### Step 5.2 — Accessibility audit **(M)**

Full WCAG 2.2 AA pass including keyboard, screen reader, contrast, reduced motion, and the chart tabular equivalents. Automated checks in CI plus manual verification.

### Step 5.3 — Legal and about pages **(S)**

Independence disclaimer, not-advising statement, verify-with-the-school notice, about page, contact, and the site's own sourcing standards published openly so anyone can audit the method.

### Step 5.4 — Freshness machinery **(M)**

Staleness thresholds per data type, visible warnings past threshold, source-change detection reporting, and a written refresh runbook so an annual update is a checklist rather than an archaeology project.

### Step 5.5 — Usability testing **(M)**

Observe 3-5 real students using the site, at least two early-stage and unadvised. Success is whether they can articulate a correct plan for their next 12 months afterward. Findings become a fix list.

### Step 5.6 — Advisor and organization review **(M)**

Approach Texas pre-health advisors, TAAHP, and JAMP-connected contacts for review. Findings become a fix list. Their input is advisory; scope decisions remain yours.

### Step 5.7 — Domain and launch **(S)**

Register whitecoatmap.com, point it at Vercel, verify production, launch.

### GATE 6 — Launch decision

---

## After the base exists

Once the system is live and working, refinements become individual tickets with PRs against the regression suite, per your standing workflow. Likely first candidates, not filed until then: expanded pipeline-program coverage, additional visualizations surfaced by usability testing, an open license for the guides, and the account layer when personalization is genuinely wanted.

---

## Long poles and honest risks

**The slowest work is not the code.** Step 2.4 (school directory data) and Phase 4 (writing) dominate the schedule. The application itself is a few weeks of build; verified data and well-written guides are the actual project.

**Gate 1 can invalidate a headline feature.** The acceptance landscape grid depends on data TMDSAS deliberately does not publish crossed. If it cannot be sourced primarily, the options are to cite GradPilot's derived dataset with attribution, to redesign the visualization around what _is_ publishable, or to drop it. Better to learn this in week one than after building it.

**Interview-stage funnel data may not exist publicly.** If so, the funnel becomes applied → accepted → matriculated, which is still worth showing.

**Range data may be unavailable for some schools.** The policy is to mark it explicitly unavailable rather than substitute a median and let it read as a range.

**Your time collapses when OMS2 starts.** The plan is ordered so that the highest-value, hardest-to-delegate work — data verification and writing — is front-loaded while you have summer capacity. The polish phases can stretch.
