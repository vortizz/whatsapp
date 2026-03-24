<template>
    <div class="h-full flex flex-row text-gray-600">
        <template v-if="currentPage === Pages.PROFILE">
            <HomeProfile />
            <main
                class="flex-2 bg-stone-100 dark:bg-neutral-900 flex flex-col items-center gap-6 justify-center"
            >
                <div class="text-7xl dark:text-white/20 text-black/20">
                    <Icon name="mdi:user-circle"></Icon>
                </div>
                <div class="dark:text-white text-neutral-950 text-3xl">Profile</div>
            </main>
        </template>
        <template v-else-if="currentPage === Pages.CHATS">
            <HomeNewChat
                v-if="isDisplayingNewChat"
                @close="isDisplayingNewChat = false"
            />
            <HomeSidebar 
                v-else
                @opennewchat="isDisplayingNewChat = true"
            />
        
            <!--****************-->
            <main
                v-show="!chatId"
                class="flex-2 bg-white dark:bg-neutral-900 flex flex-col"
            />
            <HomeMain
                v-show="chatId"
                @showContactInfo="isDisplayingContactInfo = true"
            />
            <!--****************-->
            <HomeContactInfo
                v-if="isDisplayingContactInfo"
                @close="isDisplayingContactInfo = false"
            />
            <HomeClearChatModal />
            <HomeDeleteChatModal />
        </template>
    </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useChatStore } from '../store/chat'
import { useWsStore } from '../store/websocket'
import { Pages, usePageStore } from '~/store/page'

definePageMeta({
    layout: 'home',
    middleware: 'auth'
})

const isDisplayingContactInfo = ref(false)
const isDisplayingNewChat = ref(false)

const chatStore = useChatStore()
const wsStore = useWsStore()
const pageStore = usePageStore()

const { _id: chatId } = storeToRefs(chatStore)
const { conn } = storeToRefs(wsStore)
const { currentPage } = storeToRefs(pageStore)

const { clearChat } = chatStore
const { connectWs, disconnectWs } = wsStore

async function updateStatusToReceived() {
    await useMyAuthFetch('message/received', { method: 'PUT' })
}

onMounted(() => {
    updateStatusToReceived()
    clearChat()

    if (conn.value?.readyState !== WebSocket.OPEN) {
        const token = useCookie('token').value
        connectWs({ token })
    }
})

onBeforeUnmount(() => {
    disconnectWs()
})

watch(chatId, value => {
    if (!value) {
        isDisplayingContactInfo.value = false
    }
})
</script>

<style>

</style>
