<template>
  <div class="flex flex-col px-2.5">
    <button
      class="enabled:text-rose-700 enabled:dark:text-rose-300 text-left py-4 px-7 p flex flex-row items-center gap-5 enabled:hover:bg-stone-100 transition-colors rounded-xl enabled:dark:hover:bg-neutral-800 disabled:text-neutral-950 disabled:opacity-35 disabled:cursor-not-allowed disabled:dark:text-neutral-400"
      :disabled="isClearChatDisabled"
      @click="openModal"
    >
        <Icon name="zondicons:minus-outline" class="text-xl" />
        <span class="text-base">Clear chat</span>
    </button>
    <button
      class="enabled:text-rose-700 enabled:dark:text-rose-300 text-left py-4 px-7 p flex flex-row items-center gap-5 enabled:hover:bg-stone-100 transition-colors rounded-xl enabled:dark:hover:bg-neutral-800 disabled:text-neutral-950 disabled:opacity-35 disabled:cursor-not-allowed disabled:dark:text-neutral-400"
      :disabled="isBlockedUser ? isUnblockUserDisabled : isBlockUserDisabled"
      @click="isBlockedUser ? openUnblockModal() : openBlockModal()"
    >
        <Icon name="ic:baseline-block" class="text-xl" />
        <span class="text-base">{{ isBlockedUser ? 'Unblock' : 'Block' }} {{ chatUser.name }}</span>
    </button>
    <button
      class="enabled:text-rose-700 enabled:dark:text-rose-300 text-left py-4 px-7 p flex flex-row items-center gap-5 enabled:hover:bg-stone-100 transition-colors rounded-xl enabled:dark:hover:bg-neutral-800 disabled:text-neutral-950 disabled:opacity-35 disabled:cursor-not-allowed disabled:dark:text-neutral-400"
      :disabled="isDeleteChatDisabled"
      @click="openDeleteModal"
    >
        <Icon name="ic:baseline-delete" class="text-xl" />
        <span class="text-base">Delete chat</span>
    </button>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useChatStore } from '../../../store/chat'
import { useUserStore } from '../../../store/user'

const chatStore = useChatStore()
const userStore = useUserStore()
const { isClearChatDisabled, openModal } = useClearChatModal()
const { isBlockUserDisabled, openModal: openBlockModal } = useBlockUserModal()
const { isUnblockUserDisabled, openModal: openUnblockModal } = useUnblockUserModal()
const { isDeleteChatDisabled, openModal: openDeleteModal } = useDeleteChatModal()

const { user: chatUser } = storeToRefs(chatStore)
const isBlockedUser = computed(() => userStore.hasBlockedUser(chatUser.value?._id))
</script>

<style>

</style>
