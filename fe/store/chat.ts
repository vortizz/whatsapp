import { defineStore } from 'pinia'

interface IUser {
    _id: string
    name: string
    email: string
    about: string
}

interface IChat {
    _id: string
    user: IUser
}

export const useChatStore = defineStore('chat', {
    state: () => ({
        _id: '',
        user: {}
    }),
    actions: {
        setChat({ _id, user }: IChat) {
            this._id = _id
            this.user = user
        },
        clearChat() {
            this._id = ''
            this.user = {}
        }
    },
    persist: true
})