<template>
  <div class="bg-stone-100 px-5 py-3.5 dark:bg-neutral-800 flex items-center justify-center gap-12">
    <button
      class="flex items-center justify-center gap-2 rounded-full border border-black/20 px-4 py-2.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-35 dark:border-white/10 dark:text-rose-300 dark:hover:bg-rose-500/10"
      :disabled="isDeleteChatDisabled"
      @click="openDeleteChat"
    >
      <Icon name="ic:baseline-delete-outline" class="text-xl" />
      <span>Delete chat</span>
    </button>
    <button
      class="flex items-center justify-center gap-3 rounded-full border border-black/20 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-35 dark:border-white/10 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
      :disabled="isUnblockUserDisabled"
      @click="openUnblockUser"
    >
      <Icon name="material-symbols:block-outline" class="text-xl" />
      <span>Unblock</span>
    </button>
  </div>
</template>

<script setup>
  const { openModal: openDeleteModal, isDeleteChatDisabled } = useDeleteChatModal()
  const { openModal: openUnblockModal, isUnblockUserDisabled } = useUnblockUserModal()

  function openDeleteChat() {
    if (isDeleteChatDisabled.value) {
      return
    }

    openDeleteModal()
  }

  function openUnblockUser() {
    if (isUnblockUserDisabled.value) {
      return
    }

    openUnblockModal()
  }
</script>

<style></style>
