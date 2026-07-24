export function FieldLabel({ children }) {
  return <label className="mb-1.5 block text-xs font-bold text-inksoft">{children}</label>
}

export function YesNo({ value, onChange, disabled }) {
  return (
    <div className="flex gap-2">
      {[true, false].map((v) => (
        <button
          type="button"
          key={String(v)}
          disabled={disabled}
          onClick={() => onChange(v)}
          className={`flex-1 rounded-lg border-2 py-2.5 text-sm font-bold transition-colors ${
            value === v
              ? v
                ? 'border-good bg-goodbg text-good'
                : 'border-crit bg-critbg text-crit'
              : 'border-linestrong bg-surface text-inksoft'
          } ${disabled ? 'opacity-50' : ''}`}
        >
          {v ? 'Yes' : 'No'}
        </button>
      ))}
    </div>
  )
}

export function BigChoice({ options, value, onChange, columns = 2 }) {
  return (
    <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}>
      {options.map((opt) => {
        const optValue = typeof opt === 'string' ? opt : opt.value
        const label = typeof opt === 'string' ? opt : opt.label
        const selected = value === optValue
        return (
          <button
            type="button"
            key={optValue}
            onClick={() => onChange(optValue)}
            className={`rounded-lg border-2 px-3 py-2.5 text-sm font-bold transition-colors ${
              selected ? 'border-accent bg-accentsoft text-accentink' : 'border-linestrong bg-surface text-ink'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

export function NumberField({ value, onChange, placeholder, prefix, suffix, step = 'any' }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border-2 border-linestrong bg-surface px-3 py-2">
      {prefix && <span className="text-sm font-bold text-inkfaint">{prefix}</span>}
      <input
        type="number"
        step={step}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        className="w-full bg-transparent text-base font-bold text-ink outline-none tabular"
      />
      {suffix && <span className="text-xs font-bold text-inkfaint">{suffix}</span>}
    </div>
  )
}

export function TextField({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border-2 border-linestrong bg-surface px-3 py-2 text-sm font-medium text-ink outline-none focus:border-accent"
    />
  )
}

export function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border-2 border-linestrong bg-surface px-3 py-2 text-sm font-medium text-ink outline-none focus:border-accent"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => {
        const optValue = typeof opt === 'string' ? opt : opt.value
        const label = typeof opt === 'string' ? opt : opt.label
        return (
          <option key={optValue} value={optValue}>
            {label}
          </option>
        )
      })}
    </select>
  )
}

export function PrimaryButton({ children, onClick, type = 'button', disabled, className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-accentink disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  )
}

export function GhostButton({ children, onClick, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`flex-1 rounded-lg border-2 border-linestrong px-4 py-2.5 text-sm font-bold text-inksoft ${className}`}
    >
      {children}
    </button>
  )
}
