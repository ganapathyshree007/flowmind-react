import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './VoiceButton.module.css';

/**
 * VoiceButton — Web Speech API – speech to text
 *
 * Props:
 *  onResult(text)   — called with the finalised transcript (appended to existing)
 *  onToast(msg)     — called with error / info messages
 *  currentValue     — the current textarea value (so we can append, not replace)
 */
export default function VoiceButton({ onResult, onToast, currentValue = '' }) {
  const [listening,  setListening]  = useState(false);
  const [interim,    setInterim]    = useState('');   // live partial words
  const [supported,  setSupported]  = useState(true);
  const recRef       = useRef(null);
  const finalBuffer  = useRef('');  // accumulates confirmed words this session

  // Check browser support once on mount
  useEffect(() => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setSupported(false);
    }
  }, []);

  const stopRecognition = useCallback(() => {
    if (recRef.current) {
      recRef.current.stop();
      recRef.current = null;
    }
  }, []);

  const startRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    finalBuffer.current = '';      // fresh per session
    const rec = new SR();
    rec.lang            = 'en-IN';
    rec.continuous      = true;    // keep listening until user presses stop
    rec.interimResults  = true;    // show words as they're spoken
    rec.maxAlternatives = 1;

    rec.onstart = () => setListening(true);

    rec.onresult = (e) => {
      let interimText = '';
      let finalText   = '';

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalText += transcript + ' ';
        } else {
          interimText += transcript;
        }
      }

      if (finalText) {
        finalBuffer.current += finalText;
        // Append to whatever is already in the textarea
        const separator = currentValue && !currentValue.endsWith(' ') ? ' ' : '';
        onResult(currentValue + separator + finalBuffer.current.trim());
      }
      setInterim(interimText);
    };

    rec.onerror = (e) => {
      const msgs = {
        'not-allowed'     : '🎙️ Mic access denied. Allow it in your browser settings.',
        'no-speech'       : '🤫 No speech detected. Try again.',
        'audio-capture'   : '🎤 No microphone found.',
        'network'         : '🌐 Network error during speech recognition.',
        'aborted'         : null,   // user stopped manually, no toast needed
      };
      const msg = msgs[e.error] ?? `❌ Speech error: ${e.error}`;
      if (msg) onToast(msg);
      setListening(false);
      setInterim('');
      recRef.current = null;
    };

    rec.onend = () => {
      setListening(false);
      setInterim('');
      recRef.current = null;
    };

    recRef.current = rec;
    rec.start();
  }, [currentValue, onResult, onToast]);

  const toggle = () => {
    if (!supported) {
      onToast('❌ Speech recognition not supported. Please use Chrome or Edge.');
      return;
    }
    if (listening) {
      stopRecognition();
    } else {
      startRecognition();
    }
  };

  // Clean up on unmount
  useEffect(() => () => stopRecognition(), [stopRecognition]);

  return (
    <div className={styles.wrapper}>
      <button
        className={`${styles.btn} ${listening ? styles.listening : ''} ${!supported ? styles.unsupported : ''}`}
        onClick={toggle}
        title={
          !supported
            ? 'Voice input not supported in this browser (use Chrome/Edge)'
            : listening
            ? 'Click to stop recording'
            : 'Click to start voice input'
        }
        type="button"
        aria-label={listening ? 'Stop recording' : 'Start voice input'}
      >
        {/* Ripple rings shown while listening */}
        {listening && (
          <>
            <span className={styles.ring1} />
            <span className={styles.ring2} />
          </>
        )}

        {/* Mic SVG */}
        <svg
          className={styles.icon}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          {listening ? (
            /* "Stop" square icon when recording */
            <rect x="6" y="6" width="12" height="12" rx="2" />
          ) : (
            /* Mic icon when idle */
            <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm6 10a1 1 0 0 1 2 0 8 8 0 0 1-7 7.94V21h2a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2h2v-2.06A8 8 0 0 1 4 11a1 1 0 0 1 2 0 6 6 0 0 0 12 0z" />
          )}
        </svg>
      </button>

      {/* Live transcript bubble */}
      {listening && (
        <div className={styles.bubble}>
          <span className={styles.recDot} />
          <span className={styles.bubbleText}>
            {interim
              ? <span className={styles.interim}>{interim}</span>
              : <span className={styles.waiting}>Listening…</span>
            }
          </span>
        </div>
      )}
    </div>
  );
}
