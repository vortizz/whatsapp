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
            <HomeMainMessages />
            <HomeMainMenu
                :is-menu-button="isContextMenuOpen"
                :x="menuPosition.x"
                :y="menuPosition.y"
                @showContactInfo="emit('showContactInfo')"
                @close="closeContextMenu"
            />
        </main>
        <footer class="sticky bottom-0">
            <HomeMainTyping v-if="!isBlockedUser" />
            <HomeMainBlockedActions v-else />
        </footer>
    </main>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useChatStore } from '../../../store/chat'
import { useUserStore } from '../../../store/user'

const emit = defineEmits(['showContactInfo'])

const chatStore = useChatStore()
const userStore = useUserStore()

const { user: chatUser } = storeToRefs(chatStore)
const isBlockedUser = computed(() => userStore.hasBlockedUser(chatUser.value?._id))
const messagesPane = ref(null)
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
