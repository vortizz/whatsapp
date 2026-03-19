<template>
    <div class="flex flex-col mx-8 py-5 gap-1.5 border-b border-black/10 dark:border-white/10">
        <div class="text-sm text-black/60 dark:text-white/60 font-semibold">
            About
        </div>
        <div class="text-base text-neutral-950 dark:text-white">
            {{ chatUser.about }}
        </div>
    </div>
</template>

<script>
import { mapState } from 'pinia'
import { useChatStore } from '../../../store/chat'

export default {
    computed: {
        ...mapState(useChatStore, {
            chatUser: 'user'
        }),
    },
}
</script>

<style>

</style>