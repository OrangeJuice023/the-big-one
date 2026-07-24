# Marikina — accessibility inconsistency (S7j)

**Purpose:** record that Marikina's disclosure posture is **not uniform**, and
that treating it as a single `access-foi` LGU understates what is actually
happening. Prompted by a working observation that Marikina cannot be
retrieved the way Pasig was.

**Ingested:** S7j. Analysis note; no status changes.

---

## First, a correction to guard against drift

We do **not** know what Marikina Ordinance No. 32, s. 2011 is about.

The only trace we hold is a single line inside the Marikina Citizen's Charter
2012: *"First Aid as mandated in section 23 of ordinance no. 32 series of
2011."* That establishes (a) the ordinance exists, and (b) its §23 mandates
something concerning first aid. It establishes **nothing** about the
ordinance's title, subject matter, scope, or remaining provisions.

It surfaced during the failed verification of the claimed "Ord. 132 s. 2011"
and is retained only as a possible explanation for a 132/32 digit confusion.
It must not be described as summarised, characterised, or understood. Any
statement about what Ord. 32 s.2011 *does* requires the document.

---

## The actual pattern: a vintage cliff, not a uniform gate

We have been recording Marikina as an `access-foi` LGU — documents exist, are
actively shared on request, and are not proactively published. That is true of
the **planning** documents. It is **not** true of everything.

Audit of what is physically in `corpus/Marikina/`:

| Document | Vintage | Held? | Route |
|---|---|---|---|
| Res. 109 s.2025 (calamity fund) | 2025 | ✅ full text | obtained directly |
| Ord. 020 s.2023 (EQ Preparedness) | 2023 | ✅ full text | obtained directly |
| CLUP 2018–2027 | 2018 | ❌ | 3rd-party academic mirrors, or CPDO/eFOI |
| Ord. 32 s.2011 | 2011 | ❌ | one citation only |
| Ord. 132 s.2011 (claimed) | 2011 | ❌ | unverified; may not exist |
| Ord. 264 s.1998 (Rescue 161) | 1998 | ❌ | secondary sources only |
| LDRRMP (current) | current | ❌ | eFOI, granted on request |
| Citizen's Charter 2012 | 2012 | ⚠️ partial | reachable on a CloudFront CDN (`d27gr9t9vsogta.cloudfront.net`), not the LGU domain |

**Everything from 2023 onward is in full text. Nothing before 2023 is.**

That is a cliff, not a policy. It suggests Marikina began publishing
legislative instruments at some point around 2023 and did not backfill the
archive — the same shape as Taguig's index (2022–2024 only) and the opposite
of Pasig, whose `assets.pasigcity.gov.ph` reaches back to at least 2015
(Ord. 02 s.2015 is retrievable).

## Two axes, not one

The corpus has been scoring a single axis — *lapse type*, i.e. **how** a
document fails to be publicly displayed. Marikina makes visible a second,
independent axis: **archive depth**, i.e. **how far back** an LGU's
proactive disclosure extends.

These vary independently:

| LGU | Deepest retrievable instrument | Archive depth | Lapse type on current instruments |
|---|---|---|---|
| Pasig | Ord. 02 s.2015 | ~2015 | `access-opaque` (hash URLs, scan-only) |
| Makati | Zoning Ord. 2012-102 | ~2012 | `access-broken` (dead links) |
| Marikina | Ord. 020 s.2023 | ~2023 | `access-foi` (plans on request) |
| Taguig | index begins 2022 | ~2022 | `access-opaque` (titles only) |
| Pateros | index PDF spans 1988–2019 | nominally deep, functionally nil | `access-none` |
| QC | — | comprehensive | none |

Pateros is the instructive case for why depth alone is not the measure: its
portal hosts a `RESOLUTION-1988-2019.pdf` index spanning **thirty-one years**
— nominally the deepest archive of the six — yet it is a single bot-blocked
PDF containing no retrievable DRRM instrument. Depth without usability is not
disclosure.

## Why this matters for the argument

Three refinements to the thesis:

1. **"Marikina is eFOI-gated" is imprecise.** Marikina publishes *recent
   legislative instruments* and withholds *planning documents* and *older
   legislation*. The eFOI gate is real but applies to a subset. The record
   should say which subset.

2. **Disclosure posture can be a date, not a policy.** An LGU that started
   publishing in 2023 and never backfilled is failing "publicly displayed"
   for its pre-2023 corpus without having made any decision to withhold it.
   That is a different governance failure from a deliberate on-request
   channel, and arguably an easier one to fix — it is a digitisation backlog,
   not a disclosure policy.

3. **The RA 10121 obligations are not vintage-neutral.** The DRRMO-creating
   ordinance is by definition an *old* document (RA 10121 dates from 2010, so
   compliant LGUs created their offices 2010–2012). An LGU whose archive
   begins in 2022 or 2023 therefore **structurally cannot** evidence OB3 from
   its own portal, regardless of intent. This is precisely the position
   Marikina and Taguig are both in — and it explains why OB3 is the hardest
   obligation to close across the corpus.

Point 3 is the one worth carrying into the paper. It reframes a scattered set
of OB3 gaps as a systematic artefact: **the obligation most likely to be
undocumented is the one whose evidence is oldest.**

## What this does and does not change

- **No status changes.** Marikina stays 3 present / 5 partial; the `access-foi`
  tags on OB2, OB3 and OB8 remain accurate for those specific documents.
- The `access-*` taxonomy is unaffected — archive depth is orthogonal to it,
  not a fifth category.
- Recording archive depth as a per-LGU attribute is **proposed, not
  implemented.** It would need a defensible measure (earliest retrievable
  instrument? proportion of a known register that is retrievable?) and that
  measure would need to be applied consistently across all six LGUs before it
  could be reported. Deferred.

## Practical note on retrieval

Where a document is not proactively published, the routes are: certified true
copy from the Sangguniang Panlungsod / City Secretary, or an eFOI request.
For **legal** use — court, audit, permit — the certified copy with dry seal is
what is required, and no scraped PDF substitutes for it. For **research** use,
the eFOI copy is sufficient and is the documented route Marikina has actually
granted before.

For this project's purposes an eFOI copy suffices, and Marikina's LDRRMP has a
granted-request precedent. The DRRMO-creating ordinance is the item that most
warrants a request, since it is both load-bearing for OB3 and — per the
vintage cliff above — structurally absent from the portal.

## TODO
- [ ] eFOI or Sanggunian request: Marikina DRRMO-creating ordinance (resolves
      OB3 and the failed Ord. 132 claim in one step).
- [ ] Obtain Ord. 32 s.2011 to establish its subject matter, or drop it from
      the register as an unresolvable lead.
- [ ] If archive depth is to be reported, define the measure and apply it to
      all six LGUs consistently.
