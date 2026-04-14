import { defineStore } from 'pinia'

interface IUser {
    _id: string
    name: string
    email: string
    about: string
    isConnected: boolean
    lastSeenAt: Date
}

interface IChat {
    _id: string
    user: IUser
}

export const useChatStore = defineStore('chat', {
    state: () => ({
        _id: '',
        user: {},
        unreadChatsCount: 0,
        unreadMessagesCount: 0
    }),
    actions: {
        setChat({ _id, user }: IChat) {
            this._id = _id
            this.user = user
        },
        clearChat() {
            this._id = ''
            this.user = {}
        },
        setUnreadCounts(chats: Array<{ countUnreadMessages: number }>) {
            this.unreadChatsCount = chats.filter(c => c.countUnreadMessages > 0).length
            this.unreadMessagesCount = chats.reduce((sum, c) => sum + c.countUnreadMessages, 0)
        },
        updateChatUserStatus(userId: string, isConnected: boolean, lastSeenAt: Date) {
            const user = this.user as IUser
            if (user?._id === userId) {
                user.isConnected = isConnected
                user.lastSeenAt = lastSeenAt
            }
        }
    },
    persist: true
})
