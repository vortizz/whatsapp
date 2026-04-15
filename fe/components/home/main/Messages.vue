<template>
  <div>
    <div v-for="date in handledMessages" :key="date.date">
      <HomeMainDateMessage :date="date.date" class="my-3" />
      <div>
        <template v-for="item in date?.messages ?? []" :key="item._id">
          <HomeMainChatEvent
            v-if="item.isEvent"
            :doneBy="item.doneBy"
            :isNameChanged="item.isNameChanged"
            :isDescriptionChanged="item.isDescriptionChanged"
            :isUserAdded="item.isUserAdded"
            :isUserRemoved="item.isUserRemoved"
            :userAdded="item.userAdded"
            :userRemoved="item.userRemoved"
            :newName="item.newName"
          />
          <template v-else>
            <HomeMainUnreadMessage
              v-if="showUnreadMessage(item._id)"
              :count="numberOfUnreadMessages(item._id)"
            />
            <div
              :data-message-id="item._id"
              class="flex items-center gap-3 transition-colors"
              :class="[
                isSelecting ? 'px-4 cursor-pointer' : chatUser.isGroup ? 'pl-9 pr-16' : 'px-16',
                isFirst(item._id) ? 'mt-3' : 'm-0.5',
                isLast(item._id) ? 'mb-4' : '',
                isSelecting && selectedIds.includes(item._id) ? 'bg-emerald-700/5 dark:bg-slate-200/5' : '',
                highlightedId === item._id ? 'bg-emerald-500/10 dark:bg-emerald-400/10' : ''
              ]"
              @click="isSelecting ? toggleSelection(item._id) : null"
            >
              <div
                v-if="isSelecting"
                class="shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center"
                :class="selectedIds.includes(item._id) ? 'bg-emerald-500 border-emerald-500' : 'border-gray-400 dark:border-gray-500'"
              >
                <Icon v-if="selectedIds.includes(item._id)" name="mdi:check" class="text-white text-base" />
              </div>
              <HomeMainMessageFrom
                v-if="!item.isMine"
                :_id="item._id"
                :text="item.text"
                :date="item.createdAt"
                :isFirst="isFirst(item._id)"
                :isMenuOpen="openMenuId === item._id"
                :isSelecting="isSelecting"
                :replyTo="item.replyTo"
                :forwarded="item.forwarded"
                :from="item.from"
                :isGroup="chatUser?.isGroup"
                @toggle-menu="toggleMenu(item._id)"
                @delete="deleteMessage"
                @enter-select="enterSelectionMode(item._id)"
                @enter-forward="enterForwardMode(item._id)"
                @reply="handleReply(item)"
                @reply-privately="handleReplyPrivately(item)"
                @message-user="openDmWith(item.from)"
                @scroll-to="scrollToReply"
                @view-member="$emit('view-member', $event)"
              />
              <HomeMainMessageTo
                v-else
                :_id="item._id"
                :text="item.text"
                :date="item.createdAt"
                :status="item.status"
                :isFirst="isFirst(item._id)"
                :isMenuOpen="openMenuId === item._id"
                :isSelecting="isSelecting"
                :replyTo="item.replyTo"
                :forwarded="item.forwarded"
                @toggle-menu="toggleMenu(item._id)"
                @delete="deleteMessage"
                @enter-select="enterSelectionMode(item._id)"
                @enter-forward="enterForwardMode(item._id)"
                @reply="handleReply(item)"
                @scroll-to="scrollToReply"
              />
            </div>
          </template>
        </template>
      </div>
    </div>
    <div v-if="isTypingInChat(chatId)" class="flex items-end gap-2 mb-2" :class="chatUser?.isGroup ? 'pl-9 pr-16' : 'px-16'">
      <div v-if="chatUser?.isGroup" class="flex -space-x-2 flex-shrink-0">
        <AvatarPlaceholder
          v-for="u in getTypingUsers(chatId)"
          :key="u._id"
          :size="28"
          :name="u.name"
          class="ring-2 ring-[#efeae2] dark:ring-neutral-900"
        />
      </div>
      <div class="bg-white dark:bg-neutral-800 rounded-2xl py-2 px-2.5 shadow-sm flex items-center">
        <div class="flex gap-1 items-center h-4">
          <span class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
          <span class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
          <span class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
        </div>
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
import { useMessageReplyStore } from '../../../store/messageReply'
import { StatusMessage } from '../../../utils/status-message'

