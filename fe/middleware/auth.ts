import { useUserStore } from '../store/user'
import { useChatStore } from '../store/chat'

export default defineNuxtRouteMiddleware(async (to) => {
  const { $pinia } = useNuxtApp()
  const userStore = useUserStore($pinia)
  const toAuth = ['auth-login', 'auth-create-account']

  const hasSession = import.meta.server ? !!useCookie('token').value : !!userStore._id

  if (hasSession) {
    const isAuth = await isAuthenticated()

    if (isAuth && to?.name && toAuth.includes(to?.name?.toString())) {
      return navigateTo('/')
    }

    if (!isAuth && to?.name && !toAuth.includes(to?.name?.toString())) {
      const chatStore = useChatStore($pinia)
      const indexedDB = useIndexedDB()
      const ws = useWs()
      indexedDB.deleteDB(userStore._id)
      chatStore.clearChat()
      userStore.logout()
      ws.disconnectWs()
      return navigateTo('/auth/login')
    }
  }

  if (!hasSession && to?.name && !toAuth.includes(to?.name?.toString())) {
    abortNavigation()
    return navigateTo('/auth/login')
  }
})

const isAuthenticated = async () => {
  try {
    await useMyAuthFetch('auth/valid-token', { method: 'POST' })
    return true
  } catch {
    return false
  }
}
