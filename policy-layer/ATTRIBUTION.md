# Policy layer — attribution & provenance guide

**Purpose:** consolidate how the policy-layer corpus is sourced, cited, and
verified. Anyone (Claude, a future collaborator, an external reviewer) should
be able to check the provenance of any claim in the ledger by tracing:
`LEDGER.md` → `status.csv` → `evidence` field → corpus note → `manifest.csv`
→ primary URL.

---

## Source-type taxonomy

| Type | What it is | Copyright posture | Attribution required |
|---|---|---|---|
| **primary-gov** | Philippine national or local government work (laws, ordinances, resolutions, plans, official maps, LGU portal content, government news agency releases like PIA) | Not copyrighted per RA 8293 §176 | Cite the enacting body + doc ID + primary URL when available |
| **secondary-academic** | Academic paper, thesis, published research | Copyrighted | Author + title + venue + year; quote-with-credit; don't paste full text |
| **secondary-third-party** | NGO / consultancy / think-tank reports (ADPC, EMI, PDRF); Facebook posts from national gov agencies acting in non-authoritative modes | Copyrighted | Publisher + title + year; quote-with-credit; treat as context, not statutory evidence |
| **secondary-news** | Independent news outlets (Inquirer, Rappler, Bulletin) | Copyrighted | Outlet + reporter + date + URL; quote sparingly (≤15 words); paraphrase |
| **compiled-summary** | User-supplied consolidated research summaries whose original compiler is not named or not verifiable | Underlying facts not copyrightable, but the compilation IS someone's editorial work | Treat as intermediate; log the fact of compilation; migrate off it once primary sources are ingested |

## Compliance rules already in force (from S6 handoff)

- PH government works: full text OK with attribution.
- Third-party: quote-with-credit, don't paste full text, facts-only extract.
- Pre-RA 10121 (2010) docs: context only, do NOT flip a status.
- Provenance: fill `source_url` in `manifest.csv` at ingest.

## Additional rules (added S7e in response to attribution flag)

1. **Compiled-summary content must be marked.** Any corpus note built from a
   user-supplied compiled summary must state so at the top and identify
   which specific claims come from that summary vs. primary text.
