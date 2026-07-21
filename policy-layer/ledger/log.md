<!-- Hand-edit THIS file for narrative/log/to-dos. Edit status.csv for per-obligation data.
     Then run: python3 render_ledger.py   → regenerates LEDGER.md -->

# Policy-Layer Ledger

Living record of collection progress, per-LGU compliance status against the 8
RA 10121 obligations, and — deliberately — **lapses**, including the case where
a document *exists but the public can't view it*. Pilot LGUs: Makati, Marikina,
Pasig, Quezon City, Pateros.

## How this works
- `status.csv` is the source of truth (LGU × obligation). Edit it as evidence
  lands, then run `render_ledger.py` to rebuild the matrix, lapse register, and
  per-LGU tables below.
- `log.md` (this file) holds the narrative: what happened each session, and the
  global to-dos.

## Status codes
- **present** — obligation met, evidence in hand.
- **partial** — partially met, *or* met-but-with-a-lapse (see below).
- **to-collect** — plausibly exists; we simply haven't obtained/verified it yet.
- **absent** — positively confirmed *not* to exist / not adopted.

Note the difference between `to-collect` (we haven't looked) and `absent` (we
looked and it isn't there). Most current gaps are `to-collect`, not `absent` —
don't let the matrix read as "the LGU failed" when it means "we haven't pulled
the doc yet."

## Lapse taxonomy (the point of this ledger)
- **access** — the document exists but is **not publicly viewable**: portal says
  "not currently available," dead link, login-walled, or "on request only."
- **not-adopted** — the obligation isn't fulfilled at all.
- **outdated** — exists but stale (e.g., plan past its 3-year test/update cycle).
- **scope** — exists but doesn't cover the required scope (e.g., all-hazards plan
  with no earthquake component, against a WVF seismic sub-lens).
- **unverified** — a citation/claim exists but the source hasn't been obtained.

**Scoring rule for access-lapses.** Obligations #4 (hazard maps & plans
*publicly displayed*) and, by extension, #2 where public availability is implied
cannot score **present** on an `access` lapse — a document the public can't see
does not satisfy a *public-display* duty. Cap at **partial** and log the lapse
with a **dated capture** (Wayback snapshot or screenshot) as the evidence.

## Session log
- **2026-07-21 · S1** — OCR'd Makati Ord. 2014-064 and Marikina Res. 109 s.2025;
  identified hazard KMZs (Makati GR/EIL, Pasig GS, QC EIL → Pasig & QC enter the
  corpus); logged national reference set. Makati reached ~6–7/8 evidenced.
