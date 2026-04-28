import { defineStore } from 'pinia'

interface IUser {
  _id: string
  name: string
  email: string
  about: string
  blockedUsers?: string[]
  publicKey: string
}

function normalizeBlockedUsers(blockedUsers: Array<string | { _id: string }> = []): string[] {
  return blockedUsers
    .map((user) => (typeof user === 'string' ? user : user?._id))
    .filter((userId): userId is string => !!userId)
}

export const useUserStore = defineStore(
  'user',
  () => {
    const _id = ref<string>('')
    const name = ref<string>('')
    const email = ref<string>('')
    const about = ref<string>('')
    const blockedUsers = ref<string[]>([])
    const publicKey = ref<string>('')

    const hasBlockedUser = computed(
      () => (userId?: string) => !!userId && blockedUsers.value.includes(userId),
    )

    function setUser({
      _id: userId,
      name: userName,
      email: userEmail,
      about: userAbout,
      blockedUsers: userBlockedUsers = [],
      publicKey: userPublicKey,
    }: IUser) {
      _id.value = userId
      name.value = userName
      email.value = userEmail
      about.value = userAbout
      blockedUsers.value = normalizeBlockedUsers(userBlockedUsers)
      publicKey.value = userPublicKey
    }

    function setBlockedUsers(newBlockedUsers: string[]) {
      blockedUsers.value = normalizeBlockedUsers(newBlockedUsers)
    }

    function addBlockedUser(userId: string) {
      if (blockedUsers.value.includes(userId)) return
      blockedUsers.value.push(userId)
    }

    function removeBlockedUser(userId: string) {
      blockedUsers.value = blockedUsers.value.filter((id) => id !== userId)
    }

    function setName(newName: string) {
      name.value = newName
    }

    function setAbout(newAbout: string) {
      about.value = newAbout
    }

    async function logout() {
      _id.value = ''
      name.value = ''
      email.value = ''
      about.value = ''
      blockedUsers.value = []
      publicKey.value = ''
      useMyAuthFetch('auth/logout', { method: 'POST' }).catch(() => {})
    }

    return {
      _id,
      name,
      email,
      about,
      blockedUsers,
      publicKey,
      hasBlockedUser,
      setUser,
      setBlockedUsers,
      addBlockedUser,
      removeBlockedUser,
      setName,
      setAbout,
      logout,
    }
  },
  { persist: true },
)