2. **Specific interpretive claims marked ⚠️.** Any claim that requires a
   specific interpretive judgment (e.g., "only 3 NCR LGUs" or "the first
   ordinance to X") that came from a compiled summary must be flagged
   inline as needing second-source verification.
3. **Manifest is the ground truth for URLs.** Every document referenced in a
   corpus note or ledger row should have a row in `manifest.csv` with its
   primary URL (if known), alt URL (if any), source type, and provenance note.
4. **Migrate off compiled summaries when possible.** Once a primary PDF is
   ingested into corpus, corpus notes that referenced the compiled summary
   should be updated to cite the primary directly.

## Session-by-session attribution audit (S6–S7e)

### S6 (before this project layer's checkout)
- QC ingest: primary-gov, QCDRRMP direct URL cited. ✅ Clean.

### S7a — Makati CDP + Zoning ingest
- Source: user uploaded actual primary PDFs.
- Notes cite primary URLs and are facts-only extracts.
- Some direct quotes from ordinance text — permitted (primary-gov + attribution).
- ✅ Clean.

### S7b — Makati Enhanced DRRM Plan 2019-2030 access finding
- Source: Resilient Makati portal content pasted by user (LGU-authored) +
  file-not-found observation.
- Cited as portal content w/ URL to Resilient Makati.
- ✅ Clean.

### S7c — Pateros ingest
- Sources: PIA article (primary-gov news), SubayBAYAN (primary-gov portal),
  BFP-NCR Facebook (secondary-third-party from national gov agency),
  Project SHAKE Facebook post (secondary-third-party), "Against Lachesism"
  student WordPress blog (secondary-third-party).
- Student blog: explicitly flagged as near-zero weight, not pasted.
- ADPC Safer Cities 22: secondary-third-party, facts-only extract.
- ✅ Clean.

### S7c firming — Pateros regulator attestations
- DILG-NCR forum + PIA/OCD-NCR forum + Inquirer 2013 state of calamity.
- All primary-gov or secondary-news with URLs.
- ✅ Clean.

### S7c — Marikina register (this batch) ⚠️
- Source: user-supplied compiled research summary.
- The identification of **Ord. No. 132 s.2011** as the MCDRRMO-creating
  ordinance is attributed by the compiled summary to unnamed "academic
  research and LGU institutional studies."
- **Fix applied S7e:** attribution disclaimer added to top of
  `marikina_document_register.notes.md`; provenance TODO in `manifest.csv`
  ("SECOND-SOURCE VERIFICATION PENDING before external citation").
- **Migration path:** obtain Ord. 132 s.2011 primary text (Sangguniang
  Panlungsod / City Secretary) and cite directly.

### S7d — Pasig ingest ⚠️
- Source: user-supplied compiled research summary of Pasig City DRRM.
- Specific facts (ordinance numbers, ₱4,370,188.44 appropriation, plantilla
  salary grades, 26 functions, author councilor names, resolution numbers)
  reproduce facts about primary PH government works — not copyrightable —
  but the compilation is somebody's editorial work.
- The "only 3 NCR LGUs" interpretive claim about the PHIVOLCS Marker Project
  is a specific interpretive claim from the compilation, not verified against
  primary PHIVOLCS documentation.
- **Fix applied S7e:** attribution disclaimer added to top of
  `pasig_drrm_evidence.notes.md`; ⚠️ mark on the Marker Project claim;
  `pasig_source_urls.notes.md` locates primary URLs for 3 of the 6 named docs;
  `manifest.csv` logs source-type and provenance for each.
- **Migration path:** ingest the primary PDFs (Ord. 02 s.2015, Green
  Building Ord via SC E-Library, Citizen's Charter) into `corpus/Pasig/`
  and update evidence citations off the compiled summary. The three
  still-missing PDFs (Ord. 08-08 s.2016, Res. 130-11 s.2023, Res. 269-11
  s.2023) need manual browse or FOI retrieval.

### S7d/S7e — Pateros portal correction
- Sources: pateros.gov.ph direct fetch + DILG-NCR + PIA/OCD-NCR forums.
- All primary-gov with URLs.
- ✅ Clean.

## Rule for external write-ups (paper, abstract, deck, web app text)

Before citing ANY claim in the ledger externally:

1. Check the evidence field in `status.csv` — does it name a specific
   primary doc?
2. Check `manifest.csv` — does that doc have a primary URL, and what
   `source_type` is it?
3. If `source_type = primary-gov` with URL → cite the primary directly.
4. If `provenance_note` says "PRIMARY PDF INGEST PENDING" or "SECOND-SOURCE
   VERIFICATION PENDING" → do NOT cite the specific claim externally until
   firmed. Cite the general obligation-level finding only ("Pasig has a
   DRRMO-creating ordinance" ✅; "Pasig Ord. 02 s.2015 establishes plantilla
   SG22/18/15/11 with initial appropriation ₱4,370,188.44" ⚠️).
5. If `source_type = secondary-*` → cite the secondary source explicitly
   (author, outlet, date, URL) rather than presenting the claim as your own.

## Standing provenance TODOs

- [ ] Ingest primary Pasig PDFs → migrate S7d note off compiled summary.
- [ ] Second-source verify Marikina Ord. 132 s.2011.
- [ ] Second-source verify PHIVOLCS Marker Project "3 NCR LGUs" claim.
- [ ] Retrieve Pasig LDRRMP via FOI (successful precedent: G. Lopez,
      April 2023) OR direct URL if found.
- [ ] Ingest Pasig CLWUP 2023-2031 + Zoning Ord. 63 s.2024 once available.
- [ ] Log specific eFOI transaction IDs for Marikina LDRRMP/CLUP retrievals.