- **2026-07-21 · S2** — Full-folder scanned-vs-text classification; extracted 8
  text-layer docs; deduped NDRP; OCR'd NDRRMC MC-07 s.2025 (adopts NDRP 2024);
  found **RA 10121 IRR** (citation anchor) and **Marikina Ord. 020 s.2023**
  (EQ Preparedness Ordinance → obligation #6 drills + seismic lens). Clipped 43
  fault-trace maps from the Atlas.
- **2026-07-21 · S3** — Stood up this ledger; logged the Makati public-portal
  **access-lapse** (OB4) reported from the city site.
- **2026-07-21 · S4** — Scanned the full GitHub repo (monorepo: `model/` loss
  engine + `web/` Next.js + policy-layer docs). Found the committed WVF trace is
  a 12-point **placeholder**. Pushed a methodology fix: adopted the authoritative
  **GEM Global Active Faults** WVF trace (108 vtx, cross-checked vs Atlas + Ord.
  020's 129.47 km), quantified the rrup/MMI sensitivity → **resolves limitation
  #5** with bounded impact (≤±0.1 MMI at M7.2; matters more at lower M). Also
  dated Marikina Ord. 020 (enacted 22 Mar 2023, approved 12 May 2023) →
  strengthens OB6. See `FAULT_TRACE_METHODOLOGY_FINDING.md`.
- **2026-07-21 · S5** — Wired the GEM WVF trace into the loss engine: repointed
  `model/src/scenarios.py` to `wvf_trace_gem.geojson`, rebuilt the ABC posterior
  (verified it reproduces the prior live $44.2B under the OLD trace → no
  calibration drift) and regenerated `m{60..72,75}.json` + `web/.../fault-trace.geojson`.
  Trace-only effect at M7.2: national P50 $44.2B → **$45.4B (+2.7%)**, validation
  ratio 0.92x → 0.95x, Bohol out-of-sample still PASS. Measured per-LGU shifts:
  rrup up to ±7.5 km, MMI up to **+0.35 / −0.46** (mean |ΔMMI| 0.105) — so
  limitation #5's "≤±0.1 MMI" is the *mean*, not the bound; methodology text
  still to update. Ingested **ADPC Safer Cities 22 (Iglesias & Yu, 2008)** as a
  *secondary* Marikina source (facts-only extract, copyright-flagged): corroborates
  OB5 via Ord. 109 s.2005 (Comprehensive EQ Disaster Reduction program); logged
  Ord. 264 s.1998 (Rescue 161 office) as pre-RA 10121 OB1/OB3 context only — **no
  status flips.** Makati Ord. 2014-064 re-uploaded; already ledgered (OB1/OB3), no
  change. Attributions updated in `CITATIONS.md` (§5 secondary + §6 + BibTeX).
- **2026-07-21 · S6** — **Quezon City ingested → 8/8 present, all public, 0 lapses.**
  Pulled the QCDRRMO page + read the QCDRRMP 2021–2027 (Vol. 1) text; extracted the
  full EO/ordinance/resolution register to `corpus/QuezonCity/quezon_city_drrm_evidence.notes.md`.
  Primary instruments: QCDRRMO created by **Ord. SP-2290 s.2014** (OB1/OB3); LDRRMP
  is a **public PDF** adopted by Res. 6 s.2020 (OB2); **Risk Atlas 2014** publicly
  downloadable → OB4 **present, no access-lapse** (contrast Makati); HVRA 2013 (OB5);
  mandatory drills SP-2674 s.2017 (OB6); **≥5% LDRRMF** adopted annually with peso
  figures, e.g. PHP 1.18B for 2020 (OB7); DRR/CCA in CLUP + Zoning SP-2502 s.2016 +
  LCCAP (OB8). Notable: QC's own EQ scenario cites **MMEIRS 2004 M7.2 WVF** — the same
  basis as our loss model, so it independently corroborates the hazard. This makes QC
  the top of the transparency gradient (QC public 8/8 > Makati OB4 access-lapse > Pasig
  FOI-gated > Marikina partial > Pateros nothing surfaced).

## Global to-dos
- [ ] **Capture the Makati access-lapse**: dated Wayback snapshot + screenshot of
      the "not currently available" pages; attach URL to OB4 evidence. *(reported,
      not yet captured)*
- [ ] Backfill `source_url` for every uploaded file (scope treats it as the
      citation link; scorecard can't cite without it).
- [ ] Collect Marikina **LDRRMP** + DRRMO-creating ordinance (OB2/OB3).
- [ ] Collect Pasig / Pateros core policy docs (Pasig plan is FOI-gated; Pateros
      nothing surfaced — likely the absent/access contrast). ~~Quezon City~~ **done (S6, 8/8)**.
- [ ] OCR Makati Annual Report 2022 → drills evidence (OB6).
- [ ] Vectorize the WVF trace from `atlas_fault_clips/` (loss-model Part 1 TODO).
- [x] ~~Replace placeholder WVF trace~~ → **done via GEM GAF DB**; **wired into
      the engine (S5): `scenarios.py` repointed, `m{60..72,75}.json` +
      `fault-trace.geojson` regenerated & pushed.** Remaining: update **methodology
      limitation #5 wording** — "≤±0.1 MMI" is the mean; state max ~0.45 MMI / ±7.5 km.
- [ ] Sweep each LGU site once with the lapse taxonomy in hand and log every
      access-lapse (dead links / "not available") — these are findings, not noise.
