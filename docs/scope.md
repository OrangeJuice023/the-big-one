# Scope statement

## What this project covers

This project has two layers:

**Layer 1 — Loss model (`model/`, `web/`).** Scenario-based probabilistic
earthquake loss estimation for a West Valley Fault (WVF) event, covering
**35 LGUs**: 17 NCR cities plus 18 fault-corridor LGUs from Rizal, Bulacan,
and Cavite (including Silang). Manila proper is included here — the fault
does not run through Manila, but shaking exposure is significant.

**Layer 2 — Policy compliance scorecard (`policy-layer/`).** RA 10121
obligation-by-obligation audit for **six pilot LGUs on or directly adjacent
to the WVF trace**: Quezon City, Makati, Pasig, Marikina, Taguig, Pateros.

## Why these six for the policy layer

Two overlapping selection filters:

**WVF ground-rupture corridor.** The six pilots are LGUs where the WVF
either passes through the LGU (Marikina, parts of Pasig, parts of Makati,
parts of QC, parts of Taguig, and areas near Pateros) or where the LGU has
identified fault-corridor barangays in its own planning documents (Pasig
names six directly-affected barangays; Taguig identifies 12 WVF-corridor
barangays; Makati names four in District II). Ground rupture is a
qualitatively different hazard from shaking — it drives the "publicly
displayed hazard maps" obligation (RA 10121 IRR Rule 6 §7) and the
5-meter no-build easement rule appearing in Makati, Pasig, and Taguig
zoning ordinances.

**Capacity gradient.** The six span the full LGU-capacity spectrum in
Metro Manila: from the country's smallest municipality (Pateros: ~1.66
km², 67,319 people) through mid-sized cities (Marikina, Pasig) to
resource-rich commercial hubs (Makati, Taguig, QC). This gives the
transparency-gradient finding meaningful contrast — the finding would be
weaker with only similar-sized LGUs.

## What we're excluding, and why

**Manila** is in the loss layer but not the policy layer. The fault does
not run through Manila, so RA 10121 §12(c)(10) hazard-map obligations
apply differently (shaking exposure only, no rupture). Including Manila
would make the "publicly displayed hazard maps" comparison uneven across
the pilot set.

**Muntinlupa and San Juan** touch the WVF at the corridor's south/north
ends but were not selected because the capacity gradient is already
covered by the six pilots. Muntinlupa in particular would be a
defensible seventh; we hold it for follow-up work.

**The other 12 NCR LGUs** (Caloocan, Malabon, Navotas, Valenzuela,
Parañaque, Pasay, Las Piñas, Mandaluyong, Marikina south) are outside
the fault-rupture corridor and would dilute the comparison.

## What this scope enables — and does not

The six-LGU sample supports:
- LGU-level compliance findings (each LGU is a case study)
- Qualitative comparison of disclosure posture (the transparency-gradient
  taxonomy: `access-broken`, `access-foi`, `access-none`, `access-opaque`)
- Cross-corroboration of the loss model's MMEIRS-M7.2 basis by four of
  the six LGUs' statutory documents (QC, Makati, Pasig, and Taguig
  independently cite MMEIRS in their DRRM planning)

The six-LGU sample does NOT support:
- Statistical generalization to all 1,634 Philippine LGUs
- Statistical generalization to all 17 NCR LGUs (we cover 6 of 17)
- Claims about non-NCR provincial LGUs, whose FOI, portal, and DRRM
  disclosure norms may differ substantially
- Claims about non-WVF hazard disclosure (typhoon, volcanic, tsunami)

The taxonomy itself — `access-broken` / `access-foi` / `access-none` /
`access-opaque` — is proposed as generalizable in structure but the
specific *distribution* across LGUs is a finding restricted to the six
pilots.
