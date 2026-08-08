import { getModelById } from './genomeEngine'

/**
 * AI Explanation Engine — Generates dynamic responses for species questions
 */

export function generateSpeciesAnswers(modelId) {
  const model = getModelById(modelId)
  if (!model) return []

  const parentModels = model.ancestors.map((id) => getModelById(id)).filter(Boolean)
  const childModels = model.descendants.map((id) => getModelById(id)).filter(Boolean)

  const parentNames = parentModels.length > 0 ? parentModels.map((p) => p.name).join(', ') : 'Root Statistical Foundations'
  const childNames = childModels.length > 0 ? childModels.map((c) => c.name).join(', ') : 'Current Evolutionary Apex'

  return [
    {
      question: `Why was ${model.name} created?`,
      answer: `In ${model.historicalMilestones.year}, ${model.historicalMilestones.creator} developed ${model.name} to solve key limitations in previous methods. ${model.historicalMilestones.breakthrough}.`,
    },
    {
      question: `Which model family are you descended from?`,
      answer: `${model.name} belongs to the ${model.family} lineage. It evolved directly from ${parentNames}, inheriting core parameters like ${model.parameters}.`,
    },
    {
      question: `Which problems do you solve better than your ancestors?`,
      answer: `${model.name} excels at ${model.strengths.join(' ')} It addresses previous algorithmic limits through its ${model.decisionMechanism}.`,
    },
    {
      question: `What are your biggest weaknesses & failure conditions?`,
      answer: `Primary limitations: ${model.weaknesses.join(' ')} Failure scenarios include: ${model.failureConditions.join(' ')}`,
    },
    {
      question: `Who succeeded or replaced you in production systems?`,
      answer: `Evolutionary successors include ${childNames}. Higher-generation species improve upon ${model.name} by optimizing ${model.optimizationStrategy}.`,
    },
  ]
}
