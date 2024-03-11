import { defineStore } from 'pinia'

interface IUser {
    _id: string
    name: string
    email: string
    token: string
}

export const useUserStore = defineStore('user', {
    state: () => ({
        _id: '',
        name: '',
        email: ''
    }),
    actions: {
        setUser({ _id, name, email, token }: IUser) {
            this._id = _id
            this.name = name
            this.email = email
            const tokenCookie = useCookie('token')
            tokenCookie.value = token
        },
        logout() {
            this._id = ''
            this.name = ''
            this.email = ''
            const tokenCookie = useCookie('token')
            tokenCookie.value = null
        }
    }
})