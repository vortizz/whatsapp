import { storeToRefs } from 'pinia'
import { useChatStore } from '../store/chat'

export function useClearChatModal() {
    const isOpen = useState('clear-chat-modal-open', () => false)

    const chatStore = useChatStore()
    const { _id: chatId } = storeToRefs(chatStore)
    const { clearingChatId, clearedChatState, selectedChatHasMessages } = useClearChatState()

    const isClearingChat = computed(() => clearingChatId.value === chatId.value)
    const isClearChatDisabled = computed(() => !chatId.value || isClearingChat.value || !selectedChatHasMessages.value)

    function openModal() {
        if (isClearChatDisabled.value) {
            return
        }

        isOpen.value = true
    }

    function closeModal() {
        isOpen.value = false
    }

    async function confirmClearChat() {
        if (isClearChatDisabled.value) {
            return
        }

        try {
            clearingChatId.value = chatId.value
            await useMyAuthFetch(`message/${chatId.value}/clear`, { method: 'DELETE' })
            clearedChatState.value = {
                chatId: chatId.value,
                nonce: Date.now()
            }
            selectedChatHasMessages.value = false
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
        confirmClearChat
    }
}
