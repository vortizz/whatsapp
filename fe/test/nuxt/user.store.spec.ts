import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../../store/user'

describe('useUserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockUser = {
    _id: 'user-1',
    name: 'Victor',
    email: 'victor@test.com',
    about: 'Hey there',
    publicKey: 'pk-123',
  }

  describe('setUser', () => {
    it('should set all user fields correctly', () => {
      const store = useUserStore()
      store.setUser(mockUser)

      expect(store._id).toBe('user-1')
      expect(store.name).toBe('Victor')
      expect(store.email).toBe('victor@test.com')
      expect(store.about).toBe('Hey there')
      expect(store.publicKey).toBe('pk-123')
    })

    it('should default blockedUsers to empty array when not provided', () => {
      const store = useUserStore()
      store.setUser(mockUser)

      expect(store.blockedUsers).toEqual([])
    })

    it('should normalize blockedUsers from objects to id strings', () => {
      const store = useUserStore()
      store.setUser({
        ...mockUser,
        blockedUsers: [{ _id: 'user-2' }, { _id: 'user-3' }] as any,
      })

      expect(store.blockedUsers).toEqual(['user-2', 'user-3'])
    })

    it('should handle string blockedUsers as-is', () => {
      const store = useUserStore()
      store.setUser({
        ...mockUser,
        blockedUsers: ['user-2', 'user-3'],
      })

      expect(store.blockedUsers).toEqual(['user-2', 'user-3'])
    })
  })

  describe('addBlockedUser', () => {
    it('should add a user to blockedUsers', () => {
      const store = useUserStore()
      store.setUser(mockUser)
      store.addBlockedUser('user-2')

      expect(store.blockedUsers).toContain('user-2')
    })

    it('should not add duplicate blocked users', () => {
      const store = useUserStore()
      store.setUser(mockUser)
      store.addBlockedUser('user-2')
      store.addBlockedUser('user-2')

      expect(store.blockedUsers.filter((id) => id === 'user-2').length).toBe(1)
    })
  })

  describe('removeBlockedUser', () => {
    it('should remove a user from blockedUsers', () => {
      const store = useUserStore()
      store.setUser({ ...mockUser, blockedUsers: ['user-2', 'user-3'] })
      store.removeBlockedUser('user-2')

      expect(store.blockedUsers).not.toContain('user-2')
      expect(store.blockedUsers).toContain('user-3')
    })

    it('should do nothing when user is not in blockedUsers', () => {
      const store = useUserStore()
      store.setUser({ ...mockUser, blockedUsers: ['user-2'] })
      store.removeBlockedUser('user-99')

      expect(store.blockedUsers).toEqual(['user-2'])
    })
  })

  describe('hasBlockedUser', () => {
    it('should return true when user is blocked', () => {
      const store = useUserStore()
      store.setUser({ ...mockUser, blockedUsers: ['user-2'] })

      expect(store.hasBlockedUser('user-2')).toBe(true)
    })

    it('should return false when user is not blocked', () => {
      const store = useUserStore()
      store.setUser(mockUser)

      expect(store.hasBlockedUser('user-2')).toBe(false)
    })

    it('should return false when userId is undefined', () => {
      const store = useUserStore()
      store.setUser(mockUser)

      expect(store.hasBlockedUser(undefined)).toBe(false)
    })
  })

  describe('setName / setAbout', () => {
    it('should update the name', () => {
      const store = useUserStore()
      store.setUser(mockUser)
      store.setName('New Name')

      expect(store.name).toBe('New Name')
    })

    it('should update the about', () => {
      const store = useUserStore()
      store.setUser(mockUser)
      store.setAbout('New about text')

      expect(store.about).toBe('New about text')
    })
  })
})
