import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useChatStore } from '../../store/chat'

describe('useChatStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockUser = {
    _id: 'user-1',
    name: 'Victor',
    email: 'victor@test.com',
    about: 'Hey',
    isConnected: true,
    lastSeenAt: new Date(),
    publicKey: 'pk-1',
  }

  const mockChat = {
    _id: 'chat-1',
    users: [mockUser],
    createdAt: new Date(),
    name: 'Test Chat',
    isGroup: false,
    encryptedKeys: [{ userId: 'user-1', encryptedKey: 'enc-key' }],
    groupAdmins: [],
  }

  describe('setChat', () => {
    it('should set all chat fields correctly', () => {
      const store = useChatStore()
      store.setChat(mockChat)

      expect(store._id).toBe('chat-1')
      expect(store.name).toBe('Test Chat')
      expect(store.isGroup).toBe(false)
      expect(store.encryptedKeys).toEqual([{ userId: 'user-1', encryptedKey: 'enc-key' }])
    })

    it('should set users correctly', () => {
      const store = useChatStore()
      store.setChat(mockChat)

      expect(store.users).toEqual([mockUser])
    })

    it('should overwrite previous chat data when called again', () => {
      const store = useChatStore()
      store.setChat(mockChat)
      store.setChat({ ...mockChat, _id: 'chat-2', name: 'New Chat' })

      expect(store._id).toBe('chat-2')
      expect(store.name).toBe('New Chat')
    })
  })

  describe('clearChat', () => {
    it('should reset all fields to their defaults', () => {
      const store = useChatStore()
      store.setChat(mockChat)
      store.clearChat()

      expect(store._id).toBe('')
      expect(store.users).toBeUndefined()
      expect(store.name).toBeUndefined()
      expect(store.isGroup).toBeUndefined()
      expect(store.encryptedKeys).toBeUndefined()
      expect(store.createdAt).toBeNull()
    })
  })

  describe('setUnreadCounts', () => {
    it('should count chats with unread messages', () => {
      const store = useChatStore()
      store.setUnreadCounts([
        { countUnreadMessages: 3 },
        { countUnreadMessages: 0 },
        { countUnreadMessages: 1 },
      ])

      expect(store.unreadChatsCount).toBe(2) // 2 chats have unread messages
    })

    it('should sum total unread messages', () => {
      const store = useChatStore()
      store.setUnreadCounts([
        { countUnreadMessages: 3 },
        { countUnreadMessages: 0 },
        { countUnreadMessages: 1 },
      ])

      expect(store.unreadMessagesCount).toBe(4) // 3 + 0 + 1
    })

    it('should return 0 when all chats are read', () => {
      const store = useChatStore()
      store.setUnreadCounts([{ countUnreadMessages: 0 }, { countUnreadMessages: 0 }])

      expect(store.unreadChatsCount).toBe(0)
      expect(store.unreadMessagesCount).toBe(0)
    })
  })

  describe('updateChatUserStatus', () => {
    it('should update the connection status of a user in the chat', () => {
      const store = useChatStore()
      store.setChat({ ...mockChat, users: [{ ...mockUser }] })

      const newDate = new Date()
      store.updateChatUserStatus('user-1', false, newDate)

      const user = (store.users as any[]).find((u) => u._id === 'user-1')
      expect(user.isConnected).toBe(false)
      expect(user.lastSeenAt).toBe(newDate)
    })

    it('should do nothing when user is not in the chat', () => {
      const store = useChatStore()
      store.setChat({ ...mockChat, users: [{ ...mockUser }] })

      store.updateChatUserStatus('user-99', false, new Date())

      const user = (store.users as any[]).find((u) => u._id === 'user-1')
      expect(user.isConnected).toBe(true)
    })
  })
})
