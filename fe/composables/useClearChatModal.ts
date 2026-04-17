import { storeToRefs } from 'pinia'
import { useChatStore } from '../store/chat'

export function useClearChatModal() {
  const isOpen = useState('clear-chat-modal-open', () => false)
  const chatIdOverride = useState('clear-chat-id-override', () => '')

  const chatStore = useChatStore()
  const { _id: chatId } = storeToRefs(chatStore)
  const { clearingChatId, clearedChatState, selectedChatHasMessages } = useClearChatState()

  const effectiveChatId = computed(() => chatIdOverride.value || chatId.value)
  const isClearingChat = computed(() => clearingChatId.value === effectiveChatId.value)
  const isClearChatDisabled = computed(
    () =>
      !effectiveChatId.value ||
      isClearingChat.value ||
      (!chatIdOverride.value && !selectedChatHasMessages.value),
  )

  function openModal(overrideChatId?: string) {
    chatIdOverride.value = overrideChatId ?? ''
    if (isClearChatDisabled.value) {
      return
    }

    isOpen.value = true
  }

  function closeModal() {
    isOpen.value = false
    chatIdOverride.value = ''
  }

  async function confirmClearChat() {
    if (isClearChatDisabled.value) {
      return
    }

    try {
      clearingChatId.value = effectiveChatId.value
      await useMyAuthFetch(`message/${effectiveChatId.value}/clear`, { method: 'DELETE' })
      clearedChatState.value = {
        chatId: effectiveChatId.value,
        nonce: Date.now(),
      }
      if (!chatIdOverride.value) {
        selectedChatHasMessages.value = false
      }
      closeModal()
    } catch (error) {
      const data = error?.data || {}
      const message = Array.isArray(data.message) ? data.message[0] : data.message
      useNuxtApp().$toast.error(message)
    } finally {
      clearingChatId.value = ''
    }
  }

  return {
    isOpen,
    isClearingChat,
    isClearChatDisabled,
    openModal,
    closeModal,
    confirmClearChat,
  }
}
