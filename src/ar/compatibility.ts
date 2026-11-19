/** iPadOS can identify itself as macOS; include its touch capability. */
export function needsMobileMaskCompatibility(device: { userAgent: string; maxTouchPoints: number }) {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(device.userAgent)
    || (/Macintosh|MacIntel/i.test(device.userAgent) && device.maxTouchPoints > 1);
}

/** Edge on Android needs byte masks; retain the working confidence path in Chrome. */
export function needsByteMaskCompatibility(device: { userAgent: string }) {
  return /Android/i.test(device.userAgent) && /(?:EdgA?|Edge)\//i.test(device.userAgent);
}
