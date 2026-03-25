import { defineStore } from 'pinia'

interface IUser {
    _id: string
    name: string
    email: string
    about: string
    token: string
    blockedUsers?: string[]
}

function normalizeBlockedUsers(blockedUsers: Array<string | { _id: string }> = []): string[] {
    return blockedUsers
        .map(user => typeof user === 'string' ? user : user?._id)
        .filter((userId): userId is string => !!userId)
}

export const useUserStore = defineStore('user', {
    state: () => ({
        _id: '',
        name: '',
        email: '',
        about: '',
        blockedUsers: [] as string[]
    }),
    getters: {
        hasBlockedUser: state => (userId?: string) =>
            !!userId && state.blockedUsers.includes(userId)
    },
    actions: {
        setUser({ _id, name, email, about, token, blockedUsers = [] }: IUser) {
            this._id = _id
            this.name = name
            this.email = email
            this.about = about
            this.blockedUsers = normalizeBlockedUsers(blockedUsers)
            const tokenCookie = useCookie('token')
            tokenCookie.value = token
        },
        setBlockedUsers(blockedUsers: string[]) {
            this.blockedUsers = normalizeBlockedUsers(blockedUsers)
        },
        addBlockedUser(userId: string) {
            if (this.blockedUsers.includes(userId)) {
                return
            }

            this.blockedUsers.push(userId)
        },
        removeBlockedUser(userId: string) {
            this.blockedUsers = this.blockedUsers.filter(blockedUserId => blockedUserId !== userId)
        },
        setName(name: string) {
            this.name = name
        },
        setAbout(about: string) {
            this.about = about
        },
        logout() {
            this._id = ''
            this.name = ''
            this.email = ''
            this.about = ''
            this.blockedUsers = []
            const tokenCookie = useCookie('token')
            tokenCookie.value = null
        }
    },
    persist: true
})
