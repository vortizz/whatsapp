import { storeToRefs } from 'pinia'
import { useChatStore } from '../store/chat'

export function useRemoveMemberModal() {
    const isOpen = useState('remove-member-modal-open', () => false)
    const targetMember = useState<{ _id: string, name: string } | null>('remove-member-target', () => null)
    const isSubmitting = useState('remove-member-submitting', () => false)

    const chatStore = useChatStore()
    const { _id: chatId, user: chatUser } = storeToRefs(chatStore)

    const groupName = computed(() => (chatUser.value as any)?.name ?? '')

    function openModal(member: { _id: string, name: string }) {
        targetMember.value = member
        isOpen.value = true
    }

    function closeModal() {
        isOpen.value = false
        targetMember.value = null
    }

    async function confirm() {
        if (!targetMember.value || isSubmitting.value) return
        try {
            isSubmitting.value = true
            const updated = await useMyAuthFetch(`chat/${chatId.value}/member/${targetMember.value._id}`, {
                method: 'PATCH',
            }) as any
            chatStore.$patch(state => {
                (state.user as any).users = updated.users
                ;(state.user as any).groupAdmins = updated.groupAdmins
            })
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
        targetMember,
        groupName,
        isSubmitting,
        openModal,
        closeModal,
        confirm,
    }
}
