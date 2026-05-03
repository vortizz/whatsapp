import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePageStore, Pages } from '../../store/page'

describe('usePageStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('should default to CHATS page', () => {
      const store = usePageStore()
      expect(store.currentPage).toBe(Pages.CHATS)
    })
  })

  describe('setPage', () => {
    it('should set the current page to SETTINGS', () => {
      const store = usePageStore()
      store.setPage(Pages.SETTINGS)
      expect(store.currentPage).toBe(Pages.SETTINGS)
    })

    it('should set the current page to PROFILE', () => {
      const store = usePageStore()
      store.setPage(Pages.PROFILE)
      expect(store.currentPage).toBe(Pages.PROFILE)
    })
  })

  describe('resetPage', () => {
    it('should reset back to CHATS', () => {
      const store = usePageStore()
      store.setPage(Pages.SETTINGS)
      store.resetPage()
      expect(store.currentPage).toBe(Pages.CHATS)
    })
  })
})
