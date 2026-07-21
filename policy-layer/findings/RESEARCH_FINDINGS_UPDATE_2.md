# Research Findings Update #2 — full-folder classification, extraction & atlas clips

_This pass swept every file currently in the uploads folder, classified each as
text-layer vs. scanned, extracted text where a usable layer exists, OCR'd the
scanned ones, and clipped the fault-trace maps out of the Atlas for research.
Same discipline as before: core policy docs kept distinct from activity
evidence; absences logged as findings._

## 1. Scanned vs. text-layer — verification result

Full table: `policy-layer/file_classification.csv`. Summary:

**Scanned (no text layer) → needed processing**
- `2014-064__1_.pdf` (Makati Ord. 2014-064) — OCR'd last session.
- `NDRRMC_Memorandum_Circular_No_07_s_2025.pdf` — OCR'd this session (clean).
- `The_Valley_Fault_System_Atlas_…_Part2.pdf` — map rasters → clipped (§4), not OCR.

**Text layer (clean) → extracted** to `policy-layer/extracted_text/`
- RA 10121 (Official Gazette), RA 10121 **IRR** (OCD), Harmonized National CP
  for M7.2 EQ, National Disaster Response Plan – Earthquake, NDRP 2024,
  Operation L!STO, ALeRTO-LGA manual, Marikina Ord. 020 s.2023.

**Two corrections to the auto-classifier** (it flagged these "garbled" because
page 1 is Japanese — they are in fact text-layer reference docs, not scanned):
- `1000055656.pdf` and `NDRRM_plan_Japanese_ver_compressed.pdf` — both 241 pp,
  Japanese JICA/NDRRM material. Reference only; language barrier.

**Deduplication**
- `NDRP.pdf` is **byte-identical** (same MD5) to
  `62898_nationaldisasterresponseplanforeart.pdf` — kept one.
- `RESOLUTION_NO_109` has a partly-garbled text layer; the clean version is the
  last-session OCR at `corpus/Marikina/marikina_res_109_2025.txt` — the raw
  pdftotext extraction was discarded so nothing downstream ingests the garble.

## 2. Key new documents in this batch

- **RA 10121 IRR** (OCD) — the *actual citation anchor* for the rubric. Several
  obligations cite IRR Rule 6 (DRRMO establishment §6, hazard-map display &
  drills §7); having the IRR text in hand means the scorecard can cite the
  operative rule, not just the parent Act.
- **Marikina Ord. 020 s.2023 — "Marikina City Earthquake Preparedness Ordinance
  of 2023."** Institutionalizes an **earthquake awareness & safety drills
  program** run by MCDRRMO with national agencies; cites the WVF "Big One" M7.2
  and the 129.47 km PHIVOLCS trace through QC/Marikina/Pasig/Makati/Taguig/
  Muntinlupa. This is the seismic-lens instrument Marikina was missing.
- **NDRRMC Memorandum Circular No. 07 s.2025** (28 Nov 2025) — formally adopts
  **NDRP 2024** as the standard response/early-recovery reference at all levels
  (down to City/Municipal/Barangay councils), aligned to RA 10121, NDRRMP
  2020–2030, Sendai. Establishes the current binding response plan LGUs must
  integrate.
- **NDRP 2024** (370 pp, all-hazards) and **Operation L!STO** (DILG) — round out
  the national "should-have" set alongside the Harmonized M7.2 CP.

## 3. Scorecard impact — Marikina jumps from thin to genuinely evidenced

Previously Marikina had only the flood State-of-Calamity resolution (activity
evidence). It now has a real spine:
- **#3 ordinance / #1 council** — Ord. 020 s.2023 is a standing local ordinance
  establishing an earthquake program via MCDRRMO. Present.
- **#6 regular drills** — Ord. 020 *institutionalizes* an earthquake awareness &
  safety-drills program → direct evidence for the drills obligation. Present.
- **Seismic sub-lens** — Ord. 020 is earthquake-specific (not weather). Marikina
  now has seismic-lens coverage, not just the flood resolution.
- **#7 LDRRM Fund + QRF** — QRF invoked in Res. 109 (last session). Present.
- Still open for Marikina: the **LDRRMP** proper (#2) and hazard-map display (#4).

Makati (from session 1) remains the most-complete LGU; Pasig and Quezon City
still hazard-map-only. The Makati-vs-Marikina contrast is now much sharper and
better-sourced — both have earthquake-specific instruments, which sets up a
cleaner comparison than "rich LGU vs. empty LGU."

## 4. Atlas image clips (research use)

`policy-layer/atlas_fault_clips/` — **43 pages** clipped from Atlas Part 2, each
a map panel showing the red West Valley Fault trace, with legend/logos cropped
out. Selection was automatic: a red/orange line mask (rejecting brown contour
lines) counts trace pixels per page; the split is cleanly bimodal —

- fault-trace annotated maps: **1,400–17,200** red/orange px → clipped
- clean base-map companion sheets: **~100–600** px → skipped

A handful of pages sit at the 500–600 borderline (base sheets where the trace
just clips an edge/legend); they're included to be safe. Per-page counts:
`atlas_fault_clips/_page_index.csv`. These feed the loss-model's outstanding
**digitize-the-WVF-trace** TODO (Part 1's job) — the clips are the source
imagery; vectorizing the red line into coordinates is the next step, and is a
separate task from OCR.

> Note on the KMZ hazard tiles (Makati GR/EIL, Pasig GS, QC EIL): these are
> georeferenced raster tiles, already "clipped" by nature — no extraction
> needed; they're evidence artifacts for obligations #4/#5 as logged in
> session 1.

## Outputs from this pass
- `file_classification.csv` — the scanned/text verification table (all files)
- `extracted_text/` — 8 text-layer docs extracted (deduped)
- `corpus/_national/ndrrmc_mc07_s2025_adopt_ndrp2024.txt` — memo OCR
- `atlas_fault_clips/` — 43 fault-trace map clips + page index
- (session 1 corpus for Makati/Marikina OCR remains in place)

## Still outstanding
1. Backfill `source_url` provenance for uploads (citation links) before scoring.
2. Collect Marikina **LDRRMP**, and Pasig/QC core policy docs.
3. Vectorize the WVF trace from the clips (loss-model Part 1 TODO).
