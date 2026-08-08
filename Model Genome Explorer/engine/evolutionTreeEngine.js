import { GENOME_DATABASE } from './genomeDatabase'

/**
 * Evolution Tree Engine — Layout generator for interactive 2D spatial evolutionary graph
 */

export function buildEvolutionTreeLayout() {
  // Family Group X-Offsets
  const familyLayout = [
    {
      family: 'Linear Models',
      color: '#60a5fa',
      rootX: 120,
      startY: 120,
      models: ['linear-regression', 'logistic-regression'],
    },
    {
      family: 'Tree-Based Species',
      color: '#34d399',
      rootX: 360,
      startY: 120,
      models: ['decision-tree', 'random-forest', 'gradient-boosting', 'xgboost', 'lightgbm'],
    },
    {
      family: 'Neural Species',
      color: '#a78bfa',
      rootX: 620,
      startY: 120,
      models: ['perceptron', 'mlp', 'cnn', 'resnet'],
    },
    {
      family: 'Attention & LLM Species',
      color: '#f472b6',
      rootX: 860,
      startY: 120,
      models: ['lstm', 'transformer', 'gpt'],
    },
  ]

  const nodes = []
  const links = []

  familyLayout.forEach((group) => {
    group.models.forEach((modelId, idx) => {
      const modelData = GENOME_DATABASE.find((m) => m.id === modelId)
      if (!modelData) return

      const x = group.rootX
      const y = group.startY + idx * 110

      nodes.push({
        ...modelData,
        x,
        y,
        color: group.color,
        familyGroup: group.family,
      })
    })
  })

  // Build connecting links based on parent-child ancestors
  nodes.forEach((targetNode) => {
    targetNode.ancestors.forEach((ancId) => {
      const sourceNode = nodes.find((n) => n.id === ancId)
      if (sourceNode) {
        links.push({
          id: `link-${sourceNode.id}-${targetNode.id}`,
          sourceX: sourceNode.x,
          sourceY: sourceNode.y,
          targetX: targetNode.x,
          targetY: targetNode.y,
          sourceId: sourceNode.id,
          targetId: targetNode.id,
          color: targetNode.color,
        })
      }
    })
  })

  return { nodes, links, familyLayout }
}
