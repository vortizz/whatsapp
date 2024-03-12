import { defineStore } from 'pinia'

interface IUser {
    _id: string
    name: string
    email: string
    about: string
    token: string
}

export const useUserStore = defineStore('user', {
    state: () => ({
        _id: '',
        name: '',
        email: '',
        about: ''
    }),
    actions: {
        setUser({ _id, name, email, about, token }: IUser) {
            this._id = _id
            this.name = name
            this.email = email
            this.about = about
            const tokenCookie = useCookie('token')
            tokenCookie.value = token
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
            const tokenCookie = useCookie('token')
            tokenCookie.value = null
        }
    },
    persist: true
})