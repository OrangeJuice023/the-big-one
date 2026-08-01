/**
 * Server-side rendered TeX, via KaTeX.
 *
 * NAMED `TeX`, NOT `Math`: a component called Math shadows the JavaScript
 * global `Math` inside any module that imports it, so `Math.log10(...)` in the
 * same file silently resolves to the component and throws at runtime. That bug
 * was hit once already in the chart code on the arithmetic page.
 *
 * WHY SERVER-SIDE: katex.renderToString() produces finished HTML, so the
 * client needs only the stylesheet and fonts — no KaTeX JavaScript is shipped
 * to the browser at all. These pages are server components, so the math is
 * typeset once at build time and arrives as plain markup. Consistent with the
 * rest of the project's preference for the lightest thing that works (see the
 * BM25-over-embeddings decision in scripts/rag/README.md).
 *
 * KaTeX also emits a MathML copy alongside the visual output, which is what
 * screen readers use — so this is more accessible than the monospace text it
 * replaces, not just prettier.
 *
 * throwOnError is false deliberately: a malformed expression renders in red
 * with the source visible rather than failing the whole build. Every
 * expression currently on the site has been verified to compile cleanly.
 */
import katex from 'katex';
import 'katex/dist/katex.min.css';

type Props = {
  /** TeX source. Use String.raw`...` at the call site to avoid escaping backslashes. */
  tex: string;
  /** Display (centred, own line) vs inline. Defaults to display. */
  inline?: boolean;
  /** Optional caption rendered beneath, for units or parameter glosses. */
  note?: string;
  /**
   * Plain-language explanation of what the equation actually does, shown in a
   * collapsed "What is this saying?" disclosure beneath it.
   *
   * Deliberately a <details> element rather than a page-level toggle: the
   * equation always stays visible, and a reader who wants the translation
   * opens it per-equation instead of switching the whole page into a
   * different mode. It is also plain HTML, so it needs no client JavaScript
   * and does not force this server component into a client one — which would
   * have shipped the KaTeX runtime to the browser and undone the reason for
   * rendering server-side in the first place.
   */
  plain?: string;
};

export default function TeX({ tex, inline = false, note, plain }: Props) {
  const html = katex.renderToString(tex, {
    displayMode: !inline,
    throwOnError: false,
    strict: 'ignore',
    output: 'htmlAndMathml',
  });

  if (inline) {
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return (
    <div style={{ margin: '1.1rem 0' }}>
      <div
        style={{ overflowX: 'auto', overflowY: 'hidden', padding: '0.15rem 0' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {note && (
        <p
          style={{
            textAlign: 'center',
            fontSize: '0.82rem',
            opacity: 0.7,
            margin: '0.3rem 0 0',
          }}
        >
          {note}
        </p>
      )}
      {plain && (
        <details
          style={{
            marginTop: '0.55rem',
            fontSize: '0.88rem',
            borderLeft: '2px solid rgba(128,128,128,0.3)',
            paddingLeft: '0.8rem',
          }}
        >
          <summary
            style={{
              cursor: 'pointer',
              opacity: 0.75,
              listStyle: 'revert',
              userSelect: 'none',
            }}
          >
            What is this saying?
          </summary>
          <p style={{ margin: '0.5rem 0 0.2rem', lineHeight: 1.6, opacity: 0.9 }}>
            {plain}
          </p>
        </details>
      )}
    </div>
  );
}
