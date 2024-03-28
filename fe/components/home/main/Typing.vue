<template>
    <div class="py-3 pl-10 pr-4 w-full bg-gray-100 flex flex-row gap-4 items-center">
        <div class="flex-1">
            <input
                type="text"
                v-model="message"
                placeholder="Type a message"
                class="w-full text-sm rounded-lg py-3 px-5 focus:outline-none placeholder:text-gray-600"
            >
        </div>
        <div>
            <button @click="send" :disabled="!message.trim()" class='text-2xl p-2 leading-6 rounded-full active:bg-gray-300 duration-100'>
                <Icon name="material-symbols:send" />
            </button>
        </div>
    </div>
</template>

<script>
import { mapState } from 'pinia'
import { useWsStore } from '../../../store/websocket'
import { useChatStore } from '../../../store/chat'

export default {
    data() {
        return {
            message: ''
        }
    },
    computed: {
        ...mapState(useWsStore, ['conn']),
        ...mapState(useChatStore, {
            chatId: '_id',
            chatUser: 'user'
        }),
    },
    methods: {
        send() {
            const data = {
                event: 'send_message',
                data: {
                    chat: this.chatId,
                    to: this.chatUser._id,
                    text: this.message
                }
            }
            this.conn.send(JSON.stringify(data))
            this.message = ''
        }
    }
}
</script>

<style>

</style>