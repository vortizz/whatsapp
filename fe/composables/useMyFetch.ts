import { useUserStore } from '../store/user'
import { useWsStore } from '../store/websocket'

export const useMyFetch = (request: string, opts?: any) => {
  const config = useRuntimeConfig()
  const baseURL = import.meta.server ? config.baseUrlApiInternal : config.public.baseUrlApi
  return $fetch(request, { baseURL, ...opts })
}

export const useMyAuthFetch = async (request: string, opts?: any) => {
  try {
    const config = useRuntimeConfig()
    const baseURL = import.meta.server ? config.baseUrlApiInternal : config.public.baseUrlApi
    const headers = { Authorization: `Bearer ${useCookie('token').value}` }
    return await $fetch(request, { baseURL, ...{ headers }, ...opts })
  } catch (error: any) {
    if (error?.status === 401) {
      const { $pinia } = useNuxtApp()
      const userStore = useUserStore($pinia)
      const wsStore = useWsStore($pinia)
      userStore.logout()
      wsStore.disconnectWs()
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
