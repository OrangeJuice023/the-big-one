# Quezon City — verification pass (S7m)

**Purpose:** QC anchors the transparency gradient. Every other LGU is scored
relative to it, yet QC had **zero primary PDFs** in corpus and its 8/8 rested
on the legal register printed inside the QCDRRMP 2021–2027 — the LGU
attesting to its own compliance, never independently checked. This pass
tested whether that holds.

**Result: it holds, and QC is stronger than recorded.**

**Ingested:** S7m.

---

## Why this pass was necessary

Asymmetric rigour is a methodological vulnerability. By S7i we had verified
three Pasig documents against primary text and caught two compiled-summary
failures elsewhere. QC — the reference point — had been verified least.

The specific risk being tested: **that QC publishes its *plan* well but not
its *legislation***, which would mean QC shares the OB3 problem common to the
rest of the corpus, concealed behind a well-published plan. Had that been
true, the top of the gradient would have needed revision.

It is not true.

---

## Finding 1: QC operates a full legislative portal

`qccouncil.quezoncity.gov.ph` is a dedicated Sangguniang Panlungsod site,
separate from the main city domain, providing:

- **City Ordinances browsable by council term — 1st City Council through
  23rd.** This is the city's entire legislative history, not a recent window.
- **Codified Ordinances** as a distinct section.
- **Ordinances on Peace and Order** — thematic grouping.
- **Resolutions.**
- **Proposed Ordinances** and **Proposed Resolutions** — the legislative
  *pipeline* is published, not only enacted measures. Nothing in RA 10121
  requires this.
- **Browse by author.**

Full text is served as PDFs at human-readable paths — e.g.
`quezoncity.gov.ph/wp-content/uploads/2021/07/SP-3011-S-2021.pdf`,
`sp-7209-s-2017.pdf`. The filename *is* the ordinance number.

### Direct contrast with the `access-opaque` cases

| LGU | Filename pattern | Guessable? | Indexable? |
|---|---|---|---|
| **QC** | `SP-3011-S-2021.pdf` | yes | yes |
| Pasig | `64feaae064e9e1694411488130-11.pdf` | no | no |
| Taguig | *(no file — title only)* | n/a | n/a |

The `access-opaque` category now has a **positive counterexample**, which
strengthens it considerably. Opaque naming is not an inevitability of LGU
web infrastructure; one LGU in the same metropolitan region, using the same
WordPress stack, names its files after the instrument they contain.

## Finding 2: archive depth — QC anchors the top of that axis too

The archive-depth axis proposed in
`corpus/Marikina/marikina_accessibility_inconsistency.notes.md` now has a
complete top anchor:

| LGU | Archive coverage | Form |
|---|---|---|
| **QC** | **1st–23rd City Council (complete)** | full text, browsable, thematic + by-author indexes |
| Pasig | ~2015 onward | full text, opaque URLs, no browsable index found |
| Makati | ~2012 onward (partial) | some full text; DRRM plan file-not-found |
| Taguig | 2022–2024 | titles only, third-party platform |
| Marikina | 2023 onward | full text, but nothing older |
| Pateros | 1988–2019 index PDF | single bot-blocked file, no DRRM content |

Recall the S7j observation that OB3 is structurally the hardest obligation to
close because its evidence is the oldest — DRRMO-creating ordinances date to
2010–2014, before most of these archives begin. **QC is the LGU for which
that constraint does not bind**, because its archive has no cutoff. This is
consistent with QC being the only LGU in the corpus at 8/8.

That is worth stating carefully in the paper: QC's completeness may be partly
*explained* by archive depth rather than being independent evidence of
superior compliance. The two are entangled.

## Finding 3: SP-2290 s.2014 is corroborated five ways

The DRRMO-creating ordinance is cited, with consistent title, across five
independent documents:

1. **QCDRRMP 2021–2027** (the plan itself) —
   `quezoncity.gov.ph/wp-content/uploads/2021/10/QCDRRMP-2021-2027_Volume-1-8Sept2021.pdf`
