#!/usr/bin/env python3
"""
policy-layer RAG ingestion — step 1: chunk + attribute.

Reads every corpus note + the ledger (status.csv, manifest.csv), splits notes
into overlapping chunks by markdown heading, and attaches provenance metadata
to EVERY chunk (not just the document) so the query layer can surface
access-foi / PENDING caveats without re-parsing anything at query time.

Output: scripts/rag/chunks.json — consumed by embed.mjs (step 2, Node, run
where you have network access to download the embedding model — this
sandbox's network does not reach huggingface.co, so step 2 cannot run here).

Usage:
    python3 scripts/rag/chunk.py

Re-run whenever the corpus or ledger changes. This script has no network
dependency and is safe to run anywhere Python 3 + stdlib is available.
"""
import csv
import json
import re
import hashlib
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
CORPUS_DIR = REPO_ROOT / "policy-layer" / "corpus"
FINDINGS_DIR = REPO_ROOT / "policy-layer" / "findings"
STATUS_CSV = REPO_ROOT / "policy-layer" / "ledger" / "status.csv"
MANIFEST_CSV = REPO_ROOT / "policy-layer" / "ledger" / "manifest.csv"
OUT_PATH = Path(__file__).resolve().parent / "chunks.json"

# Target chunk size in characters. Small corpus, small chunks — precision
# over recall, since every chunk needs to carry enough context to stand
# alone in front of an LLM without the rest of the document.
MAX_CHUNK_CHARS = 1200
OVERLAP_CHARS = 150


def load_csv_rows(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def lgu_from_path(path: Path) -> str:
    """Infer the LGU from the corpus subfolder name, or 'national'/'cross-cutting'."""
    parts = path.relative_to(CORPUS_DIR).parts if CORPUS_DIR in path.parents or path.parent == CORPUS_DIR else None
    try:
        rel = path.relative_to(CORPUS_DIR)
        return rel.parts[0]
    except ValueError:
        return "cross-cutting"


def split_by_heading(text: str):
    """
    Split markdown on ## / ### headings, keeping the heading with its section.
    Falls back to paragraph splitting if a section is still too long.
    """
    # Split on lines starting with ## or ### (not #### to avoid over-fragmenting)
    pattern = re.compile(r"(?=^#{2,3} )", re.MULTILINE)
    raw_sections = pattern.split(text)
    sections = [s.strip() for s in raw_sections if s.strip()]
    if not sections:
        sections = [text.strip()]

    chunks = []
    for section in sections:
        if len(section) <= MAX_CHUNK_CHARS:
            chunks.append(section)
        else:
            # paragraph-split, then greedily pack up to MAX_CHUNK_CHARS with overlap
            paras = [p for p in section.split("\n\n") if p.strip()]
            current = ""
            for p in paras:
                if len(current) + len(p) + 2 <= MAX_CHUNK_CHARS:
                    current = (current + "\n\n" + p).strip()
                else:
                    if current:
                        chunks.append(current)
                        # start next chunk with a small overlap tail
                        current = current[-OVERLAP_CHARS:] + "\n\n" + p
                    else:
                        # single paragraph longer than MAX_CHUNK_CHARS: hard-split
                        for i in range(0, len(p), MAX_CHUNK_CHARS):
                            chunks.append(p[i:i + MAX_CHUNK_CHARS])
                        current = ""
            if current:
                chunks.append(current)
    return chunks


def chunk_id(source: str, idx: int) -> str:
    h = hashlib.sha1(f"{source}::{idx}".encode()).hexdigest()[:10]
    return f"chunk_{h}"


def build_manifest_index(manifest_rows):
    """
    Index manifest rows by lgu (lowercased, spaces stripped) so a corpus note
    for e.g. 'Marikina' can pull every manifest row about Marikina documents,
    to attach source_type / provenance_note context to chunks from that LGU.
    """
    idx = {}
    for row in manifest_rows:
        key = row.get("lgu", "").strip().lower().replace(" ", "")
        idx.setdefault(key, []).append(row)
    return idx


def status_lookup(status_rows):
    """Index status.csv by (lgu, obl_id) for quick lapse/status lookup."""
    idx = {}
    for row in status_rows:
        key = (row.get("lgu", "").strip().lower().replace(" ", ""), row.get("obl_id", "").strip())
        idx[key] = row
    return idx


def main():
    manifest_rows = load_csv_rows(MANIFEST_CSV) if MANIFEST_CSV.exists() else []
    status_rows = load_csv_rows(STATUS_CSV) if STATUS_CSV.exists() else []
    manifest_idx = build_manifest_index(manifest_rows)
    status_idx = status_lookup(status_rows)

    all_chunks = []

    md_files = sorted(CORPUS_DIR.rglob("*.md")) + sorted(FINDINGS_DIR.rglob("*.md"))

    for path in md_files:
        text = path.read_text(encoding="utf-8", errors="ignore")
        if not text.strip():
            continue

        try:
            rel = path.relative_to(REPO_ROOT)
        except ValueError:
            rel = path

        is_finding = FINDINGS_DIR in path.parents
        lgu = "cross-cutting" if is_finding else lgu_from_path(path)
        lgu_key = lgu.strip().lower().replace(" ", "").replace("quezoncity", "quezoncity")

        # pull whatever manifest rows exist for this LGU as lightweight
        # provenance context (source_type distribution), so a chunk from a
        # Marikina note can be tagged with the fact that Marikina carries
        # multiple 'PENDING' / access-foi entries, without re-deriving that
        # from prose at query time.
        related_manifest = manifest_idx.get(lgu_key, [])
        source_types_present = sorted(set(r.get("source_type", "") for r in related_manifest if r.get("source_type")))
        has_pending = any("PENDING" in (r.get("provenance_note", "") or "") for r in related_manifest)
        has_failed_verification = any(
            "FAILED" in (r.get("provenance_note", "") or "") or "NOT VERIFIED" in (r.get("provenance_note", "") or "")
            for r in related_manifest
        )

        # pull lapse tags for this LGU across obligations, for quick surfacing
        lgu_lapses = sorted(set(
            row.get("lapse_type", "") for (l, o), row in status_idx.items()
            if l == lgu_key and row.get("lapse_type") and row.get("lapse_type") not in ("", "unverified")
        ))

        sections = split_by_heading(text)
        for i, section in enumerate(sections):
            cid = chunk_id(str(rel), i)
            all_chunks.append({
                "id": cid,
                "text": section,
                "source_file": str(rel),
                "lgu": lgu,
                "is_argument_note": is_finding,  # True = normative argument, not evidence
                "source_types_in_lgu": source_types_present,
                "lgu_has_pending_provenance": has_pending,
                "lgu_has_failed_verification": has_failed_verification,
                "lgu_lapse_types": lgu_lapses,
            })

    OUT_PATH.write_text(json.dumps(all_chunks, indent=1, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {len(all_chunks)} chunks from {len(md_files)} files -> {OUT_PATH}")

    # quick sanity summary
    by_lgu = {}
    for c in all_chunks:
        by_lgu[c["lgu"]] = by_lgu.get(c["lgu"], 0) + 1
    for lgu, n in sorted(by_lgu.items()):
        print(f"  {lgu}: {n} chunks")


if __name__ == "__main__":
    main()
