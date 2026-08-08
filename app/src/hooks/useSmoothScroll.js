import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

/**
 * Custom hook to initialize Lenis smooth scroll and keep it synchronized with GSAP ScrollTrigger.
 * Tracks scroll direction for sticky headers and handles route top-scrolling cleanly.
 */
export function useSmoothScroll() {
  const lenisRef = useRef(null)
  const location = useLocation()
  const [scrollDirection, setScrollDirection] = useState('up')
  const [isScrolled, setIsScrolled] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    // Respect accessibility settings
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      return
    }

    // Initialize Lenis with smooth luxury inertia
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
      infinite: false,
    })

    lenisRef.current = lenis

    // Sync Lenis scroll events with ScrollTrigger & update scroll direction state
    lenis.on('scroll', ({ scroll }) => {
      ScrollTrigger.update()

      if (scroll > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }

      if (scroll > lastScrollY.current + 6 && scroll > 100) {
        setScrollDirection('down')
      } else if (scroll < lastScrollY.current - 6) {
        setScrollDirection('up')
      }

      lastScrollY.current = scroll
    })

    // Add Lenis RAF loop to GSAP Ticker for 60 FPS frame synchronization
    const handleTicker = (time) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(handleTicker)
    gsap.ticker.lagSmoothing(0)

    // Refresh ScrollTrigger calculations
    ScrollTrigger.refresh()

    return () => {
      gsap.ticker.remove(handleTicker)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  // Scroll to top on route navigation
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true })
      setTimeout(() => {
        ScrollTrigger.refresh()
      }, 100)
    } else {
      window.scrollTo(0, 0)
    }
  }, [location.pathname])

  return { lenisRef, scrollDirection, isScrolled }
}
