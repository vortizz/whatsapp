<template>
    <div>
        <HomeSidebarChat
            v-for="(chat, i) in chats"
            :key="i"
            :name="chat.user.name"
            :active="chatId === chat._id"
            @click="setChat(chat)"
        />
        <div class="text-center text-xs p-3">
            <Icon name="oi:lock-locked" />
            Your personal messages are end-to-end encrypted
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { useUserStore } from '../../../store/user'
import { useChatStore } from '../../../store/chat'

export default {
    data() {
        return {
            chats: []
        }
    },
    computed: {
        ...mapState(useUserStore, {
            userId: '_id'
        }),
        ...mapState(useChatStore, {
            chatId: '_id',
            chatUser: 'user'
        }),
    },
    mounted() {
        this.getChats()
    },
    methods: {
        ...mapActions(useChatStore, {
            setChatAction: 'setChat'
        }),
        async getChats() {
            try {
                const chats = await useMyAuthFetch('chat', { method: 'GET' })
                this.chats = chats.map(chat => ({
                    _id: chat._id,
                    user: chat.users.find(user => user._id !== this.userId)
                }))
            } catch (error) {
                const data = error?.data || {}
                const message = Array.isArray(data.message) ? data.message[0] : data.message
                useNuxtApp().$toast.error(message)
            }
        },
        setChat(chat) {
            const clonedChat = JSON.parse(JSON.stringify(chat))
            this.setChatAction({
                _id: clonedChat._id,
                user: clonedChat.user
            })
        }
    },
}

</script>

<style>

</style>