import { storeToRefs } from 'pinia'
import { useChatStore } from '../store/chat'

export function useDeleteChatModal() {
    const isOpen = useState('delete-chat-modal-open', () => false)
    const chatIdOverride = useState('delete-chat-id-override', () => '')
    const targetNameOverride = useState('delete-chat-name-override', () => '')

    const chatStore = useChatStore()
    const { _id: chatId } = storeToRefs(chatStore)
    const { deletingChatId, deletedChatState } = useDeleteChatState()

    const effectiveChatId = computed(() => chatIdOverride.value || chatId.value)
    const isDeletingChat = computed(() => deletingChatId.value === effectiveChatId.value)
    const isDeleteChatDisabled = computed(() => !effectiveChatId.value || isDeletingChat.value)

    function openModal(overrideChatId?: string, overrideName?: string) {
        chatIdOverride.value = overrideChatId ?? ''
        targetNameOverride.value = overrideName ?? ''
        if (isDeleteChatDisabled.value) {
            return
        }

        isOpen.value = true
    }

    function closeModal() {
        isOpen.value = false
        chatIdOverride.value = ''
        targetNameOverride.value = ''
    }

    async function confirmDeleteChat() {
        if (isDeleteChatDisabled.value) {
            return
        }

        try {
            deletingChatId.value = effectiveChatId.value
            await useMyAuthFetch(`message/${effectiveChatId.value}`, { method: 'DELETE' })
            deletedChatState.value = {
                chatId: effectiveChatId.value,
                nonce: Date.now()
            }
            if (!chatIdOverride.value) {
                chatStore.clearChat()
            }
            closeModal()
        } catch (error) {
            const data = error?.data || {}
            const message = Array.isArray(data.message) ? data.message[0] : data.message
            useNuxtApp().$toast.error(message)
        } finally {
            deletingChatId.value = ''
        }
    }

    return {
        isOpen,
        targetNameOverride,
        isDeletingChat,
        isDeleteChatDisabled,
        openModal,
        closeModal,
        confirmDeleteChat
    }
}
