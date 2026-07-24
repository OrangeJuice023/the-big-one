# Citations & Attributions

Every external source used in *The Big One* (loss model + policy layer), with
licenses and the specific place each is used. For the paper: cite the source
wherever its data/method appears; a BibTeX block is at the bottom. Reformat to
your venue's style (this is APA-ish). **Access dates matter** for the live
databases (EM-DAT, NOAA, GEM) — fill them in when you pull.

> Plagiarism note: citing a source in the reference list is not enough — cite it
> **in-text at the point of use** (data, figure, method, or quoted clause).
> Philippine government works (laws, ordinances, agency reports) are generally
> **not under copyright** (RA 8293 §176), but they still require **attribution**;
> quote clauses sparingly with quotation marks + citation, and paraphrase the
> rest in your own words.

---

## 1. Fault model & ground motion (academic — citeable)

- **West Valley Fault trace (authoritative):** Styron, R., & Pagani, M. (2020).
  The GEM Global Active Faults Database. *Earthquake Spectra, 36*(1_suppl),
  160–180. https://doi.org/10.1177/8755293020944182
  — used for `model/data/external/wvf_trace_gem.geojson`. **License: CC-BY-SA 4.0** (see §6).
- **Philippine seismic source context:** Peñarubia, C., Johnson, K. L., Styron,
  R. H., Bacolcol, T. C., Sevilla, W. I. G., Perez, J. S., … Allen, T. I. (2020).
  Probabilistic seismic hazard analysis model for the Philippines. *Earthquake
  Spectra, 36*(S1), 44–68. — the Philippine PSHA the WVF parameters trace back to.
- **Intensity prediction equation (AWW12):** Allen, T. I., Wald, D. J., &
  Worden, C. B. (2012). Intensity attenuation for active crustal regions.
  *Journal of Seismology, 16*, 409–433. — `model/src/gmpe.py`.
- **Maximum magnitude / "Big One" scenario:** Japan International Cooperation
  Agency (JICA), Metropolitan Manila Development Authority (MMDA), & Philippine
  Institute of Volcanology and Seismology (PHIVOLCS). (2004). *Earthquake Impact
  Reduction Study for Metropolitan Manila, Republic of the Philippines (MMEIRS):
  Final Report*. Pacific Consultants International / OYO International / PASCO.
  — the M7.2 scenario and casualty figures (also cited in Marikina Ord. 020 s.2023).

## 2. Hazard & fault mapping (agency data)

- **PHIVOLCS Valley Fault System Atlas:** Philippine Institute of Volcanology and
  Seismology (PHIVOLCS-DOST). (2015). *The Valley Fault System Atlas in the
  Greater Metro Manila Area*. Quezon City, Philippines: PHIVOLCS-DOST. Produced
  under the GMMA-READY Project (UNDP / Australian Aid). — cross-validation of the
  WVF trace; source of the fault-map clips.
- **PHIVOLCS hazard tiles (KMZ/PNG):** PHIVOLCS-DOST HazardHunterPH / GeoServer,
  ground-rupture, ground-shaking, and earthquake-induced-landslide layers for
  Makati, Pasig, and Quezon City (PSGC 137602/137403/137404). — scorecard OB4/OB5.

## 3. Loss-model training & benchmark data

- **Historical earthquake losses (training):** National Geophysical Data Center /
  World Data Service (NGDC/WDS): *NCEI/WDS Global Significant Earthquake
  Database*. NOAA National Centers for Environmental Information.
  https://doi.org/10.7289/V5TD9V7K [access date]
- **Disaster losses (training):** EM-DAT, CRED / UCLouvain, Brussels, Belgium —
  www.emdat.be [access date]. Descriptor paper: Delforge, D., Wathelet, V.,
  Below, R., Lanfredi Sofia, C., Tonnelier, M., van Loenhout, J. A. F., &
  Speybroeck, N. (2025). EM-DAT: The Emergency Events Database. *International
  Journal of Disaster Risk Reduction*, 105509.
  https://doi.org/10.1016/j.ijdrr.2025.105509 **(redistribution forbidden — §6)**
- **Exposure / population:** Philippine Statistics Authority (PSA) — 2020 Census
  of Population and Housing; Provincial Product Accounts (city-level GRDP).
- **Benchmarks (never tuned to):** World Bank Metro Manila earthquake loss
  estimate (~USD 48B order of magnitude); PHIVOLCS/GMMA Risk Analysis Project
  (2013) — ₱2.4T building damage, ~37,000 deaths scenario.
