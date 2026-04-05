<template>
    <form @submit.prevent="send">
        <div v-if="replyTo" class="flex items-center gap-2 px-4 bg-[#efeae2] dark:bg-neutral-900/5">
            <div class="w-full px-2 bg-white dark:bg-neutral-800 pt-2 rounded-t-xl shadow-md">
                <div class="flex-1 flex items-center gap-2 rounded-xl bg-neutral-100 dark:bg-neutral-900/50 px-3 py-2 border-l-4 border-emerald-500 min-w-0">
                    <div class="flex-1 min-w-0">
                        <div class="text-sm font-semibold text-emerald-600 dark:text-emerald-400 truncate mb-0.5">{{ replyTo.senderName }}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{{ replyTo.text }}</div>
                    </div>
                    <button type="button" @click="clearReply" class="flex items-center p-2 rounded-full text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 flex-none">
                        <Icon name="mdi:close" class="text-xl" />
                    </button>
                </div>
            </div>
        </div>
        <div class="pb-3 px-4 w-full bg-[#efeae2] dark:bg-neutral-900/5 flex flex-row gap-4 items-center">
            <div
                class="flex items-end w-full bg-white dark:bg-neutral-800 shadow-md"
                :class="replyTo ? 'rounded-b-3xl' : 'rounded-3xl'"
            >
                <textarea
                    ref="rInput"
                    v-model="message"
                    placeholder="Type a message"
                    rows="1"
                    class="flex-1 w-full text-sm text-neutral-950 dark:placeholder:text-white/60 dark:text-white rounded-3xl py-3.5 px-5 focus:outline-none placeholder:text-gray-600 caret-emerald-500 dark:bg-neutral-800 resize-none overflow-hidden leading-normal"
                    @focus="onFocusInput"
                    @input="autoResize"
                    @keydown.enter.exact.prevent="send"
                    @keydown.shift.enter="$nextTick(autoResize)"
                ></textarea>
                <div class="p-1 flex-none flex items-center" v-if="message.trim()">
                    <button v-if="!isLoading" type="submit" :disabled="!message.trim()" class='flex items-center text-2xl p-2 h-full leading-none rounded-full text-white dark:text-neutral-950 bg-emerald-500 hover:bg-emerald-600 transition-colors'>
                        <Icon name="material-symbols:send" />
                    </button>
                    <button v-else disabled type="button" class='flex items-center text-2xl p-1 leading-none rounded-full'>
                        <svg aria-hidden="true" role="status" class="inline w-5 h-5 me-3 text-teal-600 animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
</form>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { useChatStore } from '../../../store/chat'
import { useMessageReplyStore } from '../../../store/messageReply'

export default {
    setup() {
        const replyStore = useMessageReplyStore()
        return { replyStore }
    },
    data() {
        return {
            message: '',
            isLoading: false
        }
    },
    computed: {
        replyTo() {
            return this.replyStore.replyTo
        },
        ...mapState(useChatStore, {
            chatId: '_id',
            chatUser: 'user'
        }),
    },
    watch: {
        chatId(newValue, oldValue) {
            if (newValue && newValue !== oldValue) {
                this.message = ''
                this.isLoading = false
                this.replyStore.clearReply()
                this.$nextTick(() => {
                    this.$refs.rInput.focus()
                this.$refs.rInput.style.height = 'auto'
                })
            }
        }
    },
    methods: {
        ...mapActions(useChatStore, {
            setChatAction: 'setChat'
        }),
        autoResize() {
            const el = this.$refs.rInput
            el.style.height = 'auto'
            const style = window.getComputedStyle(el)
            const lineHeight = parseFloat(style.lineHeight)
            const paddingTop = parseFloat(style.paddingTop)
            const paddingBottom = parseFloat(style.paddingBottom)
            const maxHeight = lineHeight * 8 + paddingTop + paddingBottom
            if (el.scrollHeight <= maxHeight) {
                el.style.height = el.scrollHeight + 'px'
                el.style.overflowY = 'hidden'
            } else {
                el.style.height = maxHeight + 'px'
                el.style.overflowY = 'auto'
            }
        },
        clearReply() {
            this.replyStore.clearReply()
        },
        async send() {
            try {
                this.isLoading = true
                let chatId

                if (this.chatId === 'new-chat') {
                    const chat = await this.createChat()
                    chatId = chat._id
                }

                const body = {
                    chat: chatId || this.chatId,
                    to: this.chatUser._id,
                    text: this.message,
                    ...(this.replyTo ? { replyTo: this.replyTo._id } : {})
                }
                await useMyAuthFetch('message', { method: 'POST', body })
                this.message = ''
                this.$refs.rInput.style.height = 'auto'
                this.replyStore.clearReply()

                if (this.chatId === 'new-chat' && chatId) {
                    this.setChatAction({
                        _id: chatId,
                        user: this.chatUser
                    })
                }
            } catch (error) {
                const data = error?.data || {}
                const message = Array.isArray(data.message) ? data.message[0] : data.message
                useNuxtApp().$toast.error(message)
            } finally {
                this.isLoading = false
            }
        },
        async onFocusInput() {
            if (this.chatId === 'new-chat') return
            await useMyAuthFetch(`message/${this.chatId}/read`, { method: 'PUT' })
        },
        async createChat() {
            const body = {
                user_id: this.chatUser._id
            }
            return await useMyAuthFetch('chat', { method: 'POST', body })
        }
    }
}
</script>

<style scoped>
textarea::-webkit-scrollbar {
    width: 4px;
}
textarea::-webkit-scrollbar-track {
    background: transparent;
}
textarea::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.25);
    border-radius: 9999px;
}
.dark textarea::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
}
</style>