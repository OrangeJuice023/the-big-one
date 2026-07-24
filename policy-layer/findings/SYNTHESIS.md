# Synthesis — DRRM disclosure posture across six WVF-corridor LGUs

**Status:** consolidating document. Draws together material distributed across
twelve corpus notes and the ledger. This is the document a paper should be
written from; it is not itself the paper.

**Ingested:** S7n. Reflects ledger state as of 24 July 2026.

---

## 1. The finding, stated once

Six Metro Manila local government units on or adjacent to the West Valley
Fault were audited against the eight core obligations of RA 10121. **All six
have established Local Disaster Risk Reduction and Management Offices. All
six conduct disaster risk reduction activity.** They diverge sharply — and
systematically — in whether the statutory documents evidencing that activity
are publicly accessible.

That divergence is not random. It takes **four distinct forms**, each
distinguishable by mechanism, and it concentrates in the single obligation
that explicitly requires public display.

The gap this exposes is not primarily a local capacity failure. RA 10121
requires plans and hazard maps to be "publicly displayed" but never specifies
*online*, *downloadable*, or *proactively disclosed*. EO 2, s. 2016 then
supplies a request-based default for anything not proactively published. An
LGU can satisfy the letter of the law with a hard copy at city hall and a
functioning request desk — and five of six do something close to that.

---

## 2. The evidence

### 2.1 Compliance matrix

| Obligation | Makati | Marikina | Pasig | QC | Pateros | Taguig |
|---|---|---|---|---|---|---|
| **OB1** LDRRMO established · §12(a) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **OB2** LDRRMP formulated, tested, updated · §11(b)(1), §12(c)(6) | ◐ broken | ◐ foi | ✓ | ✓ | · | · |
| **OB3** Ordinance creating DRRMO · IRR R6 §6 | ✓ | ◐ foi | ✓ | ✓ | · | ◐ opaque |
| **OB4** Hazard maps & plans **publicly displayed** · IRR R6 §7, §12(c)(10) | ◐ broken | ◐ | ◐ foi | ✓ | · | ◐ foi |
| **OB5** Local risk assessment · §12(c)(2,3,9) | ✓ | ◐ | ✓ | ✓ | · | ◐ |
| **OB6** Regular drills · IRR R6 §7, §12(c)(4) | · | ✓ | ✓ | ✓ | ◐ none | ✓ |
| **OB7** LDRRM Fund + 30% QRF · §21 | ✓ | ✓ | ◐ | ✓ | ◐ none | ◐ foi |
| **OB8** DRR mainstreamed into CDP/CLUP · §11(b)(2) | ✓ | ◐ foi | ✓ | ✓ | · | ◐ foi |
| | **5/2/1** | **3/5/0** | **6/2/0** | **8/0/0** | **1/2/5** | **2/5/1** |

48 cells: **25 present · 16 partial · 7 to-collect · 0 absent.**
12 lapses: **7 `access-foi` · 2 `access-broken` · 2 `access-none` · 1 `access-opaque`.**

### 2.2 Two patterns in the columns

**OB1 is universal.** Every LGU in the sample has an established LDRRMO —
including Pateros, the country's smallest municipality at 1.66 km², whose
office is attested by DILG-NCR and OCD-NCR at national fora and whose officer
sits on panels alongside those of Pasig and Navotas. This is the empirical
basis for the claim that *activity is not the variable*. If DRRM capacity
explained the divergence, OB1 would not be uniform.

**OB4 is the weakest obligation in the entire matrix** — 1 present, 4 partial,
1 to-collect. It is also the *only* obligation whose text explicitly requires
public display: "hazard maps and plans **publicly displayed**."

Those two facts sit next to each other and should be read together. The
obligation that every LGU satisfies is the one about *having* an office. The
obligation almost none satisfy is the one about *showing* the public what the
office produces. That is the thesis compressed into two rows.

Only Quezon City satisfies OB4.

### 2.3 The modal failure is on-request disclosure

Seven of twelve lapses are `access-foi` — a deliberate, functioning,
on-request channel rather than proactive publication. This is not
concealment. In every case the document is obtainable, usually free. It is a
choice about *mode*, and the mode systematically filters who actually obtains
the document (see §5).

---

## 3. The taxonomy

Four mechanisms by which an LGU fails "publicly displayed." Each is
distinguishable, each is evidenced more than once, and each has a different
policy implication.

| Mode | Mechanism | Evidence in corpus |
|---|---|---|
| **`access-broken`** | LGU attempted publication; the link fails | Makati: Enhanced DRRM Plan 2019–2030 described in detail on the Resilient Makati portal, plan PDF returns file-not-found; hazard layers show "not currently available" |
| **`access-foi`** | Deliberate on-request-only channel | Marikina: LDRRMP granted via foi.gov.ph, CLUP via CPDO/eFOI. Taguig: updated CLUP requested through DENR-LMB (`DENRLMB-761820630189`). Pasig: LDRRMP via PCDRRMO counter service |
| **`access-none`** | No digital-disclosure attempt for the item | Pateros: portal exists and is maintained for other purposes; publishes no DRRM content. All DRRM evidence reaches the public through PIA, SubayBAYAN, and Facebook |
| **`access-opaque`** | File is online but unfindable, unindexable, or unsearchable | Three distinct manifestations — see below |

