import { storeToRefs } from 'pinia'
import { useChatStore } from '../store/chat'
import { useUserStore } from '../store/user'

export function useUnblockUserModal() {
  const isOpen = useState('unblock-user-modal-open', () => false)
  const unblockingUserId = useState('unblocking-user-id', () => '')
  const userOverride = useState<{ _id: string; name: string } | null>(
    'unblock-user-override',
    () => null,
  )

  const chatStore = useChatStore()
  const userStore = useUserStore()
  const { user: chatUser } = storeToRefs(chatStore)

  const targetUser = computed(() => userOverride.value ?? chatUser.value)
  const chatUserId = computed(() => targetUser.value?._id || '')
  const isUnblockingUser = computed(() => unblockingUserId.value === chatUserId.value)
  const isUnblockUserDisabled = computed(() => !chatUserId.value || isUnblockingUser.value)

  function openModal(user?: { _id: string; name: string }) {
    userOverride.value = user ?? null
    if (isUnblockUserDisabled.value) {
      return
    }

    isOpen.value = true
  }

  function closeModal() {
    isOpen.value = false
    userOverride.value = null
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
    targetUser,
    isUnblockingUser,
    isUnblockUserDisabled,
    openModal,
    closeModal,
    confirmUnblockUser,
  }
}
