/** Finish the current visual step, but don't advance beyond its narration. */
export function advanceGuideTime(
  current: number,
  delta: number,
  boundaries: number[],
  speaking: boolean
) {
  const next = current + Math.max(0, delta)
  const boundary = boundaries.find((at) => at > current)
  return speaking && boundary !== undefined ? Math.min(next, boundary - 0.01) : next
}
