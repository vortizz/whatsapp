const DB_VERSION = 1
const STORE_NAME = 'keys'

export function useIndexedDB() {
  function openDB(userId: string): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(`whatsapp-db-${userId}`, DB_VERSION)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async function saveKey(userId: string, key: string, value: string): Promise<void> {
    const db = await openDB(userId)
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put(value, key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async function getKey(userId: string, key: string): Promise<string | undefined> {
    const db = await openDB(userId)
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async function deleteDB(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(`whatsapp-db-${userId}`)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  return {
    openDB,
    saveKey,
    getKey,
    deleteDB,
  }
}
