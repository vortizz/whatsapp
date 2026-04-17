<template>
  <div class="p-1">
    <button
      class="text-neutral-950 w-full text-left px-4 py-2 hover:bg-stone-400/10 flex items-center gap-3 rounded-xl dark:text-zinc-50"
      @click="showContactInfo"
    >
      <Icon class="text-base" name="zondicons:information-outline" />
      <span class="text-sm">Contact info</span>
    </button>
    <button
      class="text-neutral-950 w-full text-left px-4 py-2 hover:bg-stone-400/10 flex items-center gap-3 rounded-xl dark:text-zinc-50"
      @click="closeChat"
    >
      <Icon class="text-base" name="zondicons:close-outline" />
      <span class="text-sm">Close chat</span>
    </button>
    <div class="border-t border-neutral-950/10 dark:border-white/10 mx-2 my-1.5" />
    <button
      class="text-neutral-950 w-full text-left px-4 py-2 enabled:hover:bg-rose-600/10 enabled:dark:hover:bg-rose-500/10 enabled:dark:hover:text-rose-300 flex items-center gap-3 rounded-xl enabled:hover:text-rose-700 enabled:dark:text-zinc-50 disabled:opacity-35 disabled:cursor-not-allowed disabled:dark:text-neutral-400"
      :disabled="isClearChatDisabled"
      @click="clearMessages"
    >
      <Icon class="text-base" name="zondicons:minus-outline" />
      <span class="text-sm">Clear chat</span>
    </button>
    <button
      class="text-neutral-950 w-full text-left px-4 py-2 enabled:hover:bg-rose-600/10 enabled:dark:hover:bg-rose-500/10 enabled:dark:hover:text-rose-300 flex items-center gap-3 rounded-xl enabled:hover:text-rose-700 enabled:dark:text-zinc-50 disabled:opacity-35 disabled:cursor-not-allowed disabled:dark:text-neutral-400"
      :disabled="isBlockedUser ? isUnblockUserDisabled : isBlockUserDisabled"
      @click="toggleBlockUser"
    >
      <Icon class="text-base" name="ic:baseline-block" />
      <span class="text-sm">{{ isBlockedUser ? 'Unblock' : 'Block' }}</span>
    </button>
    <button
      class="text-neutral-950 w-full text-left px-4 py-2 enabled:hover:bg-rose-600/10 enabled:dark:hover:bg-rose-500/10 enabled:dark:hover:text-rose-300 flex items-center gap-3 rounded-xl enabled:hover:text-rose-700 dark:text-zinc-50 disabled:opacity-35 disabled:cursor-not-allowed disabled:dark:text-neutral-400"
      :disabled="isDeleteChatDisabled"
      @click="deleteChat"
    >
      <Icon class="text-base" name="line-md:trash" />
      <span class="text-sm">Delete chat</span>
    </button>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useChatStore } from '../../../store/chat'
  import { useUserStore } from '../../../store/user'

  const emit = defineEmits(['close', 'showContactInfo'])

  const chatStore = useChatStore()
  const userStore = useUserStore()
  const { user: chatUser } = storeToRefs(chatStore)

  const { openModal, isClearChatDisabled } = useClearChatModal()
  const { openModal: openUnblockModal, isUnblockUserDisabled } = useUnblockUserModal()
  const { openModal: openBlockModal, isBlockUserDisabled } = useBlockUserModal()
  const { openModal: openDeleteModal, isDeleteChatDisabled } = useDeleteChatModal()

  const isBlockedUser = computed(() => userStore.hasBlockedUser(chatUser.value?._id))

  function showContactInfo() {
    emit('close')
    emit('showContactInfo')
  }

  function closeChat() {
    emit('close')
    chatStore.setChat({ _id: '', user: {} })
  }

  function clearMessages() {
    if (isClearChatDisabled.value) return
    emit('close')
    openModal()
  }

  function toggleBlockUser() {
    if (isBlockedUser.value ? isUnblockUserDisabled.value : isBlockUserDisabled.value) return
    emit('close')
    if (isBlockedUser.value) {
      openUnblockModal()
      return
    }
    openBlockModal()
  }

  function deleteChat() {
    if (isDeleteChatDisabled.value) return
    emit('close')
    openDeleteModal()
  }
</script>
