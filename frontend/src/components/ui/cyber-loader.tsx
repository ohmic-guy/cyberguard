'use client';

import React, { useEffect, useState } from 'react';

const CYBER_MESSAGES = [
  'INITIALIZING SECURE CHANNEL',
  'LOADING THREAT MATRIX',
  'DECRYPTING PAYLOAD',
  'AUTHENTICATING NODE',
  'SCANNING NETWORK',
  'SYNCING TELEMETRY',
  'ESTABLISHING TUNNEL',
  'COMPILING SIGNATURES',
  'FETCHING INTEL',
  'ACCESSING DATABASE',
];

interface CyberLoaderProps {
  /** Whether the loader is visible */
  show: boolean;
  /** Custom label shown below the flicker text */
  label?: string;
}

/**
 * Full-screen cyber-themed route transition loader.
 * Shows a green flickering-text animation that covers the screen
 * while the next page renders.
 */
export function CyberLoader({ show, label }: CyberLoaderProps) {
  const [visible, setVisible] = useState(show);
  const [opacity, setOpacity] = useState(show ? 1 : 0);
  const [message, setMessage] = useState(CYBER_MESSAGES[0]);
  const [displayText, setDisplayText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [dots, setDots] = useState('');
  const [glitchActive, setGlitchActive] = useState(false);

  // Mount/unmount with fade
  useEffect(() => {
    if (show) {
      setVisible(true);
      setOpacity(1);
      setCharIndex(0);
      setDisplayText('');
      setMessage(CYBER_MESSAGES[Math.floor(Math.random() * CYBER_MESSAGES.length)]);
    } else {
      setOpacity(0);
      const t = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(t);
    }
  }, [show]);

  // Typewriter effect cycling through messages
  useEffect(() => {
    if (!show) return;
    if (charIndex < message.length) {
      const t = setTimeout(() => {
        setDisplayText(message.slice(0, charIndex + 1));
        setCharIndex((c) => c + 1);
      }, 35 + Math.random() * 25);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        const next = CYBER_MESSAGES[Math.floor(Math.random() * CYBER_MESSAGES.length)];
        setMessage(next);
        setCharIndex(0);
        setDisplayText('');
      }, 900);
      return () => clearTimeout(t);
    }
  }, [charIndex, message, show]);

  // Ellipsis animation
  useEffect(() => {
    if (!show) return;
    const t = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 400);
    return () => clearInterval(t);
  }, [show]);

  // Random glitch flicker
  useEffect(() => {
    if (!show) return;
    const glitch = () => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 80 + Math.random() * 120);
    };
    const t = setInterval(glitch, 1200 + Math.random() * 1800);
    return () => clearInterval(t);
  }, [show]);

  if (!visible) return null;

  return (
    <div
      className="cyber-loader-overlay"
      style={{ opacity, transition: 'opacity 0.4s ease' }}
      aria-live="polite"
      aria-label="Loading"
    >
      {/* Animated scanline sweep */}
      <div className="cyber-loader-sweep" />

      {/* Central content */}
      <div className="cyber-loader-body">
        {/* Corner brackets */}
        <div className="cyber-loader-corner cyber-loader-corner--tl" />
        <div className="cyber-loader-corner cyber-loader-corner--tr" />
        <div className="cyber-loader-corner cyber-loader-corner--bl" />
        <div className="cyber-loader-corner cyber-loader-corner--br" />

        {/* Top label */}
        <p className="cyber-loader-sys">SYS://CYBERGUARD.SOC</p>

        {/* Main flickering text */}
        <div
          className={`cyber-loader-text${glitchActive ? ' cyber-loader-glitch' : ''}`}
          data-text={displayText}
        >
          {displayText}
          <span className="cyber-loader-cursor">█</span>
        </div>

        {/* Progress bar */}
        <div className="cyber-loader-bar-wrap">
          <div className="cyber-loader-bar" />
        </div>

        {/* Dots + optional label */}
        <p className="cyber-loader-label">
          {label ? label : 'LOADING'}{dots}
        </p>
      </div>
    </div>
  );
}
