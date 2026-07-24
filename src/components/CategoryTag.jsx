import { CATEGORY_LABEL } from '../models/index.js'

const DOT = {
  food: 'bg-accent',
  textile: 'bg-teal',
  oil: 'bg-warn',
  hygiene: 'bg-good',
  other: 'bg-inkfaint',
}

export function CategoryTag({ category }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-inksoft">
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[category] || DOT.other}`} />
      {CATEGORY_LABEL[category] || 'Other'}
    </span>
  )
}
