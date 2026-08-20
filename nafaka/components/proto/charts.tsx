'use client'

// Lightweight pure-SVG charts (no deps). All animate on mount.

function formatNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1000).toFixed(0)}k`
  return `${Math.round(n)}`
}

export function AreaChart({
  data,
  labels,
  height = 120,
  tone = 'brand',
  valuePrefix = '',
}: {
  data: number[]
  labels?: string[]
  height?: number
  tone?: 'brand' | 'accent' | 'ink'
  valuePrefix?: string
}) {
  const w = 320
  const h = height
  const pad = 8
  const max = Math.max(...data)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const innerW = w - pad * 2
  const innerH = h - pad * 2 - 18

  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * innerW
    const y = pad + innerH - ((v - min) / range) * innerH
    return { x, y, v }
  })

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${pad + innerH} L ${pts[0].x} ${pad + innerH} Z`

  const colors = {
    brand: { stroke: '#19bd80', fill: 'rgba(25,189,128,0.16)', text: '#0d9a68' },
    accent: { stroke: '#f27d14', fill: 'rgba(242,125,20,0.16)', text: '#bc4a0b' },
    ink: { stroke: '#65718a', fill: 'rgba(101,113,138,0.14)', text: '#505a72' },
  }[tone]

  const gid = `area-${tone}-${Math.round(max)}`
  const last = pts[pts.length - 1]

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.fill} />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={pad} x2={w - pad} y1={pad + innerH * g} y2={pad + innerH * g} stroke="#eceef2" strokeWidth="1" strokeDasharray="3 4" />
        ))}
        <path d={areaPath} fill={`url(#${gid})`} className="animate-fade-in" />
        <path
          d={linePath}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ strokeDasharray: 1000, strokeDashoffset: 1000, animation: 'dash 1.4s ease forwards' }}
        />
        <circle cx={last.x} cy={last.y} r="4" fill={colors.stroke} />
        <circle cx={last.x} cy={last.y} r="7" fill={colors.stroke} opacity="0.2" />
        <text x={last.x} y={last.y - 10} textAnchor="middle" fontSize="11" fontWeight="700" fill={colors.text}>
          {valuePrefix}
          {formatNum(last.v)}
        </text>
        {labels &&
          labels.map((lbl, i) => (
            <text key={i} x={pts[i].x} y={h - 4} textAnchor="middle" fontSize="9" fill="#848fa5">
              {lbl}
            </text>
          ))}
      </svg>
      <style>{`@keyframes dash { to { stroke-dashoffset: 0; } }`}</style>
    </div>
  )
}

export function BarChart({
  data,
  labels,
  height = 120,
  tone = 'brand',
}: {
  data: number[]
  labels: string[]
  height?: number
  tone?: 'brand' | 'accent' | 'ink'
}) {
  const max = Math.max(...data) || 1
  const colors = { brand: '#19bd80', accent: '#f27d14', ink: '#65718a' }[tone]
  return (
    <div className="w-full">
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5">
            <div className="relative w-full flex items-end justify-center" style={{ height: height - 18 }}>
              <div
                className="w-full max-w-[28px] rounded-t-md transition-all"
                style={{
                  height: `${(v / max) * 100}%`,
                  background: `linear-gradient(180deg, ${colors}, ${colors}bb)`,
                  animation: `grow 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s both`,
                  transformOrigin: 'bottom',
                }}
              />
            </div>
            <span className="text-[9px] text-ink-400 font-medium truncate w-full text-center">{labels[i]}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes grow { from { transform: scaleY(0); } to { transform: scaleY(1); } }`}</style>
    </div>
  )
}

export function DonutSegments({
  segments,
  size = 120,
  stroke = 16,
  centerLabel,
  centerSub,
}: {
  segments: { label: string; value: number; color: string }[]
  size?: number
  stroke?: number
  centerLabel?: string
  centerSub?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const offsets = segments.map((s) => (s.value / total) * c)
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eceef2" strokeWidth={stroke} />
        {segments.map((s, i) => {
          const len = offsets[i]
          const dashOffset = offsets.slice(0, i).reduce((a, b) => a + b, 0)
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-dashOffset}
              style={{ transition: 'stroke-dasharray 0.8s ease', animation: `fade-in 0.5s ${i * 0.1}s both` }}
            />
          )
        })}
      </svg>
      {centerLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-ink-900 leading-none">{centerLabel}</span>
          {centerSub && <span className="text-[10px] text-ink-500 mt-1">{centerSub}</span>}
        </div>
      )}
    </div>
  )
}