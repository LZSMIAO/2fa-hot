export const singleGuideTimeline = {
  verificationAt: 9300,
  movements: [
    { at: 0, target: 'tutorial-copy-secret' },
    { at: 3600, target: 'secret' },
    { at: 6400, target: 'tutorial-copy-code' },
    { at: 10000, target: 'tutorial-login-code' },
    { at: 11800, target: 'tutorial-submit' }
  ],
  duration: 14200,
  phases: [2100, 5100, 7700, 11100, 12800],
  steps: [0, 5100, 11100, 12800] as const,
  narrationBoundaries: [5100, 9300, 12800, 14200]
}
