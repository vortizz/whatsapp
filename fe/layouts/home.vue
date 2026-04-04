<template>
    <div class="size-full flex flex-row justify-start">
        <aside class="flex flex-col p-3 justify-between w-16 border-r border-black/10 bg-stone-100 dark:border-white/10 dark:bg-neutral-800">
            <div class="flex flex-col gap-0.5">
                <button
                    type="button"
                    @click="pageStore.setPage(Pages.CHATS)"
                    class="flex items-center relative p-2 rounded-full transition-colors"
                    :class="currentPage === Pages.CHATS ? activeButtonClass : inactiveButtonClass"
                >
                    <span v-if="unreadChatsCount > 0" class="absolute -right-1 -top-2 rounded-full text-xs text-white dark:text-neutral-950 bg-emerald-500 py-0.5 px-1.5 font-semibold z-10 border-2 border-solid border-stone-100 dark:border-neutral-800">
                        {{ unreadChatsCount }}
                    </span>
                    <Icon :name="currentPage === Pages.CHATS ? 'material-symbols:chat-rounded' : 'material-symbols:chat-outline-rounded'" class="text-2xl" />
                </button>
            </div>
            <div>
                <button
                    @click="pageStore.setPage(Pages.PROFILE)"
                    class="p-2 rounded-full transition-colors"
                    :class="currentPage === Pages.PROFILE ? activeButtonClass : inactiveButtonClass"
                >
                    <AvatarPlaceholder :size="28" />
                </button>
            </div>
        </aside>
        <main class="size-full">
            <slot />
        </main>
    </div>
</template>


<script setup>
import { storeToRefs } from 'pinia'
import { Pages, usePageStore } from '~/store/page'
import { useChatStore } from '~/store/chat'

const pageStore = usePageStore()
const { currentPage } = storeToRefs(pageStore)
const chatStore = useChatStore()
const { unreadChatsCount } = storeToRefs(chatStore)
const { resetPage } = pageStore

const activeButtonClass = 'bg-black/10 text-black dark:bg-white/10 dark:text-white'
const inactiveButtonClass = 'text-black/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/5'

onMounted(() => {
    resetPage()
})
</script>
