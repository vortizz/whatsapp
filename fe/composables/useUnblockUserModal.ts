import { storeToRefs } from 'pinia'
import { useChatStore } from '../store/chat'
import { useUserStore } from '../store/user'

export function useUnblockUserModal() {
    const isOpen = useState('unblock-user-modal-open', () => false)
    const unblockingUserId = useState('unblocking-user-id', () => '')

    const chatStore = useChatStore()
    const userStore = useUserStore()
    const { user: chatUser } = storeToRefs(chatStore)

    const chatUserId = computed(() => chatUser.value?._id || '')
    const isUnblockingUser = computed(() => unblockingUserId.value === chatUserId.value)
    const isUnblockUserDisabled = computed(() => !chatUserId.value || isUnblockingUser.value)

    function openModal() {
        if (isUnblockUserDisabled.value) {
            return
        }

        isOpen.value = true
    }

    function closeModal() {
        isOpen.value = false
    }

    async function confirmUnblockUser() {
        if (isUnblockUserDisabled.value) {
            return
        }

        try {
            unblockingUserId.value = chatUserId.value
            await useMyAuthFetch(`user/block/${chatUserId.value}`, { method: 'DELETE' })
            userStore.removeBlockedUser(chatUserId.value)
            closeModal()
        } catch (error) {
            const data = error?.data || {}
            const message = Array.isArray(data.message) ? data.message[0] : data.message
            useNuxtApp().$toast.error(message)
        } finally {
            unblockingUserId.value = ''
        }
    }

    return {
        isOpen,
        isUnblockingUser,
        isUnblockUserDisabled,
        openModal,
        closeModal,
        confirmUnblockUser
    }
}
