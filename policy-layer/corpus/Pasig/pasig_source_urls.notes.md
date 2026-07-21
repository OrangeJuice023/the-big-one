# Pasig — source-URL register (S7e provenance firming pass)

**Purpose:** capture the exact URLs found for the six statutory documents named
in `pasig_drrm_evidence.notes.md`, plus one new document discovered this pass.
Populates the "ingest primary PDF texts" TODO. Also documents the file-naming
pattern that motivates `access-opaque` as a formalized lapse sub-type.

**Ingested:** S7e. Nothing here caps a status; this is provenance only.

---

## Documents & sources

### 1. Ordinance No. 02, Series of 2015 — creates PCDRRMO ✅ DIRECT PDF FOUND
- **Primary URL:** `https://assets.pasigcity.gov.ph/storage/city_ordinance/2015/02/05/659cfaaeb80f61704786606Ord%2002%202015.pdf`
- **Alt title (from search meta):** "An Ordinance Creating The Pasig City Disaster Risk [Reduction and Management Office]..."
- **Filename analysis (`access-opaque` exemplar):** the file is at a URL path
  containing `city_ordinance/YYYY/MM/DD/` but the filename itself is
  `659cfaaeb80f61704786606Ord%2002%202015.pdf` — a 22-char opaque hash prefix
  before the human-readable segment. A citizen guessing the URL cannot land on
  it; search engines have nothing meaningful to index in the filename.

### 2. Ordinance No. 06, Series of 2016 — Green Building ✅ FOUND (alt source)
- **Primary URL (Supreme Court E-Library):**
  `https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/10/72932`
- **Source:** eLibrary of the Supreme Court of the Philippines. This is
  arguably *better* than a pasigcity.gov.ph mirror — it's a stable, indexed
  legal repository maintained by the judicial branch, with descriptive metadata.
- **Ordinance title:** "AN ORDINANCE ESTABLISHING THE GREEN BUILDING ORDINANCE
  OF PASIG CITY."
- **Confirms Article X provisions:** Green Building Tax Credit; incentives.

### 3. Ordinance No. 08-08, Series of 2016 — First EQ+Flood Contingency Plan 2016–2021 ⚠️ NOT FOUND (search)
- **Best guess URL pattern:** `assets.pasigcity.gov.ph/storage/city_ordinance/2016/*/{hash}Ord*08-08*2016*.pdf`
- **Alternative retrieval:** browse the LGU's ordinance index at
  `https://pasigcity.gov.ph/city-ordinances` (bot-blocked from search; browser-only).
- **Manual step:** filter Pasig's ordinance list to 2016, download the file
  matching Ord. No. 08-08.

### 4. Resolution No. 130-11, Series of 2023 — adopts LDRRMP 2023–2028 ⚠️ NOT FOUND (search)
- **URL pattern (from a nearby resolution find):**
  `assets.pasigcity.gov.ph/storage/city_resolution/YYYY/MM/DD/{hash}{resolution-number}-11.pdf`
- **Approved date:** 19 June 2023 → likely at `.../2023/06/19/{hash}130-11.pdf`.
- **Related found:** Res. No. 186-11 at
  `https://assets.pasigcity.gov.ph/storage/city_resolution/2023/09/12/64ffc73ece3011694484286186-11.pdf`
  — confirms the URL pattern; suggests Res. 130-11 exists in the same tree.
- **Alt retrieval:** **FOI (foi.gov.ph) — the DRRMP itself has been approved
  via FOI at least once.** See:
  `https://www.foi.gov.ph/requests/pasig-city-drrm-plan/` (Gabrielle Lopez,
  April 2023 request; V. Tan approved 26 Apr 2023; DRRMP soft copy attached to
  the FOI response). This is a documented, replicable retrieval path.
- **Implication:** Pasig's LDRRMP is available two ways — direct Sanggunian
  PDF (search-invisible; opaque URL) AND via FOI (successful precedent). This
  is a nice contrast with Marikina, whose LDRRMP is FOI-only.

