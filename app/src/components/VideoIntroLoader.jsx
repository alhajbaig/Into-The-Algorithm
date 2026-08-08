import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function VideoIntroLoader({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)
  const videoRef = useRef(null)

  // Prevent scroll during loading overlay
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Set faster playback rate (1.35x speed) as soon as video plays
  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.35
    }
  }

  // Handle video finish and fast, crisp transition out
  const handleFinish = () => {
    if (isExiting) return
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      document.body.style.overflow = ''
      if (onComplete) onComplete()
    }, 400) // Fast 400ms transition
  }

  // Safety fallback timer (5s max)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFinish()
    }, 5500)
    return () => clearTimeout(timer)
  }, [isExiting])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fullscreen-video-overlay"
        initial={{ opacity: 1 }}
        animate={{ opacity: isExiting ? 0 : 1, scale: isExiting ? 1.02 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <video
          ref={videoRef}
          src="/intro-loader.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          onPlay={handlePlay}
          onCanPlay={handlePlay}
          onEnded={handleFinish}
          className="fullscreen-video-element"
        />
      </motion.div>
    </AnimatePresence>
  )
}
