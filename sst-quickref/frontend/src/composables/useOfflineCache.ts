/**
 * T037: Cache offline IndexedDB — derniers 50 Q&A
 */

import type { ChatMessage } from '@/types'

const DB_NAME = 'sst-quickref-cache'
const STORE_NAME = 'chat-messages'
const DB_VERSION = 1
const MAX_ENTRIES = 50

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export function useOfflineCache() {
  async function saveToCache(messages: ChatMessage[]): Promise<void> {
    try {
      const db = await openDB()
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)

      // Clear existing entries
      store.clear()

      // Keep only last MAX_ENTRIES (FIFO)
      const toSave = messages.slice(-MAX_ENTRIES)

      for (const msg of toSave) {
        store.put({
          ...msg,
          timestamp: msg.timestamp.toISOString(),
        })
      }

      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })

      db.close()
    } catch {
      // Silently fail — cache is best-effort
    }
  }

  async function loadFromCache(): Promise<ChatMessage[]> {
    try {
      const db = await openDB()
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.getAll()

      const results = await new Promise<ChatMessage[]>((resolve, reject) => {
        request.onsuccess = () => {
          const raw = request.result as Array<Record<string, unknown>>
          const messages: ChatMessage[] = raw.map((r) => ({
            ...r,
            timestamp: new Date(r.timestamp as string),
          })) as unknown as ChatMessage[]
          resolve(messages)
        }
        request.onerror = () => reject(request.error)
      })

      db.close()
      return results
    } catch {
      return []
    }
  }

  async function clearCache(): Promise<void> {
    try {
      const db = await openDB()
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).clear()
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })
      db.close()
    } catch {
      // Silently fail
    }
  }

  return { saveToCache, loadFromCache, clearCache }
}
