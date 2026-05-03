<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
      @click.self="closeModal"
    >
      <div class="w-full max-w-lg rounded-2xl bg-white py-5 px-6 shadow-2xl dark:bg-neutral-800">
        <div class="text-xl mb-5 font-semibold text-neutral-950 dark:text-white">
          Unblock <span v-if="targetUser?.name">{{ targetUser.name }}</span
          >?
        </div>

        <div class="mt-[70px] flex justify-end gap-2">
          <button
            class="rounded-full px-4 py-2.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-35 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
            :disabled="isUnblockingUser"
            @click="closeModal"
          >
            Cancel
          </button>
          <button
            aria-label="confirm-unblock"
            class="rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-35 dark:text-neutral-950"
            :disabled="isUnblockUserDisabled"
            @click="confirmUnblockUser"
          >
            <span v-if="!isUnblockingUser">Unblock</span>
            <span v-else>Unblocking...</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
  const {
    isOpen,
    targetUser,
    isUnblockingUser,
    isUnblockUserDisabled,
    closeModal,
    confirmUnblockUser,
  } = useUnblockUserModal()
</script>

<style></style>
