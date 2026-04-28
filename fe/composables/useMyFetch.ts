import { useUserStore } from '../store/user'
import { useChatStore } from '../store/chat'

export const useMyFetch = (request: string, opts?: any) => {
  const config = useRuntimeConfig()
  const baseURL = import.meta.server ? config.baseUrlApiInternal : config.public.baseUrlApi
  return $fetch(request, { baseURL, ...opts })
}

export const useMyAuthFetch = async (request: string, opts?: any) => {
  try {
    const config = useRuntimeConfig()
    const baseURL = import.meta.server ? config.baseUrlApiInternal : config.public.baseUrlApi
    const cookieHeader = useRequestHeaders(['cookie'])
    return await $fetch(request, { baseURL, credentials: 'include', headers: cookieHeader, ...opts })
  } catch (error: any) {
    if (error?.status === 401) {
      const { $pinia } = useNuxtApp()
      const userStore = useUserStore($pinia)
      const chatStore = useChatStore($pinia)
      const indexedDB = useIndexedDB()
      const ws = useWs()
      indexedDB.deleteDB(userStore._id)
      chatStore.clearChat()
      userStore.logout()
      ws.disconnectWs()
      if (import.meta.client) {
        setTimeout(() => {
          useNuxtApp().$toast.error('Token has expired. Please login again!')
        }, 100)
      }
      return navigateTo('/auth/login')
    }
    throw error
  }
}