const { typingChats, setTyping, isTypingInChat, getTypingUsers } = useTypingState()

const messages = ref([])
const bottomEl = ref(null)
const openMenuId = ref(null)
const highlightedId = ref(null)

const selectionStore = useMessageSelectionStore()
const { isSelecting, selectedIds } = storeToRefs(selectionStore)
const { enterSelectionMode, enterForwardMode, toggleSelection, cancelSelection } = selectionStore

const replyStore = useMessageReplyStore()
const { setReply } = replyStore

function handleReply(msg) {
  setReply({ _id: msg._id, text: msg.text, senderName: msg.isMine ? 'You' : msg.from?.name || '' })
}

async function openDmWith(user) {
  try {
    const chats = await useMyAuthFetch('chat', { method: 'GET' })
    const existing = chats.find(c => !c.isGroup && c.users.some(u => (u._id || u) === user._id))
    if (existing) {
      const chatUser = existing.users.find(u => u._id !== userId.value) ?? user
      chatStore.setChat({ _id: existing._id, user: JSON.parse(JSON.stringify(chatUser)) })
    } else {
      chatStore.setChat({ _id: 'new-chat', user: JSON.parse(JSON.stringify(user)) })
    }
  } catch {
    chatStore.setChat({ _id: 'new-chat', user: JSON.parse(JSON.stringify(user)) })
  }
}

async function handleReplyPrivately(msg) {
  await openDmWith(msg.from)
  await nextTick()
  setReply({ _id: msg._id, text: msg.text, senderName: msg.from?.name || '' })
}

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

async function scrollToMessage(id) {
  await nextTick()
  const el = document.querySelector(`[data-message-id="${id}"]`)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  highlightedId.value = id
  setTimeout(() => { highlightedId.value = null }, 2000)
}

async function scrollToReply(replyTo) {
  const replyId = replyTo._id ?? replyTo
  const sourceChatId = replyTo.chat?._id ?? replyTo.chat

  await nextTick()
  const el = document.querySelector(`[data-message-id="${replyId}"]`)
  if (el) {
    scrollToMessage(replyId)
    return
  }

  if (!sourceChatId || sourceChatId === chatId.value) return

  try {
    const chats = await useMyAuthFetch('chat', { method: 'GET' })
    const sourceChat = chats.find(c => c._id === sourceChatId)
    if (!sourceChat) return

    pendingScrollId = replyId
    const chatUser = sourceChat.isGroup
      ? { _id: sourceChat._id, name: sourceChat.name, isGroup: true, users: sourceChat.users, groupAdmins: sourceChat.groupAdmins, createdAt: sourceChat.createdAt, createdBy: sourceChat.createdBy }
      : sourceChat.users.find(u => u._id !== userId.value)
    chatStore.setChat({ _id: sourceChat._id, user: chatUser })
  } catch { /* ignore */ }
}

function getSelectedMessages() {
  return messagesOnly.value.filter(m => selectedIds.value.includes(m._id)).map(m => ({ _id: m._id, text: m.text }))
}

let pendingScrollId = null

function scheduleScrollToMessage(id) {
  pendingScrollId = id
}

defineExpose({ deleteSelected, scrollToMessage, getSelectedMessages, scheduleScrollToMessage })

function toggleMenu(id) {
  openMenuId.value = openMenuId.value === id ? null : id
}

function handleClickOutside() {
  openMenuId.value = null
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  if (chatId.value && chatId.value !== 'new-chat') {
    await getMessages()
    conn.value?.addEventListener('message', handleEvent)
  }
})
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
const { clearedChatState } = useClearChatState()
const { deletedChatState } = useDeleteChatState()

