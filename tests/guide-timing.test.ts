import assert from 'node:assert/strict'
import test from 'node:test'
import { advanceGuideTime } from '../app/utils/guide-timing.ts'

test('narration allows actions inside the step but waits before the next step', () => {
  assert.equal(advanceGuideTime(100, 50, [300, 600], true), 150)
  assert.equal(advanceGuideTime(280, 50, [300, 600], true), 299.99)
  assert.equal(advanceGuideTime(299.99, 50, [300, 600], true), 299.99)
  assert.ok(advanceGuideTime(299.99, 50, [300, 600], false) > 300)
})
test('completion waits for final narration, and disabled narration runs freely', () => {
  assert.equal(advanceGuideTime(590, 50, [300, 600], true), 599.99)
  assert.equal(advanceGuideTime(590, 50, [300, 600], false), 640)
})