### 3.1 `access-opaque` has three mechanisms, not one

This is the sub-type that generalises furthest, because the same failure
arises from three unrelated causes:

- **Unfindable** — Pasig serves ordinances at `assets.pasigcity.gov.ph/…/64feaae064e9e1694411488130-11.pdf`. A 22-character hash prefix defeats URL construction and offers search engines nothing to index.
- **Unsearchable** — Makati's Annual Report 2022 and Pasig's Resolution 269-11 are scans with no text layer. Ctrl-F fails; extraction requires OCR.
- **Empty** — Taguig's ordinance index (`sites.google.com/view/taguigcity`, a free third-party platform, covering 2022–2024) lists titles with no text, no PDFs, no links. The existence of legislation is disclosed; its content is not.

### 3.2 The positive counterexample

Quezon City serves ordinances as `SP-3011-S-2021.pdf` — the filename *is* the
instrument number. Same metropolitan region, same WordPress stack as
neighbouring LGUs, human-readable paths, browsable index. Opaque naming is
therefore **not an infrastructural inevitability**; it is a practice one LGU
in the sample does not follow.

---

## 4. A second, independent axis: archive depth

Lapse type describes *how* disclosure fails. Archive depth describes *how far
back* proactive disclosure extends. They vary independently.

| LGU | Archive coverage | Lapse type on current instruments |
|---|---|---|
| QC | 1st–23rd City Council (complete) | none |
| Pasig | ~2015 onward | `access-opaque`, `access-foi` |
| Makati | ~2012 onward, partial | `access-broken` |
| Taguig | 2022–2024 | `access-opaque`, `access-foi` |
| Marikina | 2023 onward | `access-foi` |
| Pateros | 1988–2019 index PDF, bot-blocked, no DRRM content | `access-none` |

Pateros demonstrates why depth alone is not the measure: its index nominally
spans thirty-one years — the longest in the sample — inside a single
inaccessible file containing no DRRM instrument. **Depth without usability is
not disclosure.**

### 4.1 The structural consequence for OB3

RA 10121 dates from 2010, so a compliant LGU created its DRRM office between
roughly 2010 and 2014. **An LGU whose archive begins in 2022 or 2023
structurally cannot evidence OB3 from its own portal**, whatever its
intentions. Marikina and Taguig are both in this position.

This reframes a scattered set of OB3 gaps as a systematic artefact: *the
obligation most likely to be undocumented is the one whose evidence is
oldest.*

It also carries a caution about the reference case. **QC is the one LGU for
which this constraint does not bind**, because its archive has no cutoff. Its
completeness may therefore be partly *explained* by archive depth rather than
being wholly independent evidence of superior compliance. The two are
entangled, and the paper should say so rather than presenting QC's 8/8 as a
pure capability result.

---

## 5. The sharpest single case

Pasig is the most instructive LGU in the sample, because both halves of the
finding are documented in one place, by the city itself.

The **Committee on Disaster Resilience**, in the hearing that produced
Resolution 130-11 (7 June 2023), directed that copies of the LDRRMP 2023–2028
"be also available to them and **down loadable thru Pasig City
website/platform**" — expressly so barangays and constituents could obtain
it.

As of July 2026, the adopting resolution is retrievable from the city's asset
server. The approximately 300-page plan it adopts is not. The operative
channel is the PCDRRMO Citizen's Charter document-request service: free of
charge, on a formal letter to the Mayor or PCDRRMO Chief, with a valid
government ID and **a personal USB drive of at least 5GB, presented in
person**.

In the same committee record, the consultant identified the populations for
whom the zero-casualty target was framed: *"public schools, temporary
shelter/houses of ISF, and those living along flood prone areas"* — and the
planning officer noted that informal settler families cannot be relocated
pre-event under the UDHA Law.

So one primary document establishes that informal settler families are a
priority population, that they cannot be moved in advance, and that the plan
covering them requires a letter, an ID, and a trip to the office with storage
media.

**The disclosure channel selects against the population the plan
prioritises.** And uniquely in this corpus, the gap is not between an external
standard and municipal practice — it is between the city council's own
recorded instruction and the city's own recorded procedure.

Corroborating the general pattern: across the whole sample, the identifiable
successful requesters are a **university student** (Taguig CLUP, via
DENR-LMB) and researchers. Not residents of the barangays named in the hazard
chapters.

---

## 6. Method, and one methodological contribution

### 6.1 Provenance discipline

