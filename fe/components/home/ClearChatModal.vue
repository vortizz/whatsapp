<template>
    <Teleport to="body">
        <div
            v-if="isOpen"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-5"
            @click.self="closeModal"
        >
            <div class="w-full max-w-lg rounded-2xl bg-white py-5 px-6 shadow-2xl dark:bg-neutral-800">
                <div class="text-xl mb-5 font-semibold text-neutral-950 dark:text-white">
                    Clear this chat?
                </div>
                <div class="max-w-3xl text-sm leading-relaxed text-neutral-500 dark:text-white/60">
                    This chat will be empty but will remain in your chat list.
                </div>

                <div class="mt-12 flex justify-end gap-2">
                    <button
                        class="text-sm font-semibold px-4 py-2.5 rounded-full text-emerald-700 dark:text-emerald-500 bg-transparent hover:bg-emerald-50 dark:hover:bg-emerald-900 transition-colors disabled:cursor-not-allowed disabled:opacity-35"
                        :disabled="isClearingChat"
                        @click="closeModal"
                    >
                        Cancel
                    </button>
                    <button
                        class="rounded-full bg-rose-600 dark:bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white dark:text-neutral-950 transition-colors hover:bg-rose-700 dark:hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-35"
                        :disabled="isClearChatDisabled"
                        @click="confirmClearChat"
                    >
                        <span v-if="!isClearingChat">Clear chat</span>
                        <span v-else>Clearing...</span>
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
const {
    isOpen,
    isClearingChat,
    isClearChatDisabled,
    closeModal,
    confirmClearChat
} = useClearChatModal()
</script>

<style>

</style>
