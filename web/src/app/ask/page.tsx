'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { ReactNode } from 'react';

type Source = {
  lgu: string;
  source_file: string;
  score: number;
  matched_terms?: string[];
  is_argument_note: boolean;
  lgu_has_pending_provenance: boolean;
  lgu_has_failed_verification: boolean;
  lgu_lapse_types: string[];
};

const LAPSE_MEANING: Record<string, string> = {
  'access-broken': 'LGU tried to publish; the link is broken',
  'access-foi': 'obtainable only by formal request',
  'access-none': 'never published digitally by the LGU',
  'access-opaque': 'online but unfindable or unsearchable',
};

const EXAMPLES = [
  'What does Marikina have in place for the Big One?',
  'Is Pasig\u2019s disaster plan available to the public?',
  'Which of the six LGUs publishes the most?',
  'What hazard information exists for Pateros?',
];

/**
 * Minimal inline markdown: **bold**, *italic*, `code`, and a horizontal rule.
 * Deliberately not a full markdown library — the model is instructed to answer
 * in plain prose with occasional emphasis and bullets, which is all this needs.
 */
function renderInline(text: string, keyPrefix: string) {
  const parts: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) {
      parts.push(<strong key={`${keyPrefix}-b${i}`}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith('`')) {
      parts.push(
        <code key={`${keyPrefix}-c${i}`} style={{ fontSize: '0.9em' }}>
          {tok.slice(1, -1)}
        </code>
      );
    } else {
      parts.push(<em key={`${keyPrefix}-i${i}`}>{tok.slice(1, -1)}</em>);
    }
    last = m.index + tok.length;
    i++;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function AnswerBody({ text }: { text: string }) {
  const lines = text.split('\n');
  const out: ReactNode[] = [];
  let bullets: string[] = [];

  const flush = (key: string) => {
    if (bullets.length === 0) return;
    out.push(
      <ul key={`ul-${key}`} style={{ marginTop: '0.4rem', marginBottom: '0.7rem' }}>
        {bullets.map((b, i) => (
          <li key={i} style={{ marginBottom: '0.2rem' }}>
            {renderInline(b, `li-${key}-${i}`)}
          </li>
        ))}
      </ul>
    );
    bullets = [];
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (/^[-*]\s+/.test(trimmed)) {
      bullets.push(trimmed.replace(/^[-*]\s+/, ''));
      return;
    }
    flush(String(idx));
    if (trimmed === '---') {
      out.push(
        <hr
          key={`hr-${idx}`}
          style={{ border: 0, borderTop: '1px solid rgba(128,128,128,0.3)', margin: '1rem 0' }}
        />
      );
    } else if (trimmed.length > 0) {
      out.push(
        <p key={`p-${idx}`} style={{ marginBottom: '0.7rem', lineHeight: 1.65 }}>
          {renderInline(trimmed, `p-${idx}`)}
        </p>
      );
    }
  });
  flush('end');
  return <>{out}</>;
}

