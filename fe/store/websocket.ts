import { defineStore } from 'pinia'

export const useWsStore = defineStore('websocket', {
    state: () => ({
        conn: null as WebSocket | null,
    }),
    actions: {
        connectWs({ token }: { token: string }) {
            const config = useRuntimeConfig()
            this.conn = new WebSocket(config.public.baseUrlWs, token)

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
        }
    },
    persist: true
})