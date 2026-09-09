import test from 'node:test'
import assert from 'node:assert/strict'
import { encode, random } from '../src/encoding.js'
const local = {},
  session = {}
let listener,
  frame = { documentId: 'document-1', url: 'https://example.com/account' }
const area = (values) => ({
  setAccessLevel: async () => {},
  get: async (name) => (name ? { [name]: values[name] } : structuredClone(values)),
  set: async (value) => Object.assign(values, structuredClone(value)),
  remove: async (name) => {
    delete values[name]
  }
})
globalThis.chrome = {
  runtime: {
    id: 'test-extension',
    getURL: (p) => `chrome-extension://test-extension/${p}`,
    onMessage: { addListener: (fn) => (listener = fn) },
    openOptionsPage: async () => {}
  },
  storage: { local: area(local), session: area(session) },
  windows: {
    create: async () => ({ id: 42 }),
    remove: async () => {},
    onRemoved: { addListener() {} }
  },
  webNavigation: { getFrame: async () => frame },
  action: { onClicked: { addListener() {} } },
  alarms: { create() {}, onAlarm: { addListener() {} } }
}
await import('../src/background.js')
const ui = { id: 'test-extension', url: 'chrome-extension://test-extension/ui.html' }
const website = {
  id: 'test-extension',
  url: frame.url,
  origin: 'https://example.com',
  tab: { id: 1 },
  frameId: 0,
  documentId: 'document-1'
}
const request = () => ({
  action: 'begin',
  kind: 'create',
  options: {
    challenge: encode(random(32)),
    rp: { id: 'example.com', name: 'Example' },
    user: { id: encode(random(16)), name: 'test', displayName: 'Test' },
    pubKeyCredParams: [{ alg: -7, type: 'public-key' }]
  }
})
const send = (data, sender = ui) => new Promise((resolve) => listener(data, sender, resolve))
test('background rejects content-script management and trusts browser origin/document over request fields', async () => {
  assert.equal((await send({ action: 'setup', password: 'background-test-password' })).ok, true)
  for (const action of ['list', 'export', 'remove', 'password', 'import', 'approve', 'setup']) {
    const response = await send({ action, password: 'background-test-password' }, website)
    assert.equal(response.ok, false, action)
  }
  const unsafe = request()
  unsafe.options.rp.id = 'evil.com'
  unsafe.options.origin = 'https://evil.com'
  assert.equal((await send(unsafe, website)).fallback, true)
  assert.equal((await send(request(), { ...website, frameId: 1 })).fallback, true)
  const begin = await send(request(), website)
  assert.ok(begin.token)
  const foreignPoll = await send(
    { action: 'poll', token: begin.token },
    { ...website, documentId: 'different-document' }
  )
  assert.ok(foreignPoll.result.error)
  assert.equal((await send(request(), website)).fallback, true, 'one active request at a time')
  frame = { ...frame, documentId: 'document-2' }
  const approve = await send({
    action: 'approve',
    token: begin.token,
    password: 'background-test-password'
  })
  assert.equal(approve.ok, false)
  assert.match(approve.error, /来源网站/)
  const records = await send({ action: 'list', password: 'background-test-password' })
  assert.equal(records.records.length, 0)
  const cancelled = await send({ action: 'cancel', token: begin.token }, website)
  assert.equal(cancelled.ok, true)
  assert.equal(
    (await send({ action: 'poll', token: begin.token }, website)).result.error,
    '请求已取消。'
  )
  assert.equal(JSON.stringify({ local, session }).includes('background-test-password'), false)
})
