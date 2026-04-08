<template>
    <div class="flex flex-col justify-center items-center p-8">
        <div class="mb-4">
            <AvatarPlaceholder :size="128" />
        </div>
        <div class="text-2xl text-neutral-950 dark:text-white">
            {{ displayUser.name }}
        </div>
        <div class="text-base mt-1 text-black/60 dark:text-white/60">
            {{ displayUser.email }}
        </div>
        <div class="flex gap-3 mt-5 w-full justify-center">
            <button 
                class="flex-1 max-w-40 flex flex-col items-center gap-1.5 pt-3 pb-2 rounded-xl bg-transparent hover:bg-stone-100 hover:dark:bg-white/5 transition-colors border border-black/20 dark:border-white/10"
                @click="$emit('search')"
            >
                <Icon name="material-symbols:search" class="text-2xl text-emerald-500" />
                <span class="text-sm text-neutral-950 dark:text-white">Search</span>
            </button>
            <button
                v-if="member"
                class="flex-1 max-w-40 flex flex-col items-center gap-1.5 pt-3 pb-2 rounded-xl bg-transparent hover:bg-stone-100 hover:dark:bg-white/5 transition-colors border border-black/20 dark:border-white/10"
                @click="$emit('goToChat')"
            >
                <Icon name="ic:outline-message" class="text-2xl text-emerald-500" />
                <span class="text-sm text-neutral-950 dark:text-white">Message</span>
            </button>
        </div>
    </div>
</template>

<script>
import { mapState } from 'pinia'
import { useChatStore } from '../../../store/chat'

export default {
    props: ['member'],
    emits: ['search'],
    computed: {
        ...mapState(useChatStore, {
            chatUser: 'user'
        }),
        displayUser() {
            return this.member ?? this.chatUser
        }
    },
}
</script>

<style>

</style>
