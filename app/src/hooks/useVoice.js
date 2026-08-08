import { useCallback, useRef } from 'react'

const SOUND_COMPLETION = '/audio/7_crore.mp3'
const SOUND_CORRECT = '/audio/kya_baat_hai.opus'
const SOUND_WRONG = '/audio/spongebob_fail.mp3'

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
    (audioRef, soundUrl, volume = 0.95) => {
      try {
        if (typeof window === 'undefined') return
        stopActiveAudio()
        const audio = new Audio(soundUrl)
        audio.volume = volume
        audioRef.current = audio
        activeAudioRef.current = audio
        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise.catch((e) => {
            console.warn('Audio playback failure:', e)
          })
        }
      } catch (e) {
        console.warn('Audio playback exception:', e)
      }
    },
    [stopActiveAudio],
  )

  const playCompletionSound = useCallback(() => {
    playSound(completionAudioRef, SOUND_COMPLETION, 0.95)
  }, [playSound])

  const playCorrectSound = useCallback(() => {
    playSound(correctAudioRef, SOUND_CORRECT, 0.9)
  }, [playSound])

  const playWrongSound = useCallback(() => {
    playSound(wrongAudioRef, SOUND_WRONG, 0.9)
  }, [playSound])

  const speak = useCallback(() => {}, [])

  const cheer = useCallback(
    (kind) => {
      if (kind === 'level' || kind === 'pass' || kind === 'perfect') {
        playCompletionSound()
      } else if (kind === 'coding' || kind === 'flash' || kind === 'interview') {
        playCompletionSound()
      } else if (kind === 'fail') {
        playWrongSound()
      }
      return ''
    },
    [playCompletionSound, playWrongSound],
  )

  return {
    speak,
    cheer,
    playCompletionSound,
    playCorrectSound,
    playWrongSound,
  }
}



