import { Activity, AlertTriangle, Zap, Cpu, TrendingDown } from 'lucide-react'

/**
 * Telemetry HUD Component
 * Displays real-time Epoch, Loss, Accuracy, Learning Rate, Optimizer, and Failure Mode diagnostics.
 */
export default function TelemetryHud({ telemetry, optimizerKey, learningRate, activationKey, failureModes = [] }) {
  const { epoch = 0, loss = 1.0, accuracy = 0 } = telemetry || {}

  return (
    <div className="telemetry-hud-container">
      <div className="hud-stat-card">
        <span className="hud-stat-label">EPOCH COUNTER</span>
        <span className="hud-stat-val text-cyan">#{epoch}</span>
        <span className="hud-stat-sub">Live Gradient Step</span>
      </div>

      <div className="hud-stat-card">
        <span className="hud-stat-label">LOSS (MSE / BCE)</span>
        <span className="hud-stat-val text-rose">{loss.toFixed(4)}</span>
        <div className="hud-mini-rail">
          <div className="hud-mini-fill bg-rose" style={{ width: `${Math.min(100, loss * 100)}%` }} />
        </div>
      </div>

      <div className="hud-stat-card">
        <span className="hud-stat-label">PREDICTION ACCURACY</span>
        <span className="hud-stat-val text-emerald">{accuracy.toFixed(1)}%</span>
        <div className="hud-mini-rail">
          <div className="hud-mini-fill bg-emerald" style={{ width: `${accuracy}%` }} />
        </div>
      </div>

      <div className="hud-stat-card">
        <span className="hud-stat-label">OPTIMIZER & LR</span>
        <span className="hud-stat-val text-purple">{optimizerKey.toUpperCase()}</span>
        <span className="hud-stat-sub">α = {learningRate} • {activationKey.toUpperCase()}</span>
      </div>

      {/* Failure Mode Warning Indicator */}
      {failureModes.length > 0 && (
        <div className="failure-alert-box">
          <AlertTriangle size={18} color="#f87171" />
          <div>
            <h6>{failureModes[0].title}</h6>
            <p>{failureModes[0].message}</p>
          </div>
        </div>
      )}
    </div>
  )
}
