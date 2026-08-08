import { calculateNetworkGenome } from '../engine/genomeEngine'
import { Dna, Cpu, Zap, Activity } from 'lucide-react'

/**
 * Genome Telemetry Card Component
 * Displays model depth, total parameters, connection count, estimated FLOPs, and classification metrics.
 */
export default function GenomeTelemetryCard({ topology = [], loss = 1.0 }) {
  const genome = calculateNetworkGenome(topology, loss)

  return (
    <div className="telemetry-hud-container" style={{ marginTop: '1rem' }}>
      <div className="hud-stat-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Dna size={15} color="#c084fc" />
          <span className="hud-stat-label">TOTAL PARAMETERS</span>
        </div>
        <span className="hud-stat-val text-purple">{genome.totalParams}</span>
        <span className="hud-stat-sub">{genome.connectionCount} Synaptic Connections</span>
      </div>

      <div className="hud-stat-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Cpu size={15} color="#38bdf8" />
          <span className="hud-stat-label">NETWORK DEPTH</span>
        </div>
        <span className="hud-stat-val text-cyan">{genome.depth} Layers</span>
        <span className="hud-stat-sub">Complexity: {genome.complexityScore} pts</span>
      </div>

      <div className="hud-stat-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Zap size={15} color="#fbbf24" />
          <span className="hud-stat-label">ESTIMATED FLOPS</span>
        </div>
        <span className="hud-stat-val text-gold">{genome.estimatedFlops}</span>
        <span className="hud-stat-sub">Ops per forward pass</span>
      </div>

      <div className="hud-stat-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Activity size={15} color="#34d399" />
          <span className="hud-stat-label">F1 SCORE RATIO</span>
        </div>
        <span className="hud-stat-val text-emerald">{genome.f1Score}%</span>
        <span className="hud-stat-sub">Precision {genome.precision}% • Recall {genome.recall}%</span>
      </div>
    </div>
  )
}
