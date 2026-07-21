# Fault trace (authoritative)

`fault-trace_AUTHORITATIVE.geojson` is the drop-in replacement for the loss
model's placeholder trace. **In the repo it belongs on the model side, not here:**

    cp fault_trace/fault-trace_AUTHORITATIVE.geojson  web/public/data/fault-trace.geojson

Then regenerate `web/public/data/scenarios/m{60..76}.json` and update
methodology limitation #5. Full rationale + sensitivity table:
`FAULT_TRACE_METHODOLOGY_FINDING.md`. Source: GEM Global Active Faults DB
(CC-BY-4.0) — add attribution.
