<template>
    <main class="flex-2 bg-[#efeae2] dark:bg-neutral-900/90 flex flex-col">
        <header>
            <HomeMainHeader
                @showContactInfo="emit('showContactInfo')"
            />
        </header>
        <main
            ref="messagesPane"
            class="relative border-r-2 border-transparent flex-1 overflow-y-auto scrollbar scrollbar-w-2 scrollbar-thumb-gray-300 scrollbar-track-transparent"
            @contextmenu="openContextMenu"
            @click="closeContextMenu"
        >
            <HomeMainMessages ref="messagesRef" />
            <HomeMainMenu
                :is-menu-button="isContextMenuOpen"
                :x="menuPosition.x"
                :y="menuPosition.y"
                @showContactInfo="emit('showContactInfo')"
                @close="closeContextMenu"
            />
        </main>
        <footer class="sticky bottom-0">
            <template v-if="isSelecting">
                <div class="flex items-center justify-between px-5 py-3 bg-white dark:bg-neutral-800 border-t border-gray-200 dark:border-neutral-700 text-neutral-950 dark:text-zinc-50">
                    <div class="flex items-center gap-2">
                        <button @click="cancelSelection" class="p-2 rounded-full text-2xl flex items-center hover:bg-stone-100 dark:hover:bg-white/5">
                            <Icon name="mdi:close" />
                        </button>
                        <span class="text-[15px]">{{ selectedIds.length }} selected</span>
                    </div>
                    <button
                        @click="openDeleteMessageModal(() => messagesRef?.deleteSelected())"
                        :disabled="selectedIds.length === 0"
                        class="p-2 rounded-full text-2xl flex items-center enabled:hover:bg-stone-100 dark:enabled:hover:bg-white/5 enabled:text-black dark:enabled:text-white disabled:opacity-40"
                    >
                        <Icon name="line-md:trash" />
                    </button>
                </div>
            </template>
            <template v-else>
                <HomeMainTyping v-if="!isBlockedUser" />
                <HomeMainBlockedActions v-else />
            </template>
        </footer>
    </main>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useChatStore } from '../../../store/chat'
import { useUserStore } from '../../../store/user'
import { useMessageSelectionStore } from '../../../store/messageSelection'

const emit = defineEmits(['showContactInfo'])

const chatStore = useChatStore()
const userStore = useUserStore()
const selectionStore = useMessageSelectionStore()

const { user: chatUser } = storeToRefs(chatStore)
const { isSelecting, selectedIds } = storeToRefs(selectionStore)
const { cancelSelection } = selectionStore
const { openModal: openDeleteMessageModal } = useDeleteMessageModal()

const isBlockedUser = computed(() => userStore.hasBlockedUser(chatUser.value?._id))
const messagesPane = ref(null)
const messagesRef = ref(null)
const isContextMenuOpen = ref(false)
const menuPosition = ref({ x: 0, y: 0 })

function closeContextMenu() {
    isContextMenuOpen.value = false
}

function openContextMenu(event) {
    if (event.target.closest('[data-message-bubble]')) {
        closeContextMenu()
        return
    }

    event.preventDefault()

    const container = messagesPane.value
    if (!container) {
        return
    }

    const rect = container.getBoundingClientRect()
    const menuWidth = 224
    const horizontalPadding = 16
    const verticalPadding = 16
    const x = event.clientX - rect.left + container.scrollLeft
    const y = event.clientY - rect.top + container.scrollTop
    const maxX = container.scrollWidth - menuWidth - horizontalPadding

    menuPosition.value = {
        x: Math.max(horizontalPadding, Math.min(x, maxX)),
        y: Math.max(verticalPadding, y)
    }
    isContextMenuOpen.value = true
}

function handleWindowPointerDown(event) {
    if (!isContextMenuOpen.value) {
        return
    }

    if (messagesPane.value?.contains(event.target)) {
        return
    }

    closeContextMenu()
}

onMounted(() => {
    window.addEventListener('pointerdown', handleWindowPointerDown)
})

onBeforeUnmount(() => {
    window.removeEventListener('pointerdown', handleWindowPointerDown)
})
</script>

<style>

</style>
