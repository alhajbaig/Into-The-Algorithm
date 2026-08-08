import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'

gsap.registerPlugin(ScrollTrigger)

/**
 * World-class GSAP animation hook supporting SplitType text reveals, 3D card tilt with specular highlights,
 * magnetic buttons, scroll parallax, and staggered viewport entrances.
 * Fully scoped inside gsap.context() for zero memory leaks.
 */
export function useGSAPAnimations(containerRef, dependencies = []) {
  useEffect(() => {
    if (!containerRef.current) return

    // Accessibility check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const isTouch = window.matchMedia('(pointer: coarse)').matches

    const ctx = gsap.context(() => {
      // =========================================================================
      // 1. SECTION & ELEMENT VIEWPORT REVEALS
      // =========================================================================
      const revealElements = containerRef.current.querySelectorAll('[data-gsap="reveal"], [data-animate="fade-up"]')
      revealElements.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
              once: true,
            },
          }
        )
      })

      // =========================================================================
      // 2. KINETIC SPLIT-TYPE TEXT ANIMATION (CHARACTER & WORD STAGGER REVEAL)
      // =========================================================================
      const splitElements = containerRef.current.querySelectorAll('[data-gsap="split-text"], [data-split]')
      splitElements.forEach((el) => {
        try {
          const res = new SplitType(el, { types: 'words' })
          if (res.words && res.words.length) {
            gsap.fromTo(
              res.words,
              {
                opacity: 0,
                y: 35,
                filter: 'blur(6px)',
              },
              {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                duration: 0.85,
                stagger: 0.05,
                ease: 'power3.out',
                delay: 0.1,
              }
            )
          }
        } catch (err) {
          console.warn('SplitType animation error:', err)
        }
      })

      // =========================================================================
      // 3. STAGGERED GRIDS & LISTS
      // =========================================================================
      const staggerContainers = containerRef.current.querySelectorAll('[data-gsap="stagger"]')
      staggerContainers.forEach((container) => {
        const children = container.children
        if (!children.length) return

        gsap.fromTo(
          children,
          { opacity: 0, y: 35, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.75,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: container,
              start: 'top 85%',
              toggleActions: 'play none none none',
              once: true,
            },
          }
        )
      })

      // =========================================================================
      // 4. PARALLAX LAYERS
      // =========================================================================
      const parallaxElements = containerRef.current.querySelectorAll('[data-gsap="parallax"], [data-parallax]')
      parallaxElements.forEach((el) => {
        const speed = parseFloat(el.getAttribute('data-parallax-speed') || el.getAttribute('data-speed') || '0.15')
        gsap.to(el, {
          y: () => -80 * speed,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      })

      // =========================================================================
      // 5. 3D CARD TILT WITH MOUSE-TRACKING SPECULAR HIGHLIGHT
      // =========================================================================
      if (!isTouch) {
        const tiltCards = containerRef.current.querySelectorAll('[data-tilt], .hero-feature-card, .prereq-card, .mission-card, .arsenal-card, .level-card, .hub-card')
        tiltCards.forEach((card) => {
          // Ensure card has glass reflection overlay element if not present
          let gloss = card.querySelector('.card-gloss-overlay')
          if (!gloss) {
            gloss = document.createElement('div')
            gloss.className = 'card-gloss-overlay'
            card.appendChild(gloss)
          }

          const onMouseMove = (e) => {
            const rect = card.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top
            const centerX = rect.width / 2
            const centerY = rect.height / 2

            const rotateX = ((y - centerY) / centerY) * -8
            const rotateY = ((x - centerX) / centerX) * 8

            gsap.to(card, {
              rotateX,
              rotateY,
              transformPerspective: 1000,
              duration: 0.35,
              ease: 'power2.out',
              overwrite: 'auto',
            })

            // Update gloss shine gradient focal point
            gloss.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.12) 0%, transparent 70%)`
            gloss.style.opacity = '1'
          }

          const onMouseLeave = () => {
            gsap.to(card, {
              rotateX: 0,
              rotateY: 0,
              duration: 0.6,
              ease: 'power3.out',
              overwrite: 'auto',
            })
            gloss.style.opacity = '0'
          }

          card.addEventListener('mousemove', onMouseMove)
          card.addEventListener('mouseleave', onMouseLeave)

          card._tiltCleanup = () => {
            card.removeEventListener('mousemove', onMouseMove)
            card.removeEventListener('mouseleave', onMouseLeave)
          }
        })
      }

      // =========================================================================
      // 6. MAGNETIC BUTTONS ATTRACTION
      // =========================================================================
      if (!isTouch) {
        const magneticBtns = containerRef.current.querySelectorAll('[data-magnetic], .modern-btn-primary, .modern-btn-secondary, .modern-btn-demo')
        magneticBtns.forEach((btn) => {
          const onMouseMove = (e) => {
            const rect = btn.getBoundingClientRect()
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2
            const deltaX = (e.clientX - centerX) * 0.35
            const deltaY = (e.clientY - centerY) * 0.35

            gsap.to(btn, {
              x: deltaX,
              y: deltaY,
              duration: 0.3,
              ease: 'power2.out',
              overwrite: 'auto',
            })
          }

          const onMouseLeave = () => {
            gsap.to(btn, {
              x: 0,
              y: 0,
              duration: 0.5,
              ease: 'elastic.out(1, 0.4)',
              overwrite: 'auto',
            })
          }

          btn.addEventListener('mousemove', onMouseMove)
          btn.addEventListener('mouseleave', onMouseLeave)

          btn._magneticCleanup = () => {
            btn.removeEventListener('mousemove', onMouseMove)
            btn.removeEventListener('mouseleave', onMouseLeave)
          }
        })
      }

      // =========================================================================
      // 7. SECTION DIVIDER REVEAL
      // =========================================================================
      const dividers = containerRef.current.querySelectorAll('.section-divider')
      dividers.forEach((divider) => {
        gsap.fromTo(
          divider,
          { scaleX: 0, opacity: 0 },
          {
            scaleX: 1,
            opacity: 1,
            duration: 1.1,
            ease: 'power3.inOut',
            scrollTrigger: {
              trigger: divider,
              start: 'top 92%',
              once: true,
            },
          }
        )
      })
    }, containerRef)

    return () => {
      if (containerRef.current) {
        const tiltCards = containerRef.current.querySelectorAll('[data-tilt], .hero-feature-card, .prereq-card, .mission-card, .arsenal-card, .level-card, .hub-card')
        tiltCards.forEach((c) => c._tiltCleanup && c._tiltCleanup())

        const magneticBtns = containerRef.current.querySelectorAll('[data-magnetic], .modern-btn-primary, .modern-btn-secondary, .modern-btn-demo')
        magneticBtns.forEach((b) => b._magneticCleanup && b._magneticCleanup())
      }
      ctx.revert()
    }
  }, dependencies)
}
