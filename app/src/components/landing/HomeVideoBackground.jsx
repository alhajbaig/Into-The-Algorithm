import { useEffect, useRef } from 'react'

export default function HomeVideoBackground() {
  const videoRef = useRef(null)

  // Force autoplay policy compliance across all modern browsers
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true
      videoRef.current.play().catch((err) => {
        console.warn('Video background autoplay attempt:', err)
      })
    }
  }, [])

  return (
    <div className="home-video-bg-container">
      {/* 🎥 HIGH-DEFINITION AI EDUCATION BACKGROUND VIDEO (MUTED, AUTOPLAY, LOOP) */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="home-bg-video-media"
      >
        <source src="/home-bg-video.mp4" type="video/mp4" />
      </video>

      {/* CREATIVE AMBIENT LASER GLOW BEAMS */}
      <div className="ambient-cyan-beam" />
      <div className="ambient-purple-beam" />

      {/* FUTURISTIC CYBER GRID OVERLAY */}
      <div className="cyber-grid-overlay" />

      {/* SLEEK LIGHTWEIGHT VIGNETTE OVERLAY */}
      <div className="home-video-overlay-shield" />
    </div>
  )
}
