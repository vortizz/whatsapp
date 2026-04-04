<template>
  <div>
    <div v-for="date in handledMessages" :key="date.date">
      <HomeMainDateMessage :date="date.date" class="my-3" />
      <div>
        <template v-for="msg in date?.messages ?? []" :key="msg._id">
          <HomeMainUnreadMessage
            v-if="showUnreadMessage(msg._id)"
            :count="numberOfUnreadMessages(msg._id)"
          />
          <div
            class="flex items-center gap-3 transition-colors"
            :class="[
              isSelecting ? 'px-4 cursor-pointer' : 'px-16',
              isFirst(msg._id) ? 'mt-3' : 'm-0.5',
              isLast(msg._id) ? 'mb-4' : '',
              isSelecting && selectedIds.includes(msg._id) ? 'bg-emerald-700/5 dark:bg-slate-200/5' : ''
            ]"
            @click="isSelecting ? toggleSelection(msg._id) : null"
          >
            <div
              v-if="isSelecting"
              class="shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center"
              :class="selectedIds.includes(msg._id) ? 'bg-emerald-500 border-emerald-500' : 'border-gray-400 dark:border-gray-500'"
            >
              <Icon v-if="selectedIds.includes(msg._id)" name="mdi:check" class="text-white text-base" />
            </div>
            <HomeMainMessageFrom
              v-if="!msg.isMine"
              :_id="msg._id"
              :text="msg.text"
              :date="msg.createdAt"
              :isFirst="isFirst(msg._id)"
              :isMenuOpen="openMenuId === msg._id"
              :isSelecting="isSelecting"
              @toggle-menu="toggleMenu(msg._id)"
              @delete="deleteMessage"
              @enter-select="enterSelectionMode(msg._id)"
            />
            <HomeMainMessageTo
              v-else
              :_id="msg._id"
              :text="msg.text"
              :date="msg.createdAt"
              :status="msg.status"
              :isFirst="isFirst(msg._id)"
              :isMenuOpen="openMenuId === msg._id"
              :isSelecting="isSelecting"
              @toggle-menu="toggleMenu(msg._id)"
              @delete="deleteMessage"
              @enter-select="enterSelectionMode(msg._id)"
            />
          </div>
        </template>
      </div>
    </div>
    <div ref="bottomEl"></div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '../../../store/user'
import { useChatStore } from '../../../store/chat'
import { useWsStore } from '../../../store/websocket'
import { useMessageSelectionStore } from '../../../store/messageSelection'
import { StatusMessage } from '../../../utils/status-message'

const messages = ref([])
const bottomEl = ref(null)
const openMenuId = ref(null)

const selectionStore = useMessageSelectionStore()
const { isSelecting, selectedIds } = storeToRefs(selectionStore)
const { enterSelectionMode, toggleSelection, cancelSelection } = selectionStore

async function deleteSelected() {
  const ids = [...selectedIds.value]
  try {
    await useMyAuthFetch('message/bulk', { method: 'DELETE', body: { ids } })
    messages.value = messages.value.filter(m => !ids.includes(m._id))
  } catch (error) {
    const data = error?.data || {}
    const message = Array.isArray(data.message) ? data.message[0] : data.message
    useNuxtApp().$toast.error(message)
  }
  cancelSelection()
}

defineExpose({ deleteSelected })

function toggleMenu(id) {
  openMenuId.value = openMenuId.value === id ? null : id
}

function handleClickOutside() {
  openMenuId.value = null
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
const { clearedChatState } = useClearChatState()
const { deletedChatState } = useDeleteChatState()

const userStore = useUserStore()
const chatStore = useChatStore()
const wsStore = useWsStore()

const { _id: userId } = storeToRefs(userStore)
const { _id: chatId } = storeToRefs(chatStore)
const { conn } = storeToRefs(wsStore)

const handledMessages = computed(() => {
  const grouped = {}

  for (const message of messages.value) {
    const dateKey = new Date(message.createdAt).toDateString()

    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        date: message.createdAt,
        messages: []
      }
    }

    grouped[dateKey].messages.push(message)
  }

  return Object.values(grouped).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  )
})

