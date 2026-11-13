// AB:GUIDE.TV-ENGINE:START
// Plays the TV turn-off and turn-on on four elements. No React in here.
// What changed from tv_turn_animation.html (the approved preview), and why:
//  - after the turn-on every animation is cancelled, so the picture keeps no leftover
//    transform or filter (a leftover would turn the picture into a box that traps
//    fixed-position children);
//  - the picture is `inert` while the TV is off or changing, so nothing behind the black can be tapped or focused;
//  - a press during a run is not this file's job (the caller keeps a busy flag);
//    but a new call always cleanly replaces an old one, and an old run never finishes by itself;
//  - reduced motion swaps the whole show for a plain fade (18c point 9).
import { offFrames, onFrames, reducedFrames, TV_REDUCED_MS, type TvFrames } from './tvKeyframes';

export type TvParts = {
  pic: HTMLElement;
  noise: HTMLCanvasElement;
  line: HTMLElement;
  dot: HTMLElement;
};

export type TvEngine = {
  /** Plays the turn-off. Resolves when the screen is pure black. The black is HELD until turnOn or cancel. */
  turnOff: (ms: number) => Promise<void>;
  /** Plays the turn-on. Resolves when the picture is back and every effect has been removed. */
  turnOn: (ms: number) => Promise<void>;
  /** Stops everything at once and shows the natural picture. Safe at any time, also when the screen goes away. */
  cancel: () => void;
};

export function createTvEngine(parts: TvParts, prefersReducedMotion: () => boolean): TvEngine {
  const { pic, noise, line, dot } = parts;
  const ctx = noise.getContext('2d');
  let anims: Animation[] = [];
  let raf = 0;
  let run = 0; // goes up on every stop, so a stopped run can tell it was stopped

  function drawNoise(): void {
    if (!ctx) return;
    const img = ctx.createImageData(noise.width, noise.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * 255;
      d[i] = v;
      d[i + 1] = v;
      d[i + 2] = v;
      d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }

  function noiseOn(): void {
    cancelAnimationFrame(raf);
    const f = (): void => {
      drawNoise();
      raf = requestAnimationFrame(f);
    };
    f();
  }

  function noiseOff(): void {
    cancelAnimationFrame(raf);
  }

  function halt(): void {
    run += 1;
    anims.forEach((a) => a.cancel());
    anims = [];
    noiseOff();
  }

  function play(el: HTMLElement, frames: Keyframe[], ms: number): void {
    if (frames.length === 0) return;
    anims.push(el.animate(frames, { duration: ms, fill: 'forwards', easing: 'linear' }));
  }

  /** true when the run reached its end, false when something stopped it first */
  async function runFrames(frames: TvFrames, ms: number, withNoise: boolean): Promise<boolean> {
    halt(); // cancel and start in one go: no frame is painted in between, so nothing flashes
    const me = run;
    pic.setAttribute('inert', '');
    pic.style.willChange = 'transform, filter, opacity';
    if (withNoise) noiseOn();
    play(pic, frames.pic, ms);
    play(noise, frames.noise, ms);
    play(line, frames.line, ms);
    play(dot, frames.dot, ms);
    const mine = anims.map((a) => a.finished);
    try {
      await Promise.all(mine);
    } catch {
      return false; // cancelled by a newer call or by cancel()
    }
    if (me !== run) return false;
    noiseOff();
    return true;
  }

  /** back to the natural picture: no animation, no leftover style */
  function release(): void {
    halt();
    pic.removeAttribute('inert');
    pic.style.willChange = '';
  }

  async function turnOff(ms: number): Promise<void> {
    const reduced = prefersReducedMotion();
    await runFrames(reduced ? reducedFrames('off') : offFrames(), reduced ? TV_REDUCED_MS : ms, !reduced);
    // Not released on purpose: the last frame (pure black) is held until turnOn or cancel.
  }

  async function turnOn(ms: number): Promise<void> {
    const reduced = prefersReducedMotion();
    const finished = await runFrames(reduced ? reducedFrames('on') : onFrames(), reduced ? TV_REDUCED_MS : ms, !reduced);
    if (finished) release(); // the last frame equals the natural picture, so nothing jumps
  }

  return { turnOff, turnOn, cancel: release };
}
// AB:GUIDE.TV-ENGINE:END
