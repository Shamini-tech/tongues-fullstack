// Import React hooks for managing state, lifecycle side-effects, and persistent values
import { useState, useEffect, useRef } from 'react';
// Import language arrays from our central configuration file
import { LANGUAGES, QUICK } from './languages';
// Import custom styling rules
import './App.css';

export default function App() {
  // State 1: Input text typed or spoken by the user
  const [sourceText, setSourceText] = useState('');
  // State 2: Output translation string returned from backend
  const [outputText, setOutputText] = useState('');
  // State 3: Selected source language ('auto' or language name)
  const [sourceLang, setSourceLang] = useState('auto');
  // State 4: Selected target language (e.g., 'Spanish')
  const [targetLang, setTargetLang] = useState('Spanish');
  // State 5: Boolean flag indicating if an API call is actively in progress
  const [isTranslating, setIsTranslating] = useState(false);
  // State 6: Boolean flag indicating if microphone recording is active
  const [isRecording, setIsRecording] = useState(false);
  // Maximum character limit permitted in input box
  const MAX_CHARS = 2000;
  // useRef sequence counter to track request order and solve race conditions
  const translateSeq = useRef(0);

  // Helper function: Find matching language object by name, or return null
  const getLang = (name) => LANGUAGES.find(l => l.name === name) || null;

  // React useEffect Hook: Handles automatic translation triggering and debouncing
  useEffect(() => {
    // If text box is empty or only whitespace, clear output and skip API call
    if (!sourceText.trim()) {
      setOutputText('');
      return;
    }

    // DEBOUNCE: Delay API call by 500ms so we don't send requests on every single keystroke
    const timer = setTimeout(async () => {
      setIsTranslating(true);
      // Increment sequence counter for every new translation request
      const currentSeq = ++translateSeq.current;

      // Extract ISO language codes for backend parameters
      const srcCode = sourceLang === 'auto' ? 'auto' : (getLang(sourceLang)?.tr || 'auto');
      const tgtCode = getLang(targetLang)?.tr || 'es';

      try {
        // Send POST request to our Node.js Express backend proxy on port 5000
        const res = await fetch('http://localhost:5000/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: sourceText, sourceCode: srcCode, targetCode: tgtCode })
        });

        const data = await res.json();
        
        // RACE CONDITION GUARD: If a newer request was sent while this one was fetching, ignore stale data
        if (currentSeq !== translateSeq.current) return;

        // Update translation output state if data is returned
        if (data.translated) {
          setOutputText(data.translated);
        }
      } catch (err) {
        console.error('Translation error:', err);
      } finally {
        // Only turn off loading indicator if this is still the active sequence
        if (currentSeq === translateSeq.current) setIsTranslating(false);
      }
    }, 500);

    // CLEANUP FUNCTION: Cancels pending timer if sourceText/sourceLang/targetLang changes before 500ms
    return () => clearTimeout(timer);
  }, [sourceText, sourceLang, targetLang]);

  // Handler: Swaps source and target language selections and text values
  const handleSwap = () => {
    if (sourceLang === 'auto') return; // Cannot swap if source is set to auto-detect
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(outputText);
  };

  // Handler: Copies translated text to clipboard using Web Clipboard API
  const handleCopy = async () => {
    if (outputText) await navigator.clipboard.writeText(outputText);
  };

  // Handler: Pronounces translated output text using Web SpeechSynthesis API
  const handleSpeak = () => {
    if (!outputText || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop any active speech
    const utter = new SpeechSynthesisUtterance(outputText); // Create speech instance
    const langObj = getLang(targetLang);
    if (langObj?.speech) utter.lang = langObj.speech; // Assign speech locale code (e.g., 'es-ES')
    window.speechSynthesis.speak(utter); // Speak text aloud
  };

  // Handler: Captures microphone input using Web SpeechRecognition API
  const handleMic = () => {
    const SpeechCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechCtor) return alert('Speech recognition not supported in this browser.');

    const recognizer = new SpeechCtor(); // Initialize recognition instance
    const langObj = getLang(sourceLang);
    recognizer.lang = langObj?.speech || 'en-US'; // Set recognition language

    recognizer.onstart = () => setIsRecording(true); // Turn on recording state/ui
    recognizer.onend = () => setIsRecording(false); // Turn off recording state/ui
    recognizer.onresult = (e) => {
      // Concatenate spoken audio result chunks into text transcript
      const transcript = Array.from(e.results).map(res => res[0].transcript).join('');
      setSourceText(prev => (prev + ' ' + transcript).trim().slice(0, MAX_CHARS));
    };

    recognizer.start(); // Open browser microphone listening mode
  };

  return (
    <div className="app-wrapper">
      {/* Header section with brand logo and slogan */}
      <header>
        <div className="brand">
          <div className="logo-icon">谷</div>
          <h1>Tongues</h1>
        </div>
        <div className="tagline">
          Type it, say it, understand it — in any language.
        </div>
      </header>

      {/* Main 3-column translation grid layout */}
      <div className="translator-grid">
        {/* LEFT COLUMN: Input controls & textarea */}
        <div className="column">
          <select 
            className="dropdown-select" 
            value={sourceLang} 
            onChange={(e) => setSourceLang(e.target.value)}
          >
            <option value="auto">Detect language</option>
            {LANGUAGES.map(l => (
              <option key={l.name} value={l.name}>{l.name} — {l.native}</option>
            ))}
          </select>

          <div className="panel">
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value.slice(0, MAX_CHARS))}
              placeholder="Type here, or tap the microphone to speak…"
            />
            <div className="panel-footer">
              <button className="icon-btn" onClick={handleMic} style={{ color: isRecording ? '#ef4444' : '' }}>
                🎤
              </button>
              <span>{sourceText.length} / {MAX_CHARS}</span>
              <button className="icon-btn" onClick={() => setSourceText('')}>🗑️</button>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: Swap language button */}
        <button className="swap-btn" onClick={handleSwap} disabled={sourceLang === 'auto'}>
          ⇆
        </button>

        {/* RIGHT COLUMN: Output controls & translated text */}
        <div className="column">
          <select 
            className="dropdown-select" 
            value={targetLang} 
            onChange={(e) => setTargetLang(e.target.value)}
          >
            {LANGUAGES.map(l => (
              <option key={l.name} value={l.name}>{l.name} — {l.native}</option>
            ))}
          </select>

          <div className="panel">
            <div className="output-content">
              {isTranslating ? (
                <span className="placeholder-text">Translating…</span>
              ) : outputText ? (
                outputText
              ) : (
                <span className="placeholder-text">Your translation will appear here.</span>
              )}
            </div>
            <div className="panel-footer">
              <button className="icon-btn" onClick={handleSpeak} disabled={!outputText}>🔊</button>
              <button className="icon-btn" onClick={handleCopy} disabled={!outputText}>📋</button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick selection chips section */}
      <div className="quick-section">
        <h3>Quick languages</h3>
        <div className="quick-chips">
          {QUICK.map(name => (
            <button
              key={name}
              className={`chip ${targetLang === name ? 'active' : ''}`}
              onClick={() => setTargetLang(name)}
            >
              {name.replace(' (Simplified)', '')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}