import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speedMs?: number;
  onComplete?: () => void;
  className?: string;
  showCursor?: boolean;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speedMs = 12,
  onComplete,
  className = '',
  showCursor = true
}) => {
  const [displayedLength, setDisplayedLength] = useState<number>(0);
  const [isDone, setIsDone] = useState<boolean>(false);

  useEffect(() => {
    setDisplayedLength(0);
    setIsDone(false);

    if (!text) {
      setIsDone(true);
      if (onComplete) onComplete();
      return;
    }

    let currentIndex = 0;
    // Chunk slightly for longer texts for snappy performance
    const stepSize = text.length > 200 ? 3 : (text.length > 100 ? 2 : 1);
    
    const interval = setInterval(() => {
      currentIndex += stepSize;
      if (currentIndex >= text.length) {
        currentIndex = text.length;
        setDisplayedLength(currentIndex);
        setIsDone(true);
        clearInterval(interval);
        if (onComplete) onComplete();
      } else {
        setDisplayedLength(currentIndex);
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [text, speedMs, onComplete]);

  return (
    <span className={`typewriter-wrapper ${className}`}>
      <span>{text.slice(0, displayedLength)}</span>
      {!isDone && showCursor && (
        <span className="typewriter-cursor">|</span>
      )}
    </span>
  );
};