- **LGU boundaries:** faeldon/philippines-json-maps (NCR city GeoJSON); GADM 4.1
  level-2 (gadm.org, free for non-commercial use).

## 4. Statutory & national policy corpus

- **RA 10121:** Congress of the Philippines. (2010). *Republic Act No. 10121:
  Philippine Disaster Risk Reduction and Management Act of 2010*. Official
  Gazette. — the scorecard rubric anchor.
- **IRR:** National Disaster Risk Reduction and Management Council (NDRRMC).
  (2010). *Implementing Rules and Regulations of RA 10121*. — obligations #3/#4/#6.
- NDRRMC. (2019). *Harmonized National Contingency Plan for the Magnitude 7.2
  Earthquake*. — seismic sub-lens.
- NDRRMC / DSWD / OCD. (2024). *National Disaster Response Plan (NDRP) 2024*;
  adopted by **NDRRMC Memorandum Circular No. 07, s. 2025**.
- Office of Civil Defense / NDRRMC. *National Disaster Response Plan for
  Earthquake and Tsunami*.
- Department of the Interior and Local Government (DILG). *Operation L!STO
  Manual*; and DILG–Local Government Academy & Ateneo de Zamboanga University,
  *ALeRTO-LGA Disaster Preparedness Manual for Localized Weather Disturbances*.

## 5. LGU corpus — primary sources (cite by enacting body + number + date)

- Sangguniang Panlungsod of Makati. *City Ordinance No. 2012-037* (10 May 2012)
  and *No. 2014-064* (26 Aug 2014) — creation & staffing of the Makati DRRMO.
- Sangguniang Panlungsod of Marikina. *Ordinance No. 020, s. 2023* — Marikina
  City Earthquake Preparedness Ordinance (enacted 22 Mar 2023; approved 12 May 2023).
- Sangguniang Panlungsod of Marikina. *Resolution No. 109, s. 2025* — State of
  Calamity, Typhoon "Crising"/Habagat (adopted 23 Jul 2025).
- Quezon City DRRM Council. *Quezon City Disaster Risk Reduction and Management
  Plan 2021–2027* (Vol. 1; adopted QCDRRMC Resolution No. 6, s. 2020).
  https://quezoncity.gov.ph/wp-content/uploads/2021/10/QCDRRMP-2021-2027_Volume-1-8Sept2021.pdf
  — QC LDRRMP (OB2). Its earthquake scenario is drawn from **MMEIRS (2004)** — see
  §1 — so it independently corroborates the loss model's WVF M7.2 basis.
- Sangguniang Panlungsod of Quezon City. *Ordinance No. SP-2290, s. 2014* (creates
  the QCDRRMO), *No. SP-2424, s. 2015* and *No. SP-3170, s. 2023* (staffing/reorg);
  *EO No. 23, s. 2010* (QCDRRMC). Full DRRM legal register in
  `policy-layer/corpus/QuezonCity/quezon_city_drrm_evidence.notes.md`.
- Quezon City Government. *Quezon City Risk Atlas* (2014). — publicly displayed
  hazard/risk maps (OB4).
- (Additional LGU documents logged in `policy-layer/ledger/manifest.csv` with
  source URLs, source types, and provenance notes. Physical corpus artifacts
  and their OCR state are tracked separately in `policy-layer/corpus_manifest.csv`.)

### Secondary / supporting LGU sources (cite as secondary; third-party copyright)

- Iglesias, G., & Yu, C. (2008). *Flood Disaster Mitigation and River
  Rehabilitation by Marikina City, Philippines.* Safer Cities No. 22, Program for
  Hydro-meteorological Disaster Mitigation in Secondary Cities in Asia (PROMISE).
  Asian Disaster Preparedness Center (ADPC), with support from USAID/OFDA.
  https://www.adpc.net/igo/category/ID221/doc/2013-nri7LY-ADPCSafer_Cities_22.pdf
  — secondary corroboration of Marikina's DRRM history: Ord. 264 s.1998 (Disaster
  Management Office / "Rescue 161"), **Ord. 109 s.2005 (Comprehensive Earthquake
  Disaster Reduction program)**, Ord. 54 s.2005 (20% Calamity Fund), and 1992/2004
  flood-exposure figures. **Pre-RA 10121 (2010)** — historical context, not
  current-law compliance; used for OB5 corroboration and OB1/OB3 background only.
  Extract in `policy-layer/corpus/Marikina/marikina_adpc_safercities22_2008.notes.md`.
  **License: third-party copyright — quotable *with credit* to ADPC + USAID/OFDA;
  do not paste the full case-study text (see §6).**

---

## 6. License compliance — read before publishing/pushing

