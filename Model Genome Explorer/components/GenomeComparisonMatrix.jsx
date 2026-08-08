import { GENOME_DATABASE } from '../engine/genomeDatabase'

/**
 * Genome Comparison Matrix Component — Multi-species DNA alignment & matrix comparison
 */
export default function GenomeComparisonMatrix({
  comparisonResult,
  comparisonIds,
  toggleComparisonModel,
  onSelectModel,
}) {
  if (!comparisonResult) return null

  const { models, matrix, traitKeys } = comparisonResult

  return (
    <div className="comparison-matrix-container">
      {/* Header & Species Selector */}
      <div className="comparison-hero glass">
        <div className="comp-title-group">
          <h3>
            <span>MULTI-SPECIES GENOME COMPARISON MATRIX</span>
          </h3>
          <p>Select up to 4 algorithms to align their genetic DNA, pairwise similarity, and trait profiles.</p>
        </div>

        <div className="species-chips-row">
          {GENOME_DATABASE.map((m) => {
            const isSelected = comparisonIds.includes(m.id)
            return (
              <button
                key={m.id}
                type="button"
                className={`species-chip-btn ${isSelected ? 'active' : ''}`}
                onClick={() => toggleComparisonModel(m.id)}
              >
                {isSelected ? '✓ ' : '+ '}
                {m.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Pairwise DNA Similarity Matrix */}
      <div className="matrix-table-card glass">
        <h4>PAIRWISE DNA SIMILARITY MATRIX (%)</h4>
        <div className="matrix-grid-wrapper">
          <table className="dna-matrix-table">
            <thead>
              <tr>
                <th>Species</th>
                {models.map((m) => (
                  <th key={m.id}>{m.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {models.map((mRow, i) => (
                <tr key={mRow.id}>
                  <td className="row-head-cell">{mRow.name}</td>
                  {models.map((mCol, j) => {
                    const score = matrix[i][j]
                    return (
                      <td
                        key={mCol.id}
                        className="score-cell"
                        style={{
                          background:
                            score === 100
                              ? 'rgba(56, 189, 248, 0.25)'
                              : score > 70
                              ? 'rgba(52, 211, 153, 0.2)'
                              : score > 40
                              ? 'rgba(251, 191, 36, 0.15)'
                              : 'rgba(248, 113, 113, 0.1)',
                        }}
                      >
                        {score}%
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side-by-Side Trait Matrix */}
      <div className="side-by-side-card glass">
        <h4>SIDE-BY-SIDE GENETIC TRAIT COMPARISON</h4>
        <div className="table-responsive">
          <table className="side-side-table">
            <thead>
              <tr>
                <th>Genetic Trait</th>
                {models.map((m) => (
                  <th key={m.id} onClick={() => onSelectModel(m.id)} style={{ cursor: 'pointer' }}>
                    <span className="code-badge">{m.speciesCode}</span>
                    <br />
                    {m.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {traitKeys.map((tk) => (
                <tr key={tk.key}>
                  <td className="trait-label-cell">{tk.label}</td>
                  {models.map((m) => {
                    const val = m.traits[tk.key] || 50
                    return (
                      <td key={m.id} className="trait-val-cell">
                        <div className="cell-bar-wrap">
                          <span>{val}%</span>
                          <div className="mini-rail">
                            <div className="mini-fill" style={{ width: `${val}%` }} />
                          </div>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
