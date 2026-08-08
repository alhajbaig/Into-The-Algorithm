import { useRef } from 'react'
import { useCustomCursor } from '../hooks/useCustomCursor'

/**
 * Custom cursor component providing a sleek dot and follower ring.
 * Controlled by GSAP physics in useCustomCursor.
 */
export default function CustomCursor() {
  const dotRef = useRef(null)
  const followerRef = useRef(null)

  useCustomCursor(dotRef, followerRef)

  return (
    <>
      <div ref={dotRef} className="custom-cursor-dot" />
      <div ref={followerRef} className="custom-cursor-follower" />
    </>
  )
}
