<template>
    <div class="h-full flex flex-row text-gray-600">
        <HomeProfile
            v-if="isDisplayingProfile"
            @close="isDisplayingProfile = false"
        />
        <HomeNewChat
            v-else-if="isDisplayingNewChat"
            @close="isDisplayingNewChat = false"
        />
        <HomeSidebar 
            v-else
            @openprofile="isDisplayingProfile = true"
            @opennewchat="isDisplayingNewChat = true"
        />
         <!--****************-->
        <main
            v-show="!chatId"
            class="flex-2 bg-gray-100 flex flex-col"
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
            isDisplayingNewChat: false
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