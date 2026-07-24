const TONE = {
  warn: 'border-warn/40 bg-warnbg text-warn',
  good: 'border-good/40 bg-goodbg text-good',
  neutral: 'border-line bg-surface text-ink',
  accent: 'border-accent/40 bg-accentsoft text-accentink',
}

/** A front-and-center "what's the state of my world" strip — done vs pending, at a glance, before any list. */
export function SummaryStrip({ items }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((it) => (
        <div key={it.label} className={`rounded-xl border p-2.5 text-center ${TONE[it.tone] || TONE.neutral}`}>
          <div className="text-xl font-bold tabular">{it.value}</div>
          <div className="text-[10px] font-bold uppercase tracking-wide">{it.label}</div>
        </div>
      ))}
    </div>
  )
}
