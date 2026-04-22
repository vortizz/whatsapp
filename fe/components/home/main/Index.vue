<template>
  <main class="flex-2 bg-[#efeae2] dark:bg-neutral-900/90 flex flex-col relative">
    <header>
      <HomeMainHeader
        @show-contact-info="emit('showContactInfo')"
        @show-search-messages="emit('showSearchMessages')"
      />
    </header>
    <main
      ref="messagesPane"
      class="relative border-r-2 border-transparent flex-1 overflow-y-auto overflow-x-hidden scrollbar scrollbar-w-2 scrollbar-thumb-gray-300 scrollbar-track-transparent"
      @contextmenu="openContextMenu"
      @click="closeContextMenu"
    >
      <HomeForwardMessageModal />
      <HomeMainMessages
        ref="messagesRef"
        @view-member="emit('viewMember', $event)"
        @message-info="(payload) => emit('showMessageInfo', payload)"
      />
      <HomeMainMenu
        :is-menu-button="isContextMenuOpen"
        :x="menuPosition.x"
        :y="menuPosition.y"
        @show-contact-info="emit('showContactInfo')"
        @close="closeContextMenu"
      />
    </main>
    <Transition name="scroll-btn">
      <button
        v-if="isScrolledUp"
        :style="{ bottom: footerHeight + 16 + 'px' }"
        class="absolute right-4 z-10 p-2 rounded-full bg-white dark:bg-neutral-700 shadow-md flex items-center justify-center text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-600 transition-colors"
        @click="scrollToBottom"
      >
        <Icon name="mdi:chevron-down" class="text-3xl" />
      </button>
    </Transition>
    <footer ref="footerEl" class="sticky bottom-0">
      <template v-if="isSelecting">
        <div
          class="flex items-center justify-between px-5 py-3 bg-white dark:bg-neutral-800 border-t border-gray-200 dark:border-neutral-700 text-neutral-950 dark:text-zinc-50"
        >
          <div class="flex items-center gap-2">
            <button
              class="p-2 rounded-full text-2xl flex items-center hover:bg-stone-100 dark:hover:bg-white/5"
              @click="cancelSelection"
            >
              <Icon name="mdi:close" />
            </button>
            <span class="text-[15px]">{{ selectedIds.length }} selected</span>
          </div>
          <button
            v-if="selectionMode === 'forward'"
            :disabled="selectedIds.length === 0"
            class="p-2 rounded-full text-2xl flex items-center enabled:hover:bg-stone-100 dark:enabled:hover:bg-white/5 enabled:text-black dark:enabled:text-white disabled:opacity-40"
            @click="handleForward"
          >
            <Icon name="mdi:share" />
          </button>
          <button
            v-else
            :disabled="selectedIds.length === 0"
            class="p-2 rounded-full text-2xl flex items-center enabled:hover:bg-stone-100 dark:enabled:hover:bg-white/5 enabled:text-black dark:enabled:text-white disabled:opacity-40"
            @click="openDeleteMessageModal(() => messagesRef?.deleteSelected())"
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
  import { useMessageReplyStore } from '../../../store/messageReply'

  const emit = defineEmits([
    'showContactInfo',
    'showSearchMessages',
    'viewMember',
    'showMessageInfo',
  ])

  const chatStore = useChatStore()
  const userStore = useUserStore()
  const selectionStore = useMessageSelectionStore()
  const replyStore = useMessageReplyStore()

  const { _id: userId } = storeToRefs(userStore)
  const { users: chatUsers } = storeToRefs(chatStore)
  const { isSelecting, selectedIds, mode: selectionMode } = storeToRefs(selectionStore)
  const { cancelSelection } = selectionStore

  const { openModal: openForwardModal } = useForwardMessageModal()

  function handleForward() {
    const msgs = messagesRef.value?.getSelectedMessages() ?? []
    openForwardModal(msgs)
    cancelSelection()
  }
  const { replyTo } = storeToRefs(replyStore)

  watch(replyTo, async (val) => {
    if (val && !isScrolledUp.value) {
      await nextTick()
      scrollToBottom()
    }
  })
  const { openModal: openDeleteMessageModal } = useDeleteMessageModal()

  const chatFirstUser = computed(() => chatUsers.value?.find((u) => u._id !== userId.value))
  const isBlockedUser = computed(
    () => chatFirstUser.value && userStore.hasBlockedUser(chatFirstUser.value._id),
  )
  const messagesPane = ref(null)
  const messagesRef = ref(null)
  const footerEl = ref(null)
  const footerHeight = ref(64)
  const isScrolledUp = ref(false)

  let footerObserver = null

  function onScroll() {
    const el = messagesPane.value
    if (!el) return
    isScrolledUp.value = el.scrollHeight - el.scrollTop - el.clientHeight > 100
  }

  function scrollToBottom() {
    messagesPane.value?.scrollTo({ top: messagesPane.value.scrollHeight, behavior: 'smooth' })
  }

  function scrollToMessage(id) {
    messagesRef.value?.scrollToMessage(id)
  }

  function scheduleScrollToMessage(id) {
    messagesRef.value?.scheduleScrollToMessage(id)
  }

  defineExpose({ scrollToMessage, scheduleScrollToMessage })
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
      y: Math.max(verticalPadding, y),
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
    messagesPane.value?.addEventListener('scroll', onScroll)
    footerObserver = new ResizeObserver(() => {
      footerHeight.value = footerEl.value?.offsetHeight ?? 64
    })
    if (footerEl.value) footerObserver.observe(footerEl.value)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('pointerdown', handleWindowPointerDown)
    messagesPane.value?.removeEventListener('scroll', onScroll)
    footerObserver?.disconnect()
  })
</script>

<style>
  .scroll-btn-enter-active,
  .scroll-btn-leave-active {
    transition:
      opacity 0.2s,
      transform 0.2s;
  }
  .scroll-btn-enter-from,
  .scroll-btn-leave-to {
    opacity: 0;
    transform: translateY(8px);
  }
</style>
