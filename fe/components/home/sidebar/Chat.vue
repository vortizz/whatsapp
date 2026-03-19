<template>
  <div class="flex flex-row px-3.5 pt-3.5 gap-3.5 dark:hover:bg-stone-400/15 group cursor-pointer rounded-xl" :class="active ? 'bg-gray-100 dark:bg-stone-400/15' : ''">
    <div>
        <AvatarPlaceholder :size="48" />
    </div>
    <div class="flex-1 flex flex-col justify-center pb-3.5">
        <div>
            <div class="flex items-center">
                <div class="text-base max-h-6 text-black dark:text-zinc-50 grow text-ellipsis overflow-hidden" :class="countUnreadMessages && !lastMessage?.isMine ? 'font-semibold' : ''">
                    {{ name }}
                </div>
                <div class="text-xs flex-none font-semibold" :class="countUnreadMessages && !lastMessage?.isMine ? 'text-emerald-500 font-semibold' : 'dark:text-white/60'">
                    {{ formattedDatetime }}
                </div>
            </div>
            <div class="flex items-end place-items-center">
                <span v-if="lastMessage?.isMine" class="text-base leading-none mr-0.5" :class="lastMessage?.status === StatusMessage.READ ? 'text-sky-400' : 'text-gray-500'">
                    <Icon name="mdi:check" v-if="lastMessage?.status === StatusMessage.SENT" />
                    <Icon name="mdi:check-all" v-else />
                </span>
                <div class="text-sm grow max-h-5 text-ellipsis overflow-hidden" :class="countUnreadMessages && !lastMessage?.isMine ? 'font-semibold dark:text-white' : 'dark:text-white/60'">
                    {{ lastMessage.text }}
                </div>
                <div class="flex-none">
                    <div class="flex flex-row items-center gap-0.5">
                        <div v-if="countUnreadMessages && !lastMessage?.isMine" class="px-1.5 py-1 rounded-full bg-emerald-500 text-white dark:text-neutral-950 text-xs leading-none font-semibold flex items-center justify-center">
                            <div>{{ countUnreadMessages }}</div>
                        </div>
                        <button class="text-2xl leading-5 h-5 text-gray-400 dark:text-white/60 transition ease-in-out duration-300 hidden group-hover:block">
                            <Icon name="icon-park-outline:down" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div> 
  </div>
</template>

<script>
export default {
    props: ['name', 'active', 'lastMessage', 'countUnreadMessages'],
    computed: {
        formattedDatetime() {
            if (!this.lastMessage?.createdAt) {
                return ''
            }
            if (this.isToday) {
                return this.formattedTime
            }
            if (this.isYesterday) {
                return 'Yesterday'
            }
            if (this.withinAWeek) {
                const date = new Date(this.lastMessage.createdAt)
                return date.toLocaleString(window.navigator.language, {weekday: 'long'})
            }
            const date = new Date(this.lastMessage.createdAt)
            return date.toLocaleDateString(navigator.language)
        },
        isToday() {
            const today = new Date()
            const date = new Date(this.lastMessage.createdAt)
            return today.toLocaleDateString('en-GB') === date.toLocaleDateString('en-GB')
        },
        isYesterday() {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const date = new Date(this.lastMessage.createdAt)
            return yesterday.toLocaleDateString('en-GB') === date.toLocaleDateString('en-GB')
        },
        withinAWeek() {
            const aweekago = new Date()
            aweekago.setDate(aweekago.getDate() - 7)
            const date = new Date(this.lastMessage.createdAt)
            return date >= aweekago
        },
        formattedTime() {
            const date = new Date(this.lastMessage.createdAt)
            return date.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })
        }
    }
}
</script>

<style>

</style>