export default function AskPage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState<string[]>([]);

  async function submit(q?: string) {
    const query = (q ?? question).trim();
    if (!query || loading) return;
    setQuestion(query);
    setLoading(true);
    setError('');
    setAnswer('');
    setSources([]);
    setBlocked([]);
    try {
      const res = await fetch('/api/ask/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
      } else {
        setAnswer(data.answer ?? '');
        setSources(data.sources ?? []);
        setBlocked(data.blocked_citations ?? []);
      }
    } catch {
      setError('Could not reach the server. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-main">
      <article className="prose">
        <Link href="/" className="back-link">
          ← back to the map
        </Link>
        <h1>Ask the corpus</h1>
        <p>
          Ask about disaster risk reduction policy in the six LGUs this project
          audits: <strong>Makati, Marikina, Pasig, Quezon City, Pateros,</strong> and{' '}
          <strong>Taguig</strong>. Answers are generated only from documents in
          the project corpus, and every answer states whether the underlying
          document is actually available to the public.
        </p>

        <div
          style={{
            border: '1px solid rgba(200,60,60,0.35)',
            background: 'rgba(200,60,60,0.06)',
            borderRadius: 6,
            padding: '0.75rem 1rem',
            margin: '1.25rem 0',
            fontSize: '0.9rem',
          }}
        >
          <strong>This is not an emergency service.</strong> In an emergency,
          call <strong>911</strong> or your local DRRMO. This tool reads policy
          documents; it cannot give real-time disaster guidance and does not
          speak for any government agency.
        </div>

        <div style={{ margin: '1.5rem 0' }}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
            }}
            placeholder="e.g. What are Marikina's plans for a magnitude 7.2 earthquake?"
            maxLength={600}
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontFamily: 'inherit',
              fontSize: '1rem',
              borderRadius: 6,
              border: '1px solid rgba(128,128,128,0.4)',
              background: 'transparent',
              color: 'inherit',
              resize: 'vertical',
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.5rem',
            }}
          >
            <small style={{ opacity: 0.6 }}>{question.length}/600 · ⌘/Ctrl+Enter to send</small>
            <button
              onClick={() => submit()}
              disabled={loading || !question.trim()}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: 6,
                border: '1px solid var(--accent)',
                background: loading ? 'transparent' : 'var(--accent)',
                color: loading ? 'inherit' : '#fff',
                cursor: loading || !question.trim() ? 'not-allowed' : 'pointer',
                opacity: !question.trim() ? 0.5 : 1,
                fontSize: '0.95rem',
              }}
            >
              {loading ? 'Searching…' : 'Ask'}
            </button>
          </div>
        </div>

        {!answer && !loading && (
          <div style={{ margin: '1.5rem 0' }}>
            <small style={{ opacity: 0.7, display: 'block', marginBottom: '0.5rem' }}>
              Try:
            </small>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => submit(ex)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.5rem 0.75rem',
                  marginBottom: '0.4rem',
                  borderRadius: 5,
                  border: '1px solid rgba(128,128,128,0.25)',
                  background: 'transparent',
                  color: 'inherit',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                }}
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div
            style={{
              border: '1px solid rgba(200,60,60,0.4)',
              borderRadius: 6,
              padding: '0.75rem 1rem',
              margin: '1rem 0',
              fontSize: '0.9rem',
            }}
          >
            {error}
          </div>
        )}

        {answer && (
          <>
            <h2>Answer</h2>
            {blocked.length > 0 && (
              <div
                style={{
                  border: '1px solid rgba(200,60,60,0.45)',
                  background: 'rgba(200,60,60,0.07)',
                  borderRadius: 6,
                  padding: '0.6rem 0.9rem',
                  marginBottom: '0.9rem',
                  fontSize: '0.85rem',
                }}
              >
                <strong>Unverified identifier detected</strong> &mdash; the answer
                referenced {blocked.join(', ')}, which failed primary
                verification in this project. A correction is appended below.
              </div>
            )}
            <AnswerBody text={answer} />
          </>
        )}

        {sources.length > 0 && (
          <>
            <h2>Sources used</h2>
            <p style={{ fontSize: '0.875rem', opacity: 0.75 }}>
              Retrieved passages, ranked by relevance. Flags show the disclosure
              status of the underlying documents.
            </p>
            {sources.map((s, i) => (
              <div
                key={i}
                style={{
                  borderLeft: '3px solid rgba(128,128,128,0.35)',
                  paddingLeft: '0.85rem',
                  marginBottom: '0.85rem',
                  fontSize: '0.875rem',
                }}
              >
                <div>
                  <strong>{s.lgu}</strong>{' '}
                  <span style={{ opacity: 0.6, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {s.score.toFixed(3)}
                  </span>
                </div>
                <div style={{ opacity: 0.7, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  {s.source_file}
                </div>
                {s.matched_terms && s.matched_terms.length > 0 && (
                  <div style={{ opacity: 0.6, fontSize: '0.75rem', marginTop: '0.15rem' }}>
                    matched: {s.matched_terms.join(', ')}
                  </div>
                )}
                <div style={{ marginTop: '0.3rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {s.is_argument_note && (
                    <span style={{ fontSize: '0.72rem', padding: '0.1rem 0.4rem', borderRadius: 3, border: '1px solid rgba(128,128,128,0.4)' }}>
                      project&rsquo;s own argument, not evidence
                    </span>
                  )}
                  {s.lgu_has_failed_verification && (
                    <span style={{ fontSize: '0.72rem', padding: '0.1rem 0.4rem', borderRadius: 3, border: '1px solid rgba(200,60,60,0.5)' }}>
                      LGU has a failed verification — treat IDs cautiously
                    </span>
                  )}
                  {s.lgu_has_pending_provenance && (
                    <span style={{ fontSize: '0.72rem', padding: '0.1rem 0.4rem', borderRadius: 3, border: '1px solid rgba(180,140,40,0.5)' }}>
                      some evidence still PENDING verification
                    </span>
                  )}
                  {s.lgu_lapse_types.map((l) => (
                    <span
                      key={l}
                      style={{ fontSize: '0.72rem', padding: '0.1rem 0.4rem', borderRadius: 3, border: '1px solid rgba(128,128,128,0.4)', fontFamily: 'monospace' }}
                      title={LAPSE_MEANING[l] ?? l}
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        <h2>How this works, and what it can&rsquo;t do</h2>
        <p>
          Your question is matched against passages from the project corpus by
          keyword ranking (BM25), and a language model is asked to answer{' '}
          <em>only</em> from those passages. Matched terms are shown for each
          source, so you can see why a passage was retrieved. When a question
          names an LGU, that LGU&rsquo;s own material is prioritised. The model is
          instructed to refuse anything outside DRRM policy for these six LGUs,
          and to state when a document exists but is not freely downloadable.
        </p>
        <p>
          It can be wrong. It reads a research corpus, not the live records of
          any city. Where an answer matters, go to the cited document — and for
          anything authoritative, contact the LGU&rsquo;s DRRMO directly. See{' '}
          <Link href="/policy">Policy readiness</Link> for the underlying
          scorecard.
        </p>
      </article>
    </main>
  );
}
