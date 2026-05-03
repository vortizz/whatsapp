import { useUserStore } from '../store/user'
import { useChatStore } from '../store/chat'
import { useIndexedDB } from './useIndexedDB'

const WS_ENTRYPOINT_PATH = '/entrypoint'

const conn = ref<WebSocket | null>(null)

export function useWs() {
  function connectWs() {
    const config = useRuntimeConfig()
    const baseUrlWs = String(config.public.baseUrlWs || '').trim()
    const wsUrl = baseUrlWs.endsWith(WS_ENTRYPOINT_PATH)
      ? baseUrlWs
      : `${baseUrlWs.replace(/\/$/, '')}${WS_ENTRYPOINT_PATH}`

    if (
      conn.value &&
      ([WebSocket.CONNECTING, WebSocket.OPEN] as number[]).includes(conn.value.readyState)
    ) {
      return
    }

    conn.value = new WebSocket(wsUrl)

    conn.value.onopen = () => {}
    conn.value.onerror = () => {}
    conn.value.onclose = () => {}
    conn.value.onmessage = async (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        if (data.name === 'force-logout') {
          const { $pinia, $toast } = useNuxtApp()
          const userStore = useUserStore($pinia)
          const chatStore = useChatStore($pinia)
          const idb = useIndexedDB()
          idb.deleteDB(userStore._id)
          chatStore.clearChat()
          userStore.logout()
          disconnectWs()
          $toast.error('Your session was ended because you logged in from another device.')
          await navigateTo('/auth/login')
        }
      } catch {}
    }
  }

  function disconnectWs() {
    conn.value?.close()
    conn.value = null
  }

  return {
    conn: readonly(conn),
    connectWs,
    disconnectWs,
  }
}
