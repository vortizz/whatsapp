<template>
    <div>
        <div v-if="loading" class="text-center py-[72px] text-sm text-gray-400">
            Looking for chats or users
        </div>
        <div v-else-if="!filteredChats.length && !users.length" class="flex flex-col items-center gap-4 text-center py-[72px] text-base dark:text-gray-400 text-black/60">
            <div class="font-semibold">
                No chats, contacts or messages found
            </div>
        </div>
        <div v-if="filteredChats.length">
            <div class="py-7 pl-4 text-sm dark:text-white/60">
                <!-- {{ unreadChats && !text ? 'FILTERED BY UNREAD' : 'CHATS' }} -->
                Chats
            </div>
            <HomeSidebarChat
                v-for="(chat) in filteredChats"
                :key="chat._id"
                :name="chat.user.name"
                :active="chatId === chat._id"
                :isClearing="clearingChatId === chat._id || deletingChatId === chat._id"
                :lastMessage="chat.lastMessage"
                :countUnreadMessages="chat.countUnreadMessages"
                @click="setChat(chat)"
            />
        </div>
        <div v-if="users.length && !unreadChats">
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

<script setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '../../../store/user'
import { useChatStore } from '../../../store/chat'
import { useWsStore } from '../../../store/websocket'
import { StatusMessage } from '../../../utils/status-message'

const props = defineProps(['text', 'unreadChats'])

const chats = ref([])
const users = ref([])
const loading = ref(false)

const { clearingChatId, clearedChatState, selectedChatHasMessages } = useClearChatState()
const { deletingChatId, deletedChatState } = useDeleteChatState()

const userStore = useUserStore()
const chatStore = useChatStore()
const wsStore = useWsStore()

const { _id: userId } = storeToRefs(userStore)
const { _id: chatId } = storeToRefs(chatStore)
const { conn } = storeToRefs(wsStore)
const { setChat: setChatAction } = chatStore

function getUserId(user) {
    return user?._id || user
}

const filteredChats = computed(() => {
    if (props.unreadChats) {
        return chats.value.filter(chat => chat.countUnreadMessages || chat._id === chatId.value)
    }

    return chats.value
})

const currentSelectedChatHasMessages = computed(() => {
    const selectedChat = chats.value.find(chat => chat._id === chatId.value)
    return Boolean(selectedChat?.lastMessage?._id)
})

function emptyLastMessage() {
    return {
        _id: '',
        text: '',
        createdAt: '',
        status: '',
        isMine: false
    }
}

function handleEvent(event) {
    console.log('MSG RECEIVED (FILTEREDCHATS.VUE) -> ', JSON.parse(event.data))
    const data = JSON.parse(event.data)

    const name = data.name
    const msg = data.data

    if (name === 'new-message') {
        newMessage(msg)
    } else if (name === 'received-message') {
        receivedMessage(msg)
    } else if (name === 'read-message') {
        readMessage(msg)
    }
}

async function load() {
    loading.value = true
    try {
        await Promise.all([getChats(), getUsers()])
    } finally {
        loading.value = false
    }
}

async function getChats() {
    try {
        const response = await useMyAuthFetch('chat', { method: 'GET', query: { username: props.text } })
        chats.value = response.map(chat => ({
            _id: chat._id,
            user: chat.users.find(user => user._id !== userId.value),
            lastMessage: chat.lastMessage ? {
                _id: chat.lastMessage._id,
                text: chat.lastMessage.text,
                createdAt: chat.lastMessage.createdAt,
                status: chat.lastMessage.status,
                isMine: getUserId(chat.lastMessage.from) === userId.value
            } : emptyLastMessage(),
            countUnreadMessages: chat.countUnreadMessages || 0
        }))
    } catch (error) {
        const data = error?.data || {}
        const message = Array.isArray(data.message) ? data.message[0] : data.message
        useNuxtApp().$toast.error(message)
    }
}

function clearChatState(chatIdToClear) {
    const matchedChat = chats.value.find(chat => chat._id === chatIdToClear)
    if (!matchedChat) {
        return
    }

    matchedChat.lastMessage = emptyLastMessage()
    matchedChat.countUnreadMessages = 0
}

function removeChat(chatIdToDelete) {
    chats.value = chats.value.filter(chat => chat._id !== chatIdToDelete)
}

function setChat(chat) {
    chat.countUnreadMessages = 0
    const clonedChat = JSON.parse(JSON.stringify(chat))
    setChatAction({
        _id: clonedChat._id,
        user: clonedChat.user
    })
}

function setUser(user) {
    const clonedUser = JSON.parse(JSON.stringify(user))
    setChatAction({
        _id: 'new-chat',
        user: clonedUser
    })
}

function newMessage(message) {
    const chat = chats.value.find(item => item._id === message.chat._id)
    if (!chat) {
        return
    }

    const isMine = message.from._id === userId.value
    chat.lastMessage = {
        _id: message._id,
        text: message.text,
        createdAt: message.createdAt,
        status: message.status,
        isMine
    }
    if (!isMine && chatId.value !== chat._id) {
        chat.countUnreadMessages += 1
    } else {
        chat.countUnreadMessages = 0
    }
}

function receivedMessage(message) {
    const chat = chats.value.find(item => item._id === message.chat)

    if (!(chat && message.messages.some(msg => msg._id === chat.lastMessage._id))) {
        return
    }

    chat.lastMessage.status = StatusMessage.RECEIVED
}

function readMessage(message) {
    const chat = chats.value.find(item => item._id === message.chat)

    if (!(chat && message.messages.some(msg => msg._id === chat.lastMessage._id))) {
        return
    }

    chat.lastMessage.status = StatusMessage.READ
}

async function getUsers() {
    const response = await useMyAuthFetch('user/no-chat', { method: 'GET', query: { username: props.text } })
    users.value = response.map(user => ({
        _id: user._id,
        name: user.name,
        about: user.about
    }))
}

watch(() => props.text, () => {
    load()
})

watch(() => clearedChatState.value.nonce, () => {
    const clearedChatId = clearedChatState.value.chatId
    if (!clearedChatId) {
        return
    }

    clearChatState(clearedChatId)
})

watch(() => deletedChatState.value.nonce, () => {
    const deletedChatId = deletedChatState.value.chatId
    if (!deletedChatId) {
        return
    }

    removeChat(deletedChatId)
})

watch(currentSelectedChatHasMessages, value => {
    selectedChatHasMessages.value = value
}, { immediate: true })

onMounted(() => {
    load()
    conn.value?.removeEventListener('message', handleEvent)
    conn.value?.addEventListener('message', handleEvent)
})

onBeforeUnmount(() => {
    conn.value?.removeEventListener('message', handleEvent)
})
</script>

<style>

</style>
