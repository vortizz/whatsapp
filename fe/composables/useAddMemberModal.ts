import { storeToRefs } from 'pinia'
import { useChatStore } from '../store/chat'

export function useAddMemberModal() {
    const isOpen = useState('add-member-modal-open', () => false)
    const membersUpdatedState = useState('members-updated-state', () => ({
        chatId: '',
        users: [] as any[],
        groupAdmins: [] as any[],
        nonce: 0
    }))
    const chatStore = useChatStore()
    const { user: chatUser } = storeToRefs(chatStore)

    function openModal() {
        isOpen.value = true
    }

    function closeModal() {
        isOpen.value = false
    }

    function onMembersAdded(updatedChat: any) {
        ;(chatUser.value as any).users = updatedChat.users
        ;(chatUser.value as any).groupAdmins = updatedChat.groupAdmins
        membersUpdatedState.value = {
            chatId: updatedChat._id,
            users: updatedChat.users,
            groupAdmins: updatedChat.groupAdmins,
            nonce: membersUpdatedState.value.nonce + 1
        }
    }

    return { isOpen, membersUpdatedState, onMembersAdded, openModal, closeModal }
}
