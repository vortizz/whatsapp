<template>
  <div
    class="flex flex-row px-3.5 pt-3.5 gap-3.5 group cursor-pointer rounded-xl hover:bg-gray-100 dark:hover:bg-stone-400/15" 
    :class="active ? 'bg-gray-100 dark:bg-stone-400/15' : ''"
    @contextmenu.prevent="openMenuAtPointer"
>
    <div>
        <GroupAvatarPlaceholder v-if="isGroup" :size="48" :users="users" />
        <AvatarPlaceholder v-else :size="48" :name="name" />
    </div>
    <div class="flex-1 flex flex-col justify-center pb-3.5">
        <div>
            <div class="flex items-center">
                <div class="text-base max-h-6 text-black dark:text-zinc-50 grow text-ellipsis overflow-hidden" :class="countUnreadMessages && !lastMessage?.isMine ? 'font-semibold' : ''">
                    {{ name }}
                </div>
                <div v-if="!isClearing" class="text-xs flex-none font-semibold" :class="countUnreadMessages && !lastMessage?.isMine ? 'text-emerald-500 font-semibold' : 'dark:text-white/60'">
                    {{ formattedDatetime }}
                </div>
                <div v-else class="flex-none text-emerald-500">
                    <svg aria-hidden="true" role="status" class="inline w-4 h-4 animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" fill-opacity="0.2"/>
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
                    </svg>
                </div>
            </div>
            <div class="flex items-end place-items-center">
                <span v-if="!isTyping && lastMessage?.isMine" class="text-base leading-none mr-0.5" :class="lastMessage?.status === StatusMessage.READ ? 'text-sky-400' : 'text-gray-500'">
                    <Icon name="mdi:check" v-if="lastMessage?.status === StatusMessage.SENT" />
                    <Icon name="mdi:check-all" v-else />
                </span>
                <div
                    v-if="isTyping"
                    class="text-sm grow max-h-5 text-ellipsis overflow-hidden text-emerald-500 font-medium"
                >
                    {{ typingLabel }}
                </div>
                <div
                    v-else
                    class="text-sm grow max-h-5 text-ellipsis overflow-hidden"
                    :class="[
                        countUnreadMessages && !lastMessage?.isMine
                            ? 'font-semibold dark:text-white'
                            : 'dark:text-white/60',
                        { 'invisible': !lastMessage?.text }
                    ]"
                >
                    {{ isGroup && lastMessage.text ? (lastMessage.isMine ? 'You' : lastMessage.senderName) + ': ' + lastMessage.text : lastMessage.text || 'X' }}
                </div>
                <div class="flex-none">
                    <div v-if="!isClearing" class="flex flex-row items-center gap-0.5">
                        <div v-if="countUnreadMessages && !lastMessage?.isMine" class="px-1.5 py-1 rounded-full bg-emerald-500 text-white dark:text-neutral-950 text-xs leading-none font-semibold flex items-center justify-center">
                            <div>{{ countUnreadMessages }}</div>
                        </div>
                        <button
                            type="button"
                            class="text-2xl leading-5 h-5 text-gray-400 dark:text-white/60 transition ease-in-out duration-300 hidden group-hover:block"
                            @click.stop="openMenu"
                        >
                            <Icon name="icon-park-outline:down" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div> 
  </div>
</template>

<script setup>
const emit = defineEmits(['openMenu'])
const props = defineProps(['name', 'isGroup', 'users', 'active', 'lastMessage', 'countUnreadMessages', 'isClearing', 'typingUsers'])

const isTyping = computed(() => props.typingUsers?.length > 0)
const typingLabel = computed(() => {
    if (!isTyping.value) return ''
    if (!props.isGroup) return 'Typing...'
    return props.typingUsers.map(u => u.name).join(', ') + ' typing...'
})

function openMenu(event) {
    const rect = event.currentTarget.getBoundingClientRect()

    emit('openMenu', {
        clientX: rect.right,
        clientY: rect.bottom
    })
}

function openMenuAtPointer(event) {
    emit('openMenu', {
        clientX: event.clientX,
        clientY: event.clientY
    })
}

const isToday = computed(() => {
    const createdAt = props.lastMessage?.createdAt
    if (!createdAt) {
        return false
    }

    const today = new Date()
    const date = new Date(createdAt)
    return today.toLocaleDateString('en-GB') === date.toLocaleDateString('en-GB')
})

const isYesterday = computed(() => {
    const createdAt = props.lastMessage?.createdAt
    if (!createdAt) {
        return false
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const date = new Date(createdAt)
    return yesterday.toLocaleDateString('en-GB') === date.toLocaleDateString('en-GB')
})

const withinAWeek = computed(() => {
    const createdAt = props.lastMessage?.createdAt
    if (!createdAt) {
        return false
    }

    const aweekago = new Date()
    aweekago.setDate(aweekago.getDate() - 7)
    const date = new Date(createdAt)
    return date >= aweekago
})

const formattedTime = computed(() => {
    const createdAt = props.lastMessage?.createdAt
    if (!createdAt) {
        return ''
    }

    const date = new Date(createdAt)
    return date.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })
})

const formattedDatetime = computed(() => {
    const createdAt = props.lastMessage?.createdAt
    if (!createdAt) {
        return ''
    }

    if (isToday.value) {
        return formattedTime.value
    }
    if (isYesterday.value) {
        return 'Yesterday'
    }
    if (withinAWeek.value) {
        const date = new Date(createdAt)
        return date.toLocaleString(window.navigator.language, { weekday: 'long' })
    }

    const date = new Date(createdAt)
    return date.toLocaleDateString(navigator.language)
})
</script>

<style>

</style>
