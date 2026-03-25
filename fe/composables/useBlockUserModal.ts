import { storeToRefs } from 'pinia'
import { useChatStore } from '../store/chat'
import { useUserStore } from '../store/user'

export function useBlockUserModal() {
    const isOpen = useState('block-user-modal-open', () => false)
    const blockingUserId = useState('blocking-user-id', () => '')

    const chatStore = useChatStore()
    const userStore = useUserStore()
    const { user: chatUser } = storeToRefs(chatStore)

    const chatUserId = computed(() => chatUser.value?._id || '')
    const isBlockingUser = computed(() => blockingUserId.value === chatUserId.value)
    const isBlockUserDisabled = computed(() => !chatUserId.value || isBlockingUser.value)

    function openModal() {
        if (isBlockUserDisabled.value) {
            return
        }

        isOpen.value = true
    }

    function closeModal() {
        isOpen.value = false
    }

    async function confirmBlockUser() {
        if (isBlockUserDisabled.value) {
            return
        }

        try {
            blockingUserId.value = chatUserId.value
            await useMyAuthFetch('user/block', {
                method: 'POST',
                body: { user_id: chatUserId.value }
            })
            userStore.addBlockedUser(chatUserId.value)
            closeModal()
        } catch (error) {
            const data = error?.data || {}
            const message = Array.isArray(data.message) ? data.message[0] : data.message
            useNuxtApp().$toast.error(message)
        } finally {
            blockingUserId.value = ''
        }
    }

    return {
        isOpen,
        isBlockingUser,
        isBlockUserDisabled,
        openModal,
        closeModal,
        confirmBlockUser
    }
}
