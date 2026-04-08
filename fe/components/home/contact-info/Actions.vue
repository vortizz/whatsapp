<template>
  <div class="flex flex-col px-2.5">
    <button
      class="enabled:text-rose-700 enabled:dark:text-rose-300 text-left py-4 px-7 p flex flex-row items-center gap-5 enabled:hover:bg-stone-100 transition-colors rounded-xl enabled:dark:hover:bg-neutral-800 disabled:text-neutral-950 disabled:opacity-35 disabled:cursor-not-allowed disabled:dark:text-neutral-400"
      :disabled="effectiveClearDisabled"
      @click="handleClearChat"
    >
        <Icon name="zondicons:minus-outline" class="text-xl" />
        <span class="text-base">Clear chat</span>
    </button>
    <button
      class="enabled:text-rose-700 enabled:dark:text-rose-300 text-left py-4 px-7 p flex flex-row items-center gap-5 enabled:hover:bg-stone-100 transition-colors rounded-xl enabled:dark:hover:bg-neutral-800 disabled:text-neutral-950 disabled:opacity-35 disabled:cursor-not-allowed disabled:dark:text-neutral-400"
      :disabled="isBlockedUser ? isUnblockUserDisabled : isBlockUserDisabled"
      @click="isBlockedUser ? openUnblockModal(props.member ?? undefined) : handleBlockUser()"
    >
        <Icon name="ic:baseline-block" class="text-xl" />
        <span class="text-base">{{ isBlockedUser ? 'Unblock' : 'Block' }} {{ displayUser.name }}</span>
    </button>
    <button
      class="enabled:text-rose-700 enabled:dark:text-rose-300 text-left py-4 px-7 p flex flex-row items-center gap-5 enabled:hover:bg-stone-100 transition-colors rounded-xl enabled:dark:hover:bg-neutral-800 disabled:text-neutral-950 disabled:opacity-35 disabled:cursor-not-allowed disabled:dark:text-neutral-400"
      :disabled="effectiveDeleteDisabled"
      @click="handleDeleteChat"
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

const props = defineProps(['member'])

const chatStore = useChatStore()
const userStore = useUserStore()
const { isClearChatDisabled, openModal: openClearModal } = useClearChatModal()
const { isBlockUserDisabled, openModal: openBlockModal } = useBlockUserModal()
const { isUnblockUserDisabled, openModal: openUnblockModal } = useUnblockUserModal()
const { isDeleteChatDisabled, openModal: openDeleteModal } = useDeleteChatModal()

const { user: chatUser } = storeToRefs(chatStore)
const displayUser = computed(() => props.member ?? chatUser.value)
const isBlockedUser = computed(() => userStore.hasBlockedUser(displayUser.value?._id))

const directChatId = ref('')

watchEffect(async () => {
    if (!props.member) {
        directChatId.value = ''
        return
    }
    const chats = await useMyAuthFetch('chat')
    const direct = chats.find(c => !c.isGroup && c.users.some(u => (u._id ?? u) === props.member._id))
    directChatId.value = direct?._id ?? ''
})

const effectiveClearDisabled = computed(() => props.member ? !directChatId.value : isClearChatDisabled.value)
const effectiveDeleteDisabled = computed(() => props.member ? !directChatId.value : isDeleteChatDisabled.value)

function handleClearChat() {
    openClearModal(props.member ? directChatId.value : undefined)
}

function handleDeleteChat() {
    openDeleteModal(props.member ? directChatId.value : undefined, props.member?.name)
}

function handleBlockUser() {
    openBlockModal(props.member ?? undefined)
}
</script>

<style>

</style>
