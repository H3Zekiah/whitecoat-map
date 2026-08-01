# Whitecoat Map — Source Feasibility Audit

**Phase 0, Step 0.1** (companion to `PLAN.md`)
**Status:** First pass complete 2026-08-01. Field-level verification for individual schools continues in Step 2.4; nothing here publishes until a human re-verifies it against the source (SRD §6).

This document answers one question: **is the data the site intends to display actually obtainable, primary, and citable?**

---

## Verdict summary — the four headline visualizations

| Visualization                                                     | Verdict          | Basis                                                                                                                                          |
| ----------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Acceptance landscape grid (GPA × MCAT)                         | **GO — primary** | TMDSAS's own dashboard model contains native crossed GPA-bin × MCAT-bin × accepted columns; official PDF matrices also exist for earlier years |
| 2. Texas funnel (applied → interviewed → accepted → matriculated) | **GO — primary** | Interview-stage counts exist in the dashboard, EY2016–2026, with residency and applicant-type splits                                           |
| 3. Per-school profiles                                            | **GO, modified** | Medians widely published on school class-profile pages; _ranges_ vary by school and are marked "not published" where absent                    |
| 4. Trends over time                                               | **GO — primary** | EY2016–2026 from the dashboard; earlier years from archived TMDSAS PDF reports                                                                 |

Two risks named in `PLAN.md` are **retired**:

- _"TMDSAS publishes GPA and MCAT separately, never crossed"_ — **incorrect, happily.** TMDSAS publishes crossed data in two forms: per-year MCAT × GPA matrix PDFs (verified for EY2019 and EY2020), and pre-binned crossed columns (`Overall GPA (bins)` × `MCAT B (MATRIX bins)` × `IsAccepted`) native to the public Power BI dashboard's data model. What TMDSAS never publishes is a _readable_ crossed view — which is precisely the room this site fills.
- _"Interview-stage funnel data may not exist publicly"_ — it exists. `IsInterviewed` is a dashboard field; per-year interviewed counts are extractable for every entry year 2016–2026.

---

## Source inventory

