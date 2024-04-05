<template>
    <div class="h-full flex flex-row text-gray-600">
        <aside v-if="isDisplayingProfile" class="flex-1 min-w-80 bg-gray-100 border-r border-gray-200 flex flex-col">
            <header class="sticky top-0">
                <HomeProfileHeader @close="isDisplayingProfile = false" />
            </header>
            <main class="flex flex-col gap-7 pt-7">
                <HomeProfileAvatar />
                <HomeProfileName />
                <HomeProfileAbout />
            </main>
        </aside>
        <aside v-else-if="isDisplayingNewChat" class="flex-1 min-w-80 bg-gray-100 border-r border-gray-200 flex flex-col">
            <header class="sticky top-0">
                <HomeNewChatHeader @close="isDisplayingNewChat = false" />
                <HomeNewChatSubHeader @settext="e => searchUserNewChat = e" />
            </header>
            <main class="flex flex-col gap-7 overflow-y-auto flex-1 scrollbar scrollbar-w-2 scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <HomeNewChatUsers @close="isDisplayingNewChat = false" :text="searchUserNewChat" />
            </main>
        </aside>
        <aside v-else class="flex-1 min-w-80 bg-white border-r border-gray-200 flex flex-col">
            <header class="sticky top-0">
                <HomeSidebarHeader @openprofile="isDisplayingProfile = true" @opennewchat="isDisplayingNewChat = true" />
                <HomeSidebarSubHeader @settext="e => searchChatsContactsText = e" @setunreadChats="e => unreadChats = e" />
            </header>
            <main class="border-r-2 border-transparent overflow-y-auto flex-1 scrollbar scrollbar-w-2 scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <HomeSidebarChats v-if="!searchChatsContactsText && !unreadChats" />
                <HomeSidebarFilteredChats v-else :text="searchChatsContactsText" :unreadChats="unreadChats" />
            </main>
        </aside>
         <!--****************-->
        <main v-show="!chatId" class="flex-2 bg-gray-100 flex flex-col" />
        <main v-show="chatId" class="flex-2 bg-orange-50 flex flex-col">
            <header>
                <HomeMainHeader
                    @showContactInfo="isDisplayingContactInfo = true"
                />
            </header>
            <main class="border-r-2 border-transparent flex-1 overflow-y-auto scrollbar scrollbar-w-2 scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <HomeMainMessages />
            </main>
            <footer class="sticky bottom-0">
                <HomeMainTyping />
            </footer>
        </main>
        <!--****************-->
        <aside v-if="isDisplayingContactInfo" class="flex-1 min-w-80 bg-gray-100 border-r border-gray-200 flex flex-col">
            <header>
                <HomeContactInfoHeader @close="isDisplayingContactInfo = false" />
            </header>
            <main class="flex flex-col gap-3">
                <HomeContactInfoProfile />
                <HomeContactInfoAbout />
                <HomeContactInfoActions />
            </main>
        </aside>
    </div>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { useChatStore } from '../store/chat'
import { useWsStore } from '../store/websocket'

definePageMeta({
    layout: 'home',
    middleware: 'auth'
})
export default {
    data() {
        return {
            isDisplayingContactInfo: false,
            isDisplayingProfile: false,
            isDisplayingNewChat: false,
            searchChatsContactsText: '',
            unreadChats: false,
            searchUserNewChat: ''
        }
    },
    computed: {
        ...mapState(useChatStore, {
            chatId: '_id',
            chatUser: 'user'
        }),
        ...mapState(useWsStore, ['conn']),
    },
    mounted() {
        this.updateStatusToReceived()
        this.clearChat()
        if (this.conn?.readyState !== WebSocket.OPEN) {
            const token = useCookie('token').value
            this.connectWs({ token })
        }
    },
    methods: {
        ...mapActions(useChatStore, ['clearChat']),
        ...mapActions(useWsStore, ['connectWs', 'disconnectWs']),
        async updateStatusToReceived() {
            await useMyAuthFetch(`message/received`, { method: 'PUT' })
        }
    },
    beforeUnmount() {
        this.disconnectWs()
    }
}
</script>

<style>

</style>