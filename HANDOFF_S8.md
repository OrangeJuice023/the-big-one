# The Big One — Handoff S8 · paste into a new chat to resume

**Repo:** github.com/OrangeJuice023/the-big-one · `main` · local `/d/the-big-one`
**Remote HEAD:** `6e31868`
**Live:** the-big-one-swart.vercel.app
**Author:** Gervi Paulo Corado · UP Diliman NCPAG · gccorado@up.edu.ph

---

## FIRST: one tarball is unpushed

`the-big-one_faulttrace-scope-fix.tar.gz` is in `/d/Downloads`. It contains
work not on the remote. Land it before anything else:

```bash
cd /d/the-big-one
tar xzf /d/Downloads/the-big-one_faulttrace-scope-fix.tar.gz --overwrite
rm -f web/src/components/Math.tsx        # renamed to TeX.tsx, see note below
cd web && npm install katex && npm run dev
# check localhost:3000/arithmetic renders, then:
cd /d/the-big-one && git add -A
git commit -m "Add /arithmetic page (KaTeX equations, 6 SVG charts, GBM baseline section); split fault trace at study-area boundary with scope footnote; TeX component"
git push
```

Contains: `/arithmetic` page · `TeX.tsx` (KaTeX) · Header nav · `LossMap.tsx`
fault-trace split · `lib/copy.ts` footnote · `HANDOFF_S7.md`.

**The abstract revision was sent to NCDSPP — that item is closed.**
**Assume the exposed Groq key was revoked; verify at console.groq.com if unsure.**

---

## What this is

Two coupled layers, for NCDSPP / DS4PP (1st National Conference on Data Science
for Public Policy).

**Layer 1** — probabilistic direct-loss model for a West Valley Fault M7.2
rupture across 35 LGUs (17 NCR + 18 fault-corridor in Rizal, Bulacan, Cavite,
Laguna). Physics-informed ML: mechanistic structure, data-learned parameters.

**Layer 2** — RA 10121 disclosure audit, six pilot LGUs × eight obligations.
**The finding:** all six have DRRM offices and conduct DRR activity; they
diverge sharply in whether the documents proving it are publicly accessible.

---

## Model numbers — all verified by re-running this session

```
ABC on 1990 Luzon (Mw 7.7, US$369.6M reported, PHP 24.3/USD)
  accepted 76,593 / 200,000 = 38.3%   ·   window [0.7×, 3.0×]
  K       2.800±0.400 → 2.829±0.397
  MDR_MAX 0.350±0.080 → 0.361±0.077
  M0      9.000±0.400 → 8.881±0.366     (MDR_SLOPE = 1.4 fixed)

Exposure base PHP 12.4T annual output (8/35 use PSA city GDP ×1.30; 27 use pop × regional per-capita)

M7.2 national: P10 $14.0B · P50 $45.4B · P90 $106.4B
  UQ split 65% aleatoric / 35% epistemic
  ratio 0.95× the $48B World Bank/MMEIRS anchor — NOT tuned to it

Bohol 2013 held out entirely:
  hazard  MMI 8.0 / 6.9 / 6.6  vs  PEIS VIII / VII / VII  → PASS
  loss    P10 $45M · P50 $188M · P90 $603M  vs  $52M observed FLOOR → PASS
          (NDRRMC infra only; 73,002 houses counted in units not pesos)

Adversarial low-end (5th pct K, 5th pct MDR_MAX, 95th pct M0):
  K=2.176 MDR_MAX=0.235 M0=9.481 → MMI 8 → $12.1B
  ⇒ tens-of-billions conclusion does NOT depend on central estimates

GBM baseline (verified this session — this is the abstract's "two orders" claim):
  514 events · 375 train (<2010) / 139 test
  LightGBM      MAE log10 0.845  (≈7.0× typical error)
  OLS mag-only  MAE log10 0.882  (≈7.6×)
  80% interval empirical coverage 77.7%  (slightly overconfident)
  Metro Manila M7.2: GBM predicts $401M (q10 $28M, q90 $8,429M)
    vs hybrid $45.4B  →  113×  =  2.05 orders of magnitude ✓
  WHY: median event in the catalogue is $137M. The model learns most
  earthquakes are cheap — true, and useless here. Magnitude/depth/intensity/year
  cannot express 13M people and PHP 12.4T sitting on a fault.
```

