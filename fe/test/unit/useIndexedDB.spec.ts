import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useIndexedDB } from '../../composables/useIndexedDB'

const mockStore = new Map<string, string>()

const mockObjectStore = {
  put: vi.fn((value, key) => {
    const request: any = {}
    setTimeout(() => {
      mockStore.set(key, value)
      request.onsuccess?.()
    }, 0)
    return request
  }),
  get: vi.fn((key) => {
    const request: any = { result: undefined }
    setTimeout(() => {
      request.result = mockStore.get(key)
      request.onsuccess?.()
    }, 0)
    return request
  }),
}

const mockDB: any = {
  transaction: vi.fn(() => ({ objectStore: vi.fn(() => mockObjectStore) })),
  objectStoreNames: { contains: vi.fn(() => true) },
  createObjectStore: vi.fn(),
}

vi.stubGlobal('indexedDB', {
  open: vi.fn(() => {
    const request: any = { result: mockDB }
    setTimeout(() => request.onsuccess?.(), 0)
    return request
  }),
  deleteDatabase: vi.fn(() => {
    const request: any = {}
    setTimeout(() => {
      mockStore.clear()
      request.onsuccess?.()
    }, 0)
    return request
  }),
})

describe('useIndexedDB', () => {
  const { saveKey, getKey, deleteDB } = useIndexedDB()

  beforeEach(() => {
    mockStore.clear()
    vi.clearAllMocks()
    mockDB.transaction.mockImplementation(() => ({ objectStore: vi.fn(() => mockObjectStore) }))
  })

  describe('saveKey / getKey', () => {
    it('should save and retrieve a key', async () => {
      await saveKey('user-1', 'privateKey', 'my-private-key')
      const result = await getKey('user-1', 'privateKey')
      expect(result).toBe('my-private-key')
    })

    it('should return undefined for a key that does not exist', async () => {
      const result = await getKey('user-1', 'nonexistent')
      expect(result).toBeUndefined()
    })

    it('should overwrite an existing key', async () => {
      await saveKey('user-1', 'privateKey', 'old-value')
      await saveKey('user-1', 'privateKey', 'new-value')
      const result = await getKey('user-1', 'privateKey')
      expect(result).toBe('new-value')
    })

    it('should store multiple keys independently', async () => {
      await saveKey('user-1', 'privateKey', 'private-value')
      await saveKey('user-1', 'publicKey', 'public-value')
      expect(await getKey('user-1', 'privateKey')).toBe('private-value')
      expect(await getKey('user-1', 'publicKey')).toBe('public-value')
    })
  })

  describe('deleteDB', () => {
    it('should clear all stored keys', async () => {
      await saveKey('user-1', 'privateKey', 'some-value')
      await deleteDB('user-1')
      const result = await getKey('user-1', 'privateKey')
      expect(result).toBeUndefined()
    })
  })
})
