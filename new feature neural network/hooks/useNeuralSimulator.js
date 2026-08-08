import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { NeuralNetworkModel } from '../engine/neuralSimulationEngine'
import { diagnoseFailureModes } from '../engine/failureModesEngine'

/**
 * useNeuralSimulator Custom Hook
 * Governs neural model state, animation ticker, training mode, topology, and failure diagnostics.
 */
export function useNeuralSimulator(initialTopology = [4, 8, 4, 1]) {
  const [topology, setTopology] = useState(initialTopology)
  const [activationKey, setActivationKey] = useState('relu')
  const [optimizerKey, setOptimizerKey] = useState('adam')
  const [learningRate, setLearningRate] = useState(0.05)
  const [mode, setMode] = useState('train') // 'train' | 'forward' | 'backprop' | 'pause'
  const [isPlaying, setIsPlaying] = useState(true)
  const [speed, setSpeed] = useState(1.0)
  const [selectedNeuron, setSelectedNeuron] = useState(null)

  // Instantiate model
  const modelRef = useRef(new NeuralNetworkModel(topology, activationKey, optimizerKey, learningRate))
  const [telemetry, setTelemetry] = useState({
    epoch: 0,
    loss: 1.0,
    accuracy: 0.0,
  })

  // Re-initialize model on topology / parameter change
  useEffect(() => {
    modelRef.current = new NeuralNetworkModel(topology, activationKey, optimizerKey, learningRate)
    setTelemetry({ epoch: 0, loss: 1.0, accuracy: 0.0 })
  }, [topology, activationKey, optimizerKey, learningRate])

  // Animation Loop for live step
  useEffect(() => {
    let animId
    let lastTime = performance.now()

    const loop = (time) => {
      if (isPlaying && mode !== 'pause') {
        if (time - lastTime > 400 / speed) {
          const stepRes = modelRef.current.stepTraining()
          setTelemetry({
            epoch: stepRes.epoch,
            loss: stepRes.loss,
            accuracy: stepRes.accuracy,
          })
          lastTime = time
        }
      }
      animId = requestAnimationFrame(loop)
    }

    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [isPlaying, mode, speed])

  const stepManual = useCallback(() => {
    const stepRes = modelRef.current.stepTraining()
    setTelemetry({
      epoch: stepRes.epoch,
      loss: stepRes.loss,
      accuracy: stepRes.accuracy,
    })
  }, [])

  const resetModel = useCallback(() => {
    modelRef.current = new NeuralNetworkModel(topology, activationKey, optimizerKey, learningRate)
    setTelemetry({ epoch: 0, loss: 1.0, accuracy: 0.0 })
    setSelectedNeuron(null)
  }, [topology, activationKey, optimizerKey, learningRate])

  const failureModes = useMemo(() => diagnoseFailureModes(modelRef.current), [telemetry.epoch])

  return {
    model: modelRef.current,
    telemetry,
    topology,
    setTopology,
    activationKey,
    setActivationKey,
    optimizerKey,
    setOptimizerKey,
    learningRate,
    setLearningRate,
    mode,
    setMode,
    isPlaying,
    setIsPlaying,
    speed,
    setSpeed,
    selectedNeuron,
    setSelectedNeuron,
    stepManual,
    resetModel,
    failureModes,
  }
}
