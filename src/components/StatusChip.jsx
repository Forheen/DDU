const STYLES = {
  done: 'bg-goodbg text-good',
  partial: 'bg-warnbg text-warn',
  missing: 'bg-surface text-inkfaint border border-dashed border-linestrong',
  blocked: 'bg-critbg text-crit',
  info: 'bg-tealsoft text-teal',
}

const LABELS = {
  done: 'Done',
  partial: 'In progress',
  missing: 'Not filled yet',
  blocked: 'Blocked',
  info: 'Info',
}

export function StatusChip({ status, children }) {
  const cls = STYLES[status] || STYLES.missing
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap ${cls}`}>
      {children || LABELS[status] || status}
    </span>
  )
}
