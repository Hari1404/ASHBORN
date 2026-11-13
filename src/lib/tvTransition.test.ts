import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTvEngine, type TvParts } from './tvTransition';
import { TV_REDUCED_MS } from './tvKeyframes';

// A pretend browser: elements that record their animations, and animations we finish by hand.
class FakeAnim {
  settled = false;
  canceled = false;
  finished: Promise<FakeAnim>;
  private resolve!: (a: FakeAnim) => void;
  private reject!: (e: Error) => void;
  frames: Keyframe[];
  options: KeyframeAnimationOptions;
  constructor(frames: Keyframe[], options: KeyframeAnimationOptions) {
    this.frames = frames;
    this.options = options;
    this.finished = new Promise((res, rej) => {
      this.resolve = res;
      this.reject = rej;
    });
    this.finished.catch(() => {}); // a cancelled run is normal, not an error
  }
  finish(): void {
    if (this.settled) return;
    this.settled = true;
    this.resolve(this);
  }
  cancel(): void {
    // like the real thing: cancelling removes the effect even after the animation has finished,
    // and only a run that is still going is rejected
    this.canceled = true;
    if (this.settled) return;
    this.settled = true;
    this.reject(new Error('AbortError'));
  }
}

function fakeEl() {
  const anims: FakeAnim[] = [];
  const attrs = new Set<string>();
  return {
    anims,
    attrs,
    style: { willChange: '' },
    width: 192,
    height: 108,
    animate(frames: Keyframe[], options: KeyframeAnimationOptions) {
      const a = new FakeAnim(frames, options);
      anims.push(a);
      return a;
    },
    setAttribute(n: string) {
      attrs.add(n);
    },
    removeAttribute(n: string) {
      attrs.delete(n);
    },
    getContext() {
      return { createImageData: (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) }), putImageData() {} };
    },
  };
}

function setup(reduced = false) {
  const pic = fakeEl();
  const noise = fakeEl();
  const line = fakeEl();
  const dot = fakeEl();
  const engine = createTvEngine(
    { pic, noise, line, dot } as unknown as TvParts,
    () => reduced,
  );
  const all = [pic, noise, line, dot];
  const live = () => all.flatMap((e) => e.anims).filter((a) => !a.canceled);
  const finishAll = () => all.flatMap((e) => e.anims).forEach((a) => a.finish());
  return { pic, noise, line, dot, engine, all, live, finishAll };
}

let rafOpen = 0;
beforeEach(() => {
  rafOpen = 0;
  vi.stubGlobal('requestAnimationFrame', () => ++rafOpen);
  vi.stubGlobal('cancelAnimationFrame', () => {});
});
afterEach(() => vi.unstubAllGlobals());

describe('turnOff', () => {
  it('starts all four animations, locks the picture, and holds the black when it ends', async () => {
    const t = setup();
    const p = t.engine.turnOff(1000);
    expect(t.all.map((e) => e.anims.length)).toEqual([1, 1, 1, 1]);
    expect(t.pic.attrs.has('inert')).toBe(true);
    expect(t.pic.anims[0]!.options).toMatchObject({ duration: 1000, fill: 'forwards' });
    t.finishAll();
    await p;
    // still held: nothing cancelled, still locked, so the screen stays black
    expect(t.live().length).toBe(4);
    expect(t.pic.attrs.has('inert')).toBe(true);
  });
});

describe('turnOn after turnOff', () => {
  it('replaces the held black, and when it ends leaves the natural picture with nothing left over', async () => {
    const t = setup();
    const off = t.engine.turnOff(1000);
    t.finishAll();
    await off;
    const heldOff = t.all.flatMap((e) => e.anims);
    const on = t.engine.turnOn(1000);
    expect(heldOff.every((a) => a.canceled)).toBe(true); // the black is replaced at once, in the same moment
    expect(t.all.flatMap((e) => e.anims).filter((a) => !a.canceled).length).toBe(4);
    t.finishAll();
    await on;
    expect(t.live().length).toBe(0); // every animation cancelled: the natural picture
    expect(t.pic.attrs.has('inert')).toBe(false);
    expect(t.pic.style.willChange).toBe('');
  });
});

describe('cancel and restart', () => {
  it('cancel in the middle of a turn-off: the promise still ends, and the picture is back to normal', async () => {
    const t = setup();
    const p = t.engine.turnOff(1000);
    t.engine.cancel();
    await p; // must not hang
    expect(t.live().length).toBe(0);
    expect(t.pic.attrs.has('inert')).toBe(false);
  });

  it('a new run replaces an old one, and the old one never releases the new one', async () => {
    const t = setup();
    const first = t.engine.turnOn(1000);
    const second = t.engine.turnOn(1000);
    await first; // the first was stopped by the second
    expect(t.pic.attrs.has('inert')).toBe(true); // the second is still running and still locked
    expect(t.live().length).toBe(4);
    t.finishAll();
    await second;
    expect(t.live().length).toBe(0);
    expect(t.pic.attrs.has('inert')).toBe(false);
  });
});

describe('reduced motion', () => {
  it('turn-off is a short fade of the picture only', async () => {
    const t = setup(true);
    const p = t.engine.turnOff(1000);
    expect(t.pic.anims.length).toBe(1);
    expect([t.noise, t.line, t.dot].every((e) => e.anims.length === 0)).toBe(true);
    expect(t.pic.anims[0]!.options.duration).toBe(TV_REDUCED_MS);
    expect(rafOpen).toBe(0); // no static
    t.finishAll();
    await p;
  });

  it('turn-on is a short fade back, then nothing is left over', async () => {
    const t = setup(true);
    const p = t.engine.turnOn(1000);
    t.finishAll();
    await p;
    expect(t.live().length).toBe(0);
    expect(t.pic.attrs.has('inert')).toBe(false);
  });
});

describe('static', () => {
  it('runs only while the turn-off or turn-on is playing', async () => {
    const t = setup();
    const p = t.engine.turnOff(1000);
    expect(rafOpen).toBeGreaterThan(0); // the static loop started
    t.finishAll();
    await p;
  });
});
