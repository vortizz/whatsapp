import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMessageSelectionStore } from '../../store/messageSelection'

describe('useMessageSelectionStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('enterSelectionMode', () => {
    it('should enter delete selection mode with first message', () => {
      const store = useMessageSelectionStore()
      store.enterSelectionMode('msg-1')

      expect(store.isSelecting).toBe(true)
      expect(store.mode).toBe('delete')
      expect(store.selectedIds).toContain('msg-1')
    })
  })

  describe('enterForwardMode', () => {
    it('should enter forward selection mode with first message', () => {
      const store = useMessageSelectionStore()
      store.enterForwardMode('msg-1')

      expect(store.isSelecting).toBe(true)
      expect(store.mode).toBe('forward')
      expect(store.selectedIds).toContain('msg-1')
    })
  })

  describe('toggleSelection', () => {
    it('should add a message when not selected', () => {
      const store = useMessageSelectionStore()
      store.enterSelectionMode('msg-1')
      store.toggleSelection('msg-2')

      expect(store.selectedIds).toContain('msg-2')
    })

    it('should remove a message when already selected', () => {
      const store = useMessageSelectionStore()
      store.enterSelectionMode('msg-1')
      store.toggleSelection('msg-1')

      expect(store.selectedIds).not.toContain('msg-1')
    })
  })

  describe('cancelSelection', () => {
    it('should reset all selection state', () => {
      const store = useMessageSelectionStore()
      store.enterSelectionMode('msg-1')
      store.toggleSelection('msg-2')
      store.cancelSelection()

      expect(store.isSelecting).toBe(false)
      expect(store.selectedIds).toHaveLength(0)
      expect(store.mode).toBe('delete')
    })
  })
})