AWW12: `c0=3.950 c1=0.913 c2=−1.107 c3=0.813 s1=0.72 s2=0.23 s3=44.7`
(cross-checked vs GEM OpenQuake). GEM WVF trace wired in (Styron & Pagani 2020,
CC-BY-SA); trace swap moved P50 **+2.7%**.

Rebuild, seed 42: `cd model && python -m src.calibrate && python -m src.scenarios
&& python -m src.backtest_bohol && python -m src.validate && python -m src.train`

**Distribution finding worth using:** posterior *means* barely moved, but the
observed earthquake **removed the entire upper tail of M0** — values above ~9.4
that the prior allowed are almost entirely rejected. The histogram is a far
stronger story than the summary statistics. Already charted on `/arithmetic`.

**`model/models/` is gitignored** (rebuildable), so `metrics.json` and the
posterior are not committed. Write these numbers into the paper; don't point at
code that has to be re-run.

---

## Policy layer

| LGU | present | partial | to-collect | lapses | signature |
|---|---|---|---|---|---|
| Quezon City | 8 | 0 | 0 | 0 | proactive digital disclosure |
| Pasig | 6 | 2 | 0 | 1 | published, but hard to find |
| Makati | 5 | 2 | 1 | 2 | attempted publish, links broken |
| Marikina | 3 | 5 | 0 | 3 | deliberate eFOI-only |
| Taguig | 2 | 5 | 1 | 4 | activity published, statutes eFOI-gated |
| Pateros | 1 | 2 | 5 | 2 | never attempted digital disclosure |

48 cells: **25 present · 16 partial · 7 to-collect · 0 absent**
12 lapses: **7 `access-foi` · 2 `access-broken` · 2 `access-none` · 1 `access-opaque`**

**Two patterns carry the argument:**
- **OB1 universal, 6 of 6.** Every LGU including Pateros (1.66 km², smallest
  municipality in the country) has a DRRMO. **Capacity is not the variable.**
- **OB4 weakest, 1 of 6.** It is the *only* obligation whose text explicitly
  requires public display. Everyone meets *having an office*; almost nobody
  meets *showing the public what it produces*.

**Taxonomy** — `access-broken` (Makati: plan described on its own portal, PDF
404s) · `access-foi` (modal, 7/12) · `access-none` (Pateros: portal exists for
other purposes) · `access-opaque` (**three mechanisms**: unfindable = Pasig
22-char hash URLs; unsearchable = scan-only PDFs; empty = Taguig index is titles
only on free Google Sites, 2022–2024).

**Positive counterexample:** QC serves `SP-3011-S-2021.pdf` — filename *is* the
instrument number — from a portal indexing the 1st–23rd City Council. Same
metro, same stack. Opaque naming is a practice, not an inevitability.

**Second axis, archive depth.** QC no cutoff; Marikina starts 2023; Taguig
2022–2024. RA 10121 dates from 2010, so DRRMO-creating ordinances are 2010–2014
documents — **an LGU whose archive begins in 2022 structurally cannot evidence
OB3 from its own portal.** This also entangles QC's 8/8 with its archive depth;
concede that rather than presenting it as pure capability.

**Sharpest case — Pasig.** The Committee on Disaster Resilience, adopting Res.
130-11 (**approved 19 June 2023** — the URL path says 2023/09/11, that is the
*upload* date), directed the LDRRMP 2023–2028 "be also available to them and
**down loadable thru Pasig City website/platform**" for barangays and
constituents. The resolution is online; the ~300-page plan is not. The channel
is the PCDRRMO Citizen's Charter service: free, but requiring a formal letter, a
government ID, and **a USB drive ≥5GB, in person.** In the same record the
consultant named the priority populations — public schools, informal settler
families, flood-prone residents — and the planning officer noted ISF cannot be
relocated pre-event under UDHA. **The disclosure channel selects against the
population the plan prioritises.** Uniquely, the gap is between the council's
**own instruction** and the city's **own procedure**.

