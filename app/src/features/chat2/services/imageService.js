/**
 * NeuralMind CHAT2 — ML Concept Visualizer & Diagram Service
 */

export async function generateMlImage(prompt, style = 'diagram') {
  const seed = Math.floor(Math.random() * 1000000)
  const stylePromptMap = {
    diagram: 'technical architectural diagram, clean vector infographic, machine learning workflow',
    illustration: 'vibrant modern tech illustration, futuristic glowing cyber aesthetic',
    '3d': '3d isometric render, cinema4d, volumetric lighting, high tech octane render',
    sketch: 'hand drawn blackboard architectural sketch, white chalk on dark slate'
  }

  const enrichedPrompt = `Machine Learning visualization of ${prompt}, ${stylePromptMap[style] || stylePromptMap.diagram}, dark background, high resolution 8k`
  const encoded = encodeURIComponent(enrichedPrompt)
  const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=900&height=600&nologo=true&seed=${seed}`

  return {
    url: imageUrl,
    prompt,
    style,
    seed
  }
}
