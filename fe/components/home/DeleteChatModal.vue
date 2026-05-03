<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-5"
      @click.self="closeModal"
    >
      <div class="w-full max-w-lg rounded-2xl bg-white py-5 px-6 shadow-2xl dark:bg-neutral-800">
        <div class="text-xl mb-5 font-semibold text-neutral-950 dark:text-white">
          Delete chat<span v-if="displayName"> with {{ displayName }}</span
          >?
        </div>
        <div class="max-w-3xl text-sm leading-relaxed text-neutral-500 dark:text-white/60">
          Messages will be removed from your chat list.
        </div>

        <div class="mt-12 flex justify-end gap-2">
          <button
            class="text-sm font-semibold px-4 py-2.5 rounded-full text-emerald-700 dark:text-emerald-500 bg-transparent hover:bg-emerald-50 dark:hover:bg-emerald-900 transition-colors disabled:cursor-not-allowed disabled:opacity-35"
            :disabled="isDeletingChat"
            @click="closeModal"
          >
            Cancel
          </button>
          <button
            class="rounded-full bg-rose-600 dark:bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white dark:text-neutral-950 transition-colors hover:bg-rose-700 dark:hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-35"
            :disabled="isDeleteChatDisabled"
            @click="confirmDeleteChat"
          >
            <span v-if="!isDeletingChat">Delete chat</span>
            <span v-else>Deleting...</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
  import { storeToRefs } from 'pinia'
  import { useChatStore } from '../../store/chat'
  import { useUserStore } from '../../store/user'

  const chatStore = useChatStore()
  const userStore = useUserStore()

  const { users: chatUsers, name: chatName } = storeToRefs(chatStore)
  const { _id: userId } = storeToRefs(userStore)

  const {
    isOpen,
    targetNameOverride,
    isDeletingChat,
    isDeleteChatDisabled,
    closeModal,
    confirmDeleteChat,
  } = useDeleteChatModal()

  const chatFirstUser = computed(() => chatUsers.value.find((u) => u._id !== userId.value))
  const displayName = computed(
    () => targetNameOverride.value || chatName.value || chatFirstUser.value?.name,
  )
</script>

<style></style>
