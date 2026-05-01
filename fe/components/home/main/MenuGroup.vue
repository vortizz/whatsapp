<template>
  <div class="p-1">
    <button
      v-if="isGroupAdmin(userId)"
      class="text-neutral-950 w-full text-left px-4 py-2 hover:bg-stone-400/10 flex items-center gap-3 rounded-xl dark:text-zinc-50"
      @click="openAddMemberModal"
    >
      <Icon class="text-base" name="material-symbols:group-add-outline-rounded" />
      <span class="text-sm">Add member</span>
    </button>
    <button
      class="text-neutral-950 w-full text-left px-4 py-2 hover:bg-stone-400/10 flex items-center gap-3 rounded-xl dark:text-zinc-50"
      @click="showContactInfo"
    >
      <Icon class="text-base" name="material-symbols:info-outline-rounded" />
      <span class="text-sm">Group info</span>
    </button>
    <!-- <button class="text-neutral-950 w-full text-left px-4 py-2 hover:bg-stone-400/10 flex items-center gap-3 rounded-xl dark:text-zinc-50">
            <Icon class="text-base" name="material-symbols:check-box-outline"></Icon>
            <span class="text-sm">Select messages</span>
        </button> -->
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
      <Icon class="text-base" name="ic:outline-remove-circle-outline" />
      <span class="text-sm">Clear chat</span>
    </button>
    <button
      class="text-neutral-950 w-full text-left px-4 py-2 hover:bg-rose-600/10 dark:hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-3 rounded-xl dark:text-zinc-50"
      @click="exitGroup"
    >
      <Icon class="text-base" name="material-symbols:logout-rounded" />
      <span class="text-sm">Exit group</span>
    </button>
  </div>
</template>

<script setup>
  import { useChatStore } from '../../../store/chat'
  import { useUserStore } from '../../../store/user'

  const emit = defineEmits(['close', 'showContactInfo'])

  const chatStore = useChatStore()
  const userStore = useUserStore()

  const { groupAdmins: chatGroupAdmins } = storeToRefs(chatStore)
  const { _id: userId } = storeToRefs(userStore)
  const { openModal, isClearChatDisabled } = useClearChatModal()
  const { openModal: openAddMemberModal } = useAddMemberModal()
  const { openModal: openExitGroupModal } = useExitGroupModal()

  const groupAdminIds = computed(
    () =>
      new Set(
        (chatGroupAdmins.value ?? []).map((a) =>
          typeof a === 'object' && a !== null ? a._id?.toString() : a?.toString(),
        ),
      ),
  )

  function isGroupAdmin(memberId) {
    return groupAdminIds.value.has(memberId?.toString())
  }

  function closeChat() {
    emit('close')
    chatStore.clearChat()
  }

  function clearMessages() {
    if (isClearChatDisabled.value) return
    emit('close')
    openModal()
  }

  function exitGroup() {
    emit('close')
    openExitGroupModal()
  }

  function showContactInfo() {
    emit('close')
    emit('showContactInfo')
  }
</script>
