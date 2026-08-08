import { useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'

/**
 * Custom cursor hook — renders a dot + follower ring that track the mouse
 * with GSAP spring physics. Scales up on interactive elements, disappears
 * on touch devices. Magnetic buttons subtly pull the cursor toward center.
 */
export function useCustomCursor(dotRef, followerRef) {
  const mouse = useRef({ x: -100, y: -100 })
  const isTouch = useRef(false)

  const onMouseMove = useCallback((e) => {
    mouse.current.x = e.clientX
    mouse.current.y = e.clientY

    if (dotRef.current) {
      gsap.to(dotRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.15,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }

    if (followerRef.current) {
      gsap.to(followerRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.45,
        ease: 'power3.out',
        overwrite: 'auto',
      })
    }
  }, [dotRef, followerRef])

  useEffect(() => {
    // Detect touch devices
    const touchQuery = window.matchMedia('(pointer: coarse)')
    if (touchQuery.matches) {
      isTouch.current = true
      return
    }

    // Detect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    // Show cursor elements
    if (dotRef.current) dotRef.current.style.opacity = '1'
    if (followerRef.current) followerRef.current.style.opacity = '1'

    // Hide default cursor
    document.documentElement.style.cursor = 'none'

    window.addEventListener('mousemove', onMouseMove, { passive: true })

    // Hover states
    const handleEnter = (e) => {
      const target = e.target.closest('a, button, [data-magnetic], .modern-btn-primary, .modern-btn-secondary, .modern-btn-demo, .nav-link, .ghost-btn, .option, .mode-tab, .back-link')
      if (target) {
        gsap.to(dotRef.current, { scale: 0.5, duration: 0.25, ease: 'power2.out' })
        gsap.to(followerRef.current, { scale: 1.8, opacity: 0.4, duration: 0.35, ease: 'power2.out' })
      }
    }

    const handleLeave = (e) => {
      const target = e.target.closest('a, button, [data-magnetic], .modern-btn-primary, .modern-btn-secondary, .modern-btn-demo, .nav-link, .ghost-btn, .option, .mode-tab, .back-link')
      if (target) {
        gsap.to(dotRef.current, { scale: 1, duration: 0.25, ease: 'power2.out' })
        gsap.to(followerRef.current, { scale: 1, opacity: 0.5, duration: 0.35, ease: 'power2.out' })
      }
    }

    // Card hover — expand follower
    const handleCardEnter = (e) => {
      const card = e.target.closest('[data-tilt], .hero-feature-card, .prereq-card, .mission-card, .arsenal-card, .level-card, .hub-card')
      if (card) {
        gsap.to(followerRef.current, { scale: 2.2, opacity: 0.2, duration: 0.4, ease: 'power2.out' })
      }
    }

    const handleCardLeave = (e) => {
      const card = e.target.closest('[data-tilt], .hero-feature-card, .prereq-card, .mission-card, .arsenal-card, .level-card, .hub-card')
      if (card) {
        gsap.to(followerRef.current, { scale: 1, opacity: 0.5, duration: 0.4, ease: 'power2.out' })
      }
    }

    document.addEventListener('mouseenter', handleEnter, true)
    document.addEventListener('mouseleave', handleLeave, true)
    document.addEventListener('mouseenter', handleCardEnter, true)
    document.addEventListener('mouseleave', handleCardLeave, true)

    // Hide when mouse leaves window
    const handleMouseLeave = () => {
      gsap.to([dotRef.current, followerRef.current], { opacity: 0, duration: 0.3 })
    }
    const handleMouseEnter = () => {
      gsap.to(dotRef.current, { opacity: 1, duration: 0.3 })
      gsap.to(followerRef.current, { opacity: 0.5, duration: 0.3 })
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      document.documentElement.style.cursor = ''
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseenter', handleEnter, true)
      document.removeEventListener('mouseleave', handleLeave, true)
      document.removeEventListener('mouseenter', handleCardEnter, true)
      document.removeEventListener('mouseleave', handleCardLeave, true)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [dotRef, followerRef, onMouseMove])
}