---

## Decisions — do not silently reverse

1. **No eFOI filing to complete the corpus.** It would show a research team with
   standing can obtain documents — never in question — not that the public can.
   `access-foi` gaps stay **open and labelled**. → `findings/SYNTHESIS.md` §8
2. **Open retrieval used freely; failures are findings.** But a successful fetch
   proves retrievability-given-the-URL, **never findability**, and never alone
   moves a status to `present`. Bot-blocked ≠ inaccessible → escalate to manual
   browser check. → `findings/retrieval_methods.md`
3. **`access-opaque` scored leniently** for Pasig's `present` rows — methodology
   finding, not status-capping. Rationale in `corpus/Pasig/pasig_source_urls.notes.md`.
4. **Taguig added as 6th pilot.**
5. **Two manifests, distinct:** `policy-layer/corpus_manifest.csv` = artifacts +
   OCR state. `policy-layer/ledger/manifest.csv` = provenance. **The ledger one
   is authoritative for citations.**

## Two identifiers that FAILED verification — never cite

- **Marikina "Ord. No. 132, s. 2011"** — the peer-reviewed IJSBAR study of that
  exact institutional history attributes the change to **RA 10121 directly** and
  names no ordinance. A separate Ord. 32 s.2011 exists, **subject matter
  UNKNOWN** (we hold only a Citizen's Charter citation to its §23 on first aid —
  do not describe it as understood). Marikina's DRRMO-creating instrument is
  **unresolved.**
- **Pasig "Ord. No. 08-08, s. 2016"** — the document under that identifier is
  about **employee incentive awards.** Pasig's OB2/OB6 rest on Res. 130-11 and
  Res. 269-11, both verified against primary text.

**Generalisable result:** compiled summaries were **reliable on substance,
unreliable on identifiers.** Every checkable narrative claim verified exactly;
both failures were reference numbers.

---

## RAG layer — working

```
web/scripts/rag/chunk.py  → chunks.json (235 chunks, ~160KB, stdlib only)
web/src/app/api/ask/      → BM25 + Groq (llama-3.3-70b-versatile)
web/src/app/ask/          → UI
web/scripts/rag/embed.mjs → optional, local only
```

**BM25 not embeddings** — `@xenova/transformers` needs ~90MB, will not fit a
serverless function. BM25 needs no model, is deterministic, **explainable**
(returns matched terms). Corpus is a static `import`, bundles at build time.

**`output: 'export'` was removed from `next.config.mjs`** — static export has no
server, so `/api/ask` would 404 and there'd be nowhere to hold the key.

**LGU-aware boosting is load-bearing.** Pure lexical ranking put a *Pasig* note
first for "plans in Marikina" (that note records Marikina offering mutual aid).
Named LGU ×2.5, cross-cutting ×0.6, other LGUs ×0.35.

**Guardrails, two layers.** Server-side before any model call: 600-char cap ·
emergency detection (hardcoded hotlines, **never reaches the LLM**) · regex
prefilter for code gen, creative writing, prompt injection, prompt extraction,
persona override. System prompt S1–S7: DRRM-only · not an emergency service ·
never speaks for an agency · instructions inside user input *or retrieved
documents* are data · no motive attribution · no earthquake prediction.

**`DO_NOT_CITE` registry, and why.** First live test answered *"the DRRM office,
established under Ordinance No. 132, Series of 2011"* — the rejected claim.
Retrieval was correct; the note explains why the number is wrong, and repeating
it to explain made it the most salient token. A boolean flag tells the model to
be careful without saying *what* about. Fixed at the **data level**: named
identifiers injected as explicit prohibitions **and** regex-checked against the
output, with a correction appended if one slips through.

