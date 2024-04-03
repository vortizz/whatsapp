<template>
    <div>
        <HomeSidebarChat
            v-for="(chat, i) in chats"
            :key="i"
            :name="chat.user.name"
            :active="chatId === chat._id"
            :lastMessage="chat.lastMessage"
            :countUnreadMessages="chat.countUnreadMessages"
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
import { useWsStore } from '../../../store/websocket'

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
        ...mapState(useWsStore, ['conn']),
    },
    async mounted() {
        await this.getChats()

        this.conn.addEventListener('message', (event) => {
            console.log('MSG RECEIVED (CHATS.VUE) -> ', JSON.parse(event.data))
            const data = JSON.parse(event.data)

            const name = data.name
            const msg = data.data

            if (name === 'new-message') {
                this.newMessage(msg)
            } else if (name === 'received-message') {
                this.receivedMessage(msg)
            } else if (name === 'read-message') {
                this.readMessage(msg)
            }
        })
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
                    user: chat.users.find(user => user._id !== this.userId),
                    lastMessage: {
                        _id: chat.lastMessage?._id,
                        text: chat.lastMessage?.text,
                        createdAt: chat.lastMessage?.createdAt,
                        status: chat.lastMessage?.status,
                        isMine: chat.lastMessage?.from === this.userId
                    },
                    countUnreadMessages: chat.countUnreadMessages || 0
                }))
            } catch (error) {
                const data = error?.data || {}
                const message = Array.isArray(data.message) ? data.message[0] : data.message
                useNuxtApp().$toast.error(message)
            }
        },
        setChat(chat) {
            chat.countUnreadMessages = 0
            const clonedChat = JSON.parse(JSON.stringify(chat))
            this.setChatAction({
                _id: clonedChat._id,
                user: clonedChat.user
            })
        },
        newMessage(message) {
            const chat = this.chats.find(item => item._id === message.chat._id)
            if (!chat) {
                return
            }
            const isMine = message.from._id === this.userId
            chat.lastMessage = {
                _id: message._id,
                text: message.text,
                createdAt: message.createdAt,
                status: message.status,
                isMine
            }
            if (!isMine && this.chatId !== chat._id) {
                chat.countUnreadMessages += 1
            } else {
                chat.countUnreadMessages = 0
            }
        },
        receivedMessage(message) {
            const chat = this.chats.find(item => item._id === message.chat)
            
            if (!(chat && message.messages.some(msg => msg._id === chat.lastMessage._id))) {
                return
            }
            
            chat.lastMessage.status = StatusMessage.RECEIVED
        },
        readMessage(message) {
            const chat = this.chats.find(item => item._id === message.chat)
            
            if (!(chat && message.messages.some(msg => msg._id === chat.lastMessage._id))) {
                return
            }
            
            chat.lastMessage.status = StatusMessage.READ
        }
    },
}

</script>

<style>

</style>