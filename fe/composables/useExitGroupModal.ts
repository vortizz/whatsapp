import { storeToRefs } from 'pinia'
import { useChatStore } from '../store/chat'
import { useDeleteChatState } from './useDeleteChatState'

export function useExitGroupModal() {
    const isOpen = useState('exit-group-modal-open', () => false)
    const isSubmitting = useState('exit-group-submitting', () => false)

    const chatStore = useChatStore()
    const { _id: chatId, user: chatUser } = storeToRefs(chatStore)
    const { deletedChatState } = useDeleteChatState()

    const groupName = computed(() => (chatUser.value as any)?.name ?? '')

    function openModal() {
        isOpen.value = true
    }

    function closeModal() {
        isOpen.value = false
    }

    async function confirm() {
        if (isSubmitting.value) return
        try {
            isSubmitting.value = true
            const exitedChatId = chatId.value
            await useMyAuthFetch(`chat/${exitedChatId}/exit`, { method: 'PATCH' })
            deletedChatState.value = { chatId: exitedChatId, nonce: Date.now() }
            chatStore.clearChat()
            closeModal()
        } catch (error: any) {
            const data = error?.data || {}
            const message = Array.isArray(data.message) ? data.message[0] : data.message
            useNuxtApp().$toast.error(message)
        } finally {
            isSubmitting.value = false
        }
    }

    return {
        isOpen,
        groupName,
        isSubmitting,
        openModal,
        closeModal,
        confirm,
    }
}
