<template>
  <div class="flex flex-col px-16 py-3 gap-3" id="mainMsg">
    <template v-for="(msg, i) in messages" :key="i">
      <HomeMainDateMessage
        v-if="i === 0 || !isSameDay(msg.createdAt, messages[i-1].createdAt)"
        :date="msg.createdAt"
      />
      <HomeMainUnreadMessage
        v-if="
          !messages[i].isMine && messages[i].status === StatusMessage.RECEIVED &&
          !(!messages[i-1].isMine && messages[i-1].status === StatusMessage.RECEIVED)
        "
        :count="messages.length - i"
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
        :status="msg.status"
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

      this.conn.removeEventListener('message', this.handleEvent)
      this.conn.addEventListener('message', this.handleEvent)
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
    },
    handleEvent(event) {
      console.log('MSG RECEIVED (MESSAGES.VUE) -> ', JSON.parse(event.data))
      const data = JSON.parse(event.data)

      const name = data.name
      const msg = data.data

      if (name === 'new-message') {
        this.newMessage(msg)
      } else if (name === 'received-message') {
        this.receivedMessage(msg)
      } else if (name === 'read-message') {
        this.readMessage(msg)
      }
    },
    newMessage(message) {
      if (message.chat._id === this.chatId) {
        const isMine = message.from._id === this.userId
        this.messages.push({ ...message, isMine })

        const messages = this.messages.filter(msg => !msg.isMine && msg.status === StatusMessage.RECEIVED)
        for (const msg of messages) {
          msg.status = StatusMessage.READ
        }
      }

      this.$nextTick(() => {
        this.$refs.bottomEl.scrollIntoView({ behavior: 'smooth' })
      })
    },
    receivedMessage(message) {
      if (message.chat !== this.chatId) {
        return
      }
      for (const msg of message.messages) {
        const i = this.messages.find(m => m._id === msg._id)
        i.status = StatusMessage.RECEIVED
      }
    },
    readMessage(message) {
      if (message.chat !== this.chatId) {
        return
      }
      for (const msg of message.messages) {
        const i = this.messages.find(m => m._id === msg._id)
        i.status = StatusMessage.READ
      }
    }
  }
}
</script>

<style>

</style>