Every cell traces: `LEDGER.md` → `ledger/status.csv` → the `evidence` field →
a corpus note → `ledger/manifest.csv` → a source URL and a `source_type`.
Source types are classified (`primary-gov`, `secondary-academic`,
`secondary-third-party`, `secondary-news`, `compiled-summary`), and claims not
yet verified against primary text carry an explicit `PENDING` flag in
`provenance_note`.

`ATTRIBUTION.md` records the full session audit.

### 6.2 The discipline caught two errors — and this is reportable

Two document identifiers entered the ledger from compiled research summaries.
Both were flagged `PENDING` rather than recorded as established. Both were
later put to primary verification. **Both failed.**

- **Marikina "Ordinance No. 132, s. 2011"** — claimed to create the MCDRRMO.
  The peer-reviewed IJSBAR study on precisely this institutional history
  attributes the transformation to RA 10121 directly and names no city
  ordinance. A separate Marikina Ord. 32 s.2011 exists.
- **Pasig "Ordinance No. 08-08, s. 2016"** — claimed to adopt the 2016–2021
  Earthquake and Flood Contingency Plan. The document retrieved under that
  identifier concerns **employee incentive awards**.

Meanwhile every compiled-summary claim that *could* be checked against
retrieved primary text — authors, approval dates, adopted plans, the PHIVOLCS
marker programme — **verified exactly**.

The pattern is consistent and worth stating as a finding in its own right:
**compiled summaries were reliable on substance and unreliable on
identifiers.** Both failures were document reference numbers. The operating
rule that follows — treat compiled-summary *facts* as leads and
compiled-summary *citations* as unverified until the document is in hand —
is a transferable result for any AI-assisted document-collection work.

Had the flags not been applied, two incorrect statutory citations would now
be in this record.

---

## 7. Limits

State these plainly.

1. **Six LGUs, not a sample.** Findings are LGU-level case studies. No
   statistical generalisation to the 17 NCR LGUs, still less to 1,634
   Philippine LGUs. The *taxonomy* is offered as structurally generalisable;
   the *distribution* is not.
2. **NCR only.** FOI practice, portal maintenance, and disclosure norms may
   differ substantially in provincial LGUs.
3. **One hazard.** Disclosure posture for typhoon, volcanic, or tsunami
   documentation is untested.
4. **Absence of evidence is not evidence of absence.** Every `to-collect`
   means "not located," not "does not exist." No cell is marked `absent`.
5. **Motive is unobservable.** The corpus documents what is disclosed and how.
   It contains no evidence of *why*. Institutional inertia, paper-era
   procedure, absence of legal requirement, absence of demand, and deliberate
   control are all consistent with the observations. Do not attribute intent.
6. **QC's completeness is entangled with archive depth** (§4.1).
7. **Point-in-time.** Portals change. Findings are dated; the Pasig
   non-publication finding should carry "as of July 2026."

---

## 8. What remains open

Retrieval tasks. None of these would change a finding; all improve the audit
trail.

- QC **SP-2290 s.2014** full text — location known (council portal, 18th
  Council). Closes the last primary-source gap at the top of the gradient.
- QC **SP-2549 s.2016** (seismic retrofitting, pre-1990 building stock) and
  **Office Order No. 72** (WVF Task Group).
- Marikina **DRRMO-creating ordinance** via Sanggunian or eFOI — resolves OB3
  and the failed Ord. 132 claim in one step.
- Taguig **LDRRMP** (OB2) and the pre-2022 DRRMO-creating ordinance (OB3).
- Pasig **PCDRRMC Res. No. 1 and No. 9, s.2023**; the actual 2016 contingency
  plan ordinance, or confirmation that "08-08" is erroneous.
- Pateros — five obligations to-collect. Lowest expected yield; the pattern
  is already established.

Deferred by decision, not oversight: the evacuation-accessibility layer
(`findings/PROPOSED_evacuation_accessibility_layer.md`), scoped to pre-event
conditions only.

---

## 9. One-paragraph statement

For an abstract or executive summary:

> Six Metro Manila LGUs on or adjacent to the West Valley Fault were audited
> against the eight core obligations of RA 10121. All six have established
> disaster risk reduction offices; all six conduct disaster risk reduction
> activity. They diverge sharply in whether the statutory documents
> evidencing that activity are publicly accessible, and the divergence
> concentrates in the single obligation that explicitly requires public
> display — satisfied by one of the six. We identify four distinguishable
> modes of failure: attempted publication with broken links, deliberate
> on-request-only channels, no digital disclosure attempt, and publication in
> forms that are unfindable, unsearchable, or empty of content. The
> underlying gap is national rather than local: RA 10121 requires plans and
> hazard maps to be "publicly displayed" without specifying the mode, and
> EO 2 (2016) supplies a request-based default for anything not proactively
> published. In the sharpest instance, a city council expressly directed that
> its disaster plan be made downloadable from the city website for barangays
> and constituents; three years later the adopting resolution is online, the
> plan is not, and the plan is obtainable only in person, on presentation of
> a letter, a government ID, and a USB drive.