function showUnreadMessage(messageId) {
  const msgIndex = messages.value.findIndex(m => m._id === messageId)
  if (msgIndex <= 0) return false

  const previousMsg = messages.value[msgIndex-1]
  const currentMsg = messages.value[msgIndex]

  return !currentMsg.isMine && currentMsg.status === StatusMessage.RECEIVED &&
    !(!previousMsg.isMine && previousMsg.status === StatusMessage.RECEIVED)
}

function numberOfUnreadMessages(messageId) {
  const msgIndex = messages.value.findIndex(m => m._id === messageId)
  return messages.value.length - msgIndex
}

function isFirst(messageId) {
  const msgIndex = messages.value.findIndex(m => m._id === messageId)
  if (msgIndex <= 0) return true

  const previousMsg = messages.value[msgIndex-1]
  const currentMsg = messages.value[msgIndex]

  return currentMsg.isMine !== previousMsg.isMine
}

function isLast(messageId) {
  const msgIndex = messages.value.findIndex(m => m._id === messageId)
  return msgIndex === messages.value.length - 1
}

async function deleteMessage(messageId) {
  try {
    await useMyAuthFetch(`message/${messageId}/single`, { method: 'DELETE' })
    messages.value = messages.value.filter(m => m._id !== messageId)
  } catch (error) {
    const data = error?.data || {}
    const message = Array.isArray(data.message) ? data.message[0] : data.message
    useNuxtApp().$toast.error(message)
  }
}

function sortMessages(items) {
  return [...items].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
}

async function scrollToBottom(options) {
  await nextTick()
  bottomEl.value?.scrollIntoView(options)
}

async function getMessages() {
  try {
    const response = await useMyAuthFetch(`message/${chatId.value}`, { method: 'GET' })
    messages.value = sortMessages(response.map(msg => ({
      ...msg,
      isMine: msg.from._id === userId.value
    })))
    await scrollToBottom()
  } catch (error) {
    const data = error?.data || {}
    const message = Array.isArray(data.message) ? data.message[0] : data.message
    useNuxtApp().$toast.error(message)
  }
}

function handleEvent(event) {
  console.log('MSG RECEIVED (MESSAGES.VUE) -> ', JSON.parse(event.data))
  const data = JSON.parse(event.data)

  const name = data.name
  const msg = data.data

  if (name === 'new-message') {
    newMessage(msg)
  } else if (name === 'received-message') {
    receivedMessage(msg)
  } else if (name === 'read-message') {
    readMessage(msg)
  }
}

function newMessage(message) {
  if (message.chat._id === chatId.value) {
    const isMine = message.from._id === userId.value
    messages.value.push({ ...message, isMine })
    messages.value = sortMessages(messages.value)

    const receivedMessages = messages.value.filter(msg => !msg.isMine && msg.status === StatusMessage.RECEIVED)
    for (const msg of receivedMessages) {
      msg.status = StatusMessage.READ
    }
  }

  scrollToBottom({ behavior: 'smooth' })
}

function receivedMessage(message) {
  if (message.chat !== chatId.value) {
    return
  }

  for (const msg of message.messages) {
    const matchedMessage = messages.value.find(m => m._id === msg._id)
    if (matchedMessage) {
      matchedMessage.status = StatusMessage.RECEIVED
    }
  }
}

function readMessage(message) {
  if (message.chat !== chatId.value) {
    return
  }

  for (const msg of message.messages) {
    const matchedMessage = messages.value.find(m => m._id === msg._id)
    if (matchedMessage) {
      matchedMessage.status = StatusMessage.READ
    }
  }
}

watch(() => clearedChatState.value.nonce, () => {
  if (clearedChatState.value.chatId !== chatId.value) {
    return
  }

  messages.value = []
})

watch(() => deletedChatState.value.nonce, () => {
  if (deletedChatState.value.chatId !== chatId.value) {
    return
  }

  messages.value = []
})

watch(chatId, async (value, oldValue) => {
  if (!value || value === oldValue) {
    return
  }

  conn.value?.removeEventListener('message', handleEvent)

  if (value === 'new-chat') {
    messages.value = []
    return
  }

  await getMessages()
  conn.value?.addEventListener('message', handleEvent)
})

onBeforeUnmount(() => {
  conn.value?.removeEventListener('message', handleEvent)
})
</script>

<style>

</style>
