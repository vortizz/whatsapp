<template>
    <div class="px-4 py-2.5 bg-white dark:bg-neutral-900 flex items-center justify-between shadow-sm">
        <div class="flex flex-row items-center gap-3 flex-1 cursor-pointer" @click="emit('showContactInfo')">
            <AvatarPlaceholder :size="40" />
            <div class="text-base font-semibold text-black dark:text-white">
                {{ chatUser.name }}
            </div>
        </div>
        <div class="flex flex-row items-center justify-center gap-2.5">
            <div>
                <button class='flex items-center text-2xl p-2 rounded-full text-neutral-950 dark:text-white dark:hover:bg-white/5 hover:bg-stone-100 transition-colors'>
                    <Icon name="material-symbols:search" />
                </button>
            </div>
            <div class="relative inline-block">
                <div>
                    <button
                        type="button"
                        class="flex items-center text-2xl p-2 rounded-full text-neutral-950 dark:text-white dark:hover:bg-white/5 hover:bg-stone-100 transition-colors"
                        @click="isMenuButton = !isMenuButton"
                        @blur="blurMenuButton"
                    >
                        <Icon name="carbon:overflow-menu-vertical" />
                    </button>
                </div>
                <HomeMainMenu
                    :isMenuButton="isMenuButton"
                    @showContactInfo="emit('showContactInfo')"
                    @close="closeMenuButton"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '../../../store/chat'

const emit = defineEmits(['showContactInfo'])

const chatStore = useChatStore()
const { user: chatUser } = storeToRefs(chatStore)
const isMenuButton = ref(false)

function closeMenuButton() {
    isMenuButton.value = false
}

function blurMenuButton() {
    setTimeout(() => {
        closeMenuButton()
    }, 100)
}
</script>

<style>

</style>
