<template>
    <div>
        <div v-if="loading" class="text-center py-[72px] text-sm text-gray-400">
            Looking for chats or users
        </div>
        <div v-else-if="!chats.length && !users.length" class="text-center py-[72px] text-sm text-gray-400">
            No chats or users found
        </div>
        <div v-if="chats.length">
            <div class="p-7 text-teal-600">
                CHATS
            </div>
            <HomeSidebarChat
                v-for="(chat, i) in chats"
                :key="i"
                :name="chat.user.name"
                :active="chatId === chat._id"
                :lastMessage="chat.lastMessage"
                :countUnreadMessages="chat.countUnreadMessages"
                @click="setChat(chat)"
            />
        </div>
        <div v-if="users.length">
            <div class="p-7 text-teal-600">
                USERS
            </div>
            <HomeSidebarUser
                v-for="(user, i) in users"
                :key="i"
                :name="user.name"
                :about="user.about"
                @click="setUser(user)"
            />
        </div>

    </div>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { useUserStore } from '../../../store/user'
import { useChatStore } from '../../../store/chat'
import { useWsStore } from '../../../store/websocket'

export default {
    props: ['text'],
    data() {
        return {
            chats: [],
            users: [],
            loading: false
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
        try {
            this.loading = true
            await Promise.all([this.getChats(), this.getUsers()])
            this.conn.removeEventListener('message', this.handleEvent)
            this.conn.addEventListener('message', this.handleEvent)
        } finally {
            this.loading = false
        }
    },
    methods: {
        ...mapActions(useChatStore, {
            setChatAction: 'setChat'
        }),
        handleEvent(event) {
            console.log('MSG RECEIVED (FILTEREDCHATS.VUE) -> ', JSON.parse(event.data))
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
        },
        async getChats() {
            try {
                const chats = await useMyAuthFetch('chat', { method: 'GET', query: { username: this.text } })
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
        setUser(user) {
            const clonedUser = JSON.parse(JSON.stringify(user))
            this.setChatAction({
                _id: 'new-chat',
                user: clonedUser
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
        },
        async getUsers() {
            const users = await useMyAuthFetch('user/new-chat', { method: 'GET', query: { username: this.text } })
            this.users = users.map(user => ({
                _id: user._id,
                name: user.name,
                about: user.about
            }))
        }
    },
}

</script>

<style>

</style>