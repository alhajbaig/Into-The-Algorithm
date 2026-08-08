import { GENOME_DATABASE } from './genomeDatabase'

/**
 * Integration Engine — Bridges Genome Explorer with Quest System, ML Brain MRI, & AI Digital Twin
 */

export function getQuestGenomeSynergy(clearedLevelIds = []) {
  // Map level IDs to mastered species
  const clearedCount = clearedLevelIds.length
  const masteredSpeciesCount = Math.min(GENOME_DATABASE.length, Math.floor(clearedCount / 5) + 1)
  const illuminatedIds = GENOME_DATABASE.slice(0, masteredSpeciesCount).map((m) => m.id)

  const brainStrength = Math.min(100, Math.round((clearedCount / 100) * 100))

  const nextRecommendedModel =
    GENOME_DATABASE.find((m) => !illuminatedIds.includes(m.id)) || GENOME_DATABASE[GENOME_DATABASE.length - 1]

  return {
    clearedCount,
    masteredSpeciesCount,
    illuminatedIds,
    brainStrength,
    nextRecommendedModel,
    recommendationReason: `Based on your ${clearedCount} cleared levels, your Digital Twin recommends mastering ${nextRecommendedModel.name} (${nextRecommendedModel.family}) to complete your evolutionary tree branch.`,
  }
}
