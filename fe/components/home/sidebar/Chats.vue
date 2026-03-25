<template>
    <div>
        <HomeSidebarChat
            v-for="(chat, i) in chats"
            :key="i"
            :name="chat.user.name"
            :active="chatId === chat._id"
            :isClearing="clearingChatId === chat._id || deletingChatId === chat._id"
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

<script setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '../../../store/user'
import { useChatStore } from '../../../store/chat'
import { useWsStore } from '../../../store/websocket'
import { StatusMessage } from '../../../utils/status-message'

const chats = ref([])
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
    console.log('MSG RECEIVED (CHATS.VUE) -> ', JSON.parse(event.data))
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

async function getChats() {
    try {
        const response = await useMyAuthFetch('chat', { method: 'GET' })
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

function setChat(chat) {
    chat.countUnreadMessages = 0
    const clonedChat = JSON.parse(JSON.stringify(chat))
    setChatAction({
        _id: clonedChat._id,
        user: clonedChat.user
    })
}

function newMessage(message) {
    const chat = chats.value.find(item => item._id === message.chat._id)
    if (!chat) {
        if (message._id) {
            newChat(message)
        }
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
    sortChats()
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

function newChat(message) {
    const isMine = getUserId(message.from) === userId.value

    const chat = {
        _id: message.chat._id,
        user: message.chat.users.find(user => user._id !== userId.value),
        lastMessage: {
            _id: message._id,
            text: message.text,
            createdAt: message.createdAt,
            status: message.status,
            isMine
        },
        countUnreadMessages: isMine ? 0 : 1
    }
    chats.value.push(chat)
    sortChats()
}

function sortChats() {
    chats.value.sort((a, b) => {
        if (a.lastMessage?.createdAt > b.lastMessage?.createdAt) {
            return -1
        }
        if (a.lastMessage?.createdAt < b.lastMessage?.createdAt) {
            return 1
        }
        return 0
    })
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

watchEffect(() => {
    const selectedChat = chats.value.find(chat => chat._id === chatId.value)
    selectedChatHasMessages.value = Boolean(selectedChat?.lastMessage?._id)
})

watch(() => clearedChatState.value.nonce, () => {
    if (!clearedChatState.value.chatId) {
        return
    }

    clearChatState(clearedChatState.value.chatId)
})

watch(() => deletedChatState.value.nonce, () => {
    if (!deletedChatState.value.chatId) {
        return
    }

    removeChat(deletedChatState.value.chatId)
})

onMounted(async () => {
    await getChats()

    conn.value?.removeEventListener('message', handleEvent)
    conn.value?.addEventListener('message', handleEvent)
})

onBeforeUnmount(() => {
    conn.value?.removeEventListener('message', handleEvent)
})
</script>

<style>

</style>
