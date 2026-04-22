<template>
  <div ref="containerEl" class="relative flex flex-col gap-1" @click="closeMenu">
    <HomeSidebarChat
      v-for="(chat, i) in displayedChats"
      :key="i"
      :name="getFirstUser(chat)?.name"
      :is-group="chat.isGroup"
      :active="chatId === chat._id"
      :is-clearing="clearingChatId === chat._id || deletingChatId === chat._id"
      :last-message="chat.lastMessage"
      :count-unread-messages="chat.countUnreadMessages"
      :users="chat.users"
      :typing-users="getTypingUsers(chat._id)"
      @click="setChat(chat)"
      @open-menu="openMenu(chat, $event)"
    />
    <HomeMainMenu
      :is-menu-button="isMenuOpen"
      :x="menuPosition.x"
      :y="menuPosition.y"
      @show-contact-info="emit('showContactInfo')"
      @close="closeMenu"
    />
    <div class="text-center text-xs p-3">
      <Icon name="oi:lock-locked" />
      Your personal messages are end-to-end encrypted
    </div>
  </div>
</template>

<script setup>
  import { storeToRefs } from 'pinia'
  import { useUserStore } from '../../../store/user'
  import { useChatStore } from '../../../store/chat'
  import { StatusMessage } from '../../../utils/status-message'

  const props = defineProps({ groupChats: { type: Boolean, default: false } })
  const emit = defineEmits(['showContactInfo'])

  const { setTyping, getTypingUsers } = useTypingState()
  const { decryptMessage } = useCrypto()
  const { getKey: getPrivateKey } = useIndexedDB()

  const chats = ref([])
  const displayedChats = ref([])

  watch(
    [chats, () => props.groupChats],
    ([newChats, isGroups]) => {
      displayedChats.value = isGroups ? newChats.filter((chat) => chat?.isGroup) : newChats
    },
    { immediate: true, deep: true },
  )
  const containerEl = ref(null)
  const isMenuOpen = ref(false)
  const menuPosition = ref({ x: 0, y: 0 })
  const { clearingChatId, clearedChatState, selectedChatHasMessages } = useClearChatState()
  const { deletingChatId, deletedChatState } = useDeleteChatState()

  const userStore = useUserStore()
  const chatStore = useChatStore()

  const { _id: userId } = storeToRefs(userStore)
  const { _id: chatId } = storeToRefs(chatStore)
  const { conn } = useWs()
  const { setChat: setChatAction, setUnreadCounts } = chatStore

  function getFirstUser(chat) {
    return chat.users?.find((u) => u._id !== userId.value)
  }

  function getUserId(user) {
    return user?._id || user
  }

  function emptyLastMessage() {
    return {
      _id: '',
      text: '',
      createdAt: '',
      status: '',
      isMine: false,
    }
  }

  async function handleEvent(event) {
    const data = JSON.parse(event.data)

    const name = data.name
    const msg = data.data

    if (name === 'new-message') {
      await newMessage(msg)
    } else if (name === 'received-message') {
      receivedMessage(msg)
    } else if (name === 'read-message') {
      readMessage(msg)
    } else if (name === 'typing') {
      setTyping(msg.chatId, msg.from)
    } else if (name === 'chat-event') {
      handleChatEvent(msg)
    } else if (name === 'user-status') {
      const user = chats.value
        .map((c) => c.users)
        .flat()
        .find((u) => u._id === msg.userId)
      if (user) {
        user.isConnected = msg.isConnected
        user.lastSeenAt = msg.lastSeenAt
      }
    }
  }

  async function decryptLastMessage(chat) {
    const lm = chat.lastMessage
    if (!lm?.iv) return lm?.text ?? ''
    try {
      const privateKey = await getPrivateKey(userId.value, 'privateKey')
      const encryptedAESKey = chat?.encryptedKeys?.find(
        (k) => k.userId === userId.value,
      )?.encryptedKey
      return await decryptMessage(lm.text, lm.iv, encryptedAESKey, privateKey)
    } catch (e) {
      console.error('[Chats] decryptLastMessage failed:', e?.message ?? e)
      return '[encrypted]'
    }
  }

  async function getChats() {
    try {
      const response = await useMyAuthFetch('chat', { method: 'GET' })
      chats.value = response.map((chat) => ({
        _id: chat._id,
        name: chat.name,
        description: chat.description,
        isGroup: chat.isGroup,
        users: chat.users,
        encryptedKeys: chat.encryptedKeys,
        createdAt: chat.createdAt,
        createdBy: chat.createdBy,
        groupAdmins: chat.groupAdmins,
        lastMessage: chat.lastMessage
          ? (() => {
              const fromId = getUserId(chat.lastMessage.from)
              const isMine = fromId === userId.value
              const senderName =
                chat.lastMessage.from?.name ?? chat.users?.find((u) => u._id === fromId)?.name ?? ''
              return {
                _id: chat.lastMessage._id,
                text: chat.lastMessage.text,
                iv: chat.lastMessage.iv,
                createdAt: chat.lastMessage.createdAt,
                status: chat.lastMessage.status,
                isMine,
                senderName,
              }
            })()
          : emptyLastMessage(),
        countUnreadMessages: chat.countUnreadMessages || 0,
      }))

      // Decrypt last message previews after the full list is built
      await Promise.all(
        chats.value.map(async (chat) => {
          if (chat.lastMessage?._id) {
            chat.lastMessage.text = await decryptLastMessage(chat)
          }
        }),
      )
    } catch (error) {
      const data = error?.data || {}
      const message = Array.isArray(data.message) ? data.message[0] : data.message
      useNuxtApp().$toast.error(message)
    }
  }

  function setChat(chat) {
    chat.countUnreadMessages = 0
    const clonedChat = JSON.parse(JSON.stringify(chat))
    setChatAction({
      _id: clonedChat._id,
      users: clonedChat.users,
      encryptedKeys: clonedChat.encryptedKeys,
      isGroup: clonedChat.isGroup,
      name: clonedChat.name,
      description: clonedChat.description,
      createdAt: clonedChat.createdAt,
      createdBy: clonedChat.createdBy,
      groupAdmins: clonedChat.groupAdmins,
    })
  }

  function closeMenu() {
    isMenuOpen.value = false
  }

  function openMenu(chat, position) {
    setChat(chat)

    const container = containerEl.value
    const scrollParent = container?.parentElement
    if (!(container && scrollParent)) {
      return
    }

    const rect = container.getBoundingClientRect()
    const menuWidth = 224
    const horizontalPadding = 16
    const verticalPadding = 16
    const x = position.clientX - rect.left
    const y = position.clientY - rect.top + scrollParent.scrollTop
    const maxX = container.clientWidth - menuWidth - horizontalPadding

    menuPosition.value = {
      x: Math.max(horizontalPadding, Math.min(x, maxX)),
      y: Math.max(verticalPadding, y),
    }
    isMenuOpen.value = true
  }

  function handleWindowPointerDown(event) {
    if (!isMenuOpen.value) {
      return
    }

    if (containerEl.value?.contains(event.target)) {
      return
    }

    closeMenu()
  }

  async function newMessage(message) {
    const chat = chats.value.find((item) => item._id === message.chat._id)
    if (!chat) {
      if (message._id) {
        newChat(message)
      }
      return
    }

    let text = message.text
    if (message.iv) {
      try {
        const privateKey = await getPrivateKey(userId.value, 'privateKey')
        const encryptedAESKey = chat?.encryptedKeys?.find(
          (k) => k.userId === userId.value,
        )?.encryptedKey
        text = await decryptMessage(message.text, message.iv, encryptedAESKey, privateKey)
      } catch (e) {
        console.error('[Chats] newMessage decrypt failed:', e?.message ?? e)
        text = '[encrypted]'
      }
    }

    const isMine = message.from._id === userId.value
    chat.lastMessage = {
      _id: message._id,
      text,
      createdAt: message.createdAt,
      status: message.status,
      isMine,
      senderName: message.from?.name ?? '',
    }
    if (!isMine && chatId.value !== chat._id) {
      chat.countUnreadMessages += 1
    } else {
      chat.countUnreadMessages = 0
    }
    sortChats()
  }

  function receivedMessage(message) {
    const chat = chats.value.find((item) => item._id === message.chat)

    if (!(chat && message.messages.some((msg) => msg._id === chat.lastMessage._id))) {
      return
    }

    chat.lastMessage.status = StatusMessage.RECEIVED
  }

  function readMessage(message) {
    const chat = chats.value.find((item) => item._id === message.chat)

    if (!(chat && message.messages.some((msg) => msg._id === chat.lastMessage._id))) {
      return
    }

    chat.lastMessage.status = StatusMessage.READ
  }

  async function newChat(message) {
    const isMine = getUserId(message.from) === userId.value
    const isGroup = message.isGroup

    let text = message.text
    if (message.iv) {
      try {
        const privateKey = await getPrivateKey(userId.value, 'privateKey')
        const encryptedAESKey = message?.chat?.encryptedKeys?.find(
          (k) => k.userId === userId.value,
        )?.encryptedKey
        text = await decryptMessage(message.text, message.iv, encryptedAESKey, privateKey)
      } catch (e) {
        console.error('[Chats] newChat decrypt failed:', e?.message ?? e)
        text = '[encrypted]'
      }
    }

    const chat = {
      _id: message.chat._id,
      isGroup: isGroup,
      name: message.chat.name,
      description: message.chat.description,
      users: message.chat.users,
      encryptedKeys: message.chat.encryptedKeys,
      createdAt: message.chat.createdAt,
      createdBy: message.chat.createdBy,
      groupAdmins: message.chat.groupAdmins,
      lastMessage: {
        _id: message._id,
        text,
        createdAt: message.createdAt,
        status: message.status,
        isMine,
        senderName: message.from?.name ?? '',
      },
      countUnreadMessages: isMine ? 0 : 1,
    }
    chats.value.push(chat)
    sortChats()
  }

  function handleChatEvent(event) {
    const chat = chats.value.find((c) => c._id === event.chat._id)
    if (!chat) return

    if (event.isNameChanged && chat?.isGroup) {
      chat.name = event.newName
    }
  }

  function sortChats() {
    chats.value.sort((a, b) => {
      if (a.lastMessage?.createdAt > b.lastMessage?.createdAt) {
        return -1
      }
      if (a.lastMessage?.createdAt < b.lastMessage?.createdAt) {
        return 1
      }
      return 0
    })
  }

  function clearChatState(chatIdToClear) {
    const matchedChat = chats.value.find((chat) => chat._id === chatIdToClear)
    if (!matchedChat) {
      return
    }

    matchedChat.lastMessage = emptyLastMessage()
    matchedChat.countUnreadMessages = 0
  }

  function removeChat(chatIdToDelete) {
    chats.value = chats.value.filter((chat) => chat._id !== chatIdToDelete)
  }

  watchEffect(() => {
    const selectedChat = chats.value.find((chat) => chat._id === chatId.value)
    selectedChatHasMessages.value = Boolean(selectedChat?.lastMessage?._id)
  })

  watch(
    chats,
    (newChats) => {
      setUnreadCounts(newChats)
    },
    { deep: true },
  )

  watch(
    () => clearedChatState.value.nonce,
    () => {
      if (!clearedChatState.value.chatId) {
        return
      }

      clearChatState(clearedChatState.value.chatId)
    },
  )

  watch(
    () => deletedChatState.value.nonce,
    () => {
      if (!deletedChatState.value.chatId) {
        return
      }

      removeChat(deletedChatState.value.chatId)
    },
  )

  const { membersUpdatedState } = useAddMemberModal()
  watch(
    () => membersUpdatedState.value.nonce,
    () => {
      if (!membersUpdatedState.value.chatId) {
        return
      }

      const chat = chats.value.find((c) => c._id === membersUpdatedState.value.chatId)
      if (chat?.isGroup) {
        chat.users = membersUpdatedState.value.users
        chat.groupAdmins = membersUpdatedState.value.groupAdmins
      }
    },
  )

  onMounted(async () => {
    await getChats()

    conn.value?.removeEventListener('message', handleEvent)
    conn.value?.addEventListener('message', handleEvent)
    window.addEventListener('pointerdown', handleWindowPointerDown)
  })

  onBeforeUnmount(() => {
    conn.value?.removeEventListener('message', handleEvent)
    window.removeEventListener('pointerdown', handleWindowPointerDown)
  })
</script>

<style></style>
