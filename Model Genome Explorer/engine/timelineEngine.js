import { GENOME_DATABASE } from './genomeDatabase'

/**
 * Timeline Engine — Historical milestones, publication ordering, & paradigm shifts
 */

export function getChronologicalTimeline() {
  const sorted = [...GENOME_DATABASE].sort(
    (a, b) => (a.historicalMilestones?.year || 2000) - (b.historicalMilestones?.year || 2000)
  )

  const eraGroups = [
    { era: '1805–1970: Foundations of Statistical Learning', minYear: 1800, maxYear: 1970 },
    { era: '1980–1999: Decision Trees, Backprop & Gated Recurrence', minYear: 1980, maxYear: 1999 },
    { era: '2000–2014: Random Forests, Boosting & Deep Vision', minYear: 2000, maxYear: 2014 },
    { era: '2015–2026: ResNets, Transformers & Generative LLMs', minYear: 2015, maxYear: 2030 },
  ]

  return eraGroups.map((group) => {
    const modelsInEra = sorted.filter((m) => {
      const y = m.historicalMilestones?.year || 2000
      return y >= group.minYear && y <= group.maxYear
    })
    return {
      ...group,
      models: modelsInEra,
    }
  })
}
