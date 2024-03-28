<template>
  <div class="flex flex-col px-16 py-3 gap-3" id="mainMsg">
    <template v-for="(msg, i) in messages" :key="i">
      <HomeMainDateMessage
        v-if="i === 0 || !isSameDay(msg.createdAt, messages[i-1].createdAt)"
        :date="msg.createdAt"
      />
      <HomeMainMessageFrom
        v-if="!msg.isMine"
        :text="msg.text"
        :date="msg.createdAt"
      />
      <HomeMainMessageTo
        v-else
        :text="msg.text"
        :date="msg.createdAt"
      />
    </template>
    <div ref="bottomEl"></div>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { useUserStore } from '../../../store/user'
import { useChatStore } from '../../../store/chat'
import { useWsStore } from '../../../store/websocket'

export default {
  data() {
    return {
      messages: []
    }
  },
  computed: {
    ...mapState(useUserStore, {
      userId: '_id'
    }),
    ...mapState(useChatStore, {
      chatId: '_id',
      chatUser: 'user'
    }),
    ...mapState(useWsStore, ['conn']),
  },
  watch: {
    chatId(value, oldValue) {
      if (!value || value === oldValue) return
      this.getMessages()

      this.conn.onmessage = (event) => {
        console.log('MSG RECEIVED -> ', event.data)
        const msg = JSON.parse(event.data)

        if (msg.chat._id === value) {
          this.messages.push({
            ...msg,
            isMine: msg.from._id === this.userId
          })
        }

        this.$nextTick(() => {
          this.$refs.bottomEl.scrollIntoView({ behavior: 'smooth' })
        })
      }
    }
  },
  methods: {
    isSameDay(date1, date2) {
      const Date1 = new Date(date1)
      const Date2 = new Date(date2)
      return Date1.toLocaleDateString('en-GB') === Date2.toLocaleDateString('en-GB')
    },
    async getMessages() {
      try {
        const messages = await useMyAuthFetch(`message/${this.chatId}`, { method: 'GET' })
        this.messages = messages.map(msg => ({
          ...msg,
          isMine: msg.from._id === this.userId
        }))
        this.$nextTick(() => {
          this.$refs.bottomEl.scrollIntoView()
        })
      } catch (error) {
        const data = error?.data || {}
        const message = Array.isArray(data.message) ? data.message[0] : data.message
        useNuxtApp().$toast.error(message)
      }
    }
  }
}
</script>

<style>

</style>