import { storeToRefs } from 'pinia'
import { useChatStore } from '../store/chat'

export function useMakeGroupAdminModal() {
  const isOpen = useState('make-group-admin-modal-open', () => false)
  const targetMember = useState<{ _id: string; name: string } | null>(
    'make-group-admin-target',
    () => null,
  )
  const isDismiss = useState('make-group-admin-is-dismiss', () => false)
  const isSubmitting = useState('make-group-admin-submitting', () => false)

  const chatStore = useChatStore()
  const { _id: chatId, name: groupName, groupAdmins: chatGroupAdmins } = storeToRefs(chatStore)

  function openModal(member: { _id: string; name: string }, dismiss = false) {
    targetMember.value = member
    isDismiss.value = dismiss
    isOpen.value = true
  }

  function closeModal() {
    isOpen.value = false
    targetMember.value = null
    isDismiss.value = false
  }

  async function confirm() {
    if (!targetMember.value || isSubmitting.value) return
    try {
      isSubmitting.value = true
      const updated = (await useMyAuthFetch(
        `chat/${chatId.value}/group-admin/${targetMember.value._id}`,
        {
          method: 'PATCH',
          body: { is_admin: true },
        },
      )) as any
      chatGroupAdmins.value = updated.groupAdmins
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
    isDismiss,
    isSubmitting,
    openModal,
    closeModal,
    confirm,
  }
}
