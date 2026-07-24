// The explicit "who does this need next" indicator every DDU/product screen
// shows — so nobody has to guess whether a record is stalled and on whom.
export function PendingBanner({ ddu }) {
  if (!ddu) return null

  if (ddu.isBlocked) {
    const reason =
      ddu.stage2Status === 'blocked'
        ? 'Dropped at Stage 2’s Critical gate — packaging or in-village production failed.'
        : 'Stopped at Cost Economics — no viable price in retail or institution channels.'
    return (
      <div className="rounded-xl border border-crit/40 bg-critbg px-4 py-3 text-sm text-crit">
        <div className="font-bold">⛔ Dead end, nothing pending</div>
        <div className="mt-0.5 text-crit/90">{reason}</div>
      </div>
    )
  }

  const pending = ddu.pendingOn
  if (!pending) {
    return (
      <div className="rounded-xl border border-good/40 bg-goodbg px-4 py-3 text-sm text-good">
        <div className="font-bold">✅ Nothing pending — this DDU is live</div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-warn/40 bg-warnbg px-4 py-3 text-sm text-warn">
      <div className="font-bold">⏳ Waiting on {pending.role}</div>
      <div className="mt-0.5 text-warn/90">{pending.what}</div>
    </div>
  )
}