### 5. Resolution No. 269-11, Series of 2023 — adopts EQ Contingency Plan 2024–2026 ⚠️ NOT FOUND (search)
- **URL pattern:** likely `.../2023/12/06/{hash}269-11.pdf` given 6 Dec 2023 approval.
- **Alt retrieval:** the operational plan itself is mirrored on Studylib:
  `https://studylib.net/doc/18300614/pasig-city-contingency-plan` — partial
  extract shows detailed operational content (Santolan Elem School, Sta Lucia
  Strike Team, Eusebio HS, San Joaquin/Kalawaan evac centers, TF1–TF3 task
  forces, 72-hr response framework). Confirms the plan exists and is
  operational, but 3rd-party mirror — treat as **secondary** for citation.
- **Manual step:** browse pasigcity.gov.ph resolution index → 2023 → find 269-11.

### 6. PCDRRMO Citizen's Charter (English) ✅ DIRECT PDF FOUND
- **Primary URL (recent, 2025 upload):**
  `https://assets.pasigcity.gov.ph/storage/attachments/disaster_risk_reduction_and_management_office/686775e995e781751610857Citizen_s%20Charter%20English.pdf`
- **Older version (still live):**
  `https://assets.pasigcity.gov.ph/storage/attachments/disaster_risk_reduction_and_management_office/633f8800db42116651079686335211cbe1911664426268CCh_DRRMO.docx.pdf`
- **Also:** `6621d4a75413e1713493159English.pdf` (undated, likely an intermediate version).
- **Filename analysis (`access-opaque` exemplar):** the newer filename is
  `686775e995e781751610857Citizen_s%20Charter%20English.pdf` — 22-char hash +
  descriptive suffix. The older one is `633f88...+11-char continuation +
  "CCh_DRRMO.docx.pdf"` — DOUBLE-extension (.docx.pdf) reveals a batch export
  workflow that didn't normalize filenames. The LGU is *slowly* getting better
  at naming, but old opaque files linger.
- **Note on filename evolution:** newer PCDRRMO attachments include a
  descriptive slug ("Citizen's Charter English"); older ones are pure hash.
  This suggests a naming policy change sometime between the two uploads, but
  no bulk rename of legacy files. Legacy discoverability lapse persists.

---

## NEW document discovered this pass — not in the S7d note

### Comprehensive Land and Water Use Plan (CLWUP) 2023–2031 + Zoning Ordinance No. 63, s. 2024
- **Status:** endorsed by **MMDA Resolution No. 24-28, s. 2024** at the Joint
  MMC-RDC meeting on **14 November 2024**. Pending DHSUD cursory review before
  final approval + ratification of the Zoning Ordinance.
- **News release:**
  `https://pasigcity.gov.ph/news-and-releases/pasig-city-comprehensive-land-and-water-use-plan-2023-2031-at-zoning-ordinance-pasig-city-ordinance-no-63-s-2024-pasado-na-sa-metro-manila-council-463`
- **Named actors:** Mayor Vico Sotto; Sangguniang Panlungsod Committee on Land
  Use Chairperson Kiko Rustia (also co-author of Res. 130-11 and Res. 269-11);
  City Planning and Development Coordinator Priscella Mejillano.
- **Implication for OB8:** the CLUP/CDP evidence supporting Pasig OB8 was
  based on the older CLUP. The CLWUP 2023–2031 is the **current** planning
  instrument, which is CLUP + water-use planning combined (CLWUP is a newer
  DHSUD-preferred format post-Mandanas). Once the primary text lands, OB8's
  evidence should be updated to name CLWUP 2023–2031 + Zoning Ord. 63 s.2024
  as the current statutory basis (not the older CLUP).
- **Retrieval status:** the CLWUP full text and the Zoning Ord. 63 s.2024 text
  are not yet located; need to browse pasigcity.gov.ph or wait for DHSUD publication.

