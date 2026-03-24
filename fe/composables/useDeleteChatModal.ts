import { storeToRefs } from 'pinia'
import { useChatStore } from '../store/chat'

export function useDeleteChatModal() {
    const isOpen = useState('delete-chat-modal-open', () => false)

    const chatStore = useChatStore()
    const { _id: chatId } = storeToRefs(chatStore)
    const { deletingChatId, deletedChatState } = useDeleteChatState()

    const isDeletingChat = computed(() => deletingChatId.value === chatId.value)
    const isDeleteChatDisabled = computed(() => !chatId.value || isDeletingChat.value)

    function openModal() {
        if (isDeleteChatDisabled.value) {
            return
        }

        isOpen.value = true
    }

    function closeModal() {
        isOpen.value = false
    }

    async function confirmDeleteChat() {
        if (isDeleteChatDisabled.value) {
            return
        }

        try {
            deletingChatId.value = chatId.value
            await useMyAuthFetch(`message/${chatId.value}`, { method: 'DELETE' })
            deletedChatState.value = {
                chatId: chatId.value,
                nonce: Date.now()
            }
            chatStore.clearChat()
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
        isDeletingChat,
        isDeleteChatDisabled,
        openModal,
        closeModal,
        confirmDeleteChat
    }
}