- **GEM GAF-DB is CC-BY-SA 4.0 (ShareAlike), not plain CC-BY.** The derived file
  `wvf_trace_gem.geojson` must (a) attribute Styron & Pagani (2020) and (b) be
  released under a **compatible ShareAlike license**. Add an attribution/license
  note next to the file (a header property or a sibling `LICENSE` note), and
  check it's compatible with the repo's overall license.
- **EM-DAT forbids redistribution of raw data.** Keep raw EM-DAT out of git (the
  repo already gitignores `model/data/raw/`); only committed derived features,
  and exclude verbatim EM-DAT rows. Cite the descriptor paper for methodology.
- **PHIVOLCS Atlas** is a government publication — attribute PHIVOLCS-DOST; do
  **not** paste its map images into the paper without permission. Cite it as a
  source and use your own trace figure instead. (Government-of-PH works are not
  copyrighted per RA 8293 §176, but attribution is still required.)
- **NOAA / PSA / GADM (non-commercial) / faeldon maps** — attribution as above;
  GADM is free for non-commercial use only.
- **ADPC Safer Cities No. 22 (Iglesias & Yu, 2008)** is **third-party copyrighted**.
  ADPC permits quoting *with credit* to ADPC + USAID/OFDA and provides the series
  "for purposes of dissemination," but this is **not** a license to reproduce the
  full text. Keep only the attributed facts-only extract
  (`corpus/Marikina/marikina_adpc_safercities22_2008.notes.md`); in the paper,
  cite it and quote clauses sparingly. It is a **secondary** source and predates
  RA 10121 — don't let it read as current-law compliance for Marikina.

---

## BibTeX (academic sources)

```bibtex
@article{styron2020gem,
  author  = {Styron, Richard and Pagani, Marco},
  title   = {The {GEM} Global Active Faults Database},
  journal = {Earthquake Spectra},
  volume  = {36}, number = {1_suppl}, pages = {160--180}, year = {2020},
  doi     = {10.1177/8755293020944182}}

@article{penarubia2020phil,
  author  = {Pe{\~n}arubia, H. C. and others},
  title   = {Probabilistic Seismic Hazard Analysis Model for the {Philippines}},
  journal = {Earthquake Spectra}, volume = {36}, number = {S1},
  pages   = {44--68}, year = {2020}}

@article{allen2012ipe,
  author  = {Allen, Trevor I. and Wald, David J. and Worden, C. Bruce},
  title   = {Intensity Attenuation for Active Crustal Regions},
  journal = {Journal of Seismology}, volume = {16}, pages = {409--433}, year = {2012}}

@article{delforge2025emdat,
  author  = {Delforge, D. and Wathelet, V. and Below, R. and Lanfredi Sofia, C.
             and Tonnelier, M. and van Loenhout, J. A. F. and Speybroeck, N.},
  title   = {{EM-DAT}: The Emergency Events Database},
  journal = {International Journal of Disaster Risk Reduction},
  pages   = {105509}, year = {2025}, doi = {10.1016/j.ijdrr.2025.105509}}

@techreport{jica2004mmeirs,
  author      = {{JICA} and {MMDA} and {PHIVOLCS}},
  title       = {Earthquake Impact Reduction Study for Metropolitan Manila,
                 Republic of the Philippines ({MMEIRS}): Final Report},
  institution = {Japan International Cooperation Agency}, year = {2004}}

@misc{noaa_significant_eq,
  author       = {{NGDC/WDS}},
  title        = {{NCEI/WDS} Global Significant Earthquake Database},
  howpublished = {NOAA National Centers for Environmental Information},
  doi          = {10.7289/V5TD9V7K}, note = {Accessed: [date]}}

@misc{phivolcs2015atlas,
  author       = {{PHIVOLCS-DOST}},
  title        = {The Valley Fault System Atlas in the Greater Metro Manila Area},
  year         = {2015}, address = {Quezon City}, note = {GMMA-READY Project}}

@techreport{iglesias2008marikina,
  author      = {Iglesias, Gabrielle and Yu, Carlyne},
  title       = {Flood Disaster Mitigation and River Rehabilitation by
                 {Marikina} City, {Philippines}},
  institution = {Asian Disaster Preparedness Center (ADPC)},
  series      = {Safer Cities}, number = {22}, year = {2008},
  note        = {PROMISE Programme; USAID/OFDA. Secondary; pre-RA 10121}}
```

_Verify the AWW12 DOI (10.1007/s10950-012-9278-7) and fill PSA/World Bank/DILG
publication years against the exact editions you cite before submission._