const userStore = useUserStore()
const chatStore = useChatStore()
const wsStore = useWsStore()

const { _id: userId } = storeToRefs(userStore)
const { _id: chatId, user: chatUser } = storeToRefs(chatStore)
const { conn } = storeToRefs(wsStore)

function resolveReplyTo(replyTo) {
  if (!replyTo) return null
  const fromId = replyTo.from?._id || replyTo.from
  const isMine = fromId === userId.value
  return {
    ...replyTo,
    isMine,
    senderName: isMine ? 'You' : replyTo.from?.name || ''
  }
}

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

const messagesOnly = computed(() => messages.value.filter(m => !m.isEvent))

function isUnreadByMe(msg) {
  if (msg.isMine) return false
  if (chatUser.value?.isGroup) {
    return !(msg.readBy ?? []).includes(userId.value)
  }
  return msg.status === StatusMessage.RECEIVED
}

function showUnreadMessage(messageId) {
  const msgIndex = messagesOnly.value.findIndex(m => m._id === messageId)
  if (msgIndex <= 0) return false

  const previousMsg = messagesOnly.value[msgIndex - 1]
  const currentMsg = messagesOnly.value[msgIndex]

  return isUnreadByMe(currentMsg) && !isUnreadByMe(previousMsg)
}

function numberOfUnreadMessages(messageId) {
  const msgIndex = messagesOnly.value.findIndex(m => m._id === messageId)
  return messagesOnly.value.length - msgIndex
}

function isFirst(messageId) {
  const msgIndex = messagesOnly.value.findIndex(m => m._id === messageId)
  if (msgIndex <= 0) return true

  const previousMsg = messagesOnly.value[msgIndex - 1]
  const currentMsg = messagesOnly.value[msgIndex]

  return currentMsg.from?._id !== previousMsg.from?._id
}

function isLast(messageId) {
  const msgIndex = messagesOnly.value.findIndex(m => m._id === messageId)
  return msgIndex === messagesOnly.value.length - 1
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
    const [response, events] = await Promise.all([
      useMyAuthFetch(`message/${chatId.value}`, { method: 'GET' }),
      chatUser.value?.isGroup ? useMyAuthFetch(`chat/${chatId.value}/events`, { method: 'GET' }) : Promise.resolve([])
    ])
    const mappedMessages = response.map(msg => ({
      ...msg,
      isMine: msg.from._id === userId.value,
      replyTo: resolveReplyTo(msg.replyTo)
    }))
    const mappedEvents = events.map(e => ({ ...e, isEvent: true }))
    messages.value = sortMessages([...mappedMessages, ...mappedEvents])
    if (pendingScrollId) {
      const id = pendingScrollId
      pendingScrollId = null
      await scrollToMessage(id)
    } else {
      await scrollToBottom()
    }
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
  } else if (name === 'chat-event') {
    newChatEvent(msg)
  } else if (name === 'typing') {
    setTyping(msg.chatId, msg.from)
  }
}

function newChatEvent(event) {
  if ((event.chat?._id ?? event.chat) === chatId.value) {
    messages.value.push({ ...event, isEvent: true })
    messages.value = sortMessages(messages.value)
    scrollToBottom({ behavior: 'smooth' })
  }
}

function newMessage(message) {
  if (message.chat._id === chatId.value) {
    const isMine = message.from._id === userId.value
    const replyTo = resolveReplyTo(message.replyTo)
    messages.value.push({ ...message, isMine, replyTo })
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

function isNearBottom() {
  let el = bottomEl.value?.parentElement
  while (el) {
    const overflow = getComputedStyle(el).overflowY
    if (overflow === 'auto' || overflow === 'scroll') {
      return el.scrollHeight - el.scrollTop - el.clientHeight <= 100
    }
    el = el.parentElement
  }
  return true
}

watch(() => typingChats.value[chatId.value], (isTyping) => {
  if (isTyping && isNearBottom()) {
    scrollToBottom({ behavior: 'smooth' })
  }
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
