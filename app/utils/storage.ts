import type { Envelope } from './vault-crypto.ts'
export interface PlainEnvelope {
  version: 2
  protection: 'none'
  data: unknown
  revision: string
  enabled: boolean
}
export type StoredEnvelope = Envelope | PlainEnvelope
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open('2fa-hot', 1)
    r.onupgradeneeded = () => r.result.createObjectStore('vault')
    r.onsuccess = () => resolve(r.result)
    r.onerror = () => reject(new Error('无法访问本地存储，请检查浏览器设置。'))
    r.onblocked = () => reject(new Error('本地存储被其他页面占用。'))
  })
}
export async function readEnvelope(): Promise<StoredEnvelope | undefined> {
  const db = await database()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('vault'),
      r = tx.objectStore('vault').get('data')
    r.onsuccess = () => resolve(r.result)
    tx.oncomplete = () => db.close()
    tx.onerror = () => {
      db.close()
      reject(new Error('无法读取本地历史。'))
    }
  })
}
export async function writeEnvelope(
  next: StoredEnvelope | undefined,
  expected?: string
): Promise<void> {
  const db = await database()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('vault', 'readwrite'),
      store = tx.objectStore('vault'),
      r = store.get('data')
    let conflict = false
    r.onsuccess = () => {
      if (r.result?.revision !== expected) {
        conflict = true
        tx.abort()
        return
      }
      if (next) store.put(next, 'data')
      else store.delete('data')
    }
    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onabort = tx.onerror = () => {
      db.close()
      reject(
        new Error(
          conflict ? '历史已在其他页面更新，请重新解锁后操作。' : '本地保存失败，可能是空间不足。'
        )
      )
    }
  })
}
