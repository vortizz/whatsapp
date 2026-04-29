<template>
  <form @submit.prevent="send">
    <div v-if="replyTo" class="flex items-center gap-2 px-4 bg-[#efeae2] dark:bg-neutral-900/5">
      <div class="w-full px-2 bg-white dark:bg-neutral-800 pt-2 rounded-t-xl shadow-md">
        <div
          class="flex-1 flex items-center gap-2 rounded-xl bg-neutral-100 dark:bg-neutral-900/50 px-3 py-2 border-l-4 border-emerald-500 min-w-0"
        >
          <div class="flex-1 min-w-0">
            <div
              class="text-sm font-semibold text-emerald-600 dark:text-emerald-400 truncate mb-0.5"
            >
              {{ replyTo.senderName }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {{ replyTo.text }}
            </div>
          </div>
          <button
            type="button"
            class="flex items-center p-2 rounded-full text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 flex-none"
            @click="clearReply"
          >
            <Icon name="mdi:close" class="text-xl" />
          </button>
        </div>
      </div>
    </div>
    <div
      class="pb-3 px-4 w-full bg-[#efeae2] dark:bg-neutral-900/5 flex flex-row gap-4 items-center"
    >
      <div
        class="flex items-end w-full bg-white dark:bg-neutral-800 shadow-md"
        :class="replyTo ? 'rounded-b-3xl' : 'rounded-3xl'"
      >
        <HomeMainEmojiPicker class="ml-2" @select="onEmojiSelect" />
        <textarea
          ref="rInput"
          v-model="message"
          aria-label="new-msg"
          placeholder="Type a message"
          rows="1"
          class="flex-1 w-full text-sm text-neutral-950 dark:placeholder:text-white/60 dark:text-white rounded-3xl py-3.5 pr-5 pl-2 focus:outline-none placeholder:text-gray-600 caret-emerald-500 dark:bg-neutral-800 resize-none overflow-hidden leading-normal"
          @focus="onFocusInput"
          @input="onInput"
          @keydown.enter.exact.prevent="send"
          @keydown.shift.enter="$nextTick(autoResize)"
        />
        <div v-if="message.trim()" class="p-1 flex-none flex items-center">
          <button
            v-if="!isLoading"
            aria-label="send-msg"
            type="submit"
            :disabled="!message.trim()"
            class="flex items-center text-2xl p-2 h-full leading-none rounded-full text-white dark:text-neutral-950 bg-emerald-500 hover:bg-emerald-600 transition-colors"
          >
            <Icon name="material-symbols:send" />
          </button>
          <button
            v-else
            disabled
            type="button"
            class="flex items-center text-2xl p-1 leading-none rounded-full"
          >
            <svg
              aria-hidden="true"
              role="status"
              class="inline w-5 h-5 me-3 text-teal-600 animate-spin"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="#E5E7EB"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup>
  import { useChatStore } from '../../../store/chat'
  import { useMessageReplyStore } from '../../../store/messageReply'
  import { useUserStore } from '../../../store/user'

  const replyStore = useMessageReplyStore()
  const crypto = useCrypto()
  const indexedDB = useIndexedDB()
  const chatStore = useChatStore()
  const userStore = useUserStore()
  const { conn } = useWs()

  const message = ref('')
  const isLoading = ref(false)

  function onEmojiSelect(emoji) {
    const el = rInput.value
    const start = el.selectionStart ?? message.value.length
    const end = el.selectionEnd ?? message.value.length
    message.value = message.value.slice(0, start) + emoji + message.value.slice(end)
    nextTick(() => {
      const pos = start + emoji.length
      el.setSelectionRange(pos, pos)
      el.focus()
      autoResize()
    })
  }
  const typingThrottleTimer = ref(null)
  const rInput = ref(null)

  const { _id: chatId, users: chatUsers, isGroup: isGroupChat } = storeToRefs(chatStore)
  const { _id: userId, publicKey } = storeToRefs(userStore)

  const chatFirstUser = computed(() => chatUsers.value?.find((u) => u._id !== userId.value))
  const replyTo = computed(() => replyStore.replyTo)

  watch(chatId, (newValue, oldValue) => {
    if (newValue && newValue !== oldValue) {
      message.value = ''
      isLoading.value = false
      replyStore.clearReply()
      nextTick(() => {
        rInput.value.focus()
        rInput.value.style.height = 'auto'
      })
    }
  })

  function onInput() {
    autoResize()
    if (chatId.value === 'new-chat') return
    if (!typingThrottleTimer.value) {
      sendTypingEvent()
      typingThrottleTimer.value = setTimeout(() => {
        typingThrottleTimer.value = null
      }, 2000)
    }
  }

  function sendTypingEvent() {
    if (!conn.value || conn.value.readyState !== WebSocket.OPEN) return
    conn.value.send(
      JSON.stringify({
        event: 'typing',
        data: { chatId: chatId.value },
      }),
    )
  }

  function autoResize() {
    const el = rInput.value
    el.style.height = 'auto'
    const style = window.getComputedStyle(el)
    const lineHeight = parseFloat(style.lineHeight)
    const paddingTop = parseFloat(style.paddingTop)
    const paddingBottom = parseFloat(style.paddingBottom)
    const maxHeight = lineHeight * 8 + paddingTop + paddingBottom
    if (el.scrollHeight <= maxHeight) {
      el.style.height = el.scrollHeight + 'px'
      el.style.overflowY = 'hidden'
    } else {
      el.style.height = maxHeight + 'px'
      el.style.overflowY = 'auto'
    }
  }

  function clearReply() {
    replyStore.clearReply()
  }

  async function send() {
    if (!message.value.trim()) return
    try {
      isLoading.value = true
      let newChat

      if (chatId.value === 'new-chat') {
        newChat = await createChat()
      }

      const privateKey = await indexedDB.getKey(userId.value, 'privateKey')

      const encryptedAESKey = (newChat || chatStore).encryptedKeys.find(
        (k) => k.userId === userId.value,
      )?.encryptedKey

      const result = await crypto.encryptMessage(message.value, encryptedAESKey, privateKey)

      const body = {
        chat: newChat?._id || chatId.value,
        text: result.ciphertext,
        iv: result.iv,
        ...(!isGroupChat.value ? { to: chatFirstUser.value._id } : {}),
        ...(replyTo.value ? { replyTo: replyTo.value._id } : {}),
      }
      await useMyAuthFetch('message', { method: 'POST', body })
      message.value = ''
      rInput.value.style.height = 'auto'
      replyStore.clearReply()

      if (chatId.value === 'new-chat' && newChat) {
        chatStore.setChat({
          _id: newChat._id,
          users: newChat.users,
          createdAt: newChat.createdAt,
          encryptedKeys: newChat.encryptedKeys,
        })
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const data = error?.data || {}
      const msg = Array.isArray(data.message) ? data.message[0] : data.message
      useNuxtApp().$toast.error(msg)
    } finally {
      isLoading.value = false
    }
  }

  async function onFocusInput() {
    if (chatId.value === 'new-chat') return
    await useMyAuthFetch(`message/${chatId.value}/read`, { method: 'PUT' })
  }

  async function createChat() {
    try {
      const encryptedKeys = await crypto.generateSharedKeys([
        {
          userId: userId.value,
          publicKeyBase64: publicKey.value,
        },
        {
          userId: chatFirstUser.value._id,
          publicKeyBase64: chatFirstUser.value.publicKey,
        },
      ])
      return await useMyAuthFetch('chat', {
        method: 'POST',
        body: { user_id: chatFirstUser.value._id, encryptedKeys },
      })
    } catch (error) {
      const data = error?.data || {}
      const msg = Array.isArray(data.message) ? data.message[0] : data.message
      useNuxtApp().$toast.error(msg)
    }
  }
</script>

<style scoped>
  textarea::-webkit-scrollbar {
    width: 4px;
  }
  textarea::-webkit-scrollbar-track {
    background: transparent;
  }
  textarea::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.25);
    border-radius: 9999px;
  }
  .dark textarea::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
  }
</style>
