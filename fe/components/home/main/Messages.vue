<template>
  <div class="flex flex-col px-16 py-3 gap-3">
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
    <!-- <HomeMainDateMessage :date="'27/03/2024'"/>
    <HomeMainMessageFrom />
    <HomeMainMessageTo />
    <HomeMainMessageFrom />
    <HomeMainMessageTo />
    <HomeMainMessageFrom />
    <HomeMainMessageTo />
    <HomeMainMessageFrom />
    <HomeMainMessageTo />
    <HomeMainMessageFrom />
    <HomeMainMessageTo />
    <HomeMainMessageFrom />
    <HomeMainMessageTo />
    <HomeMainMessageFrom />
    <HomeMainMessageTo />
    <HomeMainMessageFrom />
    <HomeMainMessageTo />
    <HomeMainDateMessage :date="'28/03/2024'"/>
    <HomeMainMessageFrom />
    <HomeMainMessageTo />
    <HomeMainMessageFrom />
    <HomeMainMessageTo />
    <HomeMainMessageFrom />
    <HomeMainMessageTo />
    <HomeMainMessageFrom />
    <HomeMainMessageTo />
    <HomeMainMessageFrom />
    <HomeMainMessageTo />
    <HomeMainMessageFrom />
    <HomeMainMessageTo />
    <HomeMainMessageFrom />
    <HomeMainMessageTo />
    <HomeMainMessageFrom />
    <HomeMainMessageTo />
    <HomeMainDateMessage :date="'29/03/2024'"/>
    <HomeMainMessageFrom />
    <HomeMainMessageTo />
    <HomeMainMessageFrom />
    <HomeMainMessageTo />
    <HomeMainMessageFrom />
    <HomeMainMessageTo />
    <HomeMainMessageFrom />
    <HomeMainMessageTo />
    <HomeMainMessageFrom />
    <HomeMainMessageTo />
    <HomeMainMessageFrom />
    <HomeMainMessageTo />
    <HomeMainMessageFrom />
    <HomeMainMessageTo />
    <HomeMainMessageFrom />
    <HomeMainMessageTo /> -->
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { useUserStore } from '../../../store/user'
import { useChatStore } from '../../../store/chat'

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
  },
  watch: {
    chatId(value, oldValue) {
      if (!value || value === oldValue) return
      this.getMessages()
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
        console.log(this.messages)
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