<template>
    <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
        <div
            v-if="isMounted && isMenuButton"
            class="absolute z-10 w-56 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black/10 ring-opacity-5 focus:outline-none dark:bg-neutral-900 dark:ring-white/10"
            :class="menuPositionClass"
            :style="menuPositionStyle"
        >
            <div class="p-1">
                <button @click="showContactInfo" class="text-neutral-950 w-full text-left px-4 py-2 hover:bg-stone-400/10 flex items-center gap-3 rounded-xl dark:text-zinc-50">
                    <Icon class="text-base" name="zondicons:information-outline"></Icon>
                    <span class="text-sm">Contact info</span>
                </button>
                <button @click="closeChat" class="text-neutral-950 w-full text-left px-4 py-2 hover:bg-stone-400/10 flex items-center gap-3 rounded-xl dark:text-zinc-50">
                    <Icon class="text-base" name="zondicons:close-outline"></Icon>
                    <span class="text-sm">Close chat</span>
                </button>
                <div class="border-t border-neutral-950/10 dark:border-white/10 mx-2 my-1.5"></div>
                <button
                    class="text-neutral-950 w-full text-left px-4 py-2 enabled:hover:bg-rose-600/10 enabled:dark:hover:bg-rose-500/10 enabled:dark:hover:text-rose-300 flex items-center gap-3 rounded-xl enabled:hover:text-rose-700 enabled:dark:text-zinc-50 disabled:opacity-35 disabled:cursor-not-allowed disabled:dark:text-neutral-400"
                    :disabled="isClearChatDisabled"
                    @click="clearMessages"
                >
                    <Icon class="text-base" name="zondicons:minus-outline"></Icon>
                    <span class="text-sm">Clear chat</span>
                </button>
                <button
                    class="text-neutral-950 w-full text-left px-4 py-2 enabled:hover:bg-rose-600/10 enabled:dark:hover:bg-rose-500/10 enabled:dark:hover:text-rose-300 flex items-center gap-3 rounded-xl enabled:hover:text-rose-700 enabled:dark:text-zinc-50 disabled:opacity-35 disabled:cursor-not-allowed disabled:dark:text-neutral-400"
                    :disabled="isBlockedUser ? isUnblockUserDisabled : isBlockUserDisabled"
                    @click="toggleBlockUser"
                >
                    <Icon class="text-base" name="ic:baseline-block"></Icon>
                    <span class="text-sm">{{ isBlockedUser ? 'Unblock' : 'Block' }}</span>
                </button>
                <button
                    class="text-neutral-950 w-full text-left px-4 py-2 enabled:hover:bg-rose-600/10 enabled:dark:hover:bg-rose-500/10 enabled:dark:hover:text-rose-300 flex items-center gap-3 rounded-xl enabled:hover:text-rose-700 dark:text-zinc-50 disabled:opacity-35 disabled:cursor-not-allowed disabled:dark:text-neutral-400"
                    :disabled="isDeleteChatDisabled"
                    @click="deleteChat"
                >
                    <Icon class="text-base" name="line-md:trash"></Icon>
                    <span class="text-sm">Delete chat</span>
                </button>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '../../../store/chat'
import { useUserStore } from '../../../store/user'

const props = defineProps({
    isMenuButton: {
        type: Boolean,
        default: false
    },
    x: {
        type: Number,
        default: null
    },
    y: {
        type: Number,
        default: null
    }
})

const emit = defineEmits(['showContactInfo'])

const chatStore = useChatStore()
const userStore = useUserStore()

const { openModal, isClearChatDisabled } = useClearChatModal()
const { openModal: openUnblockModal, isUnblockUserDisabled } = useUnblockUserModal()
const { openModal: openBlockModal, isBlockUserDisabled } = useBlockUserModal()
const { openModal: openDeleteModal, isDeleteChatDisabled } = useDeleteChatModal()

const isMounted = ref(false)
const { user: chatUser } = storeToRefs(chatStore)
const isBlockedUser = computed(() => userStore.hasBlockedUser(chatUser.value?._id))
const menuPositionClass = computed(() => props.x === null || props.y === null ? 'right-0 mt-2' : '')
const menuPositionStyle = computed(() => {
    if (props.x === null || props.y === null) {
        return undefined
    }

    return {
        left: `${props.x}px`,
        top: `${props.y}px`
    }
})

onMounted(() => {
    isMounted.value = true
})

function closeMenuButton() {
    emit('close')
}

function showContactInfo() {
    closeMenuButton()
    emit('showContactInfo')
}

function closeChat() {
    closeMenuButton()
    chatStore.setChat({
        _id: '',
        user: {}
    })
}

function clearMessages() {
    if (isClearChatDisabled.value) return

    closeMenuButton()
    openModal()
}

function toggleBlockUser() {
    if (isBlockedUser.value ? isUnblockUserDisabled.value : isBlockUserDisabled.value) return

    closeMenuButton()

    if (isBlockedUser.value) {
        openUnblockModal()
        return
    }

    openBlockModal()
}

function deleteChat() {
    if (isDeleteChatDisabled.value) return

    closeMenuButton()
    openDeleteModal()
}
</script>