---

## Also useful: contextual/confirmatory sources

- **Pasig ordinance index page:** `https://pasigcity.gov.ph/city-ordinances`
  (bot-blocked from automated fetches; browser-only for manual retrieval).
- **EMI (Earthquakes and Megacities Initiative) Pasig City Resilience to
  Earthquakes and Floods Project II — 2021:** `https://emi-megacities.org/projects`
  — the update to the S6 handoff's referenced "EMI 2012 Pasig Resilience"
  study. Third-party project; supports OB5 as secondary corroboration only.

---

## `access-opaque` — the pattern is now empirically documented

Every Pasig-hosted PDF observed this pass follows the same URL/filename shape:

    assets.pasigcity.gov.ph/storage/{table}/YYYY/MM/DD/{22-char-hash}{descriptive-suffix}.pdf

Consequences for citizen discoverability:

1. **The hash prefix defeats URL-guessing.** A citizen who knows "Ord. No. 02
   s.2015" cannot construct the URL. Even if they know the date, they cannot
   guess the hash.
2. **The `assets.` subdomain hosts the raw PDFs; the main `pasigcity.gov.ph`
   domain provides the ordinance index page (bot-blocked), but the index is
   the only bridge from human intent to file.** Any interruption of that
   index (site rework, JS-only rendering, broken pagination) severs the link.
3. **Older files are hash-only; newer files add descriptive suffixes.**
   Improvement is happening but hasn't been retroactive.
4. **Some PDFs are scanned or DOCX-exported.** The Citizen's Charter's
   `.docx.pdf` double-extension reveals a Word→PDF workflow that likely
   preserves text layers, but no such guarantee for older ordinance scans.

This is now a formalized lapse sub-type in the ledger (`REAL_LAPSES` per
S7e). Applying `access-opaque` to Pasig's OB2/OB3 (LDRRMP/creating ordinance)
would demote their `present` status to `partial`. **Recommendation: hold off
applying access-opaque to Pasig's existing present rows until:**

(a) The user confirms the criterion for capping vs. not (some readers may
consider "PDF is on the LGU domain, therefore compliant" a defensible
present, with `access-opaque` as a *softer* methodology finding);
(b) The three still-missing PDFs (Ord. 08-08, Res. 130-11, Res. 269-11) are
either found or confirmed missing.

Applied conservatively (methodology-only finding): Pasig stays 7/1/0.
Applied strictly (opaque = access lapse): Pasig would move to about 3
present + 4 partial (access-opaque) + 1 partial (unverified OB7).

---

## Provenance TODO (updated)

- [x] Located Ord. 02 s.2015 direct URL.
- [x] Located Ord. 06 s.2016 via Supreme Court E-Library.
- [x] Located Citizen's Charter (English) direct URL, both versions.
- [ ] Manually browse pasigcity.gov.ph/city-ordinances → 2016 → find Ord.
      08-08 s.2016 direct URL.
- [ ] Manually browse pasigcity.gov.ph resolution index → 2023 → find Res.
      130-11 and 269-11 direct URLs. OR retrieve LDRRMP via foi.gov.ph
      (successful precedent: G. Lopez request 24 Apr 2023).
- [ ] Locate CLWUP 2023–2031 + Zoning Ord. 63 s.2024 primary text (post-DHSUD publication?).
- [ ] Second-source verify Joint PHIVOLCS Marker Project claim (Pasig + QC + Makati).
- [ ] Once PDFs are downloaded, ingest into `corpus/Pasig/` with clean
      filenames (e.g. `pasig_ord_02_s2015_pcdrrmo.pdf`,
      `pasig_ord_06_s2016_green_building.pdf`, etc.) —
      *ironic but necessary counter-move to the opaque naming pattern.*
- [ ] User decision: apply `access-opaque` as a status-capping lapse for
      Pasig, or keep as methodology finding only.
