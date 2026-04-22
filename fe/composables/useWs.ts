const WS_ENTRYPOINT_PATH = '/entrypoint'

const conn = ref<WebSocket | null>(null)

export function useWs() {
  function connectWs({ token }: { token: string }) {
    const config = useRuntimeConfig()
    const baseUrlWs = String(config.public.baseUrlWs || '').trim()
    const wsUrl = baseUrlWs.endsWith(WS_ENTRYPOINT_PATH)
      ? baseUrlWs
      : `${baseUrlWs.replace(/\/$/, '')}${WS_ENTRYPOINT_PATH}`

    if (conn.value && [WebSocket.CONNECTING, WebSocket.OPEN].includes(conn.value.readyState)) {
      return
    }

    conn.value = new WebSocket(wsUrl, token)

    conn.value.onopen = () => {
      console.log('WebSocket connection established')
    }
    conn.value.onerror = (event: Event) => {
      console.error('WebSocket error:', event)
    }
    conn.value.onclose = (event: CloseEvent) => {
      console.log('WebSocket connection closed:', event)
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
