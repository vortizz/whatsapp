<template>
  <div class="flex flex-row px-3.5 pt-3.5 gap-3.5 hover:bg-gray-100 group cursor-pointer" :class="active ? 'bg-gray-100' : ''">
    <div>
        <img src="~/assets/img/default_profile.png" width="48" height="48" />
    </div>
    <div class="flex-1 flex flex-col justify-center pb-3.5 border-b border-gray-200">
        <div>
            <div class="flex items-center">
                <div class="text-base max-h-6 text-black grow text-ellipsis overflow-hidden" :class="countUnreadMessages && !lastMessage?.isMine ? 'font-semibold' : ''">
                    {{ name }}
                </div>
                <div class="text-xs flex-none" :class="countUnreadMessages && !lastMessage?.isMine ? 'text-green-500 font-semibold' : ''">
                    {{ formattedDatetime }}
                </div>
            </div>
            <div class="flex place-items-center">
                <span v-if="lastMessage?.isMine" class="text-sm mt-[-4px] mr-1" :class="lastMessage?.status === StatusMessage.READ ? 'text-cyan-500' : 'text-gray-500'">
                    <Icon name="codicon:check" v-if="lastMessage?.status === StatusMessage.SENT" />
                    <Icon name="codicon:check-all" v-else />
                </span>
                <div class="text-sm grow max-h-5 text-ellipsis overflow-hidden" :class="countUnreadMessages && !lastMessage?.isMine ? 'font-semibold' : ''">
                    {{ lastMessage.text }}
                </div>
                <div class="flex-none">
                    <div class="flex flex-row items-center gap-0.5">
                        <div v-if="countUnreadMessages && !lastMessage?.isMine" class="h-5 w-5 rounded-full bg-green-500 text-white text-xs font-semibold flex items-center justify-center">
                            <div class="mt-[-2px]">{{ countUnreadMessages }}</div>
                        </div>
                        <button class="text-2xl leading-5 h-5 text-gray-400 transition ease-in-out duration-300 hidden group-hover:block">
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