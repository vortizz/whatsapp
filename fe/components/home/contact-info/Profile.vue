<template>
    <div class="flex flex-col justify-center items-center p-8">
        <div class="mb-4">
            <AvatarPlaceholder :size="208" />
        </div>
        <div class="text-2xl text-neutral-950 dark:text-white">
            {{ chatUser.name }}
        </div>
        <div class="text-base mt-1 text-black/60 dark:text-white/60">
            {{ chatUser.email }}
        </div>
    </div>
</template>

<script>
import { mapState } from 'pinia'
import { useChatStore } from '../../../store/chat'

export default {
    computed: {
        ...mapState(useChatStore, {
            chatId: '_id',
            chatUser: 'user'
        }),
    },
}
</script>

<style>

</style>
