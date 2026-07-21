# Research Findings Update — Policy Layer (post-OCR session)

_Folds this session's OCR output and document identification into the RA 10121
scorecard evidence. Discipline from POLICY_LAYER_SCOPE holds: every evidence
item names its source; core policy documents are kept distinct from downstream
**activity evidence**; and absences are logged as findings, not glossed over._

## What this session did

- OCR'd the two scanned documents that were image-only (tesseract 5.3.4,
  300 DPI rasterize → clean text, saved to the corpus).
- Identified every ambiguously-named upload (hazard KMZs read from their
  internal KML names, not guessed from PSGC codes).
- Result: **two new LGUs enter the corpus (Pasig, Quezon City)**, **Makati's
  obligation #3 is now doubly-sourced**, **Marikina gets its first evidence**,
  and the **national "should-have" reference set is materially stronger** —
  including the one document that directly grounds the seismic sub-lens.

## OCR results (the two scanned docs)

**Makati City Ordinance No. 2014-064** — enacted by the Sangguniang Panlungsod
on 26 August 2014. It *amends* Ord. 2012-037 (the original DRRMO-creating
ordinance already on file) to align the Makati DRRMO's composition with the
DBM–NCR findings and Joint Memorandum Circular 2014-01 (NDRRMC/DILG/DBM/CSC).
It sets the office under a DRRM Officer with three divisions — Administrative &
Training; Research & Planning; Operations & Warning — and folds Makati C3 and
Makati Rescue into that structure per RA 10121. Clean OCR, 3 pp.

**Marikina Sangguniang Panlungsod Resolution No. 109 s.2025** — adopted
23 July 2025, approved by Mayor Teodoro 24 July 2025. Declares Marikina under a
State of Calamity from Typhoon "Crising"/Habagat flooding. It records the
MCDRRMC conducting damage assessments and being directed to keep monitoring,
and authorizes the Mayor to use all city resources **including the quick
response fund**. Clean OCR, 3 pp.

## Updated RA 10121 scorecard evidence

### Makati (baseline LGU — strengthened)
- **#3 Ordinance creating the DRRMO w/ staffing** — now **doubly-sourced**:
  Ord. 2012-037 (creation) *plus* Ord. 2014-064 (staffing/structure aligned to
  national JMC 2014-01, three named divisions). Present, strong.
  - Caveat: the *budget* half of #3 still rests on the LDRRM Fund evidence
    (#7); 2014-064 governs composition/personnel, not appropriation figures.
- **#1 LDRRMO established** — reinforced (office structured to national
  guidelines). Present.
- **#4 hazard maps / #5 risk assessment** — PHIVOLCS Makati **ground-rupture**
  (MAK_GR_2013) and **earthquake-induced-landslide** (MAK_EIL_2013) tiles in
  hand. Present for *existence*; the #4 obligation is about LGU public
  *display/dissemination*, so mark present-on-existence and still confirm
  Makati actually publishes these.

Makati now stands at roughly 6–7 of 8 obligations evidenced. Still open: the
**LDRRMP proper** (#2) and an **earthquake-specific contingency plan**.

### Marikina (first evidence — but read it correctly)
- **#1 Council established** — MCDRRMC is referenced as actively assessing and
  monitoring → confirms the council exists and functions. Partial→present on
  existence.
- **#7 LDRRM Fund + QRF** — the resolution invokes and authorizes drawing on
  the **quick response fund** → operational evidence a QRF exists. Present.
- **Important:** Res. 109 is **downstream activity evidence**, not a core
  policy document. It is **not** the LDRRMP (#2) and **not** the DRRMO-creating
  ordinance (#3) — both still to collect for Marikina. It also concerns
  *flooding*, so it feeds the general rubric, not the earthquake sub-lens.

### Pasig (new to the corpus)
- **#4/#5** — PHIVOLCS **ground-shaking M7.2** hazard tiles (PSG_GS_M7.2_2013).
  First Pasig artifact. Everything else for Pasig is still to collect.

### Quezon City (new to the corpus)
- **#4/#5** — PHIVOLCS **earthquake-induced-landslide** hazard (PSGC 137404000,
  PNG). First QC artifact. Largest modeled loss LGU — prioritize collecting its
  LDRRMP + DRRMO ordinance next.

### National reference set (the "should-have" side — now much stronger)
- **RA 10121 full text** (Official Gazette) — the rubric anchor itself, in hand.
- **Harmonized National Contingency Plan for the M7.2 Earthquake** (NDRRMC,
  Mar 2019) — the West Valley Fault national CP. **This is the document that
  directly grounds the seismic sub-lens** (EQ-specific evacuation, response
  clusters). High value.
- **National Disaster Response Plan for Earthquake & Tsunami** (OCD/NDRRMC) —
  seismic response standard; also grounds the sub-lens.
- **ALeRTO-LGA Disaster Preparedness Manual** (DILG–LGA + Ateneo de Zamboanga) —
  an LGU preparedness standard, but **weather-disturbance-focused**, so it
  informs the general rubric, not the earthquake lens. Sits alongside
  Operation L!STO.

## Two uploads that are NOT OCR/policy targets (flagged so no effort is wasted)

- **Valley Fault System Atlas Part 1 & 2** (PHIVOLCS 1:5,000, image-only PDFs):
  OCR is the wrong tool — these are map rasters, not text. The task here is to
  **digitize the fault trace** (Part 1 loss-model TODO), i.e. trace the red line
  into coordinates. Don't run OCR on them.
- **JICA Detailed Planning Survey, Greater Metro Manila EQ/Tsunami DRRM**
  (Sept 2025, 241 pp, **Japanese**): rich context (exposure/hazard/project
  design) but not LGU policy and not scorecard evidence. Language barrier;
  revisit later only if a specific section is needed (targeted translation).

## Loose ends before the first real scorecard run
1. **Backfill `source_url`** for every uploaded file in the manifest — the
   scope doc makes source_url the citation link, and several are currently
   "uploaded this session" with no provenance URL.
2. **Collect Marikina/Pasig/QC core docs** (LDRRMP + DRRMO ordinance) — right
   now those three are hazard-map-only; the risk×resource contrast needs their
   policy documents to be real.
3. **Makati #2 (LDRRMP)** remains the main gap for the baseline LGU.

_Manifest rows for everything above: `policy-layer/manifest_additions.csv`.
OCR text: `policy-layer/corpus/Makati/makati_ord_2014-064.txt`,
`policy-layer/corpus/Marikina/marikina_res_109_2025.txt`._
