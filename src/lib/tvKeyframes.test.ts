import { describe, expect, it } from 'vitest';
import { offFrames, onFrames, reducedFrames, TV_REDUCED_MS, type TvFrames } from './tvKeyframes';

// These tests guard the END STATES, not the numbers. The look is decided (H28) and its numbers
// are placeholders to tune by eye. What must never change: the turn-off ends on pure black (H25)
// and the turn-on leaves the natural picture behind.

const parts = (f: TvFrames) => [f.pic, f.noise, f.line, f.dot];
const last = (k: Keyframe[]) => k[k.length - 1]!;

describe('keyframes', () => {
  it('every list runs from offset 0 to offset 1 without going backwards', () => {
    for (const frames of [offFrames(), onFrames()]) {
      for (const list of parts(frames)) {
        expect(list[0]!.offset).toBe(0);
        expect(last(list).offset).toBe(1);
        for (let i = 1; i < list.length; i++) {
          expect(list[i]!.offset!).toBeGreaterThanOrEqual(list[i - 1]!.offset!);
        }
      }
    }
  });

  it('the turn-off ends on pure black: the picture and every effect are invisible', () => {
    const f = offFrames();
    for (const list of parts(f)) expect(last(list).opacity).toBe(0);
  });

  it('the turn-on ends on the natural picture and no effect is left visible', () => {
    const f = onFrames();
    expect(last(f.pic)).toMatchObject({ transform: 'scale(1,1)', filter: 'brightness(1)', opacity: 1 });
    expect(last(f.noise).opacity).toBe(0);
    expect(last(f.line).opacity).toBe(0);
    expect(last(f.dot).opacity).toBe(0);
  });

  it('the turn-on starts where the turn-off ended: invisible picture', () => {
    expect(onFrames().pic[0]!.opacity).toBe(0);
  });

  it('reduced motion: only the picture, a plain fade, still ending on black or on the picture', () => {
    const off = reducedFrames('off');
    const on = reducedFrames('on');
    expect(off.noise).toEqual([]);
    expect(off.line).toEqual([]);
    expect(off.dot).toEqual([]);
    expect(last(off.pic).opacity).toBe(0);
    expect(last(on.pic).opacity).toBe(1);
    expect(TV_REDUCED_MS).toBeLessThanOrEqual(500);
  });
});
