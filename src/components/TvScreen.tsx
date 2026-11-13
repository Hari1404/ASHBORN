// AB:GUIDE.TV-SCREEN:START
// A screen that can turn off and on like an old TV. Whatever is inside is "the picture".
// It covers the whole screen (position: fixed; inset: 0), so it needs no positioned parent.
// A fixed box inside it (such as the Dark Veil box ab-bg) is placed against it, not against the window (CONNECTIONS.md C65).
import { forwardRef, useEffect, useImperativeHandle, useRef, type ReactNode } from 'react';
import { createTvEngine, type TvEngine } from '../lib/tvTransition';
import '../tv.css';

export type TvHandle = {
  /** Resolves when the screen is pure black. The black is held until turnOn. */
  turnOff: (ms: number) => Promise<void>;
  /** Resolves when the picture is back exactly as it was. */
  turnOn: (ms: number) => Promise<void>;
};

type Props = { children: ReactNode };

export const TvScreen = forwardRef<TvHandle, Props>(function TvScreen({ children }, ref) {
  const pic = useRef<HTMLDivElement>(null);
  const noise = useRef<HTMLCanvasElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const engine = useRef<TvEngine | null>(null);

  useEffect(() => {
    if (!pic.current || !noise.current || !line.current || !dot.current) return;
    const query = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    engine.current = createTvEngine(
      { pic: pic.current, noise: noise.current, line: line.current, dot: dot.current },
      () => query?.matches ?? false,
    );
    return () => {
      engine.current?.cancel(); // leaving the screen always leaves a normal picture behind
      engine.current = null;
    };
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      turnOff: (ms) => engine.current?.turnOff(ms) ?? Promise.resolve(),
      turnOn: (ms) => engine.current?.turnOn(ms) ?? Promise.resolve(),
    }),
    [],
  );

  return (
    <div className="tv-stage">
      <div className="tv-pic" ref={pic}>
        {children}
        <canvas className="tv-noise" ref={noise} width={192} height={108} aria-hidden="true" />
      </div>
      <div className="tv-line" ref={line} aria-hidden="true" />
      <div className="tv-dot" ref={dot} aria-hidden="true" />
    </div>
  );
});
// AB:GUIDE.TV-SCREEN:END
