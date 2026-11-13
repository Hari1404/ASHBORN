// AB:GUIDE.TV-FRAMES:START
// The look of the TV turn-off and the TV turn-on.
//
// The look is DECIDED (H28 in DECISIONS_LEARN.md: "looks cool af, lets keep this").
// Every keyframe below is copied from tv_turn_animation.html, the preview Hari approved.
// The numbers are PLACEHOLDERS to tune by eye. The END STATES are not (H25):
//   - the turn-off ends on pure black,
//   - the turn-on ends on the natural picture (nothing left over).

/** Length of the turn-off in ms. PLACEHOLDER (DECISIONS_LEARN.md 18c point 3). */
export const TV_OFF_MS = 1000;
/** Length of the turn-on in ms. PLACEHOLDER (18c point 4). */
export const TV_ON_MS = 1000;
/** Packet T1 only: how long the screen stays black between the two. It stands in for the Oculus trip, which replaces it in T2. PLACEHOLDER. */
export const TV_BLACK_HOLD_MS = 1500;
/** Length of the plain fade used when the person asks for reduced motion. PLACEHOLDER (18c point 9). */
export const TV_REDUCED_MS = 300;

export type TvFrames = {
  pic: Keyframe[];
  noise: Keyframe[];
  line: Keyframe[];
  dot: Keyframe[];
};

const SQUASH = 'scale(1.04,.006)';
const LINE = 'translateY(-50%)';
const DOT = 'translate(-50%,-50%)';

/** Static burst, the picture squashes to a bright line, the line shrinks to a dot, the dot fades, pure black. */
export function offFrames(): TvFrames {
  return {
    pic: [
      { offset: 0, transform: 'scale(1,1)', filter: 'brightness(1)', opacity: 1 },
      { offset: 0.1, transform: 'scale(1,1)', filter: 'brightness(1.5)', opacity: 1, easing: 'cubic-bezier(.6,0,.85,.3)' },
      { offset: 0.46, transform: SQUASH, filter: 'brightness(3)', opacity: 1 },
      { offset: 0.5, transform: SQUASH, filter: 'brightness(3)', opacity: 0 },
      { offset: 1, transform: SQUASH, filter: 'brightness(3)', opacity: 0 },
    ],
    noise: [
      { offset: 0, opacity: 0 },
      { offset: 0.08, opacity: 0.5 },
      { offset: 0.4, opacity: 0.5 },
      { offset: 0.5, opacity: 0 },
      { offset: 1, opacity: 0 },
    ],
    line: [
      { offset: 0, opacity: 0, transform: `${LINE} scaleX(1.04)` },
      { offset: 0.42, opacity: 0, transform: `${LINE} scaleX(1.04)` },
      { offset: 0.48, opacity: 1, transform: `${LINE} scaleX(1.04)`, easing: 'cubic-bezier(.55,0,.9,.35)' },
      { offset: 0.8, opacity: 1, transform: `${LINE} scaleX(.012) scaleY(1.6)` },
      { offset: 0.82, opacity: 0, transform: `${LINE} scaleX(.012) scaleY(1.6)` },
      { offset: 1, opacity: 0, transform: `${LINE} scaleX(.012)` },
    ],
    dot: [
      { offset: 0, opacity: 0, transform: DOT },
      { offset: 0.76, opacity: 0, transform: DOT },
      { offset: 0.8, opacity: 1, transform: `${DOT} scale(1.2)`, easing: 'ease-out' },
      { offset: 0.93, opacity: 0.8, transform: `${DOT} scale(.7)` },
      { offset: 1, opacity: 0, transform: `${DOT} scale(.2)` },
    ],
  };
}

/** The reverse, as a style: a dot, a line that grows, the picture opens, a short static settle. */
export function onFrames(): TvFrames {
  return {
    pic: [
      { offset: 0, transform: SQUASH, filter: 'brightness(3)', opacity: 0 },
      { offset: 0.42, transform: SQUASH, filter: 'brightness(3)', opacity: 0 },
      { offset: 0.46, transform: SQUASH, filter: 'brightness(3)', opacity: 1, easing: 'cubic-bezier(.2,.7,.3,1)' },
      { offset: 0.8, transform: 'scale(1,1)', filter: 'brightness(1.4)', opacity: 1 },
      { offset: 1, transform: 'scale(1,1)', filter: 'brightness(1)', opacity: 1 },
    ],
    noise: [
      { offset: 0, opacity: 0 },
      { offset: 0.5, opacity: 0 },
      { offset: 0.62, opacity: 0.5 },
      { offset: 1, opacity: 0 },
    ],
    dot: [
      { offset: 0, opacity: 0, transform: `${DOT} scale(.2)` },
      { offset: 0.05, opacity: 1, transform: `${DOT} scale(1.2)` },
      { offset: 0.18, opacity: 1, transform: `${DOT} scale(.8)` },
      { offset: 0.22, opacity: 0, transform: `${DOT} scale(.8)` },
      { offset: 1, opacity: 0, transform: DOT },
    ],
    line: [
      { offset: 0, opacity: 0, transform: `${LINE} scaleX(.012) scaleY(1.6)` },
      { offset: 0.16, opacity: 0, transform: `${LINE} scaleX(.012) scaleY(1.6)` },
      { offset: 0.2, opacity: 1, transform: `${LINE} scaleX(.012) scaleY(1.6)`, easing: 'cubic-bezier(.2,.7,.3,1)' },
      { offset: 0.44, opacity: 1, transform: `${LINE} scaleX(1.04)` },
      { offset: 0.56, opacity: 0, transform: `${LINE} scaleX(1.04)` },
      { offset: 1, opacity: 0, transform: `${LINE} scaleX(1.04)` },
    ],
  };
}

/** Reduced motion (18c point 9): only the picture, a plain fade to or from black. No static, no flashing line. */
export function reducedFrames(direction: 'off' | 'on'): TvFrames {
  const pic: Keyframe[] = direction === 'off' ? [{ opacity: 1 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: 1 }];
  return { pic, noise: [], line: [], dot: [] };
}
// AB:GUIDE.TV-FRAMES:END
