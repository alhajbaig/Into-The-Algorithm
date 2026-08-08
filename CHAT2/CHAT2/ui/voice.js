/* ═══════════════════════════════════════════════════
   Voice Input / Output (Web Speech API)
═══════════════════════════════════════════════════ */

window.Voice = (function () {
  let recognition = null;
  let synthesis   = window.speechSynthesis;
  let isListening = false;

  // Setup recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  function init(onResult, onError) {
    if (!SpeechRecognition) {
      console.warn('[Voice] Speech Recognition not supported');
      return false;
    }

    recognition = new SpeechRecognition();
    recognition.continuous      = false;
    recognition.interimResults  = true;
    recognition.lang            = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart  = () => { isListening = true; };
    recognition.onend    = () => {
      isListening = false;
      document.getElementById('btn-voice')?.classList.remove('recording');
    };
    recognition.onerror  = (e) => {
      isListening = false;
      document.getElementById('btn-voice')?.classList.remove('recording');
      if (onError) onError(e.error);
    };
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript)
        .join('');
      if (onResult) onResult(transcript, e.results[0].isFinal);
    };

    return true;
  }

  function startListening() {
    if (!recognition) return false;
    if (isListening) return true;
    recognition.start();
    document.getElementById('btn-voice')?.classList.add('recording');
    return true;
  }

  function stopListening() {
    if (recognition && isListening) recognition.stop();
    document.getElementById('btn-voice')?.classList.remove('recording');
  }

  function speak(text, rate = 0.95, pitch = 1) {
    if (!synthesis) return;
    synthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text.replace(/[#*`]/g, '').slice(0, 500));
    utt.rate  = rate;
    utt.pitch = pitch;
    // Try to find a nice voice
    const voices = synthesis.getVoices();
    const preferred = voices.find(v => v.lang === 'en-US' && v.name.includes('Google'))
                   || voices.find(v => v.lang === 'en-US');
    if (preferred) utt.voice = preferred;
    synthesis.speak(utt);
  }

  function stopSpeaking() {
    synthesis?.cancel();
  }

  return { init, startListening, stopListening, speak, stopSpeaking, isSupported: !!SpeechRecognition };
})();
