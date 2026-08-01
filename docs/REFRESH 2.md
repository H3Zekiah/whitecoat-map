# Refresh runbook

Admissions data is annual. This is the checklist that makes an update a
routine task rather than an archaeology project. Run it once per cycle,
ideally in late summer after TMDSAS posts final figures for the completed
entry year.

## 1. Re-fetch every source

```bash
npm run data:fetch
```

Every source in `data/sources.json` is downloaded and compared against the
last archived copy. The script reports one of three outcomes per source:

- `UNCHANGED` — nothing to do.
- `CHANGED` — **the publisher edited the document.** Any figure extracted
  from it needs re-verification. The old snapshot is kept; the new one is
  archived alongside it.
- `NEW` — first retrieval, or a source added to the manifest.

Snapshots are append-only. A changed source never overwrites the document a
published figure was drawn from.

## 2. Re-extract the aggregate datasets

```bash
npm run data:extract
```

Re-queries the TMDSAS dashboard and rewrites `data/aggregates/*.json`.
Note that extraction deliberately writes datasets **without** verification
fields, so nothing newly extracted can render until a person signs off in
step 4.

The script cross-checks applicant totals across three independent queries and
fails loudly if they disagree.

## 3. Check what changed

```bash
git diff --stat data/aggregates
git diff data/aggregates/funnel.json
```

Expect a new entry year and small revisions to recent years — TMDSAS restates
figures as cycles complete. Large moves in old years mean something is wrong;
investigate before continuing.

## 4. Verify, then stamp

This is the step that cannot be automated and must not be skipped.

Open the [TMDSAS dashboard](https://www.tmdsas.com/stats-dashboard/medical-report.html)
and check the extracted figures against it. Then set `verifiedBy` and
`verifiedOn` in each dataset's `provenance` block.

Until that happens, the site renders an honest placeholder in place of every
chart. That is intended behaviour, not a bug.

## 5. Re-check the school directory

```bash
npm run data:coverage
```

Prints every school and field with its status. For each school, open the
cited page and confirm the value still appears there. Two rules:

- If a figure has changed, update the value **and** its `retrieved` date, then
  re-verify.
- If a figure has disappeared from the source, convert the field to
  `unavailable` with a reason. Never leave a stale value in place because it
  was true last year.

## 6. Re-verify content pages

Any page whose `lastVerified` is more than a year old shows a staleness
warning to readers. Find them:

```bash
grep -r "lastVerified" content/ | sort -t: -k3
```

For each, re-read the cited sources, correct anything that moved, and update
`lastVerified` and `verifiedBy`. **Do not bump the date without re-reading the
source** — the date is a promise that someone looked.

Pay particular attention to:

- `content/texas/tmdsas.mdx` — the entire deadline table changes every cycle.
- `content/texas/jamp.mdx` — eligibility criteria have already changed once
  (the GPA requirement rose from a recommended 3.25 to a required 3.4).
- `content/guides/money.mdx` — fees change annually.

## 7. Run the full suite

```bash
npm run typecheck && npm run lint && npm test && \
npm run validate:content && npm run validate:data && npm run build
```

## 8. Ship

Open a pull request. CI runs the same checks. The PR description should say
which sources changed and which figures were re-verified, so the history
records what was checked and when.

---

## Staleness thresholds

| Data type               | Threshold    | Behaviour past it                   |
| ----------------------- | ------------ | ----------------------------------- |
| Content page facts      | 365 days     | Visible warning banner on the page  |
| Aggregate datasets      | annual cycle | Re-extract and re-verify each cycle |
| School directory fields | annual cycle | Re-check each cited page            |

## If a source disappears

Publishers remove pages. When that happens:

1. The archived snapshot in `data/snapshots/` remains the record of what was
   published and when.
2. Look for the figure on a current page from the same publisher and update
   the manifest URL.
3. If it is genuinely no longer published, convert affected fields to
   `unavailable` with that reason. Do not keep displaying a number whose
   source no longer exists.