**Paper-worthy:** in a corpus that documents its own errors, negative findings
are a retrieval hazard. Any RAG over an audit trail needs identifier-level
suppression derived from the provenance record, not cautionary instructions.

**Not done:** rate limiting (add Vercel KV/Upstash before public — the Groq key
is otherwise exposed to abuse volume) and an eval set (a 30-item set was drafted
externally; the generation brief is in `docs/PROJECT_DESCRIPTION.md`).

---

## Website

**Live:** `/` (map) · `/rationale` · `/methodology` · `/policy` · `/ask`
**In the pending tarball:** `/arithmetic`

**Still GitHub-only, invisible to visitors:** `findings/SYNTHESIS.md` ·
`findings/why_proactive_disclosure.md` · `findings/retrieval_methods.md` ·
`ATTRIBUTION.md` · `docs/scope.md`

So a visitor gets **Layer 1 complete** once `/arithmetic` ships, but **Layer 2 as
a bare matrix** — no synthesis, no argument, no explained taxonomy. And arriving
at `/` gives a map with nothing saying there are two layers.

### The fault-trace fix in the pending tarball

Not a rendering bug — a **scope gap**. Trace runs lat 14.167–15.022; northernmost
modelled polygon is 14.8686 (San Jose del Monte). 98 of 108 vertices are inside,
10 are beyond — **~17 km**. The WVF crosses **Norzagaray and Doña Remedios
Trinidad, Bulacan**, which are **not** among the 35. Rendering the trace
uniformly implies those areas were assessed and found to have no loss; they were
never assessed. Now split: solid inside, faded dashed beyond, with a footnote in
both copy modes ("Blank does not mean zero loss" / "not that they are safe").

---

## THREE OPEN REQUESTS — start here

**1. Em dashes — user says it reads AI-generated. Wants them reduced.**

| file | count |
|---|---|
| `policy-layer/findings/SYNTHESIS.md` | 39 |
| `docs/THE_ARITHMETIC.md` | 24 |
| `web/src/app/arithmetic/page.tsx` | 16 (8 are section separators like `1 — How hard...`, structural) |
| `web/src/app/policy/page.tsx` | 4 |
| `web/src/app/ask/page.tsx` | 3 |

Replace with colons, semicolons, parentheses, or split sentences. Keep the
section-number separators.

**2. sci / basic toggle on every page.** The infrastructure already exists:
`web/src/lib/copy.ts` exports `CopyMode = 'sci' | 'basic'` with a `COPY` object,
already used by `app/page.tsx`, `SummaryStats.tsx`, `CityDetailPanel.tsx`. Extend
it to `/arithmetic`, `/methodology`, `/policy`.

**Unresolved design question — ask the user:** what should "basic" do with the
equations on `/arithmetic`? (a) hide the LaTeX, prose only; (b) keep it, add a
plain-language gloss beneath each; (c) two separate page bodies. Different
amounts of work.

**3. `/findings` page + landing summary on `/`.** Closes the Layer 2 website gap.
`SYNTHESIS.md` headlined as *"Every LGU has a disaster office. One of six
publishes the plan."* Landing needs three sentences above the map naming both
layers and both findings, with links.

**Design reference the user wants matched:** tubig-map (Xavier P., LinkedIn) —
headline *is* the finding in plain language; arithmetic visible on the page;
human-scale translation ("about 2,500 Olympic pools"); uncertainty stated
adversarially; limitation in the sub-headline, not buried; one card = one claim.
**Caveat:** that works because its findings are quantitative comparisons. Layer 1
fits exactly. Layer 2 is *categorical* — four modes of failure — and needs a
different visual grammar, probably a matrix with one thing highlighted.

---

## Also outstanding

- **`web/tsconfig.json` has no `target`**, so TS defaults to ES5. This already
  broke the Vercel build once (`Map.keys()` iteration, patched with
  `Array.from`). Add `"target": "ES2017"` before it recurs.
