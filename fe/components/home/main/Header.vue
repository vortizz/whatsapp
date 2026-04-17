<template>
    <div class="px-4 py-2.5 bg-white dark:bg-neutral-900 flex items-center justify-between shadow-sm">
        <div class="flex flex-row items-center gap-3 flex-1 min-w-0 cursor-pointer" @click="emit('showContactInfo')">
            <GroupAvatarPlaceholder v-if="chatUser.isGroup" :size="40" :users="chatUser.users" />
            <AvatarPlaceholder v-else :size="40" :name="chatUser.name" />
            <div class="flex-1 min-w-0">
                <div class="text-base font-semibold text-black dark:text-white leading-tight">
                    {{ chatUser.name }}
                </div>
                <div v-if="chatUser.isGroup" class="text-xs truncate" :class="isTypingInChat(chatId) ? 'text-emerald-500' : 'text-black/50 dark:text-white/50'">
                    {{ isTypingInChat(chatId) ? getTypingUsers(chatId).map(u => u.name).join(', ') + ' typing...' : groupMembers }}
                </div>
                <div v-else class="text-xs truncate" :class="isTypingInChat(chatId) ? 'text-emerald-500' : 'text-black/50 dark:text-white/50'">
                    {{ isTypingInChat(chatId) ? 'Typing...' : chatUser.isConnected ? 'online' : lastSeen(chatUser.lastSeenAt) }}
                </div>
            </div>
        </div>
        <div class="flex flex-row items-center justify-center gap-2.5">
            <div>
                <button @click="emit('showSearchMessages')" class='flex items-center text-2xl p-2 rounded-full text-neutral-950 dark:text-white dark:hover:bg-white/5 hover:bg-stone-100 transition-colors'>
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
                    :isMenuButton="isMenuButton"
                    @showContactInfo="emit('showContactInfo')"
                    @close="closeMenuButton"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '../../../store/chat'
import { useUserStore } from '../../../store/user'
import { useWsStore } from '../../../store/websocket'

const emit = defineEmits(['showContactInfo', 'showSearchMessages'])

const { setTyping, isTypingInChat, getTypingUsers } = useTypingState()

const chatStore = useChatStore()
const userStore = useUserStore()
const wsStore = useWsStore()
const { user: chatUser, _id: chatId } = storeToRefs(chatStore)
const { _id: userId } = storeToRefs(userStore)
const { conn } = storeToRefs(wsStore)
const isMenuButton = ref(false)

function handleEvent(event) {
    const { name, data } = JSON.parse(event.data)
    if (name === 'user-status') {
        chatStore.updateChatUserStatus(data.userId, data.isConnected, data.lastSeenAt)
    } else if (name === 'typing') {
        setTyping(data.chatId, data.from)
    }
}

watch(chatId, async (value, oldValue)  => {
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
    if (!chatUser.value?.isGroup) return ''
    return (chatUser.value.users ?? [])
        .map(u => u._id?.toString() === userId.value ? 'You' : u.name)
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
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  if (isToday) return `last seen today at ${time}`
  if (isYesterday) return `last seen yesterday at ${time}`

  const sameYear = d.getFullYear() === now.getFullYear()
  const dateStr = d.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  })

  return `last seen ${dateStr} at ${time}`
}
</script>

<style>

</style>
