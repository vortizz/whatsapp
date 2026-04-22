import { storeToRefs } from 'pinia'
import { useChatStore } from '../store/chat'
import { useUserStore } from '../store/user'

export function useBlockUserModal() {
  const isOpen = useState('block-user-modal-open', () => false)
  const blockingUserId = useState('blocking-user-id', () => '')
  const userOverride = useState<{ _id: string; name: string } | null>(
    'block-user-override',
    () => null,
  )

  const chatStore = useChatStore()
  const userStore = useUserStore()
  const { users: chatUsers } = storeToRefs(chatStore)

  const chatFirstUser = computed(() => chatUsers.value?.find((user) => user._id !== userStore._id))
  const targetUser = computed(() => userOverride.value ?? chatFirstUser.value)
  const chatUserId = computed(() => targetUser.value?._id || '')
  const isBlockingUser = computed(() => blockingUserId.value === chatUserId.value)
  const isBlockUserDisabled = computed(() => !chatUserId.value || isBlockingUser.value)

  function openModal(user?: { _id: string; name: string }) {
    userOverride.value = user ?? null
    if (isBlockUserDisabled.value) {
      return
    }
    isOpen.value = true
  }

  function closeModal() {
    isOpen.value = false
    userOverride.value = null
  }

  async function confirmBlockUser() {
    if (isBlockUserDisabled.value) {
      return
    }

    try {
      blockingUserId.value = chatUserId.value
      await useMyAuthFetch('user/block', {
        method: 'POST',
        body: { user_id: chatUserId.value },
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
    targetUser,
    isBlockingUser,
    isBlockUserDisabled,
    openModal,
    closeModal,
    confirmBlockUser,
  }
}
