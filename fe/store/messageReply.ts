import { defineStore } from 'pinia'

export const useMessageReplyStore = defineStore('messageReply', () => {
    const replyTo = ref<{ _id: string; text: string; senderName: string } | null>(null)

    function setReply(msg: { _id: string; text: string; senderName: string }) {
        replyTo.value = msg
    }

    function clearReply() {
        replyTo.value = null
    }

    return { replyTo, setReply, clearReply }
})
