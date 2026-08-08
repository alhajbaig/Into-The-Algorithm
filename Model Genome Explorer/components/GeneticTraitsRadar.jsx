import { getRadarTraitMetrics } from '../engine/genomeEngine'

/**
 * Genetic Traits Radar Component — Renders 9-axis radar mesh & dynamic trait bars
 */
export default function GeneticTraitsRadar({ model }) {
  if (!model) return null
  const metrics = getRadarTraitMetrics(model)

  // 9-axis radar SVG calculation
  const total = metrics.length
  const cx = 160
  const cy = 160
  const r = 110

  const getCoordinates = (index, val) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2
    const distance = (val / 100) * r
    const x = cx + distance * Math.cos(angle)
    const y = cy + distance * Math.sin(angle)
    return { x, y }
  }

  // Polygon points
  const points = metrics
    .map((m, i) => {
      const { x, y } = getCoordinates(i, m.value)
      return `${x},${y}`
    })
    .join(' ')

  // Grid concentric rings
  const rings = [0.25, 0.5, 0.75, 1.0]

  return (
    <div className="genetic-traits-card glass">
      <div className="card-head">
        <h4>GENETIC TRAIT SPECTRUM • {model.name.toUpperCase()}</h4>
        <span className="code-badge">{model.speciesCode}</span>
      </div>

      <div className="radar-grid-layout">
        {/* SVG Radar Chart */}
        <div className="radar-svg-container">
          <svg viewBox="0 0 320 320" className="radar-svg">
            <defs>
              <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2" />
              </radialGradient>
            </defs>

            {/* Concentric Web Circles */}
            {rings.map((factor, idx) => (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r={r * factor}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeDasharray={idx < 3 ? '3 3' : 'none'}
              />
            ))}

            {/* Axis Spoke Lines */}
            {metrics.map((m, i) => {
              const { x, y } = getCoordinates(i, 100)
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={x}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeWidth="1"
                />
              )
            })}

            {/* Polygon Shape */}
            <polygon points={points} fill="url(#radarFill)" stroke="#38bdf8" strokeWidth="2" />

            {/* Vertex Dots & Labels */}
            {metrics.map((m, i) => {
              const { x, y } = getCoordinates(i, m.value)
              const labelPos = getCoordinates(i, 118)
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontWeight="600"
                  >
                    {m.label}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Trait Meters List */}
        <div className="trait-bars-column">
          {metrics.map((m) => (
            <div key={m.label} className="trait-bar-row">
              <div className="trait-bar-header">
                <span className="trait-name">{m.label}</span>
                <span className="trait-val">{m.value}%</span>
              </div>
              <div className="trait-rail">
                <div
                  className="trait-fill"
                  style={{
                    width: `${m.value}%`,
                    background:
                      m.value > 75
                        ? 'linear-gradient(90deg, #34d399, #38bdf8)'
                        : m.value > 45
                        ? 'linear-gradient(90deg, #38bdf8, #a855f7)'
                        : 'linear-gradient(90deg, #f87171, #fbbf24)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
