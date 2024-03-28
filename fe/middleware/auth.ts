import { useUserStore } from '../store/user'
import { useWsStore } from '../store/websocket'

export default defineNuxtRouteMiddleware(async (to, from) => {
    const token = useCookie('token')
    const toAuth = ['auth-login', 'auth-create-account']

    if (token.value) {
        const isAuth = await isAuthenticated()

        if (isAuth && to?.name && toAuth.includes(to?.name?.toString())) {
            return navigateTo('/')
        }

        if (!isAuth && to?.name && !toAuth.includes(to?.name?.toString())) {
            const userStore = useUserStore()
            const wsStore = useWsStore()
            userStore.logout()
            wsStore.disconnectWs()
            return navigateTo('/auth/login')
        }
    }

    if (!token.value && to?.name && !toAuth.includes(to?.name?.toString())) {
        abortNavigation()
        return navigateTo('/auth/login')
    }
})

const isAuthenticated = async () => {
    try {
        await useMyAuthFetch('auth/valid-token',  { method: 'POST' })
        return true
    } catch (error) {
        return false
    }
}