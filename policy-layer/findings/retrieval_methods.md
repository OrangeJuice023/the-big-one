# Retrieval methods — what this project uses, and why

Companion to the eFOI decision recorded in `SYNTHESIS.md` §8 and
`why_proactive_disclosure.md`. That note explains why the project declines to
file formal requests. This one sets out what it *does* use, and the one
scoring error the method could invite.

**Ingested:** S7q. Methodological note; no status changes.

---

## The distinction: open channels versus privileged channels

| | Open | Privileged |
|---|---|---|
| **Examples** | Fetching a public URL; browsing an index; downloading a linked PDF; reading a national portal (PIA, SubayBAYAN, DHSUD) | eFOI request; letter to the Sanggunian; counter service requiring ID and USB drive; certified true copy |
| **Requires** | the URL | identity, standing, literacy, time, sometimes physical presence |
| **What success proves** | the document is retrievable by anyone who can reach that address | the document is obtainable by a requester with standing |
| **Used here?** | **Yes** | **No** — see `SYNTHESIS.md` §8 |

Automated fetching of public URLs is not a privileged channel. It is reading,
faster. Any member of the public holding the same address could obtain the same
file. That is why it does not carry the inconsistency problem eFOI does: it
demonstrates nothing about researcher advantage, because there is no advantage
involved.

The project has used open retrieval throughout — `pateros.gov.ph`,
`qccouncil.quezoncity.gov.ph`, the Taguig ordinance index on Google Sites,
DHSUD's HLURB resolution archive, PIA, SubayBAYAN, and the Pasig asset server.

## Failed retrieval is evidence, not an obstacle

Several of the corpus's strongest findings are retrieval *failures*:

- Pateros's `RESOLUTION-1988-2019.pdf` — bot-blocked on fetch.
- Pasig's ordinance index at `pasigcity.gov.ph/city-ordinances` — bot-blocked.
- Makati's Enhanced DRRM Plan 2019–2030 — described on the portal, file-not-found.
- Taguig's ordinance index — reachable, but contains titles only.

Each was logged rather than worked around. A retrieval attempt that fails in a
specific, characterisable way *is* the observation.

## ⚠️ The scoring error this method invites

**Successful scraping proves retrievability-given-the-URL. It does not prove
findability.** These are different properties, and the obligation at issue —
"publicly displayed" (IRR Rule 6 §7) — is about the second.

Concrete case. Pasig Ordinance No. 02 s.2015 is fetchable at:

```
assets.pasigcity.gov.ph/storage/city_ordinance/2015/02/05/659cfaaeb80f61704786606Ord%2002%202015.pdf
```

We hold that file. It nonetheless remains `access-opaque`, because no citizen
can construct that URL: the 22-character hash prefix defeats guessing, and the
filename gives search engines nothing to index. Obtaining a document by
following a link we already possess says nothing about whether a resident
starting from "I want to read my city's DRRM ordinance" could ever arrive at it.

**Rule.** A successful fetch never by itself moves a status to `present`. The
question is always: *could a member of the public find this, starting from the
LGU's own public entry points?* Where the answer is no, the lapse stands even
though the file is in the corpus.

This is the scraping-side analogue of the eFOI inconsistency. Both errors have
the same shape — mistaking the research team's access for the public's.

## Bot-blocking is not inaccessibility

An important qualification. When a server refuses automated requests, that is a
signal about machine-readability and indexability, **not proof that a human
cannot retrieve the document.** A person with a browser may well succeed where
a fetch fails.

The corpus handles this by escalating to manual browser verification before
drawing conclusions. Pasig OB4 is the worked example: automated fetch was
blocked, so the LDRRMP's absence could not be asserted from that alone. A
direct browser check was performed, confirmed the plan is not published as a
standalone download, and only then did OB4 move to `partial`. The
`PENDING` flag existed precisely to prevent the conclusion being drawn early.

## Third-party mirrors do not establish LGU disclosure

Marikina's CLUP 2018–2027 and Taguig's CLUP 2000–2020 are both retrievable from
Scribd, Studocu, PDFCoffee, and Course Hero. Content may be identical to the
official text. This does not satisfy the obligation: RA 10121 places the duty on
the LGU, and a document circulating on an academic file-sharing site is not the
LGU displaying it. Such copies are logged as `secondary-third-party` in
`ledger/manifest.csv` and can corroborate content, never disclosure.

## Practical constraints observed

1. **Respect `robots.txt` and access signals.** A project arguing for open
   disclosure should not route around a site's stated preferences. Where a
   server declines automated access, escalate to manual browsing rather than
   evasion — this is the same symmetry principle applied to eFOI.
2. **Do not burden LGU infrastructure.** These are small, often underfunded
   servers. Single fetches, no crawling at volume.
3. **Record the retrieval method per document.** `ledger/manifest.csv` carries
   `primary_url`, `alt_url`, and `source_type`; the `provenance_note` should
   say how a document was obtained where that bears on interpretation.
4. **Distinguish LGU domain from elsewhere.** Marikina's Citizen's Charter 2012
   sits on a CloudFront CDN, not `marikina.gov.ph`; Taguig's ordinance index is
   on Google Sites. Both are logged as such, because *where* a document lives is
   part of the disclosure finding.

## Summary

Open retrieval is used freely and its failures are treated as data. Privileged
retrieval is declined. The discipline in both directions is the same question:
**does this tell us what the public can get, or only what we can get?**
