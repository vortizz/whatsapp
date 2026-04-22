import { useUserStore } from '../store/user'
import { useChatStore } from '../store/chat'

export default defineNuxtRouteMiddleware(async (to) => {
  const { $pinia } = useNuxtApp()
  const token = useCookie('token')
  const toAuth = ['auth-login', 'auth-create-account']

  if (token.value) {
    const isAuth = await isAuthenticated()

    if (isAuth && to?.name && toAuth.includes(to?.name?.toString())) {
      return navigateTo('/')
    }

    if (!isAuth && to?.name && !toAuth.includes(to?.name?.toString())) {
      const userStore = useUserStore($pinia)
      const chatStore = useChatStore($pinia)
      const indexedDB = useIndexedDB()
      const ws = useWs()
      indexedDB.deleteDB(userStore._id)
      chatStore.clearChat()
      userStore.logout()
      ws.disconnectWs()
      return navigateTo('/auth/login')
    }

    // Initialize E2E keys before the page renders so every component
    // that mounts can decrypt immediately. Client-only: IndexedDB is not
    // available on the server.
    // if (import.meta.client && isAuth && to?.name && !toAuth.includes(to?.name?.toString())) {
    //   const userStore = useUserStore($pinia)
    //   if (userStore._id) {
    //     const { initKeys } = useCrypto()
    //     await initKeys(userStore._id)
    //   }
    // }
  }

  if (!token.value && to?.name && !toAuth.includes(to?.name?.toString())) {
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
