<template>
    <main class="flex-2 bg-[#efeae2] dark:bg-neutral-900/90 flex flex-col">
        <header>
            <HomeMainHeader
                @showContactInfo="$emit('showContactInfo')"
            />
        </header>
        <main class="border-r-2 border-transparent flex-1 overflow-y-auto scrollbar scrollbar-w-2 scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <HomeMainMessages />
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

const chatStore = useChatStore()
const userStore = useUserStore()

const { user: chatUser } = storeToRefs(chatStore)
const isBlockedUser = computed(() => userStore.hasBlockedUser(chatUser.value?._id))
</script>

<style>

</style>
