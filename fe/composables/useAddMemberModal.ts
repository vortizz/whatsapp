import { storeToRefs } from 'pinia'
import { useChatStore } from '../store/chat'

export function useAddMemberModal() {
    const isOpen = useState('add-member-modal-open', () => false)
    const chatStore = useChatStore()
    const { user: chatUser } = storeToRefs(chatStore)

    function openModal() {
        isOpen.value = true
    }

    function closeModal() {
        isOpen.value = false
    }

    function onMembersAdded(updatedChat: any) {
        chatUser.value.users = updatedChat.users
        ;(chatUser.value as any).groupAdmins = updatedChat.groupAdmins
    }

    return { isOpen, onMembersAdded, openModal, closeModal }
}
