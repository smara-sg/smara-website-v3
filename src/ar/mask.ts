/** Turn background confidence into a soft person matte, retaining every non-background class. */
export function updatePersonAlpha(
  background: Float32Array,
  previous: Float32Array,
  rgba: Uint8ClampedArray,
  firstFrame: boolean,
) {
  for (let pixel = 0; pixel < background.length; pixel++) {
    const person = Math.max(0, Math.min(1, 1 - background[pixel]));
    const old = previous[pixel];
    // Stabilize small confidence fluctuations, but follow moving heads immediately.
    const confidence = firstFrame || Math.abs(person - old) > 0.12
      ? person : person * 0.8 + old * 0.2;
    previous[pixel] = confidence;
    const edge = Math.max(0, Math.min(1, (confidence - 0.22) / 0.56));
    rgba[pixel * 4 + 3] = Math.round(edge * edge * (3 - 2 * edge) * 255);
  }
}

export function inferenceInterval(durationMs: number) {
  return Math.max(1000 / 24, Math.min(180, durationMs * 1.15));
}

/** Never composite malformed GPU readback as an alpha matte. */
export function validateConfidenceMask(background: Float32Array, width: number, height: number) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0
    || background.length !== width * height) throw new Error('Invalid mask dimensions');
  for (const value of background) {
    if (!Number.isFinite(value) || value < -0.001 || value > 1.001) {
      throw new Error('Invalid mask confidence');
    }
  }
}
