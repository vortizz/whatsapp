import { defineStore } from 'pinia'

interface IUser {
  _id: string
  name: string
  email: string
  about: string
  isConnected: boolean
  lastSeenAt: Date
  publicKey: string
}

interface IEncryptedKey {
  userId: string
  encryptedKey: string
}

interface IChat {
  _id: string
  users: IUser[] | IUser
  createdAt: Date
  name?: string
  description?: string
  createdBy?: IUser
  isGroup?: boolean
  encryptedKeys?: IEncryptedKey[]
  groupAdmins?: IUser[]
}

export const useChatStore = defineStore(
  'chat',
  () => {
    const _id = ref('')
    const users = ref<IUser[] | undefined>(undefined)
    const createdAt = ref<Date | null>(null)
    const name = ref<string | undefined>(undefined)
    const description = ref<string | undefined>(undefined)
    const createdBy = ref<IUser | undefined>(undefined)
    const isGroup = ref<boolean | undefined>(undefined)
    const encryptedKeys = ref<IEncryptedKey[] | undefined>(undefined)
    const groupAdmins = ref<IUser[] | undefined>(undefined)
    const unreadChatsCount = ref(0)
    const unreadMessagesCount = ref(0)

    function setChat({
      _id: chatId,
      users: chatUsers,
      createdAt: chatCreatedAt,
      name: chatName,
      description: chatDescription,
      createdBy: chatCreatedBy,
      isGroup: chatIsGroup,
      encryptedKeys: chatEncryptedKeys,
      groupAdmins: chatGroupAdmins,
    }: IChat) {
      _id.value = chatId
      users.value = chatUsers as IUser[]
      createdAt.value = chatCreatedAt
      name.value = chatName
      description.value = chatDescription
      createdBy.value = chatCreatedBy
      isGroup.value = chatIsGroup
      encryptedKeys.value = chatEncryptedKeys
      groupAdmins.value = chatGroupAdmins
    }

    function clearChat() {
      _id.value = ''
      users.value = undefined
      createdAt.value = null
      name.value = undefined
      description.value = undefined
      createdBy.value = undefined
      isGroup.value = undefined
      encryptedKeys.value = undefined
      groupAdmins.value = undefined
    }

    function setUnreadCounts(chats: Array<{ countUnreadMessages: number }>) {
      unreadChatsCount.value = chats.filter((c) => c.countUnreadMessages > 0).length
      unreadMessagesCount.value = chats.reduce((sum, c) => sum + c.countUnreadMessages, 0)
    }

    function updateChatUserStatus(userId: string, isConnected: boolean, lastSeenAt: Date) {
      const user = (users.value as IUser[])?.find((u) => u._id === userId)
      if (user) {
        user.isConnected = isConnected
        user.lastSeenAt = lastSeenAt
      }
    }

    return {
      _id,
      users,
      createdAt,
      name,
      description,
      createdBy,
      isGroup,
      encryptedKeys,
      groupAdmins,
      unreadChatsCount,
      unreadMessagesCount,
      setChat,
      clearChat,
      setUnreadCounts,
      updateChatUserStatus,
    }
  },
  { persist: true },
)