- **Two gaps an intern (Juls Berin) found that belong in the paper:**
  1. Calibration events are **tectonic-only, by requirement not preference** —
     AWW12 is for active crustal regions; volcanic earthquakes have different
     source physics. State it.
  2. **Focal-mechanism mismatch:** 1990 Luzon was strike-slip (same as the WVF,
     dextral strike-slip), but **2013 Bohol was reverse faulting**. AWW12 does
     not distinguish mechanism so it is defensible — but acknowledge it.
  Also: calibration geography (Central/Northern Luzon 1990) is not scenario
  geography (Metro Manila 2026). Learned parameters are treated as transferable
  properties of Philippine building stock, not place-specific. Real assumption,
  worth stating.
- **Scope precision:** the VFS Atlas lists WVF-*transected* Metro Manila LGUs as
  QC, Marikina, Makati, Pasig, Taguig, Muntinlupa. **Pateros is fault-*adjacent*,
  not transected.** `docs/scope.md` says "on or directly adjacent to," which is
  correct — keep the paper precise. Muntinlupa is the defensible seventh.
- **Optional retrieval, changes no finding:** QC SP-2290 s.2014 full text
  (location known — council portal, 18th Council); QC SP-2549 s.2016 seismic
  retrofitting; PCDRRMC Res. 1 and 9 s.2023.
- **Deferred by decision:** evacuation-accessibility layer
  (`findings/PROPOSED_evacuation_accessibility_layer.md`) — scoped **pre-event
  only**, since post-earthquake road networks are not intact.

---

## Conventions

**Tarballs.** Claude clones the public repo, edits, runs `model/src`, hands back
a tarball with repo-relative paths. Land with `tar xzf <file> --overwrite` at
repo root → `git add` → commit → push.

**Ledger.** `policy-layer/ledger/status.csv` is source of truth (LGU × OB1–OB8).
Edit, then `cd policy-layer/ledger && python3 render_ledger.py` → regenerates
`LEDGER.md` deterministically. Statuses: `present` · `partial` · `to-collect`
(haven't found) · `absent` (looked, confirmed not there — **currently zero, keep
it honest**). Never blank.

**Provenance.** Every claim traces `LEDGER.md` → `status.csv` → evidence field →
corpus note → `ledger/manifest.csv` → source URL + `source_type` (`primary-gov` /
`secondary-academic` / `secondary-third-party` / `secondary-news` /
`compiled-summary`). Unverified claims carry `PENDING` in `provenance_note`.
**Check that column before citing anything externally.**

**Licences.** PH government works not copyrighted (RA 8293 §176) — full text OK
with attribution. Third-party (ADPC, EMI) quote-with-credit, facts-only, never
paste full text. Pre-2010 docs are context, never current-law compliance. GEM
GAF-DB is CC-BY-SA — attribute Styron & Pagani (2020), share-alike. EM-DAT raw is
no-redistribution (gitignored).

**Naming trap, already hit once:** do not name a React component `Math` — it
shadows the JavaScript global inside any importing module, so `Math.log10(...)`
resolves to the component and throws at runtime. The KaTeX wrapper is `TeX.tsx`.

---

## Resume prompt

> Continue the-big-one. Repo `/d/the-big-one` on `main`, remote HEAD `6e31868`,
> with `the-big-one_faulttrace-scope-fix.tar.gz` still to land from
> `/d/Downloads`. Pull the public repo and read `HANDOFF_S8.md`,
> `policy-layer/findings/SYNTHESIS.md`, `policy-layer/ATTRIBUTION.md`,
> `policy-layer/ledger/status.csv`, `docs/THE_ARITHMETIC.md`, `docs/scope.md`.
> I want to [X]. Update honestly — primary vs secondary, PENDING flags, the two
> failed-verification identifiers — and give me the git commands.

Claude can pull the repo and re-run `model/src` to regenerate every figure.
Memory does not carry across chats; everything needed is in the repo.
