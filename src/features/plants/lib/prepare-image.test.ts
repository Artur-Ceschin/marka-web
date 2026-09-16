import { describe, expect, it } from 'vitest';

import { MAX_EDGE, scaledSize } from './prepare-image';

describe('scaledSize', () => {
  it('shrinks the long edge to the limit and keeps the aspect ratio', () => {
    expect(scaledSize(4032, 3024)).toEqual({ width: MAX_EDGE, height: 1152 });
  });

  it('measures portrait photos by their long edge too', () => {
    expect(scaledSize(3024, 4032)).toEqual({ width: 1152, height: MAX_EDGE });
  });

  it('never enlarges an image that is already small', () => {
    expect(scaledSize(800, 600)).toEqual({ width: 800, height: 600 });
  });
});
