import { defineStore } from 'pinia'

const WS_ENTRYPOINT_PATH = '/entrypoint'

export const useWsStore = defineStore('websocket', {
  state: () => ({
    conn: null as WebSocket | null,
  }),
  actions: {
    connectWs({ token }: { token: string }) {
      const config = useRuntimeConfig()
      const baseUrlWs = String(config.public.baseUrlWs || '').trim()
      const wsUrl = baseUrlWs.endsWith(WS_ENTRYPOINT_PATH)
        ? baseUrlWs
        : `${baseUrlWs.replace(/\/$/, '')}${WS_ENTRYPOINT_PATH}`

      if (this.conn && [WebSocket.CONNECTING, WebSocket.OPEN].includes(this.conn.readyState)) {
        return
      }

      this.conn = new WebSocket(wsUrl, token)

      this.conn.onopen = () => {
        console.log('WebSocket connection established')
      }
      this.conn.onerror = (event: Event) => {
        console.error('WebSocket error:', event)
      }
      this.conn.onclose = (event: CloseEvent) => {
        console.log('WebSocket connection closed:', event)
      }
    },
    disconnectWs() {
      this.conn?.close()
      this.conn = null
    },
  },
  persist: true,
})
