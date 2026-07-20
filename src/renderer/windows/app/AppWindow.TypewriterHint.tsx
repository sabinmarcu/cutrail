import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  cursor,
  text,
  wrapper,
} from './AppWindow.TypewriterHint.css';

const READ_TIME_MULTIPLIER = 1.5;
const WORDS_PER_MINUTE = 210;
const TYPE_SPEED_MS = 36;
const DELETE_SPEED_MS = 22;

const PHRASES = [
  'Open a source video to begin editing clips.',
  'Or drop a video file here.',
  'Set your default trim accuracy in Options.',
  'Choose which window opens first in Options.',
];

const readingDurationMs = (phrase: string): number => {
  const words = phrase.trim().split(/\s+/).filter((word) => word.length > 0).length;

  if (words === 0) {
    return 1200;
  }

  const baseMs = (words / WORDS_PER_MINUTE) * 60_000;

  return Math.max(1200, Math.round(baseMs * READ_TIME_MULTIPLIER));
};

type Stage = 'typing' | 'holding' | 'deleting';

const pickNextIndex = (currentIndex: number, max: number): number => {
  if (max <= 1) {
    return 0;
  }

  let next = currentIndex;

  while (next === currentIndex) {
    next = Math.floor(Math.random() * max);
  }

  return next;
};

export const AppWindowTypewriterHint = () => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [visibleLength, setVisibleLength] = useState(0);
  const [stage, setStage] = useState<Stage>('typing');
  const phrase = PHRASES[phraseIndex] ?? '';
  const holdDuration = useMemo(() => readingDurationMs(phrase), [phrase]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (stage === 'typing') {
      if (visibleLength >= phrase.length) {
        setStage('holding');
      } else {
        const timeoutId = globalThis.setTimeout(() => {
          setVisibleLength((currentLength) => Math.min(currentLength + 1, phrase.length));
        }, TYPE_SPEED_MS);

        cleanup = () => {
          globalThis.clearTimeout(timeoutId);
        };
      }
    } else if (stage === 'holding') {
      const timeoutId = globalThis.setTimeout(() => {
        setStage('deleting');
      }, holdDuration);

      cleanup = () => {
        globalThis.clearTimeout(timeoutId);
      };
    } else if (visibleLength <= 0) {
      setPhraseIndex((currentIndex) => pickNextIndex(currentIndex, PHRASES.length));
      setStage('typing');
    } else {
      const timeoutId = globalThis.setTimeout(() => {
        setVisibleLength((currentLength) => Math.max(currentLength - 1, 0));
      }, DELETE_SPEED_MS);

      cleanup = () => {
        globalThis.clearTimeout(timeoutId);
      };
    }

    return cleanup;
  }, [holdDuration, phrase, stage, visibleLength]);

  return (
    <section className={wrapper} aria-live="polite">
      <p className={text}>
        {phrase.slice(0, visibleLength)}
        <span className={cursor} aria-hidden="true">|</span>
      </p>
    </section>
  );
};
