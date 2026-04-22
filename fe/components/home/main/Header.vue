<template>
  <div class="px-4 py-2.5 bg-white dark:bg-neutral-900 flex items-center justify-between shadow-sm">
    <div
      class="flex flex-row items-center gap-3 flex-1 min-w-0 cursor-pointer"
      @click="emit('showContactInfo')"
    >
      <GroupAvatarPlaceholder v-if="isChatGroup" :size="40" :users="chatUsers" />
      <AvatarPlaceholder v-else :size="40" :name="chatFirstUser?.name" />
      <div class="flex-1 min-w-0">
        <div class="text-base font-semibold text-black dark:text-white leading-tight">
          {{ chatFirstUser?.name }}
        </div>
        <div
          v-if="isChatGroup"
          class="text-xs truncate"
          :class="isTypingInChat(chatId) ? 'text-emerald-500' : 'text-black/50 dark:text-white/50'"
        >
          {{
            isTypingInChat(chatId)
              ? getTypingUsers(chatId)
                  .map((u) => u.name)
                  .join(', ') + ' typing...'
              : groupMembers
          }}
        </div>
        <div
          v-else-if="chatFirstUser"
          class="text-xs truncate"
          :class="isTypingInChat(chatId) ? 'text-emerald-500' : 'text-black/50 dark:text-white/50'"
        >
          {{
            isTypingInChat(chatId)
              ? 'Typing...'
              : chatFirstUser.isConnected
                ? 'online'
                : lastSeen(chatFirstUser.lastSeenAt)
          }}
        </div>
      </div>
    </div>
    <div class="flex flex-row items-center justify-center gap-2.5">
      <div>
        <button
          class="flex items-center text-2xl p-2 rounded-full text-neutral-950 dark:text-white dark:hover:bg-white/5 hover:bg-stone-100 transition-colors"
          @click="emit('showSearchMessages')"
        >
          <Icon name="material-symbols:search" />
        </button>
      </div>
      <div class="relative inline-block">
        <div>
          <button
            type="button"
            class="flex items-center text-2xl p-2 rounded-full text-neutral-950 dark:text-white dark:hover:bg-white/5 hover:bg-stone-100 transition-colors"
            @click="isMenuButton = !isMenuButton"
            @blur="blurMenuButton"
          >
            <Icon name="carbon:overflow-menu-vertical" />
          </button>
        </div>
        <HomeMainMenu
          :is-menu-button="isMenuButton"
          @show-contact-info="emit('showContactInfo')"
          @close="closeMenuButton"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
  import { storeToRefs } from 'pinia'
  import { useChatStore } from '../../../store/chat'
  import { useUserStore } from '../../../store/user'

  const emit = defineEmits(['showContactInfo', 'showSearchMessages'])

  const { setTyping, isTypingInChat, getTypingUsers } = useTypingState()

  const { conn } = useWs()
  const chatStore = useChatStore()
  const userStore = useUserStore()
  const { users: chatUsers, _id: chatId, isGroup: isChatGroup } = storeToRefs(chatStore)
  const { _id: userId } = storeToRefs(userStore)
  const isMenuButton = ref(false)

  const chatFirstUser = computed(() => chatUsers.value?.find((u) => u._id !== userId.value))

  function handleEvent(event) {
    const { name, data } = JSON.parse(event.data)
    if (name === 'user-status') {
      chatStore.updateChatUserStatus(data.userId, data.isConnected, data.lastSeenAt)
    } else if (name === 'typing') {
      setTyping(data.chatId, data.from)
    }
  }

  watch(chatId, async (value, oldValue) => {
    if (!value || value === oldValue) {
      return
    }
    conn.value?.removeEventListener('message', handleEvent)
    conn.value?.addEventListener('message', handleEvent)
  })

  onBeforeUnmount(() => {
    conn.value?.removeEventListener('message', handleEvent)
  })

  const groupMembers = computed(() => {
    if (!isChatGroup.value) return ''
    return (chatUsers.value ?? [])
      .map((u) => (u._id?.toString() === userId.value ? 'You' : u.name))
      .join(', ')
  })

  function closeMenuButton() {
    isMenuButton.value = false
  }

  function blurMenuButton() {
    setTimeout(() => {
      closeMenuButton()
    }, 100)
  }

  function lastSeen(date) {
    if (!date) return ''
    const now = new Date()
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''

    const isToday =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()

    const isYesterday = (() => {
      const y = new Date(now)
      y.setDate(y.getDate() - 1)
      return (
        d.getFullYear() === y.getFullYear() &&
        d.getMonth() === y.getMonth() &&
        d.getDate() === y.getDate()
      )
    })()

    const time = d.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })

    if (isToday) return `last seen today at ${time}`
    if (isYesterday) return `last seen yesterday at ${time}`

    const sameYear = d.getFullYear() === now.getFullYear()
    const dateStr = d.toLocaleDateString([], {
      day: 'numeric',
      month: 'short',
      ...(sameYear ? {} : { year: 'numeric' }),
    })

    return `last seen ${dateStr} at ${time}`
  }
</script>

<style></style>
