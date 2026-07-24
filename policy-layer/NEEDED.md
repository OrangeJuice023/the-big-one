# NEEDED — what's still to collect / upload

Snapshot: **only Makati is substantially populated.** Quezon City and Pasig have
a single PHIVOLCS hazard tile each; Marikina has two ordinances + a calamity
resolution but no plan; **Pateros is empty.** So yes — the NCR LGUs are *kulang*.
This is the list to close that, mapped to the 8 RA 10121 obligations
(OB1–OB8; see `LEDGER.md`).

**Collection stop-rule (from the checklist):** an LGU is "scoreable for v0" once
you have its **LDRRMP (or closest public equivalent) + ≥1 ordinance/EO**. Don't
collect forever — 3–6 docs × 5 LGUs, then build.

**Priority order:** (1) finish **Makati** (closest → the "what good looks like"
anchor) → (2) **Pateros** (the low-resource contrast that *is* the finding) →
(3) **Quezon City** (largest modeled loss) → (4) **Marikina** & **Pasig**.

---

## 1. Makati — ~6–7/8 evidenced; just finish it
Known direct sources (from `COLLECTION_MAKATI.md`) not yet in `corpus/Makati/`:
- [ ] **CDP 2019–2025** PDF → OB5, OB8 — `makati.gov.ph/.../FINAL_Makati CDP_Main Text_10152020.pdf` (text, no OCR)
- [ ] **Zoning Ordinance** (DRIVE zones) PDF → OB8 — `makati.gov.ph/assets/uploads/staticmenu/docs/ordinance.pdf`
- [ ] **Ordinance 2012-037** text PDF (DRRMO creation) → OB1, OB3 — Makati legislation repo (we have the 2014-064 amendment; still need the original)
- [ ] **Annual Report 2022** (you have it — SCANNED) → OB6 drills; OCR at ingest
- [ ] **Annual budget / appropriation** confirming 5% LDRRMF + 30% QRF → OB7 hard proof
Still hunting (may be non-public → itself a finding):
- [ ] **LDRRMP proper** → OB2
- [ ] **Earthquake / WVF contingency plan** → seismic sub-lens
- [ ] **Dated capture** (Wayback + screenshot) of the *"not currently available"* pages → OB4 **access-lapse** evidence

## 2. Pateros — empty (the contrast LGU)
- [ ] **Everything**: LDRRMP, DRRMO-creating ordinance, hazard maps, CDP/CLUP, LDRRM Fund, drills/annual report, risk assessment.
- Expect **genuine absences / non-public** here — that's the research payoff. Log every miss as `absent` or `access`/`not-adopted` in `status.csv`; **don't leave blank**. Pateros being thin vs. Makati being full is the headline result.

## 3. Quezon City — largest modeled loss; only 1 hazard tile
- [ ] **LDRRMP** (QC DRRMO) → OB2
- [ ] **DRRMO ordinance / QC DRRM Code** → OB1, OB3
- [ ] **CDP / CLUP** (DRR mainstreaming) → OB8
- [ ] **LDRRM Fund / annual budget** → OB7
- [ ] **Drills / annual report** → OB6
- [ ] **Risk assessment** + more hazard maps (has EIL tile; add ground-shaking + public-display proof) → OB4, OB5

## 4. Marikina — has Ord. 020 (EQ) + Res. 109 (calamity); missing the spine
- [ ] **LDRRMP** → OB2
- [ ] **DRRMO-*creating* ordinance / Marikina DRRM Code** → OB3 *(Ord. 020 is EQ-preparedness, Res. 109 is a calamity declaration — neither is the office-creating instrument)*
- [ ] **Hazard maps** (Marikina Valley — seismic **and** flood, given their history) publicly displayed → OB4
- [ ] **CDP / CLUP** DRR mainstreaming → OB8
- [ ] **LDRRM Fund appropriation** (QRF invoked in Res. 109 — get the budget line) → OB7

## 5. Pasig — only 1 hazard tile
- [ ] **Everything** except the hazard tile it already has (GS → OB4 partial): LDRRMP, DRRMO ordinance, CDP/CLUP, LDRRM Fund, drills, risk assessment.

---

## National reference set — nearly complete
Have: RA 10121 + **IRR**, NDRP-Earthquake, **NDRP 2024**, Harmonized M7.2 CP,
Operation L!STO, ALeRTO-LGA manual.
- [ ] **NDRRM Framework (NDRRMF)** + **NDRRMP 2020–2030** — MC-07 s.2025 makes these the alignment baseline for OB8 mainstreaming.

---

### Reminder that keeps the scorecard honest
Fill **`primary_url` + `source_type` in `ledger/manifest.csv` at upload time** — it's the citation link;
a grounded answer can't cite a document that has no provenance. And a document
that exists but the public can't reach it is an **access-lapse (OB4 caps at
partial)**, not a pass — capture it, don't quietly mark it present.
