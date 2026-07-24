# PROPOSED: evacuation-accessibility layer (not yet built)

**Status:** DESIGN NOTE ONLY. Not implemented. Captured S7h so the idea isn't
lost; deferred until the policy-layer evidence base is firmed (outstanding:
Taguig OB2/OB3, three missing Pasig PDFs, two `PENDING` second-source
verifications).

**Origin:** the question of whether the map could be made more "layered and
analytical" — prompted by the release of accessX (Transform Transport,
July 2026), an open-source Python library for urban accessibility analysis.

---

## The idea in one line

Test whether the evacuation sites that LGUs **name in their own DRRM
documents** are physically reachable by the populations those documents
are meant to protect.

## Why this specific framing (and not generic 15-minute-city analysis)

A generic accessibility layer (walk time to schools, clinics, groceries)
would add visual complexity without serving the thesis. The evacuation
framing does serve it, because the project's core concept is **access**:

| Dimension | Question | Current status |
|---|---|---|
| **Informational access** | Can a citizen reach the *document*? | Built. Four-mode lapse taxonomy: `access-broken`, `access-foi`, `access-none`, `access-opaque` |
| **Physical access** | Can a resident reach the *evacuation site*? | Proposed here |

An LGU can name evacuation sites in a plan that is itself `access-foi` (the
public can't read it) *and* site those facilities where fault-corridor
barangays cannot reach them. One argument, two dimensions of the same
failure.

## Data: already largely in the corpus

Evacuation sites are named in documents we have already ingested. This is a
geocoding task, not a new collection effort:

- **Pateros** — 10 named evacuation areas (Capt. Hipolito Francisco Elem.
  Main, Pateros Elem., Pateros National HS, San Pedro Covered Court,
  Simplicio Manalo HS Aguho, AMC Covered Court San Roque, Aguho Covered
  Court, Sto. Rosario Elem., TESDA Bldg Sto. Rosario-Silangan, P. Manalo
  Elem. San Roque). Source: PIA-NCR, 16 Nov 2024.
- **Pasig** — pre-designated post-EQ staging sites: Pasig City Sports
  Complex, open park spaces, designated non-fault barangay grounds. Source:
  Pasig operational mitigation framework. Also: Santolan Elem., Eusebio HS,
  San Joaquin/Kalawaan evac centres (Studylib mirror of the Contingency
  Plan — secondary, verify against primary).
- **Taguig** — Center for Disaster Management, Brgy. Central Signal
  (5-storey; co-located evacuation centres).
- **Makati** — DRIVE zones (§24, Zoning Ord. 2012-102) as the designated
  vulnerable-enclave redevelopment frame; WVF→OPN open-space zones (§30).
- **QC, Marikina** — to extract from QCDRRMP 2021–2027 and Marikina
  materials respectively.

Additional inputs: OSM street network; population (PSA barangay-level where
available, else LGU-level with the granularity caveat stated); WVF trace
(already authoritative, GEM/Styron & Pagani 2020).

## Method sketch

1. Geocode evacuation sites named in corpus documents → point layer, each
   tagged with its **source document** (so every site is traceable to the
   statutory text that designates it).
2. Build walkable network (OSMnx or equivalent).
3. Compute walk-time isochrones from population origins to nearest
   designated evacuation site.
4. Cross-tabulate against: (a) distance to WVF trace, (b) the LGU's
   policy-readiness score, (c) barangays the LGU's own documents name as
   fault-corridor or liquefaction-prone.

## SCOPE CONSTRAINT — read before implementing

**This is PRE-EVENT accessibility only.** Standard isochrone analysis assumes
an intact street network. After an M7.2 WVF rupture, the network will not be
intact: structural collapse blocking roads, bridge failure, liquefaction-
induced ground deformation, and fire-following all degrade it.

Results must therefore be framed as: *"accessibility to designated evacuation
sites under normal conditions"* — i.e. a test of whether the LGU's own
evacuation plan is geometrically sound as planned. It is **NOT**
post-earthquake accessibility, and must not be labelled as such.

Modelling post-event accessibility would require an additional road-blockage
layer (debris from adjacent building collapse, bridge fragility, liquefaction
zones). That is a separate piece of work and arguably a separate paper. If
that layer is ever built, the pre-event results become its baseline.

## Tooling options

accessX (Transform Transport, 2026) is the prompt for this note but was not
evaluated in depth — it is very recent. Established alternatives in the same
family, any of which would serve:

- **Pandana** — fast network aggregation/accessibility
- **Access** — spatial accessibility metrics from origins/destinations/costs
- **OSMnx + networkx** — the underlying stack most of these build on
  (also what Transform Transport's own 15min City Score Toolkit uses)
- **UrbanAccess** — multi-modal, if GTFS is ever relevant
- **r5py / r5r** — routing-heavy alternative

Selection criterion should be reproducibility and transparency of
assumptions, consistent with the project's existing provenance discipline —
not feature count.

## Why deferred

The accessibility layer draws on the policy corpus. Building it on top of
evidence that still carries `PENDING` provenance flags would propagate
unverified claims into a new analytical layer. Firm the corpus first; the
layer is stronger when its inputs are verified.

## Open questions if implemented

- Population granularity: barangay-level PSA data is ideal; LGU-centroid is
  too coarse for walk-time analysis and would need to be flagged as a
  limitation (cf. existing methodology limitation #3).
- Do designated sites have stated capacity? If yes, capacity-constrained
  accessibility is more honest than nearest-facility.
- Should sites named only in *secondary* sources (e.g. the Studylib mirror of
  the Pasig Contingency Plan) be included, or held until primary text is in
  the corpus? Consistent with `ATTRIBUTION.md`, probably the latter.