| ID  | Source                                                                                                                                                             | Publisher                          | Provides                                                                                                                                                                                                                         | Cadence                                | Access                                                                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| S1  | [TMDSAS stats dashboard](https://www.tmdsas.com/stats-dashboard/medical-report.html)                                                                               | TMDSAS                             | Funnel incl. interviews; residency + applicant-type splits; MCAT/GPA averages by cohort; native GPA × MCAT crossed bins; age; EY2016–2026                                                                                        | Rolling, annual cycle                  | Public Power BI "publish to web" embed; backing dataset queryable without auth via the public resource key; extraction fully scriptable    |
| S2  | [Final Statistics Report PDFs](https://www.tmdsas.com/docs/stats/Final-Statistics-Report-Medical-EY20.pdf) (EY≤2020)                                               | TMDSAS                             | Applicant/matriculant demographics, GPA + MCAT distributions                                                                                                                                                                     | Discontinued (dashboard replaced them) | Direct PDF; archive immediately                                                                                                            |
| S3  | [MCAT-GPA Matrix PDFs](https://www.tmdsas.com/docs/stats/MCAT-GPA-Matrix-EY20.pdf) (EY19 verified on txhes.com, EY20 on tmdsas.com)                                | TMDSAS                             | Crossed MCAT-band × GPA-band counts, applicants and matriculants                                                                                                                                                                 | Discontinued                           | Direct PDF; archive immediately                                                                                                            |
| S4  | [7hacker/tmdsas-admissions-data](https://github.com/7hacker/tmdsas-admissions-data)                                                                                | Independent (GradPilot-associated) | Cleaned CSVs of S1 (funnel, residency, scores, GPA × MCAT grids), raw API responses for audit, reproducible MIT extractor                                                                                                        | Extracted 2026-05-30                   | Data CC0 1.0, code MIT. **Third-party derived** — use as cross-check and methodology reference; cite with attribution per SRD §6 exception |
| S5  | [TMDSAS school roster](https://www.tmdsas.com/about/TMDSAS_schools.html) + school pages + [application guide](https://www.tmdsas.com/application-guide/index.html) | TMDSAS                             | Member roster (verified 2026-08-01: **12 MD + 2 DO**), prerequisites, deadlines, TMDSAS mechanics/match                                                                                                                          | Annual                                 | Web                                                                                                                                        |
| S6  | School class-profile pages (e.g. [UTSW](https://medschool.utsouthwestern.edu/admissions/class-profile.html))                                                       | Each school                        | Per-school GPA/MCAT medians and (sometimes) ranges, class size, in-state share, interview format                                                                                                                                 | Annual                                 | Web; audit each of 14 schools in Step 2.4                                                                                                  |
| S7  | [UT Austin HPO admission reports](https://healthprofessions.utexas.edu/) (EY2021, EY2022 PDFs verified)                                                            | UT Austin HPO                      | Per-school matriculation of _UT Austin applicants only_                                                                                                                                                                          | Annual                                 | **Supplementary only** — one university's applicants, not the statewide pool                                                               |
| S8  | [texasjamp.org](https://www.texasjamp.org/)                                                                                                                        | JAMP Council                       | Eligibility criteria, deadlines (EY2027 application closes **2026-10-02**), stipends/benefits, 68 partner undergrads, 14 participating med schools                                                                               | Annual                                 | Web; verified 2026-08-01                                                                                                                   |
| S9  | [txhes.com](https://www.txhes.com/)                                                                                                                                | Texas Health Education Service     | Archived TMDSAS stats (hosts EY19 matrix), application-trend articles                                                                                                                                                            | Ongoing                                | Web                                                                                                                                        |
| S10 | AAMC FACTS tables + free reports                                                                                                                                   | AAMC                               | National context (applicants, matriculants, A-23 national grid)                                                                                                                                                                  | Annual                                 | Free PDFs                                                                                                                                  |
| S11 | AACOM applicant/matriculant reports                                                                                                                                | AACOM                              | DO national + college-level context for TCOM, SHSU-COM                                                                                                                                                                           | Annual                                 | Free                                                                                                                                       |
| S12 | [Texas Education Code, Ch. 54, Subch. B](https://statutes.capitol.texas.gov/Docs/ED/htm/ED.54.htm) (residency/domicile definitions) + THECB rules                  | State of Texas                     | Residency definitions; the 10% non-resident cap (stated on the TMDSAS residency page; exact statutory cite for the cap still to pin down — note: §51.917, sometimes cited for it, is actually about faculty English proficiency) | Statutory                              | Statute text                                                                                                                               |
| S13 | AAMC Fee Assistance Program, MCAT fee pages; TMDSAS fee/waiver pages                                                                                               | AAMC / TMDSAS                      | Money-section facts                                                                                                                                                                                                              | Annual                                 | Web                                                                                                                                        |

---

## Field-by-field mapping

### Aggregate data (Module A)

| Field                                                                | Source              | Verdict                                                                                        |
| -------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------- |
| Applicants / interviewed / accepted / matriculated, by entry year    | S1 (cross-check S4) | **Primary**                                                                                    |
| Funnel split by Texas resident vs non-resident                       | S1                  | **Primary**                                                                                    |
| Funnel by applicant type (reapplicant, non-trad, military)           | S1                  | **Primary**                                                                                    |
| Mean MCAT (total + 4 sections), mean GPA (overall + BCPM), by cohort | S1                  | **Primary**                                                                                    |
| GPA × MCAT × acceptance grid, overall + by residency                 | S1 (native bins)    | **Primary** — with derivation choices documented (re-binning, pooling, small-cell suppression) |
| Ten-year trend series                                                | S1 + S2/S3 archives | **Primary**                                                                                    |

### Per-school data (Modules A/B) — 14 programs

| Field                                   | Source                 | Verdict                                                                                          |
| --------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------ |
| School name, MD/DO, application service | S5                     | **Primary — verified**                                                                           |
| Prerequisites, deadlines                | S5 + school sites      | **Primary**                                                                                      |
| Class size                              | S6                     | **Primary**, verify per school                                                                   |
| GPA / MCAT medians                      | S6                     | **Primary**, availability varies by school                                                       |
| GPA / MCAT ranges                       | S6                     | **Primary where published** (UTSW confirmed: MCAT range 508–524); mark "not published" elsewhere |
| In-state share                          | S6                     | To verify per school (dashboard has no per-school split)                                         |
| Cost of attendance                      | School registrar pages | To verify per school                                                                             |

### Guide facts (Modules B/C/D)

| Fact                                                      | Source   | Verdict                                  |
| --------------------------------------------------------- | -------- | ---------------------------------------- |
| JAMP eligibility, window, benefits, participating schools | S8       | **Primary — verified**                   |
| TMDSAS mechanics, timeline, match                         | S5       | **Primary**                              |
| Texas residency pathways, 10% cap                         | S12 + S5 | **Primary**, statute citation to confirm |
| Costs, fee assistance, waivers                            | S13      | **Primary**                              |

---

## Discrepancies and caveats

1. **EY2020 internal TMDSAS discrepancy (open, blocking for Phase 2).** The official EY20 matrix PDF (S3) totals 6,077 applicants / 1,812 matriculants; the dashboard (S1) reports 7,783 / 2,284 for EY2020. The PDF's own notes mention inclusion of dual-degree/special-program applicants and exclusions for unreported scores (and contain template sloppiness — a medical report referencing "DAT"). **Resolution is a blocking task in Step 2.3: no aggregate figure publishes until the two sources' inclusion rules are understood, and the two sources are never mixed in one chart.**
2. **Acceptance vs matriculation.** The dashboard grid crosses against `IsAccepted`; the PDFs count _matriculants_. The site's grid uses acceptance (matching the SRD), labeled precisely.
3. **Dashboard fragility.** A "publish to web" embed can be reorganized or removed at any time. Mitigation is SRD §7 verbatim: archive raw API responses at every extraction (S4 demonstrates the format).
4. **EY2026 is in progress** — excluded from all rate calculations.
5. **TMDSAS's own pages disagree on member count** ("12 medical schools" on one page vs the 14-program roster). The roster page is authoritative. A working example of why every fact carries a retrieval date.
6. **Small-cell suppression.** Adopt the n < 10 rule (no rate shown, count retained) used by S4 — protective for exactly the corners of the grid a worried student stares at.
7. **UIWSOM is not in TMDSAS.** The University of the Incarnate Word School of Osteopathic Medicine (San Antonio, DO) applies via AACOMAS. Scope question below.

---

## Verification status — provisional, 2026-08-01

**Gate 3 (owner review) has NOT happened.** To unblock chart development, figures carry a provisional stamp that names its own limits in the `verifiedBy` string:

- **School fields** — `"Claude (checked against archived snapshot; owner Gate 3 review pending)"`. Each stamped value was confirmed to appear, in context, inside the archived snapshot of the page it cites. Applied to 10 fields: UTSW (227 / 3.89 / 516), McGovern (240 / 3.84 / 512), UIWSOM (3.6 / 504), UTMB class size (~230), Dell class size (50).
- **Aggregate datasets** — `"Claude (cross-checked vs 7hacker CC0 dataset and internal totals; owner Gate 3 review pending)"`. Totals agree across three independent queries, residency splits sum to funnel totals, and overlapping years match the independent CC0 dataset exactly.

**This check found four claims that did not survive it.** Values that appeared in search results but were _absent from the archived primary page_ were downgraded to `unavailable` rather than published:

| School   | Claim               | Outcome                                                                                                  |
| -------- | ------------------- | -------------------------------------------------------------------------------------------------------- |
| UTMB     | GPA 3.80 / MCAT 511 | Not in the archived FAQ — **removed** (class size ~230 is on the page and stands)                        |
| Fertitta | GPA 3.6 / MCAT 503  | Not in the archived FAQ — **removed**                                                                    |
| UT Tyler | Class size 40       | Third-party sources only — **removed**                                                                   |
| McGovern | 240 / 3.84 / 512    | Present on the _blog_ Class-of-2029 page, not the class-snapshot page — **source corrected**, value kept |

This is the sourcing standard working as designed: a figure that cannot be traced into an archived primary document does not publish. When the owner runs Gate 3, these stamps should be replaced with his own name and date.

---

## Gate 1 — PASSED 2026-08-01

All four visualizations confirmed GO. Decisions:

1. **Grid basis:** our own extraction from the official dashboard (primary); the S4 open dataset serves as an independent cross-check, attributed wherever its derivations are used.
2. **UIWSOM:** included as a 15th school-directory entry with a clear "applies through AACOMAS, not TMDSAS" note, outside the TMDSAS aggregate data.
3. **Grid rates are acceptance-based** (`IsAccepted`), precisely labeled so they cannot be read as matriculation rates.
4. **EY2020 discrepancy** is a blocking task inside Phase 2 (Step 2.3): no aggregate figure publishes until the inclusion-rule difference is explained. Phases 1 proceeds meanwhile.
