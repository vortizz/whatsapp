<template>
    <div class="flex flex-col px-8 py-5 bg-white shadow-sm gap-1.5">
        <div class="text-sm">
            About
        </div>
        <div class="text-base text-black">
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