import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMessageReplyStore } from '../../store/messageReply'

describe('useMessageReplyStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockReply = {
    _id: 'msg-1',
    text: 'Hello there!',
    senderName: 'Victor',
  }

  describe('setReply', () => {
    it('should set the reply message', () => {
      const store = useMessageReplyStore()
      store.setReply(mockReply)

      expect(store.replyTo).toEqual(mockReply)
    })

    it('should overwrite the previous reply', () => {
      const store = useMessageReplyStore()
      store.setReply(mockReply)
      store.setReply({ _id: 'msg-2', text: 'New reply', senderName: 'Caren' })

      expect(store.replyTo?._id).toBe('msg-2')
    })
  })

  describe('clearReply', () => {
    it('should clear the reply', () => {
      const store = useMessageReplyStore()
      store.setReply(mockReply)
      store.clearReply()

      expect(store.replyTo).toBeNull()
    })
  })
})
