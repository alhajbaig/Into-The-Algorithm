import { useCallback, useRef } from 'react'

const SOUND_COMPLETION = '/sounds/7_crore.mp3'
const SOUND_CORRECT = '/sounds/kya_baat_hai.opus'
const SOUND_WRONG = '/sounds/spongebob_fail.mp3'

const LINES = {
  perfect: [
    'Hurray! Perfect score! You are an M L star!',
    'Congratulations! You crushed it! You are an M L star!',
    'Woohoo! Flawless quiz! Keep shining, M L star!',
  ],
  pass: [
    'Hurray! Level cleared! New path unlocked!',
    'Nice work! You cleared the quiz! Keep going!',
    'Congratulations! That was excellent!',
  ],
  fail: [
    'Almost there! Practice makes perfect. Try again!',
    'Do not give up! Review the flashcards and retry!',
  ],
  flash: ['Flash deck complete! Your brain just leveled up!'],
  interview: ['Interview round done! You sound hire ready!'],
  coding: ['Coding challenge solved! You are an M L star!'],
  badge: ['New badge unlocked! Collect them all!'],
  level: ['Level cleared! New path unlocked ahead!'],
}

export function useVoice() {
  const completionAudioRef = useRef(null)
  const correctAudioRef = useRef(null)
  const wrongAudioRef = useRef(null)
  const activeAudioRef = useRef(null)

  const stopActiveAudio = useCallback(() => {
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause()
        activeAudioRef.current.currentTime = 0
      } catch {
        /* ignore */
      }
      activeAudioRef.current = null
    }
  }, [])

  const playSound = useCallback(
    (audioRef, soundUrl, volume = 0.85) => {
      try {
        if (typeof window === 'undefined') return
        stopActiveAudio()
        if (!audioRef.current) {
          audioRef.current = new Audio(soundUrl)
        } else {
          audioRef.current.currentTime = 0
        }
        audioRef.current.volume = volume
        activeAudioRef.current = audioRef.current
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            /* Autoplay policy fallback */
          })
        }
      } catch {
        /* ignore audio error */
      }
    },
    [stopActiveAudio],
  )

  const playCompletionSound = useCallback(() => {
    playSound(completionAudioRef, SOUND_COMPLETION, 0.9)
  }, [playSound])

  const playCorrectSound = useCallback(() => {
    playSound(correctAudioRef, SOUND_CORRECT, 0.85)
  }, [playSound])

  const playWrongSound = useCallback(() => {
    playSound(wrongAudioRef, SOUND_WRONG, 0.85)
  }, [playSound])

  const speak = useCallback(() => {
    // Disabled text-to-speech voice synthesis
  }, [])

  const cheer = useCallback(
    (kind) => {
      if (kind === 'level' || kind === 'pass' || kind === 'perfect') {
        playCompletionSound()
      }
      return ''
    },
    [playCompletionSound],
  )

  return {
    speak,
    cheer,
    playCompletionSound,
    playCorrectSound,
    playWrongSound,
  }
}