2. **QCDRRMO department page** on quezoncity.gov.ph
3. **QCDRRMO Citizen's Charter 2020** —
   `quezoncity.gov.ph/wp-content/uploads/2020/09/QCDRRMO-CITIZENS-CHARTER-2020.pdf`
4. **QCDRRMO Citizen's Charter 2023** —
   `quezoncity.gov.ph/wp-content/uploads/2020/09/QCDRRMO-CITIZENS-CHARTER-2023.pdf`
5. **League of Cities of the Philippines presentation** (external to QC) —
   `lcp.org.ph/UserFiles/League_of_Cities/file/Presentation_Quezon-City-DRRM-Initiatives.pdf`

Consistent title throughout: *"An ordinance creating the Quezon City Disaster
Risk Reduction and Management Office (QCDRRMO), defining its functions,
duties and responsibilities, providing for its composition, appropriating
funds thereof and for other purposes."*

The amendment chain is likewise consistent:
- **SP-2424, s.2015** — amends SP-2290 to correct position titles,
  qualification standards and salary grades of QCDRRMO technical staff,
  pursuant to **JMC 2014-1**.
- A further ordinance amends §1 of SP-2424, reorganising the structure,
  **creating 51 additional plantilla positions** and absorbing 4 positions
  from the Disaster Control Division, Department of Public Order and Safety.

⚠️ **Still not done:** the **full text of SP-2290 itself** has not been
retrieved into corpus. Existence, title and amendment history are
corroborated to a standard well beyond anything else in the corpus, but the
instrument is not in hand. The council portal indexes the 18th City Council
(covering 2014), so it should be directly obtainable — this is a retrieval
task, not a research question.

## Finding 4: three DRRM instruments not previously in the register

Surfaced during this pass:

- **Ordinance No. SP-2549, s.2016** — *"establishing a mandatory seismic
  retrofitting program for Quezon City-Owned and Barangay-Owned Buildings,
  particularly those built before the 1990 Earthquake, adopting Engineering
  [standards]…"* Directly relevant to **OB8** (structural resilience
  mainstreamed), and notably targets pre-1990-earthquake building stock —
  the same vulnerability class the loss model's fragility curves address.
  Comparable in kind to Pasig's Green Building Ordinance No. 06 s.2016.

- **Executive Order No. 23, s.2010** — organising the QCDRRMC, redefining its
  functions and composition pursuant to RA 10121. Predates SP-2290 by four
  years; establishes that QC stood up its *council* in the same year RA 10121
  was enacted, and its *office* in 2014.

- **Office Order No. 72** — *"constituting the WEST VALLEY FAULT TASK GROUP,
  redefining its functions and providing for its composition."* A standing
  body dedicated specifically to the WVF. No equivalent instrument has
  surfaced for any other LGU in the corpus.

## Ledger effect

**No status changes.** QC remains 8 present / 0 partial / 0 to-collect /
0 lapses. What changes is the **strength** of the evidence:

- **OB3** — corroborated five ways including one source external to QC;
  full-text retrieval identified as a task with a known location.
- **OB8** — SP-2549 s.2016 (seismic retrofitting) added to the register.
- **OB1** — EO 23 s.2010 and Office Order No. 72 (WVF Task Group) added.

The verification did what it was meant to do: the reference case was tested
against the possibility that it was overstated, and it was not.

## Provenance TODO
- [ ] Retrieve **SP-2290 s.2014 full text** from the council portal (18th
      City Council) into `corpus/QuezonCity/`. This closes the last
      primary-source gap at the top of the gradient.
- [ ] Retrieve **SP-2549 s.2016** (seismic retrofitting) — substantive OB8
      evidence, and a useful comparator to Pasig's Green Building Ordinance.
- [ ] Retrieve **Office Order No. 72** (WVF Task Group) if obtainable —
      would be a distinctive OB1 artefact.
- [ ] Ingest the **QCDRRMP 2021–2027 PDF itself** into corpus. It is
      publicly downloadable and is currently referenced by URL only.
